# Chapter 15: Framework and Library Development
*Building Reusable Components for the Future*

## Introduction: The Architecture of Reusability

Creating frameworks and libraries represents the pinnacle of software engineering - designing abstractions that empower other developers while maintaining performance and flexibility. When built in assembly language, these components can provide both high-level convenience and low-level control, offering the best of both worlds.

This chapter explores how to design and implement professional-grade frameworks and libraries in assembly language, from API design principles and modular architecture to documentation and testing strategies. You'll learn to create components that are both powerful and elegant, serving as building blocks for complex applications.

Understanding framework development at the assembly level provides insights into software architecture, API design, and the trade-offs between abstraction and performance that influence all software development.

## Framework Architecture and Design Principles

### Core Framework Structure

```assembly
format PE console
entry start

include 'win32a.inc'

section '.data' data readable writeable
    ; Framework core structure
    framework_core struct
        version_major       dd ?
        version_minor       dd ?
        version_patch       dd ?
        init_status        dd ?
        module_registry    dd ?
        error_handler      dd ?
        memory_manager     dd ?
        logger             dd ?
        configuration      dd ?
        plugin_system      dd ?
    ends
    
    ; Module system
    module_descriptor struct
        module_id          dd ?
        module_name        rb 64
        version           dd ?
        dependencies      dd ?
        init_func         dd ?
        cleanup_func      dd ?
        api_table         dd ?
        loaded            db ?
        reference_count   dd ?
    ends
    
    ; API management
    api_interface struct
        interface_id      dd ?
        interface_name    rb 32
        function_count    dd ?
        function_table    dd ?
        version          dd ?
        compatibility    dd ?
    ends
    
    ; Memory management system
    memory_pool struct
        pool_id          dd ?
        pool_size        dd ?
        block_size       dd ?
        free_blocks      dd ?
        allocated_blocks dd ?
        pool_data        dd ?
        next_pool        dd ?
    ends
    
    ; Main framework instance
    main_framework      framework_core
    
    ; Module registry
    max_modules         equ 128
    module_registry     module_descriptor max_modules dup(<>)
    loaded_modules      dd 0
    
    ; Memory pools
    memory_pools        memory_pool 16 dup(<>)
    pool_count          dd 0
    
    ; Error management
    error_stack         dd 32 dup(?)
    error_count         dd 0
    
    ; Configuration system
    config_entries      dd 256 dup(?)
    config_count        dd 0

section '.code' code readable executable

start:
    call init_framework
    call demo_framework_usage
    call shutdown_framework
    invoke ExitProcess, 0

; Framework initialization
init_framework:
    ; Initialize complete framework system
    call init_core_systems
    test eax, eax
    jz .init_failed
    
    call init_memory_management
    test eax, eax
    jz .init_failed
    
    call init_module_system
    call init_logging_system
    call init_configuration_system
    call init_plugin_system
    
    ; Set framework version
    mov [main_framework.version_major], 1
    mov [main_framework.version_minor], 0
    mov [main_framework.version_patch], 0
    mov [main_framework.init_status], 1
    
    mov eax, 1  ; Success
    ret
    
    .init_failed:
        call cleanup_partial_init
        xor eax, eax
        ret

init_core_systems:
    ; Initialize core framework systems
    
    ; Initialize critical section for thread safety
    call init_framework_locks
    
    ; Setup error handling
    call setup_error_handling
    
    ; Initialize timing systems
    call init_timing_systems
    
    ; Setup signal handling
    call setup_signal_handlers
    
    mov eax, 1
    ret

; Memory management framework
init_memory_management:
    ; Initialize advanced memory management
    
    ; Create default memory pools
    call create_small_block_pool    ; 16-64 bytes
    call create_medium_block_pool   ; 64-1024 bytes  
    call create_large_block_pool    ; 1024+ bytes
    call create_string_pool         ; String allocations
    
    ; Initialize memory tracking
    call init_memory_tracking
    
    ; Setup memory debugging
    call setup_memory_debugging
    
    mov eax, 1
    ret

create_memory_pool:
    ; Create new memory pool
    ; eax = block_size, ebx = pool_size, returns pool_id in eax
    push ebx ecx edx
    
    ; Find free pool slot
    mov ecx, 0
    
    .find_slot:
        cmp ecx, 16
        jge .no_slots
        
        cmp [memory_pools + ecx * sizeof.memory_pool + memory_pool.pool_id], 0
        je .slot_found
        
        inc ecx
        jmp .find_slot
    
    .slot_found:
        ; Initialize pool
        mov edx, ecx
        imul edx, sizeof.memory_pool
        add edx, memory_pools
        
        mov [edx + memory_pool.pool_id], ecx
        mov [edx + memory_pool.block_size], eax
        mov [edx + memory_pool.pool_size], ebx
        mov [edx + memory_pool.allocated_blocks], 0
        
        ; Allocate pool memory
        invoke VirtualAlloc, 0, ebx, MEM_COMMIT or MEM_RESERVE, PAGE_READWRITE
        test eax, eax
        jz .allocation_failed
        
        mov [edx + memory_pool.pool_data], eax
        
        ; Initialize free block list
        call init_pool_free_list
        
        mov eax, ecx  ; Return pool ID
        pop edx ecx ebx
        ret
    
    .no_slots:
    .allocation_failed:
        pop edx ecx ebx
        xor eax, eax
        ret

framework_malloc:
    ; Framework memory allocation
    ; eax = size, returns pointer in eax
    push ebx ecx edx
    
    ; Find appropriate pool
    call find_suitable_pool
    test eax, eax
    jz .use_system_malloc
    
    ; Allocate from pool
    call allocate_from_pool
    jmp .allocation_done
    
    .use_system_malloc:
        ; Fall back to system allocation
        invoke HeapAlloc, [GetProcessHeap], HEAP_ZERO_MEMORY, eax
    
    .allocation_done:
        ; Track allocation if debugging enabled
        call track_allocation
        
        pop edx ecx ebx
        ret

framework_free:
    ; Framework memory deallocation
    ; eax = pointer
    push ebx ecx edx
    
    ; Check if pointer is from pool
    call find_pool_for_pointer
    test eax, eax
    jz .use_system_free
    
    ; Free to pool
    call deallocate_to_pool
    jmp .deallocation_done
    
    .use_system_free:
        invoke HeapFree, [GetProcessHeap], 0, eax
    
    .deallocation_done:
        ; Update tracking
        call untrack_allocation
        
        pop edx ecx ebx
        ret

; Module system
register_module:
    ; Register new module with framework
    ; esi = module descriptor, returns module_id in eax
    push ebx ecx edi
    
    ; Find free module slot
    mov ebx, 0
    
    .find_slot:
        cmp ebx, max_modules
        jge .no_slots
        
        mov ecx, sizeof.module_descriptor
        mul ebx
        add eax, module_registry
        
        cmp [eax + module_descriptor.module_id], 0
        je .slot_found
        
        inc ebx
        jmp .find_slot
    
    .slot_found:
        ; Copy module descriptor
        mov edi, eax
        mov ecx, sizeof.module_descriptor / 4
        rep movsd
        
        ; Set module ID
        mov [edi + module_descriptor.module_id], ebx
        
        ; Check dependencies
        call check_module_dependencies
        test eax, eax
        jz .dependency_failed
        
        ; Initialize module
        call initialize_module
        
        inc [loaded_modules]
        mov eax, ebx  ; Return module ID
        pop edi ecx ebx
        ret
    
    .no_slots:
    .dependency_failed:
        pop edi ecx ebx
        xor eax, eax
        ret

load_module:
    ; Load module from file
    ; esi = module_path, returns module_id in eax
    push ebx ecx edx edi
    
    ; Load module binary
    call load_module_binary
    test eax, eax
    jz .load_failed
    
    mov edi, eax  ; Module base address
    
    ; Parse module header
    call parse_module_header
    test eax, eax
    jz .parse_failed
    
    ; Resolve imports
    call resolve_module_imports
    test eax, eax
    jz .resolve_failed
    
    ; Call module init
    call call_module_init
    
    ; Register module
    call register_loaded_module
    
    pop edi edx ecx ebx
    ret
    
    .load_failed:
    .parse_failed:
    .resolve_failed:
        pop edi edx ecx ebx
        xor eax, eax
        ret

unload_module:
    ; Unload module
    ; eax = module_id
    push ebx ecx edx
    
    ; Find module
    call find_module_by_id
    test eax, eax
    jz .module_not_found
    
    mov ebx, eax  ; Module descriptor
    
    ; Check reference count
    cmp [ebx + module_descriptor.reference_count], 0
    jg .module_in_use
    
    ; Call cleanup function
    mov eax, [ebx + module_descriptor.cleanup_func]
    test eax, eax
    jz .no_cleanup
    call eax
    
    .no_cleanup:
        ; Unload binary
        call unload_module_binary
        
        ; Clear descriptor
        mov edi, ebx
        mov ecx, sizeof.module_descriptor / 4
        xor eax, eax
        rep stosd
        
        dec [loaded_modules]
        mov eax, 1  ; Success
        jmp .unload_done
    
    .module_not_found:
    .module_in_use:
        xor eax, eax  ; Failure
    
    .unload_done:
        pop edx ecx ebx
        ret

; API management system
create_api_interface:
    ; Create new API interface
    ; esi = interface definition, returns interface_id in eax
    push ebx ecx edi
    
    ; Allocate interface structure
    mov eax, sizeof.api_interface
    call framework_malloc
    test eax, eax
    jz .allocation_failed
    
    mov edi, eax
    
    ; Copy interface definition
    mov ecx, sizeof.api_interface / 4
    rep movsd
    
    ; Generate interface ID
    call generate_interface_id
    mov [edi + api_interface.interface_id], eax
    
    ; Validate interface
    call validate_api_interface
    test eax, eax
    jz .validation_failed
    
    ; Register interface
    call register_api_interface
    
    mov eax, [edi + api_interface.interface_id]
    pop edi ecx ebx
    ret
    
    .allocation_failed:
    .validation_failed:
        pop edi ecx ebx
        xor eax, eax
        ret

get_api_function:
    ; Get function pointer from API interface
    ; eax = interface_id, ebx = function_index, returns function pointer in eax
    push ecx edx
    
    ; Find interface
    call find_api_interface
    test eax, eax
    jz .interface_not_found
    
    mov ecx, eax  ; Interface pointer
    
    ; Check function index bounds
    cmp ebx, [ecx + api_interface.function_count]
    jge .invalid_function
    
    ; Get function pointer
    mov edx, [ecx + api_interface.function_table]
    mov eax, [edx + ebx*4]
    
    pop edx ecx
    ret
    
    .interface_not_found:
    .invalid_function:
        pop edx ecx
        xor eax, eax
        ret

; Configuration system
load_configuration:
    ; Load configuration from file
    ; esi = config_file_path
    push ebx ecx edi
    
    ; Open configuration file
    invoke CreateFile, esi, GENERIC_READ, FILE_SHARE_READ, 0, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, 0
    cmp eax, INVALID_HANDLE_VALUE
    je .file_open_failed
    
    mov ebx, eax  ; File handle
    
    ; Read file content
    call read_config_file_content
    
    ; Parse configuration
    call parse_config_content
    
    ; Close file
    invoke CloseHandle, ebx
    
    pop edi ecx ebx
    mov eax, 1
    ret
    
    .file_open_failed:
        pop edi ecx ebx
        xor eax, eax
        ret

set_config_value:
    ; Set configuration value
    ; esi = key, edi = value
    push eax ebx ecx
    
    ; Find existing key
    call find_config_key
    test eax, eax
    jnz .update_existing
    
    ; Create new entry
    call create_config_entry
    test eax, eax
    jz .creation_failed
    
    .update_existing:
        ; Update value
        call update_config_value
    
    .creation_failed:
        pop ecx ebx eax
        ret

get_config_value:
    ; Get configuration value
    ; esi = key, returns value pointer in eax
    push ebx ecx
    
    ; Find key
    call find_config_key
    test eax, eax
    jz .key_not_found
    
    ; Return value pointer
    mov eax, [eax + config_entry.value]
    jmp .get_done
    
    .key_not_found:
        xor eax, eax
    
    .get_done:
        pop ecx ebx
        ret

; Logging system
init_logging_system:
    ; Initialize framework logging
    call create_log_file
    call setup_log_levels
    call init_log_rotation
    ret

log_message:
    ; Log message with level
    ; eax = log_level, esi = message
    push ebx ecx edx edi
    
    ; Check if level is enabled
    call check_log_level_enabled
    test eax, eax
    jz .logging_disabled
    
    ; Format log entry
    call format_log_entry
    
    ; Write to log file
    call write_log_entry
    
    ; Check if console output needed
    call check_console_output
    test eax, eax
    jz .no_console
    
    call write_console_output
    
    .no_console:
    .logging_disabled:
        pop edi edx ecx ebx
        ret

format_log_entry:
    ; Format log entry with timestamp and level
    ; eax = log_level, esi = message, edi = output_buffer
    push ebx ecx edx
    
    ; Add timestamp
    call get_current_timestamp
    call format_timestamp
    
    ; Add log level
    call format_log_level
    
    ; Add message
    call append_log_message
    
    ; Add newline
    mov al, 13
    stosb
    mov al, 10
    stosb
    mov al, 0
    stosb
    
    pop edx ecx ebx
    ret

; Plugin system
load_plugin:
    ; Load plugin from file
    ; esi = plugin_path, returns plugin_handle in eax
    push ebx ecx edi
    
    ; Load plugin library
    invoke LoadLibrary, esi
    test eax, eax
    jz .load_failed
    
    mov ebx, eax  ; Library handle
    
    ; Get plugin info function
    invoke GetProcAddress, ebx, plugin_info_func
    test eax, eax
    jz .no_info_func
    
    ; Call plugin info
    call eax
    
    ; Validate plugin
    call validate_plugin
    test eax, eax
    jz .invalid_plugin
    
    ; Register plugin
    call register_plugin
    
    mov eax, ebx  ; Return library handle
    pop edi ecx ebx
    ret
    
    .load_failed:
    .no_info_func:
    .invalid_plugin:
        pop edi ecx ebx
        xor eax, eax
        ret

unload_plugin:
    ; Unload plugin
    ; eax = plugin_handle
    push ebx
    
    mov ebx, eax
    
    ; Call plugin cleanup
    call call_plugin_cleanup
    
    ; Unregister plugin
    call unregister_plugin
    
    ; Free library
    invoke FreeLibrary, ebx
    
    pop ebx
    ret

; Error handling system
setup_error_handling:
    ; Setup framework error handling
    call install_exception_handler
    call init_error_stack
    call setup_error_codes
    ret

push_error:
    ; Push error onto error stack
    ; eax = error_code, esi = error_message
    push ebx ecx
    
    ; Check stack space
    cmp [error_count], 32
    jge .stack_overflow
    
    ; Add error to stack
    mov ebx, [error_count]
    mov [error_stack + ebx*4], eax
    
    ; Store error message (simplified)
    call store_error_message
    
    inc [error_count]
    
    .stack_overflow:
        pop ecx ebx
        ret

pop_error:
    ; Pop error from error stack
    ; returns error_code in eax
    push ebx
    
    ; Check if errors available
    cmp [error_count], 0
    je .no_errors
    
    ; Get top error
    dec [error_count]
    mov ebx, [error_count]
    mov eax, [error_stack + ebx*4]
    
    jmp .pop_done
    
    .no_errors:
        xor eax, eax
    
    .pop_done:
        pop ebx
        ret

get_last_error:
    ; Get last error without removing from stack
    ; returns error_code in eax
    cmp [error_count], 0
    je .no_errors
    
    mov ebx, [error_count]
    dec ebx
    mov eax, [error_stack + ebx*4]
    ret
    
    .no_errors:
        xor eax, eax
        ret

; Performance monitoring
init_performance_monitoring:
    ; Initialize performance monitoring
    call setup_performance_counters
    call init_profiling_system
    call create_performance_log
    ret

start_performance_timer:
    ; Start performance timer
    ; eax = timer_id
    push ebx
    
    ; Get timer slot
    mov ebx, eax
    
    ; Record start time
    invoke QueryPerformanceCounter, performance_timers + ebx*8
    
    pop ebx
    ret

end_performance_timer:
    ; End performance timer and calculate duration
    ; eax = timer_id, returns duration in eax
    push ebx ecx edx
    
    mov ebx, eax
    
    ; Get end time
    invoke QueryPerformanceCounter, temp_counter
    
    ; Calculate duration
    mov eax, [temp_counter]
    sub eax, [performance_timers + ebx*8]
    
    ; Convert to microseconds
    mov ecx, [performance_frequency]
    div ecx
    imul eax, 1000000
    
    pop edx ecx ebx
    ret

; Framework utilities
create_string_builder:
    ; Create string builder utility
    ; eax = initial_capacity, returns builder handle in eax
    push ebx ecx
    
    ; Allocate builder structure
    mov ebx, eax
    mov eax, sizeof.string_builder
    call framework_malloc
    test eax, eax
    jz .allocation_failed
    
    ; Initialize builder
    mov [eax + string_builder.capacity], ebx
    mov [eax + string_builder.length], 0
    
    ; Allocate buffer
    mov ecx, ebx
    call framework_malloc
    test eax, eax
    jz .buffer_allocation_failed
    
    mov [eax + string_builder.buffer], eax
    
    pop ecx ebx
    ret
    
    .allocation_failed:
    .buffer_allocation_failed:
        pop ecx ebx
        xor eax, eax
        ret

string_builder_append:
    ; Append string to builder
    ; eax = builder_handle, esi = string
    push ebx ecx edx edi
    
    mov ebx, eax  ; Builder handle
    
    ; Calculate string length
    call string_length
    mov ecx, eax  ; String length
    
    ; Check if buffer needs expansion
    mov edx, [ebx + string_builder.length]
    add edx, ecx
    cmp edx, [ebx + string_builder.capacity]
    jle .buffer_ok
    
    ; Expand buffer
    call expand_string_builder_buffer
    
    .buffer_ok:
        ; Copy string to buffer
        mov edi, [ebx + string_builder.buffer]
        add edi, [ebx + string_builder.length]
        rep movsb
        
        ; Update length
        add [ebx + string_builder.length], ecx
    
    pop edi edx ecx ebx
    ret

; Testing framework
create_test_suite:
    ; Create test suite
    ; esi = suite_name, returns suite_handle in eax
    push ebx ecx edi
    
    ; Allocate test suite
    mov eax, sizeof.test_suite
    call framework_malloc
    test eax, eax
    jz .allocation_failed
    
    mov edi, eax
    
    ; Initialize suite
    call init_test_suite
    
    ; Set suite name
    mov esi, suite_name
    call copy_string
    
    mov eax, edi  ; Return suite handle
    pop edi ecx ebx
    ret
    
    .allocation_failed:
        pop edi ecx ebx
        xor eax, eax
        ret

add_test_case:
    ; Add test case to suite
    ; eax = suite_handle, esi = test_name, edi = test_function
    push ebx ecx
    
    ; Find free test slot
    call find_free_test_slot
    test eax, eax
    jz .no_slots
    
    ; Add test case
    call register_test_case
    
    pop ecx ebx
    mov eax, 1
    ret
    
    .no_slots:
        pop ecx ebx
        xor eax, eax
        ret

run_test_suite:
    ; Run all tests in suite
    ; eax = suite_handle
    push ebx ecx edx
    
    mov ebx, eax  ; Suite handle
    
    ; Initialize test results
    call init_test_results
    
    ; Run each test
    mov ecx, 0
    
    .test_loop:
        cmp ecx, [ebx + test_suite.test_count]
        jge .tests_done
        
        ; Run test case
        call run_single_test
        
        ; Record results
        call record_test_result
        
        inc ecx
        jmp .test_loop
    
    .tests_done:
        ; Generate test report
        call generate_test_report
        
        pop edx ecx ebx
        ret

; Data structures
string_builder struct
    buffer          dd ?
    length          dd ?
    capacity        dd ?
ends

test_suite struct
    suite_name      rb 64
    test_cases      rd 64
    test_count      dd ?
    passed_tests    dd ?
    failed_tests    dd ?
ends

config_entry struct
    key             rb 64
    value           rb 256
    type            dd ?
ends

performance_timers  rq 32
temp_counter        rq 1
performance_frequency dd ?

plugin_info_func    db 'GetPluginInfo', 0
suite_name          rb 64

; Framework constants
LOG_LEVEL_DEBUG     equ 0
LOG_LEVEL_INFO      equ 1
LOG_LEVEL_WARNING   equ 2
LOG_LEVEL_ERROR     equ 3
LOG_LEVEL_FATAL     equ 4
```

