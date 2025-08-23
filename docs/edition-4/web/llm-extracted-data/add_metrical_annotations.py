#!/usr/bin/env python3
"""
Enhanced TEI Metrical Annotation Integration Script
Adds detailed metrical scansion patterns from enriched JSON to TEI XML.
Includes poem-level and line-level metrical patterns.
"""

import json
import os
from lxml import etree
from collections import defaultdict
import re
import sys

# Define namespaces
TEI_NS = "http://www.tei-c.org/ns/1.0"
XML_NS = "http://www.w3.org/XML/1998/namespace"
nsmap = {None: TEI_NS, 'xml': XML_NS}

def load_json_data(json_path):
    """Load and parse the enhanced JSON metrical data."""
    print(f"Loading JSON data from: {json_path}")
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Create lookup dictionary by poem ID
    poem_data = {}
    meters_dict = {}  # meter_abbr -> full meter name
    
    for entry in data:
        poem_id = entry['poem']
        poem_data[poem_id] = entry
        
        # Collect unique meters with their abbreviations
        if 'meter_abbr' in entry and 'meter' in entry:
            if entry['meter'] != 'N/A':
                meters_dict[entry['meter_abbr']] = entry['meter']
    
    print(f"Loaded data for {len(poem_data)} poems")
    print(f"Found {len(meters_dict)} unique meters")
    
    return poem_data, meters_dict

def format_meter_pattern(pattern):
    """Format meter pattern for TEI @met attribute."""
    if isinstance(pattern, list):
        # For stanzaic patterns like Sapphic
        return ' / '.join(pattern)
    return pattern

def create_metdecl_element(meters_dict):
    """Create the metDecl element for the TEI header with abbreviations."""
    metdecl = etree.Element("metDecl", nsmap=nsmap)
    metdecl.set(f"{{{XML_NS}}}id", "classical-meters")
    metdecl.set("type", "met")
    metdecl.set("pattern", "classical")
    
    # Add comment explaining the notation
    comment = etree.Comment("""
        Metrical notation: 
        - = long syllable (longum)
        u = short syllable (breve)
        D = dactyl (-uu) or spondee (two longs)
        X = anceps (long or short)
        | = foot boundary
        || = caesura
        / = line break in stanza patterns
    """)
    metdecl.addprevious(comment)
    
    # Sort by abbreviation for consistent output
    for abbr in sorted(meters_dict.keys()):
        meter_name = meters_dict[abbr]
        metsym = etree.SubElement(metdecl, "metSym", nsmap=nsmap)
        metsym.set("value", abbr)
        metsym.text = meter_name
    
    return metdecl

def add_metdecl_to_header(root, metdecl):
    """Add or update metDecl in the TEI header's encodingDesc."""
    teiheader = root.find('.//{%s}teiHeader' % TEI_NS)
    if teiheader is None:
        print("Warning: No teiHeader found!")
        return False
    
    # Find or create encodingDesc
    encodingdesc = teiheader.find('.//{%s}encodingDesc' % TEI_NS)
    if encodingdesc is None:
        print("Creating encodingDesc element...")
        # Find where to insert encodingDesc (after fileDesc)
        filedesc = teiheader.find('.//{%s}fileDesc' % TEI_NS)
        if filedesc is not None:
            encodingdesc = etree.Element("encodingDesc", nsmap=nsmap)
            filedesc.addnext(encodingdesc)
        else:
            print("Warning: No fileDesc found, adding encodingDesc at end of header")
            encodingdesc = etree.SubElement(teiheader, "encodingDesc", nsmap=nsmap)
    
    # Check if metDecl already exists
    existing_metdecl = None
    for elem in encodingdesc.findall('.//{%s}metDecl' % TEI_NS):
        if elem.get(f"{{{XML_NS}}}id") == "classical-meters":
            existing_metdecl = elem
            break
    
    if existing_metdecl is not None:
        print("Replacing existing metDecl...")
        # Also remove any previous comment
        prev = existing_metdecl.getprevious()
        if prev is not None and isinstance(prev, etree._Comment):
            prev.getparent().remove(prev)
        encodingdesc.replace(existing_metdecl, metdecl)
    else:
        print("Adding new metDecl...")
        encodingdesc.insert(0, metdecl)  # Insert at beginning of encodingDesc
    
    return True

