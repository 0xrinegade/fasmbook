// Robust Markdown Parser for FASM eBook
// Replaces fragile regex patterns with proper AST-based parsing

class MarkdownParser {
    constructor() {
        this.supportedLanguages = new Set(['assembly', 'asm', 'fasm']);
        this.codeBlockDelimiter = '```';
    }

    /**
     * Parse markdown text and extract code blocks with proper error handling
     * @param {string} markdown - Raw markdown text
     * @param {Object} context - Context object for logging/debugging
     * @returns {Array} Array of parsed code blocks with metadata
     */
    parseCodeBlocks(markdown, context = {}) {
        if (!markdown || typeof markdown !== 'string') {
            console.warn('Invalid markdown input provided to parser');
            return [];
        }

        const codeBlocks = [];
        const lines = markdown.split('\n');
        let currentBlock = null;
        let lineNumber = 0;

        try {
            for (let i = 0; i < lines.length; i++) {
                lineNumber = i + 1;
                const line = lines[i];
                const trimmedLine = line.trim();

                if (this.isCodeBlockStart(trimmedLine)) {
                    if (currentBlock) {
                        console.warn(`Unclosed code block at line ${currentBlock.startLine}, closing before new block at line ${lineNumber}`);
                        this.finalizeCodeBlock(currentBlock, codeBlocks, i - 1);
                    }

                    const language = this.extractLanguage(trimmedLine);
                    if (this.supportedLanguages.has(language)) {
                        currentBlock = {
                            language,
                            content: [],
                            startLine: lineNumber,
                            endLine: null,
                            context: context.id || 'unknown'
                        };
                    }
                } else if (this.isCodeBlockEnd(trimmedLine) && currentBlock) {
                    currentBlock.endLine = lineNumber;
                    this.finalizeCodeBlock(currentBlock, codeBlocks, i);
                    currentBlock = null;
                } else if (currentBlock) {
                    // Inside a code block, preserve original line content
                    currentBlock.content.push(line);
                }
            }

            // Handle unclosed code block at end of file
            if (currentBlock) {
                console.warn(`Unclosed code block at line ${currentBlock.startLine}, auto-closing at end of file`);
                currentBlock.endLine = lineNumber;
                this.finalizeCodeBlock(currentBlock, codeBlocks, lines.length - 1);
            }

        } catch (error) {
            console.error(`Error parsing markdown at line ${lineNumber}:`, error);
            // Return partial results if parsing fails
        }

        return codeBlocks;
    }

    /**
     * Check if a line starts a code block
     * @param {string} line - Trimmed line to check
     * @returns {boolean}
     */
    isCodeBlockStart(line) {
        return line.startsWith(this.codeBlockDelimiter) && 
               line.length > this.codeBlockDelimiter.length;
    }

    /**
     * Check if a line ends a code block
     * @param {string} line - Trimmed line to check
     * @returns {boolean}
     */
    isCodeBlockEnd(line) {
        return line === this.codeBlockDelimiter;
    }

    /**
     * Extract language identifier from code block start line
     * @param {string} line - Code block start line
     * @returns {string} Language identifier or empty string
     */
    extractLanguage(line) {
        if (!line.startsWith(this.codeBlockDelimiter)) {
            return '';
        }

        const languagePart = line.substring(this.codeBlockDelimiter.length).trim();
        
        // Handle language specification with optional attributes
        // Examples: ```assembly, ```asm{.line-numbers}, ```fasm copy
        const spaceIndex = languagePart.indexOf(' ');
        const braceIndex = languagePart.indexOf('{');
        
        let endIndex = languagePart.length;
        if (spaceIndex !== -1) endIndex = Math.min(endIndex, spaceIndex);
        if (braceIndex !== -1) endIndex = Math.min(endIndex, braceIndex);
        
        return languagePart.substring(0, endIndex).toLowerCase();
    }

    /**
     * Finalize and add code block to results array
     * @param {Object} codeBlock - Code block object
     * @param {Array} codeBlocks - Results array
     * @param {number} endIndex - End line index
     */
    finalizeCodeBlock(codeBlock, codeBlocks, endIndex) {
        if (codeBlock.content.length > 0) {
            codeBlock.rawContent = codeBlock.content.join('\n');
            codeBlock.lineCount = codeBlock.content.length;
            codeBlocks.push(codeBlock);
        }
    }

