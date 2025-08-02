# Chapter 14: Implementing 2D Video Game TRON
*Real-Time Graphics and Game Physics*

## Introduction: The Art of Interactive Entertainment

Game development represents one of the most challenging and rewarding applications of assembly language programming. Creating a game like TRON requires mastering real-time graphics rendering, collision detection, input handling, sound processing, and game physics - all while maintaining consistent frame rates and responsive controls.

This chapter explores how to implement a complete TRON-style light cycle game in assembly language, from graphics primitives and sprite animation to AI opponents and multiplayer networking. You'll learn to create smooth, high-performance games that showcase the power and precision possible when programming directly in assembly.

Understanding game development at the assembly level provides insights into computer graphics, real-time systems, and performance optimization that are valuable across many domains, from embedded systems to high-frequency trading applications.

## Game Architecture and Framework

### Core Game Engine Structure

```assembly
format PE console
entry start

include 'win32a.inc'

section '.data' data readable writeable
    ; Game engine core structure
    game_engine struct
        window_handle       dd ?
        graphics_context    dd ?
        input_manager      dd ?
        audio_manager      dd ?
        resource_manager   dd ?
        game_state         dd ?
        frame_timer        dd ?
        target_fps         dd 60
        delta_time         dd ?
        running            db ?
        paused             db ?
    ends
    
    ; Graphics system
    graphics_system struct
        screen_width       dd 800
        screen_height      dd 600
        color_depth        dd 32
        framebuffer        dd ?
        back_buffer        dd ?
        sprite_renderer    dd ?
        particle_system    dd ?
        viewport           dd ?
    ends
    
    ; Game objects
    game_object struct
        x                  dd ?
        y                  dd ?
        velocity_x         dd ?
        velocity_y         dd ?
        width              dd ?
        height             dd ?
        rotation           dd ?
        scale              dd ?
        active             db ?
        visible            db ?
        collision_type     db ?
        object_type        db ?
    ends
    
    ; TRON-specific game state
    tron_game struct
        arena_width        dd 760
        arena_height       dd 560
        arena_x            dd 20
        arena_y            dd 20
        grid_size          dd 4
        player1            game_object
        player2            game_object
        ai_players         game_object 2 dup(<>)
        light_trails       dd ?
        game_mode          db ?  ; 0=single, 1=multi, 2=ai
        current_level      dd ?
        score              dd ?
        high_score         dd ?
        power_ups          game_object 8 dup(<>)
        particle_effects   dd ?
    ends
    
    ; Main game instance
    main_engine     game_engine
    graphics        graphics_system  
    tron_state      tron_game
    
    ; Input system
    keyboard_state  rb 256
    prev_keyboard   rb 256
    mouse_x         dd ?
    mouse_y         dd ?
    mouse_buttons   dd ?
    
    ; Timing system
    performance_frequency dq ?
    last_frame_time      dq ?
    current_frame_time   dq ?
    
    ; Color definitions
    COLOR_BLACK     equ 0x00000000
    COLOR_WHITE     equ 0x00FFFFFF  
    COLOR_BLUE      equ 0x000080FF
    COLOR_RED       equ 0x00FF0000
    COLOR_GREEN     equ 0x0000FF00
    COLOR_YELLOW    equ 0x00FFFF00
    COLOR_CYAN      equ 0x0000FFFF
    COLOR_PURPLE    equ 0x00FF00FF

section '.code' code readable executable

start:
    call init_game_engine
    call run_game_loop
    call cleanup_game_engine
    invoke ExitProcess, 0

init_game_engine:
    ; Initialize complete game engine
    call init_window_system
    test eax, eax
    jz .init_failed
    
    call init_graphics_system  
    test eax, eax
    jz .init_failed
    
    call init_input_system
    call init_audio_system
    call init_resource_manager
    call init_game_state
    
    ; Initialize timing
    invoke QueryPerformanceFrequency, performance_frequency
    invoke QueryPerformanceCounter, last_frame_time
    
    mov byte [main_engine.running], 1
    mov eax, 1
    ret
    
    .init_failed:
        xor eax, eax
        ret

init_graphics_system:
    ; Initialize graphics and rendering
    call create_game_window
    test eax, eax
    jz .window_failed
    
    call init_direct_graphics
    test eax, eax  
    jz .graphics_failed
    
    call create_framebuffers
    call init_sprite_system
    call init_particle_system
    
    mov eax, 1
    ret
    
    .window_failed:
    .graphics_failed:
        xor eax, eax
        ret

create_game_window:
    ; Create main game window
    invoke CreateWindowEx, 0, window_class, window_title, \
           WS_OVERLAPPEDWINDOW, CW_USEDEFAULT, CW_USEDEFAULT, \
           [graphics.screen_width], [graphics.screen_height], \
           0, 0, 0, 0
    
    test eax, eax
    jz .creation_failed
    
    mov [main_engine.window_handle], eax
    
    ; Show and update window
    invoke ShowWindow, eax, SW_SHOW
    invoke UpdateWindow, [main_engine.window_handle]
    
    mov eax, 1
    ret
    
    .creation_failed:
        xor eax, eax
        ret

; Main game loop
run_game_loop:
    ; Main game execution loop
    
    .game_loop:
        ; Check if still running
        cmp byte [main_engine.running], 0
        je .game_exit
        
        ; Process Windows messages
        call process_window_messages
        
        ; Update timing
        call update_frame_timing
        
        ; Handle input
        call process_input
        
        ; Update game logic
        call update_game_logic
        
        ; Render frame
        call render_frame
        
        ; Maintain target framerate
        call regulate_framerate
        
        jmp .game_loop
    
    .game_exit:
        ret

update_frame_timing:
    ; Update frame timing and delta time
    invoke QueryPerformanceCounter, current_frame_time
    
    ; Calculate delta time
    mov eax, [current_frame_time]
    sub eax, [last_frame_time]
    mov ebx, [performance_frequency]
    div ebx  ; Convert to seconds
    
    ; Store delta time (in milliseconds)
    imul eax, 1000
    mov [main_engine.delta_time], eax
    
    ; Update last frame time
    mov eax, [current_frame_time]
    mov [last_frame_time], eax
    
    ret

; TRON Game Logic
init_game_state:
    ; Initialize TRON game state
    call init_game_arena
    call init_players
    call init_light_trail_system
    call init_power_up_system
    call load_game_assets
    
    ; Set initial game mode
    mov byte [tron_state.game_mode], 0  ; Single player
    mov [tron_state.current_level], 1
    mov [tron_state.score], 0
    
    ret

init_players:
    ; Initialize player light cycles
    
    ; Player 1 (Human player)
    mov [tron_state.player1.x], 100
    mov [tron_state.player1.y], 300
    mov [tron_state.player1.velocity_x], 2
    mov [tron_state.player1.velocity_y], 0
    mov [tron_state.player1.width], 8
    mov [tron_state.player1.height], 8
    mov [tron_state.player1.rotation], 0
    mov byte [tron_state.player1.active], 1
    mov byte [tron_state.player1.object_type], 1  ; Player type
    
    ; Player 2 (AI or second human)
    mov [tron_state.player2.x], 700
    mov [tron_state.player2.y], 300  
    mov [tron_state.player2.velocity_x], -2
    mov [tron_state.player2.velocity_y], 0
    mov [tron_state.player2.width], 8
    mov [tron_state.player2.height], 8
    mov [tron_state.player2.rotation], 180
    mov byte [tron_state.player2.active], 1
    mov byte [tron_state.player2.object_type], 2  ; AI type
    
    ret

update_game_logic:
    ; Update all game logic
    cmp byte [main_engine.paused], 1
    je .skip_update
    
    call update_players
    call update_light_trails
    call update_power_ups
    call check_collisions
    call update_ai_players
    call update_particle_effects
    call check_game_over_conditions
    
    .skip_update:
        ret

update_players:
    ; Update player positions and states
    
    ; Update Player 1
    call update_player_movement
    call update_player_trail
    
    ; Update Player 2  
    mov edi, tron_state.player2
    call update_player_movement
    call update_player_trail
    
    ret

update_player_movement:
    ; Update player movement based on current direction
    ; edi = player object pointer
    
    ; Check if player is active
    cmp byte [edi + game_object.active], 0
    je .skip_movement
    
    ; Update position based on velocity
    mov eax, [edi + game_object.velocity_x]
    add [edi + game_object.x], eax
    
    mov eax, [edi + game_object.velocity_y] 
    add [edi + game_object.y], eax
    
    ; Check arena boundaries
    call check_arena_boundaries
    
    .skip_movement:
        ret

check_arena_boundaries:
    ; Check if player hit arena walls
    ; edi = player object pointer
    
    ; Check left boundary
    mov eax, [edi + game_object.x]
    cmp eax, [tron_state.arena_x]
    jl .collision_detected
    
    ; Check right boundary
    mov ebx, [tron_state.arena_x]
    add ebx, [tron_state.arena_width]
    cmp eax, ebx
    jg .collision_detected
    
    ; Check top boundary
    mov eax, [edi + game_object.y]
    cmp eax, [tron_state.arena_y]
    jl .collision_detected
    
    ; Check bottom boundary
    mov ebx, [tron_state.arena_y]
    add ebx, [tron_state.arena_height]
    cmp eax, ebx
    jg .collision_detected
    
    ret
    
    .collision_detected:
        ; Player hit wall - game over
        mov byte [edi + game_object.active], 0
        call trigger_explosion_effect
        ret

; Light trail system
init_light_trail_system:
    ; Initialize light trail rendering system
    
    ; Allocate trail memory
    mov eax, [tron_state.arena_width]
    mul [tron_state.arena_height]
    shr eax, 4  ; Divide by 16 for grid
    
    invoke VirtualAlloc, 0, eax, MEM_COMMIT, PAGE_READWRITE
    mov [tron_state.light_trails], eax
    
    ; Clear trail grid
    mov edi, eax
    mov ecx, eax
    shr ecx, 2
    xor eax, eax
    rep stosd
    
    ret

update_light_trails:
    ; Update light trail positions for all active players
    
    ; Add trail segment for Player 1
    cmp byte [tron_state.player1.active], 0
    je .skip_p1_trail
    mov esi, tron_state.player1
    call add_trail_segment
    
    .skip_p1_trail:
    
    ; Add trail segment for Player 2
    cmp byte [tron_state.player2.active], 0
    je .skip_p2_trail
    mov esi, tron_state.player2
    call add_trail_segment
    
    .skip_p2_trail:
        ret

add_trail_segment:
    ; Add trail segment at player position
    ; esi = player object
    
    ; Calculate grid position
    mov eax, [esi + game_object.x]
    sub eax, [tron_state.arena_x]
    mov ebx, [tron_state.grid_size]
    div ebx
    mov ecx, eax  ; Grid X
    
    mov eax, [esi + game_object.y]
    sub eax, [tron_state.arena_y]
    div ebx
    mov edx, eax  ; Grid Y
    
    ; Calculate array index
    mov eax, edx
    mul [tron_state.arena_width]
    shr eax, 2  ; Divide by grid size
    add eax, ecx
    
    ; Set trail bit
    mov edi, [tron_state.light_trails]
    mov bl, [esi + game_object.object_type]  ; Player ID
    mov [edi + eax], bl
    
    ret

; Collision detection
check_collisions:
    ; Check collisions between players and trails
    
    ; Check Player 1 collisions
    cmp byte [tron_state.player1.active], 0
    je .skip_p1_collision
    mov esi, tron_state.player1
    call check_player_trail_collision
    
    .skip_p1_collision:
    
    ; Check Player 2 collisions  
    cmp byte [tron_state.player2.active], 0
    je .skip_p2_collision
    mov esi, tron_state.player2
    call check_player_trail_collision
    
    .skip_p2_collision:
    
    ; Check player-to-player collision
    call check_player_player_collision
    
    ret

check_player_trail_collision:
    ; Check if player collided with any light trail
    ; esi = player object
    
    ; Get player grid position
    mov eax, [esi + game_object.x]
    sub eax, [tron_state.arena_x]
    mov ebx, [tron_state.grid_size]
    div ebx
    mov ecx, eax  ; Grid X
    
    mov eax, [esi + game_object.y]
    sub eax, [tron_state.arena_y]
    div ebx
    mov edx, eax  ; Grid Y
    
    ; Calculate array index
    mov eax, edx
    mul [tron_state.arena_width]
    shr eax, 2
    add eax, ecx
    
    ; Check if position has trail
    mov edi, [tron_state.light_trails]
    mov bl, [edi + eax]
    test bl, bl
    jz .no_collision
    
    ; Collision detected
    mov byte [esi + game_object.active], 0
    call trigger_explosion_effect
    
    .no_collision:
        ret

; AI System
update_ai_players:
    ; Update AI player behavior
    
    cmp byte [tron_state.player2.object_type], 2
    jne .no_ai_update
    
    mov esi, tron_state.player2
    call ai_decision_making
    
    .no_ai_update:
        ret

ai_decision_making:
    ; Make AI decisions for player movement
    ; esi = AI player object
    
    ; Analyze current situation
    call analyze_surroundings
    
    ; Check for immediate dangers
    call check_immediate_threats
    test eax, eax
    jnz .evasive_action
    
    ; Look for strategic opportunities
    call find_strategic_move
    test eax, eax
    jnz .execute_strategy
    
    ; Default behavior - continue straight
    jmp .ai_done
    
    .evasive_action:
        call execute_evasive_maneuver
        jmp .ai_done
    
    .execute_strategy:
        call execute_strategic_move
    
    .ai_done:
        ret

analyze_surroundings:
    ; Analyze area around AI player
    ; esi = AI player object
    
    ; Check forward path
    call check_forward_path
    mov [ai_forward_clear], eax
    
    ; Check left turn option
    call check_left_path  
    mov [ai_left_clear], eax
    
    ; Check right turn option
    call check_right_path
    mov [ai_right_clear], eax
    
    ret

check_immediate_threats:
    ; Check for immediate collision threats
    ; Returns threat level in eax
    
    ; Check if forward path is blocked
    cmp [ai_forward_clear], 0
    jne .check_side_threats
    
    ; Forward blocked - high threat
    mov eax, 3
    ret
    
    .check_side_threats:
        ; Check if sides will be blocked soon
        call predict_future_collisions
        ret

execute_evasive_maneuver:
    ; Execute evasive maneuver
    ; esi = AI player object
    
    ; Choose best evasive direction
    cmp [ai_left_clear], 0
    jne .turn_left
    
    cmp [ai_right_clear], 0
    jne .turn_right
    
    ; No escape - continue straight
    ret
    
    .turn_left:
        call turn_player_left
        ret
    
    .turn_right:
        call turn_player_right
        ret

; Input handling
process_input:
    ; Process keyboard and mouse input
    
    ; Get current keyboard state
    invoke GetKeyboardState, keyboard_state
    
    ; Check for game controls
    call check_movement_keys
    call check_game_control_keys
    
    ; Store previous keyboard state
    mov esi, keyboard_state
    mov edi, prev_keyboard
    mov ecx, 256
    rep movsb
    
    ret

check_movement_keys:
    ; Check player movement keys
    
    ; Player 1 controls (WASD)
    cmp byte [keyboard_state + 'W'], 0x80
    jb .check_s_key
    mov esi, tron_state.player1
    call turn_player_up
    
    .check_s_key:
    cmp byte [keyboard_state + 'S'], 0x80
    jb .check_a_key
    mov esi, tron_state.player1
    call turn_player_down
    
    .check_a_key:
    cmp byte [keyboard_state + 'A'], 0x80
    jb .check_d_key
    mov esi, tron_state.player1
    call turn_player_left
    
    .check_d_key:
    cmp byte [keyboard_state + 'D'], 0x80
    jb .movement_done
    mov esi, tron_state.player1
    call turn_player_right
    
    .movement_done:
        ret

turn_player_up:
    ; Turn player upward
    ; esi = player object
    
    ; Check if not currently moving down
    cmp [esi + game_object.velocity_y], 2
    jge .invalid_turn
    
    mov [esi + game_object.velocity_x], 0
    mov [esi + game_object.velocity_y], -2
    mov [esi + game_object.rotation], 270
    
    .invalid_turn:
        ret

turn_player_down:
    ; Turn player downward
    ; esi = player object
    
    cmp [esi + game_object.velocity_y], -2
    jle .invalid_turn
    
    mov [esi + game_object.velocity_x], 0
    mov [esi + game_object.velocity_y], 2
    mov [esi + game_object.rotation], 90
    
    .invalid_turn:
        ret

turn_player_left:
    ; Turn player left
    ; esi = player object
    
    cmp [esi + game_object.velocity_x], 2
    jge .invalid_turn
    
    mov [esi + game_object.velocity_x], -2
    mov [esi + game_object.velocity_y], 0
    mov [esi + game_object.rotation], 180
    
    .invalid_turn:
        ret

turn_player_right:
    ; Turn player right
    ; esi = player object
    
    cmp [esi + game_object.velocity_x], -2
    jle .invalid_turn
    
    mov [esi + game_object.velocity_x], 2
    mov [esi + game_object.velocity_y], 0
    mov [esi + game_object.rotation], 0
    
    .invalid_turn:
        ret

; Rendering system
render_frame:
    ; Render complete game frame
    
    ; Clear back buffer
    call clear_back_buffer
    
    ; Render game arena
    call render_game_arena
    
    ; Render light trails
    call render_light_trails
    
    ; Render players
    call render_players
    
    ; Render power-ups
    call render_power_ups
    
    ; Render particle effects
    call render_particles
    
    ; Render UI elements
    call render_ui
    
    ; Present frame
    call present_frame
    
    ret

clear_back_buffer:
    ; Clear back buffer to black
    mov edi, [graphics.back_buffer]
    mov eax, COLOR_BLACK
    mov ecx, [graphics.screen_width]
    mul [graphics.screen_height]
    rep stosd
    ret

render_game_arena:
    ; Render arena boundaries
    
    ; Draw arena border
    mov eax, [tron_state.arena_x]
    mov ebx, [tron_state.arena_y]
    mov ecx, [tron_state.arena_width]
    mov edx, [tron_state.arena_height]
    mov esi, COLOR_WHITE
    call draw_rectangle_outline
    
    ; Draw grid lines (optional)
    call draw_arena_grid
    
    ret

render_light_trails:
    ; Render all light trails
    
    mov esi, [tron_state.light_trails]
    mov ecx, 0  ; Y counter
    
    .trail_y_loop:
        cmp ecx, [tron_state.arena_height]
        jge .trail_done
        
        mov edx, 0  ; X counter
        
        .trail_x_loop:
            cmp edx, [tron_state.arena_width]
            jge .trail_next_y
            
            ; Check if trail exists at this position
            call get_trail_at_position
            test eax, eax
            jz .trail_next_x
            
            ; Draw trail segment
            call draw_trail_segment
            
            .trail_next_x:
                add edx, [tron_state.grid_size]
                jmp .trail_x_loop
        
        .trail_next_y:
            add ecx, [tron_state.grid_size]
            jmp .trail_y_loop
    
    .trail_done:
        ret

render_players:
    ; Render all active players
    
    ; Render Player 1
    cmp byte [tron_state.player1.active], 0
    je .skip_p1_render
    mov esi, tron_state.player1
    mov eax, COLOR_BLUE
    call draw_player_sprite
    
    .skip_p1_render:
    
    ; Render Player 2
    cmp byte [tron_state.player2.active], 0  
    je .skip_p2_render
    mov esi, tron_state.player2
    mov eax, COLOR_RED
    call draw_player_sprite
    
    .skip_p2_render:
        ret

draw_player_sprite:
    ; Draw player light cycle sprite
    ; esi = player object, eax = color
    
    mov ebx, [esi + game_object.x]
    mov ecx, [esi + game_object.y]
    mov edx, [esi + game_object.width]
    mov edi, [esi + game_object.height]
    
    ; Draw player as filled rectangle for now
    call draw_filled_rectangle
    
    ; Add directional indicator
    call draw_direction_indicator
    
    ret

; Graphics primitives
draw_filled_rectangle:
    ; Draw filled rectangle
    ; ebx = x, ecx = y, edx = width, edi = height, eax = color
    
    push eax ebx ecx edx edi
    
    mov esi, ecx  ; Start Y
    add edi, ecx  ; End Y
    
    .rect_y_loop:
        cmp esi, edi
        jge .rect_done
        
        ; Calculate line start address
        mov eax, esi
        mul [graphics.screen_width]
        add eax, ebx
        shl eax, 2  ; 4 bytes per pixel
        add eax, [graphics.back_buffer]
        
        ; Draw horizontal line
        mov ecx, edx  ; Width
        mov eax, [esp]  ; Color
        
        .rect_x_loop:
            mov [eax], eax
            add eax, 4
            loop .rect_x_loop
        
        inc esi
        jmp .rect_y_loop
    
    .rect_done:
        pop edi edx ecx ebx eax
        ret

draw_rectangle_outline:
    ; Draw rectangle outline
    ; eax = x, ebx = y, ecx = width, edx = height, esi = color
    
    ; Draw top line
    push edx
    mov edx, 1
    call draw_filled_rectangle
    pop edx
    
    ; Draw bottom line  
    push ebx edx
    add ebx, edx
    dec ebx
    mov edx, 1
    call draw_filled_rectangle
    pop edx ebx
    
    ; Draw left line
    push ecx
    mov ecx, 1
    call draw_filled_rectangle
    pop ecx
    
    ; Draw right line
    push eax ecx
    add eax, ecx
    dec eax
    mov ecx, 1
    call draw_filled_rectangle
    pop ecx eax
    
    ret

; Sound system
init_audio_system:
    ; Initialize audio system
    call init_direct_sound
    call load_sound_effects
    call load_background_music
    ret

play_sound_effect:
    ; Play sound effect
    ; eax = sound effect ID
    push eax
    
    ; Look up sound buffer
    call get_sound_buffer
    test eax, eax
    jz .sound_not_found
    
    ; Play sound
    call play_audio_buffer
    
    .sound_not_found:
        pop eax
        ret

; Game state management
check_game_over_conditions:
    ; Check if game should end
    
    ; Count active players
    mov eax, 0
    cmp byte [tron_state.player1.active], 0
    je .check_p2
    inc eax
    
    .check_p2:
    cmp byte [tron_state.player2.active], 0
    je .check_game_over
    inc eax
    
    .check_game_over:
    cmp eax, 1
    jg .game_continues
    
    ; Game over - only 0 or 1 players left
    call handle_game_over
    
    .game_continues:
        ret

handle_game_over:
    ; Handle game over state
    call display_game_over_screen
    call update_high_score
    call reset_game_state
    ret

; Data storage
ai_forward_clear    dd ?
ai_left_clear      dd ?
ai_right_clear     dd ?

window_class       db 'TronGameWindow', 0
window_title       db 'TRON Light Cycles', 0

; Additional game data structures and constants would continue here...
```

This chapter demonstrates how to build a complete 2D game in assembly language, covering all aspects from graphics rendering and input handling to AI and game physics. The TRON implementation showcases real-time programming techniques and performance optimization strategies essential for game development.

## Exercises

1. **Enhanced Graphics**: Add sprite animation, particle effects, and visual polish to the game.

2. **Advanced AI**: Implement more sophisticated AI using pathfinding algorithms and machine learning techniques.

3. **Multiplayer Networking**: Add network multiplayer support with lag compensation and synchronization.

4. **Sound Integration**: Implement full audio system with 3D positional audio and dynamic music.

5. **Performance Optimization**: Optimize rendering pipeline and game logic for higher frame rates and smoother gameplay.

The next chapter will explore framework and library development, showing how to create reusable components and APIs in assembly language.