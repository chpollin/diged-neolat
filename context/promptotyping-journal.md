# Promptotyping Journal

This document documents the Promptotyping process and the decisions.

## Promptotyping Iteration 1

### Get Context - What a Digital Edition is?

* Used Claude Opus 4.1
* Compressed "Criteria for Reviewing Scholarly Digital Editions, version 1.1" into a digital-edition-guide.md
* Why: Because using clear definitions helps the models understand the task requirements better
* Used prompting to compress it to the information that I thought I needed
* I reuse this chat now and compare this information with the description of the edition (basic information about work and author)

### Comparing digital-edition-guide.md with the Editorial Introduction ("Das Werk und der Autor")

* Consider how this step relates to the 'Framework for Scholarly Digital Editions' and analyse it step by step
* Prompt: "Write a compact editorial introduction to the edition and include all the necessary information! Write it in such a way that I can publish it as a webpage from this Markdown file."
* Output: editorial-introduction.md
* This is context about the edition --> we need that to create requirements specifications

### Creating the Editorial Guidelines

* Analyze the plain text with the context of edition and editorial introduction and create the mapping to TEI
* This needs expert knowledge also for the TEI standards and validation
* Output: editorial-guidelines-tei-mapping.md
* Comparison of all .md files so far with the original source text
* Still iterations --> focus on the first page, with image information
* Added "ignore: Decorative Elements" to focus on a specific area, not tackle everything at once
* I used my expert knowledge and Oxygen XML Editor for checking if the TEI is valid
* Claude used @met and type attributes for the encoding of the metric patterns of the poems
* I removed rend="indent" --> this was coming from the Word export (I think it is not relevant --> removing is important as you always want to save tokens)
* Valid TEI on the first try
* Hallucinations can still be a thing; but for now this is not yet important as we need it only to describe the data and the TEI mapping
* What did I learn?
* Going with learning and valid TEI XML (and removing the rend indent) to the top of the conversation and recycle the context I had before (no need to do that, you can also start a new conversation; but so I am faster, context recycling)
* Write the full TEI XML and ignore some not relevant parts like 11. Display and Processing Instructions, 12. Quality Assurance, 13. Future Development
* Generate complete TEI XML, validate again in Oxygen! Consciously first only body and then with TEI header (keep focus on topics!)
* Now with the full TEI XML I had some TEI validation problems
* But I removed the geo element as this is hallucinated
* And I put all lists into standOff → this is okay for Claude to fail, because this is often in real TEI not correctly placed → but that is really an example of "if you are an expert in TEI no problem. Only to create manually standOff and put it there → now it is valid."
* Bring all information from all conversations together and merge them into a single GitHub commit. Now we have documented everything we did. Keeping stable versions is very important!

### .docx to first TEI xml via python

* In the git are all .md files we have; we don't give it the full TEI XML or the full edition transcript as these are much too many tokens for the context window
* And we explicitly do not write code directly, but we want to create a plan; and we are not doing everything; we start with a first simple TEI XML; as we would do when we would code it manually
* Let Claude know that you are doing promptotyping; it is so meta-aware that this works; that is something that did not work a year ago: you much more lied to the model; now you can just say "ah you are an LLM and you simulate the project" --> this comes from the Promptotyping Journal --> so maybe this is a good way of prompting this!
* Docx→TEI Conversion Plan for Albrisius's Lucina
  * Status & Foundations: TEI mapping guidelines; sample TEI (poems 1–6); encoding principles; Oxygen-based validation.
  * Corpus & Structure: 128 poems in 3 books (43/37/47); hierarchy Praefatio → Books I–III → poems → line groups → lines; rich metadata (dedicatees, meter, genre); 50+ named individuals; multi-layer annotations.
  * Objective: Python script to convert Edition.docx into valid TEI XML.
  * Phased Workflow: (1) Analyze docx (poem boundaries, metadata marks, line numbering, variants). (2) Build minimal TEI scaffold (teiHeader, standOff, front, body). (3) Add poems, lines, entities, apparatus, metrical patterns. (4) Validate schema, IDs, meters in Oxygen.
  * Technical Stack: python-docx, lxml; pattern matching; deterministic ID conventions; iterative validation.
  * Architecture Sketch: LucinaProcessor with create_tei_skeleton, extract_poems, generate_poem_id, process_line_groups, extract_named_entities.
  * Open Points: Sample formatting of Edition.docx; variant notation; initial scope (structure-only vs apparatus; Book I POC); person/place sources; metrical detection (auto vs lookup).
* Uploaded entire Word document
* Output: docx-to-tei-xml.py, but not yet executed, because you need a rough overview of what it does
* Created docx-data.md --> now we have the exact structure
* I asked what python-docx exactly does and asked again whether it can process all structures
* I then had the Python script written with compact logging, create only body (to save output tokens) (we can feed that back to Claude!)
* A few iterations with the Python script and the logs. The result of this iteration is in the final folder and is called tei-final-1.xml. This is our first, still very rough and probably flawed TEI XML version.

### Preparing the images

