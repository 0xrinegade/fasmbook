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
        
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        this.setupEventListeners();
        this.loadDrawings();
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
        // Integrate with settings panel
        const drawingModeCheckbox = document.getElementById('drawing-mode');
        if (drawingModeCheckbox) {
            drawingModeCheckbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.enable();
                } else {
                    this.disable();
                }
            });
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
`;

// Add CSS to document
const style = document.createElement('style');
style.textContent = drawingToolsCSS;
document.head.appendChild(style);

// Initialize drawing when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.fasmDrawing = new FASMeBookDrawing();
});