// Shared Drag Utility for FASM eBook
// Consolidates drag functionality to avoid duplication across modals and buttons

class DragUtility {
    constructor() {
        this.activeDrags = new Map(); // Track active drag operations
        this.dragThreshold = 3; // Minimum movement in pixels to count as drag
        this.constrainToViewport = true;
        this.debug = false;
    }

    /**
     * Makes an element draggable with accessibility support
     * @param {HTMLElement} element - Element to make draggable
     * @param {Object} options - Configuration options
     * @param {boolean} options.isToggle - Whether this is a toggle button vs modal
     * @param {Function} options.onDragStart - Callback when drag starts
     * @param {Function} options.onDrag - Callback during drag
     * @param {Function} options.onDragEnd - Callback when drag ends
     * @param {Function} options.onClick - Callback for click (non-drag)
     * @param {string} options.storageKey - localStorage key for position persistence
     * @param {string} options.handle - CSS selector for drag handle (optional)
     */
    makeDraggable(element, options = {}) {
        if (!element) return;

        const dragData = {
            element,
            options,
            isDragging: false,
            startPos: { x: 0, y: 0 },
            offset: { x: 0, y: 0 },
            justFinishedDragging: false,
            originalPointerEvents: new Map() // Store original pointer-events values
        };

        this.activeDrags.set(element, dragData);
        this.setupDragEvents(dragData);
        this.setupAccessibility(dragData);
        this.loadPosition(dragData);
    }

    setupDragEvents(dragData) {
        const { element, options } = dragData;
        const handleElement = options.handle ? element.querySelector(options.handle) : element;

        if (!handleElement) {
            console.warn('Drag handle not found, using element itself');
            return;
        }

        // Add drag handle styling and attributes
        handleElement.style.cursor = 'grab';
        handleElement.setAttribute('aria-label', `Draggable ${options.isToggle ? 'button' : 'modal'}. Use arrow keys or mouse to move.`);

        // Mouse events
        handleElement.addEventListener('mousedown', (e) => this.handleStart(e, dragData));
        document.addEventListener('mousemove', (e) => this.handleMove(e, dragData));
        document.addEventListener('mouseup', (e) => this.handleEnd(e, dragData));

        // Touch events for mobile
        handleElement.addEventListener('touchstart', (e) => this.handleStart(e, dragData), { passive: false });
        document.addEventListener('touchmove', (e) => this.handleMove(e, dragData), { passive: false });
        document.addEventListener('touchend', (e) => this.handleEnd(e, dragData));

        // Keyboard navigation
        handleElement.addEventListener('keydown', (e) => this.handleKeyboard(e, dragData));

        // Click handler for non-drag interactions
        element.addEventListener('click', (e) => this.handleClick(e, dragData));
    }

    setupAccessibility(dragData) {
        const { element, options } = dragData;
        
        // Add ARIA attributes
        element.setAttribute('role', options.isToggle ? 'button' : 'dialog');
        element.setAttribute('aria-grabbed', 'false');
        
        if (!options.isToggle) {
            element.setAttribute('aria-modal', 'true');
            element.setAttribute('aria-labelledby', element.querySelector('h2, h3, .modal-title')?.id || '');
        }

        // Add tabindex for keyboard focus
        const handleElement = options.handle ? element.querySelector(options.handle) : element;
        if (handleElement && !handleElement.hasAttribute('tabindex')) {
            handleElement.setAttribute('tabindex', '0');
        }
    }

    handleStart(event, dragData) {
        if (dragData.isDragging) return;

        event.preventDefault();
        const point = this.getEventPoint(event);
        
        dragData.startPos = { x: point.x, y: point.y };
        dragData.offset = this.calculateOffset(dragData.element, point);
        dragData.isDragging = false; // Will be set to true once threshold is met
        dragData.justFinishedDragging = false;

        // Change cursor and ARIA state
        const handleElement = dragData.options.handle ? 
            dragData.element.querySelector(dragData.options.handle) : dragData.element;
        if (handleElement) {
            handleElement.style.cursor = 'grabbing';
            dragData.element.setAttribute('aria-grabbed', 'true');
        }

        if (this.debug) console.log('Drag start', dragData.startPos);
    }

    handleMove(event, dragData) {
        if (!dragData.startPos.x && !dragData.startPos.y) return;

        const point = this.getEventPoint(event);
        const deltaX = point.x - dragData.startPos.x;
        const deltaY = point.y - dragData.startPos.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Check if we've moved enough to count as dragging
        if (!dragData.isDragging && distance > this.dragThreshold) {
            dragData.isDragging = true;
            this.onDragStart(dragData);
        }

        if (dragData.isDragging) {
            event.preventDefault();
            this.updatePosition(dragData, point);
            
            if (dragData.options.onDrag) {
                dragData.options.onDrag(dragData.element, point);
            }
        }
    }

