// Zarzis sunset theme - minimal enhancements

// Gentle parallax for sun element
if (window.innerWidth > 768) {
  let sun = document.querySelector('.sun');
  if (sun) {
    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      sun.style.transform = `translate(${x}px, ${y}px)`;
    });
  }
}

// Time-based greeting
const updateGreeting = () => {
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
};

// Run on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateGreeting);
} else {
  updateGreeting();
}

// Smooth fade-in for content
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe paragraphs and list items for smooth appearance
document.addEventListener('DOMContentLoaded', () => {
  const elements = document.querySelectorAll('article p, .post-list li');
  elements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
});