(async function () {
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
