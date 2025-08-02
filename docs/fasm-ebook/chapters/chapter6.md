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
    number          dd 0
    prompt          db 'Enter a number: ', 0
    positive_msg    db 'The number is positive', 13, 10, 0
    negative_msg    db 'The number is negative', 13, 10, 0
    zero_msg        db 'The number is zero', 13, 10, 0
    input_fmt       db '%d', 0
    
    ; Data for complex decision structures
    grade           dd 0
    grade_prompt    db 'Enter a grade (0-100): ', 0
    grade_a_msg     db 'Grade A: Excellent!', 13, 10, 0
    grade_b_msg     db 'Grade B: Good work!', 13, 10, 0
    grade_c_msg     db 'Grade C: Satisfactory', 13, 10, 0
    grade_d_msg     db 'Grade D: Needs improvement', 13, 10, 0
    grade_f_msg     db 'Grade F: Failing', 13, 10, 0
    invalid_msg     db 'Invalid grade!', 13, 10, 0

section '.code' code readable executable

start:
    ; Demonstrate different decision-making patterns
    call demo_simple_conditions
    call demo_complex_conditions
    call demo_switch_structures
    call demo_conditional_optimization
    invoke ExitProcess, 0

demo_simple_conditions:
    ; Get input from user
    invoke printf, prompt
    invoke scanf, input_fmt, number
    
    ; Simple three-way decision
    mov eax, [number]
    test eax, eax                  ; Test if zero
    jz number_is_zero              ; Jump if zero flag set
    js number_is_negative          ; Jump if sign flag set (negative)
    
    ; If we reach here, number is positive
    invoke printf, positive_msg
    jmp simple_done
    
number_is_zero:
    invoke printf, zero_msg
    jmp simple_done
    
number_is_negative:
    invoke printf, negative_msg
    
simple_done:
    ret

demo_complex_conditions:
    ; Demonstrate complex conditional logic with multiple conditions
    ; Example: Determine if a year is a leap year
    
    mov eax, 2024                  ; Test year
    call is_leap_year
    test eax, eax
    jz not_leap
    invoke printf, leap_year_msg
    jmp leap_done
    
not_leap:
    invoke printf, not_leap_msg
    
leap_done:
    ret

is_leap_year:
    ; Leap year algorithm: divisible by 4, except centuries unless divisible by 400
    ; Input: EAX = year
    ; Output: EAX = 1 if leap year, 0 if not
    
    push ebx
    push edx
    
    ; Check if divisible by 4
    mov ebx, eax                   ; Save original year
    xor edx, edx
    mov ecx, 4
    div ecx
    test edx, edx                  ; Check remainder
    jnz not_leap_year              ; Not divisible by 4
    
    ; Check if century year (divisible by 100)
    mov eax, ebx                   ; Restore year
    xor edx, edx
    mov ecx, 100
    div ecx
    test edx, edx
    jnz is_leap_year               ; Not century year, so it's leap
    
    ; Century year - must be divisible by 400
    mov eax, ebx                   ; Restore year
    xor edx, edx
    mov ecx, 400
    div ecx
    test edx, edx
    jz is_leap_year                ; Divisible by 400
    
not_leap_year:
    xor eax, eax                   ; Return 0
    jmp leap_year_done
    
is_leap_year:
    mov eax, 1                     ; Return 1
    
leap_year_done:
    pop edx
    pop ebx
    ret

demo_switch_structures:
    ; Implement switch-like structure for grade evaluation
    invoke printf, grade_prompt
    invoke scanf, input_fmt, grade
    
    mov eax, [grade]
    
    ; Validate input range
    cmp eax, 0
    jl invalid_grade
    cmp eax, 100
    jg invalid_grade
    
    ; Grade classification using jump table approach
    cmp eax, 90
    jge grade_a
    cmp eax, 80
    jge grade_b
    cmp eax, 70
    jge grade_c
    cmp eax, 60
    jge grade_d
    jmp grade_f                    ; Below 60 is F
    
grade_a:
    invoke printf, grade_a_msg
    jmp grade_done
    
grade_b:
    invoke printf, grade_b_msg
    jmp grade_done
    
grade_c:
    invoke printf, grade_c_msg
    jmp grade_done
    
grade_d:
    invoke printf, grade_d_msg
    jmp grade_done
    
grade_f:
    invoke printf, grade_f_msg
    jmp grade_done
    
invalid_grade:
    invoke printf, invalid_msg
    
grade_done:
    ret

demo_conditional_optimization:
    ; Show optimized conditional execution techniques
    
    ; Example: Find maximum of three numbers
    mov eax, 15                    ; First number
    mov ebx, 23                    ; Second number
    mov ecx, 8                     ; Third number
    
    ; Method 1: Using conditional jumps
    cmp eax, ebx
    jge check_ac1                  ; EAX >= EBX
    mov eax, ebx                   ; EBX is larger, use it
check_ac1:
    cmp eax, ecx
    jge max_found1                 ; EAX >= ECX
    mov eax, ecx                   ; ECX is larger
