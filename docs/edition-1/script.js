document.addEventListener('DOMContentLoaded', () => {
    const imageElement = document.getElementById('facsimile-image');
    const folioElement = document.getElementById('folio-number');

    // Exit if the necessary image element isn't on the page, to prevent errors.
    if (!imageElement) {
        console.error("Error: Facsimile image element with id 'facsimile-image' not found.");
        return;
    }

    /**
     * This function is the core callback for the IntersectionObserver.
     * It's called whenever a tracked element's visibility changes.
     * @param {IntersectionObserverEntry[]} entries - A list of elements that have changed visibility.
     */
    const handleIntersection = (entries) => {
        // Find all markers that are currently intersecting with the viewport.
        const visibleMarkers = entries
            .filter(entry => entry.isIntersecting)
            .map(entry => entry.target);

        // If no markers are visible (e.g., scrolling past the end), do nothing.
        if (visibleMarkers.length === 0) return;

        // Sort the visible markers by their vertical position on the page.
        // This ensures the one closest to the top is always chosen, providing stable behavior.
        visibleMarkers.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
        const currentMarker = visibleMarkers[0];

        const newImageSrc = currentMarker.dataset.imageSrc;
        const newFolio = currentMarker.dataset.folio;

        // Update the image only if the source is new, preventing flickering.
        if (newImageSrc && imageElement.src !== newImageSrc) {
            
            // --- Compact Logging ---
            console.log(`📜 Folio changed to: ${newFolio}`);

            // Fade out the old image for a smooth transition.
            imageElement.style.opacity = 0;

            setTimeout(() => {
                imageElement.src = newImageSrc;
                imageElement.style.opacity = 1; // Fade in the new image.
                if (folioElement && newFolio) {
                    folioElement.textContent = `Folio: ${newFolio}`;
                }
            }, 200); // This delay should be slightly less than the CSS transition time.
        }
    };

    // --- IntersectionObserver Configuration ---
    // The 'rootMargin' creates a horizontal "trigger line" at 10% from the top of the viewport.
    // An element is only considered "intersecting" when it crosses this line.
    // 'threshold: 0' means the callback triggers as soon as a single pixel crosses the line.
    const observerOptions = {
        rootMargin: "-10% 0px -90% 0px",
        threshold: 0
    };

    // Create and start the observer.
    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    const markers = document.querySelectorAll('.page-marker');
    markers.forEach(marker => observer.observe(marker));

    // Set the initial image when the page first loads.
    if (markers.length > 0) {
        imageElement.src = markers[0].dataset.imageSrc;
        if (folioElement && markers[0].dataset.folio) {
            folioElement.textContent = `Folio: ${markers[0].dataset.folio}`;
        }
    }
});