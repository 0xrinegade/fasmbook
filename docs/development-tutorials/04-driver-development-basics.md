# Driver Development Basics for KolibriOS

This tutorial covers the fundamentals of developing device drivers for KolibriOS. You'll learn the driver architecture, understand the driver template, and create a simple example driver.

## Table of Contents

1. [Driver Architecture Overview](#driver-architecture-overview)
2. [Driver Structure and Format](#driver-structure-and-format)
3. [Driver Template Analysis](#driver-template-analysis)
4. [Driver Entry Points](#driver-entry-points)
5. [Hardware Access](#hardware-access)
6. [Creating a Simple Driver](#creating-a-simple-driver)
7. [Driver Services](#driver-services)
8. [Debugging Drivers](#debugging-drivers)
9. [Installation and Loading](#installation-and-loading)
10. [Best Practices](#best-practices)
11. [Advanced Topics](#advanced-topics)

## Driver Architecture Overview

KolibriOS drivers are implemented as PE DLL (Portable Executable Dynamic Link Library) files that interface between the kernel and hardware devices.

### Key Characteristics
- **PE DLL Format**: Standard Windows PE format for compatibility
- **Kernel Space**: Drivers run in kernel address space (Ring 0)
- **Single Address Space**: No memory protection between driver and kernel
- **Event-Driven**: Respond to hardware interrupts and service requests
- **Dynamic Loading**: Can be loaded and unloaded at runtime

### Driver Types
1. **Device Drivers**: Hardware device control (network, audio, video)
2. **File System Drivers**: File system implementations
3. **Filter Drivers**: Intercept and modify I/O operations
4. **Virtual Drivers**: Software-only functionality

### Driver Model
```
Application Layer
       ↓
System Calls (INT 0x40)
       ↓
Kernel Services
       ↓
Driver Interface
       ↓
Hardware Abstraction Layer
       ↓
Physical Hardware
```

## Driver Structure and Format

### Basic Driver Template Structure
```assembly
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;                                                              ;;
;; Copyright (C) KolibriOS team. All rights reserved.          ;;
;;                                                              ;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

format PE DLL native 0.05
entry START

; Driver version and API information
API_VERSION     equ 0       ; Driver API version
DRIVER_VERSION  equ 1       ; This driver's version

; Service function codes  
SRV_GETVERSION  equ 0       ; Get driver version
SRV_HOOK        equ 1       ; Install interrupt handler
SRV_UNHOOK      equ 2       ; Remove interrupt handler

section '.flat' code readable writable executable

; Include necessary files
include 'proc32.inc'
include 'struct.inc'
include 'macros.inc'
include 'peimport.inc'

; Driver entry point
proc START c, state:dword, cmdline:dword
    ; ... driver initialization code ...
endp

; Service procedure - main driver interface
proc service_proc stdcall, ioctl:dword
    ; ... service handling code ...
endp

; Hardware detection procedure
proc detect
    ; ... hardware detection code ...
endp

; Interrupt service routine
proc my_interrupt
    ; ... interrupt handling code ...
endp

; Driver data section
section '.data' data readable writable
    ; Driver variables and data structures

; Import section
section '.idata' import data readable
    ; Kernel function imports
```

## Driver Template Analysis

Let's examine the KolibriOS driver skeleton (`drivers/sceletone.asm`):

### Entry Point Function
```assembly
proc START c, state:dword, cmdline:dword
    cmp [state], 1              ; Check if this is driver load
    jne .exit                   ; Exit if not loading
    
.entry:
    push esi
    
    if DEBUG
        mov esi, msgInit
        invoke SysMsgBoardStr   ; Debug output
    end if
    
    call detect                 ; Detect hardware
    pop esi
    test eax, eax
    jz .fail                    ; Exit if hardware not found
    
    invoke RegService, my_service, service_proc
    ret                         ; Return success
    
.fail:
.exit:
    xor eax, eax               ; Return failure
    ret
endp
```

### Hardware Detection
```assembly
proc detect
    ; PCI device detection example
    invoke PciApi, 0           ; Get PCI API version
    cmp eax, 0x20000           ; Check minimum version
    jb .no_device
    
    ; Search for specific device
    mov ebx, pci_device_list
    invoke PciRead32, [bus], [dev], 0  ; Read vendor/device ID
    
    ; Check against known devices
.check_device:
    mov esi, [ebx]             ; Get device ID from list
    cmp esi, -1                ; End of list?
    je .no_device
    
    cmp eax, esi               ; Match found?
    je .device_found
    
    add ebx, 4                 ; Next device in list
    jmp .check_device
    
.device_found:
    ; Device found - perform additional setup
    mov eax, 1                 ; Return success
    ret
    
.no_device:
    xor eax, eax               ; Return failure
    ret
endp
```

### Service Procedure
```assembly
proc service_proc stdcall, ioctl:dword
    mov ebx, [ioctl]           ; Get IOCTL structure
    mov eax, [ebx+IOCTL.io_code]  ; Get service code
    
    cmp eax, SRV_GETVERSION
    je .get_version
    cmp eax, SRV_HOOK
    je .hook_interrupt
    cmp eax, SRV_UNHOOK
    je .unhook_interrupt
    
    ; Unknown service
    or eax, -1                 ; Return error
    ret
    
.get_version:
    mov eax, DRIVER_VERSION
    ret
    
.hook_interrupt:
    ; Install interrupt handler
    invoke AttachIntHandler, [irq_line], my_interrupt, 0
    ret
    
.unhook_interrupt:
    ; Remove interrupt handler
    ; Implementation depends on specific needs
    ret
endp
```

## Driver Entry Points

### START Procedure
The main entry point called when the driver is loaded:

```assembly
proc START c, state:dword, cmdline:dword
    ; Parameters:
    ; state    - Driver state (1 = load, 0 = unload)
    ; cmdline  - Command line parameters (usually unused)
    
    ; Return values:
    ; EAX = 0  - Driver initialization failed
    ; EAX != 0 - Driver successfully initialized
```

### Service Procedure
Handles service requests from applications and kernel:

```assembly
proc service_proc stdcall, ioctl:dword
    ; Parameter:
    ; ioctl - Pointer to IOCTL structure
    
    ; IOCTL structure:
    struc IOCTL
        .handle         dd ?    ; Device handle
        .io_code        dd ?    ; Service code
        .input          dd ?    ; Input buffer
        .inp_size       dd ?    ; Input buffer size
        .output         dd ?    ; Output buffer
        .out_size       dd ?    ; Output buffer size
    ends
```

## Hardware Access

### PCI Configuration Access
```assembly
; Read PCI configuration space
invoke PciRead32, bus, device, offset
; Returns: EAX = 32-bit value

invoke PciRead16, bus, device, offset
; Returns: AX = 16-bit value

invoke PciRead8, bus, device, offset
; Returns: AL = 8-bit value

; Write PCI configuration space
invoke PciWrite32, bus, device, offset, value
invoke PciWrite16, bus, device, offset, value
invoke PciWrite8, bus, device, offset, value
```

### Memory-Mapped I/O
```assembly
; Map physical memory to virtual address
invoke MapIoMem, physical_address, size, flags
; Returns: EAX = virtual address (0 if failed)

; Example: Map device registers
mov eax, [pci_bar0]            ; Get BAR0 from PCI config
and eax, 0xFFFFFFF0            ; Clear flags
invoke MapIoMem, eax, 0x1000, PG_SW + PG_NOCACHE
mov [device_regs], eax         ; Store virtual address
```

### Port I/O Access
```assembly
; Read from I/O port
mov dx, port_number
in al, dx                      ; Read 8-bit
in ax, dx                      ; Read 16-bit
in eax, dx                     ; Read 32-bit

; Write to I/O port
mov dx, port_number
mov al, value
out dx, al                     ; Write 8-bit
```

### Interrupt Management
```assembly
; Install interrupt handler
invoke AttachIntHandler, irq_number, handler_proc, device_data
; Returns: EAX = 0 if successful

; Interrupt service routine template
proc interrupt_handler
    push eax
    push ebx
    push ecx
    push edx
    
    ; Read interrupt status
    mov ebx, [device_regs]
    mov eax, [ebx + INT_STATUS_REG]
    
    ; Check if this device caused interrupt
    test eax, INT_PENDING_BIT
    jz .not_ours
    
    ; Handle specific interrupts
    test eax, RX_INT_BIT
    jnz .handle_rx
    
    test eax, TX_INT_BIT
    jnz .handle_tx
    
.handle_rx:
    ; Handle receive interrupt
    call process_received_data
    jmp .ack_interrupt
    
.handle_tx:
    ; Handle transmit interrupt
    call process_transmit_complete
    
.ack_interrupt:
    ; Clear interrupt status
    mov [ebx + INT_STATUS_REG], eax
    
.not_ours:
    pop edx
    pop ecx
    pop ebx
    pop eax
    ret
endp
```

## Creating a Simple Driver

Let's create a simple example driver for a fictional device:

### Step 1: Define Driver Constants
```assembly
; simple_driver.asm - Example KolibriOS driver

format PE DLL native 0.05
entry START

; Driver information
API_VERSION     equ 0
DRIVER_VERSION  equ 0x0100

; PCI device information
VENDOR_ID       equ 0x1234      ; Example vendor ID
DEVICE_ID       equ 0x5678      ; Example device ID

; Service codes
SRV_GETVERSION  equ 0
SRV_INITIALIZE  equ 1
SRV_READ_REG    equ 2
SRV_WRITE_REG   equ 3

; Device registers (example)
REG_CONTROL     equ 0x00
REG_STATUS      equ 0x04
REG_DATA        equ 0x08

section '.flat' code readable writable executable
include 'proc32.inc'
include 'struct.inc'
include 'macros.inc'
include 'peimport.inc'
```

### Step 2: Implement Entry Point
```assembly
proc START c, state:dword, cmdline:dword
    cmp [state], 1
    jne .exit

    if DEBUG
        mov esi, msg_loading
        invoke SysMsgBoardStr
    end if

    call detect_device
    test eax, eax
    jz .no_device

    ; Initialize device
    call init_device
    test eax, eax
    jz .init_failed

    ; Register service
    invoke RegService, service_name, service_proc
    
    if DEBUG
        mov esi, msg_loaded
        invoke SysMsgBoardStr
    end if
    
    mov eax, 1                  ; Success
    ret

.no_device:
    if DEBUG
        mov esi, msg_no_device
        invoke SysMsgBoardStr
    end if
    jmp .exit

.init_failed:
    if DEBUG
        mov esi, msg_init_failed
        invoke SysMsgBoardStr
    end if

.exit:
    xor eax, eax                ; Failure
    ret
endp
```

### Step 3: Hardware Detection
```assembly
proc detect_device
    ; Get PCI API
    invoke PciApi, 0
    cmp eax, 0x20000
    jb .no_pci
    
    ; Search for device
    xor ebx, ebx                ; Start with bus 0
    
.check_bus:
    cmp ebx, 256                ; Check all buses
    jae .not_found
    
    xor ecx, ecx                ; Start with device 0
    
.check_device:
    cmp ecx, 32                 ; Check all devices
    jae .next_bus
    
    ; Read vendor/device ID
    invoke PciRead32, ebx, ecx, 0
    cmp eax, 0xFFFFFFFF
    je .next_device
    
    ; Check if it's our device
    cmp ax, VENDOR_ID
    jne .next_device
    shr eax, 16
    cmp ax, DEVICE_ID
    je .found_device
    
.next_device:
    inc ecx
    jmp .check_device
    
.next_bus:
    inc ebx
    jmp .check_bus
    
.found_device:
    ; Store bus and device numbers
    mov [pci_bus], ebx
    mov [pci_dev], ecx
    
    ; Get device resources
    invoke PciRead32, ebx, ecx, 0x10  ; Read BAR0
    and eax, 0xFFFFFFF0               ; Clear flags
    mov [device_base], eax
    
    mov eax, 1                        ; Success
    ret
    
.not_found:
.no_pci:
    xor eax, eax                      ; Failure
    ret
endp
```

### Step 4: Device Initialization
```assembly
proc init_device
    ; Map device memory
    invoke MapIoMem, [device_base], 0x1000, PG_SW + PG_NOCACHE
    test eax, eax
    jz .map_failed
    mov [device_regs], eax
    
    ; Reset device
    mov ebx, [device_regs]
    mov dword [ebx + REG_CONTROL], 0x80000000  ; Reset bit
    
    ; Wait for reset to complete
    mov ecx, 1000
.wait_reset:
    mov eax, [ebx + REG_CONTROL]
    test eax, 0x80000000
    jz .reset_complete
    invoke Sleep, 1
    loop .wait_reset
    jmp .reset_timeout
    
.reset_complete:
    ; Initialize device registers
    mov dword [ebx + REG_CONTROL], 0x00000001  ; Enable device
    
    mov eax, 1                        ; Success
    ret
    
.reset_timeout:
.map_failed:
    xor eax, eax                      ; Failure
    ret
endp
```

### Step 5: Service Handler
```assembly
proc service_proc stdcall, ioctl:dword
    mov ebx, [ioctl]
    mov eax, [ebx + IOCTL.io_code]
    
    cmp eax, SRV_GETVERSION
    je .get_version
    cmp eax, SRV_INITIALIZE
    je .initialize
    cmp eax, SRV_READ_REG
    je .read_register
    cmp eax, SRV_WRITE_REG
    je .write_register
    
    or eax, -1                        ; Unknown service
    ret
    
.get_version:
    mov eax, DRIVER_VERSION
    ret
    
.initialize:
    call init_device
    ret
    
.read_register:
    mov ecx, [ebx + IOCTL.input]      ; Get register offset
    mov ecx, [ecx]
    mov edx, [device_regs]
    mov eax, [edx + ecx]              ; Read register
    
    mov ecx, [ebx + IOCTL.output]     ; Store result
    mov [ecx], eax
    xor eax, eax                      ; Success
    ret
    
.write_register:
    mov ecx, [ebx + IOCTL.input]      ; Get parameters
    mov edx, [ecx]                    ; Register offset
    mov eax, [ecx + 4]                ; Value to write
    
    mov ecx, [device_regs]
    mov [ecx + edx], eax              ; Write register
    xor eax, eax                      ; Success
    ret
endp
```

## Driver Services

### Standard Service Codes
Most drivers should implement these basic services:

```assembly
SRV_GETVERSION  equ 0   ; Get driver version
SRV_HOOK        equ 1   ; Install service
SRV_UNHOOK      equ 2   ; Remove service
```

### Custom Service Implementation
```assembly
; Define custom services for your driver
SRV_GET_INFO    equ 16  ; Get device information
SRV_SET_MODE    equ 17  ; Set device mode
SRV_READ_DATA   equ 18  ; Read data from device
SRV_WRITE_DATA  equ 19  ; Write data to device

; Implement in service_proc
.get_info:
    mov ecx, [ebx + IOCTL.output]
    mov edx, [ebx + IOCTL.out_size]
    cmp edx, sizeof.DEVICE_INFO
    jb .buffer_too_small
    
    ; Fill device information structure
    mov [ecx + DEVICE_INFO.vendor_id], VENDOR_ID
    mov [ecx + DEVICE_INFO.device_id], DEVICE_ID
    ; ... fill other fields ...
    
    xor eax, eax
    ret
```

## Debugging Drivers

### Debug Output
```assembly
if DEBUG
    msg_loading     db 'Simple Driver: Loading...', 13, 10, 0
    msg_loaded      db 'Simple Driver: Loaded successfully', 13, 10, 0
    msg_no_device   db 'Simple Driver: Device not found', 13, 10, 0
    msg_init_failed db 'Simple Driver: Initialization failed', 13, 10, 0
end if

; Use SysMsgBoardStr for debug output
if DEBUG
    mov esi, debug_message
    invoke SysMsgBoardStr
end if
```

### Debug Techniques
1. **Print debugging**: Use SysMsgBoardStr for status messages
2. **Register dumps**: Display device register values
3. **Error codes**: Return specific error codes for different failures
4. **Conditional compilation**: Use DEBUG flag for debug code

### Common Issues
- **Driver won't load**: Check PE format and entry point
- **Device not detected**: Verify PCI vendor/device IDs
- **Memory mapping fails**: Check physical address alignment
- **Interrupts not working**: Verify IRQ number and handler installation

## Installation and Loading

### Manual Loading
```assembly
; Load driver using system call
mov eax, 70                     ; File operation
mov ebx, driver_load_info
int 0x40

driver_load_info:
    dd 7                        ; Load and execute
    dd 0, 0, 0                  ; Position and size (unused)
    dd 0                        ; Buffer (unused)
    db 0
    dd driver_path              ; Driver file path

driver_path db '/rd/1/drivers/mydriver.obj', 0
```

### Automatic Loading
Add your driver to the system autoload by placing it in `/rd/1/drivers/` and adding an entry to the system configuration.

### Driver Location
- `/rd/1/drivers/` - Main driver directory
- `/hd0/1/drivers/` - Hard disk driver directory
- Custom paths specified in system configuration

## Best Practices

### 1. Resource Management
```assembly
; Always clean up resources
proc cleanup_driver
    ; Unmap memory
    cmp [device_regs], 0
    je .no_unmap
    invoke FreeKernelSpace, [device_regs]
    mov [device_regs], 0
    
.no_unmap:
    ; Free allocated memory
    cmp [driver_data], 0
    je .no_free
    invoke KernelFree, [driver_data]
    mov [driver_data], 0
    
.no_free:
    ret
endp
```

### 2. Error Handling
```assembly
; Always check return values
invoke MapIoMem, physical_addr, size, flags
test eax, eax
jz .mapping_failed
mov [virtual_addr], eax

; Use consistent error codes
ERROR_SUCCESS       equ 0
ERROR_INVALID_PARAM equ -1
ERROR_NO_MEMORY     equ -2
ERROR_DEVICE_ERROR  equ -3
```

### 3. Thread Safety
```assembly
; Use synchronization for shared resources
driver_lock dd 0

proc acquire_lock
    mov eax, 1
.spin:
    xchg eax, [driver_lock]
    test eax, eax
    jnz .spin
    ret
endp

proc release_lock
    mov [driver_lock], 0
    ret
endp
```

### 4. Documentation
```assembly
; Document your service codes and structures
;
; Service Codes:
; SRV_GETVERSION (0) - Returns driver version in EAX
; SRV_READ_REG (2)   - Reads device register
;   Input: DWORD register_offset
;   Output: DWORD register_value
;
```

## Advanced Topics

### Multi-Device Support
Handle multiple instances of the same device:

```assembly
struct DEVICE_INSTANCE
    .base_addr      dd ?
    .virtual_addr   dd ?
    .irq_line       dd ?
    .device_id      dd ?
    .next           dd ?        ; Linked list
ends

; Global device list
device_list dd 0

proc add_device stdcall, base:dword, irq:dword
    ; Allocate device structure
    invoke KernelAlloc, sizeof.DEVICE_INSTANCE
    test eax, eax
    jz .alloc_failed
    
    ; Initialize device structure
    mov ebx, eax
    mov ecx, [base]
    mov [ebx + DEVICE_INSTANCE.base_addr], ecx
    mov ecx, [irq]
    mov [ebx + DEVICE_INSTANCE.irq_line], ecx
    
    ; Add to device list
    mov ecx, [device_list]
    mov [ebx + DEVICE_INSTANCE.next], ecx
    mov [device_list], ebx
    
    mov eax, ebx                ; Return device pointer
    ret
    
.alloc_failed:
    xor eax, eax
    ret
endp
```

### Power Management
Implement power management for mobile/embedded systems:

```assembly
proc device_suspend
    ; Save device state
    mov ebx, [device_regs]
    mov eax, [ebx + REG_CONTROL]
    mov [saved_control], eax
    
    ; Put device into low power mode
    or eax, POWER_DOWN_BIT
    mov [ebx + REG_CONTROL], eax
    ret
endp

proc device_resume
    ; Restore device state
    mov ebx, [device_regs]
    mov eax, [saved_control]
    mov [ebx + REG_CONTROL], eax
    
    ; Wait for device ready
    call wait_device_ready
    ret
endp
```

This tutorial provides a solid foundation for KolibriOS driver development. For more advanced topics, study existing drivers in the `drivers/` directory and refer to the kernel documentation. Remember to test thoroughly and handle all error conditions for robust driver operation.