# Building Your First KolibriOS Program

This tutorial will guide you through creating your first KolibriOS application using FASM assembly language. You'll learn the basic structure of a KolibriOS program, understand the system call interface, and build a simple "Hello World" application.

## Table of Contents

1. [Understanding KolibriOS Programs](#understanding-kolibrios-programs)
2. [Program Structure](#program-structure)
3. [System Call Interface](#system-call-interface)
4. [Your First Program: Hello World](#your-first-program-hello-world)
5. [Building and Running](#building-and-running)
6. [Program with GUI Window](#program-with-gui-window)
7. [Event Handling](#event-handling)
8. [Common Patterns](#common-patterns)
9. [Debugging Tips](#debugging-tips)
10. [Next Steps](#next-steps)

## Understanding KolibriOS Programs

KolibriOS programs are quite different from traditional desktop applications:

### Key Characteristics
- **Single Address Space**: No memory protection between kernel and userspace
- **System Calls**: Use `int 0x40` interrupt with function number in EAX
- **Event-Driven**: GUI programs respond to system events
- **Compact**: Programs are typically very small and efficient
- **Direct Hardware Access**: Some operations allow direct hardware control

### Program Types
1. **Console Programs**: Command-line utilities
2. **GUI Applications**: Windowed applications with user interface
3. **System Services**: Background services and drivers
4. **Games**: Entertainment applications

## Program Structure

A typical KolibriOS FASM program has this structure:

```assembly
; Program header and format specification
format PE DLL native 0.05
entry start

; Include files for system definitions
include 'macros.inc'
include 'proc32.inc'
include 'struct.inc'

; Program code section
section '.flat' code readable writable executable

start:
    ; Program initialization
    
main_loop:
    ; Main program loop
    ; Event handling
    ; Program logic
    
    jmp main_loop

; Data section
section '.data' data readable writable
    ; Program variables and data

; Import section (if using libraries)
section '.idata' import data readable
    ; Library imports
```

## System Call Interface

KolibriOS uses a unique system call interface through interrupt `0x40`:

### Basic System Call Pattern
```assembly
mov eax, function_number    ; Function number
mov ebx, parameter1         ; First parameter
mov ecx, parameter2         ; Second parameter
mov edx, parameter3         ; Third parameter
; ... additional parameters in other registers
int 0x40                    ; Call system function
; Result typically returned in EAX
```

### Important System Functions
- **Function 0**: Define and draw window
- **Function 1**: Put pixel
- **Function 2**: Get key from keyboard
- **Function 3**: Get system time
- **Function 4**: Write text string
- **Function 5**: Delay execution
- **Function 10**: Wait for event
- **Function 12**: Begin/end window redraw
- **Function 70**: File system operations

## Your First Program: Hello World

Let's create a simple console program that displays "Hello, KolibriOS!":

### Step 1: Create the Source File

Create `hello.asm`:

```assembly
; hello.asm - Simple Hello World program for KolibriOS
format PE console 0.8

include 'proc32.inc'
include 'import.inc'

start:
    ; Print hello message
    push    hello_msg
    call    [con_write_asciiz]
    
    ; Wait for key press
    push    key_msg
    call    [con_write_asciiz]
    call    [con_getch]
    
    ; Exit program
    push    0
    call    [con_exit]

; Program data
hello_msg   db 'Hello, KolibriOS!', 13, 10, 0
key_msg     db 'Press any key to exit...', 13, 10, 0

; Import console library
align 4
data import
library console, 'console.dll'
import console, \
    con_write_asciiz, 'con_write_asciiz', \
    con_getch, 'con_getch', \
    con_exit, 'con_exit'
end data
```

### Step 2: Understanding the Code

- **Format**: `PE console 0.8` specifies a console application
- **Includes**: Import standard procedure and import definitions
- **con_write_asciiz**: Writes null-terminated string to console
- **con_getch**: Waits for keyboard input
- **con_exit**: Terminates the program
- **Library Import**: Links with console.dll for text I/O

### Step 3: Build the Program

```bash
# Navigate to your project directory
cd /path/to/your/project

# Compile with FASM
fasm hello.asm

# This creates hello (or hello.exe on Windows)
```

### Step 4: Test on KolibriOS

Copy the compiled program to a KolibriOS system and run it from the shell.

## Program with GUI Window

Now let's create a program with a graphical window:

### Step 1: Create GUI Hello World

Create `hello_gui.asm`:

```assembly
; hello_gui.asm - GUI Hello World for KolibriOS
format PE DLL native 0.05
entry start

include 'macros.inc'
include 'proc32.inc'

; Window dimensions
WINDOW_WIDTH    equ 300
WINDOW_HEIGHT   equ 200

section '.flat' code readable writable executable

start:
    ; Program initialization
    call    draw_window

event_loop:
    ; Wait for system event
    mov     eax, 10         ; Function 10: Wait for event
    int     0x40
    
    ; Check event type
    cmp     eax, 1          ; Redraw event
    je      redraw_event
    cmp     eax, 2          ; Key event
    je      key_event
    cmp     eax, 3          ; Button event
    je      button_event
    
    jmp     event_loop

redraw_event:
    call    draw_window
    jmp     event_loop

key_event:
    ; Get key code
    mov     eax, 2          ; Function 2: Get key
    int     0x40
    jmp     event_loop

button_event:
    ; Get button ID
    mov     eax, 17         ; Function 17: Get button
    int     0x40
    
    ; Check if close button (ID = 1)
    cmp     ah, 1
    je      exit_program
    
    jmp     event_loop

draw_window:
    ; Begin window redraw
    mov     eax, 12         ; Function 12: Begin/end redraw
    mov     ebx, 1          ; Begin redraw
    int     0x40
    
    ; Define window
    mov     eax, 0          ; Function 0: Define window
    mov     ebx, 100*65536 + WINDOW_WIDTH     ; X position * 65536 + width
    mov     ecx, 100*65536 + WINDOW_HEIGHT    ; Y position * 65536 + height
    mov     edx, 0x34ffffff ; Window style and color (skinned window, white)
    mov     esi, 0x808899ff ; Header color
    mov     edi, window_title ; Window title
    int     0x40
    
    ; Draw text
    mov     eax, 4          ; Function 4: Write text
    mov     ebx, 50*65536 + 80  ; X*65536 + Y position
    mov     ecx, 0x000000   ; Text color (black)
    mov     edx, hello_text ; Text string
    mov     esi, hello_text_len ; Text length
    int     0x40
    
    ; End window redraw
    mov     eax, 12         ; Function 12: Begin/end redraw
    mov     ebx, 2          ; End redraw
    int     0x40
    
    ret

exit_program:
    ; Terminate program
    mov     eax, -1         ; Function -1: Terminate
    int     0x40

; Program data
window_title    db 'Hello KolibriOS GUI', 0
hello_text      db 'Hello, KolibriOS!'
hello_text_len  = $ - hello_text
```

### Step 2: Understanding GUI Code

- **Event Loop**: Continuously waits for and processes system events
- **Window Definition**: Function 0 creates a window with specified dimensions
- **Event Types**: Redraw (1), Key (2), Button (3)
- **Text Drawing**: Function 4 draws text at specified coordinates
- **Window Redraw**: Functions 12.1 and 12.2 bracket window updates

## Event Handling

KolibriOS uses an event-driven programming model:

### Event Types
```assembly
; Event type constants
REDRAW_EVENT    equ 1       ; Window needs redrawing
KEY_EVENT       equ 2       ; Keyboard input
BUTTON_EVENT    equ 3       ; Button pressed
MOUSE_EVENT     equ 6       ; Mouse activity
IPC_EVENT       equ 7       ; Inter-process communication
NETWORK_EVENT   equ 8       ; Network activity
DEBUG_EVENT     equ 9       ; Debug event
```

### Standard Event Loop Pattern
```assembly
event_loop:
    mov     eax, 10         ; Wait for event
    int     0x40
    
    cmp     eax, REDRAW_EVENT
    je      handle_redraw
    cmp     eax, KEY_EVENT
    je      handle_key
    cmp     eax, BUTTON_EVENT
    je      handle_button
    
    jmp     event_loop      ; Continue loop

handle_redraw:
    call    draw_window
    jmp     event_loop

handle_key:
    mov     eax, 2          ; Get key
    int     0x40
    ; Process key in AH (scan code) and AL (ASCII)
    jmp     event_loop

handle_button:
    mov     eax, 17         ; Get button
    int     0x40
    ; Process button ID in AH
    cmp     ah, 1           ; Close button
    je      exit_program
    jmp     event_loop
```

## Common Patterns

### Memory Allocation
```assembly
; Allocate memory
mov     eax, 68         ; Function 68: Memory management
mov     ebx, 12         ; Subfunc 12: Allocate memory
mov     ecx, size_bytes ; Size to allocate
int     0x40
; Result in EAX (pointer to allocated memory)

; Free memory
mov     eax, 68         ; Function 68: Memory management
mov     ebx, 13         ; Subfunc 13: Free memory
mov     ecx, pointer    ; Pointer to free
int     0x40
```

### File Operations
```assembly
; Read file
mov     eax, 70         ; Function 70: File operations
mov     ebx, file_info  ; Pointer to file info structure
int     0x40

; File info structure
file_info:
    dd  0               ; Function (0 = read)
    dd  0               ; Position (low 32 bits)
    dd  0               ; Position (high 32 bits)
    dd  bytes_to_read   ; Size
    dd  buffer          ; Buffer pointer
    db  0               ; Reserved
    dd  filename        ; Filename pointer
```

### Drawing Graphics
```assembly
; Draw rectangle
mov     eax, 13         ; Function 13: Draw rectangle
mov     ebx, x*65536 + width    ; X and width
mov     ecx, y*65536 + height   ; Y and height
mov     edx, color      ; Color
int     0x40

; Draw line
mov     eax, 38         ; Function 38: Draw line
mov     ebx, x1*65536 + x2      ; Start and end X
mov     ecx, y1*65536 + y2      ; Start and end Y
mov     edx, color      ; Color
int     0x40
```

## Building and Running

### Using FASM Directly
```bash
# Simple compilation
fasm program.asm

# Specify output name
fasm program.asm output_name
```

### Using Tup Build System
```bash
# Initialize Tup in your project directory
tup init

# Create Tupfile.lua for your project
echo "tup.rule('hello.asm', 'fasm %f %o', 'hello')" > Tupfile.lua

# Build
tup
```

### Testing Your Program

#### On Real KolibriOS
1. Copy program to KolibriOS system
2. Run from file manager or shell
3. Observe behavior

#### In Emulator
```bash
# Using QEMU
qemu-system-i386 -hda kolibri.img -boot c

# Copy your program to the image first using mtools
mcopy -i kolibri.img program ::program
```

## Debugging Tips

### Debug Output
```assembly
; Debug message to system log
mov     eax, 63         ; Function 63: Debug output
mov     ebx, 1          ; Subfunc 1: Write character
mov     cl, character   ; Character to write
int     0x40
```

### Common Issues

1. **Program Crashes**: Check system call parameters
2. **Window Doesn't Appear**: Ensure proper window definition
3. **Text Not Visible**: Check color values and coordinates
4. **Event Loop Stuck**: Verify event handling logic

### Debugging Workflow
1. Add debug output at key points
2. Check system function return values
3. Verify memory allocations
4. Test with minimal functionality first

## Next Steps

Now that you can create basic KolibriOS programs:

1. **Learn More System Calls**: Study `kernel/trunk/docs/sysfuncs.txt`
2. **Explore Libraries**: Check `programs/develop/libraries/`
3. **Study Examples**: Look at `programs/demos/` and `programs/develop/examples/`
4. **Try Graphics Programming**: Learn advanced drawing functions
5. **File System Access**: Learn file I/O operations
6. **Network Programming**: Explore socket functions

### Recommended Next Tutorials
- **Understanding System Calls and APIs** - Deep dive into KolibriOS system interface
- **Graphics and GUI Programming** - Advanced window and graphics handling
- **File System Operations** - Working with files and directories
- **Driver Development Basics** - Creating device drivers

### Practice Exercises
1. Create a calculator with GUI buttons
2. Build a simple text editor
3. Make a file browser application
4. Create a graphics demo with animations

Congratulations! You've successfully created your first KolibriOS programs. The foundation you've learned here will serve you well as you explore more advanced KolibriOS development topics.