    handleEnd(event, dragData) {
        if (!dragData.startPos.x && !dragData.startPos.y) return;

        const wasActuallyDragging = dragData.isDragging;
        
        // Reset drag state
        dragData.isDragging = false;
        dragData.startPos = { x: 0, y: 0 };
        dragData.justFinishedDragging = wasActuallyDragging;

        // Reset cursor and ARIA state
        const handleElement = dragData.options.handle ? 
            dragData.element.querySelector(dragData.options.handle) : dragData.element;
        if (handleElement) {
            handleElement.style.cursor = 'grab';
            dragData.element.setAttribute('aria-grabbed', 'false');
        }

        if (wasActuallyDragging) {
            this.onDragEnd(dragData);
            this.savePosition(dragData);
            
            // Clear justFinishedDragging after a short delay to prevent click events
            setTimeout(() => {
                dragData.justFinishedDragging = false;
            }, 100);
        }

        // Re-enable pointer events on interfering elements
        this.restorePointerEvents(dragData);

        if (this.debug) console.log('Drag end', wasActuallyDragging);
    }

    handleKeyboard(event, dragData) {
        const { element } = dragData;
        const moveStep = event.shiftKey ? 10 : 1; // Larger steps with Shift
        let moved = false;

        switch (event.key) {
            case 'ArrowUp':
                this.moveElement(element, 0, -moveStep);
                moved = true;
                break;
            case 'ArrowDown':
                this.moveElement(element, 0, moveStep);
                moved = true;
                break;
            case 'ArrowLeft':
                this.moveElement(element, -moveStep, 0);
                moved = true;
                break;
            case 'ArrowRight':
                this.moveElement(element, moveStep, 0);
                moved = true;
                break;
            case 'Escape':
                element.blur();
                if (dragData.options.onEscape) {
                    dragData.options.onEscape();
                }
                break;
            case 'Enter':
            case ' ':
                if (dragData.options.onClick) {
                    event.preventDefault();
                    dragData.options.onClick(event);
                }
                break;
        }

        if (moved) {
            event.preventDefault();
            this.savePosition(dragData);
            this.announcePosition(element);
        }
    }

    handleClick(event, dragData) {
        // Prevent click if we just finished dragging
        if (dragData.justFinishedDragging) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        if (dragData.options.onClick) {
            dragData.options.onClick(event);
        }
    }

    onDragStart(dragData) {
        // Disable pointer events on elements that might interfere
        this.disableInterferingPointerEvents(dragData);
        
        if (dragData.options.onDragStart) {
            dragData.options.onDragStart(dragData.element);
        }

        // Announce to screen readers
        this.announceToScreenReader(`Started dragging ${dragData.options.isToggle ? 'button' : 'modal'}`);
    }

    onDragEnd(dragData) {
        if (dragData.options.onDragEnd) {
            dragData.options.onDragEnd(dragData.element);
        }

        // Announce final position to screen readers
        this.announcePosition(dragData.element);
    }

    updatePosition(dragData, point) {
        const { element } = dragData;
        let newX = point.x - dragData.offset.x;
        let newY = point.y - dragData.offset.y;

        // Get current element dimensions for constraint calculations
        const rect = element.getBoundingClientRect();
        const elementWidth = rect.width;
        const elementHeight = rect.height;

        // Constrain to viewport if enabled
        if (this.constrainToViewport) {
            newX = Math.max(0, Math.min(newX, window.innerWidth - elementWidth));
            newY = Math.max(0, Math.min(newY, window.innerHeight - elementHeight));
        }

        // For toggle buttons, use right/bottom positioning
        if (dragData.options.isToggle) {
            const rightPos = Math.max(0, window.innerWidth - newX - elementWidth);
            const bottomPos = Math.max(0, window.innerHeight - newY - elementHeight);
            
            element.style.right = `${rightPos}px`;
            element.style.bottom = `${bottomPos}px`;
            element.style.left = 'auto';
            element.style.top = 'auto';
        } else {
            // For modals, use left/top positioning with bounds checking
            const constrainedX = Math.max(0, Math.min(newX, window.innerWidth - elementWidth));
            const constrainedY = Math.max(0, Math.min(newY, window.innerHeight - elementHeight));
            
            element.style.left = `${constrainedX}px`;
            element.style.top = `${constrainedY}px`;
            element.style.right = 'auto';
            element.style.bottom = 'auto';
        }
    }

