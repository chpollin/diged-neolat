# System Prompt: Implement Lucina Digital Edition for GitHub Pages

## Project Context
Create a complete web-based digital edition viewer for the "Lucina" manuscript (Madrid BN Mss. 6028) that will be hosted on GitHub Pages. The application must parse a TEI XML file and display synchronized Latin elegiac poems with manuscript page images.

## File Structure & Paths
```
diged-neolat/
├── docs/
│   ├── facsimiles/           # Manuscript images location
│   │   ├── image_5_2__right.jpg
│   │   ├── image_6_1__left.jpg
│   │   ├── image_6_1__right.jpg
│   │   └── ... (all manuscript pages)
│   └── edition-3/
│       └── web/              # YOUR WORKING DIRECTORY
│           ├── index.html    # Main application file
│           ├── tei-final-3-1.xml  # Source TEI data
│           └── [any additional files you create]
```

**CRITICAL PATH CONFIGURATION:**
- Working directory: `/docs/edition-3/web/`
- Images path: `../../facsimiles/` (relative from web folder)
- TEI file: `./tei-final-3-1.xml` (in same folder)
- GitHub Pages URL will be: `https://[username].github.io/diged-neolat/edition-3/web/`

## Technical Requirements

### 1. Single-File Implementation
Create a self-contained `index.html` file with:
- Embedded CSS in `<style>` tags
- Embedded JavaScript in `<script>` tags
- No external dependencies except the TEI XML file
- Must work with GitHub Pages (static hosting only)

### 2. TEI XML Processing
```javascript
// Load and parse TEI XML on page load
fetch('./tei-final-3-1.xml')
  .then(response => response.text())
  .then(xmlString => {
    const parser = new DOMParser();
    const teiDoc = parser.parseFromString(xmlString, 'text/xml');
    processTEI(teiDoc);
  });
```

Extract from TEI:
- All poems from `<div type="poem">`
- Person data from `<standOff><listPerson>`
- Page breaks `<pb facs="..." n="..."/>` 
- Image mappings: `facs` attribute = filename, `n` attribute = page number

### 3. Layout Specifications

```
┌─ Navigation Bar (60px height, fixed) ─────────────────────────┐
│ Lucina Digital Edition   [Latin|Commentary|Translation]       │
│                          [Book ▼][Poem ▼][Search][ℹ]         │
├────────────────────┬──────────────────────────────────────────┤
│ Text Panel (50%)   │ Image Viewer (50%)                       │
│                    │                                           │
│ I, 1               │ [Zoom -][+][Fit][↻]  Page 6.1  [←][→]   │
│ Ad Cichum...       │ ┌────────────────────────────────────┐  │
│                    │ │                                    │  │
│ 1 Saepe revert...  │ │    [Manuscript Image Display]     │  │
│ 2    Structa ubi...│ │                                    │  │
│                    │ │    or "No image available"         │  │
│ — page 6.2 —       │ └────────────────────────────────────┘  │
│                    │                                           │
│ 3 Noctis erat...   │                                           │
└────────────────────┴──────────────────────────────────────────┘
```

### 4. Core Features to Implement

