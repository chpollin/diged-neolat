// Lucina Digital Edition - Main Application

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
});