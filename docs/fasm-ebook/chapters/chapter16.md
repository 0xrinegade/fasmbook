# Chapter 16: Package Management System Design for FASM
*Dependency Resolution and Software Distribution*

## Introduction: The Ecosystem of Software Distribution

Package management represents one of the most complex challenges in software engineering - managing dependencies, versioning, compatibility, and distribution across diverse environments. Creating a package management system from scratch in assembly language provides deep insights into dependency resolution algorithms, cryptographic verification, and the intricate protocols that power modern software ecosystems.

This chapter explores how to design and implement a complete package management system for FASM applications, from dependency resolution and semantic versioning to registry protocols and security verification. You'll learn to create systems that can manage complex software ecosystems with reliability and efficiency.

Understanding package management at the assembly level reveals the sophisticated algorithms and data structures that enable modern software distribution, from package managers like npm and cargo to container registries and cloud deployment systems.

## Package Management Architecture

### Core Package System Design

```assembly
format PE console
entry start

include 'win32a.inc'

section '.data' data readable writeable
    ; Package metadata structure
    package_metadata struct
        package_name        rb 64
        version_major       dd ?
        version_minor       dd ?
        version_patch       dd ?
        version_pre         rb 16
        package_type        dd ?    ; 0=lib, 1=app, 2=tool
        author              rb 64
        description         rb 256
        license             rb 32
        homepage            rb 128
        repository          rb 128
        keywords            rb 256
        dependencies        dd ?    ; Pointer to dependency list
        dev_dependencies    dd ?    ; Development dependencies
        build_dependencies  dd ?    ; Build-time dependencies
        files               dd ?    ; File list
        install_scripts     dd ?    ; Install/uninstall scripts
        checksum            rb 32   ; SHA-256 checksum
        signature           rb 64   ; Digital signature
        created_date        dq ?
        updated_date        dq ?
        download_count      dd ?
        size_compressed     dd ?
        size_uncompressed   dd ?
    ends
    
    ; Dependency specification
    dependency_spec struct
        name                rb 64
        version_constraint  rb 32   ; e.g., "^1.2.3", ">=2.0.0"
        optional            db ?
        scope               db ?    ; 0=runtime, 1=dev, 2=build
        platform            rb 16   ; Target platform
        features            rb 64   ; Feature flags
    ends
    
    ; Package registry
    package_registry struct
        registry_url        rb 128
        registry_name       rb 64
        auth_token          rb 128
        cache_directory     rb 256
        ssl_verify          db ?
        timeout             dd ?
        retry_count         dd ?
        mirror_urls         dd ?    ; Mirror registry URLs
    ends
    
    ; Local package database
    package_database struct
        db_version          dd ?
        package_count       dd ?
        packages            dd ?    ; Array of package entries
        index_hash          dd ?    ; Hash table for fast lookup
        lock_file           rb 256  ; Lock file path
        backup_enabled      db ?
        compression_level   dd ?
    ends
    
    ; Dependency resolver
    dependency_resolver struct
        resolution_strategy dd ?    ; 0=latest, 1=conservative
        allow_prerelease    db ?
        max_recursion_depth dd ?
        conflict_resolution dd ?    ; How to handle conflicts
        cache_enabled       db ?
        resolver_cache      dd ?
        resolution_graph    dd ?
    ends
    
    ; Main package manager instance
    package_manager     package_registry
    local_database      package_database
    resolver            dependency_resolver
    
    ; Package cache
    max_cached_packages equ 1000
    package_cache       package_metadata max_cached_packages dup(<>)
    cache_entries       dd 0
    
    ; Dependency resolution
    max_dependencies    equ 500
    dependency_graph    dd max_dependencies dup(?)
    resolution_stack    dd 100 dup(?)
    resolution_depth    dd 0
    
    ; Version comparison
    version_buffer      rb 64
    constraint_buffer   rb 64

section '.code' code readable executable

start:
    call init_package_manager
    call demo_package_operations
    call cleanup_package_manager
    invoke ExitProcess, 0

; Package manager initialization
init_package_manager:
    ; Initialize complete package management system
    call init_registry_client
    test eax, eax
    jz .init_failed
    
    call init_local_database
    test eax, eax
    jz .init_failed
    
    call init_dependency_resolver
    call init_crypto_system
    call load_configuration
    call create_cache_directories
    
    mov eax, 1  ; Success
    ret
    
    .init_failed:
        xor eax, eax
        ret

init_registry_client:
    ; Initialize package registry client
    
    ; Setup default registry
    mov esi, default_registry_url
    mov edi, package_manager.registry_url
    call copy_string
    
    ; Initialize HTTP client
    call init_http_client
    test eax, eax
    jz .http_init_failed
    
    ; Setup SSL context
    call init_ssl_context
    
    ; Load authentication
    call load_auth_credentials
    
    mov eax, 1
    ret
    
    .http_init_failed:
        xor eax, eax
        ret

init_local_database:
    ; Initialize local package database
    
    ; Create database directory
    call create_database_directory
    
    ; Load existing database
    call load_package_database
    test eax, eax
    jnz .database_loaded
    
    ; Create new database
    call create_new_database
    test eax, eax
    jz .database_creation_failed
    
    .database_loaded:
        ; Build package index
        call build_package_index
        
        ; Verify database integrity
        call verify_database_integrity
        
        mov eax, 1
        ret
    
    .database_creation_failed:
        xor eax, eax
        ret

; Package installation
install_package:
    ; Install package with dependencies
    ; esi = package_name, edi = version_constraint
    push ebx ecx edx
    
    ; Parse package specification
    call parse_package_spec
    test eax, eax
    jz .parse_failed
    
    ; Check if already installed
    call check_package_installed
    test eax, eax
    jnz .already_installed
    
    ; Resolve dependencies
    call resolve_dependencies
    test eax, eax
    jz .resolution_failed
    
    ; Download packages
    call download_packages
    test eax, eax
    jz .download_failed
    
    ; Verify signatures
    call verify_package_signatures
    test eax, eax
    jz .verification_failed
    
    ; Install packages in order
    call install_packages_ordered
    test eax, eax
    jz .install_failed
    
    ; Update local database
    call update_local_database
    
    pop edx ecx ebx
    mov eax, 1  ; Success
    ret
    
    .parse_failed:
    .resolution_failed:
    .download_failed:
    .verification_failed:
    .install_failed:
        pop edx ecx ebx
        xor eax, eax
        ret
    
    .already_installed:
        pop edx ecx ebx
        mov eax, 2  ; Already installed
        ret

resolve_dependencies:
    ; Resolve complete dependency tree
    ; Returns resolution plan in dependency_graph
    
    ; Initialize resolver state
    call init_resolver_state
    
    ; Start resolution from root package
    call resolve_recursive
    test eax, eax
    jz .resolution_failed
    
    ; Check for conflicts
    call detect_dependency_conflicts
    test eax, eax
    jnz .conflicts_detected
    
    ; Generate installation order
    call generate_install_order
    
    mov eax, 1
    ret
    
    .resolution_failed:
    .conflicts_detected:
        call cleanup_resolver_state
        xor eax, eax
        ret

resolve_recursive:
    ; Recursive dependency resolution
    ; esi = package_name, edi = version_constraint
    push ebx ecx edx
    
    ; Check recursion depth
    inc [resolution_depth]
    cmp [resolution_depth], [resolver.max_recursion_depth]
    jg .max_depth_exceeded
    
    ; Find package in registry
    call find_package_in_registry
    test eax, eax
    jz .package_not_found
    
    mov ebx, eax  ; Package metadata
    
    ; Check version constraint
    call check_version_constraint
    test eax, eax
    jz .version_constraint_failed
    
    ; Add to resolution graph
    call add_to_resolution_graph
    
    ; Resolve dependencies
    mov ecx, [ebx + package_metadata.dependencies]
    test ecx, ecx
    jz .no_dependencies
    
    call resolve_dependency_list
    test eax, eax
    jz .dependency_resolution_failed
    
    .no_dependencies:
        dec [resolution_depth]
        pop edx ecx ebx
        mov eax, 1
        ret
    
    .max_depth_exceeded:
    .package_not_found:
    .version_constraint_failed:
    .dependency_resolution_failed:
        dec [resolution_depth]
        pop edx ecx ebx
        xor eax, eax
        ret

; Version constraint checking
check_version_constraint:
    ; Check if package version satisfies constraint
    ; ebx = package_metadata, edi = version_constraint
    push ecx edx esi
    
    ; Parse constraint
    mov esi, edi
    call parse_version_constraint
    test eax, eax
    jz .parse_failed
    
    ; Get package version
    mov esi, ebx
    call get_package_version
    
    ; Compare versions
    call compare_version_constraint
    
    pop esi edx ecx
    ret
    
    .parse_failed:
        pop esi edx ecx
        xor eax, eax
        ret

parse_version_constraint:
    ; Parse version constraint string
    ; esi = constraint string (e.g., "^1.2.3", ">=2.0.0")
    push ebx ecx edi
    
    ; Clear constraint buffer
    mov edi, constraint_buffer
    mov ecx, 64
    xor eax, eax
    rep stosb
    
    ; Parse constraint operator
    mov edi, constraint_buffer
    call parse_constraint_operator
    
    ; Parse version number
    call parse_version_number
    
    pop edi ecx ebx
    mov eax, 1
    ret

parse_constraint_operator:
    ; Parse version constraint operator
    ; esi = input, edi = output buffer
    
    lodsb
    cmp al, '^'
    je .caret_constraint
    cmp al, '~'
    je .tilde_constraint
    cmp al, '>'
    je .check_greater_equal
    cmp al, '<'
    je .check_less_equal
    cmp al, '='
    je .exact_constraint
    
    ; Default to exact match
    dec esi  ; Back up
    mov al, '='
    
    .exact_constraint:
        mov [edi], al
        inc edi
        ret
    
    .caret_constraint:
        mov [edi], al
        inc edi
        ret
    
    .tilde_constraint:
        mov [edi], al
        inc edi
        ret
    
    .check_greater_equal:
        cmp byte [esi], '='
        jne .greater_only
        lodsb
        mov word [edi], '>='
        add edi, 2
        ret
        
        .greater_only:
            mov [edi], al
            inc edi
            ret
    
    .check_less_equal:
        cmp byte [esi], '='
        jne .less_only
        lodsb
        mov word [edi], '<='
        add edi, 2
        ret
        
        .less_only:
            mov [edi], al
            inc edi
            ret

compare_version_constraint:
    ; Compare version against constraint
    ; Returns 1 if satisfied, 0 if not
    push ebx ecx edx esi edi
    
    ; Get constraint operator
    mov al, [constraint_buffer]
    
    cmp al, '='
    je .exact_match
    cmp al, '^'
    je .caret_match
    cmp al, '~'
    je .tilde_match
    cmp al, '>'
    je .greater_match
    cmp al, '<'
    je .less_match
    
    ; Default to exact match
    jmp .exact_match
    
    .exact_match:
        call compare_versions_exact
        jmp .comparison_done
    
    .caret_match:
        call compare_versions_caret
        jmp .comparison_done
    
    .tilde_match:
        call compare_versions_tilde
        jmp .comparison_done
    
    .greater_match:
        call compare_versions_greater
        jmp .comparison_done
    
    .less_match:
        call compare_versions_less
    
    .comparison_done:
        pop edi esi edx ecx ebx
        ret

compare_versions_caret:
    ; Caret range (^1.2.3 = >=1.2.3 <2.0.0)
    ; Compatible within same major version
    
    ; Check if major version matches
    call get_major_version
    mov ebx, eax  ; Package major version
    
    call get_constraint_major_version
    cmp eax, ebx
    jne .not_compatible
    
    ; Check if >= constraint version
    call compare_full_versions
    cmp eax, -1
    je .not_compatible
    
    mov eax, 1  ; Compatible
    ret
    
    .not_compatible:
        xor eax, eax
        ret

compare_versions_tilde:
    ; Tilde range (~1.2.3 = >=1.2.3 <1.3.0)
    ; Compatible within same minor version
    
    ; Check major and minor versions match
    call get_major_minor_version
    mov ebx, eax
    
    call get_constraint_major_minor_version
    cmp eax, ebx
    jne .not_compatible
    
    ; Check if >= constraint version
    call compare_full_versions
    cmp eax, -1
    je .not_compatible
    
    mov eax, 1
    ret
    
    .not_compatible:
        xor eax, eax
        ret

; Package downloading
download_packages:
    ; Download all packages in resolution plan
    
    ; Create download directory
    call create_download_directory
    
    ; Download each package
    mov ecx, 0
    
    .download_loop:
        cmp ecx, [resolution_package_count]
        jge .download_complete
        
        ; Get package from resolution plan
        call get_resolution_package
        
        ; Download package
        call download_single_package
        test eax, eax
        jz .download_failed
        
        inc ecx
        jmp .download_loop
    
    .download_complete:
        mov eax, 1
        ret
    
    .download_failed:
        xor eax, eax
        ret

download_single_package:
    ; Download single package from registry
    ; esi = package_metadata
    push ebx ecx edx edi
    
    ; Construct download URL
    call construct_download_url
    
    ; Send HTTP request
    call send_download_request
    test eax, eax
    jz .request_failed
    
    ; Create local file
    call create_package_file
    test eax, eax
    jz .file_creation_failed
    
    mov edi, eax  ; File handle
    
    ; Download with progress
    call download_with_progress
    
    ; Close file
    invoke CloseHandle, edi
    
    ; Verify download
    call verify_downloaded_package
    
    pop edi edx ecx ebx
    ret
    
    .request_failed:
    .file_creation_failed:
        pop edi edx ecx ebx
        xor eax, eax
        ret

construct_download_url:
    ; Construct package download URL
    ; esi = package_metadata, edi = url_buffer
    push eax ebx ecx
    
    ; Base registry URL
    mov eax, package_manager.registry_url
    call copy_string_to_buffer
    
    ; Add package path
    mov al, '/'
    stosb
    
    ; Add package name
    lea eax, [esi + package_metadata.package_name]
    call copy_string_to_buffer
    
    ; Add version
    mov al, '/'
    stosb
    
    call format_version_string
    call copy_string_to_buffer
    
    ; Add file extension
    mov eax, package_extension
    call copy_string_to_buffer
    
    ; Null terminate
    mov al, 0
    stosb
    
    pop ecx ebx eax
    ret

; Package verification
verify_package_signatures:
    ; Verify digital signatures of all packages
    
    mov ecx, 0
    
    .verify_loop:
        cmp ecx, [downloaded_package_count]
        jge .verification_complete
        
        ; Get package file
        call get_downloaded_package
        
        ; Verify signature
        call verify_single_signature
        test eax, eax
        jz .verification_failed
        
        inc ecx
        jmp .verify_loop
    
    .verification_complete:
        mov eax, 1
        ret
    
    .verification_failed:
        xor eax, eax
        ret

verify_single_signature:
    ; Verify single package signature
    ; esi = package_file_path
    push ebx ecx edx edi
    
    ; Read package file
    call read_package_file
    test eax, eax
    jz .read_failed
    
    ; Extract signature
    call extract_package_signature
    test eax, eax
    jz .signature_extraction_failed
    
    ; Get public key
    call get_publisher_public_key
    test eax, eax
    jz .key_not_found
    
    ; Verify signature
    call verify_digital_signature
    
    pop edi edx ecx ebx
    ret
    
    .read_failed:
    .signature_extraction_failed:
    .key_not_found:
        pop edi edx ecx ebx
        xor eax, eax
        ret

; Package installation
install_packages_ordered:
    ; Install packages in dependency order
    
    ; Sort packages by dependency order
    call sort_packages_by_dependencies
    
    ; Install each package
    mov ecx, 0
    
    .install_loop:
        cmp ecx, [sorted_package_count]
        jge .installation_complete
        
        ; Get package from sorted list
        call get_sorted_package
        
        ; Install package
        call install_single_package
        test eax, eax
        jz .installation_failed
        
        inc ecx
        jmp .install_loop
    
    .installation_complete:
        mov eax, 1
        ret
    
    .installation_failed:
        ; Rollback installations
        call rollback_installations
        xor eax, eax
        ret

install_single_package:
    ; Install single package
    ; esi = package_metadata
    push ebx ecx edx edi
    
    ; Create installation directory
    call create_install_directory
    test eax, eax
    jz .directory_creation_failed
    
    ; Extract package contents
    call extract_package_contents
    test eax, eax
    jz .extraction_failed
    
    ; Run pre-install scripts
    call run_preinstall_scripts
    
    ; Copy files to target locations
    call copy_package_files
    test eax, eax
    jz .file_copy_failed
    
    ; Run post-install scripts
    call run_postinstall_scripts
    
    ; Update package registry
    call update_package_registry
    
    pop edi edx ecx ebx
    mov eax, 1
    ret
    
    .directory_creation_failed:
    .extraction_failed:
    .file_copy_failed:
        pop edi edx ecx ebx
        xor eax, eax
        ret

; Package removal
uninstall_package:
    ; Uninstall package and handle dependencies
    ; esi = package_name
    push ebx ecx edx
    
    ; Check if package is installed
    call find_installed_package
    test eax, eax
    jz .package_not_installed
    
    mov ebx, eax  ; Package metadata
    
    ; Check for dependent packages
    call find_dependent_packages
    test eax, eax
    jnz .dependencies_exist
    
    ; Run pre-uninstall scripts
    call run_preuninstall_scripts
    
    ; Remove package files
    call remove_package_files
    test eax, eax
    jz .removal_failed
    
    ; Run post-uninstall scripts
    call run_postuninstall_scripts
    
    ; Update database
    call remove_from_database
    
    pop edx ecx ebx
    mov eax, 1
    ret
    
    .package_not_installed:
    .dependencies_exist:
    .removal_failed:
        pop edx ecx ebx
        xor eax, eax
        ret

; Package search and listing
search_packages:
    ; Search packages in registry
    ; esi = search_query, edi = results_buffer
    push ebx ecx edx
    
    ; Construct search URL
    call construct_search_url
    
    ; Send search request
    call send_search_request
    test eax, eax
    jz .search_failed
    
    ; Parse search results
    call parse_search_results
    
    ; Format results for display
    call format_search_results
    
    pop edx ecx ebx
    mov eax, 1
    ret
    
    .search_failed:
        pop edx ecx ebx
        xor eax, eax
        ret

list_installed_packages:
    ; List all installed packages
    ; edi = output_buffer
    push ebx ecx esi
    
    ; Read local database
    call read_local_database
    
    ; Format package list
    mov ecx, 0
    
    .list_loop:
        cmp ecx, [local_database.package_count]
        jge .list_complete
        
        ; Get package entry
        call get_package_entry
        
        ; Format package info
        call format_package_info
        
        inc ecx
        jmp .list_loop
    
    .list_complete:
        pop esi ecx ebx
        ret

; Registry publishing
publish_package:
    ; Publish package to registry
    ; esi = package_directory
    push ebx ecx edx edi
    
    ; Build package
    call build_package_archive
    test eax, eax
    jz .build_failed
    
    ; Generate metadata
    call generate_package_metadata
    
    ; Sign package
    call sign_package
    test eax, eax
    jz .signing_failed
    
    ; Upload to registry
    call upload_to_registry
    test eax, eax
    jz .upload_failed
    
    pop edi edx ecx ebx
    mov eax, 1
    ret
    
    .build_failed:
    .signing_failed:
    .upload_failed:
        pop edi edx ecx ebx
        xor eax, eax
        ret

; Utility functions and data
default_registry_url    db 'https://packages.fasm.org/', 0
package_extension       db '.fpkg', 0
temp_buffer            rb 4096
url_buffer             rb 512

resolution_package_count dd ?
downloaded_package_count dd ?
sorted_package_count     dd ?

search_results_buffer   rb 8192
package_info_buffer     rb 1024

; Error codes
ERROR_PACKAGE_NOT_FOUND     equ 1001
ERROR_VERSION_CONFLICT      equ 1002
ERROR_DEPENDENCY_CYCLE      equ 1003
ERROR_SIGNATURE_INVALID     equ 1004
ERROR_NETWORK_ERROR         equ 1005
ERROR_DISK_FULL            equ 1006
ERROR_PERMISSION_DENIED     equ 1007
```

This chapter demonstrates how to build a sophisticated package management system from the ground up using assembly language. From dependency resolution algorithms and cryptographic verification to registry protocols and local database management, you now have the foundation to create robust software distribution systems.

## Exercises

1. **Advanced Dependency Resolution**: Implement SAT-solving algorithms for complex dependency conflicts.

2. **Distributed Registry**: Design a distributed package registry with replication and load balancing.

3. **Security Hardening**: Add advanced security features like code signing verification and vulnerability scanning.

4. **Performance Optimization**: Optimize package resolution and download speeds with caching and parallelization.

5. **Plugin Architecture**: Create a plugin system that allows extending the package manager with custom functionality.

The final chapter will explore implementing in-memory key-value storage with a plugin system, demonstrating advanced data structures and extensible architecture design.