#!/usr/bin/env python3
"""
Lucina Web Edition Generator
Creates a modern, responsive web interface from the processed TEI data
"""

import json
import logging
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any
import re

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('web_generation.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('WebEditionGenerator')


class WebEditionGenerator:
    """Generate modern web interface for Lucina digital edition"""
    
    def __init__(self, json_data_path: str, output_dir: str):
        """Initialize with processed JSON data"""
        self.json_path = Path(json_data_path)
        self.output_dir = Path(output_dir)
        
        logger.info("Initializing Web Edition Generator")
        logger.info(f"Data source: {self.json_path}")
        logger.info(f"Output directory: {self.output_dir}")
        
        # Ensure output directory exists
        self.output_dir.mkdir(exist_ok=True)
        
        # Load processed data
        self._load_data()
        
    def _load_data(self):
        """Load processed JSON data"""
        try:
            logger.info("Loading processed data...")
            with open(self.json_path, 'r', encoding='utf-8') as f:
                self.data = json.load(f)
            
            logger.info(f"Data loaded successfully")
            logger.info(f"  Poems: {len(self.data.get('poems', {}))}")
            logger.info(f"  Persons: {len(self.data.get('persons', {}))}")
            logger.info(f"  Books: {len(self.data.get('books', {}))}")
            
        except Exception as e:
            logger.error(f"Failed to load data: {e}")
            raise
    
    def generate_all(self):
        """Generate complete web edition"""
        logger.info("Starting web edition generation...")
        
        try:
            # Generate main HTML
            self._generate_index_html()
            
            # Generate CSS
            self._generate_css()
            
            # Generate JavaScript
            self._generate_javascript()
            
            # Generate data files
            self._generate_data_files()
            
            logger.info("Web edition generation completed successfully!")
            
        except Exception as e:
            logger.error(f"Generation failed: {e}")
            raise
    
    def _generate_index_html(self):
        """Generate main HTML file"""
        logger.info("Generating index.html...")
        
        # Extract metadata
        metadata = self.data.get('metadata', {})
        manuscript = self.data.get('manuscript', {})
        stats = self.data.get('statistics', {})
        
        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Digital edition of Aurelius Laurentius Albrisius's Lucina (1474) - 128 Latin occasional poems from the Sforza court">
    <meta name="author" content="Aurelius Laurentius Albrisius">
    
    <title>Lucina: A Digital Edition</title>
    
    <link rel="stylesheet" href="styles.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
</head>
<body>
    <!-- Header -->
    <header class="site-header">
        <div class="header-content">
            <h1 class="site-title">Lucina</h1>
            <p class="site-subtitle">A Digital Edition of 128 Latin Occasional Poems</p>
            <p class="site-author">Aurelius Laurentius Albrisius · 1474</p>
        </div>
        
        <nav class="main-nav">
            <button class="nav-btn active" data-view="reading">Reading View</button>
            <button class="nav-btn" data-view="manuscript">Manuscript</button>
            <button class="nav-btn" data-view="network">Network</button>
            <button class="nav-btn" data-view="search">Search</button>
            <button class="nav-btn" data-view="about">About</button>
        </nav>
    </header>
    
    <!-- Main Container -->
    <div class="main-container">
        <!-- Sidebar -->
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <h2>Contents</h2>
                <button class="sidebar-toggle" id="sidebarToggle">◀</button>
            </div>
            
            <div class="sidebar-content">
                <!-- Search Box -->
                <div class="search-box">
                    <input type="text" id="searchInput" placeholder="Search poems, persons, lines...">
                </div>
                
                <!-- Filter Options -->
                <div class="filter-section">
                    <h3>Filter by</h3>
                    <select id="meterFilter" class="filter-select">
                        <option value="">All meters</option>
                        <option value="elegiac">Elegiac (66)</option>
                        <option value="hendecasyllabic">Hendecasyllabic (60)</option>
                        <option value="sapphic">Sapphic (1)</option>
                    </select>
                    
                    <select id="genreFilter" class="filter-select">
                        <option value="">All genres</option>
                        <option value="epistle">Epistle (109)</option>
                        <option value="prayer">Prayer (9)</option>
                        <option value="erotic">Erotic (3)</option>
                        <option value="epitaph">Epitaph (3)</option>
                        <option value="epideictic">Epideictic (2)</option>
                        <option value="paraenesis">Paraenesis (1)</option>
                    </select>
                </div>
                
                <!-- Table of Contents -->
                <div class="toc-section">
                    <h3>Books</h3>
                    <div id="tocContainer" class="toc-container">
                        <!-- Generated by JavaScript -->
                    </div>
                </div>
                
                <!-- Statistics -->
                <div class="stats-section">
                    <h3>Statistics</h3>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-value">{stats.get('total_poems', 0)}</span>
                            <span class="stat-label">Poems</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">{stats.get('total_lines', 0)}</span>
                            <span class="stat-label">Lines</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">{stats.get('total_persons', 0)}</span>
                            <span class="stat-label">Persons</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">{stats.get('person_references', 0)}</span>
                            <span class="stat-label">References</span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
        
        <!-- Main Content Area -->
        <main class="main-content" id="mainContent">
            <!-- Reading View (default) -->
            <div id="readingView" class="view-container active">
                <div class="content-header">
                    <h2 id="currentPoemTitle">Select a poem from the sidebar</h2>
                    <div class="view-controls">
                        <button class="btn-icon" id="prevPoem" title="Previous poem">←</button>
                        <button class="btn-icon" id="nextPoem" title="Next poem">→</button>
                        <button class="btn-icon" id="toggleLineNumbers" title="Toggle line numbers">№</button>
                        <button class="btn-icon" id="toggleIndentation" title="Toggle indentation">¶</button>
                        <button class="btn-icon" id="zoomIn" title="Increase font size">A+</button>
                        <button class="btn-icon" id="zoomOut" title="Decrease font size">A-</button>
                    </div>
                </div>
                
                <div id="poemContent" class="poem-container">
                    <!-- Poem content loaded here -->
                    <div class="welcome-message">
                        <h3>Welcome to the Digital Edition of Lucina</h3>
                        <p>This collection of 128 Latin occasional poems by Aurelius Laurentius Albrisius, 
                        preserved in Madrid MS 6028 (1474), offers intimate insights into literary culture 
                        at the Sforza courts of Pavia and Milan.</p>
                        
                        <p>Select a poem from the sidebar to begin reading, or explore the manuscript, 
                        prosopographical network, and search features using the navigation above.</p>
                        
                        <div class="quick-stats">
                            <h4>Collection Overview</h4>
                            <ul>
                                <li><strong>Praefatio:</strong> Dedicatory poem to Cicco Simonetta</li>
                                <li><strong>Book I:</strong> 43 poems - Love initiation and court poetry</li>
                                <li><strong>Book II:</strong> 37 poems - Patronage and consummation</li>
                                <li><strong>Book III:</strong> 47 poems - Renunciation and spiritual turn</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div class="poem-metadata" id="poemMetadata">
                    <!-- Metadata loaded here -->
                </div>
            </div>
            
            <!-- Manuscript View -->
            <div id="manuscriptView" class="view-container">
                <div class="manuscript-header">
                    <h2>Madrid, Biblioteca Nacional, Mss. 6028</h2>
                    <p>{manuscript.get('extent', '')} · {manuscript.get('material', '')} · {manuscript.get('date', '')}</p>
                </div>
                
                <div class="manuscript-viewer">
                    <div class="manuscript-controls">
                        <button id="prevPage">← Previous</button>
                        <span id="pageInfo">Page 1 of 176</span>
                        <button id="nextPage">Next →</button>
                    </div>
                    
                    <div class="manuscript-display">
                        <div class="facsimile-container" id="facsimileContainer">
                            <img id="facsimileImage" src="" alt="Manuscript page">
                        </div>
                        
                        <div class="transcription-container" id="transcriptionContainer">
                            <!-- Synchronized transcription -->
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Network View -->
            <div id="networkView" class="view-container">
                <div class="network-header">
                    <h2>Prosopographical Network</h2>
                    <p>Social connections in the Sforza court (c. 1470-1474)</p>
                </div>
                
                <div class="network-controls">
                    <button id="resetNetwork">Reset View</button>
                    <select id="networkFilter">
                        <option value="all">All Persons</option>
                        <option value="frequent">Most Referenced (>3)</option>
                        <option value="simonetta">Simonetta Family</option>
                        <option value="sforza">Sforza Court</option>
                    </select>
                </div>
                
                <div id="networkCanvas" class="network-canvas">
                    <!-- Network visualization will be rendered here -->
                </div>
                
                <div id="personDetails" class="person-details">
                    <!-- Person details on click -->
                </div>
            </div>
            
            <!-- Search View -->
            <div id="searchView" class="view-container">
                <div class="search-header">
                    <h2>Advanced Search</h2>
                </div>
                
                <div class="search-form">
                    <input type="text" id="advancedSearchInput" placeholder="Enter search terms..." class="search-input">
                    
                    <div class="search-options">
                        <label><input type="checkbox" id="searchPoems" checked> Poems</label>
                        <label><input type="checkbox" id="searchPersons" checked> Persons</label>
                        <label><input type="checkbox" id="searchLines" checked> Lines</label>
                        <label><input type="checkbox" id="searchMetadata"> Metadata</label>
                    </div>
                    
                    <button id="performSearch" class="btn-primary">Search</button>
                </div>
                
                <div id="searchResults" class="search-results">
                    <!-- Search results displayed here -->
                </div>
            </div>
            
            <!-- About View -->
            <div id="aboutView" class="view-container">
                <div class="about-content">
                    <h2>About This Edition</h2>
                    
                    <section class="about-section">
                        <h3>The Work</h3>
                        <p>The <em>Lucina</em> of Aurelius Laurentius Albrisius is a collection of 128 Latin 
                        occasional poems preserved in the magnificently decorated Madrid Codex (Biblioteca Nacional, 
                        Mss. 6028), completed on August 2, 1474. This parchment dedication manuscript presents a 
                        work previously unknown to scholarship—a significant lacuna given its intimate portrayal 
                        of literary culture at the Sforza courts in Quattrocento Italy.</p>
                    </section>
                    
                    <section class="about-section">
                        <h3>The Author</h3>
                        <p>Albrisius (c. 1440-1445, Cremona) studied canon law in Perugia before serving as tutor 
                        to Cicco Simonetta's sons. His career culminated in his coronation as poet laureate by 
                        Emperor Frederick III (1468/69 in Rome). Despite being married with four children, 
                        Albrisius constructs in <em>Lucina</em> a literary autobiography centered on youthful passion.</p>
                    </section>
                    
                    <section class="about-section">
                        <h3>Technical Implementation</h3>
                        <p>This digital edition follows TEI P5 Guidelines with customizations for Renaissance Latin 
                        occasional poetry. The edition was created using innovative "Promptotyping" methodology, 
                        demonstrating how AI can assist in digital humanities scholarship while maintaining 
                        rigorous academic standards.</p>
                        
                        <div class="tech-details">
                            <h4>Technologies Used</h4>
                            <ul>
                                <li>TEI XML encoding with comprehensive prosopographical data</li>
                                <li>Python processing with detailed logging</li>
                                <li>Modern responsive web interface</li>
                                <li>D3.js for network visualizations</li>
                                <li>Full-text search capabilities</li>
                            </ul>
                        </div>
                    </section>
                    
                    <section class="about-section">
                        <h3>Citation</h3>
                        <div class="citation-box">
                            <p>Albrisius, Aurelius Laurentius. <em>Lucina: A Digital Edition</em>. 
                            Ed. [Editor Name]. 2024. Web. {datetime.now().strftime('%d %B %Y')}.</p>
                        </div>
                    </section>
                </div>
            </div>
        </main>
        
        <!-- Secondary Sidebar (Person/Context Info) -->
        <aside class="info-panel" id="infoPanel">
            <button class="info-close" id="closeInfo">×</button>
            <div id="infoPanelContent">
                <!-- Dynamic content loaded here -->
            </div>
        </aside>
    </div>
    
    <!-- Footer -->
    <footer class="site-footer">
        <div class="footer-content">
            <p>© 2024 Digital Edition of Lucina · Generated {datetime.now().strftime('%Y-%m-%d')}</p>
            <p>Source: Madrid, Biblioteca Nacional, Mss. 6028</p>
        </div>
    </footer>
    
    <!-- Load data and scripts -->
    <script src="poems-data.js"></script>
    <script src="persons-data.js"></script>
    <script src="app.js"></script>
</body>
</html>"""
        
        # Write HTML file
        output_path = self.output_dir / "index.html"
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html)
        
        logger.info(f"Generated index.html ({len(html):,} bytes)")
    
    def _generate_css(self):
        """Generate modern CSS styles"""
        logger.info("Generating styles.css...")
        
        css = """/* Lucina Digital Edition - Modern Styles */

:root {
    /* Color Palette */
    --primary-color: #2c3e50;
    --secondary-color: #8b4513;
    --accent-color: #d4af37;
    --text-primary: #2c3e50;
    --text-secondary: #5a6c7d;
    --bg-primary: #ffffff;
    --bg-secondary: #f8f9fa;
    --bg-tertiary: #e9ecef;
    --border-color: #dee2e6;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
    --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
    --shadow-lg: 0 10px 20px rgba(0,0,0,0.15);
    
    /* Typography */
    --font-serif: 'Crimson Text', Georgia, serif;
    --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-size-base: 16px;
    --line-height-base: 1.6;
    --line-height-verse: 1.8;
}

/* Reset and Base */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: var(--font-sans);
    font-size: var(--font-size-base);
    line-height: var(--line-height-base);
    color: var(--text-primary);
    background: var(--bg-primary);
    overflow-x: hidden;
}

