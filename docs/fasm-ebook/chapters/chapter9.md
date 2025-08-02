# Chapter 9: Building High-Performance Web Servers
*From Socket to Service*

## Introduction: The Web Server Revolution

Web servers are the backbone of the modern internet, handling millions of requests per second across the globe. While most developers reach for high-level frameworks, building a web server in assembly language offers unparalleled performance and control over every aspect of the networking stack. This chapter explores how to build production-grade web servers using FASM, from basic HTTP parsing to advanced features like connection pooling, SSL/TLS support, and high-concurrency handling.

Understanding web server internals at the assembly level provides insights that transcend any particular technology stack. You'll learn how operating system primitives work, how network protocols are implemented, and how to squeeze maximum performance from modern hardware. These skills are invaluable whether you're optimizing existing web applications or building the next generation of high-performance network services.

## Network Programming Fundamentals

### Socket Programming in Assembly

Network programming begins with sockets—the fundamental abstraction for network communication. In assembly, we work directly with system calls to create, bind, and manage network connections.

```assembly
format PE console
entry start

include 'win32a.inc'

section '.data' data readable writeable
    ; Socket structures
    sockaddr_in     SOCKADDR_IN
    server_socket   dd ?
    client_socket   dd ?
    wsa_data        WSADATA
    
    ; HTTP response templates
    http_200        db 'HTTP/1.1 200 OK', 13, 10
                    db 'Content-Type: text/html', 13, 10
                    db 'Content-Length: '
    content_len_str db '0000000000', 13, 10, 13, 10, 0
    
    http_404        db 'HTTP/1.1 404 Not Found', 13, 10
                    db 'Content-Type: text/html', 13, 10
                    db 'Content-Length: 23', 13, 10, 13, 10
                    db '<h1>404 Not Found</h1>', 0
    
    ; Server configuration
    server_port     dw 8080
    max_connections equ 1000
    buffer_size     equ 4096
    
    ; Request buffer and parsing
    request_buffer  rb buffer_size
    method_buffer   rb 16
    path_buffer     rb 256
    version_buffer  rb 16
    
    ; Connection pool
    connection_pool rd max_connections
    active_connections dd 0
    
section '.code' code readable executable

start:
    ; Initialize Winsock
    invoke WSAStartup, 0x0202, wsa_data
    test eax, eax
    jnz startup_error
    
    ; Create server socket
    invoke socket, AF_INET, SOCK_STREAM, 0
    cmp eax, INVALID_SOCKET
    je socket_error
    mov [server_socket], eax
    
    ; Configure server address
    mov [sockaddr_in.sin_family], AF_INET
    mov ax, [server_port]
    invoke htons, eax
    mov [sockaddr_in.sin_port], ax
    mov [sockaddr_in.sin_addr], INADDR_ANY
    
    ; Bind socket to address
    invoke bind, [server_socket], sockaddr_in, sizeof.SOCKADDR_IN
    test eax, eax
    jnz bind_error
    
    ; Start listening
    invoke listen, [server_socket], SOMAXCONN
    test eax, eax
    jnz listen_error
    
    call print_server_start
    call main_server_loop
    
    ; Cleanup
    invoke closesocket, [server_socket]
    invoke WSACleanup
    invoke ExitProcess, 0

main_server_loop:
    .accept_loop:
        ; Accept incoming connection
        invoke accept, [server_socket], 0, 0
        cmp eax, INVALID_SOCKET
        je .accept_loop
        
        mov [client_socket], eax
        call handle_client_request
        
        ; Close client socket
        invoke closesocket, [client_socket]
        jmp .accept_loop

handle_client_request:
    ; Receive HTTP request
    invoke recv, [client_socket], request_buffer, buffer_size-1, 0
    cmp eax, 0
    jle .request_error
    
    ; Null-terminate request
    mov byte [request_buffer + eax], 0
    
    ; Parse HTTP request
    call parse_http_request
    
    ; Route request based on path
    call route_request
    
    ret
    
    .request_error:
        call send_500_error
        ret

parse_http_request:
    ; Parse method (GET, POST, etc.)
    mov esi, request_buffer
    mov edi, method_buffer
    call extract_word
    
    ; Parse path
    call skip_whitespace
    mov edi, path_buffer
    call extract_word
    
    ; Parse HTTP version
    call skip_whitespace
    mov edi, version_buffer
    call extract_word
    
    ret

extract_word:
    ; Extract word from [esi] to [edi], advancing esi
    .extract_loop:
        lodsb
        cmp al, ' '
        je .word_end
        cmp al, 13  ; CR
        je .word_end
        cmp al, 10  ; LF
        je .word_end
        cmp al, 0
        je .word_end
        stosb
        jmp .extract_loop
    .word_end:
        mov byte [edi], 0
        ret

skip_whitespace:
    .skip_loop:
        lodsb
        cmp al, ' '
        je .skip_loop
        cmp al, 9   ; TAB
        je .skip_loop
        dec esi     ; Back up one character
        ret

route_request:
    ; Check if GET request
    push esi edi
    mov esi, method_buffer
    mov edi, get_method
    call compare_strings
    pop edi esi
    test eax, eax
    jz .not_get
    
    ; Route GET requests
    call route_get_request
    ret
    
    .not_get:
        ; Check POST method
        push esi edi
        mov esi, method_buffer
        mov edi, post_method
        call compare_strings
        pop edi esi
        test eax, eax
        jz .unsupported_method
        
        call route_post_request
        ret
    
    .unsupported_method:
        call send_405_error
        ret

route_get_request:
    ; Check for root path "/"
    push esi edi
    mov esi, path_buffer
    mov edi, root_path
    call compare_strings
    pop edi esi
    test eax, eax
    jz .not_root
    
    call serve_homepage
    ret
    
    .not_root:
        ; Check for /api/status
        push esi edi
        mov esi, path_buffer
        mov edi, status_path
        call compare_strings
        pop edi esi
        test eax, eax
        jz .not_status
        
        call serve_status
        ret
    
    .not_status:
        call send_404_error
        ret

serve_homepage:
    ; Serve main homepage
    mov esi, homepage_content
    call calculate_content_length
    call send_http_200_header
    call send_content
    ret

serve_status:
    ; Serve server status JSON
    call generate_status_json
    mov esi, status_json
    call calculate_content_length
    call send_json_header
    call send_content
    ret

send_http_200_header:
    ; Send HTTP 200 OK header with content length
    push eax    ; Save content length
    
    ; Send status line and headers
    invoke send, [client_socket], http_200, 45, 0
    
    ; Convert content length to string
    pop eax
    call int_to_string
    invoke send, [client_socket], content_len_str, eax, 0
    
    ret

send_content:
    ; Send content body pointed to by esi
    push esi
    call string_length
    pop esi
    invoke send, [client_socket], esi, eax, 0
    ret

calculate_content_length:
    ; Calculate length of string at esi, return in eax
    push esi
    call string_length
    pop esi
    ret

string_length:
    ; Calculate length of null-terminated string at esi
    push esi
    mov eax, 0
    .length_loop:
        cmp byte [esi + eax], 0
        je .length_done
        inc eax
        jmp .length_loop
    .length_done:
        pop esi
        ret

compare_strings:
    ; Compare strings at esi and edi, return 0 if equal
    .compare_loop:
        mov al, [esi]
        mov ah, [edi]
        cmp al, ah
        jne .not_equal
        test al, al
        jz .equal
        inc esi
        inc edi
        jmp .compare_loop
    .equal:
        mov eax, 0
        ret
    .not_equal:
        mov eax, 1
        ret

int_to_string:
    ; Convert integer in eax to string in content_len_str
    push ebx ecx edx
    mov ebx, 10
    mov ecx, 0
    mov edi, content_len_str + 9  ; Point to end of buffer
    
    .convert_loop:
        xor edx, edx
        div ebx
        add dl, '0'
        mov [edi], dl
        dec edi
        inc ecx
        test eax, eax
        jnz .convert_loop
    
    ; Move string to beginning and return length
    inc edi
    mov esi, edi
    mov edi, content_len_str
    rep movsb
    mov byte [edi], 0
    mov eax, ecx
    
    pop edx ecx ebx
    ret

; Error handlers
send_404_error:
    invoke send, [client_socket], http_404, 71, 0
    ret

send_405_error:
    invoke send, [client_socket], http_405, 69, 0
    ret

send_500_error:
    invoke send, [client_socket], http_500, 72, 0
    ret

; String constants
get_method      db 'GET', 0
post_method     db 'POST', 0
root_path       db '/', 0
status_path     db '/api/status', 0

homepage_content db '<html><head><title>FASM Web Server</title></head>'
                db '<body><h1>Welcome to FASM Web Server</h1>'
                db '<p>This high-performance web server is built entirely in assembly language!</p>'
                db '<ul><li><a href="/api/status">Server Status</a></li></ul>'
                db '</body></html>', 0

http_405        db 'HTTP/1.1 405 Method Not Allowed', 13, 10
                db 'Content-Length: 22', 13, 10, 13, 10
                db '<h1>Method Not Allowed</h1>', 0

http_500        db 'HTTP/1.1 500 Internal Server Error', 13, 10
                db 'Content-Length: 25', 13, 10, 13, 10
                db '<h1>Internal Server Error</h1>', 0

section '.idata' import data readable

library kernel32,'kernel32.dll',\
        ws2_32,'ws2_32.dll'

import kernel32,\
       ExitProcess,'ExitProcess',\
       GetTickCount,'GetTickCount'

import ws2_32,\
       WSAStartup,'WSAStartup',\
       WSACleanup,'WSACleanup',\
       socket,'socket',\
       bind,'bind',\
       listen,'listen',\
       accept,'accept',\
       recv,'recv',\
       send,'send',\
       closesocket,'closesocket',\
       htons,'htons'
```

