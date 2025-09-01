# TEI Edit Mode - User Guide

## Overview
The TEI Edit Mode allows in-browser editing of the Lucina Digital Edition's TEI XML content during local development. This feature is only available when running the edition locally (not on GitHub Pages). 

**Key Safety Feature:** All edits are saved to timestamped files in an `output/` folder - the original TEI source file is NEVER modified directly.

## Setup

### Option 1: Using File System Access API (Chrome/Edge)
No additional setup required - just open the edition locally and the edit mode will be available.

### Option 2: Using Node.js Companion Server
1. Install Node.js dependencies:
   ```bash
   cd docs/edition-5/web
   npm install
   ```

2. Start the edit server:
   ```bash
   npm start
   # or
   node edit-server.js
   ```
   The server will run on http://localhost:3001

3. Open the edition in your browser (via file:// or local server)

## Usage

### Enabling Edit Mode
1. Look for the "✏️ Edit Mode" button in the navigation bar (only visible when running locally)
2. Click the button or press `Ctrl+E` to toggle edit mode
3. When enabled, the button turns green and a floating toolbar appears

### Editing Content

#### Editing Poem Verses
1. In edit mode, click on any verse text to edit it
2. The text becomes editable with a yellow border on hover
3. Modified lines show with a green background
4. Line numbers and structure are preserved

#### Editing Attributes
1. Click "🏷️ Attributes" in the toolbar to show attribute editors
2. Edit xml:id and other attributes using the inline input fields
3. Changes are tracked and can be reviewed before saving

#### Editing Person/Place References
- Person and place names are highlighted with dotted underlines
- Click to edit reference IDs
- Autocomplete helps select from existing entries

### Saving Changes

#### Using File System Access API (Chrome/Edge)
1. Click "💾 Save" or press `Ctrl+S`
2. Choose where to save the edited XML file
3. Filename format: `tei-edited-YYYY-MM-DD-HH-MM-SS.xml`
4. Recommended: Save to the `output/` folder

#### Using Node.js Server
1. Ensure the edit server is running
2. Click "💾 Save" or press `Ctrl+S`
3. File automatically saved to: `output/tei-edited-YYYY-MM-DD-HH-MM-SS.xml`
4. Original file (`tei-final-3-3.xml`) remains untouched

### Reviewing Changes
1. Click "📊 Diff View" to see all pending changes
2. Review modifications before saving
3. Modified lines show in red (removed) and green (added)

### Post-Save Validation
After saving, a validation dialog appears showing:
- Basic XML well-formedness check
- TEI structure validation
- Line count preservation
- File size verification
- Next steps for manual validation

### Reverting Changes
- Click "↩️ Revert" to undo all unsaved changes
- Individual lines can be restored by clearing the text and re-entering original

## Keyboard Shortcuts
- `Ctrl+E` - Toggle edit mode
- `Ctrl+S` - Save changes (in edit mode)
- `Escape` - Exit edit mode

## Visual Indicators
- **Yellow border** - Editable element on hover
- **Blue border** - Currently editing
- **Green background** - Modified content
- **Yellow dot (●)** - Unsaved changes indicator

## Features

### What Can Be Edited
- Poem verse text
- TEI attributes (xml:id, type, n, subtype)
- Person references
- Place references
- Metadata in TEI header

### What Is Preserved
- Original XML structure
- Line numbers and formatting
- Page breaks and references
- Critical apparatus elements
- All non-edited content

## Troubleshooting

### Edit Mode Not Visible
- Ensure you're running locally (localhost, 127.0.0.1, or file://)
- Check browser console for errors
- Try refreshing the page

### Save Not Working

**File System API Issues:**
- Only works in Chrome/Edge browsers
- User must grant permission to save files
- Check browser security settings

**Server Save Issues:**
1. Check if server is running:
   ```bash
   curl http://localhost:3001/health
   ```
2. Ensure no firewall blocking port 3001
3. Check server console for error messages

### Changes Not Tracked
- Ensure edit mode is enabled (green button)
- Check that elements show yellow border on hover
- Look for JavaScript errors in browser console

## Workflow Summary

### Safe Editing Process
1. **Edit** - Make changes in browser with visual feedback
2. **Save** - Creates new file in `output/` with timestamp
3. **Validate** - Automatic basic checks + manual validation guide
4. **Test** - Load edited version to verify changes
5. **Promote** - If valid, manually replace source file

## Technical Details

### File Locations
```
edition-5/web/
├── edit-mode.js         # Edit mode functionality
├── edit-server.js       # Node.js save server
├── package.json         # Server dependencies
├── index.html           # Main edition
├── tei-final-3-3.xml    # Source TEI (never modified)
└── output/              # Edited versions saved here
    ├── tei-edited-2024-01-15-14-30-45.xml
    ├── tei-edited-2024-01-15-16-22-10.xml
    └── tei-edited-2024-01-16-09-15-33.xml
```

### Browser Compatibility
- **Full Support:** Chrome 86+, Edge 86+
- **Partial Support:** Firefox (server save only)
- **Not Supported:** Safari, Internet Explorer

### Server Endpoints
- `GET /health` - Server status check
- `POST /save` - Save TEI XML to output folder
- `GET /original` - Get source TEI file
- `GET /outputs` - List all edited versions
- `GET /output/:filename` - Get specific edited file
- `POST /compare` - Compare original with edited

## Security Notes
- Edit mode only available in local environment
- No remote editing capabilities
- Automatic backups created before overwriting
- XML validation before saving

## Best Practices
1. Always review changes in Diff View before saving
2. Keep the browser console open to monitor for errors
3. Make regular Git commits after saving edits
4. Test edited XML in an XML validator
5. Keep backup files until changes are verified

## Support
For issues or questions about the edit mode feature:
1. Check browser console for error messages
2. Verify local environment setup
3. Ensure all files are properly loaded
4. Review this documentation for common issues