# FASM eBook E2E Testing Documentation

## Overview

This comprehensive end-to-end testing suite ensures the FASM Programming eBook functions correctly across all devices, browsers, and use cases. The tests cover functionality, performance, accessibility, and user experience.

## Test Structure

### Test Categories

1. **Basic Functionality** (`basic-functionality.spec.js`)
   - Page loading and initialization
   - Navigation and table of contents
   - Chapter loading and content display
   - Reading progress tracking
   - Error handling

2. **AI Assistant** (`ai-assistant.spec.js`)
   - Toggle button functionality
   - Click vs drag detection
   - Window dragging and positioning
   - Chat functionality
   - Viewport boundary constraints
   - Position persistence

3. **Settings Panel** (`settings-panel.spec.js`)
   - Panel opening/closing
   - Display mode switching
   - Font size and line height adjustment
   - Drawing mode toggle
   - PWA install button
   - Zen mode functionality
   - Settings persistence

4. **Drawing Tools** (`drawing-tools.spec.js`)
   - Canvas initialization
   - Drawing operations
   - Brush size and color changes
   - Drawing library management
   - Save/load functionality
   - Undo/redo operations

5. **Content Features** (`content-features.spec.js`)
   - Instruction tooltips
   - Code syntax highlighting
   - Copy functionality
   - Instruction glossary
   - Reading progress
   - Bookmarks and history
   - Search functionality

6. **Responsive Design** (`responsive-design.spec.js`)
   - Multiple viewport testing
   - Mobile/tablet/desktop layouts
   - Touch target sizes
   - Orientation changes
   - Window resize handling
   - Content adaptation

7. **Performance & Accessibility** (`performance-accessibility.spec.js`)
   - Core Web Vitals measurement
   - Semantic HTML structure
   - Keyboard navigation
   - Screen reader compatibility
   - Color contrast checking
   - Reduced motion support
   - Zoom support (up to 200%)

8. **PWA Features** (`pwa-features.spec.js`)
   - Manifest validation
   - Service worker registration
   - Install prompt functionality
   - Offline functionality
   - Asset caching
   - App-like navigation
   - Data persistence

## Running Tests

### Prerequisites

```bash
# Install Node.js 18+
# Install Python 3.8+
cd docs/fasm-ebook
npm install
npx playwright install
```

### Test Execution

#### Quick Test Suite
```bash
./run-tests.sh quick
```

#### Core Features
```bash
./run-tests.sh core
```

#### Full Test Suite
```bash
./run-tests.sh full
```

#### Cross-Browser Testing
```bash
./run-tests.sh cross-browser
```

#### Mobile Testing
```bash
./run-tests.sh mobile
```

#### Specific Browser
```bash
./run-tests.sh full firefox
./run-tests.sh core webkit
```

### Test Modes

| Mode | Description | Tests Included |
|------|-------------|----------------|
| `quick` | Basic functionality only | basic-functionality |
| `core` | Essential features | basic, ai-assistant, settings |
| `visual` | UI and responsive tests | responsive-design, drawing-tools |
| `quality` | Performance and accessibility | performance-accessibility, pwa |
| `mobile` | Mobile-specific testing | All tests on mobile browsers |
| `cross-browser` | Multi-browser testing | Core tests on all browsers |
| `full` | Complete test suite | All test categories |

## Browser Coverage

### Desktop Browsers
- **Chromium** (Google Chrome)
- **Firefox** (Mozilla Firefox)
- **WebKit** (Safari)

### Mobile Browsers
- **Mobile Chrome** (Android)
- **Mobile Safari** (iOS)

### Tablet Testing
- **iPad Pro** (Safari)

## Continuous Integration

### GitHub Actions Workflow

The CI pipeline runs automatically on:
- Push to main/develop branches
- Pull requests
- Daily scheduled runs (2 AM UTC)
- Manual workflow dispatch

### Test Jobs