## Advanced HTTP Protocol Implementation

### HTTP/1.1 Protocol Parsing

Understanding the HTTP protocol at the byte level is essential for building efficient web servers. HTTP requests consist of a method, path, version, headers, and optional body.

```assembly
; Advanced HTTP parser with header support
parse_http_headers:
    ; Skip past the request line to headers
    mov esi, request_buffer
    call skip_to_headers
    
    .header_loop:
        ; Check for end of headers (empty line)
        cmp word [esi], 0x0A0D  ; CRLF
        je .headers_done
        
        ; Parse header name
        mov edi, header_name_buffer
        call extract_header_name
        
        ; Skip colon and whitespace
        call skip_header_separator
        
        ; Parse header value
        mov edi, header_value_buffer
        call extract_header_value
        
        ; Process specific headers
        call process_header
        
        ; Skip to next line
        call skip_to_next_line
        jmp .header_loop
    
    .headers_done:
        ret

process_header:
    ; Check for Content-Length header
    push esi edi
    mov esi, header_name_buffer
    mov edi, content_length_header
    call compare_strings_case_insensitive
    pop edi esi
    test eax, eax
    jz .not_content_length
    
    ; Parse content length value
    call parse_content_length
    ret
    
    .not_content_length:
        ; Check for Connection header
        push esi edi
        mov esi, header_name_buffer
        mov edi, connection_header
        call compare_strings_case_insensitive
        pop edi esi
        test eax, eax
        jz .not_connection
        
        call parse_connection_header
        ret
    
    .not_connection:
        ; Handle other headers as needed
        ret

; Keep-Alive connection management
handle_keep_alive:
    cmp byte [connection_keep_alive], 1
    jne .close_connection
    
    ; Reuse connection for next request
    call reset_request_state
    jmp handle_client_request
    
    .close_connection:
        invoke closesocket, [client_socket]
        ret

; Chunked transfer encoding support
send_chunked_response:
    ; Send headers for chunked encoding
    invoke send, [client_socket], chunked_headers, chunked_headers_len, 0
    
    ; Send data in chunks
    mov esi, response_data
    mov ecx, [response_length]
    
    .chunk_loop:
        ; Calculate chunk size (max 1024 bytes)
        mov eax, ecx
        cmp eax, 1024
        jle .chunk_size_ok
        mov eax, 1024
    .chunk_size_ok:
        
        ; Send chunk size in hex
        call send_chunk_size
        
        ; Send chunk data
        invoke send, [client_socket], esi, eax, 0
        
        ; Send chunk terminator
        invoke send, [client_socket], crlf, 2, 0
        
        ; Update pointers
        add esi, eax
        sub ecx, eax
        jnz .chunk_loop
    
    ; Send final chunk (0-length)
    invoke send, [client_socket], final_chunk, 5, 0  ; "0\r\n\r\n"
    ret
```

