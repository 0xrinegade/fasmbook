// FASM Instruction Glossary Database
class InstructionGlossary {
    constructor() {
        this.instructions = new Map();
        this.usageIndex = new Map(); // Track where each instruction is used
        this.initializeInstructions();
    }
    
    initializeInstructions() {
        // Data Movement Instructions
        this.addInstruction('MOV', {
            category: 'Data Movement',
            syntax: 'MOV destination, source',
            description: 'Copies data from source to destination. Despite the name, the source data remains unchanged.',
            flags: 'None',
            cycles: '1 (register-register), 3-4 (memory)',
            introduced: 'Intel 8008 (1972)',
            encoding: 'Various (B8-BF for immediate to register)',
            examples: [
                'mov eax, 42        ; Load immediate value',
                'mov eax, ebx       ; Copy register',
                'mov [ebx], eax     ; Store to memory'
            ],
            notes: 'On modern CPUs, register-to-register moves have zero latency due to register renaming.',
            crossRefs: ['PUSH', 'POP', 'LEA', 'XCHG']
        });
        
        this.addInstruction('PUSH', {
            category: 'Stack Operations',
            syntax: 'PUSH source',
            description: 'Decrements ESP and stores the source operand at the new top of stack.',
            flags: 'None',
            cycles: '1-3 (depending on operand type)',
            introduced: 'Intel 8008 (1972)',
            encoding: '50-57 (register), 68 (immediate), FF/6 (memory)',
            examples: [
                'push eax          ; Push register onto stack',
                'push 42           ; Push immediate value',
                'push dword [ebx]  ; Push memory location'
            ],
            notes: 'Always decrements ESP by 4 bytes in 32-bit mode, 8 bytes in 64-bit mode.',
            crossRefs: ['POP', 'CALL', 'RET', 'ESP']
        });
        
        this.addInstruction('POP', {
            category: 'Stack Operations', 
            syntax: 'POP destination',
            description: 'Loads the value from the top of stack and increments ESP.',
            flags: 'None',
            cycles: '1-3 (depending on destination)',
            introduced: 'Intel 8008 (1972)',
            encoding: '58-5F (register), 8F/0 (memory)',
            examples: [
                'pop eax           ; Pop into register',
                'pop dword [ebx]   ; Pop into memory location'
            ],
            notes: 'Cannot pop immediate values. Stack must be balanced (every PUSH needs a POP).',
            crossRefs: ['PUSH', 'CALL', 'RET', 'ESP']
        });
        
        this.addInstruction('CALL', {
            category: 'Control Flow',
            syntax: 'CALL target',
            description: 'Pushes return address onto stack and transfers control to target address.',
            flags: 'None',
            cycles: '2-4 (near call), 4-6 (far call)',
            introduced: 'Intel 8008 (1972)',
            encoding: 'E8 (relative), FF/2 (indirect)',
            examples: [
                'call my_function  ; Call function by label',
                'call eax          ; Call function via register',
                'call [ebx]        ; Call function via memory pointer'
            ],
            notes: 'Automatically pushes EIP+instruction_length. Use RET to return.',
            crossRefs: ['RET', 'PUSH', 'POP', 'JMP']
        });
        
        this.addInstruction('RET', {
            category: 'Control Flow',
            syntax: 'RET [immediate]',
            description: 'Pops return address from stack and transfers control back to caller.',
            flags: 'None', 
            cycles: '2-3',
            introduced: 'Intel 8008 (1972)',
            encoding: 'C3 (near return), CB (far return), C2/CA (with immediate)',
            examples: [
                'ret               ; Simple return',
                'ret 8             ; Return and clean 8 bytes from stack'
            ],
            notes: 'Optional immediate specifies bytes to remove from stack (for cleaning parameters).',
            crossRefs: ['CALL', 'POP', 'PUSH', 'JMP']
        });
        
        // Arithmetic Instructions
        this.addInstruction('ADD', {
            category: 'Arithmetic',
            syntax: 'ADD destination, source',
            description: 'Adds source to destination and stores result in destination.',
            flags: 'OF, SF, ZF, AF, CF, PF',
            cycles: '1 (register-register), 3-4 (memory)',
            introduced: 'Intel 8008 (1972)',
            encoding: '00-05 (various forms)',
            examples: [
                'add eax, ebx      ; Add registers',
                'add eax, 42       ; Add immediate',
                'add [ebx], eax    ; Add to memory'
            ],
            notes: 'Sets carry flag on unsigned overflow, overflow flag on signed overflow.',
            crossRefs: ['SUB', 'INC', 'ADC', 'CMP']
        });
        
        this.addInstruction('SUB', {
            category: 'Arithmetic',
            syntax: 'SUB destination, source',
            description: 'Subtracts source from destination and stores result in destination.',
            flags: 'OF, SF, ZF, AF, CF, PF',
            cycles: '1 (register-register), 3-4 (memory)',
            introduced: 'Intel 8008 (1972)',
            encoding: '28-2D (various forms)',
            examples: [
                'sub eax, ebx      ; Subtract registers',
                'sub eax, 42       ; Subtract immediate',
                'sub [ebx], eax    ; Subtract from memory'
            ],
            notes: 'Sets carry flag when result would be negative (unsigned underflow).',
            crossRefs: ['ADD', 'DEC', 'SBB', 'CMP']
        });
        
        this.addInstruction('INC', {
            category: 'Arithmetic',
            syntax: 'INC operand',
            description: 'Increments the operand by 1.',
            flags: 'OF, SF, ZF, AF, PF (CF unchanged)',
            cycles: '1 (register), 3-4 (memory)',
            introduced: 'Intel 8008 (1972)',
            encoding: '40-47 (register), FE/0 (memory)',
            examples: [
                'inc eax           ; Increment register',
                'inc dword [ebx]   ; Increment memory location'
            ],
            notes: 'Does not affect carry flag, making it useful for loop counters.',
            crossRefs: ['DEC', 'ADD', 'LOOP']
        });
        
        this.addInstruction('DEC', {
            category: 'Arithmetic',
            syntax: 'DEC operand',
            description: 'Decrements the operand by 1.',
            flags: 'OF, SF, ZF, AF, PF (CF unchanged)',
            cycles: '1 (register), 3-4 (memory)',
            introduced: 'Intel 8008 (1972)',
            encoding: '48-4F (register), FE/1 (memory)',
            examples: [
                'dec eax           ; Decrement register',
                'dec dword [ebx]   ; Decrement memory location'
            ],
            notes: 'Does not affect carry flag, making it useful for loop counters.',
            crossRefs: ['INC', 'SUB', 'LOOP']
        });
        
        this.addInstruction('CMP', {
            category: 'Comparison',
            syntax: 'CMP operand1, operand2',
            description: 'Compares operand1 with operand2 by performing subtraction without storing result.',
            flags: 'OF, SF, ZF, AF, CF, PF',
            cycles: '1 (register-register), 3-4 (memory)',
            introduced: 'Intel 8008 (1972)',
            encoding: '38-3D (various forms)',
            examples: [
                'cmp eax, ebx      ; Compare registers',
                'cmp eax, 42       ; Compare with immediate',
                'cmp [ebx], eax    ; Compare memory with register'
            ],
            notes: 'Essential for conditional jumps. ZF=1 if equal, CF=1 if first < second (unsigned).',
            crossRefs: ['TEST', 'JE', 'JNE', 'JL', 'JG', 'JA', 'JB']
        });
        
        this.addInstruction('TEST', {
            category: 'Logical',
            syntax: 'TEST operand1, operand2',
            description: 'Performs logical AND between operands without storing result, setting flags.',
            flags: 'SF, ZF, PF (OF=0, CF=0, AF undefined)',
            cycles: '1 (register-register), 3-4 (memory)',
            introduced: 'Intel 8086 (1978)',
            encoding: '84-85 (register forms), F6/0, F7/0 (immediate)',
            examples: [
                'test eax, eax     ; Test if register is zero',
                'test eax, 1       ; Test if bit 0 is set',
                'test [ebx], eax   ; Test memory against register'
            ],
            notes: 'Commonly used with itself (test eax, eax) to check if register is zero.',
            crossRefs: ['CMP', 'AND', 'JZ', 'JNZ']
        });
        
        // Jump Instructions
        this.addInstruction('JMP', {
            category: 'Control Flow',
            syntax: 'JMP target',
            description: 'Unconditionally transfers control to target address.',
            flags: 'None',
            cycles: '1-3 (depending on target type)',
            introduced: 'Intel 8008 (1972)',
            encoding: 'EB (short), E9 (near), EA (far), FF/4 (indirect)',
            examples: [
                'jmp label         ; Jump to label',
                'jmp eax           ; Jump to address in register',
                'jmp [ebx]         ; Jump to address pointed by register'
            ],
            notes: 'Can be short (1 byte offset), near (4 byte offset), or far (segment:offset).',
            crossRefs: ['CALL', 'RET', 'Conditional Jumps']
        });
        
        this.addInstruction('JE', {
            category: 'Control Flow',
            syntax: 'JE target',
            description: 'Jump if Equal. Jumps if Zero Flag is set (ZF=1).',
            flags: 'None (reads ZF)',
            cycles: '1 (not taken), 2-3 (taken)',
            introduced: 'Intel 8008 (1972)',
            encoding: '74 (short), 0F 84 (near)',
            examples: [
                'cmp eax, 42       ; Compare eax with 42',
                'je equal_handler  ; Jump if they were equal'
            ],
            notes: 'Same as JZ (Jump if Zero). Requires prior comparison instruction.',
            crossRefs: ['JNE', 'JZ', 'CMP', 'TEST']
        });
        
        this.addInstruction('JNE', {
            category: 'Control Flow',
            syntax: 'JNE target',
            description: 'Jump if Not Equal. Jumps if Zero Flag is clear (ZF=0).',
            flags: 'None (reads ZF)',
            cycles: '1 (not taken), 2-3 (taken)',
            introduced: 'Intel 8008 (1972)',
            encoding: '75 (short), 0F 85 (near)',
            examples: [
                'cmp eax, 42       ; Compare eax with 42',
                'jne not_equal     ; Jump if they were not equal'
            ],
            notes: 'Same as JNZ (Jump if Not Zero). Most common conditional jump.',
            crossRefs: ['JE', 'JNZ', 'CMP', 'TEST']
        });
        
        this.addInstruction('JL', {
            category: 'Control Flow', 
            syntax: 'JL target',
            description: 'Jump if Less (signed comparison). Jumps if Sign Flag ≠ Overflow Flag.',
            flags: 'None (reads SF, OF)',
            cycles: '1 (not taken), 2-3 (taken)',
            introduced: 'Intel 8086 (1978)',
            encoding: '7C (short), 0F 8C (near)',
            examples: [
                'cmp eax, 42       ; Compare eax with 42',
                'jl less_handler   ; Jump if eax < 42 (signed)'
            ],
            notes: 'For signed comparisons. Use JB for unsigned comparisons.',
            crossRefs: ['JG', 'JLE', 'JGE', 'JB', 'CMP']
        });
        
        // Logical Instructions  
        this.addInstruction('AND', {
            category: 'Logical',
            syntax: 'AND destination, source',
            description: 'Performs bitwise AND between destination and source, storing result in destination.',
            flags: 'SF, ZF, PF (OF=0, CF=0, AF undefined)',
            cycles: '1 (register-register), 3-4 (memory)',
            introduced: 'Intel 8008 (1972)',
            encoding: '20-25 (various forms)',
            examples: [
                'and eax, ebx      ; Bitwise AND registers',
                'and eax, 0xFF     ; Mask to keep only low byte',
                'and [ebx], eax    ; AND memory with register'
            ],
            notes: 'Commonly used for bit masking and clearing specific bits.',
            crossRefs: ['OR', 'XOR', 'NOT', 'TEST']
        });
        
        this.addInstruction('OR', {
            category: 'Logical',
            syntax: 'OR destination, source', 
            description: 'Performs bitwise OR between destination and source, storing result in destination.',
            flags: 'SF, ZF, PF (OF=0, CF=0, AF undefined)',
            cycles: '1 (register-register), 3-4 (memory)',
            introduced: 'Intel 8008 (1972)',
            encoding: '08-0D (various forms)',
            examples: [
                'or eax, ebx       ; Bitwise OR registers',
                'or eax, 1         ; Set bit 0',
                'or [ebx], eax     ; OR memory with register'
            ],
            notes: 'Commonly used for setting specific bits.',
            crossRefs: ['AND', 'XOR', 'NOT', 'TEST']
        });
        
        this.addInstruction('XOR', {
            category: 'Logical',
            syntax: 'XOR destination, source',
            description: 'Performs bitwise XOR between destination and source, storing result in destination.',
            flags: 'SF, ZF, PF (OF=0, CF=0, AF undefined)',
            cycles: '1 (register-register), 3-4 (memory)',
            introduced: 'Intel 8008 (1972)',
            encoding: '30-35 (various forms)',
            examples: [
                'xor eax, ebx      ; Bitwise XOR registers',
                'xor eax, eax      ; Clear register (common idiom)',
                'xor [ebx], eax    ; XOR memory with register'
            ],
            notes: 'XOR reg, reg is the fastest way to zero a register (1 byte, 1 cycle).',
            crossRefs: ['AND', 'OR', 'NOT', 'MOV']
        });
        
        // Bit Manipulation
        this.addInstruction('SHL', {
            category: 'Bit Manipulation',
            syntax: 'SHL destination, count',
            description: 'Shifts bits left, filling with zeros from the right.',
            flags: 'CF, OF, SF, ZF, PF (AF undefined)',
            cycles: '1-3 (depending on count)',
            introduced: 'Intel 8086 (1978)',
            encoding: 'D0/4, D1/4, D2/4, D3/4, C0/4, C1/4',
            examples: [
                'shl eax, 1        ; Multiply by 2',
                'shl eax, cl       ; Shift by amount in CL',
                'shl dword [ebx], 2 ; Shift memory location'
            ],
            notes: 'Each left shift multiplies by 2. Faster than MUL for powers of 2.',
            crossRefs: ['SHR', 'SAL', 'SAR', 'ROL', 'ROR']
        });
        
        this.addInstruction('SHR', {
            category: 'Bit Manipulation',
            syntax: 'SHR destination, count',
            description: 'Shifts bits right, filling with zeros from the left (logical shift).',
            flags: 'CF, OF, SF, ZF, PF (AF undefined)',
            cycles: '1-3 (depending on count)',
            introduced: 'Intel 8086 (1978)',
            encoding: 'D0/5, D1/5, D2/5, D3/5, C0/5, C1/5',
            examples: [
                'shr eax, 1        ; Unsigned divide by 2',
                'shr eax, cl       ; Shift by amount in CL',
                'shr dword [ebx], 2 ; Shift memory location'
            ],
            notes: 'For unsigned division by powers of 2. Use SAR for signed division.',
            crossRefs: ['SHL', 'SAR', 'SAL', 'ROL', 'ROR']
        });
        
        // Loop Instructions
        this.addInstruction('LOOP', {
            category: 'Control Flow',
            syntax: 'LOOP target',
            description: 'Decrements ECX and jumps to target if ECX ≠ 0.',
            flags: 'None',
            cycles: '2-3',
            introduced: 'Intel 8086 (1978)',
            encoding: 'E2',
            examples: [
                'mov ecx, 10       ; Set loop counter',
                'loop_start:',
                '; ... loop body ...',
                'loop loop_start   ; Decrement ECX and loop if not zero'
            ],
            notes: 'Automatic loop with built-in counter. Limited to short jumps only.',
            crossRefs: ['LOOPE', 'LOOPNE', 'DEC', 'JNZ', 'ECX']
        });
        
        // String Instructions
        this.addInstruction('MOVS', {
            category: 'String Operations',
            syntax: 'MOVS[B|W|D]',
            description: 'Moves data from [ESI] to [EDI], updating both pointers.',
            flags: 'None',
            cycles: '2-4 (per element)',
            introduced: 'Intel 8086 (1978)',
            encoding: 'A4 (byte), A5 (word/dword)',
            examples: [
                'movsb             ; Move single byte',
                'movsd             ; Move single dword',
                'rep movsd         ; Move ECX dwords'
            ],
            notes: 'Usually used with REP prefix for block moves. Direction controlled by DF flag.',
            crossRefs: ['STOS', 'LODS', 'SCAS', 'CMPS', 'REP']
        });
        
        // System Instructions
        this.addInstruction('INT', {
            category: 'System',
            syntax: 'INT interrupt_number',
            description: 'Generates software interrupt, transferring control to interrupt handler.',
            flags: 'None (handler may modify flags)',
            cycles: '20-200+ (depends on handler)',
            introduced: 'Intel 8086 (1978)',
            encoding: 'CD (with immediate), CC (INT 3), CE (INTO)',
            examples: [
                'int 0x21          ; DOS system call',
                'int 3             ; Breakpoint interrupt',
                'int 0x80          ; Linux system call (32-bit)'
            ],
            notes: 'Pushes flags, CS, and IP before calling handler. Use IRET to return.',
            crossRefs: ['IRET', 'CALL', 'SYSCALL']
        });
        
        this.addInstruction('NOP', {
            category: 'Miscellaneous',
            syntax: 'NOP',
            description: 'No operation. Does nothing except advance instruction pointer.',
            flags: 'None',
            cycles: '1',
            introduced: 'Intel 8086 (1978)',
            encoding: '90 (XCHG EAX, EAX)',
            examples: [
                'nop               ; Padding/alignment',
                'nop               ; Timing adjustment',
                'nop               ; Code patching placeholder'
            ],
            notes: 'Often used for alignment, timing, or as placeholder for code patching.',
            crossRefs: ['PAUSE', 'HLT']
        });
        
        // Advanced arithmetic
        this.addInstruction('IMUL', {
            category: 'Arithmetic',
            syntax: 'IMUL destination [, source] [, immediate]',
            description: 'Signed integer multiplication with multiple forms.',
            flags: 'OF, CF (SF, ZF, AF, PF undefined)', 
            cycles: '3-11 (depending on operands)',
            introduced: 'Intel 8086 (1978)',
            encoding: 'F6/5, F7/5 (one operand), 0F AF (two operand), 6B/69 (three operand)',
            examples: [
                'imul eax          ; EDX:EAX = EAX * EAX',
                'imul eax, ebx     ; EAX = EAX * EBX',
                'imul eax, ebx, 5  ; EAX = EBX * 5'
            ],
            notes: 'Three forms: one operand (64-bit result), two operand, three operand.',
            crossRefs: ['MUL', 'IDIV', 'SHL', 'ADD']
        });
        
        this.addInstruction('IDIV', {
            category: 'Arithmetic',
            syntax: 'IDIV divisor',
            description: 'Signed integer division. Divides EDX:EAX by divisor.',
            flags: 'All flags undefined',
            cycles: '17-25',
            introduced: 'Intel 8086 (1978)', 
            encoding: 'F6/7 (byte), F7/7 (word/dword)',
            examples: [
                'cdq               ; Sign-extend EAX to EDX:EAX',
                'idiv ebx          ; EAX = EDX:EAX / EBX, EDX = remainder'
            ],
            notes: 'Always use CDQ before 32-bit division to avoid exceptions.',
            crossRefs: ['DIV', 'CDQ', 'CWD', 'IMUL']
        });
        
        this.addInstruction('CDQ', {
            category: 'Arithmetic',
            syntax: 'CDQ',
            description: 'Convert Doubleword to Quadword. Sign-extends EAX into EDX.',
            flags: 'None',
            cycles: '1',
            introduced: 'Intel 80386 (1985)',
            encoding: '99',
            examples: [
                'mov eax, -42      ; Load negative number',
                'cdq               ; EDX = 0xFFFFFFFF (sign extension)',
                'idiv ebx          ; Now safe to divide'
            ],
            notes: 'Essential before IDIV to properly set up EDX:EAX dividend.',
            crossRefs: ['CWD', 'IDIV', 'DIV', 'SAR']
        });
        
        this.addInstruction('LEA', {
            category: 'Address Calculation',
            syntax: 'LEA destination, [address_expression]',
            description: 'Load Effective Address. Calculates address without memory access.',
            flags: 'None',
            cycles: '1',
            introduced: 'Intel 8086 (1978)',
            encoding: '8D',
            examples: [
                'lea eax, [ebx+ecx*2+5] ; EAX = EBX + ECX*2 + 5',
                'lea eax, [eax+eax*2]   ; EAX = EAX * 3',
                'lea esi, [esi+4]       ; ESI = ESI + 4'
            ],
            notes: 'Powerful for address calculation and arithmetic (multiply by 2, 3, 5, 9).',
            crossRefs: ['MOV', 'ADD', 'SHL', 'IMUL']
        });
    }
    