max_found1:
    invoke printf, max_jump_fmt, eax
    
    ; Method 2: Using conditional moves (more efficient)
    mov eax, 15                    ; Reset values
    mov ebx, 23
    mov ecx, 8
    
    cmp eax, ebx
    cmovl eax, ebx                 ; Move EBX to EAX if EAX < EBX
    cmp eax, ecx
    cmovl eax, ecx                 ; Move ECX to EAX if EAX < ECX
    
    invoke printf, max_cmov_fmt, eax
    
    ; Method 3: Branchless maximum using bit manipulation
    mov eax, 15
    mov ebx, 23
    call branchless_max
    invoke printf, max_branchless_fmt, eax
    
    ret

branchless_max:
    ; Branchless maximum of EAX and EBX
    ; Result in EAX
    mov ecx, ebx                   ; Copy EBX
    sub ecx, eax                   ; ECX = EBX - EAX
    mov edx, ecx                   ; Copy difference
    sar edx, 31                    ; Sign extend to create mask
    and ecx, edx                   ; Mask the difference
    add eax, ecx                   ; Add masked difference
    ret

section '.data' data readable writeable
    leap_year_msg       db '2024 is a leap year', 13, 10, 0
    not_leap_msg        db '2024 is not a leap year', 13, 10, 0
    max_jump_fmt        db 'Maximum (jumps): %d', 13, 10, 0
    max_cmov_fmt        db 'Maximum (cmov): %d', 13, 10, 0
    max_branchless_fmt  db 'Maximum (branchless): %d', 13, 10, 0

section '.idata' import data readable writeable
    library kernel32, 'KERNEL32.DLL', \
            msvcrt, 'MSVCRT.DLL'
    import kernel32, ExitProcess, 'ExitProcess'
    import msvcrt, printf, 'printf', \
                  scanf, 'scanf'
```

## Loop Structures: Repetition with Purpose

Loops are the workhorses of programming, allowing you to process large amounts of data efficiently. Assembly provides several loop constructs, each optimized for different scenarios.

### Traditional Loops and Modern Alternatives

```assembly
format PE console
entry start

include 'win32a.inc'

section '.data' data readable writeable
    array_size      equ 1000
    test_array      dd array_size dup(0)
    result_sum      dd 0
    fibonacci_count dd 20
    fibonacci_array dd 50 dup(0)
    
section '.code' code readable executable

start:
    call demo_counting_loops
    call demo_condition_loops
    call demo_loop_optimization
    call demo_nested_loops
    call demo_loop_unrolling
    invoke ExitProcess, 0

demo_counting_loops:
    ; Traditional LOOP instruction
    mov ecx, array_size            ; Loop counter
    mov esi, test_array            ; Array pointer
    mov eax, 1                     ; Initial value
    
fill_loop:
    mov [esi], eax                 ; Store value
    inc eax                        ; Next value
    add esi, 4                     ; Next array element
    loop fill_loop                 ; ECX automatically decremented
    
    ; Sum array using counting loop
    mov ecx, array_size
    mov esi, test_array
    xor eax, eax                   ; Sum accumulator
    
sum_loop:
    add eax, [esi]                 ; Add element to sum
    add esi, 4                     ; Next element
    loop sum_loop
    
    mov [result_sum], eax
    invoke printf, sum_fmt, eax
    ret

demo_condition_loops:
    ; While-style loops using conditional jumps
    
    ; Calculate factorial of 10
    mov eax, 1                     ; Result accumulator
    mov ebx, 10                    ; Counter
    
factorial_loop:
    test ebx, ebx                  ; Check if counter is zero
    jz factorial_done              ; Exit if zero
    
    imul eax, ebx                  ; Multiply result by counter
    dec ebx                        ; Decrement counter
    jmp factorial_loop             ; Continue loop
    
factorial_done:
    invoke printf, factorial_fmt, eax
    
    ; Do-while style loop: generate Fibonacci sequence
    mov esi, fibonacci_array       ; Pointer to array
    mov eax, 0                     ; First Fibonacci number
    mov ebx, 1                     ; Second Fibonacci number
    mov ecx, [fibonacci_count]     ; Count of numbers to generate
    
    ; Store first two numbers
    mov [esi], eax
    mov [esi+4], ebx
    add esi, 8                     ; Move to third position
    sub ecx, 2                     ; Two numbers already stored
    
fibonacci_loop:
    test ecx, ecx                  ; Check if done
    jz fibonacci_done
    
    mov edx, eax                   ; Save previous number
    add eax, ebx                   ; Calculate next Fibonacci
    mov ebx, edx                   ; Shift numbers
    mov [esi], eax                 ; Store new number
    add esi, 4                     ; Next position
    dec ecx                        ; Decrement counter
    jmp fibonacci_loop
    
fibonacci_done:
    invoke printf, fibonacci_fmt
    ret

demo_loop_optimization:
    ; Compare different loop optimization techniques
    
    ; Method 1: Standard loop with bounds checking
    rdtsc                          ; Get start time
    mov [start_time], eax
    
    mov ecx, 1000000              ; Large iteration count
    xor eax, eax                   ; Accumulator
    
