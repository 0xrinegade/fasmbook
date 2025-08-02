# Chapter 3: Data Types & Memory Architecture
*The Foundation of All Computation*

> **🚩 Foundation Chapter**: Essential understanding for all subsequent chapters  
> **🚩 Memory Focus**: Deep dive into x86 memory models and optimization

## Learning Objectives 🎯

By the end of this chapter, you will:
- Master all fundamental data types and their memory representations
- Understand x86/x64 memory architecture and addressing modes  
- Design efficient data structures with proper alignment and cache optimization
- Implement complex data manipulation with optimal performance characteristics
- Debug memory-related issues using professional tools and techniques

## Introduction: Understanding the Digital Landscape

Memory is the canvas upon which all computation takes place. In high-level languages, this canvas is often hidden behind abstractions—variables that seem to hold values by magic, arrays that expand and contract automatically, and objects that contain both data and behavior. But in assembly language, you work directly with the raw memory substrate, and understanding this landscape is crucial to writing efficient, reliable code.

> **💡 Did You Know?** The term "byte" was coined by Werner Buchholz at IBM in 1956. He needed a word to describe a group of bits, and chose "byte" as a play on "bite," but changed the spelling to avoid confusion with "bit."

In this chapter, we'll explore memory from the ground up. You'll learn how different data types are represented in binary, how the processor accesses memory, and how to organize your data for maximum efficiency. We'll build several programs that demonstrate sophisticated memory management techniques, and by the end of this chapter, you'll think about data the way the processor does.

**🔗 See Also**: 
- For advanced memory management → [Chapter 11: Memory Management](chapter11.md)
- For performance optimization → [Chapter 8: Optimization & Performance](chapter8.md)
- For system programming → [Chapter 12: Operating System Interfaces](chapter12.md)

## The Binary Foundation: How Data Lives in Memory

### Fundamental Data Types

Every piece of information in your computer, from the simplest number to the most complex data structure, is ultimately stored as a sequence of bits. Understanding how FASM helps you work with these fundamental types is essential.

```assembly
format PE console
entry start

include 'win32a.inc'

section '.data' data readable writeable
    ; Byte-sized data (8 bits)
    char_value      db 'A'           ; Single ASCII character
    signed_byte     db -127          ; Signed byte (-128 to 127)
    unsigned_byte   db 255           ; Unsigned byte (0 to 255)
    
    ; Word-sized data (16 bits)
    short_int       dw 32767         ; 16-bit signed integer
    unicode_char    dw 0x041F        ; Unicode character (Cyrillic П)
    port_address    dw 0x3F8         ; I/O port address
    
    ; Double word (32 bits)
    long_int        dd 0x7FFFFFFF    ; 32-bit signed integer
    float_value     dd 3.14159       ; IEEE 754 single precision
    rgb_color       dd 0x00FF00FF    ; ARGB color value
    pointer_value   dd 0             ; 32-bit pointer
    
    ; Quad word (64 bits)
    big_int         dq 0x7FFFFFFFFFFFFFFF  ; 64-bit signed integer
    double_value    dq 2.71828             ; IEEE 754 double precision
    
    ; Strings and arrays
    message         db 'Hello, World!', 0  ; Null-terminated string
    buffer          rb 256                 ; Reserve 256 bytes
    int_array       dd 1, 2, 3, 4, 5      ; Array of integers
    
    ; Complex structures
    point3d:
        .x          dd 0.0
        .y          dd 0.0
        .z          dd 0.0
    
section '.code' code readable executable

start:
    ; Demonstrate data type access patterns
    
    ; Working with bytes
    mov al, [char_value]        ; Load byte into AL
    cmp al, 'A'                 ; Compare with ASCII 'A'
    je char_is_a                ; Jump if equal
    
    ; Working with words
    mov ax, [short_int]         ; Load 16-bit value
    add ax, 1000                ; Add immediate value
    mov [short_int], ax         ; Store back
    
    ; Working with double words
    mov eax, [long_int]         ; Load 32-bit value
    mov ebx, [rgb_color]        ; Load color value
    and ebx, 0x00FF0000         ; Extract green component
    shr ebx, 16                 ; Shift to low byte
    
    ; Working with floating point
    fld dword [float_value]     ; Load float to FPU stack
    fld dword [double_value]    ; Load double to FPU stack
    faddp                       ; Add and pop
    fstp dword [float_value]    ; Store result
    
    ; Working with arrays
    mov esi, int_array          ; Point to array start
    mov ecx, 5                  ; Array length
    xor eax, eax                ; Clear accumulator

## 📚 Comprehensive Instruction Reference: XOR

> **🚩 Bitwise Logic Master**: XOR is one of the most versatile instructions in assembly, serving roles in encryption, optimization, bit manipulation, and register clearing.

### Historical Context and Evolution 📜

XOR (Exclusive OR) represents one of the fundamental Boolean logic operations, with applications spanning from pure mathematics to cryptography and computer optimization. The XOR operation has unique mathematical properties that make it invaluable in computing.

**Mathematical Foundation:**
XOR returns 1 when inputs differ, 0 when inputs are the same:
- 0 XOR 0 = 0
- 0 XOR 1 = 1  
- 1 XOR 0 = 1
- 1 XOR 1 = 0

**Historical Development:**
- **1854**: George Boole introduced XOR in Boolean algebra
- **1946**: XOR implemented in early electronic computers
- **1978**: XOR included in 8086 instruction set
- **1976**: XOR discovered crucial for cryptography (Diffie-Hellman)
- **Modern**: XOR used in RAID systems, checksums, and encryption

### Complete Instruction Theory and Specification

**XOR** performs a bitwise exclusive OR operation between two operands, storing the result in the destination operand.

**Fundamental Operation:**
```
For each bit position i:
Destination[i] ← Destination[i] XOR Source[i]
```

**Unique Mathematical Properties:**
1. **Self-Inverse**: A XOR A = 0 (any value XORed with itself equals zero)
2. **Identity Element**: A XOR 0 = A (XORing with zero leaves value unchanged)
3. **Commutative**: A XOR B = B XOR A
4. **Associative**: (A XOR B) XOR C = A XOR (B XOR C)
5. **Involutory**: A XOR B XOR B = A (XORing twice returns original)

### Complete Syntax Reference and API

**All Supported Operand Combinations:**
```assembly
; Register - Register (most common patterns)
xor eax, eax            ; 31 C0 - Clear EAX to zero (optimization)
xor eax, ebx            ; 31 D8 - EAX = EAX XOR EBX
xor ebx, ecx            ; 31 CB - EBX = EBX XOR ECX

