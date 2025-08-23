# Digital Edition of Aurelius Laurentius Albrisius's Lucina [THIS IS A HIGHLY EXPERIMENTAL REPOSITORY OF AN EXTREMELY HEAVILY LLM-SUPPORTED DIGITAL EDITION!!!]

Learn more about the experiment in paper.md!

[![Live Edition](https://img.shields.io/badge/Live%20Edition-View%20Online-blue)](https://chpollin.github.io/diged-neolat/edition-4/web/)
[![TEI](https://img.shields.io/badge/TEI-P5%20Compliant-green)](http://www.tei-c.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## 🌟 Overview

This repository contains a comprehensive digital scholarly edition of **Madrid BN Mss. 6028**, a rare 15th-century illuminated manuscript containing 128 Latin elegiac poems by **Aurelius Laurentius Albrisius**. The manuscript, completed in Pavia on August 2, 1474, represents a significant example of Renaissance humanist poetry from the Sforza court in Milan.

The digital edition makes this previously inaccessible manuscript available through a modern web interface with synchronized text and facsimile images, comprehensive scholarly apparatus, and advanced search capabilities.

### 🎯 Key Features

- **📖 Complete Transcription**: 2,224 verses of Latin elegiac poetry fully transcribed and encoded
- **🖼️ Manuscript Facsimiles**: 120+ high-resolution images with automatic text-image synchronization
- **🔍 Advanced Search**: Full-text search with highlighting and navigation
- **👥 Prosopographical Database**: 106 historical persons, 57 places, 109+ relationships
- **📊 Scholarly Apparatus**: TEI P5 compliant encoding with critical notes
- **🔗 Cross-References**: Clickable links between index entries and text occurrences
- **📱 Responsive Design**: Professional academic interface optimized for all devices

## 🚀 Quick Start

### View the Live Edition

Visit the live digital edition at: **https://chpollin.github.io/diged-neolat/edition-4/web/**

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/chpollin/diged-neolat.git
cd diged-neolat
```

2. Navigate to the current edition:
```bash
cd docs/edition-4/web
```

3. Start a local server:
```bash
python -m http.server 8000
# Or use any static file server
```

4. Open in browser:
```
http://localhost:8000
```

## 📂 Repository Structure

```
diged-neolat/
├── context/                    # Project documentation and methodology
│   ├── promptotyping-journal.md    # AI-assisted development process
│   ├── editorial-introduction.md   # Scholarly introduction
│   └── editorial-guidelines-tei-mapping.md  # TEI encoding standards
│
├── docs/
│   ├── edition-1/             # Initial proof-of-concept
│   ├── edition-2/             # Enhanced with page synchronization
│   ├── edition-3/             # Architectural refinement
│   ├── edition-4/             # ⭐ Current production version
│   │   └── web/
│   │       ├── index.html          # Main edition interface
│   │       ├── indices.html        # Comprehensive index system
│   │       ├── about.html          # Project information
│   │       ├── editorial.html      # Editorial guidelines
│   │       ├── tei-final-3-2.xml   # TEI encoded text
│   │       └── llm-extracted-data/ # AI-enhanced annotations
│   │
│   └── facsimiles/           # Complete manuscript digitization
│       └── [120+ JPG images]       # High-resolution page scans
```

## 📖 About the Manuscript

### The Author
**Aurelius Laurentius Albrisius** (ca. 1440-1445 – after 1474)
- Cremonese poet crowned laureate by Emperor Frederick III (1468/69)
- Priest and tutor to the sons of Cicco Simonetta
- Member of the Sforza court's humanist circle in Milan
- Writing in the Neo-Latin elegiac tradition, influenced by Ovid

### The Manuscript
- **Location**: Biblioteca Nacional Madrid, Mss. 6028
- **Date**: Completed August 2, 1474 in Pavia
- **Material**: 176 parchment folios (220×145mm)
- **Script**: Humanistic hand with illuminated initials
- **Content**: 128 poems divided into three books

### Content Structure
```
Lucina (Complete Work)
├── Praefatio (18 lines) - Dedication to Cicco Simonetta
├── Book I (47 poems) - Love elegies featuring Lucina
├── Book II (37 poems) - Occasional poetry and court pieces
└── Book III (44 poems) - Religious and philosophical works
```

## 🔧 Technical Implementation

### Architecture
- **Frontend**: Single-page application with vanilla JavaScript (ES6)
- **Data Format**: TEI P5 XML with full scholarly encoding
- **Hosting**: GitHub Pages (static deployment)
- **Dependencies**: None - fully self-contained

### Core Technologies
```javascript
// Key Features Implementation
- Text-Image Sync: Intersection Observer API
- Search: Real-time DOM traversal with highlighting
- Navigation: Hash-based routing with deep linking
- Performance: <2s load time, 60fps scroll sync
```

### TEI Encoding
The edition follows TEI P5 guidelines with:
- Complete manuscript description (`<msDesc>`)
- Prosopographical data (`<listPerson>`, `<listPlace>`)
- Relationship networks (`<listRelation>`)
- Line-by-line encoding with page breaks
- Critical apparatus structure

## 🧪 Testing

The project includes comprehensive testing tools:

```bash
# Run tests in browser console

# Quick diagnostic
copy(quickTest.js content to console)

# Full test suite
copy(test-suite.js content to console)

# Navigation testing
copy(test-navigation.js content to console)
```

Test coverage includes:
- Data extraction validation
- UI component functionality
- Cross-reference navigation
- Performance metrics
- 90%+ success rate on all tests

## 🤖 AI-Assisted Development

This project pioneers the use of "promptotyping" - iterative development with AI assistance:

### Methodology
1. **Context Building**: Digital edition standards and best practices
2. **Iterative Development**: 4 progressive edition versions
3. **Data Enhancement**: LLM extraction of metrical patterns and relationships
4. **Quality Assurance**: AI-generated testing frameworks
5. **Documentation**: Comprehensive development journal

### AI Models Used
- **Claude Opus 4.1**: Interface development and TEI encoding
- **GPT-5 Pro**: Data corrections and enhancements
- **Gemini 2.5**: Large-scale text processing and metrical analysis

### Key Innovations
- Automated prosopographical extraction
- Metrical pattern analysis
- Relationship network mapping
- Cross-reference generation

## 📊 Data Statistics

### Content Scale
- **2,224** verses of Latin poetry
- **128** individual compositions
- **106** identified historical persons
- **57** geographical locations
- **109+** documented relationships
- **120+** manuscript page images

### Performance Metrics
- Initial load: ~1-2 seconds
- Search response: <100ms
- Image sync: Real-time (60fps)
- Memory usage: ~50MB fully loaded

## 🎯 Use Cases

### For Scholars
- Access to rare manuscript material
- Comprehensive prosopographical data
- Cross-referenced scholarly apparatus
- TEI data for computational analysis

### For Students
- Introduction to Renaissance Latin poetry
- Historical context of the Sforza court
- Example of humanist literary culture
- Digital humanities methodology

### For Developers
- Reference implementation of digital edition
- TEI processing examples
- Text-image synchronization techniques
- AI-assisted development patterns

## 🚧 Roadmap

### Current Features (v4.0) ✅
- Complete transcription and encoding
- Full manuscript digitization
- Text-image synchronization
- Comprehensive index system
- Cross-reference navigation

### Planned Enhancements
- [ ] English translation integration
- [ ] Commentary system implementation
- [ ] Enhanced critical apparatus display
- [ ] Export capabilities (PDF, citations)
- [ ] IIIF manifest generation
- [ ] API endpoints for data access

### Development Process
```bash
# Fork the repository
# Create feature branch
git checkout -b feature/enhancement

# Make changes and test
# Commit with descriptive message
git commit -m "feat: Add enhancement description"

# Submit pull request
```