## High-Concurrency Server Architecture

### Thread Pool Implementation

For handling multiple concurrent connections efficiently, we implement a thread pool that can serve many clients simultaneously.

```assembly
; Thread pool structure
thread_pool_size    equ 50
max_queue_size      equ 1000

section '.data' data readable writeable
    ; Thread pool
    thread_handles      rd thread_pool_size
    thread_ids          rd thread_pool_size
    active_threads      dd 0
    
    ; Work queue
    work_queue          rd max_queue_size
    queue_head          dd 0
    queue_tail          dd 0
    queue_size          dd 0
    
    ; Synchronization
    queue_mutex         dd 0
    work_available      dd 0
    shutdown_event      dd 0

init_thread_pool:
    ; Create synchronization objects
    invoke CreateMutex, 0, FALSE, 0
    mov [queue_mutex], eax
    
    invoke CreateEvent, 0, FALSE, FALSE, 0
    mov [work_available], eax
    
    invoke CreateEvent, 0, TRUE, FALSE, 0
    mov [shutdown_event], eax
    
    ; Create worker threads
    mov ecx, thread_pool_size
    mov ebx, 0
    
    .create_thread_loop:
        push ecx ebx
        invoke CreateThread, 0, 0, worker_thread_proc, ebx, 0, thread_ids + ebx*4
        mov [thread_handles + ebx*4], eax
        pop ebx ecx
        inc ebx
        loop .create_thread_loop
    
    mov [active_threads], thread_pool_size
    ret

worker_thread_proc:
    .work_loop:
        ; Wait for work or shutdown
        push 2
        push shutdown_event
        push work_available
        call WaitForMultipleObjects
        
        cmp eax, 0  ; work_available signaled
        je .process_work
        cmp eax, 1  ; shutdown signaled
        je .shutdown
        
        jmp .work_loop
    
    .process_work:
        call dequeue_work
        test eax, eax
        jz .work_loop
        
        ; Process client connection
        mov [client_socket], eax
        call handle_client_request
        invoke closesocket, [client_socket]
        
        jmp .work_loop
    
    .shutdown:
        invoke ExitThread, 0

enqueue_work:
    ; Add client socket to work queue
    ; eax = client socket
    invoke WaitForSingleObject, [queue_mutex], INFINITE
    
    ; Check if queue is full
    mov ebx, [queue_size]
    cmp ebx, max_queue_size
    jge .queue_full
    
    ; Add to queue
    mov ecx, [queue_tail]
    mov [work_queue + ecx*4], eax
    inc ecx
    cmp ecx, max_queue_size
    jl .tail_ok
    xor ecx, ecx
    .tail_ok:
        mov [queue_tail], ecx
        inc ebx
        mov [queue_size], ebx
    
    invoke ReleaseMutex, [queue_mutex]
    invoke SetEvent, [work_available]
    mov eax, 1  ; Success
    ret
    
    .queue_full:
        invoke ReleaseMutex, [queue_mutex]
        xor eax, eax  ; Failure
        ret

dequeue_work:
    ; Remove and return client socket from queue
    invoke WaitForSingleObject, [queue_mutex], INFINITE
    
    ; Check if queue is empty
    mov ebx, [queue_size]
    test ebx, ebx
    jz .queue_empty
    
    ; Remove from queue
    mov ecx, [queue_head]
    mov eax, [work_queue + ecx*4]
    inc ecx
    cmp ecx, max_queue_size
    jl .head_ok
    xor ecx, ecx
    .head_ok:
        mov [queue_head], ecx
        dec ebx
        mov [queue_size], ebx
    
    invoke ReleaseMutex, [queue_mutex]
    ret
    
    .queue_empty:
        invoke ReleaseMutex, [queue_mutex]
        xor eax, eax
        ret
```