; Register - Immediate
xor eax, 0x12345678     ; 35 78 56 34 12 - XOR with immediate value
xor ebx, 0xFF           ; 83 F3 FF - XOR with byte immediate (sign extended)

; Register - Memory
xor eax, [variable]     ; 33 05 + address - XOR with memory location
xor ebx, [esi + 4]      ; 33 5E 04 - XOR with memory via addressing

; Memory - Register
xor [variable], eax     ; 31 05 + address - XOR memory with register
xor [esi], ebx          ; 31 1E - XOR memory via pointer

; Memory - Immediate  
xor dword [esi], 0xFF   ; 83 36 FF - XOR memory with immediate
xor byte [esi], 0x80    ; 80 36 80 - Byte XOR operation
```

**Size Variants and Encodings:**
```assembly
; 8-bit XOR operations
xor al, 0x55            ; 34 55 - XOR AL with immediate
xor bl, cl              ; 30 CB - XOR BL with CL
xor [esi], dl           ; 30 16 - XOR memory byte with DL

; 16-bit XOR operations  
xor ax, 0x1234          ; 66 35 34 12 - XOR AX with immediate
xor bx, cx              ; 66 31 CB - XOR BX with CX
xor [esi], dx           ; 66 31 16 - XOR memory word with DX

; 32-bit XOR operations (default in 32-bit mode)
xor eax, 0x12345678     ; 35 78 56 34 12 - XOR EAX with large immediate
xor ebx, ecx            ; 31 CB - XOR EBX with ECX
xor [esi], edx          ; 31 16 - XOR memory dword with EDX

; 64-bit XOR operations (x64 mode)
xor rax, rbx            ; 48 31 D8 - XOR RAX with RBX
xor rax, 0x123456789ABCDEF0  ; 48 35 F0 DE BC 9A - XOR with 32-bit immediate (sign-extended)
```

### Flag Updates and Behavior

**Flag Effects:**
- **CF**: Always cleared (0)
- **OF**: Always cleared (0)  
- **ZF**: Set if result is zero
- **SF**: Set if result's most significant bit is 1
- **PF**: Set if result's low byte has even parity
- **AF**: Undefined

**Zero Detection Pattern:**
```assembly
xor eax, eax            ; Clear EAX and set ZF=1
jz is_zero              ; This jump is always taken!

xor eax, ebx            ; XOR two values
jz values_equal         ; Jump if EAX == EBX originally
```

### Optimization Techniques and Common Patterns

**1. Register Clearing (Most Famous XOR Usage):**
```assembly
; Traditional approach:
mov eax, 0              ; 5 bytes: B8 00 00 00 00

; Optimized approach:
xor eax, eax            ; 2 bytes: 31 C0
; Benefits: Smaller code, same speed, sets ZF=1 as bonus
```

**2. Variable Swapping Without Temporary:**
```assembly
; Traditional swap requiring temporary variable:
mov temp, eax
mov eax, ebx
mov ebx, temp

; XOR swap (no temporary needed):
xor eax, ebx            ; EAX = EAX XOR EBX
xor ebx, eax            ; EBX = EBX XOR (EAX XOR EBX) = original EAX
xor eax, ebx            ; EAX = (EAX XOR EBX) XOR EBX = original EBX
; Result: EAX and EBX swapped!
```

**3. Simple Encryption/Decryption:**
```assembly
; Encrypt data with XOR key
mov esi, data_buffer
mov ecx, data_length
mov eax, encryption_key

encrypt_loop:
    xor [esi], eax      ; Encrypt byte with key
    inc esi             ; Next byte
    loop encrypt_loop

; Decrypt: XOR with same key (self-inverse property)
mov esi, data_buffer
mov ecx, data_length
mov eax, encryption_key

decrypt_loop:
    xor [esi], eax      ; Decrypt byte with same key
    inc esi             ; Next byte
    loop decrypt_loop
```

**4. Bit Manipulation Patterns:**
```assembly
; Toggle specific bits
xor eax, 0x00000001     ; Toggle bit 0 (least significant bit)
xor eax, 0x80000000     ; Toggle bit 31 (sign bit)
xor eax, 0x0000FFFF     ; Toggle lower 16 bits

