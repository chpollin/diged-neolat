// Test Fixes - Run in Console After Page Reload
console.log('🔧 Testing Recent Fixes');
console.log('=' .repeat(40));

// Test person name extraction
console.log('📊 Person Name Extraction:');
if (personsData) {
    const withNames = personsData.filter(p => p.names?.primary && p.names.primary.trim()).length;
    const withoutNames = personsData.length - withNames;
    
    console.log(`  ✅ With names: ${withNames}/${personsData.length} (${((withNames/personsData.length)*100).toFixed(1)}%)`);
    console.log(`  ❌ Without names: ${withoutNames}`);
    
    // Show sample of persons without names
    if (withoutNames > 0) {
        console.log('  Sample persons without names:');
        personsData.filter(p => !p.names?.primary || !p.names.primary.trim()).slice(0, 3).forEach(p => {
            console.log(`    - ID: ${p.id}, Name: "${p.names?.primary || 'EMPTY'}", Category: ${p.category}`);
        });
    }
}

// Test timeline data
console.log('\n📅 Timeline Data:');
if (personsData) {
    const withBirthData = personsData.filter(p => p.birth?.when || p.birth?.notBefore || p.birth?.notAfter).length;
    const withDeathData = personsData.filter(p => p.death?.when || p.death?.notAfter).length;
    const withAnyDate = personsData.filter(p => 
        p.birth?.when || p.birth?.notBefore || p.birth?.notAfter || p.death?.when || p.death?.notAfter
    ).length;
    
    console.log(`  Birth data: ${withBirthData} persons`);
    console.log(`  Death data: ${withDeathData} persons`);
    console.log(`  Any date: ${withAnyDate} persons`);
    
    // Show sample persons with dates
    if (withAnyDate > 0) {
        console.log('  Sample persons with dates:');
        personsData.filter(p => 
            p.birth?.when || p.birth?.notBefore || p.birth?.notAfter || p.death?.when || p.death?.notAfter
        ).slice(0, 3).forEach(p => {
            console.log(`    - ${p.names.primary}: birth=${JSON.stringify(p.birth)}, death=${JSON.stringify(p.death)}`);
        });
    }
}

// Test timeline visualization
console.log('\n🕐 Testing Timeline:');
console.log('  Switching to timeline tab...');
switchToTab('timeline');

setTimeout(() => {
    const timelineItems = document.querySelectorAll('.timeline-item');
    console.log(`  Timeline items created: ${timelineItems.length}`);
    
    if (timelineItems.length === 0) {
        console.log('  ❌ Timeline still empty - checking console for debug info');
    } else {
        console.log('  ✅ Timeline working!');
    }
    
    switchToTab('persons'); // Switch back
}, 500);

// Test relations
console.log('\n🔗 Relations:');
console.log(`  Total relations: ${relationsData?.length || 0}`);

console.log('\n💡 Manual Tests:');
console.log('- Run: debug-tei.js to see TEI structure');
console.log('- Run: console.table(personsData.filter(p => !p.names.primary).slice(0,5)) to see broken persons');
console.log('- Switch to timeline tab manually to see visual result');