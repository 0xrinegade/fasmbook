# Chapter 6: Program Flow - The Story Your Code Tells  
*Building Logic That Breathes*

Every program tells a story. It has a beginning (initialization), a middle (processing), and an end (cleanup and termination). Between these major plot points, your program makes decisions, repeats actions, and responds to unexpected events. The art of program flow is about making these stories not just functional, but elegant, efficient, and maintainable.

In this chapter, we'll explore how to craft program logic that flows naturally from one operation to the next. You'll learn to write code that's not just correct, but beautiful—code that expresses its intent clearly and executes efficiently. We'll cover everything from simple conditionals to complex state machines, always with an eye toward performance and maintainability.

## Making Decisions with Branches and Jumps

### The Art of Conditional Logic

Every decision in your program ultimately comes down to a comparison and a branch. But there's a vast difference between crude jump-based logic and elegant conditional structures. Let's start with the fundamentals and build toward sophistication.

```assembly
format PE console
entry start

include 'win32a.inc'

section '.data' data readable writeable
    number      dd 0
    prompt      db 'Enter a number: ', 0
    positive_msg db 'The number is positive', 13, 10, 0
    negative_msg db 'The number is negative', 13, 10, 0
    zero_msg    db 'The number is zero', 13, 10, 0
    input_fmt   db '%d', 0

section '.code' code readable executable

; Naive approach - multiple comparisons
classify_number_basic:
    ; Get input
    push number
    push input_fmt
    call [scanf]
    add esp, 8
    
    ; Check for zero
    mov eax, [number]
    cmp eax, 0
    je zero_case
    
    ; Check for positive
    cmp eax, 0
    jg positive_case
    
    ; Must be negative
    push negative_msg
    call [printf]
    add esp, 4
    jmp done_basic
    
zero_case:
    push zero_msg
    call [printf]
    add esp, 4
    jmp done_basic
    
positive_case:
    push positive_msg
    call [printf]
    add esp, 4
    
done_basic:
    ret

; Optimized approach - structured flow
classify_number_optimized:
    ; Get input
    push number
    push input_fmt
    call [scanf]
    add esp, 8
    
    ; Single comparison with structured branching
    mov eax, [number]
    test eax, eax                  ; Test for zero (sets flags)
    jz zero_case_opt               ; Jump if zero
    js negative_case_opt           ; Jump if sign flag set (negative)
    
    ; Fall through to positive case
    push positive_msg
    call [printf]
    add esp, 4
    ret
    
zero_case_opt:
    push zero_msg
    call [printf]
    add esp, 4
    ret
    
negative_case_opt:
    push negative_msg
    call [printf]
    add esp, 4
    ret

start:
    push prompt
    call [printf]
    add esp, 4
    
    call classify_number_optimized
    
    push 0
    call [ExitProcess]

section '.idata' import data readable writeable
    library kernel32, 'KERNEL32.DLL',\
            msvcrt, 'MSVCRT.DLL'
    
    import kernel32,\
           ExitProcess, 'ExitProcess'
    
    import msvcrt,\
           printf, 'printf',\
           scanf, 'scanf'
```

The optimized version is faster because it:
- Uses `TEST` instead of `CMP` with zero (faster)
- Eliminates redundant comparisons
- Uses structured flow with clear fall-through logic

### Advanced Conditional Patterns

For more complex decisions, you need more sophisticated patterns:

```assembly
; Multi-way branching with jump tables
grade_classifier:
    ; EAX = numerical grade (0-100)
    ; Returns letter grade in AL
    
    ; Validate input range
    cmp eax, 100
    ja invalid_grade
    cmp eax, 0
    jb invalid_grade
    
    ; Convert to grade index (0-4 for F,D,C,B,A)
    cmp eax, 90
    jae grade_a
    cmp eax, 80
    jae grade_b
    cmp eax, 70
    jae grade_c
    cmp eax, 60
    jae grade_d
    
    ; Fall through to F
    mov al, 'F'
    ret
    
grade_a:
    mov al, 'A'
    ret
    
grade_b:
    mov al, 'B'
    ret
    
grade_c:
    mov al, 'C'
    ret
    
grade_d:
    mov al, 'D'
    ret
    
invalid_grade:
    mov al, '?'
    ret

; Jump table approach (faster for many cases)
operation_dispatch:
    ; AL = operation code (1-4)
    ; EBX, ECX = operands
    ; Returns result in EAX
    
    cmp al, 4
    ja invalid_operation
    cmp al, 1
    jb invalid_operation
    
    ; Use jump table
    movzx eax, al                  ; Zero-extend operation code
    dec eax                        ; Convert to 0-based index
    jmp [operation_table + eax*4]  ; Jump to handler
    
op_add:
    mov eax, ebx
    add eax, ecx
    ret
    
op_subtract:
    mov eax, ebx
    sub eax, ecx
    ret
    
op_multiply:
    mov eax, ebx
    imul eax, ecx
    ret
    
op_divide:
    test ecx, ecx                  ; Check for division by zero
    jz division_error
    mov eax, ebx
    cdq                            ; Sign-extend for division
    idiv ecx
    ret
    
division_error:
invalid_operation:
    mov eax, -1                    ; Error indicator
    ret

section '.data'
    operation_table dd op_add, op_subtract, op_multiply, op_divide
```

## Creating Elegant Loops That Sing

Loops are the heartbeat of computation. Good loops are efficient, clear, and maintainable. Great loops are works of art that express their purpose perfectly while running at optimal speed.

### The Anatomy of Perfect Loops

```assembly
; Standard counting loop - clear but not optimal
count_characters_basic:
    ; ESI = string pointer
    ; Returns count in EAX
    
    xor eax, eax                   ; Character count
    xor ecx, ecx                   ; Loop counter
    
count_loop_basic:
    mov bl, [esi + ecx]            ; Load character
    test bl, bl                    ; Check for null terminator
    jz count_done_basic            ; Exit if end of string
    
    inc eax                        ; Increment count
    inc ecx                        ; Increment index
    jmp count_loop_basic           ; Continue loop
    
count_done_basic:
    ret

; Optimized loop - pointer arithmetic
count_characters_optimized:
    ; ESI = string pointer  
    ; Returns count in EAX
    
    mov eax, esi                   ; Save start pointer
    
count_loop_opt:
    cmp byte [esi], 0              ; Check for null terminator
    je count_done_opt              ; Exit if found
    inc esi                        ; Advance pointer
    jmp count_loop_opt             ; Continue
    
count_done_opt:
    sub esi, eax                   ; Calculate length (end - start)
    mov eax, esi                   ; Return length
    ret

; High-performance loop - string instructions
count_characters_fast:
    ; ESI = string pointer
    ; Returns count in EAX
    
    mov edi, esi                   ; Copy pointer to EDI
    xor al, al                     ; Search for null byte
    mov ecx, -1                    ; Maximum search length
    repne scasb                    ; Scan for null terminator
    
    not ecx                        ; Convert to positive count
    dec ecx                        ; Subtract 1 for null terminator
    mov eax, ecx                   ; Return count
    ret
```

### Advanced Loop Patterns

**Loop Unrolling for Performance:**
```assembly
; Process array elements - unrolled loop
process_array_unrolled:
    ; ESI = array pointer, ECX = element count
    ; Assumes count is multiple of 4
    
    shr ecx, 2                     ; Divide by 4 (process 4 at a time)
    
unroll_loop:
    ; Process 4 elements in parallel
    mov eax, [esi]                 ; Element 0
    mov ebx, [esi + 4]             ; Element 1
    mov edx, [esi + 8]             ; Element 2  
    mov edi, [esi + 12]            ; Element 3
    
    ; Apply processing to all 4
    add eax, 1000
    add ebx, 1000
    add edx, 1000
    add edi, 1000
    
    ; Store results
    mov [esi], eax
    mov [esi + 4], ebx
    mov [esi + 8], edx
    mov [esi + 12], edi
    
    add esi, 16                    ; Advance by 4 elements
    loop unroll_loop               ; Continue until done
    
    ret
```

