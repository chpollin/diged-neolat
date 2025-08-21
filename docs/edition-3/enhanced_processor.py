#!/usr/bin/env python3
"""
Enhanced Lucina Processor - Extracts page breaks and creates synchronized view
"""

import json
import logging
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Dict, List, Any, Tuple

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('EnhancedProcessor')


class EnhancedLucinaProcessor:
    """Process TEI with page break information for synchronized display"""
    
    def __init__(self, tei_path: str, json_data_path: str):
        self.tei_path = Path(tei_path)
        self.json_path = Path(json_data_path)
        
        # TEI namespace
        self.ns = {
            'tei': 'http://www.tei-c.org/ns/1.0',
            'xml': 'http://www.w3.org/XML/1998/namespace'
        }
        
        # Load existing JSON data
        with open(self.json_path, 'r', encoding='utf-8') as f:
            self.data = json.load(f)
        
        # Parse TEI
        self.tree = ET.parse(self.tei_path)
        self.root = self.tree.getroot()
        
        logger.info(f"Loaded TEI from {self.tei_path}")
        logger.info(f"Loaded JSON from {self.json_path}")
    
    def extract_page_breaks(self) -> Dict[str, Any]:
        """Extract all page breaks with their positions in poems"""
        logger.info("Extracting page breaks...")
        
        page_breaks = []
        poem_pages = {}  # poem_id -> list of page numbers
        current_page = None
        
        # Process the entire text element
        text_elem = self.root.find('tei:text', self.ns)
        if not text_elem:
            logger.error("No text element found")
            return {}
        
        # Process front matter
        front = text_elem.find('tei:front', self.ns)
        if front:
            self._process_section_pages(front, page_breaks, poem_pages, 'praefatio')
        
        # Process body
        body = text_elem.find('tei:body', self.ns)
        if body:
            for book_div in body.findall('tei:div[@type="book"]', self.ns):
                book_id = book_div.get('{http://www.w3.org/XML/1998/namespace}id', '')
                
                for poem_div in book_div.findall('tei:div[@type="poem"]', self.ns):
                    poem_id = poem_div.get('{http://www.w3.org/XML/1998/namespace}id', '')
                    self._process_poem_pages(poem_div, page_breaks, poem_pages, poem_id)
        
        logger.info(f"Found {len(page_breaks)} page breaks")
        logger.info(f"Mapped pages for {len(poem_pages)} poems")
        
        return {
            'page_breaks': page_breaks,
            'poem_pages': poem_pages
        }
    
    def _process_section_pages(self, section, page_breaks, poem_pages, section_id):
        """Process page breaks in a section"""
        pages_in_section = []
        
        for elem in section.iter():
            if elem.tag.endswith('pb'):
                facs = elem.get('facs', '')
                n = elem.get('n', '')
                
                page_info = {
                    'n': n,
                    'facs': facs,
                    'section': section_id
                }
                
                page_breaks.append(page_info)
                pages_in_section.append(n)
        
        if pages_in_section:
            poem_pages[section_id] = pages_in_section
    
    def _process_poem_pages(self, poem_div, page_breaks, poem_pages, poem_id):
        """Process page breaks within a poem"""
        pages_in_poem = []
        lines_with_pages = []
        current_page = None
        line_counter = 0
        
        # Walk through all elements in the poem
        for elem in poem_div.iter():
            if elem.tag.endswith('pb'):
                # Page break
                facs = elem.get('facs', '')
                n = elem.get('n', '')
                
                page_info = {
                    'n': n,
                    'facs': facs,
                    'poem': poem_id,
                    'line_start': line_counter
                }
                
                page_breaks.append(page_info)
                pages_in_poem.append(n)
                current_page = n
                
            elif elem.tag.endswith('l'):
                # Line element
                line_counter += 1
                if current_page:
                    lines_with_pages.append({
                        'line': line_counter,
                        'page': current_page
                    })
        
        if pages_in_poem:
            poem_pages[poem_id] = {
                'pages': pages_in_poem,
                'lines_with_pages': lines_with_pages
            }
    
    def enhance_poems_with_pages(self):
        """Add page information to existing poem data"""
        logger.info("Enhancing poems with page information...")
        
        page_data = self.extract_page_breaks()
        
        # Update poems with page information
        for poem_id, poem in self.data['poems'].items():
            if poem_id in page_data['poem_pages']:
                poem['page_info'] = page_data['poem_pages'][poem_id]
            else:
                # Try to find pages based on poem position
                poem['page_info'] = self._estimate_pages(poem)
        
        # Add global page break list
        self.data['page_breaks'] = page_data['page_breaks']
        
        return self.data
    
    def _estimate_pages(self, poem):
        """Estimate page numbers for poems without explicit page breaks"""
        # This is a fallback - ideally all poems should have page breaks
        book_num = poem.get('book', '1')
        poem_num = poem.get('number', 1)
        
        # Very rough estimation based on average
        estimated_start = 10 + (int(book_num) - 1) * 50 + poem_num * 2
        
        return {
            'pages': [str(estimated_start)],
            'estimated': True
        }
    
    def save_enhanced_data(self, output_path: str):
        """Save enhanced data with page information"""
        enhanced_data = self.enhance_poems_with_pages()
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(enhanced_data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Saved enhanced data to {output_path}")


def main():
    print("Enhancing Lucina data with page synchronization...")
    
    tei_file = "C:/Users/Chrisi/Documents/GitHub/diged-neolat/docs/edition-2/data/tei-final-2.xml"
    json_file = "C:/Users/Chrisi/Documents/GitHub/diged-neolat/docs/edition-3/lucina_complete_data.json"
    output_file = "C:/Users/Chrisi/Documents/GitHub/diged-neolat/docs/edition-3/web/enhanced_data.json"
    
    processor = EnhancedLucinaProcessor(tei_file, json_file)
    processor.save_enhanced_data(output_file)
    
    print("Enhancement complete!")


if __name__ == "__main__":
    main()