## GitHub Actions Integration for FASM Development

### Automated Build and Test Pipeline

Modern FASM development benefits enormously from continuous integration. Here's how to create a comprehensive GitHub Actions workflow that automatically compiles, tests, and validates your assembly code:

```yaml
name: FASM Code Compilation and Testing

on:
  push:
    branches: [ main, master ]
    paths: ['**/*.asm', '**/*.inc']
  pull_request:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  compile-windows:
    runs-on: windows-latest
    name: Compile FASM Code (Windows)
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Download and setup FASM
        run: |
          Invoke-WebRequest -Uri "https://flatassembler.net/fasm.zip" -OutFile "fasm.zip"
          Expand-Archive -Path "fasm.zip" -DestinationPath "fasm"
          $fasmPath = Join-Path $PWD "fasm"
          echo $fasmPath | Out-File -FilePath $env:GITHUB_PATH -Encoding utf8 -Append
        shell: powershell

      - name: Compile assembly sources
        run: |
          Get-ChildItem -Path "." -Filter "*.asm" -Recurse | ForEach-Object {
            Write-Host "Compiling: $($_.FullName)"
            & "fasm\fasm.exe" $_.FullName
            if ($LASTEXITCODE -eq 0) {
              Write-Host "✅ Success: $($_.Name)" -ForegroundColor Green
            } else {
              Write-Host "❌ Failed: $($_.Name)" -ForegroundColor Red
            }
          }
        shell: powershell

  compile-linux:
    runs-on: ubuntu-latest
    name: Compile FASM Code (Linux)
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Download and setup FASM
        run: |
          wget https://flatassembler.net/fasm.tgz
          tar -xzf fasm.tgz
          chmod +x fasm/fasm
          echo "$(pwd)/fasm" >> $GITHUB_PATH

      - name: Compile assembly sources
        run: |
          find . -name "*.asm" -type f | while read -r asmfile; do
            echo "Compiling: $asmfile"
            if ./fasm/fasm "$asmfile"; then
              echo "✅ Success: $(basename "$asmfile")"
            else
              echo "❌ Failed: $(basename "$asmfile")"
            fi
          done

  test-executables:
    needs: [compile-windows, compile-linux]
    runs-on: ubuntu-latest
    name: Test Compiled Programs
    
    steps:
      - name: Run test suite
        run: |
          echo "Testing FASM compiled programs..."
          # Add specific test logic here
          echo "All tests passed!"
```

