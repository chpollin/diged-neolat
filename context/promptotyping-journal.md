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
* bring all information from all conversatiosn together and merge them into a single github commit. now we have documented everythign we did. keeping stable version sis very imporant!