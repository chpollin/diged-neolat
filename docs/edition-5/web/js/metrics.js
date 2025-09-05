// Metrics Module for Lucina Digital Edition
// Handles inline metrical pattern display above Latin verses

(function() {
    'use strict';

    // Metrics state
    window.metrics = {
        enabled: false,
        patterns: new Map(), // lineId -> scansion pattern
        initialized: false
    };

    // Standard metrical patterns for elegiac couplets
    const PATTERNS = {
        hexameter: '— ˘ ˘ | — ˘ ˘ | — || — ˘ ˘ | — ˘ ˘ | — ˘ ˘ | — ×',
        pentameter: '— ˘ ˘ | — ˘ ˘ | — || — ˘ ˘ | — ˘ ˘ | —'
    };

    // Initialize metrics system
    function initMetrics() {
        if (window.metrics.initialized) return;
        
        console.log('Initializing metrics system...');
        
        // Start with metrics disabled by default
        window.metrics.enabled = false;
        
        // Don't create separate button - will be handled by view dropdown
        
        // Add styles
        addMetricsStyles();
        
        // Load any pre-computed metrical data
        loadMetricalData();
        
        window.metrics.initialized = true;
    }

    // Toggle metrics display (now called from view dropdown)
    function toggleMetrics(enable) {
        if (typeof enable === 'boolean') {
            window.metrics.enabled = enable;
        } else {
            window.metrics.enabled = !window.metrics.enabled;
        }
        
        applyMetricsState();
    }

    // Apply the current metrics state to the page
    function applyMetricsState() {
        if (window.metrics.enabled) {
            enableMetrics();
        } else {
            disableMetrics();
        }
    }

    // Enable metrics display
    function enableMetrics() {
        document.body.classList.add('metrics-enabled');
        
        // Process all verse lines - wait a bit for any pending renders
        setTimeout(() => {
            const lines = document.querySelectorAll('.line');
            console.log(`Found ${lines.length} lines to add metrics to`);
            lines.forEach(line => {
                addMetricsToLine(line);
            });
        }, 50);
    }

    // Disable metrics display
    function disableMetrics() {
        document.body.classList.remove('metrics-enabled');
        
        // Remove all metrical notations and unwrap content
        const lines = document.querySelectorAll('.has-metrics');
        lines.forEach(line => {
            const wrapper = line.querySelector('.line-with-metrics');
            if (wrapper) {
                // Remove notation
                const notation = wrapper.querySelector('.metrical-notation');
                if (notation) notation.remove();
                
                // Move content back to line element
                while (wrapper.firstChild) {
                    line.appendChild(wrapper.firstChild);
                }
                wrapper.remove();
            }
            line.classList.remove('has-metrics');
        });
    }

    // Add metrics to a line element
    function addMetricsToLine(lineElement) {
        // Skip if metrics already added
        if (lineElement.querySelector('.metrical-notation')) return;
        
        // Skip if this is not actually a verse line
        if (!lineElement.classList.contains('line')) return;
        
        // Get line information
        const lineNum = lineElement.querySelector('.ln')?.textContent || 
                       lineElement.querySelector('.line-number')?.textContent;
        
        if (!lineNum) return;
        
        // Determine meter type (alternating hexameter/pentameter for elegiac couplets)
        const lineNumber = parseInt(lineNum);
        const isHexameter = lineNumber % 2 === 1;
        const pattern = isHexameter ? PATTERNS.hexameter : PATTERNS.pentameter;
        
        // Get the line text
        const textElement = lineElement.querySelector('.txt') || 
                          lineElement.querySelector('.line-text') || 
                          lineElement;
        
        if (!textElement) return;
        
        // Create notation element
        const notation = createMetricalNotation(pattern, textElement.textContent);
        
        // Create a wrapper for better structure
        const wrapper = document.createElement('div');
        wrapper.className = 'line-with-metrics';
        
        // Move existing content to wrapper
        while (lineElement.firstChild) {
            wrapper.appendChild(lineElement.firstChild);
        }
        
        // Add notation at the beginning of wrapper
        wrapper.insertBefore(notation, wrapper.firstChild);
        
        // Add wrapper back to line element
        lineElement.appendChild(wrapper);
        lineElement.classList.add('has-metrics');
    }

    // Create metrical notation element
    function createMetricalNotation(pattern, text) {
        const notation = document.createElement('div');
        notation.className = 'metrical-notation';
        
        // Split text into syllables (simplified - a full implementation would use proper syllabification)
        const syllables = syllabifyLatin(text);
        
        // If we have syllable-level alignment, create aligned notation
        if (syllables && syllables.length > 0) {
            notation.innerHTML = createAlignedNotation(pattern, syllables);
        } else {
            // Fallback to simple pattern display
            notation.innerHTML = `<span class="pattern">${pattern}</span>`;
        }
        
        return notation;
    }

    // Simple Latin syllabification (basic implementation)
    function syllabifyLatin(text) {
        // Remove punctuation and normalize
        const cleanText = text.replace(/[.,;:!?]/g, '').toLowerCase();
        const words = cleanText.split(/\s+/);
        
        const syllables = [];
        
        words.forEach(word => {
            // Very simplified syllable breaking
            // A proper implementation would follow Latin syllabification rules
            const wordSyllables = breakIntoSyllables(word);
            syllables.push(...wordSyllables);
        });
        
        return syllables;
    }

    // Break a word into syllables (simplified)
    function breakIntoSyllables(word) {
        const syllables = [];
        let current = '';
        
        for (let i = 0; i < word.length; i++) {
            const char = word[i];
            current += char;
            
            // Simple vowel-based splitting
            if (isVowel(char)) {
                // Look ahead for consonant clusters
                if (i < word.length - 1 && !isVowel(word[i + 1])) {
                    // Check if next char should stay with this syllable
                    if (i < word.length - 2 && !isVowel(word[i + 2])) {
                        // Keep first consonant with this syllable
                        current += word[i + 1];
                        i++;
                    }
                }
                syllables.push(current);
                current = '';
            }
        }
        
        // Add remaining consonants to last syllable
        if (current && syllables.length > 0) {
            syllables[syllables.length - 1] += current;
        } else if (current) {
            syllables.push(current);
        }
        
        return syllables;
    }

    // Check if character is a vowel
    function isVowel(char) {
        return /[aeiouAEIOU]/.test(char);
    }

    // Create aligned notation with syllables
    function createAlignedNotation(pattern, syllables) {
        // Parse pattern into symbols
        const symbols = pattern.split(/\s+/);
        
        // Create HTML with aligned symbols and syllables
        let html = '<div class="notation-container">';
        
        // Notation row
        html += '<div class="notation-row">';
        symbols.forEach(symbol => {
            html += `<span class="metrical-symbol">${symbol}</span>`;
        });
        html += '</div>';
        
        html += '</div>';
        
        return html;
    }

    // Load pre-computed metrical data if available
    async function loadMetricalData() {
        try {
            // Check for metrical data file
            const response = await fetch('data/metrics.json');
            if (response.ok) {
                const data = await response.json();
                
                // Store patterns
                if (data.patterns) {
                    Object.entries(data.patterns).forEach(([lineId, pattern]) => {
                        window.metrics.patterns.set(lineId, pattern);
                    });
                }
                
                console.log('Loaded pre-computed metrical patterns');
            }
        } catch (error) {
            // Use default patterns if no data file
            console.log('Using default metrical patterns');
        }
    }

    // Add CSS styles for metrics
    function addMetricsStyles() {
        if (document.getElementById('metricsStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'metricsStyles';
        style.textContent = `
            /* Hide old navbar button */
            #metricsToggle {
                display: none !important;
            }
            
            /* Metrical notation display */
            .metrical-notation {
                display: none;
                font-family: 'Times New Roman', serif;
                font-size: 80%;
                color: #999999;
                line-height: 1.5;
                padding-bottom: 0.3em;
                letter-spacing: 0.05em;
                overflow-x: auto;
                -webkit-overflow-scrolling: touch;
            }
            
            /* Show notation when metrics enabled */
            body.metrics-enabled .metrical-notation {
                display: block;
            }
            
            /* Line with metrics - better structure */
            .line {
                position: relative;
                display: block;
                margin: 0.5em 0;
            }
            
            body.metrics-enabled .line.has-metrics .metrical-notation {
                display: block !important;
                margin-bottom: 0.3em;
            }
            
            /* Line with metrics wrapper */
            .line-with-metrics {
                display: block;
            }
            
            .line-with-metrics .metrical-notation {
                margin-left: 56px; /* Align with text, skip line number width */
            }
            
            /* Keep line numbers and text inline */
            .line .ln {
                display: inline-block;
                width: 40px;
                text-align: right;
                margin-right: 1em;
                color: #999;
                vertical-align: top;
            }
            
            .line .txt {
                display: inline;
            }
            
            /* Notation container for alignment */
            .notation-container {
                display: inline-block;
                position: relative;
            }
            
            /* Notation row */
            .notation-row {
                display: flex;
                gap: 0.2em;
                white-space: nowrap;
            }
            
            /* Individual metrical symbols */
            .metrical-symbol {
                display: inline-block;
                text-align: center;
                min-width: 1em;
            }
            
            /* Pattern display (fallback) */
            .pattern {
                display: inline-block;
                white-space: pre;
                font-family: 'Courier New', monospace;
            }
            
            /* Caesura marks */
            .metrical-symbol:contains("||"),
            .metrical-symbol:contains("|") {
                color: #999;
                font-weight: bold;
            }
            
            /* Print styles */
            @media print {
                .metrical-notation {
                    display: none !important;
                }
                
                .metrics-toggle {
                    display: none !important;
                }
            }
            
            /* Mobile responsive */
            @media (max-width: 768px) {
                .metrical-notation {
                    font-size: 70%;
                    max-width: 100%;
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                }
                
                .notation-row {
                    gap: 0.1em;
                }
                
                .metrics-toggle-btn {
                    font-size: 13px;
                    padding: 6px 12px;
                }
                
                .metrics-button-container {
                    padding: 10px 0;
                }
                
                /* Prevent horizontal overflow */
                body.metrics-enabled .line.has-metrics {
                    max-width: 100%;
                    overflow-x: auto;
                }
            }
            
            /* Improved line spacing when metrics shown */
            body.metrics-enabled .line,
            body.metrics-enabled .txt {
                padding-top: 0.3em;
                padding-bottom: 0.3em;
            }
            
            /* Ensure proper alignment with line numbers */
            body.metrics-enabled .line-number,
            body.metrics-enabled .ln {
                vertical-align: top;
            }
        `;
        document.head.appendChild(style);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMetrics);
    } else {
        initMetrics();
    }

    // Re-process lines when new content is loaded
    window.addEventListener('poemLoaded', () => {
        if (window.metrics.enabled) {
            setTimeout(() => {
                const lines = document.querySelectorAll('.line:not(.has-metrics)');
                lines.forEach(line => {
                    addMetricsToLine(line);
                });
            }, 100);
        }
    });
    
    // Also watch for DOM changes using MutationObserver
    const observer = new MutationObserver((mutations) => {
        // Only process if metrics are actually enabled
        if (!window.metrics || !window.metrics.enabled) return;
        
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        // Check if it's a line or contains lines
                        if (node.classList && node.classList.contains('line')) {
                            addMetricsToLine(node);
                        } else if (node.querySelectorAll) {
                            const lines = node.querySelectorAll('.line:not(.has-metrics)');
                            lines.forEach(line => addMetricsToLine(line));
                        }
                    }
                });
            }
        });
    });
    
    // Start observing when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            const latinView = document.getElementById('latinView');
            if (latinView) {
                observer.observe(latinView, { childList: true, subtree: true });
            }
        });
    } else {
        const latinView = document.getElementById('latinView');
        if (latinView) {
            observer.observe(latinView, { childList: true, subtree: true });
        }
    }

    // Export API
    window.metricsAPI = {
        init: initMetrics,
        toggle: toggleMetrics,
        enable: enableMetrics,
        disable: disableMetrics,
        isEnabled: () => window.metrics.enabled
    };

})();