    moveElement(element, deltaX, deltaY) {
        const rect = element.getBoundingClientRect();
        let newX = rect.left + deltaX;
        let newY = rect.top + deltaY;

        // Constrain to viewport
        if (this.constrainToViewport) {
            newX = Math.max(0, Math.min(newX, window.innerWidth - rect.width));
            newY = Math.max(0, Math.min(newY, window.innerHeight - rect.height));
        }

        const dragData = this.activeDrags.get(element);
        if (dragData?.options.isToggle) {
            const rightPos = window.innerWidth - newX - element.offsetWidth;
            const bottomPos = window.innerHeight - newY - element.offsetHeight;
            
            element.style.right = `${rightPos}px`;
            element.style.bottom = `${bottomPos}px`;
        } else {
            element.style.left = `${newX}px`;
            element.style.top = `${newY}px`;
        }
    }

    disableInterferingPointerEvents(dragData) {
        const { element } = dragData;
        const interferingElements = [
            ...document.querySelectorAll('.modal-backdrop, .overlay'),
            ...element.querySelectorAll('*') // All child elements
        ];

        interferingElements.forEach(el => {
            const currentEvents = window.getComputedStyle(el).pointerEvents;
            dragData.originalPointerEvents.set(el, currentEvents);
            el.style.pointerEvents = 'none';
        });
    }

    restorePointerEvents(dragData) {
        dragData.originalPointerEvents.forEach((originalValue, element) => {
            if (originalValue === 'none') {
                element.style.pointerEvents = '';
            } else {
                element.style.pointerEvents = originalValue;
            }
        });
        dragData.originalPointerEvents.clear();
    }

    calculateOffset(element, point) {
        const rect = element.getBoundingClientRect();
        return {
            x: point.x - rect.left,
            y: point.y - rect.top
        };
    }

    getEventPoint(event) {
        if (event.touches && event.touches.length > 0) {
            return { x: event.touches[0].clientX, y: event.touches[0].clientY };
        }
        return { x: event.clientX, y: event.clientY };
    }

    loadPosition(dragData) {
        const { options, element } = dragData;
        if (!options.storageKey) return;

        const saved = localStorage.getItem(options.storageKey);
        if (saved) {
            try {
                const position = JSON.parse(saved);
                if (this.isValidPosition(position)) {
                    if (options.isToggle) {
                        element.style.right = position.right;
                        element.style.bottom = position.bottom;
                    } else {
                        element.style.left = position.left;
                        element.style.top = position.top;
                    }
                }
            } catch (e) {
                console.warn(`Invalid stored position for ${options.storageKey}:`, e);
            }
        }
    }

    savePosition(dragData) {
        const { options, element } = dragData;
        if (!options.storageKey) return;

        const position = options.isToggle ? {
            right: element.style.right,
            bottom: element.style.bottom
        } : {
            left: element.style.left,
            top: element.style.top
        };

        localStorage.setItem(options.storageKey, JSON.stringify(position));
    }

    isValidPosition(position) {
        if (position.right && position.bottom) {
            const right = parseInt(position.right);
            const bottom = parseInt(position.bottom);
            return !isNaN(right) && !isNaN(bottom) && right >= 0 && bottom >= 0;
        }
        if (position.left && position.top) {
            const left = parseInt(position.left);
            const top = parseInt(position.top);
            return !isNaN(left) && !isNaN(top) && left >= 0 && top >= 0;
        }
        return false;
    }

    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        setTimeout(() => document.body.removeChild(announcement), 1000);
    }

    announcePosition(element) {
        const rect = element.getBoundingClientRect();
        const x = Math.round(rect.left);
        const y = Math.round(rect.top);
        this.announceToScreenReader(`Moved to position ${x}, ${y}`);
    }

    /**
     * Remove drag functionality from an element
     */
    removeDraggable(element) {
        const dragData = this.activeDrags.get(element);
        if (dragData) {
            this.restorePointerEvents(dragData);
            this.activeDrags.delete(element);
        }
    }

    /**
     * Get drag state for an element
     */
    getDragState(element) {
        const dragData = this.activeDrags.get(element);
        return dragData ? {
            isDragging: dragData.isDragging,
            justFinishedDragging: dragData.justFinishedDragging
        } : null;
    }

    /**
     * Enable/disable debug logging
     */
    setDebug(enabled) {
        this.debug = enabled;
    }
}

// Create global instance
window.dragUtility = new DragUtility();