#### 4.1 Text Display Rules
- **Line numbers**: Right-aligned, 30px width, gray color (#6c757d)
- **Elegiac couplets**: 
  - Odd lines (hexameter): No indent
  - Even lines (pentameter): 40px left indent
- **Font**: Georgia for Latin text (18px), system fonts for UI (14px)
- **Page breaks**: Centered, small-caps, format: `— page X.Y —`

#### 4.2 Image Synchronization
```javascript
// Critical feature: As user scrolls text, image updates at page boundaries
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const pageNum = entry.target.dataset.page;
      updateImage(pageNum);
    }
  });
}, { threshold: 0.5 });

// Observe all elements with data-page attribute
document.querySelectorAll('[data-page]').forEach(el => {
  observer.observe(el);
});

function updateImage(pageNumber) {
  const imagePath = pageMapping[pageNumber];
  if (imagePath) {
    // IMPORTANT: Use correct relative path
    document.getElementById('manuscriptImage').src = 
      `../../facsimiles/${imagePath}`;
  } else {
    showNoImageMessage();
  }
}
```

#### 4.3 Navigation Controls
- **Book selector**: Populate from TEI `<div type="book" n="1/2/3">`
- **Poem selector**: Format as "I, 1 — Ad Mecoenatem Cichum Simonetam"
- **View toggle**: Latin (default) | Commentary | Translation
- **Search**: Simple substring search in poems, highlight matches

#### 4.4 Person References
```javascript
// Extract from <standOff><listPerson>
// Wrap matching names in text with tooltips
<span class="person" data-id="cicco-simonetta">
  Cichum Simonetam
  <span class="tooltip">Cicco Simonetta - Secretary to Duke</span>
</span>
```

### 5. CSS Variables & Design System
```css
:root {
  --primary: #2c3e50;      /* Headers, main text */
  --secondary: #3498db;    /* Links, active buttons */
  --accent: #c9302c;       /* Active states */
  --gray-light: #f8f9fa;   /* Backgrounds */
  --gray-mid: #6c757d;     /* Line numbers, secondary text */
  --font-latin: Georgia, serif;
  --font-ui: system-ui, -apple-system, sans-serif;
}
```

### 6. Responsive Behavior
- **Mobile (<768px)**: Stack panels vertically, hide poem selector
- **Tablet (768-1024px)**: 60/40 split
- **Desktop (>1024px)**: 50/50 split

### 7. Image Viewer Controls
```javascript
// Zoom: 0.5x to 3x using CSS transform
let currentZoom = 1;
function zoom(delta) {
  currentZoom = Math.max(0.5, Math.min(3, currentZoom + delta));
  image.style.transform = `scale(${currentZoom})`;
}

// Page navigation through ordered list
const allPages = ['5.2', '6.1', '6.2', '7.1', '7.2', ...];
function nextPage() {
  const index = allPages.indexOf(currentPage);
  if (index < allPages.length - 1) {
    updateImage(allPages[index + 1]);
  }
}
```

### 8. Error Handling
```javascript
// Handle missing images gracefully
image.onerror = () => {
  imageContainer.innerHTML = 
    '<div class="no-image">No image available</div>';
};

// Handle TEI loading errors
.catch(error => {
  console.error('Failed to load TEI:', error);
  showError('Unable to load manuscript data');
});
```

### 9. URL State Management
Support deep linking:
- `#poem-I.1` → Jump to specific poem
- `#poem-I.1?page=6.2` → Specific poem and page
- `?search=lucina` → Search results

### 10. Required Data Structures

```javascript
// Page to image mapping (extract from TEI <pb> elements)
const pageMapping = {
  "5.2": "image_5_2__right.jpg",
  "6.1": "image_6_1__left.jpg",
  "6.2": "image_6_1__right.jpg",
  "7.1": "image_7_1__left.jpg",
  "7.2": "image_7_1__right.jpg"
  // ... populate from all <pb> elements
};

// Poems structure (build from TEI)
const poems = [
  {
    id: "poem-I.1",
    book: 1,
    number: 1,
    title: "Ad Mecoenatem Cichum Simonetam",
    startPage: "6.1",
    couplets: [
      { hex: { n: 1, text: "..." }, pent: { n: 2, text: "..." } }
    ]
  }
];

// Person database (from <standOff>)
const persons = {
  "cicco-simonetta": {
    name: "Cicco Simonetta",
    role: "Secretary to Duke Galeazzo Maria Sforza",
    dates: "1410-1480"
  }
};
```

## Implementation Output

Create a single `index.html` file that:
1. Loads and parses `tei-final-3-1.xml` from the same directory
2. Displays poems with proper elegiac formatting
3. Shows manuscript images from `../../facsimiles/`
4. Synchronizes text scrolling with image display
5. Provides all navigation and search features
6. Works perfectly on GitHub Pages without any server-side code
7. Handles errors gracefully (missing images, parsing failures)
8. Is responsive and works on mobile devices

## Testing Checklist
- [ ] TEI XML loads and parses correctly
- [ ] Poems display with proper line numbers and indentation
- [ ] Images load from correct path (`../../facsimiles/`)
- [ ] Scrolling text updates manuscript image
- [ ] Book/poem navigation works
- [ ] Search finds and highlights text
- [ ] Person tooltips appear on hover
- [ ] View switching (Latin/Commentary/Translation) works
- [ ] Zoom controls function properly
- [ ] Page navigation arrows work
- [ ] Responsive layout adapts to screen size
- [ ] Deep linking via URL hash works
- [ ] "No image available" message shows for missing images

## CRITICAL REMINDERS
- Use relative path `../../facsimiles/` for all images
- TEI file is in same folder as index.html
- Must be completely static (no server-side processing)
- Single file implementation preferred for simplicity
- Test with actual file paths before deployment