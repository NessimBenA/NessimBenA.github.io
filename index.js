// ULTRA RICED TERMINAL EXPERIENCE - MAXIMUM OVERDRIVE
console.log('%c⚡ SYSTEM INITIALIZING... ⚡', 'color: #00ffff; font-size: 20px; text-shadow: 0 0 10px #00ffff;');

// Global configuration
const config = {
  username: 'nessim',
  hostname: 'arch-btw',
  kernel: '6.9.420-zen',
  shell: '/usr/bin/zsh',
  wm: 'hyprland',
  terminal: 'kitty',
  uptime: '69d 4h 20m',
  packages: '1337',
  colorscheme: 'dracula-neon',
  cpu: 'AMD Threadripper 9950X @ 6.9GHz',
  gpu: 'RTX 6090 Ti Super',
  ram: '420GB DDR6 @ 9600MHz'
};

// Initialize system
document.addEventListener('DOMContentLoaded', () => {
  initializeTerminal();
  initializeMatrixRain();
  initializeParticles();
  initializeGlitchEffects();
  initializeStatusBar();
  initializeKeyboardShortcuts();
  initializeAudioSystem();
  typewriterEffect();
  
  // Show boot sequence
  bootSequence();
});

// Boot sequence animation
function bootSequence() {
  const bootMessages = [
    '[  0.000000] Linux version 6.9.420-zen (nessim@arch-btw)',
    '[  0.000001] Command line: BOOT_IMAGE=/vmlinuz-linux-zen root=/dev/nvme0n1p2 rw quiet splash',
    '[  0.000002] KERNEL supported cpus:',
    '[  0.000003]   AMD AuthenticAMD',
    '[  0.000004] x86/fpu: Supporting XSAVE feature 0x001: x87 floating point registers',
    '[  0.000005] BIOS-provided physical RAM map:',
    '[  0.000006] BIOS-e820: [mem 0x0000000000000000-0x000000000009ffff] usable',
    '[  0.000007] NX (Execute Disable) protection: active',
    '[  0.000008] DMI: ASUS ROG MAXIMUS Z790 EXTREME/ASUS ROG MAXIMUS Z790 EXTREME, BIOS 9999 04/20/2069',
    '[  0.000009] tsc: Fast TSC calibration using PIT',
    '[  0.000010] CPU: AMD Threadripper 9950X (64) @ 6.900GHz',
    '[  0.000011] GPU: NVIDIA GeForce RTX 6090 Ti Super',
    '[  0.000012] Memory: 420GB DDR6 @ 9600MHz',
    '[  0.000013] [drm] Initialized nvidia-drm 0.0.0 20160202 for 0000:01:00.0 on minor 0',
    '[  0.000014] systemd[1]: Reached target Graphical Interface.',
    '[  0.000015] systemd[1]: Starting Hyprland Wayland Compositor...',
    '[  0.000016] hyprland[420]: Compositor started successfully',
    '[  0.000017] hyprland[420]: Loading rice configuration from ~/.config/hypr/ultimate-rice.conf',
    '[  0.000018] hyprland[420]: RGB lighting synchronized',
    '[  0.000019] Welcome to the rice fields, motherfucker!'
  ];

  const bootContainer = document.createElement('div');
  bootContainer.className = 'boot-sequence';
  bootContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #000;
    color: #00ff00;
    font-family: monospace;
    font-size: 12px;
    padding: 20px;
    z-index: 9999;
    overflow: hidden;
    white-space: pre-wrap;
  `;
  document.body.appendChild(bootContainer);

  let messageIndex = 0;
  const bootInterval = setInterval(() => {
    if (messageIndex < bootMessages.length) {
      bootContainer.innerHTML += bootMessages[messageIndex] + '\n';
      bootContainer.scrollTop = bootContainer.scrollHeight;
      messageIndex++;
    } else {
      clearInterval(bootInterval);
      setTimeout(() => {
        bootContainer.style.transition = 'opacity 0.5s';
        bootContainer.style.opacity = '0';
        setTimeout(() => bootContainer.remove(), 500);
      }, 500);
    }
  }, 50);
}

// Terminal initialization
function initializeTerminal() {
  const container = document.querySelector('.book-container');
  if (!container) return;

  // Add terminal header
  const header = document.createElement('div');
  header.className = 'terminal-header';
  header.innerHTML = `
    <div class="terminal-buttons">
      <div class="terminal-button close"></div>
      <div class="terminal-button minimize"></div>
      <div class="terminal-button maximize"></div>
    </div>
    <div class="terminal-title">${config.username}@${config.hostname} - ${config.terminal}</div>
    <div class="window-controls">
      <span class="window-control">_</span>
      <span class="window-control">□</span>
      <span class="window-control">×</span>
    </div>
  `;
  container.insertBefore(header, container.firstChild);

  // Add terminal content wrapper
  const content = document.createElement('div');
  content.className = 'terminal-content';
  while (container.children.length > 1) {
    content.appendChild(container.children[1]);
  }
  container.appendChild(content);

  // Add matrix rain background
  const matrixRain = document.createElement('div');
  matrixRain.className = 'matrix-rain';
  document.body.insertBefore(matrixRain, document.body.firstChild);

  // Add corner decorations
  ['top-left', 'top-right', 'bottom-left', 'bottom-right'].forEach(pos => {
    const corner = document.createElement('div');
    corner.className = `corner-decoration ${pos}`;
    container.appendChild(corner);
  });

  // Make header h1 glitchy
  const h1 = document.querySelector('.book-header h1');
  if (h1) {
    h1.setAttribute('data-text', h1.textContent);
  }

  // Add neofetch box to home page
  if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
    addNeofetch();
  }
}

// Add neofetch-style system info
function addNeofetch() {
  const article = document.querySelector('article');
  if (!article) return;

  const neofetch = document.createElement('div');
  neofetch.className = 'neofetch-box';
  neofetch.innerHTML = `
    <div class="ascii-art">
     _   _                 _           
    | \\ | |               (_)          
    |  \\| | ___  ___ ___  _ _ __ ___  
    | . \` |/ _ \\/ __/ __|| | '_ \` _ \\ 
    | |\\  |  __/\\__ \\__ \\| | | | | | |
    |_| \\_|\\___||___/___/|_|_| |_| |_|
    </div>
    <div class="neofetch-content">
      <span class="neofetch-label">OS:</span>
      <span class="neofetch-value">Arch Linux x86_64</span>
      <span class="neofetch-label">Host:</span>
      <span class="neofetch-value">${config.hostname}</span>
      <span class="neofetch-label">Kernel:</span>
      <span class="neofetch-value">${config.kernel}</span>
      <span class="neofetch-label">Uptime:</span>
      <span class="neofetch-value">${config.uptime}</span>
      <span class="neofetch-label">Packages:</span>
      <span class="neofetch-value">${config.packages} (pacman)</span>
      <span class="neofetch-label">Shell:</span>
      <span class="neofetch-value">${config.shell}</span>
      <span class="neofetch-label">Resolution:</span>
      <span class="neofetch-value">${window.screen.width}x${window.screen.height}</span>
      <span class="neofetch-label">WM:</span>
      <span class="neofetch-value">${config.wm}</span>
      <span class="neofetch-label">Terminal:</span>
      <span class="neofetch-value">${config.terminal}</span>
      <span class="neofetch-label">CPU:</span>
      <span class="neofetch-value">${config.cpu}</span>
      <span class="neofetch-label">GPU:</span>
      <span class="neofetch-value">${config.gpu}</span>
      <span class="neofetch-label">Memory:</span>
      <span class="neofetch-value">${config.ram}</span>
    </div>
  `;
  
  // Insert after the first paragraph
  const firstP = article.querySelector('p');
  if (firstP && firstP.nextSibling) {
    article.insertBefore(neofetch, firstP.nextSibling);
  } else {
    article.appendChild(neofetch);
  }
}

