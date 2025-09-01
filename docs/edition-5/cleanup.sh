#!/bin/bash

echo "========================================"
echo " Edition-5 Cleanup Script"
echo "========================================"
echo

# Navigate to web directory
cd web

# Create new directory structure
echo "Creating organized directory structure..."
mkdir -p js tests ../docs ../archive server

echo
echo "Moving JavaScript modules to js/ directory..."
# Move JS modules
for file in prosopography.js metrics.js commentary.js translation.js export.js edit-mode.js init-master.js; do
    [ -f "$file" ] && mv "$file" js/ 2>/dev/null
done

echo "Moving test files to tests/ directory..."
# Move test files
[ -f "final-test.html" ] && mv final-test.html tests/ 2>/dev/null
[ -f "quick-test.js" ] && mv quick-test.js tests/ 2>/dev/null
[ -f "debug-tei.js" ] && mv debug-tei.js tests/ 2>/dev/null
mv test-*.html tests/ 2>/dev/null
mv test-*.js tests/ 2>/dev/null

echo "Moving server files to server/ directory..."
# Move server files
[ -f "edit-server.js" ] && mv edit-server.js server/ 2>/dev/null
[ -f "package.json" ] && cp package.json server/ 2>/dev/null
[ -f "package-lock.json" ] && cp package-lock.json server/ 2>/dev/null
[ -f "validate-tei.js" ] && mv validate-tei.js server/ 2>/dev/null

echo "Moving documentation files..."
# Move documentation
[ -f "EDIT_MODE_README.md" ] && mv EDIT_MODE_README.md ../docs/ 2>/dev/null
[ -f "../IMPLEMENTATION_SUMMARY.md" ] && mv ../IMPLEMENTATION_SUMMARY.md ../docs/ 2>/dev/null
[ -f "../project.md" ] && mv ../project.md ../docs/ 2>/dev/null

echo "Archiving backup and unused files..."
# Archive files
[ -f "indices-backup.html" ] && mv indices-backup.html ../archive/ 2>/dev/null
[ -f "indices-edit-mode.js" ] && mv indices-edit-mode.js ../archive/ 2>/dev/null
mv *.py ../archive/ 2>/dev/null
[ -d "llm-extracted-data" ] && mv llm-extracted-data/*.py ../archive/ 2>/dev/null

echo
echo "Cleanup recommendations:"
echo "1. Remove node_modules/ directory (600+ MB)"
echo "   Command: rm -rf node_modules"
echo
echo "2. Remove .claude/ directory"
echo "   Command: rm -rf .claude"
echo
echo "3. To reinstall dependencies later:"
echo "   Command: cd server && npm install"
echo
echo "========================================"
echo " Cleanup Complete!"
echo "========================================"
echo
echo "Final structure:"
echo "  web/"
echo "  ├── HTML files (index, about, etc.)"
echo "  ├── js/ (all JavaScript modules)"
echo "  ├── data/ (TEI and JSON data)"
echo "  ├── server/ (development server)"
echo "  ├── tests/ (all test files)"
echo "  └── output/ (for edited files)"
echo