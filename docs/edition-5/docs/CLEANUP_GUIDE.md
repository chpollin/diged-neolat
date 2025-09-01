# Edition-5 Cleanup Guide

## 📊 Current Status
- **Total Files**: 600+ (mostly node_modules)
- **Essential Files**: 23
- **Test Files**: 10
- **Can Remove**: 570+ files

## 🧹 Cleanup Plan

### Size Impact
- **Before Cleanup**: ~60 MB
- **After Cleanup**: ~5 MB
- **Space Saved**: ~55 MB (92% reduction)

### What Gets Removed
1. **node_modules/** - 600+ files, 55 MB
2. **Test files** - Moved to /tests
3. **Backup files** - Moved to /archive
4. **Python scripts** - Not needed for production
5. **.claude/** - Editor configuration

### What Stays (Essential Files)

#### Core Application (23 files)
```
web/
├── index.html              # Main edition
├── indices.html            # Index page
├── about.html              # About page
├── editorial.html          # Editorial introduction
├── style.css               # Styles
├── tei-final-3-4.xml      # TEI data
├── prosopography.js        # Person/place module
├── metrics.js              # Metrics module
├── commentary.js           # Commentary module
├── translation.js          # Translation module
├── export.js               # Export module
├── edit-mode.js            # Edit mode
├── init-master.js          # Initialization
├── data/
│   ├── commentary.json     # Commentary data
│   └── translations.json   # Translation data
└── output/                 # For edited TEI files
```

## 🚀 How to Clean Up

### Option 1: Automated Cleanup (Recommended)

**Windows:**
```batch
cd docs\edition-5
cleanup.bat
```

**Mac/Linux:**
```bash
cd docs/edition-5
chmod +x cleanup.sh
./cleanup.sh
```

### Option 2: Manual Cleanup

1. **Remove node_modules:**
```bash
# Windows
rmdir /s /q web\node_modules

# Mac/Linux
rm -rf web/node_modules
```

2. **Move test files:**
```bash
mkdir web\tests
move web\test-*.* web\tests\
move web\final-test.html web\tests\
```

3. **Archive backups:**
```bash
mkdir archive
move web\indices-backup.html archive\
move web\*.py archive\
```

4. **Clean editor files:**
```bash
rmdir /s /q web\.claude
```

## 📁 Final Clean Structure

```
edition-5/
├── README.md
├── web/
│   ├── index.html          # Main app
│   ├── indices.html        # Indices
│   ├── about.html          # About
│   ├── editorial.html      # Editorial
│   ├── style.css           # Styles
│   ├── js/                 # All JS modules
│   ├── data/               # TEI & JSON data
│   ├── output/             # User edits
│   └── server/             # Dev server (optional)
├── tests/                  # All test files
├── docs/                   # Documentation
└── archive/                # Archived files
```

## ✅ Benefits of Cleanup

1. **92% size reduction** (60MB → 5MB)
2. **Faster loading** - No unnecessary files
3. **Clear organization** - Easy to find files
4. **Production ready** - Only essential files
5. **Easy deployment** - Just upload web/ folder

## 🔄 Restoring Development Environment

If you need to restore development capabilities:

```bash
cd web/server
npm install
```

This will recreate node_modules with all dependencies.

## 📋 Checklist

- [ ] Run cleanup script
- [ ] Remove node_modules
- [ ] Move test files to /tests
- [ ] Archive backup files
- [ ] Remove .claude directory
- [ ] Verify edition still works
- [ ] Update script paths if needed
- [ ] Test all features
- [ ] Document any issues

## ⚠️ Important Notes

1. **Keep package.json** - Needed to reinstall dependencies
2. **Keep output/ folder** - For user's edited TEI files
3. **Test after cleanup** - Ensure everything still works
4. **Backup first** - Create a backup before cleaning

## 🎯 Final Result

After cleanup, you'll have:
- A clean, organized structure
- 92% smaller footprint
- Production-ready code
- Easy to maintain
- Ready for deployment

The edition will be fully functional with all features working!