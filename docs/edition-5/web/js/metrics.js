// Metrics Module for Lucina Digital Edition
// Handles metrical analysis display and visualization

(function() {
    'use strict';

    // Metrics state
    window.metrics = {
        enabled: false,
        definitions: {
            'elegiac': 'Elegiac couplet (hexameter + pentameter)',
            'hexameter': 'Dactylic hexameter (— ∪∪ | — ∪∪ | — ∪∪ | — ∪∪ | — ∪∪ | — —)',
            'pentameter': 'Dactylic pentameter (— ∪∪ | — ∪∪ | — || — ∪∪ | — ∪∪ | —)',
            'hendecasyllabic': 'Hendecasyllabic (11 syllables)',
            'sapphic': 'Sapphic stanza',
            'alcaic': 'Alcaic stanza',
            'iambic': 'Iambic meter (∪ —)',
            'trochaic': 'Trochaic meter (— ∪)',
            'anapestic': 'Anapestic meter (∪∪ —)',
            'dactylic': 'Dactylic meter (— ∪∪)'
        },
        patterns: new Map(), // lineId -> pattern
        statistics: {
            total: 0,
            byMeter: new Map(),
            byPoem: new Map()
        },
        scansions: new Map(), // lineId -> scansion marks
        initialized: false
    };

    // Initialize metrics system
    function initMetrics() {
        if (window.metrics.initialized) return;
        
        console.log('Initializing metrics system...');
        
        // Add metrics toggle to UI if not present
        addMetricsUI();
        
        // Load saved preference
        const savedState = localStorage.getItem('metricsEnabled');
        if (savedState === 'true') {
            enableMetrics();
        }
        
        // Load metrical data
        loadMetricalData();
        
        window.metrics.initialized = true;
    }

    // Add metrics UI elements
    function addMetricsUI() {
        // Check if metrics toggle already exists
        let metricsToggle = document.getElementById('metricsToggle');
        if (!metricsToggle) {
            // Add to navigation
            const navLeft = document.querySelector('.nav-left');
            if (navLeft) {
                metricsToggle = document.createElement('button');
                metricsToggle.id = 'metricsToggle';
                metricsToggle.className = 'nav-link-btn metrics-toggle';
                metricsToggle.title = 'Toggle metrical annotations';
                metricsToggle.innerHTML = '📏 Metrics';
                navLeft.appendChild(metricsToggle);
            }
        }
        
        // Add event listener
        if (metricsToggle) {
            metricsToggle.addEventListener('click', toggleMetrics);
        }
        
        // Add metrics panel
        if (!document.getElementById('metricsPanel')) {
            const panel = createMetricsPanel();
            document.body.appendChild(panel);
        }
        
        // Add styles
        addMetricsStyles();
    }

    // Create metrics information panel
    function createMetricsPanel() {
        const panel = document.createElement('div');
        panel.id = 'metricsPanel';
        panel.className = 'metrics-panel';
        panel.style.display = 'none';
        panel.innerHTML = `
            <div class="metrics-panel-header">
                <h3>Metrical Analysis</h3>
                <button class="close-btn" onclick="closeMetricsPanel()">×</button>
            </div>
            <div class="metrics-panel-content">
                <div class="metrics-legend">
                    <h4>Metrical Symbols</h4>
                    <ul>
                        <li><span class="symbol">—</span> Long syllable (longum)</li>
                        <li><span class="symbol">∪</span> Short syllable (breve)</li>
                        <li><span class="symbol">×</span> Anceps (long or short)</li>
                        <li><span class="symbol">||</span> Caesura</li>
                        <li><span class="symbol">|</span> Foot boundary</li>
                    </ul>
                </div>
                <div class="metrics-stats">
                    <h4>Statistics</h4>
                    <div id="metricsStats"></div>
                </div>
                <div class="metrics-current">
                    <h4>Current Line</h4>
                    <div id="currentLineMetrics">
                        <p>Hover over a line to see its metrical analysis</p>
                    </div>
                </div>
            </div>
            <div class="metrics-panel-footer">
                <button onclick="exportMetrics()" class="btn">Export Analysis</button>
                <button onclick="closeMetricsPanel()" class="btn primary">Close</button>
            </div>
        `;
        
        // Add close handlers
        window.closeMetricsPanel = function() {
            panel.style.display = 'none';
        };
        
        return panel;
    }

    // Toggle metrics display
    function toggleMetrics() {
        window.metrics.enabled = !window.metrics.enabled;
        
        const button = document.getElementById('metricsToggle');
        if (button) {
            button.classList.toggle('active', window.metrics.enabled);
        }
        
        // Save preference
        localStorage.setItem('metricsEnabled', window.metrics.enabled);
        
        if (window.metrics.enabled) {
            enableMetrics();
            showNotification('Metrics enabled - hover over lines to see analysis');
        } else {
            disableMetrics();
            showNotification('Metrics disabled');
        }
    }

    // Enable metrics display
    function enableMetrics() {
        window.metrics.enabled = true;
        
        // Add metrics class to body
        document.body.classList.add('metrics-enabled');
        
        // Process all visible lines
        const lines = document.querySelectorAll('.line');
        lines.forEach(line => {
            addMetricsToLine(line);
        });
        
        // Show metrics panel
        const panel = document.getElementById('metricsPanel');
        if (panel) {
            panel.style.display = 'block';
            updateMetricsStatistics();
        }
    }

    // Disable metrics display
    function disableMetrics() {
        window.metrics.enabled = false;
        
        // Remove metrics class from body
        document.body.classList.remove('metrics-enabled');
        
        // Remove all metrics annotations
        const metricsElements = document.querySelectorAll('.meter-info, .scansion-mark');
        metricsElements.forEach(el => el.remove());
        
        // Hide metrics panel
        const panel = document.getElementById('metricsPanel');
        if (panel) {
            panel.style.display = 'none';
        }
    }

    // Add metrics to a line element
    function addMetricsToLine(lineElement) {
        const lineId = lineElement.getAttribute('data-line-id');
        const lineNum = lineElement.querySelector('.line-number')?.textContent;
        const poemId = lineElement.closest('.poem')?.getAttribute('data-poem-id');
        
        if (!lineId && !lineNum) return;
        
        // Determine meter type based on line number (elegiac couplets)
        const lineNumber = parseInt(lineNum) || 0;
        const isHexameter = lineNumber % 2 === 1;
        const meterType = isHexameter ? 'hexameter' : 'pentameter';
        
        // Check if line already has metrics
        if (lineElement.querySelector('.meter-info')) return;
        
        // Add meter indicator
        const meterInfo = document.createElement('span');
        meterInfo.className = 'meter-info';
        meterInfo.setAttribute('data-meter', meterType);
        meterInfo.title = window.metrics.definitions[meterType] || meterType;
        
        // Add visual meter indicator
        const meterSymbol = isHexameter ? 'H' : 'P';
        meterInfo.innerHTML = `<span class="meter-badge">${meterSymbol}</span>`;
        
        // Insert after line number
        const lineNumElement = lineElement.querySelector('.line-number');
        if (lineNumElement) {
            lineNumElement.parentNode.insertBefore(meterInfo, lineNumElement.nextSibling);
        }
        
        // Add scansion on hover
        lineElement.addEventListener('mouseenter', () => {
            if (window.metrics.enabled) {
                showLineScansion(lineElement, meterType);
            }
        });
        
        lineElement.addEventListener('mouseleave', () => {
            hideLineScansion(lineElement);
        });
        
        // Update statistics
        window.metrics.statistics.total++;
        const count = window.metrics.statistics.byMeter.get(meterType) || 0;
        window.metrics.statistics.byMeter.set(meterType, count + 1);
        
        if (poemId) {
            const poemStats = window.metrics.statistics.byPoem.get(poemId) || {};
            poemStats[meterType] = (poemStats[meterType] || 0) + 1;
            window.metrics.statistics.byPoem.set(poemId, poemStats);
        }
    }

    // Show scansion for a line
    function showLineScansion(lineElement, meterType) {
        const lineText = lineElement.querySelector('.line-text')?.textContent || '';
        const scansion = generateScansion(lineText, meterType);
        
        // Update current line display in panel
        const currentLineDiv = document.getElementById('currentLineMetrics');
        if (currentLineDiv) {
            currentLineDiv.innerHTML = `
                <div class="line-analysis">
                    <p class="line-text-display">${lineText}</p>
                    <p class="scansion-display">${scansion}</p>
                    <p class="meter-type">Meter: ${window.metrics.definitions[meterType] || meterType}</p>
                </div>
            `;
        }
        
        // Add scansion overlay to line
        if (!lineElement.querySelector('.scansion-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'scansion-overlay';
            overlay.innerHTML = scansion;
            lineElement.appendChild(overlay);
        }
    }

    // Hide scansion for a line
    function hideLineScansion(lineElement) {
        const overlay = lineElement.querySelector('.scansion-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    // Generate scansion marks for a line
    function generateScansion(text, meterType) {
        // This is a simplified scansion generator
        // In a real implementation, this would use sophisticated algorithms
        // or pre-computed data from linguistic analysis
        
        let pattern = '';
        
        if (meterType === 'hexameter') {
            // Dactylic hexameter pattern
            pattern = '— ∪∪ | — ∪∪ | — ∪∪ | — ∪∪ | — ∪∪ | — —';
        } else if (meterType === 'pentameter') {
            // Dactylic pentameter pattern
            pattern = '— ∪∪ | — ∪∪ | — || — ∪∪ | — ∪∪ | —';
        } else {
            // Generic pattern
            pattern = '— ∪ — ∪ — ∪ — ∪ — ∪ —';
        }
        
        return pattern;
    }

    // Load metrical data from external source
    async function loadMetricalData() {
        try {
            // Try to load pre-analyzed metrical data
            const response = await fetch('llm-extracted-data/latin-metrical.analysis.md');
            if (response.ok) {
                const text = await response.text();
                parseMetricalData(text);
                console.log('Loaded metrical analysis data');
            }
        } catch (error) {
            console.log('No pre-computed metrical data found, using defaults');
        }
    }

    // Parse metrical data from markdown
    function parseMetricalData(markdown) {
        // Parse the markdown format of metrical analysis
        const lines = markdown.split('\n');
        let currentPoem = null;
        
        lines.forEach(line => {
            if (line.startsWith('## Poem')) {
                const match = line.match(/Poem ([IVX]+\.\d+)/);
                if (match) {
                    currentPoem = 'poem-' + match[1];
                }
            } else if (line.includes('Meter:')) {
                const match = line.match(/Meter:\s*(.+)/);
                if (match && currentPoem) {
                    // Store meter type for poem
                    const meterType = match[1].toLowerCase().trim();
                    window.metrics.patterns.set(currentPoem, meterType);
                }
            } else if (line.includes('Scansion:')) {
                const match = line.match(/Line\s+(\d+).*Scansion:\s*(.+)/);
                if (match) {
                    const lineNum = match[1];
                    const scansion = match[2];
                    window.metrics.scansions.set(`${currentPoem}-${lineNum}`, scansion);
                }
            }
        });
    }

    // Update statistics display
    function updateMetricsStatistics() {
        const statsDiv = document.getElementById('metricsStats');
        if (!statsDiv) return;
        
        let html = '<ul>';
        html += `<li>Total lines analyzed: ${window.metrics.statistics.total}</li>`;
        
        if (window.metrics.statistics.byMeter.size > 0) {
            html += '<li>By meter type:<ul>';
            window.metrics.statistics.byMeter.forEach((count, meter) => {
                const percentage = ((count / window.metrics.statistics.total) * 100).toFixed(1);
                html += `<li>${meter}: ${count} (${percentage}%)</li>`;
            });
            html += '</ul></li>';
        }
        
        html += '</ul>';
        statsDiv.innerHTML = html;
    }

    // Export metrics analysis
    window.exportMetrics = function() {
        const data = {
            timestamp: new Date().toISOString(),
            statistics: {
                total: window.metrics.statistics.total,
                byMeter: Object.fromEntries(window.metrics.statistics.byMeter),
                byPoem: Object.fromEntries(window.metrics.statistics.byPoem)
            },
            patterns: Object.fromEntries(window.metrics.patterns),
            scansions: Object.fromEntries(window.metrics.scansions)
        };
        
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `metrics-analysis-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        showNotification('Metrics analysis exported');
    };

    // Show notification
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'metrics-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Add CSS styles for metrics
    function addMetricsStyles() {
        if (document.getElementById('metricsStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'metricsStyles';
        style.textContent = `
            /* Metrics toggle button */
            .metrics-toggle {
                transition: all 0.2s;
            }
            
            .metrics-toggle.active {
                background: #27ae60;
                color: white;
                border-color: #27ae60;
            }
            
            /* Meter indicators */
            .meter-info {
                display: inline-block;
                margin-left: 8px;
                font-size: 11px;
                vertical-align: super;
            }
            
            .meter-badge {
                display: inline-block;
                width: 16px;
                height: 16px;
                line-height: 16px;
                text-align: center;
                background: #ecf0f1;
                color: #7f8c8d;
                border-radius: 50%;
                font-weight: bold;
                font-size: 10px;
            }
            
            .line:hover .meter-badge {
                background: #3498db;
                color: white;
            }
            
            /* Scansion overlay */
            .scansion-overlay {
                position: absolute;
                top: -20px;
                left: 0;
                right: 0;
                font-family: 'Courier New', monospace;
                font-size: 14px;
                color: #e74c3c;
                background: rgba(255, 255, 255, 0.95);
                padding: 2px 5px;
                border: 1px solid #ecf0f1;
                border-radius: 3px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                z-index: 100;
                pointer-events: none;
            }
            
            /* Metrics panel */
            .metrics-panel {
                position: fixed;
                top: 80px;
                right: 20px;
                width: 350px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 1000;
            }
            
            .metrics-panel-header {
                padding: 15px 20px;
                border-bottom: 1px solid #dee2e6;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .metrics-panel-header h3 {
                margin: 0;
                font-size: 18px;
                color: #2c3e50;
            }
            
            .metrics-panel-content {
                padding: 20px;
                max-height: 500px;
                overflow-y: auto;
            }
            
            .metrics-panel-content h4 {
                margin: 0 0 10px 0;
                font-size: 14px;
                color: #34495e;
                text-transform: uppercase;
            }
            
            .metrics-legend ul {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            
            .metrics-legend li {
                padding: 4px 0;
                font-size: 13px;
            }
            
            .metrics-legend .symbol {
                display: inline-block;
                width: 30px;
                font-family: 'Times New Roman', serif;
                font-size: 16px;
                font-weight: bold;
            }
            
            .metrics-stats {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #ecf0f1;
            }
            
            .metrics-stats ul {
                list-style: none;
                padding: 0;
                margin: 0;
                font-size: 13px;
            }
            
            .metrics-stats li {
                padding: 3px 0;
            }
            
            .metrics-stats ul ul {
                margin-left: 20px;
                margin-top: 5px;
            }
            
            .metrics-current {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #ecf0f1;
            }
            
            .line-analysis {
                font-size: 13px;
            }
            
            .line-text-display {
                margin: 5px 0;
                font-style: italic;
                color: #2c3e50;
            }
            
            .scansion-display {
                margin: 5px 0;
                font-family: 'Courier New', monospace;
                color: #e74c3c;
                font-size: 14px;
            }
            
            .meter-type {
                margin: 5px 0;
                color: #7f8c8d;
                font-size: 12px;
            }
            
            .metrics-panel-footer {
                padding: 15px 20px;
                border-top: 1px solid #dee2e6;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }
            
            /* Metrics notification */
            .metrics-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #2c3e50;
                color: white;
                padding: 12px 20px;
                border-radius: 4px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                opacity: 0;
                transform: translateY(-20px);
                transition: all 0.3s;
                z-index: 10000;
            }
            
            .metrics-notification.show {
                opacity: 1;
                transform: translateY(0);
            }
            
            /* Enhanced line styling when metrics enabled */
            body.metrics-enabled .line {
                position: relative;
                padding-left: 60px;
            }
            
            body.metrics-enabled .line-number {
                left: 0;
            }
            
            body.metrics-enabled .line:hover {
                background: #f8f9fa;
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
            const lines = document.querySelectorAll('.line:not(.metrics-processed)');
            lines.forEach(line => {
                addMetricsToLine(line);
                line.classList.add('metrics-processed');
            });
            updateMetricsStatistics();
        }
    });

    // Export API
    window.metricsAPI = {
        init: initMetrics,
        toggle: toggleMetrics,
        enable: enableMetrics,
        disable: disableMetrics,
        isEnabled: () => window.metrics.enabled,
        getStatistics: () => window.metrics.statistics,
        exportData: window.exportMetrics
    };

})();