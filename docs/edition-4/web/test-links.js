// Test Cross-Reference Links - Run in Console
console.log('🔗 Testing Cross-Reference Links');
console.log('=' .repeat(40));

// Test Roman numeral conversion
console.log('📊 Roman Numeral Conversion:');
const testRomanNumerals = ['I', 'II', 'III', 'IV', 'V'];
testRomanNumerals.forEach(roman => {
    const number = romanToNumber(roman);
    console.log(`  ${roman} → ${number}`);
});

// Test appearance parsing
console.log('\n📋 Appearance Parsing:');
if (personsData) {
    const personsWithAppearances = personsData.filter(p => 
        p.notes.some(n => n.type === 'appearances' && n.appearances && n.appearances.length > 0)
    );
    
    console.log(`Found ${personsWithAppearances.length} persons with appearances`);
    
    personsWithAppearances.slice(0, 3).forEach(person => {
        console.log(`\n${person.names.primary}:`);
        person.notes.forEach(note => {
            if (note.type === 'appearances' && note.appearances) {
                console.log(`  Raw: ${note.content}`);
                console.log(`  Parsed: ${note.appearances.length} references`);
                note.appearances.forEach(app => {
                    console.log(`    ${app.display} → ${app.link || 'NO LINK'}`);
                });
            }
        });
    });
}

// Test place occurrences
console.log('\n📍 Place Occurrences:');
if (placesData) {
    const placesWithOccurrences = placesData.filter(p => p.occurrences && p.occurrences.length > 0);
    console.log(`Found ${placesWithOccurrences.length} places with occurrences`);
    
    placesWithOccurrences.slice(0, 3).forEach(place => {
        console.log(`\n${place.names[0]?.value}:`);
        place.occurrences.forEach(occ => {
            const match = occ.poem.match(/([IVX]+),?\s*(\d+)/);
            if (match) {
                const romanNum = match[1];
                const poemNum = match[2];
                const link = `poem-${romanNum}.${poemNum}`;
                console.log(`  ${occ.poem} → ${link}`);
            } else {
                console.log(`  ${occ.poem} → NO CONVERSION`);
            }
        });
    });
}

// Test actual links in UI
console.log('\n🖱️  UI Link Test:');
const appearanceLinks = document.querySelectorAll('a[href*="index.html#poem-"]');
console.log(`Found ${appearanceLinks.length} appearance links in UI`);

if (appearanceLinks.length > 0) {
    console.log('Sample links:');
    Array.from(appearanceLinks).slice(0, 5).forEach((link, i) => {
        console.log(`  ${i + 1}. "${link.textContent.trim()}" → ${link.href}`);
    });
}

console.log('\n💡 Manual Test:');
console.log('1. Expand a person card (like Galeazzo Maria Sforza)');
console.log('2. Look for "Appearances:" section');
console.log('3. Click on a poem reference (e.g., "I,9")');
console.log('4. Should jump to index.html#poem-I.9');

console.log('\n🎯 Expected Links:');
console.log('- I,9 → index.html#poem-I.9');
console.log('- II,22 → index.html#poem-II.22');
console.log('- II,25 → index.html#poem-II.25');
console.log('- Praefatio → index.html#praefatio');