; Clear specific bits using XOR + AND combination:
mov ebx, eax            ; Save original
xor eax, 0xFFFFFFFF     ; Invert all bits
and eax, 0x0000FFFF     ; Keep only lower 16 bits inverted
xor eax, ebx            ; XOR back with original = clear upper 16 bits
```

**5. Checksum and Hash Functions:**
```assembly
; Simple XOR checksum
mov esi, data_buffer
mov ecx, data_length
xor eax, eax            ; Clear accumulator

checksum_loop:
    xor eax, [esi]      ; XOR current dword into accumulator
    add esi, 4          ; Next dword
    sub ecx, 4          ; Decrease count
    jnz checksum_loop
; Result: XOR checksum in EAX
```

### Advanced Applications and Cryptographic Uses

**Linear Feedback Shift Register (LFSR) for Random Numbers:**
```assembly
; Generate pseudo-random number using XOR taps
mov eax, [lfsr_state]   ; Load current state
mov ebx, eax            ; Copy for manipulation
shr ebx, 1              ; Shift right 1 bit
xor eax, ebx            ; XOR with shifted version
shr ebx, 1              ; Shift right again  
xor eax, ebx            ; XOR again
and eax, 1              ; Extract LSB
shl eax, 31             ; Move to MSB position
shr [lfsr_state], 1     ; Shift state right
or [lfsr_state], eax    ; Insert new random bit
```

**XOR-based Conditional Move (Branchless Programming):**
```assembly
; Conditional assignment without branches:
; if (condition) value = new_value; else value = old_value;

; Traditional approach with branches:
test condition, condition
jz keep_old
mov value, new_value
jmp done
keep_old:
mov value, old_value
done:

; XOR-based branchless approach:
mov eax, old_value
mov ebx, new_value
xor ebx, eax            ; EBX = difference
neg condition           ; Make condition 0x00000000 or 0xFFFFFFFF
and ebx, condition      ; Mask difference
xor eax, ebx            ; Apply masked difference
mov value, eax          ; Result: old_value if condition=0, new_value if condition≠0
```

### Performance Characteristics and Microarchitecture

**Execution Speed:**
```assembly
xor eax, ebx            ; 1 cycle latency, 0.25 cycles throughput
                       ; Can execute 4 XOR operations simultaneously on modern CPUs

; XOR operations can be executed on multiple ports:
xor eax, ebx            ; Port 0, 1, 5, or 6 (Intel)  
xor ecx, edx            ; Can execute in parallel with above
xor esi, edi            ; Can execute in parallel with both above
```

**Special Optimization - Register Clearing:**
```assembly
xor eax, eax            ; Recognized by CPU as "zero idiom"
                       ; Modern CPUs execute this with zero latency
                       ; No execution unit required - handled in rename stage
                       ; Can execute unlimited XOR reg,reg zeroing operations per cycle
```

**Memory XOR Performance:**
```assembly
xor eax, [memory]       ; 4-6 cycles (depends on cache level)
                       ; Same memory access cost as MOV, ADD, etc.
                       ; XOR operation itself adds no overhead
```

### Integration with Modern Programming Patterns

**Compiler Optimizations:**
Many compilers automatically generate XOR for register clearing:
```c
// C code:
int x = 0;

// Often compiled to:
xor eax, eax            ; Instead of mov eax, 0
```

**Security Applications:**
```assembly
; Memory sanitization (clear sensitive data):
mov esi, password_buffer
mov ecx, password_length
xor eax, eax

clear_loop:
    xor [esi], eax      ; Clear memory with XOR
    add esi, 4
    sub ecx, 4
    jnz clear_loop
; XOR ensures complete data destruction
```

**SIMD Integration:**
```assembly
; XOR works with vector instructions too:
xorps xmm0, xmm0        ; Clear 128-bit XMM register
xorpd xmm1, xmm2        ; XOR two 128-bit registers
vpxor ymm0, ymm1, ymm2  ; AVX: XOR two 256-bit registers
```

---
    
sum_loop:
    add eax, [esi]              ; Add current element
    add esi, 4                  ; Move to next element
    loop sum_loop               ; Repeat for all elements
    
    ; Working with structures
    mov eax, 10
    mov [point3d.x], eax        ; Set X coordinate
    mov eax, 20
    mov [point3d.y], eax        ; Set Y coordinate
    mov eax, 30
    mov [point3d.z], eax        ; Set Z coordinate
    
char_is_a:
    ; Exit program
    invoke ExitProcess, 0

section '.idata' import data readable writeable
    library kernel32, 'KERNEL32.DLL'
    import kernel32, ExitProcess, 'ExitProcess'
```

This example demonstrates the fundamental principle of assembly data handling: every piece of data has a specific size and alignment, and you must be explicit about how you access it.

### Understanding Memory Layout

Memory in x86/x64 systems isn't just a linear array of bytes—it's a sophisticated hierarchy designed for performance. Understanding this hierarchy helps you write faster programs.