/* Header */
.site-header {
    background: linear-gradient(135deg, var(--primary-color), #34495e);
    color: white;
    padding: 2rem 0;
    box-shadow: var(--shadow-md);
}

.header-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem;
    text-align: center;
}

.site-title {
    font-family: var(--font-serif);
    font-size: 3rem;
    font-weight: 400;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
}

.site-subtitle {
    font-size: 1.1rem;
    opacity: 0.9;
    margin-bottom: 0.25rem;
}

.site-author {
    font-style: italic;
    opacity: 0.8;
}

/* Navigation */
.main-nav {
    max-width: 1400px;
    margin: 2rem auto 0;
    padding: 0 2rem;
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
}

.nav-btn {
    background: rgba(255,255,255,0.1);
    color: white;
    border: 1px solid rgba(255,255,255,0.2);
    padding: 0.5rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.95rem;
}

.nav-btn:hover {
    background: rgba(255,255,255,0.2);
    transform: translateY(-1px);
}

.nav-btn.active {
    background: rgba(255,255,255,0.25);
    border-color: rgba(255,255,255,0.4);
}

/* Main Container */
.main-container {
    display: flex;
    max-width: 1400px;
    margin: 0 auto;
    min-height: calc(100vh - 200px);
    position: relative;
}

/* Sidebar */
.sidebar {
    width: 320px;
    background: var(--bg-secondary);
    border-right: 1px solid var(--border-color);
    height: calc(100vh - 200px);
    overflow-y: auto;
    position: sticky;
    top: 0;
    transition: transform 0.3s ease;
}

