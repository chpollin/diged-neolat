import xml.etree.ElementTree as ET
import json
from typing import List, Tuple, Dict

class TEIEnricher:
    def __init__(self, input_file: str, output_file: str):
        """Initialize the enricher with input and output files."""
        self.input_file = input_file
        self.output_file = output_file
        self.tree = ET.parse(input_file)
        self.root = self.tree.getroot()
        
        # Define TEI namespace
        self.ns = {'tei': 'http://www.tei-c.org/ns/1.0'}
        
        # Register namespace for cleaner output
        ET.register_namespace('', 'http://www.tei-c.org/ns/1.0')
        
        # Track changes made
        self.changes = {
            'parentheticals_marked': 0,
            'persons_added_to_standoff': 0,
            'direct_speech_marked': 0,
            'persons_with_ref_added': 0
        }
        
        # Store detailed changes for review
        self.change_log = []
        
        # Lines that need manual review for speech
        self.speech_review_needed = []
    
    def mark_parenthetical_text(self):
        """Find and mark parenthetical text with <seg type='parenthesis'>."""
        print("\n📝 Marking parenthetical text...")
        
        lines = self.root.findall('.//tei:l', self.ns)
        
        for line in lines:
            line_id = line.get('{http://www.w3.org/XML/1998/namespace}id')
            
            # Check if line has text with parentheses
            text_content = ''.join(line.itertext())
            
            if '(' in text_content and ')' in text_content:
                # Find all parenthetical content
                start_idx = text_content.find('(')
                end_idx = text_content.find(')', start_idx)
                
                if start_idx != -1 and end_idx != -1:
                    parenthetical_text = text_content[start_idx:end_idx+1]
                    
                    # Log the change
                    self.change_log.append({
                        'type': 'parenthetical',
                        'line_id': line_id,
                        'text': parenthetical_text,
                        'full_line': text_content
                    })
                    
                    # Process the line to add seg element
                    self._wrap_parenthetical_in_line(line, start_idx, end_idx)
                    self.changes['parentheticals_marked'] += 1
        
        print(f"   ✓ Marked {self.changes['parentheticals_marked']} parenthetical passages")
    
    def _wrap_parenthetical_in_line(self, line, start_pos, end_pos):
        """Wrap parenthetical text in seg element within a line."""
        # Get full text
        full_text = ''.join(line.itertext())
        
        # Clear line content
        line.text = full_text[:start_pos]
        
        # Create seg element for parenthetical
        seg = ET.SubElement(line, 'seg')
        seg.set('type', 'parenthesis')
        seg.text = full_text[start_pos:end_pos+1]
        seg.tail = full_text[end_pos+1:]
    
    def generate_standoff_persons(self):
        """Generate standOff entries for missing persons."""
        print("\n📝 Generating standOff person entries...")
        
        # First, collect all person references in the text
        person_refs = set()
        persnames = self.root.findall('.//tei:persName[@ref]', self.ns)
        
        for persname in persnames:
            ref = persname.get('ref')
            if ref and ref.startswith('#'):
                person_refs.add(ref[1:])  # Remove the #
        
        # Find existing persons in standOff
        existing_persons = set()
        standoff_persons = self.root.findall('.//tei:standOff//tei:person', self.ns)
        for person in standoff_persons:
            person_id = person.get('{http://www.w3.org/XML/1998/namespace}id')
            if person_id:
                existing_persons.add(person_id)
        
        # Calculate missing persons
        missing_persons = person_refs - existing_persons
        
        if not missing_persons:
            print("   ℹ️  No missing persons to add to standOff")
            return
        
        # Find or create standOff section
        standoff = self.root.find('.//tei:standOff', self.ns)
        if standoff is None:
            # Create standOff after teiHeader
            teiheader = self.root.find('.//tei:teiHeader', self.ns)
            if teiheader is not None:
                # Find position after teiHeader
                parent = self.root
                tei_children = list(parent)
                header_index = tei_children.index(teiheader)
                
                standoff = ET.Element('standOff')
                parent.insert(header_index + 1, standoff)
        
        # Find or create listPerson
        listperson = standoff.find('.//tei:listPerson', self.ns)
        if listperson is None:
            listperson = ET.SubElement(standoff, 'listPerson')
        
        # Add missing persons with basic structure
        for person_id in sorted(missing_persons):
            # Create person entry
            person = ET.SubElement(listperson, 'person')
            person.set('{http://www.w3.org/XML/1998/namespace}id', person_id)
            
            # Add persName with formatted name
            persname = ET.SubElement(person, 'persName')
            
            # Convert ID to readable name
            name = self._format_person_name(person_id)
            persname.text = name
            
            # Add placeholder note
            note = ET.SubElement(person, 'note')
            note.text = f"[To be completed: biographical information for {name}]"
            
            self.changes['persons_added_to_standoff'] += 1
            
            # Log the addition
            self.change_log.append({
                'type': 'person_added',
                'person_id': person_id,
                'name': name
            })
        
        print(f"   ✓ Added {self.changes['persons_added_to_standoff']} persons to standOff")
    
    def _format_person_name(self, person_id: str) -> str:
        """Convert person ID to formatted name."""
        # Special cases for known important figures
        special_names = {
            'cicco-simonetta': 'Cicco Simonetta',
            'giacomo-simonetta': 'Giacomo Simonetta',
            'giovanni-simonetta': 'Giovanni Simonetta',
            'lucina': 'Lucina',
            'galeazzo-sforza': 'Galeazzo Maria Sforza',
            'albrisius': 'Aurelius Laurentius Albrisius'
        }
        
        if person_id in special_names:
            return special_names[person_id]
        
        # General formatting: replace hyphens with spaces and title case
        return person_id.replace('-', ' ').title()
    
    def mark_direct_speech_latin(self):
        """Find and mark direct speech in Latin text using context-based detection."""
        print("\n📝 Detecting direct speech in Latin text...")
        
        # Latin speech verbs that indicate direct speech
        speech_verbs = [
            'inquit', 'ait', 'dixit', 'diceret', 'respondit', 
            'exclamat', 'clamat', 'dicit', 'dicebat', 'respondet',
            'aisne', 'dicis', 'rogas', 'inquam', 'inquis',
            'aiebat', 'dixerat', 'dicens', 'locutus', 'fatur'
        ]
        
        lines = self.root.findall('.//tei:l', self.ns)
        
        for i, line in enumerate(lines):
            line_id = line.get('{http://www.w3.org/XML/1998/namespace}id')
            text = ''.join(line.itertext())
            text_lower = text.lower()
            
            # Check for speech verbs
            found_verb = None
            verb_position = -1
            
            for verb in speech_verbs:
                if verb in text_lower:
                    verb_position = text_lower.find(verb)
                    found_verb = verb
                    break
            
            if found_verb:
                # Try to identify the speech content
                speech_content = None
                
                # Pattern 1: Check for colon after verb
                if ':' in text[verb_position:]:
                    colon_pos = text.find(':', verb_position)
                    # Everything after colon might be speech
                    potential_speech = text[colon_pos+1:].strip()
                    if potential_speech:
                        speech_content = potential_speech
                        self._mark_speech_with_said(line, speech_content, colon_pos+1)
                        self.changes['direct_speech_marked'] += 1
                
                # Pattern 2: Check if next line might be speech (capital letter start)
                elif i + 1 < len(lines):
                    next_line = lines[i + 1]
                    next_text = ''.join(next_line.itertext()).strip()
                    # If next line starts with capital and doesn't have speech verb
                    if next_text and next_text[0].isupper():
                        has_verb = any(v in next_text.lower() for v in speech_verbs)
                        if not has_verb:
                            # Mark for manual review
                            self.speech_review_needed.append({
                                'line_id': line_id,
                                'text': text,
                                'verb': found_verb,
                                'next_line': next_text,
                                'reason': 'speech_verb_with_following_line'
                            })
                
                # Pattern 3: Speech verb in middle with capitalized following text
                if not speech_content and verb_position > 0:
                    after_verb = text[verb_position + len(found_verb):].strip()
                    # Check if text after verb starts with capital
                    if after_verb and after_verb[0].isupper():
                        self.speech_review_needed.append({
                            'line_id': line_id,
                            'text': text,
                            'verb': found_verb,
                            'potential_speech': after_verb,
                            'reason': 'speech_verb_with_capital'
                        })
                
                # Log if we marked speech
                if speech_content:
                    self.change_log.append({
                        'type': 'direct_speech',
                        'line_id': line_id,
                        'verb': found_verb,
                        'speech': speech_content,
                        'full_line': text
                    })
        
        print(f"   ✓ Marked {self.changes['direct_speech_marked']} instances of direct speech")
        
        if self.speech_review_needed:
            print(f"   ⚠️  {len(self.speech_review_needed)} lines need manual review for speech")
    
    def _mark_speech_with_said(self, line, speech_text: str, start_pos: int):
        """Mark speech content with <said> element."""
        full_text = ''.join(line.itertext())
        
        # Create said element
        said = ET.Element('said')
        said.set('rend', 'quoted')
        said.text = speech_text
        
        # Update line text
        line.text = full_text[:start_pos]
        
        # Add said element
        line.append(said)
    
    def add_missing_refs(self):
        """Add @ref attributes to persName elements that lack them."""
        print("\n📝 Adding @ref attributes to person names...")
        
        # Build a mapping of known text forms to IDs
        name_to_id = {}
        
        # First pass: collect all persNames with refs
        persnames_with_ref = self.root.findall('.//tei:persName[@ref]', self.ns)
        for persname in persnames_with_ref:
            text = ''.join(persname.itertext()).strip()
            ref = persname.get('ref')
            if ref and ref.startswith('#'):
                name_to_id[text.lower()] = ref
        
        # Second pass: find persNames without refs
        all_persnames = self.root.findall('.//tei:persName', self.ns)
        for persname in all_persnames:
            if not persname.get('ref'):
                text = ''.join(persname.itertext()).strip()
                text_lower = text.lower()
                
                # Try to match with known forms
                if text_lower in name_to_id:
                    persname.set('ref', name_to_id[text_lower])
                    self.changes['persons_with_ref_added'] += 1
                    
                    self.change_log.append({
                        'type': 'ref_added',
                        'text': text,
                        'ref': name_to_id[text_lower]
                    })
                else:
                    # Try to generate a reasonable ID
                    generated_id = self._generate_person_id(text)
                    if generated_id:
                        persname.set('ref', f'#{generated_id}')
                        self.changes['persons_with_ref_added'] += 1
                        
                        self.change_log.append({
                            'type': 'ref_generated',
                            'text': text,
                            'ref': f'#{generated_id}'
                        })
        
        print(f"   ✓ Added @ref to {self.changes['persons_with_ref_added']} person names")
    
    def _generate_person_id(self, name: str) -> str:
        """Generate a person ID from a name."""
        # Clean and normalize the name
        name_clean = name.lower().strip()
        
        # Remove common Latin titles and epithets
        titles = ['sanctus', 'sancti', 'sanctum', 'divus', 'divi', 'beatus', 
                 'dominus', 'domini', 'magister', 'magistri', 'doctor', 'doctori']
        
        for title in titles:
            name_clean = name_clean.replace(title, '').strip()
        
        # Replace spaces with hyphens
        person_id = name_clean.replace(' ', '-')
        
        # Remove special characters
        person_id = ''.join(c for c in person_id if c.isalnum() or c == '-')
        
        return person_id if person_id else None
    
    def create_enhancement_report(self) -> str:
        """Create a detailed report of all enhancements made."""
        report = []
        report.append("\n" + "="*70)
        report.append("TEI ENHANCEMENT REPORT - PHASE 1")
        report.append("="*70)
        
        report.append("\n✅ AUTOMATED ENHANCEMENTS COMPLETED:")
        report.append("-"*40)
        
        total = sum(self.changes.values())
        
        if self.changes['parentheticals_marked'] > 0:
            report.append(f"• Marked {self.changes['parentheticals_marked']} parenthetical passages")
        
        if self.changes['persons_added_to_standoff'] > 0:
            report.append(f"• Generated {self.changes['persons_added_to_standoff']} standOff person entries")
        
        if self.changes['direct_speech_marked'] > 0:
            report.append(f"• Marked {self.changes['direct_speech_marked']} instances of direct speech")
        
        if self.changes['persons_with_ref_added'] > 0:
            report.append(f"• Added @ref to {self.changes['persons_with_ref_added']} person names")
        
        report.append(f"\n🎯 Total automated changes: {total}")
        
        # Add sample changes for review
        report.append("\n📋 SAMPLE CHANGES FOR REVIEW:")
        report.append("-"*40)
        
        # Show samples of each type
        for change_type in ['parenthetical', 'direct_speech', 'person_added']:
            samples = [c for c in self.change_log if c['type'] == change_type][:2]
            if samples:
                report.append(f"\n{change_type.replace('_', ' ').title()}:")
                for sample in samples:
                    if change_type == 'parenthetical':
                        report.append(f"  Line {sample['line_id']}: {sample['text']}")
                    elif change_type == 'direct_speech':
                        report.append(f"  Line {sample['line_id']}: {sample.get('speech', 'N/A')}")
                    elif change_type == 'person_added':
                        report.append(f"  Added: {sample['person_id']} → {sample['name']}")
        
        # Add lines needing manual review
        if self.speech_review_needed:
            report.append("\n⚠️ LINES NEEDING MANUAL REVIEW FOR SPEECH:")
            report.append("-"*40)
            for item in self.speech_review_needed[:3]:  # Show first 3
                report.append(f"  Line {item['line_id']}: Found '{item['verb']}' - check context")
        
        return "\n".join(report)
    
    def save_enhanced_xml(self):
        """Save the enhanced XML to file."""
        # Format the XML nicely
        self.indent_xml(self.root)
        
        # Write to file with the correct output filename
        self.tree.write(self.output_file, encoding='utf-8', xml_declaration=True)
        print(f"\n💾 Enhanced XML saved to: {self.output_file}")
    
    def save_change_log(self):
        """Save detailed change log for review."""
        # Include speech review items in the log
        log_data = {
            'changes': self.change_log,
            'speech_review_needed': self.speech_review_needed,
            'summary': self.changes
        }
        
        with open('enhancement_changes.json', 'w', encoding='utf-8') as f:
            json.dump(log_data, f, indent=2, ensure_ascii=False)
        print(f"📄 Detailed change log saved to: enhancement_changes.json")
    
    def indent_xml(self, elem, level=0):
        """Add pretty printing to XML."""
        indent = "\n" + "  " * level
        if len(elem):
            if not elem.text or not elem.text.strip():
                elem.text = indent + "  "
            if not elem.tail or not elem.tail.strip():
                elem.tail = indent
            for child in elem:
                self.indent_xml(child, level + 1)
            if not child.tail or not child.tail.strip():
                child.tail = indent
        else:
            if level and (not elem.tail or not elem.tail.strip()):
                elem.tail = indent
    
    def run_phase1_enhancements(self):
        """Run all Phase 1 automatic enhancements."""
        print("\n🚀 Starting TEI Enhancement Process - PHASE 1")
        print("="*50)
        
        # Run Phase 1 enhancements
        self.mark_parenthetical_text()
        self.mark_direct_speech_latin()  # Use Latin-specific detection
        self.add_missing_refs()
        self.generate_standoff_persons()
        
        # Generate report
        report = self.create_enhancement_report()
        print(report)
        
        # Save outputs
        self.save_enhanced_xml()
        self.save_change_log()
        
        # Save report to file
        with open('enhancement_report.txt', 'w', encoding='utf-8') as f:
            f.write(report)
        print(f"📄 Enhancement report saved to: enhancement_report.txt")


def main():
    """Run Phase 1 TEI enhancements."""
    
    # Check if input file exists
    import os
    if not os.path.exists('tei-final-1.xml'):
        print("❌ Error: tei-final-1.xml not found in current directory")
        return
    
    # Create enricher with CORRECT output filename
    enricher = TEIEnricher('tei-final-1.xml', 'tei-final-2.xml')
    
    # Run Phase 1 enhancements
    enricher.run_phase1_enhancements()
    
    print("\n✨ Phase 1 enhancement complete!")
    print("Output saved as: tei-final-2.xml")
    print("Review the change log in 'enhancement_changes.json' for details.")


if __name__ == "__main__":
    main()