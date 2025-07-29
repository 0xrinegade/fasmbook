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


## Procedures and Stack Management

### Stack Frame Management

#### Understanding the Stack
```assembly
; Stack grows downward in memory
; ESP points to top of stack (lowest address)
; EBP typically used as frame pointer

; Stack operations
push eax        ; Equivalent to: sub esp, 4; mov [esp], eax
pop ebx         ; Equivalent to: mov ebx, [esp]; add esp, 4

; Multiple push/pop
pushad          ; Push all general registers (EAX, ECX, EDX, EBX, ESP, EBP, ESI, EDI)
popad           ; Pop all general registers

pushfd          ; Push flags register
popfd           ; Pop flags register

; 16-bit versions
pusha           ; Push all 16-bit registers
popa            ; Pop all 16-bit registers
```

#### Standard Function Prologue and Epilogue
```assembly
function_template:
    ; Standard prologue
    push ebp        ; Save caller's frame pointer
    mov ebp, esp    ; Establish new frame pointer
    sub esp, 20     ; Allocate 20 bytes for local variables
    
    ; Save callee-saved registers if used
    push ebx
    push esi
    push edi
    
    ; Function body
    ; Local variables accessed as [ebp - offset]
    ; Parameters accessed as [ebp + offset]
    
    ; Function result typically in EAX
    mov eax, return_value
    
    ; Standard epilogue
    pop edi         ; Restore callee-saved registers
    pop esi
    pop ebx
    
    mov esp, ebp    ; Deallocate local variables
    pop ebp         ; Restore caller's frame pointer
    ret             ; Return to caller

; Accessing parameters and local variables
function_with_locals:
    push ebp
    mov ebp, esp
    sub esp, 12     ; Allocate space for 3 local variables
    
    ; Parameter access (assuming stdcall)
    ; [ebp + 8]  = first parameter
    ; [ebp + 12] = second parameter
    ; [ebp + 16] = third parameter
    
    ; Local variable access
    ; [ebp - 4]  = first local variable
    ; [ebp - 8]  = second local variable
    ; [ebp - 12] = third local variable
    
    mov eax, [ebp + 8]      ; Get first parameter
    mov [ebp - 4], eax      ; Store in first local variable
    
    mov esp, ebp
    pop ebp
    ret 12          ; Return and clean 3 parameters (12 bytes)
```

#### Advanced Stack Techniques
```assembly
; Variable argument functions (like printf)
variable_args_function:
    push ebp
    mov ebp, esp
    
    ; First parameter is count of arguments
    mov ecx, [ebp + 8]      ; Get argument count
    lea esi, [ebp + 12]     ; Point to first variable argument
    
.process_args:
    test ecx, ecx
    jz .done
    
    mov eax, [esi]          ; Get current argument
    add esi, 4              ; Point to next argument
    
    ; Process argument in EAX
    push ecx                ; Save counter
    push esi                ; Save argument pointer
    call process_argument
    pop esi                 ; Restore argument pointer
    pop ecx                 ; Restore counter
    
    dec ecx
    jmp .process_args
    
.done:
    pop ebp
    ret

; Stack-based string builder
string_builder:
    push ebp
    mov ebp, esp
    sub esp, 1024           ; Allocate 1KB buffer on stack
    
    lea edi, [ebp - 1024]   ; Point to buffer start
    xor ecx, ecx            ; Buffer position
    
    ; Add string to buffer
    push "Hello, "
    call add_to_buffer
    
    push "World!"
    call add_to_buffer
    
    ; Null terminate
    mov byte [edi + ecx], 0
    
    ; Copy to heap-allocated memory
    inc ecx                 ; Include null terminator
    push ecx
    call malloc
    add esp, 4
    
    push ecx                ; Length
    push edi                ; Source (stack buffer)
    push eax                ; Destination (heap buffer)
    call memcpy
    add esp, 12
    
    ; EAX contains pointer to heap string
    mov esp, ebp
    pop ebp
    ret
```

### Calling Conventions

#### CDECL Convention
```assembly
; C Declaration calling convention
; - Parameters pushed right to left
; - Caller cleans up stack
; - Return value in EAX
; - Caller-saved: EAX, ECX, EDX
; - Callee-saved: EBX, ESI, EDI, EBP

cdecl_function:
    ; Caller code
    push 30         ; Third parameter
    push 20         ; Second parameter  
    push 10         ; First parameter
    call my_function
    add esp, 12     ; Caller cleans stack (3 * 4 bytes)
    
my_function:
    ; Function code
    push ebp
    mov ebp, esp
    
    mov eax, [ebp + 8]      ; First parameter (10)
    add eax, [ebp + 12]     ; Second parameter (20)
    add eax, [ebp + 16]     ; Third parameter (30)
    ; Result (60) in EAX
    
    pop ebp
    ret                     ; Don't clean stack - caller does it
```

#### STDCALL Convention  
```assembly
; Standard Call convention (Windows API)
; - Parameters pushed right to left
; - Callee cleans up stack
; - Return value in EAX
; - Same register preservation as CDECL

stdcall_function:
    ; Caller code
    push 30         ; Third parameter
    push 20         ; Second parameter
    push 10         ; First parameter
    call my_function
    ; No stack cleanup needed - callee does it
    
my_function:
    push ebp
    mov ebp, esp
    
    mov eax, [ebp + 8]      ; First parameter
    add eax, [ebp + 12]     ; Second parameter
    add eax, [ebp + 16]     ; Third parameter
    
    pop ebp
    ret 12                  ; Clean 3 parameters (12 bytes)
```

#### FASTCALL Convention
```assembly
; Fast Call convention
; - First two parameters in ECX, EDX
; - Remaining parameters on stack (right to left)
; - Callee cleans up stack
; - Return value in EAX

fastcall_function:
    ; Caller code
    push 40         ; Fourth parameter
    push 30         ; Third parameter
    mov edx, 20     ; Second parameter in EDX
    mov ecx, 10     ; First parameter in ECX
    call my_function
    ; No stack cleanup needed
    
my_function:
    push ebp
    mov ebp, esp
    
    ; ECX = first parameter (10)
    ; EDX = second parameter (20)
    ; [ebp + 8] = third parameter (30)
    ; [ebp + 12] = fourth parameter (40)
    
    add ecx, edx            ; Add first two parameters
    add ecx, [ebp + 8]      ; Add third parameter
    add ecx, [ebp + 12]     ; Add fourth parameter
    mov eax, ecx            ; Return sum in EAX
    
    pop ebp
    ret 8                   ; Clean only stack parameters (2 * 4 bytes)
```

### Recursive Functions

