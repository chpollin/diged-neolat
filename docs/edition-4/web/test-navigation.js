// Test Hash Navigation - Run in Console on main edition page
console.log('🔗 Testing Hash Navigation');
console.log('=' .repeat(40));

console.log('Current URL:', window.location.href);
console.log('Current hash:', window.location.hash);

// Test if target element exists
const currentHash = window.location.hash;
if (currentHash) {
    const poemId = currentHash.substring(1);
    console.log(`Looking for element: ${poemId}`);
    
    const element = document.getElementById(poemId);
    if (element) {
        console.log('✅ Element found:', element);
        console.log('Element position:', element.getBoundingClientRect());
        
        // Test manual scroll
        console.log('📍 Manually scrolling to element...');
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        console.log('❌ Element not found');
        
        // List all poem elements
        const poems = document.querySelectorAll('[id^="poem-"]');
        console.log(`Available poem elements (${poems.length}):`);
        Array.from(poems).slice(0, 10).forEach(p => {
            console.log(`  - ${p.id}`);
        });
    }
} else {
    console.log('No hash in URL');
}

// Test the handleURLState function
if (typeof handleURLState === 'function') {
    console.log('\n🔧 Testing handleURLState function...');
    handleURLState();
} else {
    console.log('\n❌ handleURLState function not found');
}

console.log('\n💡 Manual Tests:');
console.log('1. Navigate to: index.html#poem-I.16');
console.log('2. Check console for debug messages');
console.log('3. Verify automatic scrolling occurs');
console.log('4. Test from index page: click appearance link');

console.log('\n🎯 Debug Tips:');
console.log('- Check browser console for debugLog messages');
console.log('- Ensure TEI content has finished loading');
console.log('- Verify poem ID format matches exactly');