**Nested Loops with Optimization:**
```assembly
; Matrix multiplication - optimized nested loops
multiply_matrices:
    ; Matrix A: ESI, Matrix B: EDI, Result: EBX
    ; Size: ECX x ECX (square matrices)
    
    push ebp
    mov ebp, esp
    push ecx                       ; Save matrix size
    
    xor eax, eax                   ; Row index (i)
    
row_loop:
    push eax                       ; Save row index
    xor edx, edx                   ; Column index (j)
    
col_loop:
    push eax                       ; Save indices
    push edx
    
    ; Calculate result[i][j] = sum of A[i][k] * B[k][j]
    xor edi, edi                   ; Accumulator
    xor ecx, ecx                   ; k index
    
inner_loop:
    ; Calculate A[i][k] address
    mov eax, [ebp - 4]             ; Matrix size
    imul eax, [ebp - 8]            ; i * size
    add eax, ecx                   ; + k
    shl eax, 2                     ; * 4 bytes per element
    mov eax, [esi + eax]           ; Load A[i][k]
    
    ; Calculate B[k][j] address
    mov edx, [ebp - 4]             ; Matrix size
    imul edx, ecx                  ; k * size
    add edx, [ebp - 12]            ; + j
    shl edx, 2                     ; * 4 bytes per element
    mov edx, [edi + edx]           ; Load B[k][j]
    
    ; Multiply and accumulate
    imul eax, edx
    add edi, eax
    
    inc ecx                        ; k++
    cmp ecx, [ebp - 4]             ; Compare with size
    jl inner_loop
    
    ; Store result[i][j]
    pop edx                        ; Restore j
    pop eax                        ; Restore i
    
    push eax
    mov eax, [ebp - 4]             ; Matrix size
    imul eax, [ebp - 8]            ; i * size
    add eax, edx                   ; + j
    shl eax, 2                     ; * 4 bytes per element
    mov [ebx + eax], edi           ; Store result
    pop eax
    
    inc edx                        ; j++
    cmp edx, [ebp - 4]             ; Compare with size
    jl col_loop
    
    pop eax                        ; Restore i
    inc eax                        ; i++
    mov [ebp - 8], eax             ; Update stored i
    cmp eax, [ebp - 4]             ; Compare with size
    jl row_loop
    
    mov esp, ebp
    pop ebp
    ret
```

## Exception Handling Like a Professional

Exception handling in assembly requires discipline and careful planning. Unlike high-level languages with automatic exception handling, assembly requires you to explicitly check for and handle error conditions.

### Structured Exception Handling Patterns

```assembly
; Professional file processing with error handling
process_file_safe:
    push ebp
    mov ebp, esp
    push ebx                       ; Save registers
    push esi
    push edi
    
    ; Initialize error state
    xor eax, eax                   ; Success = 0
    mov [error_code], eax
    mov [file_handle], eax
    
    ; Phase 1: Open file
    push 0                         ; Security attributes
    push 0x80                      ; File attributes
    push 3                         ; Open existing
    push 0                         ; Security descriptor
    push 1                         ; Share read
    push 0x80000000                ; Generic read
    push dword [ebp + 8]           ; Filename
    call [CreateFileA]
    
    cmp eax, -1                    ; Check for INVALID_HANDLE_VALUE
    je open_failed
    mov [file_handle], eax         ; Store handle
    
    ; Phase 2: Get file size
    push 0                         ; High-order size
    push eax                       ; File handle
    call [GetFileSize]
    
    cmp eax, -1                    ; Check for error
    je size_failed
    mov [file_size], eax
    
    ; Phase 3: Allocate buffer
    push eax                       ; Size
    call [malloc]
    add esp, 4
    
    test eax, eax                  ; Check allocation
    jz allocation_failed
    mov [buffer_ptr], eax
    
    ; Phase 4: Read file
    push 0                         ; Overlapped
    push bytes_read                ; Bytes read
    push dword [file_size]         ; Bytes to read
    push dword [buffer_ptr]        ; Buffer
    push dword [file_handle]       ; Handle
    call [ReadFile]
    
    test eax, eax                  ; Check success
    jz read_failed
    
    ; Phase 5: Process data (success path)
    mov esi, [buffer_ptr]          ; Source
    mov ecx, [file_size]           ; Size
    call process_buffer            ; Process the data
    
    jmp cleanup                    ; Skip error handlers
    
    ; Error handlers
open_failed:
    mov dword [error_code], 1
    jmp cleanup
    
size_failed:
    mov dword [error_code], 2
    jmp cleanup
    
allocation_failed:
    mov dword [error_code], 3
    jmp cleanup
    
read_failed:
    mov dword [error_code], 4
    
    ; Cleanup phase (always executed)
cleanup:
    ; Free buffer if allocated
    cmp dword [buffer_ptr], 0
    je skip_free
    push dword [buffer_ptr]
    call [free]
    add esp, 4
    
skip_free:
    ; Close file if opened
    cmp dword [file_handle], 0
    je skip_close
    push dword [file_handle]
    call [CloseHandle]
    
skip_close:
    ; Return error code
    mov eax, [error_code]
    
    pop edi                        ; Restore registers
    pop esi
    pop ebx
    mov esp, ebp
    pop ebp
    ret

section '.data'
    error_code   dd 0
    file_handle  dd 0
    file_size    dd 0
    buffer_ptr   dd 0
    bytes_read   dd 0
```

