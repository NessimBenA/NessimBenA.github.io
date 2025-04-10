function gridCellDimensions() {
  const element = document.createElement("div");
  element.style.position = "fixed";
  element.style.height = "var(--line-height)";
  element.style.width = "1ch";
  document.body.appendChild(element);
  const rect = element.getBoundingClientRect();
  document.body.removeChild(element);
  return { width: rect.width, height: rect.height };
}

// Add padding to each media to maintain grid.
function adjustMediaPadding() {
  const cell = gridCellDimensions();

  function setHeightFromRatio(media, ratio) {
      const rect = media.getBoundingClientRect();
      const realHeight = rect.width / ratio;
      const diff = cell.height - (realHeight % cell.height);
      media.style.setProperty("padding-bottom", `${diff}px`);
  }

  function setFallbackHeight(media) {
      const rect = media.getBoundingClientRect();
      const height = Math.round((rect.width / 2) / cell.height) * cell.height;
      media.style.setProperty("height", `${height}px`);
  }

  function onMediaLoaded(media) {
    var width, height;
    switch (media.tagName) {
      case "IMG":
        width = media.naturalWidth;
        height = media.naturalHeight;
        break;
      case "VIDEO":
        width = media.videoWidth;
        height = media.videoHeight;
        break;
    }
    if (width > 0 && height > 0) {
      setHeightFromRatio(media, width / height);
    } else {
      setFallbackHeight(media);
    }
  }

  const medias = document.querySelectorAll("img, video");
  for (media of medias) {
    switch (media.tagName) {
      case "IMG":
        if (media.complete) {
          onMediaLoaded(media);
        } else {
          media.addEventListener("load", () => onMediaLoaded(media));
          media.addEventListener("error", function() {
              setFallbackHeight(media);
          });
        }
        break;
      case "VIDEO":
        switch (media.readyState) {
          case HTMLMediaElement.HAVE_CURRENT_DATA:
          case HTMLMediaElement.HAVE_FUTURE_DATA:
          case HTMLMediaElement.HAVE_ENOUGH_DATA:
            onMediaLoaded(media);
            break;
          default:
            media.addEventListener("loadeddata", () => onMediaLoaded(media));
            media.addEventListener("error", function() {
              setFallbackHeight(media);
            });
            break;
        }
        break;
    }
  }
}

adjustMediaPadding();
window.addEventListener("load", adjustMediaPadding);
window.addEventListener("resize", adjustMediaPadding);

function checkOffsets() {
  const ignoredTagNames = new Set([
    "THEAD",
    "TBODY",
    "TFOOT",
    "TR",
    "TD",
    "TH",
  ]);
  const cell = gridCellDimensions();
  const elements = document.querySelectorAll("body :not(.debug-grid, .debug-toggle)");
  for (const element of elements) {
    if (ignoredTagNames.has(element.tagName)) {
      continue;
    }
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      continue;
    }
    const top = rect.top + window.scrollY;
    const left = rect.left + window.scrollX;
    const offset = top % (cell.height / 2);
    if(offset > 0) {
      element.classList.add("off-grid");
      console.error("Incorrect vertical offset for", element, "with remainder", top % cell.height, "when expecting divisible by", cell.height / 2);
    } else {
      element.classList.remove("off-grid");
    }
  }
}

const debugToggle = document.querySelector(".debug-toggle");
if (debugToggle) {
  function onDebugToggle() {
    document.body.classList.toggle("debug", debugToggle.checked);
  }
  debugToggle.addEventListener("change", onDebugToggle);
  onDebugToggle();
}

// Page transition animation setup
function setupPageTransitions() {
  // Add page transition class to body
  document.body.classList.add('page-ready');
  
  // Function to add transitions to links
  function addTransitionsToLinks() {
    // Get all links that point to other pages in the site
    const internalLinks = Array.from(document.querySelectorAll('a'))
      .filter(link => {
        // Only internal links (same origin or relative)
        if (link.href.startsWith('http') && !link.href.startsWith(window.location.origin)) return false;
        // Exclude anchor links on the same page
        if (link.href.includes('#') && link.href.split('#')[0] === window.location.href.split('#')[0]) return false;
        // Exclude the current page
        if (link.href === window.location.href) return false;
        // Skip links that already have the transition handler
        if (link.hasAttribute('data-transition-added')) return false;
        return true;
      });
    
    // Add click handler to internal links
    internalLinks.forEach(link => {
      link.setAttribute('data-transition-added', 'true');
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetUrl = this.href;
        
        // Start page exit animation
        document.body.classList.add('page-exit');
        
        // Wait for animation to complete, then navigate
        setTimeout(() => {
          window.location.href = targetUrl;
        }, 500); // Match this to the animation duration
      });
    });
  }
  
  // Initial setup for links in the main content
  addTransitionsToLinks();
  
  // Watch for header content being loaded
  const headerElement = document.getElementById('header');
  if (headerElement) {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Header content has loaded, add transitions to its links
          setTimeout(addTransitionsToLinks, 50); // Small delay to ensure all DOM is ready
        }
      });
    });
    
    // Configure and start the observer
    observer.observe(headerElement, { childList: true, subtree: true });
  }
}

// Initialize page transitions
document.addEventListener('DOMContentLoaded', setupPageTransitions);

// On page load, show entrance animation
window.addEventListener('pageshow', function(event) {
  // Check if it's a back-forward navigation
  if (event.persisted) {
    document.body.classList.remove('page-exit');
    setTimeout(() => {
      document.body.classList.add('page-ready');
    }, 10);
  }
});