// Matrix rain effect
function initializeMatrixRain() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    opacity: 0.05;
  `;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const matrix = '01';
  const matrixArray = matrix.split('');
  const fontSize = 10;
  const columns = canvas.width / fontSize;
  const drops = [];

  for (let i = 0; i < columns; i++) {
    drops[i] = 1;
  }

  function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#0f0';
    ctx.font = fontSize + 'px monospace';

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

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// Particle system
function initializeParticles() {
  const particlesContainer = document.createElement('div');
  particlesContainer.className = 'particles';
  document.body.appendChild(particlesContainer);

  for (let i = 0; i < 50; i++) {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: absolute;
      width: 2px;
      height: 2px;
      background: ${['var(--neon-cyan)', 'var(--neon-pink)', 'var(--neon-purple)'][i % 3]};
      box-shadow: 0 0 10px currentColor;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation: float ${10 + Math.random() * 20}s infinite linear;
    `;
    particlesContainer.appendChild(particle);
  }

  // Add floating animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes float {
      from {
        transform: translate(0, 100vh) rotate(0deg);
        opacity: 0;
      }
      10% {
        opacity: 1;
      }
      90% {
        opacity: 1;
      }
      to {
        transform: translate(${Math.random() * 200 - 100}px, -100vh) rotate(720deg);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

// Glitch effects
function initializeGlitchEffects() {
  const glitchTargets = document.querySelectorAll('h1, h2, h3');
  
  glitchTargets.forEach(target => {
    target.addEventListener('mouseenter', () => {
      target.style.animation = 'glitch 0.3s infinite';
      setTimeout(() => {
        target.style.animation = '';
      }, 300);
    });
  });

  // Random glitch on page elements
  setInterval(() => {
    if (Math.random() > 0.95) {
      const elements = document.querySelectorAll('p, li, a');
      const randomElement = elements[Math.floor(Math.random() * elements.length)];
      if (randomElement) {
        randomElement.style.transform = `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`;
        randomElement.style.filter = 'hue-rotate(180deg)';
        setTimeout(() => {
          randomElement.style.transform = '';
          randomElement.style.filter = '';
        }, 100);
      }
    }
  }, 3000);
}

// Status bar
function initializeStatusBar() {
  const statusBar = document.createElement('div');
  statusBar.className = 'status-bar';
  statusBar.innerHTML = `
    <div class="status-left">
      <div class="status-item active">
        <span>⚡</span>
        <span>NORMAL</span>
      </div>
      <div class="status-item">
        <span>📁</span>
        <span>${window.location.pathname}</span>
      </div>
      <div class="status-item">
        <span>🔥</span>
        <span>UTF-8</span>
      </div>
    </div>
    <div class="status-right">
      <div class="status-item">
        <span>⚙️</span>
        <span>${config.wm}</span>
      </div>
      <div class="status-item">
        <span>💾</span>
        <span id="memory-usage">69.420GB</span>
      </div>
      <div class="status-item">
        <span>🕐</span>
        <span id="clock">00:00:00</span>
      </div>
    </div>
  `;
  document.body.appendChild(statusBar);

  // Update clock
  setInterval(() => {
    const now = new Date();
    document.getElementById('clock').textContent = 
      now.toTimeString().split(' ')[0];
  }, 1000);

  // Fake memory usage updates
  setInterval(() => {
    const usage = (68 + Math.random() * 4).toFixed(3);
    document.getElementById('memory-usage').textContent = `${usage}GB`;
  }, 5000);
}

// Keyboard shortcuts
function initializeKeyboardShortcuts() {
  let konamiCode = [];
  const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  
  document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
      activateUltraRiceMode();
    }

    // Vim-style navigation
    if (e.key === 'j') window.scrollBy(0, 50);
    if (e.key === 'k') window.scrollBy(0, -50);
    if (e.key === 'g' && e.shiftKey) window.scrollTo(0, document.body.scrollHeight);
    if (e.key === 'g' && !e.shiftKey) window.scrollTo(0, 0);
    
    // Matrix mode
    if (e.key === 'm' && e.ctrlKey) {
      document.body.classList.toggle('matrix-mode');
    }
  });
}