#### Basic Recursion
```assembly
; Factorial function: n! = n * (n-1)!
factorial:
    push ebp
    mov ebp, esp
    
    mov eax, [ebp + 8]      ; Get parameter n
    
    ; Base case: if n <= 1, return 1
    cmp eax, 1
    jle .base_case
    
    ; Recursive case: n * factorial(n-1)
    push eax                ; Save n
    dec eax                 ; n - 1
    push eax                ; Pass n-1 as parameter
    call factorial          ; Recursive call
    add esp, 4              ; Clean stack
    
    pop ecx                 ; Restore n
    mul ecx                 ; EAX = factorial(n-1) * n
    jmp .done
    
.base_case:
    mov eax, 1              ; Return 1
    
.done:
    pop ebp
    ret

; Fibonacci function: fib(n) = fib(n-1) + fib(n-2)
fibonacci:
    push ebp
    mov ebp, esp
    
    mov eax, [ebp + 8]      ; Get parameter n
    
    ; Base cases
    cmp eax, 0
    je .return_zero
    cmp eax, 1
    je .return_one
    
    ; Recursive case: fib(n-1) + fib(n-2)
    push eax                ; Save n
    
    dec eax                 ; n - 1
    push eax
    call fibonacci          ; fib(n-1)
    add esp, 4
    
    pop ecx                 ; Restore n
    push eax                ; Save fib(n-1)
    
    sub ecx, 2              ; n - 2
    push ecx
    call fibonacci          ; fib(n-2)
    add esp, 4
    
    pop ecx                 ; Get fib(n-1)
    add eax, ecx            ; fib(n-1) + fib(n-2)
    jmp .done
    
.return_zero:
    xor eax, eax
    jmp .done
    
.return_one:
    mov eax, 1
    
.done:
    pop ebp
    ret
```

#### Tail Recursion Optimization
```assembly
; Tail recursive factorial with accumulator
; factorial_tail(n, acc) = n == 0 ? acc : factorial_tail(n-1, n*acc)
factorial_tail:
    push ebp
    mov ebp, esp
    
    mov eax, [ebp + 8]      ; Get n
    mov ecx, [ebp + 12]     ; Get accumulator
    
    ; Base case: if n == 0, return accumulator
    test eax, eax
    jz .return_acc
    
    ; Tail recursive case - can be optimized to loop
    mul ecx                 ; n * acc
    dec [ebp + 8]           ; n - 1
    mov [ebp + 12], eax     ; Update accumulator
    
    ; Instead of recursive call, loop back
    jmp factorial_tail      ; Tail call optimization
    
.return_acc:
    mov eax, ecx            ; Return accumulator
    pop ebp
    ret

; Convert tail recursion to iterative loop
factorial_iterative:
    push ebp
    mov ebp, esp
    
    mov eax, [ebp + 8]      ; Get n
    mov ecx, 1              ; Accumulator = 1
    
.loop:
    test eax, eax           ; Check if n == 0
    jz .done
    
    mul ecx                 ; acc = n * acc
    mov ecx, eax            ; Update accumulator
    mov eax, [ebp + 8]      ; Restore n
    dec eax                 ; n = n - 1
    mov [ebp + 8], eax      ; Update n
    jmp .loop
    
.done:
    mov eax, ecx            ; Return accumulator
    pop ebp
    ret
```

## String Operations and Text Processing

### Basic String Operations

#### String Length Calculation
```assembly
; Calculate length of null-terminated string
strlen:
    push edi
    mov edi, [esp + 8]      ; Get string pointer
    xor eax, eax            ; Clear counter
    
.loop:
    cmp byte [edi + eax], 0 ; Check for null terminator
    je .done
    inc eax                 ; Increment counter
    jmp .loop
    
.done:
    pop edi
    ret

; Optimized version using string instructions
strlen_fast:
    push edi
    mov edi, [esp + 8]      ; Get string pointer
    xor eax, eax            ; Search for null (0)
    mov ecx, 0xFFFFFFFF     ; Maximum count
    repne scasb             ; Scan for AL (0) in string
    not ecx                 ; Convert to positive count
    dec ecx                 ; Adjust for null terminator
    mov eax, ecx            ; Return length
    pop edi
    ret

; SIMD-optimized string length (SSE2)
strlen_simd:
    push esi
    mov esi, [esp + 8]      ; Get string pointer
    mov eax, esi
    and eax, 0xF            ; Check alignment
    jz .aligned
    
    ; Handle unaligned start
.unaligned_loop:
    cmp byte [esi], 0
    je .found_end
    inc esi
    test esi, 0xF           ; Check if aligned now
    jnz .unaligned_loop
    
.aligned:
    pxor xmm0, xmm0         ; Clear XMM0 (contains zeros)
    
.simd_loop:
    movdqa xmm1, [esi]      ; Load 16 bytes
    pcmpeqb xmm1, xmm0      ; Compare with zeros
    pmovmskb eax, xmm1      ; Get mask of equal bytes
    test eax, eax           ; Any zeros found?
    jnz .found_zero_in_chunk
    
    add esi, 16             ; Next 16 bytes
    jmp .simd_loop
    
.found_zero_in_chunk:
    bsf eax, eax            ; Find first set bit (zero position)
    add esi, eax            ; Add offset to string start
    
.found_end:
    mov eax, esi
    sub eax, [esp + 8]      ; Calculate length
    pop esi
    ret
```

#### String Copy Operations
```assembly
; Basic string copy
strcpy:
    push esi
    push edi
    
    mov edi, [esp + 12]     ; Destination
    mov esi, [esp + 16]     ; Source
    
.loop:
    lodsb                   ; Load byte from [ESI] to AL, increment ESI
    stosb                   ; Store AL to [EDI], increment EDI
    test al, al             ; Check if null terminator
    jnz .loop
    
    mov eax, [esp + 12]     ; Return destination pointer
    pop edi
    pop esi
    ret

; Safe string copy with length limit
strncpy:
    push esi
    push edi
    push ebx
    
    mov edi, [esp + 16]     ; Destination
    mov esi, [esp + 20]     ; Source
    mov ecx, [esp + 24]     ; Maximum length
    xor ebx, ebx            ; Null found flag
    
.loop:
    test ecx, ecx           ; Check remaining length
    jz .pad_zeros
    
    lodsb                   ; Load source byte
    stosb                   ; Store to destination
    dec ecx
    
    test al, al             ; Check for null
    jz .pad_zeros
    jmp .loop
    
.pad_zeros:
    ; Pad remaining space with zeros
    xor al, al
    rep stosb
    
    mov eax, [esp + 16]     ; Return destination
    pop ebx
    pop edi
    pop esi
    ret

; High-performance string copy using SIMD
strcpy_simd:
    push esi
    push edi
    
    mov edi, [esp + 12]     ; Destination
    mov esi, [esp + 16]     ; Source
    
    ; Check alignment
    mov eax, esi
    or eax, edi
    test eax, 0xF
    jnz .byte_copy          ; Use byte copy if not 16-byte aligned
    
    pxor xmm0, xmm0         ; Zero register for comparison
    
.simd_loop:
    movdqa xmm1, [esi]      ; Load 16 bytes from source
    movdqa [edi], xmm1      ; Store to destination
    
    pcmpeqb xmm1, xmm0      ; Check for null bytes
    pmovmskb eax, xmm1      ; Get mask
    test eax, eax
    jnz .found_null
    
    add esi, 16
    add edi, 16
    jmp .simd_loop
    
.found_null:
    ; Handle the final bytes with null terminator
    sub esi, 16
    sub edi, 16
    
.final_bytes:
    lodsb
    stosb
    test al, al
    jnz .final_bytes
    jmp .done
    
.byte_copy:
    lodsb
    stosb
    test al, al
    jnz .byte_copy
    
.done:
    mov eax, [esp + 12]     ; Return destination
    pop edi
    pop esi
    ret
```

