; ���⮩ �ਬ�� �ணࠬ�� ��� KolibriOS
; ����稢��� ��� ����⮩ ������
; - ��।���� ��� �ਬ�� �ᯮ�짮����� tooltip

use32 ; ������� 32-���� ०�� ��ᥬ����
org 0 ; ������ � ���

db 'MENUET01' ; 8-����� �����䨪��� MenuetOS
dd 1 ; ����� ��������� (�ᥣ�� 1)
dd START ; ���� ��ࢮ� �������
dd CODE_END ; ࠧ��� �ணࠬ��
dd DATA_END ; ������⢮ �����
dd STACK_END ; ���� ���設� ���
dd 0 ; ���� ���� ��� ��ࠬ��஢
dd cur_dir_path      ; 㪠��⥫� �� ����, �㤠 ����頥��� ��ப�, ᮤ�ঠ�� ���� �� �ணࠬ�� � ������ ����᪠.

include '../../../../../proc32.inc'
include '../../../../../macros.inc'
include '../../../../../KOSfuncs.inc'
include '../../../../../dll.inc'	; malloc fn
include '../../trunk/box_lib.mac'
include '../../../../../load_lib.mac'


;---------------------------------------------------------------------
;--- ������ ��������� ----------------------------------------------
;---------------------------------------------------------------------
; ��� ����� ��易⥫�� ��� ��� �������⮢, �ᯮ������ heap
; �஬� ⮣�, ��易⥫쭮 �����஢��� lib_init - �� ������ ��।�������
; �㭪樨 娯� ��� ������⥪�
@use_library mem.Alloc,mem.Free,mem.ReAlloc,dll.Load

START:
;---------------------------------------------------------------------
;--- ������������� ----------------------------------------
;---------------------------------------------------------------------
mcall	SF_SYS_MISC, SSF_HEAP_INIT

mcall SF_SET_EVENTS_MASK, $C0000027 ; ��᪠ ᮡ�⨩ - ���� ⮫쪮 � ��⨢��� ����

sys_load_library  lib_name, lib_path, sys_path, import_box_lib
test eax,eax
jz	@f
	mcall SF_TERMINATE_PROCESS
@@:


invoke tooltip_init, redbox_tt 	; only begin of list

red: ; ����ᮢ��� ����

call draw_window ; ��뢠�� ��楤��� ���ᮢ�� ����

;---------------------------------------------------------------------
;--- ���� ��������� ������� ----------------------------------------
;---------------------------------------------------------------------

still:
mcall SF_WAIT_EVENT_TIMEOUT, 5 ; ����� ᮡ��� �� ����� 祬 0.05�
test eax, eax ; ��� ᮡ�⨩ - �஢���� �ᮢ���� ��⨯�� �� ⠩����
je yield
cmp eax,EV_REDRAW
je red ; �᫨ �� - �� ���� red
cmp eax,EV_KEY
je key ; �᫨ �� - �� key
cmp eax,EV_BUTTON
je button ; �᫨ �� - �� button
cmp eax,EV_MOUSE
je mouse ; �᫨ �� - �� mouse

jmp still ; �᫨ ��㣮� ᮡ�⨥ - � ��砫� 横��


;---------------------------------------------------------------------
yield:
invoke tooltip_test_show, redbox_tt
jmp still ; �������� � ��砫� 横��

mouse:
invoke tooltip_mouse, redbox_tt
jmp still ; �������� � ��砫� 横��

key: ; ����� ������ �� ���������
mcall SF_GET_KEY ; ����� ��� ᨬ���� (� ah)

jmp still ; �������� � ��砫� 横��

;---------------------------------------------------------------------

button:
mcall SF_GET_BUTTON ; ������� �����䨪��� ����⮩ ������

cmp ah, 1 ; �᫨ �� ����� ������ � ����஬ 1,
jne still ; ��������

pexit:
invoke tooltip_delete, redbox_tt	; �᢮������� ������
mcall SF_TERMINATE_PROCESS


;---------------------------------------------------------------------
;--- ����������� � ��������� ���� ----------------------------------
;---------------------------------------------------------------------

draw_window:

mcall SF_REDRAW, SSF_BEGIN_DRAW

mcall SF_STYLE_SETTINGS, SSF_GET_COLORS, sc, sizeof.system_colors

mov edx, [sc.work] ; 梥� 䮭�
or edx, 0x33000000 ; � ⨯ ���� 3
mcall SF_CREATE_WINDOW, <200,300>, <200,150>, , ,title

; �뢮� �����⨪��
mcall SF_DRAW_RECT, <60,50>, <50,50>, $FF0000
mcall SF_DRAW_RECT, <140,50>, <50,50>, $FF


mcall SF_REDRAW, SSF_END_DRAW

ret ; ��室�� �� ��楤���


CODE_END: ; ��⪠ ���� �ணࠬ��; --------------------------------------------;

; ---------------------------------------------------------------------------- ;
;---------------------------------------------------------------------
;--- ������ ��������� ----------------------------------------------
;---------------------------------------------------------------------

sys_path	db '/sys/lib/'
;sys_path	db '/tmp0/1/'
lib_name    db 'box_lib.obj',0
cur_dir_path    rb 4096
lib_path    rb 4096

include '../../import.inc' ;import_box_lib


;tooltip txt, next, zone_x, zone_w, zone_y, zone_h, col_txt, col_bkg, tm_wait
redbox_tt    tooltip redboxtxt, blubox_tt, 60, 50, 50, 50, 0, $FFF473, 100
blubox_tt    tooltip bluboxtxt, 0, 140, 50, 50, 50, $110000FF, $FFF473, 100

redboxtxt	db 'Red Box Tooltip', 13, 'May be multilined', 13, 13, 'Even with empty lines', 0
bluboxtxt	db 'Blue Box Tooltip', 0

sc system_colors

title db 'Toooltip demo',0

; stack----------------------------------------------------------------------- ;
	   rb 4096
STACK_END  dd ?

DATA_END: ; ��⪠ ���� ������ �ணࠬ��; ------------------------------------ ;
