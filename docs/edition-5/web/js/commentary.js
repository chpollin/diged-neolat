// Commentary Module for Lucina Digital Edition
// Manages scholarly commentary and annotations

(function() {
    'use strict';

    // Commentary state
    window.commentary = {
        enabled: false,
        notes: new Map(), // noteId -> note object
        annotations: new Map(), // lineId -> annotation array
        categories: ['textual', 'literary', 'historical', 'linguistic', 'metrical'],
        activeCategory: 'all',
        initialized: false
    };

    // Initialize commentary system
    function initCommentary() {
        if (window.commentary.initialized) return;
        
        console.log('Initializing commentary system...');
        
        // Load commentary data
        loadCommentaryData();
        
        // Setup UI
        setupCommentaryUI();
        
        // Add event listeners
        setupCommentaryListeners();
        
        window.commentary.initialized = true;
    }

    // Load commentary data
    async function loadCommentaryData() {
        try {
            // Try to load pre-existing commentary
            const response = await fetch('data/commentary.json');
            if (response.ok) {
                const data = await response.json();
                parseCommentaryData(data);
                console.log(`Loaded ${window.commentary.notes.size} commentary notes`);
            }
        } catch (error) {
            console.log('No commentary data found, initializing empty');
            // Load sample commentary for demonstration
            loadSampleCommentary();
        }
    }

    // Parse commentary data
    function parseCommentaryData(data) {
        if (data.notes) {
            data.notes.forEach(note => {
                window.commentary.notes.set(note.id, note);
                
                // Map to lines/poems
                if (note.target) {
                    const targets = Array.isArray(note.target) ? note.target : [note.target];
                    targets.forEach(target => {
                        if (!window.commentary.annotations.has(target)) {
                            window.commentary.annotations.set(target, []);
                        }
                        window.commentary.annotations.get(target).push(note.id);
                    });
                }
            });
        }
    }

    // Load sample commentary for demonstration
    function loadSampleCommentary() {
        const sampleNotes = [
            {
                id: 'note-1',
                target: 'poem-praefatio',
                category: 'literary',
                text: 'The praefatio establishes Albrisius\'s relationship with his patron Cicco Simonetta, explicitly comparing him to Maecenas, the famous patron of Augustan poets.',
                author: 'Editor',
                timestamp: '2024-01-15'
            },
            {
                id: 'note-2',
                target: 'poem-I.1-line-1',
                category: 'textual',
                text: 'The manuscript reading "Mecoenatem" preserves the medieval spelling. Classical Latin would have "Maecenatem".',
                author: 'Editor',
                timestamp: '2024-01-15'
            },
            {
                id: 'note-3',
                target: 'poem-I.1',
                category: 'historical',
                text: 'This poem was likely written shortly after Albrisius arrived at the Sforza court in Milan, around 1470.',
                author: 'Editor',
                timestamp: '2024-01-15'
            },
            {
                id: 'note-4',
                target: 'poem-I.2',
                category: 'literary',
                text: 'The Lucina figure first appears here, introduced through Ovidian elegiac conventions. Note the emphasis on visual beauty typical of Renaissance Neo-Latin poetry.',
                author: 'Editor',
                timestamp: '2024-01-15'
            },
            {
                id: 'note-5',
                target: 'poem-II.1',
                category: 'metrical',
                text: 'This poem experiments with caesura placement, showing Albrisius\'s technical mastery of the elegiac couplet.',
                author: 'Editor',
                timestamp: '2024-01-15'
            }
        ];
        
        sampleNotes.forEach(note => {
            window.commentary.notes.set(note.id, note);
            if (!window.commentary.annotations.has(note.target)) {
                window.commentary.annotations.set(note.target, []);
            }
            window.commentary.annotations.get(note.target).push(note.id);
        });
    }

    // Setup commentary UI
    function setupCommentaryUI() {
        // Add commentary indicators to text
        addCommentaryIndicators();
        
        // Create commentary panel
        createCommentaryPanel();
        
        // Add styles
        addCommentaryStyles();
    }

    // Add commentary indicators to annotated elements
    function addCommentaryIndicators() {
        window.commentary.annotations.forEach((noteIds, targetId) => {
            const element = document.querySelector(`[data-poem-id="${targetId}"], [data-line-id="${targetId}"]`);
            if (element) {
                // Add commentary indicator
                const indicator = document.createElement('span');
                indicator.className = 'commentary-indicator';
                indicator.setAttribute('data-note-count', noteIds.length);
                indicator.setAttribute('data-target-id', targetId);
                indicator.innerHTML = `<sup>[${noteIds.length}]</sup>`;
                indicator.title = `${noteIds.length} commentary note${noteIds.length > 1 ? 's' : ''}`;
                
                // Add click handler
                indicator.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showCommentaryNotes(targetId);
                });
                
                // Insert indicator
                if (element.classList.contains('poem')) {
                    const header = element.querySelector('.poem-header, h3');
                    if (header) {
                        header.appendChild(indicator);
                    }
                } else {
                    element.appendChild(indicator);
                }
            }
        });
    }

    // Create commentary panel
    function createCommentaryPanel() {
        const panel = document.createElement('div');
        panel.id = 'commentaryPanel';
        panel.className = 'commentary-panel';
        panel.style.display = 'none';
        panel.innerHTML = `
            <div class="commentary-panel-header">
                <h3>Commentary</h3>
                <div class="commentary-filters">
                    <select id="commentaryFilter" class="commentary-filter">
                        <option value="all">All Categories</option>
                        <option value="textual">Textual</option>
                        <option value="literary">Literary</option>
                        <option value="historical">Historical</option>
                        <option value="linguistic">Linguistic</option>
                        <option value="metrical">Metrical</option>
                    </select>
                </div>
                <button class="close-btn" onclick="closeCommentaryPanel()">×</button>
            </div>
            <div id="commentaryContent" class="commentary-panel-content">
                <div class="commentary-placeholder">
                    Select a marked passage to view commentary
                </div>
            </div>
            <div class="commentary-panel-footer">
                <button onclick="addNewNote()" class="btn">Add Note</button>
                <button onclick="exportCommentary()" class="btn">Export</button>
                <button onclick="closeCommentaryPanel()" class="btn primary">Close</button>
            </div>
        `;
        document.body.appendChild(panel);
        
        // Add handlers
        window.closeCommentaryPanel = function() {
            panel.style.display = 'none';
        };
        
        window.addNewNote = function() {
            showNoteEditor();
        };
        
        window.exportCommentary = function() {
            exportCommentaryData();
        };
        
        // Filter handler
        document.getElementById('commentaryFilter')?.addEventListener('change', (e) => {
            window.commentary.activeCategory = e.target.value;
            updateCommentaryDisplay();
        });
    }

    // Setup commentary view in main panel
    function setupCommentaryListeners() {
        // Handle view toggle
        const commentaryToggle = document.querySelector('[data-view="commentary"]');
        if (commentaryToggle) {
            commentaryToggle.addEventListener('click', () => {
                enableCommentaryView();
            });
        }
    }

    // Enable commentary view
    function enableCommentaryView() {
        window.commentary.enabled = true;
        
        // Update view
        const commentaryView = document.getElementById('commentaryView');
        if (commentaryView) {
            commentaryView.innerHTML = generateCommentaryHTML();
        }
        
        // Show commentary panel
        const panel = document.getElementById('commentaryPanel');
        if (panel) {
            panel.style.display = 'block';
        }
    }

    // Generate commentary HTML for main view
    function generateCommentaryHTML() {
        let html = '<div class="commentary-view-content">';
        html += '<h2>Scholarly Commentary</h2>';
        
        if (window.commentary.notes.size === 0) {
            html += '<p class="no-commentary">No commentary available yet.</p>';
            html += '<p>Commentary notes will appear here as they are added to the edition.</p>';
        } else {
            // Group notes by category
            const notesByCategory = new Map();
            window.commentary.notes.forEach(note => {
                const category = note.category || 'general';
                if (!notesByCategory.has(category)) {
                    notesByCategory.set(category, []);
                }
                notesByCategory.get(category).push(note);
            });
            
            // Display by category
            notesByCategory.forEach((notes, category) => {
                html += `<div class="commentary-category">`;
                html += `<h3>${category.charAt(0).toUpperCase() + category.slice(1)} Notes</h3>`;
                html += '<div class="commentary-notes">';
                
                notes.forEach(note => {
                    html += `
                        <div class="commentary-note" data-note-id="${note.id}">
                            <div class="note-header">
                                <span class="note-target">${formatNoteTarget(note.target)}</span>
                                <span class="note-meta">${note.author} • ${note.timestamp}</span>
                            </div>
                            <div class="note-text">${note.text}</div>
                        </div>
                    `;
                });
                
                html += '</div></div>';
            });
        }
        
        html += '</div>';
        return html;
    }

    // Show commentary notes for a target
    function showCommentaryNotes(targetId) {
        const noteIds = window.commentary.annotations.get(targetId) || [];
        const panel = document.getElementById('commentaryPanel');
        const content = document.getElementById('commentaryContent');
        
        if (!panel || !content) return;
        
        // Show panel
        panel.style.display = 'block';
        
        // Generate notes HTML
        let html = `<div class="target-notes">`;
        html += `<h4>Notes for ${formatNoteTarget(targetId)}</h4>`;
        
        if (noteIds.length === 0) {
            html += '<p>No notes for this passage.</p>';
        } else {
            noteIds.forEach(noteId => {
                const note = window.commentary.notes.get(noteId);
                if (note && (window.commentary.activeCategory === 'all' || note.category === window.commentary.activeCategory)) {
                    html += `
                        <div class="commentary-note" data-note-id="${note.id}">
                            <div class="note-category ${note.category}">${note.category}</div>
                            <div class="note-text">${note.text}</div>
                            <div class="note-footer">
                                <span class="note-author">${note.author}</span>
                                <span class="note-date">${note.timestamp}</span>
                            </div>
                        </div>
                    `;
                }
            });
        }
        
        html += '</div>';
        content.innerHTML = html;
    }

    // Format note target for display
    function formatNoteTarget(targetId) {
        if (!targetId) return 'General';
        
        if (targetId.startsWith('poem-')) {
            const poemId = targetId.replace('poem-', '');
            if (poemId === 'praefatio') return 'Praefatio';
            return `Poem ${poemId}`;
        } else if (targetId.includes('-line-')) {
            const parts = targetId.split('-line-');
            const poemId = parts[0].replace('poem-', '');
            const lineNum = parts[1];
            return `Poem ${poemId}, line ${lineNum}`;
        }
        
        return targetId;
    }

    // Show note editor
    function showNoteEditor(targetId = null) {
        const modal = document.createElement('div');
        modal.className = 'note-editor-modal';
        modal.innerHTML = `
            <div class="note-editor-content">
                <h3>Add Commentary Note</h3>
                <form id="noteEditorForm">
                    <div class="form-group">
                        <label>Target:</label>
                        <input type="text" id="noteTarget" value="${targetId || ''}" placeholder="e.g., poem-I.1 or poem-I.1-line-5">
                    </div>
                    <div class="form-group">
                        <label>Category:</label>
                        <select id="noteCategory">
                            <option value="textual">Textual</option>
                            <option value="literary">Literary</option>
                            <option value="historical">Historical</option>
                            <option value="linguistic">Linguistic</option>
                            <option value="metrical">Metrical</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Note:</label>
                        <textarea id="noteText" rows="5" placeholder="Enter your commentary..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>Author:</label>
                        <input type="text" id="noteAuthor" value="Editor">
                    </div>
                    <div class="form-buttons">
                        <button type="button" onclick="cancelNoteEditor()">Cancel</button>
                        <button type="submit">Save Note</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Handle form submission
        document.getElementById('noteEditorForm').addEventListener('submit', (e) => {
            e.preventDefault();
            saveNewNote();
            modal.remove();
        });
        
        window.cancelNoteEditor = function() {
            modal.remove();
        };
    }

    // Save new note
    function saveNewNote() {
        const target = document.getElementById('noteTarget').value;
        const category = document.getElementById('noteCategory').value;
        const text = document.getElementById('noteText').value;
        const author = document.getElementById('noteAuthor').value;
        
        if (!target || !text) return;
        
        const note = {
            id: `note-${Date.now()}`,
            target: target,
            category: category,
            text: text,
            author: author,
            timestamp: new Date().toISOString().split('T')[0]
        };
        
        // Add to state
        window.commentary.notes.set(note.id, note);
        if (!window.commentary.annotations.has(target)) {
            window.commentary.annotations.set(target, []);
        }
        window.commentary.annotations.get(target).push(note.id);
        
        // Update display
        addCommentaryIndicators();
        updateCommentaryDisplay();
        
        // Save to storage
        saveCommentaryData();
    }

    // Update commentary display
    function updateCommentaryDisplay() {
        const currentTarget = document.querySelector('.commentary-panel').getAttribute('data-current-target');
        if (currentTarget) {
            showCommentaryNotes(currentTarget);
        }
    }

    // Save commentary data
    function saveCommentaryData() {
        const data = {
            notes: Array.from(window.commentary.notes.values()),
            timestamp: new Date().toISOString()
        };
        
        // Save to localStorage for persistence
        localStorage.setItem('commentaryData', JSON.stringify(data));
        
        // If edit mode is enabled, also save to file
        if (window.editMode && window.editMode.enabled) {
            // Use edit mode save functionality
            console.log('Commentary data saved');
        }
    }

    // Export commentary data
    function exportCommentaryData() {
        const data = {
            notes: Array.from(window.commentary.notes.values()),
            annotations: Object.fromEntries(window.commentary.annotations),
            exported: new Date().toISOString()
        };
        
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `commentary-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    // Add CSS styles
    function addCommentaryStyles() {
        const style = document.createElement('style');
        style.id = 'commentaryStyles';
        style.textContent = `
            /* Commentary indicators */
            .commentary-indicator {
                display: inline-block;
                margin-left: 4px;
                color: #3498db;
                cursor: pointer;
                font-size: 12px;
            }
            
            .commentary-indicator:hover {
                color: #2980b9;
                text-decoration: underline;
            }
            
            .commentary-indicator sup {
                font-weight: bold;
            }
            
            /* Commentary panel */
            .commentary-panel {
                position: fixed;
                top: 80px;
                left: 20px;
                width: 400px;
                max-height: 80vh;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 1000;
                display: flex;
                flex-direction: column;
            }
            
            .commentary-panel-header {
                padding: 15px 20px;
                border-bottom: 1px solid #dee2e6;
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .commentary-panel-header h3 {
                margin: 0;
                flex: 1;
            }
            
            .commentary-filters {
                flex: 2;
            }
            
            .commentary-filter {
                width: 100%;
                padding: 5px;
                border: 1px solid #dee2e6;
                border-radius: 4px;
            }
            
            .commentary-panel-content {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
            }
            
            .commentary-panel-footer {
                padding: 15px 20px;
                border-top: 1px solid #dee2e6;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }
            
            /* Commentary notes */
            .commentary-note {
                margin-bottom: 15px;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 6px;
                border-left: 3px solid #3498db;
            }
            
            .note-category {
                display: inline-block;
                padding: 2px 8px;
                border-radius: 3px;
                font-size: 11px;
                text-transform: uppercase;
                font-weight: bold;
                margin-bottom: 8px;
            }
            
            .note-category.textual { background: #e8f5e9; color: #2e7d32; }
            .note-category.literary { background: #e3f2fd; color: #1565c0; }
            .note-category.historical { background: #fff3e0; color: #e65100; }
            .note-category.linguistic { background: #f3e5f5; color: #6a1b9a; }
            .note-category.metrical { background: #fce4ec; color: #c2185b; }
            
            .note-text {
                margin: 10px 0;
                line-height: 1.6;
                color: #2c3e50;
            }
            
            .note-footer {
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                color: #6c757d;
                margin-top: 10px;
            }
            
            /* Commentary view */
            .commentary-view-content {
                padding: 30px;
                max-width: 800px;
                margin: 0 auto;
            }
            
            .commentary-view-content h2 {
                color: #2c3e50;
                margin-bottom: 30px;
            }
            
            .commentary-category {
                margin-bottom: 40px;
            }
            
            .commentary-category h3 {
                color: #34495e;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 2px solid #ecf0f1;
            }
            
            /* Note editor modal */
            .note-editor-modal {
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
            
            .note-editor-content {
                background: white;
                padding: 30px;
                border-radius: 8px;
                width: 90%;
                max-width: 500px;
            }
            
            .note-editor-content h3 {
                margin: 0 0 20px 0;
            }
            
            .form-group {
                margin-bottom: 15px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
                font-size: 14px;
            }
            
            .form-group input,
            .form-group select,
            .form-group textarea {
                width: 100%;
                padding: 8px;
                border: 1px solid #dee2e6;
                border-radius: 4px;
                font-size: 14px;
            }
            
            .form-buttons {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                margin-top: 20px;
            }
            
            .form-buttons button {
                padding: 8px 16px;
                border: 1px solid #dee2e6;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
            }
            
            .form-buttons button[type="submit"] {
                background: #3498db;
                color: white;
                border-color: #3498db;
            }
        `;
        document.head.appendChild(style);
    }

    // Initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCommentary);
    } else {
        initCommentary();
    }

    // Export API
    window.commentaryAPI = {
        init: initCommentary,
        enable: enableCommentaryView,
        addNote: showNoteEditor,
        getNotes: () => Array.from(window.commentary.notes.values()),
        getAnnotations: (targetId) => {
            const noteIds = window.commentary.annotations.get(targetId) || [];
            return noteIds.map(id => window.commentary.notes.get(id)).filter(Boolean);
        },
        export: exportCommentaryData
    };

})();