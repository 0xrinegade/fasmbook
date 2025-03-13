use32
org     0

        db      'MENUET01'
        dd      1
        dd      START
        dd      I_END
        dd      MEM
        dd      STACKTOP
        dd      0
        dd      0

include "../../macros.inc"

;---------------------------------------------------------------------

START:

        mcall   40, 0x00000027
        mcall   18, 25, 2, -1, 1
        mcall   66, 1, 1

;---------------------------------------------------------------------

still:

        mcall   10

        cmp     eax, 1
        je      redraw
        cmp     eax, 6
        je      mouse
        cmp     eax, 2
        je      key
        cmp     eax, 3
        je      button

        jmp     still

;---------------------------------------------------------------------

redraw:
        call    draw_window

key:
        mcall   2

        cmp     ah, 1
        je      button.exit
        cmp     ah, 19
        je      draw_copied_rgb
        cmp     ah, 46
        je      draw_copied_hex
                jmp     still

button:
        mcall   17

        cmp     ah, 11
        je      draw_copied_hex         ; copy HEX color
        cmp     ah, 12
        je      draw_copied_rgb         ; copy RGB color
        cmp     ah, 13
        je      draw_picked_rect        ; make pick active again
        cmp     ah, 1
        jne     still

        .exit:
                mcall   -1

mouse:
        mcall   37, 2
        test    ax, 0x01
        jz      mouse.move

        cmp     [pick_act], 0x00
        je      .move

        mov     [pick_act], 0x00        ; left mouse button click

        .move:
                cmp     [pick_act], 0x00
                je      still

                call    get_pixel
                call    draw_update

        jmp     still

;---------------------------------------------------------------------

; read pixel from screen by mouse coords
get_pixel:

        mcall   37, 0

        mov     edx, eax
        mcall   36, sel_color, <1, 1>,

        ret

;---------------------------------------------------------------------

draw_window:

        mcall   12, 1

        mcall   48, 3, win_cols, sizeof.system_colors
                mcall     , 4,

        mov     ecx, eax
        add     ecx, WIN_Y * 65536 + WIN_H

        mov     edx, [win_cols.work]
        add     edx, 0x34000000
        mcall   0, <WIN_X, WIN_W>, , , , header

                call    draw_base
        call    draw_update

        mcall   12, 2

        ret



; draw basic elements of window
draw_base:

        mcall   13, <BUT_HEX_X, BUT_HEX_W>, <BUT_HEX_Y, BUT_HEX_H>, [win_cols.work_graph]
        mcall     ,                       , <BUT_RGB_Y, BUT_HEX_H>,
        mcall     , <BUT_REC_X, BUT_REC_W>, <BUT_REC_Y, BUT_REC_H>,

        mcall     , <BUT_HEX_X, BUT_HEX_W - 1>, <BUT_HEX_Y, BUT_HEX_H - 1>, [win_cols.work_dark]
        mcall     ,                           , <BUT_RGB_Y, BUT_HEX_H - 1>,
        mcall     , <BUT_REC_X, BUT_REC_W - 1>, <BUT_REC_Y, BUT_REC_H - 1>,

        mcall     , <BUT_HEX_X + 1, BUT_HEX_W - 2>, <BUT_HEX_Y + 1, BUT_HEX_H - 2>, [win_cols.work_button_text]
        mcall     , <BUT_REC_X + 1, BUT_REC_W - 2>, <BUT_REC_Y + 1, BUT_REC_H - 2>,

        ; buttons 11, 12 and 13
        mcall    8, <BUT_HEX_X + 1, BUT_HEX_W - 3>, <BUT_HEX_Y + 1, BUT_HEX_H - 3>, 0x4000000B
        mcall     ,                               , <BUT_RGB_Y + 1, BUT_HEX_H - 3>, 0x4000000C
        mcall     , <BUT_REC_X + 1, BUT_REC_W - 3>, <BUT_REC_Y + 1, BUT_REC_H - 3>, 0x4000000D



; drawing text on buttons and colorful rect
draw_update:

        mcall   13, <BUT_REC_X + 2, BUT_REC_W - 4>, <BUT_REC_Y + 2, BUT_REC_H - 4>, [sel_color]
        mcall     , <BUT_RGB_X + 1, BUT_HEX_W - 2>, <BUT_RGB_Y + 1, BUT_HEX_H - 2>, [win_cols.work_button_text]

        mcall   47, 0x00060100, [sel_color], <BUT_HEX_X + 25, BUT_HEX_Y + 4>, 0x50000000, [win_cols.work_button_text]

        mov     ebx, 0x00030000
        xor     ecx, ecx
        mov     edx, 65536 * 77 + 46
        xor     edi, edi

        dr_loop:
                mov     cl, byte [sel_color + edi]
                mov     esi, [rgb_cols + edi * 4]
                or      esi, 0x10000000
                mcall   , , , , ,
                sub     edx, 0x00200000
                inc     edi
                cmp     edi, 3
                jb      dr_loop

        ret


