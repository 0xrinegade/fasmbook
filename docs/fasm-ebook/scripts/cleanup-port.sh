#!/bin/bash

# Enhanced Port Cleanup Script for FASM eBook
# Robust port cleanup with comprehensive error handling and cross-platform support

# Enable strict error handling
set -euo pipefail

# Script configuration
readonly SCRIPT_NAME="$(basename "$0")"
readonly DEFAULT_PORT=8081
readonly MAX_WAIT_TIME=10
readonly FORCE_KILL_DELAY=5

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $*"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $*" >&2
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $*" >&2
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $*"
}

# Usage information
show_usage() {
    cat << EOF
Usage: $SCRIPT_NAME [OPTIONS] [PORT]

Clean up processes using the specified port.

OPTIONS:
    -h, --help      Show this help message
    -f, --force     Force kill processes without waiting
    -v, --verbose   Enable verbose output
    -w, --wait N    Wait N seconds before force killing (default: $FORCE_KILL_DELAY)

ARGUMENTS:
    PORT           Port number to clean up (default: $DEFAULT_PORT)

EXAMPLES:
    $SCRIPT_NAME                    # Clean up default port ($DEFAULT_PORT)
    $SCRIPT_NAME 8080              # Clean up port 8080
    $SCRIPT_NAME -f 8081           # Force kill processes on port 8081
    $SCRIPT_NAME --verbose 3000    # Clean up port 3000 with verbose output

EXIT CODES:
    0    Success or no processes found
    1    General error
    2    Invalid arguments
    3    Tool not found (fuser/lsof)
    4    Permission denied
EOF
}

# Parse command line arguments
parse_arguments() {
    FORCE_MODE=false
    VERBOSE_MODE=false
    WAIT_TIME=$FORCE_KILL_DELAY
    TARGET_PORT=$DEFAULT_PORT
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            -f|--force)
                FORCE_MODE=true
                shift
                ;;
            -v|--verbose)
                VERBOSE_MODE=true
                shift
                ;;
            -w|--wait)
                if [[ -n "${2:-}" ]] && [[ "$2" =~ ^[0-9]+$ ]]; then
                    WAIT_TIME="$2"
                    shift 2
                else
                    log_error "Option --wait requires a numeric argument"
                    exit 2
                fi
                ;;
            -*)
                log_error "Unknown option: $1"
                show_usage >&2
                exit 2
                ;;
            *)
                if [[ "$1" =~ ^[0-9]+$ ]] && [[ "$1" -ge 1 ]] && [[ "$1" -le 65535 ]]; then
                    TARGET_PORT="$1"
                    shift
                else
                    log_error "Invalid port number: $1 (must be 1-65535)"
                    exit 2
                fi
                ;;
        esac
    done
    
    readonly FORCE_MODE VERBOSE_MODE WAIT_TIME TARGET_PORT
}

# Verbose logging
verbose_log() {
    if [[ "$VERBOSE_MODE" == true ]]; then
        log_info "$*"
    fi
}

# Check if port is valid
validate_port() {
    local port="$1"
    
    if [[ ! "$port" =~ ^[0-9]+$ ]] || [[ "$port" -lt 1 ]] || [[ "$port" -gt 65535 ]]; then
        log_error "Invalid port number: $port (must be 1-65535)"
        return 1
    fi
    
    return 0
}

# Find processes using the port with fuser
find_processes_fuser() {
    local port="$1"
    local pids=()
    
    verbose_log "Using fuser to find processes on port $port"
    
    # Get PIDs using the port (TCP)
    if command -v fuser >/dev/null 2>&1; then
        local fuser_output
        fuser_output=$(fuser "${port}/tcp" 2>/dev/null || true)
        
        if [[ -n "$fuser_output" ]]; then
            # Parse PIDs from fuser output
            read -ra pids <<< "$fuser_output"
            verbose_log "Found PIDs using fuser: ${pids[*]}"
        fi
    else
        return 1
    fi
    
    printf '%s\n' "${pids[@]}"
}

# Find processes using the port with lsof
find_processes_lsof() {
    local port="$1"
    local pids=()
    
    verbose_log "Using lsof to find processes on port $port"
    
    if command -v lsof >/dev/null 2>&1; then
        # Get PIDs listening on the port
        local lsof_output
        lsof_output=$(lsof -ti ":$port" 2>/dev/null || true)
        
        if [[ -n "$lsof_output" ]]; then
            readarray -t pids <<< "$lsof_output"
            verbose_log "Found PIDs using lsof: ${pids[*]}"
        fi
    else
        return 1
    fi
    
    printf '%s\n' "${pids[@]}"
}

# Find processes using the port with netstat (fallback)
find_processes_netstat() {
    local port="$1"
    local pids=()
    
    verbose_log "Using netstat as fallback to find processes on port $port"
    
    if command -v netstat >/dev/null 2>&1; then
        # Try netstat with different options based on platform
        local netstat_output
        if netstat -tlnp 2>/dev/null | grep -q ":$port "; then
            netstat_output=$(netstat -tlnp 2>/dev/null | grep ":$port " | awk '{print $7}' | cut -d'/' -f1 | grep -v '^-$' || true)
        elif netstat -an 2>/dev/null | grep -q ":$port "; then
            # macOS/BSD style netstat (doesn't show PIDs)
            verbose_log "Port $port is in use, but cannot determine PID with netstat on this system"
            return 2
        fi
        
        if [[ -n "$netstat_output" ]]; then
            readarray -t pids <<< "$netstat_output"
            verbose_log "Found PIDs using netstat: ${pids[*]}"
        fi
    else
        return 1
    fi
    
    printf '%s\n' "${pids[@]}"
}

