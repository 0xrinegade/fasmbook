format PE console
entry start

include 'win32a.inc'

section '.data' data readable writeable
    message db 'Hello from FASM!', 13, 10, 0
    
section '.code' code readable executable
start:
    ; Display message
    push message
    call [printf]
    add esp, 4
    
    ; Exit program
    push 0
    call [ExitProcess]

section '.idata' import data readable writeable
    library kernel32, 'KERNEL32.DLL', \
            msvcrt, 'MSVCRT.DLL'
    
    import kernel32, ExitProcess, 'ExitProcess'
    import msvcrt, printf, 'printf'