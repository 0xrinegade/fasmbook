# Chapter 11: BPF Programming - Kernel-Level Network and System Monitoring
*Programming at the Speed of Silicon*

## Introduction: The Kernel's Eye View

Berkeley Packet Filter (BPF) and its modern evolution, Extended BPF (eBPF), represent one of the most powerful technologies for system observability, networking, and security. When combined with assembly language programming, BPF opens up unprecedented opportunities for high-performance, kernel-level programming that can monitor, filter, and modify system behavior with minimal overhead.

This chapter explores how to write BPF programs in assembly language, from basic packet filtering to advanced system call tracing, performance monitoring, and security enforcement. You'll learn to compile BPF bytecode, interact with kernel subsystems, and build sophisticated monitoring tools that operate at the kernel level with microsecond precision.

Understanding BPF at the assembly level provides deep insights into kernel programming, virtual machine design, and the trade-offs between security and performance in modern operating systems. These concepts are fundamental to system programming, network security, and the emerging field of programmable infrastructure.

## BPF Virtual Machine Architecture

### Understanding the BPF Instruction Set

BPF implements a register-based virtual machine with a simplified instruction set designed for safe kernel execution. Understanding this architecture is crucial for writing efficient BPF programs.

```assembly
format PE console
entry start

include 'win32a.inc'

section '.data' data readable writeable
    ; BPF program structure
    bpf_prog_info   struct
        type        dd ?
        insn_cnt    dd ?
        insns       dd ?
        license     dd ?
        prog_flags  dd ?
        name        rb 16
        ifindex     dd ?
        expected_attach_type dd ?
    ends
    
    ; BPF instruction structure
    bpf_insn        struct
        code        db ?    ; Opcode
        dst_reg     db ?    ; Destination register (4 bits)
        src_reg     db ?    ; Source register (4 bits)
        off         dw ?    ; Offset
        imm         dd ?    ; Immediate value
    ends
    
    ; BPF registers
    BPF_REG_0       equ 0   ; Return value
    BPF_REG_1       equ 1   ; 1st argument
    BPF_REG_2       equ 2   ; 2nd argument
    BPF_REG_3       equ 3   ; 3rd argument
    BPF_REG_4       equ 4   ; 4th argument
    BPF_REG_5       equ 5   ; 5th argument
    BPF_REG_6       equ 6   ; General purpose
    BPF_REG_7       equ 7   ; General purpose
    BPF_REG_8       equ 8   ; General purpose
    BPF_REG_9       equ 9   ; General purpose
    BPF_REG_10      equ 10  ; Stack pointer (read-only)
    
    ; BPF instruction classes
    BPF_LD          equ 0x00
    BPF_LDX         equ 0x01
    BPF_ST          equ 0x02
    BPF_STX         equ 0x03
    BPF_ALU         equ 0x04
    BPF_JMP         equ 0x05
    BPF_RET         equ 0x06
    BPF_MISC        equ 0x07
    
    ; BPF program types
    BPF_PROG_TYPE_SOCKET_FILTER     equ 1
    BPF_PROG_TYPE_KPROBE           equ 2
    BPF_PROG_TYPE_SCHED_CLS        equ 3
    BPF_PROG_TYPE_SCHED_ACT        equ 4
    BPF_PROG_TYPE_TRACEPOINT       equ 5
    BPF_PROG_TYPE_XDP             equ 6
    BPF_PROG_TYPE_PERF_EVENT      equ 7
    BPF_PROG_TYPE_CGROUP_SKB      equ 8
    BPF_PROG_TYPE_CGROUP_SOCK     equ 9
    BPF_PROG_TYPE_LWT_IN          equ 10
    
    ; BPF helper function IDs
    BPF_FUNC_map_lookup_elem        equ 1
    BPF_FUNC_map_update_elem        equ 2
    BPF_FUNC_map_delete_elem        equ 3
    BPF_FUNC_probe_read            equ 4
    BPF_FUNC_ktime_get_ns          equ 5
    BPF_FUNC_trace_printk          equ 6
    BPF_FUNC_get_prandom_u32       equ 7
    BPF_FUNC_get_smp_processor_id   equ 8
    BPF_FUNC_skb_store_bytes       equ 9
    BPF_FUNC_l3_csum_replace       equ 10
    
    ; BPF maps
    bpf_map_def     struct
        type        dd ?
        key_size    dd ?
        value_size  dd ?
        max_entries dd ?
        map_flags   dd ?
    ends
    
    ; Sample BPF programs
    packet_count_prog rb 1024
    syscall_trace_prog rb 2048
    perf_monitor_prog rb 1536

section '.code' code readable executable

start:
    call init_bpf_system
    call demo_packet_filter
    call demo_syscall_tracer
    call demo_performance_monitor
    invoke ExitProcess, 0

; BPF instruction builders
bpf_mov64_reg:
    ; MOV dst, src (64-bit register to register)
    ; al = dst_reg, ah = src_reg, returns instruction in eax
    push ebx
    mov bl, al      ; dst_reg
    mov bh, ah      ; src_reg
    
    ; Build instruction: BPF_ALU64 | BPF_MOV | BPF_X
    mov eax, 0xBF   ; Opcode
    shl ebx, 8      ; Shift registers
    or eax, ebx
    
    pop ebx
    ret

bpf_mov64_imm:
    ; MOV dst, imm (64-bit immediate to register)
    ; al = dst_reg, ebx = immediate, returns instruction in eax:edx
    push ecx
    mov cl, al      ; dst_reg
    
    ; Build instruction: BPF_ALU64 | BPF_MOV | BPF_K
    mov eax, 0xB7   ; Opcode
    shl ecx, 8
    or eax, ecx
    mov edx, ebx    ; Immediate value
    
    pop ecx
    ret

bpf_add64_reg:
    ; ADD dst, src (64-bit register addition)
    ; al = dst_reg, ah = src_reg
    push ebx
    mov bl, al
    mov bh, ah
    
    ; Build instruction: BPF_ALU64 | BPF_ADD | BPF_X
    mov eax, 0x0F
    shl ebx, 8
    or eax, ebx
    
    pop ebx
    ret

bpf_load_abs:
    ; Load from packet absolute offset
    ; eax = offset, returns instruction
    push ebx
    mov ebx, eax
    
    ; Build instruction: BPF_LD | BPF_ABS | BPF_W
    mov eax, 0x20
    ; Immediate contains offset
    
    pop ebx
    ret

bpf_load_mem:
    ; Load from memory
    ; al = dst_reg, ah = src_reg, dx = offset
    push ebx ecx
    mov bl, al      ; dst_reg
    mov bh, ah      ; src_reg
    mov cx, dx      ; offset
    
    ; Build instruction: BPF_LDX | BPF_MEM | BPF_W
    mov eax, 0x61
    shl ebx, 8
    or eax, ebx
    shl ecx, 16
    or eax, ecx
    
    pop ecx ebx
    ret

bpf_store_mem:
    ; Store to memory
    ; al = dst_reg, ah = src_reg, dx = offset
    push ebx ecx
    mov bl, al
    mov bh, ah
    mov cx, dx
    
    ; Build instruction: BPF_STX | BPF_MEM | BPF_W
    mov eax, 0x63
    shl ebx, 8
    or eax, ebx
    shl ecx, 16
    or eax, ecx
    
    pop ecx ebx
    ret

bpf_jump_eq:
    ; Jump if equal
    ; al = dst_reg, ah = src_reg, dx = offset
    push ebx ecx
    mov bl, al
    mov bh, ah
    mov cx, dx
    
    ; Build instruction: BPF_JMP | BPF_JEQ | BPF_X
    mov eax, 0x1D
    shl ebx, 8
    or eax, ebx
    shl ecx, 16
    or eax, ecx
    
    pop ecx ebx
    ret

bpf_call:
    ; Call BPF helper function
    ; eax = function_id
    push ebx
    mov ebx, eax
    
    ; Build instruction: BPF_JMP | BPF_CALL
    mov eax, 0x85
    ; Immediate contains function ID
    
    pop ebx
    ret

bpf_exit:
    ; Exit BPF program
    ; Build instruction: BPF_JMP | BPF_EXIT
    mov eax, 0x95
    ret

; High-level BPF program builders
build_packet_filter:
    ; Build packet filter program
    mov edi, packet_count_prog
    mov ecx, 0  ; Instruction count
    
    ; Load Ethernet header type (offset 12)
    mov eax, 12
    call bpf_load_abs
    call emit_bpf_instruction
    inc ecx
    
    ; Check if it's IPv4 (0x0800)
    mov al, BPF_REG_0
    mov ebx, 0x0800
    call bpf_mov64_imm
    call emit_bpf_instruction
    inc ecx
    
    ; Compare with loaded value
    mov al, BPF_REG_0
    mov ah, BPF_REG_1
    mov dx, 2  ; Skip next instruction if equal
    call bpf_jump_eq
    call emit_bpf_instruction
    inc ecx
    
    ; Not IPv4, drop packet (return 0)
    mov al, BPF_REG_0
    mov ebx, 0
    call bpf_mov64_imm
    call emit_bpf_instruction
    inc ecx
    
    call bpf_exit
    call emit_bpf_instruction
    inc ecx
    
    ; IPv4 packet, load IP protocol (offset 23)
    mov eax, 23
    call bpf_load_abs
    call emit_bpf_instruction
    inc ecx
    
    ; Check if TCP (protocol 6)
    mov al, BPF_REG_0
    mov ah, BPF_REG_1
    mov ebx, 6
    call bpf_mov64_imm
    call emit_bpf_instruction
    inc ecx
    
    ; Compare protocols
    mov al, BPF_REG_0
    mov ah, BPF_REG_1
    mov dx, 2
    call bpf_jump_eq
    call emit_bpf_instruction
    inc ecx
    
    ; Not TCP, accept with truncation
    mov al, BPF_REG_0
    mov ebx, 96  ; Truncate to 96 bytes
    call bpf_mov64_imm
    call emit_bpf_instruction
    inc ecx
    
    call bpf_exit
    call emit_bpf_instruction
    inc ecx
    
    ; TCP packet, accept full packet
    mov al, BPF_REG_0
    mov ebx, 65535
    call bpf_mov64_imm
    call emit_bpf_instruction
    inc ecx
    
    call bpf_exit
    call emit_bpf_instruction
    inc ecx
    
    mov [packet_filter_size], ecx
    ret

build_syscall_tracer:
    ; Build system call tracing program
    mov edi, syscall_trace_prog
    mov ecx, 0
    
    ; Get current time
    mov eax, BPF_FUNC_ktime_get_ns
    call bpf_call
    call emit_bpf_instruction
    inc ecx
    
    ; Store timestamp in map
    ; Prepare map key (PID)
    mov al, BPF_REG_1
    mov ah, BPF_REG_10  ; Stack pointer
    mov dx, -8          ; Offset on stack
    call bpf_store_mem
    call emit_bpf_instruction
    inc ecx
    
    ; Get current PID
    call get_current_pid_helper
    call emit_bpf_instruction
    inc ecx
    
    ; Store PID as map key
    mov al, BPF_REG_2
    mov ah, BPF_REG_10
    mov dx, -8
    call bpf_store_mem
    call emit_bpf_instruction
    inc ecx
    
    ; Prepare map value (timestamp)
    mov al, BPF_REG_3
    mov ah, BPF_REG_10
    mov dx, -16
    call bpf_store_mem
    call emit_bpf_instruction
    inc ecx
    
    mov al, BPF_REG_4
    mov ah, BPF_REG_0   ; Timestamp from earlier call
    call bpf_mov64_reg
    call emit_bpf_instruction
    inc ecx
    
    ; Store in stack
    mov al, BPF_REG_4
    mov ah, BPF_REG_10
    mov dx, -16
    call bpf_store_mem
    call emit_bpf_instruction
    inc ecx
    
    ; Update map
    mov al, BPF_REG_1
    mov ebx, syscall_trace_map
    call bpf_mov64_imm
    call emit_bpf_instruction
    inc ecx
    
    mov al, BPF_REG_2
    mov ah, BPF_REG_10
    mov dx, -8
    call bpf_load_mem
    call emit_bpf_instruction
    inc ecx
    
    mov al, BPF_REG_3
    mov ah, BPF_REG_10
    mov dx, -16
    call bpf_load_mem
    call emit_bpf_instruction
    inc ecx
    
    mov al, BPF_REG_4
    mov ebx, 0  ; Flags
    call bpf_mov64_imm
    call emit_bpf_instruction
    inc ecx
    
    mov eax, BPF_FUNC_map_update_elem
    call bpf_call
    call emit_bpf_instruction
    inc ecx
    
    ; Return 0 (continue)
    mov al, BPF_REG_0
    mov ebx, 0
    call bpf_mov64_imm
    call emit_bpf_instruction
    inc ecx
    
    call bpf_exit
    call emit_bpf_instruction
    inc ecx
    
    mov [syscall_tracer_size], ecx
    ret

emit_bpf_instruction:
    ; Emit BPF instruction to current program buffer
    ; eax = instruction (or eax:edx for 64-bit immediate)
    stosd
    ret

; BPF map operations
create_bpf_map:
    ; Create BPF map
    ; esi = map definition, returns: eax = map_fd
    push esi
    
    ; System call to create map
    mov eax, 321  ; sys_bpf
    mov ebx, 0    ; BPF_MAP_CREATE
    mov ecx, esi  ; map definition
    mov edx, sizeof.bpf_map_def
    int 0x80
    
    pop esi
    ret

load_bpf_program:
    ; Load BPF program into kernel
    ; esi = program buffer, ecx = instruction count, edx = program type
    push esi ecx edx
    
    ; Prepare program info structure
    mov [bpf_prog_info.type], edx
    mov [bpf_prog_info.insn_cnt], ecx
    mov [bpf_prog_info.insns], esi
    mov [bpf_prog_info.license], license_string
    mov [bpf_prog_info.prog_flags], 0
    
    ; System call to load program
    mov eax, 321  ; sys_bpf
    mov ebx, 5    ; BPF_PROG_LOAD
    mov ecx, bpf_prog_info
    mov edx, sizeof.bpf_prog_info
    int 0x80
    
    pop edx ecx esi
    ret

attach_bpf_program:
    ; Attach BPF program to interface or tracepoint
    ; eax = prog_fd, ebx = attach_type, ecx = target
    push eax ebx ecx
    
    ; Different attachment methods based on type
    cmp ebx, BPF_PROG_TYPE_SOCKET_FILTER
    je .attach_socket
    cmp ebx, BPF_PROG_TYPE_XDP
    je .attach_xdp
    cmp ebx, BPF_PROG_TYPE_KPROBE
    je .attach_kprobe
    
    jmp .attach_error
    
    .attach_socket:
        ; Attach to socket
        call attach_socket_filter
        jmp .attach_done
    
    .attach_xdp:
        ; Attach XDP program
        call attach_xdp_program
        jmp .attach_done
    
    .attach_kprobe:
        ; Attach kprobe
        call attach_kprobe_program
        jmp .attach_done
    
    .attach_error:
        mov eax, -1
    
    .attach_done:
        pop ecx ebx eax
        ret

; Advanced BPF features
bpf_tail_call:
    ; Implement BPF tail call for program chaining
    ; al = dst_reg (should be BPF_REG_2), ebx = prog_array_map, ecx = index
    push edx
    
    ; Load program array map
    mov ah, 0  ; src_reg not used for immediate
    call bpf_mov64_imm
    call emit_bpf_instruction
    
    ; Load index
    mov al, BPF_REG_3
    mov ebx, ecx
    call bpf_mov64_imm
    call emit_bpf_instruction
    
    ; Tail call
    mov eax, BPF_FUNC_tail_call
    call bpf_call
    call emit_bpf_instruction
    
    pop edx
    ret

bpf_map_lookup:
    ; Generate map lookup sequence
    ; al = dst_reg, ebx = map_fd, ecx = key_reg
    push edx
    
    ; Map FD in R1
    mov al, BPF_REG_1
    call bpf_mov64_imm
    call emit_bpf_instruction
    
    ; Key pointer in R2
    mov al, BPF_REG_2
    mov ah, cl  ; key_reg
    call bpf_mov64_reg
    call emit_bpf_instruction
    
    ; Call map_lookup_elem
    mov eax, BPF_FUNC_map_lookup_elem
    call bpf_call
    call emit_bpf_instruction
    
    ; Check for NULL return
    mov al, BPF_REG_1
    mov ah, BPF_REG_0
    call bpf_mov64_reg
    call emit_bpf_instruction
    
    ; Jump if NULL
    mov al, BPF_REG_1
    mov ebx, 0
    mov dx, 2  ; Skip next instruction
    call bpf_jump_eq
    call emit_bpf_instruction
    
    pop edx
    ret

; Specialized BPF programs
build_xdp_packet_processor:
    ; Build XDP packet processing program
    mov edi, xdp_prog_buffer
    mov ecx, 0
    
    ; Load packet start pointer
    mov al, BPF_REG_2
    mov ah, BPF_REG_1  ; ctx->data
    mov dx, 0
    call bpf_load_mem
    call emit_bpf_instruction
    inc ecx
    
    ; Load packet end pointer
    mov al, BPF_REG_3
    mov ah, BPF_REG_1  ; ctx->data_end
    mov dx, 4
    call bpf_load_mem
    call emit_bpf_instruction
    inc ecx
    
    ; Bounds check for Ethernet header
    mov al, BPF_REG_4
    mov ah, BPF_REG_2
    call bpf_mov64_reg
    call emit_bpf_instruction
    inc ecx
    
    ; Add Ethernet header size
    mov al, BPF_REG_4
    mov ebx, 14
    call bpf_add64_imm
    call emit_bpf_instruction
    inc ecx
    
    ; Check bounds
    mov al, BPF_REG_4
    mov ah, BPF_REG_3
    mov dx, 20  ; Jump to drop if out of bounds
    call bpf_jump_gt
    call emit_bpf_instruction
    inc ecx
    
    ; Load Ethernet type
    mov al, BPF_REG_5
    mov ah, BPF_REG_2
    mov dx, 12
    call bpf_load_mem
    call emit_bpf_instruction
    inc ecx
    
    ; Check for IPv4 (0x0800 in network byte order)
    mov al, BPF_REG_6
    mov ebx, 0x0008  ; 0x0800 in little endian
    call bpf_mov64_imm
    call emit_bpf_instruction
    inc ecx
    
    ; Compare
    mov al, BPF_REG_5
    mov ah, BPF_REG_6
    mov dx, 2
    call bpf_jump_ne
    call emit_bpf_instruction
    inc ecx
    
    ; Process IPv4 packet
    call build_ipv4_processor
    
    ; Default action: pass
    mov al, BPF_REG_0
    mov ebx, 2  ; XDP_PASS
    call bpf_mov64_imm
    call emit_bpf_instruction
    inc ecx
    
    call bpf_exit
    call emit_bpf_instruction
    inc ecx
    
    ; Drop packet
    mov al, BPF_REG_0
    mov ebx, 1  ; XDP_DROP
    call bpf_mov64_imm
    call emit_bpf_instruction
    inc ecx
    
    call bpf_exit
    call emit_bpf_instruction
    inc ecx
    
    ret

build_perf_event_tracer:
    ; Build performance event tracing program
    mov edi, perf_prog_buffer
    mov ecx, 0
    
    ; Get current CPU
    mov eax, BPF_FUNC_get_smp_processor_id
    call bpf_call
    call emit_bpf_instruction
    inc ecx
    
    ; Save CPU ID
    mov al, BPF_REG_6
    mov ah, BPF_REG_0
    call bpf_mov64_reg
    call emit_bpf_instruction
    inc ecx
    
    ; Get current time
    mov eax, BPF_FUNC_ktime_get_ns
    call bpf_call
    call emit_bpf_instruction
    inc ecx
    
    ; Save timestamp
    mov al, BPF_REG_7
    mov ah, BPF_REG_0
    call bpf_mov64_reg
    call emit_bpf_instruction
    inc ecx
    
    ; Read performance counter
    call read_perf_counter
    
    ; Store event data
    call store_perf_event
    
    ; Return
    mov al, BPF_REG_0
    mov ebx, 0
    call bpf_mov64_imm
    call emit_bpf_instruction
    inc ecx
    
    call bpf_exit
    call emit_bpf_instruction
    inc ecx
    
    ret

; BPF program verification and optimization
verify_bpf_program:
    ; Basic BPF program verification
    ; esi = program buffer, ecx = instruction count
    push esi ecx ebx
    
    mov ebx, 0  ; Instruction index
    
    .verify_loop:
        cmp ebx, ecx
        jge .verify_done
        
        ; Load instruction
        mov eax, [esi + ebx*8]
        
        ; Check instruction validity
        call verify_instruction
        test eax, eax
        jz .verify_failed
        
        ; Check register usage
        call check_register_bounds
        test eax, eax
        jz .verify_failed
        
        ; Check jump targets
        call check_jump_targets
        test eax, eax
        jz .verify_failed
        
        inc ebx
        jmp .verify_loop
    
    .verify_done:
        mov eax, 1  ; Success
        jmp .verify_exit
    
    .verify_failed:
        mov eax, 0  ; Failure
    
    .verify_exit:
        pop ebx ecx esi
        ret

optimize_bpf_program:
    ; Optimize BPF program for better performance
    ; esi = program buffer, ecx = instruction count
    push esi ecx
    
    ; Dead code elimination
    call eliminate_dead_code
    
    ; Constant folding
    call fold_constants
    
    ; Register allocation optimization
    call optimize_registers
    
    ; Jump optimization
    call optimize_jumps
    
    pop ecx esi
    ret

; Data structures for BPF maps
setup_bpf_maps:
    ; Setup various BPF map types
    
    ; Hash map for packet counters
    mov [packet_counter_map.type], 1  ; BPF_MAP_TYPE_HASH
    mov [packet_counter_map.key_size], 4
    mov [packet_counter_map.value_size], 8
    mov [packet_counter_map.max_entries], 1024
    
    ; Array map for statistics
    mov [stats_array_map.type], 2  ; BPF_MAP_TYPE_ARRAY
    mov [stats_array_map.key_size], 4
    mov [stats_array_map.value_size], 8
    mov [stats_array_map.max_entries], 256
    
    ; Ring buffer for events
    mov [event_ringbuf_map.type], 27  ; BPF_MAP_TYPE_RINGBUF
    mov [event_ringbuf_map.key_size], 0
    mov [event_ringbuf_map.value_size], 0
    mov [event_ringbuf_map.max_entries], 65536
    
    ret

; Program loading and management
load_and_attach_programs:
    ; Load and attach all BPF programs
    
    ; Create maps first
    mov esi, packet_counter_map
    call create_bpf_map
    mov [packet_counter_fd], eax
    
    mov esi, stats_array_map
    call create_bpf_map
    mov [stats_array_fd], eax
    
    ; Load packet filter
    call build_packet_filter
    mov esi, packet_count_prog
    mov ecx, [packet_filter_size]
    mov edx, BPF_PROG_TYPE_SOCKET_FILTER
    call load_bpf_program
    mov [packet_filter_fd], eax
    
    ; Load syscall tracer
    call build_syscall_tracer
    mov esi, syscall_trace_prog
    mov ecx, [syscall_tracer_size]
    mov edx, BPF_PROG_TYPE_KPROBE
    call load_bpf_program
    mov [syscall_tracer_fd], eax
    
    ; Attach programs
    mov eax, [packet_filter_fd]
    mov ebx, BPF_PROG_TYPE_SOCKET_FILTER
    mov ecx, 0  ; Default socket
    call attach_bpf_program
    
    ret

; String constants
license_string      db 'GPL', 0
packet_filter_name  db 'packet_filter', 0
syscall_tracer_name db 'syscall_tracer', 0

; Data storage
packet_counter_map  bpf_map_def
stats_array_map     bpf_map_def
event_ringbuf_map   bpf_map_def

packet_counter_fd   dd ?
stats_array_fd      dd ?
event_ringbuf_fd    dd ?

packet_filter_fd    dd ?
syscall_tracer_fd   dd ?
perf_monitor_fd     dd ?

packet_filter_size  dd ?
syscall_tracer_size dd ?
perf_monitor_size   dd ?

xdp_prog_buffer     rb 2048
perf_prog_buffer    rb 1024
```

