(function() {
  'use strict';

  function initTheme() {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeToggle(theme);
  }

  function updateThemeToggle(theme) {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    const sunIcon = toggle.querySelector('.sun-icon');
    const moonIcon = toggle.querySelector('.moon-icon');
    const label = toggle.querySelector('.theme-label');

    if (theme === 'dark') {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
      label.textContent = 'Dark';
    } else {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
      label.textContent = 'Light';
    }
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeToggle(next);
  }

  function updateGreeting() {
    const hour = new Date().getHours();
    const subtitle = document.querySelector('.site-subtitle');

    if (subtitle) {
      if (hour >= 5 && hour < 12) {
        subtitle.textContent = 'Where dawn meets the horizon';
      } else if (hour >= 12 && hour < 17) {
        subtitle.textContent = 'Where sun kisses the sea';
      } else if (hour >= 17 && hour < 20) {
        subtitle.textContent = 'Where thoughts meet the horizon';
      } else {
        subtitle.textContent = 'Where stars dance on waves';
      }
    }
  }

  function generateTOC() {
    const article = document.querySelector('article');
    if (!article) return;

    const headings = article.querySelectorAll('h2, h3');
    if (headings.length < 2) return;

    const tocDesktop = document.createElement('nav');
    tocDesktop.className = 'toc';
    tocDesktop.setAttribute('aria-label', 'Table of contents');

    const tocTitle = document.createElement('div');
    tocTitle.className = 'toc-title';
    tocTitle.textContent = 'Contents';
    tocDesktop.appendChild(tocTitle);

    const tocList = document.createElement('ul');

    headings.forEach((heading, index) => {
      const id = heading.id || `section-${index}`;
      heading.id = id;

      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${id}`;
      a.textContent = heading.textContent;
      a.setAttribute('data-target', id);

      if (heading.tagName === 'H3') {
        a.classList.add('toc-h3');
      }

      li.appendChild(a);
      tocList.appendChild(li);
    });

    tocDesktop.appendChild(tocList);
    document.body.appendChild(tocDesktop);

    const mobileToggle = document.createElement('button');
    mobileToggle.className = 'toc-mobile-toggle';
    mobileToggle.setAttribute('aria-label', 'Toggle table of contents');
    mobileToggle.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    `;

    const tocMobile = document.createElement('nav');
    tocMobile.className = 'toc-mobile';
    tocMobile.setAttribute('aria-label', 'Table of contents');
    tocMobile.innerHTML = tocDesktop.innerHTML;

    document.body.appendChild(mobileToggle);
    document.body.appendChild(tocMobile);

    mobileToggle.addEventListener('click', () => {
      tocMobile.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!tocMobile.contains(e.target) && !mobileToggle.contains(e.target)) {
        tocMobile.classList.remove('open');
      }
    });

    tocMobile.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        tocMobile.classList.remove('open');
      });
    });

    initScrollSpy(headings);
  }

  function initScrollSpy(headings) {
    const observerOptions = {
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.id;
        const tocLinks = document.querySelectorAll(`.toc a[data-target="${id}"], .toc-mobile a[data-target="${id}"]`);

        tocLinks.forEach(link => {
          if (entry.isIntersecting) {
            document.querySelectorAll('.toc a, .toc-mobile a').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
          }
        });
      });
    }, observerOptions);

    headings.forEach(heading => observer.observe(heading));
  }

  function initPopups() {
    const article = document.querySelector('article');
    if (!article) return;

    const internalLinks = article.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]');
    if (internalLinks.length === 0) return;

    const popup = document.createElement('div');
    popup.className = 'popup';
    document.body.appendChild(popup);

    const cache = new Map();

    internalLinks.forEach(link => {
      let showTimeout;
      let hideTimeout;

      link.addEventListener('mouseenter', async (e) => {
        clearTimeout(hideTimeout);

        showTimeout = setTimeout(async () => {
          const href = link.getAttribute('href');
          let content = cache.get(href);

          if (!content) {
            content = await fetchPreview(href);
            cache.set(href, content);
          }

          if (content) {
            popup.innerHTML = content;
            positionPopup(popup, link);
            popup.classList.add('visible');
          }
        }, 300);
      });

      link.addEventListener('mouseleave', () => {
        clearTimeout(showTimeout);
        hideTimeout = setTimeout(() => {
          popup.classList.remove('visible');
        }, 100);
      });
    });
  }

  async function fetchPreview(href) {
    const response = await fetch(href);
    if (!response.ok) return null;

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const title = doc.querySelector('h1')?.textContent || doc.querySelector('title')?.textContent || 'Preview';
    const firstP = doc.querySelector('article p')?.textContent || '';
    const preview = firstP.length > 150 ? firstP.substring(0, 150) + '...' : firstP;

    if (!preview) return null;

    return `<div class="popup-title">${title}</div><p>${preview}</p>`;
  }

  function positionPopup(popup, target) {
    const rect = target.getBoundingClientRect();
    const popupRect = popup.getBoundingClientRect();

    let top = rect.bottom + window.scrollY + 8;
    let left = rect.left + window.scrollX;

    if (left + 300 > window.innerWidth) {
      left = window.innerWidth - 320;
    }

    if (top + popupRect.height > window.innerHeight + window.scrollY) {
      top = rect.top + window.scrollY - popupRect.height - 8;
    }

    popup.style.top = `${top}px`;
    popup.style.left = `${left}px`;
  }

  function init() {
    initTheme();
    updateGreeting();

    const headerEl = document.getElementById('header');
    if (headerEl) {
      const checkToggle = setInterval(() => {
        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
          clearInterval(checkToggle);
          const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
          updateThemeToggle(currentTheme);
          toggle.addEventListener('click', toggleTheme);
        }
      }, 100);

      setTimeout(() => clearInterval(checkToggle), 5000);
    }

    generateTOC();
    initPopups();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  initTheme();
})();
