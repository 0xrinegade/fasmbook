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


### Recipe 3.2: Inter-Process Communication (IPC)

**Problem**: Need efficient communication between processes without system call overhead.

**Solution**: Implement shared memory with lock-free data structures.

```c
// Lock-free ring buffer for IPC
// File: lockfree_ipc.c

#include <stdint.h>
#include <stdbool.h>
#include <stdatomic.h>

#define CACHE_LINE_SIZE 64
#define RING_BUFFER_SIZE 4096
#define MAX_MESSAGE_SIZE 256

typedef struct message {
    uint32_t length;
    uint32_t type;
    uint64_t timestamp;
    uint8_t data[MAX_MESSAGE_SIZE - 16];
} message_t;

typedef struct ring_buffer {
    // Producer data (cache-aligned)
    alignas(CACHE_LINE_SIZE) atomic_uint_fast32_t write_pos;
    uint32_t write_cache;
    
    // Consumer data (cache-aligned)  
    alignas(CACHE_LINE_SIZE) atomic_uint_fast32_t read_pos;
    uint32_t read_cache;
    
    // Shared data
    alignas(CACHE_LINE_SIZE) uint8_t buffer[RING_BUFFER_SIZE];
} ring_buffer_t;

// Initialize ring buffer
void ring_buffer_init(ring_buffer_t *rb) {
    atomic_store(&rb->write_pos, 0);
    atomic_store(&rb->read_pos, 0);
    rb->write_cache = 0;
    rb->read_cache = 0;
}

// Producer: Send message
bool ring_buffer_send(ring_buffer_t *rb, const message_t *msg) {
    uint32_t msg_size = sizeof(uint32_t) + msg->length; // Length + data
    uint32_t total_size = (msg_size + 7) & ~7; // 8-byte align
    
    // Get current positions
    uint32_t write_pos = atomic_load_explicit(&rb->write_pos, memory_order_relaxed);
    uint32_t read_pos = rb->read_cache;
    
    // Check if we need to update read cache
    if (write_pos - read_pos >= RING_BUFFER_SIZE - total_size) {
        read_pos = atomic_load_explicit(&rb->read_pos, memory_order_acquire);
        rb->read_cache = read_pos;
        
        if (write_pos - read_pos >= RING_BUFFER_SIZE - total_size) {
            return false; // Buffer full
        }
    }
    
    // Write message
    uint32_t pos = write_pos & (RING_BUFFER_SIZE - 1);
    
    // Handle wraparound
    if (pos + total_size > RING_BUFFER_SIZE) {
        // Split write
        uint32_t first_part = RING_BUFFER_SIZE - pos;
        memcpy(&rb->buffer[pos], msg, first_part);
        memcpy(&rb->buffer[0], (uint8_t*)msg + first_part, total_size - first_part);
    } else {
        // Single write
        memcpy(&rb->buffer[pos], msg, total_size);
    }
    
    // Update write position
    atomic_store_explicit(&rb->write_pos, write_pos + total_size, memory_order_release);
    
    return true;
}

// Consumer: Receive message
bool ring_buffer_receive(ring_buffer_t *rb, message_t *msg) {
    // Get current positions
    uint32_t read_pos = atomic_load_explicit(&rb->read_pos, memory_order_relaxed);
    uint32_t write_pos = rb->write_cache;
    
    // Check if we need to update write cache
    if (read_pos == write_pos) {
        write_pos = atomic_load_explicit(&rb->write_pos, memory_order_acquire);
        rb->write_cache = write_pos;
        
        if (read_pos == write_pos) {
            return false; // Buffer empty
        }
    }
    
    // Read message length first
    uint32_t pos = read_pos & (RING_BUFFER_SIZE - 1);
    uint32_t length;
    
    if (pos + sizeof(uint32_t) > RING_BUFFER_SIZE) {
        // Length spans wraparound
        uint32_t first_part = RING_BUFFER_SIZE - pos;
        memcpy(&length, &rb->buffer[pos], first_part);
        memcpy((uint8_t*)&length + first_part, &rb->buffer[0], sizeof(uint32_t) - first_part);
    } else {
        memcpy(&length, &rb->buffer[pos], sizeof(uint32_t));
    }
    
    // Validate length
    if (length > MAX_MESSAGE_SIZE - 16) {
        return false; // Invalid message
    }
    
    uint32_t total_size = (sizeof(uint32_t) + length + 7) & ~7;
    
    // Read full message
    if (pos + total_size > RING_BUFFER_SIZE) {
        // Split read
        uint32_t first_part = RING_BUFFER_SIZE - pos;
        memcpy(msg, &rb->buffer[pos], first_part);
        memcpy((uint8_t*)msg + first_part, &rb->buffer[0], total_size - first_part);
    } else {
        // Single read
        memcpy(msg, &rb->buffer[pos], total_size);
    }
    
    // Update read position
    atomic_store_explicit(&rb->read_pos, read_pos + total_size, memory_order_release);
    
    return true;
}

// Message queue with multiple priorities
typedef struct priority_queue {
    ring_buffer_t rings[4]; // 4 priority levels
    atomic_uint_fast32_t pending_mask;
} priority_queue_t;

void priority_queue_init(priority_queue_t *pq) {
    for (int i = 0; i < 4; i++) {
        ring_buffer_init(&pq->rings[i]);
    }
    atomic_store(&pq->pending_mask, 0);
}

bool priority_queue_send(priority_queue_t *pq, const message_t *msg, int priority) {
    if (priority < 0 || priority >= 4) {
        return false;
    }
    
    bool success = ring_buffer_send(&pq->rings[priority], msg);
    if (success) {
        // Set pending bit for this priority
        uint32_t mask = 1U << priority;
        atomic_fetch_or_explicit(&pq->pending_mask, mask, memory_order_release);
    }
    
    return success;
}

bool priority_queue_receive(priority_queue_t *pq, message_t *msg) {
    uint32_t mask = atomic_load_explicit(&pq->pending_mask, memory_order_acquire);
    
    // Check priorities from highest to lowest
    for (int priority = 3; priority >= 0; priority--) {
        if (mask & (1U << priority)) {
            if (ring_buffer_receive(&pq->rings[priority], msg)) {
                return true;
            } else {
                // Clear pending bit if queue is empty
                uint32_t clear_mask = ~(1U << priority);
                atomic_fetch_and_explicit(&pq->pending_mask, clear_mask, memory_order_relaxed);
            }
        }
    }
    
    return false;
}

// Shared memory IPC channel
typedef struct ipc_channel {
    char name[32];
    pid_t creator_pid;
    size_t size;
    void *memory;
    priority_queue_t *queue;
    
    // Statistics
    atomic_uint_fast64_t messages_sent;
    atomic_uint_fast64_t messages_received;
    atomic_uint_fast64_t bytes_sent;
    atomic_uint_fast64_t bytes_received;
} ipc_channel_t;

// Create IPC channel
ipc_channel_t *ipc_create_channel(const char *name, size_t size) {
    // Allocate shared memory
    void *shared_mem = create_shared_memory(name, size + sizeof(priority_queue_t));
    if (!shared_mem) {
        return NULL;
    }
    
    ipc_channel_t *channel = malloc(sizeof(ipc_channel_t));
    if (!channel) {
        destroy_shared_memory(shared_mem);
        return NULL;
    }
    
    strncpy(channel->name, name, sizeof(channel->name) - 1);
    channel->name[sizeof(channel->name) - 1] = '\0';
    channel->creator_pid = get_current_pid();
    channel->size = size;
    channel->memory = shared_mem;
    channel->queue = (priority_queue_t*)((uint8_t*)shared_mem + size);
    
    // Initialize queue
    priority_queue_init(channel->queue);
    
    // Initialize statistics
    atomic_store(&channel->messages_sent, 0);
    atomic_store(&channel->messages_received, 0);
    atomic_store(&channel->bytes_sent, 0);
    atomic_store(&channel->bytes_received, 0);
    
    return channel;
}

// Connect to existing IPC channel
ipc_channel_t *ipc_connect_channel(const char *name) {
    void *shared_mem = connect_shared_memory(name);
    if (!shared_mem) {
        return NULL;
    }
    
    ipc_channel_t *channel = malloc(sizeof(ipc_channel_t));
    if (!channel) {
        disconnect_shared_memory(shared_mem);
        return NULL;
    }
    
    strncpy(channel->name, name, sizeof(channel->name) - 1);
    channel->name[sizeof(channel->name) - 1] = '\0';
    channel->creator_pid = 0; // Not the creator
    
    // Get size from shared memory header
    channel->size = get_shared_memory_size(shared_mem) - sizeof(priority_queue_t);
    channel->memory = shared_mem;
    channel->queue = (priority_queue_t*)((uint8_t*)shared_mem + channel->size);
    
    // Initialize local statistics
    atomic_store(&channel->messages_sent, 0);
    atomic_store(&channel->messages_received, 0);
    atomic_store(&channel->bytes_sent, 0);
    atomic_store(&channel->bytes_received, 0);
    
    return channel;
}

// Send message through IPC channel
bool ipc_send_message(ipc_channel_t *channel, uint32_t type, const void *data, 
                      uint32_t length, int priority) {
    if (!channel || length > MAX_MESSAGE_SIZE - 16) {
        return false;
    }
    
    message_t msg;
    msg.length = length;
    msg.type = type;
    msg.timestamp = get_timestamp();
    
    if (data && length > 0) {
        memcpy(msg.data, data, length);
    }
    
    bool success = priority_queue_send(channel->queue, &msg, priority);
    if (success) {
        atomic_fetch_add(&channel->messages_sent, 1);
        atomic_fetch_add(&channel->bytes_sent, length);
    }
    
    return success;
}

// Receive message from IPC channel
bool ipc_receive_message(ipc_channel_t *channel, uint32_t *type, void *data, 
                        uint32_t *length, uint32_t max_length) {
    if (!channel) {
        return false;
    }
    
    message_t msg;
    bool success = priority_queue_receive(channel->queue, &msg);
    if (!success) {
        return false;
    }
    
    *type = msg.type;
    
    uint32_t copy_length = msg.length;
    if (copy_length > max_length) {
        copy_length = max_length;
    }
    
    if (data && copy_length > 0) {
        memcpy(data, msg.data, copy_length);
    }
    
    *length = copy_length;
    
    atomic_fetch_add(&channel->messages_received, 1);
    atomic_fetch_add(&channel->bytes_received, copy_length);
    
    return true;
}

// Destroy IPC channel
void ipc_destroy_channel(ipc_channel_t *channel) {
    if (!channel) {
        return;
    }
    
    if (channel->creator_pid == get_current_pid()) {
        destroy_shared_memory(channel->memory);
    } else {
        disconnect_shared_memory(channel->memory);
    }
    
    free(channel);
}

// Get channel statistics
void ipc_get_stats(ipc_channel_t *channel, ipc_stats_t *stats) {
    if (!channel || !stats) {
        return;
    }
    
    stats->messages_sent = atomic_load(&channel->messages_sent);
    stats->messages_received = atomic_load(&channel->messages_received);
    stats->bytes_sent = atomic_load(&channel->bytes_sent);
    stats->bytes_received = atomic_load(&channel->bytes_received);
    
    // Calculate queue occupancy
    uint32_t total_pending = 0;
    for (int i = 0; i < 4; i++) {
        uint32_t write_pos = atomic_load(&channel->queue->rings[i].write_pos);
        uint32_t read_pos = atomic_load(&channel->queue->rings[i].read_pos);
        total_pending += write_pos - read_pos;
    }
    stats->queue_occupancy = total_pending;
}
```