standard_loop:
    inc eax                        ; Simple operation
    dec ecx                        ; Decrement counter
    jnz standard_loop              ; Continue if not zero
    
    rdtsc                          ; Get end time
    sub eax, [start_time]
    invoke printf, standard_loop_fmt, eax
    
    ; Method 2: Optimized loop with pointer arithmetic
    rdtsc
    mov [start_time], eax
    
    mov esi, test_array            ; Start pointer
    mov edi, test_array + array_size * 4  ; End pointer
    xor eax, eax
    
pointer_loop:
    inc eax                        ; Simple operation
    add esi, 4                     ; Advance pointer
    cmp esi, edi                   ; Check bounds
    jl pointer_loop                ; Continue if less than end
    
    rdtsc
    sub eax, [start_time]
    invoke printf, pointer_loop_fmt, eax
    
    ; Method 3: Duff's device style unrolling
    rdtsc
    mov [start_time], eax
    
    mov ecx, 250000                ; Divide by 4 for unrolling
    xor eax, eax
    
duff_loop:
    inc eax                        ; Unrolled 4 times
    inc eax
    inc eax
    inc eax
    loop duff_loop
    
    rdtsc
    sub eax, [start_time]
    invoke printf, duff_loop_fmt, eax
    
    ret

demo_nested_loops:
    ; Matrix operations using nested loops
    
    ; Initialize 10x10 matrix with multiplication table
    mov ecx, 10                    ; Outer loop counter (rows)
    mov esi, test_array            ; Matrix pointer
    
outer_loop:
    push ecx                       ; Save outer counter
    mov edx, 10                    ; Inner loop counter (columns)
    mov eax, 11                    ; Calculate row number
    sub eax, ecx                   ; EAX = row number (1-10)
    
inner_loop:
    mov ebx, 11                    ; Calculate column number
    sub ebx, edx                   ; EBX = column number (1-10)
    
    push eax                       ; Save registers
    push edx
    mul ebx                        ; Row * Column
    mov [esi], eax                 ; Store in matrix
    pop edx                        ; Restore registers
    pop eax
    
    add esi, 4                     ; Next matrix element
    dec edx                        ; Next column
    jnz inner_loop                 ; Continue inner loop
    
    pop ecx                        ; Restore outer counter
    loop outer_loop                ; Continue outer loop
    
    invoke printf, matrix_fmt
    ret

demo_loop_unrolling:
    ; Demonstrate manual loop unrolling for performance
    
    ; Standard loop: clear array
    rdtsc
    mov [start_time], eax
    
    mov ecx, array_size
    mov esi, test_array
    
clear_loop_standard:
    mov dword [esi], 0
    add esi, 4
    loop clear_loop_standard
    
    rdtsc
    sub eax, [start_time]
    invoke printf, clear_standard_fmt, eax
    
    ; Unrolled loop: clear array 4 elements at a time
    rdtsc
    mov [start_time], eax
    
    mov ecx, array_size / 4        ; Process 4 elements per iteration
    mov esi, test_array
    
clear_loop_unrolled:
    mov dword [esi], 0             ; Clear 4 elements
    mov dword [esi+4], 0
    mov dword [esi+8], 0
    mov dword [esi+12], 0
    add esi, 16                    ; Advance by 4 elements
    loop clear_loop_unrolled
    
    rdtsc
    sub eax, [start_time]
    invoke printf, clear_unrolled_fmt, eax
    
    ; SIMD optimized: clear array using SSE
    rdtsc
    mov [start_time], eax
    
    mov ecx, array_size / 4        ; 4 32-bit integers = 128 bits
    mov esi, test_array
    pxor xmm0, xmm0                ; Clear XMM0 register
    
clear_loop_simd:
    movdqa [esi], xmm0             ; Store 4 zeros at once
    add esi, 16                    ; Advance by 16 bytes
    loop clear_loop_simd
    
    rdtsc
    sub eax, [start_time]
    invoke printf, clear_simd_fmt, eax
    
    ret

section '.data' data readable writeable
    start_time          dd 0
    
    ; Format strings
    sum_fmt             db 'Array sum: %d', 13, 10, 0
    factorial_fmt       db 'Factorial of 10: %d', 13, 10, 0
    fibonacci_fmt       db 'Fibonacci sequence generated', 13, 10, 0
    standard_loop_fmt   db 'Standard loop: %d cycles', 13, 10, 0
    pointer_loop_fmt    db 'Pointer loop: %d cycles', 13, 10, 0
    duff_loop_fmt       db 'Duff device loop: %d cycles', 13, 10, 0
    matrix_fmt          db 'Matrix multiplication table created', 13, 10, 0
    clear_standard_fmt  db 'Standard clear: %d cycles', 13, 10, 0
    clear_unrolled_fmt  db 'Unrolled clear: %d cycles', 13, 10, 0
    clear_simd_fmt      db 'SIMD clear: %d cycles', 13, 10, 0

