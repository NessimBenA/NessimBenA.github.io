// GITHUB ISSUES COMMENT SYSTEM - SNEAKY BACKEND USING GITHUB INFRASTRUCTURE
// Each page gets its own issue, comments are stored as issue comments!

class GitHubComments {
  constructor() {
    this.username = this.loadUsername() || this.generateUsername();
    this.pageId = this.getPageId();
    this.pageTitle = this.getPageTitle();
    this.comments = [];
    this.isMinimized = false;
    this.issueNumber = null;
    
    // GitHub config
    this.owner = 'NessimBenA';
    this.repo = 'NessimBenA.github.io';
    this.commentsLabel = 'page-comments';
    
    // GitHub token (optional for reading, required for posting)
    // For posting, users will use GitHub OAuth
    this.token = null;
    
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
    return localStorage.getItem('github-comments-username');
  }
  
  saveUsername(username) {
    this.username = username;
    localStorage.setItem('github-comments-username', username);
  }
  
  getPageId() {
    const path = window.location.pathname;
    return path.replace(/[^a-z0-9]/gi, '-').replace(/^-+|-+$/g, '') || 'home';
  }
  
  getPageTitle() {
    return document.title || 'Untitled Page';
  }
  
  async init() {
    this.createUI();
    this.bindEvents();
    
    // Load comments from GitHub
    await this.loadComments();
    
    // Check if user is authenticated
    this.checkAuth();
    
    // Show welcome message
    this.addSystemMessage(`Loading comments for "${this.pageTitle}"...`);
  }
  
  createUI() {
    const container = document.createElement('div');
    container.className = 'github-comments';
    container.innerHTML = `
      <div class="gc-header">
        <div class="gc-title">
          <span class="gc-channel"># Comments</span>
          <span class="gc-count">0 comments</span>
          <span class="gc-status">📡 GitHub</span>
        </div>
        <div class="gc-controls">
          <span class="gc-minimize">_</span>
          <span class="gc-expand">□</span>
        </div>
      </div>
      <div class="gc-messages"></div>
      <div class="gc-input-container">
        <div class="gc-auth-prompt" style="display: none;">
          <button class="gc-auth-btn">Sign in with GitHub to comment</button>
        </div>
        <div class="gc-comment-input" style="display: none;">
          <span class="gc-prompt">&lt;${this.username}&gt;</span>
          <input type="text" class="gc-input" placeholder="Leave a comment..." />
        </div>
      </div>
    `;
    
    document.body.appendChild(container);
    this.injectStyles();
  }
  