// Ultra rice mode activation
function activateUltraRiceMode() {
  console.log('%c🔥 ULTRA RICE MODE ACTIVATED 🔥', 'color: #ff0080; font-size: 30px; text-shadow: 0 0 20px #ff0080;');
  
  document.body.classList.add('rgb-glow');
  
  // Create rainbow wave
  const wave = document.createElement('div');
  wave.style.cssText = `
    position: fixed;
    top: 0;
    left: -100%;
    width: 200%;
    height: 100%;
    background: linear-gradient(90deg, 
      #ff0080, #ff8c00, #ffd700, #00ff00, 
      #00ffff, #0080ff, #8000ff, #ff0080);
    opacity: 0.3;
    animation: rainbow-wave 3s linear;
    pointer-events: none;
    z-index: 9999;
  `;
  document.body.appendChild(wave);
  
  setTimeout(() => wave.remove(), 3000);
  
  // Add more particles
  initializeParticles();
  
  // Play sound effect if available
  playSound('powerup');
}

// Audio system
function initializeAudioSystem() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  window.playSound = (type) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch(type) {
      case 'beep':
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.1;
        break;
      case 'error':
        oscillator.frequency.value = 200;
        gainNode.gain.value = 0.2;
        break;
      case 'powerup':
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);
        gainNode.gain.value = 0.2;
        break;
    }
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };
  
  // Play beep on link hover
  document.querySelectorAll('a').forEach(link => {
    link.addEventListener('mouseenter', () => playSound('beep'));
  });
}

