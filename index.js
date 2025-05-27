// Enhanced Book Theme JavaScript

document.addEventListener('DOMContentLoaded', function() {
  const body = document.body;
  const bookContainer = document.querySelector('.book-container');
  
  // Page loading animation
  setTimeout(() => {
    body.classList.add('page-ready');
  }, 100);
  
  // Reading progress indicator
  let progressBar = document.createElement('div');
  progressBar.className = 'reading-progress';
  document.body.appendChild(progressBar);
  
  function updateReadingProgress() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - windowHeight;
    const scrolled = window.scrollY;
    const progress = (scrolled / documentHeight) * 100;
    progressBar.style.width = progress + '%';
    document.body.style.setProperty('--scroll-width', progress + '%');
  }
  
  window.addEventListener('scroll', updateReadingProgress);
  window.addEventListener('resize', updateReadingProgress);
  updateReadingProgress();
  
  // Enhanced page edges effect
  if (bookContainer && !bookContainer.querySelector('.page-edges')) {
    const pageEdges = document.createElement('div');
    pageEdges.className = 'page-edges';
    bookContainer.appendChild(pageEdges);
  }
  
  // Smooth page transitions for internal links
  function setupPageTransitions() {
    document.querySelectorAll('a').forEach(link => {
      const href = link.getAttribute('href');
      if (!href || link.hasAttribute('data-transition-added')) return;
      
      // Skip external links and anchors
      const isExternal = href.startsWith('http') && !href.startsWith(window.location.origin);
      if (isExternal || href.startsWith('#')) return;
      
      link.setAttribute('data-transition-added', 'true');
      link.addEventListener('click', function(e) {
        e.preventDefault();
        body.classList.add('page-exit');
        setTimeout(() => {
          window.location.href = this.href;
        }, 500);
      });
    });
  }
  
  // Watch for dynamically loaded content (header)
  const headerElement = document.getElementById('header');
  if (headerElement) {
    const observer = new MutationObserver(() => {
      setTimeout(setupPageTransitions, 50);
    });
    observer.observe(headerElement, { childList: true, subtree: true });
  }
  
  setupPageTransitions();
  
  // Parallax effect for images on scroll
  const images = document.querySelectorAll('img');
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.transform = 'translateY(0) scale(1)';
        entry.target.style.opacity = '1';
      }
    });
  }, observerOptions);
  
  images.forEach(img => {
    img.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease';
    img.style.transform = 'translateY(20px) scale(0.98)';
    img.style.opacity = '0';
    imageObserver.observe(img);
  });
  
  // Enhanced link hover effects with magnetic cursor
  const links = document.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const distance = Math.sqrt(x * x + y * y);
      
      if (distance < 50) {
        const translateX = x * 0.1;
        const translateY = y * 0.1;
        this.style.transform = `translate(${translateX}px, ${translateY}px)`;
      }
    });
    
    link.addEventListener('mouseleave', function() {
      this.style.transform = '';
    });
  });
  
  // Dynamic page numbering
  const articles = document.querySelectorAll('article');
  articles.forEach((article, index) => {
    if (!article.querySelector('.page-number')) {
      const pageNum = document.createElement('div');
      pageNum.className = 'page-number';
      pageNum.textContent = `Page ${index + 1}`;
      article.appendChild(pageNum);
    }
  });
  
  // Bookmark functionality
  let bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
  
  function createBookmarkButton() {
    const button = document.createElement('button');
    button.className = 'bookmark-btn';
    button.innerHTML = '🔖';
    button.title = 'Bookmark this section';
    button.style.cssText = `
      position: fixed;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      background: var(--gold-accent);
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      font-size: 20px;
      cursor: pointer;
      opacity: 0.7;
      transition: all 0.3s ease;
      z-index: 100;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
    
    button.addEventListener('mouseenter', function() {
      this.style.opacity = '1';
      this.style.transform = 'translateY(-50%) scale(1.1)';
    });
    
    button.addEventListener('mouseleave', function() {
      this.style.opacity = '0.7';
      this.style.transform = 'translateY(-50%) scale(1)';
    });
    
    button.addEventListener('click', function() {
      const scrollPos = window.scrollY;
      const pageTitle = document.title;
      const bookmark = {
        url: window.location.href,
        title: pageTitle,
        position: scrollPos,
        date: new Date().toISOString()
      };
      
      bookmarks.push(bookmark);
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
      
      // Visual feedback
      this.style.animation = 'bookmarkAdded 0.5s ease';
      setTimeout(() => {
        this.style.animation = '';
      }, 500);
    });
    
    document.body.appendChild(button);
  }
  
  // Add bookmark button if on a content page
  if (document.querySelector('article')) {
    createBookmarkButton();
  }
  
  // Enhance blockquotes with subtle animation
  const blockquotes = document.querySelectorAll('blockquote');
  blockquotes.forEach(quote => {
    quote.addEventListener('mouseenter', function() {
      this.style.transform = 'translateX(5px)';
    });
    
    quote.addEventListener('mouseleave', function() {
      this.style.transform = '';
    });
  });
  
  // Add vintage paper noise animation
  function addPaperNoise() {
    const noise = document.createElement('div');
    noise.className = 'paper-noise';
    noise.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0.02;
      z-index: 1;
      pointer-events: none;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
      mix-blend-mode: multiply;
    `;
    document.body.appendChild(noise);
  }
  
  addPaperNoise();
  
  // Subtle parallax for the book container
  let ticking = false;
  function updateParallax() {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        const rate = scrolled * -0.5;
        if (bookContainer) {
          bookContainer.style.transform = `perspective(1000px) rotateY(-0.5deg) translateY(${rate * 0.01}px)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  }
  
  window.addEventListener('scroll', updateParallax);
  
  // Add CSS animation keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes bookmarkAdded {
      0% { transform: translateY(-50%) scale(1) rotate(0deg); }
      50% { transform: translateY(-50%) scale(1.3) rotate(180deg); }
      100% { transform: translateY(-50%) scale(1) rotate(360deg); }
    }
    
    .highlight-selection {
      background-color: rgba(201, 169, 97, 0.3);
      padding: 2px 4px;
      border-radius: 2px;
      transition: background-color 0.3s ease;
    }
    
    .margin-note-indicator {
      position: absolute;
      right: -10px;
      width: 6px;
      height: 6px;
      background: var(--gold-accent);
      border-radius: 50%;
      cursor: help;
      opacity: 0.6;
      transition: opacity 0.3s ease;
    }
    
    .margin-note-indicator:hover {
      opacity: 1;
    }
  `;
  document.head.appendChild(style);
  
  // Initialize any margin notes
  const marginNotes = document.querySelectorAll('.margin-note');
  marginNotes.forEach(note => {
    const indicator = document.createElement('span');
    indicator.className = 'margin-note-indicator';
    indicator.title = 'See margin note';
    note.parentElement.style.position = 'relative';
    note.parentElement.appendChild(indicator);
  });
  
  // Console easter egg
  console.log('%c📚 Welcome to my digital library! 📚', 
    'font-size: 20px; font-family: Cormorant, serif; color: #c9a961; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);');
  console.log('%cFeel free to explore the code. Built with love for the written word.',
    'font-style: italic; color: #8a7e6f;');
  
  // Grid adjustment for images (from original code)
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

  // Maintain grid for media elements
  function adjustMediaPadding() {
    const cell = gridCellDimensions();

    function setHeightFromRatio(media, ratio) {
      const rect = media.getBoundingClientRect();
      const realHeight = rect.width / ratio;
      const diff = cell.height - (realHeight % cell.height);
      media.style.setProperty("padding-bottom", `${diff}px`);
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
          }
          break;
        case "VIDEO":
          if (media.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            onMediaLoaded(media);
          } else {
            media.addEventListener("loadeddata", () => onMediaLoaded(media));
          }
          break;
      }
    }
  }

  adjustMediaPadding();
  window.addEventListener("resize", adjustMediaPadding);
});

// Page visibility API for reading time tracking
let startTime = Date.now();
let totalTime = 0;

document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    totalTime += Date.now() - startTime;
  } else {
    startTime = Date.now();
  }
});

window.addEventListener('beforeunload', function() {
  totalTime += Date.now() - startTime;
  console.log(`Reading time: ${Math.round(totalTime / 1000)} seconds`);
});

// Handle back-forward navigation
window.addEventListener('pageshow', function(event) {
  if (event.persisted) {
    document.body.classList.remove('page-exit');
    setTimeout(() => {
      document.body.classList.add('page-ready');
    }, 10);
  }
});