.sidebar.collapsed {
    transform: translateX(-280px);
}

.sidebar-header {
    padding: 1.5rem;
    background: white;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 10;
}

.sidebar-header h2 {
    font-size: 1.25rem;
    font-weight: 500;
}

.sidebar-toggle {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    color: var(--text-secondary);
    transition: transform 0.3s ease;
}

.sidebar.collapsed .sidebar-toggle {
    transform: rotate(180deg);
}

.sidebar-content {
    padding: 1.5rem;
}

/* Search Box */
.search-box {
    margin-bottom: 1.5rem;
}

.search-box input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 0.95rem;
}

.search-box input:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px rgba(212,175,55,0.1);
}

/* Filter Section */
.filter-section {
    margin-bottom: 1.5rem;
}

.filter-section h3 {
    font-size: 0.9rem;
    text-transform: uppercase;
    color: var(--text-secondary);
    margin-bottom: 0.75rem;
}

.filter-select {
    width: 100%;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background: white;
    font-size: 0.95rem;
}

/* Table of Contents */
.toc-section {
    margin-bottom: 1.5rem;
}

.toc-section h3 {
    font-size: 0.9rem;
    text-transform: uppercase;
    color: var(--text-secondary);
    margin-bottom: 0.75rem;
}

.toc-container {
    max-height: 400px;
    overflow-y: auto;
}

