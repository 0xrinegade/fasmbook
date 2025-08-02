# Chapter 10: Redis Integration and High-Performance Caching
*Data at the Speed of Light*

## Introduction: The Memory Revolution

In the world of high-performance applications, memory is king. Redis, the in-memory data structure store, has revolutionized how we think about caching, session storage, and real-time data processing. When you combine Redis with assembly language programming, you unlock unprecedented levels of performance and control over your data access patterns.

This chapter explores how to integrate Redis into FASM applications, from basic key-value operations to advanced features like pub/sub messaging, Lua scripting, and cluster management. You'll learn to implement the Redis protocol from scratch, optimize network communications, and build custom Redis modules that extend functionality at the C level while maintaining assembly-level performance.

Understanding Redis at the protocol level provides insights into distributed systems design, memory management strategies, and the trade-offs between consistency and performance. These concepts are fundamental to modern application architecture, whether you're building microservices, real-time analytics systems, or high-frequency trading platforms.

## Redis Protocol Implementation

### RESP (Redis Serialization Protocol) Parser

Redis uses a simple, text-based protocol called RESP that's designed for high performance and easy parsing. Understanding this protocol is essential for building efficient Redis clients.

```assembly
format PE console
entry start

include 'win32a.inc'

section '.data' data readable writeable
    ; Redis connection settings
    redis_host      db '127.0.0.1', 0
    redis_port      dw 6379
    redis_socket    dd ?
    
    ; RESP protocol buffers
    command_buffer  rb 4096
    response_buffer rb 8192
    temp_buffer     rb 1024
    
    ; RESP type indicators
    RESP_SIMPLE_STRING  equ '+'
    RESP_ERROR         equ '-'
    RESP_INTEGER       equ ':'
    RESP_BULK_STRING   equ '$'
    RESP_ARRAY         equ '*'
    
    ; Connection state
    connected       db 0
    transaction_mode db 0
    pipeline_count  dd 0
    
    ; Performance counters
    commands_sent   dq 0
    bytes_sent      dq 0
    bytes_received  dq 0
    response_times  rd 1000
    
section '.code' code readable executable

start:
    call init_winsock
    call connect_to_redis
    call demo_redis_operations
    call disconnect_from_redis
    invoke ExitProcess, 0

connect_to_redis:
    ; Create socket
    invoke socket, AF_INET, SOCK_STREAM, 0
    cmp eax, INVALID_SOCKET
    je .socket_error
    mov [redis_socket], eax
    
    ; Configure server address
    mov [sockaddr_in.sin_family], AF_INET
    mov ax, [redis_port]
    invoke htons, eax
    mov [sockaddr_in.sin_port], ax
    
    ; Convert IP address
    invoke inet_addr, redis_host
    mov [sockaddr_in.sin_addr], eax
    
    ; Connect to Redis
    invoke connect, [redis_socket], sockaddr_in, sizeof.SOCKADDR_IN
    test eax, eax
    jnz .connect_error
    
    mov byte [connected], 1
    call send_ping_command
    ret
    
    .socket_error:
    .connect_error:
        ; Handle connection errors
        call print_connection_error
        invoke ExitProcess, 1

; RESP protocol encoding functions
encode_resp_array:
    ; Encode RESP array - eax = element count, esi = output buffer
    mov edi, esi
    mov al, RESP_ARRAY
    stosb
    
    ; Convert count to string
    call int_to_string
    mov esi, temp_buffer
    
    .copy_count:
        lodsb
        test al, al
        jz .count_done
        stosb
        jmp .copy_count
    
    .count_done:
        ; Add CRLF
        mov ax, 0x0A0D  ; CRLF
        stosw
        
        mov eax, edi
        ret

encode_resp_bulk_string:
    ; Encode RESP bulk string - esi = string, edi = output buffer
    ; Returns: eax = end of encoded data
    push esi
    
    ; Write bulk string indicator
    mov al, RESP_BULK_STRING
    stosb
    
    ; Calculate string length
    call string_length
    push eax
    
    ; Write length
    call int_to_string
    mov esi, temp_buffer
    
    .copy_length:
        lodsb
        test al, al
        jz .length_done
        stosb
        jmp .copy_length
    
    .length_done:
        ; Add CRLF after length
        mov ax, 0x0A0D
        stosw
        
        ; Copy string data
        pop ecx  ; String length
        pop esi  ; Original string pointer
        rep movsb
        
        ; Add final CRLF
        mov ax, 0x0A0D
        stosw
        
        mov eax, edi
        ret

; Redis command builders
build_set_command:
    ; Build SET key value command
    ; esi = key, edx = value, edi = output buffer
    push esi edx
    
    ; Array with 3 elements
    mov eax, 3
    call encode_resp_array
    mov edi, eax
    
    ; SET command
    mov esi, set_command_str
    call encode_resp_bulk_string
    mov edi, eax
    
    ; Key
    pop esi  ; Get key back
    push esi
    call encode_resp_bulk_string
    mov edi, eax
    
    ; Value
    pop esi  ; Get value
    pop esi  ; Discard key
    mov esi, edx
    call encode_resp_bulk_string
    
    ret

build_get_command:
    ; Build GET key command
    ; esi = key, edi = output buffer
    push esi
    
    ; Array with 2 elements
    mov eax, 2
    call encode_resp_array
    mov edi, eax
    
    ; GET command
    mov esi, get_command_str
    call encode_resp_bulk_string
    mov edi, eax
    
    ; Key
    pop esi
    call encode_resp_bulk_string
    
    ret

build_hset_command:
    ; Build HSET hash field value command
    ; esi = hash, edx = field, ecx = value, edi = output buffer
    push esi edx ecx
    
    ; Array with 4 elements
    mov eax, 4
    call encode_resp_array
    mov edi, eax
    
    ; HSET command
    mov esi, hset_command_str
    call encode_resp_bulk_string
    mov edi, eax
    
    ; Hash name
    pop ecx
    pop edx
    pop esi
    push edx ecx
    call encode_resp_bulk_string
    mov edi, eax
    
    ; Field
    pop ecx
    pop esi
    push ecx
    mov esi, edx
    call encode_resp_bulk_string
    mov edi, eax
    
    ; Value
    pop esi
    call encode_resp_bulk_string
    
    ret

; RESP response parsing
parse_resp_response:
    ; Parse RESP response in response_buffer
    mov esi, response_buffer
    lodsb  ; Get type indicator
    
    cmp al, RESP_SIMPLE_STRING
    je .parse_simple_string
    cmp al, RESP_ERROR
    je .parse_error
    cmp al, RESP_INTEGER
    je .parse_integer
    cmp al, RESP_BULK_STRING
    je .parse_bulk_string
    cmp al, RESP_ARRAY
    je .parse_array
    
    ; Unknown type
    mov eax, -1
    ret
    
    .parse_simple_string:
        call parse_simple_line
        mov eax, RESP_TYPE_SIMPLE_STRING
        ret
    
    .parse_error:
        call parse_simple_line
        mov eax, RESP_TYPE_ERROR
        ret
    
    .parse_integer:
        call parse_integer_value
        mov eax, RESP_TYPE_INTEGER
        ret
    
    .parse_bulk_string:
        call parse_bulk_string_value
        mov eax, RESP_TYPE_BULK_STRING
        ret
    
    .parse_array:
        call parse_array_value
        mov eax, RESP_TYPE_ARRAY
        ret

parse_bulk_string_value:
    ; Parse bulk string from esi
    call parse_integer_line  ; Get length
    mov ecx, eax
    
    cmp ecx, -1
    je .null_string
    
    ; Read string data
    mov edi, parsed_string_buffer
    rep movsb
    
    ; Null-terminate
    mov byte [edi], 0
    
    ; Skip final CRLF
    add esi, 2
    
    mov eax, parsed_string_buffer
    ret
    
    .null_string:
        mov eax, 0
        ret

parse_array_value:
    ; Parse array from esi
    call parse_integer_line  ; Get element count
    mov [array_count], eax
    mov ebx, 0  ; Element index
    
    .parse_element_loop:
        cmp ebx, [array_count]
        jge .array_done
        
        ; Parse next element
        call parse_resp_element
        
        ; Store in array
        mov [parsed_array + ebx*4], eax
        
        inc ebx
        jmp .parse_element_loop
    
    .array_done:
        mov eax, parsed_array
        ret

; High-level Redis operations
redis_set:
    ; Set key-value pair
    ; esi = key, edx = value
    push esi edx
    
    ; Build SET command
    mov edi, command_buffer
    call build_set_command
    
    ; Send command
    call send_redis_command
    
    ; Receive response
    call receive_redis_response
    
    ; Parse response
    call parse_resp_response
    
    pop edx esi
    ret

redis_get:
    ; Get value by key
    ; esi = key, returns: eax = value pointer or 0
    push esi
    
    ; Build GET command
    mov edi, command_buffer
    call build_get_command
    
    ; Send command
    call send_redis_command
    
    ; Receive response
    call receive_redis_response
    
    ; Parse response
    call parse_resp_response
    
    pop esi
    ret

redis_hset:
    ; Set hash field
    ; esi = hash, edx = field, ecx = value
    push esi edx ecx
    
    ; Build HSET command
    mov edi, command_buffer
    call build_hset_command
    
    ; Send command
    call send_redis_command
    
    ; Receive response
    call receive_redis_response
    
    ; Parse response
    call parse_resp_response
    
    pop ecx edx esi
    ret

redis_hget:
    ; Get hash field value
    ; esi = hash, edx = field, returns: eax = value pointer or 0
    push esi edx
    
    ; Build HGET command
    mov edi, command_buffer
    call build_hget_command
    
    ; Send command
    call send_redis_command
    
    ; Receive response
    call receive_redis_response
    
    ; Parse response
    call parse_resp_response
    
    pop edx esi
    ret
```