## SSL/TLS Implementation

### Secure Socket Layer Support

Modern web servers require SSL/TLS support for secure communications. We'll integrate with OpenSSL for cryptographic operations.

```assembly
; SSL/TLS integration
section '.data' data readable writeable
    ssl_ctx         dd 0
    ssl_method      dd 0
    certificate_file db 'server.crt', 0
    private_key_file db 'server.key', 0

init_ssl:
    ; Initialize OpenSSL
    invoke SSL_library_init
    invoke SSL_load_error_strings
    invoke OpenSSL_add_all_algorithms
    
    ; Create SSL context
    invoke SSLv23_server_method
    mov [ssl_method], eax
    
    invoke SSL_CTX_new, eax
    mov [ssl_ctx], eax
    test eax, eax
    jz .ssl_error
    
    ; Load certificate
    invoke SSL_CTX_use_certificate_file, [ssl_ctx], certificate_file, SSL_FILETYPE_PEM
    cmp eax, 1
    jne .cert_error
    
    ; Load private key
    invoke SSL_CTX_use_PrivateKey_file, [ssl_ctx], private_key_file, SSL_FILETYPE_PEM
    cmp eax, 1
    jne .key_error
    
    ; Verify private key
    invoke SSL_CTX_check_private_key, [ssl_ctx]
    cmp eax, 1
    jne .key_verify_error
    
    ret
    
    .ssl_error:
    .cert_error:
    .key_error:
    .key_verify_error:
        ; Handle SSL errors
        call print_ssl_error
        invoke ExitProcess, 1

handle_ssl_client:
    ; Create SSL structure for client
    invoke SSL_new, [ssl_ctx]
    mov [client_ssl], eax
    test eax, eax
    jz .ssl_new_error
    
    ; Associate SSL with socket
    invoke SSL_set_fd, [client_ssl], [client_socket]
    
    ; Perform SSL handshake
    invoke SSL_accept, [client_ssl]
    cmp eax, 1
    jne .handshake_error
    
    ; Handle secure HTTP request
    call handle_secure_request
    
    ; Clean up SSL
    invoke SSL_shutdown, [client_ssl]
    invoke SSL_free, [client_ssl]
    ret
    
    .ssl_new_error:
    .handshake_error:
        call print_ssl_error
        ret

ssl_send:
    ; Send data over SSL connection
    ; esi = data pointer, ecx = data length
    invoke SSL_write, [client_ssl], esi, ecx
    ret

ssl_recv:
    ; Receive data over SSL connection
    ; edi = buffer pointer, ecx = buffer size
    invoke SSL_read, [client_ssl], edi, ecx
    ret
```

