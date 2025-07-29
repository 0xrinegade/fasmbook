# KolibriOS Developer's Cookbook
*The Complete Guide to Practical KolibriOS Development*

## Table of Contents

### Part I: Essential Recipes
1. [System Initialization & Boot Recipes](#system-initialization--boot-recipes)
2. [Memory Management Cookbook](#memory-management-cookbook)
3. [Process & Thread Management](#process--thread-management)
4. [File System Operations](#file-system-operations)
5. [Device Driver Recipes](#device-driver-recipes)

### Part II: Application Development
6. [GUI Application Patterns](#gui-application-patterns)
7. [Graphics Programming Recipes](#graphics-programming-recipes)
8. [Audio & Multimedia](#audio--multimedia)
9. [Networking Solutions](#networking-solutions)
10. [Database & Storage](#database--storage)

### Part III: System Programming
11. [Kernel Module Development](#kernel-module-development)
12. [Hardware Interface Recipes](#hardware-interface-recipes)
13. [Performance Optimization](#performance-optimization)
14. [Security Implementation](#security-implementation)
15. [Debugging & Profiling](#debugging--profiling)

### Part IV: Advanced Techniques
16. [Real-Time Programming](#real-time-programming)
17. [Cross-Platform Development](#cross-platform-development)
18. [Legacy System Integration](#legacy-system-integration)
19. [Embedded Systems Patterns](#embedded-systems-patterns)
20. [Testing & Quality Assurance](#testing--quality-assurance)

---

## System Initialization & Boot Recipes

### Recipe 1.1: Custom Boot Sequence Implementation

**Problem**: You need to implement a custom boot sequence for specialized hardware or embedded systems.

**Solution**: Create a modular boot loader that can handle various hardware configurations.

```assembly
; Custom boot sequence for KolibriOS
; File: custom_boot.asm

use32
org 0x7C00

; Boot sector signature
jmp start
times 8-($-$$) db 0

; Boot parameters structure
boot_params:
    .signature      dd 'KOLI'
    .version        dw 0x0001
    .flags          dw 0x0000
    .memory_size    dd 0
    .video_mode     dw 0x0117
    .reserved       times 16 db 0

start:
    cli
    
    ; Initialize segments
    xor ax, ax
    mov ds, ax
    mov es, ax
    mov ss, ax
    mov sp, 0x7C00
    
    ; Detect memory configuration
    call detect_memory
    
    ; Initialize video mode
    call init_video
    
    ; Load kernel
    call load_kernel
    
    ; Jump to kernel
    jmp 0x10000

detect_memory:
    ; Use BIOS int 15h to detect memory
    push es
    push di
    
    mov ax, 0xE820
    mov edx, 0x534D4150  ; "SMAP"
    mov ecx, 24
    xor ebx, ebx
    mov di, memory_map
    
.loop:
    int 0x15
    jc .done
    
    ; Process memory entry
    add di, 24
    cmp ebx, 0
    jne .loop
    
.done:
    pop di
    pop es
    ret

init_video:
    ; Set VESA mode
    mov ax, 0x4F02
    mov bx, [boot_params.video_mode]
    or bx, 0x4000  ; Linear framebuffer
    int 0x10
    
    ; Verify mode set
    cmp ax, 0x004F
    jne .error
    ret
    
.error:
    ; Fall back to VGA mode
    mov ax, 0x0013
    int 0x10
    ret

load_kernel:
    ; Load kernel from disk
    mov ah, 0x02  ; Read sectors
    mov al, 64    ; Number of sectors to read
    mov ch, 0     ; Cylinder
    mov cl, 2     ; Starting sector
    mov dh, 0     ; Head
    mov dl, 0x80  ; Drive
    mov es, 0x1000
    mov bx, 0     ; ES:BX = 0x10000
    int 0x13
    
    jc .error
    ret
    
.error:
    ; Display error message
    mov si, error_msg
    call print_string
    hlt

print_string:
    lodsb
    test al, al
    jz .done
    mov ah, 0x0E
    int 0x10
    jmp print_string
.done:
    ret

error_msg db 'Kernel load failed!', 0
memory_map times 512 db 0

times 510-($-$$) db 0
dw 0xAA55
```

**Usage Notes**:
- This boot loader supports custom hardware detection
- Implements VESA graphics mode initialization
- Provides memory map detection for kernel
- Includes error handling and fallback mechanisms

### Recipe 1.2: Multi-Boot Protocol Implementation

**Problem**: Need compatibility with multiple boot loaders and operating systems.

**Solution**: Implement Multiboot specification for universal boot compatibility.

```assembly
; Multiboot-compliant KolibriOS loader
; File: multiboot.asm

use32

; Multiboot header
MULTIBOOT_HEADER_MAGIC equ 0x1BADB002
MULTIBOOT_HEADER_FLAGS equ 0x00000003
MULTIBOOT_CHECKSUM equ -(MULTIBOOT_HEADER_MAGIC + MULTIBOOT_HEADER_FLAGS)

section .multiboot
align 4
    dd MULTIBOOT_HEADER_MAGIC
    dd MULTIBOOT_HEADER_FLAGS
    dd MULTIBOOT_CHECKSUM

section .text
global _start

_start:
    ; EAX contains magic number
    ; EBX contains pointer to multiboot info
    
    ; Verify multiboot magic
    cmp eax, 0x2BADB002
    jne .bad_multiboot
    
    ; Save multiboot info pointer
    mov [multiboot_info], ebx
    
    ; Setup stack
    mov esp, stack_top
    
    ; Initialize kernel
    call kernel_main
    
    ; Should never reach here
    cli
    hlt

.bad_multiboot:
    ; Invalid multiboot magic
    mov eax, 0xB8000
    mov dword [eax], 0x4F524F45  ; "ERR" in red
    cli
    hlt

kernel_main:
    ; Parse multiboot information
    call parse_multiboot_info
    
    ; Initialize memory management
    call init_memory_manager
    
    ; Setup interrupt handlers
    call setup_interrupts
    
    ; Initialize drivers
    call init_drivers
    
    ; Start user interface
    call start_gui
    
    ret

parse_multiboot_info:
    mov ebx, [multiboot_info]
    test ebx, ebx
    jz .no_info
    
    ; Check flags
    mov eax, [ebx]
    
    ; Memory information available?
    test eax, 1
    jz .no_memory_info
    
    ; Get memory limits
    mov ecx, [ebx + 4]  ; mem_lower
    mov edx, [ebx + 8]  ; mem_upper
    
    ; Store memory information
    mov [memory_lower], ecx
    mov [memory_upper], edx
    
.no_memory_info:
    ; Check for memory map
    test eax, 64
    jz .no_memory_map
    
    ; Process memory map
    mov ecx, [ebx + 44]  ; mmap_length
    mov esi, [ebx + 48]  ; mmap_addr
    call process_memory_map
    
.no_memory_map:
    ; Check for modules
    test eax, 8
    jz .no_modules
    
    ; Process loaded modules
    mov ecx, [ebx + 20]  ; mods_count
    mov esi, [ebx + 24]  ; mods_addr
    call process_modules
    
.no_modules:
.no_info:
    ret

process_memory_map:
    ; ECX = length, ESI = address
    test ecx, ecx
    jz .done
    
    mov edi, memory_map_buffer
    
.loop:
    cmp ecx, 0
    jle .done
    
    ; Copy entry
    mov eax, [esi + 4]   ; base_addr_low
    mov [edi], eax
    mov eax, [esi + 8]   ; base_addr_high
    mov [edi + 4], eax
    mov eax, [esi + 12]  ; length_low
    mov [edi + 8], eax
    mov eax, [esi + 16]  ; length_high
    mov [edi + 12], eax
    mov eax, [esi + 20]  ; type
    mov [edi + 16], eax
    
    ; Move to next entry
    mov eax, [esi]       ; size
    add eax, 4
    add esi, eax
    sub ecx, eax
    add edi, 20
    
    jmp .loop
    
.done:
    ret

process_modules:
    ; ECX = count, ESI = address
    test ecx, ecx
    jz .done
    
    mov edi, module_list
    
.loop:
    ; Copy module info
    mov eax, [esi]       ; mod_start
    mov [edi], eax
    mov eax, [esi + 4]   ; mod_end
    mov [edi + 4], eax
    mov eax, [esi + 8]   ; string
    mov [edi + 8], eax
    
    ; Next module
    add esi, 16
    add edi, 12
    dec ecx
    jnz .loop
    
.done:
    ret

init_memory_manager:
    ; Initialize physical memory manager
    call init_physical_memory
    
    ; Setup paging
    call setup_paging
    
    ; Initialize virtual memory
    call init_virtual_memory
    
    ret

init_physical_memory:
    ; Mark all memory as used initially
    mov edi, physical_bitmap
    mov ecx, BITMAP_SIZE / 4
    mov eax, 0xFFFFFFFF
    rep stosd
    
    ; Mark available memory regions as free
    mov esi, memory_map_buffer
    
.loop:
    mov eax, [esi + 16]  ; type
    cmp eax, 1           ; available memory
    jne .next
    
    ; Mark region as free
    mov eax, [esi]       ; base address
    mov ecx, [esi + 8]   ; length
    call mark_memory_free
    
.next:
    add esi, 20
    cmp esi, memory_map_end
    jl .loop
    
    ret

mark_memory_free:
    ; EAX = base address, ECX = length
    shr eax, 12          ; Convert to page number
    shr ecx, 12          ; Convert to page count
    
.loop:
    test ecx, ecx
    jz .done
    
    ; Clear bit in bitmap
    mov edx, eax
    shr edx, 5           ; Divide by 32
    mov ebx, eax
    and ebx, 31          ; Modulo 32
    
    btr [physical_bitmap + edx * 4], ebx
    
    inc eax
    dec ecx
    jmp .loop
    
.done:
    ret

setup_interrupts:
    ; Load IDT
    lidt [idt_descriptor]
    
    ; Enable interrupts
    sti
    
    ret

section .bss
align 4
stack_bottom:
    resb 16384  ; 16KB stack
stack_top:

multiboot_info:
    resd 1

memory_lower:
    resd 1
memory_upper:
    resd 1

memory_map_buffer:
    resb 4096
memory_map_end:

module_list:
    resb 1024

physical_bitmap:
    resb BITMAP_SIZE

BITMAP_SIZE equ 32768  ; Support up to 1GB RAM

section .data
idt_descriptor:
    dw 0  ; IDT limit
    dd 0  ; IDT base
```

## Memory Management Cookbook

### Recipe 2.1: Advanced Virtual Memory Manager

**Problem**: Need sophisticated virtual memory management with copy-on-write, demand paging, and memory mapping.

**Solution**: Implement a complete virtual memory subsystem with modern features.

```c
// Advanced Virtual Memory Manager
// File: vmm.c

#include <stdint.h>
#include <stdbool.h>
#include <string.h>

#define PAGE_SIZE 4096
#define PAGE_SHIFT 12
#define PAGES_PER_TABLE 1024
#define TABLES_PER_DIR 1024

#define PAGE_PRESENT    0x001
#define PAGE_WRITABLE   0x002
#define PAGE_USER       0x004
#define PAGE_COW        0x200
#define PAGE_ACCESSED   0x020
#define PAGE_DIRTY      0x040

typedef struct page_table_entry {
    uint32_t present    : 1;
    uint32_t writable   : 1;
    uint32_t user       : 1;
    uint32_t writethrough : 1;
    uint32_t cache_disabled : 1;
    uint32_t accessed   : 1;
    uint32_t dirty      : 1;
    uint32_t reserved   : 1;
    uint32_t global     : 1;
    uint32_t cow        : 1;  // Copy-on-write
    uint32_t available  : 2;
    uint32_t frame      : 20;
} __attribute__((packed)) pte_t;

typedef struct page_directory_entry {
    uint32_t present    : 1;
    uint32_t writable   : 1;
    uint32_t user       : 1;
    uint32_t writethrough : 1;
    uint32_t cache_disabled : 1;
    uint32_t accessed   : 1;
    uint32_t reserved   : 1;
    uint32_t page_size  : 1;
    uint32_t global     : 1;
    uint32_t available  : 3;
    uint32_t table      : 20;
} __attribute__((packed)) pde_t;

typedef struct page_directory {
    pde_t entries[TABLES_PER_DIR];
} page_directory_t;

typedef struct page_table {
    pte_t entries[PAGES_PER_TABLE];
} page_table_t;

typedef struct vma {
    uint32_t start_addr;
    uint32_t end_addr;
    uint32_t flags;
    struct vma *next;
    
    // File mapping info
    struct file *file;
    uint32_t file_offset;
    
    // Anonymous mapping info
    bool is_anonymous;
    
    // Copy-on-write info
    bool is_cow;
    uint32_t ref_count;
} vma_t;

typedef struct address_space {
    page_directory_t *page_directory;
    vma_t *vma_list;
    uint32_t total_pages;
    uint32_t resident_pages;
    struct address_space *next;
} address_space_t;

// Global VMM state
static address_space_t *current_address_space = NULL;
static page_directory_t *kernel_page_directory = NULL;

// Page fault statistics
static struct {
    uint32_t total_faults;
    uint32_t cow_faults;
    uint32_t demand_faults;
    uint32_t protection_faults;
    uint32_t swap_in_faults;
} fault_stats;

// Initialize virtual memory manager
int vmm_init(void) {
    // Create kernel address space
    kernel_page_directory = create_page_directory();
    if (!kernel_page_directory) {
        return -1;
    }
    
    // Identity map kernel space (0-4MB)
    for (uint32_t addr = 0; addr < 0x400000; addr += PAGE_SIZE) {
        map_page(kernel_page_directory, addr, addr, 
                PAGE_PRESENT | PAGE_WRITABLE);
    }
    
    // Set current page directory
    set_page_directory(kernel_page_directory);
    
    // Enable paging
    enable_paging();
    
    return 0;
}

// Create new page directory
page_directory_t *create_page_directory(void) {
    page_directory_t *dir = alloc_page();
    if (!dir) {
        return NULL;
    }
    
    memset(dir, 0, sizeof(page_directory_t));
    
    // Copy kernel mappings
    if (kernel_page_directory) {
        for (int i = 768; i < 1024; i++) {  // Kernel space
            dir->entries[i] = kernel_page_directory->entries[i];
        }
    }
    
    return dir;
}

// Map virtual page to physical frame
int map_page(page_directory_t *dir, uint32_t virt_addr, uint32_t phys_addr, uint32_t flags) {
    uint32_t dir_index = virt_addr >> 22;
    uint32_t table_index = (virt_addr >> 12) & 0x3FF;
    
    // Get or create page table
    page_table_t *table;
    if (!dir->entries[dir_index].present) {
        table = alloc_page();
        if (!table) {
            return -1;
        }
        
        memset(table, 0, sizeof(page_table_t));
        
        dir->entries[dir_index].present = 1;
        dir->entries[dir_index].writable = 1;
        dir->entries[dir_index].user = (flags & PAGE_USER) ? 1 : 0;
        dir->entries[dir_index].table = ((uint32_t)table) >> 12;
    } else {
        table = (page_table_t *)(dir->entries[dir_index].table << 12);
    }
    
    // Set page table entry
    table->entries[table_index].present = (flags & PAGE_PRESENT) ? 1 : 0;
    table->entries[table_index].writable = (flags & PAGE_WRITABLE) ? 1 : 0;
    table->entries[table_index].user = (flags & PAGE_USER) ? 1 : 0;
    table->entries[table_index].cow = (flags & PAGE_COW) ? 1 : 0;
    table->entries[table_index].frame = phys_addr >> 12;
    
    // Invalidate TLB
    invalidate_page(virt_addr);
    
    return 0;
}

// Unmap virtual page
void unmap_page(page_directory_t *dir, uint32_t virt_addr) {
    uint32_t dir_index = virt_addr >> 22;
    uint32_t table_index = (virt_addr >> 12) & 0x3FF;
    
    if (!dir->entries[dir_index].present) {
        return;
    }
    
    page_table_t *table = (page_table_t *)(dir->entries[dir_index].table << 12);
    
    if (table->entries[table_index].present) {
        // Free physical page if needed
        uint32_t phys_addr = table->entries[table_index].frame << 12;
        free_page((void *)phys_addr);
        
        // Clear entry
        memset(&table->entries[table_index], 0, sizeof(pte_t));
        
        // Invalidate TLB
        invalidate_page(virt_addr);
    }
}

// Handle page fault
void page_fault_handler(uint32_t fault_addr, uint32_t error_code) {
    fault_stats.total_faults++;
    
    bool present = error_code & 1;
    bool write = error_code & 2;
    bool user = error_code & 4;
    
    // Find VMA for fault address
    vma_t *vma = find_vma(current_address_space, fault_addr);
    if (!vma) {
        // Segmentation fault
        kill_current_process(SIGSEGV);
        return;
    }
    
    if (present) {
        // Protection fault
        if (write && vma->is_cow) {
            handle_cow_fault(vma, fault_addr);
            fault_stats.cow_faults++;
        } else {
            // Invalid access
            kill_current_process(SIGSEGV);
        }
    } else {
        // Page not present
        if (vma->is_anonymous) {
            handle_anonymous_fault(vma, fault_addr);
        } else {
            handle_file_fault(vma, fault_addr);
        }
        fault_stats.demand_faults++;
    }
}

// Handle copy-on-write fault
void handle_cow_fault(vma_t *vma, uint32_t fault_addr) {
    uint32_t page_addr = fault_addr & ~(PAGE_SIZE - 1);
    
    // Get current physical page
    uint32_t old_phys = get_physical_address(page_addr);
    if (!old_phys) {
        return;
    }
    
    // Allocate new physical page
    void *new_page = alloc_page();
    if (!new_page) {
        kill_current_process(SIGKILL);
        return;
    }
    
    // Copy page content
    memcpy(new_page, (void *)old_phys, PAGE_SIZE);
    
    // Update page mapping
    map_page(current_address_space->page_directory, page_addr, 
            (uint32_t)new_page, PAGE_PRESENT | PAGE_WRITABLE | PAGE_USER);
    
    // Decrease reference count on old page
    decrease_page_refcount(old_phys);
}

// Handle anonymous page fault
void handle_anonymous_fault(vma_t *vma, uint32_t fault_addr) {
    uint32_t page_addr = fault_addr & ~(PAGE_SIZE - 1);
    
    // Allocate physical page
    void *page = alloc_page();
    if (!page) {
        kill_current_process(SIGKILL);
        return;
    }
    
    // Zero the page
    memset(page, 0, PAGE_SIZE);
    
    // Map the page
    uint32_t flags = PAGE_PRESENT | PAGE_USER;
    if (vma->flags & VMA_WRITE) {
        flags |= PAGE_WRITABLE;
    }
    
    map_page(current_address_space->page_directory, page_addr, 
            (uint32_t)page, flags);
    
    current_address_space->resident_pages++;
}

// Handle file-backed page fault
void handle_file_fault(vma_t *vma, uint32_t fault_addr) {
    uint32_t page_addr = fault_addr & ~(PAGE_SIZE - 1);
    uint32_t offset_in_vma = page_addr - vma->start_addr;
    uint32_t file_offset = vma->file_offset + offset_in_vma;
    
    // Allocate physical page
    void *page = alloc_page();
    if (!page) {
        kill_current_process(SIGKILL);
        return;
    }
    
    // Read from file
    if (read_file(vma->file, file_offset, page, PAGE_SIZE) < 0) {
        free_page(page);
        kill_current_process(SIGBUS);
        return;
    }
    
    // Map the page
    uint32_t flags = PAGE_PRESENT | PAGE_USER;
    if (vma->flags & VMA_WRITE) {
        flags |= PAGE_WRITABLE;
    }
    
    map_page(current_address_space->page_directory, page_addr, 
            (uint32_t)page, flags);
    
    current_address_space->resident_pages++;
}

// Find VMA containing address
vma_t *find_vma(address_space_t *as, uint32_t addr) {
    vma_t *vma = as->vma_list;
    
    while (vma) {
        if (addr >= vma->start_addr && addr < vma->end_addr) {
            return vma;
        }
        vma = vma->next;
    }
    
    return NULL;
}

// Create memory mapping
void *mmap(void *addr, size_t length, int prot, int flags, int fd, off_t offset) {
    // Align parameters
    uint32_t start_addr = (uint32_t)addr;
    start_addr = (start_addr + PAGE_SIZE - 1) & ~(PAGE_SIZE - 1);
    
    length = (length + PAGE_SIZE - 1) & ~(PAGE_SIZE - 1);
    
    // Find free virtual address space
    if (!addr || (flags & MAP_FIXED) == 0) {
        start_addr = find_free_vma_space(current_address_space, length);
        if (!start_addr) {
            return MAP_FAILED;
        }
    }
    
    // Create VMA
    vma_t *vma = create_vma(start_addr, start_addr + length, prot, flags);
    if (!vma) {
        return MAP_FAILED;
    }
    
    // Setup file mapping if needed
    if (flags & MAP_ANONYMOUS) {
        vma->is_anonymous = true;
    } else {
        vma->file = get_file(fd);
        vma->file_offset = offset;
        vma->is_anonymous = false;
    }
    
    // Add to address space
    add_vma(current_address_space, vma);
    
    return (void *)start_addr;
}

// Remove memory mapping
int munmap(void *addr, size_t length) {
    uint32_t start_addr = (uint32_t)addr;
    uint32_t end_addr = start_addr + length;
    
    // Find and remove VMAs in range
    vma_t *vma = current_address_space->vma_list;
    vma_t *prev = NULL;
    
    while (vma) {
        if (vma->start_addr >= start_addr && vma->end_addr <= end_addr) {
            // Remove entire VMA
            if (prev) {
                prev->next = vma->next;
            } else {
                current_address_space->vma_list = vma->next;
            }
            
            // Unmap pages
            for (uint32_t page = vma->start_addr; page < vma->end_addr; page += PAGE_SIZE) {
                unmap_page(current_address_space->page_directory, page);
            }
            
            vma_t *next = vma->next;
            free_vma(vma);
            vma = next;
        } else {
            prev = vma;
            vma = vma->next;
        }
    }
    
    return 0;
}

// Memory protection change
int mprotect(void *addr, size_t length, int prot) {
    uint32_t start_addr = (uint32_t)addr;
    uint32_t end_addr = start_addr + length;
    
    // Find VMAs in range
    vma_t *vma = current_address_space->vma_list;
    
    while (vma) {
        if (vma->start_addr < end_addr && vma->end_addr > start_addr) {
            // Update VMA protection
            vma->flags = prot;
            
            // Update page table entries
            for (uint32_t page = max(vma->start_addr, start_addr); 
                 page < min(vma->end_addr, end_addr); 
                 page += PAGE_SIZE) {
                
                uint32_t flags = PAGE_PRESENT | PAGE_USER;
                if (prot & PROT_WRITE) {
                    flags |= PAGE_WRITABLE;
                }
                
                update_page_protection(current_address_space->page_directory, 
                                     page, flags);
            }
        }
        vma = vma->next;
    }
    
    return 0;
}

// Fork address space for new process
address_space_t *fork_address_space(address_space_t *parent) {
    address_space_t *child = create_address_space();
    if (!child) {
        return NULL;
    }
    
    // Copy VMAs
    vma_t *parent_vma = parent->vma_list;
    while (parent_vma) {
        vma_t *child_vma = create_vma(parent_vma->start_addr, parent_vma->end_addr,
                                     parent_vma->flags, 0);
        if (!child_vma) {
            destroy_address_space(child);
            return NULL;
        }
        
        child_vma->is_anonymous = parent_vma->is_anonymous;
        child_vma->file = parent_vma->file;
        child_vma->file_offset = parent_vma->file_offset;
        
        add_vma(child, child_vma);
        parent_vma = parent_vma->next;
    }
    
    // Copy page mappings with COW
    copy_page_mappings_cow(parent, child);
    
    return child;
}

// Copy page mappings with copy-on-write
void copy_page_mappings_cow(address_space_t *parent, address_space_t *child) {
    page_directory_t *parent_dir = parent->page_directory;
    page_directory_t *child_dir = child->page_directory;
    
    for (int dir_idx = 0; dir_idx < 768; dir_idx++) {  // User space only
        if (!parent_dir->entries[dir_idx].present) {
            continue;
        }
        
        page_table_t *parent_table = (page_table_t *)(parent_dir->entries[dir_idx].table << 12);
        page_table_t *child_table = alloc_page();
        if (!child_table) {
            continue;
        }
        
        memset(child_table, 0, sizeof(page_table_t));
        
        child_dir->entries[dir_idx] = parent_dir->entries[dir_idx];
        child_dir->entries[dir_idx].table = ((uint32_t)child_table) >> 12;
        
        for (int table_idx = 0; table_idx < PAGES_PER_TABLE; table_idx++) {
            if (!parent_table->entries[table_idx].present) {
                continue;
            }
            
            // Copy entry
            child_table->entries[table_idx] = parent_table->entries[table_idx];
            
            // Mark both as COW if writable
            if (parent_table->entries[table_idx].writable) {
                parent_table->entries[table_idx].writable = 0;
                parent_table->entries[table_idx].cow = 1;
                child_table->entries[table_idx].writable = 0;
                child_table->entries[table_idx].cow = 1;
                
                // Increase reference count
                uint32_t phys_addr = parent_table->entries[table_idx].frame << 12;
                increase_page_refcount(phys_addr);
            }
        }
    }
    
    // Flush TLB
    flush_tlb();
}

// Get VMM statistics
void get_vmm_stats(vmm_stats_t *stats) {
    stats->total_faults = fault_stats.total_faults;
    stats->cow_faults = fault_stats.cow_faults;
    stats->demand_faults = fault_stats.demand_faults;
    stats->protection_faults = fault_stats.protection_faults;
    stats->swap_in_faults = fault_stats.swap_in_faults;
    
    if (current_address_space) {
        stats->total_pages = current_address_space->total_pages;
        stats->resident_pages = current_address_space->resident_pages;
    } else {
        stats->total_pages = 0;
        stats->resident_pages = 0;
    }
}
```