### Error Recovery Strategies

```assembly
; Retry mechanism for unreliable operations
network_send_with_retry:
    ; EDX = data pointer, ECX = data size
    ; Returns: EAX = 0 on success, error code on failure
    
    mov ebx, 3                     ; Maximum retry attempts
    
retry_loop:
    push ebx                       ; Save retry count
    push ecx                       ; Save parameters  
    push edx
    
    ; Attempt the operation
    call network_send_operation
    
    pop edx                        ; Restore parameters
    pop ecx
    pop ebx
    
    test eax, eax                  ; Check result
    jz send_success                ; Success - exit
    
    ; Operation failed - check if we should retry
    cmp eax, ERROR_TIMEOUT         ; Timeout error?
    je attempt_retry
    cmp eax, ERROR_NETWORK_BUSY    ; Network busy?
    je attempt_retry
    
    ; Non-retryable error
    ret                            ; Return error code
    
attempt_retry:
    dec ebx                        ; Decrement retry count
    jz send_failed                 ; No more retries
    
    ; Wait before retry (exponential backoff)
    mov eax, 4                     ; Base delay
    sub eax, ebx                   ; Calculate backoff
    shl eax, 8                     ; Multiply by 256ms
    push eax
    call [Sleep]
    add esp, 4
    
    jmp retry_loop                 ; Try again
    
send_success:
    xor eax, eax                   ; Return success
    ret
    
send_failed:
    mov eax, ERROR_MAX_RETRIES     ; Return failure
    ret

ERROR_TIMEOUT      equ 1
ERROR_NETWORK_BUSY equ 2  
ERROR_MAX_RETRIES  equ 99
```

## Advanced Control Flow Techniques

### State Machines: Elegant Complexity Management

State machines are perfect for handling complex logic with multiple states and transitions:

```assembly
; Text parser state machine
parse_text:
    ; ESI = input text, EDI = output buffer
    ; Parses quoted strings and identifiers
    
    xor eax, eax                   ; Current state (0 = start)
    xor ecx, ecx                   ; Output position
    
parse_loop:
    lodsb                          ; Load next character
    test al, al                    ; Check for end of input
    jz parse_done
    
    ; Dispatch based on current state
    cmp eax, STATE_START
    je state_start
    cmp eax, STATE_IDENTIFIER  
    je state_identifier
    cmp eax, STATE_QUOTED
    je state_quoted
    cmp eax, STATE_ESCAPE
    je state_escape
    
    ; Invalid state - error
    mov eax, -1
    ret
    
state_start:
    ; Starting state - determine what we're parsing
    cmp al, '"'                    ; Quote character?
    je begin_quoted
    cmp al, ' '                    ; Whitespace?
    je parse_loop                  ; Skip whitespace
    cmp al, 9                      ; Tab?
    je parse_loop                  ; Skip tabs
    
    ; Must be start of identifier
    mov eax, STATE_IDENTIFIER      ; Change state
    stosb                          ; Store character
    jmp parse_loop
    
begin_quoted:
    mov eax, STATE_QUOTED          ; Change to quoted state
    ; Don't store the quote character
    jmp parse_loop
    
state_identifier:
    ; In identifier - continue until whitespace
    cmp al, ' '                    ; Space?
    je end_identifier
    cmp al, 9                      ; Tab?
    je end_identifier
    cmp al, 13                     ; Carriage return?
    je end_identifier
    cmp al, 10                     ; Line feed?
    je end_identifier
    
    stosb                          ; Store character
    jmp parse_loop
    
end_identifier:
    mov al, 0                      ; Null terminator
    stosb
    mov eax, STATE_START           ; Return to start state
    jmp parse_loop
    
state_quoted:
    ; In quoted string
    cmp al, '"'                    ; End quote?
    je end_quoted
    cmp al, '\'                    ; Escape character?
    je begin_escape
    
    stosb                          ; Store character
    jmp parse_loop
    
begin_escape:
    mov eax, STATE_ESCAPE          ; Change to escape state
    jmp parse_loop
    
state_escape:
    ; Process escape sequence
    cmp al, 'n'                    ; Newline?
    je escape_newline
    cmp al, 't'                    ; Tab?
    je escape_tab
    cmp al, 'r'                    ; Carriage return?
    je escape_return
    
    ; Default: store character as-is
    stosb
    mov eax, STATE_QUOTED          ; Return to quoted state
    jmp parse_loop
    
escape_newline:
    mov al, 10                     ; Store actual newline
    stosb
    mov eax, STATE_QUOTED
    jmp parse_loop
    
escape_tab:
    mov al, 9                      ; Store actual tab
    stosb  
    mov eax, STATE_QUOTED
    jmp parse_loop
    
escape_return:
    mov al, 13                     ; Store actual carriage return
    stosb
    mov eax, STATE_QUOTED
    jmp parse_loop
    
end_quoted:
    mov al, 0                      ; Null terminator
    stosb
    mov eax, STATE_START           ; Return to start state
    jmp parse_loop
    
parse_done:
    xor eax, eax                   ; Success
    ret

; State constants
STATE_START      equ 0
STATE_IDENTIFIER equ 1
STATE_QUOTED     equ 2
STATE_ESCAPE     equ 3
```

## Chapter Summary and What's Next

In this chapter, you've mastered the art of program flow control. You've learned:

- How to create elegant conditional structures that are both clear and efficient
- Advanced loop patterns including unrolling, optimization, and nested loops
- Professional exception handling techniques for robust code
- State machine implementation for managing complex logic
- Performance optimization techniques for control flow structures

You now understand how to craft program logic that flows naturally while executing efficiently. These skills form the foundation for building larger, more complex programs.

### Practice Exercises

**Exercise 6.1: Command Line Parser**
Build a complete command-line argument parser that handles options, flags, and parameters with proper error checking.

**Exercise 6.2: Expression Evaluator**
Create an expression evaluator that can parse and evaluate mathematical expressions with operator precedence.

**Exercise 6.3: Protocol State Machine**
Implement a network protocol state machine (like HTTP or FTP) that properly handles all states and transitions.

### Advanced Challenges

**Challenge 6.1: Compiler Frontend**
Build a lexical analyzer and parser for a simple programming language, demonstrating advanced state machine usage.

**Challenge 6.2: Game Engine Logic**
Create a game logic system with multiple interacting state machines for different game objects.

### Looking Ahead

In Chapter 7, we'll explore functions—the building blocks of greatness. You'll learn to design and implement functions that are not just reusable, but elegant and efficient. We'll cover calling conventions, parameter passing, stack management, and advanced function techniques that professional programmers use to build maintainable systems.

The control flow skills you've learned here will be essential as we explore how functions interact and how to manage program state across function boundaries.

*"Program flow is the choreography of computation. Master it, and your programs will dance with grace and purpose."*