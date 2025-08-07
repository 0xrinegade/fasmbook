# Chapter 4: The Instruction Cookbook
*Your Processor's Recipe Book*

## Introduction: Every Instruction Tells a Story

In the culinary world, a master chef doesn't just know recipes—they understand the chemistry behind cooking, the interaction of ingredients, and how different techniques achieve different results. Similarly, mastering assembly programming requires understanding not just what instructions do, but why they exist, how they interact, and when to use each one for maximum effect.

The x86/x64 instruction set is like a vast cookbook, containing hundreds of recipes for computational tasks. Some instructions are everyday staples you'll use constantly, others are specialized tools for specific situations, and a few are exotic techniques that can work miracles in the right hands.

In this chapter, we'll explore the instruction set not as a dry reference, but as a living collection of computational tools. You'll learn to think like the processor itself, understanding how instructions are encoded, executed, and optimized. By the end of this chapter, you'll have the knowledge to choose the perfect instruction for any task and combine instructions into efficient algorithms.

## Building Complex Operations from Simple Commands

### The Art of Instruction Selection

Every complex operation your program performs is built from simple, atomic instructions. The art lies in choosing the right combination of instructions to achieve your goal efficiently. Let's start with a practical example: implementing a function to find the maximum value in an array.

**The Naive Approach:**
```assembly
find_max_simple:
    ; Find maximum value in array
    ; ESI = array pointer, ECX = element count
    ; Returns maximum in EAX
    
    mov eax, [esi]                 ; Assume first element is max
    add esi, 4                     ; Point to second element
    dec ecx                        ; One less element to check
    
max_loop:
    cmp [esi], eax                 ; Compare current with max
    jle not_greater                ; Jump if current <= max
    mov eax, [esi]                 ; New maximum found
not_greater:
    add esi, 4                     ; Move to next element
    loop max_loop                  ; Continue until ECX = 0

## ▣ Comprehensive Instruction Reference: LOOP

> **🚩 Iteration Control**: LOOP provides compact loop control by combining decrement and conditional jump in a single instruction.

### Historical Context and Evolution 📜

The LOOP instruction was designed to simplify the common pattern of counted loops, combining ECX decrement with a conditional jump. It represents early processor designers' attempt to provide high-level programming constructs in hardware.

**Design Philosophy:**
LOOP encapsulates the pattern: `dec ecx; jnz target` into a single instruction, making loop code more compact and readable.

**Historical Development:**
- **1978**: Introduced in 8086 with 16-bit CX register
- **1985**: Extended to 32-bit ECX register in 80386
- **Modern Era**: Performance characteristics changed with advanced pipelines

### Complete Instruction Theory and Specification

**LOOP** decrements ECX (or CX in 16-bit mode) and jumps to the target address if the result is not zero.

**Fundamental Operation:**
```
ECX ← ECX - 1
if (ECX ≠ 0) then
    EIP ← EIP + signed_displacement
else
    Continue to next instruction
```

**Equivalent Code Sequence:**
```assembly
; LOOP target is equivalent to:
dec ecx
jnz target
```

### Complete Syntax Reference and Variants

**Basic LOOP Instructions:**
```assembly
loop target             ; E2 xx - Loop while ECX ≠ 0
loopz target            ; E1 xx - Loop while ECX ≠ 0 AND ZF = 1  
loope target            ; E1 xx - Same as LOOPZ (alternative mnemonic)
loopnz target           ; E0 xx - Loop while ECX ≠ 0 AND ZF = 0
loopne target           ; E0 xx - Same as LOOPNZ (alternative mnemonic)
```

**Addressing Mode Variants:**
```assembly
; 16-bit mode (uses CX register):
loop target             ; Decrements CX instead of ECX

; 32-bit mode (default):
loop target             ; Decrements ECX

; 64-bit mode:
loop target             ; Decrements ECX (not RCX!) - historical compatibility
```

**Extended LOOP Instructions:**
```assembly
; LOOPZ/LOOPE - Loop while zero flag is set
loopz equal_loop        ; Continue while ECX ≠ 0 AND last operation resulted in zero
loope equal_loop        ; Identical to LOOPZ - alternative spelling

; LOOPNZ/LOOPNE - Loop while zero flag is clear  
loopnz not_equal_loop   ; Continue while ECX ≠ 0 AND last operation was non-zero
loopne not_equal_loop   ; Identical to LOOPNZ - alternative spelling
```

### Performance Characteristics and Modern Considerations

**Performance Trade-offs:**
```assembly
; Traditional LOOP instruction:
mov ecx, 1000
loop_start:
    ; ... loop body ...
    loop loop_start     ; 2 bytes, but may be slower on modern CPUs

; Modern equivalent (often faster):
mov ecx, 1000
loop_start:
    ; ... loop body ...
    dec ecx             ; 1 byte (or 2 if memory)
    jnz loop_start      ; 2 bytes
; Total: 3 bytes vs 2 bytes, but better performance on many modern CPUs
```

**Why Modern CPUs May Prefer DEC/JNZ:**
1. **Micro-op Fusion**: Many CPUs can fuse DEC+JNZ into single micro-operation
2. **Branch Prediction**: JNZ has better branch prediction than LOOP on some CPUs
3. **Pipeline Optimization**: Separate instructions may fit better in pipeline

### Advanced LOOP Patterns and Use Cases

**Basic Counted Loop:**
```assembly
; Process array with LOOP
mov esi, array_start
mov ecx, array_length

process_loop:
    mov eax, [esi]      ; Load element
    ; ... process element ...
    add esi, 4          ; Next element
    loop process_loop   ; Continue for all elements
```

**Search Loop with Early Exit (LOOPNZ):**
```assembly
; Search for zero value in array
mov esi, array_start
mov ecx, array_length

