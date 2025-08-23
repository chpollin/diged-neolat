#!/usr/bin/env python3
"""
TEI-Compliant Scansion Pattern Integration Script
Properly integrates line-by-line scansion patterns from JSON into TEI XML.
Uses valid TEI attributes and structure for metrical declarations.
"""

import json
import os
from lxml import etree
import re
import sys

# Define namespaces
TEI_NS = "http://www.tei-c.org/ns/1.0"
XML_NS = "http://www.w3.org/XML/1998/namespace"
nsmap = {None: TEI_NS, 'xml': XML_NS}

def load_scansion_data(json_path):
    """Load and parse the JSON scansion data with meta and poems structure."""
    print(f"Loading JSON data from: {json_path}")
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Extract metadata and poems
    meta = data.get('meta', {})
    poems = data.get('poems', [])
    
    # Create lookup dictionary by poem ID with multiple key formats
    poem_data = {}
    meters_info = {}
    
    for poem in poems:
        poem_id = poem['id']
        
        # Store with multiple possible key formats for flexible matching
        # Handle praefatio
        if poem_id.lower() in ['praef', 'praefatio']:
            poem_data['praef'] = poem
            poem_data['praefatio'] = poem
            poem_data['Praefatio'] = poem
            poem_data['0'] = poem  # Book 0
        # Handle numbered poems (e.g., "1.1")
        elif '.' in poem_id:
            parts = poem_id.split('.')
            book = parts[0]
            num = parts[1]
            
            # Store with various formats
            poem_data[poem_id] = poem  # Original: "1.1"
            poem_data[f"I.{num}"] = poem  # Roman: "I.1"
            poem_data[f"I,{num}"] = poem  # Comma: "I,1"
            poem_data[f"{book}.{num}"] = poem  # Keep numeric too
        else:
            poem_data[poem_id] = poem
        
        # Collect meter information
        if 'meter' in poem:
            meter_abbr = poem['meter']
            if meter_abbr in meta.get('meters', {}):
                meters_info[meter_abbr] = meta['meters'][meter_abbr]
    
    print(f"Loaded scansion for {len(poems)} poems")
    print(f"Found {len(meters_info)} unique meters")
    
    return poem_data, meters_info, meta

def convert_notation(pattern, use_ascii=False):
    """Convert between Unicode and ASCII notation for metrical patterns.
    
    Args:
        pattern: The scansion pattern string
        use_ascii: If True, convert to ASCII notation; if False, keep Unicode
    
    Returns:
        Converted pattern string
    """
    if use_ascii:
        # Convert Unicode to ASCII
        conversions = {
            '—': '-',
            '∪': 'u',
            '×': 'x',
            '||': '||',  # Keep caesura marker
            '|': '|'      # Keep foot divider
        }
        result = pattern
        for unicode_char, ascii_char in conversions.items():
            result = result.replace(unicode_char, ascii_char)
        return result
    else:
        # Keep Unicode (or convert ASCII to Unicode if needed)
        return pattern