#### String Comparison
```assembly
; Compare two null-terminated strings
strcmp:
    push esi
    push edi
    
    mov esi, [esp + 12]     ; First string
    mov edi, [esp + 16]     ; Second string
    
.loop:
    lodsb                   ; Load byte from first string
    scasb                   ; Compare with byte from second string
    jne .not_equal          ; If not equal, exit
    test al, al             ; Check if end of string
    jnz .loop
    
    ; Strings are equal
    xor eax, eax
    jmp .done
    
.not_equal:
    sbb eax, eax            ; EAX = -1 if first < second
    or eax, 1               ; EAX = 1 if first > second
    
.done:
    pop edi
    pop esi
    ret

; Compare strings with length limit
strncmp:
    push esi
    push edi
    push ecx
    
    mov esi, [esp + 16]     ; First string
    mov edi, [esp + 20]     ; Second string
    mov ecx, [esp + 24]     ; Maximum length
    
    test ecx, ecx           ; Check if length is zero
    jz .equal
    
.loop:
    lodsb                   ; Load from first string
    scasb                   ; Compare with second string
    jne .not_equal
    test al, al             ; Check end of string
    jz .equal
    loop .loop              ; Continue for ECX bytes
    
.equal:
    xor eax, eax
    jmp .done
    
.not_equal:
    sbb eax, eax
    or eax, 1
    
.done:
    pop ecx
    pop edi
    pop esi
    ret

; Case-insensitive string comparison
stricmp:
    push esi
    push edi
    
    mov esi, [esp + 12]     ; First string
    mov edi, [esp + 16]     ; Second string
    
.loop:
    lodsb                   ; Load byte from first string
    mov ah, [edi]           ; Load byte from second string
    inc edi
    
    ; Convert both to lowercase
    call to_lowercase       ; Convert AL to lowercase
    xchg al, ah
    call to_lowercase       ; Convert AH to lowercase
    xchg al, ah
    
    cmp al, ah              ; Compare converted bytes
    jne .not_equal
    test al, al             ; Check end of string
    jnz .loop
    
    xor eax, eax            ; Equal
    jmp .done
    
.not_equal:
    sbb eax, eax
    or eax, 1
    
.done:
    pop edi
    pop esi
    ret

to_lowercase:
    cmp al, 'A'
    jb .done
    cmp al, 'Z'
    ja .done
    add al, 32              ; Convert to lowercase
.done:
    ret
```

### Advanced String Processing

#### String Search and Pattern Matching
```assembly
; Find substring in string (strstr)
strstr:
    push esi
    push edi
    push ebx
    
    mov esi, [esp + 16]     ; Haystack (string to search in)
    mov edi, [esp + 20]     ; Needle (substring to find)
    
    ; Get length of needle
    push edi
    call strlen
    add esp, 4
    mov ebx, eax            ; EBX = needle length
    
    test ebx, ebx           ; Empty needle?
    jz .found               ; Return haystack if needle is empty
    
.search_loop:
    mov al, [esi]           ; Get current haystack character
    test al, al             ; End of haystack?
    jz .not_found
    
    cmp al, [edi]           ; Does it match first needle character?
    jne .next_char
    
    ; Potential match - compare full needle
    push esi                ; Save haystack position
    push edi                ; Save needle start
    mov ecx, ebx            ; Needle length
    
.compare_loop:
    lodsb                   ; Load haystack character
    scasb                   ; Compare with needle character
    jne .no_match
    loop .compare_loop
    
    ; Full match found
    pop edi                 ; Clean stack
    pop eax                 ; Return match position
    jmp .done
    
.no_match:
    pop edi                 ; Restore needle start
    pop esi                 ; Restore haystack position
    
.next_char:
    inc esi                 ; Next haystack character
    jmp .search_loop
    
.not_found:
    xor eax, eax            ; Return NULL
    jmp .done
    
.found:
    mov eax, esi            ; Return haystack start
    
.done:
    pop ebx
    pop edi
    pop esi
    ret

; Boyer-Moore string search algorithm (simplified)
boyer_moore_search:
    push ebp
    mov ebp, esp
    sub esp, 512            ; Space for bad character table
    push esi
    push edi
    push ebx
    
    mov esi, [ebp + 8]      ; Text
    mov edi, [ebp + 12]     ; Pattern
    
    ; Calculate pattern length
    push edi
    call strlen
    add esp, 4
    mov ebx, eax            ; EBX = pattern length
    
    ; Build bad character table
    lea ecx, [ebp - 512]    ; Bad character table
    mov eax, ebx            ; Default skip distance
    mov edx, 256            ; Initialize table
    
.init_table:
    mov [ecx + edx - 1], eax
    dec edx
    jnz .init_table
    
    ; Fill actual character positions
    xor edx, edx            ; Position counter
    
.fill_table:
    cmp edx, ebx
    jge .search_start
    
    movzx eax, byte [edi + edx]  ; Get pattern character
    sub ebx, edx            ; Distance from end
    dec ebx
    mov [ecx + eax], ebx    ; Store skip distance
    add ebx, edx
    inc edx
    jmp .fill_table
    
.search_start:
    mov edx, ebx            ; Start at pattern length offset
    dec edx
    
.search_loop:
    mov al, [esi + edx]     ; Text character
    test al, al             ; End of text?
    jz .not_found
    
    mov ah, [edi + ebx - 1] ; Last pattern character
    cmp al, ah
    jne .skip
    
    ; Potential match - check full pattern backwards
    push edx                ; Save text position
    mov ecx, ebx            ; Pattern length
    
.backward_check:
    dec ecx
    jl .found_match
    
    mov al, [esi + edx]
    cmp al, [edi + ecx]
    jne .no_match_skip
    
    dec edx
    jmp .backward_check
    
.found_match:
    pop edx                 ; Get text position
    inc edx                 ; Adjust for match start
    lea eax, [esi + edx]    ; Return match position
    jmp .done
    
.no_match_skip:
    pop edx                 ; Restore text position
    
.skip:
    movzx eax, byte [esi + edx]  ; Current text character
    lea ecx, [ebp - 512]    ; Bad character table
    add edx, [ecx + eax]    ; Skip using bad character table
    jmp .search_loop
    
.not_found:
    xor eax, eax
    
.done:
    pop ebx
    pop edi
    pop esi
    mov esp, ebp
    pop ebp
    ret
```

