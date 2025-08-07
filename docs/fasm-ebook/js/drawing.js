// Drawing functionality for eInk devices like reMarkable
class FASMeBookDrawing {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isDrawing = false;
        this.isEnabled = false;
        this.lastX = 0;
        this.lastY = 0;
        this.drawings = [];
        this.currentPath = [];
        this.brushSize = 2;
        this.brushColor = '#000000';
        this.pressure = 1;
        
        this.init();
    }
    
    init() {
        this.canvas = document.getElementById('drawing-canvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        this.setupCanvas();
        this.setupEventListeners();
        this.loadDrawings();
        
        // Initialize drawing management system
        this.initDrawingManager();
    }
    
    setupCanvas() {
        // Set canvas size to match viewport
        this.resizeCanvas();
        
        // Configure drawing context
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.imageSmoothingEnabled = false; // Better for eInk
        
        // Set initial drawing properties
        this.ctx.strokeStyle = this.brushColor;
        this.ctx.lineWidth = this.brushSize;
        
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        if (!this.canvas) return;
        
        // Store current drawings before resize
        const imageData = this.ctx ? this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height) : null;
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Restore drawing properties after resize
        if (this.ctx) {
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.imageSmoothingEnabled = false;
            this.ctx.strokeStyle = this.brushColor;
            this.ctx.lineWidth = this.brushSize;
            
            // Restore previous drawings if they existed
            if (imageData) {
                this.ctx.putImageData(imageData, 0, 0);
            }
        }
    }
    
    setupEventListeners() {
        if (!this.canvas) return;
        
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());
        
        // Touch events for tablets/stylus
        this.canvas.addEventListener('touchstart', (e) => this.handleTouch(e, 'start'));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouch(e, 'move'));
        this.canvas.addEventListener('touchend', (e) => this.handleTouch(e, 'end'));
        this.canvas.addEventListener('touchcancel', (e) => this.handleTouch(e, 'end'));
        
        // Pressure-sensitive stylus events (for devices that support it)
        this.canvas.addEventListener('pointerdown', (e) => this.handlePointer(e, 'start'));
        this.canvas.addEventListener('pointermove', (e) => this.handlePointer(e, 'move'));
        this.canvas.addEventListener('pointerup', (e) => this.handlePointer(e, 'end'));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Settings integration
        this.setupSettingsIntegration();
    }
    
    startDrawing(e) {
        if (!this.isEnabled) return;
        
        this.isDrawing = true;
        const coords = this.getEventCoordinates(e);
        this.lastX = coords.x;
        this.lastY = coords.y;
        
        // Start new path
        this.currentPath = [{
            x: this.lastX,
            y: this.lastY,
            pressure: this.getPressure(e),
            timestamp: Date.now()
        }];
        
        // Begin path on canvas
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
    }
    
    draw(e) {
        if (!this.isDrawing || !this.isEnabled) return;
        
        const coords = this.getEventCoordinates(e);
        const pressure = this.getPressure(e);
        
        // Add point to current path
        this.currentPath.push({
            x: coords.x,
            y: coords.y,
            pressure: pressure,
            timestamp: Date.now()
        });
        
        // Draw with pressure-sensitive line width
        const pressureWidth = this.brushSize * pressure;
        this.ctx.lineWidth = Math.max(1, pressureWidth);
        
        // Draw line to current position
        this.ctx.lineTo(coords.x, coords.y);
        this.ctx.stroke();
        
        // Update last position
        this.lastX = coords.x;
        this.lastY = coords.y;
    }
    
    stopDrawing() {
        if (!this.isDrawing) return;
        
        this.isDrawing = false;
        
        // Save completed path
        if (this.currentPath.length > 1) {
            const drawingData = {
                id: this.generateDrawingId(),
                path: this.currentPath,
                brushSize: this.brushSize,
                brushColor: this.brushColor,
                chapterId: window.fasmEbook?.currentChapter?.id,
                page: window.fasmEbook?.currentPage,
                timestamp: Date.now()
            };
            
            this.drawings.push(drawingData);
            this.saveDrawings();
        }
        
        this.currentPath = [];
        this.ctx.beginPath(); // Reset path
    }
    
    handleTouch(e, action) {
        e.preventDefault(); // Prevent scrolling
        
        if (e.touches && e.touches.length === 1) {
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent(
                action === 'start' ? 'mousedown' : action === 'move' ? 'mousemove' : 'mouseup',
                {
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                    pressure: touch.force || 0.5
                }
            );
            
            if (action === 'start') this.startDrawing(mouseEvent);
            else if (action === 'move') this.draw(mouseEvent);
            else this.stopDrawing();
        }
    }
    
    handlePointer(e, action) {
        // Handle pressure-sensitive stylus input
        if (e.pointerType === 'pen') {
            this.pressure = e.pressure || 0.5;
            
            const mouseEvent = new MouseEvent(
                action === 'start' ? 'mousedown' : action === 'move' ? 'mousemove' : 'mouseup',
                {
                    clientX: e.clientX,
                    clientY: e.clientY,
                    pressure: e.pressure
                }
            );
            
            if (action === 'start') this.startDrawing(mouseEvent);
            else if (action === 'move') this.draw(mouseEvent);
            else this.stopDrawing();
        }
    }
    
    handleKeyboard(e) {
        if (!this.isEnabled) return;
        
        // Only handle shortcuts when drawing is enabled
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'z':
                    e.preventDefault();
                    this.undo();
                    break;
                case 'y':
                    e.preventDefault();
                    this.redo();
                    break;
                case 'c':
                    e.preventDefault();
                    this.clear();
                    break;
            }
        } else {
            switch (e.key) {
                case 'Escape':
                    this.disable();
                    break;
                case '+':
                case '=':
                    this.increaseBrushSize();
                    break;
                case '-':
                    this.decreaseBrushSize();
                    break;
            }
        }
    }
    
    getEventCoordinates(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (this.canvas.width / rect.width),
            y: (e.clientY - rect.top) * (this.canvas.height / rect.height)
        };
    }
    
    getPressure(e) {
        // Try to get pressure from various sources
        if (e.pressure !== undefined) return e.pressure;
        if (e.webkitForce !== undefined) return e.webkitForce;
        if (e.force !== undefined) return e.force;
        
        // Default pressure
        return this.pressure;
    }
    
    enable() {
        this.isEnabled = true;
        this.canvas.classList.add('active');
        document.body.style.userSelect = 'none'; // Prevent text selection while drawing
        
        // Show drawing tools
        this.showDrawingTools();
    }
    
    disable() {
        this.isEnabled = false;
        this.isDrawing = false;
        this.canvas.classList.remove('active');
        document.body.style.userSelect = '';
        
        // Hide drawing tools
        this.hideDrawingTools();
    }
    
    toggle() {
        if (this.isEnabled) {
            this.disable();
        } else {
            this.enable();
        }
    }
    
    clear() {
        if (!confirm('Clear all drawings on this page?')) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Remove drawings for current page
        const currentChapter = window.fasmEbook?.currentChapter?.id;
        const currentPage = window.fasmEbook?.currentPage;
        
        this.drawings = this.drawings.filter(drawing => 
            drawing.chapterId !== currentChapter || drawing.page !== currentPage
        );
        
        this.saveDrawings();
    }
    
    undo() {
        // Remove last drawing and redraw everything
        if (this.drawings.length === 0) return;
        
        const currentChapter = window.fasmEbook?.currentChapter?.id;
        const currentPage = window.fasmEbook?.currentPage;
        
        // Find and remove the last drawing for current page
        for (let i = this.drawings.length - 1; i >= 0; i--) {
            const drawing = this.drawings[i];
            if (drawing.chapterId === currentChapter && drawing.page === currentPage) {
                this.drawings.splice(i, 1);
                break;
            }
        }
        
        this.redrawCanvas();
        this.saveDrawings();
    }
    
    redo() {
        // Redo functionality would require maintaining a separate redo stack
        // For simplicity, not implemented in this version
        console.log('Redo not implemented yet');
    }
    
    setBrushSize(size) {
        this.brushSize = Math.max(1, Math.min(20, size));
        this.ctx.lineWidth = this.brushSize;
        this.updateBrushDisplay();
    }
    
    increaseBrushSize() {
        this.setBrushSize(this.brushSize + 1);
    }
    
    decreaseBrushSize() {
        this.setBrushSize(this.brushSize - 1);
    }
    
    setBrushColor(color) {
        this.brushColor = color;
        this.ctx.strokeStyle = this.brushColor;
    }
    
    showDrawingTools() {
        // Create drawing tools UI if it doesn't exist
        let toolsPanel = document.getElementById('drawing-tools');
        if (!toolsPanel) {
            toolsPanel = this.createDrawingTools();
            document.body.appendChild(toolsPanel);
        }
        
        toolsPanel.style.display = 'block';
    }
    
    hideDrawingTools() {
        const toolsPanel = document.getElementById('drawing-tools');
        if (toolsPanel) {
            toolsPanel.style.display = 'none';
        }
    }
    
    createDrawingTools() {
        const toolsPanel = document.createElement('div');
        toolsPanel.id = 'drawing-tools';
        toolsPanel.className = 'drawing-tools';
        
        toolsPanel.innerHTML = `
            <div class="drawing-tools-header">
                <h4>Drawing Tools</h4>
                <button id="close-drawing" class="close-drawing">×</button>
            </div>
            <div class="drawing-tools-content">
                <div class="tool-group">
                    <label>Brush Size:</label>
                    <input type="range" id="brush-size" min="1" max="20" value="${this.brushSize}">
                    <span id="brush-size-display">${this.brushSize}px</span>
                </div>
                <div class="tool-group">
                    <label>Color:</label>
                    <div class="color-palette">
                        <button class="color-btn active" data-color="#000000" style="background: #000000;"></button>
                        <button class="color-btn" data-color="#333333" style="background: #333333;"></button>
                        <button class="color-btn" data-color="#666666" style="background: #666666;"></button>
                        <button class="color-btn" data-color="#999999" style="background: #999999;"></button>
                    </div>
                </div>
                <div class="tool-group">
                    <button id="clear-drawing" class="tool-btn">Clear Page</button>
                    <button id="undo-drawing" class="tool-btn">Undo</button>
                    <button id="open-manager" class="tool-btn">📁 Library</button>
                </div>
            </div>
        `;
        
        // Add event listeners
        toolsPanel.addEventListener('click', (e) => {
            if (e.target.id === 'close-drawing') {
                this.disable();
            } else if (e.target.id === 'clear-drawing') {
                this.clear();
            } else if (e.target.id === 'undo-drawing') {
                this.undo();
            } else if (e.target.id === 'open-manager') {
                this.toggleDrawingManager();
            } else if (e.target.classList.contains('color-btn')) {
                // Update active color
                toolsPanel.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                this.setBrushColor(e.target.dataset.color);
            }
        });
        
        // Brush size slider
        const brushSizeSlider = toolsPanel.querySelector('#brush-size');
        brushSizeSlider.addEventListener('input', (e) => {
            this.setBrushSize(parseInt(e.target.value));
        });
        
        return toolsPanel;
    }
    
    updateBrushDisplay() {
        const display = document.getElementById('brush-size-display');
        if (display) {
            display.textContent = `${this.brushSize}px`;
        }
        
        const slider = document.getElementById('brush-size');
        if (slider) {
            slider.value = this.brushSize;
        }
    }
    
    redrawCanvas() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Redraw all paths for current page
        const currentChapter = window.fasmEbook?.currentChapter?.id;
        const currentPage = window.fasmEbook?.currentPage;
        
        const pageDrawings = this.drawings.filter(drawing => 
            drawing.chapterId === currentChapter && drawing.page === currentPage
        );
        
        pageDrawings.forEach(drawing => {
            this.drawPath(drawing);
        });
    }
    
    drawPath(drawingData) {
        if (!drawingData.path || drawingData.path.length < 2) return;
        
        // Save current context state
        const originalStrokeStyle = this.ctx.strokeStyle;
        const originalLineWidth = this.ctx.lineWidth;
        
        // Set drawing properties
        this.ctx.strokeStyle = drawingData.brushColor;
        this.ctx.lineWidth = drawingData.brushSize;
        
        // Draw the path
        this.ctx.beginPath();
        this.ctx.moveTo(drawingData.path[0].x, drawingData.path[0].y);
        
        for (let i = 1; i < drawingData.path.length; i++) {
            const point = drawingData.path[i];
            
            // Apply pressure if available
            if (point.pressure) {
                this.ctx.lineWidth = drawingData.brushSize * point.pressure;
            }
            
            this.ctx.lineTo(point.x, point.y);
        }
        
        this.ctx.stroke();
        
        // Restore context state
        this.ctx.strokeStyle = originalStrokeStyle;
        this.ctx.lineWidth = originalLineWidth;
    }
    
    generateDrawingId() {
        return `drawing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    saveDrawings() {
        if (window.fasmStorage) {
            window.fasmStorage.set('drawings', this.drawings);
        }
    }
    
    loadDrawings() {
        if (window.fasmStorage) {
            this.drawings = window.fasmStorage.get('drawings', []);
        }
        
        // Redraw current page
        setTimeout(() => {
            this.redrawCanvas();
        }, 100);
    }
    
    loadPageDrawings(chapterId, page) {
        // Called when page changes to redraw relevant drawings
        setTimeout(() => {
            this.redrawCanvas();
        }, 100);
    }
    
    exportDrawings() {
        // Export drawings as SVG or image
        const currentChapter = window.fasmEbook?.currentChapter?.id;
        const currentPage = window.fasmEbook?.currentPage;
        
        const pageDrawings = this.drawings.filter(drawing => 
            drawing.chapterId === currentChapter && drawing.page === currentPage
        );
        
        if (pageDrawings.length === 0) {
            alert('No drawings to export on this page.');
            return;
        }
        
        // Create download link
        this.canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `fasm-notes-${currentChapter}-page${currentPage}.png`;
            a.click();
            URL.revokeObjectURL(url);
        });
    }
    
    setupSettingsIntegration() {
        // Use a more robust approach to integrate with settings
        const checkForDrawingCheckbox = () => {
            const drawingModeCheckbox = document.getElementById('drawing-mode');
            if (drawingModeCheckbox) {
                drawingModeCheckbox.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        this.enable();
                    } else {
                        this.disable();
                    }
                });
                
                // Also listen for programmatic changes
                window.addEventListener('drawingModeChanged', (e) => {
                    if (e.detail.enabled) {
                        this.enable();
                    } else {
                        this.disable();
                    }
                });
                
                return true;
            }
            return false;
        };

        // Try immediate setup, then retry with delay if needed
        if (!checkForDrawingCheckbox()) {
            setTimeout(() => {
                if (!checkForDrawingCheckbox()) {
                    console.warn('Drawing mode checkbox not found after delay');
                }
            }, 1000);
        }
    }
    
    // Statistics and analytics
    getDrawingStatistics() {
        const stats = {
            totalDrawings: this.drawings.length,
            totalStrokes: this.drawings.reduce((sum, d) => sum + d.path.length, 0),
            chaptersWithDrawings: [...new Set(this.drawings.map(d => d.chapterId))].length,
            averageStrokesPerDrawing: 0,
            mostActiveChapter: null
        };
        
        if (stats.totalDrawings > 0) {
            stats.averageStrokesPerDrawing = Math.round(stats.totalStrokes / stats.totalDrawings);
            
            // Find most active chapter
            const chapterCounts = {};
            this.drawings.forEach(d => {
                chapterCounts[d.chapterId] = (chapterCounts[d.chapterId] || 0) + 1;
            });
            
            stats.mostActiveChapter = Object.keys(chapterCounts).reduce((a, b) => 
                chapterCounts[a] > chapterCounts[b] ? a : b
            );
        }
        
        return stats;
    }

    // ==================== DRAWING MANAGEMENT SYSTEM ====================
    
    initDrawingManager() {
        this.savedDrawings = [];
        this.compositeDrawings = [];
        this.stashedDrawings = [];
        this.isEditMode = false;
        this.selectedDrawing = null;
        this.dragMode = false;
        
        this.loadSavedDrawings();
        this.createDrawingManagerUI();
        this.setupDrawingManagerEvents();
    }
    
    createDrawingManagerUI() {
        // Create the drawing manager panel
        const managerPanel = document.createElement('div');
        managerPanel.id = 'drawing-manager';
        managerPanel.className = 'drawing-manager';
        managerPanel.innerHTML = `
            <div class="drawing-manager-header">
                <h4>Drawing Library</h4>
                <button id="toggle-manager" class="close-drawing">📁</button>
            </div>
            <div class="drawing-manager-content">
                <div class="drawing-manager-tabs">
                    <button class="tab-btn active" data-tab="library">Library</button>
                    <button class="tab-btn" data-tab="composite">Compose</button>
                    <button class="tab-btn" data-tab="settings">Settings</button>
                </div>
                
                <div class="tab-content" id="library-tab">
                    <div class="drawing-controls">
                        <button id="save-current" class="tool-btn">⧄ Save Current</button>
                        <button id="clear-saved" class="tool-btn">🗑️ Clear All</button>
                    </div>
                    <div id="saved-drawings-list" class="saved-drawings-list">
                        <!-- Saved drawings will be populated here -->
                    </div>
                </div>
                
                <div class="tab-content hidden" id="composite-tab">
                    <div class="composite-controls">
                        <button id="start-compose" class="tool-btn">◯ Start Composing</button>
                        <button id="save-composition" class="tool-btn">⧄ Save Composition</button>
                        <button id="clear-composition" class="tool-btn">🗑️ Clear Canvas</button>
                    </div>
                    <div class="composition-info">
                        <p>Drag saved drawings onto the canvas to compose them together.</p>
                        <div id="active-drawings" class="active-drawings">
                            <!-- Active drawings in composition -->
                        </div>
                    </div>
                </div>
                
                <div class="tab-content hidden" id="settings-tab">
                    <div class="drawing-settings">
                        <label>
                            <input type="checkbox" id="edit-mode"> Edit Mode
                            <small>Stash current drawings while editing</small>
                        </label>
                        <label>
                            <input type="checkbox" id="auto-save-drawings"> Auto-save drawings
                        </label>
                        <label>
                            <input type="checkbox" id="show-drawing-thumbnails"> Show thumbnails
                        </label>
                        <button id="export-all-drawings" class="tool-btn">📤 Export All</button>
                        <button id="import-drawings" class="tool-btn">📥 Import</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(managerPanel);
    }
    
    setupDrawingManagerEvents() {
        // Toggle drawing manager
        document.getElementById('toggle-manager')?.addEventListener('click', () => {
            this.toggleDrawingManager();
        });
        
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // Library controls
        document.getElementById('save-current')?.addEventListener('click', () => {
            this.saveCurrentDrawing();
        });
        
        document.getElementById('clear-saved')?.addEventListener('click', () => {
            this.clearSavedDrawings();
        });
        
        // Composition controls
        document.getElementById('start-compose')?.addEventListener('click', () => {
            this.startComposition();
        });
        
        document.getElementById('save-composition')?.addEventListener('click', () => {
            this.saveComposition();
        });
        
        document.getElementById('clear-composition')?.addEventListener('click', () => {
            this.clearComposition();
        });
        
        // Settings
        document.getElementById('edit-mode')?.addEventListener('change', (e) => {
            this.toggleEditMode(e.target.checked);
        });
        
        document.getElementById('auto-save-drawings')?.addEventListener('change', (e) => {
            this.autoSaveEnabled = e.target.checked;
            this.saveDrawingManagerSettings();
        });
        
        document.getElementById('export-all-drawings')?.addEventListener('click', () => {
            this.exportAllDrawings();
        });
        
        document.getElementById('import-drawings')?.addEventListener('click', () => {
            this.importDrawings();
        });
        
        // Canvas events for drawing manipulation
        this.setupDrawingManipulation();
    }
    
    setupDrawingManipulation() {
        let isDragging = false;
        let isScaling = false;
        let dragStart = { x: 0, y: 0 };
        let originalDrawing = null;
        
        this.canvas.addEventListener('mousedown', (e) => {
            if (!this.dragMode) return;
            
            const coords = this.getEventCoordinates(e);
            const clickedDrawing = this.findDrawingAtPoint(coords.x, coords.y);
            
            if (clickedDrawing) {
                this.selectedDrawing = clickedDrawing;
                isDragging = true;
                dragStart = coords;
                originalDrawing = JSON.parse(JSON.stringify(clickedDrawing));
                
                // Prevent normal drawing
                e.preventDefault();
                e.stopPropagation();
            }
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (!isDragging || !this.selectedDrawing) return;
            
            const coords = this.getEventCoordinates(e);
            const deltaX = coords.x - dragStart.x;
            const deltaY = coords.y - dragStart.y;
            
            // Update drawing position
            this.moveDrawing(this.selectedDrawing, deltaX, deltaY);
            this.redrawCanvas();
            
            e.preventDefault();
        });
        
        this.canvas.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                if (this.selectedDrawing && this.autoSaveEnabled) {
                    this.saveDrawings();
                }
                this.selectedDrawing = null;
            }
        });
        
        // Scale with mouse wheel
        this.canvas.addEventListener('wheel', (e) => {
            if (!this.dragMode || !this.selectedDrawing) return;
            
            e.preventDefault();
            const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
            this.scaleDrawing(this.selectedDrawing, scaleFactor);
            this.redrawCanvas();
            
            if (this.autoSaveEnabled) {
                this.saveDrawings();
            }
        });
    }
    
    toggleDrawingManager() {
        const manager = document.getElementById('drawing-manager');
        if (manager) {
            manager.classList.toggle('visible');
        }
    }
    
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        document.getElementById(`${tabName}-tab`).classList.remove('hidden');
    }
    
    saveCurrentDrawing() {
        if (this.drawings.length === 0) {
            alert('No drawings to save on current page.');
            return;
        }
        
        const name = prompt('Enter a name for this drawing:', `Drawing ${Date.now()}`);
        if (!name) return;
        
        // Create thumbnail
        const thumbnail = this.createThumbnail();
        
        const savedDrawing = {
            id: this.generateDrawingId(),
            name: name,
            drawings: [...this.drawings],
            thumbnail: thumbnail,
            createdAt: new Date().toISOString(),
            chapterId: this.currentChapter?.id,
            page: this.currentPage
        };
        
        this.savedDrawings.push(savedDrawing);
        this.saveSavedDrawings();
        this.refreshSavedDrawingsList();
        
        alert(`Drawing "${name}" saved to library!`);
    }
    
    createThumbnail() {
        // Create a smaller version of the current canvas for thumbnail
        const thumbCanvas = document.createElement('canvas');
        thumbCanvas.width = 150;
        thumbCanvas.height = 100;
        const thumbCtx = thumbCanvas.getContext('2d');
        
        // Draw scaled version
        thumbCtx.drawImage(this.canvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
        
        return thumbCanvas.toDataURL();
    }
    
    refreshSavedDrawingsList() {
        const list = document.getElementById('saved-drawings-list');
        if (!list) return;
        
        list.innerHTML = '';
        
        this.savedDrawings.forEach(drawing => {
            const item = document.createElement('div');
            item.className = 'saved-drawing-item';
            item.innerHTML = `
                <div class="drawing-thumbnail">
                    <img src="${drawing.thumbnail}" alt="${drawing.name}">
                </div>
                <div class="drawing-info">
                    <h5>${drawing.name}</h5>
                    <small>${new Date(drawing.createdAt).toLocaleDateString()}</small>
                    <div class="drawing-actions">
                        <button onclick="window.fasmDrawing.loadSavedDrawing('${drawing.id}')" class="mini-btn">📁 Load</button>
                        <button onclick="window.fasmDrawing.addToComposition('${drawing.id}')" class="mini-btn">➕ Add</button>
                        <button onclick="window.fasmDrawing.deleteSavedDrawing('${drawing.id}')" class="mini-btn">🗑️</button>
                    </div>
                </div>
            `;
            
            // Make it draggable
            item.draggable = true;
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('drawing-id', drawing.id);
            });
            
            list.appendChild(item);
        });
    }
    
    loadSavedDrawing(drawingId) {
        const savedDrawing = this.savedDrawings.find(d => d.id === drawingId);
        if (!savedDrawing) return;
        
        // Clear current drawings and load saved ones
        this.drawings = [...savedDrawing.drawings];
        this.redrawCanvas();
        this.saveDrawings(); // Save to current page
        
        alert(`Drawing "${savedDrawing.name}" loaded!`);
    }
    
    deleteSavedDrawing(drawingId) {
        const drawing = this.savedDrawings.find(d => d.id === drawingId);
        if (!drawing) return;
        
        if (confirm(`Delete drawing "${drawing.name}"?`)) {
            this.savedDrawings = this.savedDrawings.filter(d => d.id !== drawingId);
            this.saveSavedDrawings();
            this.refreshSavedDrawingsList();
        }
    }
    
    addToComposition(drawingId) {
        const savedDrawing = this.savedDrawings.find(d => d.id === drawingId);
        if (!savedDrawing) return;
        
        // Add saved drawing to current canvas
        savedDrawing.drawings.forEach(drawing => {
            // Create a copy with new ID to avoid conflicts
            const copiedDrawing = {
                ...drawing,
                id: this.generateDrawingId(),
                isComposite: true,
                originalId: drawing.id
            };
            this.drawings.push(copiedDrawing);
        });
        
        this.redrawCanvas();
        this.saveDrawings();
        
        alert(`Drawing "${savedDrawing.name}" added to composition!`);
    }
    
    startComposition() {
        this.dragMode = true;
        this.canvas.style.cursor = 'move';
        alert('Composition mode enabled! Drag drawings to reposition them, use mouse wheel to scale.');
    }
    
    saveComposition() {
        if (this.drawings.length === 0) {
            alert('No drawings to save in composition.');
            return;
        }
        
        const name = prompt('Enter a name for this composition:', `Composition ${Date.now()}`);
        if (!name) return;
        
        // Save current state as a new saved drawing
        this.saveCurrentDrawing();
        this.dragMode = false;
        this.canvas.style.cursor = '';
        
        alert(`Composition "${name}" saved!`);
    }
    
    clearComposition() {
        if (confirm('Clear all drawings from composition?')) {
            this.clear();
            this.dragMode = false;
            this.canvas.style.cursor = '';
        }
    }
    
    toggleEditMode(enabled) {
        this.isEditMode = enabled;
        
        if (enabled) {
            // Stash current drawings
            this.stashedDrawings = [...this.drawings];
            this.drawings = [];
            this.redrawCanvas();
            alert('Edit mode enabled. Current drawings stashed. Draw freely!');
        } else {
            // Restore stashed drawings
            this.drawings = [...this.stashedDrawings];
            this.stashedDrawings = [];
            this.redrawCanvas();
            alert('Edit mode disabled. Stashed drawings restored!');
        }
        
        this.saveDrawings();
    }
    
    findDrawingAtPoint(x, y) {
        // Find which drawing contains the given point
        for (let i = this.drawings.length - 1; i >= 0; i--) {
            const drawing = this.drawings[i];
            if (this.isPointInDrawing(x, y, drawing)) {
                return drawing;
            }
        }
        return null;
    }
    
    isPointInDrawing(x, y, drawing) {
        // Simple bounding box check for now
        if (!drawing.path || drawing.path.length === 0) return false;
        
        const bounds = this.getDrawingBounds(drawing);
        return x >= bounds.minX && x <= bounds.maxX && y >= bounds.minY && y <= bounds.maxY;
    }
    
    getDrawingBounds(drawing) {
        if (!drawing.path || drawing.path.length === 0) {
            return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
        }
        
        let minX = drawing.path[0].x;
        let maxX = drawing.path[0].x;
        let minY = drawing.path[0].y;
        let maxY = drawing.path[0].y;
        
        drawing.path.forEach(point => {
            minX = Math.min(minX, point.x);
            maxX = Math.max(maxX, point.x);
            minY = Math.min(minY, point.y);
            maxY = Math.max(maxY, point.y);
        });
        
        return { minX, minY, maxX, maxY };
    }
    
    moveDrawing(drawing, deltaX, deltaY) {
        if (!drawing.path) return;
        
        drawing.path.forEach(point => {
            point.x += deltaX;
            point.y += deltaY;
        });
    }
    
    scaleDrawing(drawing, scaleFactor) {
        if (!drawing.path || drawing.path.length === 0) return;
        
        const bounds = this.getDrawingBounds(drawing);
        const centerX = (bounds.minX + bounds.maxX) / 2;
        const centerY = (bounds.minY + bounds.maxY) / 2;
        
        drawing.path.forEach(point => {
            // Scale around center point
            point.x = centerX + (point.x - centerX) * scaleFactor;
            point.y = centerY + (point.y - centerY) * scaleFactor;
        });
        
        // Scale brush size too
        drawing.brushSize *= scaleFactor;
    }
    
    exportAllDrawings() {
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            savedDrawings: this.savedDrawings,
            currentDrawings: this.drawings,
            settings: {
                autoSave: this.autoSaveEnabled,
                editMode: this.isEditMode
            }
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `fasm-drawings-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
    
    importDrawings() {
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
                    
                    if (imported.savedDrawings) {
                        this.savedDrawings = [...this.savedDrawings, ...imported.savedDrawings];
                        this.saveSavedDrawings();
                        this.refreshSavedDrawingsList();
                    }
                    
                    alert('Drawings imported successfully!');
                } catch (error) {
                    alert('Failed to import drawings: Invalid file format');
                    console.error('Import error:', error);
                }
            };
            
            reader.readAsText(file);
        });
        
        input.click();
    }
    
    clearSavedDrawings() {
        if (confirm('Delete all saved drawings? This cannot be undone.')) {
            this.savedDrawings = [];
            this.saveSavedDrawings();
            this.refreshSavedDrawingsList();
            alert('All saved drawings deleted.');
        }
    }
    
    saveSavedDrawings() {
        if (window.fasmStorage) {
            window.fasmStorage.set('savedDrawings', this.savedDrawings);
        }
    }
    
    loadSavedDrawings() {
        if (window.fasmStorage) {
            this.savedDrawings = window.fasmStorage.get('savedDrawings', []);
        }
        
        // Refresh UI after load
        setTimeout(() => {
            this.refreshSavedDrawingsList();
        }, 100);
    }
    
    saveDrawingManagerSettings() {
        const settings = {
            autoSave: this.autoSaveEnabled,
            editMode: this.isEditMode,
            showThumbnails: document.getElementById('show-drawing-thumbnails')?.checked || true
        };
        
        if (window.fasmStorage) {
            window.fasmStorage.set('drawingManagerSettings', settings);
        }
    }
}

// CSS for drawing tools (should be added to main CSS)
const drawingToolsCSS = `
.drawing-tools {
    position: fixed;
    top: 50%;
    left: 20px;
    transform: translateY(-50%);
    background: var(--bg-color);
    border: 2px solid var(--accent-color);
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1600;
    min-width: 200px;
    display: none;
}

.drawing-tools-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border-color);
}

