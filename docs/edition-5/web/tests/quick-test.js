// Quick Diagnostic Tests - Run in Console
// Copy and paste this for rapid testing

console.log('🔍 Quick Diagnostic Tests');
console.log('=' .repeat(40));

// Check data loading
console.log('📊 Data Status:');
console.log(`  TEI Document: ${teiData ? '✅ Loaded' : '❌ Missing'}`);
console.log(`  Persons: ${personsData?.length || 0} extracted`);
console.log(`  Places: ${placesData?.length || 0} extracted`);
console.log(`  Relations: ${relationsData?.length || 0} extracted`);

// Check person data quality
if (personsData) {
    const validPersons = personsData.filter(p => p.id && p.names?.primary).length;
    console.log(`  Valid Persons: ${validPersons}/${personsData.length} (${((validPersons/personsData.length)*100).toFixed(1)}%)`);
    
    const personsWithDates = personsData.filter(p => p.birth?.when || p.birth?.notBefore || p.death?.when).length;
    console.log(`  Persons with dates: ${personsWithDates}`);
}

// Check UI elements
const tabs = document.querySelectorAll('.tab-button').length;
const cards = document.querySelectorAll('.stat-card').length;
const search = document.querySelectorAll('.search-input').length;
console.log(`  UI Elements: ${tabs} tabs, ${cards} stat cards, ${search} search inputs`);

// Quick function tests
console.log('\n⚡ Quick Function Tests:');
try {
    switchToTab('places');
    console.log('  Tab switching: ✅ Works');
    switchToTab('persons');
} catch(e) {
    console.log('  Tab switching: ❌ Failed -', e.message);
}

try {
    displayPersons('test');
    console.log('  Person display: ✅ Works');
    displayPersons('');
} catch(e) {
    console.log('  Person display: ❌ Failed -', e.message);
}

// Check timeline
switchToTab('timeline');
setTimeout(() => {
    const timelineItems = document.querySelectorAll('.timeline-item').length;
    console.log(`  Timeline items: ${timelineItems} created`);
    switchToTab('persons');
}, 200);

console.log('\n💡 Commands:');
console.log('- switchToTab("timeline") - Switch to timeline view');
console.log('- displayPersons("search") - Test search');
console.log('- console.table(personsData.slice(0,5)) - View sample data');
console.log('- filterPersons("patron") - Test filtering');

// Sample data inspection
console.log('\n📋 Sample Data:');
if (personsData?.length > 0) {
    const sample = personsData[0];
    console.log('Sample person:', {
        id: sample.id,
        name: sample.names?.primary,
        category: sample.category,
        birth: sample.birth?.when || sample.birth?.notBefore,
        notes: sample.notes?.length
    });
}

if (placesData?.length > 0) {
    const sample = placesData[0];
    console.log('Sample place:', {
        id: sample.id,
        name: sample.names?.[0]?.value,
        type: sample.type,
        occurrences: sample.occurrences?.length
    });
}

console.log('\n✅ Quick diagnostic complete!');