# DOCX-DATA.md

# Lucina Edition Data Structure and Processing Guide

## Document Overview

The Edition.docx file contains the complete text of Aurelius Laurentius Albrisius's *Lucina*, a collection of 128 Latin occasional poems from 1474. The document is structured as a plain text transcription from Madrid, Biblioteca Nacional, Mss. 6028.

## Document Statistics

- **Total Poems**: 128 (+ 1 Praefatio)
- **Total Verses**: 2,224
- **Structure**: Praefatio + 3 Books
  - **Book I**: 43 poems
  - **Book II**: 37 poems  
  - **Book III**: 47 poems
- **Colophon**: "Actum Papiae. Anno christi 1474 / Quarto Nonas Augustas."

## Document Structure Patterns

### 1. Section Headers

```
# 2 Edition                           → Main document title
# Praefatio                          → Praefatio section
# Buch I                             → Book I header
# Buch II                            → Book II header  
# B[uch] III                         → Book III header (with brackets)
```

### 2. Poem Headers

Standard format:
```
# [Book], [Number] Ad [Dedicatee]
```

Examples:
```
# I, 1 Ad Mecoenatem Cichum Simonetam.
# II, 37 Ad Iohannem Iacobum Simonetam.
# III, 47 Ad Mecoenatem Cichum Simonetam.
```

Special cases:
```
# Praefatio                          → No number, special section
# III, 1 Ad Iohannem sancti Lamberti → Book III opener with special formatting
```

### 3. Rubrics (Bold Text)

Rubrics appear in **bold** immediately after poem headers:

```
**Aurelii Laurentii Albrisii praefatio in Lucinam**     → Praefatio rubric
**ad mecoenatem Cichum Simonetam**                       → Dedication rubric
**Aurelii Larentii Albrisii Lucina incipit.**           → I.1 opening rubric
```

### 4. Verse Lines

#### Elegiac Couplets (Most Common)
- **Hexameter**: Regular line (odd-numbered)
- **Pentameter**: Indented line (even-numbered)

Example:
```
Mecoenas equitum, Calabrae quoque gloria gentis,        → Hexameter
     insubrium et quinti maxima cura ducis!             → Pentameter (indented)
```

#### Other Meters
- **Lyric meters**: Variable line lengths, irregular indentation (e.g., I.6, II.14)
- **Sapphic stanzas**: 4-line groups with specific patterns
- **Hendecasyllables**: 11-syllable lines

### 5. Special Text Elements

#### Parenthetical Text
```
Mirabar roseos (ut polus astra) sinus.                  → Line I.1.12
```

#### Direct Speech
```
Diceret: "Ah, tantum clare poeta iaces!"               → Line I.2.6
```

#### Footnotes/Variants
```
Exacta[^1] fuerant iam nata crepuscula nocte[^2]       → Line I.1.3
[^1]: exactae *C*                                       → Footnote at document end
```

#### Small Caps
```
Chiche[,]{.smallcaps}                                   → Special formatting
L[ucinam]{.smallcaps}                                   → Name in small caps
```

#### Special Characters
```
❮elmum❯                                                  → III.28 corrupted text
Pon**ç**onos                                           → II.8 special character
```

## Detailed Data Patterns by Book

### Praefatio
- **Lines**: 16 (8 elegiac couplets)
- **Dedicatee**: Cicco Simonetta (Mecoenas)
- **Content**: Introduction defending youthful love poetry
- **Key names**: Ciche, Lucina

### Book I (43 Poems)