1. **E2E Tests** - Core functionality across browsers
2. **Mobile Tests** - Mobile-specific testing
3. **Accessibility Tests** - A11y and performance validation
4. **Visual Regression** - UI consistency testing

### Artifacts

- HTML test reports
- JSON test results
- JUnit XML (for CI integration)
- Screenshots on failure
- Performance metrics

## Test Data and Fixtures

### Test Helpers

The `test-helpers.js` module provides utilities for:
- Page initialization waiting
- Element interaction helpers
- Performance measurement
- Accessibility testing
- Mock data generation

### Device Configurations

Predefined viewport sizes for testing:
- Mobile: 375×667
- Tablet: 768×1024
- Desktop: 1280×720
- Ultrawide: 1920×1080

## Writing New Tests

### Test Structure Example

```javascript
import { test, expect } from '@playwright/test';
import { TestHelpers } from './test-helpers.js';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await TestHelpers.waitForEBookInit(page);
  });

  test('should do something', async ({ page }) => {
    // Test implementation
  });
});
```

### Best Practices

1. **Use page objects** for complex interactions
2. **Wait for elements** before interacting
3. **Test error states** and edge cases
4. **Include accessibility checks**
5. **Test responsive behavior**
6. **Verify persistence** of user data
7. **Handle async operations** properly

### Common Patterns

```javascript
// Wait for dynamic content
await page.waitForSelector('#content', { timeout: 10000 });

// Check viewport boundaries
const isWithinBounds = await TestHelpers.isWithinViewport(page, element);

// Test drag and drop
await TestHelpers.dragElement(page, element, 100, 50);

// Measure performance
const metrics = await TestHelpers.measurePerformance(page);
```

## Debugging Tests

### Local Development

```bash
# Run tests in headed mode
./run-tests.sh full chromium --headed

# Debug mode (step through tests)
npx playwright test --debug

# UI mode (interactive debugging)
npx playwright test --ui
```

### Test Reports

```bash
# View HTML report
npx playwright show-report

# Generate and serve report
./run-tests.sh report
```

### Screenshots and Videos

Failed tests automatically capture:
- Screenshots at failure point
- Video recordings (on retry)
- Full page screenshots
- Console error logs

## Performance Benchmarks

### Target Metrics

- **Largest Contentful Paint**: < 2.5s
- **First Contentful Paint**: < 1.8s
- **Content Load Time**: < 3s
- **Time to Interactive**: < 5s

### Accessibility Standards

- **WCAG 2.1 AA** compliance
- **Color contrast**: 4.5:1 minimum
- **Keyboard navigation**: Full support
- **Screen reader**: Compatible
- **Focus management**: Proper trapping

## Maintenance

### Regular Tasks

1. **Update browser versions** monthly
2. **Review test coverage** quarterly
3. **Performance baseline** updates
4. **Accessibility audit** semi-annually

### Dependencies

- Playwright: Latest stable version
- Node.js: LTS version
- Python: 3.8+ for development server

### Environment Variables

```bash
# Test configuration
PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
CI=true  # For CI environment detection
DEBUG=pw:api  # For debug output
```

## Troubleshooting

### Common Issues

1. **Test timeouts**: Increase timeout values for slow operations
2. **Element not found**: Add proper wait conditions
3. **Flaky tests**: Add stability waits and retry logic
4. **Browser crashes**: Check memory usage and system resources

### Debug Commands

```bash
# Verbose test output
npx playwright test --reporter=verbose

# Run specific test file
npx playwright test tests/ai-assistant.spec.js

# Run single test
npx playwright test -g "should open AI assistant"
```

## Contributing

### Adding New Tests

1. Create test file in `tests/` directory
2. Follow naming convention: `feature-name.spec.js`
3. Include comprehensive test coverage
4. Add documentation and examples
5. Update CI configuration if needed

### Test Review Checklist

- [ ] Tests cover happy path and edge cases
- [ ] Accessibility checks included
- [ ] Responsive behavior tested
- [ ] Performance implications considered
- [ ] Error handling validated
- [ ] Documentation updated