# Chapter 7: Advanced System Programming
*Interfacing with the Operating System*

## Introduction: Beyond User Space

Assembly programming truly shines when you need to interact directly with the operating system and hardware. This chapter explores the advanced techniques used in system programming, from memory management and process control to device drivers and kernel programming. You'll learn how to leverage the full power of modern operating systems while understanding the low-level details that make everything work.

System programming requires a deep understanding of how the operating system manages resources, handles security, and provides services to applications. In assembly language, you have direct access to these mechanisms, allowing you to create highly efficient system software, device drivers, and specialized applications that can't be written effectively in higher-level languages.

## Windows System Programming in Assembly

### Win32 API Integration

The Windows API provides thousands of functions for system programming. Understanding how to call these efficiently from assembly is crucial for Windows system development.

```assembly
format PE console
entry start

include 'win32a.inc'

section '.data' data readable writeable
    ; Process and thread management
    process_info    PROCESS_INFORMATION
    startup_info    STARTUPINFO
    command_line    db 'notepad.exe', 0
    
    ; Memory management
    heap_handle     dd 0
    allocated_mem   dd 0
    
    ; File system operations
    file_handle     dd INVALID_HANDLE_VALUE
    test_filename   db 'test_file.txt', 0
    file_data       db 'Hello from assembly!', 13, 10, 0
    bytes_written   dd 0
    
    ; Registry operations
    registry_key    dd 0
    value_name      db 'TestValue', 0
    value_data      db 'Assembly Data', 0
    
    ; Service operations
    service_name    db 'TestService', 0
    display_name    db 'Test Assembly Service', 0
    
section '.code' code readable executable

start:
    call demo_process_management
    call demo_memory_management
    call demo_file_operations
    call demo_registry_operations
    call demo_security_operations
    call demo_threading
    invoke ExitProcess, 0

demo_process_management:
    ; Create and manage processes
    
    ; Initialize startup info
    mov dword [startup_info.cb], sizeof.STARTUPINFO
    mov dword [startup_info.lpReserved], 0
    mov dword [startup_info.lpDesktop], 0
    mov dword [startup_info.lpTitle], 0
    mov dword [startup_info.dwFlags], 0
    
    ; Create process
    invoke CreateProcess, 0, command_line, 0, 0, FALSE, \
           NORMAL_PRIORITY_CLASS, 0, 0, startup_info, process_info
    
    test eax, eax
    jz process_create_failed
    
    invoke printf, process_created_fmt, [process_info.dwProcessId]
    
    ; Wait for process to complete (with timeout)
    invoke WaitForSingleObject, [process_info.hProcess], 5000
    cmp eax, WAIT_TIMEOUT
    je process_timeout
    
    ; Get exit code
    invoke GetExitCodeProcess, [process_info.hProcess], exit_code
    invoke printf, process_exit_fmt, [exit_code]
    
    ; Clean up handles
    invoke CloseHandle, [process_info.hProcess]
    invoke CloseHandle, [process_info.hThread]
    ret
    
process_timeout:
    invoke printf, process_timeout_fmt
    invoke TerminateProcess, [process_info.hProcess], 1
    invoke CloseHandle, [process_info.hProcess]
    invoke CloseHandle, [process_info.hThread]
    ret
    
process_create_failed:
    invoke GetLastError
    invoke printf, process_error_fmt, eax
    ret

demo_memory_management:
    ; Advanced memory management techniques
    
    ; Get process heap
    invoke GetProcessHeap
    mov [heap_handle], eax
    
    ; Allocate memory with specific flags
    invoke HeapAlloc, [heap_handle], HEAP_ZERO_MEMORY, 4096
    test eax, eax
    jz heap_alloc_failed
    mov [allocated_mem], eax
    
    ; Fill memory with pattern
    mov esi, eax
    mov ecx, 1024                  ; Fill 1024 DWORDs
    mov eax, 0xDEADBEEF
    
fill_memory:
    mov [esi], eax
    add esi, 4
    loop fill_memory
    
    ; Validate memory pattern
    mov esi, [allocated_mem]
    mov ecx, 1024
    mov eax, 0xDEADBEEF
    
validate_memory:
    cmp [esi], eax
    jne memory_corruption
    add esi, 4
    loop validate_memory
    
    invoke printf, memory_valid_fmt
    
    ; Free memory
    invoke HeapFree, [heap_handle], 0, [allocated_mem]
    
    ; Virtual memory allocation
    invoke VirtualAlloc, 0, 65536, MEM_COMMIT or MEM_RESERVE, PAGE_READWRITE
    test eax, eax
    jz virtual_alloc_failed
    
    invoke printf, virtual_alloc_fmt, eax
    
    ; Free virtual memory
    invoke VirtualFree, eax, 0, MEM_RELEASE
    ret
    
heap_alloc_failed:
    invoke printf, heap_error_fmt
    ret
    
memory_corruption:
    invoke printf, memory_corrupt_fmt
    ret
    
virtual_alloc_failed:
    invoke printf, virtual_error_fmt
    ret

demo_file_operations:
    ; Advanced file system operations
    
    ; Create file with specific attributes
    invoke CreateFile, test_filename, GENERIC_WRITE, 0, 0, \
           CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, 0
    
    cmp eax, INVALID_HANDLE_VALUE
    je file_create_failed
    mov [file_handle], eax
    
    ; Write data to file
    invoke WriteFile, [file_handle], file_data, \
           sizeof.file_data - 1, bytes_written, 0
    
    test eax, eax
    jz file_write_failed
    
    invoke printf, file_write_fmt, [bytes_written]
    
    ; Set file pointer to beginning
    invoke SetFilePointer, [file_handle], 0, 0, FILE_BEGIN
    
    ; Get file size
    invoke GetFileSize, [file_handle], 0
    invoke printf, file_size_fmt, eax
    
    ; Close file
    invoke CloseHandle, [file_handle]
    
    ; Get file attributes
    invoke GetFileAttributes, test_filename
    cmp eax, INVALID_FILE_ATTRIBUTES
    je file_attr_failed
    
    invoke printf, file_attr_fmt, eax
    
    ; Delete file
    invoke DeleteFile, test_filename
    test eax, eax
    jz file_delete_failed
    
    invoke printf, file_delete_fmt
    ret
    
file_create_failed:
file_write_failed:
file_attr_failed:
file_delete_failed:
    invoke GetLastError
    invoke printf, file_error_fmt, eax
    ret

demo_registry_operations:
    ; Registry manipulation
    
    ; Open registry key
    invoke RegOpenKeyEx, HKEY_CURRENT_USER, \
           software_key, 0, KEY_ALL_ACCESS, registry_key
    
    test eax, eax
    jnz reg_open_failed
    
    ; Set registry value
    invoke RegSetValueEx, [registry_key], value_name, 0, REG_SZ, \
           value_data, sizeof.value_data
    
    test eax, eax
    jnz reg_set_failed
    
    invoke printf, reg_set_fmt
    
    ; Query registry value
    invoke RegQueryValueEx, [registry_key], value_name, 0, \
           value_type, query_buffer, query_size
    
    test eax, eax
    jnz reg_query_failed
    
    invoke printf, reg_query_fmt, query_buffer
    
    ; Delete registry value
    invoke RegDeleteValue, [registry_key], value_name
    
    ; Close registry key
    invoke RegCloseKey, [registry_key]
    ret
    
reg_open_failed:
reg_set_failed:
reg_query_failed:
    invoke printf, reg_error_fmt, eax
    ret

demo_security_operations:
    ; Security and access control
    
    ; Get current user information
    mov dword [token_info_length], 1024
    invoke GetCurrentProcess
    invoke OpenProcessToken, eax, TOKEN_QUERY, process_token
    
    test eax, eax
    jz token_failed
    
    invoke GetTokenInformation, [process_token], TokenUser, \
           token_buffer, [token_info_length], token_info_length
    
    test eax, eax
    jz token_info_failed
    
    invoke printf, token_info_fmt
    
    ; Get security descriptor for current directory
    invoke GetFileSecurity, current_dir, OWNER_SECURITY_INFORMATION, \
           security_descriptor, 1024, security_desc_size
    
    test eax, eax
    jz security_failed
    
    invoke printf, security_info_fmt
    
    invoke CloseHandle, [process_token]
    ret
    
token_failed:
token_info_failed:
security_failed:
    invoke GetLastError
    invoke printf, security_error_fmt, eax
    ret

demo_threading:
    ; Multi-threading operations
    
    ; Create thread with specific attributes
    invoke CreateThread, 0, 0, worker_thread, thread_param, 0, thread_id
    
    test eax, eax
    jz thread_create_failed
    mov [thread_handle], eax
    
    invoke printf, thread_created_fmt, [thread_id]
    
    ; Wait for thread completion
    invoke WaitForSingleObject, [thread_handle], INFINITE
    
    ; Get thread exit code
    invoke GetExitCodeThread, [thread_handle], thread_exit_code
    invoke printf, thread_exit_fmt, [thread_exit_code]
    
    invoke CloseHandle, [thread_handle]
    
    ; Demonstrate thread synchronization
    call demo_synchronization
    ret
    
thread_create_failed:
    invoke GetLastError
    invoke printf, thread_error_fmt, eax
    ret

worker_thread:
    ; Worker thread function
    push ebp
    mov ebp, esp
    
    ; Simulate work
    mov ecx, 1000000
worker_loop:
    nop
    loop worker_loop
    
    invoke printf, worker_complete_fmt
    
    mov eax, 42                    ; Thread exit code
    pop ebp
    ret

demo_synchronization:
    ; Thread synchronization primitives
    
    ; Create mutex
    invoke CreateMutex, 0, FALSE, mutex_name
    test eax, eax
    jz mutex_failed
    mov [mutex_handle], eax
    
    ; Create event
    invoke CreateEvent, 0, FALSE, FALSE, event_name
    test eax, eax
    jz event_failed
    mov [event_handle], eax
    
    ; Create semaphore
    invoke CreateSemaphore, 0, 1, 10, semaphore_name
    test eax, eax
    jz semaphore_failed
    mov [semaphore_handle], eax
    
    invoke printf, sync_objects_fmt
    
    ; Clean up synchronization objects
    invoke CloseHandle, [mutex_handle]
    invoke CloseHandle, [event_handle]
    invoke CloseHandle, [semaphore_handle]
    ret
    
mutex_failed:
event_failed:
semaphore_failed:
    invoke GetLastError
    invoke printf, sync_error_fmt, eax
    ret

section '.data' data readable writeable
    ; Process management
    exit_code           dd 0
    
    ; Threading
    thread_handle       dd 0
    thread_id           dd 0
    thread_param        dd 123
    thread_exit_code    dd 0
    
    ; Synchronization
    mutex_handle        dd 0
    event_handle        dd 0
    semaphore_handle    dd 0
    mutex_name          db 'TestMutex', 0
    event_name          db 'TestEvent', 0
    semaphore_name      db 'TestSemaphore', 0
    
    ; Registry
    software_key        db 'Software\TestApp', 0
    value_type          dd 0
    query_buffer        rb 256
    query_size          dd 256
    
    ; Security
    process_token       dd 0
    token_buffer        rb 1024
    token_info_length   dd 0
    security_descriptor rb 1024
    security_desc_size  dd 0
    current_dir         db '.', 0
    
    ; Format strings
    process_created_fmt     db 'Process created with ID: %d', 13, 10, 0
    process_exit_fmt        db 'Process exited with code: %d', 13, 10, 0
    process_timeout_fmt     db 'Process timed out', 13, 10, 0
    process_error_fmt       db 'Process creation failed: %d', 13, 10, 0
    
    memory_valid_fmt        db 'Memory validation passed', 13, 10, 0
    memory_corrupt_fmt      db 'Memory corruption detected!', 13, 10, 0
    heap_error_fmt          db 'Heap allocation failed', 13, 10, 0
    virtual_alloc_fmt       db 'Virtual memory allocated at: 0x%08X', 13, 10, 0
    virtual_error_fmt       db 'Virtual allocation failed', 13, 10, 0
    
    file_write_fmt          db 'Wrote %d bytes to file', 13, 10, 0
    file_size_fmt           db 'File size: %d bytes', 13, 10, 0
    file_attr_fmt           db 'File attributes: 0x%08X', 13, 10, 0
    file_delete_fmt         db 'File deleted successfully', 13, 10, 0
    file_error_fmt          db 'File operation failed: %d', 13, 10, 0
    
    reg_set_fmt             db 'Registry value set', 13, 10, 0
    reg_query_fmt           db 'Registry value: %s', 13, 10, 0
    reg_error_fmt           db 'Registry operation failed: %d', 13, 10, 0
    
    token_info_fmt          db 'Token information retrieved', 13, 10, 0
    security_info_fmt       db 'Security descriptor retrieved', 13, 10, 0
    security_error_fmt      db 'Security operation failed: %d', 13, 10, 0
    
    thread_created_fmt      db 'Thread created with ID: %d', 13, 10, 0
    thread_exit_fmt         db 'Thread exited with code: %d', 13, 10, 0
    thread_error_fmt        db 'Thread creation failed: %d', 13, 10, 0
    worker_complete_fmt     db 'Worker thread completed', 13, 10, 0
    
    sync_objects_fmt        db 'Synchronization objects created', 13, 10, 0
    sync_error_fmt          db 'Synchronization failed: %d', 13, 10, 0

section '.idata' import data readable writeable
    library kernel32, 'KERNEL32.DLL', \
            advapi32, 'ADVAPI32.DLL', \
            msvcrt, 'MSVCRT.DLL'
    
    import kernel32, \
           ExitProcess, 'ExitProcess', \
           CreateProcess, 'CreateProcessA', \
           WaitForSingleObject, 'WaitForSingleObject', \
           GetExitCodeProcess, 'GetExitCodeProcess', \
           TerminateProcess, 'TerminateProcess', \
           CloseHandle, 'CloseHandle', \
           GetLastError, 'GetLastError', \
           GetProcessHeap, 'GetProcessHeap', \
           HeapAlloc, 'HeapAlloc', \
           HeapFree, 'HeapFree', \
           VirtualAlloc, 'VirtualAlloc', \
           VirtualFree, 'VirtualFree', \
           CreateFile, 'CreateFileA', \
           WriteFile, 'WriteFile', \
           SetFilePointer, 'SetFilePointer', \
           GetFileSize, 'GetFileSize', \
           GetFileAttributes, 'GetFileAttributesA', \
           DeleteFile, 'DeleteFileA', \
           CreateThread, 'CreateThread', \
           GetExitCodeThread, 'GetExitCodeThread', \
           CreateMutex, 'CreateMutexA', \
           CreateEvent, 'CreateEventA', \
           CreateSemaphore, 'CreateSemaphoreA', \
           GetCurrentProcess, 'GetCurrentProcess'
    
    import advapi32, \
           RegOpenKeyEx, 'RegOpenKeyExA', \
           RegSetValueEx, 'RegSetValueExA', \
           RegQueryValueEx, 'RegQueryValueExA', \
           RegDeleteValue, 'RegDeleteValueA', \
           RegCloseKey, 'RegCloseKey', \
           OpenProcessToken, 'OpenProcessToken', \
           GetTokenInformation, 'GetTokenInformation', \
           GetFileSecurity, 'GetFileSecurityA'
    
    import msvcrt, printf, 'printf'
```

