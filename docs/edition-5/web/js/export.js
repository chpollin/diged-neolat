// Export Module for Lucina Digital Edition
// Handles various export formats for the digital edition

(function() {
    'use strict';

    // Export state
    window.exportModule = {
        formats: ['pdf', 'txt', 'tei', 'json', 'docx', 'epub', 'bibtex'],
        currentSelection: null,
        initialized: false
    };

    // Initialize export module
    function initExport() {
        if (window.exportModule.initialized) return;
        
        console.log('Initializing export module...');
        
        // Add export UI
        addExportUI();
        
        // Setup listeners
        setupExportListeners();
        
        window.exportModule.initialized = true;
    }

    // Add export UI elements
    function addExportUI() {
        // Add export button to navigation
        const navRight = document.querySelector('.nav-right');
        if (navRight) {
            const exportBtn = document.createElement('button');
            exportBtn.id = 'exportBtn';
            exportBtn.className = 'nav-link-btn';
            exportBtn.innerHTML = '📥 Export';
            exportBtn.title = 'Export edition content';
            exportBtn.addEventListener('click', showExportDialog);
            
            // Insert before search box
            const searchBox = navRight.querySelector('.searchbox');
            navRight.insertBefore(exportBtn, searchBox);
        }
        
        // Create export dialog
        createExportDialog();
        
        // Add styles
        addExportStyles();
    }

    // Create export dialog
    function createExportDialog() {
        const dialog = document.createElement('div');
        dialog.id = 'exportDialog';
        dialog.className = 'export-dialog';
        dialog.style.display = 'none';
        dialog.innerHTML = `
            <div class="export-dialog-content">
                <div class="export-dialog-header">
                    <h3>Export Edition Content</h3>
                    <button class="close-btn" onclick="closeExportDialog()">×</button>
                </div>
                <div class="export-dialog-body">
                    <div class="export-section">
                        <h4>Content Selection</h4>
                        <div class="export-options">
                            <label><input type="radio" name="exportScope" value="current" checked> Current Poem</label>
                            <label><input type="radio" name="exportScope" value="book"> Current Book</label>
                            <label><input type="radio" name="exportScope" value="all"> Entire Edition</label>
                            <label><input type="radio" name="exportScope" value="selection"> Selected Text</label>
                        </div>
                    </div>
                    
                    <div class="export-section">
                        <h4>Export Format</h4>
                        <div class="export-formats">
                            <button class="format-btn" data-format="pdf">
                                <span class="format-icon">📄</span>
                                <span class="format-name">PDF</span>
                                <span class="format-desc">Formatted document</span>
                            </button>
                            <button class="format-btn" data-format="txt">
                                <span class="format-icon">📝</span>
                                <span class="format-name">Plain Text</span>
                                <span class="format-desc">Simple text file</span>
                            </button>
                            <button class="format-btn" data-format="tei">
                                <span class="format-icon">🏛️</span>
                                <span class="format-name">TEI XML</span>
                                <span class="format-desc">TEI P5 encoded</span>
                            </button>
                            <button class="format-btn" data-format="json">
                                <span class="format-icon">{ }</span>
                                <span class="format-name">JSON</span>
                                <span class="format-desc">Structured data</span>
                            </button>
                            <button class="format-btn" data-format="docx">
                                <span class="format-icon">📘</span>
                                <span class="format-name">Word</span>
                                <span class="format-desc">Microsoft Word</span>
                            </button>
                            <button class="format-btn" data-format="epub">
                                <span class="format-icon">📚</span>
                                <span class="format-name">EPUB</span>
                                <span class="format-desc">E-book format</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="export-section">
                        <h4>Include Options</h4>
                        <div class="export-includes">
                            <label><input type="checkbox" id="includeLatinText" checked> Latin Text</label>
                            <label><input type="checkbox" id="includeTranslation"> Translation</label>
                            <label><input type="checkbox" id="includeCommentary"> Commentary</label>
                            <label><input type="checkbox" id="includeNotes"> Editorial Notes</label>
                            <label><input type="checkbox" id="includeMetrics"> Metrical Analysis</label>
                            <label><input type="checkbox" id="includeProsopography"> Prosopographical Data</label>
                        </div>
                    </div>
                    
                    <div class="export-section">
                        <h4>Citation Format</h4>
                        <div class="citation-preview">
                            <select id="citationStyle">
                                <option value="mla">MLA</option>
                                <option value="chicago">Chicago</option>
                                <option value="apa">APA</option>
                                <option value="harvard">Harvard</option>
                            </select>
                            <div id="citationPreview" class="citation-text"></div>
                        </div>
                    </div>
                </div>
                <div class="export-dialog-footer">
                    <button onclick="closeExportDialog()" class="btn">Cancel</button>
                    <button onclick="performExport()" class="btn primary">Export</button>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);
        
        // Add handlers
        window.closeExportDialog = function() {
            dialog.style.display = 'none';
        };
        
        window.performExport = function() {
            const format = document.querySelector('.format-btn.active')?.getAttribute('data-format');
            if (format) {
                exportContent(format);
            }
        };
        
        // Format button handlers
        dialog.querySelectorAll('.format-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                dialog.querySelectorAll('.format-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                updateCitationPreview();
            });
        });
        
        // Citation style handler
        document.getElementById('citationStyle')?.addEventListener('change', updateCitationPreview);
    }

    // Setup export listeners
    function setupExportListeners() {
        // Listen for text selection
        document.addEventListener('mouseup', () => {
            const selection = window.getSelection();
            if (selection.toString().length > 0) {
                window.exportModule.currentSelection = selection.toString();
            }
        });
        
        // Keyboard shortcut for export
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') {
                showExportDialog();
            }
        });
    }

    // Show export dialog
    function showExportDialog() {
        const dialog = document.getElementById('exportDialog');
        if (dialog) {
            dialog.style.display = 'block';
            updateCitationPreview();
            
            // Enable/disable selection option
            const selectionRadio = dialog.querySelector('input[value="selection"]');
            if (selectionRadio) {
                selectionRadio.disabled = !window.exportModule.currentSelection;
                if (selectionRadio.disabled) {
                    selectionRadio.parentElement.style.opacity = '0.5';
                }
            }
        }
    }

    // Export content based on format
    function exportContent(format) {
        const scope = document.querySelector('input[name="exportScope"]:checked')?.value || 'current';
        const content = gatherContent(scope);
        
        switch (format) {
            case 'pdf':
                exportAsPDF(content);
                break;
            case 'txt':
                exportAsText(content);
                break;
            case 'tei':
                exportAsTEI(content);
                break;
            case 'json':
                exportAsJSON(content);
                break;
            case 'docx':
                exportAsWord(content);
                break;
            case 'epub':
                exportAsEPUB(content);
                break;
            default:
                console.error('Unknown export format:', format);
        }
        
        closeExportDialog();
    }

    // Gather content based on scope
    function gatherContent(scope) {
        const content = {
            metadata: {
                title: 'Lucina Digital Edition',
                author: 'Aurelius Laurentius Albrisius',
                manuscript: 'Madrid BN Mss. 6028',
                exported: new Date().toISOString(),
                scope: scope
            },
            data: []
        };
        
        const includeOptions = {
            latin: document.getElementById('includeLatinText')?.checked,
            translation: document.getElementById('includeTranslation')?.checked,
            commentary: document.getElementById('includeCommentary')?.checked,
            notes: document.getElementById('includeNotes')?.checked,
            metrics: document.getElementById('includeMetrics')?.checked,
            prosopography: document.getElementById('includeProsopography')?.checked
        };
        
        switch (scope) {
            case 'current':
                content.data = [getCurrentPoem(includeOptions)];
                break;
            case 'book':
                content.data = getCurrentBook(includeOptions);
                break;
            case 'all':
                content.data = getAllPoems(includeOptions);
                break;
            case 'selection':
                content.data = [{
                    type: 'selection',
                    text: window.exportModule.currentSelection
                }];
                break;
        }
        
        return content;
    }

    // Get current poem with options
    function getCurrentPoem(options) {
        const poemId = getCurrentPoemId();
        // Access the global window.poems variable
        const poem = window.poems && window.poems.length > 0 ? 
            window.poems.find(p => p.id === poemId) : null;
        
        if (!poem) {
            console.warn('Export: No poem found for ID:', poemId);
            return null;
        }
        
        const poemData = {
            id: poem.id,
            title: poem.title,
            book: poem.book,
            number: poem.number
        };
        
        if (options.latin) {
            poemData.lines = poem.lines;
        }
        
        if (options.translation) {
            poemData.translation = window.translationAPI?.getTranslation(poemId);
        }
        
        if (options.commentary) {
            poemData.commentary = window.commentaryAPI?.getAnnotations(poemId);
        }
        
        if (options.metrics) {
            poemData.metrics = getMetricsForPoem(poemId);
        }
        
        return poemData;
    }

    // Get current book
    function getCurrentBook(options) {
        const bookSelect = document.getElementById('bookSelect');
        const currentBook = bookSelect?.value ? parseInt(bookSelect.value) : 1;
        
        // Access the global window.poems variable
        if (!window.poems || window.poems.length === 0) {
            console.warn('Export: No poems available');
            return [];
        }
        return window.poems.filter(p => p.book === currentBook)
            .map(poem => {
                // Create poem data for each poem in the book
                const poemData = {
                    id: poem.id,
                    title: poem.title,
                    book: poem.book,
                    number: poem.number,
                    lines: options.latin ? poem.lines : undefined
                };
                return poemData;
            });
    }

    // Get all poems
    function getAllPoems(options) {
        // Access the global window.poems variable
        if (!window.poems || window.poems.length === 0) {
            console.warn('Export: No poems available');
            return [];
        }
        return window.poems.map(poem => {
            const poemId = poem.id;
            const poemData = {
                id: poemId,
                title: poem.title,
                book: poem.book,
                number: poem.number
            };
            
            if (options.latin) {
                poemData.lines = poem.lines;
            }
            
            if (options.translation) {
                poemData.translation = window.translationAPI?.getTranslation(poemId);
            }
            
            if (options.commentary) {
                poemData.commentary = window.commentaryAPI?.getAnnotations(poemId);
            }
            
            return poemData;
        });
    }

    // Export as PDF
    async function exportAsPDF(content) {
        // For a full implementation, you would use a library like jsPDF or pdfmake
        // For now, we'll create a printable HTML version
        const printWindow = window.open('', '_blank');
        const html = generatePrintHTML(content);
        
        printWindow.document.write(html);
        printWindow.document.close();
        
        setTimeout(() => {
            printWindow.print();
        }, 500);
    }

    // Generate printable HTML
    function generatePrintHTML(content) {
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${content.metadata.title}</title>
                <style>
                    @page { margin: 1in; }
                    body { 
                        font-family: Georgia, serif; 
                        font-size: 12pt;
                        line-height: 1.6;
                    }
                    .title-page {
                        text-align: center;
                        page-break-after: always;
                        padding-top: 3in;
                    }
                    .poem {
                        page-break-inside: avoid;
                        margin-bottom: 2em;
                    }
                    .poem-title {
                        font-weight: bold;
                        margin-bottom: 1em;
                    }
                    .line {
                        margin-bottom: 0.5em;
                    }
                    .pentameter {
                        margin-left: 2em;
                    }
                    .line-number {
                        display: inline-block;
                        width: 3em;
                        text-align: right;
                        margin-right: 1em;
                        color: #666;
                        font-size: 10pt;
                    }
                    @media print {
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="title-page">
                    <h1>${content.metadata.title}</h1>
                    <h2>${content.metadata.author}</h2>
                    <p>${content.metadata.manuscript}</p>
                    <p>Exported: ${new Date(content.metadata.exported).toLocaleDateString()}</p>
                </div>
        `;
        
        content.data.forEach(poem => {
            if (poem && poem.lines) {
                html += `<div class="poem">`;
                html += `<div class="poem-title">${poem.title || poem.id}</div>`;
                
                poem.lines.forEach((line, index) => {
                    const lineNum = index + 1;
                    const isPentameter = lineNum % 2 === 0;
                    const lineText = typeof line === 'object' ? line.text : line;
                    html += `
                        <div class="line ${isPentameter ? 'pentameter' : ''}">
                            <span class="line-number">${lineNum}</span>
                            <span class="line-text">${lineText}</span>
                        </div>
                    `;
                });
                
                html += `</div>`;
            }
        });
        
        html += `</body></html>`;
        return html;
    }

    // Export as plain text
    function exportAsText(content) {
        let text = `${content.metadata.title}\n`;
        text += `${content.metadata.author}\n`;
        text += `${content.metadata.manuscript}\n`;
        text += `Exported: ${new Date(content.metadata.exported).toLocaleDateString()}\n`;
        text += '='.repeat(60) + '\n\n';
        
        content.data.forEach(poem => {
            if (poem) {
                text += `${poem.title || poem.id}\n`;
                text += '-'.repeat(40) + '\n';
                
                if (poem.lines) {
                    poem.lines.forEach((line, index) => {
                        const lineNum = index + 1;
                        const isPentameter = lineNum % 2 === 0;
                        const indent = isPentameter ? '  ' : '';
                        const lineText = typeof line === 'object' ? line.text : line;
                        text += `${lineNum.toString().padStart(3)} ${indent}${lineText}\n`;
                    });
                }
                
                text += '\n';
            }
        });
        
        downloadFile(text, 'lucina-export.txt', 'text/plain');
    }

    // Export as TEI XML
    function exportAsTEI(content) {
        // Extract subset of TEI based on selection
        if (window.teiDoc) {
            const serializer = new XMLSerializer();
            let teiString = serializer.serializeToString(window.teiDoc);
            
            // If not exporting all, filter the TEI
            if (content.metadata.scope !== 'all') {
                // This would require more complex XML manipulation
                // For now, export the full TEI
            }
            
            downloadFile(teiString, 'lucina-export.xml', 'text/xml');
        }
    }

    // Export as JSON
    function exportAsJSON(content) {
        const json = JSON.stringify(content, null, 2);
        downloadFile(json, 'lucina-export.json', 'application/json');
    }

    // Export as Word (simplified)
    function exportAsWord(content) {
        // For a full implementation, you would use a library like docx.js
        // For now, export as HTML with Word-compatible formatting
        const html = generateWordHTML(content);
        const blob = new Blob([html], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lucina-export.doc';
        a.click();
        
        URL.revokeObjectURL(url);
    }

    // Generate Word-compatible HTML
    function generateWordHTML(content) {
        let html = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office"
                  xmlns:w="urn:schemas-microsoft-com:office:word"
                  xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta charset="UTF-8">
                <title>${content.metadata.title}</title>
                <style>
                    @page { margin: 1in; }
                    body { font-family: Georgia; font-size: 12pt; }
                    .poem { margin-bottom: 24pt; }
                    .poem-title { font-weight: bold; margin-bottom: 12pt; }
                    .line { margin-bottom: 6pt; }
                    .pentameter { margin-left: 36pt; }
                </style>
            </head>
            <body>
        `;
        
        content.data.forEach(poem => {
            if (poem && poem.lines) {
                html += `<div class="poem">`;
                html += `<p class="poem-title">${poem.title || poem.id}</p>`;
                
                poem.lines.forEach((line, index) => {
                    const isPentameter = (index + 1) % 2 === 0;
                    const lineText = typeof line === 'object' ? line.text : line;
                    html += `<p class="line ${isPentameter ? 'pentameter' : ''}">${lineText}</p>`;
                });
                
                html += `</div>`;
            }
        });
        
        html += `</body></html>`;
        return html;
    }

    // Export as EPUB (simplified)
    function exportAsEPUB(content) {
        // For a full implementation, you would use a library like epub.js
        // For now, show a message
        alert('EPUB export is coming soon. For now, please use PDF or Word format.');
    }

    // Update citation preview
    function updateCitationPreview() {
        const style = document.getElementById('citationStyle')?.value || 'mla';
        const preview = document.getElementById('citationPreview');
        
        if (!preview) return;
        
        const citation = generateCitation(style);
        preview.textContent = citation;
    }

    // Generate citation
    function generateCitation(style) {
        const date = new Date().getFullYear();
        
        switch (style) {
            case 'mla':
                return `Albrisius, Aurelius Laurentius. Lucina. Madrid, Biblioteca Nacional, Mss. 6028, 1474. Digital Edition, edited by [Editor Name], ${date}. Web. ${new Date().toLocaleDateString()}.`;
            
            case 'chicago':
                return `Albrisius, Aurelius Laurentius. Lucina. Madrid BN Mss. 6028. 1474. Digital edition. Edited by [Editor Name]. Accessed ${new Date().toLocaleDateString()}. [URL].`;
            
            case 'apa':
                return `Albrisius, A. L. (1474). Lucina [Manuscript]. Biblioteca Nacional Madrid, Mss. 6028. Digital edition by [Editor Name] (${date}).`;
            
            case 'harvard':
                return `Albrisius, AL 1474, Lucina, manuscript, Biblioteca Nacional Madrid, Mss. 6028, digital edn, ed. [Editor Name], viewed ${new Date().toLocaleDateString()}, <[URL]>.`;
            
            default:
                return '';
        }
    }

    // Helper function to download file
    function downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    // Get current poem ID
    function getCurrentPoemId() {
        const poemSelect = document.getElementById('poemSelect');
        return poemSelect?.value || 'poem-praefatio';
    }

    // Get metrics for a poem
    function getMetricsForPoem(poemId) {
        if (window.metrics && window.metrics.statistics.byPoem) {
            return window.metrics.statistics.byPoem.get(poemId);
        }
        return null;
    }

    // Add CSS styles
    function addExportStyles() {
        const style = document.createElement('style');
        style.id = 'exportStyles';
        style.textContent = `
            /* Export dialog */
            .export-dialog {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .export-dialog-content {
                background: white;
                border-radius: 8px;
                width: 90%;
                max-width: 700px;
                max-height: 90vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }
            
            .export-dialog-header {
                padding: 20px;
                border-bottom: 1px solid #dee2e6;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .export-dialog-body {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
            }
            
            .export-dialog-footer {
                padding: 15px 20px;
                border-top: 1px solid #dee2e6;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }
            
            /* Export sections */
            .export-section {
                margin-bottom: 30px;
            }
            
            .export-section h4 {
                margin: 0 0 15px 0;
                color: #2c3e50;
                font-size: 14px;
                text-transform: uppercase;
            }
            
            .export-options label,
            .export-includes label {
                display: block;
                padding: 5px 0;
                cursor: pointer;
            }
            
            .export-options input,
            .export-includes input {
                margin-right: 8px;
            }
            
            /* Format buttons */
            .export-formats {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 10px;
            }
            
            .format-btn {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 15px;
                border: 2px solid #dee2e6;
                border-radius: 8px;
                background: white;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .format-btn:hover {
                border-color: #3498db;
                background: #f8f9fa;
            }
            
            .format-btn.active {
                border-color: #3498db;
                background: #e3f2fd;
            }
            
            .format-icon {
                font-size: 24px;
                margin-bottom: 5px;
            }
            
            .format-name {
                font-weight: bold;
                font-size: 14px;
                margin-bottom: 3px;
            }
            
            .format-desc {
                font-size: 11px;
                color: #6c757d;
            }
            
            /* Citation preview */
            .citation-preview {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 6px;
            }
            
            .citation-preview select {
                width: 100%;
                padding: 5px;
                margin-bottom: 10px;
                border: 1px solid #dee2e6;
                border-radius: 4px;
            }
            
            .citation-text {
                font-size: 12px;
                line-height: 1.6;
                color: #495057;
                font-style: italic;
            }
        `;
        document.head.appendChild(style);
    }

    // Initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initExport);
    } else {
        initExport();
    }

    // Export API
    window.exportAPI = {
        init: initExport,
        showDialog: showExportDialog,
        export: exportContent,
        generateCitation: generateCitation
    };

})();