.drawing-tools-header h4 {
    margin: 0;
    font-size: 1rem;
}

.close-drawing {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 1.5rem;
    height: 1.5rem;
}

.tool-group {
    margin-bottom: 1rem;
}

.tool-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    font-size: 0.9rem;
}

.color-palette {
    display: flex;
    gap: 0.5rem;
}

.color-btn {
    width: 30px;
    height: 30px;
    border: 2px solid var(--border-color);
    border-radius: 50%;
    cursor: pointer;
    transition: border-color 0.2s ease;
}

.color-btn.active {
    border-color: var(--accent-color);
    border-width: 3px;
}

.tool-btn {
    background: var(--accent-color);
    color: var(--bg-color);
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 0.5rem;
    font-size: 0.9rem;
}

.tool-btn:hover {
    opacity: 0.8;
}

#brush-size-display {
    font-size: 0.8rem;
    color: var(--accent-color);
    margin-left: 0.5rem;
}

/* Drawing Manager Styles */
.drawing-manager {
    position: fixed;
    top: 50%;
    right: 20px;
    transform: translateY(-50%);
    background: var(--bg-color);
    border: 2px solid var(--accent-color);
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1700;
    min-width: 280px;
    max-width: 350px;
    max-height: 70vh;
    overflow-y: auto;
    display: none;
}

