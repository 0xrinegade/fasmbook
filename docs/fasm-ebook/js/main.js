// Main JavaScript for FASM eBook
class FASMeBook {
    constructor() {
        this.currentChapter = null;
        this.currentPage = 1;
        this.totalPages = 1;
        this.chapters = [];
        this.isLoading = false;
        
        this.init();
    }
    
    async init() {
        console.log('Initializing FASM eBook...');
        
        // Load chapter index
        await this.loadChapterIndex();
        
        // Initialize components
        this.initNavigation();
        this.initEventListeners();
        this.initSettings();
        
        // Load initial chapter
        const urlParams = new URLSearchParams(window.location.search);
        const chapter = urlParams.get('chapter') || 'preface';
        const page = parseInt(urlParams.get('page')) || 1;
        
        await this.loadChapter(chapter, page);
        
        // Load user data
        this.loadUserData();
        
        console.log('FASM eBook initialized successfully');
    }
    
    async loadChapterIndex() {
        try {
            const response = await fetch('chapters/index.json');
            if (!response.ok) {
                throw new Error('Failed to load chapter index');
            }
            this.chapters = await response.json();
            this.populateTableOfContents();
        } catch (error) {
            console.error('Error loading chapter index:', error);
            // Fallback to hardcoded chapters
            this.chapters = this.getDefaultChapters();
            this.populateTableOfContents();
        }
    }
    
    getDefaultChapters() {
        return [
            {
                id: 'preface',
                title: 'Preface',
                file: 'preface.md',
                pages: 3
            },
            {
                id: 'chapter1',
                title: 'Chapter 1: Welcome to the Machine',
                file: 'chapter1.md',
                pages: 15
            },
            {
                id: 'chapter2',
                title: 'Chapter 2: Learning to Speak FASM',
                file: 'chapter2.md',
                pages: 18
            },
            {
                id: 'chapter3',
                title: 'Chapter 3: The Memory Universe',
                file: 'chapter3.md',
                pages: 16
            },
            {
                id: 'chapter4',
                title: 'Chapter 4: The Instruction Cookbook',
                file: 'chapter4.md',
                pages: 20
            },
            {
                id: 'chapter5',
                title: 'Chapter 5: Registers - Your Digital Toolkit',
                file: 'chapter5.md',
                pages: 14
            },
            {
                id: 'chapter6',
                title: 'Chapter 6: Program Flow - The Story Your Code Tells',
                file: 'chapter6.md',
                pages: 17
            }
        ];
    }
    