def normalize_poem_id(poem_id):
    """Normalize poem ID for matching (e.g., 'I,21' -> 'I.21')."""
    return poem_id.replace(',', '.')

def add_poem_annotations(root, poem_data):
    """Add detailed metrical annotations to each poem in the TEI."""
    poems_updated = 0
    poems_not_found = []
    
    # Find all poem divs
    for poem_div in root.xpath('//tei:div[@type="poem"]', namespaces={'tei': TEI_NS}):
        poem_n = poem_div.get('n')
        poem_xml_id = poem_div.get(f"{{{XML_NS}}}id")
        
        # Try to find matching data in JSON
        json_key = None
        poem_info = None
        
        # Handle Praefatio specially
        if poem_xml_id == "poem-praefatio" or poem_n == "praefatio":
            if "Praefatio" in poem_data:
                json_key = "Praefatio"
                poem_info = poem_data["Praefatio"]
        
        # Try different ID formats for numbered poems
        if not poem_info and poem_xml_id:
            # Extract book and poem number from xml:id (e.g., "poem-I.21" -> "I,21")
            match = re.search(r'poem-([IVX]+)\.(\d+)', poem_xml_id)
            if match:
                # Try comma format first
                potential_key = f"{match.group(1)},{match.group(2)}"
                if potential_key in poem_data:
                    json_key = potential_key
                    poem_info = poem_data[potential_key]
                else:
                    # Try period format
                    potential_key = f"{match.group(1)}.{match.group(2)}"
                    if potential_key in poem_data:
                        json_key = potential_key
                        poem_info = poem_data[potential_key]
        
        if not poem_info:
            poems_not_found.append(poem_xml_id or poem_n)
            continue
        
        print(f"Processing poem {json_key}...")
        
        # 1. Add metrical analysis note after heads
        heads = poem_div.findall('.//{%s}head' % TEI_NS)
        insert_position = len(heads)  # Insert after all head elements
        
        # Check if note already exists and remove it
        existing_note = poem_div.find('.//{%s}note[@type="metrical-analysis"]' % TEI_NS)
        if existing_note is not None:
            poem_div.remove(existing_note)
        
        # Create new note element with enhanced data
        note = etree.Element("note", nsmap=nsmap)
        note.set("type", "metrical-analysis")
        note.set("resp", "#llm-gemini")
        
        # Add measures for numerical data
        if 'lines' in poem_info:
            measure = etree.SubElement(note, "measure", nsmap=nsmap)
            measure.set("type", "lines")
            measure.set("quantity", str(poem_info['lines']))
        
        if 'estimated_flawless_pct' in poem_info:
            measure = etree.SubElement(note, "measure", nsmap=nsmap)
            measure.set("type", "flawless-pct")
            measure.set("quantity", str(poem_info['estimated_flawless_pct']))
            measure.set("unit", "percent")
        
        if 'rhyme_rate_per_100l' in poem_info:
            measure = etree.SubElement(note, "measure", nsmap=nsmap)
            measure.set("type", "rhyme-rate")
            measure.set("quantity", str(poem_info['rhyme_rate_per_100l']))
            measure.set("unit", "per-100-lines")
        
        # Add stanza information if present
        if 'stanza_lines' in poem_info and poem_info['stanza_lines']:
            measure = etree.SubElement(note, "measure", nsmap=nsmap)
            measure.set("type", "stanza-lines")
            measure.set("quantity", str(poem_info['stanza_lines']))
        
        # Add key features if present
        if 'key_features' in poem_info and poem_info['key_features']:
            features = poem_info['key_features']
            if isinstance(features, list):
                features_text = '; '.join(features)
            else:
                features_text = str(features)
            
            seg = etree.SubElement(note, "seg", nsmap=nsmap)
            seg.set("type", "key-features")
            seg.text = features_text
        
        # Insert note after heads
        poem_div.insert(insert_position, note)
        
        # 2. Add meter pattern to lg elements
        if 'meter_pattern' in poem_info and poem_info['meter_pattern']:
            pattern = format_meter_pattern(poem_info['meter_pattern'])
            for lg in poem_div.findall('.//{%s}lg' % TEI_NS):
                # Use the full pattern as @met (TEI standard)
                lg.set("met", pattern)
                # Optionally add the abbreviation as @subtype
                if 'meter_abbr' in poem_info:
                    lg.set("subtype", poem_info['meter_abbr'])
        
        # 3. Add line-level patterns if available
        if 'line_patterns' in poem_info and poem_info['line_patterns']:
            lines = poem_div.findall('.//{%s}l' % TEI_NS)
            
            for line_data in poem_info['line_patterns']:
                line_num = line_data['n']
                line_pattern = line_data['pattern']
                
                # Find the corresponding line element
                for line_elem in lines:
                    line_n = line_elem.get('n')
                    if line_n and int(line_n) == line_num:
                        # Add the specific line pattern
                        line_elem.set("met", line_pattern)
                        
                        # Add rhyme if present (for future use)
                        if line_data.get('rhyme'):
                            line_elem.set("rhyme", line_data['rhyme'])
                        break
        
        # 4. Add rhyme scheme to lg if present
        if 'rhyme_scheme' in poem_info and poem_info['rhyme_scheme']:
            for lg in poem_div.findall('.//{%s}lg' % TEI_NS):
                lg.set("rhyme", poem_info['rhyme_scheme'])
        
        poems_updated += 1
    
    print(f"\nUpdated {poems_updated} poems")
    if poems_not_found:
        print(f"Could not find JSON data for {len(poems_not_found)} poems:")
        for pid in poems_not_found[:10]:  # Show first 10
            print(f"  - {pid}")
        if len(poems_not_found) > 10:
            print(f"  ... and {len(poems_not_found) - 10} more")
    
    return poems_updated

