// TEI Edit Mode Module for Lucina Digital Edition
// This module enables in-browser editing of TEI XML content during local development

(function() {
    'use strict';

    // Edit mode state
    window.editMode = {
        enabled: false,
        hasUnsavedChanges: false,
        changes: {
            lines: new Map(),        // lineId -> {original, modified, teiElement}
            attributes: new Map(),   // elementId -> {attr: {old, new}}
            persons: new Map(),      // refId -> {additions: [], removals: []}
            metadata: new Map(),     // field -> {original, modified}
            apparatus: new Map()     // appId -> {lemma, readings}
        },
        originalTEI: null,
        isLocalEnvironment: false
    };

    // Check if running locally
    function isLocalEnvironment() {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        return hostname === 'localhost' || 
               hostname === '127.0.0.1' || 
               hostname === '' ||  // file:// protocol
               protocol === 'file:';
    }

    // Initialize edit mode
    function initEditMode() {
        window.editMode.isLocalEnvironment = isLocalEnvironment();
        
        if (!window.editMode.isLocalEnvironment) {
            console.log('Edit mode disabled - not in local environment');
            return;
        }

        console.log('Edit mode available - local environment detected');
        addEditModeUI();
        setupEditModeListeners();
        setupKeyboardShortcuts();
    }

    // Add edit mode UI elements
    function addEditModeUI() {
        // Add edit mode toggle button to navigation
        const navRight = document.querySelector('.nav-right');
        if (navRight) {
            const editButton = document.createElement('button');
            editButton.id = 'editModeToggle';
            editButton.className = 'nav-link-btn edit-mode-toggle';
            editButton.innerHTML = '✏️ Edit Mode';
            editButton.title = 'Toggle edit mode (Ctrl+E)';
            
            // Insert before search box
            const searchBox = navRight.querySelector('.searchbox');
            navRight.insertBefore(editButton, searchBox);
        }

        // Add floating toolbar (initially hidden)
        const toolbar = document.createElement('div');
        toolbar.id = 'editToolbar';
        toolbar.className = 'edit-toolbar';
        toolbar.style.display = 'none';
        toolbar.innerHTML = `
            <div class="edit-toolbar-content">
                <button id="saveChangesBtn" class="toolbar-btn primary" title="Save changes (Ctrl+S)">
                    💾 Save
                    <span id="unsavedIndicator" class="unsaved-badge" style="display: none;">●</span>
                </button>
                <button id="revertChangesBtn" class="toolbar-btn" title="Revert all changes">
                    ↩️ Revert
                </button>
                <button id="toggleAttributesBtn" class="toolbar-btn" title="Toggle attribute editing">
                    🏷️ Attributes
                </button>
                <button id="diffViewBtn" class="toolbar-btn" title="View changes">
                    📊 Diff View
                </button>
                <div class="toolbar-separator"></div>
                <span class="edit-status">
                    Changes: <span id="changeCount">0</span>
                </span>
            </div>
        `;
        document.body.appendChild(toolbar);

        // Add diff viewer modal
        const diffModal = document.createElement('div');
        diffModal.id = 'diffModal';
        diffModal.className = 'diff-modal';
        diffModal.style.display = 'none';
        diffModal.innerHTML = `
            <div class="diff-modal-content">
                <div class="diff-modal-header">
                    <h3>Review Changes</h3>
                    <button class="close-btn" onclick="closeDiffView()">×</button>
                </div>
                <div id="diffContent" class="diff-content"></div>
                <div class="diff-modal-footer">
                    <button onclick="closeDiffView()" class="toolbar-btn">Close</button>
                    <button onclick="saveChangesWithConfirm()" class="toolbar-btn primary">Save Changes</button>
                </div>
            </div>
        `;
        document.body.appendChild(diffModal);

        // Add styles for edit mode
        addEditModeStyles();
    }

    // Add CSS styles for edit mode
    function addEditModeStyles() {
        const style = document.createElement('style');
        style.id = 'editModeStyles';
        style.textContent = `
            /* Edit mode toggle button */
            .edit-mode-toggle {
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                padding: 5px 12px;
                border-radius: 4px;
                margin-right: 10px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .edit-mode-toggle:hover {
                background: #e9ecef;
            }
            
            .edit-mode-toggle.active {
                background: #28a745;
                color: white;
                border-color: #28a745;
            }

            /* Edit mode indicators */
            body.edit-mode .editable {
                position: relative;
                transition: all 0.2s;
            }
            
            body.edit-mode .editable:hover {
                background: #fffbf0;
                outline: 2px solid #ffc107;
                outline-offset: 2px;
                cursor: text;
            }
            
            body.edit-mode .editable:focus {
                background: #fff;
                outline: 2px solid #007bff;
                outline-offset: 2px;
            }
            
            body.edit-mode .editable.changed {
                background: #f0fff4;
            }

            /* Floating toolbar */
            .edit-toolbar {
                position: fixed;
                top: 70px;
                right: 20px;
                background: white;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                padding: 10px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                z-index: 1000;
            }
            
            .edit-toolbar-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .toolbar-btn {
                padding: 6px 12px;
                border: 1px solid #dee2e6;
                background: white;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s;
                font-size: 14px;
                position: relative;
            }
            
            .toolbar-btn:hover {
                background: #f8f9fa;
            }
            
            .toolbar-btn.primary {
                background: #007bff;
                color: white;
                border-color: #007bff;
            }
            
            .toolbar-btn.primary:hover {
                background: #0056b3;
            }
            
            .toolbar-separator {
                width: 1px;
                height: 24px;
                background: #dee2e6;
            }
            
            .edit-status {
                font-size: 14px;
                color: #6c757d;
            }
            
            .unsaved-badge {
                color: #ffc107;
                font-size: 18px;
                position: absolute;
                top: -5px;
                right: -5px;
            }

            /* Attribute editing */
            .attribute-editor {
                display: inline-block;
                margin-left: 8px;
                padding: 2px 6px;
                background: #e9ecef;
                border-radius: 3px;
                font-size: 12px;
            }
            
            .attribute-input {
                border: 1px solid #007bff;
                border-radius: 3px;
                padding: 2px 4px;
                font-size: 12px;
                width: 100px;
            }

            /* Person/place annotations */
            body.edit-mode .person-ref, body.edit-mode .place-ref {
                border-bottom: 2px dotted #007bff;
                cursor: pointer;
                position: relative;
            }
            
            body.edit-mode .person-ref:hover, body.edit-mode .place-ref:hover {
                background: #e3f2fd;
            }
            
            .annotation-popup {
                position: absolute;
                top: 100%;
                left: 0;
                background: white;
                border: 1px solid #dee2e6;
                border-radius: 4px;
                padding: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                z-index: 1000;
                min-width: 200px;
            }

            /* Diff viewer */
            .diff-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
            }
            
            .diff-modal-content {
                background: white;
                border-radius: 8px;
                width: 80%;
                max-width: 800px;
                max-height: 80vh;
                display: flex;
                flex-direction: column;
            }
            
            .diff-modal-header {
                padding: 20px;
                border-bottom: 1px solid #dee2e6;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .diff-modal-header h3 {
                margin: 0;
            }
            
            .close-btn {
                font-size: 24px;
                background: none;
                border: none;
                cursor: pointer;
                color: #6c757d;
            }
            
            .diff-content {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                font-family: monospace;
                font-size: 14px;
            }
            
            .diff-line {
                padding: 2px 4px;
                margin: 2px 0;
            }
            
            .diff-added {
                background: #d4edda;
                color: #155724;
            }
            
            .diff-removed {
                background: #f8d7da;
                color: #721c24;
                text-decoration: line-through;
            }
            
            .diff-modal-footer {
                padding: 20px;
                border-top: 1px solid #dee2e6;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }

            /* Save notification */
            .save-notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #28a745;
                color: white;
                padding: 12px 20px;
                border-radius: 4px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                animation: slideIn 0.3s ease;
                z-index: 3000;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Setup event listeners for edit mode
    function setupEditModeListeners() {
        // Edit mode toggle
        document.getElementById('editModeToggle')?.addEventListener('click', toggleEditMode);
        
        // Toolbar buttons
        document.getElementById('saveChangesBtn')?.addEventListener('click', saveChanges);
        document.getElementById('revertChangesBtn')?.addEventListener('click', revertChanges);
        document.getElementById('toggleAttributesBtn')?.addEventListener('click', toggleAttributeEditing);
        document.getElementById('diffViewBtn')?.addEventListener('click', showDiffView);
    }

    // Setup keyboard shortcuts
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+E: Toggle edit mode
            if (e.ctrlKey && e.key === 'e') {
                e.preventDefault();
                toggleEditMode();
            }
            
            // Ctrl+S: Save changes (in edit mode)
            if (e.ctrlKey && e.key === 's' && window.editMode.enabled) {
                e.preventDefault();
                saveChanges();
            }
            
            // Escape: Exit edit mode
            if (e.key === 'Escape' && window.editMode.enabled) {
                toggleEditMode();
            }
        });
    }

    // Toggle edit mode on/off
    function toggleEditMode() {
        window.editMode.enabled = !window.editMode.enabled;
        const body = document.body;
        const toggle = document.getElementById('editModeToggle');
        const toolbar = document.getElementById('editToolbar');
        
        if (window.editMode.enabled) {
            // Enter edit mode
            body.classList.add('edit-mode');
            toggle?.classList.add('active');
            toolbar.style.display = 'block';
            
            // Store original TEI for comparison
            if (window.teiDoc) {
                window.editMode.originalTEI = window.teiDoc.cloneNode(true);
            }
            
            // Make elements editable
            makeElementsEditable();
            
            console.log('Edit mode enabled');
            showNotification('Edit mode enabled', 'info');
        } else {
            // Exit edit mode
            body.classList.remove('edit-mode');
            toggle?.classList.remove('active');
            toolbar.style.display = 'none';
            
            // Remove editable attributes
            removeEditableAttributes();
            
            // Check for unsaved changes
            if (window.editMode.hasUnsavedChanges) {
                if (!confirm('You have unsaved changes. Exit edit mode anyway?')) {
                    toggleEditMode(); // Re-enable
                    return;
                }
            }
            
            console.log('Edit mode disabled');
        }
    }

    // Make elements editable
    function makeElementsEditable() {
        // Make poem lines editable
        const lines = document.querySelectorAll('.txt');
        lines.forEach(line => {
            line.contentEditable = true;
            line.classList.add('editable');
            line.dataset.originalText = line.textContent;
            
            // Track changes
            line.addEventListener('input', () => trackLineChange(line));
            line.addEventListener('blur', () => validateLineContent(line));
        });

        // Add attribute editors for poems
        const poems = document.querySelectorAll('.poem');
        poems.forEach(poem => {
            addAttributeEditors(poem);
        });

        // Make person/place references editable
        setupAnnotationEditing();
    }

    // Remove editable attributes
    function removeEditableAttributes() {
        const editables = document.querySelectorAll('.editable');
        editables.forEach(el => {
            el.contentEditable = false;
            el.classList.remove('editable', 'changed');
        });

        // Remove attribute editors
        document.querySelectorAll('.attribute-editor').forEach(el => el.remove());
    }

    // Track line changes
    function trackLineChange(element) {
        const lineNum = element.closest('.line')?.querySelector('.num')?.textContent;
        const poemId = element.closest('.poem')?.id;
        
        if (!lineNum || !poemId) return;
        
        const key = `${poemId}-line-${lineNum}`;
        const original = element.dataset.originalText;
        const current = element.textContent;
        
        if (current !== original) {
            window.editMode.changes.lines.set(key, {
                original: original,
                modified: current,
                poemId: poemId,
                lineNum: lineNum,
                element: element
            });
            element.classList.add('changed');
            window.editMode.hasUnsavedChanges = true;
        } else {
            window.editMode.changes.lines.delete(key);
            element.classList.remove('changed');
        }
        
        updateChangeCount();
    }

    // Validate line content
    function validateLineContent(element) {
        // Basic validation - ensure no HTML tags
        const text = element.textContent;
        if (/<[^>]*>/.test(text)) {
            showNotification('HTML tags not allowed in text', 'error');
            element.textContent = element.dataset.originalText;
        }
    }

    // Add attribute editors to poem elements
    function addAttributeEditors(poem) {
        const header = poem.querySelector('h3');
        if (!header) return;
        
        const poemId = poem.id;
        const attrs = ['xml:id', 'type', 'n', 'subtype'];
        
        const editorDiv = document.createElement('div');
        editorDiv.className = 'attribute-editor';
        
        attrs.forEach(attr => {
            const value = poem.dataset[attr] || '';
            if (attr === 'xml:id' && poemId) {
                const input = document.createElement('input');
                input.className = 'attribute-input';
                input.type = 'text';
                input.value = poemId;
                input.placeholder = attr;
                input.dataset.attr = attr;
                input.dataset.original = poemId;
                
                input.addEventListener('change', (e) => trackAttributeChange(poem, attr, e.target.value));
                
                editorDiv.appendChild(input);
            }
        });
        
        header.appendChild(editorDiv);
    }

    // Track attribute changes
    function trackAttributeChange(element, attr, newValue) {
        const elementId = element.id;
        if (!elementId) return;
        
        if (!window.editMode.changes.attributes.has(elementId)) {
            window.editMode.changes.attributes.set(elementId, {});
        }
        
        const changes = window.editMode.changes.attributes.get(elementId);
        changes[attr] = {
            old: element.dataset[attr] || element.getAttribute(attr),
            new: newValue
        };
        
        window.editMode.hasUnsavedChanges = true;
        updateChangeCount();
    }

    // Setup annotation editing for persons and places
    function setupAnnotationEditing() {
        // This would be implemented to handle person/place reference editing
        // For now, just marking them visually
        const persons = document.querySelectorAll('.person');
        persons.forEach(p => {
            p.classList.add('person-ref');
        });
    }

    // Update change count display
    function updateChangeCount() {
        const count = window.editMode.changes.lines.size + 
                     window.editMode.changes.attributes.size +
                     window.editMode.changes.persons.size;
        
        document.getElementById('changeCount').textContent = count;
        document.getElementById('unsavedIndicator').style.display = count > 0 ? 'inline' : 'none';
    }

    // Show diff view
    function showDiffView() {
        const modal = document.getElementById('diffModal');
        const content = document.getElementById('diffContent');
        
        // Generate diff display
        let html = '<h4>Modified Lines:</h4>';
        
        if (window.editMode.changes.lines.size === 0) {
            html += '<p>No changes made</p>';
        } else {
            window.editMode.changes.lines.forEach((change, key) => {
                html += `
                    <div class="diff-item">
                        <strong>${change.poemId} - Line ${change.lineNum}:</strong><br>
                        <div class="diff-line diff-removed">- ${change.original}</div>
                        <div class="diff-line diff-added">+ ${change.modified}</div>
                    </div>
                `;
            });
        }
        
        if (window.editMode.changes.attributes.size > 0) {
            html += '<h4>Modified Attributes:</h4>';
            window.editMode.changes.attributes.forEach((attrs, elementId) => {
                Object.entries(attrs).forEach(([attr, change]) => {
                    html += `
                        <div class="diff-item">
                            <strong>${elementId} @${attr}:</strong><br>
                            <div class="diff-line diff-removed">- ${change.old}</div>
                            <div class="diff-line diff-added">+ ${change.new}</div>
                        </div>
                    `;
                });
            });
        }
        
        content.innerHTML = html;
        modal.style.display = 'flex';
    }

    // Close diff view
    window.closeDiffView = function() {
        document.getElementById('diffModal').style.display = 'none';
    };

    // Save changes
    async function saveChanges() {
        if (window.editMode.changes.lines.size === 0 && 
            window.editMode.changes.attributes.size === 0) {
            showNotification('No changes to save', 'info');
            return;
        }
        
        try {
            // Reconstruct TEI XML with changes
            const updatedXML = await reconstructTEI();
            
            let filename;
            
            // Try File System Access API first
            if ('showSaveFilePicker' in window) {
                filename = await saveUsingFileAPI(updatedXML);
            } else {
                // Fallback to server save
                filename = await saveUsingServer(updatedXML);
            }
            
            // Show validation prompt
            showValidationPrompt(filename, updatedXML);
            
            // Clear changes
            window.editMode.changes.lines.clear();
            window.editMode.changes.attributes.clear();
            window.editMode.hasUnsavedChanges = false;
            updateChangeCount();
            
            // Remove changed indicators
            document.querySelectorAll('.changed').forEach(el => el.classList.remove('changed'));
            
            showNotification(`Saved to: ${filename}`, 'success');
            
        } catch (error) {
            console.error('Save failed:', error);
            showNotification('Failed to save: ' + error.message, 'error');
        }
    }

    // Save using File System Access API
    async function saveUsingFileAPI(xmlContent) {
        // Generate timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `tei-edited-${timestamp}.xml`;
        
        const handle = await window.showSaveFilePicker({
            suggestedName: filename,
            startIn: 'downloads',
            types: [{
                description: 'TEI XML Files',
                accept: { 'text/xml': ['.xml'] }
            }]
        });
        
        const writable = await handle.createWritable();
        await writable.write(xmlContent);
        await writable.close();
        
        // Return filename for validation prompt
        return filename;
    }

    // Save using local server
    async function saveUsingServer(xmlContent) {
        const response = await fetch('http://localhost:3001/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/xml'
            },
            body: xmlContent
        });
        
        if (!response.ok) {
            throw new Error('Server save failed. Is the edit server running?');
        }
        
        const result = await response.json();
        return result.filename;
    }

    // Reconstruct TEI XML with changes
    async function reconstructTEI() {
        // Clone the original TEI
        const teiClone = window.teiDoc.cloneNode(true);
        
        // Apply line changes using querySelector instead of XPath to avoid namespace issues
        window.editMode.changes.lines.forEach((change, key) => {
            const [poemId, , lineNum] = key.split('-');
            
            // Handle different poem ID formats
            let searchId = poemId;
            if (poemId === 'poem-praefatio') {
                searchId = 'praefatio';
            } else if (poemId.startsWith('poem-')) {
                // Try both with and without 'poem-' prefix
                searchId = poemId.replace('poem-', '');
            }
            
            // Try multiple selectors to find the poem div
            let poemDiv = teiClone.querySelector(`div[*|id="${searchId}"]`) ||
                         teiClone.querySelector(`div[xml\\:id="${searchId}"]`) ||
                         teiClone.querySelector(`div[id="${searchId}"]`);
            
            if (!poemDiv) {
                // Try with the original poemId
                poemDiv = teiClone.querySelector(`div[*|id="${poemId}"]`) ||
                         teiClone.querySelector(`div[xml\\:id="${poemId}"]`) ||
                         teiClone.querySelector(`div[id="${poemId}"]`);
            }
            
            if (poemDiv) {
                // Find the line within the poem
                const lines = poemDiv.querySelectorAll('l');
                lines.forEach(line => {
                    if (line.getAttribute('n') === lineNum) {
                        // Clear existing content
                        while (line.firstChild) {
                            line.removeChild(line.firstChild);
                        }
                        // Add new text
                        line.appendChild(teiClone.createTextNode(change.modified));
                        console.log(`Updated line ${lineNum} in ${poemId}`);
                    }
                });
            } else {
                console.warn(`Could not find poem div for ${poemId}`);
            }
        });
        
        // Apply attribute changes
        window.editMode.changes.attributes.forEach((attrs, elementId) => {
            // Try multiple selectors for finding elements by xml:id
            const element = teiClone.querySelector(`[*|id="${elementId}"]`) ||
                           teiClone.querySelector(`[xml\\:id="${elementId}"]`) ||
                           teiClone.querySelector(`[id="${elementId}"]`);
                           
            if (element) {
                Object.entries(attrs).forEach(([attr, change]) => {
                    if (attr === 'xml:id') {
                        element.setAttribute('xml:id', change.new);
                    } else {
                        element.setAttribute(attr, change.new);
                    }
                });
            }
        });
        
        // Serialize back to XML string
        const serializer = new XMLSerializer();
        let xmlString = serializer.serializeToString(teiClone);
        
        // Clean up the XML string
        xmlString = xmlString.replace(/xmlns=""/g, '');
        
        // Add XML declaration if missing
        if (!xmlString.startsWith('<?xml')) {
            xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n' + xmlString;
        }
        
        return xmlString;
    }

    // Revert all changes
    function revertChanges() {
        if (!confirm('Revert all changes? This cannot be undone.')) {
            return;
        }
        
        // Restore original text
        window.editMode.changes.lines.forEach((change) => {
            if (change.element) {
                change.element.textContent = change.original;
                change.element.classList.remove('changed');
            }
        });
        
        // Clear all tracked changes
        window.editMode.changes.lines.clear();
        window.editMode.changes.attributes.clear();
        window.editMode.hasUnsavedChanges = false;
        updateChangeCount();
        
        showNotification('All changes reverted', 'info');
    }

    // Toggle attribute editing visibility
    function toggleAttributeEditing() {
        const editors = document.querySelectorAll('.attribute-editor');
        editors.forEach(editor => {
            editor.style.display = editor.style.display === 'none' ? 'inline-block' : 'none';
        });
    }

    // Save changes with confirmation
    window.saveChangesWithConfirm = function() {
        closeDiffView();
        saveChanges();
    };

    // Show notification
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = 'save-notification';
        notification.textContent = message;
        
        if (type === 'error') {
            notification.style.background = '#dc3545';
        } else if (type === 'info') {
            notification.style.background = '#17a2b8';
        } else if (type === 'warning') {
            notification.style.background = '#ffc107';
            notification.style.color = '#000';
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Show validation prompt after saving
    function showValidationPrompt(filename, xmlContent) {
        // Create validation modal
        const modal = document.createElement('div');
        modal.className = 'diff-modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="diff-modal-content" style="max-width: 600px;">
                <div class="diff-modal-header">
                    <h3>✅ File Saved Successfully</h3>
                    <button class="close-btn" onclick="this.closest('.diff-modal').remove()">×</button>
                </div>
                <div class="diff-content" style="padding: 20px;">
                    <p><strong>Saved to:</strong> <code>output/${filename}</code></p>
                    
                    <div style="margin: 20px 0;">
                        <h4>Next Steps:</h4>
                        <ol style="line-height: 1.8;">
                            <li>Validate the XML file with an XML validator</li>
                            <li>Check TEI P5 compliance with Oxygen or similar tool</li>
                            <li>Compare with original to ensure no data loss</li>
                            <li>Test by loading in the viewer</li>
                            <li>If valid, consider promoting as new source version</li>
                        </ol>
                    </div>
                    
                    <div id="validationResults" style="margin-top: 20px;">
                        <h4>Quick Validation:</h4>
                        <div id="validationChecks"></div>
                    </div>
                </div>
                <div class="diff-modal-footer">
                    <button onclick="this.closest('.diff-modal').remove()" class="toolbar-btn">Close</button>
                    <button onclick="runQuickValidation('${filename}')" class="toolbar-btn primary">Run Validation</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Run basic validation immediately
        runBasicValidation(xmlContent, modal);
    }

    // Run basic validation checks
    function runBasicValidation(xmlContent, modal) {
        const checksDiv = modal.querySelector('#validationChecks');
        const checks = [];
        
        // Check 1: Well-formed XML
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(xmlContent, 'text/xml');
            const hasError = doc.querySelector('parsererror');
            checks.push({
                name: 'XML Well-Formed',
                passed: !hasError,
                message: hasError ? 'XML parsing error found' : 'Valid XML structure'
            });
        } catch (e) {
            checks.push({
                name: 'XML Well-Formed',
                passed: false,
                message: 'Failed to parse XML'
            });
        }
        
        // Check 2: TEI root element
        checks.push({
            name: 'TEI Root Element',
            passed: xmlContent.includes('<TEI') && xmlContent.includes('</TEI>'),
            message: xmlContent.includes('<TEI') ? 'TEI element found' : 'TEI element missing'
        });
        
        // Check 3: TEI Header
        checks.push({
            name: 'TEI Header',
            passed: xmlContent.includes('<teiHeader>') && xmlContent.includes('</teiHeader>'),
            message: xmlContent.includes('<teiHeader>') ? 'Header present' : 'Header missing'
        });
        
        // Check 4: Line count preservation
        const originalLineCount = window.teiDoc ? window.teiDoc.querySelectorAll('l').length : 0;
        const newLineCount = (xmlContent.match(/<l\s+n="/g) || []).length;
        checks.push({
            name: 'Line Count',
            passed: Math.abs(originalLineCount - newLineCount) <= 5, // Allow small variance
            message: `Original: ${originalLineCount}, New: ${newLineCount}`
        });
        
        // Check 5: File size reasonable
        const sizeKB = Math.round(new Blob([xmlContent]).size / 1024);
        checks.push({
            name: 'File Size',
            passed: sizeKB > 100 && sizeKB < 10000,
            message: `${sizeKB} KB`
        });
        
        // Display results
        let html = '<ul style="list-style: none; padding: 0;">';
        checks.forEach(check => {
            const icon = check.passed ? '✅' : '❌';
            const color = check.passed ? 'green' : 'red';
            html += `
                <li style="padding: 5px 0;">
                    ${icon} <strong>${check.name}:</strong> 
                    <span style="color: ${color}">${check.message}</span>
                </li>
            `;
        });
        html += '</ul>';
        
        const allPassed = checks.every(c => c.passed);
        if (allPassed) {
            html += '<p style="color: green; font-weight: bold; margin-top: 10px;">✅ All basic checks passed!</p>';
        } else {
            html += '<p style="color: orange; font-weight: bold; margin-top: 10px;">⚠️ Some checks failed - please review</p>';
        }
        
        checksDiv.innerHTML = html;
    }

    // Run quick validation (placeholder for server-side validation)
    window.runQuickValidation = function(filename) {
        showNotification('Full validation requires external tools like Oxygen XML Editor', 'info');
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEditMode);
    } else {
        initEditMode();
    }

    // Export functions for external use
    window.editModeAPI = {
        toggle: toggleEditMode,
        save: saveChanges,
        revert: revertChanges,
        showDiff: showDiffView
    };

})();