    populateTableOfContents() {
        const tocList = document.getElementById('toc-list');
        if (!tocList) return;
        
        tocList.innerHTML = '';
        
        this.chapters.forEach(chapter => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${chapter.id}`;
            a.textContent = chapter.title;
            a.dataset.chapterId = chapter.id;
            
            a.addEventListener('click', (e) => {
                e.preventDefault();
                this.loadChapter(chapter.id, 1);
            });
            
            li.appendChild(a);
            tocList.appendChild(li);
        });
    }
    
    async loadChapter(chapterId, page = 1) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        const loadingIndicator = this.showLoadingIndicator();
        
        try {
            const chapter = this.chapters.find(ch => ch.id === chapterId);
            if (!chapter) {
                throw new Error(`Chapter ${chapterId} not found`);
            }
            
            const response = await fetch(`chapters/${chapter.file}`);
            if (!response.ok) {
                throw new Error(`Failed to load chapter: ${response.statusText}`);
            }
            
            const markdown = await response.text();
            const html = this.markdownToHTML(markdown);
            
            this.currentChapter = chapter;
            this.currentPage = page;
            this.totalPages = chapter.pages;
            
            this.displayChapter(html, page);
            this.updateNavigation();
            this.updateProgress();
            this.updateURL();
            this.saveReadingHistory();
            
        } catch (error) {
            console.error('Error loading chapter:', error);
            this.showError(`Failed to load chapter: ${error.message}`);
        } finally {
            this.hideLoadingIndicator(loadingIndicator);
            this.isLoading = false;
        }
    }
    
    displayChapter(html, page) {
        const contentElement = document.getElementById('chapter-content');
        if (!contentElement) return;
        
        // Split content into pages if needed
        const pages = this.paginateContent(html);
        const pageContent = pages[page - 1] || pages[0] || html;
        
        contentElement.innerHTML = pageContent;
        
        // Add syntax highlighting to code blocks
        this.addSyntaxHighlighting();
        
        // Add copy buttons to code blocks
        this.addCopyButtons();
        
        // Add bookmark indicators
        this.addBookmarkIndicators();
        
        // Scroll to top
        contentElement.scrollIntoView({ behavior: 'smooth' });
    }
    
    paginateContent(html) {
        // Simple pagination - split by major headings
        // In a real implementation, you'd want more sophisticated pagination
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        const pages = [];
        let currentPage = '';
        let wordCount = 0;
        const wordsPerPage = 800; // Approximate words per page
        
        const elements = Array.from(tempDiv.children);
        
        for (const element of elements) {
            const elementWordCount = (element.textContent || '').split(/\s+/).length;
            
            if (wordCount + elementWordCount > wordsPerPage && currentPage) {
                pages.push(currentPage);
                currentPage = '';
                wordCount = 0;
            }
            
            currentPage += element.outerHTML;
            wordCount += elementWordCount;
        }
        
        if (currentPage) {
            pages.push(currentPage);
        }
        
        return pages.length > 0 ? pages : [html];
    }
    
    markdownToHTML(markdown) {
        // Simple markdown parser - in production, use a proper library like marked.js
        let html = markdown
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
            .replace(/^\* (.*$)/gim, '<li>$1</li>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/^```([\s\S]*?)```/gm, '<pre><code>$1</code></pre>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^\s*$/gm, '')
            .replace(/^(?!<[h|l|p|d])/gm, '<p>')
            .replace(/<\/li>\s*<li>/g, '</li><li>')
            .replace(/<li>(.*?)<\/li>/gs, '<ul><li>$1</li></ul>')
            .replace(/<\/ul>\s*<ul>/g, '');
        
        return html;
    }
    
    addSyntaxHighlighting() {
        const codeBlocks = document.querySelectorAll('pre code');
        codeBlocks.forEach(block => {
            // Simple FASM syntax highlighting
            let code = block.innerHTML;
            
            // Highlight FASM keywords
            const keywords = ['mov', 'add', 'sub', 'mul', 'div', 'cmp', 'jmp', 'je', 'jne', 'call', 'ret', 'push', 'pop', 'section', 'format', 'entry', 'include'];
            keywords.forEach(keyword => {
                const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
                code = code.replace(regex, `<span class="keyword">${keyword}</span>`);
            });
            
            // Highlight registers
            const registers = ['eax', 'ebx', 'ecx', 'edx', 'esi', 'edi', 'esp', 'ebp', 'rax', 'rbx', 'rcx', 'rdx'];
            registers.forEach(reg => {
                const regex = new RegExp(`\\b${reg}\\b`, 'gi');
                code = code.replace(regex, `<span class="register">${reg}</span>`);
            });
            
            // Highlight comments
            code = code.replace(/;.*$/gm, '<span class="comment">$&</span>');
            
            // Highlight numbers
            code = code.replace(/\b\d+\b/g, '<span class="number">$&</span>');
            
            block.innerHTML = code;
        });
    }
    
    addCopyButtons() {
        const codeBlocks = document.querySelectorAll('pre code');
        codeBlocks.forEach(block => {
            const pre = block.parentElement;
            if (pre.querySelector('.code-copy')) return; // Already has copy button
            
            const copyButton = document.createElement('button');
            copyButton.className = 'code-copy';
            copyButton.textContent = 'Copy';
            copyButton.addEventListener('click', () => {
                navigator.clipboard.writeText(block.textContent).then(() => {
                    copyButton.textContent = 'Copied!';
                    setTimeout(() => {
                        copyButton.textContent = 'Copy';
                    }, 2000);
                });
            });
            
            pre.style.position = 'relative';
            pre.appendChild(copyButton);
        });
    }
    
    addBookmarkIndicators() {
        const headings = document.querySelectorAll('h2, h3');
        headings.forEach(heading => {
            if (heading.querySelector('.bookmark-indicator')) return;
            
            const bookmarkId = `${this.currentChapter.id}-${heading.textContent.toLowerCase().replace(/\s+/g, '-')}`;
            const indicator = document.createElement('div');
            indicator.className = 'bookmark-indicator';
            indicator.dataset.bookmarkId = bookmarkId;
            
            if (this.isBookmarked(bookmarkId)) {
                indicator.classList.add('active');
            }
            
            indicator.addEventListener('click', () => {
                this.toggleBookmark(bookmarkId, heading.textContent);
            });
            
            heading.style.position = 'relative';
            heading.appendChild(indicator);
        });
    }
    
    updateNavigation() {
        const chapterInfo = document.getElementById('chapter-info');
        const pageInfo = document.getElementById('page-info');
        const prevChapter = document.getElementById('prev-chapter');
        const nextChapter = document.getElementById('next-chapter');
        const prevPage = document.getElementById('prev-page');
        const nextPage = document.getElementById('next-page');
        
        if (chapterInfo) {
            chapterInfo.textContent = this.currentChapter.title;
        }
        
        if (pageInfo) {
            pageInfo.textContent = `Page ${this.currentPage} of ${this.totalPages}`;
        }
        
        // Update chapter navigation
        const currentIndex = this.chapters.findIndex(ch => ch.id === this.currentChapter.id);
        
        if (prevChapter) {
            prevChapter.disabled = currentIndex <= 0;
            if (currentIndex > 0) {
                prevChapter.onclick = () => this.loadChapter(this.chapters[currentIndex - 1].id, 1);
            }
        }
        
        if (nextChapter) {
            nextChapter.disabled = currentIndex >= this.chapters.length - 1;
            if (currentIndex < this.chapters.length - 1) {
                nextChapter.onclick = () => this.loadChapter(this.chapters[currentIndex + 1].id, 1);
            }
        }
        
        // Update page navigation
        if (prevPage) {
            prevPage.disabled = this.currentPage <= 1;
            if (this.currentPage > 1) {
                prevPage.onclick = () => this.loadChapter(this.currentChapter.id, this.currentPage - 1);
            }
        }
        
        if (nextPage) {
            nextPage.disabled = this.currentPage >= this.totalPages;
            if (this.currentPage < this.totalPages) {
                nextPage.onclick = () => this.loadChapter(this.currentChapter.id, this.currentPage + 1);
            }
        }
        
        // Update TOC active state
        document.querySelectorAll('.toc-list a').forEach(link => {
            link.classList.remove('current');
        });
        const currentTocLink = document.querySelector(`[data-chapter-id="${this.currentChapter.id}"]`);
        if (currentTocLink) {
            currentTocLink.classList.add('current');
        }
    }
    
    updateProgress() {
        const currentIndex = this.chapters.findIndex(ch => ch.id === this.currentChapter.id);
        const totalPages = this.chapters.reduce((sum, ch) => sum + ch.pages, 0);
        const completedPages = this.chapters.slice(0, currentIndex).reduce((sum, ch) => sum + ch.pages, 0) + this.currentPage;
        
        const percentage = Math.round((completedPages / totalPages) * 100);
        
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${percentage}% Complete`;
        }
    }
    
