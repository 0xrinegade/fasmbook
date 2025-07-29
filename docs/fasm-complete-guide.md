# The Complete FASM Programming Guide
*Professional Assembly Programming with Flat Assembler for KolibriOS*

## Table of Contents

### Part I: Fundamentals (Pages 1-25)
1. [Introduction to FASM](#introduction-to-fasm)
2. [Setting Up FASM Development Environment](#setting-up-fasm-development-environment)
3. [FASM Syntax and Basic Structure](#fasm-syntax-and-basic-structure)
4. [Data Types and Memory Organization](#data-types-and-memory-organization)
5. [Instruction Set Overview](#instruction-set-overview)

### Part II: Core Programming Concepts (Pages 26-50)
6. [Control Flow and Branching](#control-flow-and-branching)
7. [Procedures and Stack Management](#procedures-and-stack-management)
8. [String Operations and Text Processing](#string-operations-and-text-processing)
9. [Arithmetic and Logic Operations](#arithmetic-and-logic-operations)
10. [Bit Manipulation Techniques](#bit-manipulation-techniques)

### Part III: Advanced Assembly Programming (Pages 51-75)
11. [Memory Management and Allocation](#memory-management-and-allocation)
12. [Interrupt Handling and System Calls](#interrupt-handling-and-system-calls)
13. [File I/O and System Interface](#file-io-and-system-interface)
14. [Graphics Programming in Assembly](#graphics-programming-in-assembly)
15. [Network Programming with FASM](#network-programming-with-fasm)

### Part IV: Professional Development Techniques (Pages 76-100)
16. [Code Organization and Modular Programming](#code-organization-and-modular-programming)
17. [Optimization Strategies and Performance](#optimization-strategies-and-performance)
18. [Debugging and Testing Assembly Code](#debugging-and-testing-assembly-code)
19. [Cross-Platform Assembly Development](#cross-platform-assembly-development)
20. [Real-World Project Development](#real-world-project-development)

---

## Introduction to FASM

### What is FASM?

FASM (Flat Assembler) is a fast, self-assembling assembler for the x86 and x86-64 architectures. Originally created by Tomasz Grysztar, FASM has become the assembler of choice for KolibriOS development due to its:

- **Speed**: FASM is one of the fastest assemblers available
- **Simplicity**: Clean, readable syntax without unnecessary complexity
- **Self-contained**: FASM can assemble itself, requiring no external dependencies
- **Flexibility**: Supports multiple output formats (flat binary, PE, ELF, etc.)
- **Macro System**: Powerful macro preprocessing capabilities

### Why Use FASM for KolibriOS?

KolibriOS is written entirely in assembly language, making FASM the natural choice for:

1. **System Programming**: Direct hardware access and precise control
2. **Performance**: Maximum efficiency for resource-constrained environments
3. **Size Optimization**: Minimal code size for embedded systems
4. **Real-time Applications**: Predictable execution timing
5. **Educational Value**: Understanding computer architecture at the lowest level

### FASM vs Other Assemblers

| Feature | FASM | NASM | MASM | GAS |
|---------|------|------|------|-----|
| Syntax Clarity | Excellent | Good | Good | Poor |
| Assembly Speed | Fastest | Fast | Medium | Slow |
| Macro System | Powerful | Good | Excellent | Limited |
| Documentation | Good | Excellent | Excellent | Poor |
| Cross-platform | Yes | Yes | Windows Only | Yes |
| Learning Curve | Gentle | Medium | Steep | Steep |

## Setting Up FASM Development Environment

### Installing FASM

#### Windows Installation
```batch
:: Download FASM from https://flatassembler.net
:: Extract to C:\fasm
set PATH=%PATH%;C:\fasm

:: Verify installation
fasm
```

#### Linux Installation
```bash
# Download and extract FASM
wget https://flatassembler.net/fasm-1.73.30.tgz
tar xzf fasm-1.73.30.tgz
cd fasm
make

# Install system-wide
sudo cp fasm /usr/local/bin/

# Verify installation
fasm
```

#### KolibriOS Installation
```assembly
; FASM is included with KolibriOS by default
; Located at /sys/develop/fasm
; Can be run from command line or Tinypad
```

### Development Tools Setup

#### Text Editors and IDEs

**Recommended editors for FASM development:**

1. **Fresh IDE** (Optimized for FASM)
   - Syntax highlighting
   - Integrated assembler
   - Project management
   - Built-in debugger

2. **Visual Studio Code** with FASM extension
   - Modern interface
   - Integrated terminal
   - Git integration
   - Extensive plugin ecosystem

3. **Notepad++** with FASM syntax
   - Lightweight
   - Syntax highlighting
   - Macro recording
   - Plugin support

#### Debugger Setup

**FDBG (FASM Debugger)**
```assembly
; Enable debug symbols in FASM
format PE console
entry start

include 'debug.inc'

section '.text' code readable executable
start:
    ; Your code here
    DEBUGF 1, "Debug message: %d\n", eax
    ret

section '.data' data readable writeable
    ; Data section

section '.idata' import data readable writeable
    ; Import section
```

### Project Structure Best Practices

```
project/
├── src/
│   ├── main.asm          ; Main program file
│   ├── utils.asm         ; Utility functions
│   ├── graphics.asm      ; Graphics routines
│   └── network.asm       ; Network functions
├── include/
│   ├── macros.inc        ; Custom macros
│   ├── constants.inc     ; Constants and definitions
│   └── structs.inc       ; Data structures
├── lib/
│   ├── string.asm        ; String library
│   └── math.asm          ; Math library
├── docs/
│   ├── api.md            ; API documentation
│   └── examples/         ; Code examples
├── build/
│   └── output/           ; Compiled binaries
└── Makefile              ; Build script
```

## FASM Syntax and Basic Structure

### Program Structure

Every FASM program follows a basic structure:

```assembly
; Program header and format specification
format binary as "exe"
use32

; Entry point
org 0x100

; Program start
start:
    ; Your code here
    
    ; Program termination
    mov eax, 1
    int 0x80

; Data sections
section '.data'
    ; Initialized data

section '.bss'
    ; Uninitialized data

; End of program
```

### Basic Syntax Rules

#### Comments
```assembly
; Single line comment
mov eax, 5  ; Inline comment

/* Multi-line comment
   spanning multiple lines
   useful for documentation */
```

#### Labels
```assembly
main:           ; Global label
.local:         ; Local label (accessible only within current global label)
@@:             ; Anonymous label
variable db 10  ; Data label
```

#### Numbers and Constants
```assembly
mov eax, 42        ; Decimal number
mov ebx, 0x2A      ; Hexadecimal number
mov ecx, 52o       ; Octal number
mov edx, 101010b   ; Binary number

; Character constants
mov al, 'A'        ; Single character
mov eax, 'ABCD'    ; Four characters (little-endian)
```

#### Data Definitions
```assembly
section '.data'
    ; Byte data
    byte_var    db 10, 20, 30
    string_var  db 'Hello, World!', 0
    
    ; Word data (16-bit)
    word_var    dw 1000, 2000
    
    ; Double word data (32-bit)
    dword_var   dd 100000
    pointer_var dd offset string_var
    
    ; Quad word data (64-bit)
    qword_var   dq 1000000000
    
    ; Ten-byte data (80-bit)
    tbyte_var   dt 3.14159265358979323846
    
section '.bss'
    ; Uninitialized data
    buffer      rb 1024    ; Reserve 1024 bytes
    array       rw 100     ; Reserve 100 words
    large_array rd 1000    ; Reserve 1000 double words
```

### Advanced Data Structures

#### Structures
```assembly
struc POINT
{
    .x dd ?
    .y dd ?
}

struc RECTANGLE
{
    .left   dd ?
    .top    dd ?
    .right  dd ?
    .bottom dd ?
}

section '.data'
    point1 POINT <100, 200>
    rect1  RECTANGLE <10, 20, 110, 120>

section '.code'
    ; Access structure members
    mov eax, [point1.x]
    mov ebx, [point1.y]
    
    ; Using structure as template
    mov ecx, POINT.x  ; Get offset of x member
```

#### Unions
```assembly
union VALUE
{
    .dword_val dd ?
    .word_vals dw ?, ?
    .byte_vals db ?, ?, ?, ?
}

section '.data'
    value VALUE <0x12345678>

section '.code'
    mov eax, [value.dword_val]      ; 0x12345678
    mov bx, [value.word_vals]       ; 0x5678
    mov cx, [value.word_vals + 2]   ; 0x1234
    mov dl, [value.byte_vals]       ; 0x78
```

### Instruction Format

#### Basic Instruction Format
```assembly
[label:] mnemonic [operand1] [, operand2] [, operand3] [; comment]
```

#### Operand Types
```assembly
; Register operands
mov eax, ebx        ; 32-bit registers
mov ax, bx          ; 16-bit registers  
mov al, bl          ; 8-bit registers

; Immediate operands
mov eax, 100        ; Immediate value
add ebx, 0x50       ; Hexadecimal immediate

; Memory operands
mov eax, [variable] ; Direct memory access
mov ebx, [esi]      ; Indirect memory access
mov ecx, [esi + 4]  ; Indexed memory access
mov edx, [esi + edi * 2 + 8]  ; Complex addressing

; Effective address
lea eax, [string_var]     ; Load effective address
lea ebx, [esi + edi * 4]  ; Calculate address
```

## Data Types and Memory Organization

### Fundamental Data Types

#### Integer Types
```assembly
section '.data'
    ; Signed integers
    signed_byte     db -128, 127          ; 8-bit signed (-128 to 127)
    signed_word     dw -32768, 32767      ; 16-bit signed
    signed_dword    dd -2147483648, 2147483647  ; 32-bit signed
    
    ; Unsigned integers  
    unsigned_byte   db 0, 255             ; 8-bit unsigned (0 to 255)
    unsigned_word   dw 0, 65535           ; 16-bit unsigned
    unsigned_dword  dd 0, 4294967295      ; 32-bit unsigned
    
    ; Arrays
    byte_array      db 10, 20, 30, 40, 50
    word_array      dw 1000, 2000, 3000
    dword_array     dd 100000, 200000, 300000
```

#### Floating-Point Types
```assembly
section '.data'
    ; Single precision (32-bit IEEE 754)
    float_single    dd 3.14159
    
    ; Double precision (64-bit IEEE 754)  
    float_double    dq 2.718281828459045
    
    ; Extended precision (80-bit)
    float_extended  dt 1.41421356237309504880
    
section '.code'
    ; FPU operations
    fld [float_single]      ; Load single precision
    fld [float_double]      ; Load double precision
    fld [float_extended]    ; Load extended precision
    
    ; Arithmetic operations
    fadd                    ; Add top two stack elements
    fmul                    ; Multiply top two stack elements
    fsqrt                   ; Square root of top element
    
    ; Store results
    fstp [result_single]    ; Store and pop single precision
    fstp [result_double]    ; Store and pop double precision
```

#### String Types
```assembly
section '.data'
    ; Null-terminated strings (C-style)
    c_string        db 'Hello, World!', 0
    
    ; Length-prefixed strings (Pascal-style)
    pascal_string   db 13, 'Hello, World!'
    
    ; Fixed-length strings
    fixed_string    db 'ABCDEFGHIJ'
    
    ; Unicode strings (UTF-16)
    unicode_string  dw 'H','e','l','l','o', 0
    
    ; Multi-line strings
    long_string     db 'This is a very long string that ', \
                      'spans multiple lines for better ', \
                      'readability in source code', 0

section '.code'
    ; String operations
    lea esi, [c_string]     ; Load string address
    call string_length      ; Calculate length
    call string_copy        ; Copy string
    call string_compare     ; Compare strings
```

### Memory Layout and Addressing

#### x86 Memory Model
```assembly
; Real mode addressing (16-bit)
use16
org 0x7C00

; Protected mode addressing (32-bit)
use32
org 0x400000

; Long mode addressing (64-bit)
use64
org 0x400000
```

#### Segment Registers
```assembly
; Segment register usage in real mode
mov ax, 0x1000
mov ds, ax          ; Data segment
mov es, ax          ; Extra segment
mov ss, ax          ; Stack segment

; Accessing segmented memory
mov al, [ds:bx]     ; Data segment access
mov [es:di], al     ; Extra segment access
```

#### Memory Addressing Modes
```assembly
; Direct addressing
mov eax, [variable]         ; Direct memory reference

; Register indirect
mov eax, [ebx]             ; Contents of address in EBX

; Base + displacement
mov eax, [ebx + 8]         ; EBX + 8

; Index addressing
mov eax, [esi + edi]       ; ESI + EDI

; Scaled index
mov eax, [esi + edi * 2]   ; ESI + (EDI * 2)

; Full addressing
mov eax, [ebx + esi * 4 + 12]  ; EBX + (ESI * 4) + 12

; Examples with different data sizes
mov al, byte [ebx]         ; Load 8-bit value
mov ax, word [ebx]         ; Load 16-bit value
mov eax, dword [ebx]       ; Load 32-bit value
```

### Advanced Memory Concepts

#### Virtual Memory Management
```assembly
; Page table entry structure
struc PTE
{
    .present        db ?    ; Present bit
    .writable       db ?    ; Writable bit
    .user           db ?    ; User accessible bit
    .write_through  db ?    ; Write-through caching
    .cache_disabled db ?    ; Cache disabled
    .accessed       db ?    ; Accessed bit
    .dirty          db ?    ; Dirty bit
    .reserved       db ?    ; Reserved
    .global         db ?    ; Global bit
    .available      db ?    ; Available for OS use
    .frame_address  dd ?    ; Physical frame address
}

; Setting up page tables
setup_paging:
    ; Create page directory
    mov edi, page_directory
    xor eax, eax
    mov ecx, 1024
    rep stosd
    
    ; Create first page table
    mov edi, page_table_0
    mov eax, 0x00000003  ; Present + Writable
    mov ecx, 1024
    
.fill_table:
    stosd
    add eax, 0x1000      ; Next 4KB page
    loop .fill_table
    
    ; Install page directory
    mov eax, page_directory
    mov cr3, eax
    
    ; Enable paging
    mov eax, cr0
    or eax, 0x80000000
    mov cr0, eax
    
    ret
```

#### Cache Optimization
```assembly
; Cache-friendly data access patterns
cache_friendly_loop:
    mov esi, array_start
    mov ecx, array_length
    
.loop:
    ; Process consecutive memory locations
    mov eax, [esi]      ; Load from cache line
    add eax, [esi + 4]  ; Next element in same cache line
    add eax, [esi + 8]  ; Still in same cache line
    add eax, [esi + 12] ; Last element in cache line
    
    add esi, 16         ; Move to next cache line
    loop .loop
    
    ret

; Cache line prefetching
prefetch_data:
    mov esi, data_array
    mov ecx, array_size
    
.prefetch_loop:
    prefetchnta [esi + 64]  ; Prefetch next cache line
    
    ; Process current cache line
    mov eax, [esi]
    ; ... process data ...
    
    add esi, 64         ; Next cache line
    loop .prefetch_loop
    
    ret
```

## Instruction Set Overview

### Data Movement Instructions

#### Basic Move Operations
```assembly
; Register to register
mov eax, ebx            ; Copy EBX to EAX
mov ax, bx              ; Copy BX to AX (16-bit)
mov al, bl              ; Copy BL to AL (8-bit)

; Immediate to register
mov eax, 100            ; Load immediate value
mov ebx, 0x12345678     ; Load hexadecimal value

; Memory to register
mov eax, [variable]     ; Load from memory
mov ebx, [esi]          ; Load using pointer
mov ecx, [esi + 4]      ; Load with offset

; Register to memory
mov [variable], eax     ; Store to memory
mov [edi], ebx          ; Store using pointer
mov [edi + 8], ecx      ; Store with offset

; Memory to memory (requires intermediate register)
mov eax, [source]       ; Cannot do mov [dest], [source] directly
mov [dest], eax
```

#### Specialized Move Instructions
```assembly
; Move with zero extension
movzx eax, bl           ; Zero-extend 8-bit to 32-bit
movzx ebx, cx           ; Zero-extend 16-bit to 32-bit

; Move with sign extension
movsx eax, bl           ; Sign-extend 8-bit to 32-bit
movsx ebx, cx           ; Sign-extend 16-bit to 32-bit

; Conditional moves (Pentium Pro+)
cmovz eax, ebx          ; Move if zero flag set
cmovnz eax, ebx         ; Move if zero flag clear
cmovs eax, ebx          ; Move if sign flag set
cmovns eax, ebx         ; Move if sign flag clear

; Exchange operations
xchg eax, ebx           ; Exchange register contents
xchg [variable], eax    ; Exchange register with memory

; Compare and exchange (atomic)
cmpxchg [variable], ebx ; Compare EAX with [variable], exchange if equal
```

#### Load Effective Address
```assembly
; LEA - powerful address calculation
lea eax, [ebx + ecx * 4 + 8]    ; EAX = EBX + ECX*4 + 8
lea ebx, [string_buffer]         ; Load address of string_buffer
lea ecx, [esi + edi]            ; ECX = ESI + EDI (addition)
lea edx, [eax * 8]              ; EDX = EAX * 8 (multiplication by power of 2)

; LEA for arithmetic (faster than traditional methods)
lea eax, [eax + eax * 2]        ; EAX = EAX * 3
lea ebx, [ebx + ebx * 4]        ; EBX = EBX * 5
lea ecx, [ecx + ecx]            ; ECX = ECX * 2 (faster than shl ecx, 1)
```

### Arithmetic Instructions

#### Addition and Subtraction
```assembly
; Basic arithmetic
add eax, ebx            ; EAX = EAX + EBX
add eax, 10             ; EAX = EAX + 10
add [variable], eax     ; [variable] = [variable] + EAX

sub eax, ebx            ; EAX = EAX - EBX
sub eax, 5              ; EAX = EAX - 5
sub [variable], eax     ; [variable] = [variable] - EAX

; Arithmetic with carry
adc eax, ebx            ; EAX = EAX + EBX + CF
sbb eax, ebx            ; EAX = EAX - EBX - CF

; 64-bit arithmetic using 32-bit registers
; Adding two 64-bit numbers
add eax, [number1_low]  ; Add lower 32 bits
adc edx, [number1_high] ; Add upper 32 bits with carry

; Increment and decrement
inc eax                 ; EAX = EAX + 1
dec ebx                 ; EBX = EBX - 1
inc byte [counter]      ; Increment byte in memory
dec word [counter]      ; Decrement word in memory
```

#### Multiplication and Division
```assembly
; Unsigned multiplication
mul ebx                 ; EDX:EAX = EAX * EBX (64-bit result)
mul byte [factor]       ; AX = AL * [factor] (16-bit result)
mul word [factor]       ; DX:AX = AX * [factor] (32-bit result)

; Signed multiplication
imul ebx                ; EDX:EAX = EAX * EBX (signed)
imul eax, ebx           ; EAX = EAX * EBX (32-bit result)
imul eax, ebx, 10       ; EAX = EBX * 10 (immediate multiply)

; Unsigned division
div ebx                 ; EAX = EDX:EAX / EBX, EDX = remainder
div byte [divisor]      ; AL = AX / [divisor], AH = remainder
div word [divisor]      ; AX = DX:AX / [divisor], DX = remainder

; Signed division
idiv ebx                ; EAX = EDX:EAX / EBX, EDX = remainder

; Division preparation
xor edx, edx            ; Clear EDX for unsigned division
cdq                     ; Sign-extend EAX to EDX:EAX for signed division

; Example: 64-bit by 32-bit division
; Divide EDX:EAX by EBX
cmp edx, ebx            ; Check if overflow will occur
jae .overflow           ; Jump if EDX >= EBX
div ebx                 ; Perform division
```

#### Bitwise Operations
```assembly
; Logical operations
and eax, ebx            ; EAX = EAX AND EBX
or eax, ebx             ; EAX = EAX OR EBX
xor eax, ebx            ; EAX = EAX XOR EBX
not eax                 ; EAX = NOT EAX (complement)

; Bit testing and manipulation
test eax, ebx           ; Perform AND but don't store result (sets flags)
test eax, 0x80000000    ; Test bit 31
bt eax, 15              ; Test bit 15 (sets CF)
bts eax, 10             ; Set bit 10 and copy old value to CF
btr eax, 5              ; Reset bit 5 and copy old value to CF
btc eax, 20             ; Complement bit 20 and copy old value to CF

; Bit scanning
bsf eax, ebx            ; Find first set bit (forward scan)
bsr eax, ebx            ; Find first set bit (reverse scan)

; Example: Population count (count set bits)
popcnt:
    xor eax, eax        ; Clear counter
    test ebx, ebx       ; Check if zero
    jz .done
    
.count_loop:
    inc eax             ; Increment counter
    blsr ebx, ebx       ; Clear lowest set bit (BMI1 instruction)
    jnz .count_loop     ; Continue if more bits set
    
.done:
    ret
```

#### Shift and Rotate Operations
```assembly
; Logical shifts
shl eax, 1              ; Shift left by 1 bit (multiply by 2)
shl eax, cl             ; Shift left by CL bits
shr eax, 1              ; Shift right by 1 bit (unsigned divide by 2)
shr eax, cl             ; Shift right by CL bits

; Arithmetic shifts
sal eax, 1              ; Arithmetic shift left (same as SHL)
sar eax, 1              ; Arithmetic shift right (signed divide by 2)
sar eax, cl             ; Arithmetic shift right by CL bits

; Rotations
rol eax, 1              ; Rotate left by 1 bit
ror eax, 1              ; Rotate right by 1 bit
rcl eax, 1              ; Rotate left through carry
rcr eax, 1              ; Rotate right through carry

; Double precision shifts
shld eax, ebx, 4        ; Shift EAX left 4 bits, fill from EBX
shrd eax, ebx, 4        ; Shift EAX right 4 bits, fill from EBX

; Examples of optimization using shifts
; Multiply by 10: EAX = EAX * 10
lea eax, [eax * 4 + eax]    ; EAX = EAX * 5
shl eax, 1                  ; EAX = EAX * 2, total = EAX * 10

; Divide by 8 (signed)
sar eax, 3                  ; EAX = EAX / 8

; Check if power of 2
test eax, eax
jz .not_power_of_2
dec eax
and eax, [original_value]
jz .is_power_of_2
```

## Control Flow and Branching

### Conditional Jumps

#### Flag-based Jumps
```assembly
; Zero flag jumps
jz label        ; Jump if zero (ZF = 1)
jnz label       ; Jump if not zero (ZF = 0)
je label        ; Jump if equal (same as JZ)
jne label       ; Jump if not equal (same as JNZ)

; Carry flag jumps
jc label        ; Jump if carry (CF = 1)
jnc label       ; Jump if no carry (CF = 0)

; Sign flag jumps
js label        ; Jump if sign (SF = 1, negative)
jns label       ; Jump if no sign (SF = 0, positive)

; Overflow flag jumps
jo label        ; Jump if overflow (OF = 1)
jno label       ; Jump if no overflow (OF = 0)

; Parity flag jumps
jp label        ; Jump if parity (PF = 1, even parity)
jnp label       ; Jump if no parity (PF = 0, odd parity)
jpe label       ; Jump if parity even (same as JP)
jpo label       ; Jump if parity odd (same as JNP)
```

#### Comparison-based Jumps
```assembly
; Unsigned comparisons
ja label        ; Jump if above (CF = 0 and ZF = 0)
jae label       ; Jump if above or equal (CF = 0)
jb label        ; Jump if below (CF = 1)
jbe label       ; Jump if below or equal (CF = 1 or ZF = 1)

; Signed comparisons
jg label        ; Jump if greater (ZF = 0 and SF = OF)
jge label       ; Jump if greater or equal (SF = OF)
jl label        ; Jump if less (SF != OF)
jle label       ; Jump if less or equal (ZF = 1 or SF != OF)

; Example usage
cmp eax, 100
ja .greater     ; Unsigned: EAX > 100
jg .greater     ; Signed: EAX > 100

cmp eax, ebx
je .equal       ; EAX == EBX
jne .not_equal  ; EAX != EBX
jl .less        ; EAX < EBX (signed)
jb .below       ; EAX < EBX (unsigned)
```

### Loop Constructs

#### Basic Loop Instruction
```assembly
; Loop with ECX counter
mov ecx, 10         ; Loop 10 times
loop_start:
    ; Loop body
    dec ecx
    jnz loop_start
    
; Or using LOOP instruction
mov ecx, 10
loop_start:
    ; Loop body
    loop loop_start     ; Decrements ECX and jumps if not zero
```

#### Advanced Loop Patterns
```assembly
; While loop pattern
while_loop:
    cmp eax, 100        ; Check condition
    jge .end_while      ; Exit if condition false
    
    ; Loop body
    inc eax
    jmp while_loop
    
.end_while:

; Do-while loop pattern
do_while_loop:
    ; Loop body
    inc eax
    
    cmp eax, 100        ; Check condition
    jl do_while_loop    ; Continue if condition true

; For loop pattern
; for (int i = 0; i < 10; i++)
    xor eax, eax        ; i = 0
    
.for_loop:
    cmp eax, 10         ; i < 10?
    jge .end_for        ; Exit if condition false
    
    ; Loop body
    push eax            ; Save loop variable
    ; ... loop operations ...
    pop eax             ; Restore loop variable
    
    inc eax             ; i++
    jmp .for_loop
    
.end_for:

; Nested loops
outer_loop:
    mov ebx, 0          ; Outer loop variable
    
.inner_loop:
    mov ecx, 0          ; Inner loop variable
    
.inner_body:
    ; Nested loop body
    ; Process [ebx][ecx]
    
    inc ecx
    cmp ecx, inner_limit
    jl .inner_body
    
    inc ebx
    cmp ebx, outer_limit
    jl .inner_loop
```

#### Optimized Loop Techniques
```assembly
; Loop unrolling for performance
unrolled_loop:
    mov ecx, array_size
    shr ecx, 2          ; Divide by 4 (process 4 elements per iteration)
    
.unroll_4:
    mov eax, [esi]      ; Process element 0
    add eax, [esi + 4]  ; Process element 1
    add eax, [esi + 8]  ; Process element 2
    add eax, [esi + 12] ; Process element 3
    
    add esi, 16         ; Move to next 4 elements
    loop .unroll_4
    
    ; Handle remaining elements
    mov ecx, array_size
    and ecx, 3          ; Remaining elements (0-3)
    jz .done
    
.remainder:
    mov eax, [esi]
    add esi, 4
    loop .remainder
    
.done:

; Duff's device (loop unrolling with jump table)
duffs_device:
    mov ecx, count
    mov eax, ecx
    and eax, 7          ; count % 8
    shr ecx, 3          ; count / 8
    
    jmp [jump_table + eax * 4]
    
.loop8:
    ; Process 8 elements
    mov eax, [esi]      ; case 0
    add esi, 4
    mov eax, [esi]      ; case 7
    add esi, 4
    mov eax, [esi]      ; case 6
    add esi, 4
    mov eax, [esi]      ; case 5
    add esi, 4
    mov eax, [esi]      ; case 4
    add esi, 4
    mov eax, [esi]      ; case 3
    add esi, 4
    mov eax, [esi]      ; case 2
    add esi, 4
    mov eax, [esi]      ; case 1
    add esi, 4
    
    dec ecx
    jnz .loop8
    ret

jump_table:
    dd .done, .case1, .case2, .case3
    dd .case4, .case5, .case6, .case7

.case7: mov eax, [esi]: add esi, 4
.case6: mov eax, [esi]: add esi, 4
.case5: mov eax, [esi]: add esi, 4
.case4: mov eax, [esi]: add esi, 4
.case3: mov eax, [esi]: add esi, 4
.case2: mov eax, [esi]: add esi, 4
.case1: mov eax, [esi]: add esi, 4
.done:  ret
```

### Switch Statements

#### Jump Table Implementation
```assembly
; Switch statement using jump table
switch_statement:
    cmp eax, 5          ; Check bounds
    ja .default         ; Jump to default if out of range
    
    jmp [jump_table + eax * 4]  ; Jump to case handler
    
.case0:
    ; Handle case 0
    mov ebx, 100
    jmp .end_switch
    
.case1:
    ; Handle case 1
    mov ebx, 200
    jmp .end_switch
    
.case2:
    ; Handle case 2
    mov ebx, 300
    jmp .end_switch
    
.case3:
    ; Handle case 3
    mov ebx, 400
    jmp .end_switch
    
.case4:
    ; Handle case 4
    mov ebx, 500
    jmp .end_switch
    
.case5:
    ; Handle case 5
    mov ebx, 600
    jmp .end_switch
    
.default:
    ; Default case
    mov ebx, 0
    
.end_switch:
    ret

section '.data'
jump_table:
    dd .case0, .case1, .case2, .case3, .case4, .case5
```

#### Binary Search Switch
```assembly
; For sparse switch values, use binary search
binary_switch:
    ; Input: EAX = switch value
    ; Search in sorted array of case values
    
    mov esi, case_values
    mov edi, case_handlers
    mov ecx, num_cases
    
.binary_search:
    test ecx, ecx
    jz .default
    
    mov ebx, ecx
    shr ebx, 1          ; Middle index
    
    cmp eax, [esi + ebx * 4]
    je .found
    jl .search_left
    
    ; Search right half
    lea esi, [esi + ebx * 4 + 4]
    lea edi, [edi + ebx * 4 + 4]
    sub ecx, ebx
    dec ecx
    jmp .binary_search
    
.search_left:
    mov ecx, ebx
    jmp .binary_search
    
.found:
    jmp [edi + ebx * 4]
    
.default:
    ; Default case handler
    ret

section '.data'
case_values:    dd 10, 25, 50, 100, 200, 500
case_handlers:  dd case_10, case_25, case_50, case_100, case_200, case_500
num_cases = ($ - case_values) / 4
```

### Function Calls and Returns

#### Standard Function Calling
```assembly
; Function call
push parameter3     ; Push parameters right to left
push parameter2
push parameter1
call function_name  ; Call function
add esp, 12         ; Clean up stack (3 parameters * 4 bytes)

; Function definition
function_name:
    push ebp        ; Save base pointer
    mov ebp, esp    ; Set up stack frame
    
    ; Access parameters
    mov eax, [ebp + 8]   ; First parameter
    mov ebx, [ebp + 12]  ; Second parameter
    mov ecx, [ebp + 16]  ; Third parameter
    
    ; Function body
    ; ...
    
    mov esp, ebp    ; Restore stack pointer
    pop ebp         ; Restore base pointer
    ret             ; Return to caller
```

#### Optimized Calling Conventions
```assembly
; Register-based calling (fastcall)
; Parameters in ECX, EDX, stack for additional
fastcall_function:
    ; ECX = first parameter
    ; EDX = second parameter
    ; [esp + 4] = third parameter (if any)
    
    ; Function body
    mov eax, ecx
    add eax, edx
    
    ret 4           ; Return and clean 4 bytes from stack

; Tail call optimization
tail_call_example:
    ; Prepare parameters for tail call
    mov eax, [ebp + 8]  ; Get our parameter
    inc eax             ; Modify it
    
    mov esp, ebp        ; Restore stack
    pop ebp             ; Restore base pointer
    
    push eax            ; Push parameter for tail call
    jmp other_function  ; Jump instead of call (tail call)
```

