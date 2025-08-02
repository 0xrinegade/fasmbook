; Advanced Calculator with Expression Parsing
; Demonstrates advanced FASM programming techniques including:
; - String parsing and tokenization
; - Recursive descent parsing
; - Stack-based evaluation
; - Error handling and validation
; - User interface with input/output

format PE console
entry start

include 'win32a.inc'

section '.data' data readable writeable
    ; Input/Output buffers
    input_buffer    db 256 dup(0)
    output_buffer   db 256 dup(0)
    error_buffer    db 256 dup(0)
    
    ; Expression parsing
    expression      db 256 dup(0)
    tokens          dd 64 dup(0)    ; Token array
    token_count     dd 0
    parse_index     dd 0
    
    ; Evaluation stack
    eval_stack      dd 64 dup(0)
    stack_ptr       dd 0
    
    ; Messages
    prompt_msg      db 'Advanced Calculator', 13, 10
                    db 'Enter expression (or "quit" to exit): ', 0
    result_msg      db 'Result: %d', 13, 10, 0
    error_msg       db 'Error: %s', 13, 10, 0
    quit_msg        db 'quit', 0
    goodbye_msg     db 'Goodbye!', 13, 10, 0
    
    ; Error messages
    err_invalid     db 'Invalid expression', 0
    err_div_zero    db 'Division by zero', 0
    err_overflow    db 'Number too large', 0
    err_syntax      db 'Syntax error', 0

section '.code' code readable executable

start:
    call initialize_calculator
    
main_loop:
    ; Display prompt
    push prompt_msg
    call [printf]
    add esp, 4
    
    ; Read user input
    push input_buffer
    call read_line
    
    ; Check for quit command
    push quit_msg
    push input_buffer
    call [strcmp]
    add esp, 8
    test eax, eax
    jz quit_program
    
    ; Parse and evaluate expression
    push input_buffer
    call parse_expression
    test eax, eax
    jz parse_error
    
    call evaluate_expression
    test eax, eax
    jz eval_error
    
    ; Display result
    push dword [eval_stack]     ; Result is on top of stack
    push result_msg
    call [printf]
    add esp, 8
    
    jmp main_loop

parse_error:
    push err_syntax
    push error_msg
    call [printf]
    add esp, 8
    jmp main_loop

eval_error:
    push err_invalid
    push error_msg
    call [printf]
    add esp, 8
    jmp main_loop

quit_program:
    push goodbye_msg
    call [printf]
    add esp, 4
    
    push 0
    call [ExitProcess]

; Initialize calculator subsystem
initialize_calculator:
    push ebp
    mov ebp, esp
    
    ; Clear all buffers and stacks
    mov edi, eval_stack
    mov ecx, 64
    xor eax, eax
    rep stosd
    
    mov [stack_ptr], 0
    mov [token_count], 0
    mov [parse_index], 0
    
    pop ebp
    ret

; Read a line of input from user
; Input: buffer address on stack
read_line:
    push ebp
    mov ebp, esp
    push esi edi ebx
    
    mov esi, [ebp + 8]          ; Buffer address
    mov edi, esi
    mov ebx, 255                ; Max characters
    
read_char:
    push 0                      ; lpBytesRead
    push esp
    push 1                      ; nNumberOfCharsToRead
    push edi                    ; lpBuffer
    push dword [stdin_handle]   ; hConsoleInput
    call [ReadConsoleA]
    pop ecx                     ; Remove lpBytesRead from stack
    
    cmp byte [edi], 13          ; Check for Enter
    je read_done
    cmp byte [edi], 10          ; Check for LF
    je read_done
    
    inc edi
    dec ebx
    jnz read_char

read_done:
    mov byte [edi], 0           ; Null terminate
    
    pop ebx edi esi
    pop ebp
    ret 4

; Parse expression into tokens
; Input: expression string address on stack
; Output: EAX = 1 if successful, 0 if error
parse_expression:
    push ebp
    mov ebp, esp
    push esi edi ebx ecx edx
    
    mov esi, [ebp + 8]          ; Expression string
    mov edi, tokens
    mov [token_count], 0
    
parse_loop:
    ; Skip whitespace
    cmp byte [esi], ' '
    jne check_char
    inc esi
    jmp parse_loop

check_char:
    cmp byte [esi], 0
    je parse_success
    
    ; Check for number
    cmp byte [esi], '0'
    jb check_operator
    cmp byte [esi], '9'
    ja check_operator
    
    ; Parse number
    call parse_number
    test eax, eax
    jz parse_fail
    jmp next_token

check_operator:
    ; Check for operators: +, -, *, /, (, )
    mov al, [esi]
    cmp al, '+'
    je store_operator
    cmp al, '-'
    je store_operator
    cmp al, '*'
    je store_operator
    cmp al, '/'
    je store_operator
    cmp al, '('
    je store_operator
    cmp al, ')'
    je store_operator
    jmp parse_fail

store_operator:
    mov [edi], eax              ; Store operator
    add edi, 4
    inc dword [token_count]
    inc esi

next_token:
    jmp parse_loop

parse_success:
    mov eax, 1
    jmp parse_exit

parse_fail:
    mov eax, 0

parse_exit:
    pop edx ecx ebx edi esi
    pop ebp
    ret 4