## Advanced BPF Applications

### Network Security and DDoS Protection

BPF programs can implement sophisticated network security measures directly in the kernel, providing protection against various attacks with minimal performance impact.

```assembly
; DDoS protection BPF program
build_ddos_protection:
    ; Build comprehensive DDoS protection program
    mov edi, ddos_prog_buffer
    mov ecx, 0
    
    ; Load packet context
    mov al, BPF_REG_6
    mov ah, BPF_REG_1
    call bpf_mov64_reg
    call emit_bpf_instruction
    inc ecx
    
    ; Get current time for rate limiting
    mov eax, BPF_FUNC_ktime_get_ns
    call bpf_call
    call emit_bpf_instruction
    inc ecx
    
    ; Save timestamp
    mov al, BPF_REG_7
    mov ah, BPF_REG_0
    call bpf_mov64_reg
    call emit_bpf_instruction
    inc ecx
    
    ; Extract source IP from packet
    call extract_source_ip
    
    ; Check if IP is in whitelist
    call check_whitelist
    
    ; Check rate limiting
    call check_rate_limit
    
    ; Check for SYN flood
    call check_syn_flood
    
    ; Check packet size anomalies
    call check_packet_size
    
    ; Default: allow packet
    mov al, BPF_REG_0
    mov ebx, 2  ; XDP_PASS
    call bpf_mov64_imm
    call emit_bpf_instruction
    inc ecx
    
    call bpf_exit
    call emit_bpf_instruction
    inc ecx
    
    ret

extract_source_ip:
    ; Extract source IP from IPv4 header
    ; Assumes IPv4 packet bounds already checked
    
    ; Load data pointer
    mov al, BPF_REG_2
    mov ah, BPF_REG_6  ; packet ctx
    mov dx, 0
    call bpf_load_mem
    call emit_bpf_instruction
    inc ecx
    
    ; Load source IP (offset 26 from start of packet)
    mov al, BPF_REG_3
    mov ah, BPF_REG_2
    mov dx, 26
    call bpf_load_mem
    call emit_bpf_instruction
    inc ecx
    
    ; Store IP in stack for later use
    mov al, BPF_REG_3
    mov ah, BPF_REG_10
    mov dx, -4
    call bpf_store_mem
    call emit_bpf_instruction
    inc ecx
    
    ret

check_rate_limit:
    ; Implement token bucket rate limiting per source IP
    
    ; Prepare map lookup for rate limit data
    mov al, BPF_REG_1
    mov ebx, [rate_limit_map_fd]
    call bpf_mov64_imm
    call emit_bpf_instruction
    inc ecx
    
    ; Key is source IP (on stack)
    mov al, BPF_REG_2
    mov ah, BPF_REG_10
    mov dx, -4
    call bpf_load_mem
    call emit_bpf_instruction
    inc ecx
    
    ; Lookup rate limit entry
    mov eax, BPF_FUNC_map_lookup_elem
    call bpf_call
    call emit_bpf_instruction
    inc ecx
    
    ; Check if entry exists
    mov al, BPF_REG_4
    mov ah, BPF_REG_0
    call bpf_mov64_reg
    call emit_bpf_instruction
    inc ecx
    
    ; Jump if entry exists
    mov al, BPF_REG_4
    mov ebx, 0
    mov dx, 10  ; Skip to existing entry handling
    call bpf_jump_ne
    call emit_bpf_instruction
    inc ecx
    
    ; No entry exists, create new one
    call create_rate_limit_entry
    
    ; Update token bucket
    call update_token_bucket
    
    ; Check if rate limit exceeded
    call check_rate_exceeded
    
    ret

create_rate_limit_entry:
    ; Create new rate limit entry for IP
    
    ; Initialize rate limit structure on stack
    ; Structure: last_update (8), token_count (4), packet_count (4)
    
    ; Set last_update to current time
    mov al, BPF_REG_7  ; Current timestamp
    mov ah, BPF_REG_10
    mov dx, -16
    call bpf_store_mem
    call emit_bpf_instruction
    inc ecx
    
    ; Set initial token count (max tokens)
    mov al, BPF_REG_8
    mov ebx, 100  ; Max tokens
    call bpf_mov64_imm
    call emit_bpf_instruction
    inc ecx
    
    mov al, BPF_REG_8
    mov ah, BPF_REG_10
    mov dx, -8
    call bpf_store_mem
    call emit_bpf_instruction
    inc ecx
    
    ; Set packet count to 1
    mov al, BPF_REG_8
    mov ebx, 1
    call bpf_mov64_imm
    call emit_bpf_instruction
    inc ecx
    
    mov al, BPF_REG_8
    mov ah, BPF_REG_10
    mov dx, -4
    call bpf_store_mem
    call emit_bpf_instruction
    inc ecx
    
    ; Update map with new entry
    mov al, BPF_REG_1
    mov ebx, [rate_limit_map_fd]
    call bpf_mov64_imm
    call emit_bpf_instruction
    inc ecx
    
    mov al, BPF_REG_2
    mov ah, BPF_REG_10
    mov dx, -20  ; IP address key
    call bpf_load_mem
    call emit_bpf_instruction
    inc ecx
    
    mov al, BPF_REG_3
    mov ah, BPF_REG_10
    mov dx, -16  ; Rate limit data
    call bpf_load_mem
    call emit_bpf_instruction
    inc ecx
    
    mov al, BPF_REG_4
    mov ebx, 0  ; Flags
    call bpf_mov64_imm
    call emit_bpf_instruction
    inc ecx
    
    mov eax, BPF_FUNC_map_update_elem
    call bpf_call
    call emit_bpf_instruction
    inc ecx
    
    ret

check_syn_flood:
    ; Check for SYN flood attacks
    
    ; Load TCP flags (if TCP packet)
    mov al, BPF_REG_2
    mov ah, BPF_REG_6
    mov dx, 0
    call bpf_load_mem
    call emit_bpf_instruction
    inc ecx
    
    ; Check if TCP (protocol 6 at offset 23)
    mov al, BPF_REG_3
    mov ah, BPF_REG_2
    mov dx, 23
    call bpf_load_mem
    call emit_bpf_instruction
    inc ecx
    
    ; Compare with TCP protocol
    mov al, BPF_REG_4
    mov ebx, 6
    call bpf_mov64_imm
    call emit_bpf_instruction
    inc ecx
    
    mov al, BPF_REG_3
    mov ah, BPF_REG_4
    mov dx, 20  ; Skip SYN flood check if not TCP
    call bpf_jump_ne
    call emit_bpf_instruction
    inc ecx
    
    ; Load TCP flags (offset varies, assume 47 for now)
    mov al, BPF_REG_5
    mov ah, BPF_REG_2
    mov dx, 47
    call bpf_load_mem
    call emit_bpf_instruction
    inc ecx
    
    ; Check SYN flag (bit 1)
    mov al, BPF_REG_6
    mov ah, BPF_REG_5
    call bpf_mov64_reg
    call emit_bpf_instruction
    inc ecx
    
    mov al, BPF_REG_7
    mov ebx, 2  ; SYN flag mask
    call bpf_mov64_imm
    call emit_bpf_instruction
    inc ecx
    
    ; AND with SYN mask
    mov al, BPF_REG_6
    mov ah, BPF_REG_7
    call bpf_and64_reg
    call emit_bpf_instruction
    inc ecx
    
    ; Check if SYN flag set
    mov al, BPF_REG_6
    mov ebx, 0
    mov dx, 10  ; Skip SYN flood logic if not SYN
    call bpf_jump_eq
    call emit_bpf_instruction
    inc ecx
    
    ; SYN packet detected, check rate
    call check_syn_rate
    
    ret

check_packet_size:
    ; Check for packet size anomalies
    
    ; Get packet length
    mov al, BPF_REG_2
    mov ah, BPF_REG_6
    mov dx, 4  ; data_end offset
    call bpf_load_mem
    call emit_bpf_instruction
    inc ecx
    
    mov al, BPF_REG_3
    mov ah, BPF_REG_6
    mov dx, 0  ; data offset
    call bpf_load_mem
    call emit_bpf_instruction
    inc ecx
    
    ; Calculate packet length
    mov al, BPF_REG_4
    mov ah, BPF_REG_2
    call bpf_mov64_reg
    call emit_bpf_instruction
    inc ecx
    
    mov al, BPF_REG_4
    mov ah, BPF_REG_3
    call bpf_sub64_reg
    call emit_bpf_instruction
    inc ecx
    
    ; Check for suspiciously small packets
    mov al, BPF_REG_5
    mov ebx, 40  ; Minimum reasonable size
    call bpf_mov64_imm
    call emit_bpf_instruction
    inc ecx
    
    mov al, BPF_REG_4
    mov ah, BPF_REG_5
    mov dx, 5  ; Drop if too small
    call bpf_jump_lt
    call emit_bpf_instruction
    inc ecx
    
    ; Check for suspiciously large packets
    mov al, BPF_REG_5
    mov ebx, 9000  ; Jumbo frame threshold
    call bpf_mov64_imm
    call emit_bpf_instruction
    inc ecx
    
    mov al, BPF_REG_4
    mov ah, BPF_REG_5
    mov dx, 5  ; Drop if too large
    call bpf_jump_gt
    call emit_bpf_instruction
    inc ecx
    
    ; Packet size is reasonable
    jmp .size_check_done
    
    ; Drop packet due to size anomaly
    mov al, BPF_REG_0
    mov ebx, 1  ; XDP_DROP
    call bpf_mov64_imm
    call emit_bpf_instruction
    inc ecx
    
    call bpf_exit
    call emit_bpf_instruction
    inc ecx
    
    .size_check_done:
    ret

; Performance monitoring with BPF
build_perf_monitor:
    ; Build performance monitoring program
    mov edi, perf_monitor_prog
    mov ecx, 0
    
    ; Sample CPU performance counters
    call sample_cpu_counters
    
    ; Monitor memory usage
    call monitor_memory_usage
    
    ; Track I/O statistics
    call track_io_statistics
    
    ; Log performance event
    call log_performance_event
    
    ; Return success
    mov al, BPF_REG_0
    mov ebx, 0
    call bpf_mov64_imm
    call emit_bpf_instruction
    inc ecx
    
    call bpf_exit
    call emit_bpf_instruction
    inc ecx
    
    mov [perf_monitor_size], ecx
    ret

sample_cpu_counters:
    ; Sample various CPU performance counters
    
    ; Get CPU cycles
    mov eax, BPF_FUNC_get_prandom_u32  ; Placeholder for actual perf counter
    call bpf_call
    call emit_bpf_instruction
    inc ecx
    
    ; Store in map
    call store_cpu_metric
    
    ; Get cache misses
    call sample_cache_counters
    
    ; Get branch prediction stats
    call sample_branch_counters
    
    ret

monitor_memory_usage:
    ; Monitor memory allocation patterns
    
    ; Track allocation sizes
    call track_allocation_sizes
    
    ; Monitor memory pressure
    call check_memory_pressure
    
    ; Track page faults
    call track_page_faults
    
    ret

build_security_monitor:
    ; Build security monitoring program
    mov edi, security_monitor_prog
    mov ecx, 0
    
    ; Monitor privilege escalation attempts
    call monitor_privilege_escalation
    
    ; Track suspicious file access
    call track_file_access
    
    ; Monitor network connections
    call monitor_network_connections
    
    ; Detect anomalous system calls
    call detect_anomalous_syscalls
    
    ; Return
    mov al, BPF_REG_0
    mov ebx, 0
    call bpf_mov64_imm
    call emit_bpf_instruction
    inc ecx
    
    call bpf_exit
    call emit_bpf_instruction
    inc ecx
    
    ret

; BPF program coordination and management
coordinate_bpf_programs:
    ; Coordinate multiple BPF programs working together
    
    ; Set up program array for tail calls
    call setup_program_array
    
    ; Configure inter-program communication
    call setup_program_communication
    
    ; Load program chain
    call load_program_chain
    
    ret

setup_program_array:
    ; Setup BPF program array for tail calls
    mov [prog_array_map.type], 3  ; BPF_MAP_TYPE_PROG_ARRAY
    mov [prog_array_map.key_size], 4
    mov [prog_array_map.value_size], 4
    mov [prog_array_map.max_entries], 16
    
    mov esi, prog_array_map
    call create_bpf_map
    mov [prog_array_fd], eax
    
    ; Populate program array
    call populate_program_array
    
    ret

; Error handling and debugging
debug_bpf_program:
    ; Add debug instrumentation to BPF programs
    
    ; Insert trace points
    call insert_trace_points
    
    ; Add assertion checks
    call add_assertion_checks
    
    ; Enable verbose logging
    call enable_verbose_logging
    
    ret

insert_trace_points:
    ; Insert BPF trace points for debugging
    
    ; Print entry message
    mov esi, entry_message
    call add_trace_printk
    
    ; Print intermediate values
    call add_value_tracing
    
    ; Print exit message
    mov esi, exit_message
    call add_trace_printk
    
    ret

add_trace_printk:
    ; Add trace_printk call to program
    ; esi = format string
    
    ; Load format string address
    mov al, BPF_REG_1
    mov ebx, esi
    call bpf_mov64_imm
    call emit_bpf_instruction
    inc ecx
    
    ; Call trace_printk
    mov eax, BPF_FUNC_trace_printk
    call bpf_call
    call emit_bpf_instruction
    inc ecx
    
    ret

; Data structures and constants
ddos_prog_buffer        rb 4096
security_monitor_prog   rb 3072
rate_limit_map         bpf_map_def
syn_flood_map          bpf_map_def
prog_array_map         bpf_map_def

rate_limit_map_fd      dd ?
syn_flood_map_fd       dd ?
prog_array_fd          dd ?

entry_message          db 'BPF program entry', 0
exit_message           db 'BPF program exit', 0
debug_format           db 'Debug: value=%d', 0

; Additional helper functions would continue here...
```

This chapter provides a comprehensive foundation for BPF programming in assembly language. From basic packet filtering to advanced security monitoring and performance optimization, you now have the tools to leverage the kernel's full power for high-performance, low-latency system programming. The techniques presented here demonstrate how BPF can be used to build sophisticated monitoring, security, and optimization tools that operate with minimal overhead while maintaining system safety.

## Exercises

1. **Packet Analyzer**: Build a complete packet analysis tool using XDP that can classify traffic and generate real-time statistics.

2. **Security Monitor**: Implement a comprehensive security monitoring system using multiple BPF programs that detect various attack patterns.

3. **Performance Profiler**: Create a system-wide performance profiler that uses BPF to collect detailed CPU, memory, and I/O metrics.

4. **Load Balancer**: Build a high-performance load balancer using XDP that can distribute traffic across multiple backend servers.

5. **Custom Protocol**: Implement support for a custom network protocol using BPF, including parsing, validation, and forwarding logic.

The next chapter will explore building virtual machines based on KolibriOS, showing how to create isolated execution environments and implement containerization at the assembly level.