## Linux System Programming in Assembly

### System Calls and Kernel Interface

Linux system programming uses a different approach, with direct system calls instead of API functions.

```assembly
format ELF64 executable

section '.data' writeable
    ; File operations
    filename        db '/tmp/test_asm.txt', 0
    file_content    db 'Hello from Linux assembly!', 10, 0
    content_len     equ $ - file_content - 1
    
    ; Process information
    pid_msg         db 'Process ID: ', 0
    ppid_msg        db 'Parent ID: ', 0
    uid_msg         db 'User ID: ', 0
    gid_msg         db 'Group ID: ', 0
    
    ; Shared memory
    shm_key         dd 0x1234
    shm_size        equ 4096
    
    ; Signal handling
    signal_msg      db 'Signal received!', 10, 0
    signal_len      equ $ - signal_msg - 1

section '.bss' writeable
    buffer          resb 1024
    stat_buffer     resb 144        ; struct stat size
    shm_id          resd 1
    shm_addr        resq 1

section '.text' executable

global _start

_start:
    call demo_file_operations
    call demo_process_info
    call demo_memory_mapping
    call demo_inter_process_comm
    call demo_signal_handling
    
    ; Exit program
    mov rax, 60                     ; sys_exit
    mov rdi, 0                      ; exit status
    syscall

demo_file_operations:
    ; Create and write to file
    mov rax, 2                      ; sys_open
    mov rdi, filename               ; filename
    mov rsi, 0x241                  ; O_CREAT | O_WRONLY | O_TRUNC
    mov rdx, 0o644                  ; permissions
    syscall
    
    test rax, rax
    js file_error
    mov r8, rax                     ; save file descriptor
    
    ; Write content
    mov rax, 1                      ; sys_write
    mov rdi, r8                     ; file descriptor
    mov rsi, file_content           ; buffer
    mov rdx, content_len            ; length
    syscall
    
    ; Close file
    mov rax, 3                      ; sys_close
    mov rdi, r8                     ; file descriptor
    syscall
    
    ; Get file statistics
    mov rax, 4                      ; sys_stat
    mov rdi, filename
    mov rsi, stat_buffer
    syscall
    
    test rax, rax
    js stat_error
    
    ; Print file size (from stat structure)
    mov rax, [stat_buffer + 48]     ; st_size offset
    call print_number
    
    ; Delete file
    mov rax, 87                     ; sys_unlink
    mov rdi, filename
    syscall
    
    ret

file_error:
stat_error:
    ; Handle file operation errors
    mov rax, 1                      ; sys_write
    mov rdi, 2                      ; stderr
    mov rsi, error_msg
    mov rdx, error_len
    syscall
    ret

demo_process_info:
    ; Get process ID
    mov rax, 39                     ; sys_getpid
    syscall
    
    push rax
    mov rax, 1                      ; sys_write
    mov rdi, 1                      ; stdout
    mov rsi, pid_msg
    mov rdx, 12
    syscall
    
    pop rax
    call print_number
    call print_newline
    
    ; Get parent process ID
    mov rax, 110                    ; sys_getppid
    syscall
    
    push rax
    mov rax, 1
    mov rdi, 1
    mov rsi, ppid_msg
    mov rdx, 11
    syscall
    
    pop rax
    call print_number
    call print_newline
    
    ; Get user ID
    mov rax, 102                    ; sys_getuid
    syscall
    
    push rax
    mov rax, 1
    mov rdi, 1
    mov rsi, uid_msg
    mov rdx, 9
    syscall
    
    pop rax
    call print_number
    call print_newline
    
    ; Get group ID
    mov rax, 104                    ; sys_getgid
    syscall
    
    push rax
    mov rax, 1
    mov rdi, 1
    mov rsi, gid_msg
    mov rdx, 10
    syscall
    
    pop rax
    call print_number
    call print_newline
    
    ret

demo_memory_mapping:
    ; Memory map a file
    mov rax, 2                      ; sys_open
    mov rdi, filename
    mov rsi, 0                      ; O_RDONLY
    mov rdx, 0
    syscall
    
    test rax, rax
    js mmap_error
    mov r8, rax                     ; save file descriptor
    
    ; Map memory
    mov rax, 9                      ; sys_mmap
    mov rdi, 0                      ; addr (let kernel choose)
    mov rsi, 4096                   ; length
    mov rdx, 1                      ; PROT_READ
    mov r10, 1                      ; MAP_SHARED
    mov r8, r8                      ; file descriptor
    mov r9, 0                       ; offset
    syscall
    
    cmp rax, -1
    je mmap_error
    mov [shm_addr], rax             ; save mapped address
    
    ; Access mapped memory
    mov rsi, rax
    mov al, [rsi]                   ; Read first byte
    
    ; Unmap memory
    mov rax, 11                     ; sys_munmap
    mov rdi, [shm_addr]
    mov rsi, 4096
    syscall
    
    ; Close file descriptor
    mov rax, 3                      ; sys_close
    mov rdi, r8
    syscall
    
    ret

mmap_error:
    ret

demo_inter_process_comm:
    ; Create shared memory segment
    mov rax, 29                     ; sys_shmget
    mov rdi, [shm_key]
    mov rsi, shm_size
    mov rdx, 0x200 | 0x400 | 0o644  ; IPC_CREAT | IPC_EXCL | permissions
    syscall
    
    test rax, rax
    js shm_error
    mov [shm_id], eax
    
    ; Attach shared memory
    mov rax, 30                     ; sys_shmat
    mov rdi, [shm_id]
    mov rsi, 0                      ; let kernel choose address
    mov rdx, 0                      ; flags
    syscall
    
    cmp rax, -1
    je shm_attach_error
    mov [shm_addr], rax
    
    ; Write to shared memory
    mov rdi, rax
    mov rsi, file_content
    mov rcx, content_len
    rep movsb
    
    ; Detach shared memory
    mov rax, 67                     ; sys_shmdt
    mov rdi, [shm_addr]
    syscall
    
    ; Remove shared memory segment
    mov rax, 31                     ; sys_shmctl
    mov rdi, [shm_id]
    mov rsi, 0                      ; IPC_RMID
    mov rdx, 0
    syscall
    
    ret

shm_error:
shm_attach_error:
    ret

demo_signal_handling:
    ; Install signal handler for SIGUSR1
    mov rax, 13                     ; sys_rt_sigaction
    mov rdi, 10                     ; SIGUSR1
    mov rsi, sigaction_struct
    mov rdx, 0                      ; old action
    mov r10, 8                      ; sigset size
    syscall
    
    ; Send signal to self
    mov rax, 39                     ; sys_getpid
    syscall
    mov r8, rax                     ; save PID
    
    mov rax, 62                     ; sys_kill
    mov rdi, r8                     ; PID
    mov rsi, 10                     ; SIGUSR1
    syscall
    
    ; Small delay to allow signal processing
    mov rax, 35                     ; sys_nanosleep
    mov rdi, timespec_struct
    mov rsi, 0
    syscall
    
    ret

signal_handler:
    ; Signal handler function
    mov rax, 1                      ; sys_write
    mov rdi, 1                      ; stdout
    mov rsi, signal_msg
    mov rdx, signal_len
    syscall
    ret

print_number:
    ; Convert number in RAX to decimal and print
    push rbp
    mov rbp, rsp
    sub rsp, 32                     ; space for digits
    
    mov rbx, 10                     ; divisor
    mov rcx, 0                      ; digit count
    
convert_loop:
    xor rdx, rdx
    div rbx                         ; divide by 10
    add dl, '0'                     ; convert remainder to ASCII
    mov [rbp + rcx - 32], dl        ; store digit
    inc rcx
    test rax, rax
    jnz convert_loop
    
    ; Print digits in reverse order
    mov rax, 1                      ; sys_write
    mov rdi, 1                      ; stdout
    lea rsi, [rbp + rcx - 32]       ; start of digits
    mov rdx, rcx                    ; length
    syscall
    
    mov rsp, rbp
    pop rbp
    ret

print_newline:
    mov rax, 1                      ; sys_write
    mov rdi, 1                      ; stdout
    mov rsi, newline
    mov rdx, 1
    syscall
    ret

section '.data' writeable
    error_msg       db 'Error occurred!', 10, 0
    error_len       equ $ - error_msg - 1
    newline         db 10
    
    ; Signal handling structures
    sigaction_struct:
        dq signal_handler           ; sa_handler
        dq 0                        ; sa_flags
        dq 0                        ; sa_restorer
        times 16 db 0               ; sa_mask
    
    timespec_struct:
        dq 0                        ; tv_sec
        dq 100000000                ; tv_nsec (0.1 second)
```

