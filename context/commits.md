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