.drawing-manager.visible {
    display: block;
}

.drawing-manager-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border-color);
}

.drawing-manager-header h4 {
    margin: 0;
    font-size: 1rem;
}

.drawing-manager-tabs {
    display: flex;
    margin-bottom: 1rem;
    border-bottom: 1px solid var(--border-color);
}

.tab-btn {
    flex: 1;
    background: none;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    font-size: 0.85rem;
}

.tab-btn.active {
    border-bottom-color: var(--accent-color);
    color: var(--accent-color);
}

.tab-content.hidden {
    display: none;
}

.drawing-controls, .composite-controls {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
}

.saved-drawings-list {
    max-height: 300px;
    overflow-y: auto;
}

.saved-drawing-item {
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    margin-bottom: 0.5rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.saved-drawing-item:hover {
    background: var(--highlight-color);
}

.drawing-thumbnail {
    flex-shrink: 0;
    width: 60px;
    height: 40px;
    border-radius: 4px;
    overflow: hidden;
}

.drawing-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.drawing-info {
    flex: 1;
}

.drawing-info h5 {
    margin: 0 0 0.25rem 0;
    font-size: 0.85rem;
}

.drawing-info small {
    color: var(--text-color);
    opacity: 0.7;
    font-size: 0.7rem;
}

.drawing-actions {
    display: flex;
    gap: 0.25rem;
    margin-top: 0.25rem;
}

.mini-btn {
    background: var(--accent-color);
    color: var(--bg-color);
    border: none;
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
    cursor: pointer;
    font-size: 0.7rem;
}

.mini-btn:hover {
    opacity: 0.8;
}

.composition-info {
    background: var(--highlight-color);
    padding: 1rem;
    border-radius: 4px;
    margin-top: 1rem;
}

.composition-info p {
    margin: 0 0 0.5rem 0;
    font-size: 0.85rem;
    color: var(--text-color);
    opacity: 0.8;
}

.active-drawings {
    font-size: 0.8rem;
    color: var(--accent-color);
}

.drawing-settings {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.drawing-settings label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.85rem;
}

.drawing-settings small {
    color: var(--text-color);
    opacity: 0.7;
    font-size: 0.75rem;
}

/* Mobile responsiveness for drawing manager */
@media (max-width: 768px) {
    .drawing-manager {
        right: 10px;
        left: 10px;
        transform: translateY(-50%);
        min-width: auto;
        max-width: none;
    }
    
    .drawing-controls, .composite-controls {
        flex-direction: column;
    }
    
    .saved-drawing-item {
        flex-direction: column;
        text-align: center;
    }
    
    .drawing-thumbnail {
        align-self: center;
    }
}
`;

// Add CSS to document
const style = document.createElement('style');
style.textContent = drawingToolsCSS;
document.head.appendChild(style);

// Initialize drawing when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.fasmDrawing = new FASMeBookDrawing();
});