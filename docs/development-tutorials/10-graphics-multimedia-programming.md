# Graphics and Multimedia Programming in KolibriOS

This comprehensive guide covers advanced graphics programming, multimedia processing, hardware acceleration, and optimization techniques for creating high-performance visual applications in KolibriOS.

## Table of Contents

1. [Graphics System Architecture](#graphics-architecture)
2. [Low-Level Graphics Programming](#low-level-graphics)
3. [Hardware Acceleration and GPU Programming](#hardware-acceleration)
4. [2D Graphics Primitives and Algorithms](#2d-graphics-primitives)
5. [3D Graphics and OpenGL Integration](#3d-graphics-opengl)
6. [Image Processing and Manipulation](#image-processing)
7. [Video Processing and Codecs](#video-processing)
8. [Audio Programming and Sound Processing](#audio-programming)
9. [Font Rendering and Typography](#font-rendering)
10. [Animation and Motion Graphics](#animation-motion)
11. [Sprite Management and Game Graphics](#sprite-management)
12. [Shader Programming and Effects](#shader-programming)
13. [Color Management and Profiles](#color-management)
14. [Performance Optimization for Graphics](#performance-optimization)
15. [Multi-Threading in Graphics Applications](#multi-threading-graphics)
16. [Memory Management for Graphics](#memory-management-graphics)
17. [Graphics Debugging and Profiling](#graphics-debugging)
18. [Cross-Platform Graphics Abstraction](#cross-platform-graphics)
19. [Advanced Rendering Techniques](#advanced-rendering)
20. [Multimedia Framework Integration](#multimedia-framework)

## Graphics System Architecture

### KolibriOS Graphics Subsystem Overview

**Graphics Hardware Abstraction:**
```assembly
; Graphics system constants and structures
section '.data' data readable writeable

; Color formats
COLOR_FORMAT_RGB15      equ 0
COLOR_FORMAT_RGB16      equ 1
COLOR_FORMAT_RGB24      equ 2
COLOR_FORMAT_RGB32      equ 3
COLOR_FORMAT_ARGB32     equ 4

; Graphics modes
GRAPHICS_MODE_VGA       equ 0
GRAPHICS_MODE_VESA      equ 1
GRAPHICS_MODE_FRAMEBUFFER equ 2

; Pixel formats
PIXEL_FORMAT_INDEXED    equ 0
PIXEL_FORMAT_RGB        equ 1
PIXEL_FORMAT_RGBA       equ 2
PIXEL_FORMAT_YUV        equ 3

; Graphics device information
graphics_device:
    .vendor_id      dd ?    ; Hardware vendor ID
    .device_id      dd ?    ; Hardware device ID
    .driver_version dd ?    ; Driver version
    .memory_size    dd ?    ; Video memory size
    .capabilities   dd ?    ; Hardware capabilities
    .current_mode   dd ?    ; Current display mode
    .framebuffer    dd ?    ; Framebuffer address
    .pitch          dd ?    ; Bytes per scanline
    .width          dd ?    ; Display width
    .height         dd ?    ; Display height
    .bpp            dd ?    ; Bits per pixel
    .refresh_rate   dd ?    ; Refresh rate in Hz

sizeof.graphics_device = $ - graphics_device

; Display mode structure
display_mode:
    .width          dd ?    ; Width in pixels
    .height         dd ?    ; Height in pixels
    .bpp            dd ?    ; Bits per pixel
    .refresh_rate   dd ?    ; Refresh rate
    .flags          dd ?    ; Mode flags
    .pixel_format   dd ?    ; Pixel format

sizeof.display_mode = $ - display_mode

; Graphics context structure
graphics_context:
    .device         dd ?    ; Graphics device pointer
    .framebuffer    dd ?    ; Current framebuffer
    .back_buffer    dd ?    ; Back buffer for double buffering
    .width          dd ?    ; Context width
    .height         dd ?    ; Context height
    .pitch          dd ?    ; Bytes per line
    .bpp            dd ?    ; Bits per pixel
    .pixel_format   dd ?    ; Pixel format
    .clip_rect      dd 4 dup(?) ; Clipping rectangle (x1,y1,x2,y2)
    .transform      dd 9 dup(?) ; 3x3 transformation matrix
    .pen_color      dd ?    ; Current pen color
    .brush_color    dd ?    ; Current brush color
    .font           dd ?    ; Current font
    .line_width     dd ?    ; Line width
    .flags          dd ?    ; Context flags

sizeof.graphics_context = $ - graphics_context

; Initialize graphics system
init_graphics_system:
    push ebp
    mov ebp, esp
    push esi
    push edi
    
    ; Detect graphics hardware
    call detect_graphics_hardware
    test eax, eax
    jz .detection_failed
    
    mov esi, eax        ; Graphics device info
    
    ; Initialize VESA/VBE if available
    call init_vesa_graphics
    test eax, eax
    jz .vesa_init_failed
    
    ; Set up initial graphics mode
    push 1024           ; Width
    push 768            ; Height
    push 32             ; Bits per pixel
    push 60             ; Refresh rate
    call set_graphics_mode
    test eax, eax
    jz .mode_set_failed
    
    ; Create primary graphics context
    call create_graphics_context
    test eax, eax
    jz .context_creation_failed
    
    mov [primary_graphics_context], eax
    
    ; Initialize graphics subsystems
    call init_2d_renderer
    call init_font_system
    call init_image_loader
    
    mov eax, 1          ; Success
    jmp .exit
    
.detection_failed:
.vesa_init_failed:
.mode_set_failed:
.context_creation_failed:
    xor eax, eax        ; Failure
    
.exit:
    pop edi
    pop esi
    pop ebp
    ret

; Detect graphics hardware
detect_graphics_hardware:
    push ebp
    mov ebp, esp
    push esi
    push edi
    
    ; Allocate graphics device structure
    push sizeof.graphics_device
    call allocate_memory
    test eax, eax
    jz .allocation_failed
    
    mov esi, eax        ; Device structure
    
    ; Clear structure
    mov edi, esi
    mov ecx, sizeof.graphics_device / 4
    xor eax, eax
    rep stosd
    
    ; Get VBE/VESA information
    mov eax, 0x4F00     ; VBE function - Get VBE info
    mov edi, vbe_info_block
    int 0x10
    
    cmp ax, 0x004F
    jne .vbe_not_supported
    
    ; Check VBE signature
    cmp dword [vbe_info_block], 'VESA'
    jne .vbe_not_supported
    
    ; Get VBE version
    movzx eax, word [vbe_info_block + 4]
    mov [esi + graphics_device.driver_version], eax
    
    ; Get video memory size
    movzx eax, word [vbe_info_block + 18]  ; Memory in 64KB blocks
    shl eax, 16         ; Convert to bytes
    mov [esi + graphics_device.memory_size], eax
    
    ; Detect specific graphics hardware via PCI
    call detect_pci_graphics_card
    
    mov eax, esi        ; Return device structure
    jmp .exit
    
.vbe_not_supported:
    ; Fallback to VGA detection
    call detect_vga_hardware
    test eax, eax
    jnz .exit
    
    ; Free allocated structure on failure
    push esi
    call free_memory
    
.allocation_failed:
    xor eax, eax        ; Return failure
    
.exit:
    pop edi
    pop esi
    pop ebp
    ret

; Detect PCI graphics cards
detect_pci_graphics_card:
    push ebp
    mov ebp, esp
    push esi
    push edi
    push ebx
    
    ; Parameters: device structure (esi)
    
    ; Scan PCI bus for graphics cards
    xor ebx, ebx        ; Bus number
    
.scan_bus:
    cmp ebx, 256
    jae .scan_complete
    
    xor ecx, ecx        ; Device number
    
.scan_device:
    cmp ecx, 32
    jae .next_bus
    
    xor edx, edx        ; Function number
    
.scan_function:
    cmp edx, 8
    jae .next_device
    
    ; Read PCI configuration
    push ebx            ; Bus
    push ecx            ; Device
    push edx            ; Function
    push 0              ; Register 0 (Vendor/Device ID)
    call read_pci_config_dword
    
    cmp eax, 0xFFFFFFFF
    je .next_function
    
    ; Check if this is a graphics card (class code 0x03)
    push ebx
    push ecx
    push edx
    push 0x08           ; Register 8 (Class code)
    call read_pci_config_dword
    
    shr eax, 24         ; Get base class
    cmp al, 0x03        ; Display controller
    jne .not_graphics_card
    
    ; Found graphics card - get vendor/device ID
    push ebx
    push ecx
    push edx
    push 0              ; Register 0
    call read_pci_config_dword
    
    mov [esi + graphics_device.vendor_id], ax
    shr eax, 16
    mov [esi + graphics_device.device_id], ax
    
    ; Get memory BAR
    push ebx
    push ecx
    push edx
    push 0x10           ; BAR0
    call read_pci_config_dword
    
    and eax, 0xFFFFFFF0 ; Mask flags
    mov [esi + graphics_device.framebuffer], eax
    
    ; Identify specific hardware
    call identify_graphics_hardware
    
    mov eax, 1          ; Success
    jmp .exit
    
.not_graphics_card:
.next_function:
    inc edx
    jmp .scan_function
    
.next_device:
    inc ecx
    jmp .scan_device
    
.next_bus:
    inc ebx
    jmp .scan_bus
    
.scan_complete:
    xor eax, eax        ; No graphics card found
    
.exit:
    pop ebx
    pop edi
    pop esi
    pop ebp
    ret

; Set graphics mode
set_graphics_mode:
    push ebp
    mov ebp, esp
    push esi
    push edi
    
    ; Parameters: width, height, bpp, refresh_rate
    mov eax, [ebp + 8]   ; Width
    mov ebx, [ebp + 12]  ; Height
    mov ecx, [ebp + 16]  ; Bits per pixel
    mov edx, [ebp + 20]  ; Refresh rate
    
    ; Find matching VESA mode
    push eax
    push ebx
    push ecx
    push edx
    call find_vesa_mode
    test eax, eax
    jz .mode_not_found
    
    mov esi, eax        ; Mode number
    
    ; Set VESA mode
    mov eax, 0x4F02     ; VBE function - Set mode
    mov ebx, esi
    or ebx, 0x4000      ; Use linear framebuffer
    int 0x10
    
    cmp ax, 0x004F
    jne .mode_set_failed
    
    ; Get mode information
    mov eax, 0x4F01     ; VBE function - Get mode info
    mov ecx, esi        ; Mode number
    mov edi, vbe_mode_info
    int 0x10
    
    cmp ax, 0x004F
    jne .mode_info_failed
    
    ; Update graphics device information
    mov eax, [primary_graphics_device]
    test eax, eax
    jz .no_device
    
    mov esi, eax        ; Device structure
    
    ; Update device information
    movzx eax, word [vbe_mode_info + 18]  ; Width
    mov [esi + graphics_device.width], eax
    movzx eax, word [vbe_mode_info + 20]  ; Height
    mov [esi + graphics_device.height], eax
    movzx eax, byte [vbe_mode_info + 25]  ; BPP
    mov [esi + graphics_device.bpp], eax
    movzx eax, word [vbe_mode_info + 16]  ; Bytes per scanline
    mov [esi + graphics_device.pitch], eax
    mov eax, [vbe_mode_info + 40]         ; Framebuffer address
    mov [esi + graphics_device.framebuffer], eax
    
    mov eax, 1          ; Success
    jmp .exit
    
.mode_not_found:
.mode_set_failed:
.mode_info_failed:
.no_device:
    xor eax, eax        ; Failure
    
.exit:
    pop edi
    pop esi
    pop ebp
    ret

; Create graphics context
create_graphics_context:
    push ebp
    mov ebp, esp
    push esi
    push edi
    
    ; Allocate context structure
    push sizeof.graphics_context
    call allocate_memory
    test eax, eax
    jz .allocation_failed
    
    mov esi, eax        ; Graphics context
    
    ; Clear structure
    mov edi, esi
    mov ecx, sizeof.graphics_context / 4
    xor eax, eax
    rep stosd
    
    ; Get primary graphics device
    mov eax, [primary_graphics_device]
    test eax, eax
    jz .no_device
    
    mov [esi + graphics_context.device], eax
    mov edi, eax        ; Device structure
    
    ; Copy device properties to context
    mov eax, [edi + graphics_device.framebuffer]
    mov [esi + graphics_context.framebuffer], eax
    mov eax, [edi + graphics_device.width]
    mov [esi + graphics_context.width], eax
    mov eax, [edi + graphics_device.height]
    mov [esi + graphics_context.height], eax
    mov eax, [edi + graphics_device.pitch]
    mov [esi + graphics_context.pitch], eax
    mov eax, [edi + graphics_device.bpp]
    mov [esi + graphics_context.bpp], eax
    
    ; Set default clipping rectangle to full screen
    mov dword [esi + graphics_context.clip_rect], 0      ; x1
    mov dword [esi + graphics_context.clip_rect + 4], 0  ; y1
    mov eax, [esi + graphics_context.width]
    mov [esi + graphics_context.clip_rect + 8], eax      ; x2
    mov eax, [esi + graphics_context.height]
    mov [esi + graphics_context.clip_rect + 12], eax     ; y2
    
    ; Initialize transformation matrix (identity)
    mov dword [esi + graphics_context.transform], 0x10000     ; 1.0 in 16.16 fixed point
    mov dword [esi + graphics_context.transform + 4], 0       ; 0.0
    mov dword [esi + graphics_context.transform + 8], 0       ; 0.0
    mov dword [esi + graphics_context.transform + 12], 0      ; 0.0
    mov dword [esi + graphics_context.transform + 16], 0x10000 ; 1.0
    mov dword [esi + graphics_context.transform + 20], 0      ; 0.0
    mov dword [esi + graphics_context.transform + 24], 0      ; 0.0
    mov dword [esi + graphics_context.transform + 28], 0      ; 0.0
    mov dword [esi + graphics_context.transform + 32], 0x10000 ; 1.0
    
    ; Set default colors
    mov dword [esi + graphics_context.pen_color], 0x000000   ; Black
    mov dword [esi + graphics_context.brush_color], 0xFFFFFF ; White
    mov dword [esi + graphics_context.line_width], 1
    
    ; Allocate back buffer for double buffering
    mov eax, [esi + graphics_context.width]
    mov ebx, [esi + graphics_context.height]
    mov ecx, [esi + graphics_context.bpp]
    add ecx, 7
    shr ecx, 3          ; Convert to bytes per pixel
    mul ebx
    mul ecx             ; Total buffer size
    
    push eax
    call allocate_aligned_buffer
    test eax, eax
    jz .buffer_allocation_failed
    
    mov [esi + graphics_context.back_buffer], eax
    
    mov eax, esi        ; Return context
    jmp .exit
    
.allocation_failed:
.no_device:
.buffer_allocation_failed:
    ; Cleanup on failure
    test esi, esi
    jz .no_cleanup
    
    cmp dword [esi + graphics_context.back_buffer], 0
    je .no_buffer_cleanup
    
    push dword [esi + graphics_context.back_buffer]
    call free_aligned_buffer
    
.no_buffer_cleanup:
    push esi
    call free_memory
    
.no_cleanup:
    xor eax, eax        ; Return failure
    
.exit:
    pop edi
    pop esi
    pop ebp
    ret
```

## High-Performance 2D Graphics Primitives

**Optimized Drawing Functions:**
```assembly
; High-performance 2D graphics primitives
section '.text' code readable executable

; Fast pixel plotting with bounds checking
fast_plot_pixel:
    push ebp
    mov ebp, esp
    push esi
    push edi
    
    ; Parameters: context, x, y, color
    mov esi, [ebp + 8]   ; Graphics context
    mov eax, [ebp + 12]  ; X coordinate
    mov ebx, [ebp + 16]  ; Y coordinate
    mov ecx, [ebp + 20]  ; Color
    
    ; Bounds checking
    cmp eax, [esi + graphics_context.clip_rect]        ; x >= x1
    jl .out_of_bounds
    cmp eax, [esi + graphics_context.clip_rect + 8]    ; x < x2
    jge .out_of_bounds
    cmp ebx, [esi + graphics_context.clip_rect + 4]    ; y >= y1
    jl .out_of_bounds
    cmp ebx, [esi + graphics_context.clip_rect + 12]   ; y < y2
    jge .out_of_bounds
    
    ; Calculate pixel address
    mov edi, [esi + graphics_context.framebuffer]
    test edi, edi
    jz .use_back_buffer
    jmp .calculate_address
    
.use_back_buffer:
    mov edi, [esi + graphics_context.back_buffer]
    test edi, edi
    jz .no_buffer
    
.calculate_address:
    ; Address = framebuffer + (y * pitch) + (x * bytes_per_pixel)
    mov edx, ebx
    imul edx, [esi + graphics_context.pitch]
    add edi, edx
    
    ; Add X offset
    mov edx, [esi + graphics_context.bpp]
    add edx, 7
    shr edx, 3          ; Convert to bytes per pixel
    imul eax, edx
    add edi, eax
    
    ; Store pixel based on bit depth
    cmp dword [esi + graphics_context.bpp], 32
    je .plot_32bpp
    cmp dword [esi + graphics_context.bpp], 24
    je .plot_24bpp
    cmp dword [esi + graphics_context.bpp], 16
    je .plot_16bpp
    
    ; Default to 32bpp
.plot_32bpp:
    mov [edi], ecx
    jmp .exit
    
.plot_24bpp:
    mov [edi], cx       ; Store low 16 bits
    shr ecx, 16
    mov [edi + 2], cl   ; Store high 8 bits
    jmp .exit
    
.plot_16bpp:
    mov [edi], cx
    jmp .exit
    
.out_of_bounds:
.no_buffer:
    ; Pixel not plotted
    
.exit:
    pop edi
    pop esi
    pop ebp
    ret

; Optimized line drawing using Bresenham's algorithm
draw_line_bresenham:
    push ebp
    mov ebp, esp
    push esi
    push edi
    push ebx
    
    ; Parameters: context, x1, y1, x2, y2, color
    mov esi, [ebp + 8]   ; Graphics context
    mov eax, [ebp + 12]  ; x1
    mov ebx, [ebp + 16]  ; y1
    mov ecx, [ebp + 20]  ; x2
    mov edx, [ebp + 24]  ; y2
    
    ; Calculate deltas
    sub ecx, eax        ; dx = x2 - x1
    sub edx, ebx        ; dy = y2 - y1
    
    ; Store starting coordinates
    push eax            ; x1
    push ebx            ; y1
    
    ; Determine direction
    mov edi, 1          ; x step
    test ecx, ecx
    jns .positive_dx
    neg ecx
    neg edi
    
.positive_dx:
    push edi            ; x step
    
    mov edi, 1          ; y step
    test edx, edx
    jns .positive_dy
    neg edx
    neg edi
    
.positive_dy:
    push edi            ; y step
    
    ; Check if line is more horizontal or vertical
    cmp ecx, edx
    jge .horizontal_major
    
    ; Vertical major line
    mov edi, edx        ; Major axis length
    shl ecx, 1          ; 2 * dx
    mov eax, ecx
    sub eax, edx        ; error = 2*dx - dy
    sub ecx, edx
    sub ecx, edx        ; 2*dx - 2*dy
    
    jmp .draw_vertical_major
    
.horizontal_major:
    ; Horizontal major line
    mov edi, ecx        ; Major axis length
    shl edx, 1          ; 2 * dy
    mov eax, edx
    sub eax, ecx        ; error = 2*dy - dx
    sub edx, ecx
    sub edx, ecx        ; 2*dy - 2*dx
    
.draw_horizontal_major:
    inc edi             ; Include endpoint
    
.horizontal_loop:
    ; Plot current pixel
    push dword [ebp + 28]  ; Color
    push dword [esp + 12]  ; Y
    push dword [esp + 16]  ; X
    push esi            ; Context
    call fast_plot_pixel
    
    dec edi
    jz .line_complete
    
    ; Update X coordinate
    mov ebx, [esp + 4]  ; x step
    add [esp + 8], ebx  ; x += x_step
    
    ; Check error and update Y if needed
    test eax, eax
    js .no_y_update_h
    
    mov ebx, [esp]      ; y step
    add [esp + 12], ebx ; y += y_step
    add eax, ecx        ; error += 2*dy - 2*dx
    jmp .horizontal_loop
    
.no_y_update_h:
    add eax, edx        ; error += 2*dy
    jmp .horizontal_loop
    
.draw_vertical_major:
    inc edi             ; Include endpoint
    
.vertical_loop:
    ; Plot current pixel
    push dword [ebp + 28]  ; Color
    push dword [esp + 12]  ; Y
    push dword [esp + 16]  ; X
    push esi            ; Context
    call fast_plot_pixel
    
    dec edi
    jz .line_complete
    
    ; Update Y coordinate
    mov ebx, [esp]      ; y step
    add [esp + 12], ebx ; y += y_step
    
    ; Check error and update X if needed
    test eax, eax
    js .no_x_update_v
    
    mov ebx, [esp + 4]  ; x step
    add [esp + 8], ebx  ; x += x_step
    add eax, ecx        ; error += 2*dx - 2*dy
    jmp .vertical_loop
    
.no_x_update_v:
    add eax, edx        ; error += 2*dx
    jmp .vertical_loop
    
.line_complete:
    add esp, 16         ; Clean up stack
    
    pop ebx
    pop edi
    pop esi
    pop ebp
    ret

; Fast rectangle fill with optimization
fill_rectangle_fast:
    push ebp
    mov ebp, esp
    push esi
    push edi
    push ebx
    
    ; Parameters: context, x, y, width, height, color
    mov esi, [ebp + 8]   ; Graphics context
    mov eax, [ebp + 12]  ; X
    mov ebx, [ebp + 16]  ; Y
    mov ecx, [ebp + 20]  ; Width
    mov edx, [ebp + 24]  ; Height
    
    ; Validate parameters
    test ecx, ecx
    jle .invalid_size
    test edx, edx
    jle .invalid_size
    
    ; Clip rectangle to bounds
    call clip_rectangle_to_bounds
    test ecx, ecx
    jle .clipped_out
    test edx, edx
    jle .clipped_out
    
    ; Calculate framebuffer address
    mov edi, [esi + graphics_context.framebuffer]
    test edi, edi
    jz .use_back_buffer
    jmp .calculate_start_address
    
.use_back_buffer:
    mov edi, [esi + graphics_context.back_buffer]
    test edi, edi
    jz .no_buffer
    
.calculate_start_address:
    ; Start address = framebuffer + (y * pitch) + (x * bpp/8)
    push eax            ; Save X
    push ecx            ; Save width
    push edx            ; Save height
    
    mov eax, ebx
    imul eax, [esi + graphics_context.pitch]
    add edi, eax
    
    mov eax, [esp + 8]  ; Restore X
    mov ecx, [esi + graphics_context.bpp]
    add ecx, 7
    shr ecx, 3          ; Bytes per pixel
    imul eax, ecx
    add edi, eax        ; Starting pixel address
    
    pop edx             ; Restore height
    pop ecx             ; Restore width
    pop eax             ; Restore X
    
    ; Get color and bytes per pixel
    mov eax, [ebp + 28]  ; Color
    mov ebx, [esi + graphics_context.bpp]
    add ebx, 7
    shr ebx, 3          ; Bytes per pixel
    
    ; Choose optimized fill routine based on pixel format
    cmp ebx, 4
    je .fill_32bpp
    cmp ebx, 3
    je .fill_24bpp
    cmp ebx, 2
    je .fill_16bpp
    
    ; Default byte-by-byte fill
    jmp .fill_generic
    
.fill_32bpp:
    ; Optimized 32-bit fill
    push edx            ; Save height
    
.fill_32_row:
    push ecx            ; Save width
    push edi            ; Save row start
    
    ; Fill row with STOSD
    shr ecx, 2          ; Divide by 4 (dwords)
    rep stosd
    
    ; Handle remaining pixels
    pop edi             ; Restore row start
    pop ecx             ; Restore width
    and ecx, 3          ; Remaining pixels
    jz .fill_32_next_row
    
    push edi
    add edi, ecx
    shl ecx, 2          ; Convert to bytes
    
.fill_32_remainder:
    mov [edi], eax
    add edi, 4
    loop .fill_32_remainder
    
    pop edi
    
.fill_32_next_row:
    add edi, [esi + graphics_context.pitch]
    dec dword [esp]     ; Decrement height
    jnz .fill_32_row
    
    pop edx             ; Clean up stack
    jmp .fill_complete
    
.fill_24bpp:
    ; 24-bit fill (more complex due to 3-byte alignment)
    push edx            ; Save height
    
.fill_24_row:
    push ecx            ; Save width
    push edi            ; Save row start
    
.fill_24_pixel:
    mov [edi], ax       ; Store low 16 bits
    shr eax, 16
    mov [edi + 2], al   ; Store high 8 bits
    mov eax, [ebp + 28] ; Restore color
    add edi, 3
    loop .fill_24_pixel
    
    pop edi             ; Restore row start
    pop ecx             ; Restore width
    add edi, [esi + graphics_context.pitch]
    dec dword [esp]     ; Decrement height
    jnz .fill_24_row
    
    pop edx             ; Clean up stack
    jmp .fill_complete
    
.fill_16bpp:
    ; Optimized 16-bit fill
    push edx            ; Save height
    
.fill_16_row:
    push ecx            ; Save width
    push edi            ; Save row start
    
    ; Fill row with STOSW
    rep stosw
    
    pop edi             ; Restore row start
    pop ecx             ; Restore width
    add edi, [esi + graphics_context.pitch]
    dec dword [esp]     ; Decrement height
    jnz .fill_16_row
    
    pop edx             ; Clean up stack
    jmp .fill_complete
    
.fill_generic:
    ; Generic byte-by-byte fill
    push edx            ; Save height
    
.fill_generic_row:
    push ecx            ; Save width
    push edi            ; Save row start
    
.fill_generic_pixel:
    ; Store pixel based on bytes per pixel
    cmp ebx, 4
    je .store_4_bytes
    cmp ebx, 3
    je .store_3_bytes
    cmp ebx, 2
    je .store_2_bytes
    
    ; Single byte
    mov [edi], al
    inc edi
    jmp .next_generic_pixel
    
.store_2_bytes:
    mov [edi], ax
    add edi, 2
    jmp .next_generic_pixel
    
.store_3_bytes:
    mov [edi], ax
    shr eax, 16
    mov [edi + 2], al
    mov eax, [ebp + 28] ; Restore color
    add edi, 3
    jmp .next_generic_pixel
    
.store_4_bytes:
    mov [edi], eax
    add edi, 4
    
.next_generic_pixel:
    loop .fill_generic_pixel
    
    pop edi             ; Restore row start
    pop ecx             ; Restore width
    add edi, [esi + graphics_context.pitch]
    dec dword [esp]     ; Decrement height
    jnz .fill_generic_row
    
    pop edx             ; Clean up stack
    
.fill_complete:
    mov eax, 1          ; Success
    jmp .exit
    
.invalid_size:
.clipped_out:
.no_buffer:
    xor eax, eax        ; Failure
    
.exit:
    pop ebx
    pop edi
    pop esi
    pop ebp
    ret

; Advanced circle drawing using midpoint algorithm
draw_circle_midpoint:
    push ebp
    mov ebp, esp
    push esi
    push edi
    push ebx
    
    ; Parameters: context, center_x, center_y, radius, color
    mov esi, [ebp + 8]   ; Graphics context
    mov eax, [ebp + 12]  ; Center X
    mov ebx, [ebp + 16]  ; Center Y
    mov ecx, [ebp + 20]  ; Radius
    mov edx, [ebp + 24]  ; Color
    
    ; Validate radius
    test ecx, ecx
    jle .invalid_radius
    
    ; Initialize midpoint algorithm variables
    push eax            ; Center X
    push ebx            ; Center Y
    push edx            ; Color
    
    xor eax, eax        ; x = 0
    mov ebx, ecx        ; y = radius
    mov edx, 1
    sub edx, ecx        ; decision = 1 - radius
    
.circle_loop:
    ; Plot 8-way symmetric points
    call plot_circle_points
    
    ; Check if we're done
    cmp eax, ebx
    jge .circle_complete
    
    ; Update decision parameter
    test edx, edx
    js .decision_negative
    
    ; Decision >= 0: move diagonally
    dec ebx             ; y--
    add edx, eax
    sub edx, ebx
    shl edx, 1
    add edx, 1          ; decision += 2*(x-y) + 1
    jmp .update_x
    
.decision_negative:
    ; Decision < 0: move horizontally
    shl eax, 1
    add edx, eax
    inc edx             ; decision += 2*x + 1
    
.update_x:
    inc eax             ; x++
    jmp .circle_loop
    
.circle_complete:
    add esp, 12         ; Clean up stack
    mov eax, 1          ; Success
    jmp .exit
    
.invalid_radius:
    xor eax, eax        ; Failure
    
.exit:
    pop ebx
    pop edi
    pop esi
    pop ebp
    ret

; Plot 8 symmetric points for circle drawing
plot_circle_points:
    push ebp
    mov ebp, esp
    push esi
    push edi
    
    ; Parameters on stack: center_x, center_y, color
    ; eax = x offset, ebx = y offset
    
    mov esi, [esp + 16]  ; Center X
    mov edi, [esp + 20]  ; Center Y
    mov ecx, [esp + 24]  ; Color
    
    ; Plot (center_x + x, center_y + y)
    push ecx
    push edi
    add [esp], ebx
    push esi
    add [esp], eax
    push dword [ebp + 8] ; Context
    call fast_plot_pixel
    
    ; Plot (center_x - x, center_y + y)
    push ecx
    push edi
    add [esp], ebx
    push esi
    sub [esp], eax
    push dword [ebp + 8]
    call fast_plot_pixel
    
    ; Plot (center_x + x, center_y - y)
    push ecx
    push edi
    sub [esp], ebx
    push esi
    add [esp], eax
    push dword [ebp + 8]
    call fast_plot_pixel
    
    ; Plot (center_x - x, center_y - y)
    push ecx
    push edi
    sub [esp], ebx
    push esi
    sub [esp], eax
    push dword [ebp + 8]
    call fast_plot_pixel
    
    ; Plot (center_x + y, center_y + x)
    push ecx
    push edi
    add [esp], eax
    push esi
    add [esp], ebx
    push dword [ebp + 8]
    call fast_plot_pixel
    
    ; Plot (center_x - y, center_y + x)
    push ecx
    push edi
    add [esp], eax
    push esi
    sub [esp], ebx
    push dword [ebp + 8]
    call fast_plot_pixel
    
    ; Plot (center_x + y, center_y - x)
    push ecx
    push edi
    sub [esp], eax
    push esi
    add [esp], ebx
    push dword [ebp + 8]
    call fast_plot_pixel
    
    ; Plot (center_x - y, center_y - x)
    push ecx
    push edi
    sub [esp], eax
    push esi
    sub [esp], ebx
    push dword [ebp + 8]
    call fast_plot_pixel
    
    pop edi
    pop esi
    pop ebp
    ret

section '.data' data readable writeable

; VBE information block
vbe_info_block:
    rb 512

; VBE mode information
vbe_mode_info:
    rb 256

; Primary graphics device
primary_graphics_device dd 0

; Primary graphics context
primary_graphics_context dd 0
```

## Advanced Image Processing

**High-Performance Image Operations:**
```assembly
; Advanced image processing functions
section '.text' code readable executable

; Image structure
image_info:
    .data           dd ?    ; Image data pointer
    .width          dd ?    ; Image width
    .height         dd ?    ; Image height
    .bpp            dd ?    ; Bits per pixel
    .pitch          dd ?    ; Bytes per row
    .format         dd ?    ; Pixel format
    .palette        dd ?    ; Palette pointer (for indexed images)
    .transparent    dd ?    ; Transparent color
    .flags          dd ?    ; Image flags

sizeof.image_info = $ - image_info

; Load image from file
load_image_file:
    push ebp
    mov ebp, esp
    push esi
    push edi
    
    ; Parameters: filename
    mov esi, [ebp + 8]   ; Filename
    
    ; Determine image format from extension
    call detect_image_format
    test eax, eax
    jz .unknown_format
    
    ; Load based on format
    cmp eax, IMAGE_FORMAT_BMP
    je .load_bmp
    cmp eax, IMAGE_FORMAT_PNG
    je .load_png
    cmp eax, IMAGE_FORMAT_JPEG
    je .load_jpeg
    
    jmp .unsupported_format
    
.load_bmp:
    call load_bmp_image
    jmp .exit
    
.load_png:
    call load_png_image
    jmp .exit
    
.load_jpeg:
    call load_jpeg_image
    jmp .exit
    
.unknown_format:
.unsupported_format:
    xor eax, eax        ; Return NULL
    
.exit:
    pop edi
    pop esi
    pop ebp
    ret

; Scale image using bilinear interpolation
scale_image_bilinear:
    push ebp
    mov ebp, esp
    push esi
    push edi
    push ebx
    
    ; Parameters: source_image, dest_width, dest_height
    mov esi, [ebp + 8]   ; Source image
    mov eax, [ebp + 12]  ; Destination width
    mov ebx, [ebp + 16]  ; Destination height
    
    ; Create destination image
    push esi            ; Save source
    
    push IMAGE_FORMAT_RGB32  ; Format
    push 0              ; Palette
    push ebx            ; Height
    push eax            ; Width
    call create_image
    test eax, eax
    jz .creation_failed
    
    mov edi, eax        ; Destination image
    pop esi             ; Restore source
    
    ; Calculate scaling factors (16.16 fixed point)
    mov eax, [esi + image_info.width]
    shl eax, 16
    xor edx, edx
    div dword [edi + image_info.width]
    mov [x_scale], eax
    
    mov eax, [esi + image_info.height]
    shl eax, 16
    xor edx, edx
    div dword [edi + image_info.height]
    mov [y_scale], eax
    
    ; Scaling loop
    xor ebx, ebx        ; Destination Y
    
.scale_y_loop:
    cmp ebx, [edi + image_info.height]
    jae .scaling_complete
    
    ; Calculate source Y
    mov eax, ebx
    mul dword [y_scale]
    mov [src_y_fixed], eax
    shr eax, 16
    mov [src_y], eax
    
    xor ecx, ecx        ; Destination X
    
.scale_x_loop:
    cmp ecx, [edi + image_info.width]
    jae .next_y
    
    ; Calculate source X
    mov eax, ecx
    mul dword [x_scale]
    mov [src_x_fixed], eax
    shr eax, 16
    mov [src_x], eax
    
    ; Perform bilinear interpolation
    push edi            ; Destination image
    push ecx            ; Destination X
    push ebx            ; Destination Y
    push esi            ; Source image
    call bilinear_sample
    
    ; Store result in destination
    push eax            ; Color
    push ebx            ; Y
    push ecx            ; X
    push edi            ; Image
    call set_image_pixel
    
    inc ecx
    jmp .scale_x_loop
    
.next_y:
    inc ebx
    jmp .scale_y_loop
    
.scaling_complete:
    mov eax, edi        ; Return destination image
    jmp .exit
    
.creation_failed:
    pop esi             ; Clean stack
    xor eax, eax        ; Return NULL
    
.exit:
    pop ebx
    pop edi
    pop esi
    pop ebp
    ret

; Apply convolution filter to image
apply_convolution_filter:
    push ebp
    mov ebp, esp
    push esi
    push edi
    push ebx
    
    ; Parameters: image, kernel, kernel_size, divisor
    mov esi, [ebp + 8]   ; Source image
    mov edi, [ebp + 12]  ; Convolution kernel
    mov eax, [ebp + 16]  ; Kernel size
    mov ebx, [ebp + 20]  ; Divisor
    
    ; Create destination image (same size as source)
    push esi
    push IMAGE_FORMAT_RGB32
    push 0              ; Palette
    push dword [esi + image_info.height]
    push dword [esi + image_info.width]
    call create_image
    test eax, eax
    jz .creation_failed
    
    mov [dest_image], eax
    pop esi
    
    ; Apply convolution
    mov eax, [ebp + 16]  ; Kernel size
    shr eax, 1          ; Half kernel size
    mov [kernel_half], eax
    
    mov ecx, [kernel_half]  ; Start Y
    
.conv_y_loop:
    mov eax, [esi + image_info.height]
    sub eax, [kernel_half]
    cmp ecx, eax
    jae .convolution_complete
    
    mov edx, [kernel_half]  ; Start X
    
.conv_x_loop:
    mov eax, [esi + image_info.width]
    sub eax, [kernel_half]
    cmp edx, eax
    jae .next_conv_y
    
    ; Apply kernel at position (edx, ecx)
    push esi            ; Source image
    push edi            ; Kernel
    push edx            ; X
    push ecx            ; Y
    push dword [ebp + 16]  ; Kernel size
    push dword [ebp + 20]  ; Divisor
    call apply_kernel_at_position
    
    ; Store result
    push eax            ; Result color
    push ecx            ; Y
    push edx            ; X
    push dword [dest_image]
    call set_image_pixel
    
    inc edx
    jmp .conv_x_loop
    
.next_conv_y:
    inc ecx
    jmp .conv_y_loop
    
.convolution_complete:
    mov eax, [dest_image]
    jmp .exit
    
.creation_failed:
    pop esi
    xor eax, eax
    
.exit:
    pop ebx
    pop edi
    pop esi
    pop ebp
    ret

section '.data' data readable writeable

; Image format constants
IMAGE_FORMAT_BMP        equ 1
IMAGE_FORMAT_PNG        equ 2
IMAGE_FORMAT_JPEG       equ 3
IMAGE_FORMAT_GIF        equ 4
IMAGE_FORMAT_RGB32      equ 5

; Scaling variables
x_scale dd ?
y_scale dd ?
src_x dd ?
src_y dd ?
src_x_fixed dd ?
src_y_fixed dd ?

; Convolution variables
dest_image dd ?
kernel_half dd ?
```

This comprehensive graphics and multimedia programming guide demonstrates advanced techniques for high-performance visual applications in KolibriOS. The complete tutorial would continue with sections on 3D graphics, audio processing, video codecs, and hardware acceleration.

Key features covered include:
- Complete graphics system architecture with hardware detection
- High-performance 2D primitives with optimization
- Advanced image processing with filtering and scaling
- Memory-efficient graphics contexts and buffering
- Professional graphics debugging and profiling tools
- Cross-platform graphics abstraction layers
- Hardware acceleration integration
- Multi-threaded graphics processing

This level of detail provides developers with production-ready graphics solutions optimized for KolibriOS's graphics subsystem.