## Advanced Data Structures and Operations

### Redis Lists, Sets, and Sorted Sets

Redis provides rich data structures beyond simple key-value pairs. Implementing these efficiently requires understanding their internal representations and performance characteristics.

```assembly
; Redis List operations
redis_lpush:
    ; Push element to left of list
    ; esi = list key, edx = value
    push esi edx
    
    ; Build LPUSH command
    mov edi, command_buffer
    mov eax, 3  ; Array elements
    call encode_resp_array
    mov edi, eax
    
    mov esi, lpush_command_str
    call encode_resp_bulk_string
    mov edi, eax
    
    pop edx
    pop esi
    push edx
    call encode_resp_bulk_string
    mov edi, eax
    
    pop esi
    call encode_resp_bulk_string
    
    call send_redis_command
    call receive_redis_response
    call parse_resp_response
    ret

redis_lrange:
    ; Get range of list elements
    ; esi = list key, eax = start, ebx = stop
    push esi eax ebx
    
    ; Build LRANGE command
    mov edi, command_buffer
    mov eax, 4  ; Array elements
    call encode_resp_array
    mov edi, eax
    
    mov esi, lrange_command_str
    call encode_resp_bulk_string
    mov edi, eax
    
    pop ebx eax esi
    push eax ebx
    call encode_resp_bulk_string
    mov edi, eax
    
    ; Encode start index
    pop ebx eax
    push ebx
    call int_to_string
    mov esi, temp_buffer
    call encode_resp_bulk_string
    mov edi, eax
    
    ; Encode stop index
    pop eax
    call int_to_string
    mov esi, temp_buffer
    call encode_resp_bulk_string
    
    call send_redis_command
    call receive_redis_response
    call parse_resp_response
    ret

; Redis Set operations
redis_sadd:
    ; Add member to set
    ; esi = set key, edx = member
    push esi edx
    
    ; Build SADD command
    mov edi, command_buffer
    mov eax, 3
    call encode_resp_array
    mov edi, eax
    
    mov esi, sadd_command_str
    call encode_resp_bulk_string
    mov edi, eax
    
    pop edx esi
    push edx
    call encode_resp_bulk_string
    mov edi, eax
    
    pop esi
    call encode_resp_bulk_string
    
    call send_redis_command
    call receive_redis_response
    call parse_resp_response
    ret

redis_sismember:
    ; Check if member exists in set
    ; esi = set key, edx = member, returns: eax = 1 if exists, 0 if not
    push esi edx
    
    ; Build SISMEMBER command
    mov edi, command_buffer
    mov eax, 3
    call encode_resp_array
    mov edi, eax
    
    mov esi, sismember_command_str
    call encode_resp_bulk_string
    mov edi, eax
    
    pop edx esi
    push edx
    call encode_resp_bulk_string
    mov edi, eax
    
    pop esi
    call encode_resp_bulk_string
    
    call send_redis_command
    call receive_redis_response
    call parse_resp_response
    
    ; Convert response to boolean
    cmp eax, RESP_TYPE_INTEGER
    jne .not_member
    cmp [parsed_integer], 1
    je .is_member
    
    .not_member:
        mov eax, 0
        ret
    
    .is_member:
        mov eax, 1
        ret

; Redis Sorted Set operations
redis_zadd:
    ; Add scored member to sorted set
    ; esi = key, eax = score, edx = member
    push esi eax edx
    
    ; Build ZADD command
    mov edi, command_buffer
    mov eax, 4
    call encode_resp_array
    mov edi, eax
    
    mov esi, zadd_command_str
    call encode_resp_bulk_string
    mov edi, eax
    
    pop edx eax esi
    push eax edx
    call encode_resp_bulk_string
    mov edi, eax
    
    ; Encode score
    pop edx eax
    push edx
    call int_to_string
    mov esi, temp_buffer
    call encode_resp_bulk_string
    mov edi, eax
    
    ; Encode member
    pop esi
    call encode_resp_bulk_string
    
    call send_redis_command
    call receive_redis_response
    call parse_resp_response
    ret

redis_zrange:
    ; Get range of sorted set members
    ; esi = key, eax = start, ebx = stop
    push esi eax ebx
    
    ; Build ZRANGE command
    mov edi, command_buffer
    mov eax, 4
    call encode_resp_array
    mov edi, eax
    
    mov esi, zrange_command_str
    call encode_resp_bulk_string
    mov edi, eax
    
    pop ebx eax esi
    push eax ebx
    call encode_resp_bulk_string
    mov edi, eax
    
    ; Encode start
    pop ebx eax
    push ebx
    call int_to_string
    mov esi, temp_buffer
    call encode_resp_bulk_string
    mov edi, eax
    
    ; Encode stop
    pop eax
    call int_to_string
    mov esi, temp_buffer
    call encode_resp_bulk_string
    
    call send_redis_command
    call receive_redis_response
    call parse_resp_response
    ret

redis_zrank:
    ; Get rank of member in sorted set
    ; esi = key, edx = member, returns: eax = rank or -1
    push esi edx
    
    ; Build ZRANK command
    mov edi, command_buffer
    mov eax, 3
    call encode_resp_array
    mov edi, eax
    
    mov esi, zrank_command_str
    call encode_resp_bulk_string
    mov edi, eax
    
    pop edx esi
    push edx
    call encode_resp_bulk_string
    mov edi, eax
    
    pop esi
    call encode_resp_bulk_string
    
    call send_redis_command
    call receive_redis_response
    call parse_resp_response
    
    cmp eax, RESP_TYPE_INTEGER
    jne .no_rank
    mov eax, [parsed_integer]
    ret
    
    .no_rank:
        mov eax, -1
        ret
```

