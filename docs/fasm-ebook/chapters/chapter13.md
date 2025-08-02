# Chapter 13: Container Implementation for KolibriOS
*Lightweight Virtualization and Process Isolation*

## Introduction: The Container Revolution

Containers have revolutionized software deployment and development by providing lightweight, portable, and isolated execution environments. Unlike traditional virtual machines that virtualize entire hardware stacks, containers share the host kernel while maintaining process isolation. Implementing containers from scratch in assembly language provides deep insights into operating system fundamentals, process management, and resource isolation techniques.

This chapter explores how to implement a complete container system for KolibriOS, from namespace isolation and resource limits to image management and orchestration. You'll learn to create secure, efficient containers that can run applications with minimal overhead while maintaining strict isolation boundaries.

Understanding containers at the assembly level reveals the sophisticated interplay between kernel features, file systems, and network stacks that enable modern cloud-native applications. These concepts are fundamental to DevOps, microservices architecture, and the entire cloud computing ecosystem.

## Container Architecture and Design

### Process Isolation and Namespaces

The foundation of containerization lies in process isolation using operating system namespaces. We'll implement the core namespace types that provide isolated views of system resources.

```assembly
format PE console
entry start

include 'win32a.inc'

section '.data' data readable writeable
    ; Container namespace types
    NAMESPACE_PID       equ 1
    NAMESPACE_NET       equ 2
    NAMESPACE_MNT       equ 3
    NAMESPACE_UTS       equ 4
    NAMESPACE_IPC       equ 5
    NAMESPACE_USER      equ 6
    NAMESPACE_CGROUP    equ 7
    
    ; Container structure
    container_context struct
        container_id    dd ?
        process_id      dd ?
        namespaces      rb 8    ; Namespace file descriptors
        root_path       rb 256  ; Container root filesystem
        init_process    dd ?
        state           db ?    ; 0=created, 1=running, 2=stopped
        cpu_limit       dd ?    ; CPU percentage limit
        memory_limit    dd ?    ; Memory limit in bytes
        network_config  dd ?    ; Network configuration
        mount_table     dd ?    ; Mount table
        capabilities    dd ?    ; Security capabilities
        uid_map         dd ?    ; UID mapping table
        gid_map         dd ?    ; GID mapping table
        cgroup_path     rb 128  ; Control group path
        created_time    dq ?
        start_time      dq ?
        stats           dd ?    ; Resource usage statistics
    ends
    
    ; Container runtime
    max_containers      equ 100
    container_pool      container_context max_containers dup(<>)
    active_containers   dd 0
    container_mutex     dd 0
    
    ; Resource limits
    cgroup_hierarchy    struct
        cpu_cgroup      dd ?
        memory_cgroup   dd ?
        blkio_cgroup    dd ?
        net_cgroup      dd ?
        devices_cgroup  dd ?
    ends
    
    ; Network isolation
    network_namespace   struct
        veth_pairs      rd 16   ; Virtual Ethernet pairs
        bridge_id       dd ?
        ip_address      dd ?
        subnet_mask     dd ?
        gateway         dd ?
        dns_servers     rd 4
        port_mappings   rd 32   ; Host:Container port mappings
    ends
    
    ; Mount namespace
    mount_entry         struct
        source_path     rb 256
        target_path     rb 256
        filesystem_type rb 32
        mount_flags     dd ?
        mount_data      rb 128
    ends
    
    max_mounts          equ 64
    container_mounts    mount_entry max_mounts dup(<>)

section '.code' code readable executable

start:
    call init_container_system
    call demo_container_lifecycle
    call cleanup_container_system
    invoke ExitProcess, 0

init_container_system:
    ; Initialize container management system
    call check_kernel_features
    test eax, eax
    jz .feature_error
    
    call setup_cgroup_hierarchy
    call init_network_subsystem
    call create_container_registry
    call setup_security_framework
    
    ; Create synchronization objects
    invoke CreateMutex, 0, FALSE, 0
    mov [container_mutex], eax
    
    ret
    
    .feature_error:
        invoke MessageBox, 0, kernel_feature_error, error_title, MB_OK
        invoke ExitProcess, 1

check_kernel_features:
    ; Check for required kernel features
    call check_namespace_support
    test eax, eax
    jz .no_namespaces
    
    call check_cgroup_support
    test eax, eax
    jz .no_cgroups
    
    call check_capabilities_support
    test eax, eax
    jz .no_capabilities
    
    mov eax, 1  ; All features available
    ret
    
    .no_namespaces:
    .no_cgroups:
    .no_capabilities:
        xor eax, eax
        ret

; Container lifecycle management
create_container:
    ; Create new container
    ; esi = container configuration, returns container ID in eax
    invoke WaitForSingleObject, [container_mutex], INFINITE
    
    ; Find free container slot
    call find_free_container_slot
    test eax, eax
    jz .no_slots_available
    
    mov edi, eax  ; Container structure pointer
    
    ; Initialize container
    call init_container_structure
    
    ; Create namespaces
    call create_container_namespaces
    test eax, eax
    jz .namespace_creation_failed
    
    ; Setup filesystem
    call setup_container_filesystem
    test eax, eax
    jz .filesystem_setup_failed
    
    ; Configure networking
    call setup_container_networking
    
    ; Apply resource limits
    call apply_resource_limits
    
    ; Generate container ID
    call generate_container_id
    mov [edi + container_context.container_id], eax
    
    ; Mark as created
    mov byte [edi + container_context.state], 0
    
    ; Update registry
    call register_container
    
    invoke ReleaseMutex, [container_mutex]
    mov eax, [edi + container_context.container_id]
    ret
    
    .no_slots_available:
    .namespace_creation_failed:
    .filesystem_setup_failed:
        invoke ReleaseMutex, [container_mutex]
        xor eax, eax
        ret

start_container:
    ; Start container execution
    ; eax = container_id, esi = command line
    push esi
    call find_container_by_id
    test eax, eax
    jz .container_not_found
    
    mov edi, eax  ; Container structure
    
    ; Check container state
    cmp byte [edi + container_context.state], 0
    jne .container_not_ready
    
    ; Enter container namespaces
    call enter_container_namespaces
    test eax, eax
    jz .namespace_entry_failed
    
    ; Change root filesystem
    call change_container_root
    test eax, eax
    jz .chroot_failed
    
    ; Apply security context
    call apply_security_context
    
    ; Create init process
    pop esi  ; Command line
    call create_container_init_process
    test eax, eax
    jz .process_creation_failed
    
    mov [edi + container_context.init_process], eax
    mov [edi + container_context.process_id], eax
    
    ; Mark as running
    mov byte [edi + container_context.state], 1
    call get_current_time
    mov [edi + container_context.start_time], eax
    
    ; Start monitoring
    call start_container_monitoring
    
    mov eax, 1  ; Success
    ret
    
    .container_not_found:
    .container_not_ready:
    .namespace_entry_failed:
    .chroot_failed:
        pop esi
    .process_creation_failed:
        xor eax, eax
        ret

stop_container:
    ; Stop container execution
    ; eax = container_id
    call find_container_by_id
    test eax, eax
    jz .container_not_found
    
    mov edi, eax  ; Container structure
    
    ; Check if running
    cmp byte [edi + container_context.state], 1
    jne .container_not_running
    
    ; Send termination signal to init process
    mov eax, [edi + container_context.init_process]
    call terminate_container_process
    
    ; Wait for graceful shutdown
    call wait_container_shutdown
    
    ; Force kill if necessary
    call force_kill_container_processes
    
    ; Cleanup namespaces
    call cleanup_container_namespaces
    
    ; Remove network configuration
    call cleanup_container_networking
    
    ; Remove filesystem mounts
    call cleanup_container_filesystem
    
    ; Mark as stopped
    mov byte [edi + container_context.state], 2
    
    mov eax, 1  ; Success
    ret
    
    .container_not_found:
    .container_not_running:
        xor eax, eax
        ret

; Namespace implementation
create_container_namespaces:
    ; Create isolated namespaces for container
    ; edi = container structure
    
    ; Create PID namespace
    call create_pid_namespace
    test eax, eax
    jz .pid_namespace_failed
    mov [edi + container_context.namespaces + NAMESPACE_PID], al
    
    ; Create network namespace
    call create_network_namespace
    test eax, eax
    jz .net_namespace_failed
    mov [edi + container_context.namespaces + NAMESPACE_NET], al
    
    ; Create mount namespace
    call create_mount_namespace
    test eax, eax
    jz .mount_namespace_failed
    mov [edi + container_context.namespaces + NAMESPACE_MNT], al
    
    ; Create UTS namespace (hostname/domain)
    call create_uts_namespace
    test eax, eax
    jz .uts_namespace_failed
    mov [edi + container_context.namespaces + NAMESPACE_UTS], al
    
    ; Create IPC namespace
    call create_ipc_namespace
    test eax, eax
    jz .ipc_namespace_failed
    mov [edi + container_context.namespaces + NAMESPACE_IPC], al
    
    ; Create user namespace
    call create_user_namespace
    test eax, eax
    jz .user_namespace_failed
    mov [edi + container_context.namespaces + NAMESPACE_USER], al
    
    mov eax, 1  ; Success
    ret
    
    .pid_namespace_failed:
    .net_namespace_failed:
    .mount_namespace_failed:
    .uts_namespace_failed:
    .ipc_namespace_failed:
    .user_namespace_failed:
        ; Cleanup any created namespaces
        call cleanup_partial_namespaces
        xor eax, eax
        ret

create_pid_namespace:
    ; Create PID namespace for process isolation
    
    ; System call to create PID namespace
    mov eax, 272    ; sys_unshare
    mov ebx, 0x20000000  ; CLONE_NEWPID
    int 0x80
    
    test eax, eax
    js .creation_failed
    
    ; Get namespace file descriptor
    call get_namespace_fd
    ret
    
    .creation_failed:
        xor eax, eax
        ret

create_network_namespace:
    ; Create network namespace for network isolation
    
    ; Create network namespace
    mov eax, 272    ; sys_unshare
    mov ebx, 0x40000000  ; CLONE_NEWNET
    int 0x80
    
    test eax, eax
    js .creation_failed
    
    ; Setup loopback interface
    call setup_loopback_interface
    
    ; Get namespace FD
    call get_namespace_fd
    ret
    
    .creation_failed:
        xor eax, eax
        ret

create_mount_namespace:
    ; Create mount namespace for filesystem isolation
    
    mov eax, 272    ; sys_unshare
    mov ebx, 0x00020000  ; CLONE_NEWNS
    int 0x80
    
    test eax, eax
    js .creation_failed
    
    ; Make private mount propagation
    call setup_private_mounts
    
    call get_namespace_fd
    ret
    
    .creation_failed:
        xor eax, eax
        ret

; Resource management with cgroups
setup_cgroup_hierarchy:
    ; Setup control group hierarchy for resource management
    
    ; Mount cgroup filesystem
    call mount_cgroup_filesystem
    test eax, eax
    jz .mount_failed
    
    ; Create container cgroup directory
    call create_container_cgroup_dir
    
    ; Initialize cgroup controllers
    call init_cpu_controller
    call init_memory_controller
    call init_blkio_controller
    call init_devices_controller
    
    ret
    
    .mount_failed:
        ; Handle mount failure
        ret

apply_resource_limits:
    ; Apply resource limits using cgroups
    ; edi = container structure
    
    ; Apply CPU limits
    mov eax, [edi + container_context.cpu_limit]
    test eax, eax
    jz .no_cpu_limit
    call apply_cpu_limit
    
    .no_cpu_limit:
    
    ; Apply memory limits
    mov eax, [edi + container_context.memory_limit]
    test eax, eax
    jz .no_memory_limit
    call apply_memory_limit
    
    .no_memory_limit:
    
    ; Apply device restrictions
    call apply_device_restrictions
    
    ret

apply_cpu_limit:
    ; Apply CPU percentage limit
    ; eax = CPU limit percentage, edi = container
    
    ; Calculate CPU quota and period
    mov ebx, 100000     ; Standard period (100ms)
    mul ebx
    mov ecx, 100
    div ecx            ; eax = quota
    
    ; Write to cgroup cpu.cfs_quota_us
    push eax
    call get_cgroup_cpu_path
    pop eax
    call write_cgroup_value
    
    ret

apply_memory_limit:
    ; Apply memory limit
    ; eax = memory limit in bytes, edi = container
    
    ; Write to cgroup memory.limit_in_bytes
    call get_cgroup_memory_path
    call write_cgroup_value
    
    ; Set swap limit (disable swap)
    call get_cgroup_memory_swap_path
    mov eax, [edi + container_context.memory_limit]
    call write_cgroup_value
    
    ret

; Container filesystem management
setup_container_filesystem:
    ; Setup isolated filesystem for container
    ; edi = container structure
    
    ; Create container root directory
    call create_container_root_dir
    test eax, eax
    jz .root_creation_failed
    
    ; Mount container image
    call mount_container_image
    test eax, eax
    jz .image_mount_failed
    
    ; Create essential directories
    call create_essential_directories
    
    ; Mount pseudo filesystems
    call mount_pseudo_filesystems
    
    ; Setup device nodes
    call setup_device_nodes
    
    ; Configure name resolution
    call setup_container_dns
    
    mov eax, 1  ; Success
    ret
    
    .root_creation_failed:
    .image_mount_failed:
        xor eax, eax
        ret

mount_container_image:
    ; Mount container image as root filesystem
    ; edi = container structure
    
    ; Create overlay filesystem mount
    call create_overlay_mount
    test eax, eax
    jz .overlay_failed
    
    ; Mount image layers
    call mount_image_layers
    
    ; Set container root path
    mov esi, overlay_mount_path
    lea edi, [edi + container_context.root_path]
    call copy_string
    
    mov eax, 1
    ret
    
    .overlay_failed:
        xor eax, eax
        ret

create_overlay_mount:
    ; Create overlay filesystem mount for layered images
    
    ; Prepare overlay mount options
    call prepare_overlay_options
    
    ; Mount overlay filesystem
    mov eax, 21         ; sys_mount
    mov ebx, overlay_type
    mov ecx, overlay_mount_path
    mov edx, overlay_type
    mov esi, MS_RELATIME
    mov edi, overlay_options
    int 0x80
    
    test eax, eax
    js .mount_failed
    
    mov eax, 1
    ret
    
    .mount_failed:
        xor eax, eax
        ret

mount_pseudo_filesystems:
    ; Mount essential pseudo filesystems
    ; edi = container structure
    
    ; Mount /proc
    call mount_proc_filesystem
    
    ; Mount /sys
    call mount_sys_filesystem
    
    ; Mount /dev
    call mount_dev_filesystem
    
    ; Mount /dev/pts
    call mount_devpts_filesystem
    
    ; Mount /dev/shm
    call mount_tmpfs_shm
    
    ret

; Container networking
setup_container_networking:
    ; Setup network configuration for container
    ; edi = container structure
    
    ; Create virtual ethernet pair
    call create_veth_pair
    test eax, eax
    jz .veth_creation_failed
    
    ; Move one end to container namespace
    call move_veth_to_container
    
    ; Configure container-side interface
    call configure_container_interface
    
    ; Setup bridge on host side
    call setup_host_bridge
    
    ; Configure NAT rules
    call configure_nat_rules
    
    ; Setup port forwarding
    call configure_port_forwarding
    
    mov eax, 1
    ret
    
    .veth_creation_failed:
        xor eax, eax
        ret

create_veth_pair:
    ; Create virtual ethernet pair for container networking
    
    ; Generate unique interface names
    call generate_veth_names
    
    ; Create veth pair using netlink
    call create_veth_netlink
    test eax, eax
    jz .netlink_failed
    
    ; Store interface names
    call store_veth_names
    
    mov eax, 1
    ret
    
    .netlink_failed:
        xor eax, eax
        ret

configure_container_interface:
    ; Configure network interface inside container
    
    ; Set IP address
    call set_container_ip_address
    
    ; Set subnet mask
    call set_container_netmask
    
    ; Set default gateway
    call set_container_gateway
    
    ; Bring interface up
    call bring_interface_up
    
    ret

; Container security
apply_security_context:
    ; Apply security context to container
    ; edi = container structure
    
    ; Drop unnecessary capabilities
    call drop_capabilities
    
    ; Set user/group mappings
    call setup_user_mappings
    
    ; Apply seccomp filters
    call apply_seccomp_filters
    
    ; Set resource limits
    call set_rlimits
    
    ; Configure AppArmor/SELinux if available
    call configure_mac_security
    
    ret

drop_capabilities:
    ; Drop unnecessary Linux capabilities
    
    ; Keep only essential capabilities
    mov eax, 0          ; CAP_CHOWN
    bts eax, 1          ; CAP_DAC_OVERRIDE  
    bts eax, 2          ; CAP_DAC_READ_SEARCH
    bts eax, 3          ; CAP_FOWNER
    bts eax, 4          ; CAP_FSETID
    bts eax, 5          ; CAP_KILL
    bts eax, 6          ; CAP_SETGID
    bts eax, 7          ; CAP_SETUID
    
    ; Apply capability set
    push eax
    mov eax, 185        ; sys_capset
    mov ebx, esp
    int 0x80
    add esp, 4
    
    ret

apply_seccomp_filters:
    ; Apply system call filtering
    
    ; Create seccomp filter program
    call create_seccomp_program
    
    ; Install seccomp filter
    mov eax, 317        ; sys_seccomp
    mov ebx, 1          ; SECCOMP_SET_MODE_FILTER
    mov ecx, 0          ; flags
    mov edx, seccomp_program
    int 0x80
    
    ret

; Container monitoring and statistics
start_container_monitoring:
    ; Start monitoring container resource usage
    ; edi = container structure
    
    ; Create monitoring thread
    invoke CreateThread, 0, 0, container_monitor_proc, edi, 0, 0
    
    ; Initialize statistics structure
    call init_container_stats
    
    ret

container_monitor_proc:
    ; Container monitoring thread procedure
    ; [esp+4] = container structure pointer
    
    mov edi, [esp+4]
    
    .monitor_loop:
        ; Check if container is still running
        cmp byte [edi + container_context.state], 1
        jne .monitoring_done
        
        ; Collect CPU statistics
        call collect_cpu_stats
        
        ; Collect memory statistics
        call collect_memory_stats
        
        ; Collect network statistics
        call collect_network_stats
        
        ; Collect I/O statistics
        call collect_io_stats
        
        ; Update statistics
        call update_container_stats
        
        ; Sleep for monitoring interval
        invoke Sleep, 1000  ; 1 second
        jmp .monitor_loop
    
    .monitoring_done:
        invoke ExitThread, 0

collect_cpu_stats:
    ; Collect CPU usage statistics from cgroups
    ; edi = container structure
    
    ; Read cgroup cpu.stat
    call read_cgroup_cpu_stat
    
    ; Calculate CPU percentage
    call calculate_cpu_percentage
    
    ; Store in statistics
    call store_cpu_stats
    
    ret

collect_memory_stats:
    ; Collect memory usage statistics
    ; edi = container structure
    
    ; Read memory.usage_in_bytes
    call read_memory_usage
    
    ; Read memory.stat for detailed stats
    call read_memory_detailed_stats
    
    ; Store in statistics
    call store_memory_stats
    
    ret

; Container image management
load_container_image:
    ; Load container image from registry or file
    ; esi = image name/path, returns image ID in eax
    
    ; Check if image exists locally
    call check_local_image
    test eax, eax
    jnz .image_available
    
    ; Pull image from registry
    call pull_image_from_registry
    test eax, eax
    jz .pull_failed
    
    .image_available:
        ; Extract image layers
        call extract_image_layers
        
        ; Verify image integrity
        call verify_image_integrity
        
        ; Register image
        call register_image
        
        ret
    
    .pull_failed:
        xor eax, eax
        ret

extract_image_layers:
    ; Extract container image layers
    ; esi = image path
    
    ; Open image archive
    call open_image_archive
    test eax, eax
    jz .open_failed
    
    ; Extract each layer
    call extract_all_layers
    
    ; Setup layer metadata
    call setup_layer_metadata
    
    ; Close archive
    call close_image_archive
    
    mov eax, 1
    ret
    
    .open_failed:
        xor eax, eax
        ret

; Container orchestration
create_container_cluster:
    ; Create cluster of containers
    ; esi = cluster configuration
    
    ; Parse cluster configuration
    call parse_cluster_config
    
    ; Create network overlay
    call create_cluster_network
    
    ; Create shared storage
    call setup_cluster_storage
    
    ; Deploy containers
    call deploy_cluster_containers
    
    ; Setup service discovery
    call setup_service_discovery
    
    ; Configure load balancing
    call configure_load_balancing
    
    ret

manage_container_lifecycle:
    ; Manage container lifecycle events
    
    ; Monitor container health
    call monitor_container_health
    
    ; Handle container failures
    call handle_container_failures
    
    ; Implement restart policies
    call apply_restart_policies
    
    ; Manage resource scaling
    call manage_resource_scaling
    
    ret

; Data structures and constants
overlay_type           db 'overlay', 0
overlay_mount_path     db '/tmp/container_overlay', 0
overlay_options        db 'lowerdir=/lower,upperdir=/upper,workdir=/work', 0

proc_mount_path        db '/proc', 0
sys_mount_path         db '/sys', 0
dev_mount_path         db '/dev', 0

container_registry     rb 4096
seccomp_program        rb 1024

; Error messages
kernel_feature_error   db 'Required kernel features not available', 0
error_title           db 'Container Error', 0

; Performance counters
container_stats        struct
    cpu_usage_percent  dd ?
    memory_usage_bytes dq ?
    network_rx_bytes   dq ?
    network_tx_bytes   dq ?
    block_read_bytes   dq ?
    block_write_bytes  dq ?
    process_count      dd ?
    thread_count       dd ?
ends

; Container image format
image_manifest         struct
    schema_version     dd ?
    media_type         rb 64
    config_digest      rb 64
    layers_count       dd ?
    layer_digests      rb 64*32  ; Up to 32 layers
ends

; Networking structures
bridge_config          struct
    bridge_name        rb 16
    ip_address         dd ?
    subnet_mask        dd ?
    mtu                dw ?
    stp_enabled        db ?
ends

veth_pair              struct
    host_interface     rb 16
    container_interface rb 16
    host_ip            dd ?
    container_ip       dd ?
ends
```

This comprehensive chapter demonstrates how to implement a complete container system from the ground up using assembly language. From namespace isolation and resource management to networking and security, you now have the foundation to create sophisticated containerization platforms. The techniques shown here provide deep insights into operating system fundamentals and the underlying technologies that power modern container platforms like Docker and Kubernetes.

## Exercises

1. **Container Runtime**: Extend the container implementation to support more container runtimes like containerd or CRI-O.

2. **Image Builder**: Implement a container image building system with layer optimization and caching.

3. **Container Orchestrator**: Build a simple container orchestration system with service discovery and load balancing.

4. **Security Hardening**: Implement advanced security features like user namespace mapping and advanced seccomp filters.

5. **Performance Optimization**: Optimize container startup time and resource usage through advanced caching and lazy loading techniques.

The next chapter will explore implementing a 2D video game (TRON) to demonstrate graphics programming, game physics, and real-time systems in assembly language.