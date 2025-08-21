import xml.etree.ElementTree as ET
from pathlib import Path
import os

# --- Configuration ---
XML_INPUT_FILE = "tei-final-1.xml"
HTML_OUTPUT_FILE = "index.html"
CSS_FILE_NAME = "style.css"
JS_FILE_NAME = "script.js"

# Set the absolute path to your facsimiles folder.
FACSIMILES_BASE_PATH = Path("C:/Users/Chrisi/Documents/GitHub/diged-neolat/facsimiles")


def get_full_text(element):
    """Recursively gets all text from an element and its children."""
    return ''.join(element.itertext()).strip()

def parse_tei_header(root, ns):
    """Extracts information from the teiHeader and formats it as HTML."""
    header_data = {}
    
    title_stmt = root.find('.//tei:titleStmt', ns)
    if title_stmt is not None:
        header_data['title'] = get_full_text(title_stmt.find('tei:title', ns))
        header_data['author'] = get_full_text(title_stmt.find('tei:author', ns))

    pub_stmt = root.find('.//tei:publicationStmt', ns)
    if pub_stmt is not None:
        header_data['publisher'] = get_full_text(pub_stmt.find('tei:publisher', ns))
        header_data['date'] = pub_stmt.find('tei:date', ns).get('when', '')

    ms_desc = root.find('.//tei:msDesc', ns)
    if ms_desc is not None:
        ms_info = []
        ms_identifier = ms_desc.find('tei:msIdentifier', ns)
        if ms_identifier is not None:
            repo = get_full_text(ms_identifier.find('tei:repository', ns))
            idno = get_full_text(ms_identifier.find('tei:idno', ns))
            ms_info.append(f"<strong>Repository:</strong> {repo}, {idno}")
        
        ms_contents = ms_desc.find('tei:msContents/tei:msItem', ns)
        if ms_contents is not None:
            ms_info.append(f"<strong>Title in MS:</strong> {get_full_text(ms_contents.find('tei:title', ns))}")
            ms_info.append(f"<strong>Colophon:</strong> {get_full_text(ms_contents.find('tei:colophon', ns))}")
        
        phys_desc = ms_desc.find('tei:physDesc', ns)
        if phys_desc is not None:
            extent = phys_desc.find('.//tei:extent', ns)
            if extent is not None:
                 ms_info.append(f"<strong>Extent:</strong> {get_full_text(extent)}")
            layout = phys_desc.find('.//tei:layout', ns)
            if layout is not None:
                 ms_info.append(f"<strong>Layout:</strong> {get_full_text(layout)}")
        
        header_data['ms_desc'] = "<li>" + "</li><li>".join(ms_info) + "</li>"

    html = f"""
    <details class="info-box">
        <summary><h2>Edition and Manuscript Details</h2></summary>
        <div class="metadata-grid">
            <div><strong>Title:</strong> {header_data.get('title', 'N/A')}</div>
            <div><strong>Author:</strong> {header_data.get('author', 'N/A')}</div>
            <div><strong>Publisher:</strong> {header_data.get('publisher', 'N/A')}</div>
            <div><strong>Date:</strong> {header_data.get('date', 'N/A')}</div>
        </div>
        <h3>Manuscript Description</h3>
        <ul>{header_data.get('ms_desc', '')}</ul>
    </details>
    """
    return html

def parse_standoff(root, ns):
    """Extracts persons and places from the standOff section."""
    html_parts = []
    
    list_person = root.find('.//tei:listPerson', ns)
    if list_person is not None:
        persons_html = "<ul>"
        for person in list_person.findall('tei:person', ns):
            person_id = person.get('{http://www.w3.org/XML/1998/namespace}id')
            name = get_full_text(person.find('tei:persName', ns))
            note = person.find('tei:note', ns)
            note_text = f" - <em>{get_full_text(note)}</em>" if note is not None else ""
            persons_html += f'<li id="{person_id}"><strong>{name}</strong>{note_text}</li>'
        persons_html += "</ul>"
        html_parts.append(f"<details class='info-box'><summary><h3>Persons Mentioned</h3></summary>{persons_html}</details>")

    list_place = root.find('.//tei:listPlace', ns)
    if list_place is not None:
        places_html = "<ul>"
        for place in list_place.findall('tei:place', ns):
            place_id = place.get('{http://www.w3.org/XML/1998/namespace}id')
            name = get_full_text(place.find('tei:placeName', ns))
            places_html += f'<li id="{place_id}"><strong>{name}</strong></li>'
        places_html += "</ul>"
        html_parts.append(f"<details class='info-box'><summary><h3>Places Mentioned</h3></summary>{places_html}</details>")

    return f"<div><h2>Contextual Information</h2>{''.join(html_parts)}</div>" if html_parts else ""

def generate_content_html(text_root, ns):
    """Recursively processes the XML tree to generate structurally correct HTML."""
    html_parts = []
    
    # Process preface
    praefatio = text_root.find('tei:front/tei:div[@type="praefatio"]', ns)
    if praefatio is not None:
        html_parts.append('<section id="praefatio">')
        # Wrap preface content in a single <article> for consistent styling
        html_parts.append('<article class="poem">')
        for element in praefatio:
            html_parts.append(process_element(element, ns))
        html_parts.append('</article>')
        html_parts.append('</section>')

    # Process body
    body = text_root.find('tei:body', ns)
    if body is not None:
        for book in body.findall('tei:div[@type="book"]', ns):
            html_parts.append(process_element(book, ns))
            
    return "".join(html_parts)

