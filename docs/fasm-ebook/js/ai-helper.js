// AI Helper for FASM eBook - Enhanced for Professional Assembly Programming
class FASMeBookAI {
    constructor() {
        this.isOpen = false;
        this.isExpanded = false;
        this.conversationHistory = [];
        this.knowledgeBase = this.initializeKnowledgeBase();
        this.currentChapter = null;
        this.userSkillLevel = 'intermediate'; // beginner, intermediate, advanced
        
        // Dragging functionality
        this.isDragging = false;
        this.isDraggingToggle = false;
        this.dragOffset = { x: 0, y: 0 };
        this.togglePosition = this.loadTogglePosition();
        
        // Virtual scrolling for performance
        this.virtualScrolling = {
            enabled: false,
            visibleRange: { start: 0, end: 50 },
            itemHeight: 40,
            containerHeight: 0
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadConversationHistory();
        this.detectCurrentChapter();
        this.initializeContextualHelp();
        this.initializeDraggableToggle();
        this.initializeVirtualScrolling();
        this.setupChatBoundaries();
    }
    
    loadTogglePosition() {
        const saved = localStorage.getItem('aiTogglePosition');
        if (saved) {
            return JSON.parse(saved);
        }
        return { right: '1rem', bottom: '7rem' }; // Default position
    }
    
    saveTogglePosition() {
        localStorage.setItem('aiTogglePosition', JSON.stringify(this.togglePosition));
    }
    
    initializeDraggableToggle() {
        const aiToggle = document.getElementById('ai-toggle');
        if (aiToggle) {
            // Apply saved position
            aiToggle.style.right = this.togglePosition.right;
            aiToggle.style.bottom = this.togglePosition.bottom;
            
            // Add direct click handler for toggle functionality
            if (!aiToggle.hasAttribute('data-click-handler')) {
                aiToggle.addEventListener('click', (e) => {
                    // Prevent event if we're dragging
                    if (this.isDraggingToggle) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                    }
                    this.toggleWindow();
                });
                aiToggle.setAttribute('data-click-handler', 'true');
            }
            
            // Make draggable only once
            if (!aiToggle.hasAttribute('data-draggable')) {
                this.makeDraggable(aiToggle, true);
                aiToggle.setAttribute('data-draggable', 'true');
            }
        }
    }
    
    initializeVirtualScrolling() {
        const aiChat = document.getElementById('ai-chat');
        if (aiChat && this.conversationHistory.length > 100) {
            this.virtualScrolling.enabled = true;
            this.virtualScrolling.containerHeight = aiChat.clientHeight;
            this.setupVirtualScrollContainer();
        }
    }
    
    setupChatBoundaries() {
        const aiChat = document.getElementById('ai-chat');
        if (aiChat) {
            // Ensure proper containment and scrolling
            aiChat.style.overflowY = 'auto';
            aiChat.style.overflowX = 'hidden';
            aiChat.style.height = '100%';
            aiChat.style.maxHeight = '100%';
            aiChat.style.boxSizing = 'border-box';
            aiChat.style.display = 'flex';
            aiChat.style.flexDirection = 'column';
        }
        
        // Ensure AI content container has proper layout
        const aiContent = document.querySelector('.ai-content');
        if (aiContent) {
            aiContent.style.display = 'flex';
            aiContent.style.flexDirection = 'column';
            aiContent.style.height = '100%';
            aiContent.style.overflow = 'hidden';
        }
        
        // Ensure AI window has proper flex layout
        const aiWindow = document.getElementById('ai-window');
        if (aiWindow) {
            aiWindow.style.display = 'flex';
            aiWindow.style.flexDirection = 'column';
        }
    }
    
    detectCurrentChapter() {
        // Detect current chapter from URL or page content
        const path = window.location.pathname;
        const chapterMatch = path.match(/chapter(\d+)/);
        if (chapterMatch) {
            this.currentChapter = parseInt(chapterMatch[1]);
        }
    }
    
    initializeContextualHelp() {
        // Add contextual help buttons to code blocks and complex sections
        this.addCodeBlockHelpers();
        this.addPerformanceAnalysisHelpers();
        this.addCrossReferenceHelpers();
    }
    
    addCodeBlockHelpers() {
        const codeBlocks = document.querySelectorAll('pre code');
        codeBlocks.forEach((block, index) => {
            const helpButton = document.createElement('button');
            helpButton.className = 'code-help-btn';
            helpButton.innerHTML = '❓';
            helpButton.title = 'Explain this code';
            helpButton.onclick = () => this.explainCodeBlock(block, index);
            
            const container = block.closest('pre');
            if (container) {
                container.style.position = 'relative';
                container.appendChild(helpButton);
            }
        });
    }
    
    addPerformanceAnalysisHelpers() {
        const perfAnnotations = document.querySelectorAll('.perf-annotation');
        perfAnnotations.forEach((annotation) => {
            annotation.style.cursor = 'pointer';
            annotation.title = 'Click for detailed explanation';
            annotation.onclick = () => this.explainPerformanceMetric(annotation);
        });
    }
    
    addCrossReferenceHelpers() {
        // Add cross-reference links for related sections
        const crossRefElements = document.querySelectorAll('.cross-ref, .see-also');
        crossRefElements.forEach((element) => {
            element.style.cursor = 'pointer';
            element.title = 'Click to view related section';
            element.onclick = () => this.handleCrossReference(element);
        });
        
        // Add helpful hints for instruction links
        const instructionLinks = document.querySelectorAll('.asm-instruction');
        instructionLinks.forEach((link) => {
            link.style.cursor = 'pointer';
            link.title = 'Click for instruction details';
            link.onclick = () => this.showInstructionHelp(link.textContent);
        });
    }
    
    explainCodeBlock(codeBlock, index) {
        const code = codeBlock.textContent;
        const response = this.analyzeCode(code);
        this.openWindow();
        this.addMessage('assistant', `
            **Code Block Analysis #${index + 1}:**
            
            ${response}
            
            **Performance Characteristics:**
            ${this.getPerformanceAnalysis(code)}
            
            **Alternative Approaches:**
            ${this.suggestAlternatives(code)}
            
            Would you like me to explain any specific instruction or optimization opportunity?
        `);
    }
    
    explainPerformanceMetric(annotation) {
        const metric = annotation.textContent;
        const explanation = this.getPerformanceExplanation(metric);
        this.openWindow();
        this.addMessage('assistant', explanation);
    }
    
