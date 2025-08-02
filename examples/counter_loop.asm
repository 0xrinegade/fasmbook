format PE console
entry start

include 'win32a.inc'

section '.data' data readable writeable
    counter dd 0
    result_msg db 'Counter value: %d', 13, 10, 0
    
section '.code' code readable executable
start:
    ; Initialize counter
    mov eax, 0
    mov [counter], eax
    
    ; Increment counter in a loop
    mov ecx, 10
loop_start:
    inc dword [counter]
    loop loop_start
    
    ; Display result
    push dword [counter]
    push result_msg
    call [printf]
    add esp, 8
    
    ; Exit program
    push 0
    call [ExitProcess]

section '.idata' import data readable writeable
    library kernel32, 'KERNEL32.DLL', \
            msvcrt, 'MSVCRT.DLL'
    
    import kernel32, ExitProcess, 'ExitProcess'
    import msvcrt, printf, 'printf'