; copy color HEX code
draw_copied_hex:

        mcall   13, <BUT_HEX_X + 2, BUT_HEX_W - 4>, <BUT_HEX_Y + 2, BUT_HEX_H - 4>, [win_cols.work_button_text]

        mov     ebx, [sel_color]
        mov     ecx, 6

        ch_loop:                                ; iterate over all HEX-color digits
                mov     al, bl
                and     al, 0x0F
                add     al, 0x30
                cmp     al, 0x39
                jbe     ch_loop.cont            ; if digit

                add     al, 0x07                ; if letter

                .cont:
                        mov     [color_hex + 11 + ecx], byte al
                        shr     ebx, 4
                        loop    ch_loop

        mcall   54, 2, color_hex.end - color_hex, color_hex

        mcall    4, <BUT_HEX_X + 1, BUT_HEX_Y + 4>, 0x10000000, mes_copy, 12

        mcall    5, 50

        mcall   13, <BUT_HEX_X + 1, BUT_HEX_W - 2>, <BUT_HEX_Y + 1, BUT_HEX_H - 2>, [win_cols.work_button_text]

        call    draw_update
        jmp     still



; copy color RBG code
draw_copied_rgb:

        mcall   13, <BUT_RGB_X + 2, BUT_HEX_W - 4>, <BUT_RGB_Y + 2, BUT_HEX_H - 4>, [win_cols.work_button_text]

        mov     bl, 10
        mov     edx, [sel_color]
        mov     esi, 19
        mov     edi, 3

        cr_loop:

                mov     al, dl
                mov     ecx, 3

                .cr_loop_in:

                        and     eax, 0x000000FF
                        div     bl
                        add     ah, 0x30
                        mov     [color_rgb + esi + ecx], byte ah

                        loop    cr_loop.cr_loop_in

                shr     edx, 8
                sub     esi, 4
                dec     edi
                cmp     edi, 0
                jg      cr_loop


        mcall   54, 2, color_rgb.end - color_rgb, color_rgb

        mcall    4, <9, 46>, 0x10000000, mes_copy, 12

        mcall    5, 50

        mcall   13, <BUT_RGB_X + 1, BUT_HEX_W - 2>, <BUT_RGB_Y + 1, BUT_HEX_H - 2>, [win_cols.work_button_text]

        call    draw_update
        jmp     still



; make color picking active again
draw_picked_rect:

        mcall   13, <BUT_REC_X + 2, BUT_REC_W - 4>, <BUT_REC_Y + 2, BUT_REC_H - 4>, [win_cols.work_button_text]

        mcall    4, <BUT_REC_X + 9, BUT_REC_Y + 18>, 0x10000000, mes_pick, 4

        mov     [pick_act], 0x01

        mcall    5, 50

        mcall   13, <BUT_REC_X + 1, BUT_REC_W - 2>, <BUT_REC_Y + 1, BUT_REC_H - 2>, [win_cols.work_button_text]

        call    draw_update
        jmp     still

;---------------------------------------------------------------------

WIN_X           = 100
WIN_W           = 183
WIN_Y           = 100
WIN_H           = 77

BUT_HEX_X       = 8
BUT_HEX_W       = 98
BUT_HEX_Y       = 12
BUT_HEX_H       = 22

BUT_RGB_X       = 8
BUT_RGB_Y       = 42

BUT_REC_X       = 114
BUT_REC_W       = 52
BUT_REC_Y       = 12
BUT_REC_H       = 52

if lang eq ru_RU
                header  db 'Пипетка', 0
else if lang eq es_ES
                header  db "Pipeta", 0
else
                header  db "Pipet", 0
endf

mes_copy        db '   Copied   '
mes_pick        db 'Pick'

win_cols        system_colors
win_header      db 24

rgb_cols:
                dd 0x000000FF
                dd 0x00008000
                dd 0x00FF0000

pick_act        db 0x01

sel_color:
                db 0xCF
                db 0xD7
                db 0xDD
                db 0x00

color_hex:
                dd color_hex.end - color_hex
                dd 0
                dd 1
                db '000000'
.end:

color_rgb:
                dd color_rgb.end - color_rgb
                dd 0
                dd 1
                db '000,000,000'
.end:

;---------------------------------------------------------------------

I_END:
        rb      0
        align   1024
STACKTOP:
MEM: