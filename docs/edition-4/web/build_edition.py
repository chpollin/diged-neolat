#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_edition.py

Transforms a TEI P5 XML (with <pb facs="..."> and textual content) into a
static digital edition ready for GitHub Pages:

- Parses the TEI (title, author, front matter, books/poems, lines, page breaks)
- Resolves <pb/@facs> to actual files in docs/facsimiles/ (case-insensitive)
  and performs a best-effort fuzzy match using @n if @facs is missing or wrong
- Generates a placeholder SVG when the target image cannot be found
- Writes:
    docs/edition-3/web/data/edition.json
    docs/edition-3/web/index.html
    docs/edition-3/web/assets/app.css
    docs/edition-3/web/assets/app.js

Usage (from repo root):
    python build_edition.py \
        --tei docs/edition-3/web/tei-final-3-1.xml \
        --facsimiles docs/facsimiles

Notes
-----
* The script is intentionally dependency-free (stdlib only).
* It is idempotent; re-run after editing the TEI to refresh the site.
* Image URLs are written relative to `index.html`, so the output works
  locally and on GitHub Pages.

Directory assumptions (can be overridden via flags):
- TEI XML: docs/edition-3/web/tei-final-3-1.xml
- Facsimiles: docs/facsimiles/

Author: build script for "Lucina: A Digital Edition"
"""

from __future__ import annotations

import argparse
import datetime as dt
import fnmatch
import json
import os
import re
import sys
from pathlib import Path
import xml.etree.ElementTree as ET

TEI_NS = "http://www.tei-c.org/ns/1.0"
XML_NS = "http://www.w3.org/XML/1998/namespace"
NS = {"tei": TEI_NS}


# --------------------------- helpers --------------------------------- #

def strip_ns(tag: str) -> str:
    """'{'ns'}local' -> 'local'."""
    return tag.split("}", 1)[-1] if "}" in tag else tag


def html_escape(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def text_content(el: ET.Element) -> str:
    """Concatenate text from element and its descendants."""
    return "".join(el.itertext()).strip()


def ensure_dir(p: Path) -> None:
    p.mkdir(parents=True, exist_ok=True)


def posix_rel(from_dir: Path, to_path: Path) -> str:
    """Relative POSIX path from one dir to a target path."""
    return Path(os.path.relpath(to_path, start=from_dir)).as_posix()


# ---------------------- placeholder image ---------------------------- #

PLACEHOLDER_NAME = "placeholder_missing_folio.svg"

def write_placeholder_svg(facs_dir: Path) -> None:
    """
    Write a simple, lightweight SVG placeholder that we can use
    for missing folio images. It sits in docs/facsimiles/.
    """
    svg = f"""<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Missing facsimile">
  <defs>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <rect width="40" height="40" fill="#f2f2f2"/>
      <path d="M40,0 L0,0 0,40" fill="none" stroke="#e0e0e0" stroke-width="2"/>
    </pattern>
  </defs>
  <rect width="1200" height="800" fill="url(#grid)"/>
  <rect x="40" y="40" width="1120" height="720" fill="none" stroke="#b3b3b3" stroke-width="4"/>
  <g font-family="system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif" text-anchor="middle">
    <text x="600" y="380" font-size="48" fill="#666">Facsimile not found</text>
    <text id="missingName" x="600" y="440" font-size="28" fill="#999">Using placeholder</text>
  </g>
