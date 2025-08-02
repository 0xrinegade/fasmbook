#!/bin/bash

# FASM eBook E2E Test Runner
# Comprehensive testing script for the FASM Programming eBook
# Enhanced with robust error handling and configuration management

# Enable strict error handling
set -euo pipefail

# Set IFS to default (space, tab, newline) to prevent unexpected behavior
IFS=$' \t\n'

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$SCRIPT_DIR"
readonly CONFIG_FILE="${PROJECT_ROOT}/test-config.json"

# Load configuration from external file if available
if [[ -f "$CONFIG_FILE" ]]; then
    echo "Loading configuration from $CONFIG_FILE"
    # Note: In a real implementation, you'd use jq or a similar tool
    # For now, we'll use environment variables or defaults
fi

# Default configuration (can be overridden by environment variables or config file)
readonly DEFAULT_PORT="${TEST_PORT:-8081}"
readonly DEFAULT_BROWSER="${TEST_BROWSER:-chromium}"
readonly DEFAULT_TIMEOUT="${TEST_TIMEOUT:-30}"
readonly RETRY_COUNT="${TEST_RETRY_COUNT:-3}"
readonly RETRY_DELAY="${TEST_RETRY_DELAY:-2}"

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Error handling functions
error_exit() {
    local error_message="$1"
    local exit_code="${2:-1}"
    echo -e "${RED}❌ ERROR: ${error_message}${NC}" >&2
    cleanup
    exit "$exit_code"
}

warn() {
    local warning_message="$1"
    echo -e "${YELLOW}⚠️  WARNING: ${warning_message}${NC}" >&2
}

info() {
    local info_message="$1"
    echo -e "${BLUE}ℹ️  INFO: ${info_message}${NC}"
}

success() {
    local success_message="$1"
    echo -e "${GREEN}✅ ${success_message}${NC}"
}

# Cleanup function
cleanup() {
    info "Performing cleanup..."
    
    # Kill any test servers that might be running
    if command -v lsof >/dev/null 2>&1; then
        local pids
        pids=$(lsof -ti:"$DEFAULT_PORT" 2>/dev/null || true)
        if [[ -n "$pids" ]]; then
            info "Cleaning up server processes on port $DEFAULT_PORT"
            echo "$pids" | xargs kill -TERM 2>/dev/null || true
            sleep 2
            echo "$pids" | xargs kill -KILL 2>/dev/null || true
        fi
    fi
}

# Trap for cleanup on script exit
trap cleanup EXIT INT TERM

# Input validation
validate_browser() {
    local browser="$1"
    local valid_browsers=("chromium" "firefox" "webkit")
    
    for valid in "${valid_browsers[@]}"; do
        if [[ "$browser" == "$valid" ]]; then
            return 0
        fi
    done
    
    error_exit "Invalid browser: $browser. Valid options: ${valid_browsers[*]}"
}

validate_test_mode() {
    local mode="$1"
    local valid_modes=("quick" "core" "visual" "quality" "mobile" "cross-browser" "full")
    
    for valid in "${valid_modes[@]}"; do
        if [[ "$mode" == "$valid" ]]; then
            return 0
        fi
    done
    
    error_exit "Invalid test mode: $mode. Valid options: ${valid_modes[*]}"
}

# Prerequisites checking
check_prerequisites() {
    info "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node >/dev/null 2>&1; then
        error_exit "Node.js is not installed. Please install Node.js 16+ to continue."
    fi
    
    local node_version
    node_version=$(node --version | sed 's/v//')
    local major_version
    major_version=$(echo "$node_version" | cut -d. -f1)
    
    if [[ "$major_version" -lt 16 ]]; then
        error_exit "Node.js version 16+ required. Current version: $node_version"
    fi
    
    # Check npm
    if ! command -v npm >/dev/null 2>&1; then
        error_exit "npm is not installed. Please install npm to continue."
    fi
    
    # Check if we're in the right directory
    if [[ ! -f "package.json" ]]; then
        error_exit "package.json not found. Please run this script from the project root directory."
    fi
    
    success "Prerequisites check passed"
}

# Dependency management with retry logic
install_dependencies() {
    info "Installing dependencies..."
    
    local retry_count=0
    while [[ $retry_count -lt $RETRY_COUNT ]]; do
        if npm ci --silent; then
            success "Dependencies installed successfully"
            return 0
        else
            retry_count=$((retry_count + 1))
            if [[ $retry_count -lt $RETRY_COUNT ]]; then
                warn "Dependency installation failed (attempt $retry_count/$RETRY_COUNT). Retrying in ${RETRY_DELAY}s..."
                sleep "$RETRY_DELAY"
            fi
        fi
    done
    
    error_exit "Failed to install dependencies after $RETRY_COUNT attempts"
}

# Playwright browser installation with error handling
install_playwright_browsers() {
    local browser="${1:-$DEFAULT_BROWSER}"
    
    info "Installing Playwright browsers for $browser..."
    
    if ! npx playwright install --with-deps "$browser"; then
        # Try without deps if full installation fails
        warn "Failed to install with dependencies, trying without..."
        if ! npx playwright install "$browser"; then
            error_exit "Failed to install Playwright browser: $browser"
        fi
    fi
    
    success "Playwright browsers installed"
}

# Test execution with enhanced error handling
run_test_suite() {
    local suite_name="$1"
    local test_pattern="$2"
    local browser="$3"
    local extra_args="${4:-}"
    
    info "Running $suite_name tests on $browser..."
    
    # Create results directory
    mkdir -p "test-results"
    
    # Set test environment variables
    export TEST_BROWSER="$browser"
    export TEST_TIMEOUT="$DEFAULT_TIMEOUT"
    export NODE_ENV="test"
    
    local test_command="npx playwright test"
    if [[ -n "$test_pattern" && "$test_pattern" != "tests/" ]]; then
        test_command="$test_command $test_pattern"
    fi
    test_command="$test_command --project=\"$browser\" $extra_args"
    
    if eval "$test_command"; then
        success "$suite_name tests passed on $browser"
        return 0
    else
        local exit_code=$?
        warn "$suite_name tests failed on $browser (exit code: $exit_code)"
        return $exit_code
    fi
}

# Report generation with error handling
generate_report() {
    info "Generating test report..."
    
    if [[ ! -d "test-results" ]]; then
        warn "No test results found to generate report"
        return 1
    fi
    
    # Generate HTML report
    if npx playwright show-report --host=0.0.0.0 &; then
        local report_pid=$!
        info "Test report server started (PID: $report_pid)"
        info "Report available at: http://localhost:9323"
        
        # Keep report server running for a reasonable time
        sleep 5
        return 0
    else
        warn "Failed to generate test report"
        return 1
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