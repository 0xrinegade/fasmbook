#!/bin/bash

# FASM eBook E2E Test Runner
# Comprehensive testing script for the FASM Programming eBook

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 FASM eBook E2E Test Suite${NC}"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 16+ to continue.${NC}"
    exit 1
fi

# Check if Python is available for serving
if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python is not installed. Please install Python to serve the application.${NC}"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Install Playwright browsers if needed
echo -e "${YELLOW}🌐 Installing Playwright browsers...${NC}"
npx playwright install

# Function to run tests with specific configuration
run_test_suite() {
    local suite_name="$1"
    local test_pattern="$2"
    local browser="$3"
    local extra_args="$4"
    
    echo -e "${BLUE}🧪 Running $suite_name tests on $browser...${NC}"
    
    if npx playwright test $test_pattern --project="$browser" $extra_args; then
        echo -e "${GREEN}✅ $suite_name tests passed on $browser${NC}"
        return 0
    else
        echo -e "${RED}❌ $suite_name tests failed on $browser${NC}"
        return 1
    fi
}

# Function to generate test report
generate_report() {
    echo -e "${BLUE}📊 Generating test report...${NC}"
    
    if [ -d "test-results" ]; then
        npx playwright show-report --host=0.0.0.0
    else
        echo -e "${YELLOW}⚠️  No test results found to generate report${NC}"
    fi
}

# Main execution
main() {
    local failed_tests=0
    local run_mode="${1:-full}"
    local target_browser="${2:-chromium}"
    
    echo -e "${YELLOW}📋 Test Configuration:${NC}"
    echo "   Mode: $run_mode"
    echo "   Browser: $target_browser"
    echo ""
    
    case "$run_mode" in
        "quick")
            echo -e "${BLUE}🚀 Running Quick Test Suite${NC}"
            run_test_suite "Basic Functionality" "tests/basic-functionality.spec.js" "$target_browser" || ((failed_tests++))
            ;;
            
        "core")
            echo -e "${BLUE}🎯 Running Core Features Test Suite${NC}"
            run_test_suite "Basic Functionality" "tests/basic-functionality.spec.js" "$target_browser" || ((failed_tests++))
            run_test_suite "AI Assistant" "tests/ai-assistant.spec.js" "$target_browser" || ((failed_tests++))
            run_test_suite "Settings Panel" "tests/settings-panel.spec.js" "$target_browser" || ((failed_tests++))
            ;;
            
        "visual")
            echo -e "${BLUE}🎨 Running Visual & Responsive Test Suite${NC}"
            run_test_suite "Responsive Design" "tests/responsive-design.spec.js" "$target_browser" || ((failed_tests++))
            run_test_suite "Drawing Tools" "tests/drawing-tools.spec.js" "$target_browser" || ((failed_tests++))
            ;;
            
        "quality")
            echo -e "${BLUE}⭐ Running Quality & Accessibility Test Suite${NC}"
            run_test_suite "Performance & Accessibility" "tests/performance-accessibility.spec.js" "$target_browser" || ((failed_tests++))
            run_test_suite "PWA Features" "tests/pwa-features.spec.js" "$target_browser" || ((failed_tests++))
            ;;
            
        "mobile")
            echo -e "${BLUE}📱 Running Mobile-Specific Test Suite${NC}"
            run_test_suite "Mobile Chrome" "tests/" "Mobile Chrome" || ((failed_tests++))
            run_test_suite "Mobile Safari" "tests/" "Mobile Safari" || ((failed_tests++))
            ;;
            
        "cross-browser")
            echo -e "${BLUE}🌐 Running Cross-Browser Test Suite${NC}"
            for browser in "chromium" "firefox" "webkit"; do
                run_test_suite "Core Features" "tests/basic-functionality.spec.js tests/ai-assistant.spec.js" "$browser" || ((failed_tests++))
            done
            ;;
            
        "full"|*)
            echo -e "${BLUE}🔄 Running Full E2E Test Suite${NC}"
            
            # Core functionality tests
            run_test_suite "Basic Functionality" "tests/basic-functionality.spec.js" "$target_browser" || ((failed_tests++))
            run_test_suite "AI Assistant" "tests/ai-assistant.spec.js" "$target_browser" || ((failed_tests++))
            run_test_suite "Settings Panel" "tests/settings-panel.spec.js" "$target_browser" || ((failed_tests++))
            
            # Feature tests
            run_test_suite "Drawing Tools" "tests/drawing-tools.spec.js" "$target_browser" || ((failed_tests++))
            run_test_suite "Content Features" "tests/content-features.spec.js" "$target_browser" || ((failed_tests++))
            
            # Quality tests
            run_test_suite "Responsive Design" "tests/responsive-design.spec.js" "$target_browser" || ((failed_tests++))
            run_test_suite "Performance & Accessibility" "tests/performance-accessibility.spec.js" "$target_browser" || ((failed_tests++))
            run_test_suite "PWA Features" "tests/pwa-features.spec.js" "$target_browser" || ((failed_tests++))
            ;;
    esac
    
    echo ""
    echo -e "${BLUE}📊 Test Summary${NC}"
    echo "==============="
    
    if [ $failed_tests -eq 0 ]; then
        echo -e "${GREEN}✅ All test suites passed!${NC}"
        echo -e "${GREEN}🎉 FASM eBook is ready for production${NC}"
    else
        echo -e "${RED}❌ $failed_tests test suite(s) failed${NC}"
        echo -e "${RED}🔧 Please review the test results and fix any issues${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}📈 Test Reports:${NC}"
    echo "   HTML Report: playwright-report/index.html"
    echo "   JSON Results: test-results/results.json"
    echo "   JUnit XML: test-results/results.xml"
    
    return $failed_tests
}

# Handle command line arguments
case "${1:-}" in
    "help"|"-h"|"--help")
        echo "FASM eBook E2E Test Runner"
        echo ""
        echo "Usage: $0 [mode] [browser]"
        echo ""
        echo "Test Modes:"
        echo "  quick       - Run basic functionality tests only"
        echo "  core        - Run core feature tests (basic, AI, settings)"
        echo "  visual      - Run visual and responsive tests"
        echo "  quality     - Run performance and accessibility tests"
        echo "  mobile      - Run mobile-specific tests"
        echo "  cross-browser - Run tests across all browsers"
        echo "  full        - Run complete test suite (default)"
        echo ""
        echo "Browsers:"
        echo "  chromium    - Google Chrome/Chromium (default)"
        echo "  firefox     - Mozilla Firefox"
        echo "  webkit      - Safari WebKit"
        echo ""
        echo "Examples:"
        echo "  $0 quick chromium     # Quick tests on Chrome"
        echo "  $0 mobile             # Mobile tests on default browser"
        echo "  $0 full firefox       # Full suite on Firefox"
        echo ""
        exit 0
        ;;
    "report")
        generate_report
        exit 0
        ;;
    *)
        main "$@"
        exit $?
        ;;
esac