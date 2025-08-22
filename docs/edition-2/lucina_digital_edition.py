#!/usr/bin/env python3
"""
Lucina Digital Edition Generator
Advanced TEI XML processor for creating a comprehensive digital scholarly edition
Based on tei-final-2.xml with enhanced prosopographical and structural data
"""

import logging
import json
import re
from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple, Any
from dataclasses import dataclass, asdict
from collections import defaultdict, Counter
from datetime import datetime
import xml.etree.ElementTree as ET

# Configure comprehensive logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('lucina_processing.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('LucinaDigitalEdition')

@dataclass
class Person:
    """Represents a person from the prosopographical data"""
    xml_id: str
    forename: str = ""
    surname: str = ""
    addname: str = ""
    birth_place: str = ""
    birth_date: str = ""
    death_date: str = ""
    occupation: str = ""
    note: str = ""
    references: int = 0
    
    def __post_init__(self):
        logger.debug(f"Created Person: {self.xml_id} ({self.forename} {self.surname})")

@dataclass
class Line:
    """Represents a single verse line"""
    xml_id: str
    number: int
    text: str
    indent: bool = False
    parent_poem_id: str = ""
    parent_lg_id: str = ""
    
    def __post_init__(self):
        logger.debug(f"Created Line {self.xml_id}: '{self.text[:30]}...' (indent: {self.indent})")

@dataclass
class LineGroup:
    """Represents a line group (stanza)"""
    xml_id: str
    type: str
    met: str
    lines: List[Line]
    parent_poem_id: str = ""
    
    def __post_init__(self):
        logger.debug(f"Created LineGroup {self.xml_id}: {self.type} with {len(self.lines)} lines")

@dataclass
class Poem:
    """Represents a complete poem"""
    xml_id: str
    book: str
    number: int
    title: str = ""
    dedicatee: str = ""
    addressee_ref: str = ""
    meter: str = ""
    genre: str = ""
    line_groups: List[LineGroup] = None
    lines: List[Line] = None
    rubrics: List[str] = None
    total_lines: int = 0
    
    def __post_init__(self):
        if self.line_groups is None:
            self.line_groups = []
        if self.lines is None:
            self.lines = []
        if self.rubrics is None:
            self.rubrics = []
        logger.info(f"Created Poem {self.xml_id}: Book {self.book}.{self.number} - {self.total_lines} lines")

@dataclass
class Book:
    """Represents a book division"""
    xml_id: str
    number: str
    title: str
    poems: List[Poem]
    total_poems: int = 0
    total_lines: int = 0
    
    def __post_init__(self):
        self.total_poems = len(self.poems)
        self.total_lines = sum(poem.total_lines for poem in self.poems)
        logger.info(f"Created Book {self.xml_id}: {self.total_poems} poems, {self.total_lines} lines")

@dataclass
class Manuscript:
    """Represents manuscript metadata"""
    identifier: str
    repository: str
    country: str
    settlement: str
    collection: str
    title: str
    author: str
    date: str
    material: str
    extent: str
    dimensions: Dict[str, str]
    colophon: str
    
    def __post_init__(self):
        logger.info(f"Created Manuscript: {self.identifier} ({self.repository})")