def create_metdecl_element(meters_info, notation, use_ascii=False):
    """Create a TEI-compliant metDecl element for the header."""
    metdecl = etree.Element("metDecl", nsmap=nsmap)
    metdecl.set(f"{{{XML_NS}}}id", "classical-meters")
    metdecl.set("type", "met")
    metdecl.set("pattern", "classical")
    
    # Add notation explanation as a paragraph
    if notation:
        p = etree.SubElement(metdecl, "p", nsmap=nsmap)
        notation_text = "Metrical notation: "
        notation_items = []
        for symbol, meaning in notation.items():
            if use_ascii:
                # Convert symbols for ASCII mode
                if symbol == '—':
                    notation_items.append(f"- = {meaning}")
                elif symbol == '∪':
                    notation_items.append(f"u = {meaning}")
                elif symbol == '×':
                    notation_items.append(f"x = {meaning}")
                else:
                    notation_items.append(f"{symbol} = {meaning}")
            else:
                notation_items.append(f"{symbol} = {meaning}")
        p.text = notation_text + "; ".join(notation_items) + "."
    
    # Add meter symbols with TEI-compliant structure
    for abbr in sorted(meters_info.keys()):
        meter_info = meters_info[abbr]
        metsym = etree.SubElement(metdecl, "metSym", nsmap=nsmap)
        metsym.set("value", abbr)
        
        if isinstance(meter_info, dict):
            # Create the text content for the metSym
            meter_name = meter_info.get('name', abbr)
            
            # Build description text
            description_parts = [meter_name]
            
            # Add pattern information as text, not attributes
            if 'pattern' in meter_info:
                pattern = meter_info['pattern']
                if isinstance(pattern, list):
                    # For elegiac couplet with hex and pent patterns
                    if len(pattern) == 2:
                        hex_pattern = convert_notation(pattern[0], use_ascii)
                        pent_pattern = convert_notation(pattern[1], use_ascii)
                        description_parts.append(f"Hexameter: {hex_pattern}")
                        description_parts.append(f"Pentameter: {pent_pattern}")
                    else:
                        # For stanzaic patterns like Sapphic
                        for i, line_pattern in enumerate(pattern, 1):
                            conv_pattern = convert_notation(line_pattern, use_ascii)
                            if i < len(pattern):
                                description_parts.append(f"Lines {i}: {conv_pattern}")
                            else:
                                description_parts.append(f"Adonic: {conv_pattern}")
                else:
                    conv_pattern = convert_notation(str(pattern), use_ascii)
                    description_parts.append(f"Pattern: {conv_pattern}")
            
            # Add caesura info
            if 'caesura' in meter_info:
                description_parts.append(f"Caesura: {meter_info['caesura']}")
            
            # Add notes
            if 'notes' in meter_info:
                description_parts.append(f"Note: {meter_info['notes']}")
            
            # Set the text content
            metsym.text = ". ".join(description_parts) + "."
        else:
            metsym.text = str(meter_info)
    
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
        filedesc = teiheader.find('.//{%s}fileDesc' % TEI_NS)
        if filedesc is not None:
            encodingdesc = etree.Element("encodingDesc", nsmap=nsmap)
            filedesc.addnext(encodingdesc)
        else:
            encodingdesc = etree.SubElement(teiheader, "encodingDesc", nsmap=nsmap)
    
    # Remove any existing metDecl with same ID
    for existing in encodingdesc.findall('.//{%s}metDecl' % TEI_NS):
        if existing.get(f"{{{XML_NS}}}id") == "classical-meters":
            encodingdesc.remove(existing)
    
    # Add the new metDecl
    encodingdesc.insert(0, metdecl)
    print("Added metDecl to header")
    
    return True

def find_poem_div(root, poem_id):
    """Find the poem div element by various ID formats."""
    # Generate possible XML IDs based on the poem_id
    possible_xmlids = []
    
    # Handle praefatio
    if poem_id.lower() in ['praef', 'praefatio', '0']:
        possible_xmlids = ['poem-praefatio', 'praefatio', 'poem-0']
    # Handle Book I poems
    elif poem_id.startswith('1.'):
        num = poem_id.split('.')[1]
        possible_xmlids = [
            f'poem-I.{num}',
            f'poem-1.{num}',
            f'poem-I,{num}'
        ]
    elif poem_id.startswith('I.') or poem_id.startswith('I,'):
        num = re.search(r'\d+', poem_id).group()
        possible_xmlids = [
            f'poem-I.{num}',
            f'poem-I,{num}',
            f'poem-1.{num}'
        ]
    
    # Try to find by xml:id
    for xmlid in possible_xmlids:
        xpath = f'.//tei:div[@xml:id="{xmlid}"][@type="poem"]'
        poem_div = root.find(xpath, namespaces={'tei': TEI_NS})
        if poem_div is not None:
            return poem_div
    
    # Try to find by @n attribute
    possible_n_values = []
    if poem_id.startswith('1.'):
        num = poem_id.split('.')[1]
        possible_n_values = [num, f'I.{num}', f'I,{num}', f'1.{num}']
    elif poem_id in ['praef', 'praefatio']:
        possible_n_values = ['praefatio', 'Praefatio', '0']
    
    for n_val in possible_n_values:
        xpath = f'.//tei:div[@n="{n_val}"][@type="poem"]'
        poem_div = root.find(xpath, namespaces={'tei': TEI_NS})
        if poem_div is not None:
            return poem_div
    
    return None