    /**
     * Parse markdown for Windows/Linux specific code detection
     * More robust than regex-based detection
     * @param {string} markdown - Markdown content
     * @returns {Object} Platform detection results
     */
    detectPlatformSpecificCode(markdown) {
        const results = {
            windows: { count: 0, indicators: [], lines: [] },
            linux: { count: 0, indicators: [], lines: [] },
            generic: { count: 0 }
        };

        const windowsIndicators = [
            'windows.inc', 'kernel32.dll', 'user32.dll', 'GetProcAddress',
            'LoadLibrary', 'MessageBox', 'CreateFile', 'ReadFile', 'WriteFile',
            'VirtualAlloc', 'GetModuleHandle', 'ExitProcess'
        ];

        const linuxIndicators = [
            'syscall', 'sys_', '/proc/', '/dev/', 'elf', 'linux',
            'sys_exit', 'sys_write', 'sys_read', 'sys_open', 'sys_close'
        ];

        const codeBlocks = this.parseCodeBlocks(markdown);
        
        codeBlocks.forEach(block => {
            const content = block.rawContent.toLowerCase();
            const lines = block.content;

            // Check for Windows-specific patterns
            windowsIndicators.forEach(indicator => {
                if (content.includes(indicator.toLowerCase())) {
                    results.windows.count++;
                    if (!results.windows.indicators.includes(indicator)) {
                        results.windows.indicators.push(indicator);
                    }
                    
                    // Find specific lines containing the indicator
                    lines.forEach((line, index) => {
                        if (line.toLowerCase().includes(indicator.toLowerCase())) {
                            results.windows.lines.push({
                                line: block.startLine + index,
                                content: line.trim(),
                                indicator
                            });
                        }
                    });
                }
            });

            // Check for Linux-specific patterns
            linuxIndicators.forEach(indicator => {
                if (content.includes(indicator.toLowerCase())) {
                    results.linux.count++;
                    if (!results.linux.indicators.includes(indicator)) {
                        results.linux.indicators.push(indicator);
                    }
                    
                    lines.forEach((line, index) => {
                        if (line.toLowerCase().includes(indicator.toLowerCase())) {
                            results.linux.lines.push({
                                line: block.startLine + index,
                                content: line.trim(),
                                indicator
                            });
                        }
                    });
                }
            });

            // Count generic assembly blocks
            if (results.windows.count === 0 && results.linux.count === 0) {
                results.generic.count++;
            }
        });

        return results;
    }

    /**
     * Extract and analyze instruction usage from code blocks
     * @param {string} markdown - Markdown content
     * @param {Array} instructionList - List of instructions to search for
     * @returns {Object} Instruction usage analysis
     */
    analyzeInstructionUsage(markdown, instructionList = []) {
        const codeBlocks = this.parseCodeBlocks(markdown);
        const usage = new Map();
        const errors = [];

        instructionList.forEach(instruction => {
            usage.set(instruction, {
                count: 0,
                locations: [],
                examples: []
            });
        });

        codeBlocks.forEach(block => {
            try {
                this.scanBlockForInstructions(block, instructionList, usage);
            } catch (error) {
                errors.push({
                    block: block.startLine,
                    error: error.message
                });
            }
        });

        return {
            usage: Object.fromEntries(usage),
            totalBlocks: codeBlocks.length,
            errors
        };
    }

    /**
     * Scan individual code block for instruction usage
     * @param {Object} block - Code block object
     * @param {Array} instructionList - Instructions to search for
     * @param {Map} usage - Usage tracking map
     */
    scanBlockForInstructions(block, instructionList, usage) {
        const lines = block.content;

        lines.forEach((line, index) => {
            const lineNumber = block.startLine + index;
            const cleanLine = this.cleanCodeLine(line);
            
            instructionList.forEach(instruction => {
                if (this.lineContainsInstruction(cleanLine, instruction)) {
                    const instructionData = usage.get(instruction);
                    instructionData.count++;
                    instructionData.locations.push({
                        line: lineNumber,
                        block: block.startLine,
                        context: block.context
                    });
                    
                    // Store example usage (limit to prevent memory bloat)
                    if (instructionData.examples.length < 5) {
                        instructionData.examples.push({
                            line: lineNumber,
                            code: line.trim()
                        });
                    }
                }
            });
        });
    }

    /**
     * Clean code line for instruction detection
     * @param {string} line - Raw code line
     * @returns {string} Cleaned line
     */
    cleanCodeLine(line) {
        // Remove comments (both ; and // style)
        let cleaned = line.split(';')[0].split('//')[0];
        
        // Remove leading/trailing whitespace and convert to lowercase
        return cleaned.trim().toLowerCase();
    }

    /**
     * Check if line contains specific instruction
     * More robust than simple string matching
     * @param {string} cleanLine - Cleaned code line
     * @param {string} instruction - Instruction to find
     * @returns {boolean}
     */
    lineContainsInstruction(cleanLine, instruction) {
        if (!cleanLine || !instruction) return false;
        
        const instrLower = instruction.toLowerCase();
        
        // Word boundary check to avoid false positives
        // e.g., "mov" should not match "remove" or "movs"
        const wordPattern = new RegExp(`\\b${this.escapeRegExp(instrLower)}\\b`);
        return wordPattern.test(cleanLine);
    }

    /**
     * Escape special regex characters in string
     * @param {string} string - String to escape
     * @returns {string} Escaped string
     */
    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MarkdownParser;
} else if (typeof window !== 'undefined') {
    window.MarkdownParser = MarkdownParser;
}