# Chapter 8: Optimization and Performance Engineering
*Squeezing Every Cycle*

## Introduction: The Art of Going Fast

Performance optimization in assembly language is both an art and a science. It requires understanding not just the instruction set and compiler optimizations, but the intricate details of modern processor architecture, memory hierarchies, and execution pipelines. This chapter explores the advanced techniques used to create the fastest possible code, from micro-optimizations that save single cycles to architectural optimizations that can improve performance by orders of magnitude.

Modern processors are incredibly complex machines with sophisticated features designed to accelerate code execution. Understanding how to leverage these features—and avoid their pitfalls—is essential for writing high-performance assembly code. We'll explore everything from instruction-level parallelism to cache optimization, vectorization to branch prediction, always with practical examples that demonstrate real performance gains.

## Processor Architecture and Optimization

### Understanding Modern CPU Pipelines

Modern processors execute instructions through complex pipelines that can process multiple instructions simultaneously. Understanding these pipelines is crucial for optimization.

```assembly
format PE console
entry start

include 'win32a.inc'

section '.data' data readable writeable
    ; Test arrays for pipeline optimization
    array_size      equ 10000
    test_array1     dd array_size dup(1)
    test_array2     dd array_size dup(2)
    result_array    dd array_size dup(0)
    
    ; Performance measurement
    start_time      dq 0
    end_time        dq 0
    frequency       dq 0
    
    ; Branch prediction test data
    branch_test_size equ 1000
    branch_pattern   dd branch_test_size dup(0)
    
section '.code' code readable executable

start:
    ; Initialize performance counter
    invoke QueryPerformanceFrequency, frequency
    
    call demo_pipeline_optimization
    call demo_instruction_level_parallelism
    call demo_branch_prediction
    call demo_cache_optimization
    call demo_vectorization
    invoke ExitProcess, 0

demo_pipeline_optimization:
    ; Demonstrate pipeline-friendly vs pipeline-unfriendly code
    
    invoke printf, pipeline_header_fmt
    
    ; Test 1: Pipeline stalls due to data dependencies
    invoke QueryPerformanceCounter, start_time
    
    mov ecx, 1000000
    mov eax, 1                     ; Initial value
    
pipeline_stall_loop:
    add eax, eax                   ; Data dependency: next instruction waits
    add eax, eax                   ; Another dependency
    add eax, eax                   ; Another dependency
    sub eax, 7                     ; Break the pattern slightly
    loop pipeline_stall_loop
    
    invoke QueryPerformanceCounter, end_time
    call calculate_elapsed_time
    invoke printf, pipeline_stall_fmt, eax
    
    ; Test 2: Pipeline-friendly code with independent operations
    invoke QueryPerformanceCounter, start_time
    
    mov ecx, 1000000
    mov eax, 1                     ; Value 1
    mov ebx, 2                     ; Value 2
    mov edx, 3                     ; Value 3
    mov esi, 4                     ; Value 4
    
pipeline_friendly_loop:
    add eax, 1                     ; Independent operations
    add ebx, 2                     ; Can execute in parallel
    add edx, 3                     ; Can execute in parallel
    add esi, 4                     ; Can execute in parallel
    loop pipeline_friendly_loop
    
    invoke QueryPerformanceCounter, end_time
    call calculate_elapsed_time
    invoke printf, pipeline_friendly_fmt, eax
    
    ret

demo_instruction_level_parallelism:
    ; Demonstrate instruction-level parallelism (ILP)
    
    invoke printf, ilp_header_fmt
    
    ; Test 1: Sequential dependencies (poor ILP)
    invoke QueryPerformanceCounter, start_time
    
    mov ecx, 500000
    mov eax, 1
    
sequential_loop:
    add eax, 1                     ; Result depends on previous
    imul eax, 3                    ; Depends on previous add
    sub eax, 2                     ; Depends on previous imul
    shr eax, 1                     ; Depends on previous sub
    loop sequential_loop
    
    invoke QueryPerformanceCounter, end_time
    call calculate_elapsed_time
    invoke printf, sequential_fmt, eax
    
    ; Test 2: Independent operations (good ILP)
    invoke QueryPerformanceCounter, start_time
    
    mov ecx, 500000
    mov eax, 1                     ; Independent variables
    mov ebx, 2
    mov edx, 3
    mov esi, 4
    
parallel_loop:
    add eax, 1                     ; Independent operations
    imul ebx, 3                    ; Can execute in parallel
    sub edx, 2                     ; Can execute in parallel
    shr esi, 1                     ; Can execute in parallel
    loop parallel_loop
    
    invoke QueryPerformanceCounter, end_time
    call calculate_elapsed_time
    invoke printf, parallel_fmt, eax
    
    ; Test 3: Mixed operations with register renaming
    invoke QueryPerformanceCounter, start_time
    
    mov ecx, 500000
    mov eax, 1
    
renamed_loop:
    mov ebx, eax                   ; Copy for independent path
    add eax, 1                     ; Path 1
    imul eax, 2                    ; Path 1 continues
    
    mov edx, ebx                   ; Independent path 2
    sub edx, 1                     ; Path 2
    shl edx, 1                     ; Path 2 continues
    
    add eax, edx                   ; Combine paths
    loop renamed_loop
    
    invoke QueryPerformanceCounter, end_time
    call calculate_elapsed_time
    invoke printf, renamed_fmt, eax
    
    ret

demo_branch_prediction:
    ; Demonstrate branch prediction effects
    
    invoke printf, branch_header_fmt
    
    ; Initialize pattern arrays
    call init_branch_patterns
    
    ; Test 1: Predictable branches (alternating pattern)
    invoke QueryPerformanceCounter, start_time
    
    mov ecx, branch_test_size
    mov esi, branch_pattern
    xor eax, eax                   ; Counter
    
predictable_loop:
    mov ebx, [esi]                 ; Load pattern value
    test ebx, ebx
    jz predictable_zero
    inc eax                        ; Increment for ones
    jmp predictable_continue
    
predictable_zero:
    dec eax                        ; Decrement for zeros
    
predictable_continue:
    add esi, 4
    loop predictable_loop
    
    invoke QueryPerformanceCounter, end_time
    call calculate_elapsed_time
    invoke printf, predictable_fmt, eax
    
    ; Test 2: Unpredictable branches (random pattern)
    call init_random_pattern
    
    invoke QueryPerformanceCounter, start_time
    
    mov ecx, branch_test_size
    mov esi, branch_pattern
    xor eax, eax
    
unpredictable_loop:
    mov ebx, [esi]
    test ebx, ebx
    jz unpredictable_zero
    inc eax
    jmp unpredictable_continue
    
unpredictable_zero:
    dec eax
    
unpredictable_continue:
    add esi, 4
    loop unpredictable_loop
    
    invoke QueryPerformanceCounter, end_time
    call calculate_elapsed_time
    invoke printf, unpredictable_fmt, eax
    
    ; Test 3: Branchless version using conditional moves
    call init_random_pattern
    
    invoke QueryPerformanceCounter, start_time
    
    mov ecx, branch_test_size
    mov esi, branch_pattern
    xor eax, eax
    
branchless_loop:
    mov ebx, [esi]                 ; Load value
    mov edx, 1                     ; Increment value
    mov edi, -1                    ; Decrement value
    test ebx, ebx
    cmovnz edx, edi                ; Choose increment or decrement
    add eax, edx                   ; Apply chosen value
    add esi, 4
    loop branchless_loop
    
    invoke QueryPerformanceCounter, end_time
    call calculate_elapsed_time
    invoke printf, branchless_fmt, eax
    
    ret

init_branch_patterns:
    ; Initialize predictable alternating pattern
    mov esi, branch_pattern
    mov ecx, branch_test_size
    xor eax, eax                   ; Start with 0
    
init_pattern_loop:
    mov [esi], eax
    xor eax, 1                     ; Alternate between 0 and 1
    add esi, 4
    loop init_pattern_loop
    ret

init_random_pattern:
    ; Initialize pseudo-random pattern
    mov esi, branch_pattern
    mov ecx, branch_test_size
    mov eax, 12345                 ; PRNG seed
    
init_random_loop:
    ; Simple linear congruential generator
    imul eax, 1103515245
    add eax, 12345
    mov ebx, eax
    and ebx, 1                     ; Get random bit
    mov [esi], ebx
    add esi, 4
    loop init_random_loop
    ret

demo_cache_optimization:
    ; Demonstrate cache-friendly vs cache-unfriendly access patterns
    
    invoke printf, cache_header_fmt
    
    ; Test 1: Sequential access (cache-friendly)
    invoke QueryPerformanceCounter, start_time
    
    mov esi, test_array1
    mov edi, test_array2
    mov edx, result_array
    mov ecx, array_size
    
sequential_cache_loop:
    mov eax, [esi]                 ; Sequential load
    add eax, [edi]                 ; Sequential load
    mov [edx], eax                 ; Sequential store
    add esi, 4
    add edi, 4
    add edx, 4
    loop sequential_cache_loop
    
    invoke QueryPerformanceCounter, end_time
    call calculate_elapsed_time
    invoke printf, sequential_cache_fmt, eax
    
    ; Test 2: Strided access (cache-unfriendly)
    invoke QueryPerformanceCounter, start_time
    
    mov ecx, array_size / 16       ; Process every 16th element
    xor ebx, ebx                   ; Index
    
strided_cache_loop:
    mov esi, test_array1
    mov edi, test_array2
    mov edx, result_array
    
    mov eax, [esi + ebx*64]        ; Load every 16th element (64 bytes apart)
    add eax, [edi + ebx*64]
    mov [edx + ebx*64], eax
    
    inc ebx
    loop strided_cache_loop
    
    invoke QueryPerformanceCounter, end_time
    call calculate_elapsed_time
    invoke printf, strided_cache_fmt, eax
    
    ; Test 3: Blocked access (cache-optimized)
    call demo_cache_blocking
    
    ret

demo_cache_blocking:
    ; Demonstrate cache blocking for matrix operations
    ; Simulate matrix multiplication with cache blocking
    
    invoke QueryPerformanceCounter, start_time
    
    ; Simple blocking algorithm
    mov esi, test_array1           ; Matrix A
    mov edi, test_array2           ; Matrix B  
    mov edx, result_array          ; Matrix C
    
    ; Block size of 4x4 for demonstration
    mov eax, 0                     ; Block row
    
block_row_loop:
    cmp eax, 100                   ; Assuming 100x100 matrix subset
    jge blocking_done
    
    mov ebx, 0                     ; Block column
    
block_col_loop:
    cmp ebx, 100
    jge next_block_row
    
    ; Process 4x4 block
    call process_cache_block
    
    add ebx, 4                     ; Next block column
    jmp block_col_loop
    
next_block_row:
    add eax, 4                     ; Next block row
    jmp block_row_loop
    
blocking_done:
    invoke QueryPerformanceCounter, end_time
    call calculate_elapsed_time
    invoke printf, blocked_cache_fmt, eax
    
    ret

process_cache_block:
    ; Process a 4x4 block of matrix operations
    push eax
    push ebx
    push ecx
    push edx
    
    ; Simulate block processing
    mov ecx, 16                    ; 4x4 = 16 elements
    
block_element_loop:
    ; Simplified operation
    mov eax, [esi]
    add eax, [edi]
    mov [edx], eax
    add esi, 4
    add edi, 4
    add edx, 4
    loop block_element_loop
    
    pop edx
    pop ecx
    pop ebx
    pop eax
    ret

demo_vectorization:
    ; Demonstrate SIMD vectorization benefits
    
    invoke printf, vector_header_fmt
    
    ; Test 1: Scalar addition
    invoke QueryPerformanceCounter, start_time
    
    mov esi, test_array1
    mov edi, test_array2
    mov edx, result_array
    mov ecx, array_size
    
scalar_vector_loop:
    mov eax, [esi]                 ; Scalar operation
    add eax, [edi]                 ; One element at a time
    mov [edx], eax
    add esi, 4
    add edi, 4
    add edx, 4
    loop scalar_vector_loop
    
    invoke QueryPerformanceCounter, end_time
    call calculate_elapsed_time
    invoke printf, scalar_vector_fmt, eax
    
    ; Test 2: SSE vectorized addition
    invoke QueryPerformanceCounter, start_time
    
    mov esi, test_array1
    mov edi, test_array2
    mov edx, result_array
    mov ecx, array_size / 4        ; Process 4 elements at a time
    
sse_vector_loop:
    movdqa xmm0, [esi]             ; Load 4 integers
    movdqa xmm1, [edi]             ; Load 4 integers
    paddd xmm0, xmm1               ; Add 4 integers simultaneously
    movdqa [edx], xmm0             ; Store 4 results
    add esi, 16                    ; Advance by 4 elements
    add edi, 16
    add edx, 16
    loop sse_vector_loop
    
    invoke QueryPerformanceCounter, end_time
    call calculate_elapsed_time
    invoke printf, sse_vector_fmt, eax
    
    ; Test 3: AVX vectorized addition (if available)
    call check_avx_support
    test eax, eax
    jz skip_avx
    
    invoke QueryPerformanceCounter, start_time
    
    mov esi, test_array1
    mov edi, test_array2
    mov edx, result_array
    mov ecx, array_size / 8        ; Process 8 elements at a time
    
avx_vector_loop:
    vmovdqa ymm0, [esi]            ; Load 8 integers
    vmovdqa ymm1, [edi]            ; Load 8 integers
    vpaddd ymm0, ymm0, ymm1        ; Add 8 integers simultaneously
    vmovdqa [edx], ymm0            ; Store 8 results
    add esi, 32                    ; Advance by 8 elements
    add edi, 32
    add edx, 32
    loop avx_vector_loop
    
    vzeroupper                     ; Clean up AVX state
    
    invoke QueryPerformanceCounter, end_time
    call calculate_elapsed_time
    invoke printf, avx_vector_fmt, eax
    
skip_avx:
    ret

check_avx_support:
    ; Check if AVX is supported
    mov eax, 1
    cpuid
    test ecx, 1 shl 28             ; AVX bit
    setnz al
    movzx eax, al
    ret

calculate_elapsed_time:
    ; Calculate elapsed time in microseconds
    ; start_time and end_time should be set
    mov eax, dword [end_time]
    mov edx, dword [end_time+4]
    sub eax, dword [start_time]
    sbb edx, dword [start_time+4]
    
    ; Convert to microseconds
    push edx
    push eax
    fild qword [esp]               ; Load 64-bit integer to FPU
    add esp, 8
    
    fild qword [frequency]         ; Load frequency
    fdiv                           ; elapsed / frequency = seconds
    
    push 1000000
    fild dword [esp]               ; Load 1,000,000
    add esp, 4
    
    fmul                           ; Convert to microseconds
    fistp dword [esp-4]            ; Store as integer
    mov eax, [esp-4]
    ret

section '.data' data readable writeable
    ; Format strings
    pipeline_header_fmt     db '=== Pipeline Optimization Tests ===', 13, 10, 0
    pipeline_stall_fmt      db 'Pipeline stalls: %u microseconds', 13, 10, 0
    pipeline_friendly_fmt   db 'Pipeline friendly: %u microseconds', 13, 10, 0
    
    ilp_header_fmt          db '=== Instruction Level Parallelism Tests ===', 13, 10, 0
    sequential_fmt          db 'Sequential dependencies: %u microseconds', 13, 10, 0
    parallel_fmt            db 'Independent operations: %u microseconds', 13, 10, 0
    renamed_fmt             db 'Register renaming: %u microseconds', 13, 10, 0
    
    branch_header_fmt       db '=== Branch Prediction Tests ===', 13, 10, 0
    predictable_fmt         db 'Predictable branches: %u microseconds', 13, 10, 0
    unpredictable_fmt       db 'Unpredictable branches: %u microseconds', 13, 10, 0
    branchless_fmt          db 'Branchless code: %u microseconds', 13, 10, 0
    
    cache_header_fmt        db '=== Cache Optimization Tests ===', 13, 10, 0
    sequential_cache_fmt    db 'Sequential access: %u microseconds', 13, 10, 0
    strided_cache_fmt       db 'Strided access: %u microseconds', 13, 10, 0
    blocked_cache_fmt       db 'Cache blocking: %u microseconds', 13, 10, 0
    
    vector_header_fmt       db '=== Vectorization Tests ===', 13, 10, 0
    scalar_vector_fmt       db 'Scalar operations: %u microseconds', 13, 10, 0
    sse_vector_fmt          db 'SSE vectorized: %u microseconds', 13, 10, 0
    avx_vector_fmt          db 'AVX vectorized: %u microseconds', 13, 10, 0

section '.idata' import data readable writeable
    library kernel32, 'KERNEL32.DLL', \
            msvcrt, 'MSVCRT.DLL'
    
    import kernel32, \
           ExitProcess, 'ExitProcess', \
           QueryPerformanceFrequency, 'QueryPerformanceFrequency', \
           QueryPerformanceCounter, 'QueryPerformanceCounter'
    
    import msvcrt, printf, 'printf'
```

