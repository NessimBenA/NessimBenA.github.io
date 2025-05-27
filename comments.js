// IRC-STYLE COMMENT SYSTEM - PERSISTENT COMMENTS WITH TERMINAL AESTHETIC
// Stores comments in localStorage with option for GitHub Issues backend

class IRCComments {
  constructor() {
    this.username = this.loadUsername() || this.generateUsername();
    this.pageId = this.getPageId();
    this.comments = this.loadComments();
    this.isMinimized = false;
    
    // GitHub repo info for issues backend (optional)
    this.githubRepo = 'NessimBenA/NessimBenA.github.io';
    this.useGitHub = false; // Set to true to use GitHub Issues as backend
    
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
  
  loadUsername() {
    return localStorage.getItem('irc-comments-username');
  }
  
  saveUsername(username) {
    this.username = username;
    localStorage.setItem('irc-comments-username', username);
  }
  
  getPageId() {
    // Create unique ID for each page
    const path = window.location.pathname;
    return path.replace(/[^a-z0-9]/gi, '-').replace(/^-+|-+$/g, '') || 'home';
  }
  
  getPageTitle() {
    return document.title || 'Untitled Page';
  }
  
  loadComments() {
    // Load from localStorage
    const stored = localStorage.getItem(`comments-${this.pageId}`);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // If using GitHub, we'd fetch from issues API here
    return [];
  }
  
  saveComments() {
    localStorage.setItem(`comments-${this.pageId}`, JSON.stringify(this.comments));
  }
  
  init() {
    this.createUI();
    this.bindEvents();
    this.displayComments();
    
    // Load GitHub comments if enabled
    if (this.useGitHub) {
      this.loadGitHubComments();
    }
    
    // Show welcome message
    this.addSystemMessage(`Welcome to comments for "${this.getPageTitle()}"`);
    this.addSystemMessage(`You are commenting as ${this.username}`);
    this.addSystemMessage('Type /help for commands');
  }
  
  createUI() {
    const container = document.createElement('div');
    container.className = 'irc-comments';
    container.innerHTML = `
      <div class="irc-header">
        <div class="irc-title">
          <span class="irc-channel"># Comments</span>
          <span class="irc-count">${this.comments.length} comments</span>
        </div>
        <div class="irc-controls">
          <span class="irc-minimize">_</span>
          <span class="irc-expand">□</span>
        </div>
      </div>
      <div class="irc-messages"></div>
      <div class="irc-input-container">
        <span class="irc-prompt">&lt;${this.username}&gt;</span>
        <input type="text" class="irc-input" placeholder="Leave a comment..." />
      </div>
    `;
    
    document.body.appendChild(container);
    this.injectStyles();
  }
  
  injectStyles() {
    if (document.getElementById('irc-comments-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'irc-comments-styles';
    style.textContent = `
      .irc-comments {
        position: fixed;
        bottom: 60px;
        right: 20px;
        width: 450px;
        height: 400px;
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
      
      .irc-comments.minimized {
        height: 40px;
        overflow: hidden;
      }
      
      .irc-comments.expanded {
        width: 600px;
        height: 600px;
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
      
      .irc-count {
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
      
      .irc-comment {
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        animation: fadeIn 0.3s ease;
      }
      
      .irc-comment:last-child {
        border-bottom: none;
      }
      
      .irc-comment-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
      }
      
      .irc-comment-author {
        color: var(--neon-cyan);
        font-weight: 600;
      }
      
      .irc-comment-time {
        color: var(--text-dim);
        font-size: 11px;
      }
      
      .irc-comment-text {
        color: var(--text-primary);
        line-height: 1.4;
        word-wrap: break-word;
      }
      
      .irc-comment-actions {
        margin-top: 5px;
        opacity: 0;
        transition: opacity 0.3s;
      }
      
      .irc-comment:hover .irc-comment-actions {
        opacity: 1;
      }
      
      .irc-comment-action {
        color: var(--neon-purple);
        font-size: 11px;
        cursor: pointer;
        margin-right: 10px;
      }
      
      .irc-comment-action:hover {
        color: var(--neon-pink);
        text-decoration: underline;
      }
      
      .irc-system {
        color: var(--neon-green);
        font-style: italic;
        opacity: 0.8;
        margin-bottom: 10px;
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
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .irc-badge {
        display: inline-block;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 10px;
        margin-left: 5px;
      }
      
      .irc-badge.author {
        background: var(--neon-purple);
        color: var(--bg-primary);
      }
      
      .irc-badge.mod {
        background: var(--neon-green);
        color: var(--bg-primary);
      }
      
      @media (max-width: 768px) {
        .irc-comments {
          width: calc(100% - 40px);
          right: 20px;
          left: 20px;
          bottom: 20px;
        }
        
        .irc-comments.expanded {
          width: calc(100% - 40px);
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  bindEvents() {
    const input = document.querySelector('.irc-input');
    const minimize = document.querySelector('.irc-minimize');
    const expand = document.querySelector('.irc-expand');
    const prompt = document.querySelector('.irc-prompt');
    const container = document.querySelector('.irc-comments');
    
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        this.handleInput(input.value);
        input.value = '';
      }
    });
    
    minimize.addEventListener('click', () => {
      this.isMinimized = !this.isMinimized;
      container.classList.toggle('minimized');
    });
    
    expand.addEventListener('click', () => {
      container.classList.toggle('expanded');
    });
    
    // Make draggable
    this.makeDraggable(container);
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
      this.addComment(text);
    }
  }
  
  handleCommand(cmd) {
    const [command, ...args] = cmd.slice(1).split(' ');
    
    switch(command.toLowerCase()) {
      case 'nick':
        const newName = args.join(' ').trim();
        if (newName) {
          const oldName = this.username;
          this.saveUsername(newName);
          document.querySelector('.irc-prompt').textContent = `<${newName}>`;
          this.addSystemMessage(`${oldName} is now known as ${newName}`);
        }
        break;
        
      case 'help':
        this.showHelp();
        break;
        
      case 'clear':
        if (confirm('Clear all comments on this page? This cannot be undone!')) {
          this.clearComments();
        }
        break;
        
      case 'export':
        this.exportComments();
        break;
        
      case 'github':
        this.addSystemMessage('GitHub Issues integration: ' + (this.useGitHub ? 'Enabled' : 'Disabled'));
        this.addSystemMessage(`Repository: ${this.githubRepo}`);
        break;
        
      default:
        this.addSystemMessage(`Unknown command: ${command}`);
    }
  }
  
  showHelp() {
    const commands = [
      '/nick <name> - Change your username',
      '/help - Show this help',
      '/clear - Clear all comments (requires confirmation)',
      '/export - Export comments as JSON',
      '/github - Show GitHub integration status'
    ];
    
    this.addSystemMessage('Available commands:');
    commands.forEach(cmd => this.addSystemMessage(cmd));
  }
  
  addComment(text) {
    const comment = {
      id: Date.now().toString(),
      author: this.username,
      text: text,
      timestamp: Date.now(),
      pageId: this.pageId,
      pageTitle: this.getPageTitle()
    };
    
    this.comments.push(comment);
    this.saveComments();
    this.displayComment(comment);
    this.updateCommentCount();
    
    // Play sound effect if available
    if (window.playSound) {
      window.playSound('beep');
    }
    
    // If GitHub integration is enabled, post to issues
    if (this.useGitHub) {
      this.postToGitHub(comment);
    }
  }
  
  displayComments() {
    const messagesEl = document.querySelector('.irc-messages');
    messagesEl.innerHTML = '';
    
    if (this.comments.length === 0) {
      this.addSystemMessage('No comments yet. Be the first to comment!');
    } else {
      this.comments.forEach(comment => this.displayComment(comment, false));
    }
  }
  
  displayComment(comment, animate = true) {
    const messagesEl = document.querySelector('.irc-messages');
    
    const commentEl = document.createElement('div');
    commentEl.className = 'irc-comment';
    commentEl.dataset.id = comment.id;
    
    const timeAgo = this.getTimeAgo(comment.timestamp);
    const isAuthor = comment.author === this.username;
    const isMod = comment.author === 'nessim' || comment.author.includes('admin');
    
    commentEl.innerHTML = `
      <div class="irc-comment-header">
        <span class="irc-comment-author">
          ${this.escapeHtml(comment.author)}
          ${isAuthor ? '<span class="irc-badge author">YOU</span>' : ''}
          ${isMod ? '<span class="irc-badge mod">MOD</span>' : ''}
        </span>
        <span class="irc-comment-time" title="${new Date(comment.timestamp).toLocaleString()}">
          ${timeAgo}
        </span>
      </div>
      <div class="irc-comment-text">${this.escapeHtml(comment.text)}</div>
      ${isAuthor ? `
        <div class="irc-comment-actions">
          <span class="irc-comment-action" onclick="ircComments.deleteComment('${comment.id}')">delete</span>
        </div>
      ` : ''}
    `;
    
    messagesEl.appendChild(commentEl);
    
    if (animate) {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  }
  
  deleteComment(id) {
    if (confirm('Delete this comment?')) {
      this.comments = this.comments.filter(c => c.id !== id);
      this.saveComments();
      document.querySelector(`[data-id="${id}"]`).remove();
      this.updateCommentCount();
      this.addSystemMessage('Comment deleted');
    }
  }
  
  clearComments() {
    this.comments = [];
    this.saveComments();
    this.displayComments();
    this.updateCommentCount();
    this.addSystemMessage('All comments cleared');
  }
  
  exportComments() {
    const data = JSON.stringify(this.comments, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comments-${this.pageId}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.addSystemMessage('Comments exported to JSON file');
  }
  
  updateCommentCount() {
    document.querySelector('.irc-count').textContent = `${this.comments.length} comment${this.comments.length !== 1 ? 's' : ''}`;
  }
  
  addSystemMessage(text) {
    const messagesEl = document.querySelector('.irc-messages');
    const messageEl = document.createElement('div');
    messageEl.className = 'irc-system';
    messageEl.textContent = `*** ${text}`;
    messagesEl.appendChild(messageEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
  
  getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    
    return new Date(timestamp).toLocaleDateString();
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // GitHub Issues integration (optional)
  async loadGitHubComments() {
    if (!this.useGitHub) return;
    
    try {
      // Find issue for this page
      const issueTitle = `Comments: ${this.getPageTitle()} [${this.pageId}]`;
      const response = await fetch(`https://api.github.com/repos/${this.githubRepo}/issues?labels=comments&state=all`);
      const issues = await response.json();
      
      const issue = issues.find(i => i.title === issueTitle);
      if (issue) {
        const commentsResponse = await fetch(issue.comments_url);
        const comments = await commentsResponse.json();
        
        // Merge with local comments
        comments.forEach(ghComment => {
          const comment = {
            id: `gh-${ghComment.id}`,
            author: ghComment.user.login,
            text: ghComment.body,
            timestamp: new Date(ghComment.created_at).getTime(),
            pageId: this.pageId,
            pageTitle: this.getPageTitle(),
            isGitHub: true
          };
          
          if (!this.comments.find(c => c.id === comment.id)) {
            this.comments.push(comment);
          }
        });
        
        this.comments.sort((a, b) => a.timestamp - b.timestamp);
        this.saveComments();
        this.displayComments();
      }
    } catch (error) {
      console.error('Failed to load GitHub comments:', error);
    }
  }
  
  async postToGitHub(comment) {
    // This would require GitHub OAuth or a backend service
    // For now, just log the intent
    console.log('Would post to GitHub:', comment);
    this.addSystemMessage('GitHub posting requires authentication setup');
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.ircComments = new IRCComments();
  });
} else {
  window.ircComments = new IRCComments();
}

// Console API
console.log('%c[IRC Comments] Type ircComments in console to interact', 'color: #00ffff');