| Poem | Lines | Dedicatee | Meter | Special Features |
|------|-------|-----------|-------|------------------|
| I.1 | 22 | Mecoenatem Cichum Simonetam | Elegiac | Opening rubric, window scene |
| I.2 | 12 | Philippum Vicecomitem | Elegiac | Direct speech |
| I.3 | 10 | Iohannem Simonetam | Elegiac | Love-sickness topos |
| I.4 | 6 | Mecoenatem Cichum | Elegiac | Maecenas topos |
| I.5 | 18 | Franciscum Varensem | Elegiac | Rival in love |
| I.6 | 44 | Iacobum Marnum | Lyric | Complex meter, winter scene |
| I.7 | 6 | Iohannem Iacobum hydropotem | Elegiac | Medical advice |
| I.8 | 6 | Lucinam | Elegiac | Direct address to beloved |
| I.9 | 20 | Deum Galeacium Sphortiam | Elegiac | Panegyric to Duke |
| I.10 | 4 | Lamiam Formium | Elegiac | Epigram |
| I.11 | 8 | Franciscum Philelfum | Elegiac | Literary rivalry |
| I.12 | 8 | Gasparem Vicecomitem | Elegiac | Friendship poem |
| I.13 | 4 | Brandum Castillionem | Elegiac | Literary joke |
| I.14 | 10 | Comitem Petrum Vermium | Elegiac | Decline of invitation |
| I.15 | 48 | Deum Galeacium Sphortiam | Sapphic | Elaborate panegyric |
| I.16 | 4 | Azonem Vicecomitem | Elegiac | Medical theme |
| I.17 | 38 | Mecoenatem Cichum | Elegiac | Love confession |
| I.18 | 3 | Iohannem Antonum Vezanum | Hendecasyllabic | Sexual joke |
| I.19 | 4 | Mecoenatem Cichum | Elegiac | Departure poem |
| I.20 | 32 | Iohannem Stephanum Borthigelam | Sapphic | Episcopal praise |
| I.21 | 4 | Deum Galaecium | Elegiac | Brief panegyric |
| I.22 | 8 | Thomam Hesinum | Elegiac | Military praise |
| I.23 | 4 | Lamiam | Elegiac | Hunting and love |
| I.24 | 24 | Guidonem Galeacium Torellum | Elegiac | Beauty praise |
| I.25 | 48 | Barbiton pro Mecoenate | Sapphic | Spring song |
| I.26 | 6 | Iohannem Petrum Cominum | Elegiac | Court access |
| I.27 | 6 | Ambrosium Vicecomitem | Elegiac | Advice poem |
| I.28 | 4 | Serum Florentinum | Hendecasyllabic | Secretary praise |
| I.29 | 4 | Iohannem Attendulum | Elegiac | Love advice |
| I.30 | 32 | Deum Galeacium | Asclepiadean | Complex panegyric |
| I.31 | 2 | Venerem | Elegiac | Prayer to Venus |
| I.32 | 4 | Blasium | Elegiac | Friendship |
| I.33 | 4 | Vitulinum Barboum | Elegiac | Obscure imagery |
| I.34 | 4 | L[ucinam] | Elegiac | Love complaint |
| I.35 | 2 | Mecoenatem Cichum | Elegiac | Farewell |
| I.36 | 12 | In Lechnon | Hendecasyllabic | Invective |
| I.37 | 8 | Iohannem Stephanum | Elegiac | Legal theme |
| I.38 | 6 | Andream Simonetam | Elegiac | Courtier praise |
| I.39 | 24 | Lodovicum Petrobonum | Sapphic | Homoerotic themes |
| I.40 | 4 | Lamiam | Elegiac | Name pun |
| I.41 | 4 | Iacobum Bonarellum | Elegiac | Friendship |
| I.42 | 10 | Leonardum Glusianum | Elegiac | Invective |
| I.43 | 76 | Somnum | Sapphic | Sleep invocation |

### Book II (37 Poems)