* From PDF
* Used GPT-5, where I uploaded the PDF and said it should create a .zip with all images
* Then I said cut them in half, like the right and the left pages
* Finally I said give me all `<pb facs="{filename}" n="{number sequence}"/>` return all `<pb facs="{filename}" n="{number sequence}"/>` for every image in a .xml
* Adding images to the TEI needs to be done manually I guess; I did it for some entries; I tried ChatGPT agents, but that is a very complicated task for AI.

### Edition 1

* With the first TEI XML and the images prepared, I started to create the first version of the edition. I switched to Gemini 2.5 Pro to write the Python script to create the index.html from the TEI XML, as Gemini 2.5 Pro with its large context window can handle the full TEI XML.
* I let Gemini 2.5 Pro first create a plan and also added all context .md files to provide comprehensive background information.
* I was very explicit with all path information to ensure the script would correctly locate and process files; also keeping it simple at this stage!
* ~5 iterations with the Python script were needed to create the static index.html that properly rendered the edition.
* Some tips for the first prototyping iteration: This iteration can be used as a starting point for the next one.

## Promptotyping Iteration 2

* The analysis file is called analysis-tei-1.py and the input is tei-final-1.xml. I want to further find out what we can all do deterministically to improve the TEI XML. This is also a validation step.
* Then created a Python script from this to generate TEI 2 from TEI 1
* Then I had the TEI XML analyzed and asked what we can learn about the data --> put this into a DATA.md, then checked again with the .docx for cross-validation
* All results condensed into a DATA.md
* Then I developed another enhanced view with Claude Opus 4.1 after a few iterations

## Promptotyping Iteration 3

### Errors in the data after processing and iteration over the Edition 1 docx to TEI.

* I saw that `<head type="rubric">Scribere Lucinae pauca coegit amor.</head>` was incorrectly loaded from Word and corrected it in both TEI XML and plain text
* In doing so, I made sure once again that the Python script only does things that it can really handle 100% reliably (don't use regex or similar approaches)
* Now I have a simpler TEI; so you shouldn't be fooled by a Python script either: always ask: and can you really do everything 100% deterministically? Only do what you can handle deterministically --> because it's important that we can build a stable workflow
* ✗ ~21 poems with non-'Ad' patterns need manual review. Is it possible that we can fix that with Python too? --> That sounds to me like we could also do this with Python --> so I'll have Claude Opus 4.1 work out a plan.
* Use Gemini 2.5 to check the entire text with the plan; I'll then give the analysis report on whether this approach works back to Opus Claude
* A few iterations with Opus and Gemini and I have a "Success Rate: 87.6% (127/145 poems)" --> Gemini has the entire text in the context window, so it knows more about the source and Opus focuses on the coding --> Gemini finds out that there are actually 128 poems! So you really have to be careful and always check values, or know your data, or build in verification workflows!
* stichproben artig kontrolliert und tei xml ist valide --> das ist tei-final-3-0.xml
* Removes unreliable auto-detection of genre, metrics, and rubrics --> da musste ich sogar nochmal genauer schauen; also opus versucht sehr gerne zu viel zu machen; das hätte ich am anfang schon besser prompten müssen was ich genau haben will (ich hatte habe vibe coding gemach tund habe so die daten kennen gelernt)
* genre und reimerkennug klann ich dann mit einem llm machen (todo!)
* und noch ein bisste iteration und kontrolle bis ich ein stabiles tei xml habe ..-> tei-final-3-1.xml
* hier woltle ich jetzt die pb manuall einfügen hatte aber noch eine idee für einen prompt für dei chatgpt agents --> sie können es nciht direkt einfügen, aber sie können mir den ersten satz vl geben und das jeweilige pb, damit ich dann immer nur copy paste suche nach dem ersten satz und dann das pb einfügebn kann (und ich kann es auch gleich überpüfen) --> ziel ist ein wirklich solides tei xml + pb für die erste gute und korrekte ansicht (während die agents arbeiten habe ich maisl beantwortet und kaffe gemacht)
* it did not work in the first try
* the secodn try was okay, but also not really. only telling you nes page --> new poem. 

### UI Design

* Now I take the simple edition-2 web prototype with a screenshot to Claude Opus 4 and develop the UI together, throwing in what I want and removing what I don't want
* Then I add the context .md files and iterate to produce a DESIGN.md
* Reduce/refine the DESIGN.md again
* Generate the design.md and cross-check it with the data --> snippet of the data and TEI header
* Developed the interface as a prototype with GPT-5 Pro and Gemini 2.5 Pro and Opus (in a new chat!). Just simple index.html and style.css
* Then gave the finished DESIGN.md to edition 3; we will then combine all insights from edition-2 with the better data and the refined UI, along with the generalizations, and create the next promptotype

* edition 3

* aus den vorhadnen contexten design und daten iterativ eienn system prompt gebaut, und mit diesem systme prompt dann mit claude code Opus 4.1 gearbeitet.
* feedback gegeben; bilder und text weurden angezeigt
* cladue code can direkt dei commits ausführen und arbeitenm hintergrund; das ist wieder ein ganz anders arbeiten, da muss man allgemein mitdenkenund claude code guiden. es erzeugt alel files immer selber. funktionerit erschreckend gut