; Parse a number starting at ESI
; Updates ESI to point after the number
; Stores number in token array at EDI
; Returns EAX = 1 if successful, 0 if error
parse_number:
    push ebx ecx edx
    
    xor eax, eax                ; Accumulator
    xor ebx, ebx                ; Digit value
    mov ecx, 10                 ; Base 10

number_loop:
    mov bl, [esi]
    cmp bl, '0'
    jb number_done
    cmp bl, '9'
    ja number_done
    
    sub bl, '0'                 ; Convert to digit
    
    ; Check for overflow (simplified)
    cmp eax, 214748364          ; 2^31 / 10 approximately
    ja number_overflow
    
    mul ecx                     ; eax *= 10
    add eax, ebx                ; Add new digit
    inc esi
    jmp number_loop

number_done:
    mov [edi], eax              ; Store parsed number
    add edi, 4
    inc dword [token_count]
    mov eax, 1                  ; Success
    jmp number_exit

number_overflow:
    mov eax, 0                  ; Error

number_exit:
    pop edx ecx ebx
    ret

; Evaluate parsed expression using shunting yard algorithm
; Output: EAX = 1 if successful, 0 if error
evaluate_expression:
    push ebp
    mov ebp, esp
    push esi edi ebx ecx edx
    
    ; Initialize evaluation
    mov [stack_ptr], 0
    mov esi, tokens
    mov ecx, [token_count]
    
eval_loop:
    test ecx, ecx
    jz eval_success
    
    mov eax, [esi]              ; Get current token
    
    ; Check if it's a number (positive)
    cmp eax, 0
    jl check_operation
    
    ; Push number onto stack
    call push_stack
    test eax, eax
    jz eval_fail
    jmp next_eval_token

check_operation:
    ; Handle operators
    and eax, 0xFF               ; Get operator character
    cmp al, '+'
    je do_addition
    cmp al, '-'
    je do_subtraction
    cmp al, '*'
    je do_multiplication
    cmp al, '/'
    je do_division
    jmp eval_fail

do_addition:
    call pop_stack              ; Get second operand
    test ebx, ebx
    jz eval_fail
    mov edx, eax
    call pop_stack              ; Get first operand
    test ebx, ebx
    jz eval_fail
    add eax, edx
    call push_stack
    test eax, eax
    jz eval_fail
    jmp next_eval_token

do_subtraction:
    call pop_stack
    test ebx, ebx
    jz eval_fail
    mov edx, eax
    call pop_stack
    test ebx, ebx
    jz eval_fail
    sub eax, edx
    call push_stack
    test eax, eax
    jz eval_fail
    jmp next_eval_token

do_multiplication:
    call pop_stack
    test ebx, ebx
    jz eval_fail
    mov edx, eax
    call pop_stack
    test ebx, ebx
    jz eval_fail
    imul eax, edx
    call push_stack
    test eax, eax
    jz eval_fail
    jmp next_eval_token

do_division:
    call pop_stack
    test ebx, ebx
    jz eval_fail
    mov edx, eax
    test edx, edx               ; Check for division by zero
    jz division_by_zero
    call pop_stack
    test ebx, ebx
    jz eval_fail
    cdq                         ; Sign extend EAX to EDX:EAX
    idiv edx                    ; Signed division
    call push_stack
    test eax, eax
    jz eval_fail
    jmp next_eval_token

division_by_zero:
    jmp eval_fail

next_eval_token:
    add esi, 4
    dec ecx
    jmp eval_loop

eval_success:
    ; Check that exactly one value remains on stack
    cmp dword [stack_ptr], 1
    jne eval_fail
    mov eax, 1
    jmp eval_exit

eval_fail:
    mov eax, 0

eval_exit:
    pop edx ecx ebx edi esi
    pop ebp
    ret

; Push value in EAX onto evaluation stack
; Returns EAX = 1 if successful, 0 if stack overflow
push_stack:
    push ebx edi
    
    mov ebx, [stack_ptr]
    cmp ebx, 64                 ; Check for stack overflow
    jae push_overflow
    
    mov edi, eval_stack
    mov [edi + ebx * 4], eax    ; Store value
    inc dword [stack_ptr]
    mov eax, 1                  ; Success
    jmp push_exit

push_overflow:
    mov eax, 0                  ; Error

push_exit:
    pop edi ebx
    ret

; Pop value from evaluation stack into EAX
; Returns EBX = 1 if successful, 0 if stack underflow
pop_stack:
    push edi
    
    mov ebx, [stack_ptr]
    test ebx, ebx               ; Check for stack underflow
    jz pop_underflow
    
    dec dword [stack_ptr]
    mov edi, eval_stack
    mov eax, [edi + ebx * 4 - 4] ; Get value
    mov ebx, 1                  ; Success
    jmp pop_exit

pop_underflow:
    mov ebx, 0                  ; Error
    xor eax, eax

pop_exit:
    pop edi
    ret

section '.bss' readable writeable
    stdin_handle    dd ?

section '.idata' import data readable writeable
    library kernel32, 'KERNEL32.DLL', \
            msvcrt, 'MSVCRT.DLL'
    
    import kernel32, ExitProcess, 'ExitProcess', \
                     GetStdHandle, 'GetStdHandle', \
                     ReadConsoleA, 'ReadConsoleA'
    
    import msvcrt, printf, 'printf', \
                   scanf, 'scanf', \
                   strcmp, 'strcmp'