| Poem | Lines | Dedicatee | Meter | Special Features |
|------|-------|-----------|-------|------------------|
| II.1 | 8 | Iohannem Iacobum Simonetam | Elegiac | Book opening, capitals |
| II.2 | 56 | Ascanium Vicecomitem | Sapphic | Ecclesiastical praise |
| II.3 | 4 | Sigismundum Simonetam | Elegiac | Bishop poem |
| II.4 | 2 | Guidonem Torellum | Elegiac | Brief praise |
| II.5 | 14 | Io. Iacobum Simonetam | Elegiac | Court hierarchy |
| II.6 | 60 | Baptistam Plasium | Sapphic | Astrological themes |
| II.7 | 4 | In Borsium | Elegiac | Defense of love |
| II.8 | 6 | Baptistam et Margaritam | Elegiac | Baptism, godparent |
| II.9 | 10 | Iohannem Iacobum | Elegiac | Biblical Jacob |
| II.10 | 4 | In Tonsum | Elegiac | Name pun invective |
| II.11 | 2 | In canem | Elegiac | Dog invective |
| II.12 | 2 | Ad Blasium | Elegiac | Writing theme |
| II.13 | 4 | Lamiam Formium | Elegiac | Meter discussion |
| II.14 | 132 | Euterpem/Sympsium | Sapphic | Wedding poem, longest in Book II |
| II.15 | 4 | Serum Florentinum | Elegiac | Literary exchange |
| II.16 | 4 | Philippum Ferusinum | Elegiac | Book recommendation |
| II.17 | 4 | In Tadaei sepulchro | Elegiac | Epitaph |
| II.18 | 10 | Sigismundum Simonetam | Elegiac | Dietary restrictions |
| II.19 | 36 | Antonium Guidonem | Sapphic | Mythological catalog |
| II.20 | 8 | Iohannem Iacobum | Elegiac | Love rejection |
| II.21 | 24 | Lodovicum Simonetam | Elegiac | Poetic program |
| II.22 | 44 | Deum Galeacium | Sapphic | Duke panegyric |
| II.23 | 24 | Antonium Fredericum | Elegiac | Literary praise |
| II.24 | 30 | Laurentium Stroçam | Sapphic | Orpheus comparison |
| II.25 | 2 | Alexandrum Coletam | Elegiac | Navigation metaphor |
| II.26 | 4 | Titum et Laurentium | Elegiac | Two poets |
| II.27 | 4 | Sigismundum Simonetam | Elegiac | Humble feast menu |
| II.28 | 4 | In Aptum | Elegiac | Name pun |
| II.29 | 6 | Baldasarem Mellium | Elegiac | Patron praise |
| II.30 | 4 | Thomam Haesinum | Elegiac | Declined invitation |
| II.31 | 4 | Galeotum | Elegiac | Return celebration |
| II.32 | 6 | Iohannem Franciscum | Elegiac | Barbara praise |
| II.33 | 4 | Franciscum Firmanum | Elegiac | Love triangle |
| II.34 | 16 | Lucina in Cerverium | Sapphic | Lucina speaks |
| II.35 | 8 | Guilielminum Lamiam | Elegiac | Marriage alliance |
| II.36 | 10 | Hieronymum Guidonem | Elegiac | Judge and love |
| II.37 | 22 | Iohannem Iacobum | Elegiac | **Erotic climax scene** |

### Book III (47 Poems)

| Poem | Lines | Dedicatee | Meter | Special Features |
|------|-------|-----------|-------|------------------|
| III.1 | 28 | Iohannem sancti Lamberti | Sapphic | Book dedication |
| III.2 | 4 | Boninum | Elegiac | Name paradox |
| III.3 | 6 | In Cerverium | Elegiac | Invective |
| III.4 | 4 | Plantanidum | Elegiac | Recommendation |
| III.5 | 24 | Aeternum Deum | Elegiac | Prayer |
| III.6 | 36 | Cichidas | Elegiac | Legal studies |
| III.7 | 8 | Amicos et Cupidinem | Elegiac | **Renunciation of love** |
| III.8 | 8 | Iacobum Antiquarium | Elegiac | Religious conversion |
| III.9 | 24 | Iacobum Marnum | Elegiac | **Lucina's virginity claim** |
| III.10 | 48 | Mecoenatem Cichum | Sapphic | Consolation |
| III.11 | 2 | Franciscae sepulcro | Elegiac | Epitaph |
| III.12 | 24 | Ascanium Vicecomitem | Elegiac | Cardinal elevation |
| III.13 | 40 | Andreotum Mainum | Sapphic | Court praise |
| III.14 | 10 | Antonium Fredericum | Elegiac | Literary advice |
| III.15 | 4 | Guidonem Antonium | Elegiac | Greek teaching |
| III.16 | 30 | Guilielminum Lamiam | Sapphic | Noble genealogy |
| III.17 | 6 | Fulgosium | Hendecasyllabic | Medical recipe |
| III.18 | 28 | Iohannem Lamberti | Elegiac | **Poet laureate coronation** |
| III.19 | 10 | Marcum Trotum | Elegiac | Death lament |
| III.20 | 4 | Iohannem Molum | Sapphic | Regret |
| III.21 | 6 | Mecoenatem Cichum | Elegiac | Complaint |
| III.22 | 6 | Lodovicum Simonetam | Elegiac | Confused imagery |
| III.23 | 16 | Franciscum Philelfum | Elegiac | Literary defense |
| III.24 | 4 | Guidonem Torellum | Elegiac | Night birds |
| III.25 | 6 | Iohannem Campisium | Elegiac | **Ordination** |
| III.26 | 4 | Cichum Mecoenatem | Elegiac | Boar sacrifice |
| III.27 | 4 | Laurentium Landinum | Elegiac | Literary joke |
| III.28 | 32 | Guili❮elmum❯ Lamiam | Sapphic | Wealth and virtue |
| III.29 | 66 | Catharina ad Bonium | Elegiac | **Female speaker**, Heroides-style |
| III.30 | 48 | Ad Laurum | Sapphic | Laurel praise |
| III.31 | 56 | Tharsia ad Casate | Elegiac | **Female speaker**, abandonment |
| III.32 | 26 | Aeternum Deum | Sapphic | Easter prayer |
| III.33 | 4 | Iohannem Antonium | Elegiac | Rose gift |
| III.34 | 4 | Frederici sepulcrum | Elegiac | Epitaph |
| III.35 | 8 | In Picculum | Elegiac | Harsh invective |
| III.36 | 36 | Franciscum Philelfum | Elegiac | Literary controversy |
| III.37 | 4 | Baptistam Plasium | Elegiac | Friendship |
| III.38 | 2 | In Vitulinum | Elegiac | Fig theft |
| III.39 | 8 | In Picculum | Elegiac | Medical satire |
| III.40 | 2 | Philippum Ferufinum | Elegiac | Farewell |
| III.41 | 22 | Divum Franciscum | Elegiac | Release request |
| III.42 | 18 | Francha camilla | Elegiac | **Female speaker**, adultery |
| III.43 | 86 | Paula ad Alphonsinum | Elegiac | **Female speaker**, proposition |
| III.44 | 134 | Guidonem Antonium | Elegiac | **Vision narrative**, longest poem |
| III.45 | 6 | Ad Lectorem | Hendecasyllabic | Meta-poetic |
| III.46 | 28 | Iohannem Iacobum | Elegiac | Deer miracle |
| III.47 | 32 | Mecoenatem Cichum | Sapphic | **Final poem, priest transformation** |

