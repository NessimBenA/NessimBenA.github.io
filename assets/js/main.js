// Main JavaScript file for One Piece inspired blog

document.addEventListener('DOMContentLoaded', (event) => {
  // Search functionality
  const searchForm = document.querySelector('.search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = e.target.querySelector('input[type="text"]').value;
      window.location.href = `/search?query=${encodeURIComponent(query)}`;
    });
  }

  // Responsive navigation menu
  const navTrigger = document.querySelector('.nav-trigger');
  const siteNav = document.querySelector('.site-nav');
  if (navTrigger && siteNav) {
    navTrigger.addEventListener('change', (e) => {
      if (e.target.checked) {
        siteNav.classList.add('nav-open');
      } else {
        siteNav.classList.remove('nav-open');
      }
    });
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });

  // Add 'active' class to current navigation item
  const currentPage = window.location.pathname;
  document.querySelectorAll('.site-nav .page-link').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });

  // Lazy loading for images
  if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
      img.src = img.dataset.src;
    });
  } else {
    // Fallback for browsers that don't support lazy loading
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
  }
});

// Function to initialize syntax highlighting
function initializePrism() {
  if (typeof Prism !== 'undefined') {
    Prism.highlightAll();
  }
}

// Call the function when the page loads
window.addEventListener('load', initializePrism);