// DOM Cache Manager for Performance Optimization
// Caches modal DOM elements after first creation to improve performance

class DOMCacheManager {
    constructor() {
        this.cache = new Map();
        this.templateCache = new Map();
        this.observers = new Set();
        this.maxCacheSize = 50;
        this.debug = false;
    }

    /**
     * Cache a DOM element with its metadata
     * @param {string} key - Unique identifier for the cached element
     * @param {HTMLElement} element - DOM element to cache
     * @param {Object} metadata - Additional metadata about the element
     */
    cacheElement(key, element, metadata = {}) {
        if (!key || !element) {
            console.warn('Invalid cache parameters:', { key, element });
            return false;
        }

        // Clone the element to avoid reference issues
        const clonedElement = element.cloneNode(true);
        
        const cacheEntry = {
            element: clonedElement,
            metadata: {
                ...metadata,
                createdAt: new Date(),
                accessCount: 0,
                lastAccessed: new Date(),
                size: this.calculateElementSize(clonedElement)
            }
        };

        this.cache.set(key, cacheEntry);
        this.enforceMaxCacheSize();
        
        if (this.debug) {
            console.log(`Cached element: ${key}`, cacheEntry);
        }

        this.notifyObservers('cached', { key, metadata: cacheEntry.metadata });
        return true;
    }

    /**
     * Retrieve a cached DOM element
     * @param {string} key - Unique identifier
     * @returns {HTMLElement|null} Cloned cached element or null
     */
    getCachedElement(key) {
        const cacheEntry = this.cache.get(key);
        if (!cacheEntry) {
            if (this.debug) {
                console.log(`Cache miss: ${key}`);
            }
            return null;
        }

        // Update access statistics
        cacheEntry.metadata.accessCount++;
        cacheEntry.metadata.lastAccessed = new Date();

        // Return a fresh clone to avoid mutations affecting cached version
        const clonedElement = cacheEntry.element.cloneNode(true);
        
        if (this.debug) {
            console.log(`Cache hit: ${key}`, cacheEntry.metadata);
        }

        this.notifyObservers('retrieved', { key, metadata: cacheEntry.metadata });
        return clonedElement;
    }

    /**
     * Check if an element is cached
     * @param {string} key - Unique identifier
     * @returns {boolean}
     */
    isCached(key) {
        return this.cache.has(key);
    }

    /**
     * Remove an element from cache
     * @param {string} key - Unique identifier
     * @returns {boolean} True if removed, false if not found
     */
    removeCached(key) {
        const removed = this.cache.delete(key);
        if (removed) {
            this.notifyObservers('removed', { key });
        }
        return removed;
    }

    /**
     * Cache a template string for dynamic rendering
     * @param {string} key - Template identifier
     * @param {string} template - HTML template string
     * @param {Object} metadata - Template metadata
     */
    cacheTemplate(key, template, metadata = {}) {
        const templateEntry = {
            template,
            metadata: {
                ...metadata,
                createdAt: new Date(),
                accessCount: 0,
                lastAccessed: new Date(),
                size: template.length
            }
        };

        this.templateCache.set(key, templateEntry);
        
        if (this.debug) {
            console.log(`Cached template: ${key}`, templateEntry);
        }
    }

    /**
     * Retrieve and render a cached template
     * @param {string} key - Template identifier
     * @param {Object} data - Data to interpolate into template
     * @returns {HTMLElement|null}
     */
    renderTemplate(key, data = {}) {
        const templateEntry = this.templateCache.get(key);
        if (!templateEntry) {
            if (this.debug) {
                console.log(`Template cache miss: ${key}`);
            }
            return null;
        }

        // Update access statistics
        templateEntry.metadata.accessCount++;
        templateEntry.metadata.lastAccessed = new Date();

        // Simple template interpolation
        let renderedHTML = templateEntry.template;
        for (const [placeholder, value] of Object.entries(data)) {
            const regex = new RegExp(`{{\\s*${placeholder}\\s*}}`, 'g');
            renderedHTML = renderedHTML.replace(regex, value);
        }

        // Create element from rendered HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = renderedHTML;
        const element = tempDiv.firstElementChild;

        if (this.debug) {
            console.log(`Template rendered: ${key}`, templateEntry.metadata);
        }

        return element;
    }

    /**
     * Create and cache a settings modal
     * @param {Object} config - Modal configuration
     * @returns {HTMLElement} Cached or newly created modal
     */
    getOrCreateSettingsModal(config = {}) {
        const cacheKey = 'settings-modal';
        
        // Try to get from cache first
        let modal = this.getCachedElement(cacheKey);
        if (modal) {
            this.updateModalContent(modal, config);
            return modal;
        }

        // Create new modal if not cached
        modal = this.createSettingsModal(config);
        this.cacheElement(cacheKey, modal, {
            type: 'settings-modal',
            config: JSON.stringify(config),
            interactive: true
        });

        return modal;
    }