def add_scansion_to_poem(poem_div, poem_info, use_ascii=False):
    """Add scansion patterns to a poem's lines with correct patterns."""
    if 'scansion' not in poem_info:
        return False
    
    scansion_patterns = poem_info['scansion']
    
    # Find all line elements in the poem
    lines = poem_div.findall('.//{%s}l' % TEI_NS)
    
    if len(lines) != len(scansion_patterns):
        print(f"  Warning: Line count mismatch. XML has {len(lines)} lines, JSON has {len(scansion_patterns)} patterns")
        # Continue with the minimum of both
        min_count = min(len(lines), len(scansion_patterns))
    else:
        min_count = len(lines)
    
    # Add scansion to each line
    patterns_added = 0
    for i in range(min_count):
        line = lines[i]
        pattern = scansion_patterns[i]
        
        # Convert notation if needed
        converted_pattern = convert_notation(pattern, use_ascii)
        
        # Add the scansion pattern as @met attribute
        line.set("met", converted_pattern)
        
        # Optionally add @real attribute with the original Unicode pattern
        # This preserves the original while displaying the converted
        if use_ascii and pattern != converted_pattern:
            line.set("real", pattern)
        
        patterns_added += 1
    
    return patterns_added > 0

def add_poem_metadata(poem_div, poem_info):
    """Add metadata note to poem."""
    # Find insertion point (after head elements)
    heads = poem_div.findall('.//{%s}head' % TEI_NS)
    if heads:
        insert_index = poem_div.index(heads[-1]) + 1
    else:
        insert_index = 0
    
    # Remove any existing metrical-analysis note
    for note in poem_div.findall('.//{%s}note[@type="metrical-analysis"]' % TEI_NS):
        poem_div.remove(note)
    
    # Create new note
    note = etree.Element("note", nsmap=nsmap)
    note.set("type", "metrical-analysis")
    note.set("resp", "#scansion-data")
    
    # Add metadata elements
    
    # Line count
    if 'lines' in poem_info:
        measure = etree.SubElement(note, "measure", nsmap=nsmap)
        measure.set("type", "lines")
        measure.set("quantity", str(poem_info['lines']))
    
    # Stanza information
    if 'stanzas' in poem_info:
        measure = etree.SubElement(note, "measure", nsmap=nsmap)
        measure.set("type", "stanzas")
        measure.set("quantity", str(poem_info['stanzas']))
    
    # Meter type
    if 'meter' in poem_info:
        seg = etree.SubElement(note, "seg", nsmap=nsmap)
        seg.set("type", "meter")
        seg.text = poem_info['meter']
    
    # Dedication
    if 'dedication' in poem_info:
        seg = etree.SubElement(note, "seg", nsmap=nsmap)
        seg.set("type", "dedication")
        seg.text = poem_info['dedication']
    
    # Themes
    if 'themes' in poem_info and poem_info['themes']:
        seg = etree.SubElement(note, "seg", nsmap=nsmap)
        seg.set("type", "themes")
        if isinstance(poem_info['themes'], list):
            seg.text = "; ".join(poem_info['themes'])
        else:
            seg.text = str(poem_info['themes'])
    
    # Insert the note
    poem_div.insert(insert_index, note)
    
    return True