</svg>
"""
    ensure_dir(facs_dir)
    (facs_dir / PLACEHOLDER_NAME).write_text(svg, encoding="utf-8")


# ---------------------- TEI parsing & serialization ------------------ #

class ImageResolver:
    """
    Resolve <pb> facsimile filenames against docs/facsimiles/.
    - Exact match
    - Case-insensitive match
    - Fuzzy match using n="6.1" -> tokens ["6.1","6_1","6-1","61"]
    Fallback: placeholder SVG in the facsimiles directory.
    """

    def __init__(self, facs_dir: Path, web_dir: Path):
        self.facs_dir = facs_dir
        self.web_dir = web_dir
        ensure_dir(self.facs_dir)
        write_placeholder_svg(self.facs_dir)

        self._all_files = [p.name for p in self.facs_dir.iterdir() if p.is_file()]
        self._lower_map = {n.lower(): n for n in self._all_files}

        # Path from web_dir (index.html) to the facsimiles dir itself
        self._rel_prefix = Path(os.path.relpath(self.facs_dir, start=self.web_dir))

    def _rel_url(self, filename: str) -> str:
        return (self._rel_prefix / filename).as_posix()

    def resolve(self, facs: str | None, n: str | None) -> tuple[str, str, bool]:
        """
        Returns: (url_from_web_dir, resolved_name, exists_bool)
        """
        facs = facs or ""
        name = Path(facs).name

        # 1) Exact
        if name and name in self._all_files:
            return self._rel_url(name), name, True

        # 2) Case-insensitive
        if name and name.lower() in self._lower_map:
            real = self._lower_map[name.lower()]
            return self._rel_url(real), real, True

        # 3) Fuzzy by @n
        if n:
            tokens = {str(n), str(n).replace(".", "_"), str(n).replace(".", "-"), str(n).replace(".", "")}
            for t in tokens:
                pattern = f"*{t}*"
                matches = [fn for fn in self._all_files if fnmatch.fnmatch(fn, pattern)]
                if matches:
                    matches.sort()
                    candidate = matches[0]
                    return self._rel_url(candidate), candidate, True

        # 4) Give up -> placeholder
        return self._rel_url(PLACEHOLDER_NAME), PLACEHOLDER_NAME, False


def serialize_to_html(el: ET.Element, resolver: ImageResolver, image_log: list[dict]) -> str:
    """
    Minimal, robust serializer for the subset we need:
    - div[@type='poem'] -> <section class="poem" ...>…</section>
    - head -> <h3 class="head" data-type="...">…</h3>
    - lg  -> <div class="lg" data-type="...">…</div>
    - l   -> <div class="l" data-n="...">…</div>
    - pb  -> <span class="pb" data-img="…" data-n="…">[folio n]</span>
    Everything else: descend into children and serialize them.
    """
    tag = strip_ns(el.tag)

    if tag == "div":
        typ = el.attrib.get("type", "")
        xmlid = el.attrib.get(f"{{{XML_NS}}}id", "")
        child_html = "".join(serialize_to_html(c, resolver, image_log) for c in list(el))
        if typ == "poem":
            return f"<section class='poem' data-xmlid='{html_escape(xmlid)}'>{child_html}</section>"
        cls = typ if typ else "div"
        return f"<div class='{html_escape(cls)}'>{child_html}</div>"

    if tag == "head":
        typ = el.attrib.get("type", "")
        return f"<h3 class='head' data-type='{html_escape(typ)}'>{html_escape(text_content(el))}</h3>"

    if tag == "lg":
        typ = el.attrib.get("type", "")
        child_html = "".join(serialize_to_html(c, resolver, image_log) for c in list(el))
        return f"<div class='lg' data-type='{html_escape(typ)}'>{child_html}</div>"

    if tag == "l":
        n = el.attrib.get("n", "")
        return f"<div class='l' data-n='{html_escape(n)}'>{html_escape(text_content(el))}</div>"

    if tag == "pb":
        facs = el.attrib.get("facs", "")
        n = el.attrib.get("n", "")
        url, resolved_name, exists = resolver.resolve(facs, n)
        image_log.append({"n": n or "", "facs": facs or "", "src": url, "exists": bool(exists), "resolved": resolved_name})
        label = f"folio {n}" if n else "folio"
        return f"<span class='pb' title='{html_escape(label)}' data-n='{html_escape(n)}' data-img='{html_escape(url)}'>[{html_escape(label)}]</span>"

    # Default: serialize children only
    return "".join(serialize_to_html(c, resolver, image_log) for c in list(el))


def parse_header(root: ET.Element) -> dict:
    title_el = root.find(".//tei:teiHeader//tei:titleStmt/tei:title", NS)
    author_el = root.find(".//tei:teiHeader//tei:titleStmt/tei:author", NS)

    title = text_content(title_el) if title_el is not None else ""
    author = text_content(author_el) if author_el is not None else ""

    return {"title": title, "author": author}


def parse_people(root: ET.Element) -> list[dict]:
    people = []
    for p in root.findall(".//tei:standOff/tei:listPerson/tei:person", NS):
        pid = p.attrib.get(f"{{{XML_NS}}}id", "")
        pname_el = p.find(".//tei:persName", NS)
        pname = text_content(pname_el) if pname_el is not None else ""
        role = p.attrib.get("role", "")
        people.append({"id": pid, "name": pname, "role": role})
    return people


def dedupe_images(image_log: list[dict]) -> list[dict]:
    out, seen = [], set()
    for item in image_log:
        key = (item.get("src", ""), item.get("n", ""))
        if key in seen:
            continue
        seen.add(key)
        out.append(item)
    return out


# -------------------------- site writing ------------------------------ #

INDEX_HTML = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Digital Edition</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="assets/app.css" rel="stylesheet">
</head>
<body>
  <header class="site-header">
    <div class="brand">
      <h1 id="work-title">Digital Edition</h1>
      <p class="byline">by <span id="work-author">—</span></p>
    </div>
    <nav class="top-nav">
      <a id="front-link" href="#">Front</a>
      <a id="home-link" href="#" onclick="location.reload();return false;">Home</a>
      <a class="gh" href="https://pages.github.com/" rel="noopener" target="_blank" title="Hosted on GitHub Pages">GitHub Pages</a>
    </nav>
  </header>

  <main class="layout">
    <aside class="sidebar">
      <h2>Contents</h2>
      <ul id="nav" class="toc"></ul>
    </aside>

    <section id="main" class="textpanel">
      <noscript>Please enable JavaScript to view the edition.</noscript>
    </section>

    <aside class="viewer">
      <figure class="folio">
        <img id="folio" alt="Facsimile page"/>
        <figcaption id="folio-caption"></figcaption>
      </figure>
    </aside>
  </main>

  <footer class="site-footer">
    <small>Built from TEI with <code>build_edition.py</code>.</small>
  </footer>

  <script src="assets/app.js"></script>
</body>
</html>
"""