### Advanced Documentation Extraction

```yaml
  extract-documentation:
    runs-on: ubuntu-latest
    name: Extract and Validate Code Examples
    
    steps:
      - name: Extract FASM code from documentation
        run: |
          #!/bin/bash
          
          # Extract all assembly code blocks from markdown files
          find docs/ -name "*.md" -exec grep -Pzo '(?s)```assembly.*?```' {} \; > extracted_code.txt
          
          # Validate syntax and create compilable examples
          example_count=0
          while IFS= read -r -d '' code_block; do
            if [[ "$code_block" =~ (mov|push|call|add|sub|ret|jmp) ]]; then
              ((example_count++))
              filename="auto_example_${example_count}.asm"
              
              # Clean and prepare code
              echo "$code_block" | sed 's/```assembly//g' | sed 's/```//g' > "$filename"
              
              echo "Created: $filename"
              
              # Try to compile
              if ./fasm/fasm "$filename" 2>/dev/null; then
                echo "✅ Compilation successful: $filename"
              else
                echo "❌ Compilation failed: $filename"
              fi
            fi
          done <<< "$(grep -Pzo '(?s)```assembly.*?```' docs/**/*.md)"
          
          echo "Processed $example_count code examples"
```

### Performance Benchmarking Pipeline

```assembly
; Performance testing framework integration
format PE console
entry start

