import json
import sys

# Define the input and output filenames
input_filename = 'metrical-summary-gemini.json'
output_filename = 'metrical-summary-gemini-fixed.json'

print(f"--- Starting JSON repair script (v5 - Object Extraction) ---")

# --- Step 1: Read the entire file content ---
try:
    with open(input_filename, 'r', encoding='utf-8') as f:
        full_text = f.read()
    print(f"✅ Successfully read file: '{input_filename}'")
except FileNotFoundError:
    print(f"❌ ERROR: The file '{input_filename}' was not found.")
    sys.exit()

# --- Step 2: Manually find and parse each JSON object ---
print("--- Scanning text and extracting all valid JSON objects ---")
all_objects = []
position = 0
while position < len(full_text):
    # Find the start of the next object
    start_brace = full_text.find('{', position)
    if start_brace == -1:
        # No more objects found
        break

    # Find the matching end brace for this object
    # This requires counting open/close braces to handle nested objects
    level = 1
    end_brace = start_brace + 1
    while end_brace < len(full_text):
        if full_text[end_brace] == '{':
            level += 1
        elif full_text[end_brace] == '}':
            level -= 1
        
        if level == 0:
            # We found the matching closing brace
            break
        end_brace += 1
    
    if level != 0:
        # If we reached the end of the file without finding the match
        print("⚠️ Warning: Could not find a matching closing brace for an object starting at position", start_brace)
        break

    # Extract the object's text
    object_text = full_text[start_brace:end_brace + 1]

    # Try to parse this single object
    try:
        obj = json.loads(object_text)
        all_objects.append(obj)
    except json.JSONDecodeError as e:
        print(f"⚠️ Warning: Found a malformed object at position {start_brace}. Skipping it. Error: {e}")
    
    # Move the search position to after the object we just processed
    position = end_brace + 1

print(f"✅ Extraction complete. Found and successfully parsed {len(all_objects)} objects.")

# --- Step 3: Write the clean data to a new file ---
if not all_objects:
    print("❌ ERROR: No valid objects were extracted. Output file will not be created.")
    sys.exit()
    
print(f"\n--- Saving corrected data to new file: '{output_filename}' ---")
try:
    with open(output_filename, 'w', encoding='utf-8') as f:
        # Save the list of all extracted objects as a single, valid JSON array
        json.dump(all_objects, f, indent=2, ensure_ascii=False)
    print(f"✅ All done! The valid JSON has been saved successfully.")
except IOError as e:
    print(f"❌ ERROR: Could not write the output file. Details: {e}")