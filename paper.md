# Continuous Editorial Integration: LLM-Assisted Method for Digital Editions

## Abstract

This paper documents a method for creating digital editions where editors work directly in TEI-XML and changes are automatically published as a web edition. Large Language Models (LLMs) generate technical components. Using the example of Albrisius' "Lucina" (128 Latin poems, 15th century), the creation of a digital edition in 14 working hours is described. The Git history comprises 47 commits over two days.

## 1. Introduction

Digital editions are typically created sequentially: transcription, TEI annotation, technical implementation, web publication. This workflow requires different competencies and leads to media breaks between work steps.

The method documented here, termed Continuous Editorial Integration (CEI), enables direct work in TEI-XML with automatic web publication. Editors see changes immediately in the web edition. Technical implementations are generated through LLMs.

## 2. Method

### 2.1 Workflow

Editors work directly on TEI-XML files. Each change is versioned via Git. GitHub Actions automatically transform commits into an updated web edition. LLMs generate code for parsers, interfaces, and visualizations based on textual requirements.

### 2.2 Pattern Amplification

Validated TEI structures serve as templates for batch processes. Example: An annotated `<persName ref="#simonetta_cecilia">Ceciliae Simonettae</persName>` element is used as a pattern for further annotations. These patterns are documented in the Git history.

### 2.3 Promptotyping

The method uses iterative LLM interaction. Each LLM output can become input for subsequent processes. The work steps are documented in a Promptotyping Journal.

## 3. Case Study: Lucina Edition

### 3.1 Material

- Text corpus: 128 Latin poems (3 books: 43, 37, 47 poems)
- Source: Word document with footnotes
- Target format: TEI-XML with web interface

### 3.2 Tools Used

- LLMs: Claude Opus 4.1, Gemini 2.5 Pro, GPT-5
- Validation: Oxygen XML Editor
- Version control: Git/GitHub
- Deployment: GitHub Actions
- Programming: Python (python-docx, lxml)

### 3.3 Implementation

**Iterations 1-3 (10 hours):** Creation of TEI mapping guidelines. Programming of Word to TEI conversion. Validation of basic structure. Problems: Hallucinated geo-elements had to be removed. The standOff lists required manual positioning.

**Iteration 4 (4 hours):** Generation of web interface. Extraction of persons and places. Integration of critical apparatus from Word footnotes. Automatic metadata extraction achieved 87.6% accuracy (113 of 129 poems correct).

## 4. Documented Example: Person Annotation

### 4.1 Task

Annotation of person names in 128 poems. The Promptotyping Journal documents the following process:

### 4.2 Execution

1. Creation of a TEI pattern:
   ```xml
   <persName ref="#simonetta_cecilia">Ceciliae Simonettae</persName>
   ```

2. Validation in Oxygen XML Editor.

3. Extraction via Gemini 2.5 Pro with full text in context window. Input: Pattern, Editorial Introduction, poem text. Output: List of persons with contextual information.

4. Code generation via Claude Opus 4.1 for batch annotation. The generated Python code inserted the extracted persons into the TEI-XML.

5. Git commit of changes. GitHub Actions deployment. Web edition updated.

6. Spot check in web interface. Identification of erroneous annotations. Correction via LLM-assisted batch process.

### 4.3 Result

The annotation was completed in one working hour. Manual corrections were required for 15 of 120 persons.

## 5. Evaluation

### 5.1 Time Investment

- Total time: 14 working hours over 2 days
- TEI structuring: 10 hours
- Interface and registers: 4 hours
- Git commits: 47

### 5.2 Data Quality

The initial poem count discrepancy (145 instead of 128 poems) was identified through full-text validation. Genre and metric detection proved unreliable and was outsourced. Person extraction required manual verification.

### 5.3 Technical Issues

LLM hallucinations occurred with specific TEI elements. Distinguishing deterministic and probabilistic processes required experience. Token limits of LLMs forced segmentation of large documents.

## 6. Prerequisites

### 6.1 Competencies

- TEI/XML knowledge
- Git basics
- Prompt engineering
- Experience handling LLM outputs

### 6.2 Resources

- LLM access (currently paid)
- XML editor
- GitHub account

### 6.3 Undocumented Factors

The author has several years of experience in LLM-assisted programming. Actual API costs were not recorded. Preparation time for the Promptotyping Journal is not included in the 14 hours.

## 7. Limitations

### 7.1 Methodological Constraints

LLM outputs vary and are non-deterministic. Each output requires validation. Philological decisions cannot be automated. The method is primarily suitable for structured, repetitive tasks.

### 7.2 Practical Problems

Frontier LLMs are cost-intensive. The method is currently not replicable without specific expertise. Debugging LLM-generated code requires programming knowledge.

### 7.3 Open Questions

The long-term stability of LLM-generated code is unclear. Scalability to larger corpora was not tested. Transferability to other edition types is uncertain.

## 8. Discussion

The documented method shows a possibility for accelerating digital edition projects. Time savings result primarily from automating technical implementations. Core editorial work remains time-intensive.

Dependence on proprietary LLMs raises questions of sustainability. The method is currently tied to specific technical resources. Democratization requires open-source models to achieve comparable performance.

The Git history as a form of documentation enables traceability. Whether this form of documentation meets scholarly standards requires further discussion.

## 9. Conclusion

Continuous Editorial Integration combines established tools (Git, TEI) with LLM-assisted code generation. The Lucina edition was created in 14 working hours. The method requires specific technical competencies and resources.

Reproducibility is provided through the Promptotyping Journal and Git history, but assumes comparable expertise. The method is suitable for projects with limited resources and technically proficient editors.

Further evaluations with different text corpora and editors are needed to assess generalizability. Development of best practices and standardized workflows is pending.