## Performance Optimization Techniques

### Zero-Copy Networking

Minimizing memory copies is crucial for high-performance servers. We implement zero-copy techniques where possible.

```assembly
; Memory-mapped file serving
serve_static_file:
    ; Open file for reading
    invoke CreateFile, [requested_file], GENERIC_READ, FILE_SHARE_READ, 0, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, 0
    cmp eax, INVALID_HANDLE_VALUE
    je .file_error
    mov [file_handle], eax
    
    ; Get file size
    invoke GetFileSize, [file_handle], 0
    mov [file_size], eax
    
    ; Create file mapping
    invoke CreateFileMapping, [file_handle], 0, PAGE_READONLY, 0, 0, 0
    test eax, eax
    jz .mapping_error
    mov [file_mapping], eax
    
    ; Map file into memory
    invoke MapViewOfFile, [file_mapping], FILE_MAP_READ, 0, 0, 0
    test eax, eax
    jz .map_error
    mov [mapped_file], eax
    
    ; Send HTTP headers
    call send_file_headers
    
    ; Send file using zero-copy (Windows: TransmitFile)
    invoke TransmitFile, [client_socket], [file_handle], [file_size], 0, 0, 0, TF_USE_KERNEL_APC
    
    ; Clean up
    invoke UnmapViewOfFile, [mapped_file]
    invoke CloseHandle, [file_mapping]
    invoke CloseHandle, [file_handle]
    ret
    
    .file_error:
    .mapping_error:
    .map_error:
        call send_404_error
        ret

; Asynchronous I/O with IOCP
init_iocp:
    ; Create I/O completion port
    invoke CreateIoCompletionPort, INVALID_HANDLE_VALUE, 0, 0, 0
    mov [iocp_handle], eax
    test eax, eax
    jz .iocp_error
    
    ; Create worker threads for IOCP
    mov ecx, [cpu_count]
    mov ebx, 0
    
    .create_iocp_thread_loop:
        push ecx ebx
        invoke CreateThread, 0, 0, iocp_worker_proc, 0, 0, 0
        pop ebx ecx
        inc ebx
        loop .create_iocp_thread_loop
    
    ret
    
    .iocp_error:
        invoke ExitProcess, 1

iocp_worker_proc:
    .completion_loop:
        ; Wait for completion
        invoke GetQueuedCompletionStatus, [iocp_handle], bytes_transferred, completion_key, overlapped_ptr, INFINITE
        test eax, eax
        jz .completion_loop
        
        ; Process completion
        mov eax, [completion_key]
        cmp eax, ACCEPT_COMPLETION
        je .handle_accept
        cmp eax, RECV_COMPLETION
        je .handle_recv
        cmp eax, SEND_COMPLETION
        je .handle_send
        
        jmp .completion_loop
    
    .handle_accept:
        call process_accept_completion
        jmp .completion_loop
    
    .handle_recv:
        call process_recv_completion
        jmp .completion_loop
    
    .handle_send:
        call process_send_completion
        jmp .completion_loop
```