section '.idata' import data readable writeable
    library kernel32, 'KERNEL32.DLL', \
            msvcrt, 'MSVCRT.DLL'
    import kernel32, ExitProcess, 'ExitProcess'
    import msvcrt, printf, 'printf'
```

## Function Calls and Stack Management

Functions are the building blocks of modular programming. Understanding how to implement and optimize function calls is crucial for maintainable code.

### Advanced Function Call Patterns

```assembly
format PE console
entry start

include 'win32a.inc'

section '.data' data readable writeable
    ; Test data for function demonstrations
    test_value1     dd 100
    test_value2     dd 200
    test_array      dd 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
    test_string     db 'Hello, Functions!', 0
    
section '.code' code readable executable

start:
    call demo_calling_conventions
    call demo_parameter_passing
    call demo_recursion
    call demo_function_pointers
    call demo_stack_frames
    invoke ExitProcess, 0

demo_calling_conventions:
    ; Demonstrate different calling conventions
    
    ; Calling convention 1: Register-based (custom)
    mov eax, 10                    ; First parameter
    mov ebx, 20                    ; Second parameter
    call add_registers
    invoke printf, reg_result_fmt, eax
    
    ; Calling convention 2: Stack-based (stdcall style)
    push 30                        ; Second parameter (pushed last)
    push 40                        ; First parameter (pushed first)
    call add_stack
    ; Note: add_stack cleans up its own stack
    invoke printf, stack_result_fmt, eax
    
    ; Calling convention 3: Mixed parameters
    push 50                        ; Stack parameter
    mov eax, 60                    ; Register parameter
    call add_mixed
    add esp, 4                     ; Clean up stack parameter
    invoke printf, mixed_result_fmt, eax
    
    ret

add_registers:
    ; Register calling convention
    ; EAX = first param, EBX = second param
    ; Returns sum in EAX
    add eax, ebx
    ret

add_stack:
    ; Stack calling convention (stdcall)
    ; Parameters: [ESP+4] = first, [ESP+8] = second
    push ebp
    mov ebp, esp
    
    mov eax, [ebp+8]               ; First parameter
    add eax, [ebp+12]              ; Second parameter
    
    pop ebp
    ret 8                          ; Clean up 8 bytes of parameters

add_mixed:
    ; Mixed calling convention
    ; EAX = register param, [ESP+4] = stack param
    push ebp
    mov ebp, esp
    
    add eax, [ebp+8]               ; Add stack parameter
    
    pop ebp
    ret

demo_parameter_passing:
    ; Different parameter passing methods
    
    ; Pass by value
    mov eax, [test_value1]
    push eax
    call square_value
    add esp, 4
    invoke printf, square_fmt, eax
    
    ; Pass by reference
    push test_value2
    call square_reference
    add esp, 4
    invoke printf, square_ref_fmt, [test_value2]
    
    ; Pass array
    push 10                        ; Array length
    push test_array                ; Array address
    call sum_array
    add esp, 8
    invoke printf, array_sum_fmt, eax
    
    ; Pass string
    push test_string
    call string_length
    add esp, 4
    invoke printf, strlen_fmt, eax
    
    ret

square_value:
    ; Square value passed by value
    push ebp
    mov ebp, esp
    
    mov eax, [ebp+8]               ; Get parameter
    imul eax, eax                  ; Square it
    
    pop ebp
    ret

square_reference:
    ; Square value passed by reference
    push ebp
    mov ebp, esp
    
    mov esi, [ebp+8]               ; Get pointer to value
    mov eax, [esi]                 ; Load value
    imul eax, eax                  ; Square it
    mov [esi], eax                 ; Store back to original location
    
    pop ebp
    ret

sum_array:
    ; Sum array elements
    ; Parameters: array pointer, length
    push ebp
    mov ebp, esp
    push esi
    push ecx
    
    mov esi, [ebp+8]               ; Array pointer
    mov ecx, [ebp+12]              ; Array length
    xor eax, eax                   ; Sum accumulator
    
sum_loop:
    add eax, [esi]                 ; Add current element
    add esi, 4                     ; Next element
    loop sum_loop                  ; Continue until ECX = 0
    
    pop ecx
    pop esi
    pop ebp
    ret

string_length:
    ; Calculate string length
    push ebp
    mov ebp, esp
    push esi
    
    mov esi, [ebp+8]               ; String pointer
    xor eax, eax                   ; Length counter
    
strlen_loop:
    cmp byte [esi], 0              ; Check for null terminator
    je strlen_done
    inc eax                        ; Increment length
    inc esi                        ; Next character
    jmp strlen_loop
    
strlen_done:
    pop esi
    pop ebp
    ret

demo_recursion:
    ; Recursive function examples
    
    ; Calculate factorial recursively
    push 5                         ; Calculate 5!
    call factorial_recursive
    add esp, 4
    invoke printf, factorial_fmt, eax
    
    ; Calculate Fibonacci recursively
    push 10                        ; Calculate F(10)
    call fibonacci_recursive
    add esp, 4
    invoke printf, fibonacci_recur_fmt, eax
    
    ret

