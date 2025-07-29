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
│   ├── storage.js          # Data persistence layer
│   ├── ai-helper.js        # AI assistant features
│   ├── drawing.js          # Drawing and annotation tools
│   ├── settings.js         # Settings management
│   ├── navigation.js       # Navigation utilities
│   └── markdown.js         # Content parsing and highlighting
├── chapters/
│   ├── index.json          # Chapter metadata
│   ├── preface.md          # Book preface
│   └── chapter*.md         # Individual chapter files
└── assets/
    └── favicon.svg         # Book icon
```

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