### Recipe 3.3: High-Performance Event System

**Problem**: Need an efficient event system for handling thousands of concurrent events.

**Solution**: Implement an epoll-like event system with edge-triggered notifications.

```c
// High-performance event system
// File: event_system.c

#include <stdint.h>
#include <stdbool.h>
#include <sys/epoll.h>

#define MAX_EVENTS 10000
#define MAX_FDS 65536
#define EVENT_BATCH_SIZE 64

typedef enum event_type {
    EVENT_READ = 1,
    EVENT_WRITE = 2,
    EVENT_ERROR = 4,
    EVENT_HANGUP = 8,
    EVENT_EDGE_TRIGGERED = 16
} event_type_t;

typedef struct event_data {
    int fd;
    uint32_t events;
    void *user_data;
    uint64_t event_count;
    uint64_t last_event_time;
} event_data_t;

typedef struct event_queue {
    int epoll_fd;
    event_data_t *fd_data[MAX_FDS];
    
    // Event batching
    struct epoll_event batch[EVENT_BATCH_SIZE];
    int batch_count;
    int batch_index;
    
    // Statistics
    uint64_t total_events;
    uint64_t read_events;
    uint64_t write_events;
    uint64_t error_events;
    uint64_t spurious_events;
    
    // Performance metrics
    uint64_t total_wait_time;
    uint64_t avg_batch_size;
    uint32_t max_fd;
} event_queue_t;

// Create event queue
event_queue_t *event_queue_create(void) {
    event_queue_t *eq = malloc(sizeof(event_queue_t));
    if (!eq) {
        return NULL;
    }
    
    eq->epoll_fd = epoll_create1(EPOLL_CLOEXEC);
    if (eq->epoll_fd == -1) {
        free(eq);
        return NULL;
    }
    
    memset(eq->fd_data, 0, sizeof(eq->fd_data));
    eq->batch_count = 0;
    eq->batch_index = 0;
    eq->total_events = 0;
    eq->read_events = 0;
    eq->write_events = 0;
    eq->error_events = 0;
    eq->spurious_events = 0;
    eq->total_wait_time = 0;
    eq->avg_batch_size = 0;
    eq->max_fd = 0;
    
    return eq;
}

// Add file descriptor to event queue
int event_queue_add(event_queue_t *eq, int fd, uint32_t events, void *user_data) {
    if (!eq || fd < 0 || fd >= MAX_FDS) {
        return -1;
    }
    
    event_data_t *data = malloc(sizeof(event_data_t));
    if (!data) {
        return -1;
    }
    
    data->fd = fd;
    data->events = events;
    data->user_data = user_data;
    data->event_count = 0;
    data->last_event_time = 0;
    
    eq->fd_data[fd] = data;
    
    struct epoll_event ev;
    ev.events = 0;
    
    if (events & EVENT_READ) ev.events |= EPOLLIN;
    if (events & EVENT_WRITE) ev.events |= EPOLLOUT;
    if (events & EVENT_EDGE_TRIGGERED) ev.events |= EPOLLET;
    
    ev.data.fd = fd;
    
    if (epoll_ctl(eq->epoll_fd, EPOLL_CTL_ADD, fd, &ev) == -1) {
        free(data);
        eq->fd_data[fd] = NULL;
        return -1;
    }
    
    if (fd > eq->max_fd) {
        eq->max_fd = fd;
    }
    
    return 0;
}

// Modify file descriptor events
int event_queue_modify(event_queue_t *eq, int fd, uint32_t events, void *user_data) {
    if (!eq || fd < 0 || fd >= MAX_FDS || !eq->fd_data[fd]) {
        return -1;
    }
    
    event_data_t *data = eq->fd_data[fd];
    data->events = events;
    data->user_data = user_data;
    
    struct epoll_event ev;
    ev.events = 0;
    
    if (events & EVENT_READ) ev.events |= EPOLLIN;
    if (events & EVENT_WRITE) ev.events |= EPOLLOUT;
    if (events & EVENT_EDGE_TRIGGERED) ev.events |= EPOLLET;
    
    ev.data.fd = fd;
    
    return epoll_ctl(eq->epoll_fd, EPOLL_CTL_MOD, fd, &ev);
}

// Remove file descriptor from event queue
int event_queue_remove(event_queue_t *eq, int fd) {
    if (!eq || fd < 0 || fd >= MAX_FDS || !eq->fd_data[fd]) {
        return -1;
    }
    
    if (epoll_ctl(eq->epoll_fd, EPOLL_CTL_DEL, fd, NULL) == -1) {
        return -1;
    }
    
    free(eq->fd_data[fd]);
    eq->fd_data[fd] = NULL;
    
    return 0;
}

// Wait for events (non-blocking)
int event_queue_poll(event_queue_t *eq, event_data_t **events, int max_events, int timeout) {
    if (!eq || !events) {
        return -1;
    }
    
    // If we have batched events, return them first
    if (eq->batch_index < eq->batch_count) {
        int remaining = eq->batch_count - eq->batch_index;
        int to_return = (remaining > max_events) ? max_events : remaining;
        
        for (int i = 0; i < to_return; i++) {
            struct epoll_event *ev = &eq->batch[eq->batch_index + i];
            int fd = ev->data.fd;
            
            if (fd >= 0 && fd < MAX_FDS && eq->fd_data[fd]) {
                event_data_t *data = eq->fd_data[fd];
                
                // Update event flags
                data->events = 0;
                if (ev->events & EPOLLIN) data->events |= EVENT_READ;
                if (ev->events & EPOLLOUT) data->events |= EVENT_WRITE;
                if (ev->events & EPOLLERR) data->events |= EVENT_ERROR;
                if (ev->events & EPOLLHUP) data->events |= EVENT_HANGUP;
                
                data->event_count++;
                data->last_event_time = get_timestamp();
                
                events[i] = data;
            } else {
                eq->spurious_events++;
                to_return--; // Skip invalid events
                i--;
            }
        }
        
        eq->batch_index += to_return;
        if (eq->batch_index >= eq->batch_count) {
            eq->batch_count = 0;
            eq->batch_index = 0;
        }
        
        return to_return;
    }
    
    // Wait for new events
    uint64_t start_time = get_timestamp();
    int nfds = epoll_wait(eq->epoll_fd, eq->batch, EVENT_BATCH_SIZE, timeout);
    uint64_t end_time = get_timestamp();
    
    eq->total_wait_time += end_time - start_time;
    
    if (nfds <= 0) {
        return nfds;
    }
    
    eq->batch_count = nfds;
    eq->batch_index = 0;
    eq->total_events += nfds;
    
    // Update average batch size
    eq->avg_batch_size = (eq->avg_batch_size + nfds) / 2;
    
    // Return first batch of events
    int to_return = (nfds > max_events) ? max_events : nfds;
    
    for (int i = 0; i < to_return; i++) {
        struct epoll_event *ev = &eq->batch[i];
        int fd = ev->data.fd;
        
        if (fd >= 0 && fd < MAX_FDS && eq->fd_data[fd]) {
            event_data_t *data = eq->fd_data[fd];
            
            // Update event flags and statistics
            data->events = 0;
            if (ev->events & EPOLLIN) {
                data->events |= EVENT_READ;
                eq->read_events++;
            }
            if (ev->events & EPOLLOUT) {
                data->events |= EVENT_WRITE;
                eq->write_events++;
            }
            if (ev->events & EPOLLERR) {
                data->events |= EVENT_ERROR;
                eq->error_events++;
            }
            if (ev->events & EPOLLHUP) {
                data->events |= EVENT_HANGUP;
                eq->error_events++;
            }
            
            data->event_count++;
            data->last_event_time = end_time;
            
            events[i] = data;
        } else {
            eq->spurious_events++;
            to_return--;
            i--;
        }
    }
    
    eq->batch_index = to_return;
    
    return to_return;
}

// Event loop with callback system
typedef void (*event_callback_t)(event_data_t *event, void *context);

typedef struct event_loop {
    event_queue_t *queue;
    event_callback_t callback;
    void *context;
    bool running;
    
    // Performance tuning
    int poll_timeout;
    int max_events_per_iteration;
    
    // Load balancing
    uint64_t total_iterations;
    uint64_t total_events_processed;
    uint64_t max_events_per_second;
    uint64_t last_stats_time;
} event_loop_t;

event_loop_t *event_loop_create(event_callback_t callback, void *context) {
    event_loop_t *loop = malloc(sizeof(event_loop_t));
    if (!loop) {
        return NULL;
    }
    
    loop->queue = event_queue_create();
    if (!loop->queue) {
        free(loop);
        return NULL;
    }
    
    loop->callback = callback;
    loop->context = context;
    loop->running = false;
    loop->poll_timeout = 10; // 10ms default
    loop->max_events_per_iteration = 100;
    loop->total_iterations = 0;
    loop->total_events_processed = 0;
    loop->max_events_per_second = 0;
    loop->last_stats_time = get_timestamp();
    
    return loop;
}

void event_loop_run(event_loop_t *loop) {
    if (!loop) {
        return;
    }
    
    loop->running = true;
    event_data_t *events[256];
    
    while (loop->running) {
        uint64_t iteration_start = get_timestamp();
        
        int nfds = event_queue_poll(loop->queue, events, 
                                   loop->max_events_per_iteration, 
                                   loop->poll_timeout);
        
        if (nfds > 0) {
            for (int i = 0; i < nfds; i++) {
                loop->callback(events[i], loop->context);
            }
            
            loop->total_events_processed += nfds;
        }
        
        loop->total_iterations++;
        
        // Update performance statistics every second
        uint64_t current_time = get_timestamp();
        if (current_time - loop->last_stats_time >= 1000000) { // 1 second in microseconds
            uint64_t events_per_second = loop->total_events_processed;
            if (events_per_second > loop->max_events_per_second) {
                loop->max_events_per_second = events_per_second;
            }
            
            // Adaptive tuning
            if (events_per_second > 10000) {
                // High load - reduce timeout for better responsiveness
                loop->poll_timeout = 1;
                loop->max_events_per_iteration = 200;
            } else if (events_per_second < 100) {
                // Low load - increase timeout to reduce CPU usage
                loop->poll_timeout = 50;
                loop->max_events_per_iteration = 50;
            }
            
            loop->total_events_processed = 0;
            loop->last_stats_time = current_time;
        }
        
        // Yield CPU if no events processed
        if (nfds == 0) {
            usleep(100); // 100 microseconds
        }
    }
}

void event_loop_stop(event_loop_t *loop) {
    if (loop) {
        loop->running = false;
    }
}

// Destroy event loop
void event_loop_destroy(event_loop_t *loop) {
    if (!loop) {
        return;
    }
    
    if (loop->queue) {
        // Clean up all registered file descriptors
        for (int fd = 0; fd <= loop->queue->max_fd; fd++) {
            if (loop->queue->fd_data[fd]) {
                event_queue_remove(loop->queue, fd);
            }
        }
        
        close(loop->queue->epoll_fd);
        free(loop->queue);
    }
    
    free(loop);
}

// Get event system statistics
void event_system_get_stats(event_queue_t *eq, event_stats_t *stats) {
    if (!eq || !stats) {
        return;
    }
    
    stats->total_events = eq->total_events;
    stats->read_events = eq->read_events;
    stats->write_events = eq->write_events;
    stats->error_events = eq->error_events;
    stats->spurious_events = eq->spurious_events;
    stats->avg_batch_size = eq->avg_batch_size;
    stats->max_fd = eq->max_fd;
    
    // Calculate efficiency metrics
    if (eq->total_events > 0) {
        stats->error_rate = (double)eq->error_events / eq->total_events;
        stats->spurious_rate = (double)eq->spurious_events / eq->total_events;
    } else {
        stats->error_rate = 0.0;
        stats->spurious_rate = 0.0;
    }
}
```