    addInstruction(mnemonic, data) {
        this.instructions.set(mnemonic.toUpperCase(), {
            mnemonic: mnemonic.toUpperCase(),
            ...data,
            usages: [] // Will be populated when scanning content
        });
    }
    
    getInstruction(mnemonic) {
        return this.instructions.get(mnemonic.toUpperCase());
    }
    
    getAllInstructions() {
        return Array.from(this.instructions.values());
    }
    
    addUsage(mnemonic, location) {
        const instruction = this.getInstruction(mnemonic);
        if (instruction) {
            instruction.usages.push(location);
        }
    }
    
    searchInstructions(query) {
        const results = [];
        const lowerQuery = query.toLowerCase();
        
        for (const instruction of this.instructions.values()) {
            if (instruction.mnemonic.toLowerCase().includes(lowerQuery) ||
                instruction.description.toLowerCase().includes(lowerQuery) ||
                instruction.category.toLowerCase().includes(lowerQuery)) {
                results.push(instruction);
            }
        }
        
        return results;
    }
    
    generateTooltipHTML(mnemonic) {
        const instruction = this.getInstruction(mnemonic);
        if (!instruction) return null;
        
        return `
            <div class="instruction-tooltip">
                <div class="instruction-header">
                    <span class="instruction-mnemonic">${instruction.mnemonic}</span>
                    <span class="instruction-category">${instruction.category}</span>
                </div>
                <div class="instruction-syntax">
                    <strong>Syntax:</strong> <code>${instruction.syntax}</code>
                </div>
                <div class="instruction-description">
                    ${instruction.description}
                </div>
                <div class="instruction-details">
                    <div><strong>Flags:</strong> ${instruction.flags}</div>
                    <div><strong>Cycles:</strong> ${instruction.cycles}</div>
                    <div><strong>Introduced:</strong> ${instruction.introduced}</div>
                </div>
                ${instruction.examples ? `
                    <div class="instruction-examples">
                        <strong>Examples:</strong>
                        <pre><code>${instruction.examples.join('\n')}</code></pre>
                    </div>
                ` : ''}
                ${instruction.notes ? `
                    <div class="instruction-notes">
                        <strong>Notes:</strong> ${instruction.notes}
                    </div>
                ` : ''}
                ${instruction.usages && instruction.usages.length > 0 ? `
                    <div class="instruction-usages">
                        <strong>Used in:</strong>
                        ${instruction.usages.slice(0, 5).map(usage => 
                            `<a href="#" onclick="navigateToUsage('${usage.chapter}', ${usage.line})" class="usage-link">${usage.chapter}:${usage.line}</a>`
                        ).join(', ')}
                        ${instruction.usages.length > 5 ? `... and ${instruction.usages.length - 5} more` : ''}
                    </div>
                ` : ''}
                ${instruction.crossRefs ? `
                    <div class="instruction-cross-refs">
                        <strong>See also:</strong>
                        ${instruction.crossRefs.map(ref => 
                            `<a href="#" onclick="showInstructionTooltip('${ref}')" class="cross-ref-link">${ref}</a>`
                        ).join(', ')}
                    </div>
                ` : ''}
            </div>
        `;
    }
}

// Global instance
window.instructionGlossary = new InstructionGlossary();

// Navigation helper function
function navigateToUsage(chapter, line) {
    // This will be implemented to jump to specific usage
    console.log(`Navigate to ${chapter} line ${line}`);
    // Hide tooltip
    hideInstructionTooltip();
    // Navigate to chapter and scroll to line
    if (window.fasmEbook) {
        window.fasmEbook.loadChapter(chapter).then(() => {
            // Scroll to specific line (implementation needed)
            scrollToLine(line);
        });
    }
}

function showInstructionTooltip(mnemonic) {
    // Show tooltip for cross-referenced instruction
    const tooltip = document.querySelector('.instruction-tooltip-popup');
    if (tooltip) {
        const html = window.instructionGlossary.generateTooltipHTML(mnemonic);
        if (html) {
            tooltip.innerHTML = html;
            tooltip.style.display = 'block';
        }
    }
}

function hideInstructionTooltip() {
    const tooltip = document.querySelector('.instruction-tooltip-popup');
    if (tooltip) {
        tooltip.style.display = 'none';
    }
}