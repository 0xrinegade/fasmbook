format ELF executable 3
entry start

section '.text' executable
start:
    ; Write "Hello Linux!\n" to stdout
    mov eax, 4          ; sys_write
    mov ebx, 1          ; stdout
    mov ecx, message    ; message address
    mov edx, msg_len    ; message length
    int 0x80            ; system call
    
    ; Exit program
    mov eax, 1          ; sys_exit
    mov ebx, 0          ; exit status
    int 0x80            ; system call

section '.data' writeable
    message db 'Hello Linux from FASM!', 10
    msg_len = $ - message