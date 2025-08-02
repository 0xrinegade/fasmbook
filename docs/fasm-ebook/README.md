# FASM Programming eBook

A comprehensive, interactive eBook for learning FASM (Flat Assembler) programming, designed with eInk device support and professional reading features.

## Features

### 📖 **Professional eBook Experience**
- Clean, paper-like interface optimized for eInk devices (reMarkable, Kindle, etc.)
- Responsive design that works on all screen sizes
- Customizable font size, line height, and display modes
- Progress tracking and reading statistics
- Bookmark system with quick access
- Reading history with chapter navigation

### ✏️ **Drawing & Annotation Support**
- Full drawing support with pressure-sensitive stylus input
- Drawing tools with adjustable brush size and color
- Note-taking capabilities directly on pages
- Annotation persistence across reading sessions
- Export drawings and notes

### 🤖 **Built-in AI Assistant**
- FASM programming expert that can answer questions
- Context-aware help based on current chapter
- Code examples and debugging assistance
- Floating assistant window that doesn't interfere with reading
- Conversation history and learning progression

### 🔍 **Advanced Navigation**
- Keyboard shortcuts for efficient navigation
- Touch gestures (swipe to turn pages)
- Quick search functionality
- Go-to-page dialog
- Table of contents with progress indicators
- Chapter-based organization

### ⚙️ **Customizable Settings**
- Multiple display modes (eInk, Standard, Dark)
- Typography controls (font size, line height)
- Reading preferences and goals
- Data export/import functionality
- Advanced settings for power users

## Getting Started

### Opening the eBook

1. Open `index.html` in a web browser
2. For best experience on eInk devices, enable eInk mode in settings
3. Use the navigation panel to browse chapters

### Troubleshooting

#### If the page keeps reloading:
1. **Check JavaScript**: Make sure JavaScript is enabled in your browser
2. **Clear Cache**: Clear your browser cache and cookies for this site
3. **Try Debug Mode**: Add `?debug=1` to the URL to see detailed loading information
4. **Browser Console**: Open developer tools (F12) and check the console for error messages
5. **Different Browser**: Try opening in a different browser (Chrome, Firefox, Safari)

#### Common Issues:
- **Blank Page**: Wait a few seconds for content to load, or try refreshing once
- **Missing Chapters**: Ensure all files are properly uploaded and accessible
- **Navigation Issues**: Try using keyboard arrows or the table of contents
- **eInk Display**: Enable eInk mode in settings for better contrast

#### Debug Information:
- Visit the page with `?debug=1` parameter for detailed logging
- Check the browser console (F12) for any error messages
- Verify network requests are completing successfully

### For Developers

#### Local Development:
```bash
# Start local server
node server.js
# Visit http://localhost:8000

# For testing (port 8081)
node server.js --port 8081
```

#### Deployment:
- The eBook is designed to work on GitHub Pages
- All resources use relative paths for portability
- Service worker registration is optional and will fail gracefully

### Browser Compatibility

- **Recommended**: Chrome, Firefox, Safari (latest versions)
- **eInk Devices**: Optimized for reMarkable, Kindle browsers
- **Mobile**: Full responsive support for phones and tablets
- **Offline**: Service worker enables offline reading when available
4. Customize reading preferences in the settings panel

### Navigation

**Keyboard Shortcuts:**
- `←` / `H` - Previous page
- `→` / `L` - Next page  
- `↑` / `K` - Scroll up
- `↓` / `J` - Scroll down
- `Ctrl+B` - Toggle bookmark
- `Ctrl+F` - Search
- `Ctrl+G` - Go to page
- `/` - Quick search
- `?` - Show keyboard shortcuts

**Touch Gestures:**
- Swipe left - Next page
- Swipe right - Previous page
- Double tap - Add bookmark
- Pinch to zoom (if supported)

### Drawing Mode

1. Click the settings gear icon
2. Enable "Drawing Mode"
3. Use the drawing tools that appear
4. Draw directly on the page with mouse, finger, or stylus
5. Drawings are automatically saved and restored

### AI Assistant

1. Click the robot icon in the bottom right
2. Ask questions about FASM programming
3. Get explanations, code examples, and debugging help
4. The assistant understands the context of your current chapter

## Chapter Structure

The eBook contains:

- **Preface** - Introduction and book overview
- **Chapter 1** - Welcome to the Machine
- **Chapter 2** - Learning to Speak FASM  
- **Chapter 4** - The Instruction Cookbook
- **Chapter 5** - Registers - Your Digital Toolkit
- **Chapter 6** - Program Flow - The Story Your Code Tells

Each chapter includes:
- Comprehensive explanations and examples
- Production-ready code samples
- Exercises and practice problems
- Cross-references and navigation aids

## Technical Features

### eInk Optimization
- High contrast, black and white interface
- No animations or transitions that cause screen flicker
- Optimized font rendering and spacing
- Large touch targets for stylus interaction
- Minimal refresh requirements

### Data Persistence
- All settings, bookmarks, and notes stored locally
- Reading progress automatically saved
- Drawing data persisted across sessions
- Import/export functionality for data backup

### Performance
- Lazy loading of content
- Efficient memory usage
- Optimized for low-power devices
- Offline-capable design

## Browser Support

- **Desktop**: Chrome, Firefox, Safari, Edge
- **Mobile**: iOS Safari, Chrome Mobile, Samsung Internet
- **eInk Devices**: Browsers supporting basic HTML5/CSS3
- **Kindle**: Experimental WebKit browser
- **reMarkable**: Built-in browser with stylus support

## File Structure

```
fasm-ebook/
├── index.html              # Main eBook interface
├── styles/
│   ├── main.css            # Core styling
│   ├── ebook.css           # eBook-specific enhancements
│   └── eink.css            # eInk device optimizations
├── js/
│   ├── main.js             # Core eBook functionality
│   ├── config.js           # Configuration management system
│   ├── markdown-parser.js  # Robust markdown parsing
│   ├── storage.js          # Data persistence layer
│   ├── ai-helper.js        # AI assistant features
│   ├── drawing.js          # Drawing and annotation tools
│   ├── settings.js         # Settings management
│   ├── navigation.js       # Navigation utilities
│   └── markdown.js         # Content parsing and highlighting
├── scripts/
│   └── cleanup-port.sh     # Enhanced port cleanup utility
├── tests/                  # Comprehensive E2E test suite
├── chapters/
│   ├── index.json          # Chapter metadata
│   ├── preface.md          # Book preface
│   └── chapter*.md         # Individual chapter files
├── assets/
│   └── favicon.svg         # Book icon
├── test-config.json        # Test configuration
├── run-tests.sh           # Enhanced test runner
├── TECHNICAL_DEBT_IMPROVEMENTS.md  # Technical documentation
└── DEVELOPMENT_REFERENCE.md        # Developer quick reference
```

## Technical Improvements

The FASM eBook includes comprehensive technical debt improvements for enhanced reliability and maintainability:

### 🛠️ **Robust Infrastructure**
- **Enhanced Error Handling**: Strict error checking (`set -euo pipefail`) with graceful recovery
- **Configuration Management**: Centralized config system with environment-specific overrides
- **Robust Markdown Parsing**: AST-based parsing replacing fragile regex patterns
- **Cross-Platform Compatibility**: Support for Linux, macOS, and Windows development

### 🔧 **Development Tools**
- **Enhanced Test Runner**: Comprehensive E2E testing with 80+ test cases
- **Smart Port Cleanup**: Cross-platform port management with multiple tool support
- **Artifact Optimization**: Selective uploads with compression and size limits
- **Input Validation**: Comprehensive validation for all user inputs and configurations

### 📊 **Quality Assurance**
- **Performance Monitoring**: Core Web Vitals tracking and optimization
- **Accessibility Testing**: WCAG 2.1 AA compliance validation
- **Cross-Browser Testing**: Chrome, Firefox, Safari with mobile variants
- **Visual Regression Testing**: UI consistency validation across devices

### 📚 **Documentation**
- **Technical Documentation**: Comprehensive improvement guides
- **Developer Reference**: Quick reference for common tasks
- **Configuration Guide**: Complete configuration system documentation

For detailed information, see:
- [`TECHNICAL_DEBT_IMPROVEMENTS.md`](TECHNICAL_DEBT_IMPROVEMENTS.md) - Complete technical overview
- [`DEVELOPMENT_REFERENCE.md`](DEVELOPMENT_REFERENCE.md) - Developer quick reference

## Customization

### Adding Chapters
1. Create new markdown files in `chapters/`
2. Update `chapters/index.json` with chapter metadata
3. The eBook will automatically include new chapters

### Styling
- Modify CSS files in `styles/` directory
- Use CSS custom properties for consistent theming
- eInk-specific styles are in `eink.css`

### Functionality
- Core features implemented in modular JavaScript files
- Each component is self-contained and configurable
- Storage layer supports data import/export

## Development

The eBook is built with vanilla HTML, CSS, and JavaScript for maximum compatibility and performance on low-power devices.

### Key Technologies
- **HTML5** - Semantic structure and modern features
- **CSS3** - Advanced styling with custom properties
- **Vanilla JavaScript** - No framework dependencies
- **LocalStorage** - Client-side data persistence
- **Canvas API** - Drawing and annotation features
- **Web APIs** - Fullscreen, clipboard, file handling

### Architecture
- Modular component design
- Event-driven architecture
- Responsive and accessible interface
- Progressive enhancement approach

### Development Server

The eBook includes a Node.js-based development server for local testing:

```bash
# Start development server (default port 8000)
node server.js

# Start on custom port
node server.js --port 8081

# Using npm scripts
npm run serve         # Port 8000
npm run serve:test   # Port 8081
```

### Testing

Comprehensive E2E testing with Playwright ensures quality across all browsers and devices:

```bash
# Install dependencies
npm install

# Run different test suites
./run-tests.sh quick      # Basic functionality tests
./run-tests.sh core       # Essential features (AI, settings, navigation)
./run-tests.sh visual     # UI and responsive design tests
./run-tests.sh quality    # Performance and accessibility validation
./run-tests.sh mobile     # Mobile-specific testing
./run-tests.sh full       # Complete test suite (80+ test cases)

# Cross-browser testing
./run-tests.sh core firefox
./run-tests.sh full webkit
```

#### Port Management

If you encounter port conflicts during testing:

```bash
# Clean up processes on port 8081
./scripts/cleanup-port.sh 8081

# Or manually
fuser -k 8081/tcp || true
```

The Playwright configuration automatically handles server startup and port reuse to prevent conflicts in CI/CD environments.

## License

This eBook implementation is part of the KolibriOS documentation project. The content and code are available under the same license as the KolibriOS project.

## Contributing

Contributions welcome! Areas for improvement:
- Additional chapter content
- Enhanced drawing tools
- Advanced search features
- Mobile responsiveness
- Accessibility improvements
- Performance optimizations

---

*Happy learning with FASM! 🚀*