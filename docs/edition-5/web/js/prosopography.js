// Prosopography Module for Lucina Digital Edition
// Manages person and place references, relationships, and interactive features

(function() {
    'use strict';

    // Prosopography state
    window.prosopography = {
        persons: new Map(),
        places: new Map(),
        relationships: [],
        references: new Map(), // element -> entity mapping
        initialized: false
    };

    // Initialize prosopography system
    function initProsopography() {
        if (window.prosopography.initialized) return;
        
        console.log('Initializing prosopography system...');
        
        // Wait for TEI document to be loaded
        if (window.teiDoc) {
            extractProsopographicalData();
            setupInteractiveReferences();
            window.prosopography.initialized = true;
        } else {
            // Retry after DOM is ready
            setTimeout(initProsopography, 100);
        }
    }

    // Extract prosopographical data from TEI
    function extractProsopographicalData() {
        if (!window.teiDoc) return;
        
        console.log('Extracting prosopographical data...');
        
        // Extract persons
        const personElements = window.teiDoc.querySelectorAll('person');
        personElements.forEach(person => {
            const id = person.getAttribute('xml:id');
            const persName = person.querySelector('persName');
            const note = person.querySelector('note');
            const birth = person.querySelector('birth');
            const death = person.querySelector('death');
            const occupation = person.querySelector('occupation');
            
            if (id) {
                window.prosopography.persons.set(id, {
                    id: id,
                    name: persName?.textContent.trim() || 'Unknown',
                    note: note?.textContent.trim() || '',
                    birth: birth?.getAttribute('when') || birth?.textContent.trim() || '',
                    death: death?.getAttribute('when') || death?.textContent.trim() || '',
                    occupation: occupation?.textContent.trim() || '',
                    references: []
                });
            }
        });
        
        console.log(`Extracted ${window.prosopography.persons.size} persons`);
        
        // Extract places
        const placeElements = window.teiDoc.querySelectorAll('place');
        placeElements.forEach(place => {
            const id = place.getAttribute('xml:id');
            const placeName = place.querySelector('placeName');
            const geo = place.querySelector('geo');
            const desc = place.querySelector('desc');
            
            if (id) {
                window.prosopography.places.set(id, {
                    id: id,
                    name: placeName?.textContent.trim() || 'Unknown',
                    coordinates: geo?.textContent.trim() || '',
                    description: desc?.textContent.trim() || '',
                    references: []
                });
            }
        });
        
        console.log(`Extracted ${window.prosopography.places.size} places`);
        
        // Extract relationships
        const relationElements = window.teiDoc.querySelectorAll('relation');
        relationElements.forEach(relation => {
            const active = relation.getAttribute('active');
            const passive = relation.getAttribute('passive');
            const type = relation.getAttribute('type') || relation.getAttribute('name');
            const mutual = relation.getAttribute('mutual');
            
            if (active && passive && type) {
                window.prosopography.relationships.push({
                    active: active.replace('#', ''),
                    passive: passive.replace('#', ''),
                    type: type,
                    mutual: mutual === 'true'
                });
            }
        });
        
        console.log(`Extracted ${window.prosopography.relationships.length} relationships`);
    }

    // Setup interactive references in the text
    function setupInteractiveReferences() {
        console.log('Setting up interactive references...');
        
        // Find all person references in the text
        const textPanel = document.getElementById('latinView');
        if (!textPanel) {
            console.log('Latin view not found, deferring reference setup');
            return;
        }
        
        // Process each poem
        const poems = textPanel.querySelectorAll('.poem');
        if (poems.length === 0) {
            console.log('No poems found yet, will retry when poems are loaded');
            return;
        }
        
        poems.forEach(poem => {
            processReferencesInElement(poem);
        });
    }

    // Process references in an element
    function processReferencesInElement(element) {
        // Look for person references (names that match prosopographical data)
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        const nodesToReplace = [];
        let node;
        
        while (node = walker.nextNode()) {
            const text = node.textContent;
            
            // Check for person names
            window.prosopography.persons.forEach((person, id) => {
                const nameVariants = getNameVariants(person.name);
                nameVariants.forEach(variant => {
                    const regex = new RegExp(`\\b${escapeRegExp(variant)}\\b`, 'gi');
                    if (regex.test(text)) {
                        nodesToReplace.push({
                            node: node,
                            pattern: regex,
                            entityId: id,
                            entityType: 'person'
                        });
                    }
                });
            });
            
            // Check for place names
            window.prosopography.places.forEach((place, id) => {
                const regex = new RegExp(`\\b${escapeRegExp(place.name)}\\b`, 'gi');
                if (regex.test(text)) {
                    nodesToReplace.push({
                        node: node,
                        pattern: regex,
                        entityId: id,
                        entityType: 'place'
                    });
                }
            });
        }
        
        // Replace text nodes with interactive spans
        nodesToReplace.forEach(item => {
            wrapReference(item.node, item.pattern, item.entityId, item.entityType);
        });
    }

    // Wrap matched text in interactive span
    function wrapReference(textNode, pattern, entityId, entityType) {
        const text = textNode.textContent;
        const parent = textNode.parentNode;
        
        // Skip if parent is null or already wrapped
        if (!parent) return;
        if (parent.classList && parent.classList.contains('entity-ref')) return;
        
        const parts = text.split(pattern);
        const matches = text.match(pattern);
        
        if (!matches) return;
        
        const fragment = document.createDocumentFragment();
        
        parts.forEach((part, i) => {
            if (part) {
                fragment.appendChild(document.createTextNode(part));
            }
            
            if (i < matches.length) {
                const span = document.createElement('span');
                span.className = `entity-ref ${entityType}-ref`;
                span.setAttribute('data-entity-id', entityId);
                span.setAttribute('data-entity-type', entityType);
                span.textContent = matches[i];
                
                // Add tooltip
                const entity = entityType === 'person' 
                    ? window.prosopography.persons.get(entityId)
                    : window.prosopography.places.get(entityId);
                
                if (entity) {
                    span.title = getEntityTooltip(entity, entityType);
                }
                
                // Add click handler
                span.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showEntityDetails(entityId, entityType);
                });
                
                fragment.appendChild(span);
            }
        });
        
        parent.replaceChild(fragment, textNode);
    }

    // Get name variants for matching
    function getNameVariants(name) {
        const variants = [name];
        
        // Add common Latin name variations
        if (name.includes(' ')) {
            const parts = name.split(' ');
            // Add first name only
            variants.push(parts[0]);
            // Add last name only if it's not a common word
            if (parts[parts.length - 1].length > 3) {
                variants.push(parts[parts.length - 1]);
            }
        }
        
        // Add genitive forms for Latin names
        if (name.endsWith('us')) {
            variants.push(name.slice(0, -2) + 'i'); // -us -> -i
            variants.push(name.slice(0, -2) + 'um'); // accusative
        }
        if (name.endsWith('a')) {
            variants.push(name + 'e'); // vocative/genitive
            variants.push(name + 'm'); // accusative
        }
        
        return variants;
    }

    // Get tooltip text for entity
    function getEntityTooltip(entity, entityType) {
        if (entityType === 'person') {
            let tooltip = entity.name;
            if (entity.occupation) tooltip += `\n${entity.occupation}`;
            if (entity.birth || entity.death) {
                tooltip += `\n(${entity.birth || '?'} - ${entity.death || '?'})`;
            }
            return tooltip;
        } else if (entityType === 'place') {
            let tooltip = entity.name;
            if (entity.description) tooltip += `\n${entity.description}`;
            return tooltip;
        }
        return entity.name;
    }

    // Show entity details in modal or side panel
    function showEntityDetails(entityId, entityType) {
        const entity = entityType === 'person' 
            ? window.prosopography.persons.get(entityId)
            : window.prosopography.places.get(entityId);
        
        if (!entity) return;
        
        // Create modal if it doesn't exist
        let modal = document.getElementById('entityModal');
        if (!modal) {
            modal = createEntityModal();
        }
        
        // Populate modal content
        const content = document.getElementById('entityModalContent');
        content.innerHTML = generateEntityHTML(entity, entityType);
        
        // Show modal
        modal.style.display = 'block';
        
        // Find references
        findEntityReferences(entityId, entityType);
    }

    // Create entity details modal
    function createEntityModal() {
        const modal = document.createElement('div');
        modal.id = 'entityModal';
        modal.className = 'entity-modal';
        modal.innerHTML = `
            <div class="entity-modal-content">
                <div class="entity-modal-header">
                    <h3 id="entityModalTitle">Entity Details</h3>
                    <button class="close-btn" onclick="closeEntityModal()">×</button>
                </div>
                <div id="entityModalContent" class="entity-modal-body"></div>
                <div class="entity-modal-footer">
                    <button onclick="closeEntityModal()" class="btn">Close</button>
                    <button onclick="navigateToIndex()" class="btn primary">View in Index</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add close handler
        window.closeEntityModal = function() {
            modal.style.display = 'none';
        };
        
        window.navigateToIndex = function() {
            const entityType = modal.getAttribute('data-entity-type');
            const entityId = modal.getAttribute('data-entity-id');
            window.location.href = `indices.html#${entityType}-${entityId}`;
        };
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        return modal;
    }

    // Generate HTML for entity details
    function generateEntityHTML(entity, entityType) {
        let html = `<div class="entity-details">`;
        
        if (entityType === 'person') {
            html += `
                <h4>${entity.name}</h4>
                ${entity.occupation ? `<p class="occupation">${entity.occupation}</p>` : ''}
                ${entity.birth || entity.death ? `<p class="dates">Life: ${entity.birth || '?'} – ${entity.death || '?'}</p>` : ''}
                ${entity.note ? `<p class="note">${entity.note}</p>` : ''}
            `;
            
            // Add relationships
            const relationships = window.prosopography.relationships.filter(
                r => r.active === entity.id || r.passive === entity.id
            );
            
            if (relationships.length > 0) {
                html += '<h5>Relationships:</h5><ul class="relationships">';
                relationships.forEach(rel => {
                    const otherId = rel.active === entity.id ? rel.passive : rel.active;
                    const other = window.prosopography.persons.get(otherId);
                    if (other) {
                        html += `<li>${rel.type}: ${other.name}</li>`;
                    }
                });
                html += '</ul>';
            }
            
        } else if (entityType === 'place') {
            html += `
                <h4>${entity.name}</h4>
                ${entity.description ? `<p class="description">${entity.description}</p>` : ''}
                ${entity.coordinates ? `<p class="coordinates">Coordinates: ${entity.coordinates}</p>` : ''}
            `;
        }
        
        // Add references section
        html += `
            <h5>References in text:</h5>
            <ul id="entityReferences" class="references">
                <li>Loading...</li>
            </ul>
        `;
        
        html += '</div>';
        
        // Store entity info for navigation
        const modal = document.getElementById('entityModal');
        modal.setAttribute('data-entity-type', entityType);
        modal.setAttribute('data-entity-id', entity.id);
        
        return html;
    }

    // Find all references to an entity in the text
    function findEntityReferences(entityId, entityType) {
        const references = [];
        const entityRefs = document.querySelectorAll(`.entity-ref[data-entity-id="${entityId}"]`);
        
        entityRefs.forEach(ref => {
            const poem = ref.closest('.poem');
            if (poem) {
                const poemId = poem.getAttribute('data-poem-id');
                const line = ref.closest('.line');
                const lineNum = line?.querySelector('.line-number')?.textContent;
                
                references.push({
                    poemId: poemId,
                    lineNumber: lineNum,
                    context: line?.textContent.trim().substring(0, 100) + '...'
                });
            }
        });
        
        // Update references list
        const refList = document.getElementById('entityReferences');
        if (refList) {
            if (references.length > 0) {
                refList.innerHTML = references.map(ref => 
                    `<li>
                        <a href="#${ref.poemId}" onclick="closeEntityModal()">
                            Poem ${ref.poemId}${ref.lineNumber ? ', line ' + ref.lineNumber : ''}
                        </a>
                        ${ref.context ? `<br><small>${ref.context}</small>` : ''}
                    </li>`
                ).join('');
            } else {
                refList.innerHTML = '<li>No references found</li>';
            }
        }
    }

    // Utility function to escape regex special characters
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Add styles for prosopography features
    function addProsopographyStyles() {
        const style = document.createElement('style');
        style.id = 'prosopographyStyles';
        style.textContent = `
            /* Entity references */
            .entity-ref {
                cursor: pointer;
                border-bottom: 1px dotted #3498db;
                position: relative;
            }
            
            .entity-ref:hover {
                background: #e3f2fd;
                border-bottom-color: #2196f3;
            }
            
            .person-ref {
                border-bottom-color: #3498db;
            }
            
            .place-ref {
                border-bottom-color: #27ae60;
            }
            
            /* Entity modal */
            .entity-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 10000;
            }
            
            .entity-modal-content {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                border-radius: 8px;
                width: 90%;
                max-width: 600px;
                max-height: 80vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }
            
            .entity-modal-header {
                padding: 20px;
                border-bottom: 1px solid #dee2e6;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .entity-modal-body {
                padding: 20px;
                overflow-y: auto;
                flex: 1;
            }
            
            .entity-modal-footer {
                padding: 15px 20px;
                border-top: 1px solid #dee2e6;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }
            
            .entity-details h4 {
                margin: 0 0 10px 0;
                color: #2c3e50;
            }
            
            .entity-details h5 {
                margin: 20px 0 10px 0;
                color: #34495e;
                font-size: 14px;
                text-transform: uppercase;
            }
            
            .entity-details .occupation {
                font-style: italic;
                color: #7f8c8d;
                margin: 5px 0;
            }
            
            .entity-details .dates {
                color: #95a5a6;
                margin: 5px 0;
            }
            
            .entity-details .note {
                margin: 15px 0;
                line-height: 1.6;
            }
            
            .entity-details .relationships,
            .entity-details .references {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            
            .entity-details .relationships li,
            .entity-details .references li {
                padding: 5px 0;
                border-bottom: 1px solid #ecf0f1;
            }
            
            .entity-details .references a {
                color: #3498db;
                text-decoration: none;
            }
            
            .entity-details .references a:hover {
                text-decoration: underline;
            }
            
            .entity-details .references small {
                color: #95a5a6;
                font-style: italic;
            }
            
            /* Button styles */
            .btn {
                padding: 8px 16px;
                border: 1px solid #dee2e6;
                background: #f8f9fa;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
            }
            
            .btn:hover {
                background: #e9ecef;
            }
            
            .btn.primary {
                background: #3498db;
                color: white;
                border-color: #3498db;
            }
            
            .btn.primary:hover {
                background: #2980b9;
            }
            
            .close-btn {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #6c757d;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .close-btn:hover {
                color: #343a40;
            }
        `;
        document.head.appendChild(style);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            addProsopographyStyles();
            initProsopography();
        });
    } else {
        addProsopographyStyles();
        initProsopography();
    }

    // Re-initialize when TEI is loaded
    window.addEventListener('teiLoaded', () => {
        console.log('Prosopography: TEI loaded event received');
        window.prosopography.initialized = false;  // Reset to allow reinit
        initProsopography();
    });
    
    // Also listen for dataReady event
    window.addEventListener('dataReady', () => {
        console.log('Prosopography: Data ready event received');
        if (!window.prosopography.initialized) {
            initProsopography();
        }
    });

    // Export API
    window.prosopographyAPI = {
        init: initProsopography,
        getPersons: () => Array.from(window.prosopography.persons.values()),
        getPlaces: () => Array.from(window.prosopography.places.values()),
        getRelationships: () => window.prosopography.relationships,
        findEntity: (id) => {
            return window.prosopography.persons.get(id) || 
                   window.prosopography.places.get(id);
        },
        showEntity: showEntityDetails,
        processElement: processReferencesInElement
    };

})();