    updateURL() {
        const url = new URL(window.location);
        url.searchParams.set('chapter', this.currentChapter.id);
        url.searchParams.set('page', this.currentPage);
        window.history.replaceState({}, '', url);
    }
    
    showLoadingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'loading-indicator';
        indicator.innerHTML = '<div class="loading-spinner"></div><p>Loading chapter...</p>';
        document.body.appendChild(indicator);
        return indicator;
    }
    
    hideLoadingIndicator(indicator) {
        if (indicator && indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
        }
    }
    
    showError(message) {
        const contentElement = document.getElementById('chapter-content');
        if (contentElement) {
            contentElement.innerHTML = `
                <div class="error-message">
                    <h2>Error Loading Chapter</h2>
                    <p>${message}</p>
                    <button onclick="window.fasmEbook.loadChapter('preface', 1)">Go to Preface</button>
                    <button onclick="location.reload()" style="margin-left: 10px;">Reload Page</button>
                </div>
            `;
        }
    }
    
    initNavigation() {
        const navToggle = document.getElementById('nav-toggle');
        const navPanel = document.getElementById('navigation-panel');
        const mainContent = document.getElementById('main-content');
        
        if (navToggle && navPanel && mainContent) {
            navToggle.addEventListener('click', () => {
                navPanel.classList.toggle('hidden');
                mainContent.classList.toggle('expanded');
            });
        }
        
        // Handle keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) return;
            
            switch (e.key) {
                case 'ArrowLeft':
                    if (this.currentPage > 1) {
                        this.loadChapter(this.currentChapter.id, this.currentPage - 1);
                    }
                    break;
                case 'ArrowRight':
                    if (this.currentPage < this.totalPages) {
                        this.loadChapter(this.currentChapter.id, this.currentPage + 1);
                    }
                    break;
                case 'Home':
                    this.loadChapter(this.chapters[0].id, 1);
                    break;
                case 'End':
                    const lastChapter = this.chapters[this.chapters.length - 1];
                    this.loadChapter(lastChapter.id, lastChapter.pages);
                    break;
            }
        });
    }
    
    initEventListeners() {
        // Handle text selection for highlighting and note-taking
        document.addEventListener('mouseup', () => {
            const selection = window.getSelection();
            if (selection.toString().trim().length > 0) {
                this.showSelectionTools(selection);
            } else {
                this.hideSelectionTools();
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.adjustLayout();
        });
        
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.saveReadingPosition();
            }
        });
    }
    
    showSelectionTools(selection) {
        const tools = document.querySelector('.text-selection-tools');
        if (tools) {
            tools.classList.add('visible');
        }
    }
    
    hideSelectionTools() {
        const tools = document.querySelector('.text-selection-tools');
        if (tools) {
            tools.classList.remove('visible');
        }
    }
    
    adjustLayout() {
        // Responsive layout adjustments
        if (window.innerWidth < 768) {
            document.getElementById('navigation-panel')?.classList.add('hidden');
            document.getElementById('main-content')?.classList.add('expanded');
        }
    }
    
    initSettings() {
        // Settings will be handled by settings.js
        // This is a placeholder for any main settings initialization
    }
    
    // User data management
    saveReadingHistory() {
        const history = this.getReadingHistory();
        const entry = {
            chapterId: this.currentChapter.id,
            title: this.currentChapter.title,
            page: this.currentPage,
            timestamp: Date.now()
        };
        
        // Remove existing entry for this chapter
        const filtered = history.filter(h => h.chapterId !== this.currentChapter.id);
        
        // Add new entry at the beginning
        filtered.unshift(entry);
        
        // Keep only last 10 entries
        const updated = filtered.slice(0, 10);
        
        localStorage.setItem('fasmebook-history', JSON.stringify(updated));
        this.updateHistoryDisplay();
    }
    
    getReadingHistory() {
        try {
            return JSON.parse(localStorage.getItem('fasmebook-history')) || [];
        } catch {
            return [];
        }
    }
    
    updateHistoryDisplay() {
        const historyList = document.getElementById('history-list');
        if (!historyList) return;
        
        const history = this.getReadingHistory();
        historyList.innerHTML = '';
        
        history.forEach(entry => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = `${entry.title} (Page ${entry.page})`;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                this.loadChapter(entry.chapterId, entry.page);
            });
            
            li.appendChild(a);
            historyList.appendChild(li);
        });
    }
    
    saveReadingPosition() {
        const position = {
            chapterId: this.currentChapter?.id,
            page: this.currentPage,
            timestamp: Date.now()
        };
        localStorage.setItem('fasmebook-position', JSON.stringify(position));
    }
    
    loadUserData() {
        this.updateHistoryDisplay();
        this.updateBookmarksDisplay();
        
        // Restore reading position if available
        try {
            const position = JSON.parse(localStorage.getItem('fasmebook-position'));
            if (position && position.chapterId && position.chapterId !== this.currentChapter?.id) {
                // Optionally prompt user to continue from last position
                console.log('Found saved reading position:', position);
            }
        } catch {
            // Ignore errors
        }
    }
    
    toggleBookmark(bookmarkId, title) {
        const bookmarks = this.getBookmarks();
        const exists = bookmarks.find(b => b.id === bookmarkId);
        
        if (exists) {
            // Remove bookmark
            const updated = bookmarks.filter(b => b.id !== bookmarkId);
            localStorage.setItem('fasmebook-bookmarks', JSON.stringify(updated));
        } else {
            // Add bookmark
            bookmarks.push({
                id: bookmarkId,
                title: title,
                chapterId: this.currentChapter.id,
                page: this.currentPage,
                timestamp: Date.now()
            });
            localStorage.setItem('fasmebook-bookmarks', JSON.stringify(bookmarks));
        }
        
        this.updateBookmarksDisplay();
        this.updateBookmarkIndicators();
    }
    
    getBookmarks() {
        try {
            return JSON.parse(localStorage.getItem('fasmebook-bookmarks')) || [];
        } catch {
            return [];
        }
    }
    
    isBookmarked(bookmarkId) {
        return this.getBookmarks().some(b => b.id === bookmarkId);
    }
    
    updateBookmarksDisplay() {
        const bookmarksList = document.getElementById('bookmarks-list');
        if (!bookmarksList) return;
        
        const bookmarks = this.getBookmarks();
        bookmarksList.innerHTML = '';
        
        bookmarks.forEach(bookmark => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = bookmark.title;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                this.loadChapter(bookmark.chapterId, bookmark.page);
            });
            
            li.appendChild(a);
            bookmarksList.appendChild(li);
        });
    }
    
    updateBookmarkIndicators() {
        const indicators = document.querySelectorAll('.bookmark-indicator');
        indicators.forEach(indicator => {
            const bookmarkId = indicator.dataset.bookmarkId;
            if (this.isBookmarked(bookmarkId)) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }
}

// Initialize the eBook when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.fasmEbook = new FASMeBook();
});

// Handle service worker for offline reading (if available)
if ('serviceWorker' in navigator) {
    // Only register service worker if it exists
    fetch('/service-worker.js', { method: 'HEAD' })
        .then(response => {
            if (response.ok) {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(registration => console.log('SW registered'))
                    .catch(error => console.log('SW registration failed'));
            }
        })
        .catch(() => {
            // Service worker file doesn't exist, skip registration
            console.log('Service worker not available');
        });
}