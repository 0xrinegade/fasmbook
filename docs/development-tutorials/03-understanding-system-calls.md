# Understanding KolibriOS System Calls and APIs

This tutorial provides a comprehensive guide to the KolibriOS system call interface, covering the most important functions, their parameters, and practical usage examples. Understanding these APIs is crucial for effective KolibriOS development.

## Table of Contents

1. [System Call Architecture](#system-call-architecture)
2. [Basic System Functions](#basic-system-functions)
3. [Window and Graphics Functions](#window-and-graphics-functions)
4. [Input/Output Functions](#inputoutput-functions)
5. [File System Functions](#file-system-functions)
6. [Memory Management](#memory-management)
7. [Process and Thread Functions](#process-and-thread-functions)
8. [Network Functions](#network-functions)
9. [Advanced Functions](#advanced-functions)
10. [Error Handling](#error-handling)
11. [Best Practices](#best-practices)
12. [API Reference Quick Guide](#api-reference-quick-guide)

## System Call Architecture

KolibriOS uses a unique system call interface based on the `int 0x40` interrupt mechanism.

### Basic Call Structure
```assembly
mov eax, function_number    ; Function number (0-255+)
mov ebx, parameter1         ; First parameter
mov ecx, parameter2         ; Second parameter
mov edx, parameter3         ; Third parameter
mov esi, parameter4         ; Fourth parameter (if needed)
mov edi, parameter5         ; Fifth parameter (if needed)
int 0x40                    ; Execute system call
; Return value typically in EAX
```

### Parameter Conventions
- **EAX**: Always contains the function number
- **EBX, ECX, EDX**: Primary parameters (most functions use these)
- **ESI, EDI**: Additional parameters for complex functions
- **Return Value**: Usually in EAX, sometimes other registers
- **Flags**: EFLAGS register preserved except where noted

### Function Number Organization
- **0-99**: Core system functions (window, graphics, I/O)
- **100+**: Extended functions (drivers, special features)
- **Negative**: Special termination and control functions

## Basic System Functions

### Function 0: Define and Draw Window
The most important function for GUI applications.

```assembly
; Create a window
mov eax, 0                      ; Function 0
mov ebx, x_pos*65536 + width    ; Position and size on X axis
mov ecx, y_pos*65536 + height   ; Position and size on Y axis
mov edx, style_and_color        ; Window style and working area color
mov esi, header_color           ; Header color and flags
mov edi, caption_string         ; Window caption (optional)
int 0x40

; Window style values in EDX:
; Bits 24-31: Style (Y value)
;   0x01 - Define area only, don't draw
;   0x03 - Skinned window (recommended)
;   0x04 - Skinned fixed-size window
; Bits 0-23: Working area color (0xRRGGBB)
; Additional flags in bits 28-31:
;   Bit 28: Window has caption
;   Bit 29: Coordinates relative to client area
;   Bit 30: Don't fill working area
;   Bit 31: Gradient fill
```

**Example - Create a basic window:**
```assembly
create_window:
    mov eax, 0
    mov ebx, 100*65536 + 400        ; X=100, Width=400
    mov ecx, 100*65536 + 300        ; Y=100, Height=300
    mov edx, 0x34ffffff             ; Skinned window, white background
    mov esi, 0x808899ff             ; Blue-gray header
    mov edi, window_title           ; Caption string
    int 0x40
    ret

window_title db 'My Application', 0
```

### Function 1: Put Pixel
Draw individual pixels on the screen or window.

```assembly
mov eax, 1                      ; Function 1
mov ebx, x_coordinate           ; X position
mov ecx, y_coordinate           ; Y position
mov edx, color                  ; Color (0xRRGGBB)
int 0x40
```

### Function 2: Get Key from Keyboard
Read keyboard input from the system buffer.

```assembly
mov eax, 2                      ; Function 2
int 0x40
; Returns: AL = ASCII code, AH = scan code
; If no key available, waits for key press
```

### Function 3: Get System Time
Retrieve current system time.

```assembly
mov eax, 3                      ; Function 3
int 0x40
; Returns time in EAX: bits 0-5=seconds, 6-11=minutes, 12-16=hours
```

### Function 5: Pause/Delay
Pause program execution for specified time.

```assembly
mov eax, 5                      ; Function 5
mov ebx, time_in_hundredths     ; Time in 1/100 seconds
int 0x40
```

### Function 10: Wait for Event
Wait for system events (essential for event-driven programs).

```assembly
mov eax, 10                     ; Function 10
int 0x40
; Returns event type in EAX:
; 1 = Redraw event
; 2 = Key event
; 3 = Button event
; 6 = Mouse event
; 7 = IPC event
; 8 = Network event
; 9 = Debug event
```

## Window and Graphics Functions

### Function 4: Write Text String
Display text in the current window.

```assembly
mov eax, 4                      ; Function 4
mov ebx, x*65536 + y           ; Text position
mov ecx, color_and_flags       ; Text color and formatting flags
mov edx, text_string           ; Pointer to text
mov esi, text_length           ; Number of characters
int 0x40

; Color and flags in ECX:
; Bits 0-23: Text color (0xRRGGBB)
; Bit 24-27: Font (0=6x9, 1=8x16)
; Bit 28: Use background color
; Bit 29: String is ASCIIZ (null-terminated)
; Bit 30: Don't apply background color
; Bit 31: Zero-terminated string
```

**Example - Draw colored text:**
```assembly
draw_text:
    mov eax, 4
    mov ebx, 50*65536 + 100         ; X=50, Y=100
    mov ecx, 0x80ff0000             ; Red text with background
    mov edx, hello_msg
    mov esi, hello_msg_len
    int 0x40
    ret

hello_msg    db 'Hello, World!'
hello_msg_len = $ - hello_msg
```

### Function 12: Begin/End Window Redraw
Control window redrawing process.

```assembly
; Begin redraw
mov eax, 12                     ; Function 12
mov ebx, 1                      ; Begin redraw
int 0x40

; ... draw window contents ...

; End redraw
mov eax, 12                     ; Function 12
mov ebx, 2                      ; End redraw
int 0x40
```

### Function 13: Draw Rectangle
Draw filled rectangles.

```assembly
mov eax, 13                     ; Function 13
mov ebx, x*65536 + width       ; X position and width
mov ecx, y*65536 + height      ; Y position and height
mov edx, color                 ; Color (0xRRGGBB)
int 0x40
```

### Function 38: Draw Line
Draw lines between two points.

```assembly
mov eax, 38                     ; Function 38
mov ebx, x1*65536 + x2         ; Start and end X coordinates
mov ecx, y1*65536 + y2         ; Start and end Y coordinates
mov edx, color                 ; Line color
int 0x40
```

### Function 47: Draw Number
Display numeric values as text.

```assembly
mov eax, 47                     ; Function 47
mov ebx, format_and_digits      ; Number format
mov ecx, number_value           ; Number to display
mov edx, x*65536 + y           ; Position
mov esi, color                 ; Color
int 0x40

; Format in EBX:
; Bits 0-15: Number of digits
; Bits 16-23: Number system (10=decimal, 16=hex)
; Bit 31: Leading zeros flag
```

## Input/Output Functions

### Function 8: Define Button
Create clickable buttons in windows.

```assembly
mov eax, 8                      ; Function 8
mov ebx, x*65536 + width       ; Button position and size
mov ecx, y*65536 + height      ; Button position and size
mov edx, id_and_flags          ; Button ID and flags
mov esi, color                 ; Button color
int 0x40

; ID and flags in EDX:
; Bits 0-23: Button ID (1-16777215)
; Bit 30: Don't draw button
; Bit 31: Delete button
```

### Function 17: Get Button
Retrieve button press events.

```assembly
mov eax, 17                     ; Function 17
int 0x40
; Returns: AH = button ID, AL = 0
```

### Function 37: Mouse Information
Get mouse position and button states.

```assembly
mov eax, 37                     ; Function 37
mov ebx, info_type             ; Information type
int 0x40

; Info types:
; 0 = Get mouse position (returns X in bits 0-15, Y in bits 16-31)
; 1 = Get mouse buttons (bit 0=left, bit 1=right, bit 2=middle)
; 2 = Get mouse position relative to window
```

## File System Functions

### Function 70: File Operations
Comprehensive file system access.

```assembly
mov eax, 70                     ; Function 70
mov ebx, file_info_structure   ; Pointer to file info
int 0x40
; Returns: EAX = error code (0 = success)

; File info structure:
file_info:
    dd  subfunction            ; 0=read, 2=create/rewrite, 3=write, 5=get info, 7=start app
    dd  position_low           ; File position (low 32 bits)
    dd  position_high          ; File position (high 32 bits)
    dd  size                   ; Size to read/write
    dd  buffer                 ; Data buffer pointer
    db  0                      ; Reserved
    dd  filename               ; Filename pointer
```

**Example - Read file:**
```assembly
read_file:
    mov eax, 70
    mov ebx, file_read_info
    int 0x40
    ret

file_read_info:
    dd  0                      ; Read function
    dd  0                      ; Position (low)
    dd  0                      ; Position (high)
    dd  1024                   ; Bytes to read
    dd  file_buffer            ; Buffer
    db  0
    dd  filename               ; File path

filename    db '/rd/1/example.txt', 0
file_buffer times 1024 db 0
```

**Example - Write file:**
```assembly
write_file:
    mov eax, 70
    mov ebx, file_write_info
    int 0x40
    ret

file_write_info:
    dd  2                      ; Create/rewrite function
    dd  0                      ; Position (low)
    dd  0                      ; Position (high)
    dd  data_size              ; Bytes to write
    dd  data_buffer            ; Data to write
    db  0
    dd  output_filename

output_filename db '/rd/1/output.txt', 0
data_buffer     db 'Hello, file!', 0
data_size = $ - data_buffer - 1
```

## Memory Management

### Function 68: Memory Management
Advanced memory operations.

```assembly
; Allocate memory
mov eax, 68                     ; Function 68
mov ebx, 12                     ; Subfunction 12: Allocate
mov ecx, size_in_bytes         ; Size to allocate
int 0x40
; Returns: EAX = pointer to allocated memory (0 if failed)

; Free memory
mov eax, 68                     ; Function 68
mov ebx, 13                     ; Subfunction 13: Free
mov ecx, memory_pointer        ; Pointer to free
int 0x40

; Reallocate memory
mov eax, 68                     ; Function 68
mov ebx, 20                     ; Subfunction 20: Reallocate
mov ecx, memory_pointer        ; Original pointer
mov edx, new_size              ; New size
int 0x40
; Returns: EAX = new pointer
```

### Function 64: Memory Information
Get system memory information.

```assembly
mov eax, 64                     ; Function 64
mov ebx, info_type             ; Information type
int 0x40

; Info types:
; 1 = Total memory size
; 2 = Free memory size
; 3 = Used memory size
```

## Process and Thread Functions

### Function 51: Create Thread
Create new execution threads.

```assembly
mov eax, 51                     ; Function 51
mov ebx, 1                      ; Create thread
mov ecx, thread_entry_point     ; Thread function address
mov edx, stack_pointer         ; Thread stack
int 0x40
; Returns: EAX = thread PID
```

### Function 18: Process Control
Various process control operations.

```assembly
; Terminate process
mov eax, 18                     ; Function 18
mov ebx, 2                      ; Terminate process
mov ecx, process_id            ; PID to terminate
int 0x40

; Get process information
mov eax, 18                     ; Function 18
mov ebx, 3                      ; Get process info
mov ecx, buffer                ; Buffer for process table
int 0x40
```

### Function -1: Program Termination
Cleanly terminate the current program.

```assembly
mov eax, -1                     ; Function -1
int 0x40
; Program terminates immediately
```

## Network Functions

### Function 53: Network Stack
Access to network functionality.

```assembly
; Create socket
mov eax, 53                     ; Function 53
mov ebx, 0                      ; Open socket
mov ecx, socket_type           ; Socket type (UDP/TCP)
mov edx, local_port            ; Local port
mov esi, remote_port           ; Remote port
mov edi, remote_ip             ; Remote IP
int 0x40
; Returns: EAX = socket number

; Send data
mov eax, 53                     ; Function 53
mov ebx, 4                      ; Send data
mov ecx, socket_number         ; Socket
mov edx, data_pointer          ; Data to send
mov esi, data_length           ; Data length
int 0x40

; Receive data
mov eax, 53                     ; Function 53
mov ebx, 2                      ; Receive data
mov ecx, socket_number         ; Socket
int 0x40
; Returns: EAX = received data count
```

## Advanced Functions

### Function 15: Background Management
Control desktop background.

```assembly
; Set background image
mov eax, 15                     ; Function 15
mov ebx, 1                      ; Set background size
mov ecx, width                 ; Image width
mov edx, height                ; Image height
int 0x40

mov eax, 15                     ; Function 15
mov ebx, 5                      ; Set background data
mov ecx, image_data            ; Image data pointer
mov edx, image_size            ; Image data size
int 0x40
```

### Function 60: Inter-Process Communication
IPC between processes.

```assembly
; Send IPC message
mov eax, 60                     ; Function 60
mov ebx, 2                      ; Send message
mov ecx, target_pid            ; Target process PID
mov edx, message_pointer       ; Message data
mov esi, message_size          ; Message size
int 0x40
```

## Error Handling

### Common Error Codes
Many functions return error codes in EAX:

```assembly
; Check for errors after system call
cmp eax, 0                      ; 0 = success
je  operation_success
; Handle error based on function documentation
```

### File System Error Codes
- **0**: Success
- **2**: Function not supported
- **3**: Unknown file system
- **5**: File not found
- **6**: End of file
- **8**: Disk full
- **9**: FAT table corrupted
- **10**: Access denied
- **11**: Device error

### Memory Allocation Errors
- **0**: Memory allocation failed
- **Non-zero**: Pointer to allocated memory

## Best Practices

### 1. Always Check Return Values
```assembly
; Good practice
mov eax, 68
mov ebx, 12
mov ecx, 1024
int 0x40
test eax, eax                   ; Check if allocation succeeded
jz allocation_failed
; Use allocated memory...
```

### 2. Proper Event Loop Structure
```assembly
event_loop:
    mov eax, 10                 ; Wait for event
    int 0x40
    
    cmp eax, 1
    je redraw_event
    cmp eax, 2  
    je key_event
    cmp eax, 3
    je button_event
    
    jmp event_loop              ; Always return to loop
```

### 3. Clean Resource Management
```assembly
; Always free allocated resources
mov eax, 68
mov ebx, 13
mov ecx, [memory_pointer]
int 0x40
mov [memory_pointer], 0         ; Clear pointer
```

### 4. Proper Window Redraw
```assembly
redraw_window:
    mov eax, 12
    mov ebx, 1                  ; Begin redraw
    int 0x40
    
    ; Draw window and contents...
    call draw_window_frame
    call draw_window_contents
    
    mov eax, 12
    mov ebx, 2                  ; End redraw
    int 0x40
    ret
```

## API Reference Quick Guide

### Essential Functions Quick Reference

| Function | Purpose | Parameters | Returns |
|----------|---------|------------|---------|
| 0 | Define window | EBX=pos/size, ECX=pos/size, EDX=style | - |
| 1 | Put pixel | EBX=x, ECX=y, EDX=color | - |
| 2 | Get key | - | EAX=key code |
| 4 | Write text | EBX=pos, ECX=color, EDX=text, ESI=len | - |
| 5 | Delay | EBX=time (1/100 sec) | - |
| 8 | Define button | EBX=pos/size, ECX=pos/size, EDX=ID | - |
| 10 | Wait event | - | EAX=event type |
| 12 | Begin/end redraw | EBX=1/2 | - |
| 13 | Draw rectangle | EBX=x/w, ECX=y/h, EDX=color | - |
| 17 | Get button | - | EAX=button ID |
| 37 | Mouse info | EBX=info type | EAX=info |
| 38 | Draw line | EBX=x1/x2, ECX=y1/y2, EDX=color | - |
| 68 | Memory management | EBX=subfunc, ECX=param | EAX=result |
| 70 | File operations | EBX=info struct | EAX=error |
| -1 | Terminate | - | - |

### Parameter Encoding Patterns

**Position/Size Encoding:**
```assembly
; X/Y position with width/height
value = x_or_y * 65536 + width_or_height
```

**Color Encoding:**
```assembly
; RGB color (24-bit)
color = (red << 16) | (green << 8) | blue
; Example: Red = 0xFF0000, Green = 0x00FF00, Blue = 0x0000FF
```

**Text Flags:**
```assembly
; Text color with flags
text_flags = color | (font << 24) | (flags << 28)
```

This comprehensive guide covers the most important KolibriOS system calls. For complete documentation, refer to `kernel/trunk/docs/sysfuncs.txt` in the KolibriOS source tree. Practice these functions by building small test programs to understand their behavior and return values.