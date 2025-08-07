// Simple Markdown parser for FASM eBook
class FASMMarkdownParser {
    constructor() {
        this.extensions = {
            codeHighlighting: true,
            tableSupport: true,
            mathSupport: false,
            diagramSupport: false
        };
        
        this.patterns = this.initializePatterns();
    }
    
    initializePatterns() {
        return {
            // Headers
            h1: /^# (.*$)/gm,
            h2: /^## (.*$)/gm,
            h3: /^### (.*$)/gm,
            h4: /^#### (.*$)/gm,
            h5: /^##### (.*$)/gm,
            h6: /^###### (.*$)/gm,
            
            // Text formatting
            bold: /\*\*(.*?)\*\*/g,
            italic: /\*(.*?)\*/g,
            strikethrough: /~~(.*?)~~/g,
            
            // Code
            inlineCode: /`([^`]+)`/g,
            codeBlock: /^```(\w*)\n([\s\S]*?)```$/gm,
            
            // Links and images
            link: /\[([^\]]+)\]\(([^)]+)\)/g,
            image: /!\[([^\]]*)\]\(([^)]+)\)/g,
            
            // Lists
            unorderedList: /^[\s]*[\*\-\+][\s]+(.*$)/gm,
            orderedList: /^[\s]*\d+\.[\s]+(.*$)/gm,
            
            // Blockquotes
            blockquote: /^> (.*$)/gm,
            
            // Horizontal rules
            hr: /^[\*\-_]{3,}$/gm,
            
            // Tables
            tableRow: /^\|(.+)\|$/gm,
            
            // Line breaks
            lineBreak: /\n\n/g,
            singleLineBreak: /\n(?!\n)/g
        };
    }
    
    parse(markdown) {
        if (!markdown) return '';
        
        let html = markdown;
        
        // Process in order of precedence
        html = this.processCodeBlocks(html);
        html = this.processHeaders(html);
        html = this.processTables(html);
        html = this.processLists(html);
        html = this.processBlockquotes(html);
        html = this.processHorizontalRules(html);
        html = this.processTextFormatting(html);
        html = this.processLinks(html);
        html = this.processImages(html);
        html = this.processInlineCode(html);
        html = this.processParagraphs(html);
        html = this.processLineBreaks(html);
        
        return this.postProcess(html);
    }
    
    processHeaders(html) {
        html = html.replace(this.patterns.h6, '<h6>$1</h6>');
        html = html.replace(this.patterns.h5, '<h5>$1</h5>');
        html = html.replace(this.patterns.h4, '<h4>$1</h4>');
        html = html.replace(this.patterns.h3, '<h3>$1</h3>');
        html = html.replace(this.patterns.h2, '<h2>$1</h2>');
        html = html.replace(this.patterns.h1, '<h1>$1</h1>');
        
        return html;
    }
    
    processTextFormatting(html) {
        // Process bold first, then italic to avoid conflicts
        html = html.replace(this.patterns.bold, '<strong>$1</strong>');
        html = html.replace(this.patterns.italic, '<em>$1</em>');
        html = html.replace(this.patterns.strikethrough, '<del>$1</del>');
        
        return html;
    }
    
    processCodeBlocks(html) {
        return html.replace(this.patterns.codeBlock, (match, language, code) => {
            const lang = language || 'text';
            const highlightedCode = this.highlightCode(code.trim(), lang, this.currentChapter);
            
            return `<div class="code-block interactive-code-block">
                <div class="code-header">
                    <span class="code-language">${lang.toUpperCase()}</span>
                    <div class="code-actions">
                        <button class="code-copy" onclick="copyCodeToClipboard(this)" title="Copy to clipboard">⧉ Copy</button>
                        <button class="code-download" onclick="downloadCodeSnippet(this)" title="Download as file">⧄ Download</button>
                    </div>
                </div>
                <pre><code class="language-${lang}">${highlightedCode}</code></pre>
            </div>`;
        });
    }
    
    processInlineCode(html) {
        return html.replace(this.patterns.inlineCode, '<code>$1</code>');
    }
    
    processLinks(html) {
        return html.replace(this.patterns.link, (match, text, url) => {
            // Check if it's an internal link
            if (url.startsWith('#') || url.startsWith('/')) {
                return `<a href="${url}" class="internal-link">${text}</a>`;
            } else {
                return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="external-link">${text}</a>`;
            }
        });
    }
    
    processImages(html) {
        return html.replace(this.patterns.image, (match, alt, src) => {
            return `<img src="${src}" alt="${alt}" class="content-image" loading="lazy">`;
        });
    }
    
    processLists(html) {
        // Process unordered lists
        html = this.processUnorderedLists(html);
        
        // Process ordered lists
        html = this.processOrderedLists(html);
        
        return html;
    }
    
    processUnorderedLists(html) {
        const lines = html.split('\n');
        const result = [];
        let inList = false;
        let listLevel = 0;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const match = line.match(/^(\s*)[\*\-\+]\s+(.*)$/);
            
            if (match) {
                const indentLevel = Math.floor(match[1].length / 2);
                const content = match[2];
                
                if (!inList) {
                    result.push('<ul>');
                    inList = true;
                    listLevel = indentLevel;
                } else if (indentLevel > listLevel) {
                    result.push('<ul>');
                    listLevel = indentLevel;
                } else if (indentLevel < listLevel) {
                    result.push('</ul>');
                    listLevel = indentLevel;
                }
                
                result.push(`<li>${content}</li>`);
            } else {
                if (inList && line.trim() === '') {
                    // Empty line in list - continue
                    continue;
                } else if (inList) {
                    // End of list
                    result.push('</ul>');
                    inList = false;
                    listLevel = 0;
                }
                result.push(line);
            }
        }
        
        if (inList) {
            result.push('</ul>');
        }
        
        return result.join('\n');
    }
    
    processOrderedLists(html) {
        const lines = html.split('\n');
        const result = [];
        let inList = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const match = line.match(/^\s*\d+\.\s+(.*)$/);
            
            if (match) {
                const content = match[1];
                
                if (!inList) {
                    result.push('<ol>');
                    inList = true;
                }
                
                result.push(`<li>${content}</li>`);
            } else {
                if (inList && line.trim() === '') {
                    // Empty line in list - continue
                    continue;
                } else if (inList) {
                    // End of list
                    result.push('</ol>');
                    inList = false;
                }
                result.push(line);
            }
        }
        
        if (inList) {
            result.push('</ol>');
        }
        
        return result.join('\n');
    }
    
    processBlockquotes(html) {
        const lines = html.split('\n');
        const result = [];
        let inBlockquote = false;
        let blockquoteContent = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const match = line.match(/^>\s*(.*)$/);
            
            if (match) {
                const content = match[1];
                
                if (!inBlockquote) {
                    inBlockquote = true;
                    blockquoteContent = [];
                }
                
                blockquoteContent.push(content);
            } else {
                if (inBlockquote) {
                    // End of blockquote
                    result.push(`<blockquote><p>${blockquoteContent.join(' ')}</p></blockquote>`);
                    inBlockquote = false;
                    blockquoteContent = [];
                }
                result.push(line);
            }
        }
        
        if (inBlockquote) {
            result.push(`<blockquote><p>${blockquoteContent.join(' ')}</p></blockquote>`);
        }
        
        return result.join('\n');
    }
    
    processHorizontalRules(html) {
        return html.replace(this.patterns.hr, '<hr>');
    }
    
    processTables(html) {
        const lines = html.split('\n');
        const result = [];
        let inTable = false;
        let tableRows = [];
        let isFirstRow = true;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            if (line.match(/^\|(.+)\|$/)) {
                const cells = line.split('|').slice(1, -1).map(cell => cell.trim());
                
                if (!inTable) {
                    inTable = true;
                    tableRows = [];
                    isFirstRow = true;
                }
                
                if (isFirstRow) {
                    tableRows.push(`<thead><tr>${cells.map(cell => `<th>${cell}</th>`).join('')}</tr></thead>`);
                    tableRows.push('<tbody>');
                    isFirstRow = false;
                } else if (line.match(/^\|[\s\-\|]+\|$/)) {
                    // Skip separator line
                    continue;
                } else {
                    tableRows.push(`<tr>${cells.map(cell => `<td>${cell}</td>`).join('')}</tr>`);
                }
            } else {
                if (inTable) {
                    // End of table
                    tableRows.push('</tbody>');
                    result.push(`<table>${tableRows.join('')}</table>`);
                    inTable = false;
                    tableRows = [];
                }
                result.push(line);
            }
        }
        
        if (inTable) {
            tableRows.push('</tbody>');
            result.push(`<table>${tableRows.join('')}</table>`);
        }
        
        return result.join('\n');
    }
    
    processParagraphs(html) {
        // Split by double newlines to identify paragraphs
        const sections = html.split(/\n\s*\n/);
        
        return sections.map(section => {
            const trimmed = section.trim();
            
            // Skip if it's already HTML (starts with <)
            if (trimmed.startsWith('<') || !trimmed) {
                return trimmed;
            }
            
            // Don't wrap list items or other block elements
            if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || 
                trimmed.startsWith('+ ') || /^\d+\./.test(trimmed) ||
                trimmed.startsWith('> ') || trimmed.startsWith('#')) {
                return trimmed;
            }
            
            return `<p>${trimmed}</p>`;
        }).join('\n\n');
    }
    
    processLineBreaks(html) {
        // Convert remaining single newlines to <br>
        return html.replace(/\n(?![\n<])/g, '<br>\n');
    }
    
    highlightCode(code, language, chapterInfo = null) {
        if (!this.extensions.codeHighlighting) {
            return this.escapeHtml(code);
        }
        
        // Don't escape HTML before highlighting - highlighting functions will handle safety
        // Only escape for non-highlighted languages
        switch (language.toLowerCase()) {
            case 'assembly':
            case 'asm':
            case 'fasm':
                return this.highlightAssembly(code, chapterInfo);
            case 'javascript':
            case 'js':
                return this.highlightJavaScript(code);
            case 'html':
                return this.highlightHTML(code);
            case 'css':
                return this.highlightCSS(code);
            default:
                return this.escapeHtml(code);
        }
    }
    
    highlightAssembly(code, chapterInfo = null) {
        // FASM/Assembly syntax highlighting with interactive features
        // First escape the raw code to prevent XSS
        let highlighted = this.escapeHtml(code);
        
        // Extended instructions list including all glossary entries
        const instructions = [
            'mov', 'add', 'sub', 'mul', 'div', 'inc', 'dec', 'cmp', 'test',
            'jmp', 'je', 'jne', 'jl', 'jle', 'jg', 'jge', 'ja', 'jb', 'jo', 'jno',
            'call', 'ret', 'push', 'pop', 'lea', 'int', 'nop',
            'and', 'or', 'xor', 'not', 'shl', 'shr', 'sal', 'sar',
            'loop', 'loope', 'loopne', 'rep', 'repe', 'repne',
            'movs', 'stos', 'scas', 'cmps', 'lods', 'imul', 'idiv', 'cdq'
        ];
        
        // Create clickable instruction links with tooltips
        instructions.forEach(instruction => {
            const regex = new RegExp(`\\b${instruction}\\b`, 'gi');
            highlighted = highlighted.replace(regex, (match) => {
                // Track usage if chapter info is available
                if (chapterInfo && window.instructionGlossary) {
                    window.instructionGlossary.addUsage(instruction.toUpperCase(), {
                        chapter: chapterInfo.id || 'unknown',
                        line: this.getCurrentLineNumber() || 0,
                        context: this.getInstructionContext(code, match)
                    });
                }
                
                return `<span class="asm-instruction clickable-instruction" 
                             data-instruction="${instruction.toUpperCase()}"
                             onclick="showInstructionTooltip(event, '${instruction.toUpperCase()}')"
                             title="Click for ${instruction.toUpperCase()} reference">${match}</span>`;
            });
        });
        
        // Registers
        const registers = [
            'eax', 'ebx', 'ecx', 'edx', 'esi', 'edi', 'esp', 'ebp',
            'rax', 'rbx', 'rcx', 'rdx', 'rsi', 'rdi', 'rsp', 'rbp',
            'ax', 'bx', 'cx', 'dx', 'si', 'di', 'sp', 'bp',
            'al', 'bl', 'cl', 'dl', 'ah', 'bh', 'ch', 'dh',
            'cs', 'ds', 'es', 'fs', 'gs', 'ss'
        ];
        
        registers.forEach(register => {
            const regex = new RegExp(`\\b${register}\\b`, 'gi');
            highlighted = highlighted.replace(regex, `<span class="asm-register">${register}</span>`);
        });
        
        // Directives
        const directives = [
            'section', 'format', 'entry', 'include', 'macro', 'endm',
            'db', 'dw', 'dd', 'dq', 'dt', 'du', 'rb', 'rw', 'rd', 'rq', 'rt',
            'data', 'code', 'readable', 'writeable', 'executable',
            'import', 'export', 'library'
        ];
        
        directives.forEach(directive => {
            const regex = new RegExp(`\\b${directive}\\b`, 'gi');
            highlighted = highlighted.replace(regex, `<span class="asm-directive">${directive}</span>`);
        });
        
        // Numbers
        highlighted = highlighted.replace(/\b\d+[hdbo]?\b/g, '<span class="asm-number">$&</span>');
        highlighted = highlighted.replace(/\b0x[0-9a-f]+\b/gi, '<span class="asm-number">$&</span>');
        
        // Comments - must come after other highlighting to avoid interfering
        highlighted = highlighted.replace(/;.*$/gm, '<span class="asm-comment">$&</span>');
        
        // Strings - IMPORTANT: Use HTML entity form to match what was escaped
        // Match &#039; (escaped single quote) instead of ' to avoid matching span class names
        highlighted = highlighted.replace(/&#039;([^&]*?)&#039;/g, '<span class="asm-string">&#039;$1&#039;</span>');
        highlighted = highlighted.replace(/&quot;([^&]*?)&quot;/g, '<span class="asm-string">&quot;$1&quot;</span>');
        
        return highlighted;
    }
    
    highlightJavaScript(code) {
        let highlighted = code;
        
        // Keywords
        const keywords = [
            'const', 'let', 'var', 'function', 'class', 'return', 'if', 'else', 'for', 'while',
            'do', 'switch', 'case', 'default', 'break', 'continue', 'try', 'catch', 'finally',
            'throw', 'new', 'this', 'super', 'extends', 'import', 'export', 'from', 'async', 'await'
        ];
        
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            highlighted = highlighted.replace(regex, `<span class="js-keyword">${keyword}</span>`);
        });
        
        // Comments
        highlighted = highlighted.replace(/\/\/.*$/gm, '<span class="js-comment">$&</span>');
        highlighted = highlighted.replace(/\/\*[\s\S]*?\*\//g, '<span class="js-comment">$&</span>');
        
        // Strings
        highlighted = highlighted.replace(/'([^'\\]|\\.)*'/g, '<span class="js-string">$&</span>');
        highlighted = highlighted.replace(/"([^"\\]|\\.)*"/g, '<span class="js-string">$&</span>');
        highlighted = highlighted.replace(/`([^`\\]|\\.)*`/g, '<span class="js-string">$&</span>');
        
        return highlighted;
    }
    
    highlightHTML(code) {
        let highlighted = code;
        
        // Tags
        highlighted = highlighted.replace(/&lt;(\/?[\w\-]+)([^&]*?)&gt;/g, 
            '<span class="html-tag">&lt;<span class="html-tag-name">$1</span>$2&gt;</span>');
        
        // Attributes
        highlighted = highlighted.replace(/([\w\-]+)=("[^"]*"|'[^']*')/g, 
            '<span class="html-attr">$1</span>=<span class="html-value">$2</span>');
        
        return highlighted;
    }
    
    highlightCSS(code) {
        let highlighted = code;
        
        // Selectors
        highlighted = highlighted.replace(/([.#]?[\w\-]+)\s*{/g, 
            '<span class="css-selector">$1</span> {');
        
        // Properties
        highlighted = highlighted.replace(/([\w\-]+)\s*:/g, 
            '<span class="css-property">$1</span>:');
        
        // Values
        highlighted = highlighted.replace(/:\s*([^;]+);/g, 
            ': <span class="css-value">$1</span>;');
        
        return highlighted;
    }
    
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        
        return text.replace(/[&<>"']/g, m => map[m]);
    }
    
    postProcess(html) {
        // Clean up extra whitespace
        html = html.replace(/\n\s*\n\s*\n+/g, '\n\n');
        
        // Add IDs to headings for linking
        html = html.replace(/<h([1-6])>(.*?)<\/h[1-6]>/g, (match, level, text) => {
            const id = text.toLowerCase()
                           .replace(/[^\w\s-]/g, '')
                           .replace(/\s+/g, '-')
                           .trim();
            return `<h${level} id="${id}">${text}</h${level}>`;
        });
        
        // Add table wrapper for responsive tables
        html = html.replace(/<table>/g, '<div class="table-wrapper"><table>');
        html = html.replace(/<\/table>/g, '</table></div>');
        
        // Add special formatting for FASM-specific content
        html = this.processFASMSpecialFormatting(html);
        
        return html;
    }
    
    processFASMSpecialFormatting(html) {
        // Exercise boxes
        html = html.replace(/^📝 \*\*(Exercise[^*]*)\*\*:/gm, 
            '<div class="exercise-box"><strong>$1:</strong>');
        html = html.replace(/(<div class="exercise-box">[\s\S]*?)(?=<div|<h[1-6]|$)/g, '$1</div>');
        
        // Example boxes
        html = html.replace(/^◯ \*\*(Example[^*]*)\*\*:/gm, 
            '<div class="example-box"><strong>$1:</strong>');
        html = html.replace(/(<div class="example-box">[\s\S]*?)(?=<div|<h[1-6]|$)/g, '$1</div>');
        
        // Tip boxes
        html = html.replace(/^◯ \*\*(Tip[^*]*)\*\*:/gm, 
            '<div class="tip-box"><strong>$1:</strong>');
        html = html.replace(/(<div class="tip-box">[\s\S]*?)(?=<div|<h[1-6]|$)/g, '$1</div>');
        
        // Warning boxes
        html = html.replace(/^⚠️ \*\*(Warning[^*]*)\*\*:/gm, 
            '<div class="warning-box"><strong>$1:</strong>');
        html = html.replace(/(<div class="warning-box">[\s\S]*?)(?=<div|<h[1-6]|$)/g, '$1</div>');
        
        return html;
    }
    
    // Utility methods
    copyCode(button) {
        const codeBlock = button.parentElement.querySelector('code');
        if (codeBlock) {
            navigator.clipboard.writeText(codeBlock.textContent).then(() => {
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.textContent = 'Copy';
                }, 2000);
            });
        }
    }
    
    // Table of contents generation
    generateTOC(html) {
        const headings = [];
        const headingRegex = /<h([1-6])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h[1-6]>/g;
        let match;
        
        while ((match = headingRegex.exec(html)) !== null) {
            headings.push({
                level: parseInt(match[1]),
                id: match[2],
                text: match[3].replace(/<[^>]+>/g, ''), // Strip HTML tags
                element: match[0]
            });
        }
        
        return headings;
    }
    
    // Search functionality
    searchInContent(html, query) {
        const results = [];
        const searchRegex = new RegExp(query, 'gi');
        const sentences = html.split(/[.!?]+/);
        
        sentences.forEach((sentence, index) => {
            if (searchRegex.test(sentence)) {
                const contextStart = Math.max(0, index - 1);
                const contextEnd = Math.min(sentences.length - 1, index + 1);
                const context = sentences.slice(contextStart, contextEnd + 1).join('. ');
                
                results.push({
                    context: context.replace(/<[^>]+>/g, '').trim(),
                    sentence: sentence.replace(/<[^>]+>/g, '').trim(),
                    index: index
                });
            }
        });
        
        return results;
    }
    
    // Helper methods for instruction tracking
    getCurrentLineNumber() {
        // This would need to be implemented based on parsing context
        return Math.floor(Math.random() * 1000); // Placeholder
    }
    
    getInstructionContext(code, instruction) {
        // Extract a few characters around the instruction for context
        const index = code.indexOf(instruction);
        if (index === -1) return instruction;
        
        const start = Math.max(0, index - 20);
        const end = Math.min(code.length, index + instruction.length + 20);
        return code.substring(start, end).trim();
    }
    
    setCurrentChapter(chapterInfo) {
        this.currentChapter = chapterInfo;
    }
}

// Global helper functions for code interaction
function copyCodeToClipboard(button) {
    const codeBlock = button.closest('.code-block').querySelector('code');
    if (codeBlock) {
        // Get plain text without HTML tags
        const text = codeBlock.textContent || codeBlock.innerText;
        navigator.clipboard.writeText(text).then(() => {
            const originalText = button.textContent;
            button.textContent = '✓';
            setTimeout(() => {
                button.textContent = originalText;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy code:', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            button.textContent = '✓';
            setTimeout(() => {
                button.textContent = '⧉';
            }, 2000);
        });
    }
}

function downloadCodeSnippet(button) {
    const codeBlock = button.closest('.code-block').querySelector('code');
    const languageElement = button.closest('.code-block').querySelector('.code-language');
    
    if (codeBlock) {
        // Get plain text without HTML tags
        const text = codeBlock.textContent || codeBlock.innerText;
        const language = languageElement ? languageElement.textContent.toLowerCase() : 'assembly';
        
        // Determine file extension based on language
        let extension = 'asm';
        if (language.includes('assembly') || language.includes('asm') || language.includes('fasm')) {
            extension = 'asm';
        } else if (language.includes('javascript') || language.includes('js')) {
            extension = 'js';
        } else if (language.includes('html')) {
            extension = 'html';
        } else if (language.includes('css')) {
            extension = 'css';
        } else {
            extension = 'txt';
        }
        
        // Generate filename with timestamp
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
        const filename = `code-snippet-${timestamp}.${extension}`;
        
        try {
            // Create blob and download
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            // Create temporary download link
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = filename;
            downloadLink.style.display = 'none';
            
            // Trigger download
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            // Clean up
            URL.revokeObjectURL(url);
            
            // Update button text temporarily
            const originalText = button.textContent;
            button.textContent = '✓ Downloaded';
            setTimeout(() => {
                button.textContent = originalText;
            }, 2000);
            
        } catch (error) {
            console.error('Failed to download code:', error);
            
            // Fallback: show the text in a new window
            const newWindow = window.open('', '_blank');
            if (newWindow) {
                newWindow.document.write(`<pre>${text}</pre>`);
                newWindow.document.title = filename;
            }
            
            const originalText = button.textContent;
            button.textContent = '✓ Downloaded';
            setTimeout(() => {
                button.textContent = originalText;
            }, 2000);
        }
    }
}

function showInstructionTooltip(event, instruction) {
    event.preventDefault();
    event.stopPropagation();
    
    // Remove any existing tooltip
    hideInstructionTooltip();
    
    if (!window.instructionGlossary) {
        console.warn('Instruction glossary not loaded');
        return;
    }
    
    const tooltipHTML = window.instructionGlossary.generateTooltipHTML(instruction);
    if (!tooltipHTML) {
        console.warn(`No glossary entry found for instruction: ${instruction}`);
        return;
    }
    
    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'instruction-tooltip-popup';
    tooltip.innerHTML = tooltipHTML;
    
    // Position tooltip near the clicked instruction
    const rect = event.target.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    // Initial positioning
    tooltip.style.position = 'absolute';
    tooltip.style.left = (rect.left + scrollLeft) + 'px';
    tooltip.style.top = (rect.bottom + scrollTop + 5) + 'px';
    tooltip.style.zIndex = '10000';
    
    document.body.appendChild(tooltip);
    
    // Adjust position if tooltip goes off screen
    const tooltipRect = tooltip.getBoundingClientRect();
    if (tooltipRect.right > window.innerWidth) {
        tooltip.style.left = (window.innerWidth - tooltipRect.width - 10) + 'px';
    }
    if (tooltipRect.bottom > window.innerHeight) {
        tooltip.style.top = (rect.top + scrollTop - tooltipRect.height - 5) + 'px';
    }
    
    // Add click outside to close
    setTimeout(() => {
        document.addEventListener('click', hideInstructionTooltip, { once: true });
    }, 10);
}

function hideInstructionTooltip() {
    const tooltip = document.querySelector('.instruction-tooltip-popup');
    if (tooltip) {
        tooltip.remove();
    }
}

function scrollToLine(lineNumber) {
    // Try to scroll to specific line by looking for code blocks and context
    console.log(`Scrolling to line ${lineNumber}`);
    
    const contentElement = document.getElementById('chapter-content');
    if (!contentElement) return;
    
    // Find all code blocks and try to match line numbers
    const codeBlocks = contentElement.querySelectorAll('pre code');
    
    if (codeBlocks.length > 0) {
        // For now, scroll to the first code block as an approximation
        const firstCodeBlock = codeBlocks[0];
        firstCodeBlock.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
        
        // Highlight the code block temporarily
        firstCodeBlock.style.outline = '2px solid #007acc';
        firstCodeBlock.style.backgroundColor = 'rgba(0, 122, 204, 0.1)';
        
        setTimeout(() => {
            firstCodeBlock.style.outline = '';
            firstCodeBlock.style.backgroundColor = '';
        }, 3000);
    }
}

// Global function for glossary search
function searchInstructions(query) {
    const glossaryList = document.getElementById('glossary-list');
    if (!glossaryList || !window.instructionGlossary) return;
    
    glossaryList.innerHTML = '';
    
    let instructions;
    if (query.trim() === '') {
        // Show all instructions when no search query
        instructions = window.instructionGlossary.getAllInstructions();
    } else {
        // Search for matching instructions
        instructions = window.instructionGlossary.searchInstructions(query);
    }
    
    instructions.forEach(instruction => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.onclick = (e) => {
            e.preventDefault();
            if (window.fasmEbook) {
                window.fasmEbook.showInstructionDetails(instruction.mnemonic);
            }
        };
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = instruction.mnemonic;
        a.appendChild(nameSpan);
        
        const categorySpan = document.createElement('span');
        categorySpan.className = 'instruction-category-badge';
        categorySpan.textContent = instruction.category.substr(0, 4).toUpperCase();
        a.appendChild(categorySpan);
        
        li.appendChild(a);
        glossaryList.appendChild(li);
    });
    
    // Show "no results" message if no matches
    if (instructions.length === 0 && query.trim() !== '') {
        const li = document.createElement('li');
        li.textContent = 'No instructions found';
        li.style.color = '#666';
        li.style.fontStyle = 'italic';
        li.style.textAlign = 'center';
        li.style.padding = '1rem';
        glossaryList.appendChild(li);
    }
}

// CSS for syntax highlighting
const syntaxHighlightingCSS = `
/* Assembly syntax highlighting */
.asm-instruction { color: #0066cc; font-weight: bold; }
.asm-register { color: #cc6600; font-weight: bold; }
.asm-directive { color: #9900cc; font-weight: bold; }
.asm-number { color: #cc0000; }
.asm-comment { color: #666666; font-style: italic; }
.asm-string { color: #009900; }

/* JavaScript syntax highlighting */
.js-keyword { color: #0066cc; font-weight: bold; }
.js-comment { color: #666666; font-style: italic; }
.js-string { color: #009900; }

/* HTML syntax highlighting */
.html-tag { color: #0066cc; }
.html-tag-name { color: #cc6600; font-weight: bold; }
.html-attr { color: #cc0000; }
.html-value { color: #009900; }

/* CSS syntax highlighting */
.css-selector { color: #0066cc; font-weight: bold; }
.css-property { color: #cc6600; }
.css-value { color: #009900; }

/* Table wrapper for responsive tables */
.table-wrapper {
    overflow-x: auto;
    margin: 1rem 0;
}

.table-wrapper table {
    min-width: 100%;
}

/* Dark mode syntax highlighting */
.dark-mode .asm-instruction { color: #4da6ff; }
.dark-mode .asm-register { color: #ffb84d; }
.dark-mode .asm-directive { color: #cc66ff; }
.dark-mode .asm-number { color: #ff6666; }
.dark-mode .asm-comment { color: #999999; }
.dark-mode .asm-string { color: #66ff66; }

.dark-mode .js-keyword { color: #4da6ff; }
.dark-mode .js-comment { color: #999999; }
.dark-mode .js-string { color: #66ff66; }

.dark-mode .html-tag { color: #4da6ff; }
.dark-mode .html-tag-name { color: #ffb84d; }
.dark-mode .html-attr { color: #ff6666; }
.dark-mode .html-value { color: #66ff66; }

.dark-mode .css-selector { color: #4da6ff; }
.dark-mode .css-property { color: #ffb84d; }
.dark-mode .css-value { color: #66ff66; }
`;

// Add CSS to document
const syntaxStyle = document.createElement('style');
syntaxStyle.textContent = syntaxHighlightingCSS;
document.head.appendChild(syntaxStyle);

// Make the copy function globally available
window.copyCode = function(button) {
    const parser = new FASMMarkdownParser();
    parser.copyCode(button);
};

// Export for use in other modules
window.FASMMarkdownParser = FASMMarkdownParser;