factorial_recursive:
    ; Recursive factorial calculation
    push ebp
    mov ebp, esp
    
    mov eax, [ebp+8]               ; Get parameter
    cmp eax, 1                     ; Base case
    jle factorial_base
    
    ; Recursive case: n * factorial(n-1)
    dec eax                        ; n-1
    push eax                       ; Recursive call
    call factorial_recursive
    add esp, 4
    
    imul eax, [ebp+8]              ; n * factorial(n-1)
    jmp factorial_return
    
factorial_base:
    mov eax, 1                     ; factorial(0) = factorial(1) = 1
    
factorial_return:
    pop ebp
    ret

fibonacci_recursive:
    ; Recursive Fibonacci calculation (inefficient but demonstrates recursion)
    push ebp
    mov ebp, esp
    push ebx                       ; Save EBX
    
    mov eax, [ebp+8]               ; Get parameter
    cmp eax, 1                     ; Base cases
    jle fibonacci_base
    
    ; Recursive case: F(n-1) + F(n-2)
    dec eax                        ; n-1
    push eax
    call fibonacci_recursive       ; F(n-1)
    add esp, 4
    mov ebx, eax                   ; Save F(n-1)
    
    mov eax, [ebp+8]               ; Get n again
    sub eax, 2                     ; n-2
    push eax
    call fibonacci_recursive       ; F(n-2)
    add esp, 4
    
    add eax, ebx                   ; F(n-1) + F(n-2)
    jmp fibonacci_return
    
fibonacci_base:
    ; F(0) = 0, F(1) = 1
    mov eax, [ebp+8]
    
fibonacci_return:
    pop ebx
    pop ebp
    ret

demo_function_pointers:
    ; Function pointers and callback mechanisms
    
    ; Array of function pointers
    push operation_add
    push 10
    push 20
    call execute_operation
    add esp, 12
    invoke printf, callback_fmt, eax
    
    push operation_multiply
    push 6
    push 7
    call execute_operation
    add esp, 12
    invoke printf, callback_fmt, eax
    
    ret

execute_operation:
    ; Execute function pointer with two parameters
    ; Parameters: param1, param2, function_pointer
    push ebp
    mov ebp, esp
    
    mov eax, [ebp+8]               ; First parameter
    mov ebx, [ebp+12]              ; Second parameter
    mov ecx, [ebp+16]              ; Function pointer
    
    push ebx                       ; Pass parameters
    push eax
    call ecx                       ; Call function through pointer
    add esp, 8
    
    pop ebp
    ret

operation_add:
    ; Addition operation for callback
    push ebp
    mov ebp, esp
    
    mov eax, [ebp+8]
    add eax, [ebp+12]
    
    pop ebp
    ret

operation_multiply:
    ; Multiplication operation for callback
    push ebp
    mov ebp, esp
    
    mov eax, [ebp+8]
    imul eax, [ebp+12]
    
    pop ebp
    ret

demo_stack_frames:
    ; Demonstrate proper stack frame management
    
    push 100
    push 200
    push 300
    call complex_function
    add esp, 12
    
    ret

complex_function:
    ; Function with local variables and nested calls
    push ebp
    mov ebp, esp
    sub esp, 16                    ; Allocate space for local variables
    
    ; Local variables at:
    ; [EBP-4] = local1
    ; [EBP-8] = local2
    ; [EBP-12] = local3
    ; [EBP-16] = local4
    
    ; Initialize local variables
    mov eax, [ebp+8]               ; Parameter 1
    mov [ebp-4], eax               ; local1 = param1
    
    mov eax, [ebp+12]              ; Parameter 2
    mov [ebp-8], eax               ; local2 = param2
    
    mov eax, [ebp+16]              ; Parameter 3
    mov [ebp-12], eax              ; local3 = param3
    
    ; Calculate local4 = local1 + local2 * local3
    mov eax, [ebp-8]               ; local2
    imul eax, [ebp-12]             ; local2 * local3
    add eax, [ebp-4]               ; + local1
    mov [ebp-16], eax              ; Store in local4
    
    ; Make nested function call
    push dword [ebp-16]
    call nested_function
    add esp, 4
    
    ; Clean up stack frame
    mov esp, ebp                   ; Restore stack pointer
    pop ebp                        ; Restore base pointer
    ret

nested_function:
    ; Simple nested function
    push ebp
    mov ebp, esp
    
    mov eax, [ebp+8]               ; Get parameter
    shl eax, 1                     ; Double it
    
    pop ebp
    ret

section '.data' data readable writeable
    ; Format strings
    reg_result_fmt      db 'Register result: %d', 13, 10, 0
    stack_result_fmt    db 'Stack result: %d', 13, 10, 0
    mixed_result_fmt    db 'Mixed result: %d', 13, 10, 0
    square_fmt          db 'Square (by value): %d', 13, 10, 0
    square_ref_fmt      db 'Square (by reference): %d', 13, 10, 0
    array_sum_fmt       db 'Array sum: %d', 13, 10, 0
    strlen_fmt          db 'String length: %d', 13, 10, 0
    factorial_fmt       db 'Factorial: %d', 13, 10, 0
    fibonacci_recur_fmt db 'Fibonacci: %d', 13, 10, 0
    callback_fmt        db 'Callback result: %d', 13, 10, 0