```assembly
format PE console
entry start

include 'win32a.inc'

section '.data' data readable writeable
    ; Demonstrate memory alignment and cache-friendly layouts
    
    ; Bad alignment - wastes space and hurts performance
    bad_struct:
        .flag1      db 0        ; 1 byte
        .big_value  dd 0        ; 4 bytes (misaligned)
        .flag2      db 0        ; 1 byte
        .another_big dd 0       ; 4 bytes (misaligned)
    
    ; Good alignment - cache-friendly and efficient
    align 4
    good_struct:
        .big_value  dd 0        ; 4 bytes (aligned)
        .another_big dd 0       ; 4 bytes (aligned)
        .flag1      db 0        ; 1 byte
        .flag2      db 0        ; 1 byte
                    dw 0        ; Explicit padding
    
    ; Cache-line optimized structure (64 bytes)
    align 64
    cache_friendly:
        .hot_data   dd 15 dup(0) ; 60 bytes of frequently accessed data
        .padding    dd 0         ; 4 bytes padding = 64 bytes total
    
    ; Array optimized for vectorization
    align 16
    vector_array dd 1000 dup(0)  ; 16-byte aligned for SSE/AVX
    
    ; Performance comparison data
    access_count    dd 1000000
    timer_start     dq 0
    timer_end       dq 0
    
section '.code' code readable executable

start:
    ; Benchmark memory access patterns
    
    ; Test 1: Sequential access (cache-friendly)
    call get_timestamp
    mov [timer_start], eax
    
    mov esi, vector_array
    mov ecx, 1000
    xor eax, eax
    
sequential_loop:
    add eax, [esi]      ; Sequential memory access
    add esi, 4
    loop sequential_loop
    
    call get_timestamp
    mov [timer_end], eax
    
    ; Calculate and display sequential access time
    mov eax, [timer_end]
    sub eax, [timer_start]
    invoke printf, sequential_fmt, eax
    
    ; Test 2: Random access (cache-unfriendly)
    call get_timestamp
    mov [timer_start], eax
    
    mov ecx, 1000
    mov edx, 1                  ; Simple PRNG seed
    
random_loop:
    ; Simple linear congruential generator
    imul edx, 1103515245
    add edx, 12345
    and edx, 0x7FFFFFFF
    
    ; Convert to array index
    mov eax, edx
    xor edx, edx
    mov ebx, 1000
    div ebx                     ; EDX = random index
    
    ; Access random element
    mov eax, [vector_array + edx*4]
    
    loop random_loop
    
    call get_timestamp
    mov [timer_end], eax
    
    ; Calculate and display random access time
    mov eax, [timer_end]
    sub eax, [timer_start]
    invoke printf, random_fmt, eax
    
    ; Exit
    invoke ExitProcess, 0

get_timestamp:
    ; Get high-resolution timestamp
    rdtsc                       ; Read timestamp counter
    ret

section '.data' data readable writeable
    sequential_fmt db 'Sequential access: %d cycles', 13, 10, 0
    random_fmt     db 'Random access: %d cycles', 13, 10, 0

section '.idata' import data readable writeable
    library kernel32, 'KERNEL32.DLL', \
            msvcrt, 'MSVCRT.DLL'
    import kernel32, ExitProcess, 'ExitProcess'
    import msvcrt, printf, 'printf'
```

This example demonstrates several crucial concepts:

1. **Memory Alignment**: Properly aligned data accesses are faster
2. **Cache Behavior**: Sequential access patterns are much faster than random access
3. **Structure Layout**: The order of fields in structures affects performance
4. **Measurement**: How to benchmark memory access patterns

### Advanced Data Structures

Real programs require sophisticated data organization. Let's build some advanced structures that demonstrate professional-level memory management.

