#!/usr/bin/env python3
"""
Final Lucina Edition.docx to TEI XML converter (body only)
Handles all edge cases and produces complete TEI structure
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
    """Convert Lucina Edition.docx to TEI XML body structure"""
    
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
        self.pending_rubric = None
        self.stats = defaultdict(int)
        self.poem_tracker = defaultdict(list)
        
        # Person name mapping
        self.person_map = self._load_person_map()
        
        logger.info(f"Total paragraphs: {len(self.doc.paragraphs)}")
    
    def _load_person_map(self) -> Dict[str, str]:
        """Load comprehensive person name mapping"""
        return {
            # Simonetta family
            'cichum simonetam': 'cicco-simonetta',
            'mecoenatem cichum': 'cicco-simonetta',
            'cichum mecoenatem': 'cicco-simonetta',
            'ciche': 'cicco-simonetta',
            'cichidas': 'cicco-simonetta',  # Plural form
            'iohannem simonetam': 'giovanni-simonetta',
            'iohannem iacobum simonetam': 'giacomo-simonetta',
            'andream simonetam': 'andrea-simonetta',
            'antonium fredericum simonetam': 'antonio-federico-simonetta',
            'guidonem antonium simonetam': 'guido-antonio-simonetta',
            'sigismundum simonetam': 'sigismondo-simonetta',
            'lodovicum simonetam': 'lodovico-simonetta',
            'iohannem franciscum simonetam': 'giovanni-francesco-simonetta',
            
            # Visconti family
            'philippum vicecomitem': 'filippo-visconti',
            'gasparem vicecomitem': 'gaspare-visconti',
            'ambrosium vicecomitem': 'ambrogio-visconti',
            'azonem vicecomitem': 'azone-visconti',
            'ascanium vicecomitem': 'ascanio-visconti',
            
            # Literary figures
            'franciscum philelfum': 'francesco-filelfo',
            'laurentium stroçam': 'lorenzo-strozza',
            'titum et laurentium stroçam': 'tito-lorenzo-strozza',
            'baptistam plasium': 'battista-piasio',
            
            # Mythological/allegorical
            'lucina': 'lucina',
            'lucinam': 'lucina',
            'somnum': 'somnus',
            'venerem': 'venus',
            'cupidinem': 'cupido',
            'laurum': 'laurus',  # The laurel tree
            'aeternum deum': 'deus',
            
            # Rulers
            'deum galeacium': 'galeazzo-sforza',
            'deum galaecium': 'galeazzo-sforza',
            'divum franciscum sphorciam': 'francesco-sforza',
            
            # Clergy
            'iohannem sancti lamberti': 'giovanni-san-lamberto',
            'iohannem stephanum': 'giovanni-stefano',
            'iohannem campisium': 'giovanni-campesio',
            
            # Others
            'lamiam': 'lamia',
            'lamiam formium': 'lamia-formio',
            'iacobum marnum': 'giacomo-marno',
            'iacobum antiquarium': 'giacomo-antiquario',
            'iacobum bonarellum': 'giacomo-bonarelli',
            'lectorem': 'lector',  # The reader
        }
    
    def process(self) -> etree.Element:
        """Main processing method"""
        logger.info("Starting document processing...")
        
        # Create TEI structure
        tei = etree.Element('TEI', nsmap=self.nsmap)
        text = etree.SubElement(tei, 'text')
        front = etree.SubElement(text, 'front')
        body = etree.SubElement(text, 'body')
        
        # Process all paragraphs
        for idx, para in enumerate(self.doc.paragraphs):
            self._process_paragraph(para, idx)
        
        # Save final poem
        if self.current_poem and self.verse_buffer:
            self._save_current_poem()
        
        # Build TEI structure
        self._build_tei_structure(front, body)
        
        # Report statistics
        self._report_stats()
        
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
            self._handle_poem_header(text, para)
        elif self._is_rubric(para, idx):
            self._handle_rubric(text)
        elif text and self.current_poem is not None:
            # Check if it's a colophon at the end
            if 'Actum Papiae' in text or 'CDiis Immor' in text:
                self._handle_colophon(text)
            else:
                self._handle_verse_line(para, text)
    
    def _is_book_header(self, text: str) -> bool:
        """Check if text is a book header"""
        patterns = [
            r'^\d+\s+Edition',
            r'^Praefatio\s*$',
            r'^Buch\s+[IVX]+',
            r'^B\[uch\]\s+[IVX]+',
        ]
        return any(re.match(p, text, re.IGNORECASE) for p in patterns)
    
    def _is_poem_header(self, text: str) -> bool:
        """Check if text is a poem header"""
        patterns = [
            r'^([IVX]+),\s*(\d+)\s+(?:Ad\s+|In\s+)?(.+?)\.?$',
            r'^(\d+),\s*(\d+)\s+(?:Ad\s+|In\s+)?(.+?)\.?$',
        ]
        return any(re.match(p, text) for p in patterns)
    
    def _is_rubric(self, para, idx: int) -> bool:
        """Check if paragraph is a rubric"""
        text = para.text.lower()
        
        # Skip if it's a poem header
        if self._is_poem_header(para.text):
            return False
        
        # Rubric keywords
        rubric_keywords = [
            'aurelii', 'laurentii', 'albrisii',
            'lucina', 'incipit', 'liber',
            'secundus', 'tercius', 'tertius'
        ]
        
        # Check conditions
        has_italic = any(run.italic for run in para.runs) if para.runs else False
        has_keyword = any(keyword in text for keyword in rubric_keywords)
        is_short = len(text) < 100
        not_verse = not re.match(r'^[A-Z][a-z]+\s+\w+', para.text)  # Doesn't start like verse
        
        return (has_italic or has_keyword) and is_short and not_verse
    
    def _handle_book_header(self, text: str):
        """Process book header"""
        # Save current poem
        if self.current_poem and self.verse_buffer:
            self._save_current_poem()
        
        if 'Edition' in text:
            logger.info("Found: Edition header")
        elif 'Praefatio' in text:
            self.current_book = 'praefatio'
            self.stats['books'] += 1
            logger.info("Book: Praefatio")
        elif 'Buch' in text or 'Book' in text:
            match = re.search(r'[IVX]+', text)
            if match:
                self.current_book = match.group()
                self.stats['books'] += 1
                logger.info(f"Book: {self.current_book}")
    
    def _handle_poem_header(self, text: str, para):
        """Process poem header"""
        # Save previous poem
        if self.current_poem and self.verse_buffer:
            self._save_current_poem()
        
        # Parse header
        patterns = [
            r'^([IVX]+),\s*(\d+)\s+(?:Ad\s+|In\s+)?(.+?)\.?$',
            r'^(\d+),\s*(\d+)\s+(?:Ad\s+|In\s+)?(.+?)\.?$',
        ]
        
        match = None
        for pattern in patterns:
            match = re.match(pattern, text)
            if match:
                break
        
        if match:
            book = match.group(1)
            # Convert numeric to Roman
            if book.isdigit():
                book_map = {'1': 'I', '2': 'II', '3': 'III'}
                book = book_map.get(book, self.current_book)
            
            number = match.group(2)
            dedicatee_full = match.group(3).strip() if len(match.groups()) > 2 else ""
            
            # Clean dedicatee (remove trailing rubric if attached)
            dedicatee = dedicatee_full
            attached_rubric = None
            
            # Check for attached rubric (e.g., III.1)
            if 'Aurelius' in dedicatee_full or 'incipit' in dedicatee_full:
                parts = re.split(r'\s+(?=Aurelius|Albrisii|liber)', dedicatee_full, 1)
                if len(parts) > 1:
                    dedicatee = parts[0].strip()
                    attached_rubric = parts[1].strip()
            
            # Create poem structure
            self.current_poem = {
                'book': book,
                'number': number,
                'dedicatee': dedicatee,
                'person_ref': self._extract_person_ref(dedicatee),
                'rubrics': [],
                'lines': []
            }
            
            # Add attached rubric if found
            if attached_rubric:
                self.current_poem['rubrics'].append(attached_rubric)
            
            self.verse_buffer = []
            self.stats['poems'] += 1
            self.poem_tracker[book].append(number)
            
            logger.info(f"Poem: {book}.{number} → {dedicatee}")
    
    def _handle_rubric(self, text: str):
        """Process rubric"""
        if self.current_poem:
            self.current_poem['rubrics'].append(text)
        else:
            # Store for next poem
            self.pending_rubric = text
    
    def _handle_verse_line(self, para, text: str):
        """Process a verse line"""
        if not text:
            return
        
        # Check for indentation
        indent = bool(
            para.paragraph_format.left_indent or 
            para.paragraph_format.first_line_indent or
            (para.paragraph_format.left_indent is not None and 
             para.paragraph_format.left_indent > 0)
        )
        
        # Also check for space indentation in text
        if text.startswith('    ') or text.startswith('\t'):
            indent = True
            text = text.strip()
        
        # Extract formatted segments
        formatted_segments = []
        for run in para.runs:
            if run.underline:
                formatted_segments.append({
                    'text': run.text,
                    'type': 'name'
                })
        
        line_data = {
            'text': text,
            'indent': indent,
            'formatted': formatted_segments
        }
        
        self.verse_buffer.append(line_data)
        self.stats['lines'] += 1
    
    def _handle_colophon(self, text: str):
        """Handle colophon at end of document"""
        logger.info(f"Found colophon: {text[:30]}...")
        self.stats['colophon'] = text
    
    def _save_current_poem(self):
        """Save current poem with its lines"""
        if self.current_poem and self.verse_buffer:
            self.current_poem['lines'] = self.verse_buffer.copy()
            
            # Handle pending rubric
            if self.pending_rubric:
                self.current_poem['rubrics'].insert(0, self.pending_rubric)
                self.pending_rubric = None
            
            self.poems.append(self.current_poem.copy())
            self.verse_buffer = []
    
    def _extract_person_ref(self, dedicatee: str) -> str:
        """Extract person reference from dedicatee text"""
        if not dedicatee:
            return ""
        
        clean = dedicatee.lower().strip()
        clean = re.sub(r'[^\w\s]', '', clean)
        
        # Check full mapping first
        for pattern, ref in self.person_map.items():
            if pattern in clean:
                return ref
        
        # Handle "In" invectives
        if clean.startswith('in '):
            name = clean[3:].split()[0] if clean[3:].split() else ""
            return name
        
        # Generate ID from name
        words = clean.split()
        # Skip common titles
        skip_words = ['ad', 'in', 'comitem', 'deum', 'divum', 'praesulem', 
                     'episcopum', 'sancti', 'de', 'pro']
        words = [w for w in words if w not in skip_words]
        
        if len(words) >= 2:
            return f"{words[0]}-{words[-1]}"
        elif len(words) == 1:
            return words[0]
        
        return ""
    
    def _build_tei_structure(self, front, body):
        """Build TEI XML structure"""
        logger.info("Building TEI structure...")
        
        # Group poems by book
        books = defaultdict(list)
        praefatio_poem = None
        
        for poem in self.poems:
            book = poem.get('book', '')
            if book == 'praefatio':
                praefatio_poem = poem
            else:
                books[book].append(poem)
        
        # Add Praefatio to front
        if praefatio_poem:
            self._add_praefatio(front, praefatio_poem)
            self.stats['praefatio_lines'] = len(praefatio_poem.get('lines', []))
        
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
                
                logger.info(f"  Book {book_num}: {len(sorted_poems)} poems")
        
        logger.info("TEI structure complete")
    
    def _roman_to_word(self, roman: str) -> str:
        """Convert Roman numeral to Latin word"""
        return {'I': 'Primus', 'II': 'Secundus', 'III': 'Tertius'}.get(roman, roman)
    
    def _add_praefatio(self, front, poem):
        """Add praefatio to front matter"""
        div = etree.SubElement(front, 'div')
        div.set('type', 'praefatio')
        div.set('{%s}id' % self.XML_NS, 'praefatio')
        
        # Add standard praefatio headers
        head1 = etree.SubElement(div, 'head')
        head1.set('type', 'author')
        head1.text = 'Aurelii Laurentii Albrisii praefatio in Lucinam'
        
        # Add dedication
        head2 = etree.SubElement(div, 'head')
        head2.set('type', 'dedication')
        head2.text = 'ad '
        persname = etree.SubElement(head2, 'persName')
        persname.set('ref', '#cicco-simonetta')
        persname.text = 'mecoenatem Cichum Simonetam'
        
        # Add any additional rubrics
        for rubric in poem.get('rubrics', []):
            if 'aurelii' not in rubric.lower():  # Skip duplicate
                head = etree.SubElement(div, 'head')
                head.set('type', 'rubric')
                head.text = rubric
        
        # Add lines
        self._add_verse_lines(div, poem.get('lines', []), 'praef')
    
    def _add_poem_to_tei(self, book_div, poem):
        """Add poem to TEI structure"""
        poem_div = etree.SubElement(book_div, 'div')
        poem_div.set('type', 'poem')
        poem_div.set('n', poem['number'])
        
        # Generate poem ID
        poem_id = f"poem-{poem['book']}.{poem['number']}"
        poem_div.set('{%s}id' % self.XML_NS, poem_id)
        
        # Detect and set meter
        meter = self._detect_meter(poem['lines'])
        poem_div.set('met', meter)
        
        # Detect and set genre
        genre = self._detect_genre(poem)
        if genre:
            poem_div.set('ana', f"#{genre}")
        
        # Add headings
        head_num = etree.SubElement(poem_div, 'head')
        head_num.set('type', 'number')
        head_num.text = f"{poem['book']}, {poem['number']}"
        
        # Add dedication
        if poem['dedicatee']:
            head_ded = etree.SubElement(poem_div, 'head')
            head_ded.set('type', 'dedication')
            
            # Determine preposition
            prep = 'In ' if poem['dedicatee'].lower().startswith('in ') else 'Ad '
            if poem['dedicatee'].lower().startswith('in '):
                prep = 'In '
                dedicatee_clean = poem['dedicatee'][3:] if len(poem['dedicatee']) > 3 else poem['dedicatee']
            else:
                prep = 'Ad '
                dedicatee_clean = poem['dedicatee']
            
            if poem.get('person_ref'):
                head_ded.text = prep
                persname = etree.SubElement(head_ded, 'persName')
                persname.set('ref', f"#{poem['person_ref']}")
                persname.text = dedicatee_clean
            else:
                head_ded.text = f"{prep}{dedicatee_clean}"
        
        # Add rubrics
        for rubric in poem.get('rubrics', []):
            head_rub = etree.SubElement(poem_div, 'head')
            head_rub.set('type', 'rubric')
            head_rub.text = rubric
        
        # Add verse lines
        self._add_verse_lines(poem_div, poem['lines'], poem_id)
    
    def _detect_meter(self, lines: List[Dict]) -> str:
        """Detect metrical pattern"""
        if not lines:
            return 'unknown'
        
        total = len(lines)
        indented = sum(1 for l in lines if l.get('indent'))
        
        # Elegiac: ~50% indented
        if total >= 2:
            ratio = indented / total if total > 0 else 0
            if 0.4 <= ratio <= 0.6:
                return 'elegiac'
        
        # Sapphic: 4-line stanzas with last line indented
        if total >= 4 and total % 4 == 0:
            # Check if every 4th line is indented
            sapphic_pattern = True
            for i in range(3, total, 4):
                if not lines[i].get('indent'):
                    sapphic_pattern = False
                    break
            if sapphic_pattern:
                return 'sapphic'
        
        # Hendecasyllabic: short poems, no indentation
        if total <= 6 and indented == 0:
            return 'hendecasyllabic'
        
        # Default
        return 'elegiac'
    
    def _detect_genre(self, poem: Dict) -> str:
        """Detect poem genre"""
        dedicatee = poem.get('dedicatee', '').lower()
        
        # Check patterns
        if dedicatee.startswith('in '):
            return 'invective'
        elif 'sepulcr' in dedicatee or 'sepulchr' in dedicatee:
            return 'epitaph'
        elif 'deum' in dedicatee or 'deus' in dedicatee:
            return 'prayer'
        elif 'lucina' in dedicatee:
            return 'erotic'
        elif 'somnum' in dedicatee or 'venerem' in dedicatee:
            return 'prayer'
        elif any(name in dedicatee for name in ['galeacium', 'sphortiam', 'sphorciam']):
            return 'epideictic'
        elif 'lectorem' in dedicatee:
            return 'paraenesis'
        
        # Female speakers in Book III
        if poem['book'] == 'III' and poem['number'] in ['29', '31', '42', '43']:
            return 'epistle'  # Heroides-style
        
        return 'epistle'  # Default
    
    def _add_verse_lines(self, parent, lines: List[Dict], poem_id: str):
        """Add verse lines with appropriate structure"""
        if not lines:
            return
        
        meter = parent.get('met', 'elegiac')
        
        if meter == 'elegiac':
            # Group in couplets
            for i in range(0, len(lines), 2):
                lg = etree.SubElement(parent, 'lg')
                lg.set('type', 'elegiac')
                lg.set('met', '-uu|-uu|-uu|-uu|-uu|-uu || -uu|-uu|- | -uu|-uu|-')
                
                # Add lines
                for j in range(2):
                    if i + j < len(lines):
                        l = etree.SubElement(lg, 'l')
                        l.set('n', str(i + j + 1))
                        l.set('{%s}id' % self.XML_NS, f"{poem_id}.{i+j+1}")
                        if j == 1 and lines[i + j].get('indent'):
                            l.set('rend', 'indent')
                        l.text = lines[i + j]['text']
                        
        elif meter == 'sapphic':
            # Group in 4-line stanzas
            for i in range(0, len(lines), 4):
                lg = etree.SubElement(parent, 'lg')
                lg.set('type', 'sapphic')
                lg.set('met', '-u|-u|-uu|-u|-u || -uu|-u')
                
                for j in range(4):
                    if i + j < len(lines):
                        l = etree.SubElement(lg, 'l')
                        l.set('n', str(i + j + 1))
                        l.set('{%s}id' % self.XML_NS, f"{poem_id}.{i+j+1}")
                        if j == 3:  # Adonic
                            l.set('rend', 'indent')
                        l.text = lines[i + j]['text']
                        
        else:
            # Single line group
            lg = etree.SubElement(parent, 'lg')
            lg.set('type', meter)
            
            for i, line in enumerate(lines, 1):
                l = etree.SubElement(lg, 'l')
                l.set('n', str(i))
                l.set('{%s}id' % self.XML_NS, f"{poem_id}.{i}")
                if line.get('indent'):
                    l.set('rend', 'indent')
                l.text = line['text']
    
    def _report_stats(self):
        """Report detailed statistics"""
        total_poems = self.stats['poems'] + (1 if self.stats.get('praefatio_lines') else 0)
        total_lines = self.stats['lines'] + self.stats.get('praefatio_lines', 0)
        
        logger.info(f"Stats: {self.stats['books']} books, "
                   f"{total_poems} poems (incl. Praef), "
                   f"{total_lines} lines")
        
        # Check for missing poems
        expected = {
            'I': set(map(str, range(1, 44))),
            'II': set(map(str, range(1, 38))),
            'III': set(map(str, range(1, 48)))
        }
        
        for book, numbers in self.poem_tracker.items():
            if book in expected:
                found = set(numbers)
                missing = expected[book] - found
                if missing:
                    logger.warning(f"  Book {book} missing: {sorted(missing)}")
    
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
        
        logger.info(f"Saved: {output.name}")
        return output


def main():
    """Main execution"""
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python lucina_to_tei.py Edition.docx [output.xml]")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else 'lucina_body.xml'
    
    try:
        converter = LucinaToTEI(input_file)
        converter.save_tei(output_file)
        
        print(f"\nConversion complete!")
        print(f"Output: {output_file}")
        print(f"Final stats: {dict(converter.stats)}")
        
    except Exception as e:
        logger.error(f"Conversion failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()