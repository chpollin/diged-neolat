// Master Initialization Script for Edition-5
// Ensures all modules are properly initialized in the correct order

(function() {
    'use strict';

    // Module initialization status
    window.moduleStatus = {
        core: false,
        prosopography: false,
        metrics: false,
        commentary: false,
        translation: false,
        export: false,
        editMode: false,
        allReady: false
    };

    // Master initialization function
    function initializeEdition() {
        console.log('🚀 Starting Edition-5 Master Initialization...');
        
        // Check if core data is ready
        if (!window.poems || window.poems.length === 0) {
            console.log('⏳ Waiting for poems to load...');
            setTimeout(initializeEdition, 100);
            return;
        }
        
        if (!window.teiDoc) {
            console.log('⏳ Waiting for TEI document to load...');
            setTimeout(initializeEdition, 100);
            return;
        }
        
        console.log('✅ Core data ready:', {
            poems: window.poems.length,
            persons: Object.keys(window.persons || {}).length,
            teiDoc: !!window.teiDoc
        });
        
        window.moduleStatus.core = true;
        
        // Initialize modules in sequence
        initializeModules();
    }

    // Initialize all modules
    function initializeModules() {
        console.log('📦 Initializing modules...');
        
        // Initialize Prosopography
        if (window.prosopographyAPI && !window.moduleStatus.prosopography) {
            try {
                window.prosopographyAPI.init();
                window.moduleStatus.prosopography = true;
                console.log('✅ Prosopography initialized');
            } catch (e) {
                console.error('❌ Prosopography initialization failed:', e);
            }
        }
        
        // Initialize Metrics
        if (window.metricsAPI && !window.moduleStatus.metrics) {
            try {
                window.metricsAPI.init();
                window.moduleStatus.metrics = true;
                console.log('✅ Metrics initialized');
            } catch (e) {
                console.error('❌ Metrics initialization failed:', e);
            }
        }
        
        // Initialize Commentary
        if (window.commentaryAPI && !window.moduleStatus.commentary) {
            try {
                window.commentaryAPI.init();
                window.moduleStatus.commentary = true;
                console.log('✅ Commentary initialized');
            } catch (e) {
                console.error('❌ Commentary initialization failed:', e);
            }
        }
        
        // Initialize Translation
        if (window.translationAPI && !window.moduleStatus.translation) {
            try {
                window.translationAPI.init();
                window.moduleStatus.translation = true;
                console.log('✅ Translation initialized');
            } catch (e) {
                console.error('❌ Translation initialization failed:', e);
            }
        }
        
        // Initialize Export
        if (window.exportAPI && !window.moduleStatus.export) {
            try {
                window.exportAPI.init();
                window.moduleStatus.export = true;
                console.log('✅ Export initialized');
            } catch (e) {
                console.error('❌ Export initialization failed:', e);
            }
        }
        
        // Initialize Edit Mode
        if (window.editModeAPI && !window.moduleStatus.editMode) {
            try {
                // Edit mode initializes automatically if in local environment
                window.moduleStatus.editMode = true;
                console.log('✅ Edit Mode initialized');
            } catch (e) {
                console.error('❌ Edit Mode initialization failed:', e);
            }
        }
        
        // Check if all modules are ready
        checkAllModulesReady();
    }

    // Check if all modules are initialized
    function checkAllModulesReady() {
        const allInitialized = 
            window.moduleStatus.prosopography &&
            window.moduleStatus.metrics &&
            window.moduleStatus.commentary &&
            window.moduleStatus.translation &&
            window.moduleStatus.export;
        
        if (allInitialized && !window.moduleStatus.allReady) {
            window.moduleStatus.allReady = true;
            console.log('🎉 All modules initialized successfully!');
            
            // Dispatch global ready event
            window.dispatchEvent(new CustomEvent('editionReady', {
                detail: window.moduleStatus
            }));
            
            // Show success notification
            showNotification('Edition-5 fully loaded and ready!', 'success');
            
            // Log final status
            logFinalStatus();
        }
    }

    // Log final initialization status
    function logFinalStatus() {
        console.log('📊 Final Module Status:');
        console.table(window.moduleStatus);
        
        console.log('📈 Data Statistics:');
        console.table({
            'Poems': window.poems?.length || 0,
            'Persons': window.prosopography?.persons?.size || 0,
            'Places': window.prosopography?.places?.size || 0,
            'Relationships': window.prosopography?.relationships?.length || 0,
            'Commentary Notes': window.commentary?.notes?.size || 0,
            'Translations': window.translation?.translations?.size || 0
        });
    }

    // Show notification
    function showNotification(message, type = 'info') {
        // Check if notification element exists
        let notification = document.getElementById('initNotification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'initNotification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                transition: all 0.3s;
                font-family: system-ui, -apple-system, sans-serif;
                font-size: 14px;
                opacity: 0;
                transform: translateY(-20px);
            `;
            document.body.appendChild(notification);
        }
        
        // Set color based on type
        const colors = {
            success: { bg: '#d4edda', text: '#155724', border: '#c3e6cb' },
            error: { bg: '#f8d7da', text: '#721c24', border: '#f5c6cb' },
            warning: { bg: '#fff3cd', text: '#856404', border: '#ffeeba' },
            info: { bg: '#d1ecf1', text: '#0c5460', border: '#bee5eb' }
        };
        
        const color = colors[type] || colors.info;
        notification.style.backgroundColor = color.bg;
        notification.style.color = color.text;
        notification.style.border = `1px solid ${color.border}`;
        notification.textContent = message;
        
        // Show notification
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
        }, 3000);
    }

    // Listen for core events
    window.addEventListener('teiLoaded', () => {
        console.log('📚 TEI loaded event received');
        setTimeout(initializeEdition, 500);  // Small delay to ensure all data is processed
    });

    window.addEventListener('poemsLoaded', () => {
        console.log('📖 Poems loaded event received');
    });

    window.addEventListener('dataReady', () => {
        console.log('✅ Data ready event received');
        initializeEdition();
    });

    // Also check on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('📄 DOM ready, checking for initialization...');
            setTimeout(initializeEdition, 1000);  // Give time for TEI to load
        });
    } else {
        console.log('📄 DOM already loaded, checking for initialization...');
        setTimeout(initializeEdition, 1000);
    }

    // Export initialization API
    window.editionInit = {
        initialize: initializeEdition,
        checkStatus: () => window.moduleStatus,
        reinitialize: () => {
            // Reset all flags
            Object.keys(window.moduleStatus).forEach(key => {
                window.moduleStatus[key] = false;
            });
            initializeEdition();
        }
    };

})();