#### String Tokenization
```assembly
; Split string by delimiter (strtok)
strtok:
    push esi
    push edi
    push ebx
    
    mov esi, [esp + 16]     ; String to tokenize (or NULL for continue)
    mov edi, [esp + 20]     ; Delimiter characters
    
    ; Use static variable for continued tokenization
    test esi, esi
    jnz .new_string
    mov esi, [strtok_ptr]   ; Continue from saved position
    test esi, esi
    jz .no_more_tokens
    
.new_string:
    ; Skip leading delimiters
.skip_delimiters:
    lodsb                   ; Load character
    test al, al             ; End of string?
    jz .no_more_tokens
    
    push esi                ; Save position
    push eax                ; Save character
    mov ebx, edi            ; Delimiter string
    
.check_delimiter:
    mov ah, [ebx]           ; Load delimiter
    test ah, ah             ; End of delimiter string?
    jz .not_delimiter
    
    cmp al, ah              ; Is current char a delimiter?
    je .is_delimiter
    
    inc ebx
    jmp .check_delimiter
    
.is_delimiter:
    pop eax                 ; Clean stack
    pop esi                 ; Restore position
    jmp .skip_delimiters    ; Continue skipping
    
.not_delimiter:
    pop eax                 ; Restore character
    pop esi                 ; Restore position
    dec esi                 ; Back to token start
    
    ; Found token start
    mov eax, esi            ; Save token start
    
    ; Find token end
.find_token_end:
    lodsb                   ; Load character
    test al, al             ; End of string?
    jz .end_of_string
    
    push esi                ; Save position
    push eax                ; Save character
    mov ebx, edi            ; Delimiter string
    
.check_end_delimiter:
    mov ah, [ebx]           ; Load delimiter
    test ah, ah             ; End of delimiter string?
    jz .not_end_delimiter
    
    cmp al, ah              ; Is current char a delimiter?
    je .found_delimiter
    
    inc ebx
    jmp .check_end_delimiter
    
.found_delimiter:
    pop eax                 ; Clean stack
    pop esi                 ; Restore position
    mov byte [esi - 1], 0   ; Null-terminate token
    mov [strtok_ptr], esi   ; Save position for next call
    jmp .return_token
    
.not_end_delimiter:
    pop eax                 ; Restore character
    pop esi                 ; Restore position
    jmp .find_token_end     ; Continue searching
    
.end_of_string:
    mov dword [strtok_ptr], 0  ; No more tokens
    
.return_token:
    ; EAX already contains token start
    jmp .done
    
.no_more_tokens:
    xor eax, eax            ; Return NULL
    
.done:
    pop ebx
    pop edi
    pop esi
    ret

section '.bss'
strtok_ptr dd ?             ; Static pointer for continued tokenization
```

#### String Formatting and Conversion
```assembly
; Convert integer to string
itoa:
    push ebp
    mov ebp, esp
    push esi
    push edi
    push ebx
    
    mov eax, [ebp + 8]      ; Integer value
    mov edi, [ebp + 12]     ; Buffer
    mov ebx, [ebp + 16]     ; Base (2, 8, 10, 16)
    
    test eax, eax           ; Check sign
    jns .positive
    
    ; Handle negative numbers (only for base 10)
    cmp ebx, 10
    jne .positive
    
    mov byte [edi], '-'     ; Add minus sign
    inc edi
    neg eax                 ; Make positive
    
.positive:
    ; Convert digits in reverse order
    mov esi, edi            ; Save buffer start
    
.convert_loop:
    xor edx, edx            ; Clear remainder
    div ebx                 ; EAX = quotient, EDX = remainder
    
    ; Convert remainder to character
    cmp edx, 9
    jle .decimal_digit
    
    ; Hexadecimal digit A-F
    add edx, 'A' - 10
    jmp .store_digit
    
.decimal_digit:
    add edx, '0'
    
.store_digit:
    mov [edi], dl           ; Store digit
    inc edi
    
    test eax, eax           ; More digits?
    jnz .convert_loop
    
    ; Null terminate
    mov byte [edi], 0
    
    ; Reverse the string (excluding sign)
    dec edi                 ; Point to last digit
    
.reverse_loop:
    cmp esi, edi            ; Pointers crossed?
    jge .done
    
    mov al, [esi]           ; Swap characters
    mov ah, [edi]
    mov [esi], ah
    mov [edi], al
    
    inc esi
    dec edi
    jmp .reverse_loop
    
.done:
    mov eax, [ebp + 12]     ; Return buffer pointer
    pop ebx
    pop edi
    pop esi
    pop ebp
    ret

; Convert string to integer
atoi:
    push esi
    push ebx
    
    mov esi, [esp + 12]     ; String pointer
    xor eax, eax            ; Result
    xor ebx, ebx            ; Sign flag
    
    ; Skip whitespace
.skip_whitespace:
    lodsb
    cmp al, ' '
    je .skip_whitespace
    cmp al, 9               ; Tab
    je .skip_whitespace
    cmp al, 10              ; LF
    je .skip_whitespace
    cmp al, 13              ; CR
    je .skip_whitespace
    
    ; Check for sign
    cmp al, '-'
    jne .check_plus
    mov ebx, 1              ; Negative
    lodsb
    jmp .convert_digits
    
.check_plus:
    cmp al, '+'
    jne .convert_digits
    lodsb
    
.convert_digits:
    ; Convert digits
    cmp al, '0'
    jb .done
    cmp al, '9'
    ja .done
    
    sub al, '0'             ; Convert to digit
    imul eax, 10            ; Multiply result by 10
    movzx ecx, al           ; Add new digit
    add eax, ecx
    
    lodsb                   ; Next character
    jmp .convert_digits
    
.done:
    test ebx, ebx           ; Check sign
    jz .positive
    neg eax                 ; Make negative
    
.positive:
    pop ebx
    pop esi
    ret

; Simple sprintf implementation
sprintf:
    push ebp
    mov ebp, esp
    push esi
    push edi
    push ebx
    
    mov edi, [ebp + 8]      ; Output buffer
    mov esi, [ebp + 12]     ; Format string
    lea ebx, [ebp + 16]     ; Arguments
    
.format_loop:
    lodsb                   ; Get format character
    test al, al             ; End of format?
    jz .done
    
    cmp al, '%'             ; Format specifier?
    jne .regular_char
    
    ; Handle format specifier
    lodsb                   ; Get specifier type
    
    cmp al, 'd'             ; Decimal integer
    je .format_decimal
    cmp al, 'x'             ; Hexadecimal
    je .format_hex
    cmp al, 's'             ; String
    je .format_string
    cmp al, 'c'             ; Character
    je .format_char
    cmp al, '%'             ; Literal %
    je .regular_char
    
    ; Unknown specifier - just output it
    jmp .regular_char
    
.format_decimal:
    mov eax, [ebx]          ; Get argument
    add ebx, 4              ; Next argument
    
    push 10                 ; Base 10
    push edi                ; Buffer
    push eax                ; Value
    call itoa
    add esp, 12
    
    ; Find end of converted string
    call strlen
    add edi, eax
    jmp .format_loop
    
.format_hex:
    mov eax, [ebx]          ; Get argument
    add ebx, 4              ; Next argument
    
    push 16                 ; Base 16
    push edi                ; Buffer
    push eax                ; Value
    call itoa
    add esp, 12
    
    call strlen
    add edi, eax
    jmp .format_loop
    
.format_string:
    mov ecx, [ebx]          ; Get string pointer
    add ebx, 4              ; Next argument
    
.copy_string:
    mov al, [ecx]           ; Get string character
    test al, al             ; End of string?
    jz .format_loop
    
    stosb                   ; Store character
    inc ecx
    jmp .copy_string
    
.format_char:
    mov eax, [ebx]          ; Get character argument
    add ebx, 4              ; Next argument
    stosb                   ; Store character
    jmp .format_loop
    
.regular_char:
    stosb                   ; Store regular character
    jmp .format_loop
    
.done:
    mov al, 0               ; Null terminate
    stosb
    
    mov eax, [ebp + 8]      ; Return buffer pointer
    pop ebx
    pop edi
    pop esi
    pop ebp
    ret
```

