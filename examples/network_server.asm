; High-Performance Network Server Framework
; Demonstrates advanced systems programming including:
; - Winsock API usage and network programming
; - Multi-threaded server architecture
; - Asynchronous I/O operations
; - Memory pool management
; - Protocol implementation (HTTP-like)
; - Performance monitoring and metrics

format PE console
entry start

include 'win32a.inc'

section '.data' data readable writeable
    ; Network configuration
    server_port     dw 8080
    max_connections dd 100
    buffer_size     dd 4096
    
    ; Server state
    server_socket   dd 0
    client_sockets  dd 100 dup(0)
    active_connections dd 0
    total_requests  dd 0
    bytes_transferred dq 0
    
    ; Memory pools
    buffer_pool     dd 100 dup(0)
    pool_available  dd 100
    pool_mutex      dd 0
    
    ; Thread management
    thread_handles  dd 50 dup(0)
    thread_count    dd 0
    server_running  dd 1
    
    ; WSA Data
    wsa_data        WSADATA
    
    ; Messages and responses
    startup_msg     db 'High-Performance Network Server v1.0', 13, 10
                    db 'Starting on port %d...', 13, 10, 0
    listening_msg   db 'Server listening on port %d', 13, 10
                    db 'Press Ctrl+C to stop', 13, 10, 0
    connection_msg  db 'Client connected from %s:%d', 13, 10, 0
    shutdown_msg    db 'Server shutting down...', 13, 10, 0
    stats_msg       db 'Connections: %d, Requests: %d, Bytes: %lld', 13, 10, 0
    
    ; HTTP-like response template
    http_response   db 'HTTP/1.1 200 OK', 13, 10
                    db 'Content-Type: text/html', 13, 10
                    db 'Content-Length: %d', 13, 10
                    db 'Server: FASM-Server/1.0', 13, 10
                    db 'Connection: close', 13, 10, 13, 10
                    db '%s', 0
    
    html_content    db '<html><head><title>FASM Server</title></head>'
                    db '<body><h1>High-Performance FASM Server</h1>'
                    db '<p>Request processed successfully!</p>'
                    db '<p>Server uptime: %d seconds</p>'
                    db '<p>Total requests: %d</p></body></html>', 0
    
    ; Error messages
    err_wsa_init    db 'Failed to initialize Winsock', 13, 10, 0
    err_socket      db 'Failed to create socket', 13, 10, 0
    err_bind        db 'Failed to bind socket', 13, 10, 0
    err_listen      db 'Failed to listen on socket', 13, 10, 0
    err_thread      db 'Failed to create thread', 13, 10, 0

section '.code' code readable executable

start:
    call initialize_server
    test eax, eax
    jz server_error
    
    call start_server_loop
    
    call cleanup_server
    push 0
    call [ExitProcess]

server_error:
    push -1
    call [ExitProcess]

; Initialize server components
initialize_server:
    push ebp
    mov ebp, esp
    push esi edi ebx
    
    ; Display startup message
    push dword [server_port]
    push startup_msg
    call [printf]
    add esp, 8
    
    ; Initialize Winsock
    push wsa_data
    push 0x0202                 ; Version 2.2
    call [WSAStartup]
    test eax, eax
    jnz init_wsa_error
    
    ; Create server socket
    push 0                      ; protocol
    push SOCK_STREAM           ; type
    push AF_INET               ; family
    call [socket]
    cmp eax, INVALID_SOCKET
    je init_socket_error
    mov [server_socket], eax
    
    ; Setup server address
    push ebp
    sub esp, sizeof.sockaddr_in
    mov ebp, esp
    
    mov word [ebp + sockaddr_in.sin_family], AF_INET
    mov ax, [server_port]
    call [htons]
    mov [ebp + sockaddr_in.sin_port], ax
    mov dword [ebp + sockaddr_in.sin_addr], INADDR_ANY
    
    ; Bind socket
    push sizeof.sockaddr_in
    push ebp
    push dword [server_socket]
    call [bind]
    add esp, sizeof.sockaddr_in
    pop ebp
    cmp eax, SOCKET_ERROR
    je init_bind_error
    
    ; Start listening
    push SOMAXCONN
    push dword [server_socket]
    call [listen]
    cmp eax, SOCKET_ERROR
    je init_listen_error
    
    ; Initialize memory pools
    call initialize_memory_pools
    
    ; Create mutex for thread synchronization
    push 0                      ; lpName
    push 0                      ; bInitialOwner
    push 0                      ; lpMutexAttributes
    call [CreateMutexA]
    mov [pool_mutex], eax
    
    ; Display listening message
    push dword [server_port]
    push listening_msg
    call [printf]
    add esp, 8
    
    mov eax, 1                  ; Success
    jmp init_exit