class LucinaDigitalEdition:
    """Main processor class for creating the digital edition"""
    
    def __init__(self, tei_file_path: str):
        """Initialize with TEI XML file"""
        self.tei_path = Path(tei_file_path)
        logger.info(f"Initializing Lucina Digital Edition processor")
        logger.info(f"TEI file: {self.tei_path.name} ({self.tei_path.stat().st_size:,} bytes)")
        
        # TEI namespace
        self.ns = {
            'tei': 'http://www.tei-c.org/ns/1.0',
            'xml': 'http://www.w3.org/XML/1998/namespace'
        }
        
        # Data containers
        self.manuscript = None
        self.persons = {}  # xml_id -> Person
        self.books = {}    # book_id -> Book
        self.poems = {}    # poem_id -> Poem
        self.all_lines = [] # All lines for search indexing
        
        # Statistics
        self.stats = {
            'total_persons': 0,
            'total_books': 0,
            'total_poems': 0,
            'total_lines': 0,
            'person_references': 0,
            'meters': Counter(),
            'genres': Counter(),
            'processing_time': 0
        }
        
        # Load and validate XML
        self._load_xml()
        
    def _load_xml(self):
        """Load and parse TEI XML file"""
        try:
            logger.info("Loading TEI XML file...")
            self.tree = ET.parse(self.tei_path)
            self.root = self.tree.getroot()
            
            # Register namespaces
            ET.register_namespace('', self.ns['tei'])
            ET.register_namespace('xml', self.ns['xml'])
            
            logger.info(f"XML loaded successfully")
            logger.info(f"Root element: {self.root.tag}")
            logger.info(f"Namespace: {self.root.nsmap if hasattr(self.root, 'nsmap') else 'Using ElementTree'}")
            
        except ET.ParseError as e:
            logger.error(f"❌ XML parsing error: {e}")
            raise
        except FileNotFoundError:
            logger.error(f"❌ TEI file not found: {self.tei_path}")
            raise
        except Exception as e:
            logger.error(f"❌ Unexpected error loading XML: {e}")
            raise
    
    def process_all(self) -> Dict[str, Any]:
        """Main processing method - parse entire TEI document"""
        start_time = datetime.now()
        logger.info("Starting comprehensive TEI processing...")
        
        try:
            # Process in logical order
            self._process_manuscript_metadata()
            self._process_persons()
            self._process_text_structure()
            
            # Calculate final statistics
            self._calculate_final_stats()
            
            # Log completion
            end_time = datetime.now()
            processing_time = (end_time - start_time).total_seconds()
            self.stats['processing_time'] = processing_time
            
            logger.info("TEI processing completed successfully!")
            logger.info(f"Processing time: {processing_time:.2f} seconds")
            self._log_final_statistics()
            
            return self._generate_complete_data()
            
        except Exception as e:
            logger.error(f"❌ Processing failed: {e}")
            raise
    
    def _process_manuscript_metadata(self):
        """Extract manuscript metadata from TEI header"""
        logger.info("Processing manuscript metadata...")
        
        try:
            # Find manuscript description
            ms_desc = self.root.find('.//tei:msDesc', self.ns)
            if ms_desc is None:
                logger.warning("⚠️ No manuscript description found")
                return
            
            # Extract identifier
            ms_id = ms_desc.find('.//tei:msIdentifier', self.ns)
            country = self._get_text(ms_id, 'tei:country')
            settlement = self._get_text(ms_id, 'tei:settlement')
            repository = self._get_text(ms_id, 'tei:repository')
            collection = self._get_text(ms_id, 'tei:collection')
            idno = self._get_text(ms_id, 'tei:idno')
            
            # Extract contents
            ms_item = ms_desc.find('.//tei:msItem', self.ns)
            title = self._get_text(ms_item, 'tei:title')
            author = self._get_text(ms_item, 'tei:author')
            colophon = self._get_text(ms_item, 'tei:colophon')
            
            # Extract physical description
            phys_desc = ms_desc.find('.//tei:physDesc', self.ns)
            material = self._get_text(phys_desc, './/tei:support')
            extent = self._get_text(phys_desc, './/tei:extent')
            
            # Extract dimensions
            dims_elem = phys_desc.find('.//tei:dimensions[@type="leaf"]', self.ns)
            dimensions = {}
            if dims_elem is not None:
                dimensions['height'] = self._get_text(dims_elem, 'tei:height')
                dimensions['width'] = self._get_text(dims_elem, 'tei:width')
                dimensions['unit'] = dims_elem.get('unit', 'mm')
            
            # Extract date
            origin = ms_desc.find('.//tei:origin', self.ns)
            orig_date = origin.find('tei:origDate', self.ns) if origin is not None else None
            date = orig_date.get('when', '') if orig_date is not None else ''
            
            self.manuscript = Manuscript(
                identifier=idno,
                repository=repository,
                country=country,
                settlement=settlement,
                collection=collection,
                title=title,
                author=author,
                date=date,
                material=material,
                extent=extent,
                dimensions=dimensions,
                colophon=colophon
            )
            
            logger.info(f"Manuscript metadata processed: {idno}")
            logger.info(f"   Repository: {repository}, {settlement}")
            logger.info(f"   Date: {date}")
            logger.info(f"   Material: {material}")
            logger.info(f"   Extent: {extent}")
            
        except Exception as e:
            logger.error(f"❌ Error processing manuscript metadata: {e}")
            raise
    
    def _process_persons(self):
        """Extract all persons from standOff section"""
        logger.info("Processing prosopographical data...")
        
        try:
            # Find standOff section
            standoff = self.root.find('.//tei:standOff', self.ns)
            if standoff is None:
                logger.warning("⚠️ No standOff section found")
                return
            
            # Find person list
            list_person = standoff.find('.//tei:listPerson', self.ns)
            if list_person is None:
                logger.warning("⚠️ No listPerson found in standOff")
                return
            
            persons = list_person.findall('tei:person', self.ns)
            logger.info(f"Found {len(persons)} persons in standOff")
            
            for person_elem in persons:
                person_id = person_elem.get('{http://www.w3.org/XML/1998/namespace}id')
                if not person_id:
                    logger.warning("⚠️ Person without xml:id found")
                    continue
                
                # Extract name components
                persname = person_elem.find('tei:persName', self.ns)
                forename = ""
                surname = ""
                addname = ""
                
                if persname is not None:
                    forename_elems = persname.findall('tei:forename', self.ns)
                    forename = " ".join(elem.text for elem in forename_elems if elem.text)
                    
                    surname_elem = persname.find('tei:surname', self.ns)
                    surname = surname_elem.text if surname_elem is not None and surname_elem.text else ""
                    
                    addname_elem = persname.find('tei:addName', self.ns)
                    addname = addname_elem.text if addname_elem is not None and addname_elem.text else ""
                
                # Extract biographical data
                birth_elem = person_elem.find('tei:birth', self.ns)
                birth_place = ""
                birth_date = ""
                if birth_elem is not None:
                    birth_place_elem = birth_elem.find('tei:placeName', self.ns)
                    birth_place = birth_place_elem.text if birth_place_elem is not None and birth_place_elem.text else ""
                    birth_date = birth_elem.get('notBefore', '') or birth_elem.get('when', '')
                
                death_elem = person_elem.find('tei:death', self.ns)
                death_date = ""
                if death_elem is not None:
                    death_date = death_elem.get('when', '') or death_elem.get('notAfter', '')
                
                # Extract occupation and notes
                occupation_elem = person_elem.find('tei:occupation', self.ns)
                occupation = occupation_elem.text if occupation_elem is not None and occupation_elem.text else ""
                
                note_elem = person_elem.find('tei:note', self.ns)
                note = note_elem.text if note_elem is not None and note_elem.text else ""
                
                # Create person object
                person = Person(
                    xml_id=person_id,
                    forename=forename,
                    surname=surname,
                    addname=addname,
                    birth_place=birth_place,
                    birth_date=birth_date,
                    death_date=death_date,
                    occupation=occupation,
                    note=note
                )
                
                self.persons[person_id] = person
                
            self.stats['total_persons'] = len(self.persons)
            logger.info(f"Processed {len(self.persons)} persons")
            
            # Log some examples
            for i, (person_id, person) in enumerate(self.persons.items()):
                if i < 5:  # Show first 5
                    logger.info(f"   {person.forename} {person.surname} ({person_id})")
            
        except Exception as e:
            logger.error(f"❌ Error processing persons: {e}")
            raise
    
    def _process_text_structure(self):
        """Process the main text structure (books, poems, lines)"""
        logger.info("Processing text structure...")
        
        try:
            # Find text element
            text_elem = self.root.find('tei:text', self.ns)
            if text_elem is None:
                logger.error("❌ No text element found")
                return
            
            # Process front matter (praefatio)
            front = text_elem.find('tei:front', self.ns)
            if front is not None:
                self._process_front_matter(front)
            
            # Process main body (books)
            body = text_elem.find('tei:body', self.ns)
            if body is not None:
                self._process_body(body)
            
            # Count person references
            self._count_person_references()
            
        except Exception as e:
            logger.error(f"❌ Error processing text structure: {e}")
            raise
    
    def _process_front_matter(self, front_elem):
        """Process front matter (praefatio)"""
        logger.info("Processing praefatio...")
        
        praef_div = front_elem.find('tei:div[@type="praefatio"]', self.ns)
        if praef_div is None:
            logger.warning("⚠️ No praefatio div found")
            return
        
        # Create praefatio as a special poem
        praef_id = praef_div.get('{http://www.w3.org/XML/1998/namespace}id', 'praefatio')
        
        # Extract heads
        heads = praef_div.findall('tei:head', self.ns)
        title = ""
        dedicatee = ""
        rubrics = []
        
        for head in heads:
            head_type = head.get('type', '')
            head_text = self._extract_text_with_refs(head)
            
            if head_type == 'author' or head_type == 'title':
                title = head_text
            elif head_type == 'dedication':
                dedicatee = head_text
            elif head_type == 'rubric':
                rubrics.append(head_text)
        
        # Process lines
        lines, line_groups = self._process_poem_lines(praef_div, praef_id)
        
        # Create praefatio poem
        praef_poem = Poem(
            xml_id=praef_id,
            book="Praefatio",
            number=0,
            title=title,
            dedicatee=dedicatee,
            meter="elegiac",  # Default for praefatio
            genre="dedication",
            lines=lines,
            line_groups=line_groups,
            rubrics=rubrics,
            total_lines=len(lines)
        )
        
        # Create praefatio book
        praef_book = Book(
            xml_id="praefatio",
            number="Praefatio",
            title="Praefatio",
            poems=[praef_poem]
        )
        
        self.books["praefatio"] = praef_book
        self.poems[praef_id] = praef_poem
        
        logger.info(f"Praefatio processed: {len(lines)} lines")
    
    def _process_body(self, body_elem):
        """Process main body with books"""
        logger.info("Processing main body (books)...")
        
        # Find all book divisions
        book_divs = body_elem.findall('tei:div[@type="book"]', self.ns)
        logger.info(f"Found {len(book_divs)} books")
        
        for book_div in book_divs:
            self._process_book(book_div)
        
        self.stats['total_books'] = len([b for b in self.books.keys() if b != "praefatio"])
        logger.info(f"Processed {self.stats['total_books']} books")
    
    def _process_book(self, book_div):
        """Process individual book"""
        book_id = book_div.get('{http://www.w3.org/XML/1998/namespace}id', '')
        book_num = book_div.get('n', '')
        
        logger.info(f"Processing {book_id} (Book {book_num})...")
        
        # Extract book title
        head = book_div.find('tei:head', self.ns)
        book_title = head.text if head is not None and head.text else f"Book {book_num}"
        
        # Find all poems in this book
        poem_divs = book_div.findall('tei:div[@type="poem"]', self.ns)
        logger.info(f"   Found {len(poem_divs)} poems in {book_id}")
        
        book_poems = []
        for poem_div in poem_divs:
            poem = self._process_poem(poem_div, book_num)
            if poem:
                book_poems.append(poem)
                self.poems[poem.xml_id] = poem
        
        # Create book object
        book = Book(
            xml_id=book_id,
            number=book_num,
            title=book_title,
            poems=book_poems
        )
        
        self.books[book_id] = book
        logger.info(f"{book_id} completed: {book.total_poems} poems, {book.total_lines} lines")
    
    def _process_poem(self, poem_div, book_num) -> Optional[Poem]:
        """Process individual poem"""
        poem_id = poem_div.get('{http://www.w3.org/XML/1998/namespace}id', '')
        poem_num = poem_div.get('n', '')
        meter = poem_div.get('met', '')
        genre = poem_div.get('ana', '').lstrip('#')
        
        if not poem_id:
            logger.warning(f"⚠️ Poem without xml:id in book {book_num}")
            return None
        
        logger.debug(f"   Processing poem {poem_id}...")
        
        # Extract heads
        heads = poem_div.findall('tei:head', self.ns)
        title = ""
        dedicatee = ""
        addressee_ref = ""
        rubrics = []
        
        for head in heads:
            head_type = head.get('type', '')
            head_text = self._extract_text_with_refs(head)
            
            if head_type == 'number':
                title = head_text
            elif head_type == 'dedication':
                dedicatee = head_text
                # Extract person reference if present
                persname = head.find('.//tei:persName[@ref]', self.ns)
                if persname is not None:
                    addressee_ref = persname.get('ref', '').lstrip('#')
            elif head_type == 'rubric':
                rubrics.append(head_text)
        
        # Process lines and line groups
        lines, line_groups = self._process_poem_lines(poem_div, poem_id)
        
        # Update statistics
        self.stats['meters'][meter] += 1
        if genre:
            self.stats['genres'][genre] += 1
        
        return Poem(
            xml_id=poem_id,
            book=book_num,
            number=int(poem_num) if poem_num.isdigit() else 0,
            title=title,
            dedicatee=dedicatee,
            addressee_ref=addressee_ref,
            meter=meter,
            genre=genre,
            lines=lines,
            line_groups=line_groups,
            rubrics=rubrics,
            total_lines=len(lines)
        )
    
    def _process_poem_lines(self, poem_div, poem_id) -> Tuple[List[Line], List[LineGroup]]:
        """Process lines within a poem"""
        all_lines = []
        line_groups = []
        
        # Find all line groups
        lg_elements = poem_div.findall('.//tei:lg', self.ns)
        
        if lg_elements:
            # Process structured line groups
            for lg_elem in lg_elements:
                lg_id = lg_elem.get('{http://www.w3.org/XML/1998/namespace}id', '')
                lg_type = lg_elem.get('type', '')
                lg_met = lg_elem.get('met', '')
                
                lg_lines = []
                line_elems = lg_elem.findall('tei:l', self.ns)
                
                for line_elem in line_elems:
                    line = self._process_line(line_elem, poem_id, lg_id)
                    if line:
                        lg_lines.append(line)
                        all_lines.append(line)
                
                line_group = LineGroup(
                    xml_id=lg_id,
                    type=lg_type,
                    met=lg_met,
                    lines=lg_lines,
                    parent_poem_id=poem_id
                )
                line_groups.append(line_group)
        else:
            # Process direct lines (no line groups)
            line_elems = poem_div.findall('.//tei:l', self.ns)
            for line_elem in line_elems:
                line = self._process_line(line_elem, poem_id)
                if line:
                    all_lines.append(line)
        
        return all_lines, line_groups
    
    def _process_line(self, line_elem, poem_id, lg_id="") -> Optional[Line]:
        """Process individual line"""
        line_id = line_elem.get('{http://www.w3.org/XML/1998/namespace}id', '')
        line_num = line_elem.get('n', '')
        line_text = self._extract_text_with_refs(line_elem)
        indent = line_elem.get('rend') == 'indent'
        
        if not line_id:
            logger.warning(f"⚠️ Line without xml:id in poem {poem_id}")
            return None
        
        line = Line(
            xml_id=line_id,
            number=int(line_num) if line_num.isdigit() else 0,
            text=line_text,
            indent=indent,
            parent_poem_id=poem_id,
            parent_lg_id=lg_id
        )
        
        # Add to global lines list for search
        self.all_lines.append(line)
        
        return line
    
    def _extract_text_with_refs(self, element) -> str:
        """Extract text content while preserving person references"""
        if element is None:
            return ""
        
        text_parts = []
        
        # Handle direct text
        if element.text:
            text_parts.append(element.text)
        
        # Handle child elements
        for child in element:
            if child.tag.endswith('persName'):
                # Person reference
                ref = child.get('ref', '').lstrip('#')
                person_text = child.text or ""
                if ref and ref in self.persons:
                    # Mark as referenced
                    self.persons[ref].references += 1
                text_parts.append(person_text)
            else:
                # Other elements - get all text
                text_parts.append(''.join(child.itertext()))
            
            # Handle tail text
            if child.tail:
                text_parts.append(child.tail)
        
        return ''.join(text_parts).strip()
    
    def _get_text(self, parent, xpath, default=""):
        """Helper to safely extract text from XML elements"""
        if parent is None:
            return default
        elem = parent.find(xpath, self.ns)
        return elem.text if elem is not None and elem.text else default
    
    def _count_person_references(self):
        """Count total person references across the text"""
        self.stats['person_references'] = sum(person.references for person in self.persons.values())
        logger.info(f"Total person references: {self.stats['person_references']}")
        
        # Log most referenced persons
        top_persons = sorted(self.persons.values(), key=lambda p: p.references, reverse=True)[:5]
        logger.info("Most referenced persons:")
        for person in top_persons:
            if person.references > 0:
                logger.info(f"   {person.forename} {person.surname}: {person.references} refs")
    
    def _calculate_final_stats(self):
        """Calculate final statistics"""
        self.stats['total_poems'] = len(self.poems)
        self.stats['total_lines'] = len(self.all_lines)
        
        logger.info("Calculating final statistics...")
        logger.info(f"   Total poems: {self.stats['total_poems']}")
        logger.info(f"   Total lines: {self.stats['total_lines']}")
        logger.info(f"   Total books: {len(self.books)}")
    
    def _log_final_statistics(self):
        """Log comprehensive final statistics"""
        logger.info("\n" + "="*60)
        logger.info("FINAL PROCESSING STATISTICS")
        logger.info("="*60)
        
        logger.info(f"Processing time: {self.stats['processing_time']:.2f} seconds")
        logger.info(f"Books processed: {len(self.books)}")
        logger.info(f"Poems processed: {self.stats['total_poems']}")
        logger.info(f"Lines processed: {self.stats['total_lines']}")
        logger.info(f"Persons in database: {self.stats['total_persons']}")
        logger.info(f"Person references: {self.stats['person_references']}")
        
        logger.info("\nMeter distribution:")
        for meter, count in self.stats['meters'].most_common():
            logger.info(f"   {meter}: {count} poems")
        
        logger.info("\nGenre distribution:")
        for genre, count in self.stats['genres'].most_common():
            logger.info(f"   {genre}: {count} poems")
        
        logger.info("="*60)
    
    def _generate_complete_data(self) -> Dict[str, Any]:
        """Generate complete data structure for export"""
        logger.info("Generating complete data structure...")
        
        return {
            'metadata': {
                'title': 'Lucina: A Digital Edition',
                'author': 'Aurelius Laurentius Albrisius',
                'processing_date': datetime.now().isoformat(),
                'processing_time': self.stats['processing_time'],
                'tei_source': str(self.tei_path)
            },
            'manuscript': asdict(self.manuscript) if self.manuscript else None,
            'statistics': dict(self.stats),
            'persons': {pid: asdict(person) for pid, person in self.persons.items()},
            'books': {bid: asdict(book) for bid, book in self.books.items()},
            'poems': {pid: asdict(poem) for pid, poem in self.poems.items()},
            'all_lines': [asdict(line) for line in self.all_lines]
        }
    
    def export_json(self, output_path: str):
        """Export complete data as JSON"""
        logger.info(f"Exporting data to JSON: {output_path}")
        
        data = self._generate_complete_data()
        output_file = Path(output_path)
        
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            logger.info(f"JSON export completed: {output_file}")
            logger.info(f"   File size: {output_file.stat().st_size:,} bytes")
            
        except Exception as e:
            logger.error(f"JSON export failed: {e}")
            raise


def main():
    """Main execution function"""
    print("Lucina Digital Edition Generator")
    print("="*50)
    
    # File paths
    tei_file = Path("C:/Users/Chrisi/Documents/GitHub/diged-neolat/docs/edition-2/data/tei-final-2.xml")
    output_dir = Path("C:/Users/Chrisi/Documents/GitHub/diged-neolat/docs/edition-3")
    
    # Ensure output directory exists
    output_dir.mkdir(exist_ok=True)
    
    try:
        # Initialize processor
        processor = LucinaDigitalEdition(str(tei_file))
        
        # Process everything
        complete_data = processor.process_all()
        
        # Export JSON data
        json_output = output_dir / "lucina_complete_data.json"
        processor.export_json(str(json_output))
        
        print("\nProcessing completed successfully!")
        print(f"Statistics: {processor.stats['total_poems']} poems, {processor.stats['total_lines']} lines")
        print(f"Persons: {processor.stats['total_persons']} individuals")
        print(f"Data exported to: {json_output}")
        
        return processor
        
    except Exception as e:
        logger.error(f"❌ Main execution failed: {e}")
        raise


if __name__ == "__main__":
    processor = main()