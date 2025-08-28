// Simple Express server for TEI XML editing
// Run with: node edit-server.js
// This server allows saving edited TEI XML files during local development

const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;
const OUTPUT_DIR = path.join(__dirname, 'output');

// Enable CORS for local development
app.use(cors({
    origin: ['http://localhost:*', 'http://127.0.0.1:*', 'file://*'],
    credentials: true
}));

// Parse XML as text and JSON
app.use(express.text({ type: 'text/xml', limit: '10mb' }));
app.use(express.text({ type: 'application/xml', limit: '10mb' }));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'running', 
        message: 'TEI Edit Server is running',
        timestamp: new Date().toISOString()
    });
});

// Ensure output directory exists
async function ensureOutputDir() {
    try {
        await fs.access(OUTPUT_DIR);
    } catch {
        await fs.mkdir(OUTPUT_DIR, { recursive: true });
        console.log(`Created output directory: ${OUTPUT_DIR}`);
    }
}

// Initialize output directory on startup
ensureOutputDir();

// Save TEI XML endpoint (for indices.html TEI header editing)
app.post('/save-tei', async (req, res) => {
    try {
        const xmlContent = req.body;
        
        if (!xmlContent || xmlContent.trim().length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'No XML content provided' 
            });
        }

        // Ensure output directory exists
        await ensureOutputDir();

        // Generate timestamp-based filename for TEI header edits
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `tei-header-edited-${timestamp}.xml`;
        const filePath = path.join(OUTPUT_DIR, filename);
        
        // Write new content to output folder
        await fs.writeFile(filePath, xmlContent, 'utf8');
        
        console.log(`TEI header saved to output folder: ${filename}`);
        
        res.json({ 
            success: true, 
            message: 'TEI header saved successfully',
            filename: filename,
            filepath: filePath
        });
        
    } catch (error) {
        console.error('Save error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Save TEI XML endpoint (for main edition editing)
app.post('/save', async (req, res) => {
    try {
        const xmlContent = req.body;
        
        if (!xmlContent || xmlContent.trim().length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'No XML content provided' 
            });
        }

        // Validate XML structure (basic check)
        if (!xmlContent.includes('<TEI') || !xmlContent.includes('</TEI>')) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid TEI XML structure' 
            });
        }

        // Ensure output directory exists
        await ensureOutputDir();

        // Generate timestamp-based filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `tei-edited-${timestamp}.xml`;
        const filePath = path.join(OUTPUT_DIR, filename);
        
        // Write new content to output folder
        await fs.writeFile(filePath, xmlContent, 'utf8');
        
        console.log(`TEI XML saved to output folder: ${filename}`);
        console.log(`Full path: ${filePath}`);
        console.log(`File size: ${Buffer.byteLength(xmlContent, 'utf8')} bytes`);
        
        // Quick validation
        const validationResults = await validateTEI(xmlContent);
        
        res.json({ 
            success: true, 
            message: 'TEI XML saved successfully',
            filename: filename,
            filepath: filePath,
            size: Buffer.byteLength(xmlContent, 'utf8'),
            timestamp: timestamp,
            validation: validationResults
        });
        
    } catch (error) {
        console.error('Save error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Basic TEI validation function
async function validateTEI(xmlContent) {
    const results = {
        wellFormed: false,
        hasTEIRoot: false,
        hasHeader: false,
        lineCount: 0,
        poemCount: 0,
        sizeKB: Math.round(Buffer.byteLength(xmlContent, 'utf8') / 1024)
    };
    
    try {
        // Check basic structure
        results.hasTEIRoot = xmlContent.includes('<TEI') && xmlContent.includes('</TEI>');
        results.hasHeader = xmlContent.includes('<teiHeader>') && xmlContent.includes('</teiHeader>');
        
        // Count lines and poems
        const lineMatches = xmlContent.match(/<l\s+n="/g);
        results.lineCount = lineMatches ? lineMatches.length : 0;
        
        const poemMatches = xmlContent.match(/<div\s+type="poem"/g);
        results.poemCount = poemMatches ? poemMatches.length : 0;
        
        // Check if XML is well-formed (basic check)
        results.wellFormed = xmlContent.indexOf('<') !== -1 && 
                            xmlContent.lastIndexOf('>') === xmlContent.length - 1;
        
    } catch (error) {
        console.error('Validation error:', error);
    }
    
    return results;
}

// Get original TEI XML endpoint (source file)
app.get('/original', async (req, res) => {
    try {
        const filePath = path.join(__dirname, 'tei-final-3-4.xml');
        const content = await fs.readFile(filePath, 'utf8');
        res.type('text/xml').send(content);
    } catch (error) {
        res.status(404).json({ 
            success: false, 
            error: 'Original TEI file not found' 
        });
    }
});

// Get specific output file
app.get('/output/:filename', async (req, res) => {
    try {
        const filePath = path.join(OUTPUT_DIR, req.params.filename);
        const content = await fs.readFile(filePath, 'utf8');
        res.type('text/xml').send(content);
    } catch (error) {
        res.status(404).json({ 
            success: false, 
            error: 'Output file not found' 
        });
    }
});

// List files in output directory
app.get('/outputs', async (req, res) => {
    try {
        await ensureOutputDir();
        const files = await fs.readdir(OUTPUT_DIR);
        const xmlFiles = files.filter(f => f.endsWith('.xml'));
        
        // Get file stats
        const fileStats = await Promise.all(
            xmlFiles.map(async (file) => {
                const filePath = path.join(OUTPUT_DIR, file);
                const stats = await fs.stat(filePath);
                return {
                    filename: file,
                    size: stats.size,
                    sizeKB: Math.round(stats.size / 1024),
                    created: stats.birthtime,
                    modified: stats.mtime
                };
            })
        );
        
        // Sort by creation date (newest first)
        fileStats.sort((a, b) => b.created - a.created);
        
        res.json({ 
            success: true, 
            count: fileStats.length,
            files: fileStats
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Compare two TEI files
app.post('/compare', async (req, res) => {
    try {
        const { original, edited } = req.body;
        
        const originalPath = path.join(__dirname, original || 'tei-final-3-4.xml');
        const editedPath = path.join(OUTPUT_DIR, edited);
        
        const originalContent = await fs.readFile(originalPath, 'utf8');
        const editedContent = await fs.readFile(editedPath, 'utf8');
        
        // Basic comparison stats
        const stats = {
            original: {
                size: Buffer.byteLength(originalContent, 'utf8'),
                lines: originalContent.split('\n').length,
                lineElements: (originalContent.match(/<l\s+n="/g) || []).length,
                poems: (originalContent.match(/<div\s+type="poem"/g) || []).length
            },
            edited: {
                size: Buffer.byteLength(editedContent, 'utf8'),
                lines: editedContent.split('\n').length,
                lineElements: (editedContent.match(/<l\s+n="/g) || []).length,
                poems: (editedContent.match(/<div\s+type="poem"/g) || []).length
            },
            changes: {
                sizeChange: 0,
                linesChange: 0,
                lineElementsChange: 0,
                poemsChange: 0
            }
        };
        
        stats.changes.sizeChange = stats.edited.size - stats.original.size;
        stats.changes.linesChange = stats.edited.lines - stats.original.lines;
        stats.changes.lineElementsChange = stats.edited.lineElements - stats.original.lineElements;
        stats.changes.poemsChange = stats.edited.poems - stats.original.poems;
        
        res.json({ 
            success: true, 
            comparison: stats
        });
        
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════╗
║         TEI Edit Server Running                 ║
╠════════════════════════════════════════════════╣
║  Server URL: http://localhost:${PORT}             ║
║  Output Dir: ./output/                          ║
║                                                  ║
║  Endpoints:                                      ║
║  POST /save - Save TEI XML to output/           ║
║  GET /original - Get source TEI XML             ║
║  GET /outputs - List output files               ║
║  GET /output/:filename - Get specific output    ║
║  POST /compare - Compare original with edited   ║
║  GET /health - Server status                    ║
║                                                  ║
║  Press Ctrl+C to stop the server                ║
╚════════════════════════════════════════════════╝
    `);
});