APP_CSS = r"""/* Minimal, clean layout */
:root {
  --bg: #ffffff;
  --text: #222;
  --muted: #666;
  --line: #e6e6e6;
  --accent: #0b57d0;
}

* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: var(--bg); color: var(--text); }

.site-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 1.25rem; border-bottom: 1px solid var(--line);
}
.brand h1 { margin: 0; font-size: 1.5rem; }
.brand .byline { margin: .2rem 0 0; color: var(--muted); }
.top-nav a { margin-left: 1rem; text-decoration: none; color: var(--accent); }
.top-nav a:hover { text-decoration: underline; }

.layout {
  display: grid;
  grid-template-columns: 260px 1fr minmax(320px, 36vw);
  gap: 1rem;
  padding: 1rem 1.25rem;
}

.sidebar { border-right: 1px solid var(--line); padding-right: 1rem; }
.sidebar h2 { margin-top: 0; font-size: 1rem; color: var(--muted); }
.toc { list-style: none; padding: 0; margin: 0; }
.toc > li.book { margin: .5rem 0; }
.toc > li.book > .book-title { font-weight: 600; display: block; margin-bottom: .25rem; }
.toc > li.book ul { list-style: none; padding-left: .75rem; border-left: 2px solid var(--line); margin: .25rem 0 .75rem; }
.toc a { color: var(--text); text-decoration: none; }
.toc a:hover { color: var(--accent); }

.textpanel {
  padding: 0 1rem; line-height: 1.6;
}
.textpanel .head { margin: 1rem 0 .5rem; font-size: 1.05rem; }
.l { padding-left: .25rem; }
.l::before {
  content: attr(data-n);
  display: inline-block; min-width: 2.25rem; color: var(--muted);
  margin-right: .5rem; text-align: right;
}
.pb {
  display: inline-block; margin: .25rem .35rem; padding: .15rem .35rem;
  font-size: .85em; color: var(--accent); background: #eef4ff; border: 1px solid #dbe8ff; border-radius: 4px;
  cursor: pointer;
}

.viewer { border-left: 1px solid var(--line); padding-left: 1rem; display: flex; flex-direction: column; }
.folio { margin: 0; }
.folio img { width: 100%; height: auto; display: block; border: 1px solid var(--line); background: #f7f7f7; }
.folio figcaption { color: var(--muted); font-size: .9rem; margin-top: .4rem; }

.site-footer {
  padding: .75rem 1.25rem; border-top: 1px solid var(--line); color: var(--muted);
}

/* small screens */
@media (max-width: 980px) {
  .layout { grid-template-columns: 1fr; }
  .sidebar { order: 1; border-right: none; padding-right: 0; }
  .viewer { order: 3; border-left: none; padding-left: 0; }
  .textpanel { order: 2; }
}
"""