def add_lg_attributes(poem_div, poem_info, meters_info, use_ascii=False):
    """Add metrical attributes to lg (line group) elements."""
    if 'meter' not in poem_info:
        return False
    
    meter_abbr = poem_info['meter']
    
    # Get meter info
    meter_data = meters_info.get(meter_abbr, {})
    
    # Find all lg elements
    lgs = poem_div.findall('.//{%s}lg' % TEI_NS)
    
    for lg in lgs:
        # Set type to meter abbreviation (lowercase for TEI convention)
        lg.set("type", meter_abbr.lower())
        
        # Add met attribute with simplified pattern
        if isinstance(meter_data, dict) and 'pattern' in meter_data:
            pattern = meter_data['pattern']
            if isinstance(pattern, list):
                # For elegiac couplets, use a simplified representation
                if meter_abbr == "EC":
                    # Standard elegiac pattern notation
                    simple_pattern = "+--+--+--+--+--+x | +--+--+ || +--+--+"
                    lg.set("met", convert_notation(simple_pattern, use_ascii))
                elif meter_abbr == "SAPH":
                    # Sapphic pattern
                    simple_pattern = "-u--|-uu-u-x"
                    lg.set("met", convert_notation(simple_pattern, use_ascii))
            else:
                lg.set("met", convert_notation(str(pattern), use_ascii))
        
        # Add rhyme scheme if applicable (usually "aa" for elegiac couplets)
        if meter_abbr == "EC":
            lg.set("rhyme", "aa")
    
    return True

def process_poems(root, poem_data, meters_info, use_ascii=False):
    """Process all poems in the TEI document."""
    poems_updated = 0
    poems_not_found = []
    poems_processed = set()  # Track processed poems to avoid duplicates
    
    # First, try to match poems by iterating through the XML
    all_poem_divs = root.findall('.//tei:div[@type="poem"]', namespaces={'tei': TEI_NS})
    
    for poem_div in all_poem_divs:
        poem_xmlid = poem_div.get(f"{{{XML_NS}}}id", "")
        poem_n = poem_div.get("n", "")
        
        # Try to find matching JSON data
        poem_info = None
        matched_key = None
        
        # Check praefatio
        if 'praefatio' in poem_xmlid.lower() or 'praef' in poem_xmlid.lower():
            for key in ['praef', 'praefatio', 'Praefatio', '0']:
                if key in poem_data:
                    poem_info = poem_data[key]
                    matched_key = key
                    break
        
        # Check numbered poems
        if not poem_info:
            # Extract poem number from xml:id (e.g., "poem-I.1" -> "1")
            match = re.search(r'poem-[IV]*[,.]?(\d+)', poem_xmlid)
            if match:
                num = match.group(1)
                # Try various key formats
                for key in [f'1.{num}', f'I.{num}', f'I,{num}']:
                    if key in poem_data:
                        poem_info = poem_data[key]
                        matched_key = key
                        break
        
        # Also try using @n attribute
        if not poem_info and poem_n:
            if poem_n in poem_data:
                poem_info = poem_data[poem_n]
                matched_key = poem_n
        
        if poem_info and matched_key not in poems_processed:
            print(f"Processing poem {poem_xmlid or poem_n} (matched as {matched_key})...")
            
            # Add scansion patterns to lines
            if add_scansion_to_poem(poem_div, poem_info, use_ascii):
                print(f"  Added scansion to lines")
            
            # Add metadata note
            if add_poem_metadata(poem_div, poem_info):
                print(f"  Added metadata note")
            
            # Add lg attributes
            if add_lg_attributes(poem_div, poem_info, meters_info, use_ascii):
                print(f"  Added lg attributes")
            
            poems_updated += 1
            poems_processed.add(matched_key)
        elif not poem_info:
            poems_not_found.append(poem_xmlid or poem_n)
    
    print(f"\n" + "="*50)
    print(f"Processed {poems_updated} poems successfully")
    
    if poems_not_found:
        print(f"\nCould not find JSON data for {len(poems_not_found)} poems:")
        for pid in poems_not_found[:5]:
            print(f"  - {pid}")
        if len(poems_not_found) > 5:
            print(f"  ... and {len(poems_not_found) - 5} more")
    
    return poems_updated