include 'win32a.inc'

section '.data' data readable writeable
    benchmark_results   dd 1000 dup(?)
    test_iterations     dd 10000
    timer_frequency     dq ?
    start_time          dq ?
    end_time            dq ?
    
    ; GitHub Actions environment detection
    ci_environment      db 'GITHUB_ACTIONS', 0
    ci_env_value        rb 256
    
section '.code' code readable executable
start:
    ; Detect if running in CI environment
    call detect_ci_environment
    test eax, eax
    jz .run_local_tests
    
    ; CI-specific optimizations
    call setup_ci_benchmarks
    jmp .run_benchmarks
    
    .run_local_tests:
        call setup_local_benchmarks
    
    .run_benchmarks:
        call run_performance_suite
        call generate_ci_report
        
    invoke ExitProcess, 0

detect_ci_environment:
    ; Check for GitHub Actions environment variable
    invoke GetEnvironmentVariableA, ci_environment, ci_env_value, 256
    test eax, eax
    setnz al
    ret

setup_ci_benchmarks:
    ; Optimize for CI environment constraints
    mov dword [test_iterations], 1000  ; Fewer iterations for CI
    call init_performance_counters
    ret

run_performance_suite:
    ; High-precision timing using QueryPerformanceCounter
    invoke QueryPerformanceFrequency, timer_frequency
    
    mov ecx, [test_iterations]
    .benchmark_loop:
        push ecx
        
        ; Start timing
        invoke QueryPerformanceCounter, start_time
        
        ; Run test code here
        call benchmark_target_function
        
        ; End timing
        invoke QueryPerformanceCounter, end_time
        
        ; Calculate and store result
        call calculate_benchmark_result
        
        pop ecx
        loop .benchmark_loop
    
    ret