APP_JS = r"""(async function () {
  const data = await fetch('data/edition.json').then(r => r.json());
  const $ = (sel) => document.querySelector(sel);

  $('#work-title').textContent = data.title || 'Digital Edition';
  $('#work-author').textContent = data.author || '—';

  const nav = $('#nav');
  const main = $('#main');
  const img = $('#folio');
  const caption = $('#folio-caption');

  function setImage(src, n) {
    if (!src) return;
    img.src = src;
    caption.textContent = n ? 'Folio ' + n : '';
  }

  function attachPbHandlers(scope) {
    const root = scope || main;
    root.querySelectorAll('.pb').forEach(pb => {
      pb.addEventListener('click', () => {
        setImage(pb.dataset.img, pb.dataset.n);
        // visual feedback
        root.querySelectorAll('.pb').forEach(x => x.classList.remove('active'));
        pb.classList.add('active');
      });
    });
  }

  function renderFront() {
    if (!data.front || !data.front.html) return;
    main.innerHTML = data.front.html;
    attachPbHandlers(main);
    const firstPb = main.querySelector('.pb');
    if (firstPb) setImage(firstPb.dataset.img, firstPb.dataset.n);
  }

  function renderPoem(poem) {
    main.innerHTML = poem.html;
    attachPbHandlers(main);
    const firstPb = main.querySelector('.pb');
    if (firstPb) setImage(firstPb.dataset.img, firstPb.dataset.n);
  }

  // Build TOC
  (data.books || []).forEach(book => {
    const li = document.createElement('li');
    li.className = 'book';
    const title = document.createElement('span');
    title.className = 'book-title';
    title.textContent = book.label || ('Book ' + (book.n || ''));
    li.appendChild(title);

    if (book.poems && book.poems.length) {
      const ul = document.createElement('ul');
      book.poems.forEach(poem => {
        const pli = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = poem.number || poem.label || poem.xml_id || '(poem)';
        a.addEventListener('click', (e) => {
          e.preventDefault();
          renderPoem(poem);
        });
        pli.appendChild(a);
        ul.appendChild(pli);
      });
      li.appendChild(ul);
    }
    nav.appendChild(li);
  });

  // Front link
  const frontLink = document.getElementById('front-link');
  if (data.front && data.front.html) {
    frontLink.addEventListener('click', (e) => {
      e.preventDefault();
      renderFront();
    });
  } else {
    frontLink.style.display = 'none';
  }

  // Default: first poem or front
  if (data.books && data.books[0] && data.books[0].poems && data.books[0].poems[0]) {
    renderPoem(data.books[0].poems[0]);
  } else {
    renderFront();
  }
})();
"""


def write_site(web_dir: Path, edition: dict) -> None:
    data_dir = web_dir / "data"
    assets_dir = web_dir / "assets"
    ensure_dir(data_dir)
    ensure_dir(assets_dir)

    # data/edition.json
    (data_dir / "edition.json").write_text(json.dumps(edition, ensure_ascii=False, indent=2), encoding="utf-8")

    # index + assets
    (web_dir / "index.html").write_text(INDEX_HTML, encoding="utf-8")
    (assets_dir / "app.css").write_text(APP_CSS, encoding="utf-8")
    (assets_dir / "app.js").write_text(APP_JS, encoding="utf-8")


