# Editorial Guidelines and TEI Mapping for the Lucina Digital Edition

## 1. Document Structure

### 1.1 Overall TEI Architecture
```xml
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <teiHeader>...</teiHeader>
  <standOff>
    <listPerson>...</listPerson>
    <listPlace>...</listPlace>
  </standOff>
  <text>
    <front>
      <div type="praefatio">...</div>
    </front>
    <body>
      <div type="book" n="1" xml:id="book1">...</div>
      <div type="book" n="2" xml:id="book2">...</div>
      <div type="book" n="3" xml:id="book3">...</div>
    </body>
  </text>
</TEI>
```

### 1.2 ID Scheme Convention
- **Books**: `book1`, `book2`, `book3`
- **Poems**: `poem-I.1`, `poem-II.37`, `poem-III.47`
- **Lines**: `I.1.1`, `II.37.15`, `III.47.8`
- **Line groups**: `I.1.lg1`, `I.1.lg2`
- **Persons**: `firstname-lastname` (lowercase, hyphenated)
- **Places**: `place-name` (lowercase, hyphenated)

## 2. Manuscript Description

### 2.1 Required Elements in msDesc
```xml
<msDesc>
  <msIdentifier>
    <country>Spain</country>
    <settlement>Madrid</settlement>
    <repository>Biblioteca Nacional</repository>
    <idno>Mss. 6028</idno>
  </msIdentifier>
  <msContents>
    <msItem>
      <author ref="#albrisius">Aurelius Laurentius Albrisius</author>
      <title>Lucina</title>
      <colophon>Finita et perfecta II Augusti MCCCCLXXIIII</colophon>
    </msItem>
  </msContents>
  <physDesc>...</physDesc>
  <history>...</history>
</msDesc>
```

## 3. Text Structure Encoding

### 3.1 Poem Structure Template
```xml
<div type="poem" n="[number]" xml:id="poem-[book].[number]" met="[meter]" ana="#[genre]">
  <head type="number">[Book], [Number]</head>
  <head type="dedication">Ad <persName ref="#[id]">[Name]</persName></head>
  <head type="rubric">[Rubric text if present]</head>
  <lg type="[meter-type]" met="[metrical-pattern]">
    <l n="[number]" xml:id="[book].[poem].[line]">[verse]</l>
    <l n="[number]" xml:id="[book].[poem].[line]">[verse]</l>
  </lg>
</div>
```

### 3.2 Metrical Patterns

| Meter Type | TEI @type | @met Pattern | Structure |
|------------|-----------|--------------|-----------|
| Elegiac couplet | `elegiac` | `-uu\|-uu\|-uu\|-uu\|-uu\|-uu \|\| -uu\|-uu\|- \| -uu\|-uu\|-` | Hexameter + Pentameter |
| Hendecasyllable | `hendecasyllabic` | `--\|-uu\|-u\|-u\|-u` | 11 syllables |
| Sapphic | `sapphic` | `-u\|-u\|-uu\|-u\|-u` | 3 Sapphic + 1 Adonic |
| Asclepiadean | `asclepiadean` | `--\|-uu\|--\|-uu\|-uu\|-u` | Various forms |

### 3.3 Line Group Structure
```xml
<!-- Elegiac couplets -->
<lg type="elegiac" met="[pattern]">
  <l n="1">Hexameter line</l>
  <l n="2">Pentameter line</l>
</lg>

<!-- Lyric stanzas -->
<lg type="sapphic">
  <l n="1">First Sapphic line</l>
  <l n="2">Second Sapphic line</l>
  <l n="3">Third Sapphic line</l>
  <l n="4">Adonic line</l>
</lg>
```

## 4. Editorial Principles

### 4.1 Transcription Rules
- **Original orthography**: Preserve manuscript spelling
- **Capitalization**: Follow manuscript usage
- **Punctuation**: Minimal normalization for comprehension
- **Line breaks**: Preserve within verse structure
- **Rubrics**: Mark with `type="rubric" rend="red"`

### 4.2 Abbreviation Handling
```xml
<choice>
  <abbr>qñ</abbr>
  <expan>qu<ex>a</ex>m</expan>
</choice>
```

### 4.3 Textual Variants
```xml
<!-- Simple variant -->
<app>
  <lem>Exacta</lem>
  <rdg wit="#M">exactae</rdg>
</app>

<!-- Editorial emendation -->
<app>
  <lem resp="#ed">emended text</lem>
  <rdg wit="#M">manuscript reading</rdg>
  <note type="editorial">Reason for emendation</note>
</app>
```

## 5. Named Entity Encoding

### 5.1 Personal Names
```xml
<!-- In text -->
<persName ref="#cicco-simonetta">Cichum Simonetam</persName>

<!-- In standOff/listPerson -->
<person xml:id="cicco-simonetta">
  <persName>
    <forename>Cicco</forename>
    <surname>Simonetta</surname>
  </persName>
  <birth notBefore="1410" notAfter="1420"/>
  <death when="1480"/>
  <occupation>Secretary to Duke Galeazzo Maria Sforza</occupation>
  <note>Primary patron, "alter Maecenas"</note>
</person>
```

### 5.2 Place Names
```xml
<!-- In text -->
<placeName ref="#pavia">Pavia</placeName>

<!-- In standOff/listPlace -->
<place xml:id="pavia">
  <placeName>Pavia</placeName>
  <note>Sforza court location</note>
</place>
```