    /**
     * Create a complete settings modal DOM structure
     */
    createSettingsModal(config) {
        const modal = document.createElement('div');
        modal.id = 'settings-panel';
        modal.className = 'modal settings-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'settings-title');

        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header" data-drag-handle>
                    <h2 id="settings-title">⚙ Settings</h2>
                    <button class="modal-close" aria-label="Close settings">✕</button>
                </div>
                <div class="modal-body">
                    <div class="settings-section">
                        <h3>Display & Reading</h3>
                        <div class="setting-group">
                            <label for="display-mode">Display Mode:</label>
                            <select id="display-mode" aria-describedby="display-mode-desc">
                                <option value="eink">E-ink (High Contrast)</option>
                                <option value="dark">Dark Theme</option>
                                <option value="light">Light Theme</option>
                            </select>
                            <small id="display-mode-desc">Choose optimal display for your environment</small>
                        </div>
                        
                        <div class="setting-group">
                            <label for="font-size">Font Size:</label>
                            <div class="slider-container">
                                <input type="range" id="font-size" min="12" max="24" step="1" 
                                       aria-describedby="font-size-value">
                                <span id="font-size-value" class="slider-value">16px</span>
                            </div>
                        </div>
                        
                        <div class="setting-group">
                            <label for="line-height">Line Height:</label>
                            <div class="slider-container">
                                <input type="range" id="line-height" min="1.2" max="2.0" step="0.1"
                                       aria-describedby="line-height-value">
                                <span id="line-height-value" class="slider-value">1.6</span>
                            </div>
                        </div>
                    </div>

                    <div class="settings-section">
                        <h3>Features & Accessibility</h3>
                        <div class="setting-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="drawing-enabled">
                                <span class="checkmark"></span>
                                Enable Drawing Tools
                            </label>
                        </div>
                        
                        <div class="setting-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="auto-bookmark">
                                <span class="checkmark"></span>
                                Auto-bookmark Progress
                            </label>
                        </div>
                        
                        <div class="setting-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="sound-enabled">
                                <span class="checkmark"></span>
                                Sound Effects
                            </label>
                        </div>
                        
                        <div class="setting-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="animations">
                                <span class="checkmark"></span>
                                Enable Animations
                            </label>
                        </div>
                        
                        <div class="setting-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="keyboard-shortcuts">
                                <span class="checkmark"></span>
                                Keyboard Shortcuts
                            </label>
                        </div>
                    </div>

                    <div class="settings-section">
                        <h3>Reading Goals</h3>
                        <div class="setting-group">
                            <label for="reading-goal">Daily Reading Goal (minutes):</label>
                            <div class="slider-container">
                                <input type="range" id="reading-goal" min="5" max="120" step="5"
                                       aria-describedby="reading-goal-value">
                                <span id="reading-goal-value" class="slider-value">30 min</span>
                            </div>
                        </div>
                        
                        <div class="setting-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="show-progress">
                                <span class="checkmark"></span>
                                Show Reading Progress
                            </label>
                        </div>
                    </div>

                    <div class="settings-section">
                        <h3>Data & Sync</h3>
                        <div class="setting-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="auto-save">
                                <span class="checkmark"></span>
                                Auto-save Settings
                            </label>
                        </div>
                        
                        <div class="setting-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="sync-enabled">
                                <span class="checkmark"></span>
                                Sync Across Devices
                            </label>
                        </div>
                    </div>

                    <div class="settings-section">
                        <h3>Advanced</h3>
                        <div class="setting-group">
                            <button class="settings-button" id="reset-settings" type="button">
                                Reset to Defaults
                            </button>
                            <button class="settings-button" id="export-settings" type="button">
                                Export Settings
                            </button>
                            <button class="settings-button" id="import-settings" type="button">
                                Import Settings
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-primary" id="save-settings">Save Changes</button>
                    <button class="btn btn-secondary" id="cancel-settings">Cancel</button>
                </div>
            </div>
        `;

        this.setupModalAccessibility(modal);
        return modal;
    }

    /**
     * Update modal content with current configuration
     */
    updateModalContent(modal, config) {
        if (!modal || !config) return;

        // Update form values based on config
        Object.entries(config).forEach(([key, value]) => {
            const element = modal.querySelector(`#${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else if (element.type === 'range') {
                    element.value = value;
                    const valueDisplay = modal.querySelector(`#${element.id}-value`);
                    if (valueDisplay) {
                        valueDisplay.textContent = this.formatSliderValue(key, value);
                    }
                } else {
                    element.value = value;
                }
            }
        });
    }

    /**
     * Setup accessibility attributes for modal
     */
    setupModalAccessibility(modal) {
        // Focus management
        const firstFocusable = modal.querySelector('select, input, button');
        const lastFocusable = modal.querySelector('.modal-footer button:last-child');
        
        if (firstFocusable) {
            firstFocusable.setAttribute('data-first-focusable', 'true');
        }
        if (lastFocusable) {
            lastFocusable.setAttribute('data-last-focusable', 'true');
        }

        // Keyboard navigation
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.handleTabKeyPress(e, modal);
            } else if (e.key === 'Escape') {
                this.handleEscapeKey(modal);
            }
        });

        // ARIA live region for updates
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.position = 'absolute';
        liveRegion.style.left = '-10000px';
        liveRegion.id = 'settings-live-region';
        modal.appendChild(liveRegion);
    }

    /**
     * Handle Tab key navigation within modal
     */
    handleTabKeyPress(e, modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    /**
     * Handle Escape key press
     */
    handleEscapeKey(modal) {
        const closeButton = modal.querySelector('.modal-close');
        if (closeButton) {
            closeButton.click();
        }
    }

    /**
     * Format slider values for display
     */
    formatSliderValue(key, value) {
        switch (key) {
            case 'fontSize':
                return `${value}px`;
            case 'lineHeight':
                return parseFloat(value).toFixed(1);
            case 'readingGoal':
                return `${value} min`;
            default:
                return value;
        }
    }

    /**
     * Calculate approximate size of DOM element
     */
    calculateElementSize(element) {
        if (!element) return 0;
        
        // Rough estimation based on HTML content length and children count
        const htmlLength = element.outerHTML ? element.ouHTML.length : 0;
        const childrenCount = element.querySelectorAll('*').length;
        
        return htmlLength + (childrenCount * 50); // Rough heuristic
    }

    /**
     * Enforce maximum cache size by removing least recently used items
     */
    enforceMaxCacheSize() {
        if (this.cache.size <= this.maxCacheSize) return;

        // Sort by last accessed time and remove oldest
        const entries = Array.from(this.cache.entries())
            .sort((a, b) => a[1].metadata.lastAccessed - b[1].metadata.lastAccessed);

        const toRemove = entries.slice(0, this.cache.size - this.maxCacheSize);
        toRemove.forEach(([key]) => {
            this.cache.delete(key);
            if (this.debug) {
                console.log(`Evicted from cache: ${key}`);
            }
        });
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        const elements = Array.from(this.cache.values());
        const totalSize = elements.reduce((sum, entry) => sum + entry.metadata.size, 0);
        const totalAccesses = elements.reduce((sum, entry) => sum + entry.metadata.accessCount, 0);

        return {
            elementCount: this.cache.size,
            templateCount: this.templateCache.size,
            totalSize,
            totalAccesses,
            averageAccesses: elements.length > 0 ? totalAccesses / elements.length : 0,
            oldestEntry: elements.length > 0 ? 
                Math.min(...elements.map(e => e.metadata.createdAt.getTime())) : null,
            newestEntry: elements.length > 0 ?
                Math.max(...elements.map(e => e.metadata.createdAt.getTime())) : null
        };
    }

    /**
     * Clear all cached elements
     */
    clearCache() {
        const count = this.cache.size;
        this.cache.clear();
        this.templateCache.clear();
        
        this.notifyObservers('cleared', { count });
        
        if (this.debug) {
            console.log(`Cleared ${count} cached elements`);
        }
    }

    /**
     * Observer pattern for cache events
     */
    addObserver(callback) {
        this.observers.add(callback);
    }

    removeObserver(callback) {
        this.observers.delete(callback);
    }

    notifyObservers(event, data) {
        for (const callback of this.observers) {
            try {
                callback(event, data);
            } catch (error) {
                console.error('Cache observer error:', error);
            }
        }
    }

    /**
     * Enable/disable debug logging
     */
    setDebug(enabled) {
        this.debug = enabled;
    }

    /**
     * Set maximum cache size
     */
    setMaxCacheSize(size) {
        this.maxCacheSize = Math.max(1, size);
        this.enforceMaxCacheSize();
    }

    /**
     * Preload common templates
     */
    preloadTemplates() {
        // Preload common modal templates
        const settingsTemplate = `
            <div class="modal-section">
                <h3>{{ title }}</h3>
                <div class="setting-group">
                    {{ content }}
                </div>
            </div>
        `;
        
        this.cacheTemplate('modal-section', settingsTemplate, {
            type: 'template',
            usage: 'modal-sections'
        });

        const sliderTemplate = `
            <div class="slider-container">
                <input type="range" id="{{ id }}" min="{{ min }}" max="{{ max }}" 
                       step="{{ step }}" aria-describedby="{{ id }}-value">
                <span id="{{ id }}-value" class="slider-value">{{ value }}</span>
            </div>
        `;
        
        this.cacheTemplate('slider-control', sliderTemplate, {
            type: 'template',
            usage: 'form-controls'
        });
    }
}

// Create global instance
window.domCache = new DOMCacheManager();

// Preload templates on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.domCache.preloadTemplates();
    });
} else {
    window.domCache.preloadTemplates();
}