.book-group {
    margin-bottom: 1rem;
}

.book-header {
    font-weight: 500;
    padding: 0.5rem;
    background: white;
    border-radius: 4px;
    margin-bottom: 0.25rem;
    cursor: pointer;
    transition: background 0.2s ease;
}

.book-header:hover {
    background: var(--bg-tertiary);
}

.poem-list {
    padding-left: 1rem;
}

.poem-item {
    padding: 0.4rem 0.5rem;
    cursor: pointer;
    border-radius: 4px;
    font-size: 0.9rem;
    transition: all 0.2s ease;
}

.poem-item:hover {
    background: white;
    padding-left: 0.75rem;
}

.poem-item.active {
    background: var(--accent-color);
    color: white;
}

/* Statistics */
.stats-section {
    background: white;
    padding: 1rem;
    border-radius: 4px;
}

.stats-section h3 {
    font-size: 0.9rem;
    text-transform: uppercase;
    color: var(--text-secondary);
    margin-bottom: 0.75rem;
}

.stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
}

.stat-item {
    text-align: center;
    padding: 0.5rem;
    background: var(--bg-secondary);
    border-radius: 4px;
}

.stat-value {
    display: block;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--primary-color);
}

.stat-label {
    display: block;
    font-size: 0.75rem;
    text-transform: uppercase;
    color: var(--text-secondary);
}

