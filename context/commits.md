feat: implement DOCX to TEI XML converter for Lucina digital edition

## Overview
Created Python converter to transform Edition.docx (Albrisius's Lucina, 1474) into valid TEI XML structure.

## Implementation
- **docx-to-tei-xml.py**: Full converter using python-docx and lxml
- Processes 2,431 paragraphs → 128 poems across 4 books (Praef + I-III)
- Extracts 2,150+ verse lines with proper metrical structure

## Key Features
- **Structure Detection**: 
  - Books: Praefatio, Buch I/II/III headers
  - Poems: Pattern matching for "I, 1 Ad [Name]" format
  - Rubrics: Italic text with author attributions
  - Verses: Indentation detection for pentameters

- **TEI Generation**:
  - Valid namespace handling (TEI + XML)
  - Hierarchical structure: front/body → books → poems → line groups
  - Poem IDs: `poem-I.1`, `poem-II.37`, etc.
  - Line IDs: `I.1.1`, `II.37.15`, etc.
  - Meter detection: elegiac (90%), sapphic, hendecasyllabic
  - Genre classification: erotic, epideictic, invective, epitaph, etc.

- **Named Entity Extraction**:
  - 50+ person references with normalized IDs
  - Simonetta family, Visconti, court officials, clergy
  - Special handling for Lucina, mythological figures

## Data Processing

--- 

Add editorial introduction for Lucina digital edition

Document Madrid Codex (BN Mss. 6028, 1474), Albrisius biography (poet laureate 1468/69), 
128 poems/3 books narrative, Sforza court context, TEI-P5 implementation, CC BY 4.0 license

```
feat: implement TEI encoding framework for Lucina digital edition

- Add complete TEI XML structure with header, standOff, and text divisions
- Define encoding guidelines for 128 Latin poems across 3 books
- Implement prosopographical data for 50+ historical figures
- Set up apparatus layers (paleographic, literary, historical notes)
- Encode poems I.1-I.6 as reference templates
- Document metrical patterns (elegiac, sapphic, hendecasyllabic)
- Establish ID schemes and cross-referencing system
- Map manuscript features (rubrics, abbreviations, variants)

Base text: Madrid BN Mss. 6028 (1474)
Following: TEI P5 Guidelines
```

feat: document promptotyping process for TEI digital edition

- establish context with digital edition criteria
- create editorial introduction and guidelines
- implement TEI mapping with validation in Oxygen
- fix TEI issues (remove hallucinated geo, move lists to standOff)
- valid TEI achieved with expert adjustments