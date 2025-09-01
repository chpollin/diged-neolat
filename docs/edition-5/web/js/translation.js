// Translation Module for Lucina Digital Edition
// Manages English translations of the Latin text

(function() {
    'use strict';

    // Translation state
    window.translation = {
        enabled: false,
        translations: new Map(), // poemId -> translation object
        lineTranslations: new Map(), // lineId -> translation
        language: 'en', // default to English
        displayMode: 'parallel', // 'parallel', 'interlinear', 'standalone'
        initialized: false
    };

    // Initialize translation system
    function initTranslation() {
        if (window.translation.initialized) return;
        
        console.log('Initializing translation system...');
        
        // Load translation data
        loadTranslationData();
        
        // Setup UI
        setupTranslationUI();
        
        // Setup listeners
        setupTranslationListeners();
        
        window.translation.initialized = true;
    }

    // Load translation data
    async function loadTranslationData() {
        try {
            const response = await fetch('data/translations.json');
            if (response.ok) {
                const data = await response.json();
                parseTranslationData(data);
                console.log(`Loaded translations for ${window.translation.translations.size} poems`);
            }
        } catch (error) {
            console.log('No translation data found, loading sample translations');
            loadSampleTranslations();
        }
    }

    // Parse translation data
    function parseTranslationData(data) {
        if (data.poems) {
            data.poems.forEach(poem => {
                window.translation.translations.set(poem.id, poem);
                
                // Map individual lines
                if (poem.lines) {
                    poem.lines.forEach((translation, index) => {
                        const lineId = `${poem.id}-line-${index + 1}`;
                        window.translation.lineTranslations.set(lineId, translation);
                    });
                }
            });
        }
    }

    // Load sample translations for demonstration
    function loadSampleTranslations() {
        const sampleTranslations = {
            poems: [
                {
                    id: 'poem-praefatio',
                    title: 'To Cicco Simonetta, My Maecenas',
                    translator: 'Sample Translation',
                    lines: [
                        'Accept, Cicco, these verses which your poet offers,',
                        'A small gift, but given with a grateful heart.',
                        'You who, like Maecenas of old, support the Muses,',
                        'And nurture poets with your generous hand.',
                        'May these humble songs please your discerning ear,',
                        'As I sing of love and the flames that burn within.',
                        'Lucina shall be my theme, that radiant maiden,',
                        'Whose beauty rivals the morning star itself.',
                        'Through elegiac verse I\'ll tell our story,',
                        'How Cupid\'s arrows found their mark in me.',
                        'But you, great patron, are the one who makes this possible,',
                        'Without your support, my voice would be but silence.',
                        'So take these offerings of a grateful client,',
                        'Who owes to you whatever fame he gains.',
                        'May the Sforza court long flourish under your guidance,',
                        'And may poetry bloom beneath your care.',
                        'Thus speaks Albrisius, your devoted poet,',
                        'Who dedicates this work to you alone.'
                    ],
                    notes: 'This translation attempts to capture the formal tone of the Renaissance Latin dedication while making it accessible to modern readers.'
                },
                {
                    id: 'poem-I.1',
                    title: 'To Cicco Simonetta',
                    translator: 'Sample Translation',
                    lines: [
                        'O Cicco, glory of the Milanese court,',
                        'Right hand of the mighty Sforza duke,',
                        'You who manage affairs of state with wisdom,',
                        'Yet find time to encourage learned pursuits.',
                        'The ancient Romans had their Maecenas,',
                        'Friend to Virgil and patron of Horace;',
                        'Now Milan boasts its equal in your person,',
                        'A new Maecenas for a new age.',
                        'Under your protection, the arts flourish,',
                        'Poets and scholars gather at your table.',
                        'You understand that power needs culture,',
                        'That swords alone cannot build lasting glory.',
                        'Accept then this work from your client poet,',
                        'Who seeks to honor you with elegant verse.',
                        'May future ages, reading these lines,',
                        'Know that Simonetta fostered excellence.',
                        'And may your name, linked with the Sforzas,',
                        'Live forever in the memory of men.',
                        'For patrons like you make civilization possible,',
                        'Turning raw power into refined culture.',
                        'Thus I begin my collection with your praise,',
                        'Making you the alpha of my alphabet of song.'
                    ]
                },
                {
                    id: 'poem-I.2',
                    title: 'First Sight of Lucina',
                    translator: 'Sample Translation',
                    lines: [
                        'It was the feast of Saint Francis when I saw her,',
                        'There in the church, bathed in colored light.',
                        'The stained glass windows cast jeweled shadows,',
                        'But none could match the radiance of her face.',
                        'She knelt in prayer, a vision of devotion,',
                        'Her golden hair like a halo round her head.',
                        'I forgot the saint, forgot the holy service,',
                        'My eyes could see nothing but this earthly angel.',
                        'When she rose and turned, our glances met—',
                        'Lightning struck, though the sky was clear.',
                        'In that instant, I was lost forever,',
                        'Cupid\'s arrow had found its destined mark.',
                        'Her name, I learned, was Lucina—Light-bringer,',
                        'How fitting for one who illuminates the darkness!',
                        'From that day forward, she became my obsession,',
                        'The sole subject of my waking thoughts and dreams.',
                        'O cruel Love, why do you torment poets?',
                        'Why make us sing of what we cannot have?',
                        'Yet I am grateful for this sweet affliction,',
                        'For it gives birth to verse, if not to joy.'
                    ]
                }
            ]
        };
        
        parseTranslationData(sampleTranslations);
    }

    // Setup translation UI
    function setupTranslationUI() {
        // Create translation panel
        createTranslationPanel();
        
        // Add translation mode selector
        addTranslationModeSelector();
        
        // Add styles
        addTranslationStyles();
    }

    // Create translation panel
    function createTranslationPanel() {
        const panel = document.createElement('div');
        panel.id = 'translationPanel';
        panel.className = 'translation-panel';
        panel.style.display = 'none';
        panel.innerHTML = `
            <div class="translation-panel-header">
                <h3>Translation Options</h3>
                <button class="close-btn" onclick="closeTranslationPanel()">×</button>
            </div>
            <div class="translation-panel-content">
                <div class="translation-options">
                    <div class="option-group">
                        <label>Display Mode:</label>
                        <select id="translationMode">
                            <option value="parallel">Parallel Text</option>
                            <option value="interlinear">Interlinear</option>
                            <option value="standalone">Translation Only</option>
                        </select>
                    </div>
                    <div class="option-group">
                        <label>Language:</label>
                        <select id="translationLanguage">
                            <option value="en">English</option>
                            <option value="it">Italian (coming soon)</option>
                            <option value="de">German (coming soon)</option>
                        </select>
                    </div>
                    <div class="option-group">
                        <label>Show Notes:</label>
                        <input type="checkbox" id="showTranslationNotes" checked>
                    </div>
                </div>
                <div class="translation-stats">
                    <h4>Translation Coverage</h4>
                    <div id="translationStats"></div>
                </div>
            </div>
            <div class="translation-panel-footer">
                <button onclick="exportTranslations()" class="btn">Export</button>
                <button onclick="closeTranslationPanel()" class="btn primary">Close</button>
            </div>
        `;
        document.body.appendChild(panel);
        
        // Add handlers
        window.closeTranslationPanel = function() {
            panel.style.display = 'none';
        };
        
        window.exportTranslations = function() {
            exportTranslationData();
        };
        
        // Mode selector handler
        document.getElementById('translationMode')?.addEventListener('change', (e) => {
            window.translation.displayMode = e.target.value;
            updateTranslationDisplay();
        });
        
        // Language selector handler
        document.getElementById('translationLanguage')?.addEventListener('change', (e) => {
            window.translation.language = e.target.value;
            updateTranslationDisplay();
        });
    }

    // Add translation mode selector to main UI
    function addTranslationModeSelector() {
        // This is handled by the view toggle in the main navigation
        // We'll enhance it here
    }

    // Setup translation listeners
    function setupTranslationListeners() {
        // Handle translation view toggle
        const translationToggle = document.querySelector('[data-view="translation"]');
        if (translationToggle) {
            translationToggle.addEventListener('click', () => {
                enableTranslationView();
            });
        }
    }

    // Enable translation view
    function enableTranslationView() {
        window.translation.enabled = true;
        
        // Show translation panel
        const panel = document.getElementById('translationPanel');
        if (panel) {
            panel.style.display = 'block';
            updateTranslationStats();
        }
        
        // Update main view
        const translationView = document.getElementById('translationView');
        if (translationView) {
            translationView.innerHTML = generateTranslationHTML();
        }
    }

    // Generate translation HTML
    function generateTranslationHTML() {
        const mode = window.translation.displayMode;
        let html = '<div class="translation-view-content">';
        
        if (window.translation.translations.size === 0) {
            html += `
                <div class="no-translation">
                    <h2>Translations</h2>
                    <p>English translations are being prepared and will be available soon.</p>
                    <p>The translation will provide:</p>
                    <ul>
                        <li>Accurate rendering of the Latin elegiac couplets</li>
                        <li>Preservation of poetic imagery and tone</li>
                        <li>Explanatory notes for cultural references</li>
                        <li>Alternative readings where the Latin is ambiguous</li>
                    </ul>
                </div>
            `;
        } else {
            // Get current poem
            const currentPoemId = getCurrentPoemId();
            const translation = window.translation.translations.get(currentPoemId);
            
            if (translation) {
                html += renderTranslation(translation, mode);
            } else {
                html += `
                    <div class="translation-unavailable">
                        <p>Translation not yet available for this poem.</p>
                    </div>
                `;
            }
        }
        
        html += '</div>';
        return html;
    }

    // Render translation based on display mode
    function renderTranslation(translation, mode) {
        let html = '';
        
        switch (mode) {
            case 'parallel':
                html = renderParallelTranslation(translation);
                break;
            case 'interlinear':
                html = renderInterlinearTranslation(translation);
                break;
            case 'standalone':
                html = renderStandaloneTranslation(translation);
                break;
            default:
                html = renderParallelTranslation(translation);
        }
        
        return html;
    }

    // Render parallel text translation
    function renderParallelTranslation(translation) {
        let html = '<div class="parallel-translation">';
        html += '<div class="translation-header">';
        html += `<h2>${translation.title}</h2>`;
        if (translation.translator) {
            html += `<p class="translator">Translated by ${translation.translator}</p>`;
        }
        html += '</div>';
        
        html += '<div class="parallel-container">';
        
        // Get original Latin text
        const latinText = getLatinText(translation.id);
        
        // Latin column
        html += '<div class="latin-column">';
        html += '<h3>Latin Text</h3>';
        if (latinText && latinText.lines) {
            latinText.lines.forEach((line, index) => {
                const lineNum = index + 1;
                const isHexameter = lineNum % 2 === 1;
                html += `
                    <div class="parallel-line ${isHexameter ? 'hexameter' : 'pentameter'}">
                        <span class="line-number">${lineNum}</span>
                        <span class="line-text">${line}</span>
                    </div>
                `;
            });
        }
        html += '</div>';
        
        // Translation column
        html += '<div class="translation-column">';
        html += '<h3>English Translation</h3>';
        if (translation.lines) {
            translation.lines.forEach((line, index) => {
                const lineNum = index + 1;
                html += `
                    <div class="parallel-line">
                        <span class="line-number">${lineNum}</span>
                        <span class="line-text">${line}</span>
                    </div>
                `;
            });
        }
        html += '</div>';
        
        html += '</div>'; // parallel-container
        
        if (translation.notes) {
            html += `
                <div class="translation-notes">
                    <h4>Translation Notes</h4>
                    <p>${translation.notes}</p>
                </div>
            `;
        }
        
        html += '</div>'; // parallel-translation
        return html;
    }

    // Render interlinear translation
    function renderInterlinearTranslation(translation) {
        let html = '<div class="interlinear-translation">';
        html += '<div class="translation-header">';
        html += `<h2>${translation.title}</h2>`;
        html += '</div>';
        
        const latinText = getLatinText(translation.id);
        
        if (latinText && latinText.lines && translation.lines) {
            latinText.lines.forEach((latinLine, index) => {
                const translationLine = translation.lines[index] || '';
                const lineNum = index + 1;
                const isHexameter = lineNum % 2 === 1;
                
                html += `
                    <div class="interlinear-pair ${isHexameter ? 'hexameter' : 'pentameter'}">
                        <div class="interlinear-latin">
                            <span class="line-number">${lineNum}</span>
                            <span class="line-text">${latinLine}</span>
                        </div>
                        <div class="interlinear-english">
                            <span class="translation-text">${translationLine}</span>
                        </div>
                    </div>
                `;
            });
        }
        
        html += '</div>';
        return html;
    }

    // Render standalone translation
    function renderStandaloneTranslation(translation) {
        let html = '<div class="standalone-translation">';
        html += '<div class="translation-header">';
        html += `<h2>${translation.title}</h2>`;
        if (translation.translator) {
            html += `<p class="translator">Translated by ${translation.translator}</p>`;
        }
        html += '</div>';
        
        html += '<div class="translation-body">';
        if (translation.lines) {
            translation.lines.forEach((line, index) => {
                const lineNum = index + 1;
                const isHexameter = lineNum % 2 === 1;
                html += `
                    <div class="translation-line ${isHexameter ? 'verse-start' : 'verse-end'}">
                        <span class="line-number">${lineNum}</span>
                        <span class="line-text">${line}</span>
                    </div>
                `;
            });
        }
        html += '</div>';
        
        if (translation.notes) {
            html += `
                <div class="translation-notes">
                    <h4>Notes</h4>
                    <p>${translation.notes}</p>
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    }

    // Get Latin text for a poem
    function getLatinText(poemId) {
        // Access the global poems variable (not window.poems)
        if (typeof poems !== 'undefined') {
            const poem = poems.find(p => p.id === poemId);
            if (poem) {
                return { lines: poem.lines || [] };
            }
        }
        return { lines: [] };
    }

    // Get current poem ID
    function getCurrentPoemId() {
        // Get from the current selection or URL
        const poemSelect = document.getElementById('poemSelect');
        if (poemSelect && poemSelect.value) {
            return poemSelect.value;
        }
        
        // Check URL hash
        if (window.location.hash) {
            const match = window.location.hash.match(/poem-[IVX]+\.\d+|praefatio/);
            if (match) {
                return 'poem-' + match[0].replace('poem-', '');
            }
        }
        
        return 'poem-praefatio'; // default
    }

    // Update translation display
    function updateTranslationDisplay() {
        if (window.translation.enabled) {
            const translationView = document.getElementById('translationView');
            if (translationView) {
                translationView.innerHTML = generateTranslationHTML();
            }
        }
    }

    // Update translation statistics
    function updateTranslationStats() {
        const statsDiv = document.getElementById('translationStats');
        if (!statsDiv) return;
        
        // Access the global poems variable
        const totalPoems = (typeof poems !== 'undefined' ? poems.length : 0) || 128;
        const translatedPoems = window.translation.translations.size;
        const percentage = ((translatedPoems / totalPoems) * 100).toFixed(1);
        
        statsDiv.innerHTML = `
            <ul>
                <li>Total poems: ${totalPoems}</li>
                <li>Translated: ${translatedPoems} (${percentage}%)</li>
                <li>In progress: ${totalPoems - translatedPoems}</li>
            </ul>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${percentage}%"></div>
            </div>
        `;
    }

    // Export translation data
    function exportTranslationData() {
        const data = {
            translations: Array.from(window.translation.translations.values()),
            language: window.translation.language,
            exported: new Date().toISOString()
        };
        
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `translations-${window.translation.language}-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    // Add CSS styles
    function addTranslationStyles() {
        const style = document.createElement('style');
        style.id = 'translationStyles';
        style.textContent = `
            /* Translation panel */
            .translation-panel {
                position: fixed;
                top: 80px;
                right: 20px;
                width: 350px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 1000;
            }
            
            .translation-panel-header {
                padding: 15px 20px;
                border-bottom: 1px solid #dee2e6;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .translation-panel-content {
                padding: 20px;
            }
            
            .translation-options {
                margin-bottom: 20px;
            }
            
            .option-group {
                margin-bottom: 15px;
            }
            
            .option-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
                font-size: 13px;
            }
            
            .option-group select,
            .option-group input {
                width: 100%;
                padding: 5px;
                border: 1px solid #dee2e6;
                border-radius: 4px;
            }
            
            .translation-stats h4 {
                margin: 20px 0 10px 0;
                font-size: 14px;
            }
            
            .translation-stats ul {
                list-style: none;
                padding: 0;
                margin: 0;
                font-size: 13px;
            }
            
            .translation-stats li {
                padding: 3px 0;
            }
            
            .progress-bar {
                width: 100%;
                height: 20px;
                background: #ecf0f1;
                border-radius: 10px;
                overflow: hidden;
                margin-top: 10px;
            }
            
            .progress-fill {
                height: 100%;
                background: #3498db;
                transition: width 0.3s;
            }
            
            .translation-panel-footer {
                padding: 15px 20px;
                border-top: 1px solid #dee2e6;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }
            
            /* Translation view content */
            .translation-view-content {
                padding: 30px;
                max-width: 1200px;
                margin: 0 auto;
            }
            
            .no-translation {
                text-align: center;
                padding: 50px;
                color: #6c757d;
            }
            
            .no-translation h2 {
                color: #2c3e50;
                margin-bottom: 20px;
            }
            
            .no-translation ul {
                text-align: left;
                max-width: 500px;
                margin: 20px auto;
            }
            
            /* Parallel translation */
            .parallel-translation {
                width: 100%;
            }
            
            .translation-header {
                text-align: center;
                margin-bottom: 30px;
            }
            
            .translation-header h2 {
                color: #2c3e50;
                margin-bottom: 10px;
            }
            
            .translator {
                color: #6c757d;
                font-style: italic;
            }
            
            .parallel-container {
                display: flex;
                gap: 40px;
            }
            
            .latin-column,
            .translation-column {
                flex: 1;
            }
            
            .latin-column h3,
            .translation-column h3 {
                color: #34495e;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 2px solid #ecf0f1;
            }
            
            .parallel-line {
                display: flex;
                margin-bottom: 8px;
                min-height: 24px;
                align-items: baseline;
            }
            
            .parallel-line.pentameter {
                margin-left: 30px;
            }
            
            .parallel-line .line-number {
                width: 30px;
                text-align: right;
                margin-right: 15px;
                color: #95a5a6;
                font-size: 12px;
            }
            
            .parallel-line .line-text {
                flex: 1;
                line-height: 1.6;
            }
            
            /* Interlinear translation */
            .interlinear-translation {
                padding: 20px;
            }
            
            .interlinear-pair {
                margin-bottom: 20px;
                padding-bottom: 20px;
                border-bottom: 1px solid #ecf0f1;
            }
            
            .interlinear-pair.pentameter {
                margin-left: 30px;
            }
            
            .interlinear-latin {
                display: flex;
                margin-bottom: 5px;
                font-size: 16px;
            }
            
            .interlinear-english {
                margin-left: 45px;
                color: #3498db;
                font-style: italic;
                font-size: 14px;
            }
            
            /* Standalone translation */
            .standalone-translation {
                max-width: 800px;
                margin: 0 auto;
            }
            
            .translation-body {
                font-size: 18px;
                line-height: 1.8;
            }
            
            .translation-line {
                display: flex;
                margin-bottom: 8px;
            }
            
            .translation-line.verse-end {
                margin-bottom: 16px;
                margin-left: 30px;
            }
            
            /* Translation notes */
            .translation-notes {
                margin-top: 40px;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 6px;
            }
            
            .translation-notes h4 {
                color: #34495e;
                margin-bottom: 10px;
            }
            
            .translation-notes p {
                color: #6c757d;
                line-height: 1.6;
            }
        `;
        document.head.appendChild(style);
    }

    // Initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTranslation);
    } else {
        initTranslation();
    }

    // Update when poem changes
    window.addEventListener('poemChanged', updateTranslationDisplay);

    // Export API
    window.translationAPI = {
        init: initTranslation,
        enable: enableTranslationView,
        setMode: (mode) => {
            window.translation.displayMode = mode;
            updateTranslationDisplay();
        },
        getTranslation: (poemId) => window.translation.translations.get(poemId),
        addTranslation: (poemId, translation) => {
            window.translation.translations.set(poemId, translation);
            updateTranslationDisplay();
        },
        export: exportTranslationData
    };

})();