/* Main Content */
.main-content {
    flex: 1;
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
    width: 100%;
}

.view-container {
    display: none;
}

.view-container.active {
    display: block;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

/* Content Header */
.content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1rem;
    border-bottom: 2px solid var(--border-color);
    margin-bottom: 2rem;
}

.content-header h2 {
    font-family: var(--font-serif);
    font-size: 1.75rem;
    color: var(--primary-color);
}

.view-controls {
    display: flex;
    gap: 0.5rem;
}

.btn-icon {
    width: 36px;
    height: 36px;
    border: 1px solid var(--border-color);
    background: white;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.btn-icon:hover {
    background: var(--bg-secondary);
    border-color: var(--accent-color);
}

/* Poem Display */
.poem-container {
    font-family: var(--font-serif);
    font-size: 1.1rem;
    line-height: var(--line-height-verse);
}

.poem-header {
    margin-bottom: 2rem;
    text-align: center;
}

.poem-title {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: var(--primary-color);
}

.poem-dedication {
    font-style: italic;
    color: var(--text-secondary);
}

.line-group {
    margin-bottom: 1.5rem;
}

.verse-line {
    display: flex;
    margin-bottom: 0.25rem;
}

.line-number {
    width: 40px;
    text-align: right;
    padding-right: 1rem;
    color: var(--text-secondary);
    font-size: 0.85rem;
    user-select: none;
}

.line-text {
    flex: 1;
}

.line-text.indented {
    padding-left: 2rem;
}

/* Person References */
.person-ref {
    color: var(--secondary-color);
    cursor: pointer;
    border-bottom: 1px dotted var(--secondary-color);
    transition: all 0.2s ease;
}

.person-ref:hover {
    color: var(--accent-color);
    border-bottom-style: solid;
}

/* Welcome Message */
.welcome-message {
    max-width: 600px;
    margin: 3rem auto;
    text-align: center;
}

.welcome-message h3 {
    font-family: var(--font-serif);
    font-size: 1.75rem;
    margin-bottom: 1rem;
    color: var(--primary-color);
}

.welcome-message p {
    margin-bottom: 1rem;
    line-height: 1.8;
}

.quick-stats {
    background: var(--bg-secondary);
    padding: 1.5rem;
    border-radius: 8px;
    margin-top: 2rem;
    text-align: left;
}

.quick-stats h4 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
    color: var(--primary-color);
}

.quick-stats ul {
    list-style: none;
}

.quick-stats li {
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--border-color);
}

.quick-stats li:last-child {
    border-bottom: none;
}

/* Info Panel */
.info-panel {
    position: fixed;
    right: -400px;
    top: 0;
    width: 400px;
    height: 100vh;
    background: white;
    box-shadow: var(--shadow-lg);
    z-index: 1000;
    transition: right 0.3s ease;
    overflow-y: auto;
}

.info-panel.active {
    right: 0;
}

.info-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 32px;
    height: 32px;
    border: none;
    background: var(--bg-secondary);
    border-radius: 50%;
    font-size: 1.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

#infoPanelContent {
    padding: 3rem 2rem 2rem;
}

/* Footer */
.site-footer {
    background: var(--primary-color);
    color: white;
    padding: 1.5rem 0;
    text-align: center;
    margin-top: 3rem;
}

.footer-content p {
    margin: 0.25rem 0;
    opacity: 0.8;
    font-size: 0.9rem;
}

/* Responsive Design */
@media (max-width: 1024px) {
    .main-container {
        flex-direction: column;
    }
    
    .sidebar {
        width: 100%;
        height: auto;
        position: static;
        border-right: none;
        border-bottom: 1px solid var(--border-color);
    }
    
    .info-panel {
        width: 100%;
        right: -100%;
    }
}

@media (max-width: 768px) {
    .site-title {
        font-size: 2rem;
    }
    
    .main-nav {
        flex-direction: column;
        align-items: center;
    }
    
    .nav-btn {
        width: 200px;
    }
    
    .content-header {
        flex-direction: column;
        align-items: flex-start;
    }
    
    .view-controls {
        margin-top: 1rem;
    }
}