## Device Driver Programming

Device drivers require the deepest level of system programming knowledge, interfacing directly with hardware and the kernel.

### Windows Kernel Driver Framework

```assembly
; Note: This is a simplified example for educational purposes
; Real Windows drivers require the Windows Driver Kit (WDK)

format PE DLL

include 'ntddk.inc'

section '.data' data readable writeable
    device_name     UNICODE_STRING
    symbolic_link   UNICODE_STRING
    device_object   dd 0
    
    device_name_str     du '\Device\SampleDriver', 0
    symbolic_link_str   du '\DosDevices\SampleDriver', 0

section '.code' code readable executable

proc DriverEntry uses ebx esi edi, DriverObject, RegistryPath
    local status:DWORD
    
    ; Initialize device name
    invoke RtlInitUnicodeString, device_name, device_name_str
    invoke RtlInitUnicodeString, symbolic_link, symbolic_link_str
    
    ; Create device object
    invoke IoCreateDevice, [DriverObject], 0, device_name, \
           FILE_DEVICE_UNKNOWN, FILE_DEVICE_SECURE_OPEN, FALSE, device_object
    
    test eax, eax
    jnz create_device_failed
    
    ; Create symbolic link
    invoke IoCreateSymbolicLink, symbolic_link, device_name
    test eax, eax
    jnz create_link_failed
    
    ; Set up dispatch routines
    mov ebx, [DriverObject]
    mov eax, SampleDispatchCreate
    mov [ebx + DRIVER_OBJECT.MajorFunction + IRP_MJ_CREATE*4], eax
    mov eax, SampleDispatchClose
    mov [ebx + DRIVER_OBJECT.MajorFunction + IRP_MJ_CLOSE*4], eax
    mov eax, SampleDispatchRead
    mov [ebx + DRIVER_OBJECT.MajorFunction + IRP_MJ_READ*4], eax
    mov eax, SampleDispatchWrite
    mov [ebx + DRIVER_OBJECT.MajorFunction + IRP_MJ_WRITE*4], eax
    mov eax, SampleDispatchDeviceControl
    mov [ebx + DRIVER_OBJECT.MajorFunction + IRP_MJ_DEVICE_CONTROL*4], eax
    
    ; Set unload routine
    mov eax, SampleUnload
    mov [ebx + DRIVER_OBJECT.DriverUnload], eax
    
    ; Set device flags
    mov ebx, [device_object]
    or [ebx + DEVICE_OBJECT.Flags], DO_BUFFERED_IO
    and [ebx + DEVICE_OBJECT.Flags], not DO_DEVICE_INITIALIZING
    
    mov eax, STATUS_SUCCESS
    ret
    
create_link_failed:
    invoke IoDeleteDevice, [device_object]
    
create_device_failed:
    mov eax, STATUS_UNSUCCESSFUL
    ret
endp

proc SampleDispatchCreate uses ebx esi edi, DeviceObject, Irp
    ; Handle IRP_MJ_CREATE
    mov ebx, [Irp]
    mov eax, STATUS_SUCCESS
    mov [ebx + IRP.IoStatus.Status], eax
    mov [ebx + IRP.IoStatus.Information], 0
    
    invoke IoCompleteRequest, [Irp], IO_NO_INCREMENT
    mov eax, STATUS_SUCCESS
    ret
endp

proc SampleDispatchClose uses ebx esi edi, DeviceObject, Irp
    ; Handle IRP_MJ_CLOSE
    mov ebx, [Irp]
    mov eax, STATUS_SUCCESS
    mov [ebx + IRP.IoStatus.Status], eax
    mov [ebx + IRP.IoStatus.Information], 0
    
    invoke IoCompleteRequest, [Irp], IO_NO_INCREMENT
    mov eax, STATUS_SUCCESS
    ret
endp

proc SampleDispatchRead uses ebx esi edi, DeviceObject, Irp
    local stack_location:DWORD
    local bytes_to_read:DWORD
    local buffer:DWORD
    
    ; Get current stack location
    invoke IoGetCurrentIrpStackLocation, [Irp]
    mov [stack_location], eax
    
    ; Get read parameters
    mov ebx, eax
    mov eax, [ebx + IO_STACK_LOCATION.Parameters.Read.Length]
    mov [bytes_to_read], eax
    
    ; Get system buffer
    mov ebx, [Irp]
    mov eax, [ebx + IRP.AssociatedIrp.SystemBuffer]
    mov [buffer], eax
    
    ; Fill buffer with sample data
    push edi
    mov edi, [buffer]
    mov ecx, [bytes_to_read]
    mov al, 'A'
    rep stosb
    pop edi
    
    ; Complete the IRP
    mov ebx, [Irp]
    mov eax, STATUS_SUCCESS
    mov [ebx + IRP.IoStatus.Status], eax
    mov eax, [bytes_to_read]
    mov [ebx + IRP.IoStatus.Information], eax
    
    invoke IoCompleteRequest, [Irp], IO_NO_INCREMENT
    mov eax, STATUS_SUCCESS
    ret
endp

proc SampleDispatchWrite uses ebx esi edi, DeviceObject, Irp
    local stack_location:DWORD
    local bytes_to_write:DWORD
    
    ; Get current stack location
    invoke IoGetCurrentIrpStackLocation, [Irp]
    mov [stack_location], eax
    
    ; Get write parameters
    mov ebx, eax
    mov eax, [ebx + IO_STACK_LOCATION.Parameters.Write.Length]
    mov [bytes_to_write], eax
    
    ; Process the write data (simplified)
    ; In a real driver, you would process the data appropriately
    
    ; Complete the IRP
    mov ebx, [Irp]
    mov eax, STATUS_SUCCESS
    mov [ebx + IRP.IoStatus.Status], eax
    mov eax, [bytes_to_write]
    mov [ebx + IRP.IoStatus.Information], eax
    
    invoke IoCompleteRequest, [Irp], IO_NO_INCREMENT
    mov eax, STATUS_SUCCESS
    ret
endp

proc SampleDispatchDeviceControl uses ebx esi edi, DeviceObject, Irp
    local stack_location:DWORD
    local control_code:DWORD
    local input_buffer_length:DWORD
    local output_buffer_length:DWORD
    local buffer:DWORD
    
    ; Get current stack location
    invoke IoGetCurrentIrpStackLocation, [Irp]
    mov [stack_location], eax
    
    ; Get IOCTL parameters
    mov ebx, eax
    mov eax, [ebx + IO_STACK_LOCATION.Parameters.DeviceIoControl.IoControlCode]
    mov [control_code], eax
    mov eax, [ebx + IO_STACK_LOCATION.Parameters.DeviceIoControl.InputBufferLength]
    mov [input_buffer_length], eax
    mov eax, [ebx + IO_STACK_LOCATION.Parameters.DeviceIoControl.OutputBufferLength]
    mov [output_buffer_length], eax
    
    ; Get buffer
    mov ebx, [Irp]
    mov eax, [ebx + IRP.AssociatedIrp.SystemBuffer]
    mov [buffer], eax
    
    ; Process IOCTL based on control code
    mov eax, [control_code]
    cmp eax, IOCTL_SAMPLE_GET_VERSION
    je handle_get_version
    cmp eax, IOCTL_SAMPLE_SET_DATA
    je handle_set_data
    
    ; Unknown IOCTL
    mov ebx, [Irp]
    mov eax, STATUS_INVALID_DEVICE_REQUEST
    mov [ebx + IRP.IoStatus.Status], eax
    mov [ebx + IRP.IoStatus.Information], 0
    jmp complete_ioctl
    
handle_get_version:
    ; Return version information
    mov edi, [buffer]
    mov eax, 0x01000000             ; Version 1.0.0.0
    stosd
    
    mov ebx, [Irp]
    mov eax, STATUS_SUCCESS
    mov [ebx + IRP.IoStatus.Status], eax
    mov [ebx + IRP.IoStatus.Information], 4
    jmp complete_ioctl
    
handle_set_data:
    ; Process input data
    ; In a real driver, validate and process the input
    
    mov ebx, [Irp]
    mov eax, STATUS_SUCCESS
    mov [ebx + IRP.IoStatus.Status], eax
    mov eax, [input_buffer_length]
    mov [ebx + IRP.IoStatus.Information], eax
    
complete_ioctl:
    invoke IoCompleteRequest, [Irp], IO_NO_INCREMENT
    mov ebx, [Irp]
    mov eax, [ebx + IRP.IoStatus.Status]
    ret
endp

proc SampleUnload uses ebx esi edi, DriverObject
    ; Delete symbolic link
    invoke IoDeleteSymbolicLink, symbolic_link
    
    ; Delete device object
    invoke IoDeleteDevice, [device_object]
    
    ret
endp

section '.data' data readable writeable
    ; IOCTL codes
    IOCTL_SAMPLE_GET_VERSION    equ CTL_CODE(FILE_DEVICE_UNKNOWN, 0x800, METHOD_BUFFERED, FILE_ANY_ACCESS)
    IOCTL_SAMPLE_SET_DATA       equ CTL_CODE(FILE_DEVICE_UNKNOWN, 0x801, METHOD_BUFFERED, FILE_ANY_ACCESS)

section '.idata' import data readable writeable
    library ntoskrnl, 'ntoskrnl.exe'
    
    import ntoskrnl, \
           IoCreateDevice, 'IoCreateDevice', \
           IoDeleteDevice, 'IoDeleteDevice', \
           IoCreateSymbolicLink, 'IoCreateSymbolicLink', \
           IoDeleteSymbolicLink, 'IoDeleteSymbolicLink', \
           IoCompleteRequest, 'IoCompleteRequest', \
           IoGetCurrentIrpStackLocation, 'IoGetCurrentIrpStackLocation', \
           RtlInitUnicodeString, 'RtlInitUnicodeString'

section '.reloc' fixups data discardable
```