    handleCrossReference(element) {
        const refText = element.textContent;
        const refTarget = element.getAttribute('data-ref') || element.getAttribute('href');
        
        this.openWindow();
        this.addMessage('assistant', `
            **Cross Reference: ${refText}**
            
            This refers to a related section that provides additional context or examples.
            
            ${refTarget ? `Target: ${refTarget}` : 'Use the navigation panel to find related topics.'}
            
            Would you like me to explain how this relates to the current topic?
        `);
    }
    
    showInstructionHelp(instruction) {
        const cleanInstruction = instruction.trim().toLowerCase();
        
        // Check if we have detailed instruction information
        if (window.instructionGlossary) {
            const instructionInfo = window.instructionGlossary.getInstruction(cleanInstruction);
            if (instructionInfo) {
                this.openWindow();
                this.addMessage('assistant', `
                    **${instruction.toUpperCase()} Instruction**
                    
                    **Description:** ${instructionInfo.description}
                    
                    **Syntax:** ${instructionInfo.syntax}
                    
                    **Flags Affected:** ${instructionInfo.flags || 'None specified'}
                    
                    **Performance:** ${instructionInfo.cycles || 'Variable'}
                    
                    **Use Cases:** ${instructionInfo.examples || 'General purpose instruction'}
                    
                    Would you like me to show examples or explain optimization techniques for this instruction?
                `);
                return;
            }
        }
        
        // Fallback explanation
        const explanation = this.getBasicInstructionHelp(cleanInstruction);
        this.openWindow();
        this.addMessage('assistant', explanation);
    }
    
    getBasicInstructionHelp(instruction) {
        const basicHelp = {
            'mov': 'MOV moves data from source to destination. Most fundamental x86 instruction.',
            'add': 'ADD performs arithmetic addition and sets flags based on the result.',
            'sub': 'SUB performs arithmetic subtraction and sets flags based on the result.',
            'cmp': 'CMP compares two operands by performing subtraction but only affects flags.',
            'jmp': 'JMP unconditionally transfers control to the specified address.',
            'call': 'CALL pushes return address and transfers control to a subroutine.',
            'ret': 'RET returns from a subroutine by popping the return address.',
            'push': 'PUSH decrements ESP and stores operand on the stack.',
            'pop': 'POP loads operand from stack and increments ESP.'
        };
        
        return basicHelp[instruction] || `${instruction.toUpperCase()} is an assembly instruction. Check the instruction glossary for detailed information.`;
    }
    