/* Print Styles */
@media print {
    .sidebar,
    .main-nav,
    .view-controls,
    .info-panel,
    .site-footer {
        display: none;
    }
    
    .main-content {
        max-width: 100%;
        padding: 0;
    }
    
    .poem-container {
        font-size: 12pt;
    }
}"""
        
        # Write CSS file
        output_path = self.output_dir / "styles.css"
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(css)
        
        logger.info(f"Generated styles.css ({len(css):,} bytes)")
    
    def _generate_javascript(self):
        """Generate JavaScript for interactivity"""
        logger.info("Generating app.js...")
        
        js = """// Lucina Digital Edition - Main Application

class LucinaEdition {
    constructor() {
        this.currentView = 'reading';
        this.currentPoem = null;
        this.currentBook = null;
        this.poems = window.poemsData || {};
        this.persons = window.personsData || {};
        this.books = window.booksData || {};
        
        this.init();
    }
    
    init() {
        console.log('Initializing Lucina Digital Edition...');
        console.log(`Loaded ${Object.keys(this.poems).length} poems`);
        console.log(`Loaded ${Object.keys(this.persons).length} persons`);
        
        this.setupEventListeners();
        this.buildTableOfContents();
        this.initializeViews();
    }
    
    setupEventListeners() {
        // Navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchView(e.target.dataset.view);
            });
        });
        
        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                document.getElementById('sidebar').classList.toggle('collapsed');
            });
        }
        
        // Poem navigation
        document.getElementById('prevPoem')?.addEventListener('click', () => this.navigatePoem(-1));
        document.getElementById('nextPoem')?.addEventListener('click', () => this.navigatePoem(1));
        
        // View controls
        document.getElementById('toggleLineNumbers')?.addEventListener('click', () => {
            document.querySelector('.poem-container')?.classList.toggle('hide-line-numbers');
        });
        
        document.getElementById('toggleIndentation')?.addEventListener('click', () => {
            document.querySelector('.poem-container')?.classList.toggle('no-indent');
        });
        
        // Font size controls
        let fontSize = 1.1;
        document.getElementById('zoomIn')?.addEventListener('click', () => {
            fontSize += 0.1;
            document.querySelector('.poem-container').style.fontSize = fontSize + 'rem';
        });
        
        document.getElementById('zoomOut')?.addEventListener('click', () => {
            fontSize = Math.max(0.8, fontSize - 0.1);
            document.querySelector('.poem-container').style.fontSize = fontSize + 'rem';
        });
        
        // Search functionality
        document.getElementById('searchInput')?.addEventListener('input', (e) => {
            this.performQuickSearch(e.target.value);
        });
        
        // Filter functionality
        document.getElementById('meterFilter')?.addEventListener('change', (e) => {
            this.filterPoems('meter', e.target.value);
        });
        
        document.getElementById('genreFilter')?.addEventListener('change', (e) => {
            this.filterPoems('genre', e.target.value);
        });
        
        // Info panel close
        document.getElementById('closeInfo')?.addEventListener('click', () => {
            document.getElementById('infoPanel').classList.remove('active');
        });
    }
    
    switchView(viewName) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewName);
        });
        
        // Update view containers
        document.querySelectorAll('.view-container').forEach(container => {
            container.classList.remove('active');
        });
        
        const targetView = document.getElementById(viewName + 'View');
        if (targetView) {
            targetView.classList.add('active');
        }
        
        this.currentView = viewName;
        
        // Initialize view-specific features
        if (viewName === 'network') {
            this.initNetworkView();
        } else if (viewName === 'manuscript') {
            this.initManuscriptView();
        }
    }
    
    buildTableOfContents() {
        const tocContainer = document.getElementById('tocContainer');
        if (!tocContainer) return;
        
        let tocHTML = '';
        
        // Build TOC structure
        for (const [bookId, book] of Object.entries(this.books)) {
            tocHTML += `
                <div class="book-group" data-book="${bookId}">
                    <div class="book-header" onclick="app.toggleBook('${bookId}')">
                        ${book.title} (${book.poems.length} poems)
                    </div>
                    <div class="poem-list" id="book-${bookId}-poems">`;
            
            for (const poemId of book.poems) {
                const poem = this.poems[poemId];
                if (poem) {
                    const shortTitle = poem.dedicatee || `Poem ${poem.number}`;
                    tocHTML += `
                        <div class="poem-item" onclick="app.loadPoem('${poemId}')" data-poem="${poemId}">
                            ${poem.book}.${poem.number} - ${shortTitle}
                        </div>`;
                }
            }
            
            tocHTML += `
                    </div>
                </div>`;
        }
        
        tocContainer.innerHTML = tocHTML;
    }
    
    toggleBook(bookId) {
        const poemList = document.getElementById(`book-${bookId}-poems`);
        if (poemList) {
            poemList.style.display = poemList.style.display === 'none' ? 'block' : 'none';
        }
    }
    
    loadPoem(poemId) {
        const poem = this.poems[poemId];
        if (!poem) {
            console.error('Poem not found:', poemId);
            return;
        }
        
        this.currentPoem = poemId;
        
        // Update active state in TOC
        document.querySelectorAll('.poem-item').forEach(item => {
            item.classList.toggle('active', item.dataset.poem === poemId);
        });
        
        // Update poem title
        document.getElementById('currentPoemTitle').textContent = 
            `${poem.book}.${poem.number} - ${poem.dedicatee || poem.title}`;
        
        // Build poem HTML
        let poemHTML = '<div class="poem-header">';
        
        // Add rubrics if present
        if (poem.rubrics && poem.rubrics.length > 0) {
            for (const rubric of poem.rubrics) {
                poemHTML += `<div class="poem-rubric">${rubric}</div>`;
            }
        }
        
        // Add dedication
        if (poem.dedicatee) {
            poemHTML += `<div class="poem-dedication">`;
            if (poem.addressee_ref && this.persons[poem.addressee_ref]) {
                poemHTML += `Ad <span class="person-ref" onclick="app.showPersonInfo('${poem.addressee_ref}')">${poem.dedicatee}</span>`;
            } else {
                poemHTML += `Ad ${poem.dedicatee}`;
            }
            poemHTML += `</div>`;
        }
        
        poemHTML += '</div>';
        
        // Add lines
        if (poem.line_groups && poem.line_groups.length > 0) {
            // Structured with line groups
            for (const lg of poem.line_groups) {
                poemHTML += `<div class="line-group" data-type="${lg.type}">`;
                for (const line of lg.lines) {
                    poemHTML += this.renderLine(line);
                }
                poemHTML += '</div>';
            }
        } else if (poem.lines && poem.lines.length > 0) {
            // Direct lines
            poemHTML += '<div class="line-group">';
            for (const line of poem.lines) {
                poemHTML += this.renderLine(line);
            }
            poemHTML += '</div>';
        }
        
        document.getElementById('poemContent').innerHTML = poemHTML;
        
        // Update metadata
        this.updatePoemMetadata(poem);
    }
    
    renderLine(line) {
        const indentClass = line.indent ? 'indented' : '';
        let lineText = this.processLineText(line.text);
        
        return `
            <div class="verse-line">
                <span class="line-number">${line.number || ''}</span>
                <span class="line-text ${indentClass}">${lineText}</span>
            </div>`;
    }
    
    processLineText(text) {
        // Process person references and other markup
        // This is a simplified version - could be enhanced
        return text;
    }
    
    updatePoemMetadata(poem) {
        const metadataEl = document.getElementById('poemMetadata');
        if (!metadataEl) return;
        
        let metaHTML = '<h3>Metadata</h3><dl>';
        
        if (poem.meter) {
            metaHTML += `<dt>Meter</dt><dd>${poem.meter}</dd>`;
        }
        
        if (poem.genre) {
            metaHTML += `<dt>Genre</dt><dd>${poem.genre}</dd>`;
        }
        
        if (poem.total_lines) {
            metaHTML += `<dt>Lines</dt><dd>${poem.total_lines}</dd>`;
        }
        
        metaHTML += '</dl>';
        
        metadataEl.innerHTML = metaHTML;
    }
    
    navigatePoem(direction) {
        if (!this.currentPoem) return;
        
        // Get all poem IDs in order
        const allPoemIds = [];
        for (const book of Object.values(this.books)) {
            allPoemIds.push(...book.poems);
        }
        
        const currentIndex = allPoemIds.indexOf(this.currentPoem);
        const newIndex = currentIndex + direction;
        
        if (newIndex >= 0 && newIndex < allPoemIds.length) {
            this.loadPoem(allPoemIds[newIndex]);
        }
    }
    
    showPersonInfo(personId) {
        const person = this.persons[personId];
        if (!person) return;
        
        const infoPanel = document.getElementById('infoPanel');
        const content = document.getElementById('infoPanelContent');
        
        let html = `
            <h2>${person.forename} ${person.surname}</h2>
            ${person.addname ? `<p class="alternate-name">${person.addname}</p>` : ''}
            
            <dl>`;
        
        if (person.birth_place || person.birth_date) {
            html += `<dt>Birth</dt><dd>${person.birth_place || ''} ${person.birth_date || ''}</dd>`;
        }
        
        if (person.death_date) {
            html += `<dt>Death</dt><dd>${person.death_date}</dd>`;
        }
        
        if (person.occupation) {
            html += `<dt>Occupation</dt><dd>${person.occupation}</dd>`;
        }
        
        if (person.note) {
            html += `<dt>Note</dt><dd>${person.note}</dd>`;
        }
        
        if (person.references) {
            html += `<dt>References in text</dt><dd>${person.references}</dd>`;
        }
        
        html += '</dl>';
        
        content.innerHTML = html;
        infoPanel.classList.add('active');
    }
    
    performQuickSearch(query) {
        if (!query || query.length < 2) {
            // Reset display
            document.querySelectorAll('.poem-item').forEach(item => {
                item.style.display = 'block';
            });
            return;
        }
        
        query = query.toLowerCase();
        
        // Search poems
        document.querySelectorAll('.poem-item').forEach(item => {
            const poemId = item.dataset.poem;
            const poem = this.poems[poemId];
            
            if (poem) {
                const matches = 
                    (poem.dedicatee && poem.dedicatee.toLowerCase().includes(query)) ||
                    (poem.title && poem.title.toLowerCase().includes(query)) ||
                    (poem.genre && poem.genre.toLowerCase().includes(query));
                
                item.style.display = matches ? 'block' : 'none';
            }
        });
    }
    
    filterPoems(filterType, filterValue) {
        if (!filterValue) {
            // Show all
            document.querySelectorAll('.poem-item').forEach(item => {
                item.style.display = 'block';
            });
            return;
        }
        
        // Filter poems
        document.querySelectorAll('.poem-item').forEach(item => {
            const poemId = item.dataset.poem;
            const poem = this.poems[poemId];
            
            if (poem) {
                const matches = poem[filterType] === filterValue;
                item.style.display = matches ? 'block' : 'none';
            }
        });
    }
    
    initNetworkView() {
        // Placeholder for network visualization
        const canvas = document.getElementById('networkCanvas');
        if (canvas) {
            canvas.innerHTML = '<p>Network visualization will be rendered here using D3.js</p>';
        }
    }
    
    initManuscriptView() {
        // Placeholder for manuscript viewer
        const container = document.getElementById('facsimileContainer');
        if (container) {
            container.innerHTML = '<p>Manuscript facsimiles will be displayed here</p>';
        }
    }
    
    initializeViews() {
        // Set default view
        this.switchView('reading');
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new LucinaEdition();
});"""
        
        # Write JavaScript file
        output_path = self.output_dir / "app.js"
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(js)
        
        logger.info(f"Generated app.js ({len(js):,} bytes)")
    
    def _generate_data_files(self):
        """Generate JavaScript data files from JSON"""
        logger.info("Generating data files...")
        
        # Generate poems data file
        poems_js = "// Poems Data\nwindow.poemsData = " + json.dumps(self.data.get('poems', {}), indent=2, ensure_ascii=False) + ";"
        
        output_path = self.output_dir / "poems-data.js"
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(poems_js)
        logger.info(f"Generated poems-data.js ({len(poems_js):,} bytes)")
        
        # Generate persons data file
        persons_js = "// Persons Data\nwindow.personsData = " + json.dumps(self.data.get('persons', {}), indent=2, ensure_ascii=False) + ";"
        
        output_path = self.output_dir / "persons-data.js"
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(persons_js)
        logger.info(f"Generated persons-data.js ({len(persons_js):,} bytes)")
        
        # Generate books data file  
        books_js = "// Books Data\nwindow.booksData = " + json.dumps(self.data.get('books', {}), indent=2, ensure_ascii=False) + ";"
        
        output_path = self.output_dir / "books-data.js"
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(books_js)
        logger.info(f"Generated books-data.js ({len(books_js):,} bytes)")


def main():
    """Main execution"""
    print("Lucina Web Edition Generator")
    print("="*50)
    
    # Paths
    json_file = Path("C:/Users/Chrisi/Documents/GitHub/diged-neolat/docs/edition-3/lucina_complete_data.json")
    output_dir = Path("C:/Users/Chrisi/Documents/GitHub/diged-neolat/docs/edition-3/web")
    
    try:
        # Initialize generator
        generator = WebEditionGenerator(str(json_file), str(output_dir))
        
        # Generate all files
        generator.generate_all()
        
        print("\nWeb edition generated successfully!")
        print(f"Output directory: {output_dir}")
        print(f"Open {output_dir / 'index.html'} in your browser to view the edition")
        
    except Exception as e:
        logger.error(f"Generation failed: {e}")
        raise


if __name__ == "__main__":
    main()