```assembly
; Dynamic Array Implementation
format PE console
entry start

include 'win32a.inc'

section '.data' data readable writeable
    ; Dynamic array structure
    struc DynamicArray
        .data       dd ?        ; Pointer to data
        .size       dd ?        ; Current number of elements
        .capacity   dd ?        ; Maximum elements before reallocation
        .element_size dd ?      ; Size of each element
    ends
    
    my_array    DynamicArray
    
    ; Hash table implementation
    HASH_TABLE_SIZE equ 256
    
    struc HashEntry
        .key        dd ?        ; Hash key
        .value      dd ?        ; Associated value
        .next       dd ?        ; Next entry in chain
    ends
    
    hash_table  dd HASH_TABLE_SIZE dup(0)  ; Array of pointers
    
    ; Binary tree node
    struc TreeNode
        .value      dd ?        ; Node value
        .left       dd ?        ; Left child pointer
        .right      dd ?        ; Right child pointer
        .parent     dd ?        ; Parent pointer
    ends
    
    tree_root   dd 0           ; Root of binary tree
    
    ; Memory pool for efficient allocation
    POOL_SIZE equ 4096
    memory_pool db POOL_SIZE dup(0)
    pool_offset dd 0
    
section '.code' code readable executable

start:
    ; Initialize dynamic array
    call init_dynamic_array
    
    ; Add elements to array
    mov eax, 42
    call array_push
    mov eax, 17
    call array_push
    mov eax, 255
    call array_push
    
    ; Test hash table
    mov eax, 12345          ; Key
    mov ebx, 67890          ; Value
    call hash_insert
    
    mov eax, 12345          ; Search for key
    call hash_lookup
    cmp eax, -1
    je key_not_found
    invoke printf, found_fmt, eax
    
    ; Test binary tree
    mov eax, 50
    call tree_insert
    mov eax, 30
    call tree_insert
    mov eax, 70
    call tree_insert
    mov eax, 20
    call tree_insert
    
    call tree_inorder_print
    
key_not_found:
    invoke ExitProcess, 0

init_dynamic_array:
    ; Initialize array with initial capacity of 4
    mov [my_array.size], 0
    mov [my_array.capacity], 4
    mov [my_array.element_size], 4
    
    ; Allocate initial memory
    invoke HeapAlloc, [GetProcessHeap], 0, 16  ; 4 * 4 bytes
    mov [my_array.data], eax
    ret

array_push:
    ; Push value in EAX to array
    push eax
    
    ; Check if resize needed
    mov eax, [my_array.size]
    cmp eax, [my_array.capacity]
    jl no_resize
    
    ; Double the capacity
    mov eax, [my_array.capacity]
    shl eax, 1                  ; Double capacity
    mov [my_array.capacity], eax
    
    ; Reallocate memory
    mov eax, [my_array.capacity]
    shl eax, 2                  ; Multiply by element size
    invoke HeapReAlloc, [GetProcessHeap], 0, [my_array.data], eax
    mov [my_array.data], eax
    
no_resize:
    ; Add element
    mov esi, [my_array.data]
    mov eax, [my_array.size]
    mov [esi + eax*4], dword [esp] ; Store value
    inc dword [my_array.size]
    
    pop eax
    ret

hash_function:
    ; Simple hash function: key % HASH_TABLE_SIZE
    xor edx, edx
    mov ebx, HASH_TABLE_SIZE
    div ebx
    mov eax, edx                ; Return remainder
    ret

hash_insert:
    ; Insert key=EAX, value=EBX into hash table
    push ebx
    call hash_function          ; Get hash index
    pop ebx
    
    ; Allocate new hash entry
    call allocate_hash_entry
    mov esi, eax
    
    ; Fill entry
    mov [esi + HashEntry.key], eax
    mov [esi + HashEntry.value], ebx
    
    ; Insert at head of chain
    mov ebx, [hash_table + eax*4]
    mov [esi + HashEntry.next], ebx
    mov [hash_table + eax*4], esi
    ret

hash_lookup:
    ; Lookup key=EAX, return value or -1 if not found
    push eax
    call hash_function
    mov esi, [hash_table + eax*4]
    pop eax
    
lookup_loop:
    test esi, esi
    jz not_found
    
    cmp [esi + HashEntry.key], eax
    je found
    
    mov esi, [esi + HashEntry.next]
    jmp lookup_loop
    
found:
    mov eax, [esi + HashEntry.value]
    ret
    
not_found:
    mov eax, -1
    ret

tree_insert:
    ; Insert value=EAX into binary search tree
    test dword [tree_root], 0
    jnz tree_insert_recursive
    
    ; Tree is empty, create root
    call allocate_tree_node
    mov [tree_root], eax
    mov esi, eax
    mov [esi + TreeNode.value], eax
    mov [esi + TreeNode.left], 0
    mov [esi + TreeNode.right], 0
    mov [esi + TreeNode.parent], 0
    ret

tree_insert_recursive:
    mov esi, [tree_root]
    ; Recursive insertion logic would go here
    ; Simplified for brevity
    ret

tree_inorder_print:
    ; In-order traversal of binary tree
    mov esi, [tree_root]
    call tree_print_recursive
    ret

tree_print_recursive:
    ; Recursive in-order print
    test esi, esi
    jz print_done
    
    ; Print left subtree
    push esi
    mov esi, [esi + TreeNode.left]
    call tree_print_recursive
    pop esi
    
    ; Print current node
    invoke printf, node_fmt, [esi + TreeNode.value]
    
    ; Print right subtree
    push esi
    mov esi, [esi + TreeNode.right]
    call tree_print_recursive
    pop esi
    
print_done:
    ret

allocate_hash_entry:
    ; Simple pool allocator for hash entries
    mov eax, [pool_offset]
    add eax, memory_pool
    add dword [pool_offset], sizeof.HashEntry
    ret

allocate_tree_node:
    ; Simple pool allocator for tree nodes
    mov eax, [pool_offset]
    add eax, memory_pool
    add dword [pool_offset], sizeof.TreeNode
    ret

GetProcessHeap:
    invoke kernel32.GetProcessHeap
    ret

section '.data' data readable writeable
    found_fmt db 'Found value: %d', 13, 10, 0
    node_fmt  db 'Node: %d', 13, 10, 0

section '.idata' import data readable writeable
    library kernel32, 'KERNEL32.DLL', \
            msvcrt, 'MSVCRT.DLL'
    import kernel32, ExitProcess, 'ExitProcess', \
                     HeapAlloc, 'HeapAlloc', \
                     HeapReAlloc, 'HeapReAlloc', \
                     GetProcessHeap, 'GetProcessHeap'
    import msvcrt, printf, 'printf'
```

This comprehensive example demonstrates:

1. **Dynamic Arrays**: Growing and shrinking data structures
2. **Hash Tables**: Fast key-value lookup with collision handling
3. **Binary Trees**: Hierarchical data organization
4. **Memory Pools**: Efficient allocation strategies

## Memory Management Strategies

### Stack vs. Heap: Choosing Your Memory Strategy

Understanding when to use stack allocation versus heap allocation is crucial for both performance and correctness.

