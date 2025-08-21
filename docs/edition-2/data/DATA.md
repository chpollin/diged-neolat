# DATA.md - Lucina Digital Edition

## Core Identification

**Work**: *Lucina* - 128 Latin occasional poems  
**Author**: Aurelius Laurentius Albrisius (Albrisio/Albrisi), Cremona c.1440-45  
**Manuscript**: Madrid, Biblioteca Nacional, Mss. 6028 [=MS]  
**Completed**: Pavia, 2 August 1474 (colophon: "Actum Papiae. Anno christi 1474 Quarto Nonas Augustas. Diis Immor.")  
**Significance**: Previously unknown work documenting Sforza court culture c.1470-74

## Author Biography

**Albrisius**: Cremona c.1440-45 → canon law (Perugia) → Simonetta tutor → poet laureate (Rome 1468/69, via Bishop Giovanni San Lamberto) → priest (by Bishop Giovanni Campesio, d.1474); married, 4 children (wife predeceased)

**Literary persona**: Claims love began age 20 ("Claudi lustra quater"), insists on autobiographical authenticity while maintaining deliberate ambiguity

## Manuscript Description

### Primary Witness
**MS**: Parchment, 176ff, 220×145mm, humanistic script, single column, 20 lines/page  
**Features**: Illuminated initials, marginal ornaments, coat of arms (likely Simonetta)  
**Status**: Authorial presentation copy, Cicco Simonetta's library  

### Additional Witnesses
- Florence, Bibl. Riccardiana 1458: 2 poems (one duplicates II.15)
- Milan, Bibl. Ambrosiana E 12 sup: astronomical texts + verses (Albrisius, 1476)

## Structure and Metrics

| Division | Poems | Lines | Meters | Genres |
|----------|-------|-------|---------|---------|
| Praefatio | - | 16 | elegiac | dedication |
| Book I | 43 | 850 | eleg(22), hend(20), sapp(1) | epist(35), erot(2), pray(3), epit(2), epid(1) |
| Book II | 37 | 684 | eleg(20), hend(17) | epist(32), erot(1), pray(2), cons(2) |
| Book III | 47 | 648 | eleg(24), hend(23) | epist(42), pray(4), paraen(1) |
| **Total** | **128** | **2,182** | **eleg(66), hend(60), sapp(1), ?(I.6)** | **epist(109), pray(9), erot(3), epit(3), epid(2), paraen(1)** |

**Range**: 2-124 lines per poem  
**Metrical pattern (elegiac)**: `-uu|-uu|-uu|-uu|-uu|-uu || -uu|-uu|- | -uu|-uu|-`

## Narrative Architecture

**Book I**: Love initiation - San Francesco church window scene (→Petrarch/Laura parallel) - law studies tension ("studiorum ad iura meorum") - rival Franciscus Varensis  
**Book II**: Court poetry + consummation (II.37 erotic banquet/wine cellar scene) - patronage focus  
**Book III**: Renunciation - Bishop Giovanni's benefice offer - Lucina "remained virgin" (III.9) - becomes "custos rigidus... et sacerdos" (III.47)

**Function**: Literary autobiography + patronage portfolio ("Bewerbungsmappe")

## Social Network

### Dedicatees
- **Praefatio + Book I**: Cicco Simonetta [CS] ("alter Maecenas")
- **Book II**: Giovanni Giacomo Simonetta (eldest son)
- **Book III**: Bishop Giovanni of San Lamberto

### Prosopography (142 tags, 84 unique persons)
**Frequency**: CS(12), Lamia(7), Galeazzo Maria Sforza[GMS](5), Giacomo Simonetta(5), Lucina(4), Franciscus Varensis(rival)  
**Categories**: Sforza family, Simonetta family + relations (Visconti, Torelli), ecclesiastics, humanists, court officials  
**Geography**: Pavia, Milan, Cremona, Ferrara, Perugia, Rome

## Literary Models

**Classical**: Ovid/*Amores*→Lucina figure; Tibullus/Propertius→elegiac tradition; Catullus→hendecasyllables; Martial→invectives; Horace→Maecenas topos; Virgil→elevated passages

**Renaissance**: Petrarch/*Canzoniere*+*Epistulae metricae*→3-book structure, window scene, real addressees, autobiographical claims; church setting→love/law/religion tension

## Current TEI Encoding Status

### Complete (100%)
- Structure: books(3), poems(128), lines(2,182), IDs (book#, poem-I.#, I.#.#, I.#.lg#)
- Metrical annotation: all @met attributes
- Genre classification: all @ana with #-tags
- Page breaks: all with facsimile links

### Partial
- Persons: 95% identified (88 in standOff, 0% biographical data)
- Textual features: 30 parentheticals, 2 direct speech marked
- Editorial: some punctuation/capitalization normalized

### Missing (0%)
- Textual apparatus (7 variants unencoded)
- Scholarly notes (0/127 poems)
- Literary cross-references
- Places (no listPlace)
- Abbreviation expansions
- Editorial intervention markers
- Typographic features (small caps/italics)

## Phase 1 Enhancements

**Automated changes (131 total)**:
- +30 `<seg type="parenthesis">`
- +2 `<said rend="quoted">`  
- +11 @ref attributes
- +88 standOff person entries
- 14-21 lines flagged for speech review

## Textual Variants (Unencoded)

| Location | Edition | MS Reading |
|----------|---------|------------|
| I.1.4 | Exacta | exactae |
| I.1.4 | nocte | noctis |
| I.1.18 | Attonitamque | attonitaque |
| I.5.4 | sospitumque | sopitumque |
| I.20 title | praesul | paesul |
| I.20.40 | Nestoreos | Naestores |
| I.24.24 | edidit | Aedidit |

## Editorial Principles

**Claimed**: Diplomatic transcription, original orthography, minimal emendation  
**Actual** (from DOCX): Semi-diplomatic with modern punctuation, expanded abbreviations (unmarked), normalized capitals, some standardization

## Digital Implementation

### TEI Framework
- P5 Guidelines + ODD documentation
- Machine-readable with API (OAI-PMH, REST)
- Persistent identifiers (DOI/URN/PURL)
- Multiple views: diplomatic/normalized/reading

### Planned Features
- Network visualizations (social connections)
- Geographic mapping (Northern Italy)
- Timeline reconstruction (c.1468-74)
- Parallel text display (sources)
- Advanced search (formal/thematic/prosopographical)

## Dating Evidence

- **1468/69**: Poet laureate coronation (Rome)
- **1474**: Bishop Campesio dies (terminus for ordination)
- **2 Aug 1474**: Collection completed (Pavia)
- **1476**: Milan manuscript with Albrisius's astronomical texts
- **Internal**: Love begins age 20 (4th lustrum)

## Key Locations

**Courts**: Pavia (primary), Milan (secondary)  
**Personal**: Cremona (birth), Perugia (studies), Rome (coronation)  
**Literary**: San Francesco church (opening scene/Petrarchan parallel)

## Encoding Conventions

### IDs
- Books: `xml:id="bookI"`, `"bookII"`, `"bookIII"`
- Poems: `xml:id="poem-I.1"` through `"poem-III.47"`
- Lines: `xml:id="I.1.1"` (book.poem.line)
- Line groups: `xml:id="I.1.lg1"`
- Persons: `xml:id="firstname-lastname"` (lowercase, hyphenated)
- Places: `xml:id="place-name"` (lowercase, hyphenated)

### Note Types Required
- **Paleographic**: MS corrections/features
- **Literary**: allusions, sources (esp. Petrarch window)
- **Historical**: context for persons/events
- **Prosopographical**: biographical data (cf. Ianziti 1988 for CS)
- **Editorial**: metrical issues, emendations

## Special Challenges

### Interpretive
- Lucina: real/composite/fictional?
- Autobiography vs. literary convention
- Actual chronology vs. narrative time

### Technical
- Poem I.6: uncertain meter (provisionally encoded)
- Direct speech: Latin conventions (verb+colon, no quotes)
- Multiple textual layers: MS→DOCX→TEI→Phase1→planned apparatus

### Linguistic
- 15th-c. humanist Latin with medieval survivals
- Italian-influenced orthography
- Vernacular syntax traces
- Ecclesiastical formulae (religious poems)
- Legal terminology (author's training)

## Research Significance

**Literary**: Petrarchan *carmina* tradition, patronage strategies, classical/Renaissance synthesis, autobiography construction  
**Historical**: Sforza court culture c.1470, patronage networks, humanist education, social relationships  
**Unique value**: Unknown work filling scholarly lacuna, ~50 historical figures documented, secular→sacred career trajectory

## Quality Metrics

| Category | Coverage | Notes |
|----------|----------|-------|
| Structure | 100% | Complete hierarchy |
| Meter | 100% | Except I.6 uncertain |
| Genre | 100% | All classified |
| Persons | 95% | 88/84 in standOff, 0% biographical |
| Commentary | 0% | No notes yet |
| Apparatus | 0% | 7 variants unencoded |
| Cross-refs | 0% | No sources linked |
| Places | 0% | No listPlace |

## Immediate Priorities

1. Encode 7 textual variants in `<app>` elements
2. Add colophon with proper date encoding
3. Complete biographical data (88 persons)
4. Create listPlace for geographical entities
5. Add literary notes (Petrarchan parallels priority)
6. Mark editorial interventions
7. Encode typographic features

## Conclusion

The *Lucina* digital edition transforms a single luxury MS into comprehensive research resource: 2,182 lines across 128 poems addressing 84 individuals, documenting Sforza court culture while exemplifying Quattrocento occasional poetry tradition. Current encoding captures structure/meter completely (100%), identifies social network (95%), but requires scholarly apparatus, textual criticism, and contextual annotation to meet full digital scholarly edition standards.