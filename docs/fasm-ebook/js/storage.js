// Storage utilities for FASM eBook
class FASMeBookStorage {
    constructor() {
        this.prefix = 'fasmebook-';
        this.syncEnabled = this.checkSyncSupport();
    }
    
    checkSyncSupport() {
        try {
            return typeof localStorage !== 'undefined' && localStorage !== null;
        } catch {
            return false;
        }
    }
    
    // Core storage methods
    set(key, value) {
        if (!this.syncEnabled) return false;
        
        try {
            const fullKey = this.prefix + key;
            localStorage.setItem(fullKey, JSON.stringify({
                data: value,
                timestamp: Date.now(),
                version: '1.0'
            }));
            return true;
        } catch (error) {
            console.warn('Storage error:', error);
            return false;
        }
    }
    
    get(key, defaultValue = null) {
        if (!this.syncEnabled) return defaultValue;
        
        try {
            const fullKey = this.prefix + key;
            const stored = localStorage.getItem(fullKey);
            if (!stored) return defaultValue;
            
            const parsed = JSON.parse(stored);
            return parsed.data !== undefined ? parsed.data : defaultValue;
        } catch (error) {
            console.warn('Storage retrieval error:', error);
            return defaultValue;
        }
    }
    
    remove(key) {
        if (!this.syncEnabled) return false;
        
        try {
            const fullKey = this.prefix + key;
            localStorage.removeItem(fullKey);
            return true;
        } catch (error) {
            console.warn('Storage removal error:', error);
            return false;
        }
    }
    
    clear() {
        if (!this.syncEnabled) return false;
        
        try {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.warn('Storage clear error:', error);
            return false;
        }
    }
    
    // Reading progress management
    saveReadingProgress(chapterId, page, percentage = 0) {
        const progress = this.get('reading-progress', {});
        progress[chapterId] = {
            page: page,
            percentage: percentage,
            timestamp: Date.now(),
            totalTime: this.getReadingTime(chapterId)
        };
        return this.set('reading-progress', progress);
    }
    
    getReadingProgress(chapterId = null) {
        const progress = this.get('reading-progress', {});
        return chapterId ? progress[chapterId] : progress;
    }
    
    getOverallProgress() {
        const progress = this.getReadingProgress();
        const chapters = Object.keys(progress);
        
        if (chapters.length === 0) return { percentage: 0, chaptersRead: 0 };
        
        const totalProgress = chapters.reduce((sum, chapterId) => {
            return sum + (progress[chapterId].percentage || 0);
        }, 0);
        
        return {
            percentage: Math.round(totalProgress / chapters.length),
            chaptersRead: chapters.filter(id => progress[id].percentage >= 100).length,
            totalChapters: chapters.length
        };
    }
    
    // Reading time tracking
    startReadingTimer(chapterId) {
        const timers = this.get('reading-timers', {});
        timers[chapterId] = Date.now();
        this.set('reading-timers', timers);
    }
    
    stopReadingTimer(chapterId) {
        const timers = this.get('reading-timers', {});
        if (!timers[chapterId]) return 0;
        
        const startTime = timers[chapterId];
        const duration = Date.now() - startTime;
        
        // Add to total reading time
        const readingTimes = this.get('reading-times', {});
        readingTimes[chapterId] = (readingTimes[chapterId] || 0) + duration;
        this.set('reading-times', readingTimes);
        
        // Clear timer
        delete timers[chapterId];
        this.set('reading-timers', timers);
        
        return duration;
    }
    
    getReadingTime(chapterId = null) {
        const readingTimes = this.get('reading-times', {});
        if (chapterId) {
            return readingTimes[chapterId] || 0;
        }
        
        return Object.values(readingTimes).reduce((sum, time) => sum + time, 0);
    }
    
    formatReadingTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }
    
    // Bookmarks management
    addBookmark(bookmarkData) {
        const bookmarks = this.get('bookmarks', []);
        const bookmarkId = bookmarkData.id || this.generateBookmarkId(bookmarkData);
        
        // Remove existing bookmark with same ID
        const filtered = bookmarks.filter(b => b.id !== bookmarkId);
        
        // Add new bookmark
        filtered.push({
            id: bookmarkId,
            title: bookmarkData.title,
            chapterId: bookmarkData.chapterId,
            page: bookmarkData.page,
            text: bookmarkData.text || '',
            notes: bookmarkData.notes || '',
            timestamp: Date.now()
        });
        
        // Sort by timestamp (newest first)
        filtered.sort((a, b) => b.timestamp - a.timestamp);
        
        return this.set('bookmarks', filtered);
    }
    
    removeBookmark(bookmarkId) {
        const bookmarks = this.get('bookmarks', []);
        const filtered = bookmarks.filter(b => b.id !== bookmarkId);
        return this.set('bookmarks', filtered);
    }
    
    getBookmarks(chapterId = null) {
        const bookmarks = this.get('bookmarks', []);
        if (chapterId) {
            return bookmarks.filter(b => b.chapterId === chapterId);
        }
        return bookmarks;
    }
    
    isBookmarked(bookmarkId) {
        const bookmarks = this.getBookmarks();
        return bookmarks.some(b => b.id === bookmarkId);
    }
    
    generateBookmarkId(bookmarkData) {
        return `${bookmarkData.chapterId}-${bookmarkData.page}-${Date.now()}`;
    }
    
    // Notes and annotations
    addNote(noteData) {
        const notes = this.get('notes', []);
        const noteId = noteData.id || this.generateNoteId(noteData);
        
        // Remove existing note with same ID
        const filtered = notes.filter(n => n.id !== noteId);
        
        // Add new note
        filtered.push({
            id: noteId,
            chapterId: noteData.chapterId,
            page: noteData.page,
            text: noteData.text || '',
            selectedText: noteData.selectedText || '',
            position: noteData.position || null,
            color: noteData.color || '#ffeb3b',
            timestamp: Date.now()
        });
        
        return this.set('notes', filtered);
    }
    
    removeNote(noteId) {
        const notes = this.get('notes', []);
        const filtered = notes.filter(n => n.id !== noteId);
        return this.set('notes', filtered);
    }
    
    getNotes(chapterId = null, page = null) {
        const notes = this.get('notes', []);
        let filtered = notes;
        
        if (chapterId) {
            filtered = filtered.filter(n => n.chapterId === chapterId);
        }
        
        if (page !== null) {
            filtered = filtered.filter(n => n.page === page);
        }
        
        return filtered;
    }
    
    generateNoteId(noteData) {
        return `note-${noteData.chapterId}-${noteData.page}-${Date.now()}`;
    }
    
    // Highlights management
    addHighlight(highlightData) {
        const highlights = this.get('highlights', []);
        const highlightId = highlightData.id || this.generateHighlightId(highlightData);
        
        highlights.push({
            id: highlightId,
            chapterId: highlightData.chapterId,
            page: highlightData.page,
            text: highlightData.text,
            range: highlightData.range,
            color: highlightData.color || '#ffeb3b',
            timestamp: Date.now()
        });
        
        return this.set('highlights', highlights);
    }
    
    removeHighlight(highlightId) {
        const highlights = this.get('highlights', []);
        const filtered = highlights.filter(h => h.id !== highlightId);
        return this.set('highlights', filtered);
    }
    
    getHighlights(chapterId = null, page = null) {
        const highlights = this.get('highlights', []);
        let filtered = highlights;
        
        if (chapterId) {
            filtered = filtered.filter(h => h.chapterId === chapterId);
        }
        
        if (page !== null) {
            filtered = filtered.filter(h => h.page === page);
        }
        
        return filtered;
    }
    
    generateHighlightId(highlightData) {
        return `highlight-${highlightData.chapterId}-${highlightData.page}-${Date.now()}`;
    }
    
    // Search history
    addToSearchHistory(query, results) {
        const searchHistory = this.get('search-history', []);
        
        // Remove existing entry for same query
        const filtered = searchHistory.filter(entry => entry.query !== query);
        
        // Add new entry
        filtered.unshift({
            query: query,
            resultCount: results.length,
            timestamp: Date.now()
        });
        
        // Keep only last 20 searches
        const updated = filtered.slice(0, 20);
        
        return this.set('search-history', updated);
    }
    
    getSearchHistory() {
        return this.get('search-history', []);
    }
    
    clearSearchHistory() {
        return this.remove('search-history');
    }
    
    // User preferences
    savePreferences(preferences) {
        const currentPrefs = this.get('preferences', {});
        const updated = { ...currentPrefs, ...preferences };
        return this.set('preferences', updated);
    }
    
    getPreferences() {
        return this.get('preferences', {
            fontSize: 16,
            lineHeight: 1.6,
            displayMode: 'eink',
            drawingEnabled: false,
            autoSave: true,
            soundEnabled: false,
            theme: 'eink'
        });
    }
    
    // Data export/import
    exportData() {
        if (!this.syncEnabled) return null;
        
        const data = {};
        
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(this.prefix)) {
                const shortKey = key.replace(this.prefix, '');
                data[shortKey] = this.get(shortKey);
            }
        });
        
        return {
            version: '1.0',
            exportDate: new Date().toISOString(),
            data: data
        };
    }
    
    importData(importData) {
        if (!this.syncEnabled || !importData || !importData.data) return false;
        
        try {
            Object.keys(importData.data).forEach(key => {
                this.set(key, importData.data[key]);
            });
            return true;
        } catch (error) {
            console.error('Import error:', error);
            return false;
        }
    }
    
    // Statistics
    getReadingStatistics() {
        const progress = this.getReadingProgress();
        const bookmarks = this.getBookmarks();
        const notes = this.getNotes();
        const highlights = this.getHighlights();
        const overallProgress = this.getOverallProgress();
        const totalReadingTime = this.getReadingTime();
        
        return {
            overall: overallProgress,
            readingTime: {
                total: totalReadingTime,
                formatted: this.formatReadingTime(totalReadingTime),
                average: totalReadingTime / Math.max(1, overallProgress.totalChapters)
            },
            content: {
                bookmarks: bookmarks.length,
                notes: notes.length,
                highlights: highlights.length
            },
            chapters: Object.keys(progress).length,
            lastActivity: Math.max(
                ...bookmarks.map(b => b.timestamp),
                ...notes.map(n => n.timestamp),
                ...highlights.map(h => h.timestamp),
                0
            )
        };
    }
    
    // Cleanup old data
    cleanup(daysToKeep = 30) {
        if (!this.syncEnabled) return;
        
        const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
        
        // Clean up search history
        const searchHistory = this.getSearchHistory();
        const recentSearches = searchHistory.filter(entry => entry.timestamp > cutoffTime);
        this.set('search-history', recentSearches);
        
        // Note: Don't clean up bookmarks, notes, or reading progress as these are valuable user data
    }
}

// Create global storage instance
window.fasmStorage = new FASMeBookStorage();