## Graphics Programming in Assembly

### VGA Graphics Programming

#### VGA Mode Setup and Basic Operations
```assembly
; Set VGA graphics mode 13h (320x200, 256 colors)
set_vga_mode:
    mov ax, 0x13            ; VGA mode 13h
    int 0x10                ; BIOS video interrupt
    ret

; Set text mode
set_text_mode:
    mov ax, 0x03            ; 80x25 text mode
    int 0x10
    ret

; Plot pixel in mode 13h
; Parameters: AL = color, BX = x, CX = y
plot_pixel:
    push es
    push di
    
    mov ax, 0xA000          ; VGA memory segment
    mov es, ax
    
    ; Calculate offset: y * 320 + x
    mov ax, cx              ; Y coordinate
    mov dx, 320
    mul dx                  ; AX = Y * 320
    add ax, bx              ; Add X coordinate
    mov di, ax              ; DI = offset
    
    mov al, [color]         ; Get color
    stosb                   ; Store pixel
    
    pop di
    pop es
    ret

; Draw horizontal line
; Parameters: AL = color, BX = x1, CX = x2, DX = y
draw_hline:
    push es
    push di
    
    cmp bx, cx              ; Ensure x1 <= x2
    jle .ordered
    xchg bx, cx
    
.ordered:
    mov ax, 0xA000
    mov es, ax
    
    ; Calculate starting offset
    mov ax, dx              ; Y coordinate
    mov di, 320
    mul di                  ; AX = Y * 320
    add ax, bx              ; Add X1
    mov di, ax
    
    ; Calculate length
    mov ax, cx
    sub ax, bx
    inc ax                  ; Length = x2 - x1 + 1
    mov cx, ax
    
    mov al, [color]         ; Get color
    rep stosb               ; Fill line
    
    pop di
    pop es
    ret

; Draw vertical line
; Parameters: AL = color, BX = x, CX = y1, DX = y2
draw_vline:
    push es
    push di
    
    cmp cx, dx              ; Ensure y1 <= y2
    jle .ordered
    xchg cx, dx
    
.ordered:
    mov ax, 0xA000
    mov es, ax
    
    ; Calculate starting offset
    mov ax, cx              ; Y1 coordinate
    mov di, 320
    mul di                  ; AX = Y1 * 320
    add ax, bx              ; Add X
    mov di, ax
    
    mov al, [color]         ; Get color
    
.draw_loop:
    mov [es:di], al         ; Plot pixel
    add di, 320             ; Next row
    inc cx                  ; Next Y
    cmp cx, dx              ; Reached Y2?
    jle .draw_loop
    
    pop di
    pop es
    ret
```

#### Advanced Graphics Algorithms
```assembly
; Bresenham's line drawing algorithm
draw_line:
    push ebp
    mov ebp, esp
    push esi
    push edi
    push ebx
    
    ; Parameters: x1, y1, x2, y2, color
    mov eax, [ebp + 8]      ; x1
    mov ebx, [ebp + 12]     ; y1
    mov ecx, [ebp + 16]     ; x2
    mov edx, [ebp + 20]     ; y2
    
    ; Calculate deltas
    mov esi, ecx
    sub esi, eax            ; dx = x2 - x1
    mov edi, edx
    sub edi, ebx            ; dy = y2 - y1
    
    ; Determine step directions
    mov [x_step], 1
    test esi, esi
    jns .dx_positive
    neg esi                 ; Make dx positive
    mov [x_step], -1
    
.dx_positive:
    mov [y_step], 320       ; Step down one row
    test edi, edi
    jns .dy_positive
    neg edi                 ; Make dy positive
    mov [y_step], -320      ; Step up one row
    
.dy_positive:
    ; Choose primary axis
    cmp esi, edi
    jge .x_major
    
    ; Y-major line
    mov [steps], edi        ; Number of steps
    mov ecx, esi            ; Minor axis delta
    shl ecx, 1              ; 2 * dx
    mov [minor_delta], ecx
    
    sub ecx, edi            ; 2 * dx - dy
    mov [error], ecx
    
    mov ecx, esi
    sub ecx, edi
    shl ecx, 1              ; 2 * (dx - dy)
    mov [major_adjust], ecx
    
    jmp .draw_y_major
    
.x_major:
    ; X-major line
    mov [steps], esi        ; Number of steps
    mov ecx, edi            ; Minor axis delta
    shl ecx, 1              ; 2 * dy
    mov [minor_delta], ecx
    
    sub ecx, esi            ; 2 * dy - dx
    mov [error], ecx
    
    mov ecx, edi
    sub ecx, esi
    shl ecx, 1              ; 2 * (dy - dx)
    mov [major_adjust], ecx
    
.draw_x_major:
    ; Calculate initial offset
    mov ecx, ebx            ; Y coordinate
    mov edx, 320
    mul edx                 ; Y * 320
    add eax, [ebp + 8]      ; Add X coordinate
    
    mov esi, 0xA000
    mov es, esi
    mov edi, eax            ; Offset in video memory
    
    mov esi, [steps]        ; Step counter
    mov al, [ebp + 24]      ; Color
    
.x_major_loop:
    mov [es:edi], al        ; Plot pixel
    
    add edi, [x_step]       ; Step in X direction
    
    mov ecx, [error]
    test ecx, ecx
    js .x_major_continue
    
    ; Step in Y direction
    add edi, [y_step]
    add ecx, [major_adjust]
    jmp .x_major_next
    
.x_major_continue:
    add ecx, [minor_delta]
    
.x_major_next:
    mov [error], ecx
    dec esi
    jnz .x_major_loop
    jmp .done
    
.draw_y_major:
    ; Similar to x_major but with axes swapped
    mov ecx, ebx
    mov edx, 320
    mul edx
    add eax, [ebp + 8]
    
    mov esi, 0xA000
    mov es, esi
    mov edi, eax
    
    mov esi, [steps]
    mov al, [ebp + 24]
    
.y_major_loop:
    mov [es:edi], al
    
    add edi, [y_step]
    
    mov ecx, [error]
    test ecx, ecx
    js .y_major_continue
    
    add edi, [x_step]
    add ecx, [major_adjust]
    jmp .y_major_next
    
.y_major_continue:
    add ecx, [minor_delta]
    
.y_major_next:
    mov [error], ecx
    dec esi
    jnz .y_major_loop
    
.done:
    pop ebx
    pop edi
    pop esi
    pop ebp
    ret

section '.bss'
x_step          dd ?
y_step          dd ?
steps           dd ?
minor_delta     dd ?
major_adjust    dd ?
error           dd ?
color           db ?

; Circle drawing using Bresenham's algorithm
draw_circle:
    push ebp
    mov ebp, esp
    push esi
    push edi
    push ebx
    
    ; Parameters: center_x, center_y, radius, color
    mov esi, [ebp + 8]      ; center_x
    mov edi, [ebp + 12]     ; center_y
    mov ebx, [ebp + 16]     ; radius
    
    xor eax, eax            ; x = 0
    mov ecx, ebx            ; y = radius
    
    ; Decision parameter: d = 3 - 2 * radius
    mov edx, 3
    mov ebx, [ebp + 16]     ; radius
    shl ebx, 1              ; 2 * radius
    sub edx, ebx            ; d = 3 - 2 * radius
    
.circle_loop:
    ; Plot 8 symmetric points
    push eax
    push ecx
    push edx
    
    ; (x, y)
    mov ebx, esi
    add ebx, eax            ; center_x + x
    push [ebp + 20]         ; color
    push edi
    add [esp], ecx          ; center_y + y
    push ebx
    call plot_pixel_circle
    
    ; (x, -y)
    mov ebx, esi
    add ebx, eax            ; center_x + x
    push [ebp + 20]         ; color
    push edi
    sub [esp], ecx          ; center_y - y
    push ebx
    call plot_pixel_circle
    
    ; (-x, y)
    mov ebx, esi
    sub ebx, eax            ; center_x - x
    push [ebp + 20]         ; color
    push edi
    add [esp], ecx          ; center_y + y
    push ebx
    call plot_pixel_circle
    
    ; (-x, -y)
    mov ebx, esi
    sub ebx, eax            ; center_x - x
    push [ebp + 20]         ; color
    push edi
    sub [esp], ecx          ; center_y - y
    push ebx
    call plot_pixel_circle
    
    ; (y, x)
    mov ebx, esi
    add ebx, ecx            ; center_x + y
    push [ebp + 20]         ; color
    push edi
    add [esp], eax          ; center_y + x
    push ebx
    call plot_pixel_circle
    
    ; (y, -x)
    mov ebx, esi
    add ebx, ecx            ; center_x + y
    push [ebp + 20]         ; color
    push edi
    sub [esp], eax          ; center_y - x
    push ebx
    call plot_pixel_circle
    
    ; (-y, x)
    mov ebx, esi
    sub ebx, ecx            ; center_x - y
    push [ebp + 20]         ; color
    push edi
    add [esp], eax          ; center_y + x
    push ebx
    call plot_pixel_circle
    
    ; (-y, -x)
    mov ebx, esi
    sub ebx, ecx            ; center_x - y
    push [ebp + 20]         ; color
    push edi
    sub [esp], eax          ; center_y - x
    push ebx
    call plot_pixel_circle
    
    pop edx
    pop ecx
    pop eax
    
    ; Check if x >= y (circle complete)
    cmp eax, ecx
    jge .done
    
    ; Update decision parameter
    test edx, edx
    js .decision_negative
    
    ; d >= 0: d = d + 4 * (x - y) + 10
    dec ecx                 ; y--
    mov ebx, eax
    sub ebx, ecx            ; x - y
    shl ebx, 2              ; 4 * (x - y)
    add edx, ebx
    add edx, 10
    jmp .continue
    
.decision_negative:
    ; d < 0: d = d + 4 * x + 6
    shl eax, 2              ; 4 * x
    add edx, eax
    add edx, 6
    shr eax, 2              ; Restore x
    
.continue:
    inc eax                 ; x++
    jmp .circle_loop
    
.done:
    pop ebx
    pop edi
    pop esi
    pop ebp
    ret

plot_pixel_circle:
    ; Simple pixel plotting with bounds checking
    push ebp
    mov ebp, esp
    
    mov eax, [ebp + 8]      ; x
    mov ebx, [ebp + 12]     ; y
    
    ; Bounds check
    test eax, eax
    js .done
    cmp eax, 320
    jge .done
    test ebx, ebx
    js .done
    cmp ebx, 200
    jge .done
    
    ; Plot pixel (same as plot_pixel but with parameters)
    push es
    push di
    
    mov es, 0xA000
    mov di, bx
    mov dx, 320
    mul dx
    add di, ax
    add di, [ebp + 8]
    
    mov al, [ebp + 16]      ; color
    mov [es:di], al
    
    pop di
    pop es
    
.done:
    pop ebp
    ret 12                  ; Clean 3 parameters
```