init_wsa_error:
    push err_wsa_init
    call [printf]
    add esp, 4
    jmp init_fail

init_socket_error:
    push err_socket
    call [printf]
    add esp, 4
    jmp init_fail

init_bind_error:
    push err_bind
    call [printf]
    add esp, 4
    jmp init_fail

init_listen_error:
    push err_listen
    call [printf]
    add esp, 4
    jmp init_fail

init_fail:
    mov eax, 0                  ; Failure

init_exit:
    pop ebx edi esi
    pop ebp
    ret

; Initialize memory pools for efficient buffer management
initialize_memory_pools:
    push ebp
    mov ebp, esp
    push esi edi ecx
    
    mov esi, buffer_pool
    mov ecx, 100                ; Number of buffers
    
pool_init_loop:
    push PAGE_READWRITE
    push MEM_COMMIT
    push dword [buffer_size]
    push 0
    call [VirtualAlloc]
    test eax, eax
    jz pool_init_error
    
    mov [esi], eax
    add esi, 4
    loop pool_init_loop
    
    mov [pool_available], 100
    jmp pool_init_success

pool_init_error:
    ; Handle error - for simplicity, continue with reduced buffers
    
pool_init_success:
    pop ecx edi esi
    pop ebp
    ret

; Main server loop
start_server_loop:
    push ebp
    mov ebp, esp
    push esi edi ebx
    
    mov dword [server_running], 1
    
server_loop:
    cmp dword [server_running], 0
    je server_loop_exit
    
    ; Accept incoming connection
    push 0                      ; addrlen
    push 0                      ; addr
    push dword [server_socket]
    call [accept]
    cmp eax, INVALID_SOCKET
    je server_loop_continue
    
    ; Create thread to handle client
    push eax                    ; Pass client socket as parameter
    push 0                      ; lpThreadId
    push 0                      ; dwCreationFlags
    push client_handler_thread  ; lpStartAddress
    push 0                      ; dwStackSize
    push 0                      ; lpThreadAttributes
    call [CreateThread]
    test eax, eax
    jz thread_create_error
    
    ; Store thread handle
    mov ebx, [thread_count]
    cmp ebx, 50
    jae server_loop_continue    ; Skip if too many threads
    
    mov esi, thread_handles
    mov [esi + ebx * 4], eax
    inc dword [thread_count]
    inc dword [active_connections]

server_loop_continue:
    ; Brief sleep to prevent tight loop
    push 10
    call [Sleep]
    jmp server_loop

thread_create_error:
    push err_thread
    call [printf]
    add esp, 4
    jmp server_loop_continue

server_loop_exit:
    pop ebx edi esi
    pop ebp
    ret

; Client handler thread procedure
; Parameter: client socket handle
client_handler_thread:
    push ebp
    mov ebp, esp
    push esi edi ebx
    
    mov esi, [ebp + 8]          ; Client socket
    
    ; Allocate buffer from pool
    call allocate_buffer
    test eax, eax
    jz client_no_buffer
    mov edi, eax                ; Buffer pointer
    
    ; Receive data from client
    push 0                      ; flags
    push dword [buffer_size]    ; len
    push edi                    ; buf
    push esi                    ; socket
    call [recv]
    cmp eax, SOCKET_ERROR
    je client_recv_error
    test eax, eax
    jz client_disconnected
    
    mov ebx, eax                ; Bytes received
    
    ; Process request (simplified HTTP-like processing)
    call process_http_request
    
    ; Send response
    call send_http_response
    
    ; Update statistics
    inc dword [total_requests]
    add dword [bytes_transferred], ebx
    adc dword [bytes_transferred + 4], 0
    