def process_element(element, ns):
    """Helper function to process a single XML element into HTML."""
    tag = element.tag.replace(f"{{{ns['tei']}}}", "")
    parts = []

    # --- Opening Tags ---
    if tag == 'div' and element.get('type') == 'book':
        book_id = element.get('id', '')
        parts.append(f'<section id="{book_id}">')
    elif tag == 'div' and element.get('type') == 'poem':
        poem_id = element.get('{http://www.w3.org/XML/1998/namespace}id', '')
        poem_n = element.get('n', 'N/A')
        poem_met = element.get('met', 'N/A')
        poem_ana = element.get('ana', '').replace('#', '')
        meta = f'<div class="poem-meta"><span>Poem: {poem_n}</span><span>Meter: {poem_met}</span><span>Genre: {poem_ana}</span></div>'
        parts.append(f'<article class="poem" id="{poem_id}">{meta}')
    
    # --- Self-closing/Simple Tags ---
    if tag == 'pb':
        image_src = (FACSIMILES_BASE_PATH / element.get('facs')).as_uri()
        page_num = element.get('n')
        parts.append(f'<div class="page-marker" data-image-src="{image_src}" data-folio="{page_num}"></div>')
    elif tag == 'head':
        classes = "poem-header" + (' rubric' if element.get('type') == 'rubric' else '')
        head_content = ""
        if element.text: head_content += element.text.strip()
        for child in element:
            child_tag = child.tag.replace(f"{{{ns['tei']}}}", "")
            if child_tag == 'persName' and child.get('ref'):
                ref = child.get('ref').lstrip('#')
                head_content += f' <a href="#{ref}">{get_full_text(child)}</a>'
            else:
                head_content += get_full_text(child)
            if child.tail: head_content += child.tail.strip()
        parts.append(f'<h3 class="{classes}">{head_content}</h3>')
    elif tag == 'l':
        classes = "line" + (' indented-line' if element.get('rend') == 'indent' else '')
        line_n = element.get('n', '')
        line_id = element.get('{http://www.w3.org/XML/1998/namespace}id', '')
        parts.append(f'<span class="{classes}" data-xml-id="{line_id}"><span class="line-number">{line_n}</span>{get_full_text(element)}</span>')

    # --- Process Child Elements Recursively ---
    if tag in ['div', 'lg', 'front', 'body']:
        for child in element:
            parts.append(process_element(child, ns))

    # --- Closing Tags ---
    if tag == 'div' and element.get('type') == 'book':
        parts.append('</section>')
    elif tag == 'div' and element.get('type') == 'poem':
        parts.append('</article>')

    return "".join(parts)


def create_html_from_tei(xml_path, output_path):
    """Loads the TEI XML, transforms it, and writes the index.html file with a modern UI."""
    try:
        ns = {'tei': 'http://www.tei-c.org/ns/1.0'}
        ET.register_namespace('', ns['tei'])
        tree = ET.parse(xml_path)
        root = tree.getroot()
    except FileNotFoundError:
        print(f"Error: Input XML file not found at '{xml_path}'")
        return
    except ET.ParseError as e:
        print(f"Error parsing XML file: {e}")
        return

    header_html = parse_tei_header(root, ns)
    standoff_html = parse_standoff(root, ns)
    text_root = root.find('tei:text', ns)
    
    toc_html = '<div class="table-of-contents"><h3>Table of Contents</h3><ul>'
    books = text_root.findall('.//tei:div[@type="book"]', ns)
    for i, book in enumerate(books):
        book_id = f"book-{i+1}"
        book.set('id', book_id)
        title_element = book.find('tei:head', ns)
        if title_element is not None:
            title = get_full_text(title_element)
            toc_html += f'<li><a href="#{book_id}">{title}</a></li>'
    toc_html += '</ul></div>'

    content_html = generate_content_html(text_root, ns)

    title_element = root.find('.//tei:titleStmt/tei:title', ns)
    title = title_element.text if title_element is not None else "Digital Edition"
    author_element = root.find('.//tei:titleStmt/tei:author', ns)
    author = get_full_text(author_element) if author_element is not None else "Unknown Author"
    
    html_full = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <link rel="stylesheet" href="{CSS_FILE_NAME}">
</head>
<body>
    <header>
        <h1>{title}</h1>
        <h2>{author}</h2>
    </header>
    
    <div class="main-container">
        <div class="content-column">
            <main>
                {toc_html}
                {header_html}
                {standoff_html}
                {content_html}
            </main>
        </div>
        <aside class="facsimile-sidebar">
            <div class="facsimile-image-container">
                <img id="facsimile-image" src="" alt="Manuscript Facsimile">
            </div>
            <p id="folio-number"></p>
        </aside>
    </div>

    <script src="{JS_FILE_NAME}"></script>
</body>
</html>
    """
    
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html_full)
        print(f"Successfully created HTML file: {output_path}")
    except IOError as e:
        print(f"Error writing HTML file: {e}")

def main():
    """Main function to orchestrate the edition creation."""
    print("--- Starting Digital Edition HTML Generation ---")
    
    create_html_from_tei(XML_INPUT_FILE, HTML_OUTPUT_FILE)
    
    print("\n--- Process Complete ---")
    print(f"HTML file generated: {Path(HTML_OUTPUT_FILE).resolve()}")
    print("Please ensure 'style.css' and 'script.js' are in the same directory.")

if __name__ == "__main__":
    main()

