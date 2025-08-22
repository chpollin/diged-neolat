# Promptotyping Journal

This document records the Promptotyping process and the decisions.

## Promptotyping Iteration 1

### Get Context – What is a Digital Edition?

* Used Claude Opus 4.1.
* Compressed "Criteria for Reviewing Scholarly Digital Editions, version 1.1" into digital-edition-guide.md.
* Why: Because using clear definitions helps the models understand the task requirements better.
* Used prompting to compress it to the information that I thought I needed.
* I now reuse this chat and compare this information with the description of the edition (basic information about the work and the author).

### Comparing digital-edition-guide.md with the Editorial Introduction ("Das Werk und der Autor")

* Consider how this step relates to the "Framework for Scholarly Digital Editions" and analyze it step by step.
* Prompt: "Write a compact editorial introduction to the edition and include all the necessary information! Write it in such a way that I can publish it as a webpage from this Markdown file."
* Output: editorial-introduction.md.
* This is context about the edition → we need that to create requirements specifications.

### Creating the Editorial Guidelines

* Analyze the plain text with the context of the edition and the editorial introduction and create the mapping to TEI.
* This also requires expert knowledge of the TEI standards and validation.
* Output: editorial-guidelines-tei-mapping.md.
* Comparison of all .md files so far with the original source text.
* Still iterating → focus on the first page, with image information.
* Added "ignore: Decorative Elements" to focus on a specific area, not tackle everything at once.
* I used my expert knowledge and Oxygen XML Editor to check whether the TEI is valid.
* Claude used @met and type attributes for encoding the metrical patterns of the poems.
* I removed rend="indent" → this came from the Word export (I think it is not relevant → removing is important as you always want to save tokens).
* Valid TEI on the first try.
* Hallucinations can still be a thing; but for now this is not yet important as we need it only to describe the data and the TEI mapping.
* What did I learn?
* Take the learnings and valid TEI XML (and removing the rend indent) to the top of the conversation and recycle the context I had before (no need to do that; you can also start a new conversation, but this way I am faster—context recycling).
* Write the full TEI XML and ignore some not-relevant parts like 11. Display and Processing Instructions, 12. Quality Assurance, 13. Future Development.
* Generate complete TEI XML, validate again in Oxygen! Consciously first only body and then with TEI header (keep focus on topics!).
* Now with the full TEI XML I had some TEI validation problems.
* But I removed the geo element as this was hallucinated.
* And I put all lists into standOff → this is okay for Claude to fail, because this is often not correctly placed in real TEI → but that is really an example of "if you are an expert in TEI, no problem. Only create standOff manually and put it there → now it is valid."
* Bring all information from all conversations together and merge them into a single GitHub commit. Now we have documented everything we did. Keeping stable versions is very important!

### .docx to first TEI XML via Python

* In git are all the .md files we have; we don't give it the full TEI XML or the full edition transcript, as these are far too many tokens for the context window.
* And we explicitly do not write code directly, but we want to create a plan; and we are not doing everything—we start with a first simple TEI XML, as we would do when coding it manually.
* Let Claude know that you are doing promptotyping; it is so meta-aware that this works. That is something that did not work a year ago: you would much more often lie to the model; now you can just say, "Ah, you are an LLM and you simulate the project" → this comes from the Promptotyping Journal → so maybe this is a good way of prompting this!
* Docx→TEI Conversion Plan for Albrisius's *Lucina*
  * Status & Foundations: TEI mapping guidelines; sample TEI (poems 1–6); encoding principles; Oxygen-based validation.
  * Corpus & Structure: 128 poems in 3 books (43/37/47); hierarchy Praefatio → Books I–III → poems → line groups → lines; rich metadata (dedicatees, meter, genre); 50+ named individuals; multi-layer annotations.
  * Objective: Python script to convert Edition.docx into valid TEI XML.
  * Phased Workflow: (1) Analyze .docx (poem boundaries, metadata marks, line numbering, variants). (2) Build minimal TEI scaffold (teiHeader, standOff, front, body). (3) Add poems, lines, entities, apparatus, metrical patterns. (4) Validate schema, IDs, meters in Oxygen.
  * Technical Stack: python-docx, lxml; pattern matching; deterministic ID conventions; iterative validation.
  * Architecture Sketch: LucinaProcessor with create_tei_skeleton, extract_poems, generate_poem_id, process_line_groups, extract_named_entities.
  * Open Points: Sample formatting of Edition.docx; variant notation; initial scope (structure-only vs apparatus; Book I POC); person/place sources; metrical detection (auto vs lookup).