## Pub/Sub Messaging System

### Real-Time Message Broadcasting

Redis pub/sub provides a powerful messaging system for real-time applications. Implementing this efficiently requires handling asynchronous message delivery.

```assembly
; Pub/Sub implementation
section '.data' data readable writeable
    subscription_list   rd 100
    subscription_count  dd 0
    message_handlers    rd 100
    pubsub_mode        db 0
    
    ; Message buffers
    channel_buffer     rb 256
    message_buffer     rb 4096
    pattern_buffer     rb 256
    
    ; Subscription tracking
    subscribed_channels rd 50
    channel_count      dd 0

redis_subscribe:
    ; Subscribe to channel
    ; esi = channel name
    push esi
    
    ; Add to subscription list
    mov ebx, [subscription_count]
    cmp ebx, 100
    jge .subscription_limit
    
    mov [subscription_list + ebx*4], esi
    inc ebx
    mov [subscription_count], ebx
    
    ; Build SUBSCRIBE command
    mov edi, command_buffer
    mov eax, 2
    call encode_resp_array
    mov edi, eax
    
    mov esi, subscribe_command_str
    call encode_resp_bulk_string
    mov edi, eax
    
    pop esi
    call encode_resp_bulk_string
    
    call send_redis_command
    
    ; Enter pub/sub mode
    mov byte [pubsub_mode], 1
    ret
    
    .subscription_limit:
        ; Handle subscription limit
        pop esi
        ret

redis_publish:
    ; Publish message to channel
    ; esi = channel, edx = message
    push esi edx
    
    ; Build PUBLISH command
    mov edi, command_buffer
    mov eax, 3
    call encode_resp_array
    mov edi, eax
    
    mov esi, publish_command_str
    call encode_resp_bulk_string
    mov edi, eax
    
    pop edx esi
    push edx
    call encode_resp_bulk_string
    mov edi, eax
    
    pop esi
    call encode_resp_bulk_string
    
    call send_redis_command
    call receive_redis_response
    call parse_resp_response
    ret

redis_psubscribe:
    ; Subscribe to pattern
    ; esi = pattern
    push esi
    
    ; Build PSUBSCRIBE command
    mov edi, command_buffer
    mov eax, 2
    call encode_resp_array
    mov edi, eax
    
    mov esi, psubscribe_command_str
    call encode_resp_bulk_string
    mov edi, eax
    
    pop esi
    call encode_resp_bulk_string
    
    call send_redis_command
    mov byte [pubsub_mode], 1
    ret

pubsub_message_loop:
    ; Main loop for handling pub/sub messages
    .message_loop:
        cmp byte [pubsub_mode], 0
        je .exit_loop
        
        ; Receive message
        call receive_redis_response
        
        ; Parse message
        call parse_pubsub_message
        
        ; Handle message based on type
        cmp eax, PUBSUB_MESSAGE
        je .handle_message
        cmp eax, PUBSUB_PMESSAGE
        je .handle_pmessage
        cmp eax, PUBSUB_SUBSCRIBE
        je .handle_subscribe
        cmp eax, PUBSUB_UNSUBSCRIBE
        je .handle_unsubscribe
        
        jmp .message_loop
    
    .handle_message:
        call process_channel_message
        jmp .message_loop
    
    .handle_pmessage:
        call process_pattern_message
        jmp .message_loop
    
    .handle_subscribe:
        call process_subscription_confirm
        jmp .message_loop
    
    .handle_unsubscribe:
        call process_unsubscription_confirm
        jmp .message_loop
    
    .exit_loop:
        ret

parse_pubsub_message:
    ; Parse pub/sub message array
    call parse_resp_response
    cmp eax, RESP_TYPE_ARRAY
    jne .not_array
    
    ; Get message type from first element
    mov esi, [parsed_array]
    
    ; Check message type
    call compare_string_ci
    mov edi, message_type_str
    call compare_strings
    test eax, eax
    jz .is_message
    
    mov edi, pmessage_type_str
    call compare_strings
    test eax, eax
    jz .is_pmessage
    
    mov edi, subscribe_type_str
    call compare_strings
    test eax, eax
    jz .is_subscribe
    
    mov edi, unsubscribe_type_str
    call compare_strings
    test eax, eax
    jz .is_unsubscribe
    
    mov eax, PUBSUB_UNKNOWN
    ret
    
    .is_message:
        mov eax, PUBSUB_MESSAGE
        ret
    
    .is_pmessage:
        mov eax, PUBSUB_PMESSAGE
        ret
    
    .is_subscribe:
        mov eax, PUBSUB_SUBSCRIBE
        ret
    
    .is_unsubscribe:
        mov eax, PUBSUB_UNSUBSCRIBE
        ret
    
    .not_array:
        mov eax, PUBSUB_UNKNOWN
        ret

process_channel_message:
    ; Process regular channel message
    ; Array: [message, channel, data]
    mov esi, [parsed_array + 4]  ; Channel name
    mov edi, channel_buffer
    call copy_string
    
    mov esi, [parsed_array + 8]  ; Message data
    mov edi, message_buffer
    call copy_string
    
    ; Find and call message handler
    call find_message_handler
    test eax, eax
    jz .no_handler
    
    ; Call handler: handler(channel, message)
    push message_buffer
    push channel_buffer
    call eax
    add esp, 8
    
    .no_handler:
        ret

process_pattern_message:
    ; Process pattern message
    ; Array: [pmessage, pattern, channel, data]
    mov esi, [parsed_array + 4]  ; Pattern
    mov edi, pattern_buffer
    call copy_string
    
    mov esi, [parsed_array + 8]  ; Channel name
    mov edi, channel_buffer
    call copy_string
    
    mov esi, [parsed_array + 12] ; Message data
    mov edi, message_buffer
    call copy_string
    
    ; Find and call pattern handler
    call find_pattern_handler
    test eax, eax
    jz .no_handler
    
    ; Call handler: handler(pattern, channel, message)
    push message_buffer
    push channel_buffer
    push pattern_buffer
    call eax
    add esp, 12
    
    .no_handler:
        ret

register_message_handler:
    ; Register message handler for channel
    ; esi = channel pattern, eax = handler function
    mov ebx, [subscription_count]
    cmp ebx, 100
    jge .handler_limit
    
    mov [subscription_list + ebx*4], esi
    mov [message_handlers + ebx*4], eax
    inc ebx
    mov [subscription_count], ebx
    ret
    
    .handler_limit:
        ; Handle handler limit
        ret

find_message_handler:
    ; Find handler for channel in channel_buffer
    mov ebx, 0
    
    .search_loop:
        cmp ebx, [subscription_count]
        jge .not_found
        
        mov esi, [subscription_list + ebx*4]
        mov edi, channel_buffer
        call compare_strings
        test eax, eax
        jz .found
        
        inc ebx
        jmp .search_loop
    
    .found:
        mov eax, [message_handlers + ebx*4]
        ret
    
    .not_found:
        xor eax, eax
        ret
```

## Connection Pooling and Performance Optimization

### High-Performance Connection Management

For production applications, efficient connection pooling is essential to minimize latency and maximize throughput.

```assembly
; Connection pool implementation
section '.data' data readable writeable
    ; Connection pool
    pool_size           equ 20
    connection_pool     rd pool_size
    pool_available      rb pool_size  ; 1 = available, 0 = in use
    pool_created_time   rq pool_size
    pool_last_used     rq pool_size
    pool_mutex         dd 0
    pool_initialized   db 0
    
    ; Pool statistics
    pool_hits          dd 0
    pool_misses        dd 0
    pool_timeouts      dd 0
    pool_errors        dd 0
    
    ; Configuration
    max_idle_time      dd 300000  ; 5 minutes in milliseconds
    connection_timeout dd 5000    ; 5 seconds

init_connection_pool:
    ; Initialize Redis connection pool
    cmp byte [pool_initialized], 1
    je .already_initialized
    
    ; Create mutex for pool synchronization
    invoke CreateMutex, 0, FALSE, 0
    mov [pool_mutex], eax
    
    ; Initialize pool arrays
    mov ecx, pool_size
    mov ebx, 0
    
    .init_loop:
        mov [connection_pool + ebx*4], 0
        mov byte [pool_available + ebx], 1
        mov [pool_created_time + ebx*8], 0
        mov [pool_last_used + ebx*8], 0
        inc ebx
        loop .init_loop
    
    mov byte [pool_initialized], 1
    
    .already_initialized:
        ret

get_pooled_connection:
    ; Get connection from pool, returns socket in eax
    invoke WaitForSingleObject, [pool_mutex], INFINITE
    
    ; Find available connection
    mov ebx, 0
    
    .search_loop:
        cmp ebx, pool_size
        jge .no_available
        
        cmp byte [pool_available + ebx], 1
        je .found_available
        
        inc ebx
        jmp .search_loop
    
    .found_available:
        ; Check if connection exists and is valid
        mov eax, [connection_pool + ebx*4]
        test eax, eax
        jz .create_new
        
        ; Check if connection is stale
        call check_connection_freshness
        test eax, eax
        jz .connection_stale
        
        ; Mark as in use and return
        mov byte [pool_available + ebx], 0
        call get_current_time
        mov [pool_last_used + ebx*8], eax
        
        inc [pool_hits]
        mov eax, [connection_pool + ebx*4]
        invoke ReleaseMutex, [pool_mutex]
        ret
    
    .create_new:
        ; Create new connection
        call create_redis_connection
        test eax, eax
        jz .connection_failed
        
        mov [connection_pool + ebx*4], eax
        mov byte [pool_available + ebx], 0
        call get_current_time
        mov [pool_created_time + ebx*8], eax
        mov [pool_last_used + ebx*8], eax
        
        inc [pool_misses]
        invoke ReleaseMutex, [pool_mutex]
        ret
    
    .connection_stale:
        ; Close stale connection and create new one
        invoke closesocket, [connection_pool + ebx*4]
        jmp .create_new
    
    .no_available:
        ; No available connections
        inc [pool_timeouts]
        invoke ReleaseMutex, [pool_mutex]
        xor eax, eax
        ret
    
    .connection_failed:
        inc [pool_errors]
        invoke ReleaseMutex, [pool_mutex]
        xor eax, eax
        ret

return_pooled_connection:
    ; Return connection to pool
    ; eax = socket to return
    invoke WaitForSingleObject, [pool_mutex], INFINITE
    
    ; Find connection in pool
    mov ebx, 0
    
    .find_loop:
        cmp ebx, pool_size
        jge .not_found
        
        cmp eax, [connection_pool + ebx*4]
        je .found
        
        inc ebx
        jmp .find_loop
    
    .found:
        ; Mark as available
        mov byte [pool_available + ebx], 1
        call get_current_time
        mov [pool_last_used + ebx*8], eax
    
    .not_found:
        invoke ReleaseMutex, [pool_mutex]
        ret

check_connection_freshness:
    ; Check if connection is still fresh
    ; ebx = pool index, returns: eax = 1 if fresh, 0 if stale
    call get_current_time
    mov ecx, eax
    sub ecx, [pool_last_used + ebx*8]
    
    cmp ecx, [max_idle_time]
    jg .stale
    
    ; Test connection with PING
    push ebx
    mov eax, [connection_pool + ebx*4]
    call test_redis_connection
    pop ebx
    ret
    
    .stale:
        xor eax, eax
        ret

test_redis_connection:
    ; Test Redis connection with PING command
    ; eax = socket, returns: eax = 1 if ok, 0 if failed
    push eax
    
    ; Send PING command
    mov esi, ping_command
    mov ecx, ping_command_len
    invoke send, eax, esi, ecx, 0
    cmp eax, SOCKET_ERROR
    je .send_failed
    
    ; Receive response with timeout
    invoke setsockopt, [esp], SOL_SOCKET, SO_RCVTIMEO, recv_timeout, 4
    
    invoke recv, [esp], response_buffer, 1024, 0
    cmp eax, SOCKET_ERROR
    je .recv_failed
    
    ; Check for +PONG response
    cmp dword [response_buffer], '+PON'
    jne .invalid_response
    
    pop eax
    mov eax, 1
    ret
    
    .send_failed:
    .recv_failed:
    .invalid_response:
        pop eax
        xor eax, eax
        ret

; Performance monitoring
collect_pool_stats:
    ; Collect connection pool statistics
    mov edi, pool_stats_buffer
    
    ; Active connections
    mov eax, [pool_hits]
    add eax, [pool_misses]
    sub eax, [pool_timeouts]
    call int_to_string_at_edi
    
    ; Hit rate
    mov eax, [pool_hits]
    mov ebx, [pool_hits]
    add ebx, [pool_misses]
    test ebx, ebx
    jz .no_requests
    
    imul eax, 100
    xor edx, edx
    div ebx
    call int_to_string_at_edi
    
    .no_requests:
        ret

cleanup_stale_connections:
    ; Cleanup stale connections (call periodically)
    invoke WaitForSingleObject, [pool_mutex], INFINITE
    
    call get_current_time
    mov ecx, eax  ; Current time
    mov ebx, 0
    
    .cleanup_loop:
        cmp ebx, pool_size
        jge .cleanup_done
        
        ; Check if connection is available and stale
        cmp byte [pool_available + ebx], 1
        jne .next_connection
        
        mov eax, [connection_pool + ebx*4]
        test eax, eax
        jz .next_connection
        
        ; Check staleness
        mov eax, ecx
        sub eax, [pool_last_used + ebx*8]
        cmp eax, [max_idle_time]
        jle .next_connection
        
        ; Close stale connection
        invoke closesocket, [connection_pool + ebx*4]
        mov [connection_pool + ebx*4], 0
        mov [pool_created_time + ebx*8], 0
        mov [pool_last_used + ebx*8], 0
    
    .next_connection:
        inc ebx
        jmp .cleanup_loop
    
    .cleanup_done:
        invoke ReleaseMutex, [pool_mutex]
        ret
```

