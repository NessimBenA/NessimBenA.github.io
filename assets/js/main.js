// Main JavaScript file for 90s Retro Style Blog

document.addEventListener('DOMContentLoaded', (event) => {
  // Add retro cursor
  const cursor = document.createElement('div');
  cursor.classList.add('retro-cursor');
  document.body.appendChild(cursor);

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.pageX + 'px';
    cursor.style.top = e.pageY + 'px';
  });

  // Add hover effect to links
  const links = document.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('mouseenter', () => {
      cursor.classList.add('hover');
    });
    link.addEventListener('mouseleave', () => {
      cursor.classList.remove('hover');
    });
  });

  // Add "old screen" effect
  const oldScreen = document.createElement('div');
  oldScreen.classList.add('old-screen');
  document.body.appendChild(oldScreen);

  // Add random "glitch" effect
  setInterval(() => {
    oldScreen.style.opacity = Math.random() * 0.1;
  }, 100);
});

// Function to initialize syntax highlighting
function initializePrism() {
  if (typeof Prism !== 'undefined') {
    Prism.highlightAll();
  }
}

// Call the function when the page loads
window.addEventListener('load', initializePrism);