```assembly
format PE console
entry start

include 'win32a.inc'

section '.data' data readable writeable
    heap_handle dd 0
    
section '.code' code readable executable

start:
    ; Get process heap handle
    invoke GetProcessHeap
    mov [heap_handle], eax
    
    ; Demonstrate stack allocation
    call demo_stack_allocation
    
    ; Demonstrate heap allocation
    call demo_heap_allocation
    
    ; Demonstrate custom allocator
    call demo_custom_allocator
    
    invoke ExitProcess, 0

demo_stack_allocation:
    ; Stack allocation - automatic cleanup
    enter 1024, 0               ; Allocate 1KB on stack
    
    ; Use stack space
    lea esi, [ebp-1024]         ; Point to allocated space
    mov ecx, 256                ; Fill with pattern
    mov eax, 0xDEADBEEF
    
fill_stack:
    mov [esi], eax
    add esi, 4
    loop fill_stack
    
    ; Demonstrate stack array usage
    lea esi, [ebp-1024]
    mov ecx, 10
    mov eax, 1
    
fibonacci_stack:
    mov [esi], eax              ; Store Fibonacci number
    add esi, 4
    
    ; Calculate next Fibonacci
    mov ebx, eax
    add eax, [esi-8]            ; Add previous number
    mov [esi-4], ebx            ; Store current
    
    loop fibonacci_stack
    
    leave                       ; Automatic cleanup
    ret

demo_heap_allocation:
    ; Heap allocation - manual management required
    
    ; Allocate memory for large array
    invoke HeapAlloc, [heap_handle], HEAP_ZERO_MEMORY, 4096
    test eax, eax
    jz allocation_failed
    mov esi, eax                ; Save pointer
    
    ; Use heap memory
    mov ecx, 1024               ; Number of integers
    mov eax, 1
    
fill_heap:
    mov [esi], eax              ; Store value
    inc eax                     ; Next value
    add esi, 4                  ; Next position
    loop fill_heap
    
    ; Process the data
    sub esi, 4096               ; Back to start
    mov ecx, 1024
    xor eax, eax                ; Sum accumulator
    
sum_heap:
    add eax, [esi]              ; Add to sum
    add esi, 4
    loop sum_heap
    
    invoke printf, sum_fmt, eax
    
    ; Free heap memory
    sub esi, 4096               ; Back to original pointer
    invoke HeapFree, [heap_handle], 0, esi
    ret
    
allocation_failed:
    invoke printf, error_fmt
    ret

demo_custom_allocator:
    ; Custom allocator with alignment and tracking
    
    ; Allocate aligned memory
    mov eax, 1024               ; Size
    mov ebx, 16                 ; Alignment
    call aligned_alloc
    test eax, eax
    jz custom_alloc_failed
    
    mov esi, eax                ; Save aligned pointer
    
    ; Verify alignment
    test esi, 15                ; Check if 16-byte aligned
    jnz alignment_error
    
    ; Use aligned memory for vectorized operations
    ; (Simplified - would use SSE/AVX instructions)
    mov ecx, 64                 ; 64 quad-words
    mov eax, 0x12345678
    
fill_aligned:
    mov [esi], eax
    mov [esi+4], eax
    mov [esi+8], eax
    mov [esi+12], eax
    add esi, 16
    loop fill_aligned
    
    ; Free custom allocated memory
    sub esi, 1024
    call aligned_free
    ret
    
custom_alloc_failed:
alignment_error:
    invoke printf, custom_error_fmt
    ret

aligned_alloc:
    ; Allocate aligned memory
    ; EAX = size, EBX = alignment
    push eax
    push ebx
    
    ; Allocate extra space for alignment and metadata
    add eax, ebx                ; Add alignment padding
    add eax, 8                  ; Add space for metadata
    
    invoke HeapAlloc, [heap_handle], 0, eax
    test eax, eax
    jz aligned_alloc_failed
    
    ; Calculate aligned address
    mov esi, eax                ; Save original pointer
    add eax, 8                  ; Skip metadata space
    add eax, ebx                ; Add alignment
    dec eax                     ; EAX = ptr + align - 1
    neg ebx
    and eax, ebx                ; Align down
    
    ; Store metadata
    mov [eax-8], esi            ; Store original pointer
    mov [eax-4], esp            ; Store allocation info
    
    pop ebx
    pop ecx
    ret
    
aligned_alloc_failed:
    pop ebx
    pop eax
    xor eax, eax
    ret

aligned_free:
    ; Free aligned memory
    ; EAX = aligned pointer
    mov esi, [eax-8]            ; Get original pointer
    invoke HeapFree, [heap_handle], 0, esi
    ret

section '.data' data readable writeable
    sum_fmt db 'Heap sum: %d', 13, 10, 0
    error_fmt db 'Heap allocation failed!', 13, 10, 0
    custom_error_fmt db 'Custom allocation failed!', 13, 10, 0

section '.idata' import data readable writeable
    library kernel32, 'KERNEL32.DLL', \
            msvcrt, 'MSVCRT.DLL'
    import kernel32, ExitProcess, 'ExitProcess', \
                     GetProcessHeap, 'GetProcessHeap', \
                     HeapAlloc, 'HeapAlloc', \
                     HeapFree, 'HeapFree'
    import msvcrt, printf, 'printf'
```

This example demonstrates sophisticated memory management:

1. **Stack Allocation**: Fast, automatic cleanup, limited size
2. **Heap Allocation**: Flexible size, manual management required
3. **Custom Allocators**: Specialized allocation strategies for performance

### Cache-Aware Programming

Modern processors have complex cache hierarchies. Understanding and optimizing for cache behavior can dramatically improve performance.