## Redis Lua Scripting Integration

### Server-Side Script Execution

Redis Lua scripting allows complex operations to be executed atomically on the server, reducing network round-trips and ensuring consistency.

```assembly
; Lua script management
section '.data' data readable writeable
    ; Script cache
    script_cache_size   equ 50
    script_sha1s       rb script_cache_size * 40  ; SHA1 hashes
    script_sources     rd script_cache_size
    script_count       dd 0
    
    ; Common scripts
    increment_script   db 'local current = redis.call("GET", KEYS[1]) or "0"; '
                      db 'local new_val = tonumber(current) + tonumber(ARGV[1]); '
                      db 'redis.call("SET", KEYS[1], new_val); '
                      db 'return new_val', 0
    
    rate_limit_script  db 'local key = KEYS[1]; '
                      db 'local limit = tonumber(ARGV[1]); '
                      db 'local window = tonumber(ARGV[2]); '
                      db 'local current = redis.call("GET", key); '
                      db 'if current == false then '
                      db '  redis.call("SET", key, 1); '
                      db '  redis.call("EXPIRE", key, window); '
                      db '  return 1; '
                      db 'elseif tonumber(current) < limit then '
                      db '  return redis.call("INCR", key); '
                      db 'else '
                      db '  return 0; '
                      db 'end', 0
    
    batch_delete_script db 'local keys = redis.call("KEYS", ARGV[1]); '
                       db 'if #keys > 0 then '
                       db '  return redis.call("DEL", unpack(keys)); '
                       db 'else '
                       db '  return 0; '
                       db 'end', 0

redis_script_load:
    ; Load Lua script and return SHA1 hash
    ; esi = script source, returns: eax = SHA1 hash pointer
    push esi
    
    ; Build SCRIPT LOAD command
    mov edi, command_buffer
    mov eax, 3
    call encode_resp_array
    mov edi, eax
    
    mov esi, script_command_str
    call encode_resp_bulk_string
    mov edi, eax
    
    mov esi, load_command_str
    call encode_resp_bulk_string
    mov edi, eax
    
    pop esi
    call encode_resp_bulk_string
    
    ; Send command
    call send_redis_command
    call receive_redis_response
    call parse_resp_response
    
    ; Store script in cache
    cmp eax, RESP_TYPE_BULK_STRING
    jne .load_error
    
    call cache_script
    mov eax, parsed_string_buffer
    ret
    
    .load_error:
        xor eax, eax
        ret

redis_evalsha:
    ; Execute script by SHA1 hash
    ; esi = SHA1 hash, eax = num keys, ebx = keys array, ecx = args array
    push esi eax ebx ecx
    
    ; Calculate total arguments: EVALSHA + hash + numkeys + keys + args
    mov edx, 3  ; EVALSHA + hash + numkeys
    add edx, eax  ; + keys
    add edx, ecx  ; + args (assuming ecx is arg count)
    
    ; Build EVALSHA command
    mov edi, command_buffer
    mov eax, edx
    call encode_resp_array
    mov edi, eax
    
    ; EVALSHA
    mov esi, evalsha_command_str
    call encode_resp_bulk_string
    mov edi, eax
    
    ; SHA1 hash
    pop ecx ebx eax esi
    push eax ebx ecx
    call encode_resp_bulk_string
    mov edi, eax
    
    ; Number of keys
    pop ecx ebx eax
    push ebx ecx
    call int_to_string
    mov esi, temp_buffer
    call encode_resp_bulk_string
    mov edi, eax
    
    ; Keys
    pop ecx ebx
    push ecx
    mov ecx, eax  ; Number of keys
    test ecx, ecx
    jz .no_keys
    
    .encode_keys_loop:
        mov esi, [ebx]
        call encode_resp_bulk_string
        mov edi, eax
        add ebx, 4
        loop .encode_keys_loop
    
    .no_keys:
        ; Arguments
        pop ecx  ; Number of args
        test ecx, ecx
        jz .no_args
        
    .encode_args_loop:
        mov esi, [ebx]
        call encode_resp_bulk_string
        mov edi, eax
        add ebx, 4
        loop .encode_args_loop
    
    .no_args:
        ; Send command
        call send_redis_command
        call receive_redis_response
        call parse_resp_response
        ret

redis_eval:
    ; Execute Lua script directly
    ; esi = script source, eax = num keys, ebx = keys array, ecx = args array
    push esi eax ebx ecx
    
    ; Try to find script in cache first
    call find_cached_script
    test eax, eax
    jnz .use_cached
    
    ; Load script first
    pop ecx ebx eax esi
    push eax ebx ecx
    call redis_script_load
    test eax, eax
    jz .load_failed
    
    ; Use loaded script
    mov esi, eax  ; SHA1 hash
    pop ecx ebx eax
    call redis_evalsha
    ret
    
    .use_cached:
        ; Use cached SHA1
        mov esi, eax
        pop ecx ebx eax
        call redis_evalsha
        ret
    
    .load_failed:
        pop ecx ebx eax
        xor eax, eax
        ret

cache_script:
    ; Cache script SHA1 and source
    ; esi = script source, parsed_string_buffer = SHA1
    mov ebx, [script_count]
    cmp ebx, script_cache_size
    jge .cache_full
    
    ; Copy SHA1 hash
    mov edi, script_sha1s
    mov eax, 40  ; SHA1 length
    mul ebx
    add edi, eax
    
    mov esi, parsed_string_buffer
    mov ecx, 40
    rep movsb
    
    ; Store script source pointer
    mov [script_sources + ebx*4], esi
    
    inc ebx
    mov [script_count], ebx
    ret
    
    .cache_full:
        ; Handle cache overflow (could implement LRU)
        ret

find_cached_script:
    ; Find script in cache
    ; esi = script source, returns: eax = SHA1 hash or 0
    mov ebx, 0
    
    .search_loop:
        cmp ebx, [script_count]
        jge .not_found
        
        mov edi, [script_sources + ebx*4]
        call compare_strings
        test eax, eax
        jz .found
        
        inc ebx
        jmp .search_loop
    
    .found:
        ; Return SHA1 hash
        mov eax, script_sha1s
        mov ecx, 40
        mul ebx
        add eax, ecx
        ret
    
    .not_found:
        xor eax, eax
        ret

; High-level script functions
redis_atomic_increment:
    ; Atomically increment key by value
    ; esi = key, eax = increment value
    push esi eax
    
    ; Prepare keys array
    mov [script_keys], esi
    
    ; Prepare args array
    call int_to_string
    mov [script_args], temp_buffer
    
    ; Execute increment script
    mov esi, increment_script
    mov eax, 1  ; 1 key
    mov ebx, script_keys
    mov ecx, 1  ; 1 arg
    mov edx, script_args
    call redis_eval
    
    pop eax esi
    ret

redis_rate_limit:
    ; Check rate limit
    ; esi = key, eax = limit, ebx = window seconds
    ; Returns: eax = current count or 0 if exceeded
    push esi eax ebx
    
    ; Prepare keys array
    mov [script_keys], esi
    
    ; Prepare args array
    call int_to_string
    mov [script_args], temp_buffer
    
    mov eax, ebx
    call int_to_string
    mov [script_args + 4], temp_buffer
    
    ; Execute rate limit script
    mov esi, rate_limit_script
    mov eax, 1  ; 1 key
    mov ebx, script_keys
    mov ecx, 2  ; 2 args
    mov edx, script_args
    call redis_eval
    
    pop ebx eax esi
    ret

redis_batch_delete:
    ; Delete all keys matching pattern
    ; esi = pattern
    push esi
    
    ; Prepare args array (pattern as argument)
    mov [script_args], esi
    
    ; Execute batch delete script
    mov esi, batch_delete_script
    mov eax, 0  ; 0 keys
    mov ebx, 0
    mov ecx, 1  ; 1 arg
    mov edx, script_args
    call redis_eval
    
    pop esi
    ret
```

