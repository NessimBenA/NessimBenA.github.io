// IRC-STYLE COMMENT SYSTEM - PERSISTENT COMMENTS WITH TERMINAL AESTHETIC
// SNEAKY: Uses GitHub Issues as backend via utterances-like approach!

class IRCComments {
  constructor() {
    this.username = this.loadUsername() || this.generateUsername();
    this.pageId = this.getPageId();
    this.pageTitle = this.getPageTitle();
    this.comments = [];
    this.isMinimized = false;
    
    // GitHub repo info - WHERE THE MAGIC HAPPENS
    this.owner = 'NessimBenA';
    this.repo = 'NessimBenA.github.io';
    this.label = 'comments';
    this.issueNumber = null;
    
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
  
  async loadComments() {
    try {
      // Search for existing issue for this page
      const searchQuery = `repo:${this.owner}/${this.repo} is:issue label:${this.label} "${this.pageId}" in:title`;
      const searchResponse = await fetch(`https://api.github.com/search/issues?q=${encodeURIComponent(searchQuery)}`);
      const searchData = await searchResponse.json();
      
      if (searchData.items && searchData.items.length > 0) {
        const issue = searchData.items[0];
        this.issueNumber = issue.number;
        
        // Load comments from the issue
        const commentsResponse = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/issues/${issue.number}/comments`);
        const comments = await commentsResponse.json();
        
        return comments;
      }
    } catch (error) {
      console.error('Failed to load GitHub comments:', error);
    }
    
    return [];
  }
  
  async init() {
    this.createUI();
    this.bindEvents();
    
    // Show loading message
    this.addSystemMessage('Loading comments from GitHub...');
    
    // Load comments from GitHub
    this.comments = await this.loadComments();
    this.displayComments();
    
    // Show welcome message
    this.addSystemMessage(`Welcome to comments for "${this.getPageTitle()}"`);
    if (this.issueNumber) {
      this.addSystemMessage(`💬 Powered by GitHub Issue #${this.issueNumber}`);
    } else {
      this.addSystemMessage('📝 Comments will create a new GitHub issue');
    }
    this.addSystemMessage('🔗 Sign in with GitHub to comment');
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
      
      .irc-avatar {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 1px solid var(--neon-cyan);
        margin-right: 8px;
        vertical-align: middle;
      }
      
      .irc-comment-author a {
        color: var(--neon-cyan);
        text-decoration: none;
      }
      
      .irc-comment-author a:hover {
        text-decoration: underline;
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
        
      case 'refresh':
        location.reload();
        break;
        
      case 'github':
        if (this.issueNumber) {
          window.open(`https://github.com/${this.owner}/${this.repo}/issues/${this.issueNumber}`, '_blank');
        } else {
          this.addSystemMessage('No GitHub issue created yet for this page');
        }
        break;
        
      default:
        this.addSystemMessage(`Unknown command: ${command}`);
    }
  }
  
  showHelp() {
    const commands = [
      '/nick <name> - Change your display name',
      '/help - Show this help',
      '/refresh - Refresh comments from GitHub',
      '/github - Open this page\'s GitHub issue'
    ];
    
    this.addSystemMessage('Available commands:');
    commands.forEach(cmd => this.addSystemMessage(cmd));
  }
  
  addComment(text) {
    // For GitHub comments, we need to redirect to GitHub
    const issueTitle = `Comments: ${this.pageTitle} [${this.pageId}]`;
    const issueBody = this.issueNumber ? 
      text : // If issue exists, just use the comment text
      `Page: ${window.location.href}\n\n---\n\n${text}`; // For new issue, include page info
    
    // Create GitHub issue URL
    let githubUrl;
    if (this.issueNumber) {
      // Comment on existing issue
      githubUrl = `https://github.com/${this.owner}/${this.repo}/issues/${this.issueNumber}#issuecomment-new`;
    } else {
      // Create new issue
      const params = new URLSearchParams({
        title: issueTitle,
        body: issueBody,
        labels: this.label
      });
      githubUrl = `https://github.com/${this.owner}/${this.repo}/issues/new?${params}`;
    }
    
    // Show message
    this.addSystemMessage('🚀 Redirecting to GitHub to post comment...');
    this.addSystemMessage('Sign in with GitHub if needed');
    
    // Open GitHub in new tab
    window.open(githubUrl, '_blank');
    
    // Remind to refresh
    setTimeout(() => {
      this.addSystemMessage('💡 Refresh the page to see your comment!');
    }, 3000);
  }
  
  displayComments() {
    const messagesEl = document.querySelector('.irc-messages');
    messagesEl.innerHTML = '';
    
    if (this.comments.length === 0) {
      this.addSystemMessage('No comments yet. Be the first to comment!');
    } else {
      this.comments.forEach(comment => this.displayComment(comment, false));
    }
    
    this.updateCommentCount();
  }
  
  displayComment(comment, animate = true) {
    const messagesEl = document.querySelector('.irc-messages');
    
    const commentEl = document.createElement('div');
    commentEl.className = 'irc-comment';
    commentEl.dataset.id = comment.id;
    
    // GitHub comment structure
    const isGitHub = comment.user && comment.user.login;
    const author = isGitHub ? comment.user.login : comment.author;
    const timestamp = isGitHub ? new Date(comment.created_at) : comment.timestamp;
    const text = isGitHub ? comment.body : comment.text;
    const avatarUrl = isGitHub ? comment.user.avatar_url : null;
    
    const timeAgo = this.getTimeAgo(timestamp);
    const isOwner = author === this.owner;
    
    commentEl.innerHTML = `
      <div class="irc-comment-header">
        ${avatarUrl ? `<img class="irc-avatar" src="${avatarUrl}" alt="${author}">` : ''}
        <span class="irc-comment-author">
          ${isGitHub ? `<a href="${comment.user.html_url}" target="_blank">${author}</a>` : this.escapeHtml(author)}
          ${isOwner ? '<span class="irc-badge mod">OWNER</span>' : ''}
        </span>
        <span class="irc-comment-time" title="${new Date(timestamp).toLocaleString()}">
          ${timeAgo}
        </span>
      </div>
      <div class="irc-comment-text">${this.escapeHtml(text)}</div>
      ${!isGitHub ? `
        <div class="irc-comment-actions">
          <span class="irc-comment-action" onclick="window.open('https://github.com/${this.owner}/${this.repo}/issues/${this.issueNumber || 'new'}')">reply on GitHub</span>
        </div>
      ` : ''}
    `;
    
    messagesEl.appendChild(commentEl);
    
    if (animate) {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  }
  
  // Removed delete/clear/export - GitHub handles comment management!
  
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