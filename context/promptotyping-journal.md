Here's your corrected Promptotyping Journal:

```markdown
# Promptotyping Journal

This document documents the Promptotyping process and the decisions.

## Get Context - What a Digital Edition is?

* Used Claude Opus 4.1
* Compressed "Criteria for Reviewing Scholarly Digital Editions, version 1.1" into a digital-edition-guide.md
* Why: Because using clear definitions helps the models
* Used prompting to compress it to the information that I thought I need
* I reuse this chat now and compare this information with the description of the edition (basic information about work and author)

## Comparing digital-edition-guide.md with the Editorial Introduction ("Das Werk und der Autor")

* Consider how this step relates to the 'Framework for Scholarly Digital Editions' and analyse it step by step
* Prompt: "Write a compact editorial introduction to the edition and include all the necessary information! Write it in such a way that I can publish it as a webpage from this Markdown file."
* editorial-introduction.md
* This is context about the edition --> we need that to create requirements specifications

## Creating the Editorial Guidelines

* Analyze the plain text with the context of edition and editorial introduction and create the mapping to TEI
* This needs expert knowledge also for the TEI standards and validation
* editorial-guidelines-tei-mapping.md
* Comparison of all .md files so far with the original source text
* Still iterations --> focus on the first page, with image information
* "ignore: Decorative Elements" to focus on a specific area, not tackle everything at once
* I used my expert knowledge and Oxygen for checking if the TEI is valid
* Claude used @met and type of the encoding for the metric of the poems
* I removed rend="indent" --> this was coming from the Word export (I think it is not relevant --> removing is important as you always want to "save tokens")
* Valid TEI on the first try
* Hallucinations can still be a thing; but for now this is not yet important as we need it only to describe the data and the TEI mapping
* What did I learn?
* Going with learning and valid TEI XML (and removing the rend indent) to the top of the conversation and recycle the context I had before (no need to do that, you can also start a new conversation; but so I am faster, context recycling)
* Write the full TEI XML and ignore some not relevant parts like 11. Display and Processing Instructions, 12. Quality Assurance, 13. Future Development
* Generate complete TEI XML, validate again in Oxygen! Consciously first only body and then with TEI header (keep focus on topics!)
* Now with the full TEI XML I had some TEI problems
* But I removed the geo as this is hallucinated
* And I put all lists into standOff → this is okay for Claude to fail, because this is often in real TEI not correct → but that is really an example of "if you are an expert in TEI no problem. Only to create manually standOff and put it there → now it is valid."
* Bring all information from all conversations together and merge them into a single GitHub commit. Now we have documented everything we did. Keeping stable versions is very important!

## .docx to first TEI xml via python

* In the git are all .md files we have; we dont give it the full tei xml or the full edition trasnctipt as this are much too much tokens for the xcontext windwo
* and we explcitly do not write code directly, but we want to create a plan; and we are not doing everything; we start with a frist simple tei xml; as we would do when we would code it manually
* Let claude now that you are doing promptotyping; it is so meta aware that this works; that is mosething that did not work a year ago: you muc more lied to the model; no you can just say !ah you are an llm and you simulate the project --> tis comes from the Promptotyping Journal --> so maybe this is a good way of prompting this!
* Docx→TEI Conversion Plan for Albrisius’s Lucina
  * Status & Foundations: TEI mapping guidelines; sample TEI (poems 1–6); encoding principles; Oxygen-based validation.
  * Corpus & Structure: 128 poems in 3 books (43/37/47); hierarchy Praefatio → Books I–III → poems → line groups → lines; rich metadata (dedicatees, meter, genre); 50+ named individuals; multi-layer annotations.
  * Objective: Python script to convert Edition.docx into valid TEI XML.
  * Phased Workflow: (1) Analyze docx (poem boundaries, metadata marks, line numbering, variants). (2) Build minimal TEI scaffold (teiHeader, standOff, front, body). (3) Add poems, lines, entities, apparatus, metrical patterns. (4) Validate schema, IDs, meters in Oxygen.
  * Technical Stack: python-docx, lxml; pattern matching; deterministic ID conventions; iterative validation.
  * Architecture Sketch: LucinaProcessor with create_tei_skeleton, extract_poems, generate_poem_id, process_line_groups, extract_named_entities.
  * Open Points: Sample formatting of Edition.docx; variant notation; initial scope (structure-only vs apparatus; Book I POC); person/place sources; metrical detection (auto vs lookup).
* Uploaded entire Word document
* docx-to-tei-xml.py, but not yet executed, because you need a rough overview of what it does
* docx-data.md --> now we have the exact structure
* I asked what python-docx exactly does and asked again whether it can process all structures
* I then have the Python script written with compact logging, create only body (to save output token) (we can feed that bacl to claude!)