### 5.3 Literary/Mythological References
```xml
<persName ref="#lucina" type="literary">Lucina</persName>
<name ref="#cupid" type="mythological">Cupidinis</name>
```

## 6. Apparatus and Commentary

### 6.1 Note Types and Usage
```xml
<!-- Paleographic -->
<note type="paleographic" target="#I.1.3">
  Manuscript correction from 'exactae' to 'exacta'
</note>

<!-- Literary -->
<note type="literary" target="#I.1.4">
  Window scene echoes Petrarch's first encounter with Laura
</note>

<!-- Historical -->
<note type="historical" target="#I.1.2">
  Church of San Francesco in Pavia
</note>

<!-- Prosopographical -->
<note type="prosopographical" target="#cicco-simonetta">
  See Ianziti 1988 for biography
</note>

<!-- Editorial -->
<note type="editorial">
  Metrical structure requires further analysis
</note>
```

### 6.2 Cross-References
```xml
<ref type="source" target="ovid:am.1.1.1">Cf. Ovid, Amores 1.1.1</ref>
<ref type="parallel" target="#poem-II.15">Similar theme in II.15</ref>
<ref type="person" target="#franciscus-varensis">See prosopography</ref>
```

## 7. Special Elements

### 7.1 Direct Speech
```xml
<said who="#companion" rend="quoted">
  "Ah, tantum clare poeta iaces!"
</said>
```

### 7.2 Parenthetical Text
```xml
<seg type="parenthesis">(ut polus astra)</seg>
```

### 7.3 Page/Folio Breaks
```xml
<pb n="1r" facs="#fol-001r"/>
<pb n="1v" facs="#fol-001v"/>
```

## 8. Genre Classification

### 8.1 Available Genre Values
| ID | Genre | Description |
|----|-------|-------------|
| `#epideictic` | Panegyric | Praise poetry |
| `#epitaph` | Epitaph | Funeral poetry |
| `#invective` | Invective | Attack poems |
| `#epistle` | Epistle | Verse letters |
| `#erotic` | Erotic | Love poetry |
| `#consolatio` | Consolation | Comfort poems |
| `#propemptikon` | Farewell | Departure poems |
| `#paraenesis` | Advice | Didactic poetry |
| `#prayer` | Prayer | Religious invocations |

### 8.2 Multiple Genre Assignment
```xml
<div type="poem" ana="#erotic #epistle">
```

## 9. Encoding Workflow

### 9.1 Required Elements per Poem
- [ ] Structural `@xml:id` and `@n`
- [ ] Metrical `@met` attribute
- [ ] Genre `@ana` classification
- [ ] Addressee identification with `@ref`
- [ ] Line numbering and IDs
- [ ] Indentation marking for pentameters/short lines
- [ ] Textual variants recorded

### 9.2 Quality Checks
- [ ] All `@ref` attributes resolve to declared IDs
- [ ] All persons exist in `standOff/listPerson`
- [ ] All places exist in `standOff/listPlace`
- [ ] Metrical patterns validated
- [ ] XML well-formedness verified

## 10. Specific Encoding Challenges

### 10.1 Poem I.6 (Lyric Meter)
```xml
<div type="poem" n="6" xml:id="poem-I.6" met="lyric">
  <note type="editorial">
    Metrical structure requires specialist analysis. 
    Provisionally encoded following manuscript lineation.
  </note>
  <lg type="lyric">
    <!-- Lines as they appear in manuscript -->
  </lg>
</div>
```

### 10.2 Uncertain Readings
```xml
<unclear reason="damage">text</unclear>
<gap reason="illegible" quantity="3" unit="character"/>
```

### 10.3 Editorial Additions
```xml
<supplied reason="omitted" resp="#ed">text</supplied>
```

## Appendix A: Complete Person ID List

### Primary Figures
- `albrisius` - Aurelius Laurentius Albrisius (author)
- `lucina` - Lucina (beloved, literary figure)
- `cicco-simonetta` - Cicco Simonetta (patron)
- `giovanni-simonetta` - Giovanni Simonetta (son)
- `giacomo-simonetta` - Gian Giacomo Simonetta (eldest son)

### Ecclesiastical Figures
- `giovanni-san-lamberto` - Bishop Giovanni of San Lamberto
- `giovanni-campesio` - Bishop Giovanni Campesio of Piacenza

### Court Members
- `philippus-vicecomes` - Philippus Visconti
- `franciscus-varensis` - Franciscus Varensis (rival)
- `iacobus-marnus` - Iacobus Marnus

## Appendix B: Quick Reference TEI Template

```xml
<!-- Complete poem template -->
<div type="poem" n="X" xml:id="poem-I.X" met="elegiac" ana="#erotic #epistle">
  <head type="number">I, X</head>
  <head type="dedication">Ad <persName ref="#person-id">Name</persName></head>
  <lg type="elegiac" met="-uu|-uu|-uu|-uu|-uu|-uu || -uu|-uu|- | -uu|-uu|-">
    <l n="1" xml:id="I.X.1">Hexameter verse</l>
    <l n="2" xml:id="I.X.2">Pentameter verse</l>
  </lg>
  <note type="literary" target="#I.X.1">Commentary</note>
</div>
```