## WebSocket Protocol Implementation

### Real-Time Communication

WebSockets enable real-time, bidirectional communication between client and server, essential for modern web applications.

```assembly
; WebSocket protocol implementation
websocket_key_guid  db '258EAFA5-E914-47DA-95CA-C5AB0DC85B11', 0

handle_websocket_upgrade:
    ; Check for WebSocket upgrade request
    call find_websocket_key
    test eax, eax
    jz .not_websocket
    
    ; Generate accept key
    call generate_websocket_accept
    
    ; Send upgrade response
    call send_websocket_upgrade_response
    
    ; Enter WebSocket mode
    call websocket_message_loop
    ret
    
    .not_websocket:
        ret

generate_websocket_accept:
    ; Concatenate WebSocket key with GUID
    mov esi, [websocket_key_ptr]
    mov edi, websocket_concat_buffer
    call copy_string
    
    mov esi, websocket_key_guid
    call concatenate_string
    
    ; Calculate SHA-1 hash
    invoke SHA1, websocket_concat_buffer, edi, sha1_hash
    
    ; Base64 encode the hash
    invoke Base64Encode, sha1_hash, 20, websocket_accept_key
    ret

send_websocket_upgrade_response:
    ; Send WebSocket upgrade response
    invoke send, [client_socket], websocket_response_header, websocket_response_len, 0
    invoke send, [client_socket], websocket_accept_key, 28, 0
    invoke send, [client_socket], crlf_crlf, 4, 0
    ret

websocket_message_loop:
    .message_loop:
        ; Receive WebSocket frame
        call receive_websocket_frame
        test eax, eax
        jz .connection_closed
        
        ; Parse frame
        call parse_websocket_frame
        
        ; Handle different frame types
        mov al, [frame_opcode]
        cmp al, WS_OPCODE_TEXT
        je .handle_text_frame
        cmp al, WS_OPCODE_BINARY
        je .handle_binary_frame
        cmp al, WS_OPCODE_CLOSE
        je .handle_close_frame
        cmp al, WS_OPCODE_PING
        je .handle_ping_frame
        cmp al, WS_OPCODE_PONG
        je .handle_pong_frame
        
        jmp .message_loop
    
    .handle_text_frame:
        call process_text_message
        jmp .message_loop
    
    .handle_binary_frame:
        call process_binary_message
        jmp .message_loop
    
    .handle_close_frame:
        call send_close_frame
        jmp .connection_closed
    
    .handle_ping_frame:
        call send_pong_frame
        jmp .message_loop
    
    .handle_pong_frame:
        ; Handle pong (connection keep-alive)
        jmp .message_loop
    
    .connection_closed:
        ret

parse_websocket_frame:
    ; Parse WebSocket frame format
    mov esi, frame_buffer
    
    ; First byte: FIN + RSV + Opcode
    lodsb
    mov [frame_fin], al
    and byte [frame_fin], 0x80
    mov [frame_opcode], al
    and byte [frame_opcode], 0x0F
    
    ; Second byte: MASK + Payload Length
    lodsb
    mov [frame_masked], al
    and byte [frame_masked], 0x80
    mov [payload_length], al
    and byte [payload_length], 0x7F
    
    ; Extended payload length
    cmp byte [payload_length], 126
    jl .length_done
    je .extended_16
    
    ; 64-bit length
    lodsd
    mov [payload_length_high], eax
    lodsd
    mov [payload_length_low], eax
    jmp .check_mask
    
    .extended_16:
        lodsw
        movzx eax, ax
        mov [payload_length_low], eax
        mov [payload_length_high], 0
    
    .length_done:
        movzx eax, byte [payload_length]
        mov [payload_length_low], eax
        mov [payload_length_high], 0
    
    .check_mask:
        ; Check if frame is masked
        cmp byte [frame_masked], 0
        je .no_mask
        
        ; Read masking key
        lodsd
        mov [masking_key], eax
        
        ; Unmask payload
        call unmask_payload
    
    .no_mask:
        mov [payload_start], esi
        ret

send_websocket_frame:
    ; Send WebSocket frame
    ; esi = payload data, ecx = payload length, al = opcode
    
    ; Build frame header
    mov edi, frame_header_buffer
    
    ; First byte: FIN = 1, opcode = al
    or al, 0x80  ; Set FIN bit
    stosb
    
    ; Payload length
    cmp ecx, 126
    jl .short_length
    cmp ecx, 65536
    jl .medium_length
    
    ; Long length (64-bit)
    mov al, 127
    stosb
    xor eax, eax
    stosd  ; High 32 bits = 0
    mov eax, ecx
    stosd  ; Low 32 bits = length
    jmp .send_header
    
    .medium_length:
        mov al, 126
        stosb
        mov ax, cx
        stosw
        jmp .send_header
    
    .short_length:
        mov al, cl
        stosb
    
    .send_header:
        ; Calculate header length
        mov eax, edi
        sub eax, frame_header_buffer
        mov [header_length], eax
        
        ; Send header
        invoke send, [client_socket], frame_header_buffer, [header_length], 0
        
        ; Send payload
        invoke send, [client_socket], esi, ecx, 0
        
        ret
```

