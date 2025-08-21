import xml.etree.ElementTree as ET
from collections import defaultdict, Counter
import os
from typing import Dict, List, Set, Tuple

class TEIAnalyzer:
    def __init__(self, filepath: str):
        """Initialize the TEI analyzer with the XML file."""
        self.tree = ET.parse(filepath)
        self.root = self.tree.getroot()
        
        # Define TEI namespace
        self.ns = {'tei': 'http://www.tei-c.org/ns/1.0'}
        
        # Register namespace for cleaner output
        ET.register_namespace('', 'http://www.tei-c.org/ns/1.0')
        
    def analyze_structure(self) -> Dict:
        """Analyze the document structure."""
        structure = {
            'total_books': 0,
            'total_poems': 0,
            'total_lines': 0,
            'poems_per_book': {},
            'lines_per_poem': {},
            'line_groups_per_poem': {}
        }
        
        # Find all books
        books = self.root.findall('.//tei:div[@type="book"]', self.ns)
        structure['total_books'] = len(books)
        
        for book in books:
            book_id = book.get('{http://www.w3.org/XML/1998/namespace}id', 'unknown')
            book_num = book.get('n', 'unknown')
            
            # Find poems in this book
            poems = book.findall('.//tei:div[@type="poem"]', self.ns)
            structure['poems_per_book'][f"Book {book_num}"] = len(poems)
            
            for poem in poems:
                poem_id = poem.get('{http://www.w3.org/XML/1998/namespace}id', 'unknown')
                
                # Count lines
                lines = poem.findall('.//tei:l', self.ns)
                structure['lines_per_poem'][poem_id] = len(lines)
                structure['total_lines'] += len(lines)
                
                # Count line groups
                lgs = poem.findall('.//tei:lg', self.ns)
                structure['line_groups_per_poem'][poem_id] = len(lgs)
            
            structure['total_poems'] += len(poems)
        
        # Add praefatio if it exists
        praef = self.root.find('.//tei:div[@type="praefatio"]', self.ns)
        if praef is not None:
            praef_lines = praef.findall('.//tei:l', self.ns)
            structure['praefatio_lines'] = len(praef_lines)
            structure['total_lines'] += len(praef_lines)
        
        return structure
    
    def analyze_meters(self) -> Dict:
        """Analyze metrical patterns in the text."""
        meters = {
            'meter_types': Counter(),
            'poems_by_meter': defaultdict(list),
            'poems_without_meter': [],
            'line_groups_by_type': Counter()
        }
        
        # Analyze poems
        poems = self.root.findall('.//tei:div[@type="poem"]', self.ns)
        for poem in poems:
            poem_id = poem.get('{http://www.w3.org/XML/1998/namespace}id', 'unknown')
            meter = poem.get('met')
            
            if meter:
                meters['meter_types'][meter] += 1
                meters['poems_by_meter'][meter].append(poem_id)
            else:
                meters['poems_without_meter'].append(poem_id)
        
        # Analyze line groups
        lgs = self.root.findall('.//tei:lg', self.ns)
        for lg in lgs:
            lg_type = lg.get('type', 'unspecified')
            meters['line_groups_by_type'][lg_type] += 1
        
        return meters
    
    def analyze_persons(self) -> Dict:
        """Analyze personal names and references."""
        persons = {
            'total_persname_tags': 0,
            'unique_persons_referenced': set(),
            'persons_without_ref': [],
            'person_frequency': Counter(),
            'persons_in_standoff': set(),
            'missing_from_standoff': set()
        }
        
        # Find all persName tags
        persnames = self.root.findall('.//tei:persName', self.ns)
        persons['total_persname_tags'] = len(persnames)
        
        for persname in persnames:
            ref = persname.get('ref')
            text = ''.join(persname.itertext()).strip()
            
            if ref:
                # Remove # from ref
                person_id = ref.lstrip('#')
                persons['unique_persons_referenced'].add(person_id)
                persons['person_frequency'][person_id] += 1
            else:
                persons['persons_without_ref'].append(text)
        
        # Check standOff section
        standoff_persons = self.root.findall('.//tei:standOff//tei:person', self.ns)
        for person in standoff_persons:
            person_id = person.get('{http://www.w3.org/XML/1998/namespace}id')
            if person_id:
                persons['persons_in_standoff'].add(person_id)
        
        # Find missing persons
        persons['missing_from_standoff'] = persons['unique_persons_referenced'] - persons['persons_in_standoff']
        
        return persons
    
    def analyze_quotations(self) -> Dict:
        """Analyze potential quotations and parenthetical text."""
        quotations = {
            'lines_with_quotes': [],
            'lines_with_parentheses': [],
            'lines_with_speech_verbs': [],
            'potential_direct_speech': []
        }
        
        speech_verbs = ['inquit', 'ait', 'dixit', 'diceret', 'respondit', 'exclamat', 'clamat']
        
        lines = self.root.findall('.//tei:l', self.ns)
        for line in lines:
            line_id = line.get('{http://www.w3.org/XML/1998/namespace}id', 'unknown')
            text = ''.join(line.itertext())
            
            # Check for quotation marks
            if '"' in text or '«' in text or '»' in text:
                quotations['lines_with_quotes'].append((line_id, text))
                quotations['potential_direct_speech'].append(line_id)
            
            # Check for parentheses
            if '(' in text and ')' in text:
                quotations['lines_with_parentheses'].append((line_id, text))
            
            # Check for speech verbs
            text_lower = text.lower()
            for verb in speech_verbs:
                if verb in text_lower:
                    quotations['lines_with_speech_verbs'].append((line_id, text))
                    if line_id not in quotations['potential_direct_speech']:
                        quotations['potential_direct_speech'].append(line_id)
                    break
        
        return quotations
    
    def analyze_indentation(self) -> Dict:
        """Analyze line indentation in elegiac poems."""
        indentation = {
            'elegiac_poems': [],
            'lines_needing_indent': [],
            'lines_already_indented': [],
            'inconsistent_poems': []
        }
        
        # Find elegiac poems
        elegiac_poems = self.root.findall('.//tei:div[@type="poem"][@met="elegiac"]', self.ns)
        
        for poem in elegiac_poems:
            poem_id = poem.get('{http://www.w3.org/XML/1998/namespace}id')
            indentation['elegiac_poems'].append(poem_id)
            
            lines = poem.findall('.//tei:l', self.ns)
            needs_indent = []
            has_indent = []
            
            for i, line in enumerate(lines, 1):
                line_id = line.get('{http://www.w3.org/XML/1998/namespace}id')
                rend = line.get('rend')
                
                # Even lines should be indented (pentameters)
                if i % 2 == 0:
                    if rend == 'indent':
                        has_indent.append(line_id)
                    else:
                        needs_indent.append(line_id)
                        indentation['lines_needing_indent'].append(line_id)
            
            # Check for inconsistency
            if needs_indent and has_indent:
                indentation['inconsistent_poems'].append(poem_id)
        
        return indentation
    
    def analyze_genres(self) -> Dict:
        """Analyze genre classifications."""
        genres = {
            'genre_distribution': Counter(),
            'poems_without_genre': [],
            'multi_genre_poems': []
        }
        
        poems = self.root.findall('.//tei:div[@type="poem"]', self.ns)
        for poem in poems:
            poem_id = poem.get('{http://www.w3.org/XML/1998/namespace}id')
            ana = poem.get('ana')
            
            if ana:
                # Handle multiple genres
                genre_list = ana.strip().split()
                for genre in genre_list:
                    genres['genre_distribution'][genre] += 1
                
                if len(genre_list) > 1:
                    genres['multi_genre_poems'].append((poem_id, genre_list))
            else:
                genres['poems_without_genre'].append(poem_id)
        
        return genres
    
    def analyze_notes_apparatus(self) -> Dict:
        """Analyze editorial notes and apparatus."""
        apparatus = {
            'total_notes': 0,
            'notes_by_type': Counter(),
            'app_elements': 0,
            'poems_with_notes': set(),
            'poems_without_notes': []
        }
        
        # Find all notes
        notes = self.root.findall('.//tei:note', self.ns)
        apparatus['total_notes'] = len(notes)
        
        for note in notes:
            note_type = note.get('type', 'untyped')
            apparatus['notes_by_type'][note_type] += 1
            
            # Find parent poem
            parent = note
            while parent is not None:
                if parent.tag.endswith('div') and parent.get('type') == 'poem':
                    poem_id = parent.get('{http://www.w3.org/XML/1998/namespace}id')
                    apparatus['poems_with_notes'].add(poem_id)
                    break
                parent = parent.find('..')
        
        # Find apparatus entries
        apps = self.root.findall('.//tei:app', self.ns)
        apparatus['app_elements'] = len(apps)
        
        # Find poems without notes
        all_poems = self.root.findall('.//tei:div[@type="poem"]', self.ns)
        for poem in all_poems:
            poem_id = poem.get('{http://www.w3.org/XML/1998/namespace}id')
            if poem_id not in apparatus['poems_with_notes']:
                apparatus['poems_without_notes'].append(poem_id)
        
        return apparatus
    
    def generate_report(self) -> str:
        """Generate a comprehensive analysis report."""
        report = []
        report.append("=" * 70)
        report.append("TEI XML ANALYSIS REPORT")
        report.append("=" * 70)
        
        # Structure Analysis
        structure = self.analyze_structure()
        report.append("\n1. DOCUMENT STRUCTURE")
        report.append("-" * 40)
        report.append(f"Total books: {structure['total_books']}")
        report.append(f"Total poems: {structure['total_poems']}")
        report.append(f"Total lines: {structure['total_lines']}")
        if 'praefatio_lines' in structure:
            report.append(f"Praefatio lines: {structure['praefatio_lines']}")
        report.append("\nPoems per book:")
        for book, count in structure['poems_per_book'].items():
            report.append(f"  {book}: {count} poems")
        
        # Metrical Analysis
        meters = self.analyze_meters()
        report.append("\n2. METRICAL ANALYSIS")
        report.append("-" * 40)
        report.append("Meter distribution:")
        for meter, count in meters['meter_types'].items():
            report.append(f"  {meter}: {count} poems")
        if meters['poems_without_meter']:
            report.append(f"\nPoems without meter annotation: {len(meters['poems_without_meter'])}")
            for poem in meters['poems_without_meter'][:5]:
                report.append(f"  - {poem}")
        
        # Person Analysis
        persons = self.analyze_persons()
        report.append("\n3. PROSOPOGRAPHICAL ANALYSIS")
        report.append("-" * 40)
        report.append(f"Total persName tags: {persons['total_persname_tags']}")
        report.append(f"Unique persons referenced: {len(persons['unique_persons_referenced'])}")
        report.append(f"Persons without @ref: {len(persons['persons_without_ref'])}")
        
        report.append("\nMost frequently mentioned (top 5):")
        for person, count in persons['person_frequency'].most_common(5):
            report.append(f"  {person}: {count} mentions")
        
        if persons['missing_from_standoff']:
            report.append(f"\nPersons missing from standOff: {len(persons['missing_from_standoff'])}")
            for person in list(persons['missing_from_standoff'])[:5]:
                report.append(f"  - {person}")
        
        # Quotation Analysis
        quotations = self.analyze_quotations()
        report.append("\n4. QUOTATION AND SPEECH ANALYSIS")
        report.append("-" * 40)
        report.append(f"Lines with quotation marks: {len(quotations['lines_with_quotes'])}")
        report.append(f"Lines with parentheses: {len(quotations['lines_with_parentheses'])}")
        report.append(f"Lines with speech verbs: {len(quotations['lines_with_speech_verbs'])}")
        report.append(f"Potential direct speech: {len(quotations['potential_direct_speech'])}")
        
        # Indentation Analysis
        indentation = self.analyze_indentation()
        report.append("\n5. ELEGIAC INDENTATION ANALYSIS")
        report.append("-" * 40)
        report.append(f"Elegiac poems: {len(indentation['elegiac_poems'])}")
        report.append(f"Lines needing indent: {len(indentation['lines_needing_indent'])}")
        if indentation['inconsistent_poems']:
            report.append(f"Inconsistently formatted poems: {len(indentation['inconsistent_poems'])}")
        
        # Genre Analysis
        genres = self.analyze_genres()
        report.append("\n6. GENRE CLASSIFICATION")
        report.append("-" * 40)
        report.append("Genre distribution:")
        for genre, count in genres['genre_distribution'].items():
            report.append(f"  {genre}: {count} poems")
        if genres['poems_without_genre']:
            report.append(f"\nPoems without genre: {len(genres['poems_without_genre'])}")
        if genres['multi_genre_poems']:
            report.append(f"Multi-genre poems: {len(genres['multi_genre_poems'])}")
        
        # Notes and Apparatus
        apparatus = self.analyze_notes_apparatus()
        report.append("\n7. EDITORIAL APPARATUS")
        report.append("-" * 40)
        report.append(f"Total notes: {apparatus['total_notes']}")
        report.append(f"App elements: {apparatus['app_elements']}")
        report.append(f"Poems with notes: {len(apparatus['poems_with_notes'])}")
        report.append(f"Poems without notes: {len(apparatus['poems_without_notes'])}")
        
        if apparatus['notes_by_type']:
            report.append("\nNotes by type:")
            for note_type, count in apparatus['notes_by_type'].items():
                report.append(f"  {note_type}: {count}")
        
        # Summary and Recommendations
        report.append("\n" + "=" * 70)
        report.append("ENRICHMENT OPPORTUNITIES")
        report.append("=" * 70)
        
        priorities = []
        
        if indentation['lines_needing_indent']:
            priorities.append(f"1. Add indentation to {len(indentation['lines_needing_indent'])} pentameter lines")
        
        if quotations['lines_with_quotes']:
            priorities.append(f"2. Mark {len(quotations['lines_with_quotes'])} instances of direct speech")
        
        if quotations['lines_with_parentheses']:
            priorities.append(f"3. Tag {len(quotations['lines_with_parentheses'])} parenthetical passages")
        
        if persons['persons_without_ref']:
            priorities.append(f"4. Add @ref to {len(persons['persons_without_ref'])} person mentions")
        
        if persons['missing_from_standoff']:
            priorities.append(f"5. Add {len(persons['missing_from_standoff'])} persons to standOff")
        
        if meters['poems_without_meter']:
            priorities.append(f"6. Add meter to {len(meters['poems_without_meter'])} poems")
        
        if genres['poems_without_genre']:
            priorities.append(f"7. Classify {len(genres['poems_without_genre'])} poems by genre")
        
        if apparatus['poems_without_notes'] and len(apparatus['poems_without_notes']) > 10:
            priorities.append(f"8. Add commentary to {len(apparatus['poems_without_notes'])} unannotated poems")
        
        for priority in priorities:
            report.append(priority)
        
        return "\n".join(report)
    
    def export_enrichment_targets(self) -> Dict:
        """Export specific targets for automated enrichment."""
        quotations = self.analyze_quotations()
        indentation = self.analyze_indentation()
        persons = self.analyze_persons()
        
        return {
            'lines_for_direct_speech': quotations['lines_with_quotes'],
            'lines_for_parentheses': quotations['lines_with_parentheses'],
            'lines_needing_indent': indentation['lines_needing_indent'],
            'persons_without_ref': persons['persons_without_ref'],
            'persons_missing_from_standoff': list(persons['missing_from_standoff'])
        }


def main():
    # Analyze the TEI file
    analyzer = TEIAnalyzer('tei-final-1.xml')
    
    # Generate and print report
    report = analyzer.generate_report()
    print(report)
    
    # Save report to file
    with open('tei_analysis_report.txt', 'w', encoding='utf-8') as f:
        f.write(report)
    
    # Export enrichment targets for next phase
    targets = analyzer.export_enrichment_targets()
    
    # Save targets for automated enrichment
    import json
    with open('enrichment_targets.json', 'w', encoding='utf-8') as f:
        json.dump(targets, f, indent=2, ensure_ascii=False)
    
    print("\n" + "=" * 70)
    print("Analysis complete!")
    print("Report saved to: tei_analysis_report.txt")
    print("Enrichment targets saved to: enrichment_targets.json")


if __name__ == "__main__":
    main()