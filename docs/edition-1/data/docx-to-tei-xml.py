#!/usr/bin/env python3
"""
Lucina Edition.docx to TEI XML converter - Complete Version
Handles all poem patterns identified in the edition (145 poems total)
"""

import re
import logging
from pathlib import Path
from docx import Document
from lxml import etree
from typing import Dict, List, Optional, Tuple
from collections import defaultdict

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(levelname)s: %(message)s'
)
logger = logging.getLogger(__name__)


class LucinaToTEI:
    """Convert Lucina Edition.docx to TEI XML - Complete approach"""
    
    def __init__(self, docx_path: str):
        """Initialize with document path"""
        self.doc_path = Path(docx_path)
        logger.info(f"Loading: {self.doc_path.name}")
        self.doc = Document(docx_path)
        
        # TEI namespace setup
        self.TEI_NS = "http://www.tei-c.org/ns/1.0"
        self.XML_NS = "http://www.w3.org/XML/1998/namespace"
        self.nsmap = {None: self.TEI_NS, 'xml': self.XML_NS}
        
        # State tracking
        self.current_book = None
        self.current_poem = None
        self.poems = []
        self.verse_buffer = []
        self.in_praefatio = False  # Track if we're in Praefatio
        self.stats = defaultdict(int)
        self.poem_tracker = defaultdict(list)
        self.unprocessed_lines = []
        
        # Person name mapping (key names for this edition)
        self.person_map = self._load_person_map()
        
        logger.info(f"Total paragraphs: {len(self.doc.paragraphs)}")
    
    def _load_person_map(self) -> Dict[str, str]:
        """Load person name mapping for key figures"""
        return {
            'mecoenatem cichum': 'cicco-simonetta',
            'cichum simonetam': 'cicco-simonetta',
            'ciche': 'cicco-simonetta',
            'philippum vicecomitem': 'filippo-visconti',
            'gasparem vicecomitem': 'gaspare-visconti',
            'lucinam': 'lucina',
            'lucina': 'lucina',
            'lamiam': 'lamia',
            'deum galeacium': 'galeazzo-sforza',
            'deum galaecium': 'galeazzo-sforza',
        }
    
    def process(self) -> etree.Element:
        """Main processing method"""
        logger.info("="*60)
        logger.info("Starting complete document processing...")
        logger.info("Processing all 145 poems with expanded patterns")
        logger.info("="*60)
        
        # Create TEI structure
        tei = etree.Element('TEI', nsmap=self.nsmap)
        text = etree.SubElement(tei, 'text')
        front = etree.SubElement(text, 'front')
        body = etree.SubElement(text, 'body')
        
        # Process all paragraphs
        for idx, para in enumerate(self.doc.paragraphs):
            if idx % 100 == 0 and idx > 0:
                logger.debug(f"Progress: {idx}/{len(self.doc.paragraphs)} paragraphs")
            self._process_paragraph(para, idx)
        
        # Save final poem if exists
        if self.current_poem and self.verse_buffer:
            self._save_current_poem()
        
        # Build TEI structure
        self._build_tei_structure(front, body)
        
        # Report results
        self._report_results()
        
        return tei
    
    def _process_paragraph(self, para, idx: int):
        """Process a single paragraph"""
        text = para.text.strip()
        if not text:
            return
        
        # Check for structural elements
        if self._is_book_header(text):
            self._handle_book_header(text)
        elif self._is_poem_header(text):
            self._handle_poem_header(text, idx)
        elif self._is_rubric(text):
            self._handle_rubric(text)
        elif self.current_poem is not None:
            # We're in a poem, add as verse line
            self._handle_verse_line(text)
        elif self.in_praefatio:
            # We're in Praefatio after header, treat as verse
            self._handle_praefatio_verse(text)
        else:
            # Track what we couldn't process
            self.unprocessed_lines.append((idx, text[:50]))
            self.stats['uncertain'] += 1
    
    def _is_book_header(self, text: str) -> bool:
        """Check if text is a book header"""
        # Clear patterns for book headers
        if text == "Praefatio":
            return True
        if re.match(r'^Buch\s+[IVX]+$', text):
            return True
        if re.match(r'^B\[uch\]\s+[IVX]+$', text):  # Handle variant
            return True
        return False
    
    def _is_poem_header(self, text: str) -> bool:
        """Check if text is a poem header - ALL patterns"""
        patterns = [
            # Standard Ad pattern
            r'^([IVX]+),\s*(\d+)\s+Ad\s+(.+?)\.?$',
            # In pattern (invectives/epitaphs)
            r'^([IVX]+),\s*(\d+)\s+In\s+(.+?)\.?$',
            # No preposition pattern (direct title/name)
            r'^([IVX]+),\s*(\d+)\s+([A-Z][a-z].+?)\.?$',
            # Numeric book numbers (if any)
            r'^(\d+),\s*(\d+)\s+(?:Ad|In)\s+(.+?)\.?$',
        ]
        return any(re.match(p, text) for p in patterns)
    
    def _is_rubric(self, text: str) -> bool:
        """Check if text is a rubric (italicized intro text)"""
        # Only the most certain rubrics
        if 'incipit' in text.lower() and 'aurelii' in text.lower():
            return True
        if text.lower().startswith('aurelii laurentii albrisii'):
            return True
        return False
    
    def _handle_book_header(self, text: str):
        """Process book header"""
        # Save current poem if exists
        if self.current_poem and self.verse_buffer:
            self._save_current_poem()
        
        if text == "Praefatio":
            self.current_book = 'praefatio'
            self.in_praefatio = True
            self.stats['books'] += 1
            # Create praefatio poem structure with ALL required fields
            self.current_poem = {
                'book': 'praefatio',
                'number': '0',
                'type': 'praefatio',
                'lines': [],
                'rubrics': [],  # FIX: Add rubrics field
                'dedicatee': 'mecoenatem Cichum Simonetam',
                'preposition': 'ad'
            }
            self.verse_buffer = []
            logger.info("✓ Found: Praefatio")
            
        elif "Buch" in text or "B[uch]" in text:
            # End praefatio if we were in it
            if self.in_praefatio:
                self.in_praefatio = False
                if self.verse_buffer:
                    self._save_current_poem()
            
            match = re.search(r'[IVX]+', text)
            if match:
                self.current_book = match.group()
                self.stats['books'] += 1
                logger.info(f"✓ Found: Book {self.current_book}")
    
    def _handle_poem_header(self, text: str, idx: int):
        """Process poem header - handles all patterns"""
        # Save previous poem
        if self.current_poem and self.verse_buffer:
            self._save_current_poem()
        
        # End praefatio state if we hit a poem
        if self.in_praefatio:
            self.in_praefatio = False
        
        # Try all patterns with their prepositions
        patterns = [
            (r'^([IVX]+),\s*(\d+)\s+Ad\s+(.+?)\.?$', 'Ad'),
            (r'^([IVX]+),\s*(\d+)\s+In\s+(.+?)\.?$', 'In'),
            (r'^([IVX]+),\s*(\d+)\s+([A-Z][a-z].+?)\.?$', ''),
            (r'^(\d+),\s*(\d+)\s+(Ad|In)\s+(.+?)\.?$', 'extract'),
        ]
        
        for pattern, prep_type in patterns:
            match = re.match(pattern, text)
            if match:
                # Extract components
                book = match.group(1)
                
                # Convert numeric to Roman if needed
                if book.isdigit():
                    book_map = {'1': 'I', '2': 'II', '3': 'III'}
                    book = book_map.get(book, self.current_book)
                
                number = match.group(2)
                
                # Handle different pattern structures
                if prep_type == 'extract':
                    preposition = match.group(3)
                    dedicatee = match.group(4).strip()
                else:
                    dedicatee = match.group(3).strip() if len(match.groups()) >= 3 else ""
                    preposition = prep_type
                
                # Create poem structure with ALL fields
                self.current_poem = {
                    'book': book,
                    'number': number,
                    'dedicatee': dedicatee,
                    'preposition': preposition,
                    'person_ref': self._extract_person_ref(dedicatee),
                    'lines': [],
                    'rubrics': []  # Always include rubrics field
                }
                
                self.verse_buffer = []
                self.stats['poems'] += 1
                self.poem_tracker[book].append(number)
                
                prep_display = f"{preposition} " if preposition else ""
                logger.info(f"✓ Found poem: {book}.{number} {prep_display}{dedicatee[:30]}")
                break
    
    def _handle_praefatio_verse(self, text: str):
        """Handle verse lines in Praefatio"""
        self.verse_buffer.append(text)
        self.stats['lines'] += 1
    
    def _handle_rubric(self, text: str):
        """Process rubric"""
        if self.current_poem:
            # Safely add rubric
            if 'rubrics' not in self.current_poem:
                self.current_poem['rubrics'] = []
            self.current_poem['rubrics'].append(text)
            logger.info(f"✓ Found rubric: {text[:50]}...")
            self.stats['rubrics'] += 1
    
    def _handle_verse_line(self, text: str):
        """Process verse line"""
        if not text:
            return
        
        # Check if it's a colophon at the end
        if 'Actum Papiae' in text or 'CDiis Immor' in text:
            self.stats['colophon'] = text
            logger.info(f"Found colophon: {text[:30]}...")
            return
        
        self.verse_buffer.append(text)
        self.stats['lines'] += 1
    
    def _save_current_poem(self):
        """Save current poem with its lines"""
        if self.current_poem and self.verse_buffer:
            self.current_poem['lines'] = self.verse_buffer.copy()
            self.poems.append(self.current_poem.copy())
            self.verse_buffer = []
    
    def _extract_person_ref(self, dedicatee: str) -> str:
        """Extract person reference from dedicatee text"""
        if not dedicatee:
            return ""
        
        clean = dedicatee.lower().strip()
        
        # Check known mappings
        for pattern, ref in self.person_map.items():
            if pattern in clean:
                return ref
        
        # Generate ID from name for unknown persons
        words = clean.split()
        skip_words = ['ad', 'in', 'comitem', 'deum', 'divum', 'praesulem']
        words = [w for w in words if w not in skip_words]
        
        if len(words) >= 2:
            return f"{words[0]}-{words[-1]}"
        elif len(words) == 1:
            return words[0]
        
        return ""
    
    def _build_tei_structure(self, front, body):
        """Build TEI XML structure"""
        logger.info("\nBuilding TEI structure...")
        
        # Separate praefatio from other poems
        books = defaultdict(list)
        praefatio_poem = None
        
        for poem in self.poems:
            if poem.get('type') == 'praefatio' or poem['book'] == 'praefatio':
                praefatio_poem = poem
            else:
                books[poem['book']].append(poem)
        
        # Add Praefatio to front matter
        if praefatio_poem:
            self._add_praefatio(front, praefatio_poem)
        
        # Add books to body
        for book_num in ['I', 'II', 'III']:
            if book_num in books:
                book_div = etree.SubElement(body, 'div')
                book_div.set('type', 'book')
                book_div.set('n', str(['I', 'II', 'III'].index(book_num) + 1))
                book_div.set('{%s}id' % self.XML_NS, f'book{book_num}')
                
                # Add book heading
                head = etree.SubElement(book_div, 'head')
                head.set('type', 'book')
                head.text = f'Liber {self._roman_to_word(book_num)}'
                
                # Sort and add poems
                sorted_poems = sorted(books[book_num], 
                                    key=lambda p: int(p['number']))
                for poem in sorted_poems:
                    self._add_poem_to_tei(book_div, poem)
                
                logger.info(f"  Added Book {book_num}: {len(sorted_poems)} poems")
    
    def _roman_to_word(self, roman: str) -> str:
        """Convert Roman numeral to Latin word"""
        return {'I': 'Primus', 'II': 'Secundus', 'III': 'Tertius'}.get(roman, roman)
    
    def _add_praefatio(self, front, poem):
        """Add praefatio to front matter"""
        div = etree.SubElement(front, 'div')
        div.set('type', 'praefatio')
        div.set('{%s}id' % self.XML_NS, 'praefatio')
        
        # Add headers
        head1 = etree.SubElement(div, 'head')
        head1.set('type', 'rubric')
        head1.text = 'Praefatio'
        
        head2 = etree.SubElement(div, 'head')
        head2.set('type', 'author')
        head2.text = 'Aurelii Laurentii Albrisii praefatio in Lucinam'
        
        head3 = etree.SubElement(div, 'head')
        head3.set('type', 'dedication')
        head3.text = 'ad mecoenatem Cichum Simonetam'
        
        # Add any rubrics collected
        for rubric in poem.get('rubrics', []):
            head_rub = etree.SubElement(div, 'head')
            head_rub.set('type', 'rubric')
            head_rub.text = rubric
        
        # Add lines in couplets (elegiac meter)
        lines = poem.get('lines', [])
        for i in range(0, len(lines), 2):
            lg = etree.SubElement(div, 'lg')
            lg.set('type', 'elegiac')
            
            for j in range(2):
                if i + j < len(lines):
                    l = etree.SubElement(lg, 'l')
                    l.set('n', str(i + j + 1))
                    l.text = lines[i + j]
        
        self.stats['praefatio_lines'] = len(lines)
    
    def _add_poem_to_tei(self, book_div, poem):
        """Add poem to TEI structure"""
        poem_div = etree.SubElement(book_div, 'div')
        poem_div.set('type', 'poem')
        poem_div.set('n', poem['number'])
        poem_div.set('{%s}id' % self.XML_NS, f"poem-{poem['book']}.{poem['number']}")
        
        # Detect genre based on preposition and dedicatee
        genre = self._detect_genre(poem)
        if genre:
            poem_div.set('ana', f"#{genre}")
        
        # Add poem number
        head_num = etree.SubElement(poem_div, 'head')
        head_num.set('type', 'number')
        head_num.text = f"{poem['book']}, {poem['number']}"
        
        # Add dedication with appropriate preposition
        if poem.get('dedicatee'):
            head_ded = etree.SubElement(poem_div, 'head')
            head_ded.set('type', 'dedication')
            
            prep = poem.get('preposition', '')
            if prep:
                head_ded.text = f"{prep} {poem['dedicatee']}"
            else:
                head_ded.text = poem['dedicatee']
        
        # Add rubrics
        for rubric in poem.get('rubrics', []):
            head_rub = etree.SubElement(poem_div, 'head')
            head_rub.set('type', 'rubric')
            head_rub.text = rubric
        
        # Add lines (elegiac couplets by default)
        lines = poem.get('lines', [])
        if lines:
            # Group in couplets for elegiac meter
            for i in range(0, len(lines), 2):
                lg = etree.SubElement(poem_div, 'lg')
                lg.set('type', 'elegiac')
                
                for j in range(2):
                    if i + j < len(lines):
                        l = etree.SubElement(lg, 'l')
                        l.set('n', str(i + j + 1))
                        l.text = lines[i + j]
    
    def _detect_genre(self, poem: Dict) -> str:
        """Detect poem genre based on preposition and dedicatee"""
        prep = poem.get('preposition', '').lower()
        dedicatee = poem.get('dedicatee', '').lower()
        
        # Genre detection based on patterns
        if prep == 'in':
            if 'sepulcr' in dedicatee or 'sepulchr' in dedicatee:
                return 'epitaph'
            else:
                return 'invective'
        elif 'lucina' in dedicatee:
            return 'erotic'
        elif 'deum' in dedicatee or 'deus' in dedicatee:
            return 'prayer'
        elif 'venerem' in dedicatee or 'somnum' in dedicatee:
            return 'prayer'
        elif prep == 'ad':
            return 'epistle'
        
        return 'poem'  # Default genre
    
    def _report_results(self):
        """Report processing results"""
        logger.info("\n" + "="*60)
        logger.info("PROCESSING COMPLETE:")
        logger.info("="*60)
        
        logger.info(f"✓ Successfully processed:")
        logger.info(f"  - Books: {self.stats['books']}")
        logger.info(f"  - Poems: {self.stats['poems']}")
        logger.info(f"  - Lines: {self.stats['lines']}")
        logger.info(f"  - Rubrics: {self.stats['rubrics']}")
        
        if self.stats.get('praefatio_lines'):
            logger.info(f"  - Praefatio lines: {self.stats['praefatio_lines']}")
        
        # Report poems per book
        for book in ['I', 'II', 'III']:
            if book in self.poem_tracker:
                logger.info(f"\nBook {book}: {len(self.poem_tracker[book])} poems")
                numbers = sorted([int(n) for n in self.poem_tracker[book]])
                
                # Check for gaps
                expected = set(range(1, max(numbers) + 1))
                found = set(numbers)
                missing = expected - found
                if missing:
                    logger.warning(f"  Missing: {sorted(missing)}")
        
        if self.unprocessed_lines:
            logger.info(f"\n✗ Unprocessed lines: {len(self.unprocessed_lines)}")
            if len(self.unprocessed_lines) <= 10:
                for idx, text in self.unprocessed_lines[:5]:
                    logger.info(f"  Para {idx}: {text}...")
        
        logger.info("\n" + "="*60)
        
        # Final statistics
        total_expected = 145  # From the analysis document
        capture_rate = (self.stats['poems'] / total_expected) * 100 if total_expected > 0 else 0
        logger.info(f"Capture rate: {self.stats['poems']}/{total_expected} poems ({capture_rate:.1f}%)")
    
    def save_tei(self, output_path: str):
        """Save TEI XML to file"""
        tei = self.process()
        tree = etree.ElementTree(tei)
        
        output = Path(output_path)
        tree.write(
            str(output),
            pretty_print=True,
            xml_declaration=True,
            encoding='UTF-8'
        )
        
        logger.info(f"\nSaved: {output.name}")
        return output


def main():
    """Main execution"""
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python docx-to-tei-xml.py Edition.docx [output.xml]")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else 'lucina_complete.xml'
    
    try:
        converter = LucinaToTEI(input_file)
        converter.save_tei(output_file)
        
        print(f"\nConversion complete!")
        print(f"Output: {output_file}")
        print(f"Expected: 145 poems (Praef + I:47 + II:37 + III:47 + epilogue)")
        
    except Exception as e:
        logger.error(f"Conversion failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()