// Typewriter effect for content
function typewriterEffect() {
  const elements = document.querySelectorAll('.typewriter');
  
  elements.forEach(el => {
    const text = el.textContent;
    el.textContent = '';
    el.style.visibility = 'visible';
    
    let i = 0;
    const typing = setInterval(() => {
      if (i < text.length) {
        el.textContent += text.charAt(i);
        i++;
      } else {
        clearInterval(typing);
        // Add cursor at the end
        const cursor = document.createElement('span');
        cursor.className = 'cursor';
        el.appendChild(cursor);
      }
    }, 50);
  });
}

// Custom cursor
document.addEventListener('mousemove', (e) => {
  const cursor = document.querySelector('.custom-cursor') || createCustomCursor();
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});

function createCustomCursor() {
  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  cursor.style.cssText = `
    position: fixed;
    width: 20px;
    height: 20px;
    border: 2px solid var(--neon-cyan);
    border-radius: 50%;
    pointer-events: none;
    z-index: 10000;
    transition: transform 0.1s ease;
    mix-blend-mode: screen;
  `;
  document.body.appendChild(cursor);
  return cursor;
}

// Page transition effects
document.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', (e) => {
    if (link.hostname === window.location.hostname && !link.hash) {
      e.preventDefault();
      const href = link.href;
      
      // Glitch transition
      document.body.style.animation = 'glitch 0.5s';
      
      setTimeout(() => {
        window.location.href = href;
      }, 500);
    }
  });
});

// Add rainbow wave animation
const style = document.createElement('style');
style.textContent = `
  @keyframes rainbow-wave {
    from { transform: translateX(0); }
    to { transform: translateX(100%); }
  }
  
  .matrix-mode {
    filter: hue-rotate(180deg) contrast(2) brightness(1.5);
  }
  
  .matrix-mode * {
    animation: matrix-text 0.1s infinite;
  }
  
  @keyframes matrix-text {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }
`;
document.head.appendChild(style);

// Performance monitor
let fps = 0;
let lastTime = performance.now();
function updateFPS() {
  const currentTime = performance.now();
  fps = Math.round(1000 / (currentTime - lastTime));
  lastTime = currentTime;
  requestAnimationFrame(updateFPS);
}
updateFPS();

// Easter egg console
console.log(`
%c
███    ██ ███████ ███████ ███████ ██ ███    ███ 
████   ██ ██      ██      ██      ██ ████  ████ 
██ ██  ██ █████   ███████ ███████ ██ ██ ████ ██ 
██  ██ ██ ██           ██      ██ ██ ██  ██  ██ 
██   ████ ███████ ███████ ███████ ██ ██      ██ 

Welcome to the rice fields!
Type 'help()' for secret commands
`, 'color: #00ffff; font-family: monospace;');

window.help = () => {
  console.log(`
Available commands:
- rice() : Activate maximum rice
- vim() : Enable vim mode
- hack() : Hack the mainframe
- neofetch() : Show system info
- btw() : I use Arch btw
  `);
};

window.rice = () => activateUltraRiceMode();
window.vim = () => console.log('Already in vim mode. Press :q! to exit (jk you can\'t)');
window.hack = () => {
  console.log('%cACCESS GRANTED', 'color: #00ff00; font-size: 20px;');
  console.log('Hacking the mainframe...');
  setTimeout(() => console.log('Just kidding, please don\'t hack me'), 1000);
};
window.neofetch = () => console.log(document.querySelector('.neofetch-box')?.innerText || 'Run on home page');
window.btw = () => console.log('%cI use Arch btw', 'color: #1793d1; font-size: 30px; font-weight: bold;');

// ULTIMATE RGB SYNC
setInterval(() => {
  const hue = (Date.now() / 50) % 360;
  document.documentElement.style.setProperty('--dynamic-hue', hue);
}, 50);