search_loop:
    cmp dword [esi], 0  ; Check for zero
    ; ZF is set if [esi] == 0, clear if [esi] ≠ 0
    lea esi, [esi + 4]  ; Next element (doesn't affect flags)
    loopnz search_loop  ; Continue while ECX ≠ 0 AND ZF = 0 (not found)
    
; Exit conditions:
; ECX = 0: Reached end without finding zero
; ZF = 1: Found zero value
jz found_zero           ; Jump if zero was found
; Otherwise fell through - zero not found
```

**String Comparison with LOOPZ:**
```assembly
; Compare two strings character by character
mov esi, string1
mov edi, string2
mov ecx, max_length

compare_loop:
    mov al, [esi]       ; Load char from string1
    cmp al, [edi]       ; Compare with string2
    jne strings_differ  ; Exit immediately if different
    test al, al         ; Check for null terminator
    jz strings_equal    ; Both strings ended with same content
    inc esi             ; Next char in string1
    inc edi             ; Next char in string2
    loopz compare_loop  ; Continue while ECX ≠ 0 AND ZF = 1 (equal)
    
; ECX reached 0 but characters still equal
strings_equal:
    ; Strings are equal
    ret
    
strings_differ:
    ; Strings differ
    ret
```

### Optimization Considerations and Best Practices

**When to Use LOOP:**
```assembly
; Good use case - simple counting where code size matters:
mov ecx, delay_count
delay_loop:
    nop                 ; Simple delay
    loop delay_loop     ; Compact representation

; Good use case - legacy code compatibility:
; LOOP maintains exact semantics across all x86 processors
```

**When to Avoid LOOP:**
```assembly
; Avoid for performance-critical loops:
; Modern alternative:
mov ecx, 1000
fast_loop:
    ; ... loop body ...
    dec ecx
    jnz fast_loop       ; Often faster than LOOP

; Avoid when you need the counter value after loop:
mov ecx, 1000
loop_start:
    ; ... loop body ...
    loop loop_start
; ECX is now 0 - original count is lost

; Better:
mov ecx, 1000
mov edx, ecx            ; Preserve original count
loop_start:
    ; ... loop body ...
    dec ecx
    jnz loop_start
; EDX still contains original count
```

### Advanced Loop Patterns

**Nested Loops with Multiple Counters:**
```assembly
; Process 2D array using nested loops
mov ebx, rows           ; Outer loop counter
outer_loop:
    push ebx            ; Save outer counter
    mov ecx, columns    ; Inner loop counter
    inner_loop:
        ; ... process array[row][column] ...
        loop inner_loop ; Inner loop
    pop ebx             ; Restore outer counter
    dec ebx
    jnz outer_loop      ; Outer loop
```

**Loop Unrolling with LOOP:**
```assembly
; Unrolled loop for better performance
mov ecx, array_length
shr ecx, 2              ; Divide by 4 (process 4 elements per iteration)

## ▣ Comprehensive Instruction Reference: SHR

> **🚩 Bit Shifting Master**: SHR (Shift Right) performs logical right shifts, effectively dividing by powers of 2 and manipulating bit patterns.

### Historical Context and Evolution 📜

Shift operations are among the most fundamental bit manipulations in computing, directly reflecting the binary nature of digital systems. SHR implements logical right shift, where zeros are shifted in from the left.

**Mathematical Foundation:**
Logical right shift by N positions is equivalent to unsigned division by 2^N:
- SHR by 1 = divide by 2
- SHR by 2 = divide by 4  
- SHR by 3 = divide by 8
- SHR by N = divide by 2^N

**Historical Development:**
- **1972**: Basic shift operations in Intel 8008
- **1978**: Enhanced with variable shift counts in 8086
- **1985**: 32-bit shift operations in 80386
- **1993**: Optimized shifters in Pentium
- **Modern**: Shift operations execute in 1 cycle on most modern CPUs

### Complete Instruction Theory and Specification

**SHR** shifts all bits in the destination operand to the right by the specified count, filling vacant positions with zeros.

**Fundamental Operation:**
```
For each bit position:
Destination[i] ← Destination[i + shift_count]
Vacant positions ← 0
```

**Bit Movement Visualization:**
```
Original: 1101 1010 (218 decimal)
SHR 1:    0110 1101 (109 decimal)
SHR 2:    0011 0110 (54 decimal)  
SHR 3:    0001 1011 (27 decimal)
```

### Complete Syntax Reference and API

**Immediate Shift Counts:**
```assembly
; Shift by immediate value (1-31 in 32-bit mode)
shr eax, 1              ; D1 E8 - Shift EAX right by 1 bit
shr ebx, 4              ; C1 EB 04 - Shift EBX right by 4 bits
shr ecx, 16             ; C1 E9 10 - Shift ECX right by 16 bits

; Memory operands with immediate counts
shr dword [esi], 2      ; C1 2E 02 - Shift memory location right by 2
shr byte [edi], 3       ; C0 2F 03 - Shift memory byte right by 3
shr word [ebx], 8       ; 66 C1 2B 08 - Shift memory word right by 8
```

**Variable Shift Counts (using CL register):**
```assembly
; Shift count in CL register (0-31 meaningful values)
mov cl, 5
shr eax, cl             ; D3 E8 - Shift EAX right by CL bits

mov cl, shift_amount
shr ebx, cl             ; Shift EBX by variable amount
shr dword [esi], cl     ; D3 2E - Shift memory by CL bits
```

**Size Variants:**
```assembly
; 8-bit shifts
shr al, 3               ; C0 E8 03 - Shift AL right by 3 bits
shr bl, cl              ; D2 EB - Shift BL right by CL bits

; 16-bit shifts  
shr ax, 8               ; 66 C1 E8 08 - Shift AX right by 8 bits
shr dx, cl              ; 66 D3 EA - Shift DX right by CL bits

; 32-bit shifts (default in 32-bit mode)
shr eax, 12             ; C1 E8 0C - Shift EAX right by 12 bits
shr edx, cl             ; D3 EA - Shift EDX right by CL bits

; 64-bit shifts (x64 mode)
shr rax, 20             ; 48 C1 E8 14 - Shift RAX right by 20 bits
shr rdx, cl             ; 48 D3 EA - Shift RDX right by CL bits
```

### Flag Updates and Behavior

**Flag Effects:**
- **CF**: Receives the last bit shifted out
- **ZF**: Set if result is zero
- **SF**: Set if result's most significant bit is 1
- **PF**: Set if result's low byte has even parity
- **OF**: Set if shift count is 1 and MSB changed (single-bit shifts only)
- **AF**: Undefined

**Carry Flag Examples:**
```assembly
mov eax, 0x12345678     ; Binary: ...0001 0010 0011 0100 0101 0110 0111 1000
shr eax, 1              ; Result: ...0000 1001 0001 1010 0010 1011 0011 1100
                       ; CF = 0 (bit that was shifted out)

mov eax, 0x12345679     ; Binary: ...0001 0010 0011 0100 0101 0110 0111 1001  
shr eax, 1              ; Result: ...0000 1001 0001 1010 0010 1011 0011 1100
                       ; CF = 1 (bit that was shifted out)
```

### Arithmetic Applications and Optimizations

**Fast Division by Powers of 2:**
```assembly
; Traditional division (slow):
mov eax, dividend
mov ebx, 8
xor edx, edx            ; Clear remainder
div ebx                 ; 20-30 cycles

; Optimized division using SHR (fast):
mov eax, dividend
shr eax, 3              ; 1 cycle (8 = 2³, so shift right 3 bits)
```

**Rounding Behavior Differences:**
```assembly
; Unsigned division with SHR always rounds down (truncates):
mov eax, 7              ; 7 ÷ 2 = 3.5
shr eax, 1              ; Result: 3 (rounds down)

mov eax, 9              ; 9 ÷ 4 = 2.25  
shr eax, 2              ; Result: 2 (rounds down)

; This works correctly for unsigned numbers
; For signed numbers, use SAR (Shift Arithmetic Right) instead
```

**Extract Bit Fields:**
```assembly
; Extract bits 8-15 from a 32-bit value
mov eax, source_value
shr eax, 8              ; Shift bits 8-15 to positions 0-7
and eax, 0xFF           ; Mask to keep only low 8 bits

; Extract upper 16 bits
mov eax, source_value
shr eax, 16             ; Shift upper 16 bits to lower positions

; Extract specific bit ranges for packed data
mov eax, rgb_color      ; Format: 0x00RRGGBB
mov ebx, eax            ; Copy for red extraction
shr ebx, 16             ; Extract red component (bits 16-23)
and ebx, 0xFF           ; Mask to 8 bits

mov ecx, eax            ; Copy for green extraction  
shr ecx, 8              ; Extract green component (bits 8-15)
and ecx, 0xFF           ; Mask to 8 bits

and eax, 0xFF           ; Blue component (bits 0-7) - no shift needed
```

### Advanced Bit Manipulation Patterns

**Creating Bit Masks:**
```assembly
; Create mask with N bits set
mov eax, 0xFFFFFFFF
mov cl, bit_count
shr eax, cl             ; Shift out unwanted bits
; EAX now contains mask with (32 - bit_count) bits set

; Example: Create mask with 24 bits set
mov eax, 0xFFFFFFFF     ; All 32 bits set
shr eax, 8              ; Shift out 8 bits
; Result: 0x00FFFFFF (24 bits set)
```

**Bit Reversal (using shifts):**
```assembly
; Reverse bits in a byte using shifts
mov al, input_byte      ; Input: 1101 0011
mov bl, 0               ; Output accumulator

mov cl, 8               ; Bit counter
reverse_loop:
    shr al, 1           ; Shift input right, bit goes to CF
    rcl bl, 1           ; Rotate output left, including CF
    dec cl
    jnz reverse_loop
; BL now contains reversed bits: 1100 1011
```

**Efficient Multiplication/Division by 10:**
```assembly
; Multiply by 10 using shifts and addition
; 10 = 8 + 2 = 2³ + 2¹
mov eax, input_value
mov ebx, eax            ; Save original
shl eax, 3              ; Multiply by 8
shl ebx, 1              ; Multiply by 2  
add eax, ebx            ; 8x + 2x = 10x

; Divide by 10 approximation using shifts
; 1/10 ≈ 0.1 ≈ 26/256 = 26 * 2^(-8)
mov eax, input_value
imul eax, 26            ; Multiply by 26
shr eax, 8              ; Divide by 256
; Result is approximate division by 10 (with rounding error)
```

### Performance Characteristics and Optimization

**Execution Speed:**
```assembly
shr eax, 1              ; 1 cycle latency, 0.5 cycles throughput
shr eax, 5              ; 1 cycle latency, 0.5 cycles throughput
; Shift count doesn't affect speed on modern CPUs

; Variable shifts (slightly slower on some older CPUs):
shr eax, cl             ; 1-2 cycles (depends on microarchitecture)
```

**Optimization Opportunities:**
```assembly
; Chain multiple operations efficiently:
shr eax, 8              ; Extract upper bits
and eax, 0xFF           ; Mask to byte
; Can often be optimized to:
mov al, ah              ; Move AH to AL (equivalent to SHR 8 + mask)
xor ah, ah              ; Clear upper bits

; Use LEA for complex address calculations involving shifts:
; Instead of:
mov eax, index
shl eax, 2              ; Multiply by 4  
add eax, base_address   ; Add base

; Use:
lea eax, [base_address + index*4]  ; Single instruction
```

### Integration with SIMD and Modern Instructions

**Vector Shifts:**
```assembly
; SSE2 packed shifts (operate on multiple values simultaneously)
psrld xmm0, 4           ; Shift 4 32-bit values right by 4 bits
psrlq xmm1, 8           ; Shift 2 64-bit values right by 8 bits
psrlw xmm2, 2           ; Shift 8 16-bit values right by 2 bits

; AVX packed shifts (256-bit vectors)
vpsrld ymm0, ymm1, 3    ; Shift 8 32-bit values right by 3 bits
```

**Funnel Shifts (newer CPUs):**
```assembly
; SHRD - Shift Right Double (shift between two registers)
shrd eax, ebx, 4        ; Shift EAX right 4 bits, filling with bits from EBX
; Useful for multi-precision arithmetic and bit field extraction
```

---
jz handle_remainder     ; Handle case where length < 4

unrolled_loop:
    ; Process 4 elements per iteration
    mov eax, [esi]      ; Element 0
    add eax, [esi + 4]  ; Element 1
    add eax, [esi + 8]  ; Element 2
    add eax, [esi + 12] ; Element 3
    add esi, 16         ; Advance by 4 elements
    loop unrolled_loop

handle_remainder:
    ; Handle remaining 0-3 elements
    mov ecx, array_length
    and ecx, 3          ; Get remainder (length % 4)
    jz done
    
remainder_loop:
    add eax, [esi]
    add esi, 4
    loop remainder_loop
    
done:
```

### Integration with Modern Programming

**Compiler Usage:**
Modern compilers rarely generate LOOP instructions, preferring the DEC/JNZ pattern for better optimization opportunities.

**Hand-Optimized Assembly:**
```assembly
; When writing assembly by hand, consider your priorities:

; Minimize code size:
loop target             ; Use LOOP

; Maximize performance:
dec ecx
jnz target              ; Use separate instructions

; Balance both:
; Profile your specific use case on target hardware
```

---
    ret
```

This approach works, but it's not optimal. Let's see how we can improve it using advanced instruction selection:

**The Optimized Approach:**
```assembly
find_max_optimized:
    ; Optimized maximum finder using conditional moves
    ; ESI = array pointer, ECX = element count
    ; Returns maximum in EAX
    
    mov eax, [esi]                 ; Load first element
    add esi, 4                     ; Advance pointer
    dec ecx                        ; Decrement counter
    jz max_done                    ; Handle single element case
    
max_loop_opt:
    mov edx, [esi]                 ; Load current element
    cmp edx, eax                   ; Compare with current max
    cmovg eax, edx                 ; Conditionally move if greater
    add esi, 4                     ; Advance pointer
    loop max_loop_opt              ; Continue
    
max_done:
    ret
```

The key improvement here is the use of `CMOVG` (conditional move if greater). This eliminates the branch, making the code faster and more pipeline-friendly.

**The Vectorized Approach:**
```assembly
find_max_vectorized:
    ; SIMD-optimized maximum finder
    ; ESI = array pointer (16-byte aligned), ECX = element count (multiple of 4)
    ; Returns maximum in EAX
    
    movdqa xmm0, [esi]            ; Load first 4 elements
    add esi, 16                   ; Advance pointer
    sub ecx, 4                    ; Processed 4 elements
    
max_simd_loop:
    test ecx, ecx                 ; Check if more elements
    jz extract_max                ; Exit if done
    
    movdqa xmm1, [esi]            ; Load next 4 elements
    pmaxsd xmm0, xmm1             ; Parallel maximum of 4 integers
    add esi, 16                   ; Advance pointer
    sub ecx, 4                    ; Update counter
    jmp max_simd_loop
    
extract_max:
    ; Extract maximum from XMM0
    movdqa xmm1, xmm0
    psrldq xmm1, 8                ; Shift right 8 bytes
    pmaxsd xmm0, xmm1             ; Max of first and second half
    
    movdqa xmm1, xmm0
    psrldq xmm1, 4                ; Shift right 4 bytes
    pmaxsd xmm0, xmm1             ; Max of remaining elements
    
    movd eax, xmm0                ; Extract final result
    ret
```

This SIMD version processes 4 elements simultaneously, dramatically improving performance for large arrays.

### Arithmetic Instructions: Beyond Basic Math

Assembly arithmetic goes far beyond simple addition and subtraction. Modern processors provide sophisticated mathematical operations that can replace complex algorithms.

```assembly
format PE console
entry start

include 'win32a.inc'

section '.data' data readable writeable
    ; Test data for arithmetic demonstrations
    dividend        dd 1000000
    divisor         dd 7
    base_number     dd 123456
    power           dd 5
    angle           dd 45          ; Degrees
    coefficient_a   dd 2
    coefficient_b   dd -5
    coefficient_c   dd 3
    
    ; Results
    quotient        dd 0
    remainder       dd 0
    power_result    dd 0
    sqrt_result     dd 0
    sine_result     dd 0
    quadratic_roots dd 2 dup(0)
    
section '.code' code readable executable

start:
    ; Demonstrate advanced arithmetic techniques
    
    ; 1. Efficient division and modulo
    call demo_division_tricks
    
    ; 2. Integer exponentiation
    call demo_power_calculation
    
    ; 3. Square root calculation
    call demo_sqrt_calculation
    
    ; 4. Trigonometric functions
    call demo_trigonometry
    
    ; 5. Quadratic equation solver
    call demo_quadratic_solver
    
    ; 6. Bit manipulation arithmetic
    call demo_bit_arithmetic
    
    invoke ExitProcess, 0

demo_division_tricks:
    ; Multiple techniques for division
    
    ; Standard division
    mov eax, [dividend]
    xor edx, edx                   ; Clear high part
    div dword [divisor]            ; EAX = quotient, EDX = remainder
    mov [quotient], eax
    mov [remainder], edx
    
    ; Fast division by constants using multiplication
    ; To divide by 7, multiply by 0x24924925 and shift
    mov eax, [dividend]
    mov edx, 0x24924925            ; Magic number for division by 7
    mul edx                        ; 64-bit result in EDX:EAX
    shr edx, 2                     ; Shift to get quotient
    mov [quotient], edx
    
    ; Calculate remainder: dividend - quotient * divisor
    mov eax, edx
    imul eax, 7                    ; quotient * 7
    mov ebx, [dividend]
    sub ebx, eax                   ; remainder = dividend - quotient * 7
    mov [remainder], ebx
    
    invoke printf, division_fmt, [quotient], [remainder]
    ret

demo_power_calculation:
    ; Efficient integer exponentiation using repeated squaring
    mov eax, [base_number]         ; Base
    mov ecx, [power]               ; Exponent
    mov ebx, 1                     ; Result accumulator
    
power_loop:
    test ecx, ecx                  ; Check if exponent is 0
    jz power_done
    
    test ecx, 1                    ; Check if exponent is odd
    jz power_even
    
    ; Exponent is odd: multiply result by current base
    push edx
    mul ebx                        ; EAX = base * result
    mov ebx, eax                   ; Store result
    mov eax, [base_number]         ; Restore base for squaring
    pop edx
    
power_even:
    ; Square the base and halve the exponent
    push edx
    mul eax                        ; EAX = base * base
    mov [base_number], eax         ; Update base
    pop edx
    shr ecx, 1                     ; Halve exponent
    jmp power_loop
    
power_done:
    mov [power_result], ebx
    invoke printf, power_fmt, [power_result]
    ret

demo_sqrt_calculation:
    ; Integer square root using Newton's method
    mov eax, [base_number]         ; Number to find sqrt of
    mov ebx, eax                   ; Initial guess
    shr ebx, 1                     ; Divide by 2 for better starting point
    test ebx, ebx
    jnz sqrt_loop
    mov ebx, 1                     ; Ensure non-zero guess
    
sqrt_loop:
    mov ecx, ebx                   ; Save previous guess
    
    ; Newton's iteration: x_new = (x + n/x) / 2
    mov eax, [base_number]
    xor edx, edx
    div ebx                        ; EAX = n / x
    add eax, ebx                   ; EAX = x + n/x
    shr eax, 1                     ; EAX = (x + n/x) / 2
    mov ebx, eax                   ; New guess
    
    ; Check for convergence
    sub ecx, ebx                   ; Difference from previous
    cmp ecx, 1                     ; Close enough?
    ja sqrt_loop                   ; Continue if not converged
    
    mov [sqrt_result], ebx
    invoke printf, sqrt_fmt, [sqrt_result]
    ret

demo_trigonometry:
    ; Calculate sine using Taylor series approximation
    ; sin(x) ≈ x - x³/3! + x⁵/5! - x⁷/7! + ...
    
    ; Convert angle from degrees to radians (approximately)
    mov eax, [angle]               ; Angle in degrees
    imul eax, 355                  ; Multiply by π approximation
    mov ebx, 113 * 180             ; Denominator for conversion
    xor edx, edx
    div ebx                        ; EAX = angle in radians * 1000
    
    ; Calculate sine using first few terms of Taylor series
    mov esi, eax                   ; x (scaled by 1000)
    mov edi, eax                   ; x for powers
    
    ; First term: x
    mov ebx, esi                   ; sin(x) = x
    
    ; Second term: -x³/6
    imul edi, esi                  ; x²
    imul edi, esi                  ; x³
    mov eax, edi
    xor edx, edx
    mov ecx, 6
    div ecx                        ; x³/6
    sub ebx, eax                   ; sin(x) = x - x³/6
    
    ; Third term: +x⁵/120 (simplified calculation)
    ; ... (additional terms would continue here)
    
    mov [sine_result], ebx
    invoke printf, sine_fmt, [sine_result]
    ret

demo_quadratic_solver:
    ; Solve ax² + bx + c = 0 using quadratic formula
    ; x = (-b ± √(b² - 4ac)) / (2a)
    
    ; Calculate discriminant: b² - 4ac
    mov eax, [coefficient_b]       ; b
    imul eax, eax                  ; b²
    
    mov ebx, [coefficient_a]       ; a
    imul ebx, [coefficient_c]      ; ac
    shl ebx, 2                     ; 4ac
    
    sub eax, ebx                   ; discriminant = b² - 4ac
    
    ; Check if discriminant is negative
    test eax, eax
    js no_real_roots
    
    ; Calculate square root of discriminant (simplified)
    push eax
    call integer_sqrt              ; Result in EAX
    mov esi, eax                   ; √discriminant
    
    ; Calculate roots
    mov eax, [coefficient_b]       ; b
    neg eax                        ; -b
    
    ; First root: (-b + √discriminant) / (2a)
    add eax, esi                   ; -b + √discriminant
    mov ebx, [coefficient_a]
    shl ebx, 1                     ; 2a
    xor edx, edx
    div ebx                        ; (-b + √discriminant) / (2a)
    mov [quadratic_roots], eax
    
    ; Second root: (-b - √discriminant) / (2a)
    mov eax, [coefficient_b]       ; b
    neg eax                        ; -b
    sub eax, esi                   ; -b - √discriminant
    mov ebx, [coefficient_a]
    shl ebx, 1                     ; 2a
    xor edx, edx
    div ebx                        ; (-b - √discriminant) / (2a)
    mov [quadratic_roots + 4], eax
    
    invoke printf, roots_fmt, [quadratic_roots], [quadratic_roots + 4]
    ret

no_real_roots:
    invoke printf, no_roots_fmt
    ret

integer_sqrt:
    ; Integer square root of value on stack
    ; Returns result in EAX
    pop ebx                        ; Return address
    pop eax                        ; Value to find sqrt of
    push ebx                       ; Restore return address
    
    mov ebx, eax                   ; Initial guess
    shr ebx, 1
    test ebx, ebx
    jnz isqrt_loop
    mov ebx, 1
    
isqrt_loop:
    mov ecx, ebx                   ; Save previous guess
    xor edx, edx
    div ebx                        ; EAX = n / x
    add eax, ebx                   ; EAX = x + n/x
    shr eax, 1                     ; EAX = (x + n/x) / 2
    mov ebx, eax                   ; New guess
    
    sub ecx, ebx                   ; Check convergence
    cmp ecx, 1
    ja isqrt_loop
    
    mov eax, ebx
    ret

demo_bit_arithmetic:
    ; Advanced bit manipulation techniques
    
    ; Count set bits in a number (population count)
    mov eax, [base_number]
    call popcount
    invoke printf, popcount_fmt, [base_number], eax
    
    ; Find highest set bit (bit scan reverse)
    mov eax, [base_number]
    bsr ebx, eax                   ; Bit scan reverse
    invoke printf, highest_bit_fmt, [base_number], ebx
    
    ; Reverse bits in a 32-bit number
    mov eax, [base_number]
    call reverse_bits
    invoke printf, reversed_fmt, [base_number], eax
    
    ; Check if number is power of 2
    mov eax, [base_number]
    call is_power_of_2
    invoke printf, power2_fmt, [base_number], eax
    
    ret

popcount:
    ; Count set bits in EAX, return count in EAX
    xor ebx, ebx                   ; Bit counter
    
popcount_loop:
    test eax, eax
    jz popcount_done
    inc ebx                        ; Increment counter
    mov ecx, eax
    dec ecx
    and eax, ecx                   ; Clear lowest set bit
    jmp popcount_loop
    
popcount_done:
    mov eax, ebx
    ret

reverse_bits:
    ; Reverse bits in EAX, return result in EAX
    xor ebx, ebx                   ; Result accumulator
    mov ecx, 32                    ; Bit counter
    
reverse_loop:
    shl ebx, 1                     ; Shift result left
    shr eax, 1                     ; Shift input right
    adc ebx, 0                     ; Add carry to result
    loop reverse_loop
    
    mov eax, ebx
    ret

is_power_of_2:
    ; Check if EAX is power of 2, return 1 if true, 0 if false
    test eax, eax                  ; Check for zero
    jz not_power_2
    
    mov ebx, eax
    dec ebx                        ; n - 1
    and eax, ebx                   ; n & (n-1)
    jz is_power_2                  ; If zero, it's a power of 2
    
not_power_2:
    xor eax, eax                   ; Return 0
    ret
    
is_power_2:
    mov eax, 1                     ; Return 1
    ret

section '.data' data readable writeable
    division_fmt    db 'Division: quotient=%d, remainder=%d', 13, 10, 0
    power_fmt       db 'Power result: %d', 13, 10, 0
    sqrt_fmt        db 'Square root: %d', 13, 10, 0
    sine_fmt        db 'Sine (scaled): %d', 13, 10, 0
    roots_fmt       db 'Quadratic roots: %d, %d', 13, 10, 0
    no_roots_fmt    db 'No real roots', 13, 10, 0
    popcount_fmt    db 'Number %d has %d set bits', 13, 10, 0
    highest_bit_fmt db 'Number %d: highest bit at position %d', 13, 10, 0
    reversed_fmt    db 'Number %d reversed: %d', 13, 10, 0
    power2_fmt      db 'Number %d is power of 2: %d', 13, 10, 0

section '.idata' import data readable writeable
    library kernel32, 'KERNEL32.DLL', \
            msvcrt, 'MSVCRT.DLL'
    import kernel32, ExitProcess, 'ExitProcess'
    import msvcrt, printf, 'printf'
```

## Logical and Bitwise Operations: The Digital Toolkit

Bitwise operations are the foundation of efficient programming. They allow you to manipulate individual bits, implement flags, and perform operations that would be much slower using arithmetic.

### Bit Manipulation Mastery

```assembly
format PE console
entry start

include 'win32a.inc'

section '.data' data readable writeable
    ; Bit manipulation demonstration data
    flags           dd 0           ; Flags register simulation
    bit_array       dd 32 dup(0)   ; Array for bit operations
    mask_value      dd 0xFF00FF00  ; Masking pattern
    test_number     dd 0xDEADBEEF  ; Test value
    
    ; Bit field structure simulation
    packed_data     dd 0           ; Packed fields
    ; Bits 0-7: age (0-255)
    ; Bits 8-15: department (0-255)  
    ; Bits 16-23: salary_grade (0-255)
    ; Bits 24-31: permissions (flags)
    
section '.code' code readable executable

start:
    ; Demonstrate advanced bit manipulation
    
    ; 1. Bit field operations
    call demo_bit_fields
    
    ; 2. Efficient set operations using bits
    call demo_bit_sets
    
    ; 3. Cryptographic bit operations
    call demo_crypto_operations
    
    ; 4. Graphics bit manipulation
    call demo_graphics_bits
    
    invoke ExitProcess, 0

demo_bit_fields:
    ; Pack employee data into single 32-bit value
    mov eax, 25                    ; Age = 25
    and eax, 0xFF                  ; Ensure 8 bits
    mov [packed_data], eax         ; Store in bits 0-7
    
    mov eax, 5                     ; Department = 5
    and eax, 0xFF                  ; Ensure 8 bits
    shl eax, 8                     ; Shift to bits 8-15
    or [packed_data], eax          ; Pack into data
    
    mov eax, 7                     ; Salary grade = 7
    and eax, 0xFF                  ; Ensure 8 bits
    shl eax, 16                    ; Shift to bits 16-23
    or [packed_data], eax          ; Pack into data
    
    mov eax, 0xA5                  ; Permissions = 0xA5
    shl eax, 24                    ; Shift to bits 24-31
    or [packed_data], eax          ; Pack into data
    
    invoke printf, packed_fmt, [packed_data]
    
    ; Extract individual fields
    mov eax, [packed_data]
    and eax, 0xFF                  ; Extract age
    invoke printf, age_fmt, eax
    
    mov eax, [packed_data]
    shr eax, 8                     ; Shift department to low bits
    and eax, 0xFF                  ; Extract department
    invoke printf, dept_fmt, eax
    
    mov eax, [packed_data]
    shr eax, 16                    ; Shift salary grade to low bits
    and eax, 0xFF                  ; Extract salary grade
    invoke printf, salary_fmt, eax
    
    mov eax, [packed_data]
    shr eax, 24                    ; Shift permissions to low bits
    invoke printf, perm_fmt, eax
    
    ret

demo_bit_sets:
    ; Implement mathematical sets using bit arrays
    ; Set A = {1, 5, 7, 12, 20}
    ; Set B = {3, 5, 9, 12, 18}
    
    ; Initialize sets
    xor eax, eax
    mov [bit_array], eax           ; Clear set A
    mov [bit_array + 4], eax       ; Clear set B
    
    ; Build set A
    call set_bit, bit_array, 1     ; Add element 1
    call set_bit, bit_array, 5     ; Add element 5
    call set_bit, bit_array, 7     ; Add element 7
    call set_bit, bit_array, 12    ; Add element 12
    call set_bit, bit_array, 20    ; Add element 20
    
    ; Build set B
    call set_bit, bit_array + 4, 3     ; Add element 3
    call set_bit, bit_array + 4, 5     ; Add element 5
    call set_bit, bit_array + 4, 9     ; Add element 9
    call set_bit, bit_array + 4, 12    ; Add element 12
    call set_bit, bit_array + 4, 18    ; Add element 18
    
    ; Set operations
    ; Union: A ∪ B
    mov eax, [bit_array]
    or eax, [bit_array + 4]
    mov [bit_array + 8], eax       ; Store union
    
    ; Intersection: A ∩ B  
    mov eax, [bit_array]
    and eax, [bit_array + 4]
    mov [bit_array + 12], eax      ; Store intersection
    
    ; Difference: A - B
    mov eax, [bit_array]
    mov ebx, [bit_array + 4]
    not ebx                        ; Complement of B
    and eax, ebx                   ; A AND (NOT B)
    mov [bit_array + 16], eax      ; Store difference
    
    ; Display results
    invoke printf, set_a_fmt, [bit_array]
    invoke printf, set_b_fmt, [bit_array + 4]
    invoke printf, union_fmt, [bit_array + 8]
    invoke printf, intersect_fmt, [bit_array + 12]
    invoke printf, diff_fmt, [bit_array + 16]
    
    ret

set_bit:
    ; Set bit N in array
    ; Parameters: array address, bit number
    pop ebx                        ; Return address
    pop esi                        ; Array address
    pop eax                        ; Bit number
    push ebx                       ; Restore return address
    
    mov ecx, eax
    shr ecx, 5                     ; Divide by 32 for DWORD index
    and eax, 31                    ; Get bit position within DWORD
    
    mov ebx, 1
    shl ebx, cl                    ; Create bit mask
    or [esi + ecx*4], ebx          ; Set the bit
    ret

demo_crypto_operations:
    ; Simple XOR cipher and bit diffusion
    mov esi, test_data             ; Source data
    mov edi, encrypted_data        ; Destination
    mov ecx, test_data_len         ; Length
    mov eax, 0x5A5A5A5A            ; XOR key
    
encrypt_loop:
    mov ebx, [esi]                 ; Load 4 bytes
    xor ebx, eax                   ; XOR with key
    
    ; Bit diffusion - mix bits for better encryption
    rol ebx, 7                     ; Rotate left 7 bits
    xor ebx, 0x1B1B1B1B            ; XOR with constant
    ror ebx, 3                     ; Rotate right 3 bits
    
    mov [edi], ebx                 ; Store encrypted data
    add esi, 4
    add edi, 4
    
    ; Key schedule - modify key for next block
    rol eax, 1                     ; Simple key evolution
    xor eax, 0x87654321
    
    sub ecx, 4
    jnz encrypt_loop
    
    invoke printf, crypto_fmt
    ret

demo_graphics_bits:
    ; Graphics operations using bit manipulation
    ; Simulate 8-bit color manipulation
    
    ; Pack RGB values into single byte (3-3-2 format)
    mov eax, 7                     ; Red (0-7)
    shl eax, 5                     ; Shift to bits 5-7
    
    mov ebx, 6                     ; Green (0-7)
    and ebx, 7                     ; Ensure 3 bits
    shl ebx, 2                     ; Shift to bits 2-4
    or eax, ebx
    
    mov ebx, 3                     ; Blue (0-3)
    and ebx, 3                     ; Ensure 2 bits
    or eax, ebx                    ; Combine all components
    
    mov [graphics_color], eax
    
    ; Extract components back
    mov eax, [graphics_color]
    mov ebx, eax
    shr ebx, 5                     ; Extract red
    and ebx, 7
    invoke printf, red_fmt, ebx
    
    mov ebx, eax
    shr ebx, 2                     ; Extract green
    and ebx, 7
    invoke printf, green_fmt, ebx
    
    mov ebx, eax
    and ebx, 3                     ; Extract blue
    invoke printf, blue_fmt, ebx
    
    ; Alpha blending using bit shifts
    mov eax, 200                   ; Source color
    mov ebx, 100                   ; Destination color
    mov ecx, 128                   ; Alpha (0-255)
    
    ; Blend = (src * alpha + dst * (255 - alpha)) / 255
    imul eax, ecx                  ; src * alpha
    mov edx, 255
    sub edx, ecx                   ; 255 - alpha
    imul ebx, edx                  ; dst * (255 - alpha)
    add eax, ebx                   ; Combined
    shr eax, 8                     ; Divide by 256 (approximate /255)
    
    invoke printf, blend_fmt, eax
    ret

section '.data' data readable writeable
    ; Format strings
    packed_fmt      db 'Packed data: 0x%08X', 13, 10, 0
    age_fmt         db 'Age: %d', 13, 10, 0
    dept_fmt        db 'Department: %d', 13, 10, 0
    salary_fmt      db 'Salary grade: %d', 13, 10, 0
    perm_fmt        db 'Permissions: 0x%02X', 13, 10, 0
    set_a_fmt       db 'Set A: 0x%08X', 13, 10, 0
    set_b_fmt       db 'Set B: 0x%08X', 13, 10, 0
    union_fmt       db 'Union: 0x%08X', 13, 10, 0
    intersect_fmt   db 'Intersection: 0x%08X', 13, 10, 0
    diff_fmt        db 'Difference: 0x%08X', 13, 10, 0
    crypto_fmt      db 'Encryption completed', 13, 10, 0
    red_fmt         db 'Red: %d', 13, 10, 0
    green_fmt       db 'Green: %d', 13, 10, 0
    blue_fmt        db 'Blue: %d', 13, 10, 0
    blend_fmt       db 'Blended color: %d', 13, 10, 0
    
    ; Data
    test_data       db 'Hello, World! This is test data for encryption.', 0
    test_data_len   equ $ - test_data
    encrypted_data  rb test_data_len
    graphics_color  dd 0

section '.idata' import data readable writeable
    library kernel32, 'KERNEL32.DLL', \
            msvcrt, 'MSVCRT.DLL'
    import kernel32, ExitProcess, 'ExitProcess'
    import msvcrt, printf, 'printf'
```

## Memory Access Patterns and Optimization

Understanding how the processor accesses memory is crucial for writing high-performance code. Different addressing modes and access patterns can dramatically affect performance.

### Advanced Addressing Modes

```assembly
format PE console
entry start

include 'win32a.inc'

section '.data' data readable writeable
    ; Data structures for addressing mode demonstrations
    base_array      dd 100, 200, 300, 400, 500
    lookup_table    dd 10, 20, 30, 40, 50, 60, 70, 80
    matrix_2d       dd 16 dup(?)   ; 4x4 matrix
    structure_array rb 1000        ; Array of structures
    
    ; Structure definition (conceptual)
    ; struct Employee {
    ;     uint32_t id;        // offset 0
    ;     uint32_t salary;    // offset 4
    ;     uint16_t age;       // offset 8
    ;     uint16_t dept;      // offset 10
    ; };
    EMPLOYEE_SIZE equ 12
    
section '.code' code readable executable

start:
    ; Demonstrate various addressing modes and their performance
    
    call demo_direct_addressing
    call demo_indexed_addressing
    call demo_scaled_addressing
    call demo_complex_addressing
    call demo_cache_optimization
    
    invoke ExitProcess, 0

demo_direct_addressing:
    ; Direct addressing - simplest form
    mov eax, [base_array]          ; Load first element
    mov ebx, [base_array + 4]      ; Load second element
    mov ecx, [base_array + 8]      ; Load third element
    
    ; Calculate sum using direct addressing
    add eax, ebx
    add eax, ecx
    add eax, [base_array + 12]     ; Fourth element
    add eax, [base_array + 16]     ; Fifth element
    
    invoke printf, direct_sum_fmt, eax
    ret

demo_indexed_addressing:
    ; Indexed addressing for array traversal
    mov esi, base_array            ; Base address
    xor eax, eax                   ; Sum accumulator
    mov ecx, 5                     ; Array length
    xor edx, edx                   ; Index
    
indexed_loop:
    add eax, [esi + edx*4]         ; Load array[index]
    inc edx                        ; Next index
    loop indexed_loop
    
    invoke printf, indexed_sum_fmt, eax
    ret

demo_scaled_addressing:
    ; Scaled addressing for efficient array access
    xor eax, eax                   ; Sum accumulator
    xor ebx, ebx                   ; Index
    
scaled_loop:
    cmp ebx, 5                     ; Check bounds
    jge scaled_done
    
    add eax, [base_array + ebx*4]  ; Scaled addressing
    inc ebx
    jmp scaled_loop
    
scaled_done:
    invoke printf, scaled_sum_fmt, eax
    ret

demo_complex_addressing:
    ; Complex addressing for 2D arrays and structures
    
    ; Initialize 4x4 matrix with values
    mov esi, matrix_2d
    mov eax, 1                     ; Starting value
    mov ecx, 16                    ; Total elements
    
init_matrix:
    mov [esi], eax
    add esi, 4
    inc eax
    loop init_matrix
    
    ; Access matrix[2][3] using complex addressing
    ; Address = base + (row * columns + column) * element_size
    mov ebx, 2                     ; Row
    mov ecx, 3                     ; Column
    mov eax, ebx                   ; Row
    shl eax, 2                     ; Row * 4 (columns)
    add eax, ecx                   ; Row * 4 + column
    mov edx, [matrix_2d + eax*4]   ; Load matrix[2][3]
    
    invoke printf, matrix_fmt, edx
    
    ; Structure array access
    ; Access employee[5].salary
    mov eax, 5                     ; Employee index
    mov ebx, EMPLOYEE_SIZE         ; Structure size
    mul ebx                        ; Calculate offset
    add eax, 4                     ; Add salary field offset
    
    ; Simulate setting salary
    mov dword [structure_array + eax], 75000
    
    ; Access using complex addressing
    mov ebx, 5                     ; Employee index
    mov eax, [structure_array + ebx*EMPLOYEE_SIZE + 4]  ; Load salary
    
    invoke printf, salary_fmt, eax
    ret

demo_cache_optimization:
    ; Demonstrate cache-friendly vs cache-unfriendly access patterns
    
    ; Allocate large array for testing
    invoke VirtualAlloc, 0, 1024*1024, MEM_COMMIT, PAGE_READWRITE
    test eax, eax
    jz alloc_failed
    mov esi, eax                   ; Save array pointer
    
    ; Initialize array
    mov ecx, 256*1024              ; 1MB / 4 bytes = 256K integers
    mov eax, esi
    xor edx, edx
    
init_large_array:
    mov [eax], edx
    add eax, 4
    inc edx
    loop init_large_array
    
    ; Test 1: Sequential access (cache-friendly)
    rdtsc
    mov [start_time], eax          ; Save start time
    
    mov ecx, 256*1024
    mov eax, esi
    xor edx, edx                   ; Sum accumulator
    
sequential_access:
    add edx, [eax]                 ; Sequential memory access
    add eax, 4
    loop sequential_access
    
    rdtsc
    sub eax, [start_time]
    invoke printf, sequential_fmt, eax, edx
    
    ; Test 2: Strided access (cache-unfriendly)
    rdtsc
    mov [start_time], eax
    
    mov ecx, 64*1024               ; Fewer iterations due to stride
    mov eax, esi
    xor edx, edx                   ; Sum accumulator
    
strided_access:
    add edx, [eax]                 ; Access every 16th element
    add eax, 64                    ; Stride of 16 elements (64 bytes)
    loop strided_access
    
    rdtsc
    sub eax, [start_time]
    invoke printf, strided_fmt, eax, edx
    
    ; Free allocated memory
    invoke VirtualFree, esi, 0, MEM_RELEASE
    ret

alloc_failed:
    invoke printf, alloc_error_fmt
    ret

section '.data' data readable writeable
    start_time      dd 0
    
    ; Format strings
    direct_sum_fmt      db 'Direct addressing sum: %d', 13, 10, 0
    indexed_sum_fmt     db 'Indexed addressing sum: %d', 13, 10, 0
    scaled_sum_fmt      db 'Scaled addressing sum: %d', 13, 10, 0
    matrix_fmt          db 'Matrix[2][3] = %d', 13, 10, 0
    salary_fmt          db 'Employee[5] salary: $%d', 13, 10, 0
    sequential_fmt      db 'Sequential access: %d cycles, sum: %d', 13, 10, 0
    strided_fmt         db 'Strided access: %d cycles, sum: %d', 13, 10, 0
    alloc_error_fmt     db 'Memory allocation failed', 13, 10, 0

section '.idata' import data readable writeable
    library kernel32, 'KERNEL32.DLL', \
            msvcrt, 'MSVCRT.DLL'
    import kernel32, ExitProcess, 'ExitProcess', \
                     VirtualAlloc, 'VirtualAlloc', \
                     VirtualFree, 'VirtualFree'
    import msvcrt, printf, 'printf'
```

## SIMD and Vector Instructions

Modern processors include powerful vector processing units that can perform the same operation on multiple data elements simultaneously.

### SSE/AVX Programming

```assembly
format PE console
entry start

include 'win32a.inc'

section '.data' data readable writeable
    ; Aligned data for SIMD operations
    align 16
    vector_a        dd 1.0, 2.0, 3.0, 4.0
    vector_b        dd 5.0, 6.0, 7.0, 8.0
    vector_result   dd 4 dup(0.0)
    
    align 16
    int_array_a     dd 1, 2, 3, 4, 5, 6, 7, 8
    int_array_b     dd 8, 7, 6, 5, 4, 3, 2, 1
    int_result      dd 8 dup(0)
    
    align 32
    avx_array_a     dd 8 dup(1.0)
    avx_array_b     dd 8 dup(2.0)
    avx_result      dd 8 dup(0.0)
    
section '.code' code readable executable

start:
    ; Check for SSE support
    call check_sse_support
    test eax, eax
    jz no_sse
    
    ; Demonstrate SSE operations
    call demo_sse_arithmetic
    call demo_sse_comparison
    call demo_sse_conversion
    
    ; Check for AVX support
    call check_avx_support
    test eax, eax
    jz no_avx
    
    ; Demonstrate AVX operations
    call demo_avx_operations
    
no_avx:
no_sse:
    invoke ExitProcess, 0

check_sse_support:
    ; Check CPUID for SSE support
    mov eax, 1                     ; Function 1
    cpuid
    test edx, 1 shl 25             ; SSE bit in EDX
    setnz al                       ; Set AL if SSE supported
    movzx eax, al                  ; Zero-extend to EAX
    ret

check_avx_support:
    ; Check CPUID for AVX support
    mov eax, 1                     ; Function 1
    cpuid
    test ecx, 1 shl 28             ; AVX bit in ECX
    setnz al                       ; Set AL if AVX supported
    movzx eax, al                  ; Zero-extend to EAX
    ret

demo_sse_arithmetic:
    ; Load vectors into SSE registers
    movaps xmm0, [vector_a]        ; Load 4 floats
    movaps xmm1, [vector_b]        ; Load 4 floats
    
    ; Vector addition
    addps xmm0, xmm1               ; xmm0 = xmm0 + xmm1
    movaps [vector_result], xmm0   ; Store result
    
    ; Display results
    invoke printf, sse_add_fmt
    mov ecx, 4
    mov esi, vector_result
    
display_floats:
    push ecx
    push esi
    
    ; Convert float to double for printf
    fld dword [esi]
    sub esp, 8
    fstp qword [esp]               ; Store as double on stack
    
    invoke printf, float_fmt, dword [esp], dword [esp+4]
    add esp, 8
    
    pop esi
    pop ecx
    add esi, 4
    loop display_floats
    
    ; Vector multiplication
    movaps xmm0, [vector_a]
    movaps xmm1, [vector_b]
    mulps xmm0, xmm1               ; Element-wise multiplication
    movaps [vector_result], xmm0
    
    invoke printf, sse_mul_fmt
    ret

demo_sse_comparison:
    ; Vector comparison operations
    movaps xmm0, [vector_a]        ; [1.0, 2.0, 3.0, 4.0]
    movaps xmm1, [vector_b]        ; [5.0, 6.0, 7.0, 8.0]
    
    ; Compare for less than
    cmpltps xmm0, xmm1             ; Compare a < b
    movaps [vector_result], xmm0   ; Store comparison mask
    
    ; The result contains 0xFFFFFFFF where true, 0x00000000 where false
    invoke printf, sse_cmp_fmt
    
    ; Integer comparisons
    movdqa xmm0, [int_array_a]     ; Load 4 integers
    movdqa xmm1, [int_array_b]     ; Load 4 integers
    
    ; Compare for greater than
    pcmpgtd xmm0, xmm1             ; Compare a > b (signed)
    movdqa [int_result], xmm0      ; Store result
    
    ret

demo_sse_conversion:
    ; Convert between integer and floating point
    movdqa xmm0, [int_array_a]     ; Load integers
    cvtdq2ps xmm0, xmm0            ; Convert to floats
    movaps [vector_result], xmm0   ; Store float result
    
    invoke printf, sse_conv_fmt
    
    ; Convert back to integers
    movaps xmm0, [vector_result]   ; Load floats
    cvtps2dq xmm0, xmm0            ; Convert to integers
    movdqa [int_result], xmm0      ; Store integer result
    
    ret

demo_avx_operations:
    ; 256-bit vector operations with AVX
    vmovaps ymm0, [avx_array_a]    ; Load 8 floats
    vmovaps ymm1, [avx_array_b]    ; Load 8 floats
    
    ; Vector operations with 8 elements
    vaddps ymm2, ymm0, ymm1        ; Add 8 floats simultaneously
    vmulps ymm3, ymm0, ymm1        ; Multiply 8 floats simultaneously
    
    ; Store results
    vmovaps [avx_result], ymm2     ; Store addition result
    
    invoke printf, avx_fmt
    
    ; AVX also supports horizontal operations
    vhaddps ymm0, ymm2, ymm3       ; Horizontal add
    
    ; Clean up AVX state
    vzeroupper                     ; Clear upper bits of YMM registers
    ret

section '.data' data readable writeable
    ; Format strings
    sse_add_fmt     db 'SSE Vector Addition Results:', 13, 10, 0
    sse_mul_fmt     db 'SSE Vector Multiplication Results:', 13, 10, 0
    sse_cmp_fmt     db 'SSE Vector Comparison Results:', 13, 10, 0
    sse_conv_fmt    db 'SSE Conversion Results:', 13, 10, 0
    avx_fmt         db 'AVX 256-bit Operations Completed:', 13, 10, 0
    float_fmt       db '%f ', 0

section '.idata' import data readable writeable
    library kernel32, 'KERNEL32.DLL', \
            msvcrt, 'MSVCRT.DLL'
    import kernel32, ExitProcess, 'ExitProcess'
    import msvcrt, printf, 'printf'
```

This comprehensive expansion of Chapter 4 demonstrates the full power of the x86/x64 instruction set, from basic arithmetic to advanced SIMD operations. Each section includes production-ready code examples that show not just how to use instructions, but when and why to use them for maximum performance.

## Summary

In this expanded chapter, we've covered:

1. **Instruction Selection**: Choosing the right instructions for optimal performance
2. **Advanced Arithmetic**: Beyond basic math operations
3. **Bit Manipulation**: Efficient bitwise operations and applications
4. **Memory Access Optimization**: Understanding addressing modes and cache behavior
5. **SIMD Programming**: Vectorized operations for parallel processing

These techniques form the core of high-performance assembly programming, enabling you to write code that fully utilizes modern processor capabilities.
    jle not_greater                ; Jump if not greater
    mov eax, [esi]                 ; New maximum found
not_greater:
    add esi, 4                     ; Next element
    loop max_loop                  ; Continue until done
    
    ret
```

**The Optimized Approach:**
```assembly
find_max_optimized:
    ; Optimized maximum finder using conditional moves
    ; ESI = array pointer, ECX = element count
    ; Returns maximum in EAX
    
    mov eax, [esi]                 ; Initial maximum
    add esi, 4                     ; Point to second element
    dec ecx                        ; Adjust count
    jz max_done                    ; Handle single-element case
    
max_loop_opt:
    mov edx, [esi]                 ; Load current element
    cmp edx, eax                   ; Compare with maximum
    cmovg eax, edx                 ; Conditionally move if greater
    add esi, 4                     ; Next element
    loop max_loop_opt              ; Continue
    
max_done:
    ret
```

The optimized version uses the `CMOVG` (conditional move if greater) instruction, which eliminates the branch prediction penalty of the jump instruction. This single change can make the function 20-30% faster on modern processors.

### Understanding Instruction Categories

The x86/x64 instruction set can be organized into logical categories, each serving specific computational purposes:

**1. Data Movement Instructions**
These are the workhorses of assembly programming:

```assembly
section '.data' data readable writeable
    source_value    dd 12345
    dest_value      dd 0
    array_data     dd 1, 2, 3, 4, 5
    
section '.code' code readable executable

data_movement_examples:
    ; Basic moves
    mov eax, 42                    ; Immediate to register
    mov [dest_value], eax          ; Register to memory
    mov ebx, [source_value]        ; Memory to register
    mov ecx, ebx                   ; Register to register
    
    ; Zero/sign extension
    movzx eax, byte [source_value] ; Zero-extend byte to dword
    movsx ebx, word [source_value] ; Sign-extend word to dword
    
    ; String operations (powerful bulk moves)
    mov esi, array_data            ; Source
    mov edi, dest_value            ; Destination  
    mov ecx, 5                     ; Count
    rep movsd                      ; Move 5 dwords
    
    ; Exchange operations
    xchg eax, ebx                  ; Swap EAX and EBX
    
    ; Load effective address
    lea eax, [ebx + ecx*4 + 8]     ; Calculate address without memory access
    
    ret
```

**2. Arithmetic Instructions**
The mathematical foundation of computation:

```assembly
arithmetic_examples:
    mov eax, 100
    mov ebx, 25
    
    ; Basic arithmetic
    add eax, ebx                   ; EAX = EAX + EBX (125)
    sub eax, 50                    ; EAX = EAX - 50 (75)
    imul eax, 2                    ; EAX = EAX * 2 (150)
    
    ; Division (more complex)
    mov edx, 0                     ; Clear high bits
    div ebx                        ; EAX = EAX / EBX, EDX = remainder
    
    ; Increment/decrement (faster than add/sub 1)
    inc eax                        ; EAX++
    dec ebx                        ; EBX--
    
    ; Negate
    neg eax                        ; EAX = -EAX
    
    ; Advanced arithmetic
    adc eax, ebx                   ; Add with carry
    sbb eax, ebx                   ; Subtract with borrow
    
    ret
```

**3. Logical and Bit Manipulation Instructions**
Essential for flag manipulation, masking, and bit-level operations:

```assembly
logical_examples:
    mov eax, 0xFF00FF00
    mov ebx, 0x0F0F0F0F
    
    ; Basic logical operations  
    and eax, ebx                   ; Bitwise AND
    or eax, 0x000000FF             ; Bitwise OR
    xor eax, eax                   ; Clear register (common idiom)
    not eax                        ; Bitwise NOT
    
    ; Shift operations
    shl eax, 4                     ; Shift left 4 bits (multiply by 16)
    shr ebx, 2                     ; Shift right 2 bits (divide by 4)
    sar ecx, 1                     ; Arithmetic right shift (preserves sign)
    
    ; Rotate operations
    rol eax, 8                     ; Rotate left 8 bits
    ror ebx, 4                     ; Rotate right 4 bits
    
    ; Bit testing and manipulation
    bt eax, 5                      ; Test bit 5 (sets carry flag)
    bts eax, 7                     ; Test and set bit 7
    btr eax, 3                     ; Test and reset bit 3
    btc eax, 1                     ; Test and complement bit 1
    
    ; Bit scanning
    bsf eax, ebx                   ; Bit scan forward (find first set bit)
    bsr eax, ebx                   ; Bit scan reverse (find last set bit)
    
    ret
```

**4. Control Flow Instructions**
The skeleton that gives your program structure:

```assembly
control_flow_examples:
    mov eax, 10
    mov ebx, 5
    
    ; Comparison and conditional jumps
    cmp eax, ebx                   ; Compare EAX with EBX
    je equal                       ; Jump if equal
    jg greater                     ; Jump if greater
    jl less                        ; Jump if less
    
    ; Unconditional jump
    jmp done
    
equal:
    ; Handle equal case
    mov ecx, 0
    jmp done
    
greater:
    ; Handle greater case
    mov ecx, 1
    jmp done
    
less:
    ; Handle less case
    mov ecx, -1
    
done:
    ; Loop constructs
    mov eax, 0                     ; Counter
    mov ebx, 10                    ; Limit
    
count_loop:
    inc eax
    cmp eax, ebx
    jl count_loop                  ; Continue if less than limit
    
    ; LOOP instruction (automatic counter)
    mov ecx, 10                    ; Loop counter
simple_loop:
    ; Do something 10 times
    loop simple_loop               ; Decrement ECX and jump if not zero
    
    ret
```

### Advanced Instructions and Extensions

Modern processors include many specialized instructions that can dramatically improve performance for specific tasks:

**SIMD Instructions (Single Instruction, Multiple Data):**
```assembly
section '.data' data readable writeable
    align 16
    vector1 dd 1.0, 2.0, 3.0, 4.0      ; 4 floats
    vector2 dd 0.5, 1.5, 2.5, 3.5      ; 4 floats
    result  dd 4 dup(0)                 ; Result vector
    
section '.code' code readable executable

simd_example:
    ; Load vectors into SIMD registers
    movaps xmm0, [vector1]         ; Move aligned packed singles
    movaps xmm1, [vector2]         ; Move aligned packed singles
    
    ; Perform parallel operations
    addps xmm0, xmm1               ; Add 4 floats in parallel
    mulps xmm0, xmm1               ; Multiply 4 floats in parallel
    
    ; Store result
    movaps [result], xmm0          ; Store 4 results at once
    
    ret
```

**String Processing Instructions:**
```assembly
string_operations:
    ; Set up for string operations
    mov esi, source_string         ; Source
    mov edi, dest_buffer           ; Destination
    mov ecx, string_length         ; Count
    
    ; Direction flag controls direction
    cld                            ; Clear direction flag (forward)
    
    ; Powerful string operations
    rep movsb                      ; Copy ECX bytes
    rep stosb                      ; Fill ECX bytes with AL
    repne scasb                    ; Search for AL in string
    
    ; Compare strings
    mov esi, string1
    mov edi, string2
    mov ecx, max_length
    repe cmpsb                     ; Compare until different or ECX=0
    
    ret
```

## The Art of Efficient Instruction Selection

### Performance Characteristics of Instructions

Not all instructions are created equal. Understanding the performance characteristics helps you write faster code:

```assembly
; Fast operations (1 cycle on modern processors)
mov eax, ebx                       ; Register-to-register move
add eax, ebx                       ; Register addition
inc eax                            ; Increment
dec eax                            ; Decrement
test eax, eax                      ; Test (often used instead of cmp eax, 0)

; Moderate operations (2-3 cycles)
mov eax, [ebx]                     ; Memory load
mov [ebx], eax                     ; Memory store
imul eax, ebx                      ; Integer multiply

; Expensive operations (10+ cycles)
div ebx                            ; Integer division
sqrt                               ; Square root
```

### Instruction Pairing and Superscalar Execution

Modern processors can execute multiple instructions simultaneously. Understanding this helps you write code that takes advantage of parallel execution:

```assembly
; Good pairing - these can execute in parallel
mov eax, [esi]                     ; Load (uses load unit)
add ebx, ecx                       ; Add (uses ALU)
mov edx, [edi]                     ; Another load (uses second load unit)

; Poor pairing - these compete for the same execution unit
add eax, ebx                       ; ALU operation
sub ecx, edx                       ; Another ALU operation
imul esi, edi                      ; Yet another ALU operation
```

### Optimization Through Instruction Choice

Here's a practical example showing how instruction choice affects performance:

```assembly
; Task: Clear an array of 1000 elements

; Method 1: Simple loop (slow)
clear_array_simple:
    mov edi, array_start
    mov ecx, 1000
clear_loop1:
    mov dword [edi], 0
    add edi, 4
    loop clear_loop1
    ret

; Method 2: Optimized loop (faster)  
clear_array_optimized:
    mov edi, array_start
    mov ecx, 1000
    xor eax, eax                   ; Clear EAX (faster than mov eax, 0)
clear_loop2:
    mov [edi], eax
    add edi, 4
    dec ecx                        ; DEC doesn't affect carry flag
    jnz clear_loop2                ; JNZ is faster than LOOP
    ret

; Method 3: String instruction (fastest)
clear_array_string:
    mov edi, array_start
    mov ecx, 1000
    xor eax, eax
    rep stosd                      ; Store EAX to [EDI] ECX times
    ret
```

The string instruction version is typically 5-10 times faster than the simple loop.

## Performance Secrets of Instruction Usage

### Branch Prediction and Code Layout

Modern processors predict which branches will be taken. Understanding this helps you write faster code:

```assembly
; Poor branch prediction (alternating pattern)
process_array_bad:
    mov esi, array_start
    mov ecx, array_size
    xor edx, edx                   ; Counter for statistics
    
bad_loop:
    mov eax, [esi]
    test eax, 1                    ; Check if odd
    jz even_number                 ; Branch taken 50% of the time
    
    ; Process odd number
    inc edx
    jmp continue_bad
    
even_number:
    ; Process even number
    
continue_bad:
    add esi, 4
    loop bad_loop
    ret

; Better branch prediction (reorganized code)
process_array_good:
    mov esi, array_start
    mov ecx, array_size
    xor edx, edx
    
good_loop:
    mov eax, [esi]
    test eax, 1
    jnz odd_number                 ; Less frequent case first
    
    ; Process even number (common case)
    add esi, 4
    loop good_loop
    ret
    
odd_number:
    ; Process odd number (less common case)
    inc edx
    add esi, 4
    loop good_loop
    ret
```

### Cache-Friendly Instruction Patterns

Some instruction sequences are more cache-friendly than others:

```assembly
; Cache-unfriendly: Complex addressing
process_matrix_bad:
    mov ebx, 0                     ; Row index
row_loop_bad:
    mov ecx, 0                     ; Column index
col_loop_bad:
    ; Calculate address: matrix[row][col]
    mov eax, ebx                   ; Row
    imul eax, MATRIX_WIDTH         ; * width
    add eax, ecx                   ; + column
    shl eax, 2                     ; * 4 bytes per element
    
    ; Process element
    inc dword [matrix + eax]
    
    inc ecx
    cmp ecx, MATRIX_WIDTH
    jl col_loop_bad
    
    inc ebx
    cmp ebx, MATRIX_HEIGHT  
    jl row_loop_bad
    ret

; Cache-friendly: Sequential access
process_matrix_good:
    mov esi, matrix                ; Pointer to current element
    mov ecx, MATRIX_ELEMENTS       ; Total elements
    
sequential_loop:
    inc dword [esi]                ; Process current element
    add esi, 4                     ; Move to next element
    loop sequential_loop
    ret
```

### Advanced Optimization Techniques

**Loop Unrolling:**
```assembly
; Standard loop
standard_sum:
    xor eax, eax                   ; Sum
    mov esi, array
    mov ecx, count
sum_loop:
    add eax, [esi]
    add esi, 4
    loop sum_loop
    ret

; Unrolled loop (processes 4 elements per iteration)
unrolled_sum:
    xor eax, eax
    mov esi, array
    mov ecx, count
    shr ecx, 2                     ; Divide by 4
    
unroll_loop:
    add eax, [esi]                 ; Element 0
    add eax, [esi + 4]             ; Element 1  
    add eax, [esi + 8]             ; Element 2
    add eax, [esi + 12]            ; Element 3
    add esi, 16                    ; Advance by 4 elements
    loop unroll_loop
    
    ; Handle remaining elements
    mov ecx, count
    and ecx, 3                     ; Remainder after division by 4
    jz unroll_done
    
remainder_loop:
    add eax, [esi]
    add esi, 4
    loop remainder_loop
    
unroll_done:
    ret
```

**Software Pipelining:**
```assembly
; Transform data with pipeline optimization
transform_pipeline:
    mov esi, input_array
    mov edi, output_array
    mov ecx, element_count
    
    ; Pre-load first element
    mov eax, [esi]                 ; Load
    add esi, 4
    
pipeline_loop:
    ; Stage 1: Transform previous element
    shl eax, 1                     ; Process loaded element
    add eax, 100
    
    ; Stage 2: Store previous, load next (parallel operations)
    mov [edi], eax                 ; Store result
    mov eax, [esi]                 ; Load next element (parallel)
    
    ; Advance pointers
    add edi, 4
    add esi, 4
    
    loop pipeline_loop
    
    ; Handle final element
    shl eax, 1
    add eax, 100
    mov [edi], eax
    
    ret
```

## Chapter Summary and What's Next

In this chapter, you've explored the x86/x64 instruction set as a comprehensive toolkit for computation. You've learned:

- How to categorize and understand different types of instructions
- The performance characteristics of various instruction types
- Advanced optimization techniques using instruction selection
- How modern processor features like branch prediction and superscalar execution affect your code
- Practical optimization strategies for real-world performance improvements

You now understand instructions not just as individual commands, but as building blocks that can be combined into efficient algorithms. This knowledge forms the foundation for the advanced programming techniques we'll explore in subsequent chapters.

### Practice Exercises

**Exercise 4.1: String Manipulation Library**
Implement a complete set of string functions (length, copy, compare, search) using only basic instructions. Then optimize them using string instructions and compare performance.

**Exercise 4.2: Mathematical Functions**
Implement sqrt, sin, and cos functions using only basic arithmetic instructions. Focus on accuracy and performance.

**Exercise 4.3: Sorting Algorithms**
Implement quicksort, mergesort, and heapsort in assembly. Profile their performance and analyze which instructions contribute most to execution time.

### Advanced Challenges

**Challenge 4.1: SIMD Vector Library**
Create a complete vector mathematics library using SIMD instructions. Include operations for 3D graphics, signal processing, and statistical calculations.

**Challenge 4.2: Compression Algorithm**
Implement a complete data compression algorithm (like LZ77 or Huffman coding) optimized for maximum performance.

### Looking Ahead

In Chapter 5, we'll explore registers—your digital toolkit. You'll learn not just what registers do, but how to use them strategically for maximum performance. We'll cover register allocation strategies, the different types of registers and their specialized uses, and how to manage processor state effectively.

The instruction knowledge you've gained here will be essential as we dive deeper into register usage patterns and optimization strategies. Every instruction operates on registers, and understanding how to use registers efficiently is key to writing high-performance assembly code.

*"Instructions are the vocabulary of computation, but registers are the workspace where the real magic happens. Master both, and you master the machine."*

**Chapter 16: Performance Optimization** *(Making Every Cycle Count)*
- Profiling and Benchmarking
- Cache-Friendly Programming
- Instruction-Level Parallelism
- Advanced Optimization Techniques

**Chapter 17: Debugging and Testing** *(Finding and Fixing Issues)*
- Assembly-Level Debugging Techniques
- Writing Testable Assembly Code
- Performance Testing and Validation
- Debugging Tools and Techniques

**Chapter 18: Macros and Metaprogramming** *(Code That Writes Code)*
- FASM Macro System Mastery
- Building Domain-Specific Languages
- Code Generation Techniques
- Advanced Preprocessing

**Chapter 19: Cross-Platform Development** *(Writing Portable Assembly)*
- Windows, Linux, and KolibriOS Programming
- Platform Abstraction Techniques
- Conditional Assembly for Multiple Targets
- Build Systems and Deployment

**Chapter 20: Professional Development Practices** *(Building Production Software)*
- Large-Scale Assembly Projects
- Code Organization and Architecture
- Documentation and Maintenance
- Integration with High-Level Languages

### **APPENDICES**

**Appendix A:** Complete FASM Instruction Reference
**Appendix B:** System Call Quick Reference
**Appendix C:** Debugging Guide and Tools
**Appendix D:** Performance Optimization Checklist
**Appendix E:** Resources for Continued Learning

---

# **PART I: YOUR FIRST STEPS INTO THE MACHINE**

*"The journey of a thousand programs begins with a single instruction."*

---