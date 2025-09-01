"""
enhance_tei_full.py - Full TEI enhancement with proper apparatus encoding
"""

from pathlib import Path
from docx2python import docx2python
import re
import xml.etree.ElementTree as ET

# Setup paths
script_dir = Path(__file__).parent
docx_path = script_dir.parent.parent / "edition-1" / "data" / "Edition.docx"
tei_input = script_dir / "tei-final-3-1.xml"
tei_output = script_dir / "tei-final-3-2.xml"

print("Full TEI Enhancement with Critical Apparatus\n")
print("=" * 50)

# Extract from DOCX
print("\n1. Extracting from DOCX...")
with docx2python(docx_path, html=True) as doc:
    text = doc.text
    
    # Parse all footnotes
    fn_dict = {}
    total_footnotes = 0
    
    for item in doc.footnotes[0]:
        if isinstance(item, list):
            for subitem in item:
                if isinstance(subitem, list) and len(subitem) > 0:
                    fn_text = subitem[0]
                    fn_match = re.match(r'footnote(\d+)\)', fn_text)
                    if fn_match:
                        fn_num = fn_match.group(1)
                        clean_text = re.sub(r'<[^>]+>', '', fn_text)
                        clean_text = re.sub(r'footnote\d+\)\s*', '', clean_text).strip()
                        parts = clean_text.split()
                        if parts:
                            variant = parts[0]
                            witness = parts[1] if len(parts) > 1 else "C"
                            fn_dict[f"footnote{fn_num}"] = {
                                'variant': variant,
                                'witness': witness
                            }
                            total_footnotes += 1
    
    print(f"   Found {total_footnotes} footnotes")
    
    # Find all apparatus entries
    apparatus_entries = []
    pattern = r'(\w+)(</span>)?----footnote(\d+)----'
    
    for match in re.finditer(pattern, text):
        lemma = match.group(1)
        fn_num = match.group(3)
        fn_key = f"footnote{fn_num}"
        
        if fn_key in fn_dict:
            apparatus_entries.append({
                'lemma': lemma,
                'variant': fn_dict[fn_key]['variant'],
                'witness': fn_dict[fn_key]['witness']
            })
    
    print(f"   Matched {len(apparatus_entries)} apparatus entries")

# Enhance TEI
print("\n2. Enhancing TEI XML...")

# Register namespace
ET.register_namespace('', 'http://www.tei-c.org/ns/1.0')
ns = {'tei': 'http://www.tei-c.org/ns/1.0'}

# Load TEI
tree = ET.parse(tei_input)
root = tree.getroot()

# Add witness list to header
source_desc = root.find('.//tei:sourceDesc', ns)
if source_desc is not None:
    list_wit = source_desc.find('.//tei:listWit', ns)
    if list_wit is None:
        list_wit = ET.SubElement(source_desc, 'listWit')
        
        witness_m = ET.SubElement(list_wit, 'witness')
        witness_m.set('{http://www.w3.org/XML/1998/namespace}id', 'M')
        witness_m.text = 'Madrid, Biblioteca Nacional, Mss. 6028 (base text)'
        
        witness_c = ET.SubElement(list_wit, 'witness')
        witness_c.set('{http://www.w3.org/XML/1998/namespace}id', 'C')
        witness_c.text = 'Manuscript C (corrections and variants)'
        
        print("   Added witness list to header")

# Process each apparatus entry
print("\n3. Processing apparatus entries...")
enhanced_lines = 0
processed_lemmas = set()

for entry in apparatus_entries:
    lemma = entry['lemma']
    
    # Skip if already processed
    if lemma in processed_lemmas:
        continue
    processed_lemmas.add(lemma)
    
    # Find all lines in the TEI
    lines = root.findall('.//tei:l', ns)
    
    for line in lines:
        line_text = ''.join(line.itertext())
        
        # Check if this line contains the lemma
        if re.search(r'\b' + re.escape(lemma) + r'\b', line_text, re.IGNORECASE):
            # Store line attributes
            line_attrs = line.attrib.copy()
            
            # Split line into words
            words = line_text.split()
            
            # Clear line and rebuild with apparatus
            line.clear()
            line.attrib.update(line_attrs)
            
            # Process each word
            current_text = ""
            for word in words:
                # Check if this word matches the lemma
                word_clean = re.sub(r'[,;.!?]', '', word)
                
                if word_clean.lower() == lemma.lower():
                    # Add any accumulated text first
                    if current_text:
                        if line.text:
                            line.text += current_text
                        else:
                            line.text = current_text
                        current_text = ""
                    
                    # Create apparatus entry
                    app = ET.SubElement(line, 'app')
                    
                    # Add lemma
                    lem = ET.SubElement(app, 'lem')
                    lem.set('wit', '#M')
                    lem.text = word_clean
                    
                    # Add reading
                    rdg = ET.SubElement(app, 'rdg')
                    rdg.set('wit', f"#{entry['witness']}")
                    rdg.text = entry['variant']
                    
                    # Handle punctuation
                    punct = word[len(word_clean):]
                    if punct:
                        app.tail = punct + " "
                    else:
                        app.tail = " "
                    
                    enhanced_lines += 1
                    print(f"   {lemma} -> {entry['variant']} ({entry['witness']})")
                else:
                    current_text += word + " "
            
            # Add any remaining text
            if current_text:
                if len(list(line)) > 0:  # Has child elements
                    last_elem = list(line)[-1]
                    if last_elem.tail:
                        last_elem.tail += current_text.rstrip()
                    else:
                        last_elem.tail = current_text.rstrip()
                else:
                    if line.text:
                        line.text += current_text.rstrip()
                    else:
                        line.text = current_text.rstrip()
            
            break  # Only process first occurrence per lemma

# Save enhanced TEI
tree.write(tei_output, encoding='utf-8', xml_declaration=True, method='xml')

print("\n" + "=" * 50)
print(f"\n✓ Enhancement complete!")
print(f"  - Processed {len(apparatus_entries)} apparatus entries")
print(f"  - Enhanced {enhanced_lines} lines in TEI")
print(f"  - Saved to: {tei_output.name}")
print(f"\nThe enhanced TEI now includes proper <app> and <rdg> elements")
print(f"for critical apparatus from manuscript C.")