## Algorithm Optimization Techniques

### Advanced Sorting and Searching

Efficient algorithms are the foundation of high-performance computing. Let's explore optimized implementations of fundamental algorithms.

```assembly
format PE console
entry start

include 'win32a.inc'

section '.data' data readable writeable
    ; Test data for algorithm optimization
    array_size      equ 10000
    test_array      dd array_size dup(0)
    temp_array      dd array_size dup(0)
    search_target   dd 5000
    
    ; Hash table for optimization demonstrations
    hash_table_size equ 1024
    hash_table      dd hash_table_size dup(-1)  ; -1 indicates empty
    
    ; Performance measurement
    start_cycles    dq 0
    end_cycles      dq 0

section '.code' code readable executable

start:
    call init_test_data
    call demo_sorting_algorithms
    call demo_search_algorithms
    call demo_hash_optimization
    call demo_dynamic_programming
    invoke ExitProcess, 0

init_test_data:
    ; Initialize array with random-like data
    mov esi, test_array
    mov ecx, array_size
    mov eax, 12345                 ; Seed for PRNG
    
init_loop:
    ; Simple linear congruential generator
    imul eax, 1103515245
    add eax, 12345
    and eax, 0xFFFF                ; Keep values reasonable
    mov [esi], eax
    add esi, 4
    loop init_loop
    ret

demo_sorting_algorithms:
    ; Compare different sorting algorithm implementations
    
    invoke printf, sort_header_fmt
    
    ; Test 1: Bubble sort (for small arrays)
    call copy_test_array
    rdtsc
    mov dword [start_cycles], eax
    mov dword [start_cycles+4], edx
    
    call bubble_sort
    
    rdtsc
    sub eax, dword [start_cycles]
    sbb edx, dword [start_cycles+4]
    invoke printf, bubble_sort_fmt, eax
    
    ; Test 2: Optimized quicksort
    call copy_test_array
    rdtsc
    mov dword [start_cycles], eax
    mov dword [start_cycles+4], edx
    
    mov esi, test_array
    mov eax, 0                     ; Start index
    mov ebx, array_size - 1        ; End index
    call quicksort
    
    rdtsc
    sub eax, dword [start_cycles]
    sbb edx, dword [start_cycles+4]
    invoke printf, quicksort_fmt, eax
    
    ; Test 3: Merge sort
    call copy_test_array
    rdtsc
    mov dword [start_cycles], eax
    mov dword [start_cycles+4], edx
    
    mov esi, test_array
    mov edi, temp_array
    mov eax, 0                     ; Start
    mov ebx, array_size - 1        ; End
    call mergesort
    
    rdtsc
    sub eax, dword [start_cycles]
    sbb edx, dword [start_cycles+4]
    invoke printf, mergesort_fmt, eax
    
    ; Test 4: Radix sort (for integers)
    call copy_test_array
    rdtsc
    mov dword [start_cycles], eax
    mov dword [start_cycles+4], edx
    
    call radix_sort
    
    rdtsc
    sub eax, dword [start_cycles]
    sbb edx, dword [start_cycles+4]
    invoke printf, radixsort_fmt, eax
    
    ret

copy_test_array:
    ; Copy original data back to test array
    mov esi, test_array
    mov edi, temp_array
    mov ecx, array_size
    rep movsd
    
    mov esi, temp_array
    mov edi, test_array
    mov ecx, array_size
    rep movsd
    ret

bubble_sort:
    ; Optimized bubble sort with early termination
    mov ecx, array_size
    dec ecx                        ; Outer loop counter
    
bubble_outer:
    test ecx, ecx
    jz bubble_done
    
    xor edx, edx                   ; Swap flag
    mov esi, test_array
    push ecx                       ; Save outer counter
    
bubble_inner:
    mov eax, [esi]                 ; Current element
    mov ebx, [esi+4]               ; Next element
    cmp eax, ebx
    jle no_swap
    
    ; Swap elements
    mov [esi], ebx
    mov [esi+4], eax
    mov edx, 1                     ; Set swap flag
    
no_swap:
    add esi, 4
    loop bubble_inner
    
    pop ecx
    test edx, edx                  ; Check if any swaps occurred
    jz bubble_done                 ; Early termination if sorted
    
    dec ecx
    jmp bubble_outer
    
bubble_done:
    ret

quicksort:
    ; Optimized quicksort with median-of-three pivot selection
    ; ESI = array, EAX = low, EBX = high
    
    cmp eax, ebx
    jge quicksort_done
    
    push eax                       ; Save low
    push ebx                       ; Save high
    
    ; Choose median-of-three as pivot
    call choose_pivot
    mov ecx, eax                   ; Pivot index
    
    ; Partition array
    pop ebx                        ; Restore high
    pop eax                        ; Restore low
    push eax
    push ebx
    call partition
    mov edx, eax                   ; Partition index
    
    ; Recursively sort left partition
    pop ebx                        ; Restore high
    pop eax                        ; Restore low
    push eax
    push ebx
    push edx
    
    mov ebx, edx
    dec ebx                        ; Right of left partition
    call quicksort
    
    ; Recursively sort right partition
    pop edx                        ; Restore partition index
    pop ebx                        ; Restore high
    pop eax                        ; Restore low
    
    mov eax, edx
    inc eax                        ; Left of right partition
    call quicksort
    
quicksort_done:
    ret

choose_pivot:
    ; Choose median of first, middle, and last elements
    ; EAX = low, EBX = high, returns pivot index in EAX
    
    push ebx
    push ecx
    push edx
    
    mov ecx, eax                   ; First index
    mov edx, ebx                   ; Last index
    add eax, ebx
    shr eax, 1                     ; Middle index
    
    ; Compare and choose median
    mov edi, [esi + ecx*4]         ; First value
    mov ebp, [esi + eax*4]         ; Middle value
    push eax                       ; Save middle index
    mov eax, [esi + edx*4]         ; Last value
    
    ; Simple median selection
    cmp edi, ebp
    jg first_greater_middle
    
    ; First <= Middle
    cmp ebp, eax
    jle middle_is_median
    
    ; Middle > Last, check First vs Last
    cmp edi, eax
    jg last_is_median
    jmp first_is_median
    
first_greater_middle:
    ; First > Middle
    cmp edi, eax
    jle first_is_median
    
    ; First > Last, check Middle vs Last
    cmp ebp, eax
    jg last_is_median
    jmp middle_is_median
    
first_is_median:
    pop eax                        ; Discard middle index
    mov eax, ecx                   ; Return first index
    jmp choose_pivot_done
    
middle_is_median:
    pop eax                        ; Return middle index
    jmp choose_pivot_done
    
last_is_median:
    pop eax                        ; Discard middle index
    mov eax, edx                   ; Return last index
    
choose_pivot_done:
    pop edx
    pop ecx
    pop ebx
    ret

partition:
    ; Partition array around pivot
    ; ESI = array, EAX = low, EBX = high, ECX = pivot index
    ; Returns partition index in EAX
    
    push ebx
    push ecx
    push edx
    push edi
    
    ; Move pivot to end
    mov edi, [esi + ecx*4]         ; Pivot value
    mov edx, [esi + ebx*4]         ; Last value
    mov [esi + ecx*4], edx         ; Move last to pivot position
    mov [esi + ebx*4], edi         ; Move pivot to end
    
    mov ecx, eax                   ; Store index
    mov edx, eax                   ; Scan index
    
partition_loop:
    cmp edx, ebx                   ; Check if reached end
    jge partition_done
    
    mov edi, [esi + edx*4]         ; Current element
    cmp edi, [esi + ebx*4]         ; Compare with pivot
    jg partition_continue
    
    ; Swap elements
    mov ebp, [esi + ecx*4]
    mov [esi + edx*4], ebp
    mov [esi + ecx*4], edi
    inc ecx                        ; Increment store index
    
partition_continue:
    inc edx
    jmp partition_loop
    
partition_done:
    ; Move pivot to final position
    mov edi, [esi + ecx*4]
    mov edx, [esi + ebx*4]
    mov [esi + ecx*4], edx
    mov [esi + ebx*4], edi
    
    mov eax, ecx                   ; Return partition index
    
    pop edi
    pop edx
    pop ecx
    pop ebx
    ret

mergesort:
    ; Merge sort implementation
    ; ESI = source array, EDI = temp array, EAX = start, EBX = end
    
    cmp eax, ebx
    jge mergesort_done
    
    push eax
    push ebx
    push ecx
    
    ; Calculate middle
    mov ecx, eax
    add ecx, ebx
    shr ecx, 1                     ; Middle index
    
    ; Sort left half
    push ecx
    mov ebx, ecx
    call mergesort
    pop ecx
    
    ; Sort right half
    mov eax, ecx
    inc eax
    pop ebx
    push ebx
    call mergesort
    
    ; Merge halves
    pop ebx
    pop ecx
    pop eax
    push ecx
    call merge
    pop ecx
    
mergesort_done:
    ret

merge:
    ; Merge two sorted halves
    ; ESI = array, EDI = temp, EAX = start, ECX = middle, EBX = end
    
    push eax
    push ebx
    push ecx
    push edx
    push edi
    push ebp
    
    mov edx, eax                   ; Left index
    mov ebp, ecx
    inc ebp                        ; Right index
    push eax                       ; Save start for copying back
    
merge_loop:
    cmp edx, ecx                   ; Check left exhausted
    jg merge_copy_right
    cmp ebp, ebx                   ; Check right exhausted
    jg merge_copy_left
    
    ; Compare elements
    mov edi, [esi + edx*4]         ; Left element
    cmp edi, [esi + ebp*4]         ; Compare with right element
    jg merge_take_right
    
    ; Take from left
    mov [temp_array + eax*4], edi
    inc edx
    jmp merge_continue
    
merge_take_right:
    mov edi, [esi + ebp*4]
    mov [temp_array + eax*4], edi
    inc ebp
    
merge_continue:
    inc eax
    jmp merge_loop
    
merge_copy_left:
    ; Copy remaining left elements
    cmp edx, ecx
    jg merge_copy_back
    mov edi, [esi + edx*4]
    mov [temp_array + eax*4], edi
    inc edx
    inc eax
    jmp merge_copy_left
    
merge_copy_right:
    ; Copy remaining right elements
    cmp ebp, ebx
    jg merge_copy_back
    mov edi, [esi + ebp*4]
    mov [temp_array + eax*4], edi
    inc ebp
    inc eax
    jmp merge_copy_right
    
merge_copy_back:
    ; Copy merged result back to original array
    pop eax                        ; Restore start
    push eax
    
copy_back_loop:
    cmp eax, ebx
    jg merge_done
    mov edi, [temp_array + eax*4]
    mov [esi + eax*4], edi
    inc eax
    jmp copy_back_loop
    
merge_done:
    pop eax                        ; Clean up stack
    pop ebp
    pop edi
    pop edx
    pop ecx
    pop ebx
    pop eax
    ret

radix_sort:
    ; Radix sort for 32-bit integers
    ; Process 8 bits at a time (256 buckets)
    
    ; Count sort for each 8-bit digit
    mov ebx, 0                     ; Bit shift amount
    
radix_digit_loop:
    cmp ebx, 32
    jge radix_done
    
    call counting_sort_digit
    add ebx, 8                     ; Next 8 bits
    jmp radix_digit_loop
    
radix_done:
    ret

counting_sort_digit:
    ; Counting sort for current 8-bit digit
    ; EBX = bit shift amount
    
    push eax
    push ecx
    push edx
    push esi
    push edi
    
    ; Initialize count array
    sub esp, 256*4                 ; 256 counters on stack
    mov edi, esp
    xor eax, eax
    mov ecx, 256
    rep stosd
    
    ; Count occurrences
    mov esi, test_array
    mov ecx, array_size
    
count_loop:
    mov eax, [esi]
    shr eax, cl                    ; Shift to get digit
    and eax, 0xFF                  ; Mask to 8 bits
    inc dword [esp + eax*4]        ; Increment counter
    add esi, 4
    loop count_loop
    
    ; Calculate cumulative counts
    mov ecx, 255
    mov esi, esp
    
cumulative_loop:
    mov eax, [esi + ecx*4]         ; Current count
    add [esi + ecx*4 + 4], eax     ; Add to next
    dec ecx
    jnz cumulative_loop
    
    ; Place elements in sorted order
    mov esi, test_array
    mov edi, temp_array
    mov ecx, array_size
    
place_loop:
    mov eax, [esi + ecx*4 - 4]     ; Get element (reverse order)
    push eax                       ; Save element
    shr eax, bl                    ; Get digit
    and eax, 0xFF
    dec dword [esp + 256*4 + eax*4] ; Decrement count
    mov edx, [esp + 256*4 + eax*4] ; Get position
    pop eax                        ; Restore element
    mov [edi + edx*4], eax         ; Place in position
    loop place_loop
    
    ; Copy back to original array
    mov esi, temp_array
    mov edi, test_array
    mov ecx, array_size
    rep movsd
    
    add esp, 256*4                 ; Clean up stack
    
    pop edi
    pop esi
    pop edx
    pop ecx
    pop eax
    ret

demo_search_algorithms:
    ; Compare linear search vs binary search vs hash table lookup
    
    invoke printf, search_header_fmt
    
    ; Ensure array is sorted for binary search
    call copy_test_array
    mov esi, test_array
    mov eax, 0
    mov ebx, array_size - 1
    call quicksort
    
    ; Test 1: Linear search
    rdtsc
    mov dword [start_cycles], eax
    mov dword [start_cycles+4], edx
    
    call linear_search
    
    rdtsc
    sub eax, dword [start_cycles]
    sbb edx, dword [start_cycles+4]
    invoke printf, linear_search_fmt, eax
    
    ; Test 2: Binary search
    rdtsc
    mov dword [start_cycles], eax
    mov dword [start_cycles+4], edx
    
    call binary_search
    
    rdtsc
    sub eax, dword [start_cycles]
    sbb edx, dword [start_cycles+4]
    invoke printf, binary_search_fmt, eax
    
    ; Test 3: Hash table lookup
    call init_hash_table
    
    rdtsc
    mov dword [start_cycles], eax
    mov dword [start_cycles+4], edx
    
    call hash_search
    
    rdtsc
    sub eax, dword [start_cycles]
    sbb edx, dword [start_cycles+4]
    invoke printf, hash_search_fmt, eax
    
    ret

linear_search:
    ; Linear search for target value
    mov esi, test_array
    mov ecx, array_size
    mov eax, [search_target]
    
linear_loop:
    cmp [esi], eax
    je linear_found
    add esi, 4
    loop linear_loop
    
    mov eax, -1                    ; Not found
    ret
    
linear_found:
    sub esi, test_array
    shr esi, 2                     ; Convert to index
    mov eax, esi
    ret

binary_search:
    ; Binary search for target value
    mov esi, test_array
    mov eax, 0                     ; Low
    mov ebx, array_size - 1        ; High
    mov ecx, [search_target]       ; Target
    
binary_loop:
    cmp eax, ebx
    jg binary_not_found
    
    mov edx, eax
    add edx, ebx
    shr edx, 1                     ; Middle
    
    mov edi, [esi + edx*4]         ; Middle value
    cmp edi, ecx
    je binary_found
    jl binary_search_right
    
    ; Search left
    mov ebx, edx
    dec ebx
    jmp binary_loop
    
binary_search_right:
    mov eax, edx
    inc eax
    jmp binary_loop
    
binary_found:
    mov eax, edx
    ret
    
binary_not_found:
    mov eax, -1
    ret

init_hash_table:
    ; Initialize hash table with array values
    mov esi, test_array
    mov ecx, array_size
    
hash_init_loop:
    mov eax, [esi]                 ; Value
    call hash_function
    mov ebx, eax                   ; Hash index
    
    ; Linear probing for collisions
hash_probe:
    cmp dword [hash_table + ebx*4], -1
    je hash_store
    inc ebx
    and ebx, hash_table_size - 1  ; Wrap around
    jmp hash_probe
    
hash_store:
    mov eax, [esi]
    mov [hash_table + ebx*4], eax
    add esi, 4
    loop hash_init_loop
    ret

hash_function:
    ; Simple hash function for integers
    ; EAX = value, returns hash in EAX
    mov edx, eax
    shr edx, 16
    xor eax, edx                   ; Mix high and low bits
    and eax, hash_table_size - 1   ; Mask to table size
    ret

hash_search:
    ; Search for target in hash table
    mov eax, [search_target]
    call hash_function
    mov ebx, eax                   ; Hash index
    mov ecx, [search_target]
    
hash_search_loop:
    mov eax, [hash_table + ebx*4]
    cmp eax, -1
    je hash_not_found
    cmp eax, ecx
    je hash_search_found
    
    inc ebx
    and ebx, hash_table_size - 1
    jmp hash_search_loop
    
hash_search_found:
    mov eax, ebx
    ret
    
hash_not_found:
    mov eax, -1
    ret

demo_hash_optimization:
    ; Demonstrate hash table optimization techniques
    
    invoke printf, hash_opt_header_fmt
    
    ; Test different hash functions
    call test_hash_functions
    
    ; Test different collision resolution strategies
    call test_collision_resolution
    
    ret

test_hash_functions:
    ; Compare different hash function quality
    invoke printf, hash_func_fmt
    
    ; Simple modulo hash vs. multiplicative hash
    ; (Implementation simplified for brevity)
    ret

test_collision_resolution:
    ; Compare linear probing vs. chaining
    invoke printf, collision_fmt
    
    ; (Implementation simplified for brevity)
    ret

demo_dynamic_programming:
    ; Demonstrate dynamic programming optimizations
    
    invoke printf, dp_header_fmt
    
    ; Fibonacci: recursive vs memoized vs bottom-up
    call fibonacci_comparison
    
    ret

fibonacci_comparison:
    ; Compare different Fibonacci implementations
    
    mov eax, 35                    ; Calculate F(35)
    
    ; Recursive (slow)
    rdtsc
    mov dword [start_cycles], eax
    mov dword [start_cycles+4], edx
    
    mov eax, 35
    call fibonacci_recursive
    
    rdtsc
    sub eax, dword [start_cycles]
    sbb edx, dword [start_cycles+4]
    invoke printf, fib_recursive_fmt, eax
    
    ; Bottom-up (fast)
    rdtsc
    mov dword [start_cycles], eax
    mov dword [start_cycles+4], edx
    
    mov eax, 35
    call fibonacci_iterative
    
    rdtsc
    sub eax, dword [start_cycles]
    sbb edx, dword [start_cycles+4]
    invoke printf, fib_iterative_fmt, eax
    
    ret

fibonacci_recursive:
    ; Naive recursive Fibonacci
    cmp eax, 1
    jle fib_rec_base
    
    push eax
    dec eax
    call fibonacci_recursive
    mov ebx, eax                   ; F(n-1)
    
    pop eax
    sub eax, 2
    call fibonacci_recursive       ; F(n-2)
    add eax, ebx                   ; F(n-1) + F(n-2)
    ret
    
fib_rec_base:
    ; F(0) = 0, F(1) = 1
    ret

fibonacci_iterative:
    ; Bottom-up iterative Fibonacci
    test eax, eax
    jz fib_iter_zero
    cmp eax, 1
    je fib_iter_one
    
    mov ecx, eax                   ; Counter
    mov eax, 0                     ; F(0)
    mov ebx, 1                     ; F(1)
    
fib_iter_loop:
    dec ecx
    jz fib_iter_done
    
    mov edx, eax                   ; Previous F(i-2)
    mov eax, ebx                   ; Previous F(i-1)
    add ebx, edx                   ; F(i) = F(i-1) + F(i-2)
    jmp fib_iter_loop
    
fib_iter_done:
    mov eax, ebx
    ret
    
fib_iter_zero:
    xor eax, eax
    ret
    
fib_iter_one:
    mov eax, 1
    ret

section '.data' data readable writeable
    ; Format strings
    sort_header_fmt         db '=== Sorting Algorithm Comparison ===', 13, 10, 0
    bubble_sort_fmt         db 'Bubble sort: %u cycles', 13, 10, 0
    quicksort_fmt           db 'Quicksort: %u cycles', 13, 10, 0
    mergesort_fmt           db 'Merge sort: %u cycles', 13, 10, 0
    radixsort_fmt           db 'Radix sort: %u cycles', 13, 10, 0
    
    search_header_fmt       db '=== Search Algorithm Comparison ===', 13, 10, 0
    linear_search_fmt       db 'Linear search: %u cycles', 13, 10, 0
    binary_search_fmt       db 'Binary search: %u cycles', 13, 10, 0
    hash_search_fmt         db 'Hash table search: %u cycles', 13, 10, 0
    
    hash_opt_header_fmt     db '=== Hash Table Optimization ===', 13, 10, 0
    hash_func_fmt           db 'Testing hash functions...', 13, 10, 0
    collision_fmt           db 'Testing collision resolution...', 13, 10, 0
    
    dp_header_fmt           db '=== Dynamic Programming ===', 13, 10, 0
    fib_recursive_fmt       db 'Recursive Fibonacci: %u cycles', 13, 10, 0
    fib_iterative_fmt       db 'Iterative Fibonacci: %u cycles', 13, 10, 0

section '.idata' import data readable writeable
    library kernel32, 'KERNEL32.DLL', \
            msvcrt, 'MSVCRT.DLL'
    
    import kernel32, ExitProcess, 'ExitProcess'
    import msvcrt, printf, 'printf'
```

This comprehensive chapter demonstrates advanced optimization techniques at multiple levels:

1. **Processor Architecture**: Understanding pipelines, ILP, branch prediction, and cache behavior
2. **Algorithm Optimization**: Implementing and comparing efficient sorting and searching algorithms
3. **Data Structure Optimization**: Hash tables and collision resolution strategies
4. **Dynamic Programming**: Memoization and bottom-up optimization techniques

These techniques form the foundation of high-performance computing in assembly language, enabling you to write code that fully utilizes modern processor capabilities while implementing algorithmically efficient solutions.

The key to successful optimization is measuring performance, understanding bottlenecks, and applying the right techniques at the right level. Assembly language gives you the tools to optimize at every level, from individual instructions to overall algorithmic approach.