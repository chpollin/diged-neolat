#!/usr/bin/env python3
"""
Reprocess the data using the new TEI with all page breaks
This will ensure poems have proper page information for synchronization
"""

import json
import logging
from pathlib import Path
import sys

# Add the parent directory to path to import the main processor
sys.path.insert(0, str(Path(__file__).parent))

from lucina_digital_edition import LucinaDigitalEdition
from enhanced_processor import EnhancedLucinaProcessor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('ReprocessWithPages')


def main():
    print("Reprocessing Lucina data with complete page breaks...")
    print("="*50)
    
    # Use the NEW TEI file with all 130 page breaks
    tei_file = Path("C:/Users/Chrisi/Documents/GitHub/diged-neolat/docs/edition-3/tei-final-3-with-pages.xml")
    output_dir = Path("C:/Users/Chrisi/Documents/GitHub/diged-neolat/docs/edition-3/web")
    
    if not tei_file.exists():
        print(f"ERROR: TEI file not found: {tei_file}")
        return
    
    print(f"Using TEI file: {tei_file}")
    print(f"Output directory: {output_dir}")
    print()
    
    try:
        # Step 1: Process with main processor
        print("Step 1: Processing TEI with main processor...")
        processor = LucinaDigitalEdition(str(tei_file))
        complete_data = processor.process_all()
        
        # Save initial data
        json_output = output_dir / "lucina_data_with_pages.json"
        processor.export_json(str(json_output))
        print(f"Saved initial data to: {json_output}")
        
        # Step 2: Enhance with page information
        print("\nStep 2: Enhancing with page break information...")
        enhancer = EnhancedLucinaProcessor(
            str(tei_file),
            str(json_output)
        )
        
        # Extract and add page information
        enhanced_data = enhancer.enhance_poems_with_pages()
        
        # Save enhanced data
        enhanced_output = output_dir / "enhanced_data_complete.json"
        enhancer.save_enhanced_data(str(enhanced_output))
        print(f"Saved enhanced data to: {enhanced_output}")
        
        # Step 3: Generate JavaScript data files
        print("\nStep 3: Generating JavaScript data files...")
        
        # Generate poems data with page info
        poems_js = "// Poems Data with Page Information\nwindow.poemsData = " + json.dumps(
            enhanced_data.get('poems', {}), 
            indent=2, 
            ensure_ascii=False
        ) + ";"
        
        poems_file = output_dir / "poems-data-pages.js"
        with open(poems_file, 'w', encoding='utf-8') as f:
            f.write(poems_js)
        print(f"Generated: {poems_file}")
        
        # Generate persons data
        persons_js = "// Persons Data\nwindow.personsData = " + json.dumps(
            enhanced_data.get('persons', {}), 
            indent=2, 
            ensure_ascii=False
        ) + ";"
        
        persons_file = output_dir / "persons-data.js"
        with open(persons_file, 'w', encoding='utf-8') as f:
            f.write(persons_js)
        print(f"Generated: {persons_file}")
        
        # Generate books data
        books_js = "// Books Data\nwindow.booksData = " + json.dumps(
            enhanced_data.get('books', {}), 
            indent=2, 
            ensure_ascii=False
        ) + ";"
        
        books_file = output_dir / "books-data.js"
        with open(books_file, 'w', encoding='utf-8') as f:
            f.write(books_js)
        print(f"Generated: {books_file}")
        
        # Step 4: Report statistics
        print("\n" + "="*50)
        print("REPROCESSING COMPLETE!")
        print("="*50)
        print(f"Total poems: {len(enhanced_data.get('poems', {}))}")
        print(f"Total persons: {len(enhanced_data.get('persons', {}))}")
        print(f"Total page breaks: {len(enhanced_data.get('page_breaks', []))}")
        
        # Check how many poems have page info
        poems_with_pages = 0
        for poem in enhanced_data.get('poems', {}).values():
            if 'page_info' in poem and poem['page_info']:
                poems_with_pages += 1
        
        print(f"Poems with page information: {poems_with_pages}")
        
        print("\nNext steps:")
        print("1. Update index_sync.html to use poems-data-pages.js")
        print("2. Refresh the synchronized view")
        print("3. Images should now appear correctly!")
        
    except Exception as e:
        logger.error(f"Reprocessing failed: {e}")
        import traceback
        traceback.print_exc()
        raise


if __name__ == "__main__":
    main()