section '.idata' import data readable writeable
    library kernel32, 'KERNEL32.DLL', \
            msvcrt, 'MSVCRT.DLL'
    import kernel32, ExitProcess, 'ExitProcess'
    import msvcrt, printf, 'printf'
```

## Exception Handling and Error Management

Robust programs must handle unexpected conditions gracefully. Assembly provides mechanisms for both preventing errors and recovering from them.

### Structured Exception Handling

```assembly
format PE console
entry start

include 'win32a.inc'

section '.data' data readable writeable
    ; Exception handling data
    exception_msg   db 'Exception caught and handled!', 13, 10, 0
    normal_msg      db 'Normal execution completed', 13, 10, 0
    division_error  db 'Division by zero detected!', 13, 10, 0
    access_error    db 'Memory access violation!', 13, 10, 0
    
section '.code' code readable executable

start:
    call demo_exception_handling
    call demo_error_checking
    invoke ExitProcess, 0

demo_exception_handling:
    ; Demonstrate basic exception handling concepts
    
    ; Set up exception handler (simplified demonstration)
    push offset exception_handler
    push dword [fs:0]              ; Previous handler
    mov [fs:0], esp                ; Install new handler
    
    ; Code that might cause exception
    mov eax, 10
    mov ebx, 0                     ; This will cause division by zero
    
    ; Check for zero before division
    test ebx, ebx
    jz handle_division_error
    
    div ebx                        ; This would cause exception if ebx = 0
    
    invoke printf, normal_msg
    jmp exception_cleanup
    
handle_division_error:
    invoke printf, division_error
    
exception_cleanup:
    ; Restore previous exception handler
    pop dword [fs:0]
    add esp, 4
    
    ret

exception_handler:
    ; Simplified exception handler
    invoke printf, exception_msg
    
    ; In a real handler, you would:
    ; 1. Examine exception record
    ; 2. Decide whether to handle or pass on
    ; 3. Modify context if handling
    ; 4. Return appropriate value
    
    mov eax, 1                     ; ExceptionContinueExecution
    ret

demo_error_checking:
    ; Demonstrate proactive error checking
    
    ; Safe array access with bounds checking
    mov eax, 5                     ; Index to access
    call safe_array_access
    
    ; Safe pointer dereferencing
    mov eax, 0                     ; NULL pointer
    call safe_pointer_access
    
    ; Safe arithmetic operations
    mov eax, 0x7FFFFFFF            ; Maximum positive integer
    mov ebx, 1
    call safe_addition
    
    ret

safe_array_access:
    ; Safely access array element with bounds checking
    ; EAX = index
    
    cmp eax, 0                     ; Check lower bound
    jl array_bounds_error
    cmp eax, 10                    ; Check upper bound (array size = 10)
    jge array_bounds_error
    
    ; Safe to access array
    mov ebx, [test_array + eax*4]  ; Access element
    invoke printf, array_access_fmt, eax, ebx
    ret
    
array_bounds_error:
    invoke printf, bounds_error_fmt, eax
    ret

safe_pointer_access:
    ; Safely dereference pointer
    ; EAX = pointer
    
    test eax, eax                  ; Check for NULL
    jz null_pointer_error
    
    ; Additional checks could include:
    ; - Check if pointer is in valid address range
    ; - Check if memory is accessible
    ; - Check alignment requirements
    
    mov ebx, [eax]                 ; Dereference pointer
    invoke printf, pointer_access_fmt, ebx
    ret
    
null_pointer_error:
    invoke printf, null_error_fmt
    ret

safe_addition:
    ; Safely perform addition with overflow checking
    ; EAX = first operand, EBX = second operand
    
    ; Check for potential overflow
    test eax, eax                  ; Check sign of first operand
    js check_negative_overflow
    
    ; Positive first operand
    mov ecx, 0x7FFFFFFF            ; Maximum positive value
    sub ecx, eax                   ; Maximum safe second operand
    cmp ebx, ecx
    jg positive_overflow
    jmp safe_add
    
check_negative_overflow:
    ; Negative first operand
    mov ecx, 0x80000000            ; Minimum negative value
    sub ecx, eax                   ; Minimum safe second operand
    cmp ebx, ecx
    jl negative_overflow
    
safe_add:
    add eax, ebx                   ; Safe to add
    invoke printf, safe_add_fmt, eax
    ret
    
positive_overflow:
    invoke printf, overflow_fmt
    ret
    
negative_overflow:
    invoke printf, underflow_fmt
    ret