  injectStyles() {
    if (document.getElementById('github-comments-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'github-comments-styles';
    style.textContent = `
      .github-comments {
        position: fixed;
        bottom: 60px;
        right: 20px;
        width: 500px;
        height: 450px;
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
      
      .github-comments.minimized {
        height: 40px;
        overflow: hidden;
      }
      
      .github-comments.expanded {
        width: 700px;
        height: 600px;
      }
      
      .gc-header {
        background: var(--bg-secondary);
        padding: 10px;
        border-bottom: 1px solid var(--neon-purple);
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: move;
        user-select: none;
      }
      
      .gc-title {
        display: flex;
        gap: 15px;
        align-items: center;
      }
      
      .gc-channel {
        color: var(--neon-yellow);
        font-weight: 600;
        text-shadow: 0 0 5px var(--neon-yellow);
      }
      
      .gc-count {
        color: var(--text-secondary);
        font-size: 12px;
      }
      
      .gc-status {
        color: var(--neon-green);
        font-size: 11px;
        opacity: 0.8;
      }
      
      .gc-controls {
        display: flex;
        gap: 10px;
      }
      
      .gc-controls span {
        cursor: pointer;
        color: var(--text-secondary);
        transition: all 0.3s;
        padding: 0 5px;
      }
      
      .gc-controls span:hover {
        color: var(--neon-cyan);
        text-shadow: 0 0 5px var(--neon-cyan);
      }
      
      .gc-messages {
        flex: 1;
        overflow-y: auto;
        padding: 15px;
        font-family: var(--font-mono);
        scrollbar-width: thin;
        scrollbar-color: var(--neon-purple) var(--bg-secondary);
      }
      
      .gc-messages::-webkit-scrollbar {
        width: 8px;
      }
      
      .gc-messages::-webkit-scrollbar-track {
        background: var(--bg-secondary);
      }
      
      .gc-messages::-webkit-scrollbar-thumb {
        background: var(--neon-purple);
        border-radius: 4px;
      }
      
      .gc-comment {
        margin-bottom: 20px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 4px;
        transition: all 0.3s ease;
        animation: fadeIn 0.3s ease;
      }
      
      .gc-comment:hover {
        background: rgba(255, 255, 255, 0.04);
        border-color: rgba(0, 255, 255, 0.2);
        transform: translateX(2px);
      }
      
      .gc-comment-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
      }
      
      .gc-avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 1px solid var(--neon-cyan);
      }
      
      .gc-comment-meta {
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .gc-comment-author {
        color: var(--neon-cyan);
        font-weight: 600;
        text-decoration: none;
        transition: color 0.3s;
      }
      
      .gc-comment-author:hover {
        color: var(--neon-pink);
      }
      
      .gc-comment-time {
        color: var(--text-dim);
        font-size: 11px;
      }
      
      .gc-comment-body {
        color: var(--text-primary);
        line-height: 1.5;
        word-wrap: break-word;
      }
      
      .gc-comment-body p {
        margin: 0 0 0.5em 0;
      }
      
      .gc-comment-body p:last-child {
        margin-bottom: 0;
      }
      
      .gc-comment-body code {
        background: rgba(0, 255, 255, 0.1);
        padding: 2px 4px;
        border-radius: 3px;
        font-size: 0.9em;
      }
      
      .gc-comment-body pre {
        background: var(--bg-primary);
        padding: 10px;
        border-radius: 4px;
        overflow-x: auto;
        margin: 10px 0;
      }
      
      .gc-comment-reactions {
        margin-top: 8px;
        display: flex;
        gap: 10px;
      }
      
      .gc-reaction {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 8px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.3s;
      }
      
      .gc-reaction:hover {
        background: rgba(0, 255, 255, 0.1);
        border-color: var(--neon-cyan);
      }
      
      .gc-reaction.active {
        background: rgba(0, 255, 255, 0.2);
        border-color: var(--neon-cyan);
      }
      
      .gc-system {
        color: var(--neon-green);
        font-style: italic;
        opacity: 0.8;
        margin-bottom: 10px;
        text-align: center;
      }
      
      .gc-error {
        color: var(--neon-red);
        background: rgba(255, 85, 85, 0.1);
        padding: 10px;
        border-radius: 4px;
        margin-bottom: 10px;
      }
      
      .gc-loading {
        text-align: center;
        color: var(--neon-purple);
        padding: 20px;
      }
      
      .gc-loading::after {
        content: '';
        animation: dots 1.5s infinite;
      }
      
      @keyframes dots {
        0%, 20% { content: '.'; }
        40% { content: '..'; }
        60%, 100% { content: '...'; }
      }
      
      .gc-input-container {
        padding: 15px;
        border-top: 1px solid var(--border-color);
        background: var(--bg-secondary);
      }
      
      .gc-auth-prompt {
        text-align: center;
      }
      
      .gc-auth-btn {
        background: linear-gradient(135deg, var(--neon-purple), var(--neon-pink));
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 20px;
        font-family: var(--font-mono);
        font-size: 13px;
        cursor: pointer;
        transition: all 0.3s;
        box-shadow: 0 0 20px rgba(189, 147, 249, 0.4);
      }
      
      .gc-auth-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 30px rgba(189, 147, 249, 0.6);
      }
      
      .gc-comment-input {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .gc-prompt {
        color: var(--neon-green);
        font-weight: 600;
        white-space: nowrap;
      }
      
      .gc-input {
        flex: 1;
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.1);
        outline: none;
        color: var(--text-primary);
        font-family: var(--font-mono);
        font-size: 13px;
        padding: 8px 12px;
        border-radius: 4px;
        transition: all 0.3s;
      }
      
      .gc-input:focus {
        border-color: var(--neon-cyan);
        box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
      }
      
      .gc-input::placeholder {
        color: var(--text-dim);
      }
      
      .gc-badge {
        display: inline-block;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 10px;
        margin-left: 5px;
      }
      
      .gc-badge.owner {
        background: var(--neon-purple);
        color: var(--bg-primary);
      }
      
      .gc-badge.contributor {
        background: var(--neon-green);
        color: var(--bg-primary);
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @media (max-width: 768px) {
        .github-comments {
          width: calc(100% - 40px);
          right: 20px;
          left: 20px;
          bottom: 20px;
        }
        
        .github-comments.expanded {
          width: calc(100% - 40px);
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  bindEvents() {
    const minimize = document.querySelector('.gc-minimize');
    const expand = document.querySelector('.gc-expand');
    const authBtn = document.querySelector('.gc-auth-btn');
    const input = document.querySelector('.gc-input');
    const container = document.querySelector('.github-comments');
    
    minimize.addEventListener('click', () => {
      this.isMinimized = !this.isMinimized;
      container.classList.toggle('minimized');
    });
    
    expand.addEventListener('click', () => {
      container.classList.toggle('expanded');
    });
    
    authBtn?.addEventListener('click', () => {
      this.authenticate();
    });
    
    input?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        this.postComment(input.value);
        input.value = '';
      }
    });
    
    this.makeDraggable(container);
  }
  
  makeDraggable(element) {
    const header = element.querySelector('.gc-header');
    let isDragging = false;
    let startX, startY, initialX, initialY;
    
    header.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('gc-controls') || e.target.parentElement.classList.contains('gc-controls')) return;
      
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
  
  async loadComments() {
    const messagesEl = document.querySelector('.gc-messages');
    messagesEl.innerHTML = '<div class="gc-loading">Loading comments from GitHub</div>';
    
    try {
      // First, find or create the issue for this page
      const issue = await this.findOrCreateIssue();
      
      if (!issue) {
        messagesEl.innerHTML = '<div class="gc-error">Failed to load comments</div>';
        return;
      }
      
      this.issueNumber = issue.number;
      
      // Load comments from the issue
      const response = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/issues/${issue.number}/comments`);
      const comments = await response.json();
      
      this.comments = comments;
      this.displayComments();
      this.updateCommentCount();
      
      // Show GitHub issue link
      this.addSystemMessage(`💬 Comments powered by GitHub Issue #${issue.number}`);
      this.addSystemMessage(`View on GitHub: ${issue.html_url}`);
      
    } catch (error) {
      console.error('Failed to load comments:', error);
      messagesEl.innerHTML = '<div class="gc-error">Failed to load comments. Check console for details.</div>';
    }
  }
  