## Advanced FASM Programming Techniques

### Macro System and Metaprogramming

#### Basic Macros
```assembly
; Simple macro definition
macro write_string string {
    mov eax, 4          ; sys_write
    mov ebx, 1          ; stdout
    mov ecx, string     ; string address
    mov edx, string#_length ; string length
    int 0x80
}

; Usage
section '.data'
    hello db 'Hello, World!', 10, 0
    hello_length = $ - hello

section '.text'
    write_string hello

; Parameterized macros
macro mov_immediate reg, value {
    if value eq 0
        xor reg, reg    ; Optimize mov reg, 0 to xor reg, reg
    else
        mov reg, value
    end if
}

; Conditional assembly
macro debug_print string {
    if DEBUG eq 1
        push eax
        push ebx
        push ecx
        push edx
        write_string string
        pop edx
        pop ecx
        pop ebx
        pop eax
    end if
}

; Multi-line macros with local labels
macro safe_divide dividend, divisor, result {
    local .no_overflow, .done
    
    mov eax, dividend
    xor edx, edx
    
    cmp divisor, 0
    je .no_overflow
    
    div divisor
    mov result, eax
    jmp .done
    
.no_overflow:
    mov result, 0
    
.done:
}
```

#### Advanced Macro Techniques
```assembly
; Recursive macros
macro repeat_instruction instr, count {
    if count > 0
        instr
        repeat_instruction instr, count-1
    end if
}

; Usage: repeat_instruction nop, 5  ; Generates 5 nop instructions

; Variable argument macros
macro call_with_args proc, [args] {
    common
        ; Push arguments in reverse order
        mov ecx, 0
    forward
        push args
        inc ecx
    common
        call proc
        ; Clean up stack
        lea esp, [esp + ecx * 4]
}

; String processing macros
macro define_string name, value {
    name db value, 0
    name#_length = $ - name - 1
}

; Code generation macros
macro create_accessor struct_name, field_name, field_offset {
    get_#field_name:
        mov eax, [esp + 4]      ; Get structure pointer
        mov eax, [eax + field_offset]
        ret
        
    set_#field_name:
        mov eax, [esp + 4]      ; Get structure pointer
        mov ebx, [esp + 8]      ; Get new value
        mov [eax + field_offset], ebx
        ret
}

; Usage
struc POINT {
    .x dd ?
    .y dd ?
}

create_accessor POINT, x, POINT.x
create_accessor POINT, y, POINT.y
```

### Optimization Techniques

#### Instruction-Level Optimization
```assembly
; Replace expensive operations with cheaper ones
slow_multiply_by_10:
    mov eax, [value]
    mov ebx, 10
    mul ebx         ; Expensive multiplication

fast_multiply_by_10:
    mov eax, [value]
    lea eax, [eax + eax * 4]  ; eax * 5
    shl eax, 1      ; (eax * 5) * 2 = eax * 10

; Division by powers of 2
slow_divide_by_8:
    mov eax, [value]
    mov ebx, 8
    xor edx, edx
    div ebx

fast_divide_by_8:
    mov eax, [value]
    sar eax, 3      ; Arithmetic shift right by 3 (divide by 8)

; Conditional assignment without branches
conditional_max:
    mov eax, [value1]
    mov ebx, [value2]
    cmp eax, ebx
    cmovl eax, ebx  ; eax = max(value1, value2)

; Branchless absolute value
abs_value:
    mov eax, [value]
    mov ebx, eax
    sar ebx, 31     ; Sign extension (all 1s if negative, 0 if positive)
    xor eax, ebx    ; Flip bits if negative
    sub eax, ebx    ; Add 1 if was negative

; Fast modulo for powers of 2
fast_modulo_16:
    mov eax, [value]
    and eax, 15     ; value % 16 (only works for powers of 2)
```