## Performance Monitoring and Debugging

System programming requires sophisticated debugging and performance monitoring capabilities.

### Hardware Performance Counters

```assembly
format PE console
entry start

include 'win32a.inc'

section '.data' data readable writeable
    ; Performance counter data
    frequency       dq 0
    start_counter   dq 0
    end_counter     dq 0
    
    ; CPU information
    cpu_vendor      db 13 dup(0)
    cpu_brand       db 49 dup(0)
    cpu_features    dd 0
    
    ; Cache information
    cache_info      dd 16 dup(0)
    
section '.code' code readable executable

start:
    call demo_performance_counters
    call demo_cpu_identification
    call demo_cache_analysis
    call demo_timing_measurements
    invoke ExitProcess, 0

demo_performance_counters:
    ; Get high-resolution timer frequency
    invoke QueryPerformanceFrequency, frequency
    test eax, eax
    jz no_perf_counter
    
    invoke printf, freq_fmt, dword [frequency], dword [frequency+4]
    
    ; Measure a simple operation
    invoke QueryPerformanceCounter, start_counter
    
    ; Operation to measure
    mov ecx, 1000000
    xor eax, eax
measure_loop:
    inc eax
    loop measure_loop
    
    invoke QueryPerformanceCounter, end_counter
    
    ; Calculate elapsed time
    mov eax, dword [end_counter]
    mov edx, dword [end_counter+4]
    sub eax, dword [start_counter]
    sbb edx, dword [start_counter+4]
    
    ; Convert to microseconds
    mov ebx, 1000000
    mul ebx
    div dword [frequency]
    
    invoke printf, time_fmt, eax
    ret
    
no_perf_counter:
    invoke printf, no_counter_fmt
    ret

demo_cpu_identification:
    ; Check if CPUID is available
    pushfd
    pop eax
    mov ecx, eax
    xor eax, 0x200000              ; Flip CPUID bit
    push eax
    popfd
    pushfd
    pop eax
    xor eax, ecx
    jz no_cpuid
    
    ; Get CPU vendor string
    xor eax, eax                   ; CPUID function 0
    cpuid
    
    mov [cpu_vendor], ebx          ; Store vendor string
    mov [cpu_vendor+4], edx
    mov [cpu_vendor+8], ecx
    
    invoke printf, vendor_fmt, cpu_vendor
    
    ; Get CPU features
    mov eax, 1                     ; CPUID function 1
    cpuid
    mov [cpu_features], edx
    
    ; Check specific features
    test edx, 1 shl 4              ; TSC
    jz no_tsc
    invoke printf, tsc_fmt
    
no_tsc:
    test edx, 1 shl 15             ; CMOV
    jz no_cmov
    invoke printf, cmov_fmt
    
no_cmov:
    test edx, 1 shl 23             ; MMX
    jz no_mmx
    invoke printf, mmx_fmt
    
no_mmx:
    test edx, 1 shl 25             ; SSE
    jz no_sse
    invoke printf, sse_fmt
    
no_sse:
    test edx, 1 shl 26             ; SSE2
    jz no_sse2
    invoke printf, sse2_fmt
    
no_sse2:
    ; Get extended CPU information
    mov eax, 0x80000000            ; Check if extended functions available
    cpuid
    cmp eax, 0x80000004
    jl no_brand
    
    ; Get CPU brand string (16 characters per call)
    mov eax, 0x80000002
    cpuid
    mov [cpu_brand], eax
    mov [cpu_brand+4], ebx
    mov [cpu_brand+8], ecx
    mov [cpu_brand+12], edx
    
    mov eax, 0x80000003
    cpuid
    mov [cpu_brand+16], eax
    mov [cpu_brand+20], ebx
    mov [cpu_brand+24], ecx
    mov [cpu_brand+28], edx
    
    mov eax, 0x80000004
    cpuid
    mov [cpu_brand+32], eax
    mov [cpu_brand+36], ebx
    mov [cpu_brand+40], ecx
    mov [cpu_brand+44], edx
    
    invoke printf, brand_fmt, cpu_brand
    
no_brand:
no_cpuid:
    ret

demo_cache_analysis:
    ; Get cache information using CPUID
    mov eax, 2                     ; CPUID function 2 (cache info)
    cpuid
    
    ; Store cache descriptors
    mov [cache_info], eax
    mov [cache_info+4], ebx
    mov [cache_info+8], ecx
    mov [cache_info+12], edx
    
    invoke printf, cache_fmt
    
    ; Analyze cache performance with different access patterns
    call measure_cache_performance
    ret

measure_cache_performance:
    ; Allocate test array
    invoke VirtualAlloc, 0, 1048576, MEM_COMMIT, PAGE_READWRITE  ; 1MB
    test eax, eax
    jz alloc_failed
    mov esi, eax
    
    ; Initialize array
    mov ecx, 262144                ; 1MB / 4 bytes
    xor eax, eax
init_array:
    mov [esi + eax*4], eax
    inc eax
    loop init_array
    
    ; Test 1: Sequential access
    rdtsc
    mov [start_counter], eax
    mov [start_counter+4], edx
    
    mov ecx, 262144
    xor eax, eax
    xor edx, edx
sequential_test:
    add edx, [esi + eax*4]         ; Sequential access
    inc eax
    loop sequential_test
    
    rdtsc
    mov [end_counter], eax
    mov [end_counter+4], edx
    
    ; Calculate time
    mov eax, dword [end_counter]
    sub eax, dword [start_counter]
    invoke printf, sequential_fmt, eax
    
    ; Test 2: Random access
    rdtsc
    mov [start_counter], eax
    mov [start_counter+4], edx
    
    mov ecx, 65536                 ; Fewer iterations for random access
    mov eax, 1                     ; PRNG seed
    xor edx, edx
random_test:
    ; Simple PRNG
    imul eax, 1103515245
    add eax, 12345
    and eax, 0x3FFFF               ; Mask to array size
    
    add edx, [esi + eax*4]         ; Random access
    loop random_test
    
    rdtsc
    mov [end_counter], eax
    mov [end_counter+4], edx
    
    ; Calculate time
    mov eax, dword [end_counter]
    sub eax, dword [start_counter]
    invoke printf, random_fmt, eax
    
    ; Free memory
    invoke VirtualFree, esi, 0, MEM_RELEASE
    ret
    
alloc_failed:
    invoke printf, alloc_fail_fmt
    ret

demo_timing_measurements:
    ; Demonstrate different timing methods
    
    ; Method 1: RDTSC (Read Time Stamp Counter)
    rdtsc
    mov [start_counter], eax
    mov [start_counter+4], edx
    
    ; Some operation to time
    mov ecx, 1000
timing_loop1:
    nop
    loop timing_loop1
    
    rdtsc
    sub eax, dword [start_counter]
    sbb edx, dword [start_counter+4]
    
    invoke printf, rdtsc_fmt, eax
    
    ; Method 2: QueryPerformanceCounter
    invoke QueryPerformanceCounter, start_counter
    
    mov ecx, 1000
timing_loop2:
    nop
    loop timing_loop2
    
    invoke QueryPerformanceCounter, end_counter
    
    mov eax, dword [end_counter]
    sub eax, dword [start_counter]
    invoke printf, qpc_fmt, eax
    
    ; Method 3: GetTickCount (millisecond resolution)
    invoke GetTickCount
    mov [start_counter], eax
    
    invoke Sleep, 100              ; Sleep for 100ms
    
    invoke GetTickCount
    sub eax, dword [start_counter]
    invoke printf, tick_fmt, eax
    
    ret

section '.data' data readable writeable
    ; Format strings
    freq_fmt        db 'Performance counter frequency: %u Hz', 13, 10, 0
    time_fmt        db 'Operation took %u microseconds', 13, 10, 0
    no_counter_fmt  db 'High-resolution performance counter not available', 13, 10, 0
    
    vendor_fmt      db 'CPU Vendor: %s', 13, 10, 0
    brand_fmt       db 'CPU Brand: %s', 13, 10, 0
    tsc_fmt         db 'TSC supported', 13, 10, 0
    cmov_fmt        db 'CMOV supported', 13, 10, 0
    mmx_fmt         db 'MMX supported', 13, 10, 0
    sse_fmt         db 'SSE supported', 13, 10, 0
    sse2_fmt        db 'SSE2 supported', 13, 10, 0
    
    cache_fmt       db 'Cache information retrieved', 13, 10, 0
    sequential_fmt  db 'Sequential access: %u cycles', 13, 10, 0
    random_fmt      db 'Random access: %u cycles', 13, 10, 0
    alloc_fail_fmt  db 'Memory allocation failed', 13, 10, 0
    
    rdtsc_fmt       db 'RDTSC timing: %u cycles', 13, 10, 0
    qpc_fmt         db 'QPC timing: %u ticks', 13, 10, 0
    tick_fmt        db 'GetTickCount timing: %u ms', 13, 10, 0

section '.idata' import data readable writeable
    library kernel32, 'KERNEL32.DLL', \
            msvcrt, 'MSVCRT.DLL'
    
    import kernel32, \
           ExitProcess, 'ExitProcess', \
           QueryPerformanceFrequency, 'QueryPerformanceFrequency', \
           QueryPerformanceCounter, 'QueryPerformanceCounter', \
           VirtualAlloc, 'VirtualAlloc', \
           VirtualFree, 'VirtualFree', \
           GetTickCount, 'GetTickCount', \
           Sleep, 'Sleep'
    
    import msvcrt, printf, 'printf'
```

This comprehensive chapter demonstrates the advanced techniques needed for system programming in assembly language. From Windows API integration to Linux system calls, device driver development, and performance monitoring, these examples provide the foundation for creating sophisticated system software.

The key to successful system programming is understanding both the high-level abstractions provided by the operating system and the low-level hardware details that make everything work. Assembly language gives you direct access to both, enabling you to create efficient, powerful system software that fully utilizes the capabilities of modern computer systems.