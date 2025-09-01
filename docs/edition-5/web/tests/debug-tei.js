// Debug TEI Structure - Run in Console
console.log('🔍 TEI Structure Debug');
console.log('=' .repeat(40));

if (teiData) {
    // Check person elements structure
    const persons = teiData.querySelectorAll('standOff listPerson person');
    console.log(`📊 Found ${persons.length} person elements`);
    
    // Sample first few persons to understand structure
    console.log('\n📋 Sample Person Structures:');
    for (let i = 0; i < Math.min(5, persons.length); i++) {
        const person = persons[i];
        const id = person.getAttribute('xml:id');
        console.log(`\nPerson ${i + 1}: ${id}`);
        console.log('- HTML:', person.outerHTML.substring(0, 200) + '...');
        
        const persName = person.querySelector('persName');
        if (persName) {
            console.log('- persName HTML:', persName.outerHTML);
            console.log('- persName text:', persName.textContent.trim());
        } else {
            console.log('- persName: NOT FOUND');
        }
        
        const birth = person.querySelector('birth');
        const death = person.querySelector('death');
        console.log('- birth:', birth?.outerHTML || 'NOT FOUND');
        console.log('- death:', death?.outerHTML || 'NOT FOUND');
    }
    
    // Check how many have birth/death info
    let withBirth = 0, withDeath = 0;
    persons.forEach(person => {
        if (person.querySelector('birth')) withBirth++;
        if (person.querySelector('death')) withDeath++;
    });
    console.log(`\n📅 Date Information:`);
    console.log(`- With birth: ${withBirth}/${persons.length}`);
    console.log(`- With death: ${withDeath}/${persons.length}`);
    
    // Check places
    const places = teiData.querySelectorAll('listPlace place');
    console.log(`\n📍 Found ${places.length} place elements`);
    
    // Check relations
    const relations = teiData.querySelectorAll('listRelation relation');
    console.log(`🔗 Found ${relations.length} relation elements`);
    
} else {
    console.log('❌ TEI Data not loaded');
}

console.log('\n💡 Run this to see current extraction results:');
console.log('console.table(personsData.slice(0,10).map(p => ({id: p.id, name: p.names.primary, birth: p.birth?.when, category: p.category})));');