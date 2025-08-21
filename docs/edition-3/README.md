# Lucina Digital Edition - WORKING VERSION

## Quick Start
1. Open `OPEN_ME.html` in your browser
2. Click "Open Simple Synchronized View"
3. Select a book and poem
4. Text appears on left, manuscript image on right

## Structure
- **128 poems** in 4 books (Praefatio + Books I-III)
- **130 manuscript pages** (65 double-page images)
- **97 historical persons** referenced

## Files
```
edition-3/
├── OPEN_ME.html                    ← Start here
├── tei-final-3-with-pages.xml      (TEI source with page breaks)
├── lucina_digital_edition.py       (Python processor)
├── reprocess_with_pages.py         (Regenerate data if needed)
└── web/
    ├── simple_sync.html             ← Main synchronized viewer
    ├── poems-data-pages.js          (All poems with page info)
    ├── books-data.js                (Book structure)
    ├── persons-data.js              (Prosopographical data)
    ├── index.html                   (Alternative view)
    └── index_sync.html              (Original synchronized view)
```

## How It Works
1. Each poem knows which manuscript pages it appears on
2. Page numbers map to image files (e.g., page 9 → image_5_2__left.jpg)
3. Images are loaded from `../facsimiles/` directory

## If You Need to Regenerate Data
```bash
cd docs/edition-3
python reprocess_with_pages.py
```

This will regenerate all JavaScript data files from the TEI XML source.