## Redis Clustering and High Availability

### Cluster Client Implementation

Redis Cluster provides automatic partitioning and high availability. Implementing a cluster-aware client requires understanding the cluster protocol and slot management.

```assembly
; Redis Cluster implementation
section '.data' data readable writeable
    ; Cluster configuration
    cluster_nodes_max   equ 16
    cluster_nodes      rd cluster_nodes_max
    cluster_ports      rw cluster_nodes_max
    cluster_node_count dd 0
    cluster_enabled    db 0
    
    ; Slot mapping (16384 slots)
    cluster_slots      rw 16384
    slots_initialized  db 0
    
    ; Current cluster state
    cluster_state      db 0  ; 0=fail, 1=ok
    cluster_epoch      dd 0
    
    ; Node discovery
    node_discovery_timer dd 0
    last_cluster_update  dd 0

init_redis_cluster:
    ; Initialize Redis cluster client
    mov byte [cluster_enabled], 1
    
    ; Initial node discovery
    call discover_cluster_nodes
    
    ; Initialize slot mapping
    call update_cluster_slots
    
    ; Set up periodic updates
    call get_current_time
    mov [last_cluster_update], eax
    
    ret

discover_cluster_nodes:
    ; Discover cluster nodes using CLUSTER NODES command
    ; Try each known node until one responds
    mov ebx, 0
    
    .try_node_loop:
        cmp ebx, [cluster_node_count]
        jge .discovery_failed
        
        ; Connect to node
        mov eax, [cluster_nodes + ebx*4]
        mov dx, [cluster_ports + ebx*2]
        call connect_to_redis_node
        test eax, eax
        jz .try_next_node
        
        ; Send CLUSTER NODES command
        call send_cluster_nodes_command
        call receive_redis_response
        call parse_cluster_nodes_response
        
        invoke closesocket, eax
        ret
    
    .try_next_node:
        inc ebx
        jmp .try_node_loop
    
    .discovery_failed:
        ; Handle discovery failure
        mov byte [cluster_state], 0
        ret

send_cluster_nodes_command:
    ; Send CLUSTER NODES command
    mov edi, command_buffer
    mov eax, 2
    call encode_resp_array
    mov edi, eax
    
    mov esi, cluster_command_str
    call encode_resp_bulk_string
    mov edi, eax
    
    mov esi, nodes_command_str
    call encode_resp_bulk_string
    
    call send_redis_command
    ret

parse_cluster_nodes_response:
    ; Parse CLUSTER NODES response
    call parse_resp_response
    cmp eax, RESP_TYPE_BULK_STRING
    jne .parse_error
    
    ; Parse node information
    mov esi, parsed_string_buffer
    call parse_node_lines
    ret
    
    .parse_error:
        ret

parse_node_lines:
    ; Parse each line of cluster nodes output
    mov [cluster_node_count], 0
    
    .parse_line_loop:
        call parse_single_node_line
        test eax, eax
        jz .parsing_done
        
        ; Skip to next line
        call skip_to_next_line
        cmp byte [esi], 0
        je .parsing_done
        jmp .parse_line_loop
    
    .parsing_done:
        ret

parse_single_node_line:
    ; Parse single node line
    ; Format: node_id ip:port flags master start-time current-epoch slots
    
    ; Skip node ID
    call skip_word
    
    ; Parse IP:port
    call extract_word
    call parse_ip_port
    
    ; Store node information
    mov ebx, [cluster_node_count]
    cmp ebx, cluster_nodes_max
    jge .nodes_full
    
    mov [cluster_nodes + ebx*4], eax  ; IP
    mov [cluster_ports + ebx*2], dx   ; Port
    
    ; Skip flags and other fields until slots
    call skip_to_slots
    
    ; Parse slot ranges
    call parse_slot_ranges
    
    inc ebx
    mov [cluster_node_count], ebx
    mov eax, 1
    ret
    
    .nodes_full:
        mov eax, 0
        ret

update_cluster_slots:
    ; Update slot mapping from cluster information
    call send_cluster_slots_command
    call receive_redis_response
    call parse_cluster_slots_response
    ret

send_cluster_slots_command:
    ; Send CLUSTER SLOTS command
    mov edi, command_buffer
    mov eax, 2
    call encode_resp_array
    mov edi, eax
    
    mov esi, cluster_command_str
    call encode_resp_bulk_string
    mov edi, eax
    
    mov esi, slots_command_str
    call encode_resp_bulk_string
    
    call send_redis_command
    ret

parse_cluster_slots_response:
    ; Parse CLUSTER SLOTS response
    call parse_resp_response
    cmp eax, RESP_TYPE_ARRAY
    jne .parse_error
    
    ; Parse each slot range
    mov ecx, [array_count]
    mov ebx, 0
    
    .parse_range_loop:
        cmp ebx, ecx
        jge .parsing_done
        
        ; Get range array
        mov esi, [parsed_array + ebx*4]
        call parse_slot_range_array
        
        inc ebx
        jmp .parse_range_loop
    
    .parsing_done:
        mov byte [slots_initialized], 1
        ret
    
    .parse_error:
        ret

calculate_key_slot:
    ; Calculate Redis cluster slot for key
    ; esi = key, returns: eax = slot number
    
    ; Find hash tag if present
    call find_hash_tag
    test eax, eax
    jnz .use_hash_tag
    
    ; Use full key
    mov edi, esi
    call string_length
    mov ecx, eax
    jmp .calculate_crc
    
    .use_hash_tag:
        ; Use hash tag portion
        mov edi, eax
        mov ecx, edx
    
    .calculate_crc:
        ; Calculate CRC16
        call crc16_ccitt
        
        ; Modulo 16384
        and eax, 0x3FFF
        ret

find_hash_tag:
    ; Find hash tag in Redis key
    ; esi = key, returns: eax = tag start, edx = tag length (0 if no tag)
    push esi
    
    ; Look for opening brace
    .find_open_brace:
        lodsb
        test al, al
        jz .no_tag
        cmp al, '{'
        jne .find_open_brace
    
    ; Found opening brace, look for closing brace
    mov eax, esi  ; Tag start
    mov ecx, 0    ; Tag length
    
    .find_close_brace:
        lodsb
        test al, al
        jz .no_tag
        cmp al, '}'
        je .found_tag
        inc ecx
        jmp .find_close_brace
    
    .found_tag:
        test ecx, ecx
        jz .no_tag  ; Empty tag
        mov edx, ecx
        pop esi
        ret
    
    .no_tag:
        pop esi
        xor eax, eax
        xor edx, edx
        ret

route_cluster_command:
    ; Route command to correct cluster node
    ; esi = key
    push esi
    
    ; Calculate slot
    call calculate_key_slot
    mov ebx, eax
    
    ; Check if slots are initialized
    cmp byte [slots_initialized], 0
    je .use_any_node
    
    ; Get node for slot
    mov ax, [cluster_slots + ebx*2]
    test ax, ax
    jz .use_any_node
    
    ; Connect to specific node
    call connect_to_cluster_node
    pop esi
    ret
    
    .use_any_node:
        ; Use first available node
        mov eax, 0
        call connect_to_cluster_node
        pop esi
        ret

handle_cluster_redirect:
    ; Handle MOVED/ASK redirections
    call parse_resp_response
    cmp eax, RESP_TYPE_ERROR
    jne .not_redirect
    
    ; Check for MOVED error
    mov esi, parsed_string_buffer
    mov edi, moved_error_prefix
    call check_string_prefix
    test eax, eax
    jnz .handle_moved
    
    ; Check for ASK error
    mov edi, ask_error_prefix
    call check_string_prefix
    test eax, eax
    jnz .handle_ask
    
    .not_redirect:
        ret
    
    .handle_moved:
        ; Parse MOVED slot ip:port
        call parse_moved_response
        call update_slot_mapping
        call reconnect_to_node
        ret
    
    .handle_ask:
        ; Parse ASK slot ip:port
        call parse_ask_response
        call send_asking_command
        call resend_command
        ret

crc16_ccitt:
    ; Calculate CRC16-CCITT
    ; edi = data, ecx = length, returns: eax = CRC16
    push ebx ecx edx esi
    
    mov eax, 0  ; Initial CRC
    
    .crc_loop:
        test ecx, ecx
        jz .crc_done
        
        movzx ebx, byte [edi]
        xor bl, ah
        mov ah, al
        mov al, 0
        
        ; CRC table lookup (simplified)
        shl bx, 1
        mov si, [crc16_table + ebx]
        xor ax, si
        
        inc edi
        dec ecx
        jmp .crc_loop
    
    .crc_done:
        pop esi edx ecx ebx
        ret

; CRC16 table (partial - would need full 512-byte table)
crc16_table dw 0x0000, 0x1021, 0x2042, 0x3063, 0x4084, 0x50A5, 0x60C6, 0x70E7
           dw 0x8108, 0x9129, 0xA14A, 0xB16B, 0xC18C, 0xD1AD, 0xE1CE, 0xF1EF
           ; ... (full table would continue)
```

This comprehensive chapter demonstrates how to build high-performance Redis integrations in assembly language. From protocol implementation to advanced clustering support, you now have the tools to create efficient, scalable caching solutions that can handle enterprise workloads. The techniques shown here provide deep insights into distributed systems design and network protocol optimization that will enhance your understanding of modern application architecture.

## Exercises

1. **Connection Pool Stress Test**: Implement a stress testing framework that validates connection pool behavior under high load.

2. **Redis Proxy**: Build a Redis proxy that can route commands to multiple Redis instances with load balancing.

3. **Custom Data Structure**: Implement a custom Redis data structure using Lua scripting for a specific use case like time-series data.

4. **Cluster Monitor**: Create a cluster monitoring tool that tracks node health and slot distribution.

5. **Performance Benchmark**: Build a comprehensive benchmark suite that compares your assembly Redis client against other implementations.

The next chapter will explore BPF (Berkeley Packet Filter) programming, showing how to implement high-performance packet filtering and network monitoring directly in the kernel.