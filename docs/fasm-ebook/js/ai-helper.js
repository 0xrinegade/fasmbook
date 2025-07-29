// AI Helper for FASM eBook
class FASMeBookAI {
    constructor() {
        this.isOpen = false;
        this.conversationHistory = [];
        this.knowledgeBase = this.initializeKnowledgeBase();
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadConversationHistory();
    }
    
    setupEventListeners() {
        const aiToggle = document.getElementById('ai-toggle');
        const aiClose = document.getElementById('ai-close');
        const aiSend = document.getElementById('ai-send');
        const aiInput = document.getElementById('ai-input-field');
        const aiWindow = document.getElementById('ai-window');
        
        if (aiToggle) {
            aiToggle.addEventListener('click', () => this.toggleWindow());
        }
        
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
            aiWindow.classList.add('visible');
            this.isOpen = true;
            
            // Focus on input
            const aiInput = document.getElementById('ai-input-field');
            if (aiInput) {
                setTimeout(() => aiInput.focus(), 100);
            }
            
            // Add welcome message if first time
            if (this.conversationHistory.length === 0) {
                this.addWelcomeMessage();
            }
        }
    }
    
    closeWindow() {
        const aiWindow = document.getElementById('ai-window');
        if (aiWindow) {
            aiWindow.classList.remove('visible');
            this.isOpen = false;
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
        const aiChat = document.getElementById('ai-chat');
        if (!aiChat) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${sender}`;
        
        const senderName = sender === 'user' ? 'You' : 'Assistant';
        const messageContent = isHtml ? content : this.formatMessageContent(content);
        
        messageDiv.innerHTML = `<strong>${senderName}:</strong> ${messageContent}`;
        
        aiChat.appendChild(messageDiv);
        aiChat.scrollTop = aiChat.scrollHeight;
        
        // Save to conversation history
        this.conversationHistory.push({
            sender,
            content,
            timestamp: Date.now()
        });
        
        this.saveConversationHistory();
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