section '.data' data readable writeable
    array_access_fmt    db 'Array[%d] = %d', 13, 10, 0
    bounds_error_fmt    db 'Array bounds error: index %d', 13, 10, 0
    pointer_access_fmt  db 'Pointer value: %d', 13, 10, 0
    null_error_fmt      db 'Null pointer error!', 13, 10, 0
    safe_add_fmt        db 'Safe addition result: %d', 13, 10, 0
    overflow_fmt        db 'Integer overflow detected!', 13, 10, 0
    underflow_fmt       db 'Integer underflow detected!', 13, 10, 0

section '.idata' import data readable writeable
    library kernel32, 'KERNEL32.DLL', \
            msvcrt, 'MSVCRT.DLL'
    import kernel32, ExitProcess, 'ExitProcess'
    import msvcrt, printf, 'printf'
```

## State Machines and Complex Flow Control

State machines provide a powerful way to model complex program behavior with clear, maintainable code.

### Implementing Finite State Machines

```assembly
format PE console
entry start

include 'win32a.inc'

section '.data' data readable writeable
    ; State machine definitions
    STATE_IDLE      equ 0
    STATE_RUNNING   equ 1
    STATE_PAUSED    equ 2
    STATE_STOPPED   equ 3
    
    ; Events
    EVENT_START     equ 0
    EVENT_PAUSE     equ 1
    EVENT_RESUME    equ 2
    EVENT_STOP      equ 3
    
    current_state   dd STATE_IDLE
    event_queue     dd 10 dup(0)
    queue_head      dd 0
    queue_tail      dd 0
    
    ; Parser state machine
    PARSE_START     equ 0
    PARSE_NUMBER    equ 1
    PARSE_OPERATOR  equ 2
    PARSE_ERROR     equ 3
    
    parse_state     dd PARSE_START
    input_string    db '123+456*789', 0
    parse_position  dd 0
    
section '.code' code readable executable

start:
    call demo_simple_state_machine
    call demo_parser_state_machine
    call demo_coroutines
    invoke ExitProcess, 0

demo_simple_state_machine:
    ; Simple state machine for a media player
    
    ; Process some events
    mov eax, EVENT_START
    call process_event
    
    mov eax, EVENT_PAUSE
    call process_event
    
    mov eax, EVENT_RESUME
    call process_event
    
    mov eax, EVENT_STOP
    call process_event
    
    ret

process_event:
    ; Process event based on current state
    ; EAX = event
    
    mov ebx, [current_state]       ; Get current state
    
    ; Jump table approach for state transitions
    cmp ebx, STATE_IDLE
    je handle_idle_state
    cmp ebx, STATE_RUNNING
    je handle_running_state
    cmp ebx, STATE_PAUSED
    je handle_paused_state
    cmp ebx, STATE_STOPPED
    je handle_stopped_state
    
    ; Invalid state
    invoke printf, invalid_state_fmt
    ret

handle_idle_state:
    cmp eax, EVENT_START
    je idle_to_running
    ; Ignore other events in idle state
    invoke printf, idle_ignore_fmt
    ret
    
idle_to_running:
    mov dword [current_state], STATE_RUNNING
    invoke printf, start_msg
    ret

handle_running_state:
    cmp eax, EVENT_PAUSE
    je running_to_paused
    cmp eax, EVENT_STOP
    je running_to_stopped
    ; Ignore other events
    invoke printf, running_ignore_fmt
    ret
    
running_to_paused:
    mov dword [current_state], STATE_PAUSED
    invoke printf, pause_msg
    ret
    
running_to_stopped:
    mov dword [current_state], STATE_STOPPED
    invoke printf, stop_msg
    ret

handle_paused_state:
    cmp eax, EVENT_RESUME
    je paused_to_running
    cmp eax, EVENT_STOP
    je paused_to_stopped
    invoke printf, paused_ignore_fmt
    ret
    
paused_to_running:
    mov dword [current_state], STATE_RUNNING
    invoke printf, resume_msg
    ret
    
paused_to_stopped:
    mov dword [current_state], STATE_STOPPED
    invoke printf, stop_msg
    ret

handle_stopped_state:
    cmp eax, EVENT_START
    je stopped_to_running
    invoke printf, stopped_ignore_fmt
    ret
    
stopped_to_running:
    mov dword [current_state], STATE_RUNNING
    invoke printf, restart_msg
    ret

demo_parser_state_machine:
    ; State machine for parsing simple arithmetic expressions
    
    mov dword [parse_state], PARSE_START
    mov dword [parse_position], 0
    
parse_loop:
    call get_next_char             ; Get next character
    test eax, eax                  ; Check for end of string
    jz parse_complete
    
    call parse_character           ; Process character
    
    cmp dword [parse_state], PARSE_ERROR
    je parse_error_exit
    
    jmp parse_loop
    
parse_complete:
    invoke printf, parse_success_msg
    ret
    
parse_error_exit:
    invoke printf, parse_error_msg
    ret

get_next_char:
    ; Get next character from input string
    mov esi, [parse_position]
    movzx eax, byte [input_string + esi]
    inc dword [parse_position]
    ret

