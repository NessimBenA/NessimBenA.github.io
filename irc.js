// P2P IRC SYSTEM - MAXIMUM DECENTRALIZATION
// No servers, no masters, only peers!

class P2PIRC {
  constructor() {
    this.peer = null;
    this.connections = new Map();
    this.messages = [];
    this.username = this.generateUsername();
    this.channel = this.getChannelName();
    this.userId = this.generateUserId();
    this.messageHandlers = new Set();
    this.isMinimized = false;
    
    // PeerJS config - using public servers for STUN/TURN
    this.peerConfig = {
      host: 'peerjs.com',
      port: 443,
      path: '/',
      secure: true,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          {
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelayproject',
            credential: 'openrelayproject'
          }
        ]
      },
      debug: 2
    };
    
    this.init();
  }
  
  generateUsername() {
    const adjectives = ['neon', 'cyber', 'digital', 'quantum', 'neural', 'chrome', 'pixel', 'binary', 'ghost', 'matrix'];
    const nouns = ['samurai', 'hacker', 'ninja', 'wizard', 'phoenix', 'dragon', 'wolf', 'raven', 'knight', 'shadow'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 1337);
    return `${adj}_${noun}_${num}`;
  }
  
  generateUserId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  getChannelName() {
    const path = window.location.pathname;
    if (path === '/' || path === '/index.html') return '#general';
    if (path.includes('blog')) return '#blog';
    if (path.includes('projects')) return '#projects';
    return `#${path.replace(/[^a-z0-9]/gi, '')}`;
  }
  
  async init() {
    // Create IRC UI
    this.createUI();
    
    try {
      // Initialize PeerJS with fallback
      this.peer = new Peer(this.userId, this.peerConfig);
      
      this.peer.on('open', (id) => {
        console.log('%c[P2P IRC] Connected with ID: ' + id, 'color: #00ffff');
        this.addSystemMessage(`Connected to P2P network as ${this.username}`);
        this.connectToNetwork();
      });
      
      this.peer.on('connection', (conn) => {
        this.handleNewConnection(conn);
      });
      
      this.peer.on('error', (err) => {
        console.error('[P2P IRC] Error:', err);
        
        if (err.type === 'peer-unavailable') {
          // Expected error when peer doesn't exist yet
          return;
        }
        
        if (err.type === 'unavailable-id' || err.type === 'invalid-id') {
          // Try with a random ID
          this.userId = 'user-' + Math.random().toString(36).substr(2, 9);
          this.peer = new Peer(this.userId, this.peerConfig);
          return;
        }
        
        if (err.type === 'network' || err.type === 'server-error') {
          // Fallback to simple mode without PeerJS server
          this.addSystemMessage('Running in local mode (cross-tab chat only)');
          this.runLocalMode();
          return;
        }
        
        this.addSystemMessage(`Error: ${err.type}`);
      });
    } catch (e) {
      console.error('[P2P IRC] Failed to initialize:', e);
      this.addSystemMessage('Running in local mode (cross-tab chat only)');
      this.runLocalMode();
    }
  }
  
  runLocalMode() {
    // Fallback mode using only BroadcastChannel and localStorage
    this.localMode = true;
    this.addSystemMessage('Chat is limited to tabs on the same device');
    
    // Still announce via local methods
    this.announceViaLocalStorage();
    this.announceViaBroadcastChannel();
    
    // Simulate connection for UI
    this.updateUserCount();
  }
  
  createUI() {
    // Main IRC container
    const ircContainer = document.createElement('div');
    ircContainer.className = 'irc-terminal';
    ircContainer.innerHTML = `
      <div class="irc-header">
        <div class="irc-title">
          <span class="irc-channel">${this.channel}</span>
          <span class="irc-users">0 users</span>
        </div>
        <div class="irc-controls">
          <span class="irc-minimize">_</span>
          <span class="irc-close">×</span>
        </div>
      </div>
      <div class="irc-messages"></div>
      <div class="irc-input-container">
        <span class="irc-prompt">&lt;${this.username}&gt;</span>
        <input type="text" class="irc-input" placeholder="Type your message..." />
      </div>
    `;
    
    document.body.appendChild(ircContainer);
    
    // Add styles
    this.injectStyles();
    
    // Bind events
    this.bindEvents();
    
    // Make draggable
    this.makeDraggable(ircContainer);
  }
  
  injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .irc-terminal {
        position: fixed;
        bottom: 60px;
        right: 20px;
        width: 450px;
        height: 350px;
        background: rgba(11, 16, 23, 0.98);
        border: 1px solid var(--neon-cyan);
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        z-index: 1000;
        box-shadow: 
          0 0 20px rgba(0, 255, 255, 0.5),
          inset 0 0 20px rgba(0, 255, 255, 0.1);
        font-family: var(--font-mono);
        font-size: 13px;
        transition: all 0.3s ease;
      }
      
      .irc-terminal.minimized {
        height: 40px;
        overflow: hidden;
      }
      
      .irc-header {
        background: var(--bg-secondary);
        padding: 10px;
        border-bottom: 1px solid var(--neon-purple);
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: move;
        user-select: none;
      }
      
      .irc-title {
        display: flex;
        gap: 15px;
        align-items: center;
      }
      
      .irc-channel {
        color: var(--neon-yellow);
        font-weight: 600;
        text-shadow: 0 0 5px var(--neon-yellow);
      }
      
      .irc-users {
        color: var(--text-secondary);
        font-size: 12px;
      }
      
      .irc-controls {
        display: flex;
        gap: 10px;
      }
      
      .irc-controls span {
        cursor: pointer;
        color: var(--text-secondary);
        transition: all 0.3s;
        padding: 0 5px;
      }
      
      .irc-controls span:hover {
        color: var(--neon-cyan);
        text-shadow: 0 0 5px var(--neon-cyan);
      }
      
      .irc-messages {
        flex: 1;
        overflow-y: auto;
        padding: 10px;
        font-family: var(--font-mono);
        scrollbar-width: thin;
        scrollbar-color: var(--neon-purple) var(--bg-secondary);
      }
      
      .irc-messages::-webkit-scrollbar {
        width: 8px;
      }
      
      .irc-messages::-webkit-scrollbar-track {
        background: var(--bg-secondary);
      }
      
      .irc-messages::-webkit-scrollbar-thumb {
        background: var(--neon-purple);
        border-radius: 4px;
      }
      
      .irc-message {
        margin-bottom: 5px;
        line-height: 1.4;
        word-wrap: break-word;
      }
      
      .irc-timestamp {
        color: var(--text-dim);
        font-size: 11px;
      }
      
      .irc-username {
        color: var(--neon-cyan);
        font-weight: 600;
      }
      
      .irc-text {
        color: var(--text-primary);
      }
      
      .irc-system {
        color: var(--neon-green);
        font-style: italic;
        opacity: 0.8;
      }
      
      .irc-action {
        color: var(--neon-purple);
        font-style: italic;
      }
      
      .irc-input-container {
        display: flex;
        align-items: center;
        padding: 10px;
        border-top: 1px solid var(--border-color);
        background: var(--bg-secondary);
      }
      
      .irc-prompt {
        color: var(--neon-green);
        margin-right: 10px;
        font-weight: 600;
        white-space: nowrap;
      }
      
      .irc-input {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        color: var(--text-primary);
        font-family: var(--font-mono);
        font-size: 13px;
      }
      
      .irc-input::placeholder {
        color: var(--text-dim);
      }
      
      @keyframes newMessage {
        0% { opacity: 0; transform: translateY(10px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      
      .irc-message {
        animation: newMessage 0.3s ease;
      }
      
      /* Mobile responsive */
      @media (max-width: 768px) {
        .irc-terminal {
          width: calc(100% - 40px);
          right: 20px;
          left: 20px;
          bottom: 20px;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  bindEvents() {
    const input = document.querySelector('.irc-input');
    const minimize = document.querySelector('.irc-minimize');
    const close = document.querySelector('.irc-close');
    const prompt = document.querySelector('.irc-prompt');
    
    // Input handling
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        this.handleInput(input.value);
        input.value = '';
      }
    });
    
    // Update prompt when username changes
    this.on('usernameChange', (newName) => {
      prompt.textContent = `<${newName}>`;
    });
    
    // Window controls
    minimize.addEventListener('click', () => {
      this.isMinimized = !this.isMinimized;
      document.querySelector('.irc-terminal').classList.toggle('minimized');
    });
    
    close.addEventListener('click', () => {
      this.destroy();
    });
  }
  
  makeDraggable(element) {
    const header = element.querySelector('.irc-header');
    let isDragging = false;
    let startX, startY, initialX, initialY;
    
    header.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('irc-controls') || e.target.parentElement.classList.contains('irc-controls')) return;
      
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = element.getBoundingClientRect();
      initialX = rect.left;
      initialY = rect.top;
      
      document.addEventListener('mousemove', drag);
      document.addEventListener('mouseup', stopDrag);
    });
    
    function drag(e) {
      if (!isDragging) return;
      
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      
      element.style.left = `${initialX + dx}px`;
      element.style.top = `${initialY + dy}px`;
      element.style.right = 'auto';
      element.style.bottom = 'auto';
    }
    
    function stopDrag() {
      isDragging = false;
      document.removeEventListener('mousemove', drag);
      document.removeEventListener('mouseup', stopDrag);
    }
  }
  
  handleInput(text) {
    if (text.startsWith('/')) {
      this.handleCommand(text);
    } else {
      this.sendMessage({
        type: 'message',
        username: this.username,
        text: text,
        timestamp: Date.now(),
        userId: this.userId
      });
    }
  }
  
  handleCommand(cmd) {
    const [command, ...args] = cmd.slice(1).split(' ');
    
    switch(command.toLowerCase()) {
      case 'nick':
        const newName = args.join(' ');
        if (newName) {
          const oldName = this.username;
          this.username = newName;
          this.emit('usernameChange', newName);
          this.sendMessage({
            type: 'nick',
            oldName: oldName,
            newName: newName,
            userId: this.userId
          });
        }
        break;
        
      case 'me':
        this.sendMessage({
          type: 'action',
          username: this.username,
          text: args.join(' '),
          timestamp: Date.now(),
          userId: this.userId
        });
        break;
        
      case 'users':
        this.showUsers();
        break;
        
      case 'help':
        this.showHelp();
        break;
        
      case 'matrix':
        this.sendMessage({
          type: 'effect',
          effect: 'matrix',
          username: this.username
        });
        break;
        
      default:
        this.addSystemMessage(`Unknown command: ${command}`);
    }
  }
  
  connectToNetwork() {
    // Use a deterministic peer ID based on channel for discovery
    // This creates a "bootstrap" peer for each channel
    const channelHash = this.hashCode(this.channel);
    const bootstrapPeerId = `bootstrap-${channelHash}-${Math.floor(Date.now() / 60000)}`; // Changes every minute
    
    // Try to connect to bootstrap peer
    if (bootstrapPeerId !== this.userId) {
      this.connectToPeer(bootstrapPeerId);
    }
    
    // Also try to BE the bootstrap peer
    this.tryBecomeBootstrap(bootstrapPeerId);
    
    // Additionally, store and retrieve peer IDs from localStorage
    this.loadKnownPeers();
    
    // Announce ourselves via other methods
    this.announceViaLocalStorage();
    this.announceViaBroadcastChannel();
  }
  
  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
  
  tryBecomeBootstrap(bootstrapId) {
    // Try to claim the bootstrap ID
    setTimeout(() => {
      if (this.connections.size === 0 && this.peer.id !== bootstrapId) {
        // Become a bootstrap peer by creating a new peer with the bootstrap ID
        console.log('[P2P IRC] Attempting to become bootstrap peer...');
      }
    }, 2000);
  }
  
  loadKnownPeers() {
    const knownPeers = JSON.parse(localStorage.getItem('p2p-irc-peers') || '[]');
    const recentPeers = knownPeers.filter(p => Date.now() - p.timestamp < 300000); // 5 minutes
    
    recentPeers.forEach(p => {
      if (p.channel === this.channel && p.peerId !== this.userId) {
        this.connectToPeer(p.peerId);
      }
    });
  }
  
  announceViaLocalStorage() {
    // Announce our presence via localStorage (works across tabs)
    const peers = JSON.parse(localStorage.getItem('p2p-irc-peers') || '[]');
    peers.push({
      peerId: this.userId,
      channel: this.channel,
      timestamp: Date.now()
    });
    
    // Keep only recent peers
    const recentPeers = peers.filter(p => Date.now() - p.timestamp < 300000);
    localStorage.setItem('p2p-irc-peers', JSON.stringify(recentPeers));
    
    // Listen for storage events (new peers in other tabs)
    window.addEventListener('storage', (e) => {
      if (e.key === 'p2p-irc-peers') {
        this.loadKnownPeers();
      }
    });
  }
  
  announceViaBroadcastChannel() {
    // Use BroadcastChannel API for same-origin peer discovery
    if (typeof BroadcastChannel !== 'undefined') {
      this.broadcast = new BroadcastChannel('p2p-irc-discovery');
      
      // Announce ourselves
      this.broadcast.postMessage({
        type: 'announce',
        peerId: this.userId,
        channel: this.channel
      });
      
      // Listen for other peers and messages
      this.broadcast.onmessage = (e) => {
        if (e.data.type === 'announce' && e.data.channel === this.channel && e.data.peerId !== this.userId) {
          if (!this.localMode) {
            this.connectToPeer(e.data.peerId);
          }
        } else if (e.data.type === 'message' && e.data.channel === this.channel) {
          // Handle messages in local mode
          if (this.localMode && e.data.data.userId !== this.userId) {
            this.handleMessage(e.data.data, { peer: 'broadcast' });
          }
        }
      };
    }
  }
  
  connectToPeer(peerId) {
    if (this.connections.has(peerId)) return;
    
    const conn = this.peer.connect(peerId);
    
    conn.on('open', () => {
      this.handleNewConnection(conn);
      
      // Send initial handshake
      conn.send({
        type: 'handshake',
        username: this.username,
        channel: this.channel,
        userId: this.userId,
        peers: Array.from(this.connections.keys())
      });
    });
  }
  
  handleNewConnection(conn) {
    this.connections.set(conn.peer, conn);
    this.updateUserCount();
    
    conn.on('data', (data) => {
      this.handleMessage(data, conn);
    });
    
    conn.on('close', () => {
      this.connections.delete(conn.peer);
      this.updateUserCount();
      this.addSystemMessage(`User disconnected`);
    });
  }
  
  handleMessage(data, fromConn) {
    switch(data.type) {
      case 'handshake':
        // Connect to their peers too (mesh network)
        data.peers.forEach(peerId => this.connectToPeer(peerId));
        this.addSystemMessage(`${data.username} joined ${data.channel}`);
        break;
        
      case 'message':
        this.addMessage(data.username, data.text, data.timestamp);
        // Relay to other peers (flooding protocol)
        this.relay(data, fromConn.peer);
        break;
        
      case 'action':
        this.addAction(data.username, data.text);
        this.relay(data, fromConn.peer);
        break;
        
      case 'nick':
        this.addSystemMessage(`${data.oldName} is now known as ${data.newName}`);
        this.relay(data, fromConn.peer);
        break;
        
      case 'effect':
        if (data.effect === 'matrix') {
          this.triggerMatrixEffect();
          this.addSystemMessage(`${data.username} triggered the matrix!`);
        }
        this.relay(data, fromConn.peer);
        break;
    }
  }
  
  relay(data, excludePeer) {
    // Prevent infinite loops by adding seen messages
    if (!data.messageId) {
      data.messageId = `${Date.now()}-${Math.random()}`;
    }
    
    if (this.seenMessages && this.seenMessages.has(data.messageId)) return;
    
    if (!this.seenMessages) this.seenMessages = new Set();
    this.seenMessages.add(data.messageId);
    
    // Clean old seen messages
    if (this.seenMessages.size > 1000) {
      const arr = Array.from(this.seenMessages);
      this.seenMessages = new Set(arr.slice(-500));
    }
    
    // Relay to all peers except the sender
    this.connections.forEach((conn, peerId) => {
      if (peerId !== excludePeer && conn.open) {
        conn.send(data);
      }
    });
  }
  
  sendMessage(data) {
    // Add to our own view
    switch(data.type) {
      case 'message':
        this.addMessage(data.username, data.text, data.timestamp);
        break;
      case 'action':
        this.addAction(data.username, data.text);
        break;
      case 'nick':
        this.addSystemMessage(`You are now known as ${data.newName}`);
        break;
    }
    
    // Send to all peers
    data.messageId = `${Date.now()}-${Math.random()}`;
    
    if (this.localMode) {
      // In local mode, use BroadcastChannel
      if (this.broadcast) {
        this.broadcast.postMessage({
          type: 'message',
          data: data,
          channel: this.channel
        });
      }
    } else {
      // Normal P2P mode
      this.connections.forEach(conn => {
        if (conn.open) {
          conn.send(data);
        }
      });
    }
  }
  
  addMessage(username, text, timestamp) {
    const messagesEl = document.querySelector('.irc-messages');
    const time = new Date(timestamp).toTimeString().slice(0, 5);
    
    const messageEl = document.createElement('div');
    messageEl.className = 'irc-message';
    messageEl.innerHTML = `
      <span class="irc-timestamp">[${time}]</span>
      <span class="irc-username">&lt;${this.escapeHtml(username)}&gt;</span>
      <span class="irc-text">${this.escapeHtml(text)}</span>
    `;
    
    messagesEl.appendChild(messageEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    
    // Play notification sound
    if (username !== this.username) {
      this.playNotification();
    }
  }
  
  addAction(username, text) {
    const messagesEl = document.querySelector('.irc-messages');
    
    const messageEl = document.createElement('div');
    messageEl.className = 'irc-message irc-action';
    messageEl.innerHTML = `* ${this.escapeHtml(username)} ${this.escapeHtml(text)}`;
    
    messagesEl.appendChild(messageEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
  
  addSystemMessage(text) {
    const messagesEl = document.querySelector('.irc-messages');
    
    const messageEl = document.createElement('div');
    messageEl.className = 'irc-message irc-system';
    messageEl.textContent = `*** ${text}`;
    
    messagesEl.appendChild(messageEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
  
  updateUserCount() {
    const count = this.connections.size + 1; // +1 for self
    document.querySelector('.irc-users').textContent = `${count} user${count !== 1 ? 's' : ''}`;
  }
  
  showUsers() {
    this.addSystemMessage(`Users in ${this.channel}:`);
    this.addSystemMessage(`- ${this.username} (you)`);
    let userCount = 1;
    this.connections.forEach((conn) => {
      if (conn.open) {
        this.addSystemMessage(`- peer_${conn.peer.slice(0, 8)}`);
        userCount++;
      }
    });
    this.addSystemMessage(`Total: ${userCount} users`);
  }
  
  showHelp() {
    const commands = [
      '/nick <name> - Change nickname',
      '/me <action> - Action text',
      '/users - List users',
      '/matrix - Trigger matrix effect',
      '/help - Show this help'
    ];
    
    this.addSystemMessage('Available commands:');
    commands.forEach(cmd => this.addSystemMessage(cmd));
  }
  
  triggerMatrixEffect() {
    // Trigger a visual effect on the page
    document.body.style.animation = 'matrix-text 1s';
    setTimeout(() => {
      document.body.style.animation = '';
    }, 1000);
  }
  
  playNotification() {
    // Use the existing playSound function if available
    if (window.playSound) {
      window.playSound('beep');
    }
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  on(event, handler) {
    this.messageHandlers.add({ event, handler });
  }
  
  emit(event, data) {
    this.messageHandlers.forEach(({ event: e, handler }) => {
      if (e === event) handler(data);
    });
  }
  
  destroy() {
    // Close all connections
    this.connections.forEach(conn => conn.close());
    
    // Destroy peer
    if (this.peer) {
      this.peer.destroy();
    }
    
    // Remove UI
    document.querySelector('.irc-terminal')?.remove();
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.p2pIRC = new P2PIRC();
  });
} else {
  window.p2pIRC = new P2PIRC();
}

// Console API
window.irc = {
  send: (msg) => window.p2pIRC?.handleInput(msg),
  nick: (name) => window.p2pIRC?.handleInput(`/nick ${name}`),
  users: () => window.p2pIRC?.handleInput('/users'),
  help: () => window.p2pIRC?.handleInput('/help')
};

console.log('%c[P2P IRC] Initialized! Type irc.help() for commands', 'color: #00ffff');