// Main JavaScript file for 90s Hacker themed blog

document.addEventListener('DOMContentLoaded', (event) => {
  // Matrix rain effect
  const canvas = document.getElementById('matrix-rain');
  const ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const matrix = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%";
  const matrixArray = matrix.split("");
  const fontSize = 10;
  const columns = canvas.width / fontSize;
  const drops = [];

  for (let x = 0; x < columns; x++) {
    drops[x] = 1;
  }

  function drawMatrix() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.04)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0F0";
    ctx.font = fontSize + "px monospace";

    for (let i = 0; i < drops.length; i++) {
      const text = matrixArray[Math.floor(Math.random() * matrixArray.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  setInterval(drawMatrix, 35);

  // Typewriter effect for site title
  const siteTitle = document.querySelector('.site-title');
  if (siteTitle) {
    const text = siteTitle.textContent;
    siteTitle.textContent = '';
    let i = 0;
    const typeWriter = () => {
      if (i < text.length) {
        siteTitle.textContent += text.charAt(i);
        i++;
        setTimeout(typeWriter, 100);
      }
    };
    typeWriter();
  }

  // Glitch effect on hover for links
  const glitchLinks = document.querySelectorAll('a');
  glitchLinks.forEach(link => {
    link.addEventListener('mouseover', (e) => {
      const originalText = e.target.textContent;
      const glitchText = originalText.split('').map(char => {
        return Math.random() > 0.8 ? String.fromCharCode(Math.floor(Math.random() * 26) + 97) : char;
      }).join('');
      e.target.textContent = glitchText;
      setTimeout(() => {
        e.target.textContent = originalText;
      }, 200);
    });
  });

  // Glow effect for headings
  const headings = document.querySelectorAll('h1, h2, h3');
  headings.forEach(heading => {
    heading.classList.add('glow');
  });

  // Flicker effect for certain elements
  const flickerElements = document.querySelectorAll('.flicker');
  flickerElements.forEach(element => {
    element.style.animation = 'flicker 2s linear infinite';
  });
});

// Function to initialize syntax highlighting
function initializePrism() {
  if (typeof Prism !== 'undefined') {
    Prism.highlightAll();
  }
}

// Call the function when the page loads
window.addEventListener('load', initializePrism);

// Resize event listener for matrix rain
window.addEventListener('resize', () => {
  const canvas = document.getElementById('matrix-rain');
  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
});