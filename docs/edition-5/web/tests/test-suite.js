/**
 * Comprehensive Test Suite for Enhanced Index System
 * Run in browser console: copy and paste this entire file
 */

console.log('🧪 Starting Enhanced Index Test Suite...\n');

// Test Suite Object
const IndexTestSuite = {
    results: {
        passed: 0,
        failed: 0,
        tests: []
    },

    // Test assertion helper
    assert(condition, testName, details = '') {
        if (condition) {
            console.log(`✅ ${testName}`);
            this.results.passed++;
            this.results.tests.push({ name: testName, status: 'PASS', details });
        } else {
            console.error(`❌ ${testName} - ${details}`);
            this.results.failed++;
            this.results.tests.push({ name: testName, status: 'FAIL', details });
        }
    },

    // 1. Data Loading Tests
    testDataLoading() {
        console.log('\n📊 Testing Data Loading...');
        
        this.assert(
            typeof teiData !== 'undefined' && teiData !== null,
            'TEI Data Loaded',
            `TEI Document: ${teiData ? 'Loaded' : 'Failed'}`
        );

        this.assert(
            personsData && personsData.length > 0,
            'Persons Data Extracted',
            `${personsData.length} persons found`
        );

        this.assert(
            placesData && placesData.length > 0,
            'Places Data Extracted',
            `${placesData.length} places found`
        );

        this.assert(
            relationsData && relationsData.length > 0,
            'Relations Data Extracted',
            `${relationsData.length} relations found`
        );

        // Test specific person data structure
        if (personsData.length > 0) {
            const testPerson = personsData[0];
            this.assert(
                testPerson.id && testPerson.names && testPerson.category,
                'Person Data Structure Valid',
                `Sample person: ${testPerson.names.primary} (${testPerson.category})`
            );
        }

        // Test specific place data structure
        if (placesData.length > 0) {
            const testPlace = placesData[0];
            this.assert(
                testPlace.id && testPlace.names && Array.isArray(testPlace.names),
                'Place Data Structure Valid',
                `Sample place: ${testPlace.names[0]?.value} (${testPlace.type})`
            );
        }
    },

    // 2. UI Element Tests
    testUIElements() {
        console.log('\n🎨 Testing UI Elements...');

        // Test dashboard cards
        const statCards = document.querySelectorAll('.stat-card');
        this.assert(
            statCards.length === 4,
            'Dashboard Statistics Cards Present',
            `Found ${statCards.length} stat cards`
        );

        // Test tab buttons
        const tabButtons = document.querySelectorAll('.tab-button');
        this.assert(
            tabButtons.length === 6,
            'All Tab Buttons Present',
            `Found ${tabButtons.length} tabs: ${Array.from(tabButtons).map(t => t.textContent.trim()).join(', ')}`
        );

        // Test search inputs
        const searchInputs = document.querySelectorAll('.search-input');
        this.assert(
            searchInputs.length === 3,
            'Search Inputs Present',
            `Found ${searchInputs.length} search inputs`
        );

        // Test filter pills
        const filterPills = document.querySelectorAll('.filter-pill');
        this.assert(
            filterPills.length > 0,
            'Filter Pills Present',
            `Found ${filterPills.length} filter options`
        );

        // Test content areas
        const contentGrids = document.querySelectorAll('.content-grid');
        this.assert(
            contentGrids.length === 3,
            'Content Grids Present',
            `Found ${contentGrids.length} content areas`
        );
    },

    // 3. Functionality Tests
    testFunctionality() {
        console.log('\n⚙️ Testing Functionality...');

        // Test tab switching
        try {
            switchToTab('places');
            const placesTab = document.getElementById('places-tab');
            this.assert(
                placesTab.style.display === 'block',
                'Tab Switching Works',
                'Successfully switched to places tab'
            );
            switchToTab('persons'); // Switch back
        } catch (error) {
            this.assert(false, 'Tab Switching Works', error.message);
        }

        // Test search functionality
        try {
            const personSearch = document.getElementById('person-search');
            personSearch.value = 'Albrisius';
            personSearch.dispatchEvent(new Event('input'));
            setTimeout(() => {
                const results = document.querySelectorAll('#persons-content .content-card');
                this.assert(
                    results.length > 0,
                    'Person Search Works',
                    `Found ${results.length} results for "Albrisius"`
                );
                personSearch.value = ''; // Clear
                personSearch.dispatchEvent(new Event('input'));
            }, 100);
        } catch (error) {
            this.assert(false, 'Person Search Works', error.message);
        }

        // Test filter functionality
        try {
            filterPersons('patron');
            setTimeout(() => {
                const activeFilter = document.querySelector('#person-filters .filter-pill.active');
                this.assert(
                    activeFilter && activeFilter.textContent.includes('Patron'),
                    'Filter System Works',
                    `Active filter: ${activeFilter?.textContent || 'None'}`
                );
                filterPersons('all'); // Reset
            }, 100);
        } catch (error) {
            this.assert(false, 'Filter System Works', error.message);
        }

        // Test card expansion
        try {
            const firstCard = document.querySelector('.content-card');
            if (firstCard) {
                toggleCard(firstCard.id);
                this.assert(
                    firstCard.classList.contains('expanded'),
                    'Card Expansion Works',
                    'Card successfully expanded'
                );
                toggleCard(firstCard.id); // Collapse
            }
        } catch (error) {
            this.assert(false, 'Card Expansion Works', error.message);
        }
    },

    // 4. Data Integrity Tests
    testDataIntegrity() {
        console.log('\n🔍 Testing Data Integrity...');

        // Test for required person fields
        let personsWithRequiredFields = 0;
        personsData.forEach(person => {
            if (person.id && person.names && person.names.primary) {
                personsWithRequiredFields++;
            }
        });
        this.assert(
            personsWithRequiredFields === personsData.length,
            'All Persons Have Required Fields',
            `${personsWithRequiredFields}/${personsData.length} persons valid`
        );

        // Test for required place fields
        let placesWithRequiredFields = 0;
        placesData.forEach(place => {
            if (place.id && place.names && place.names.length > 0) {
                placesWithRequiredFields++;
            }
        });
        this.assert(
            placesWithRequiredFields === placesData.length,
            'All Places Have Required Fields',
            `${placesWithRequiredFields}/${placesData.length} places valid`
        );

        // Test relationships reference valid persons
        let validRelations = 0;
        relationsData.forEach(relation => {
            const allParticipants = [
                ...relation.participants.active,
                ...relation.participants.passive,
                ...relation.participants.mutual
            ];
            
            const validParticipants = allParticipants.every(id => 
                personsData.some(p => p.id === id)
            );
            
            if (validParticipants) validRelations++;
        });
        
        this.assert(
            validRelations === relationsData.length,
            'All Relations Reference Valid Persons',
            `${validRelations}/${relationsData.length} relations valid`
        );

        // Test occurrences data
        let placesWithOccurrences = placesData.filter(p => p.occurrences && p.occurrences.length > 0).length;
        this.assert(
            placesWithOccurrences > 0,
            'Places Have Occurrence Data',
            `${placesWithOccurrences} places have occurrence references`
        );
    },

    // 5. Visualization Tests
    testVisualizations() {
        console.log('\n📊 Testing Visualizations...');

        // Test network visualization
        switchToTab('visualization');
        setTimeout(() => {
            this.assert(
                document.getElementById('relationshipGraph').children.length > 0,
                'Network Visualization Loaded',
                'Relationship graph container has content'
            );
        }, 500);

        // Test timeline
        switchToTab('timeline');
        setTimeout(() => {
            const timelineItems = document.querySelectorAll('.timeline-item');
            this.assert(
                timelineItems.length > 0,
                'Timeline Visualization Loaded',
                `${timelineItems.length} timeline items created`
            );
        }, 500);

        switchToTab('persons'); // Return to persons tab
    },

    // 6. Performance Tests
    testPerformance() {
        console.log('\n⚡ Testing Performance...');

        // Measure data processing time
        const startTime = performance.now();
        displayPersons();
        const endTime = performance.now();
        
        this.assert(
            endTime - startTime < 1000,
            'Person Display Performance',
            `Rendered in ${(endTime - startTime).toFixed(2)}ms`
        );

        // Test large search
        const searchStart = performance.now();
        displayPersons('a'); // Search for 'a' - should return many results
        const searchEnd = performance.now();
        
        this.assert(
            searchEnd - searchStart < 500,
            'Search Performance',
            `Search completed in ${(searchEnd - searchStart).toFixed(2)}ms`
        );

        displayPersons(''); // Clear search
    },

    // 7. Cross-reference Tests
    testCrossReferences() {
        console.log('\n🔗 Testing Cross-References...');

        // Test if persons appear in relationships
        let personsInRelations = new Set();
        relationsData.forEach(relation => {
            relation.participants.active.forEach(id => personsInRelations.add(id));
            relation.participants.passive.forEach(id => personsInRelations.add(id));
            relation.participants.mutual.forEach(id => personsInRelations.add(id));
        });

        this.assert(
            personsInRelations.size > 0,
            'Cross-References Between Persons and Relations',
            `${personsInRelations.size} persons referenced in relationships`
        );

        // Test if places have occurrence references
        let placesWithReferences = placesData.filter(p => 
            p.occurrences && p.occurrences.length > 0
        ).length;

        this.assert(
            placesWithReferences > 0,
            'Places Have Text References',
            `${placesWithReferences} places reference specific poems`
        );
    },

    // Run all tests
    runAllTests() {
        console.log('🚀 Enhanced Index System - Comprehensive Test Suite');
        console.log('=' .repeat(60));

        // Wait a moment for data to be fully loaded
        setTimeout(() => {
            this.testDataLoading();
            this.testUIElements();
            this.testDataIntegrity();
            this.testCrossReferences();
            this.testFunctionality();
            this.testVisualizations();
            this.testPerformance();

            // Final results
            console.log('\n' + '=' .repeat(60));
            console.log('📋 TEST RESULTS SUMMARY');
            console.log('=' .repeat(60));
            console.log(`✅ Passed: ${this.results.passed}`);
            console.log(`❌ Failed: ${this.results.failed}`);
            console.log(`📊 Total: ${this.results.passed + this.results.failed}`);
            console.log(`🎯 Success Rate: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);
            
            if (this.results.failed === 0) {
                console.log('\n🎉 ALL TESTS PASSED! The enhanced index system is working perfectly.');
            } else {
                console.log('\n⚠️ Some tests failed. Check the details above.');
            }

            console.log('\n📈 DETAILED RESULTS:');
            this.results.tests.forEach(test => {
                const status = test.status === 'PASS' ? '✅' : '❌';
                console.log(`${status} ${test.name}${test.details ? ' - ' + test.details : ''}`);
            });

        }, 1000); // Wait 1 second for data loading
    }
};

// Auto-run tests
IndexTestSuite.runAllTests();

// Export for manual testing
window.IndexTestSuite = IndexTestSuite;

console.log('\n💡 MANUAL TESTING COMMANDS:');
console.log('- IndexTestSuite.runAllTests() - Run complete test suite');
console.log('- IndexTestSuite.testDataLoading() - Test data loading only');
console.log('- IndexTestSuite.testFunctionality() - Test UI functionality only');
console.log('- console.table(personsData) - View persons data');
console.log('- console.table(placesData) - View places data');
console.log('- console.table(relationsData) - View relations data');