## Advanced Features and Middleware

### Request/Response Middleware Pipeline

A sophisticated web server needs a flexible middleware system for handling cross-cutting concerns like authentication, logging, and caching.

```assembly
; Middleware pipeline
middleware_count    equ 10
middleware_stack    rd middleware_count
middleware_index    dd 0

register_middleware:
    ; Register middleware function
    ; eax = middleware function pointer
    mov ebx, [middleware_index]
    cmp ebx, middleware_count
    jge .stack_full
    
    mov [middleware_stack + ebx*4], eax
    inc ebx
    mov [middleware_index], ebx
    ret
    
    .stack_full:
        ; Handle middleware stack overflow
        ret

execute_middleware_pipeline:
    ; Execute all registered middleware
    mov ebx, 0
    
    .middleware_loop:
        cmp ebx, [middleware_index]
        jge .pipeline_done
        
        ; Call middleware function
        push ebx
        call [middleware_stack + ebx*4]
        pop ebx
        
        ; Check if middleware wants to stop processing
        test eax, eax
        jz .pipeline_stopped
        
        inc ebx
        jmp .middleware_loop
    
    .pipeline_done:
        mov eax, 1  ; Continue processing
        ret
    
    .pipeline_stopped:
        xor eax, eax  ; Stop processing
        ret

; Authentication middleware
auth_middleware:
    ; Check for Authorization header
    call find_auth_header
    test eax, eax
    jz .no_auth
    
    ; Parse Bearer token
    call parse_bearer_token
    test eax, eax
    jz .invalid_token
    
    ; Validate token
    call validate_jwt_token
    test eax, eax
    jz .invalid_token
    
    mov eax, 1  ; Continue pipeline
    ret
    
    .no_auth:
    .invalid_token:
        call send_401_unauthorized
        xor eax, eax  ; Stop pipeline
        ret

; Logging middleware
logging_middleware:
    ; Log request details
    call get_timestamp
    call log_request_start
    
    ; Continue processing
    mov eax, 1
    ret

; Compression middleware
compression_middleware:
    ; Check Accept-Encoding header
    call find_accept_encoding
    test eax, eax
    jz .no_compression
    
    ; Check for gzip support
    call check_gzip_support
    test eax, eax
    jz .no_compression
    
    ; Enable compression for response
    mov byte [enable_gzip], 1
    
    .no_compression:
        mov eax, 1  ; Continue pipeline
        ret
```

## Production Deployment and Monitoring

### Server Statistics and Health Monitoring

Production web servers need comprehensive monitoring and statistics collection for operational insights.

