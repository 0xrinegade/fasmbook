// Navigation utilities for FASM eBook
class FASMeBookNavigation {
    constructor() {
        this.history = [];
        this.historyIndex = -1;
        this.maxHistorySize = 50;
        
        this.init();
    }
    
    init() {
        this.setupKeyboardNavigation();
        this.setupTouchNavigation();
        this.setupHistoryManagement();
    }
    
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Only handle if settings allow keyboard shortcuts
            if (!window.fasmSettings?.get('keyboardShortcuts')) return;
            
            // Don't handle if user is typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch (e.key) {
                case 'ArrowLeft':
                case 'h':
                    e.preventDefault();
                    this.goToPreviousPage();
                    break;
                    
                case 'ArrowRight':
                case 'l':
                    e.preventDefault();
                    this.goToNextPage();
                    break;
                    
                case 'ArrowUp':
                case 'k':
                    e.preventDefault();
                    this.scrollUp();
                    break;
                    
                case 'ArrowDown':
                case 'j':
                    e.preventDefault();
                    this.scrollDown();
                    break;
                    
                case 'Home':
                    e.preventDefault();
                    this.goToFirstChapter();
                    break;
                    
                case 'End':
                    e.preventDefault();
                    this.goToLastChapter();
                    break;
                    
                case 'PageUp':
                    e.preventDefault();
                    this.goToPreviousChapter();
                    break;
                    
                case 'PageDown':
                    e.preventDefault();
                    this.goToNextChapter();
                    break;
                    
