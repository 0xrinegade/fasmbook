# FASM eBook Development Quick Reference

## Configuration Usage

```javascript
// Get values (supports dot notation)
const port = fasmeBookConfig.get('server.defaultPort');
const browser = fasmeBookConfig.get('testing.defaultBrowser');
const maxSize = fasmeBookConfig.get('artifacts.maxSizeMB');

// Environment-aware values
const timeout = fasmeBookConfig.get('server.timeout'); // Auto-adjusts for CI/dev/prod

// Path helpers
const chapterPath = fasmeBookConfig.getPath('preface.md', fasmeBookConfig.get('paths.chapters'));
```

## Markdown Parsing

```javascript
const parser = new MarkdownParser();

// Parse code blocks
const blocks = parser.parseCodeBlocks(markdown, { id: 'chapter1' });
blocks.forEach(block => {
    console.log(`${block.language} block: ${block.lineCount} lines`);
});

// Platform detection
const platforms = parser.detectPlatformSpecificCode(markdown);
console.log('Windows APIs found:', platforms.windows.indicators);

// Instruction analysis
const instructions = ['mov', 'add', 'jmp', 'call'];
const usage = parser.analyzeInstructionUsage(markdown, instructions);
```

## Script Usage

### Enhanced Test Runner
```bash
# Quick smoke tests
./run-tests.sh quick chromium

# Full test suite with specific browser
./run-tests.sh full firefox

# Mobile-only testing
./run-tests.sh mobile

# Cross-browser testing
./run-tests.sh cross-browser

# Show help
./run-tests.sh --help
```

### Advanced Port Cleanup
```bash
# Basic cleanup
./scripts/cleanup-port.sh 8081

# Verbose mode with custom wait time
./scripts/cleanup-port.sh --verbose --wait 10 8081

# Force kill without waiting
./scripts/cleanup-port.sh --force 3000

# Show usage
./scripts/cleanup-port.sh --help
```

## Error Handling Patterns

```javascript
// Configuration with fallbacks
const timeout = fasmeBookConfig.get('server.timeout', 120000);

// Markdown parsing with error recovery
try {
    const blocks = parser.parseCodeBlocks(markdown, context);
    // Process blocks
} catch (error) {
    console.error('Parser error:', error);
    // Fallback to simple processing
    this.fallbackScanMarkdown(markdown, context);
}

// File operations with retries
async function loadWithRetry(url, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url);
            if (response.ok) return response;
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}
```

## CI/CD Best Practices

### Artifact Management
- Use selective uploads for normal runs
- Full artifacts only on failure
- Compress large files automatically
- Set appropriate retention periods

### Error Recovery
- Always include cleanup steps
- Use proper exit codes
- Implement retry mechanisms
- Log debugging information

### Performance Optimization
- Cache dependencies between runs
- Parallelize independent operations
- Use environment-specific timeouts
- Monitor artifact sizes

## Debugging

### Enable Debug Mode
```bash
# Browser with debug query parameter
http://localhost:8081?debug=1

# Test runner with verbose output
DEBUG=1 ./run-tests.sh core chromium

# Enhanced logging in scripts
VERBOSE=1 ./scripts/cleanup-port.sh 8081
```

### Common Issues

1. **Port Conflicts**
   ```bash
   ./scripts/cleanup-port.sh --verbose 8081
   ```

2. **Configuration Errors**
   ```javascript
   const errors = fasmeBookConfig.validate();
   console.log('Config errors:', errors);
   ```

3. **Markdown Parsing Issues**
   ```javascript
   const parser = new MarkdownParser();
   const blocks = parser.parseCodeBlocks(markdown, { id: 'debug' });
   // Check parser errors in browser console
   ```

4. **Test Failures**
   ```bash
   # Generate detailed report
   ./run-tests.sh report
   
   # Check specific browser
   ./run-tests.sh quick firefox
   ```

## Performance Monitoring

### Configuration Values
```javascript
// Performance thresholds
fasmeBookConfig.get('performance.maxLoadTime');        // 3000ms
fasmeBookConfig.get('performance.maxFirstContentfulPaint'); // 1500ms
fasmeBookConfig.get('accessibility.minColorContrast');      // 4.5
```

### Measurement Examples
```javascript
// Measure load time
const startTime = performance.now();
await loadChapter('chapter1');
const loadTime = performance.now() - startTime;

if (loadTime > fasmeBookConfig.get('performance.maxLoadTime')) {
    console.warn('Slow chapter load:', loadTime);
}
```

## Security Considerations

### Input Validation
```javascript
// Port validation
const port = parseInt(userInput);
if (port < 1 || port > 65535) {
    throw new Error('Invalid port range');
}

// Path sanitization
const safePath = userPath.replace(/\.\./g, '').replace(/[<>:"|?*]/g, '');
```

### Configuration Security
```javascript
// Security settings
fasmeBookConfig.get('security.enableCSP');          // true
fasmeBookConfig.get('security.sanitizeUserInput');  // true
fasmeBookConfig.get('security.maxFileUploadSize');  // 10MB
```

## Development Workflow

1. **Start Development Server**
   ```bash
   node server.js --port 8000
   ```

2. **Run Quick Tests**
   ```bash
   ./run-tests.sh quick
   ```

3. **Check Configuration**
   ```javascript
   console.log(fasmeBookConfig.getAll());
   ```

4. **Verify Markdown Parsing**
   ```bash
   node -e "const parser = require('./js/markdown-parser.js'); console.log('✅ Parser ready');"
   ```

5. **Clean Environment**
   ```bash
   ./scripts/cleanup-port.sh --verbose 8000 8081
   ```

This quick reference provides the essential commands and patterns for working with the enhanced FASM eBook codebase.