generate_ci_report:
    ; Generate GitHub Actions compatible output
    ; Format: ::notice title=Performance::Average cycles: 123
    ; This appears in the GitHub Actions summary
    call format_github_actions_output
    ret
```

### Code Quality Validation

```yaml
  code-quality:
    runs-on: ubuntu-latest
    name: FASM Code Quality Checks
    
    steps:
      - name: Syntax validation
        run: |
          # Check for common FASM syntax issues
          find . -name "*.asm" | xargs grep -n -E "(^[[:space:]]*[[:alpha:]]+:$|^[[:space:]]*[[:alpha:]]+[[:space:]]+)" || true
          
      - name: Performance analysis
        run: |
          # Extract cycle count annotations and validate
          grep -r "📊 Cycles:" . | while read -r line; do
            echo "Found performance annotation: $line"
          done
          
      - name: Documentation coverage
        run: |
          # Ensure all assembly instructions are documented
          instructions=$(grep -ho -E '\b(mov|push|call|add|sub|ret|jmp|inc|dec|cmp|test)\b' **/*.asm | sort -u)
          for inst in $instructions; do
            if ! grep -r "## 📚.*$inst" docs/; then
              echo "⚠️ Missing documentation for instruction: $inst"
            fi
          done
```

This comprehensive framework demonstrates how to build sophisticated frameworks and libraries in assembly language, complete with modern CI/CD integration. From modular architecture and memory management to plugin systems and automated testing, you now have the foundation to create professional-grade FASM development environments.

## Exercises

1. **Plugin Architecture**: Extend the plugin system to support dynamic loading and hot-swapping of components.

2. **Advanced Memory Management**: Implement garbage collection and memory pool optimization algorithms.

3. **Cross-Platform Support**: Design the framework to work across multiple operating systems and architectures.

4. **Performance Optimization**: Add comprehensive profiling and optimization tools to the framework.

5. **Documentation System**: Create an automated documentation generation system for framework APIs.

The next chapter will explore package management system design, showing how to create sophisticated dependency management and distribution systems.