#### Loop Optimization
```assembly
; Loop unrolling
unrolled_copy:
    mov esi, source
    mov edi, destination
    mov ecx, count
    shr ecx, 2      ; Divide by 4
    
.unroll_4:
    mov eax, [esi]
    mov ebx, [esi + 4]
    mov edx, [esi + 8]
    mov ebp, [esi + 12]
    
    mov [edi], eax
    mov [edi + 4], ebx
    mov [edi + 8], edx
    mov [edi + 12], ebp
    
    add esi, 16
    add edi, 16
    loop .unroll_4
    
    ; Handle remaining bytes
    mov ecx, count
    and ecx, 3
    rep movsb

; Software pipelining
pipelined_loop:
    mov esi, array
    mov ecx, count
    
    ; Preload first iteration
    mov eax, [esi]
    
.pipeline:
    ; Process current value
    add eax, 100
    
    ; Load next value (pipeline next iteration)
    mov ebx, [esi + 4]
    
    ; Store result
    mov [esi], eax
    
    ; Move to next iteration
    add esi, 4
    mov eax, ebx    ; Move next value to current
    loop .pipeline

; Vectorized operations using MMX/SSE
vectorized_add:
    mov esi, array1
    mov edi, array2
    mov edx, result_array
    mov ecx, count
    shr ecx, 2      ; Process 4 elements at once
    
.vector_loop:
    movdqu xmm0, [esi]     ; Load 4 32-bit integers
    movdqu xmm1, [edi]     ; Load 4 32-bit integers
    paddd xmm0, xmm1       ; Add corresponding elements
    movdqu [edx], xmm0     ; Store results
    
    add esi, 16
    add edi, 16
    add edx, 16
    loop .vector_loop
```

### Memory Management and Caching

#### Cache-Friendly Programming
```assembly
; Cache-friendly matrix multiplication
matrix_multiply:
    push ebp
    mov ebp, esp
    
    mov esi, [ebp + 8]   ; Matrix A
    mov edi, [ebp + 12]  ; Matrix B
    mov edx, [ebp + 16]  ; Result matrix C
    mov eax, [ebp + 20]  ; Matrix size N
    
    ; Tiled multiplication for better cache performance
    mov ebx, 64          ; Tile size (adjust based on cache size)
    
.tile_i:
    xor ecx, ecx         ; i = 0
    
.tile_j:
    xor ebp, ebp         ; j = 0
    
.tile_k:
    ; Process tile
    push ecx
    push ebp
    push ebx
    call multiply_tile
    add esp, 12
    
    add ebp, ebx         ; j += tile_size
    cmp ebp, eax
    jl .tile_k
    
    add ecx, ebx         ; i += tile_size
    cmp ecx, eax
    jl .tile_j
    
    pop ebp
    ret

; Prefetching for large data sets
prefetch_copy:
    mov esi, source
    mov edi, destination
    mov ecx, size
    
.prefetch_loop:
    ; Prefetch next cache line
    prefetchnta [esi + 64]
    
    ; Copy current cache line
    movdqa xmm0, [esi]
    movdqa xmm1, [esi + 16]
    movdqa xmm2, [esi + 32]
    movdqa xmm3, [esi + 48]
    
    movdqa [edi], xmm0
    movdqa [edi + 16], xmm1
    movdqa [edi + 32], xmm2
    movdqa [edi + 48], xmm3
    
    add esi, 64
    add edi, 64
    sub ecx, 64
    jg .prefetch_loop
```

### Interfacing with C and System Calls

#### Calling C Functions from Assembly
```assembly
; Calling convention compatibility
extern printf, malloc, free

section '.data'
    format_str db 'Value: %d, String: %s', 10, 0
    test_string db 'Hello from ASM!', 0

section '.text'
    ; Allocate memory using C malloc
    push 1024           ; Size
    call malloc
    add esp, 4          ; Clean stack
    
    test eax, eax       ; Check if allocation succeeded
    jz .allocation_failed
    
    ; Use printf to display values
    push test_string    ; String parameter
    push 42             ; Integer parameter
    push format_str     ; Format string
    call printf
    add esp, 12         ; Clean stack (3 parameters)
    
    ; Free allocated memory
    push eax            ; Memory pointer
    call free
    add esp, 4          ; Clean stack
    
.allocation_failed:
    ; Handle allocation failure
    mov eax, -1
    ret

; Mixed C/Assembly project structure
global asm_function     ; Export to C
extern c_function       ; Import from C

asm_function:
    ; Function callable from C
    push ebp
    mov ebp, esp
    
    ; Get parameters (C calling convention)
    mov eax, [ebp + 8]  ; First parameter
    mov ebx, [ebp + 12] ; Second parameter
    
    ; Call C function
    push ebx
    push eax
    call c_function
    add esp, 8
    
    ; Return value in EAX
    pop ebp
    ret
```

#### System Call Interface
```assembly
; Linux system calls
section '.data'
    filename db '/tmp/test.txt', 0
    buffer db 'Hello, World!', 10
    buffer_len = $ - buffer

section '.text'
    ; Open file
    mov eax, 5          ; sys_open
    mov ebx, filename   ; filename
    mov ecx, 0x241      ; O_WRONLY | O_CREAT | O_TRUNC
    mov edx, 0x1A4      ; File permissions (644)
    int 0x80
    
    test eax, eax
    js .error
    
    mov esi, eax        ; Save file descriptor
    
    ; Write to file
    mov eax, 4          ; sys_write
    mov ebx, esi        ; file descriptor
    mov ecx, buffer     ; buffer
    mov edx, buffer_len ; count
    int 0x80
    
    ; Close file
    mov eax, 6          ; sys_close
    mov ebx, esi        ; file descriptor
    int 0x80
    
    ; Exit successfully
    mov eax, 1          ; sys_exit
    xor ebx, ebx        ; exit status 0
    int 0x80

.error:
    mov eax, 1          ; sys_exit
    mov ebx, 1          ; exit status 1
    int 0x80

; Windows API calls
extern ExitProcess, WriteFile, GetStdHandle
import kernel32, ExitProcess, WriteFile, GetStdHandle

section '.data'
    message db 'Hello, Windows!', 13, 10
    message_len = $ - message
    bytes_written dd ?

section '.text'
    ; Get stdout handle
    push -11            ; STD_OUTPUT_HANDLE
    call [GetStdHandle]
    
    ; Write to stdout
    push 0              ; lpOverlapped
    push bytes_written  ; lpNumberOfBytesWritten
    push message_len    ; nNumberOfBytesToWrite
    push message        ; lpBuffer
    push eax            ; hFile (stdout handle)
    call [WriteFile]
    
    ; Exit process
    push 0              ; exit code
    call [ExitProcess]
```

### Real-World Project Examples