## File System Operations

### Recipe 4.1: Advanced File I/O with Asynchronous Operations

**Problem**: Need high-performance file I/O that doesn't block the main thread.

**Solution**: Implement asynchronous I/O with completion queues and scatter-gather operations.

```c
// Asynchronous I/O system
// File: async_io.c

#include <aio.h>
#include <errno.h>
#include <fcntl.h>
#include <sys/stat.h>

#define MAX_AIO_OPERATIONS 1024
#define AIO_QUEUE_SIZE 256
#define MAX_IOVEC 16

typedef enum aio_operation_type {
    AIO_READ = 1,
    AIO_WRITE = 2,
    AIO_FSYNC = 3,
    AIO_FDSYNC = 4
} aio_operation_type_t;

typedef struct aio_request {
    struct aiocb aiocb;
    aio_operation_type_t type;
    void *user_data;
    uint64_t submit_time;
    uint64_t complete_time;
    int error_code;
    ssize_t bytes_transferred;
    struct aio_request *next;
} aio_request_t;

typedef struct aio_completion_queue {
    aio_request_t *completed_head;
    aio_request_t *completed_tail;
    pthread_mutex_t mutex;
    pthread_cond_t condition;
    uint32_t completed_count;
} aio_completion_queue_t;

typedef struct aio_context {
    aio_request_t *requests[MAX_AIO_OPERATIONS];
    aio_completion_queue_t completion_queue;
    
    // Free request pool
    aio_request_t *free_requests;
    pthread_mutex_t free_mutex;
    
    // Statistics
    uint64_t total_requests;
    uint64_t completed_requests;
    uint64_t failed_requests;
    uint64_t total_bytes_read;
    uint64_t total_bytes_written;
    uint64_t total_io_time;
    
    // Configuration
    int max_concurrent_ops;
    bool use_direct_io;
    size_t alignment_size;
} aio_context_t;

// Initialize AIO context
aio_context_t *aio_context_create(int max_concurrent_ops, bool use_direct_io) {
    aio_context_t *ctx = malloc(sizeof(aio_context_t));
    if (!ctx) {
        return NULL;
    }
    
    memset(ctx, 0, sizeof(aio_context_t));
    
    // Initialize completion queue
    ctx->completion_queue.completed_head = NULL;
    ctx->completion_queue.completed_tail = NULL;
    ctx->completion_queue.completed_count = 0;
    pthread_mutex_init(&ctx->completion_queue.mutex, NULL);
    pthread_cond_init(&ctx->completion_queue.condition, NULL);
    
    // Initialize free request pool
    ctx->free_requests = NULL;
    pthread_mutex_init(&ctx->free_mutex, NULL);
    
    // Pre-allocate request structures
    for (int i = 0; i < MAX_AIO_OPERATIONS; i++) {
        aio_request_t *req = malloc(sizeof(aio_request_t));
        if (req) {
            req->next = ctx->free_requests;
            ctx->free_requests = req;
        }
    }
    
    ctx->max_concurrent_ops = max_concurrent_ops;
    ctx->use_direct_io = use_direct_io;
    ctx->alignment_size = use_direct_io ? 4096 : 1; // Page alignment for direct I/O
    
    return ctx;
}

// Allocate AIO request
static aio_request_t *aio_request_alloc(aio_context_t *ctx) {
    pthread_mutex_lock(&ctx->free_mutex);
    
    aio_request_t *req = ctx->free_requests;
    if (req) {
        ctx->free_requests = req->next;
    }
    
    pthread_mutex_unlock(&ctx->free_mutex);
    
    if (req) {
        memset(req, 0, sizeof(aio_request_t));
    }
    
    return req;
}

// Free AIO request
static void aio_request_free(aio_context_t *ctx, aio_request_t *req) {
    pthread_mutex_lock(&ctx->free_mutex);
    
    req->next = ctx->free_requests;
    ctx->free_requests = req;
    
    pthread_mutex_unlock(&ctx->free_mutex);
}

// AIO completion handler
static void aio_completion_handler(sigval_t sigval) {
    aio_request_t *req = (aio_request_t *)sigval.sival_ptr;
    aio_context_t *ctx = (aio_context_t *)req->user_data;
    
    req->complete_time = get_timestamp();
    req->error_code = aio_error(&req->aiocb);
    
    if (req->error_code == 0) {
        req->bytes_transferred = aio_return(&req->aiocb);
        ctx->completed_requests++;
        
        if (req->type == AIO_READ) {
            ctx->total_bytes_read += req->bytes_transferred;
        } else if (req->type == AIO_WRITE) {
            ctx->total_bytes_written += req->bytes_transferred;
        }
    } else {
        ctx->failed_requests++;
    }
    
    ctx->total_io_time += req->complete_time - req->submit_time;
    
    // Add to completion queue
    pthread_mutex_lock(&ctx->completion_queue.mutex);
    
    req->next = NULL;
    if (ctx->completion_queue.completed_tail) {
        ctx->completion_queue.completed_tail->next = req;
    } else {
        ctx->completion_queue.completed_head = req;
    }
    ctx->completion_queue.completed_tail = req;
    ctx->completion_queue.completed_count++;
    
    pthread_cond_signal(&ctx->completion_queue.condition);
    pthread_mutex_unlock(&ctx->completion_queue.mutex);
}

// Submit asynchronous read
int aio_read_async(aio_context_t *ctx, int fd, void *buffer, size_t count, 
                   off_t offset, void *user_data) {
    if (!ctx || !buffer || count == 0) {
        return -1;
    }
    
    aio_request_t *req = aio_request_alloc(ctx);
    if (!req) {
        return -1;
    }
    
    req->type = AIO_READ;
    req->user_data = user_data;
    req->submit_time = get_timestamp();
    
    // Setup aiocb structure
    req->aiocb.aio_fildes = fd;
    req->aiocb.aio_buf = buffer;
    req->aiocb.aio_nbytes = count;
    req->aiocb.aio_offset = offset;
    req->aiocb.aio_sigevent.sigev_notify = SIGEV_THREAD;
    req->aiocb.aio_sigevent.sigev_notify_function = aio_completion_handler;
    req->aiocb.aio_sigevent.sigev_value.sival_ptr = req;
    
    if (aio_read(&req->aiocb) == -1) {
        aio_request_free(ctx, req);
        return -1;
    }
    
    ctx->total_requests++;
    return 0;
}

// Submit asynchronous write
int aio_write_async(aio_context_t *ctx, int fd, const void *buffer, size_t count,
                    off_t offset, void *user_data) {
    if (!ctx || !buffer || count == 0) {
        return -1;
    }
    
    aio_request_t *req = aio_request_alloc(ctx);
    if (!req) {
        return -1;
    }
    
    req->type = AIO_WRITE;
    req->user_data = user_data;
    req->submit_time = get_timestamp();
    
    req->aiocb.aio_fildes = fd;
    req->aiocb.aio_buf = (void *)buffer;
    req->aiocb.aio_nbytes = count;
    req->aiocb.aio_offset = offset;
    req->aiocb.aio_sigevent.sigev_notify = SIGEV_THREAD;
    req->aiocb.aio_sigevent.sigev_notify_function = aio_completion_handler;
    req->aiocb.aio_sigevent.sigev_value.sival_ptr = req;
    
    if (aio_write(&req->aiocb) == -1) {
        aio_request_free(ctx, req);
        return -1;
    }
    
    ctx->total_requests++;
    return 0;
}

// Vectored I/O for scatter-gather operations
typedef struct iovec_request {
    struct iovec *iov;
    int iovcnt;
    aio_request_t **sub_requests;
    int pending_count;
    void *user_data;
    pthread_mutex_t mutex;
    bool completed;
} iovec_request_t;

// Submit vectored read
int aio_readv_async(aio_context_t *ctx, int fd, const struct iovec *iov, 
                    int iovcnt, off_t offset, void *user_data) {
    if (!ctx || !iov || iovcnt <= 0 || iovcnt > MAX_IOVEC) {
        return -1;
    }
    
    iovec_request_t *vec_req = malloc(sizeof(iovec_request_t));
    if (!vec_req) {
        return -1;
    }
    
    vec_req->sub_requests = malloc(sizeof(aio_request_t*) * iovcnt);
    if (!vec_req->sub_requests) {
        free(vec_req);
        return -1;
    }
    
    vec_req->iov = malloc(sizeof(struct iovec) * iovcnt);
    if (!vec_req->iov) {
        free(vec_req->sub_requests);
        free(vec_req);
        return -1;
    }
    
    memcpy(vec_req->iov, iov, sizeof(struct iovec) * iovcnt);
    vec_req->iovcnt = iovcnt;
    vec_req->pending_count = iovcnt;
    vec_req->user_data = user_data;
    vec_req->completed = false;
    pthread_mutex_init(&vec_req->mutex, NULL);
    
    // Submit individual read requests
    off_t current_offset = offset;
    for (int i = 0; i < iovcnt; i++) {
        int result = aio_read_async(ctx, fd, iov[i].iov_base, iov[i].iov_len,
                                   current_offset, vec_req);
        if (result == -1) {
            // Cleanup on failure
            for (int j = 0; j < i; j++) {
                // Cancel submitted requests
                aio_cancel(fd, &vec_req->sub_requests[j]->aiocb);
            }
            
            pthread_mutex_destroy(&vec_req->mutex);
            free(vec_req->iov);
            free(vec_req->sub_requests);
            free(vec_req);
            return -1;
        }
        
        current_offset += iov[i].iov_len;
    }
    
    return 0;
}

// Wait for completion
aio_request_t *aio_wait_completion(aio_context_t *ctx, int timeout_ms) {
    if (!ctx) {
        return NULL;
    }
    
    pthread_mutex_lock(&ctx->completion_queue.mutex);
    
    // Check if completions are available
    if (ctx->completion_queue.completed_count == 0 && timeout_ms > 0) {
        struct timespec timeout;
        clock_gettime(CLOCK_REALTIME, &timeout);
        timeout.tv_nsec += timeout_ms * 1000000L;
        if (timeout.tv_nsec >= 1000000000L) {
            timeout.tv_sec += 1;
            timeout.tv_nsec -= 1000000000L;
        }
        
        pthread_cond_timedwait(&ctx->completion_queue.condition,
                              &ctx->completion_queue.mutex, &timeout);
    }
    
    aio_request_t *req = NULL;
    if (ctx->completion_queue.completed_head) {
        req = ctx->completion_queue.completed_head;
        ctx->completion_queue.completed_head = req->next;
        
        if (!ctx->completion_queue.completed_head) {
            ctx->completion_queue.completed_tail = NULL;
        }
        
        ctx->completion_queue.completed_count--;
    }
    
    pthread_mutex_unlock(&ctx->completion_queue.mutex);
    
    return req;
}

// High-level file operations using AIO
typedef struct async_file {
    int fd;
    aio_context_t *ctx;
    char *filename;
    int flags;
    mode_t mode;
    
    // Buffering
    char *read_buffer;
    char *write_buffer;
    size_t buffer_size;
    
    // Statistics
    uint64_t bytes_read;
    uint64_t bytes_written;
    uint64_t read_operations;
    uint64_t write_operations;
} async_file_t;

// Open file for async operations
async_file_t *async_file_open(aio_context_t *ctx, const char *filename, 
                             int flags, mode_t mode, size_t buffer_size) {
    if (!ctx || !filename) {
        return NULL;
    }
    
    async_file_t *file = malloc(sizeof(async_file_t));
    if (!file) {
        return NULL;
    }
    
    // Add O_DIRECT for direct I/O if configured
    if (ctx->use_direct_io) {
        flags |= O_DIRECT;
    }
    
    file->fd = open(filename, flags, mode);
    if (file->fd == -1) {
        free(file);
        return NULL;
    }
    
    file->ctx = ctx;
    file->filename = strdup(filename);
    file->flags = flags;
    file->mode = mode;
    
    // Allocate aligned buffers for direct I/O
    if (buffer_size > 0) {
        file->buffer_size = (buffer_size + ctx->alignment_size - 1) & 
                           ~(ctx->alignment_size - 1);
        
        if (posix_memalign((void**)&file->read_buffer, ctx->alignment_size, 
                          file->buffer_size) != 0) {
            file->read_buffer = NULL;
        }
        
        if (posix_memalign((void**)&file->write_buffer, ctx->alignment_size,
                          file->buffer_size) != 0) {
            file->write_buffer = NULL;
        }
    } else {
        file->read_buffer = NULL;
        file->write_buffer = NULL;
        file->buffer_size = 0;
    }
    
    file->bytes_read = 0;
    file->bytes_written = 0;
    file->read_operations = 0;
    file->write_operations = 0;
    
    return file;
}

// Async read with automatic buffering
int async_file_read(async_file_t *file, void *buffer, size_t count, 
                   off_t offset, void *user_data) {
    if (!file || !buffer || count == 0) {
        return -1;
    }
    
    // Use internal buffer for small reads with direct I/O
    if (file->ctx->use_direct_io && count < file->buffer_size && file->read_buffer) {
        // Read larger chunk into buffer, then copy requested data
        size_t aligned_count = (count + file->ctx->alignment_size - 1) & 
                              ~(file->ctx->alignment_size - 1);
        off_t aligned_offset = offset & ~(file->ctx->alignment_size - 1);
        
        int result = aio_read_async(file->ctx, file->fd, file->read_buffer,
                                   aligned_count, aligned_offset, user_data);
        if (result == 0) {
            file->read_operations++;
        }
        return result;
    } else {
        int result = aio_read_async(file->ctx, file->fd, buffer, count, offset, user_data);
        if (result == 0) {
            file->read_operations++;
        }
        return result;
    }
}

// Async write with automatic buffering
int async_file_write(async_file_t *file, const void *buffer, size_t count,
                    off_t offset, void *user_data) {
    if (!file || !buffer || count == 0) {
        return -1;
    }
    
    // Use internal buffer for direct I/O alignment
    if (file->ctx->use_direct_io && file->write_buffer) {
        size_t aligned_count = (count + file->ctx->alignment_size - 1) & 
                              ~(file->ctx->alignment_size - 1);
        
        if (aligned_count <= file->buffer_size) {
            memcpy(file->write_buffer, buffer, count);
            // Zero padding for alignment
            if (aligned_count > count) {
                memset((char*)file->write_buffer + count, 0, aligned_count - count);
            }
            
            int result = aio_write_async(file->ctx, file->fd, file->write_buffer,
                                        aligned_count, offset, user_data);
            if (result == 0) {
                file->write_operations++;
            }
            return result;
        }
    }
    
    int result = aio_write_async(file->ctx, file->fd, buffer, count, offset, user_data);
    if (result == 0) {
        file->write_operations++;
    }
    return result;
}

// Close async file
void async_file_close(async_file_t *file) {
    if (!file) {
        return;
    }
    
    // Wait for pending operations to complete
    while (file->ctx->total_requests > file->ctx->completed_requests + file->ctx->failed_requests) {
        aio_request_t *req = aio_wait_completion(file->ctx, 100);
        if (req) {
            aio_request_free(file->ctx, req);
        }
    }
    
    close(file->fd);
    
    if (file->read_buffer) {
        free(file->read_buffer);
    }
    if (file->write_buffer) {
        free(file->write_buffer);
    }
    if (file->filename) {
        free(file->filename);
    }
    
    free(file);
}
```