def validate_file_paths(json_path, input_xml_path):
    """Validate that input files exist."""
    if not os.path.exists(json_path):
        print(f"Error: JSON file not found at {json_path}")
        return False
    
    if not os.path.exists(input_xml_path):
        print(f"Error: Input XML file not found at {input_xml_path}")
        return False
    
    return True

def main():
    """Main execution function."""
    # Configuration
    USE_ASCII_NOTATION = True  # Set to False to use Unicode notation (—, ∪, ×)
    
    # File paths - ADJUST THESE FOR YOUR SYSTEM
    base_path = r"C:\Users\Chrisi\Documents\GitHub\diged-neolat\docs\edition-4\web"
    
    json_filename = "metrical-summary.json"  # Your JSON file with scansion data
    input_xml_filename = "tei-final-3-2.xml"  # Your current TEI file
    output_xml_filename = "tei-final-3-3.xml"  # Output file name
    
    # Construct full paths
    json_path = os.path.join(base_path, "llm-extracted-data", json_filename)
    input_xml_path = os.path.join(base_path, input_xml_filename)
    output_xml_path = os.path.join(base_path, output_xml_filename)
    
    # Header
    print("=" * 60)
    print("TEI SCANSION PATTERN INTEGRATION")
    print("=" * 60)
    print(f"Notation mode: {'ASCII' if USE_ASCII_NOTATION else 'Unicode'}")
    print(f"JSON source: {json_filename}")
    print(f"TEI input: {input_xml_filename}")
    print(f"TEI output: {output_xml_filename}")
    print("=" * 60)
    
    # Validate files
    if not validate_file_paths(json_path, input_xml_path):
        sys.exit(1)
    
    # Load JSON data
    print("\nLoading scansion data...")
    poem_data, meters_info, meta = load_scansion_data(json_path)
    
    # Parse XML
    print(f"\nParsing TEI XML...")
    parser = etree.XMLParser(remove_blank_text=False, encoding='UTF-8')
    tree = etree.parse(input_xml_path, parser)
    root = tree.getroot()
    
    # Add metDecl to header
    print("\nAdding metrical declaration to TEI header...")
    notation = meta.get('notation', {})
    metdecl = create_metdecl_element(meters_info, notation, USE_ASCII_NOTATION)
    add_metdecl_to_header(root, metdecl)
    
    # Process poems
    print("\nProcessing poems and adding scansion patterns...")
    print("-" * 50)
    poems_updated = process_poems(root, poem_data, meters_info, USE_ASCII_NOTATION)
    
    # Write output
    print(f"\nWriting enhanced TEI to: {output_xml_path}")
    tree.write(
        output_xml_path,
        encoding='UTF-8',
        xml_declaration=True,
        pretty_print=True,
        method='xml'
    )
    
    # Final report
    print("\n" + "=" * 60)
    print("INTEGRATION COMPLETE")
    print("=" * 60)
    print(f"✓ Processed {poems_updated} poems")
    print(f"✓ Added metrical notation to header")
    print(f"✓ Added line-by-line scansion patterns")
    print(f"✓ Added poem metadata and themes")
    print(f"✓ Output saved to: {output_xml_filename}")
    
    # Provide example of what was added
    print("\nExample enhancements:")
    print("  - Each <l> now has @met with scansion pattern")
    print("  - Each <lg> has @type for meter")
    print("  - Metadata notes added after <head> elements")
    print("  - <metDecl> in header defines notation system")
    print("=" * 60)

if __name__ == "__main__":
    main()