  async findOrCreateIssue() {
    // Search for existing issue with our page ID
    const searchQuery = `repo:${this.owner}/${this.repo} is:issue label:${this.commentsLabel} "${this.pageId}" in:title`;
    const searchResponse = await fetch(`https://api.github.com/search/issues?q=${encodeURIComponent(searchQuery)}`);
    const searchData = await searchResponse.json();
    
    if (searchData.items && searchData.items.length > 0) {
      return searchData.items[0];
    }
    
    // No existing issue found
    this.addSystemMessage('No comments yet. Sign in with GitHub to be the first!');
    return null;
  }
  
  displayComments() {
    const messagesEl = document.querySelector('.gc-messages');
    messagesEl.innerHTML = '';
    
    if (this.comments.length === 0) {
      this.addSystemMessage('No comments yet. Be the first to comment!');
    } else {
      this.comments.forEach(comment => this.displayComment(comment));
    }
  }
  
  displayComment(comment) {
    const messagesEl = document.querySelector('.gc-messages');
    
    const commentEl = document.createElement('div');
    commentEl.className = 'gc-comment';
    commentEl.dataset.id = comment.id;
    
    const timeAgo = this.getTimeAgo(new Date(comment.created_at));
    const isOwner = comment.user.login === this.owner;
    const isContributor = comment.author_association === 'CONTRIBUTOR';
    
    // Parse GitHub markdown to HTML (basic)
    const bodyHtml = this.parseMarkdown(comment.body);
    
    commentEl.innerHTML = `
      <div class="gc-comment-header">
        <img class="gc-avatar" src="${comment.user.avatar_url}" alt="${comment.user.login}">
        <div class="gc-comment-meta">
          <a href="${comment.user.html_url}" target="_blank" class="gc-comment-author">
            ${comment.user.login}
            ${isOwner ? '<span class="gc-badge owner">OWNER</span>' : ''}
            ${isContributor ? '<span class="gc-badge contributor">CONTRIBUTOR</span>' : ''}
          </a>
          <span class="gc-comment-time" title="${new Date(comment.created_at).toLocaleString()}">
            ${timeAgo}
          </span>
        </div>
      </div>
      <div class="gc-comment-body">${bodyHtml}</div>
      ${comment.reactions.total_count > 0 ? this.renderReactions(comment.reactions) : ''}
    `;
    
    messagesEl.appendChild(commentEl);
  }
  
  parseMarkdown(text) {
    // Basic markdown parsing
    return text
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
  }
  