def main():
    # Define paths
    base_path = r"C:\Users\Chrisi\Documents\GitHub\diged-neolat\docs\edition-4\web"
    
    # Check for both possible JSON filenames
    json_filename = "metrical-enhanced.json"  # New enhanced file
    json_path = os.path.join(base_path, "llm-extracted-data", json_filename)
    
    # If enhanced file doesn't exist, try the original
    if not os.path.exists(json_path):
        json_filename = "metrical-summary-gemini.json"
        json_path = os.path.join(base_path, "llm-extracted-data", json_filename)
    
    input_xml_path = os.path.join(base_path, "tei-final-3-2.xml")
    output_xml_path = os.path.join(base_path, "tei-final-3-3.xml")
    
    # Check if files exist
    if not os.path.exists(json_path):
        print(f"Error: JSON file not found at {json_path}")
        print("Please ensure you have either 'metrical-enhanced.json' or 'metrical-summary-gemini.json'")
        sys.exit(1)
    
    if not os.path.exists(input_xml_path):
        print(f"Error: Input XML file not found at {input_xml_path}")
        sys.exit(1)
    
    print("=" * 60)
    print("Enhanced TEI Metrical Annotation Integration")
    print("=" * 60)
    print(f"Using JSON file: {json_filename}")
    
    # Load JSON data
    poem_data, meters_dict = load_json_data(json_path)
    
    # Parse XML
    print(f"\nParsing TEI XML from: {input_xml_path}")
    parser = etree.XMLParser(remove_blank_text=False)
    tree = etree.parse(input_xml_path, parser)
    root = tree.getroot()
    
    # Create and add metDecl to header
    print("\nCreating metDecl element with meter abbreviations...")
    metdecl = create_metdecl_element(meters_dict)
    if add_metdecl_to_header(root, metdecl):
        print("Successfully added metDecl to header")
    else:
        print("Warning: Could not add metDecl to header")
    
    # Add annotations to poems
    print("\nAdding detailed metrical annotations to poems...")
    poems_updated = add_poem_annotations(root, poem_data)
    
    # Write output with proper formatting
    print(f"\nWriting output to: {output_xml_path}")
    tree.write(output_xml_path, 
               encoding='UTF-8', 
               xml_declaration=True, 
               pretty_print=True)
    
    print("\n" + "=" * 60)
    print(f"SUCCESS: Processed {poems_updated} poems")
    print("\nEnhancements added:")
    print("- Meter abbreviations in <metDecl>")
    print("- Full meter patterns on <lg> elements")
    print("- Line-level scansion on <l> elements")
    print("- Enhanced metrical analysis notes")
    print(f"\nOutput written to: {output_xml_path}")
    print("=" * 60)

if __name__ == "__main__":
    main()