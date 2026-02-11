(function() {
  'use strict';

  function initTheme() {
    var stored = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeToggle(theme);
  }

  function updateThemeToggle(theme) {
    var toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    var sunIcon = toggle.querySelector('.sun-icon');
    var moonIcon = toggle.querySelector('.moon-icon');
    var label = toggle.querySelector('.theme-label');

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
    var current = document.documentElement.getAttribute('data-theme');
    var next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeToggle(next);
  }

  function updateGreeting() {
    var hour = new Date().getHours();
    var subtitle = document.querySelector('.site-subtitle');

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

  function setActiveNav() {
    var path = window.location.pathname;
    var links = document.querySelectorAll('.site-nav a');
    links.forEach(function(link) {
      var href = link.getAttribute('href');
      if (path === href || path.endsWith(href)) {
        link.classList.add('nav-active');
      } else if (href === '/index.html' && (path === '/' || path === '/index.html')) {
        link.classList.add('nav-active');
      }
    });
  }

  function initBlogFilters() {
    var tabs = document.querySelectorAll('.filter-tab');
    if (tabs.length === 0) return;

    var items = document.querySelectorAll('.post-list li[data-category]');

    function filterPosts(category) {
      items.forEach(function(item) {
        if (category === 'all' || item.getAttribute('data-category') === category) {
          item.classList.remove('filter-hidden');
          item.classList.add('filter-visible');
        } else {
          item.classList.remove('filter-visible');
          item.classList.add('filter-hidden');
        }
      });

      tabs.forEach(function(tab) {
        tab.classList.remove('active');
        if (tab.getAttribute('data-filter') === category) {
          tab.classList.add('active');
        }
      });
    }

    tabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        var filter = this.getAttribute('data-filter');
        filterPosts(filter);
        if (filter === 'all') {
          history.replaceState(null, '', window.location.pathname);
        } else {
          history.replaceState(null, '', '#' + filter);
        }
      });
    });

    var hash = window.location.hash.replace('#', '');
    if (hash === 'research' || hash === 'opinion') {
      filterPosts(hash);
    } else {
      filterPosts('all');
    }
  }

  function generateTOC() {
    var article = document.querySelector('article');
    if (!article) return;

    var headings = article.querySelectorAll('h2, h3');
    if (headings.length < 2) return;

    var tocDesktop = document.createElement('nav');
    tocDesktop.className = 'toc';
    tocDesktop.setAttribute('aria-label', 'Table of contents');

    var tocTitle = document.createElement('div');
    tocTitle.className = 'toc-title';
    tocTitle.textContent = 'Contents';
    tocDesktop.appendChild(tocTitle);

    var tocList = document.createElement('ul');

    headings.forEach(function(heading, index) {
      var id = heading.id || 'section-' + index;
      heading.id = id;

      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + id;
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

    var mobileToggle = document.createElement('button');
    mobileToggle.className = 'toc-mobile-toggle';
    mobileToggle.setAttribute('aria-label', 'Toggle table of contents');
    mobileToggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';

    var tocMobile = document.createElement('nav');
    tocMobile.className = 'toc-mobile';
    tocMobile.setAttribute('aria-label', 'Table of contents');
    tocMobile.innerHTML = tocDesktop.innerHTML;

    document.body.appendChild(mobileToggle);
    document.body.appendChild(tocMobile);

    mobileToggle.addEventListener('click', function() {
      tocMobile.classList.toggle('open');
    });

    document.addEventListener('click', function(e) {
      if (!tocMobile.contains(e.target) && !mobileToggle.contains(e.target)) {
        tocMobile.classList.remove('open');
      }
    });

    tocMobile.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        tocMobile.classList.remove('open');
      });
    });

    initScrollSpy(headings);
  }

  function initScrollSpy(headings) {
    var observerOptions = {
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        var id = entry.target.id;
        var tocLinks = document.querySelectorAll('.toc a[data-target="' + id + '"], .toc-mobile a[data-target="' + id + '"]');

        tocLinks.forEach(function(link) {
          if (entry.isIntersecting) {
            document.querySelectorAll('.toc a, .toc-mobile a').forEach(function(l) { l.classList.remove('active'); });
            link.classList.add('active');
          }
        });
      });
    }, observerOptions);

    headings.forEach(function(heading) { observer.observe(heading); });
  }

  function initPopups() {
    var article = document.querySelector('article');
    if (!article) return;

    var internalLinks = article.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]');
    if (internalLinks.length === 0) return;

    var popup = document.createElement('div');
    popup.className = 'popup';
    document.body.appendChild(popup);

    var cache = new Map();

    internalLinks.forEach(function(link) {
      var showTimeout;
      var hideTimeout;

      link.addEventListener('mouseenter', function() {
        clearTimeout(hideTimeout);

        showTimeout = setTimeout(function() {
          var href = link.getAttribute('href');
          var content = cache.get(href);

          if (content) {
            popup.innerHTML = content;
            positionPopup(popup, link);
            popup.classList.add('visible');
          } else {
            fetchPreview(href).then(function(result) {
              if (result) {
                cache.set(href, result);
                popup.innerHTML = result;
                positionPopup(popup, link);
                popup.classList.add('visible');
              }
            });
          }
        }, 300);
      });

      link.addEventListener('mouseleave', function() {
        clearTimeout(showTimeout);
        hideTimeout = setTimeout(function() {
          popup.classList.remove('visible');
        }, 100);
      });
    });
  }

  function fetchPreview(href) {
    return fetch(href).then(function(response) {
      if (!response.ok) return null;
      return response.text();
    }).then(function(html) {
      if (!html) return null;
      var parser = new DOMParser();
      var doc = parser.parseFromString(html, 'text/html');

      var titleEl = doc.querySelector('h1') || doc.querySelector('title');
      var title = titleEl ? titleEl.textContent : 'Preview';
      var firstP = doc.querySelector('article p');
      var preview = firstP ? firstP.textContent : '';
      if (preview.length > 150) preview = preview.substring(0, 150) + '...';

      if (!preview) return null;

      return '<div class="popup-title">' + title + '</div><p>' + preview + '</p>';
    });
  }

  function positionPopup(popup, target) {
    var rect = target.getBoundingClientRect();
    var popupRect = popup.getBoundingClientRect();

    var top = rect.bottom + window.scrollY + 8;
    var left = rect.left + window.scrollX;

    if (left + 300 > window.innerWidth) {
      left = window.innerWidth - 320;
    }

    if (top + popupRect.height > window.innerHeight + window.scrollY) {
      top = rect.top + window.scrollY - popupRect.height - 8;
    }

    popup.style.top = top + 'px';
    popup.style.left = left + 'px';
  }

  function init() {
    initTheme();
    updateGreeting();
    setActiveNav();

    var toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', toggleTheme);
    }

    generateTOC();
    initPopups();
    initBlogFilters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
