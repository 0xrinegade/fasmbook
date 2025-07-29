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
            const highlightedCode = this.highlightCode(code.trim(), lang);
            
            return `<div class="code-block">
                <pre><code class="language-${lang}">${highlightedCode}</code></pre>
                <button class="code-copy" onclick="this.copyCode(this)">Copy</button>
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
    
    highlightCode(code, language) {
        if (!this.extensions.codeHighlighting) {
            return this.escapeHtml(code);
        }
        
        const escapedCode = this.escapeHtml(code);
        
        switch (language.toLowerCase()) {
            case 'assembly':
            case 'asm':
            case 'fasm':
                return this.highlightAssembly(escapedCode);
            case 'javascript':
            case 'js':
                return this.highlightJavaScript(escapedCode);
            case 'html':
                return this.highlightHTML(escapedCode);
            case 'css':
                return this.highlightCSS(escapedCode);
            default:
                return escapedCode;
        }
    }
    
    highlightAssembly(code) {
        // FASM/Assembly syntax highlighting
        let highlighted = code;
        
        // Instructions
        const instructions = [
            'mov', 'add', 'sub', 'mul', 'div', 'inc', 'dec', 'cmp', 'test',
            'jmp', 'je', 'jne', 'jl', 'jle', 'jg', 'jge', 'ja', 'jb', 'jo', 'jno',
            'call', 'ret', 'push', 'pop', 'lea', 'int', 'nop',
            'and', 'or', 'xor', 'not', 'shl', 'shr', 'sal', 'sar',
            'loop', 'loope', 'loopne', 'rep', 'repe', 'repne',
            'movs', 'stos', 'scas', 'cmps', 'lods'
        ];
        
        instructions.forEach(instruction => {
            const regex = new RegExp(`\\b${instruction}\\b`, 'gi');
            highlighted = highlighted.replace(regex, `<span class="asm-instruction">${instruction}</span>`);
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
        
        // Comments
        highlighted = highlighted.replace(/;.*$/gm, '<span class="asm-comment">$&</span>');
        
        // Strings
        highlighted = highlighted.replace(/'([^']*?)'/g, '<span class="asm-string">\'$1\'</span>');
        highlighted = highlighted.replace(/"([^"]*?)"/g, '<span class="asm-string">"$1"</span>');
        
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
        html = html.replace(/^💡 \*\*(Example[^*]*)\*\*:/gm, 
            '<div class="example-box"><strong>$1:</strong>');
        html = html.replace(/(<div class="example-box">[\s\S]*?)(?=<div|<h[1-6]|$)/g, '$1</div>');
        
        // Tip boxes
        html = html.replace(/^💡 \*\*(Tip[^*]*)\*\*:/gm, 
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