* Uploaded the entire Word document.
* Output: docx-to-tei-xml.py, but not yet executed, because you need a rough overview of what it does.
* Created docx-data.md → now we have the exact structure.
* I asked what python-docx exactly does and asked again whether it can process all structures.
* I then had the Python script written with compact logging, creating only the body (to save output tokens) (we can feed that back to Claude!).
* A few iterations with the Python script and the logs. The result of this iteration is in the final folder and is called tei-final-1.xml. This is our first, still very rough and probably flawed TEI XML version.

### Preparing the images

* From PDF.
* Used GPT-5, where I uploaded the PDF and asked it to create a .zip with all images.
* Then I said to cut them in half, like the right and the left pages.
* Finally I said: give me all `<pb facs="{filename}" n="{number sequence}"/>`; return all `<pb facs="{filename}" n="{number sequence}"/>` for every image in an .xml.
* Adding images to the TEI needs to be done manually, I guess; I did it for some entries. I tried ChatGPT agents, but that is a very complicated task for AI.

### Edition 1

* With the first TEI XML and the images prepared, I started to create the first version of the edition. I switched to Gemini 2.5 Pro to write the Python script to create index.html from the TEI XML, as Gemini 2.5 Pro with its large context window can handle the full TEI XML.
* I let Gemini 2.5 Pro first create a plan and also added all context .md files to provide comprehensive background information.
* I was very explicit with all path information to ensure the script would correctly locate and process files, while keeping it simple at this stage!
* ~5 iterations with the Python script were needed to create the static index.html that properly rendered the edition.
* Some tips for the first prototyping iteration: this iteration can be used as a starting point for the next one.

## Promptotyping Iteration 2

* The analysis file is called analysis-tei-1.py and the input is tei-final-1.xml. I want to further determine what we can do deterministically to improve the TEI XML. This is also a validation step.
* Then created a Python script from this to generate TEI 2 from TEI 1.
* Then I had the TEI XML analyzed and asked what we can learn about the data → put this into a DATA.md, then checked again with the .docx for cross-validation.
* All results condensed into a DATA.md.
* Then I developed another enhanced view with Claude Opus 4.1 after a few iterations.

## Promptotyping Iteration 3

### Errors in the data after processing and iterating over the Edition 1 .docx to TEI