## Named Entities Extraction

### Persons (Primary)

| Name in Text | Standardized ID | Role | Frequency |
|--------------|----------------|------|-----------|
| Cichum Simonetam | cicco-simonetta | Primary patron | 15+ poems |
| Iohannem Simonetam | giovanni-simonetta | Son of Cicco | 5+ poems |
| Iohannem Iacobum Simonetam | giacomo-simonetta | Eldest son | 10+ poems |
| Lucina/LUCINA/L[ucinam] | lucina | Beloved | Throughout |
| Galeacium/Deum Galeacium | galeazzo-sforza | Duke | 5+ poems |
| Franciscum Philelfum | francesco-filelfo | Humanist | 3+ poems |
| Iohannem sancti Lamberti | giovanni-san-lamberto | Bishop | Book III dedicatee |

### Persons (Secondary)

| Name Category | Examples | Count |
|--------------|----------|-------|
| Visconti family | Philippus, Gaspar, Ambrosius, Azo | 8+ |
| Simonetta family | Sigismundus, Andreas, Antonius, Lodovicus | 10+ |
| Court officials | Thomas Hesinus, Serus Florentinus | 5+ |
| Poets/Humanists | Laurentius Stroça, Titus Stroça, Baptista Plasius | 8+ |
| Clergy | Iohannes Stephanus, Iohannes Campisius | 5+ |
| Others | Lamia, Guido Torellus, various Guidones | 20+ |

### Places

| Place Name | Modern Name | Context |
|------------|-------------|---------|
| Pavia/Papiae | Pavia | Court location, colophon |
| Francisci templa | San Francesco, Pavia | First encounter (I.1) |
| Trigoli | Trigolo? | Estate (I.6) |
| Cremona | Cremona | Poet's birthplace |
| Insubrium | Lombardy | Duke's realm |
| Eridanum Ticinumque | Po and Ticino rivers | Geographic markers |

## Metrical Patterns

### Elegiac Couplets (90% of poems)
```
Hexameter:    -uu|-uu|-uu|-uu|-uu|-uu
Pentameter:   -uu|-uu|- | -uu|-uu|-
```
- Visual marker: Pentameter lines are **indented**
- Line grouping: Always paired (2-line units)

### Sapphic Stanzas (I.15, I.20, I.25, I.30, I.39, I.43, II.2, II.6, II.14, II.19, II.22, II.34, III.1, III.10, III.13, III.16, III.20, III.28, III.30, III.32, III.47)
```
3 Sapphic lines: -u|-u|-uu|-u|-u
1 Adonic line:   -uu|-u
```
- Visual marker: 4-line stanzas, 4th line indented
- Total: 21 poems

### Hendecasyllables (I.18, I.28, I.36, III.17, III.45)
```
Pattern: --|-uu|-u|-u|-u (11 syllables)
```
- Visual marker: No regular indentation
- Total: 5 poems