    analyzeCode(code) {
        // Enhanced code analysis with professional-level explanations
        const lines = code.split('\n').filter(line => line.trim());
        let analysis = "Let me break down this assembly code for you:\n\n";
        
        lines.forEach((line, index) => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith(';') && !trimmed.startsWith('.')) {
                const instruction = this.parseInstruction(trimmed);
                if (instruction) {
                    analysis += `**Line ${index + 1}: \`${trimmed}\`**\n`;
                    analysis += `- **Purpose**: ${instruction.purpose}\n`;
                    analysis += `- **Cycles**: ${instruction.cycles}\n`;
                    analysis += `- **Why chosen**: ${instruction.rationale}\n\n`;
                }
            }
        });
        
        return analysis;
    }
    
    parseInstruction(line) {
        // Enhanced instruction parsing with comprehensive knowledge
        const instructionMap = {
            'mov': {
                purpose: 'Data movement - transfers data between registers, memory, or immediate values',
                cycles: '1 cycle (reg-reg), 2-3 cycles (memory involved)',
                rationale: 'Most fundamental operation - efficient data transfer with minimal overhead'
            },
            'add': {
                purpose: 'Arithmetic addition - adds source to destination and stores result',
                cycles: '1 cycle (reg-reg), 3-4 cycles (memory involved)',
                rationale: 'Fast arithmetic operation that also sets flags for conditional operations'
            },
            'sub': {
                purpose: 'Arithmetic subtraction - subtracts source from destination',
                cycles: '1 cycle (reg-reg), 3-4 cycles (memory involved)',
                rationale: 'Essential for calculations and pointer arithmetic with flag setting'
            },
            'cmp': {
                purpose: 'Compare operation - performs subtraction but only affects flags',
                cycles: '1 cycle (reg-reg), 3-4 cycles (memory involved)',
                rationale: 'Sets up conditional branches without modifying data values'
            },
            'jmp': {
                purpose: 'Unconditional jump - transfers control to specified address',
                cycles: '1-3 cycles (depending on branch prediction)',
                rationale: 'Program flow control - essential for loops and function calls'
            },
            'je': {
                purpose: 'Conditional jump if equal (ZF=1) - branches based on previous comparison',
                cycles: '1 cycle (not taken), 3-4 cycles (taken)',
                rationale: 'Efficient conditional execution based on comparison results'
            },
            'jl': {
                purpose: 'Conditional jump if less than (SF≠OF) - signed comparison branch',
                cycles: '1 cycle (not taken), 3-4 cycles (taken)',
                rationale: 'Handles signed arithmetic comparisons for loop bounds and conditions'
            },
            'push': {
                purpose: 'Stack push - decrements ESP and stores value on stack',
                cycles: '2 cycles (stack operation + memory write)',
                rationale: 'Function parameter passing and register preservation'
            },
            'pop': {
                purpose: 'Stack pop - retrieves value from stack and increments ESP',
                cycles: '1-2 cycles (memory read + register update)',
                rationale: 'Efficient register restoration and data retrieval'
            },
            'call': {
                purpose: 'Function call - pushes return address and jumps to target',
                cycles: '3-4 cycles + pipeline flush overhead',
                rationale: 'Structured programming with automatic return address management'
            },
            'ret': {
                purpose: 'Return from function - pops return address and jumps back',
                cycles: '2-3 cycles + potential pipeline refill',
                rationale: 'Efficient function exit with stack-based return addressing'
            },
            'inc': {
                purpose: 'Increment by 1 - adds 1 to destination operand',
                cycles: '1 cycle (register), 4-5 cycles (memory)',
                rationale: 'Optimized single-increment operation, faster than add reg, 1'
            },
            'dec': {
                purpose: 'Decrement by 1 - subtracts 1 from destination operand',
                cycles: '1 cycle (register), 4-5 cycles (memory)',
                rationale: 'Optimized single-decrement, commonly used in loop counters'
            },
            'xor': {
                purpose: 'Exclusive OR - bitwise XOR operation between operands',
                cycles: '1 cycle (register), 3-4 cycles (memory)',
                rationale: 'Efficient zeroing (xor reg,reg) and bit manipulation'
            },
            'and': {
                purpose: 'Bitwise AND - logical AND operation for bit masking',
                cycles: '1 cycle (register), 3-4 cycles (memory)',
                rationale: 'Bit clearing and flag extraction operations'
            },
            'or': {
                purpose: 'Bitwise OR - logical OR operation for bit setting',
                cycles: '1 cycle (register), 3-4 cycles (memory)',
                rationale: 'Bit setting and flag combination operations'
            },
            'shl': {
                purpose: 'Shift left - logical left shift, equivalent to multiply by 2^n',
                cycles: '1 cycle (immediate count), 2+ cycles (variable count)',
                rationale: 'Fast multiplication by powers of 2, bit manipulation'
            },
            'shr': {
                purpose: 'Shift right - logical right shift, equivalent to divide by 2^n',
                cycles: '1 cycle (immediate count), 2+ cycles (variable count)',
                rationale: 'Fast division by powers of 2, bit extraction'
            },
            'imul': {
                purpose: 'Signed multiply - performs signed integer multiplication',
                cycles: '3-4 cycles (32-bit), varies by CPU generation',
                rationale: 'Efficient signed multiplication with overflow detection'
            },
            'idiv': {
                purpose: 'Signed divide - performs signed integer division with remainder',
                cycles: '20-30+ cycles (expensive operation)',
                rationale: 'Complete division operation, avoid when possible due to high cost'
            }
        };
        
        // Extract instruction mnemonic
        const parts = line.toLowerCase().split(/\s+/);
        const mnemonic = parts[0];
        
        return instructionMap[mnemonic] || {
            purpose: 'Assembly instruction - check FASM documentation for specific details',
            cycles: 'Varies by instruction and operands',
            rationale: 'Part of x86 instruction set - analyze operands for performance characteristics'
        };
    }
    
    getPerformanceAnalysis(code) {
        // Enhanced performance analysis
        const lines = code.split('\n').filter(line => line.trim() && !line.trim().startsWith(';'));
        let totalCycles = 0;
        let memoryOps = 0;
        let branchOps = 0;
        
        lines.forEach(line => {
            const trimmed = line.trim().toLowerCase();
            
            // Count cycles (simplified estimation)
            if (trimmed.includes('[') || trimmed.includes('dword ptr')) {
                totalCycles += 3; // Memory operation
                memoryOps++;
            } else if (trimmed.startsWith('j') || trimmed.startsWith('call')) {
                totalCycles += 3; // Branch operation
                branchOps++;
            } else {
                totalCycles += 1; // Register operation
            }
        });
        
        return `
**Estimated Performance:**
- **Total Cycles**: ~${totalCycles} cycles
- **Memory Operations**: ${memoryOps} (3+ cycles each)
- **Branch Operations**: ${branchOps} (variable cost)
- **Register Operations**: ${lines.length - memoryOps - branchOps}

**Optimization Opportunities:**
${memoryOps > lines.length / 2 ? '⚠️ High memory usage - consider register optimization' : '✅ Good register utilization'}
${branchOps > 2 ? '⚠️ Multiple branches - consider loop unrolling or restructuring' : '✅ Minimal branching overhead'}
        `;
    }
    
    suggestAlternatives(code) {
        // Context-aware optimization suggestions
        let suggestions = [];
        
        if (code.includes('mov eax, 0')) {
            suggestions.push('• Replace `mov eax, 0` with `xor eax, eax` (saves 3 bytes, same performance)');
        }
        
        if (code.includes('add') && code.includes('1')) {
            suggestions.push('• Consider `inc` instead of `add reg, 1` (smaller instruction size)');
        }
        
        if (code.includes('cmp') && code.includes('jl')) {
            suggestions.push('• For countdown loops, consider `dec` + `jnz` pattern (eliminates compare)');
        }
        
        if (code.includes('[') && code.includes('inc dword')) {
            suggestions.push('• Memory-based counters are slow - use registers when possible');
        }
        
        if (code.includes('imul') || code.includes('idiv')) {
            suggestions.push('• Division/multiplication are expensive - consider bit shifts for powers of 2');
        }
        
        return suggestions.length > 0 ? suggestions.join('\n') : '✅ Code looks well optimized for its purpose';
    }
    
    getPerformanceExplanation(metric) {
        const explanations = {
            'Cycles': `
**CPU Cycles Explained:**

CPU cycles measure the fundamental unit of processor time. Modern CPUs execute instructions in a pipeline, so actual cycle counts depend on:

• **Instruction Type**: Simple register operations (1 cycle) vs complex operations (20+ cycles)
• **Memory Hierarchy**: L1 cache hits (2-3 cycles) vs RAM access (100+ cycles)  
• **Pipeline Stalls**: Dependencies and branch mispredictions add overhead
• **Superscalar Execution**: Modern CPUs can execute multiple instructions per cycle

**Why It Matters:**
Optimizing for cycle count directly translates to execution speed. A 1000-cycle optimization in a function called million times saves 1 billion cycles!
            `,
            'Memory': `
**Memory Access Patterns:**

Memory operations are much slower than register operations:

• **L1 Cache**: 2-3 cycles (32KB instruction + 32KB data)
• **L2 Cache**: 8-12 cycles (256KB unified)
• **L3 Cache**: 20-40 cycles (8MB+ shared)
• **Main RAM**: 100-300 cycles (depends on memory controller)

**Optimization Strategies:**
1. Keep frequently used data in registers
2. Use sequential access patterns (cache-friendly)
3. Align data structures to cache line boundaries (64 bytes)
4. Minimize pointer chasing and random access patterns
            `,
            'Size': `
**Instruction Encoding and Size:**

Smaller instructions are better because:

• **Cache Efficiency**: More instructions fit in L1 instruction cache
• **Decode Bandwidth**: CPU can decode more instructions per cycle
• **Branch Prediction**: Smaller code improves branch target buffer efficiency

**Size Optimization:**
• Use single-byte opcodes when possible (inc vs add reg,1)
• Prefer register addressing over memory addressing
• Use short jumps for nearby branches
• Consider instruction selection for size vs speed trade-offs
            `
        };
        
        // Extract metric type from annotation text
        for (const [key, explanation] of Object.entries(explanations)) {
            if (metric.toLowerCase().includes(key.toLowerCase())) {
                return explanation;
            }
        }
        
        return `**Performance Metric: ${metric}**\n\nThis metric relates to assembly performance characteristics. Would you like me to explain specific aspects of performance optimization?`;
    }
    
    setupEventListeners() {
        const aiClose = document.getElementById('ai-close');
        const aiSend = document.getElementById('ai-send');
        const aiInput = document.getElementById('ai-input-field');
        const aiWindow = document.getElementById('ai-window');
        
        if (aiClose) {
            aiClose.addEventListener('click', () => this.closeWindow());
        }
        
        if (aiSend) {
            aiSend.addEventListener('click', () => this.sendMessage());
        }
        
        if (aiInput) {
            aiInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
            
            aiInput.addEventListener('input', (e) => {
                this.handleTyping(e.target.value);
            });
        }
        
        // Close window when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && !e.target.closest('#ai-helper')) {
                this.closeWindow();
            }
        });
        
        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeWindow();
            }
        });
        
        // Handle window resize for responsive positioning
        window.addEventListener('resize', () => {
            if (this.isOpen) {
                const aiWindow = document.getElementById('ai-window');
                if (aiWindow) {
                    this.adjustWindowPosition(aiWindow);
                }
            }
        });
    }
    
    makeDraggable(element, isToggleButton = false) {
        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };
        let hasMoved = false;
        let startPosition = { x: 0, y: 0 };
        
        const onMouseDown = (e) => {
            // Only allow dragging from header area for window, anywhere for toggle button
            if (!isToggleButton && !e.target.closest('.ai-header, .ai-drag-handle')) return;
            
            // Reset movement tracking
            hasMoved = false;
            startPosition = { x: e.clientX, y: e.clientY };
            
            isDragging = true;
            if (isToggleButton) {
                this.isDraggingToggle = true;
            }
            
            const rect = element.getBoundingClientRect();
            dragOffset.x = e.clientX - rect.left;
            dragOffset.y = e.clientY - rect.top;
            
            element.style.cursor = 'grabbing';
            e.preventDefault();
        };
        
        const onMouseMove = (e) => {
            if (!isDragging) return;
            
            // Check if we've moved enough to consider this a drag operation
            const moveDistance = Math.sqrt(
                Math.pow(e.clientX - startPosition.x, 2) + 
                Math.pow(e.clientY - startPosition.y, 2)
            );
            
            // Only start dragging if we've moved more than 5 pixels
            if (moveDistance > 5) {
                hasMoved = true;
                
                const newLeft = e.clientX - dragOffset.x;
                const newTop = e.clientY - dragOffset.y;
                
                // Constrain to viewport
                const maxLeft = window.innerWidth - element.offsetWidth;
                const maxTop = window.innerHeight - element.offsetHeight;
                
                const constrainedLeft = Math.max(0, Math.min(newLeft, maxLeft));
                const constrainedTop = Math.max(0, Math.min(newTop, maxTop));
                
                if (isToggleButton) {
                    // For toggle button, use right/bottom positioning
                    const right = window.innerWidth - constrainedLeft - element.offsetWidth;
                    const bottom = window.innerHeight - constrainedTop - element.offsetHeight;
                    
                    element.style.right = `${right}px`;
                    element.style.bottom = `${bottom}px`;
                    element.style.left = 'auto';
                    element.style.top = 'auto';
                    
                    this.togglePosition = { 
                        right: `${right}px`, 
                        bottom: `${bottom}px` 
                    };
                } else {
                    // For AI window, clear transform and use absolute positioning
                    element.style.transform = 'none';
                    element.style.left = `${constrainedLeft}px`;
                    element.style.top = `${constrainedTop}px`;
                    element.style.right = 'auto';
                    element.style.bottom = 'auto';
                }
            }
            
            e.preventDefault();
        };
        
        const onMouseUp = (e) => {
            if (isDragging) {
                isDragging = false;
                if (isToggleButton) {
                    this.isDraggingToggle = false;
                }
                
                element.style.cursor = isToggleButton ? 'pointer' : 'default';
                
                // If we haven't moved much, this was a click, not a drag
                if (!hasMoved && isToggleButton) {
                    // For toggle button, click is handled by separate click event listener
                    // Don't trigger toggle here to avoid double-triggering
                }
                
                if (isToggleButton && hasMoved) {
                    this.saveTogglePosition();
                }
            }
        };
        
        element.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        
        // Touch events for mobile
        element.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            onMouseDown({ 
                clientX: touch.clientX, 
                clientY: touch.clientY, 
                preventDefault: () => e.preventDefault(),
                target: e.target 
            });
        });
        
        document.addEventListener('touchmove', (e) => {
            if (isDragging) {
                const touch = e.touches[0];
                onMouseMove({ 
                    clientX: touch.clientX, 
                    clientY: touch.clientY, 
                    preventDefault: () => e.preventDefault() 
                });
            }
        });
        
        document.addEventListener('touchend', (e) => {
            onMouseUp(e);
        });
    }
    
    toggleExpansion() {
        const aiWindow = document.getElementById('ai-window');
        if (!aiWindow) return;
        
        this.isExpanded = !this.isExpanded;
        
        if (this.isExpanded) {
            // Save current position and size
            this.savedWindowState = {
                width: aiWindow.style.width || aiWindow.offsetWidth + 'px',
                height: aiWindow.style.height || aiWindow.offsetHeight + 'px',
                left: aiWindow.style.left,
                top: aiWindow.style.top,
                right: aiWindow.style.right,
                bottom: aiWindow.style.bottom
            };
            
            // Expand to fullscreen
            aiWindow.style.width = '95vw';
            aiWindow.style.height = '90vh';
            aiWindow.style.left = '50%';
            aiWindow.style.top = '50%';
            aiWindow.style.right = 'auto';
            aiWindow.style.bottom = 'auto';
            aiWindow.style.transform = 'translate(-50%, -50%)';
            aiWindow.classList.add('expanded');
        } else {
            // Restore previous size and position
            if (this.savedWindowState) {
                Object.keys(this.savedWindowState).forEach(prop => {
                    aiWindow.style[prop] = this.savedWindowState[prop];
                });
            }
            aiWindow.style.transform = '';
            aiWindow.classList.remove('expanded');
        }
    }
    
    setupVirtualScrollContainer() {
        const aiChat = document.getElementById('ai-chat');
        if (!aiChat) return;
        
        const virtualContainer = document.createElement('div');
        virtualContainer.className = 'virtual-scroll-container';
        virtualContainer.style.height = `${this.conversationHistory.length * this.virtualScrolling.itemHeight}px`;
        
        const visibleContainer = document.createElement('div');
        visibleContainer.className = 'virtual-visible-container';
        visibleContainer.style.transform = `translateY(${this.virtualScrolling.visibleRange.start * this.virtualScrolling.itemHeight}px)`;
        
        virtualContainer.appendChild(visibleContainer);
        aiChat.innerHTML = '';
        aiChat.appendChild(virtualContainer);
        
        // Setup scroll handler
        aiChat.addEventListener('scroll', () => {
            this.handleVirtualScroll();
        });
        
        this.renderVisibleMessages();
    }
    
    handleVirtualScroll() {
        const aiChat = document.getElementById('ai-chat');
        if (!aiChat || !this.virtualScrolling.enabled) return;
        
        const scrollTop = aiChat.scrollTop;
        const visibleStart = Math.floor(scrollTop / this.virtualScrolling.itemHeight);
        const visibleEnd = Math.min(
            visibleStart + Math.ceil(this.virtualScrolling.containerHeight / this.virtualScrolling.itemHeight) + 5,
            this.conversationHistory.length
        );
        
        if (visibleStart !== this.virtualScrolling.visibleRange.start || 
            visibleEnd !== this.virtualScrolling.visibleRange.end) {
            this.virtualScrolling.visibleRange = { start: visibleStart, end: visibleEnd };
            this.renderVisibleMessages();
        }
    }
    
    renderVisibleMessages() {
        if (!this.virtualScrolling.enabled) return;
        
        const visibleContainer = document.querySelector('.virtual-visible-container');
        if (!visibleContainer) return;
        
        visibleContainer.innerHTML = '';
        visibleContainer.style.transform = `translateY(${this.virtualScrolling.visibleRange.start * this.virtualScrolling.itemHeight}px)`;
        
        for (let i = this.virtualScrolling.visibleRange.start; i < this.virtualScrolling.visibleRange.end; i++) {
            if (i < this.conversationHistory.length) {
                const message = this.conversationHistory[i];
                const messageElement = this.createMessageElement(message, i);
                visibleContainer.appendChild(messageElement);
            }
        }
    }
    
    createMessageElement(message, index) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${message.sender}`;
        messageDiv.style.minHeight = `${this.virtualScrolling.itemHeight}px`;
        
        const senderName = message.sender === 'user' ? 'You' : 'Assistant';
        const messageContent = this.formatMessageContent(message.content);
        
        messageDiv.innerHTML = `<strong>${senderName}:</strong> ${messageContent}`;
        
        return messageDiv;
    }
    
    setupEnhancedHeader() {
        const aiHeader = document.querySelector('.ai-header');
        if (!aiHeader) return;
        
        // Clear existing content and rebuild with enhanced controls
        const title = aiHeader.querySelector('h3');
        const closeBtn = aiHeader.querySelector('.ai-close');
        
        aiHeader.innerHTML = '';
        
        // Add drag handle area
        const dragHandle = document.createElement('div');
        dragHandle.className = 'ai-drag-handle';
        dragHandle.innerHTML = '⋮⋮⋮';
        dragHandle.title = 'Drag to move window';
        aiHeader.appendChild(dragHandle);
        
        // Add title
        const newTitle = document.createElement('h3');
        newTitle.textContent = title ? title.textContent : 'FASM Programming Assistant';
        aiHeader.appendChild(newTitle);
        
        // Add navigation controls
        const navControls = document.createElement('div');
        navControls.className = 'ai-nav-controls';
        
        // Settings button
        const settingsBtn = document.createElement('button');
        settingsBtn.className = 'ai-nav-btn';
        settingsBtn.title = 'Open Settings';
        settingsBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"></path>
        </svg>`;
        settingsBtn.addEventListener('click', () => {
            const settingsToggle = document.getElementById('settings-toggle');
            if (settingsToggle) settingsToggle.click();
        });
        
        // Drawing button
        const drawingBtn = document.createElement('button');
        drawingBtn.className = 'ai-nav-btn';
        drawingBtn.title = 'Toggle Drawing Mode';
        drawingBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path>
            <polygon points="18,2 22,6 12,16 8,16 8,12 18,2"></polygon>
        </svg>`;
        drawingBtn.addEventListener('click', () => {
            const drawingMode = document.getElementById('drawing-mode');
            if (drawingMode) {
                drawingMode.checked = !drawingMode.checked;
                drawingMode.dispatchEvent(new Event('change'));
            }
        });
        
        // Navigation button
        const navBtn = document.createElement('button');
        navBtn.className = 'ai-nav-btn';
        navBtn.title = 'Toggle Navigation';
        navBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>`;
        navBtn.addEventListener('click', () => {
            const navToggle = document.getElementById('nav-toggle');
            if (navToggle) navToggle.click();
        });
        
        // Expand button
        const expandBtn = document.createElement('button');
        expandBtn.className = 'ai-nav-btn ai-expand-btn';
        expandBtn.title = 'Expand/Collapse';
        expandBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15,3 21,3 21,9"></polyline>
            <polyline points="9,21 3,21 3,15"></polyline>
            <line x1="21" y1="3" x2="14" y2="10"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
        </svg>`;
        expandBtn.addEventListener('click', () => {
            this.toggleExpansion();
            // Update icon based on state
            if (this.isExpanded) {
                expandBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="4,14 10,14 10,20"></polyline>
                    <polyline points="20,10 14,10 14,4"></polyline>
                    <line x1="14" y1="10" x2="21" y2="3"></line>
                    <line x1="3" y1="21" x2="10" y2="14"></line>
                </svg>`;
                expandBtn.title = 'Restore Window';
            } else {
                expandBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15,3 21,3 21,9"></polyline>
                    <polyline points="9,21 3,21 3,15"></polyline>
                    <line x1="21" y1="3" x2="14" y2="10"></line>
                    <line x1="3" y1="21" x2="10" y2="14"></line>
                </svg>`;
                expandBtn.title = 'Expand Window';
            }
        });
        
        navControls.appendChild(settingsBtn);
        navControls.appendChild(drawingBtn);
        navControls.appendChild(navBtn);
        navControls.appendChild(expandBtn);
        
        // Add close button
        const newCloseBtn = document.createElement('button');
        newCloseBtn.className = 'ai-close';
        newCloseBtn.id = 'ai-close';
        newCloseBtn.title = 'Close Assistant';
        newCloseBtn.innerHTML = '×';
        newCloseBtn.addEventListener('click', () => this.closeWindow());
        
        navControls.appendChild(newCloseBtn);
        
        aiHeader.appendChild(navControls);
        
        // Make header draggable area
        aiHeader.style.cursor = 'move';
    }
    
    toggleWindow() {
        if (this.isOpen) {
            this.closeWindow();
        } else {
            this.openWindow();
        }
    }
    
    openWindow() {
        const aiWindow = document.getElementById('ai-window');
        if (aiWindow) {
            // Add viewport boundary detection
            this.adjustWindowPosition(aiWindow);
            aiWindow.classList.add('visible');
            this.isOpen = true;
            
            // Enable dragging for the window only once
            if (!aiWindow.hasAttribute('data-draggable')) {
                this.makeDraggable(aiWindow, false);
                aiWindow.setAttribute('data-draggable', 'true');
            }
            
            // Setup enhanced header only once
            if (!aiWindow.hasAttribute('data-enhanced')) {
                this.setupEnhancedHeader();
                aiWindow.setAttribute('data-enhanced', 'true');
            }
            
            // Focus on input
            const aiInput = document.getElementById('ai-input-field');
            if (aiInput) {
                setTimeout(() => aiInput.focus(), 100);
            }
            
            // Add welcome message if first time
            if (this.conversationHistory.length === 0) {
                this.addWelcomeMessage();
            }
            
            // Setup chat boundaries to prevent overflow
            this.setupChatBoundaries();
        }
    }
    
    adjustWindowPosition(aiWindow) {
        // Reset position classes
        aiWindow.classList.remove('adjust-left', 'adjust-up');
        
        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Enhanced responsive breakpoints
        if (viewportWidth <= 768) {
            // Mobile - use full width behavior
            aiWindow.style.width = 'calc(100vw - 1rem)';
            aiWindow.style.height = 'calc(100vh - 6rem)';
            aiWindow.style.right = '0.5rem';
            aiWindow.style.bottom = '4rem';
        } else if (viewportWidth <= 1024) {
            // Tablet - constrained width
            aiWindow.style.width = 'min(380px, calc(100vw - 2rem))';
            aiWindow.style.height = 'min(480px, calc(100vh - 8rem))';
            aiWindow.style.right = '1rem';
            aiWindow.style.bottom = '6rem';
        } else {
            // Desktop - default behavior
            aiWindow.style.width = 'min(400px, calc(100vw - 2rem))';
            aiWindow.style.height = 'min(500px, calc(100vh - 10rem))';
            aiWindow.style.right = '1rem';
            aiWindow.style.bottom = '6rem';
        }
        
        // Get actual computed dimensions after CSS changes
        const rect = aiWindow.getBoundingClientRect();
        const windowWidth = rect.width;
        const windowHeight = rect.height;
        
        // Check if window would go outside right edge
        const rightEdge = viewportWidth - parseInt(aiWindow.style.right || '16px');
        if (windowWidth > rightEdge - 16) {
            aiWindow.classList.add('adjust-left');
        }
        
        // Check if window would go outside bottom edge
        const bottomEdge = viewportHeight - parseInt(aiWindow.style.bottom || '96px');
        if (windowHeight > bottomEdge - 16) {
            aiWindow.classList.add('adjust-up');
        }
    }
    
    closeWindow() {
        const aiWindow = document.getElementById('ai-window');
        if (aiWindow) {
            aiWindow.classList.add('closing');
            
            // Wait for animation to complete before hiding
            setTimeout(() => {
                aiWindow.classList.remove('visible', 'closing');
                this.isOpen = false;
            }, 300); // Match animation duration
        }
    }
    
    addWelcomeMessage() {
        const welcomeMessages = [
            "Hello! I'm your FASM programming assistant. I can help with:",
            "• Explaining assembly concepts and instructions",
            "• Debugging code issues",
            "• Optimization suggestions",
            "• Architecture-specific questions",
            "• Best practices and conventions",
            "",
            "What would you like to know about FASM or assembly programming?"
        ];
        
        this.addMessage('assistant', welcomeMessages.join('\n'));
    }
    
    sendMessage() {
        const aiInput = document.getElementById('ai-input-field');
        if (!aiInput) return;
        
        const message = aiInput.value.trim();
        if (!message) return;
        
        // Add user message to chat
        this.addMessage('user', message);
        
        // Clear input
        aiInput.value = '';
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Process message and generate response
        setTimeout(() => {
            this.processMessage(message);
        }, 500); // Simulate thinking time
    }
    
    addMessage(sender, content, isHtml = false) {
        // Save to conversation history first
        this.conversationHistory.push({
            sender,
            content,
            timestamp: Date.now()
        });
        
        this.saveConversationHistory();
        
        const aiChat = document.getElementById('ai-chat');
        if (!aiChat) return;
        
        if (this.virtualScrolling.enabled) {
            // Update virtual scrolling container height
            const virtualContainer = document.querySelector('.virtual-scroll-container');
            if (virtualContainer) {
                virtualContainer.style.height = `${this.conversationHistory.length * this.virtualScrolling.itemHeight}px`;
            }
            
            // Re-render visible messages if we're at the bottom
            const isAtBottom = aiChat.scrollTop + aiChat.clientHeight >= aiChat.scrollHeight - 10;
            if (isAtBottom) {
                // Scroll to bottom to show new message
                this.virtualScrolling.visibleRange.end = this.conversationHistory.length;
                this.virtualScrolling.visibleRange.start = Math.max(0, this.virtualScrolling.visibleRange.end - 50);
                this.renderVisibleMessages();
                
                setTimeout(() => {
                    aiChat.scrollTop = aiChat.scrollHeight;
                }, 0);
            }
        } else {
            // Standard message rendering for smaller conversation histories
            const messageDiv = document.createElement('div');
            messageDiv.className = `ai-message ${sender}`;
            
            const senderName = sender === 'user' ? 'You' : 'Assistant';
            const messageContent = isHtml ? content : this.formatMessageContent(content);
            
            messageDiv.innerHTML = `<strong>${senderName}:</strong> ${messageContent}`;
            
            aiChat.appendChild(messageDiv);
            aiChat.scrollTop = aiChat.scrollHeight;
        }
        
        // Enable virtual scrolling if conversation gets too long
        if (!this.virtualScrolling.enabled && this.conversationHistory.length > 100) {
            this.virtualScrolling.enabled = true;
            this.virtualScrolling.containerHeight = aiChat.clientHeight;
            this.setupVirtualScrollContainer();
        }
    }
    
    formatMessageContent(content) {
        // Convert markdown-like formatting to HTML
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/\n/g, '<br>');
    }
    
    showTypingIndicator() {
        const aiChat = document.getElementById('ai-chat');
        if (!aiChat) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'ai-message assistant typing-indicator';
        typingDiv.innerHTML = '<strong>Assistant:</strong> <span class="typing-dots">●●●</span>';
        typingDiv.id = 'typing-indicator';
        
        aiChat.appendChild(typingDiv);
        aiChat.scrollTop = aiChat.scrollHeight;
    }
    
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    processMessage(message) {
        this.hideTypingIndicator();
        
        const response = this.generateResponse(message);
        this.addMessage('assistant', response);
    }
    
    generateResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Check for specific FASM/assembly topics
        if (lowerMessage.includes('register')) {
            return this.getRegisterHelp(message);
        }
        
        if (lowerMessage.includes('instruction') || lowerMessage.includes('mov') || lowerMessage.includes('add') || lowerMessage.includes('sub')) {
            return this.getInstructionHelp(message);
        }
        
        if (lowerMessage.includes('memory') || lowerMessage.includes('address')) {
            return this.getMemoryHelp(message);
        }
        
        if (lowerMessage.includes('debug') || lowerMessage.includes('error')) {
            return this.getDebuggingHelp(message);
        }
        
        if (lowerMessage.includes('optimize') || lowerMessage.includes('performance')) {
            return this.getOptimizationHelp(message);
        }
        
        if (lowerMessage.includes('example') || lowerMessage.includes('code')) {
            return this.getCodeExample(message);
        }
        
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            return this.getGreeting();
        }
        
        if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
            return this.getHelpMessage();
        }
        
        // Default response with context-aware suggestions
        return this.getContextualResponse(message);
    }
    
    getRegisterHelp(message) {
        const registerExamples = {
            'eax': 'EAX is the primary accumulator register, often used for arithmetic operations and function return values.',
            'ebx': 'EBX is a general-purpose register, often used as a base register for memory addressing.',
            'ecx': 'ECX is commonly used as a counter in loops and string operations.',
            'edx': 'EDX is used in multiplication and division operations, and as a data register.',
            'esi': 'ESI (Source Index) is used for string operations and as a source pointer.',
            'edi': 'EDI (Destination Index) is used for string operations and as a destination pointer.',
            'esp': 'ESP is the stack pointer, crucial for stack management.',
            'ebp': 'EBP is the base pointer, used for stack frame management.'
        };
        
        const lowerMessage = message.toLowerCase();
        for (const [reg, description] of Object.entries(registerExamples)) {
            if (lowerMessage.includes(reg)) {
                return `**${reg.toUpperCase()} Register:**\n\n${description}\n\n**Example usage:**\n\`\`\`assembly\nmov ${reg}, 42    ; Load immediate value\nadd eax, ${reg}   ; Use in operation\n\`\`\`\n\nWould you like to know more about register usage patterns or see more examples?`;
            }
        }
        
        return `**Register Information:**\n\nThe x86 architecture has several types of registers:\n\n• **General Purpose:** EAX, EBX, ECX, EDX, ESI, EDI, ESP, EBP\n• **Segment:** CS, DS, ES, FS, GS, SS\n• **Control:** CR0, CR2, CR3, CR4\n• **Debug:** DR0-DR7\n\nEach serves specific purposes in program execution. Which specific register would you like to learn about?`;
    }
    
    getInstructionHelp(message) {
        const instructionHelp = {
            'mov': {
                description: 'MOV copies data from source to destination',
                syntax: 'mov destination, source',
                examples: [
                    'mov eax, 42      ; Load immediate value',
                    'mov eax, ebx     ; Copy register to register',
                    'mov [addr], eax  ; Store to memory'
                ]
            },
            'add': {
                description: 'ADD performs addition and stores result in destination',
                syntax: 'add destination, source',
                examples: [
                    'add eax, 10      ; Add immediate to register',
                    'add eax, ebx     ; Add register to register',
                    'add eax, [addr]  ; Add memory value to register'
                ]
            },
            'sub': {
                description: 'SUB performs subtraction and stores result in destination',
                syntax: 'sub destination, source',
                examples: [
                    'sub eax, 5       ; Subtract immediate',
                    'sub eax, ebx     ; Subtract register',
                    'sub eax, [addr]  ; Subtract memory value'
                ]
            }
        };
        
        const lowerMessage = message.toLowerCase();
        for (const [inst, info] of Object.entries(instructionHelp)) {
            if (lowerMessage.includes(inst)) {
                const examples = info.examples.map(ex => `  ${ex}`).join('\n');
                return `**${inst.toUpperCase()} Instruction:**\n\n${info.description}\n\n**Syntax:** \`${info.syntax}\`\n\n**Examples:**\n\`\`\`assembly\n${examples}\n\`\`\`\n\nNeed help with a specific use case or related instructions?`;
            }
        }
        
        return `**Instruction Help:**\n\nFASM supports the complete x86/x64 instruction set. Common categories include:\n\n• **Data Movement:** MOV, PUSH, POP, LEA\n• **Arithmetic:** ADD, SUB, MUL, DIV, INC, DEC\n• **Logic:** AND, OR, XOR, NOT, SHL, SHR\n• **Control Flow:** JMP, JE, JNE, CALL, RET\n• **String:** MOVS, STOS, SCAS, CMPS\n\nWhich specific instruction would you like help with?`;
    }
    
    getMemoryHelp(message) {
        return `**Memory Management in Assembly:**\n\nMemory is organized in a hierarchical structure:\n\n**Addressing Modes:**\n• Direct: \`mov eax, [address]\`\n• Indirect: \`mov eax, [ebx]\`\n• Indexed: \`mov eax, [ebx + 4]\`\n• Base + Index: \`mov eax, [ebx + esi*2 + 8]\`\n\n**Memory Sections:**\n• **.text** - Code section\n• **.data** - Initialized data\n• **.bss** - Uninitialized data\n• **Stack** - Local variables and function calls\n• **Heap** - Dynamic allocation\n\n**Example:**\n\`\`\`assembly\nsection '.data' data readable writeable\n    myvar dd 42\n    myarray dd 1,2,3,4,5\n\nsection '.code' code readable executable\n    mov eax, [myvar]        ; Load value\n    mov ebx, [myarray + 8]  ; Load array[2]\n\`\`\`\n\nWhat specific memory topic interests you?`;
    }
    
    getDebuggingHelp(message) {
        return `**Assembly Debugging Tips:**\n\n**Common Issues:**\n• Segmentation faults - Check memory access bounds\n• Stack corruption - Verify push/pop balance\n• Register misuse - Track register state\n• Logic errors - Step through with debugger\n\n**Debugging Tools:**\n• **GDB** - GNU Debugger for Linux/Unix\n• **OllyDbg** - Windows assembly debugger\n• **x64dbg** - Modern Windows debugger\n• **WinDbg** - Microsoft's kernel debugger\n\n**Debug Techniques:**\n1. Add debug prints/int3 breakpoints\n2. Check register values at key points\n3. Verify stack alignment\n4. Test with simple inputs first\n\n**Example Debug Code:**\n\`\`\`assembly\n; Debug print macro\nmacro debug_print reg {\n    push eax\n    push reg\n    call print_register\n    pop reg\n    pop eax\n}\n\`\`\`\n\nWhat specific debugging issue are you facing?`;
    }
    
    getOptimizationHelp(message) {
        return `**Assembly Optimization Strategies:**\n\n**Performance Tips:**\n• Use registers instead of memory when possible\n• Minimize memory access patterns\n• Align data on natural boundaries\n• Use efficient instruction forms\n• Consider pipeline effects\n\n**Common Optimizations:**\n\`\`\`assembly\n; Instead of:\nmov eax, 0\n; Use:\nxor eax, eax    ; Faster zero-ing\n\n; Instead of:\nmul ebx, 2\n; Use:\nshl ebx, 1      ; Faster multiply by 2\n\n; Instead of:\nmov eax, [addr]\nadd eax, 1\nmov [addr], eax\n; Use:\ninc dword [addr] ; Atomic increment\n\`\`\`\n\n**Modern CPU Considerations:**\n• Branch prediction optimization\n• Cache-friendly data access\n• SIMD instruction usage\n• Register allocation strategies\n\nWhat aspect of optimization would you like to explore further?`;
    }
    
    getCodeExample(message) {
        const examples = [
            {
                title: "Hello World Program",
                code: `format PE console\nentry start\n\ninclude 'win32a.inc'\n\nsection '.data' data readable writeable\n    hello db 'Hello, FASM World!',13,10,0\n\nsection '.code' code readable executable\nstart:\n    push hello\n    call [printf]\n    add esp, 4\n    \n    push 0\n    call [ExitProcess]\n\ndata import\n    library kernel32,'KERNEL32.DLL',\\\n            msvcrt,'MSVCRT.DLL'\n    \n    import kernel32,ExitProcess,'ExitProcess'\n    import msvcrt,printf,'printf'\nend data`
            },
            {
                title: "Simple Function",
                code: `; Function to add two numbers\nadd_numbers:\n    push ebp\n    mov ebp, esp\n    \n    mov eax, [ebp + 8]   ; First parameter\n    add eax, [ebp + 12]  ; Add second parameter\n    \n    pop ebp\n    ret`
            },
            {
                title: "Array Processing",
                code: `; Sum array elements\nsum_array:\n    push ebp\n    mov ebp, esp\n    push esi\n    push ecx\n    \n    mov esi, [ebp + 8]   ; Array pointer\n    mov ecx, [ebp + 12]  ; Array size\n    xor eax, eax         ; Sum = 0\n    \nsum_loop:\n    add eax, [esi]\n    add esi, 4\n    loop sum_loop\n    \n    pop ecx\n    pop esi\n    pop ebp\n    ret`
            }
        ];
        
        const randomExample = examples[Math.floor(Math.random() * examples.length)];
        
        return `**${randomExample.title} Example:**\n\n\`\`\`assembly\n${randomExample.code}\n\`\`\`\n\nThis example demonstrates key FASM concepts. Would you like me to explain any specific part or show a different type of example?`;
    }
    
    getGreeting() {
        const greetings = [
            "Hello! Ready to dive into some assembly programming?",
            "Hi there! How can I help you with FASM today?",
            "Greetings! What assembly concepts would you like to explore?",
            "Hey! Need help with any FASM programming challenges?"
        ];
        
        return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    getHelpMessage() {
        return `**I can help you with:**\n\n🔧 **Technical Support:**\n• Instruction explanations and usage\n• Register management strategies\n• Memory addressing modes\n• Assembly syntax and conventions\n\n💡 **Learning Assistance:**\n• Code examples and tutorials\n• Best practices and patterns\n• Architecture-specific guidance\n• Performance optimization tips\n\n🐛 **Debugging Help:**\n• Error analysis and solutions\n• Common pitfall identification\n• Debugging technique suggestions\n• Code review and improvements\n\n📚 **Educational Content:**\n• Concept explanations\n• Historical context\n• Real-world applications\n• Advanced topics\n\n**Just ask me anything about FASM, assembly programming, or computer architecture!**`;
    }
    
    getContextualResponse(message) {
        // Try to provide a helpful response based on current context
        const currentChapter = window.fasmEbook?.currentChapter?.title || 'Unknown';
        
        const contextualResponses = [
            `I see you're asking about "${message}". `,
            `Regarding "${message}" - `,
            `That's an interesting question about "${message}". `
        ];
        
        const suggestions = [
            `Since you're reading "${currentChapter}", this might relate to the concepts discussed there. `,
            `This topic often comes up when learning assembly programming. `,
            `Many programmers find this concept challenging at first. `
        ];
        
        const helpOffers = [
            "Could you provide more specific details about what you'd like to know?",
            "Would you like me to explain this concept with a code example?",
            "Is there a particular aspect you're struggling with?",
            "Would a step-by-step explanation be helpful?"
        ];
        
        const contextual = contextualResponses[Math.floor(Math.random() * contextualResponses.length)];
        const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        const helpOffer = helpOffers[Math.floor(Math.random() * helpOffers.length)];
        
        return `${contextual}${suggestion}${helpOffer}\n\nIn the meantime, here are some related topics I can help with:\n• Assembly syntax and structure\n• Processor architecture basics\n• Memory management concepts\n• Debugging techniques\n• Optimization strategies`;
    }
    
    handleTyping(value) {
        // Could implement real-time suggestions or auto-completion here
        if (value.length > 2) {
            // Show typing indicator or suggestions
        }
    }
    
    saveConversationHistory() {
        if (window.fasmStorage) {
            window.fasmStorage.set('ai-conversation', this.conversationHistory.slice(-50)); // Keep last 50 messages
        }
    }
    
    loadConversationHistory() {
        if (window.fasmStorage) {
            this.conversationHistory = window.fasmStorage.get('ai-conversation', []);
            
            // Restore conversation in UI
            this.conversationHistory.forEach(msg => {
                if (msg.sender !== 'assistant' || msg.content !== 'Hello! I\'m your FASM programming assistant...') {
                    this.addMessage(msg.sender, msg.content);
                }
            });
        }
    }
    
    clearConversation() {
        this.conversationHistory = [];
        const aiChat = document.getElementById('ai-chat');
        if (aiChat) {
            aiChat.innerHTML = '';
        }
        
        if (window.fasmStorage) {
            window.fasmStorage.remove('ai-conversation');
        }
        
        this.addWelcomeMessage();
    }
    
    initializeKnowledgeBase() {
        // This would contain extensive FASM/assembly knowledge
        // For now, it's implemented through the response methods above
        return {
            instructions: {},
            registers: {},
            concepts: {},
            examples: {}
        };
    }
}

// Initialize AI helper when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.fasmAI = new FASMeBookAI();
});