* I saw that `<head type="rubric">Scribere Lucinae pauca coegit amor.</head>` was incorrectly loaded from Word and corrected it in both TEI XML and plain text.
* In doing so, I made sure once again that the Python script only does things that it can really handle 100% reliably (don't use regex or similar approaches).
* Now I have a simpler TEI; so you shouldn't be fooled by a Python script either: always ask, can you really do everything 100% deterministically? Only do what you can handle deterministically → because it's important that we can build a stable workflow.
* ✗ ~21 poems with non-"Ad" patterns need manual review. Is it possible that we can fix that with Python too? → That sounds to me like we could also do this with Python → so I'll have Claude Opus 4.1 work out a plan.
* Use Gemini 2.5 to check the entire text with the plan; I'll then give the analysis report on whether this approach works back to Claude Opus.
* A few iterations with Opus and Gemini and I have a "Success Rate: 87.6% (127/145 poems)" → Gemini has the entire text in the context window, so it knows more about the source, and Opus focuses on the coding → Gemini discovers that there are actually 128 poems! So you really have to be careful and always check values, or know your data, or build verification workflows!
* Spot-checked, and the TEI XML is valid → this is tei-final-3-0.xml.
* Removed unreliable auto-detection of genre, metrics, and rubrics → I even had to look more closely; Opus tends to try to do too much; I should have prompted better at the beginning about exactly what I wanted (I did vibe coding and got to know the data that way).
* I can then do genre and rhyme detection with an LLM (to-do!).
* And a bit more iteration and checking until I have a stable TEI XML → tei-final-3-1.xml.
* Here I wanted to insert the pb manually, but I had another idea for a prompt for the ChatGPT agents → they cannot insert it directly, but they can perhaps give me the first sentence and the respective pb, so that I only have to copy-paste: search for the first sentence and then insert the pb (and I can verify it right away) → the goal is a really solid TEI XML + pb for the first good and correct view (while the agents worked, I answered emails and made coffee).
* It did not work on the first try.
* The second try was okay, but also not really—only telling you "next page" → new poem.

### UI Design

* Now I take the simple edition-2 web prototype with a screenshot to Claude Opus 4 and develop the UI together, adding what I want and removing what I don't want.
* Then I add the context .md files and iterate to produce a DESIGN.md.
* Reduce/refine the DESIGN.md again.
* Generate the design.md and cross-check it with the data → snippet of the data and TEI header.
* Developed the interface as a prototype with GPT-5 Pro and Gemini 2.5 Pro and Opus (in a new chat!). Just simple index.html and style.css.
* Then gave the finished DESIGN.md to edition 3; we will then combine all insights from edition-2 with the better data and the refined UI, along with the generalizations, and create the next promptotype.

* edition 3

* From the existing contexts—design and data—I iteratively built a system prompt, and with this system prompt I then worked with Claude Code (Opus 4.1).
* Gave feedback; images and text were displayed.
* Claude Code can execute commits directly and work in the background; this is again a very different way of working—you have to think along in general and guide Claude Code. It always creates all files itself. Works frighteningly well.
* I only reported and wrote down errors.

# edition 4

* Copy of edition 3, because that was a nice state.
* Now my goal is to include the footnotes from the Word document.
* With a Python script and Claude Opus, pulled the footnotes from Word and attached them to the existing TEI XML; that is, split into several substeps (we can).
* I forgot to document a few things; I worked with Claude Code.

## teiHeader

* I merged the existing descriptions once again and checked whether everything is correct. Then I started again with the already existing partial header. It was important that you be honest, Claude. List everything you invented. That’s how you get to better results.
* Opus made only one validation error when generating the new teiHeader.
* I am now inserting the teiHeader into the interface!
* That works very smoothly with Claude Code.

## index

1. **Extracted ~120 named persons** from the Latin poetry text "Lucina" by Aurelius Laurentius Albrisius

2. **Created TEI XML structure** with:
   - `<person xml:id="">` for each individual
   - `<persName>` with forename/surname/addName
   - `<occupation>` where known
   - `<note>` for biographical details
   - `<listRef>` with `<ref target="">` for each poem appearance

3. **Organized persons into categories**:
   - Author (1)
   - Primary patron (1) 
   - Sforza dynasty (2)
   - Simonetta family (9)
   - Visconti family (5)
   - Church officials (3)
   - Humanists/poets (10)
   - Nobility/counts (6)
   - Lamia family (2)
   - Other officials/nobles (~40)
   - Antagonists/criticized (6)
   - Deceased persons (3)
   - Literary/fictional women (10)
   - Additional minor characters (~20)

4. **Tracked appearances** using poem references (e.g., I,10 = Book 1, Poem 10)

5. **Distinguished** between:
   - Historical persons (real people from 15th century Milan)
   - Literary personas (women in love poems)
   - Deceased persons (in sepulchral poems)

6. **Used Latin and Italian name forms** as they appear in the text

