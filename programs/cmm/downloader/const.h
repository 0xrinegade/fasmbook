//Copyright 2021 by Leency

#ifdef LANG_RUS
	#define DL_WINDOW_HEADER "�������� ����㧮�"
	#define T_DOWNLOAD "������"
	#define T_CANCEL "�⬥��"
	#define T_OPEN_DIR "�������� � �����"
	#define T_RUN "������ 䠩�"
	#define T_NEW "����� ����㧪�"
	#define T_SAVE_TO "���࠭��� �:"
	#define T_AUTOCLOSE "������� ���� �� �����襭�� ����㧪�"

	#define T_STATUS_READY       "��⮢ � ����㧪� ^_^                                   "
	#define T_STATUS_DOWNLOADING "���� ����㧪� 䠩��... %i.%i M� ����祭� (%i K�/�)   "
	#define T_STATUS_COMPLETE    "����㧪� �ᯥ譮 �����襭�.                            "
	#define T_STATUS_DL_P1 "���� ����㧪� 䠩��... "
	#define T_STATUS_DL_P2 " M� ����祭� ("
	#define T_STATUS_DL_P3 " K�/�)  "

	#define FILE_SAVED_AS "'�������� ����㧮�\n���� ��࠭�� ��� %s' -Dt"
	#define FILE_NOT_SAVED "'�������� ����㧮�\n�訡��! ���� �� ����� ���� ��࠭�� ���\n%s' -Et"
	#define T_ERROR_STARTING_DOWNLOAD "'���������� ����� ᪠稢����.\n�஢���� �������� ���� � ᮥ������� � ���୥⮬.' -E"
	char accept_language[]= "Accept-Language: ru\n";
#else
	#define DL_WINDOW_HEADER "Download Manager"
	#define T_DOWNLOAD "Download"
	#define T_CANCEL "Cancel"
	#define T_OPEN_DIR " Show in folder "
	#define T_RUN "Open file"
	#define T_NEW "New download"
	#define T_SAVE_TO "Download to:"
	#define T_AUTOCLOSE "Close this window when download completes"

	#define T_STATUS_READY       "Ready to download ^_^                          "
	#define T_STATUS_DOWNLOADING "Downloading... %i.%i MB received (%i KB/s)   "
	#define T_STATUS_COMPLETE    "Download completed succesfully.                "
	#define T_STATUS_DL_P1 "Downloading... "
	#define T_STATUS_DL_P2 " MB received ("
	#define T_STATUS_DL_P3 " KB/s)    "

	#define FILE_SAVED_AS "'Download manager\nFile saved as %s' -Dt"
	#define FILE_NOT_SAVED "'Download manager\nError! Can\96t save file as %s' -Et"
	#define T_ERROR_STARTING_DOWNLOAD "'Error while starting download process.\nCheck entered path and Internet connection.' -E"
	char accept_language[]= "Accept-Language: en\n";
#endif

#define WIN_W 526
#define WIN_H 195

#define GAPX 15
#define BUT_W 148

#define DEFAULT_SAVE_DIR "/tmp0/1/Downloads"

char dl_shared[] = "DL";

#define URL_SPEED_TEST "http://speedtest.tele2.net/100MB.zip"

enum { 
	BTN_EXIT=1,
	BTN_START,
	BTN_STOP,
	BTN_DIR, 
	BTN_RUN, 
	BTN_NEW
};

#define PB_COL_ERROR 0xF55353
#define PB_COL_PROGRESS 0x297FFD
#define PB_COL_COMPLETE 0x74DA00