                case 'Enter':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.toggleFullscreen();
                    }
                    break;
                    
                case 'b':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.toggleBookmark();
                    }
                    break;
                    
                case 'f':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.openSearch();
                    }
                    break;
                    
                case 'Escape':
                    this.handleEscape();
                    break;
                    
                case '/':
                    e.preventDefault();
                    this.openQuickSearch();
                    break;
                    
                case 'g':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.openGoToDialog();
                    }
                    break;
                    
                case '?':
                    e.preventDefault();
                    this.showKeyboardHelp();
                    break;
            }
        });
    }
    
    setupTouchNavigation() {
        let startX = 0;
        let startY = 0;
        let startTime = 0;
        
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;
        
        mainContent.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                startX = touch.clientX;
                startY = touch.clientY;
                startTime = Date.now();
            }
        }, { passive: true });
        
        mainContent.addEventListener('touchend', (e) => {
            if (e.changedTouches.length === 1) {
                const touch = e.changedTouches[0];
                const endX = touch.clientX;
                const endY = touch.clientY;
                const endTime = Date.now();
                
                const deltaX = endX - startX;
                const deltaY = endY - startY;
                const deltaTime = endTime - startTime;
                
                // Ignore if too slow or too short
                if (deltaTime > 1000 || Math.abs(deltaX) < 50) return;
                
                // Ignore if more vertical than horizontal
                if (Math.abs(deltaY) > Math.abs(deltaX)) return;
                
                // Swipe left = next page
                if (deltaX < -50) {
                    this.goToNextPage();
                }
                // Swipe right = previous page
                else if (deltaX > 50) {
                    this.goToPreviousPage();
                }
            }
        }, { passive: true });
        
        // Double tap to bookmark
        let lastTapTime = 0;
        mainContent.addEventListener('touchend', (e) => {
            const currentTime = Date.now();
            if (currentTime - lastTapTime < 300) {
                this.toggleBookmark();
            }
            lastTapTime = currentTime;
        }, { passive: true });
    }
    
    setupHistoryManagement() {
        // Track navigation history
        window.addEventListener('popstate', (e) => {
            if (e.state) {
                this.restoreState(e.state);
            }
        });
    }
    
    goToPreviousPage() {
        if (window.fasmEbook?.currentPage > 1) {
            window.fasmEbook.loadChapter(
                window.fasmEbook.currentChapter.id,
                window.fasmEbook.currentPage - 1
            );
        } else {
            this.goToPreviousChapter();
        }
    }
    
    goToNextPage() {
        if (window.fasmEbook?.currentPage < window.fasmEbook.totalPages) {
            window.fasmEbook.loadChapter(
                window.fasmEbook.currentChapter.id,
                window.fasmEbook.currentPage + 1
            );
        } else {
            this.goToNextChapter();
        }
    }
    
    goToPreviousChapter() {
        if (!window.fasmEbook?.chapters) return;
        
        const currentIndex = window.fasmEbook.chapters.findIndex(
            ch => ch.id === window.fasmEbook.currentChapter?.id
        );
        
        if (currentIndex > 0) {
            const prevChapter = window.fasmEbook.chapters[currentIndex - 1];
            window.fasmEbook.loadChapter(prevChapter.id, prevChapter.pages);
        }
    }
    
    goToNextChapter() {
        if (!window.fasmEbook?.chapters) return;
        
        const currentIndex = window.fasmEbook.chapters.findIndex(
            ch => ch.id === window.fasmEbook.currentChapter?.id
        );
        
        if (currentIndex < window.fasmEbook.chapters.length - 1) {
            const nextChapter = window.fasmEbook.chapters[currentIndex + 1];
            window.fasmEbook.loadChapter(nextChapter.id, 1);
        }
    }
    
    goToFirstChapter() {
        if (window.fasmEbook?.chapters?.length > 0) {
            const firstChapter = window.fasmEbook.chapters[0];
            window.fasmEbook.loadChapter(firstChapter.id, 1);
        }
    }
    
    goToLastChapter() {
        if (window.fasmEbook?.chapters?.length > 0) {
            const lastChapter = window.fasmEbook.chapters[window.fasmEbook.chapters.length - 1];
            window.fasmEbook.loadChapter(lastChapter.id, lastChapter.pages);
        }
    }
    
    scrollUp() {
        const contentElement = document.getElementById('chapter-content');
        if (contentElement) {
            contentElement.scrollBy({ top: -200, behavior: 'smooth' });
        }
    }
    
    scrollDown() {
        const contentElement = document.getElementById('chapter-content');
        if (contentElement) {
            contentElement.scrollBy({ top: 200, behavior: 'smooth' });
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(console.error);
        } else {
            document.exitFullscreen().catch(console.error);
        }
    }
    
    toggleBookmark() {
        // Find the closest heading to bookmark
        const headings = document.querySelectorAll('#chapter-content h1, #chapter-content h2, #chapter-content h3');
        if (headings.length === 0) return;
        
        // Find the heading closest to the current scroll position
        const scrollTop = document.getElementById('chapter-content')?.scrollTop || 0;
        let closestHeading = headings[0];
        let closestDistance = Math.abs(headings[0].offsetTop - scrollTop);
        
        for (let i = 1; i < headings.length; i++) {
            const distance = Math.abs(headings[i].offsetTop - scrollTop);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestHeading = headings[i];
            }
        }
        
        // Toggle bookmark for this heading
        const bookmarkId = `${window.fasmEbook?.currentChapter?.id}-${closestHeading.textContent.toLowerCase().replace(/\s+/g, '-')}`;
        
        if (window.fasmStorage) {
            if (window.fasmStorage.isBookmarked(bookmarkId)) {
                window.fasmStorage.removeBookmark(bookmarkId);
                this.showNotification('Bookmark removed');
            } else {
                window.fasmStorage.addBookmark({
                    id: bookmarkId,
                    title: closestHeading.textContent,
                    chapterId: window.fasmEbook?.currentChapter?.id,
                    page: window.fasmEbook?.currentPage
                });
                this.showNotification('Bookmark added');
            }
            
            // Update bookmark display
            window.fasmEbook?.updateBookmarksDisplay();
        }
    }
    
    openSearch() {
        this.createSearchDialog();
    }
    
    openQuickSearch() {
        this.createQuickSearchDialog();
    }
    
    openGoToDialog() {
        this.createGoToDialog();
    }
    
    showKeyboardHelp() {
        this.createKeyboardHelpDialog();
    }
    
    handleEscape() {
        // Close any open dialogs or panels
        const openModals = document.querySelectorAll('.modal, .dialog, .popup');
        openModals.forEach(modal => modal.remove());
        
        // Close AI helper if open
        if (window.fasmAI?.isOpen) {
            window.fasmAI.closeWindow();
        }
        
        // Close settings if open
        if (window.fasmSettings?.isOpen) {
            window.fasmSettings.close();
        }
        
        // Disable drawing mode if active
        if (window.fasmDrawing?.isEnabled) {
            window.fasmDrawing.disable();
        }
        
        // Exit fullscreen if active
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(console.error);
        }
    }
    
    createSearchDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'search-dialog modal';
        dialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Search in Book</h3>
                    <button class="close-modal">×</button>
                </div>
                <div class="modal-body">
                    <input type="text" id="search-input" placeholder="Enter search terms..." autofocus>
                    <div class="search-options">
                        <label><input type="checkbox" id="search-case-sensitive"> Case sensitive</label>
                        <label><input type="checkbox" id="search-whole-words"> Whole words only</label>
                    </div>
                    <div id="search-results" class="search-results">
                        <!-- Results will be populated here -->
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="search-submit" class="tool-btn">Search</button>
                    <button class="tool-btn close-modal">Cancel</button>
                </div>
            </div>
        `;
        
        this.setupModalEventListeners(dialog);
        
        const searchInput = dialog.querySelector('#search-input');
        const searchSubmit = dialog.querySelector('#search-submit');
        
        const performSearch = () => {
            const query = searchInput.value.trim();
            if (query) {
                this.performSearch(query, dialog);
            }
        };
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
        
        searchSubmit.addEventListener('click', performSearch);
        
        document.body.appendChild(dialog);
    }
    
    createQuickSearchDialog() {
        // Simple search overlay
        const overlay = document.createElement('div');
        overlay.className = 'quick-search-overlay';
        overlay.innerHTML = `
            <div class="quick-search-box">
                <input type="text" id="quick-search-input" placeholder="Quick search..." autofocus>
                <div id="quick-search-suggestions" class="quick-suggestions"></div>
            </div>
        `;
        
        const input = overlay.querySelector('#quick-search-input');
        const suggestions = overlay.querySelector('#quick-search-suggestions');
        
        input.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length > 2) {
                this.showQuickSearchSuggestions(query, suggestions);
            }
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                overlay.remove();
            }
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
        
        document.body.appendChild(overlay);
    }
    
    createGoToDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'goto-dialog modal';
        dialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Go To</h3>
                    <button class="close-modal">×</button>
                </div>
                <div class="modal-body">
                    <div class="goto-options">
                        <div class="goto-option">
                            <label>Chapter:</label>
                            <select id="goto-chapter">
                                ${window.fasmEbook?.chapters?.map(ch => 
                                    `<option value="${ch.id}">${ch.title}</option>`
                                ).join('') || ''}
                            </select>
                        </div>
                        <div class="goto-option">
                            <label>Page:</label>
                            <input type="number" id="goto-page" min="1" value="1">
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="goto-submit" class="tool-btn">Go</button>
                    <button class="tool-btn close-modal">Cancel</button>
                </div>
            </div>
        `;
        
        this.setupModalEventListeners(dialog);
        
        const chapterSelect = dialog.querySelector('#goto-chapter');
        const pageInput = dialog.querySelector('#goto-page');
        const gotoSubmit = dialog.querySelector('#goto-submit');
        
        // Set current values
        if (window.fasmEbook?.currentChapter) {
            chapterSelect.value = window.fasmEbook.currentChapter.id;
            pageInput.value = window.fasmEbook.currentPage;
        }
        
        // Update page max when chapter changes
        chapterSelect.addEventListener('change', (e) => {
            const selectedChapter = window.fasmEbook?.chapters?.find(ch => ch.id === e.target.value);
            if (selectedChapter) {
                pageInput.max = selectedChapter.pages;
                pageInput.value = Math.min(pageInput.value, selectedChapter.pages);
            }
        });
        
        gotoSubmit.addEventListener('click', () => {
            const chapterId = chapterSelect.value;
            const page = parseInt(pageInput.value) || 1;
            
            window.fasmEbook?.loadChapter(chapterId, page);
            dialog.remove();
        });
        
        document.body.appendChild(dialog);
    }
    
    createKeyboardHelpDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'keyboard-help-dialog modal';
        dialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Keyboard Shortcuts</h3>
                    <button class="close-modal">×</button>
                </div>
                <div class="modal-body">
                    <div class="shortcuts-grid">
                        <div class="shortcut-category">
                            <h4>Navigation</h4>
                            <div class="shortcut"><kbd>←</kbd> <kbd>H</kbd> Previous page</div>
                            <div class="shortcut"><kbd>→</kbd> <kbd>L</kbd> Next page</div>
                            <div class="shortcut"><kbd>↑</kbd> <kbd>K</kbd> Scroll up</div>
                            <div class="shortcut"><kbd>↓</kbd> <kbd>J</kbd> Scroll down</div>
                            <div class="shortcut"><kbd>Home</kbd> First chapter</div>
                            <div class="shortcut"><kbd>End</kbd> Last chapter</div>
                            <div class="shortcut"><kbd>Page Up</kbd> Previous chapter</div>
                            <div class="shortcut"><kbd>Page Down</kbd> Next chapter</div>
                        </div>
                        
                        <div class="shortcut-category">
                            <h4>Tools</h4>
                            <div class="shortcut"><kbd>Ctrl</kbd>+<kbd>B</kbd> Toggle bookmark</div>
                            <div class="shortcut"><kbd>Ctrl</kbd>+<kbd>F</kbd> Search</div>
                            <div class="shortcut"><kbd>Ctrl</kbd>+<kbd>G</kbd> Go to page</div>
                            <div class="shortcut"><kbd>Ctrl</kbd>+<kbd>D</kbd> Toggle drawing</div>
                            <div class="shortcut"><kbd>Ctrl</kbd>+<kbd>,</kbd> Settings</div>
                            <div class="shortcut"><kbd>/</kbd> Quick search</div>
                            <div class="shortcut"><kbd>?</kbd> Show help</div>
                        </div>
                        
                        <div class="shortcut-category">
                            <h4>View</h4>
                            <div class="shortcut"><kbd>F11</kbd> Fullscreen</div>
                            <div class="shortcut"><kbd>Ctrl</kbd>+<kbd>Enter</kbd> Fullscreen</div>
                            <div class="shortcut"><kbd>Escape</kbd> Close dialogs</div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="tool-btn close-modal">Close</button>
                </div>
            </div>
        `;
        
        this.setupModalEventListeners(dialog);
        document.body.appendChild(dialog);
    }
    
    setupModalEventListeners(modal) {
        const closeButtons = modal.querySelectorAll('.close-modal');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => modal.remove());
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                modal.remove();
            }
        });
    }
    
    performSearch(query, dialog) {
        const results = dialog.querySelector('#search-results');
        results.innerHTML = '<div class="searching">Searching...</div>';
        
        // Simulate search delay
        setTimeout(() => {
            const mockResults = this.searchInBook(query);
            this.displaySearchResults(mockResults, results);
        }, 500);
    }
    
    searchInBook(query) {
        // Mock search results - in a real implementation, this would search through all chapters
        return [
            {
                chapterId: 'chapter1',
                chapterTitle: 'Chapter 1: Welcome to the Machine',
                page: 5,
                context: `This is where ${query} appears in the context of assembly programming...`,
                matches: 3
            },
            {
                chapterId: 'chapter2',
                chapterTitle: 'Chapter 2: Learning to Speak FASM',
                page: 12,
                context: `Another occurrence of ${query} in this important section...`,
                matches: 1
            }
        ];
    }
    
    displaySearchResults(results, container) {
        if (results.length === 0) {
            container.innerHTML = '<div class="no-results">No results found.</div>';
            return;
        }
        
        const html = results.map(result => `
            <div class="search-result" data-chapter="${result.chapterId}" data-page="${result.page}">
                <h4>${result.chapterTitle}</h4>
                <p class="result-context">${result.context}</p>
                <div class="result-meta">Page ${result.page} • ${result.matches} match${result.matches > 1 ? 'es' : ''}</div>
            </div>
        `).join('');
        
        container.innerHTML = html;
        
        // Add click handlers
        container.querySelectorAll('.search-result').forEach(result => {
            result.addEventListener('click', () => {
                const chapterId = result.dataset.chapter;
                const page = parseInt(result.dataset.page);
                
                window.fasmEbook?.loadChapter(chapterId, page);
                container.closest('.modal').remove();
            });
        });
    }
    
    showQuickSearchSuggestions(query, container) {
        // Mock suggestions - in a real implementation, this would be more sophisticated
        const suggestions = [
            `"${query}" in Chapter 1`,
            `"${query}" in Chapter 2`,
            `Instructions containing "${query}"`,
            `Registers related to "${query}"`
        ];
        
        const html = suggestions.map(suggestion => 
            `<div class="quick-suggestion">${suggestion}</div>`
        ).join('');
        
        container.innerHTML = html;
        
        container.querySelectorAll('.quick-suggestion').forEach(suggestion => {
            suggestion.addEventListener('click', () => {
                // Handle suggestion click
                console.log('Suggestion clicked:', suggestion.textContent);
                container.closest('.quick-search-overlay').remove();
            });
        });
    }
    
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            backgroundColor: type === 'error' ? '#f44336' : type === 'success' ? '#4caf50' : '#2196f3',
            color: 'white',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: '3000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }
    
    addToHistory(state) {
        // Add state to navigation history
        if (this.historyIndex < this.history.length - 1) {
            // Remove any forward history
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        
        this.history.push(state);
        
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
        
        // Update browser history
        window.history.pushState(state, '', `?chapter=${state.chapterId}&page=${state.page}`);
    }
    
    goBack() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const state = this.history[this.historyIndex];
            this.restoreState(state);
            window.history.back();
        }
    }
    
    goForward() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const state = this.history[this.historyIndex];
            this.restoreState(state);
            window.history.forward();
        }
    }
    
    restoreState(state) {
        if (state.chapterId && state.page) {
            window.fasmEbook?.loadChapter(state.chapterId, state.page);
        }
    }
}

// CSS for navigation dialogs
const navigationCSS = `
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
}