# Get process information
get_process_info() {
    local pid="$1"
    
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
        if command -v ps >/dev/null 2>&1; then
            ps -p "$pid" -o pid,ppid,user,comm,args --no-headers 2>/dev/null || echo "$pid <unknown process>"
        else
            echo "$pid <process info unavailable>"
        fi
    else
        verbose_log "Process $pid not found or already terminated"
        return 1
    fi
}

# Kill process gracefully then forcefully
kill_process() {
    local pid="$1"
    local wait_time="${2:-$WAIT_TIME}"
    
    if [[ -z "$pid" ]] || [[ ! "$pid" =~ ^[0-9]+$ ]]; then
        verbose_log "Invalid PID: $pid"
        return 1
    fi
    
    # Check if process exists
    if ! kill -0 "$pid" 2>/dev/null; then
        verbose_log "Process $pid not found or already terminated"
        return 0
    fi
    
    verbose_log "Attempting to terminate process $pid gracefully"
    
    # Try graceful termination first (unless force mode)
    if [[ "$FORCE_MODE" != true ]]; then
        if kill -TERM "$pid" 2>/dev/null; then
            verbose_log "Sent SIGTERM to process $pid"
            
            # Wait for graceful shutdown
            local count=0
            while [[ $count -lt $wait_time ]] && kill -0 "$pid" 2>/dev/null; do
                sleep 1
                count=$((count + 1))
                verbose_log "Waiting for process $pid to terminate... ($count/$wait_time)"
            done
            
            # Check if process is still running
            if kill -0 "$pid" 2>/dev/null; then
                log_warn "Process $pid did not terminate gracefully, using force"
            else
                verbose_log "Process $pid terminated gracefully"
                return 0
            fi
        else
            verbose_log "Failed to send SIGTERM to process $pid, trying SIGKILL"
        fi
    fi
    
    # Force kill if still running
    if kill -0 "$pid" 2>/dev/null; then
        verbose_log "Force killing process $pid"
        if kill -KILL "$pid" 2>/dev/null; then
            sleep 1
            if kill -0 "$pid" 2>/dev/null; then
                log_error "Failed to kill process $pid"
                return 1
            else
                verbose_log "Process $pid killed successfully"
                return 0
            fi
        else
            log_error "Failed to send SIGKILL to process $pid (permission denied?)"
            return 1
        fi
    fi
    
    return 0
}

# Main cleanup function
cleanup_port() {
    local port="$1"
    local pids=()
    local errors=0
    
    log_info "Cleaning up processes on port $port..."
    
    # Try different methods to find processes
    if command -v fuser >/dev/null 2>&1; then
        readarray -t pids < <(find_processes_fuser "$port")
    elif command -v lsof >/dev/null 2>&1; then
        readarray -t pids < <(find_processes_lsof "$port")
    elif command -v netstat >/dev/null 2>&1; then
        local netstat_result
        readarray -t pids < <(find_processes_netstat "$port")
        netstat_result=$?
        if [[ $netstat_result -eq 2 ]]; then
            log_warn "Port $port appears to be in use, but cannot determine process ID"
            log_warn "You may need to manually identify and stop the process"
            return 0
        fi
    else
        log_error "No suitable tool found (fuser, lsof, or netstat) to find processes"
        log_error "Please install one of these tools or manually stop processes on port $port"
        return 3
    fi
    
    # Filter out empty PIDs
    local valid_pids=()
    for pid in "${pids[@]}"; do
        if [[ -n "$pid" ]] && [[ "$pid" =~ ^[0-9]+$ ]]; then
            valid_pids+=("$pid")
        fi
    done
    
    if [[ ${#valid_pids[@]} -eq 0 ]]; then
        log_success "No processes found using port $port"
        return 0
    fi
    
    log_info "Found ${#valid_pids[@]} process(es) using port $port"
    
    # Show process information if verbose
    if [[ "$VERBOSE_MODE" == true ]]; then
        for pid in "${valid_pids[@]}"; do
            log_info "Process $pid: $(get_process_info "$pid" || echo "info unavailable")"
        done
    fi
    
    # Kill each process
    for pid in "${valid_pids[@]}"; do
        if ! kill_process "$pid"; then
            log_error "Failed to kill process $pid"
            errors=$((errors + 1))
        fi
    done
    
    # Wait a moment for processes to fully terminate
    sleep 2
    
    # Verify cleanup
    local remaining_pids=()
    if command -v fuser >/dev/null 2>&1; then
        readarray -t remaining_pids < <(find_processes_fuser "$port")
    elif command -v lsof >/dev/null 2>&1; then
        readarray -t remaining_pids < <(find_processes_lsof "$port")
    fi
    
    if [[ ${#remaining_pids[@]} -gt 0 ]]; then
        log_warn "Some processes may still be using port $port"
        errors=$((errors + 1))
    fi
    
    if [[ $errors -eq 0 ]]; then
        log_success "Port $port cleanup completed successfully"
    else
        log_warn "Port $port cleanup completed with $errors error(s)"
    fi
    
    return $errors
}

# Main execution
main() {
    # Parse command line arguments
    parse_arguments "$@"
    
    # Validate port
    if ! validate_port "$TARGET_PORT"; then
        exit 2
    fi
    
    verbose_log "Starting port cleanup for port $TARGET_PORT"
    verbose_log "Force mode: $FORCE_MODE"
    verbose_log "Wait time: $WAIT_TIME seconds"
    
    # Perform cleanup
    if cleanup_port "$TARGET_PORT"; then
        exit 0
    else
        exit 1
    fi
}

# Run main function with all arguments
main "$@"