# ----------------------------- main ---------------------------------- #

def guess_facsimiles_dir(tei_path: Path) -> Path:
    """
    If not provided, try to infer docs/facsimiles/ by searching upwards for 'docs'.
    """
    docs_dir = None
    for p in tei_path.parents:
        if p.name == "docs":
            docs_dir = p
            break
    if docs_dir:
        return docs_dir / "facsimiles"
    # Fallback: sibling of web directory two levels up (…/docs/facsimiles)
    maybe = tei_path.parent.parent.parent / "facsimiles"
    return maybe


def build(tei_path: Path, facs_dir: Path | None = None) -> None:
    if not tei_path.exists():
        sys.exit(f"[!] TEI file not found: {tei_path}")

    web_dir = tei_path.parent  # where index.html & data/ live
    if facs_dir is None:
        facs_dir = guess_facsimiles_dir(tei_path)

    print(f"TEI:        {tei_path}")
    print(f"Web out:    {web_dir}")
    print(f"Facsimiles: {facs_dir}")

    resolver = ImageResolver(facs_dir=facs_dir, web_dir=web_dir)

    # Parse TEI
    root = ET.parse(str(tei_path)).getroot()

    header = parse_header(root)
    people = parse_people(root)

    # serialize front (optional)
    image_log: list[dict] = []
    front_html = ""
    front_el = root.find(".//tei:text/tei:front", NS)
    if front_el is not None:
        front_html = serialize_to_html(front_el, resolver, image_log)

    # serialize books/poems
    books = []
    for book_el in root.findall(".//tei:text/tei:body/tei:div[@type='book']", NS):
        book_id = book_el.attrib.get(f"{{{XML_NS}}}id", "")
        book_n = book_el.attrib.get("n", "")
        book_head = book_el.find("./tei:head", NS)
        book_label = text_content(book_head) if book_head is not None else (book_n or book_id or "Book")

        poems = []
        for poem_el in book_el.findall("./tei:div[@type='poem']", NS):
            xml_id = poem_el.attrib.get(f"{{{XML_NS}}}id", "")
            number_el = poem_el.find("./tei:head[@type='number']", NS)
            dedication_el = poem_el.find("./tei:head[@type='dedication']", NS)
            number = text_content(number_el) if number_el is not None else ""
            dedication = text_content(dedication_el) if dedication_el is not None else ""

            html = serialize_to_html(poem_el, resolver, image_log)

            poems.append({
                "xml_id": xml_id,
                "number": number,
                "dedication": dedication,
                "html": html
            })

        books.append({
            "id": book_id,
            "n": book_n,
            "label": book_label,
            "poems": poems
        })

    images = dedupe_images(image_log)

    edition = {
        "title": header.get("title", ""),
        "author": header.get("author", ""),
        "source": tei_path.name,
        "generated_utc": dt.datetime.utcnow().isoformat(timespec="seconds") + "Z",
        "people": people,
        "front": {"html": front_html} if front_html else None,
        "books": books,
        "images": images
    }

    write_site(web_dir, edition)

    # Summary
    missing = [x for x in images if not x.get("exists")]
    print(f"[ok] Wrote site to {web_dir}")
    print(f"     Pages detected: {len(images)} (missing: {len(missing)})")
    if missing:
        print("     Missing examples (first 5):")
        for m in missing[:5]:
            print(f"       n={m.get('n','')} facs='{m.get('facs','')}' -> {m.get('resolved')}")


def main():
    ap = argparse.ArgumentParser(description="Build a static digital edition (JSON + HTML) from TEI.")
    ap.add_argument("--tei", type=Path, default=Path("docs/edition-3/web/tei-final-3-1.xml"),
                    help="Path to the TEI XML (default: docs/edition-3/web/tei-final-3-1.xml)")
    ap.add_argument("--facsimiles", type=Path, default=None,
                    help="Path to facsimiles directory (default: auto-detect as docs/facsimiles)")
    args = ap.parse_args()

    build(args.tei, args.facsimiles)


if __name__ == "__main__":
    main()
