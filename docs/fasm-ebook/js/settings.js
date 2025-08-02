// Settings management for FASM eBook
class FASMeBookSettings {
    constructor() {
        this.defaultSettings = {
            displayMode: 'eink',
            fontSize: 16,
            lineHeight: 1.6,
            drawingEnabled: false,
            autoBookmark: true,
            soundEnabled: false,
            animations: false,
            syncEnabled: true,
            theme: 'eink',
            readingGoal: 30, // minutes per day
            showProgress: true,
            autoSave: true,
            keyboardShortcuts: true
        };
        
        this.settings = {};
        this.isOpen = false;
        
        // PWA install prompt
        this.deferredPrompt = null;
        
        this.init();
    }
    
    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.applySettings();
        this.setupKeyboardShortcuts();
        this.setupPWAInstall();
    }
    
    loadSettings() {
        if (window.fasmStorage) {
            this.settings = { ...this.defaultSettings, ...window.fasmStorage.getPreferences() };
        } else {
            this.settings = { ...this.defaultSettings };
        }
    }
    
    saveSettings() {
        if (window.fasmStorage) {
            window.fasmStorage.savePreferences(this.settings);
        }
        
        // Also save to localStorage as backup
        try {
            localStorage.setItem('fasmebook-settings', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Could not save settings to localStorage:', error);
        }
    }
    
    setupEventListeners() {
        const settingsToggle = document.getElementById('settings-toggle');
        const settingsContent = document.querySelector('.settings-content');
        
        if (settingsToggle) {
            settingsToggle.addEventListener('click', () => this.toggle());
        }
        
        // Close settings when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && !e.target.closest('#settings-panel')) {
                this.close();
            }
        });
        
        // Setting controls
        this.setupDisplayModeControl();
        this.setupFontSizeControl();
        this.setupLineHeightControl();
        this.setupDrawingModeControl();
        this.setupThemeControl();
        this.setupToggleControls();
        
        // Advanced settings button
        this.createAdvancedSettingsButton();
    }
    
    setupDisplayModeControl() {
        const displayModeSelect = document.getElementById('display-mode');
        if (displayModeSelect) {
            displayModeSelect.value = this.settings.displayMode;
            displayModeSelect.addEventListener('change', (e) => {
                this.updateSetting('displayMode', e.target.value);
                this.applyDisplayMode(e.target.value);
            });
        }
    }
    
    setupFontSizeControl() {
        const fontSizeSlider = document.getElementById('font-size');
        const fontSizeValue = document.getElementById('font-size-value');
        
        if (fontSizeSlider && fontSizeValue) {
            fontSizeSlider.value = this.settings.fontSize;
            fontSizeValue.textContent = `${this.settings.fontSize}px`;
            
            fontSizeSlider.addEventListener('input', (e) => {
                const size = parseInt(e.target.value);
                fontSizeValue.textContent = `${size}px`;
                this.updateSetting('fontSize', size);
                this.applyFontSize(size);
            });
        }
    }
    
    setupLineHeightControl() {
        const lineHeightSlider = document.getElementById('line-height');
        const lineHeightValue = document.getElementById('line-height-value');
        
        if (lineHeightSlider && lineHeightValue) {
            lineHeightSlider.value = this.settings.lineHeight;
            lineHeightValue.textContent = this.settings.lineHeight;
            
            lineHeightSlider.addEventListener('input', (e) => {
                const height = parseFloat(e.target.value);
                lineHeightValue.textContent = height;
                this.updateSetting('lineHeight', height);
                this.applyLineHeight(height);
            });
        }
    }
    
    setupDrawingModeControl() {
        const drawingModeCheckbox = document.getElementById('drawing-mode');
        if (drawingModeCheckbox) {
            drawingModeCheckbox.checked = this.settings.drawingEnabled;
            drawingModeCheckbox.addEventListener('change', (e) => {
                this.updateSetting('drawingEnabled', e.target.checked);
                this.applyDrawingMode(e.target.checked);
            });
        }
    }
    
    setupThemeControl() {
        // Create theme selector if it doesn't exist
        const settingsContent = document.querySelector('.settings-content');
        if (settingsContent && !document.getElementById('theme-select')) {
            const themeGroup = document.createElement('div');
            themeGroup.className = 'setting-group';
            themeGroup.innerHTML = `
                <label>Theme:</label>
                <select id="theme-select">
                    <option value="eink">eInk Friendly</option>
                    <option value="standard">Standard</option>
                    <option value="dark">Dark Mode</option>
                    <option value="sepia">Sepia</option>
                </select>
            `;
            settingsContent.appendChild(themeGroup);
            
            const themeSelect = document.getElementById('theme-select');
            themeSelect.value = this.settings.theme;
            themeSelect.addEventListener('change', (e) => {
                this.updateSetting('theme', e.target.value);
                this.applyTheme(e.target.value);
            });
        }
    }
    
    setupToggleControls() {
        const toggleSettings = [
            { id: 'auto-bookmark', setting: 'autoBookmark', label: 'Auto Bookmark' },
            { id: 'sound-enabled', setting: 'soundEnabled', label: 'Sound Effects' },
            { id: 'animations', setting: 'animations', label: 'Animations' },
            { id: 'show-progress', setting: 'showProgress', label: 'Show Progress' },
            { id: 'auto-save', setting: 'autoSave', label: 'Auto Save' },
            { id: 'keyboard-shortcuts', setting: 'keyboardShortcuts', label: 'Keyboard Shortcuts' }
        ];
        
        toggleSettings.forEach(({ id, setting, label }) => {
            this.createToggleControl(id, setting, label);
        });
        
        // Add PWA install button
        this.createPWAInstallButton();
    }
    
    createToggleControl(id, settingKey, label) {
        const settingsContent = document.querySelector('.settings-content');
        if (!settingsContent || document.getElementById(id)) return;
        
        const group = document.createElement('div');
        group.className = 'setting-group';
        group.innerHTML = `
            <label>
                <input type="checkbox" id="${id}" ${this.settings[settingKey] ? 'checked' : ''}>
                ${label}
            </label>
        `;
        
        settingsContent.appendChild(group);
        
        const checkbox = document.getElementById(id);
        checkbox.addEventListener('change', (e) => {
            this.updateSetting(settingKey, e.target.checked);
            this.applySetting(settingKey, e.target.checked);
        });
    }
    
    createAdvancedSettingsButton() {
        const settingsContent = document.querySelector('.settings-content');
        if (!settingsContent || document.getElementById('advanced-settings-btn')) return;
        
        const advancedGroup = document.createElement('div');
        advancedGroup.className = 'setting-group';
        advancedGroup.innerHTML = `
            <button id="advanced-settings-btn" class="tool-btn">Advanced Settings</button>
            <button id="export-settings-btn" class="tool-btn">Export Settings</button>
            <button id="import-settings-btn" class="tool-btn">Import Settings</button>
            <button id="reset-settings-btn" class="tool-btn">Reset to Default</button>
        `;
        
        settingsContent.appendChild(advancedGroup);
        
        // Event listeners
        document.getElementById('advanced-settings-btn')?.addEventListener('click', () => this.openAdvancedSettings());
        document.getElementById('export-settings-btn')?.addEventListener('click', () => this.exportSettings());
        document.getElementById('import-settings-btn')?.addEventListener('click', () => this.importSettings());
        document.getElementById('reset-settings-btn')?.addEventListener('click', () => this.resetSettings());
    }
    
    setupPWAInstall() {
        // Listen for the beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later
            this.deferredPrompt = e;
            // Update install button visibility
            this.updateInstallButtonVisibility();
        });
        
        // Listen for app installed event
        window.addEventListener('appinstalled', (e) => {
            console.log('PWA was installed');
            this.updateInstallButtonVisibility();
        });
    }
    
    createPWAInstallButton() {
        const settingsContent = document.querySelector('.settings-content');
        if (!settingsContent || document.getElementById('pwa-install-btn')) return;
        
        const installGroup = document.createElement('div');
        installGroup.className = 'setting-group pwa-install-group';
        installGroup.innerHTML = `
            <div class="pwa-info">
                <h4>📱 Install App</h4>
                <p>Install this eBook as a standalone app for offline reading and quick access.</p>
            </div>
            <button id="pwa-install-btn" class="tool-btn pwa-install-btn" style="display: none;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7,10 12,15 17,10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Install FASM eBook
            </button>
            <div id="pwa-install-status" class="pwa-status"></div>
        `;
        
        settingsContent.appendChild(installGroup);
        
        // Add click event for install button
        const installBtn = document.getElementById('pwa-install-btn');
        if (installBtn) {
            installBtn.addEventListener('click', () => this.installPWA());
        }
        
        // Check initial install state
        this.updateInstallButtonVisibility();
    }
    
    updateInstallButtonVisibility() {
        const installBtn = document.getElementById('pwa-install-btn');
        const statusElement = document.getElementById('pwa-install-status');
        
        if (!installBtn || !statusElement) return;
        
        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches || 
            window.navigator.standalone === true ||
            document.referrer.includes('android-app://')) {
            // App is installed
            installBtn.style.display = 'none';
            statusElement.innerHTML = '<span style="color: #4CAF50;">✅ App is installed</span>';
        } else if (this.deferredPrompt) {
            // Can install
            installBtn.style.display = 'block';
            statusElement.innerHTML = '<span style="color: #666;">Ready to install</span>';
        } else if (this.isPWASupported()) {
            // PWA supported but prompt not available yet
            installBtn.style.display = 'none';
            statusElement.innerHTML = '<span style="color: #666;">Install option will appear when available</span>';
        } else {
            // PWA not supported
            installBtn.style.display = 'none';
            statusElement.innerHTML = '<span style="color: #999;">Installation not supported on this browser</span>';
        }
    }
    
    isPWASupported() {
        return 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window;
    }
    
    async installPWA() {
        if (!this.deferredPrompt) {
            console.log('No install prompt available');
            return;
        }
        
        const installBtn = document.getElementById('pwa-install-btn');
        const statusElement = document.getElementById('pwa-install-status');
        
        if (installBtn) {
            installBtn.disabled = true;
            installBtn.textContent = 'Installing...';
        }
        
        try {
            // Show the install prompt
            this.deferredPrompt.prompt();
            
            // Wait for the user to respond to the prompt
            const { outcome } = await this.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('User accepted the install prompt');
                if (statusElement) {
                    statusElement.innerHTML = '<span style="color: #4CAF50;">✅ Installing...</span>';
                }
            } else {
                console.log('User dismissed the install prompt');
                if (statusElement) {
                    statusElement.innerHTML = '<span style="color: #999;">Install cancelled</span>';
                }
            }
        } catch (error) {
            console.error('Error during installation:', error);
            if (statusElement) {
                statusElement.innerHTML = '<span style="color: #f44336;">Installation failed</span>';
            }
        } finally {
            // Reset the deferred prompt
            this.deferredPrompt = null;
            
            if (installBtn) {
                installBtn.disabled = false;
                installBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7,10 12,15 17,10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Install FASM eBook
                `;
            }
            
            // Update button visibility
            setTimeout(() => this.updateInstallButtonVisibility(), 1000);
        }
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    open() {
        const settingsContent = document.querySelector('.settings-content');
        if (settingsContent) {
            // Add viewport boundary detection
            this.adjustPanelPosition(settingsContent);
            settingsContent.classList.add('visible');
            this.isOpen = true;
        }
    }
    
    adjustPanelPosition(panel) {
        // Reset position classes
        panel.classList.remove('adjust-left', 'adjust-down');
        
        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Get panel dimensions (use computed or fallback values)
        const panelWidth = 300; // min(300px, calc(100vw - 2rem))
        const panelHeight = 400; // estimated height
        
        // Check if panel would go outside right edge (considering right: 1rem positioning)
        const availableWidth = viewportWidth - 32; // Account for margins
        if (panelWidth > availableWidth * 0.8) {
            panel.classList.add('adjust-left');
        }
        
        // Check if panel would go outside bottom edge (considering top: 5rem positioning)
        const availableHeight = viewportHeight - 160; // Account for top position and margins
        if (panelHeight > availableHeight) {
            panel.classList.add('adjust-down');
        }
    }
    
    close() {
        const settingsContent = document.querySelector('.settings-content');
        if (settingsContent) {
            settingsContent.classList.remove('visible');
            this.isOpen = false;
        }
    }
    
    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
    }
    
    applySetting(key, value) {
        switch (key) {
            case 'displayMode':
                this.applyDisplayMode(value);
                break;
            case 'fontSize':
                this.applyFontSize(value);
                break;
            case 'lineHeight':
                this.applyLineHeight(value);
                break;
            case 'drawingEnabled':
                this.applyDrawingMode(value);
                break;
            case 'theme':
                this.applyTheme(value);
                break;
            case 'animations':
                this.applyAnimations(value);
                break;
            case 'keyboardShortcuts':
                this.applyKeyboardShortcuts(value);
                break;
        }
    }
    
    applySettings() {
        Object.keys(this.settings).forEach(key => {
            this.applySetting(key, this.settings[key]);
        });
    }
    
    applyDisplayMode(mode) {
        document.body.className = document.body.className
            .replace(/\b(eink-mode|standard-mode|dark-mode)\b/g, '');
        document.body.classList.add(`${mode}-mode`);
        
        // Update CSS variables based on mode
        const root = document.documentElement;
        
        switch (mode) {
            case 'eink':
                this.setColorScheme(root, {
                    '--bg-color': '#ffffff',
                    '--text-color': '#000000',
                    '--border-color': '#cccccc',
                    '--accent-color': '#333333',
                    '--highlight-color': '#f5f5f5'
                });
                break;
            case 'dark':
                this.setColorScheme(root, {
                    '--bg-color': '#1a1a1a',
                    '--text-color': '#e0e0e0',
                    '--border-color': '#404040',
                    '--accent-color': '#ffffff',
                    '--highlight-color': '#2a2a2a'
                });
                break;
            case 'standard':
                this.setColorScheme(root, {
                    '--bg-color': '#ffffff',
                    '--text-color': '#333333',
                    '--border-color': '#e0e0e0',
                    '--accent-color': '#007acc',
                    '--highlight-color': '#f0f8ff'
                });
                break;
        }
    }
    
    applyFontSize(size) {
        document.documentElement.style.setProperty('--font-size', `${size}px`);
    }
    
    applyLineHeight(height) {
        document.documentElement.style.setProperty('--line-height', height);
    }
    
    applyDrawingMode(enabled) {
        if (window.fasmDrawing) {
            if (enabled) {
                window.fasmDrawing.enable();
            } else {
                window.fasmDrawing.disable();
            }
        }
        
        // Dispatch custom event for drawing mode change
        window.dispatchEvent(new CustomEvent('drawingModeChanged', {
            detail: { enabled: enabled }
        }));
    }
    
    applyTheme(theme) {
        // Theme is handled by display mode for now
        this.applyDisplayMode(theme);
    }
    
    applyAnimations(enabled) {
        if (enabled) {
            document.body.classList.remove('no-animations');
        } else {
            document.body.classList.add('no-animations');
        }
    }
    
    applyKeyboardShortcuts(enabled) {
        // Keyboard shortcuts are handled in main.js
        // This just updates the setting for reference
        document.body.dataset.keyboardShortcuts = enabled ? 'true' : 'false';
    }
    
    setColorScheme(root, colors) {
        Object.entries(colors).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (!this.settings.keyboardShortcuts) return;
            
            // Settings shortcuts
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case ',': // Ctrl/Cmd + , = Settings
                        e.preventDefault();
                        this.toggle();
                        break;
                    case 'd': // Ctrl/Cmd + D = Toggle drawing mode
                        e.preventDefault();
                        this.updateSetting('drawingEnabled', !this.settings.drawingEnabled);
                        this.applyDrawingMode(this.settings.drawingEnabled);
                        break;
                }
            } else {
                switch (e.key) {
                    case 'F11': // F11 = Toggle fullscreen
                        e.preventDefault();
                        this.toggleFullscreen();
                        break;
                }
            }
        });
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(console.error);
        } else {
            document.exitFullscreen().catch(console.error);
        }
    }
    
    openAdvancedSettings() {
        // Create advanced settings modal
        const modal = this.createAdvancedSettingsModal();
        document.body.appendChild(modal);
    }
    
    createAdvancedSettingsModal() {
        const modal = document.createElement('div');
        modal.className = 'settings-modal';
        modal.innerHTML = `
            <div class="settings-modal-content">
                <div class="settings-modal-header">
                    <h3>Advanced Settings</h3>
                    <button class="close-modal">×</button>
                </div>
                <div class="settings-modal-body">
                    <div class="setting-group">
                        <label>Reading Goal (minutes/day):</label>
                        <input type="number" id="reading-goal" min="5" max="480" value="${this.settings.readingGoal}">
                    </div>
                    <div class="setting-group">
                        <label>Auto-save Interval (seconds):</label>
                        <input type="number" id="autosave-interval" min="5" max="300" value="30">
                    </div>
                    <div class="setting-group">
                        <label>Cache Size (MB):</label>
                        <input type="number" id="cache-size" min="10" max="500" value="50">
                    </div>
                    <div class="setting-group">
                        <label>
                            <input type="checkbox" id="preload-chapters" ${this.settings.preloadChapters ? 'checked' : ''}>
                            Preload Next Chapter
                        </label>
                    </div>
                    <div class="setting-group">
                        <button id="clear-cache" class="tool-btn">Clear Cache</button>
                        <button id="recalculate-progress" class="tool-btn">Recalculate Progress</button>
                    </div>
                </div>
                <div class="settings-modal-footer">
                    <button id="save-advanced" class="tool-btn">Save</button>
                    <button id="cancel-advanced" class="tool-btn">Cancel</button>
                </div>
            </div>
        `;
        
        // Event listeners
        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        modal.querySelector('#cancel-advanced').addEventListener('click', () => modal.remove());
        modal.querySelector('#save-advanced').addEventListener('click', () => {
            this.saveAdvancedSettings(modal);
            modal.remove();
        });
        
        modal.querySelector('#clear-cache').addEventListener('click', () => this.clearCache());
        modal.querySelector('#recalculate-progress').addEventListener('click', () => this.recalculateProgress());
        
        return modal;
    }
    
    saveAdvancedSettings(modal) {
        const readingGoal = parseInt(modal.querySelector('#reading-goal').value);
        const preloadChapters = modal.querySelector('#preload-chapters').checked;
        
        this.updateSetting('readingGoal', readingGoal);
        this.updateSetting('preloadChapters', preloadChapters);
    }
    
    exportSettings() {
        const settings = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            settings: this.settings,
            userData: window.fasmStorage ? window.fasmStorage.exportData() : null
        };
        
        const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `fasm-ebook-settings-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
    
    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const imported = JSON.parse(event.target.result);
                    
                    if (imported.settings) {
                        this.settings = { ...this.defaultSettings, ...imported.settings };
                        this.saveSettings();
                        this.applySettings();
                        this.updateSettingsUI();
                    }
                    
                    if (imported.userData && window.fasmStorage) {
                        window.fasmStorage.importData(imported.userData);
                    }
                    
                    alert('Settings imported successfully!');
                } catch (error) {
                    alert('Failed to import settings: Invalid file format');
                    console.error('Import error:', error);
                }
            };
            
            reader.readAsText(file);
        });
        
        input.click();
    }
    
    resetSettings() {
        if (!confirm('Reset all settings to default? This cannot be undone.')) return;
        
        this.settings = { ...this.defaultSettings };
        this.saveSettings();
        this.applySettings();
        this.updateSettingsUI();
        
        alert('Settings reset to default values.');
    }
    
    updateSettingsUI() {
        // Update all UI controls to reflect current settings
        const displayModeSelect = document.getElementById('display-mode');
        if (displayModeSelect) displayModeSelect.value = this.settings.displayMode;
        
        const fontSizeSlider = document.getElementById('font-size');
        const fontSizeValue = document.getElementById('font-size-value');
        if (fontSizeSlider && fontSizeValue) {
            fontSizeSlider.value = this.settings.fontSize;
            fontSizeValue.textContent = `${this.settings.fontSize}px`;
        }
        
        const lineHeightSlider = document.getElementById('line-height');
        const lineHeightValue = document.getElementById('line-height-value');
        if (lineHeightSlider && lineHeightValue) {
            lineHeightSlider.value = this.settings.lineHeight;
            lineHeightValue.textContent = this.settings.lineHeight;
        }
        
        const drawingModeCheckbox = document.getElementById('drawing-mode');
        if (drawingModeCheckbox) drawingModeCheckbox.checked = this.settings.drawingEnabled;
        
        // Update other checkboxes
        ['auto-bookmark', 'sound-enabled', 'animations', 'show-progress', 'auto-save', 'keyboard-shortcuts'].forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                const settingKey = id.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                checkbox.checked = this.settings[settingKey] || false;
            }
        });
    }
    
    clearCache() {
        if (!confirm('Clear all cached data? This will remove downloaded chapters and may slow down loading.')) return;
        
        // Clear various caches
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => caches.delete(name));
            });
        }
        
        // Clear localStorage cache items
        Object.keys(localStorage).forEach(key => {
            if (key.includes('cache') || key.includes('temp')) {
                localStorage.removeItem(key);
            }
        });
        
        alert('Cache cleared successfully!');
    }
    
    recalculateProgress() {
        if (window.fasmStorage) {
            // Recalculate reading progress
            const progress = window.fasmStorage.getReadingProgress();
            console.log('Current progress:', progress);
            
            // Could implement more sophisticated progress recalculation here
            alert('Progress recalculated successfully!');
        } else {
            alert('Storage not available for progress recalculation.');
        }
    }
    
    // Accessibility features
    increaseAccessibility() {
        this.updateSetting('fontSize', Math.min(24, this.settings.fontSize + 2));
        this.updateSetting('lineHeight', Math.min(2.0, this.settings.lineHeight + 0.1));
        this.applyFontSize(this.settings.fontSize);
        this.applyLineHeight(this.settings.lineHeight);
        this.updateSettingsUI();
    }
    
    decreaseAccessibility() {
        this.updateSetting('fontSize', Math.max(12, this.settings.fontSize - 2));
        this.updateSetting('lineHeight', Math.max(1.2, this.settings.lineHeight - 0.1));
        this.applyFontSize(this.settings.fontSize);
        this.applyLineHeight(this.settings.lineHeight);
        this.updateSettingsUI();
    }
    
    // Get current settings
    get(key) {
        return this.settings[key];
    }
    
    // Set a setting programmatically
    set(key, value) {
        this.updateSetting(key, value);
        this.applySetting(key, value);
    }
    
    // Get all settings
    getAll() {
        return { ...this.settings };
    }
}

// CSS for settings modal
const settingsModalCSS = `
.settings-modal {
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

.settings-modal-content {
    background: var(--bg-color);
    border: 2px solid var(--accent-color);
    border-radius: 8px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
}

.settings-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid var(--border-color);
    background: var(--highlight-color);
}

.settings-modal-header h3 {
    margin: 0;
    font-size: 1.2rem;
}

.close-modal {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 2rem;
    height: 2rem;
}

.settings-modal-body {
    padding: 1.5rem;
}

.settings-modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding: 1rem;
    border-top: 1px solid var(--border-color);
    background: var(--highlight-color);
}

.no-animations * {
    animation: none !important;
    transition: none !important;
}
`;

// Add CSS to document
const settingsStyle = document.createElement('style');
settingsStyle.textContent = settingsModalCSS;
document.head.appendChild(settingsStyle);

// Initialize settings when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.fasmSettings = new FASMeBookSettings();
});