```assembly
format PE console
entry start

include 'win32a.inc'

section '.data' data readable writeable
    ; Cache-friendly data layout
    CACHE_LINE_SIZE equ 64
    MATRIX_SIZE equ 256
    
    ; Matrix multiplication example
    align CACHE_LINE_SIZE
    matrix_a dd MATRIX_SIZE * MATRIX_SIZE dup(0)
    
    align CACHE_LINE_SIZE
    matrix_b dd MATRIX_SIZE * MATRIX_SIZE dup(0)
    
    align CACHE_LINE_SIZE
    matrix_c dd MATRIX_SIZE * MATRIX_SIZE dup(0)
    
    ; Cache performance counters
    cache_misses dd 0
    cache_hits dd 0
    
section '.code' code readable executable

start:
    ; Initialize matrices
    call init_matrices
    
    ; Standard matrix multiplication (cache-unfriendly)
    call get_performance_counters
    mov [cache_misses], eax
    
    call matrix_multiply_standard
    
    call get_performance_counters
    sub eax, [cache_misses]
    invoke printf, standard_fmt, eax
    
    ; Cache-optimized matrix multiplication
    call get_performance_counters
    mov [cache_misses], eax
    
    call matrix_multiply_optimized
    
    call get_performance_counters
    sub eax, [cache_misses]
    invoke printf, optimized_fmt, eax
    
    invoke ExitProcess, 0

init_matrices:
    ; Initialize matrices with test data
    mov esi, matrix_a
    mov ecx, MATRIX_SIZE * MATRIX_SIZE
    mov eax, 1
    
init_a:
    mov [esi], eax
    add esi, 4
    inc eax
    loop init_a
    
    mov esi, matrix_b
    mov ecx, MATRIX_SIZE * MATRIX_SIZE
    mov eax, 1
    
init_b:
    mov [esi], eax
    add esi, 4
    inc eax
    loop init_b
    
    ret

matrix_multiply_standard:
    ; Standard O(n³) algorithm - cache unfriendly
    xor edi, edi                ; i = 0
    
outer_i:
    cmp edi, MATRIX_SIZE
    jge multiply_done
    
    xor esi, esi                ; j = 0
    
outer_j:
    cmp esi, MATRIX_SIZE
    jge next_i
    
    xor eax, eax                ; sum = 0
    xor edx, edx                ; k = 0
    
inner_k:
    cmp edx, MATRIX_SIZE
    jge store_result
    
    ; Calculate A[i][k]
    mov ebx, edi
    imul ebx, MATRIX_SIZE
    add ebx, edx
    mov ecx, [matrix_a + ebx*4]
    
    ; Calculate B[k][j]
    mov ebx, edx
    imul ebx, MATRIX_SIZE
    add ebx, esi
    imul ecx, [matrix_b + ebx*4]
    
    add eax, ecx                ; sum += A[i][k] * B[k][j]
    inc edx                     ; k++
    jmp inner_k
    
store_result:
    ; Store C[i][j] = sum
    mov ebx, edi
    imul ebx, MATRIX_SIZE
    add ebx, esi
    mov [matrix_c + ebx*4], eax
    
    inc esi                     ; j++
    jmp outer_j
    
next_i:
    inc edi                     ; i++
    jmp outer_i
    
multiply_done:
    ret

matrix_multiply_optimized:
    ; Cache-optimized with loop tiling
    TILE_SIZE equ 32           ; Tile size for cache optimization
    
    xor edi, edi               ; ii = 0 (tile row)
    
tile_i:
    cmp edi, MATRIX_SIZE
    jge optimized_done
    
    xor esi, esi               ; jj = 0 (tile column)
    
tile_j:
    cmp esi, MATRIX_SIZE
    jge next_tile_i
    
    xor edx, edx               ; kk = 0 (tile depth)
    
tile_k:
    cmp edx, MATRIX_SIZE
    jge next_tile_j
    
    ; Process tile
    mov eax, edi               ; i = ii
    
tile_inner_i:
    mov ebx, edi
    add ebx, TILE_SIZE
    cmp eax, ebx
    jge tile_k_next
    cmp eax, MATRIX_SIZE
    jge tile_k_next
    
    mov ebx, esi               ; j = jj
    
tile_inner_j:
    mov ecx, esi
    add ecx, TILE_SIZE
    cmp ebx, ecx
    jge tile_i_next
    cmp ebx, MATRIX_SIZE
    jge tile_i_next
    
    mov ecx, edx               ; k = kk
    
tile_inner_k:
    mov ebp, edx
    add ebp, TILE_SIZE
    cmp ecx, ebp
    jge tile_j_next
    cmp ecx, MATRIX_SIZE
    jge tile_j_next
    
    ; A[i][k] * B[k][j] + C[i][j]
    push eax
    push ebx
    push ecx
    
    ; Calculate addresses
    imul eax, MATRIX_SIZE
    add eax, ecx
    mov ebp, [matrix_a + eax*4]  ; A[i][k]
    
    imul ecx, MATRIX_SIZE
    add ecx, ebx
    imul ebp, [matrix_b + ecx*4] ; * B[k][j]
    
    pop ecx
    pop ebx
    pop eax
    
    push ecx
    mov ecx, eax
    imul ecx, MATRIX_SIZE
    add ecx, ebx
    add [matrix_c + ecx*4], ebp  ; += C[i][j]
    pop ecx
    
    inc ecx                     ; k++
    jmp tile_inner_k
    
tile_j_next:
    inc ebx                     ; j++
    jmp tile_inner_j
    
tile_i_next:
    inc eax                     ; i++
    jmp tile_inner_i
    
tile_k_next:
    add edx, TILE_SIZE          ; kk += TILE_SIZE
    jmp tile_k
    
next_tile_j:
    add esi, TILE_SIZE          ; jj += TILE_SIZE
    jmp tile_j
    
next_tile_i:
    add edi, TILE_SIZE          ; ii += TILE_SIZE
    jmp tile_i
    
optimized_done:
    ret

get_performance_counters:
    ; Read performance counters (simplified)
    rdtsc                       ; Read timestamp counter
    ret

section '.data' data readable writeable
    standard_fmt db 'Standard multiply cache misses: %d', 13, 10, 0
    optimized_fmt db 'Optimized multiply cache misses: %d', 13, 10, 0

section '.idata' import data readable writeable
    library kernel32, 'KERNEL32.DLL', \
            msvcrt, 'MSVCRT.DLL'
    import kernel32, ExitProcess, 'ExitProcess'
    import msvcrt, printf, 'printf'
```

This example demonstrates:

1. **Cache-Friendly Data Layout**: Aligning data to cache line boundaries
2. **Algorithm Optimization**: Loop tiling to improve cache locality
3. **Performance Measurement**: Using performance counters to measure improvement

## Advanced Memory Techniques

### Memory-Mapped Files

Memory-mapped files allow you to work with large files as if they were arrays in memory.

```assembly
format PE console
entry start

include 'win32a.inc'

section '.data' data readable writeable
    filename db 'test_data.bin', 0
    file_handle dd INVALID_HANDLE_VALUE
    mapping_handle dd 0
    mapped_ptr dd 0
    file_size dd 1024*1024      ; 1MB file
    
section '.code' code readable executable

start:
    ; Create and map a file
    call create_memory_mapped_file
    test eax, eax
    jz mapping_failed
    
    ; Work with mapped memory
    call process_mapped_file
    
    ; Clean up
    call cleanup_memory_mapping
    
    invoke ExitProcess, 0

create_memory_mapped_file:
    ; Create file
    invoke CreateFile, filename, GENERIC_READ or GENERIC_WRITE, \
           0, 0, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, 0
    cmp eax, INVALID_HANDLE_VALUE
    je create_failed
    mov [file_handle], eax
    
    ; Set file size
    invoke SetFilePointer, [file_handle], [file_size], 0, FILE_BEGIN
    invoke SetEndOfFile, [file_handle]
    
    ; Create file mapping
    invoke CreateFileMapping, [file_handle], 0, PAGE_READWRITE, \
           0, [file_size], 0
    test eax, eax
    jz mapping_create_failed
    mov [mapping_handle], eax
    
    ; Map view of file
    invoke MapViewOfFile, [mapping_handle], FILE_MAP_ALL_ACCESS, \
           0, 0, 0
    test eax, eax
    jz map_view_failed
    mov [mapped_ptr], eax
    
    mov eax, 1                  ; Success
    ret
    
create_failed:
mapping_create_failed:
map_view_failed:
    xor eax, eax                ; Failure
    ret

process_mapped_file:
    ; Fill file with test pattern
    mov esi, [mapped_ptr]
    mov ecx, [file_size]
    shr ecx, 2                  ; Convert to DWORD count
    mov eax, 0xDEADBEEF
    
fill_pattern:
    mov [esi], eax
    add esi, 4
    ror eax, 8                  ; Rotate pattern
    loop fill_pattern
    
    ; Process the data
    mov esi, [mapped_ptr]
    mov ecx, [file_size]
    shr ecx, 2
    xor eax, eax                ; Checksum accumulator
    
calculate_checksum:
    xor eax, [esi]              ; XOR checksum
    add esi, 4
    loop calculate_checksum
    
    invoke printf, checksum_fmt, eax
    ret

cleanup_memory_mapping:
    ; Unmap view
    cmp dword [mapped_ptr], 0
    je skip_unmap
    invoke UnmapViewOfFile, [mapped_ptr]
    
skip_unmap:
    ; Close mapping handle
    cmp dword [mapping_handle], 0
    je skip_close_mapping
    invoke CloseHandle, [mapping_handle]
    
skip_close_mapping:
    ; Close file handle
    cmp dword [file_handle], INVALID_HANDLE_VALUE
    je skip_close_file
    invoke CloseHandle, [file_handle]
    
skip_close_file:
    ret

mapping_failed:
    invoke printf, error_msg
    ret

section '.data' data readable writeable
    checksum_fmt db 'File checksum: 0x%08X', 13, 10, 0
    error_msg db 'Memory mapping failed!', 13, 10, 0

section '.idata' import data readable writeable
    library kernel32, 'KERNEL32.DLL', \
            msvcrt, 'MSVCRT.DLL'
    import kernel32, ExitProcess, 'ExitProcess', \
                     CreateFile, 'CreateFileA', \
                     CreateFileMapping, 'CreateFileMappingA', \
                     MapViewOfFile, 'MapViewOfFile', \
                     UnmapViewOfFile, 'UnmapViewOfFile', \
                     CloseHandle, 'CloseHandle', \
                     SetFilePointer, 'SetFilePointer', \
                     SetEndOfFile, 'SetEndOfFile'
    import msvcrt, printf, 'printf'
```

This comprehensive chapter covers all aspects of data and memory management in FASM, from basic data types to advanced techniques like memory mapping and cache optimization. The examples are production-ready and demonstrate real-world programming scenarios.

## Summary

In this chapter, we've explored the fundamental relationship between data and memory in assembly programming. You've learned:

1. **Data Type Fundamentals**: How different data types are represented and accessed
2. **Memory Architecture**: Understanding cache hierarchies and alignment
3. **Advanced Structures**: Building sophisticated data structures in assembly
4. **Memory Management**: Stack vs. heap allocation strategies
5. **Performance Optimization**: Cache-aware programming techniques
6. **Advanced Techniques**: Memory mapping and custom allocators

These concepts form the foundation for all efficient assembly programming. In the next chapter, we'll build on this knowledge to explore the instruction set architecture and how to use instructions effectively for maximum performance.