```assembly
; Server statistics
section '.data' data readable writeable
    stats_requests_total        dq 0
    stats_requests_per_second   dd 0
    stats_active_connections    dd 0
    stats_bytes_sent           dq 0
    stats_bytes_received       dq 0
    stats_errors_4xx           dd 0
    stats_errors_5xx           dd 0
    stats_response_times       rd 1000  ; Response time histogram
    stats_start_time           dq 0
    stats_uptime               dq 0

update_request_stats:
    ; Increment total requests
    lock inc dword [stats_requests_total]
    lock inc dword [stats_requests_total + 4]  ; Handle 64-bit overflow
    
    ; Update bytes sent/received
    lock add [stats_bytes_sent], eax
    lock add [stats_bytes_received], ebx
    
    ; Update response time
    call record_response_time
    
    ret

record_response_time:
    ; Record response time in histogram
    ; eax = response time in milliseconds
    cmp eax, 1000
    jge .slow_response
    
    ; Add to histogram bucket
    inc dword [stats_response_times + eax*4]
    ret
    
    .slow_response:
        ; Response time >= 1 second, use last bucket
        inc dword [stats_response_times + 999*4]
        ret

generate_stats_json:
    ; Generate JSON statistics response
    mov edi, stats_json_buffer
    
    ; Start JSON object
    mov al, '{'
    stosb
    
    ; Add request statistics
    call add_json_field_start
    mov esi, requests_total_field
    call add_json_string
    call add_json_separator
    mov eax, [stats_requests_total]
    call add_json_number
    
    ; Add active connections
    call add_json_comma
    call add_json_field_start
    mov esi, active_connections_field
    call add_json_string
    call add_json_separator
    mov eax, [stats_active_connections]
    call add_json_number
    
    ; Add uptime
    call add_json_comma
    call add_json_field_start
    mov esi, uptime_field
    call add_json_string
    call add_json_separator
    call calculate_uptime
    call add_json_number
    
    ; Close JSON object
    mov al, '}'
    stosb
    mov al, 0
    stosb
    
    ret

; Health check endpoint
serve_health_check:
    ; Simple health check - return 200 OK if server is healthy
    mov esi, health_ok_response
    call calculate_content_length
    call send_http_200_header
    call send_content
    ret

health_ok_response  db '{"status":"healthy","timestamp":'
health_timestamp    db '0000000000', '}', 0

; Configuration management
load_server_config:
    ; Load configuration from file
    invoke CreateFile, config_filename, GENERIC_READ, FILE_SHARE_READ, 0, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, 0
    cmp eax, INVALID_HANDLE_VALUE
    je .config_error
    mov [config_handle], eax
    
    ; Read configuration
    invoke ReadFile, [config_handle], config_buffer, 4096, bytes_read, 0
    invoke CloseHandle, [config_handle]
    
    ; Parse JSON configuration
    call parse_config_json
    ret
    
    .config_error:
        ; Use default configuration
        call set_default_config
        ret

parse_config_json:
    ; Simple JSON parser for configuration
    mov esi, config_buffer
    
    .parse_loop:
        call skip_whitespace
        cmp byte [esi], '}'
        je .parse_done
        cmp byte [esi], 0
        je .parse_done
        
        ; Parse field name
        call parse_json_string
        mov edi, field_name_buffer
        call copy_parsed_string
        
        ; Skip colon
        call skip_whitespace
        cmp byte [esi], ':'
        jne .parse_error
        inc esi
        
        ; Parse field value
        call skip_whitespace
        call parse_json_value
        
        ; Process configuration field
        call process_config_field
        
        ; Skip comma
        call skip_whitespace
        cmp byte [esi], ','
        jne .check_end
        inc esi
        jmp .parse_loop
    
    .check_end:
        cmp byte [esi], '}'
        je .parse_done
    
    .parse_error:
        ; Handle parsing error
        call log_config_error
    
    .parse_done:
        ret
```

This chapter provides a comprehensive foundation for building high-performance web servers in assembly language. From basic socket programming to advanced features like SSL/TLS, WebSockets, and production monitoring, you now have the tools to create industrial-strength web applications. The techniques presented here demonstrate the power and precision possible when working at the assembly level, offering insights that will enhance your understanding of web technologies regardless of the language you ultimately choose for development.

## Exercises

1. **Basic HTTP Server**: Implement a simple HTTP server that serves static files from a directory.

2. **WebSocket Chat Server**: Build a real-time chat server using WebSockets that can handle multiple concurrent users.

3. **Load Balancer**: Create a reverse proxy load balancer that distributes requests across multiple backend servers.

4. **REST API Server**: Implement a RESTful API server with JSON parsing and database integration.

5. **Performance Testing**: Use tools like Apache Bench or wrk to test your server's performance under load and optimize accordingly.

The next chapter will explore Redis integration, showing how to build high-performance caching and data storage solutions that complement your web server architecture.