parse_character:
    ; Parse character based on current state
    ; EAX = character
    
    mov ebx, [parse_state]
    cmp ebx, PARSE_START
    je parse_start_state
    cmp ebx, PARSE_NUMBER
    je parse_number_state
    cmp ebx, PARSE_OPERATOR
    je parse_operator_state
    
    ; Invalid state
    mov dword [parse_state], PARSE_ERROR
    ret

parse_start_state:
    ; Starting state - expect number
    cmp eax, '0'
    jl not_digit_start
    cmp eax, '9'
    jg not_digit_start
    
    ; Found digit
    mov dword [parse_state], PARSE_NUMBER
    invoke printf, found_digit_fmt, eax
    ret
    
not_digit_start:
    mov dword [parse_state], PARSE_ERROR
    ret

parse_number_state:
    ; In number - expect digit or operator
    cmp eax, '0'
    jl check_operator
    cmp eax, '9'
    jg check_operator
    
    ; Still in number
    invoke printf, found_digit_fmt, eax
    ret
    
check_operator:
    cmp eax, '+'
    je found_operator
    cmp eax, '-'
    je found_operator
    cmp eax, '*'
    je found_operator
    cmp eax, '/'
    je found_operator
    
    ; Invalid character
    mov dword [parse_state], PARSE_ERROR
    ret
    
found_operator:
    mov dword [parse_state], PARSE_OPERATOR
    invoke printf, found_op_fmt, eax
    ret

parse_operator_state:
    ; After operator - expect number
    cmp eax, '0'
    jl not_digit_op
    cmp eax, '9'
    jg not_digit_op
    
    ; Found digit after operator
    mov dword [parse_state], PARSE_NUMBER
    invoke printf, found_digit_fmt, eax
    ret
    
not_digit_op:
    mov dword [parse_state], PARSE_ERROR
    ret

demo_coroutines:
    ; Demonstrate coroutine-like behavior using state preservation
    
    ; Initialize coroutine states
    mov dword [coroutine1_state], 0
    mov dword [coroutine2_state], 0
    
    ; Run coroutines alternately
    call coroutine1
    call coroutine2
    call coroutine1
    call coroutine2
    call coroutine1
    call coroutine2
    
    ret

coroutine1:
    ; Coroutine that counts upward
    mov eax, [coroutine1_state]
    inc eax
    mov [coroutine1_state], eax
    invoke printf, coroutine1_fmt, eax
    ret

coroutine2:
    ; Coroutine that counts downward
    mov eax, [coroutine2_state]
    dec eax
    mov [coroutine2_state], eax
    invoke printf, coroutine2_fmt, eax
    ret

section '.data' data readable writeable
    ; Coroutine states
    coroutine1_state    dd 0
    coroutine2_state    dd 10
    
    ; State machine messages
    invalid_state_fmt   db 'Invalid state!', 13, 10, 0
    idle_ignore_fmt     db 'Idle state: ignoring event', 13, 10, 0
    running_ignore_fmt  db 'Running state: ignoring event', 13, 10, 0
    paused_ignore_fmt   db 'Paused state: ignoring event', 13, 10, 0
    stopped_ignore_fmt  db 'Stopped state: ignoring event', 13, 10, 0
    
    start_msg           db 'Started playing', 13, 10, 0
    pause_msg           db 'Paused', 13, 10, 0
    resume_msg          db 'Resumed playing', 13, 10, 0
    stop_msg            db 'Stopped', 13, 10, 0
    restart_msg         db 'Restarted playing', 13, 10, 0
    
    ; Parser messages
    parse_success_msg   db 'Parsing completed successfully', 13, 10, 0
    parse_error_msg     db 'Parse error encountered', 13, 10, 0
    found_digit_fmt     db 'Found digit: %c', 13, 10, 0
    found_op_fmt        db 'Found operator: %c', 13, 10, 0
    
    ; Coroutine messages
    coroutine1_fmt      db 'Coroutine 1: %d', 13, 10, 0
    coroutine2_fmt      db 'Coroutine 2: %d', 13, 10, 0

section '.idata' import data readable writeable
    library kernel32, 'KERNEL32.DLL', \
            msvcrt, 'MSVCRT.DLL'
    import kernel32, ExitProcess, 'ExitProcess'
    import msvcrt, printf, 'printf'
```

## Summary

This comprehensive chapter has explored the fundamental concepts of program flow control in assembly language:

1. **Conditional Logic**: From simple branches to optimized conditional execution
2. **Loop Structures**: Traditional loops, optimization techniques, and modern alternatives
3. **Function Calls**: Parameter passing, calling conventions, and stack management
4. **Exception Handling**: Error prevention and graceful recovery techniques
5. **State Machines**: Modeling complex program behavior with finite state machines

Understanding program flow is essential for creating maintainable, efficient assembly programs. The techniques demonstrated in this chapter provide the foundation for building complex applications while maintaining code clarity and performance.

These flow control patterns form the backbone of all programming logic, enabling you to create programs that not only work correctly but express their intent clearly and execute efficiently. In the next chapter, we'll explore how to combine these flow control techniques with advanced programming patterns to create professional-quality assembly applications.
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