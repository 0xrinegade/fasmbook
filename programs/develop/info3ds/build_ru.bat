if not exist bin mkdir bin
@erase lang.inc
@echo lang fix ru_RU >lang.inc
@copy objects.png bin\objects.png
@fasm.exe -m 16384 info3ds.asm bin\info3ds.kex
@kpack bin\info3ds.kex
@fasm.exe -m 16384 info3ds_u.asm bin\info3ds_u.kex
@kpack bin\info3ds_u.kex
pause