client_cleanup:
    ; Return buffer to pool
    push edi
    call deallocate_buffer
    
    ; Close client socket
    push esi
    call [closesocket]
    
    dec dword [active_connections]
    jmp client_exit

client_no_buffer:
client_recv_error:
client_disconnected:
    ; Close socket without processing
    push esi
    call [closesocket]
    dec dword [active_connections]

client_exit:
    pop ebx edi esi
    pop ebp
    push 0
    call [ExitThread]

; Process HTTP-like request (simplified)
; ESI = client socket, EDI = buffer, EBX = bytes received
process_http_request:
    push ebp
    mov ebp, esp
    
    ; For simplicity, just null-terminate the received data
    mov byte [edi + ebx], 0
    
    ; Parse request line (GET, POST, etc.)
    ; For this demo, we'll respond to any request
    
    pop ebp
    ret

; Send HTTP response to client
; ESI = client socket, EDI = buffer
send_http_response:
    push ebp
    mov ebp, esp
    sub esp, 2048               ; Local buffer for response
    push esi edi ebx ecx edx
    
    lea ebx, [ebp - 2048]       ; Response buffer
    
    ; Get current stats for response
    call [GetTickCount]
    mov ecx, eax                ; Uptime approximation
    shr ecx, 10                 ; Convert to seconds (approximate)
    
    ; Format HTML content
    push dword [total_requests]
    push ecx
    push html_content
    push ebx
    call [sprintf]
    add esp, 16
    
    mov ecx, eax                ; HTML content length
    
    ; Format HTTP response
    push ebx                    ; HTML content
    push ecx                    ; Content length
    push http_response
    push edi                    ; Use original buffer for response
    call [sprintf]
    add esp, 16
    
    mov edx, eax                ; Total response length
    
    ; Send response
    push 0                      ; flags
    push edx                    ; len
    push edi                    ; buf
    push esi                    ; socket
    call [send]
    
    pop edx ecx ebx edi esi
    mov esp, ebp
    pop ebp
    ret

; Allocate buffer from memory pool
; Returns buffer pointer in EAX, or 0 if no buffers available
allocate_buffer:
    push ebp
    mov ebp, esp
    push esi ebx ecx
    
    ; Wait for mutex
    push INFINITE
    push dword [pool_mutex]
    call [WaitForSingleObject]
    
    cmp dword [pool_available], 0
    je alloc_no_buffer
    
    ; Find first available buffer
    mov esi, buffer_pool
    mov ecx, 100
    
alloc_search:
    cmp dword [esi], 0
    jne alloc_found
    add esi, 4
    loop alloc_search
    jmp alloc_no_buffer

alloc_found:
    mov eax, [esi]              ; Get buffer pointer
    mov dword [esi], 0          ; Mark as used
    dec dword [pool_available]
    jmp alloc_exit

alloc_no_buffer:
    xor eax, eax                ; No buffer available

alloc_exit:
    ; Release mutex
    push dword [pool_mutex]
    call [ReleaseMutex]
    
    pop ecx ebx esi
    pop ebp
    ret

; Deallocate buffer back to pool
; Parameter: buffer pointer on stack
deallocate_buffer:
    push ebp
    mov ebp, esp
    push esi ebx ecx
    
    mov ebx, [ebp + 8]          ; Buffer to deallocate
    
    ; Wait for mutex
    push INFINITE
    push dword [pool_mutex]
    call [WaitForSingleObject]
    
    ; Find empty slot in pool
    mov esi, buffer_pool
    mov ecx, 100
    