### Lyric/Uncertain (I.6, others)
- Complex or irregular patterns
- Require specialist metrical analysis

## Text Variants and Apparatus

### Footnote Format
```
Text: Exacta[^1] fuerant
Footnote: [^1]: exactae *C*
```

Variants found:
- [^1]: exactae *C* (I.1.3)
- [^2]: noctis *C* (I.1.3)
- [^3]: attonitaque *C* (I.1.18)
- [^4]: sopitumque *C* (I.5.4)
- [^5]: paesul *C* (I.20.32)
- [^6]: Naestores *C* (I.20.32)
- [^7]: Aedidit *C* (I.24)

*C* = Madrid Codex reading

## Special Processing Requirements

### 1. Person Name Normalization
- Remove titles: "Deum", "Comitem", "praesulem"
- Standardize spelling: "Cichum/Chiche/CICHI" → "Cicco"
- Handle variants: "Iohannem/Iohannes/Giovanni"

### 2. Direct Speech Detection
Pattern: `"([^"]+)"` 
- Mark with `<said>` tags in TEI
- Attribute speaker when identifiable

### 3. Parenthetical Text
Pattern: `\([^)]+\)`
- Mark with `<seg type="parenthesis">` in TEI

### 4. Rubric Detection
- Bold text immediately after poem header
- Multiple rubrics possible per poem
- Mark with `<head type="rubric">`

### 5. Female Voice Poems
Book III contains 4 poems with female speakers:
- III.29: Catharina ad pari Bonium (66 lines)
- III.31: Tharsia ad Iohannem Petrum de Casate (56 lines)
- III.42: Francha camilla ad Polidorum (18 lines)
- III.43: Paula ad comitem Alphonsinum (86 lines)

Mark with special attribute or note.

### 6. Genre Classification

Based on content analysis:

| Genre | Markers | Example Poems |
|-------|---------|---------------|
| erotic | Love themes, Lucina mentions | I.1, I.2, I.3, I.8 |
| epideictic | Praise, "Ad Deum" | I.9, I.15, I.21, I.30 |
| epistle | "Ad" + personal address | Most poems |
| invective | "In" + negative content | I.36, II.7, II.10, II.11 |
| epitaph | "sepulchro", death themes | II.17, III.11, III.34 |
| consolatio | Comfort, loss themes | III.10, III.19 |
| prayer | "Ad Deum", religious | III.5, III.32 |
| paraenesis | Advice, instruction | I.7, III.14 |
| propemptikon | Farewell, departure | I.19, I.35, III.40 |

### 7. Structural Markers

Key narrative points:
- **I.1**: First sight of Lucina at church
- **I.5**: Introduction of rival (Franciscus Varensis)  
- **II.37**: Erotic climax/consummation
- **III.7**: Renunciation of love for church benefice
- **III.9**: Retroactive claim of Lucina's virginity
- **III.18**: Poet laureate coronation
- **III.25**: Ordination as priest
- **III.47**: Final transformation to "custos rigidus... et sacerdos"

### 8. Line Numbering System

Generate IDs following pattern:
- Praefatio: `praef.1`, `praef.2`, etc.
- Books: `I.1.1` (Book.Poem.Line)
- Example: `I.6.44` = Book I, Poem 6, Line 44
- Line groups: `I.1.lg1`, `I.1.lg2` (for couplets/stanzas)

### 9. Critical Passages for Testing

Use these passages to validate processing:

1. **Praefatio lines 1-4**: Standard elegiac with dedication
2. **I.1 lines 1-4**: Opening with rubric, church reference
3. **I.2 line 6**: Direct speech example
4. **I.6**: Lyric meter complexity
5. **II.14**: Long wedding poem, complex structure
6. **II.37**: Erotic scene, narrative importance
7. **III.29**: Female speaker, Heroides style
8. **III.44**: Longest poem, vision narrative
9. **III.47**: Final poem, career summary

### 10. Data Validation Checks

- [ ] Total line count matches 2,224
- [ ] Poem count: Praef(1) + I(43) + II(37) + III(47) = 128
- [ ] All indented lines are even-numbered in elegiac poems
- [ ] All footnote references have corresponding footnotes
- [ ] All "Ad [Name]" dedicatees are extracted
- [ ] Female speaker poems identified (4 in Book III)
- [ ] Sapphic poems have 4-line stanza structure
- [ ] Person IDs are consistent across poems
- [ ] No duplicate poem IDs
- [ ] Colophon preserved with date