  renderReactions(reactions) {
    const emojis = {
      '+1': '👍',
      '-1': '👎',
      'laugh': '😄',
      'hooray': '🎉',
      'confused': '😕',
      'heart': '❤️',
      'rocket': '🚀',
      'eyes': '👀'
    };
    
    let html = '<div class="gc-comment-reactions">';
    
    for (const [key, count] of Object.entries(reactions)) {
      if (count > 0 && key !== 'total_count' && key !== 'url') {
        html += `<span class="gc-reaction">${emojis[key] || key} ${count}</span>`;
      }
    }
    
    html += '</div>';
    return reactions.total_count > 0 ? html : '';
  }
  
  updateCommentCount() {
    document.querySelector('.gc-count').textContent = `${this.comments.length} comment${this.comments.length !== 1 ? 's' : ''}`;
  }
  
  addSystemMessage(text) {
    const messagesEl = document.querySelector('.gc-messages');
    const messageEl = document.createElement('div');
    messageEl.className = 'gc-system';
    messageEl.textContent = `*** ${text}`;
    messagesEl.appendChild(messageEl);
  }
  
  getTimeAgo(date) {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  }
  
  checkAuth() {
    // Check if we have a GitHub token
    this.token = localStorage.getItem('github-token');
    
    if (this.token) {
      // Verify token is still valid
      this.verifyToken();
    } else {
      // Show auth prompt
      document.querySelector('.gc-auth-prompt').style.display = 'block';
      document.querySelector('.gc-comment-input').style.display = 'none';
    }
  }
  
  async verifyToken() {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${this.token}`
        }
      });
      
      if (response.ok) {
        const user = await response.json();
        this.githubUser = user;
        document.querySelector('.gc-auth-prompt').style.display = 'none';
        document.querySelector('.gc-comment-input').style.display = 'flex';
        document.querySelector('.gc-prompt').textContent = `<${user.login}>`;
        this.addSystemMessage(`Signed in as ${user.login}`);
      } else {
        // Token invalid
        localStorage.removeItem('github-token');
        this.token = null;
        this.checkAuth();
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      this.checkAuth();
    }
  }
  
  authenticate() {
    // GitHub OAuth flow
    const clientId = 'YOUR_GITHUB_OAUTH_APP_CLIENT_ID'; // You'll need to create this
    const redirectUri = window.location.origin + window.location.pathname;
    const scope = 'public_repo';
    
    // Save current page to return after auth
    sessionStorage.setItem('github-auth-return', window.location.href);
    
    // Redirect to GitHub OAuth
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;
  }
  
  async postComment(text) {
    if (!this.token) {
      this.addSystemMessage('Please sign in with GitHub to comment');
      return;
    }
    
    if (!this.issueNumber) {
      // Create issue first
      await this.createIssue();
    }
    
    try {
      const response = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/issues/${this.issueNumber}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ body: text })
      });
      
      if (response.ok) {
        const comment = await response.json();
        this.comments.push(comment);
        this.displayComment(comment);
        this.updateCommentCount();
        
        // Play sound effect
        if (window.playSound) {
          window.playSound('beep');
        }
      } else {
        this.addSystemMessage('Failed to post comment. Check console for details.');
        console.error('Failed to post comment:', await response.text());
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      this.addSystemMessage('Error posting comment. Check console for details.');
    }
  }
  
  async createIssue() {
    try {
      const response = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/issues`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: `Comments: ${this.pageTitle} [${this.pageId}]`,
          body: `This issue is used to store comments for the page: ${window.location.href}\n\nPage ID: \`${this.pageId}\``,
          labels: [this.commentsLabel]
        })
      });
      
      if (response.ok) {
        const issue = await response.json();
        this.issueNumber = issue.number;
        this.addSystemMessage(`Created GitHub Issue #${issue.number} for comments`);
      } else {
        console.error('Failed to create issue:', await response.text());
      }
    } catch (error) {
      console.error('Error creating issue:', error);
    }
  }
}

// Handle OAuth callback
if (window.location.search.includes('code=')) {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  
  if (code) {
    // In a real implementation, you'd exchange this code for a token
    // This requires a backend service or GitHub App
    console.log('OAuth code received:', code);
    console.log('Note: You need a backend service to exchange this code for a token');
    
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.githubComments = new GitHubComments();
  });
} else {
  window.githubComments = new GitHubComments();
}

// Console API
console.log('%c[GitHub Comments] Initialized! Comments are stored as GitHub Issues', 'color: #00ffff');