#### Complete Application: Text Editor
```assembly
; Simple text editor in FASM
format PE console
entry start

include 'win32a.inc'

section '.data' data readable writeable
    buffer rb 65536         ; Text buffer
    filename rb 260         ; Filename buffer
    console_handle dd ?
    file_handle dd ?
    bytes_read dd ?
    bytes_written dd ?
    
    prompt_open db 'Enter filename to open: ', 0
    prompt_save db 'Enter filename to save: ', 0
    help_text db 'Commands: o=open, s=save, q=quit, h=help', 13, 10, 0
    
section '.text' code readable executable
start:
    ; Get console handles
    invoke GetStdHandle, STD_OUTPUT_HANDLE
    mov [console_handle], eax
    
    ; Display help
    invoke WriteConsole, [console_handle], help_text, \
           sizeof.help_text-1, bytes_written, 0
    
main_loop:
    ; Read command
    invoke ReadConsole, STD_INPUT_HANDLE, buffer, 1, bytes_read, 0
    
    mov al, [buffer]
    cmp al, 'o'
    je open_file
    cmp al, 's'
    je save_file
    cmp al, 'q'
    je exit_program
    cmp al, 'h'
    je show_help
    
    jmp main_loop

open_file:
    ; Prompt for filename
    invoke WriteConsole, [console_handle], prompt_open, \
           sizeof.prompt_open-1, bytes_written, 0
    
    ; Read filename
    invoke ReadConsole, STD_INPUT_HANDLE, filename, 260, bytes_read, 0
    
    ; Remove newline
    mov ecx, [bytes_read]
    dec ecx
    mov byte [filename + ecx], 0
    
    ; Open file
    invoke CreateFile, filename, GENERIC_READ, 0, 0, \
           OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, 0
    
    cmp eax, INVALID_HANDLE_VALUE
    je main_loop
    
    mov [file_handle], eax
    
    ; Read file content
    invoke ReadFile, [file_handle], buffer, 65535, bytes_read, 0
    
    ; Null terminate
    mov ecx, [bytes_read]
    mov byte [buffer + ecx], 0
    
    ; Display content
    invoke WriteConsole, [console_handle], buffer, [bytes_read], bytes_written, 0
    
    invoke CloseHandle, [file_handle]
    jmp main_loop

save_file:
    ; Implementation for save functionality
    ; Similar structure to open_file
    jmp main_loop

show_help:
    invoke WriteConsole, [console_handle], help_text, \
           sizeof.help_text-1, bytes_written, 0
    jmp main_loop

exit_program:
    invoke ExitProcess, 0

section '.idata' import data readable writeable
    library kernel32, 'KERNEL32.DLL'
    import kernel32, \
           CreateFile, 'CreateFileA', \
           ReadFile, 'ReadFile', \
           WriteFile, 'WriteFile', \
           CloseHandle, 'CloseHandle', \
           GetStdHandle, 'GetStdHandle', \
           ReadConsole, 'ReadConsoleA', \
           WriteConsole, 'WriteConsoleA', \
           ExitProcess, 'ExitProcess'
```

## Professional Development Practices

### Code Organization and Documentation
```assembly
; Professional header template
;===============================================================================
; Project:     KolibriOS Network Stack
; Module:      TCP Protocol Implementation
; Version:     2.1.0
; Author:      Professional Developer
; Date:        2024-01-15
; License:     GPL v2
;
; Description: High-performance TCP implementation with congestion control
;              and advanced window scaling.
;
; Dependencies:
;   - IP layer interface
;   - Memory management subsystem
;   - Timer subsystem
;
; Revision History:
;   2.1.0 - Added TCP window scaling
;   2.0.0 - Complete rewrite for performance
;   1.0.0 - Initial implementation
;===============================================================================

; Include guards for header files
if ~ defined TCP_PROTOCOL_INC
TCP_PROTOCOL_INC = 1

; Constants and configuration
TCP_MSS             = 1460      ; Maximum Segment Size
TCP_WINDOW_SIZE     = 65535     ; Default window size
TCP_MAX_RETRIES     = 5         ; Maximum retransmission attempts
TCP_TIMEOUT_INITIAL = 3000      ; Initial RTO in milliseconds

; State definitions
TCP_STATE_CLOSED        = 0
TCP_STATE_LISTEN        = 1
TCP_STATE_SYN_SENT      = 2
TCP_STATE_SYN_RECEIVED  = 3
TCP_STATE_ESTABLISHED   = 4
TCP_STATE_FIN_WAIT_1    = 5
TCP_STATE_FIN_WAIT_2    = 6
TCP_STATE_CLOSE_WAIT    = 7
TCP_STATE_CLOSING       = 8
TCP_STATE_LAST_ACK      = 9
TCP_STATE_TIME_WAIT     = 10

; Function prototypes and documentation
;-------------------------------------------------------------------------------
; tcp_create_socket
;
; Purpose:     Creates a new TCP socket
; Parameters:  None
; Returns:     EAX = Socket handle (0 if error)
; Registers:   Preserves all except EAX
; Notes:       Allocates socket control block and initializes state
;-------------------------------------------------------------------------------
tcp_create_socket:
    ; Implementation here
    ret

end if ; TCP_PROTOCOL_INC
```

### Testing and Quality Assurance
```assembly
; Unit testing framework for assembly
section '.data'
    test_count dd 0
    passed_count dd 0
    failed_count dd 0
    
    test_msg_start db 'Running test: ', 0
    test_msg_pass db ' [PASS]', 13, 10, 0
    test_msg_fail db ' [FAIL]', 13, 10, 0
    summary_msg db 'Tests: %d, Passed: %d, Failed: %d', 13, 10, 0

; Test framework macros
macro run_test test_name, test_proc {
    push test_name
    call print_test_start
    
    call test_proc
    test eax, eax
    jz .test_failed
    
    call print_test_pass
    inc [passed_count]
    jmp .test_done
    
.test_failed:
    call print_test_fail
    inc [failed_count]
    
.test_done:
    inc [test_count]
}

macro assert_equal actual, expected {
    local .assert_ok
    
    cmp actual, expected
    je .assert_ok
    
    ; Test failed
    xor eax, eax
    ret
    
.assert_ok:
}

; Example tests
test_string_length:
    ; Test string length function
    push test_string
    call strlen
    add esp, 4
    
    assert_equal eax, 13    ; Expected length
    
    mov eax, 1              ; Test passed
    ret

test_memory_copy:
    ; Test memory copy function
    push 10                 ; Count
    push dest_buffer        ; Destination
    push src_buffer         ; Source
    call memcpy
    add esp, 12
    
    ; Verify copy
    push 10
    push dest_buffer
    push src_buffer
    call memcmp
    add esp, 12
    
    assert_equal eax, 0     ; Should be equal
    
    mov eax, 1
    ret

; Test runner
run_all_tests:
    run_test test_str_len, test_string_length
    run_test test_mem_copy, test_memory_copy
    
    ; Print summary
    push [failed_count]
    push [passed_count]
    push [test_count]
    push summary_msg
    call printf
    add esp, 16
    
    ret

section '.data'
    test_str_len db 'String Length', 0
    test_mem_copy db 'Memory Copy', 0
    test_string db 'Hello, World!', 0
    src_buffer db 1,2,3,4,5,6,7,8,9,10
    dest_buffer db 10 dup(0)
```

This completes the comprehensive FASM guide covering all essential topics from basic syntax to professional development practices. The documentation now provides complete coverage for developers wanting to master assembly programming with FASM for KolibriOS development.