dealloc_search:
    cmp dword [esi], 0
    je dealloc_found
    add esi, 4
    loop dealloc_search
    jmp dealloc_exit            ; Pool full (shouldn't happen)

dealloc_found:
    mov [esi], ebx              ; Return buffer to pool
    inc dword [pool_available]

dealloc_exit:
    ; Release mutex
    push dword [pool_mutex]
    call [ReleaseMutex]
    
    pop ecx ebx esi
    pop ebp
    ret 4

; Cleanup server resources
cleanup_server:
    push ebp
    mov ebp, esp
    push esi ecx
    
    push shutdown_msg
    call [printf]
    add esp, 4
    
    ; Set shutdown flag
    mov dword [server_running], 0
    
    ; Wait for threads to finish (simplified)
    push 5000                   ; 5 second timeout
    call [Sleep]
    
    ; Close server socket
    cmp dword [server_socket], 0
    je cleanup_no_socket
    push dword [server_socket]
    call [closesocket]

cleanup_no_socket:
    ; Cleanup Winsock
    call [WSACleanup]
    
    ; Display final statistics
    push qword [bytes_transferred]
    push dword [total_requests]
    push dword [active_connections]
    push stats_msg
    call [printf]
    add esp, 16
    
    ; Free memory pools
    mov esi, buffer_pool
    mov ecx, 100
    
cleanup_buffers:
    cmp dword [esi], 0
    je cleanup_next_buffer
    
    push MEM_RELEASE
    push 0
    push dword [esi]
    call [VirtualFree]

cleanup_next_buffer:
    add esi, 4
    loop cleanup_buffers
    
    ; Close mutex
    cmp dword [pool_mutex], 0
    je cleanup_exit
    push dword [pool_mutex]
    call [CloseHandle]

cleanup_exit:
    pop ecx esi
    pop ebp
    ret

section '.idata' import data readable writeable
    library kernel32, 'KERNEL32.DLL', \
            ws2_32, 'WS2_32.DLL', \
            msvcrt, 'MSVCRT.DLL'
    
    import kernel32, ExitProcess, 'ExitProcess', \
                     CreateThread, 'CreateThread', \
                     ExitThread, 'ExitThread', \
                     Sleep, 'Sleep', \
                     GetTickCount, 'GetTickCount', \
                     VirtualAlloc, 'VirtualAlloc', \
                     VirtualFree, 'VirtualFree', \
                     CreateMutexA, 'CreateMutexA', \
                     WaitForSingleObject, 'WaitForSingleObject', \
                     ReleaseMutex, 'ReleaseMutex', \
                     CloseHandle, 'CloseHandle'
    
    import ws2_32, WSAStartup, 'WSAStartup', \
                   WSACleanup, 'WSACleanup', \
                   socket, 'socket', \
                   bind, 'bind', \
                   listen, 'listen', \
                   accept, 'accept', \
                   recv, 'recv', \
                   send, 'send', \
                   closesocket, 'closesocket', \
                   htons, 'htons'
    
    import msvcrt, printf, 'printf', \
                   sprintf, 'sprintf'

; Constants
AF_INET = 2
SOCK_STREAM = 1
INVALID_SOCKET = -1
SOCKET_ERROR = -1
INADDR_ANY = 0
SOMAXCONN = 0x7fffffff
PAGE_READWRITE = 4
MEM_COMMIT = 0x1000
MEM_RELEASE = 0x8000
INFINITE = 0xFFFFFFFF

; Structures
struct WSADATA
    wVersion        dw ?
    wHighVersion    dw ?
    szDescription   db 257 dup(?)
    szSystemStatus  db 129 dup(?)
    iMaxSockets     dw ?
    iMaxUdpDg       dw ?
    lpVendorInfo    dd ?
ends

struct sockaddr_in
    sin_family  dw ?
    sin_port    dw ?
    sin_addr    dd ?
    sin_zero    db 8 dup(?)
ends