.modal-content {
    background: var(--bg-color);
    border: 2px solid var(--accent-color);
    border-radius: 8px;
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid var(--border-color);
    background: var(--highlight-color);
}

.modal-header h3 {
    margin: 0;
    font-size: 1.2rem;
}

.modal-body {
    padding: 1.5rem;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding: 1rem;
    border-top: 1px solid var(--border-color);
    background: var(--highlight-color);
}

.search-results {
    max-height: 300px;
    overflow-y: auto;
    margin-top: 1rem;
}

.search-result {
    padding: 1rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    margin-bottom: 0.5rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.search-result:hover {
    background-color: var(--highlight-color);
}

.search-result h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
}

.result-context {
    margin: 0.5rem 0;
    font-size: 0.9rem;
    line-height: 1.4;
}

.result-meta {
    font-size: 0.8rem;
    color: var(--accent-color);
    opacity: 0.7;
}

.search-options {
    display: flex;
    gap: 1rem;
    margin: 1rem 0;
}

.search-options label {
    font-size: 0.9rem;
}

.goto-options {
    display: grid;
    gap: 1rem;
}

.goto-option label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
}

.goto-option select,
.goto-option input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
}

.shortcuts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
}

.shortcut-category h4 {
    margin: 0 0 1rem 0;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border-color);
}

.shortcut {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
}

.shortcut kbd {
    background: var(--highlight-color);
    border: 1px solid var(--border-color);
    border-radius: 3px;
    padding: 0.2rem 0.4rem;
    font-size: 0.8rem;
    font-family: monospace;
}

.quick-search-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 20vh;
    z-index: 2000;
}

.quick-search-box {
    background: var(--bg-color);
    border: 2px solid var(--accent-color);
    border-radius: 8px;
    padding: 1rem;
    min-width: 400px;
    max-width: 600px;
}

.quick-search-box input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 1rem;
}

.quick-suggestions {
    margin-top: 0.5rem;
    max-height: 200px;
    overflow-y: auto;
}

.quick-suggestion {
    padding: 0.5rem;
    cursor: pointer;
    border-radius: 4px;
    font-size: 0.9rem;
}

.quick-suggestion:hover {
    background-color: var(--highlight-color);
}

.searching,
.no-results {
    text-align: center;
    padding: 2rem;
    color: var(--accent-color);
    opacity: 0.7;
}
`;

// Add CSS to document
const navStyle = document.createElement('style');
navStyle.textContent = navigationCSS;
document.head.appendChild(navStyle);

// Initialize navigation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.fasmNavigation = new FASMeBookNavigation();
});