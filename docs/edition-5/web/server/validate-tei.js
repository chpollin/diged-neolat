// TEI Validation Script
// Usage: node validate-tei.js [filename]
// Validates TEI XML files in the output folder

const fs = require('fs').promises;
const path = require('path');
const { DOMParser } = require('xmldom');

const OUTPUT_DIR = path.join(__dirname, 'output');

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    bold: '\x1b[1m'
};

async function validateTEI(filepath) {
    console.log(`\n${colors.blue}${colors.bold}Validating TEI File${colors.reset}`);
    console.log(`File: ${filepath}`);
    console.log('='.repeat(50));
    
    try {
        // Read file
        const content = await fs.readFile(filepath, 'utf8');
        const fileSize = Buffer.byteLength(content, 'utf8');
        
        // Validation results
        const results = {
            passed: [],
            failed: [],
            warnings: []
        };
        
        // Test 1: File exists and readable
        results.passed.push('File readable');
        
        // Test 2: File size reasonable
        const sizeKB = Math.round(fileSize / 1024);
        if (sizeKB > 100 && sizeKB < 10000) {
            results.passed.push(`File size OK (${sizeKB} KB)`);
        } else {
            results.warnings.push(`Unusual file size: ${sizeKB} KB`);
        }
        
        // Test 3: XML well-formed
        const parser = new DOMParser({
            errorHandler: {
                warning: (w) => results.warnings.push(`XML Warning: ${w}`),
                error: (e) => results.failed.push(`XML Error: ${e}`),
                fatalError: (e) => results.failed.push(`XML Fatal: ${e}`)
            }
        });
        
        const doc = parser.parseFromString(content, 'text/xml');
        
        if (results.failed.length === 0) {
            results.passed.push('XML is well-formed');
        }
        
        // Test 4: TEI structure
        if (content.includes('<TEI') && content.includes('</TEI>')) {
            results.passed.push('TEI root element found');
        } else {
            results.failed.push('TEI root element missing');
        }
        
        // Test 5: TEI Header
        if (content.includes('<teiHeader>') && content.includes('</teiHeader>')) {
            results.passed.push('TEI header present');
        } else {
            results.failed.push('TEI header missing');
        }
        
        // Test 6: Count elements
        const stats = {
            lines: (content.match(/<l\s+n="/g) || []).length,
            poems: (content.match(/<div\s+type="poem"/g) || []).length,
            persons: (content.match(/<person\s+xml:id="/g) || []).length,
            places: (content.match(/<place\s+xml:id="/g) || []).length
        };
        
        results.passed.push(`Found ${stats.lines} lines`);
        results.passed.push(`Found ${stats.poems} poems`);
        
        // Expected counts (based on project documentation)
        if (stats.poems >= 127 && stats.poems <= 128) {
            results.passed.push('Poem count matches expected (127-128)');
        } else {
            results.warnings.push(`Unexpected poem count: ${stats.poems}`);
        }
        
        if (stats.lines >= 2200 && stats.lines <= 2300) {
            results.passed.push('Line count in expected range (2200-2300)');
        } else {
            results.warnings.push(`Line count outside expected range: ${stats.lines}`);
        }
        
        // Test 7: Check for common encoding errors
        if (content.includes('&amp;amp;')) {
            results.warnings.push('Double-encoded ampersands detected');
        }
        
        if (content.includes('xmlns=""')) {
            results.warnings.push('Empty namespace declarations found');
        }
        
        // Test 8: Page breaks
        const pageBreaks = (content.match(/<pb\s+/g) || []).length;
        if (pageBreaks > 0) {
            results.passed.push(`Found ${pageBreaks} page breaks`);
        } else {
            results.warnings.push('No page breaks found');
        }
        
        // Display results
        console.log(`\n${colors.green}${colors.bold}✓ Passed (${results.passed.length})${colors.reset}`);
        results.passed.forEach(msg => console.log(`  ${colors.green}✓${colors.reset} ${msg}`));
        
        if (results.warnings.length > 0) {
            console.log(`\n${colors.yellow}${colors.bold}⚠ Warnings (${results.warnings.length})${colors.reset}`);
            results.warnings.forEach(msg => console.log(`  ${colors.yellow}⚠${colors.reset} ${msg}`));
        }
        
        if (results.failed.length > 0) {
            console.log(`\n${colors.red}${colors.bold}✗ Failed (${results.failed.length})${colors.reset}`);
            results.failed.forEach(msg => console.log(`  ${colors.red}✗${colors.reset} ${msg}`));
        }
        
        // Summary
        console.log('\n' + '='.repeat(50));
        const status = results.failed.length === 0 ? 'VALID' : 'INVALID';
        const statusColor = results.failed.length === 0 ? colors.green : colors.red;
        console.log(`${colors.bold}Overall Status: ${statusColor}${status}${colors.reset}`);
        
        // Additional recommendations
        if (results.failed.length === 0 && results.warnings.length === 0) {
            console.log(`\n${colors.green}${colors.bold}Excellent!${colors.reset} The file appears to be valid.`);
            console.log('Next steps:');
            console.log('1. Validate with Oxygen XML Editor or similar tool');
            console.log('2. Test by loading in the viewer');
            console.log('3. Compare with original for completeness');
        } else if (results.failed.length === 0) {
            console.log(`\n${colors.yellow}Good!${colors.reset} The file is valid but has some warnings.`);
            console.log('Review the warnings and validate with professional tools.');
        } else {
            console.log(`\n${colors.red}Issues found!${colors.reset} The file needs corrections.`);
            console.log('Fix the errors before proceeding.');
        }
        
        return results.failed.length === 0;
        
    } catch (error) {
        console.error(`${colors.red}${colors.bold}Error reading file:${colors.reset} ${error.message}`);
        return false;
    }
}

async function compareWithOriginal(editedFile) {
    console.log(`\n${colors.blue}${colors.bold}Comparing with Original${colors.reset}`);
    console.log('='.repeat(50));
    
    try {
        const originalPath = path.join(__dirname, 'tei-final-3-3.xml');
        const editedPath = path.join(OUTPUT_DIR, editedFile);
        
        const original = await fs.readFile(originalPath, 'utf8');
        const edited = await fs.readFile(editedPath, 'utf8');
        
        const originalStats = {
            size: Buffer.byteLength(original, 'utf8'),
            lines: (original.match(/<l\s+n="/g) || []).length,
            poems: (original.match(/<div\s+type="poem"/g) || []).length
        };
        
        const editedStats = {
            size: Buffer.byteLength(edited, 'utf8'),
            lines: (edited.match(/<l\s+n="/g) || []).length,
            poems: (edited.match(/<div\s+type="poem"/g) || []).length
        };
        
        console.log('Original vs Edited:');
        console.log(`  Size: ${Math.round(originalStats.size/1024)}KB → ${Math.round(editedStats.size/1024)}KB (${editedStats.size > originalStats.size ? '+' : ''}${editedStats.size - originalStats.size} bytes)`);
        console.log(`  Lines: ${originalStats.lines} → ${editedStats.lines} (${editedStats.lines > originalStats.lines ? '+' : ''}${editedStats.lines - originalStats.lines})`);
        console.log(`  Poems: ${originalStats.poems} → ${editedStats.poems} (${editedStats.poems > originalStats.poems ? '+' : ''}${editedStats.poems - originalStats.poems})`);
        
        if (editedStats.lines === originalStats.lines && editedStats.poems === originalStats.poems) {
            console.log(`\n${colors.green}✓ Structure preserved${colors.reset}`);
        } else {
            console.log(`\n${colors.yellow}⚠ Structure changed - verify this is intentional${colors.reset}`);
        }
        
    } catch (error) {
        console.error(`${colors.red}Could not compare with original: ${error.message}${colors.reset}`);
    }
}

async function listOutputFiles() {
    try {
        await fs.access(OUTPUT_DIR);
        const files = await fs.readdir(OUTPUT_DIR);
        const xmlFiles = files.filter(f => f.endsWith('.xml')).sort().reverse();
        
        if (xmlFiles.length === 0) {
            console.log(`No XML files found in output directory.`);
            return null;
        }
        
        console.log(`\n${colors.bold}Available files in output/:${colors.reset}`);
        xmlFiles.forEach((file, index) => {
            console.log(`  ${index + 1}. ${file}`);
        });
        
        return xmlFiles[0]; // Return most recent
        
    } catch (error) {
        console.log(`Output directory does not exist yet. Save a file first.`);
        return null;
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    
    console.log(`${colors.bold}TEI Validation Tool${colors.reset}`);
    console.log('Version 1.0.0\n');
    
    let filepath;
    
    if (args[0]) {
        // Validate specific file
        if (args[0].includes('/') || args[0].includes('\\')) {
            filepath = args[0];
        } else {
            filepath = path.join(OUTPUT_DIR, args[0]);
        }
    } else {
        // List files and validate most recent
        const recentFile = await listOutputFiles();
        if (recentFile) {
            console.log(`\nValidating most recent: ${colors.bold}${recentFile}${colors.reset}`);
            filepath = path.join(OUTPUT_DIR, recentFile);
        } else {
            console.log('\nUsage: node validate-tei.js [filename]');
            console.log('Example: node validate-tei.js tei-edited-2024-01-15-14-30-45.xml');
            process.exit(1);
        }
    }
    
    // Run validation
    const isValid = await validateTEI(filepath);
    
    // Compare with original if valid
    if (isValid && filepath.includes('output')) {
        const filename = path.basename(filepath);
        await compareWithOriginal(filename);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('Validation complete.\n');
    
    process.exit(isValid ? 0 : 1);
}

// Handle missing xmldom
try {
    require('xmldom');
} catch (e) {
    console.error(`${colors.red}${colors.bold}Error: xmldom package not installed${colors.reset}`);
    console.log('Please run: npm install xmldom');
    process.exit(1);
}

main();