# KolibriOS Treesitter Map

This document provides a comprehensive mapping of the KolibriOS codebase structure, file patterns, and organization for development tools and IDEs.

## Language Identification Patterns

### Assembly Languages
```
**/*.asm      - FASM assembly files (primary)
**/*.inc      - Assembly include files (macros, constants, procedures)
**/*.mac      - Assembly macro files
*.nasm        - NASM assembly files (alternative syntax)
```

### C/C++ Languages
```
**/*.c        - C source files
**/*.cpp      - C++ source files  
**/*.h        - C/C++ header files
**/*.hpp      - C++ header files
```

### Build System Files
```
**/Tupfile.lua    - Tup build system configuration
**/Makefile       - GNU Make build files
**/CMakeLists.txt - CMake build files (rare)
build.sh          - Shell build scripts
build.bat         - Batch build scripts
```

### Configuration Files
```
tup.config         - Tup build configuration
tup.config.template - Tup configuration template
*.conf             - System configuration files
*.cfg              - Application configuration files
```

### Documentation Files
```
**/*.md       - Markdown documentation
**/*.txt      - Plain text documentation
**/*.rst      - reStructuredText documentation
**/docs/**    - Documentation directories
**/doc/**     - Alternative documentation directories
```

## Directory Structure Mapping

### Root Level Structure
```
kolibrios/
├── .editorconfig          # Editor configuration
├── .gitignore            # Git ignore patterns
├── .gitea/               # Gitea CI/CD configuration
├── README.md             # Project overview
├── CONTRIBUTING.md       # Contribution guidelines
├── COPYING.TXT          # GPL license text
├── build.txt            # Build instructions
├── llms.txt             # LLM project description
├── tup.config.template  # Build configuration template
└── [main directories]   # See detailed mapping below
```

### Kernel Directory (/kernel)
```
kernel/
├── trunk/                    # Main kernel branch
│   ├── kernel.asm           # [FASM] Main kernel entry point
│   ├── kernel32.inc         # [ASM_INC] 32-bit kernel includes
│   ├── Makefile             # [MAKE] Build configuration
│   ├── Tupfile.lua          # [LUA] Tup build config
│   ├── core/                # Core kernel subsystems
│   │   ├── malloc.inc       # [ASM_INC] Memory allocator
│   │   ├── sched.inc        # [ASM_INC] Scheduler
│   │   ├── sync.inc         # [ASM_INC] Synchronization
│   │   └── taskman.inc      # [ASM_INC] Task management
│   ├── fs/                  # File system drivers
│   │   ├── fat32.inc        # [ASM_INC] FAT32 file system
│   │   ├── ntfs.inc         # [ASM_INC] NTFS file system
│   │   ├── ext2.inc         # [ASM_INC] ext2 file system
│   │   └── vfs.inc          # [ASM_INC] Virtual file system
│   ├── gui/                 # Graphics and GUI subsystem
│   │   ├── window.inc       # [ASM_INC] Window management
│   │   ├── fonts.inc        # [ASM_INC] Font rendering
│   │   ├── mouse.inc        # [ASM_INC] Mouse handling
│   │   └── skincode.inc     # [ASM_INC] Window skinning
│   ├── network/             # Network stack
│   │   ├── tcp.inc          # [ASM_INC] TCP protocol
│   │   ├── udp.inc          # [ASM_INC] UDP protocol
│   │   ├── ip.inc           # [ASM_INC] IP protocol
│   │   └── ethernet.inc     # [ASM_INC] Ethernet layer
│   ├── sound/               # Audio subsystem
│   │   ├── sound.inc        # [ASM_INC] Sound core
│   │   └── ac97.inc         # [ASM_INC] AC97 audio
│   ├── video/               # Video drivers
│   │   ├── vesa12.inc       # [ASM_INC] VESA 1.2 driver
│   │   ├── vesa20.inc       # [ASM_INC] VESA 2.0 driver
│   │   └── blitter.inc      # [ASM_INC] Graphics blitting
│   ├── docs/                # Kernel documentation
│   │   ├── sysfuncs.txt     # [DOC] System functions reference
│   │   ├── sysfuncr.txt     # [DOC] System functions (Russian)
│   │   ├── drivers_api.txt  # [DOC] Driver API documentation
│   │   └── events_subsystem.txt # [DOC] Event system docs
│   └── boot/                # Boot loader code
│       ├── bootcode.asm     # [FASM] Boot loader assembly
│       └── bootsector.asm   # [FASM] Boot sector code
└── branches/                # Experimental kernel branches
    ├── Kolibri-A/          # Alternative kernel branch
    ├── Kolibri-acpi/       # ACPI support branch
    └── kolibri-ahci/       # AHCI support branch
```

### Programs Directory (/programs)
```
programs/
├── macros.inc               # [ASM_INC] Common assembly macros
├── proc32.inc               # [ASM_INC] 32-bit procedure definitions
├── struct.inc               # [ASM_INC] Structure definitions
├── import.inc               # [ASM_INC] Import definitions
├── export.inc               # [ASM_INC] Export definitions
├── use_*.lua                # [LUA] Build system helpers
├── system/                  # System utilities and core applications
│   ├── shell/               # System shell
│   │   ├── shell.asm        # [FASM] Main shell program
│   │   ├── cmd/             # Shell commands
│   │   └── Tupfile.lua      # [LUA] Build configuration
│   ├── docpack/             # Documentation viewer
│   ├── gmon/                # System monitor
│   ├── launcher/            # Application launcher
│   └── setup/               # System setup utility
├── develop/                 # Development tools and IDEs
│   ├── fasm/                # FASM assembler port
│   ├── libraries/           # Development libraries
│   │   ├── box_lib/         # GUI controls library
│   │   ├── console/         # Console I/O library
│   │   ├── network/         # Network library
│   │   └── buf2d/           # 2D graphics buffer library
│   ├── kolibri-libc/        # C standard library port
│   ├── tcc/                 # Tiny C Compiler port
│   └── examples/            # Programming examples
├── games/                   # Games and entertainment
│   ├── doom/                # DOOM port
│   ├── quake/               # Quake port
│   ├── chess/               # Chess game
│   └── tetris/              # Tetris game
├── media/                   # Multimedia applications
│   ├── animage/             # Image editor
│   ├── mp3info/             # MP3 metadata viewer
│   ├── zsea/                # Image viewer
│   └── img_transform/       # Image transformation tool
├── network/                 # Network applications
│   ├── browser/             # Web browser
│   ├── ftpc/                # FTP client
│   ├── telnet/              # Telnet client
│   └── ircc/                # IRC client
├── fs/                      # File system utilities
│   ├── kfm/                 # File manager
│   ├── unzip/               # ZIP archiver
│   └── kfar/                # Advanced file manager
├── demos/                   # Demo applications
│   ├── life/                # Game of Life
│   ├── fire/                # Fire effect demo
│   └── 3d/                  # 3D graphics demos
├── other/                   # Miscellaneous applications
│   ├── calc/                # Calculator
│   ├── calendar/            # Calendar application
│   └── rtdata/              # Runtime data utilities
├── cmm/                     # C-- language programs (legacy)
└── bcc32/                   # Borland C++ programs
    └── examples/            # C++ programming examples
```

### Drivers Directory (/drivers)
```
drivers/
├── sceletone.asm            # [FASM] Driver template/skeleton
├── Tupfile.lua              # [LUA] Build configuration
├── macros.inc               # [ASM_INC] Driver macros
├── proc32.inc               # [ASM_INC] 32-bit procedures
├── struct.inc               # [ASM_INC] Structure definitions
├── audio/                   # Audio drivers
│   ├── ac97.asm            # [FASM] AC97 audio driver
│   ├── sb16.asm            # [FASM] SoundBlaster 16 driver
│   └── intel_hda/          # Intel HDA audio driver
├── video/                   # Video drivers
│   ├── radeon/             # ATI Radeon driver
│   ├── nvidia/             # NVIDIA driver
│   └── intel/              # Intel graphics driver
├── ethernet/                # Network drivers
│   ├── rtl8139.asm         # [FASM] Realtek RTL8139 driver
│   ├── rtl8169.asm         # [FASM] Realtek RTL8169 driver
│   └── i8255x.asm          # [FASM] Intel 8255x driver
├── usb/                     # USB drivers
│   ├── usbhid.asm          # [FASM] USB HID driver
│   ├── usbstor.asm         # [FASM] USB storage driver
│   └── usbhub.asm          # [FASM] USB hub driver
├── disk/                    # Disk drivers
│   ├── ahci.asm            # [FASM] AHCI SATA driver
│   └── ide.asm             # [FASM] IDE/PATA driver
├── mouse/                   # Mouse drivers
│   ├── ps2mouse.asm        # [FASM] PS/2 mouse driver
│   └── usbmouse.asm        # [FASM] USB mouse driver
└── serial/                  # Serial port drivers
    ├── com_mouse.asm       # [FASM] Serial mouse driver
    └── uart.asm            # [FASM] UART driver
```

### Data Directory (/data)
```
data/
├── Tupfile.lua              # [LUA] System image build config
├── common/                  # Common system files
│   ├── settings/            # Default system settings
│   ├── icons/               # System icons
│   └── fonts/               # System fonts
├── en_US/                   # English localization
│   ├── docs/                # English documentation
│   │   ├── Config.txt       # [DOC] Configuration guide
│   │   ├── Install.txt      # [DOC] Installation guide
│   │   └── Hot_Keys.txt     # [DOC] Keyboard shortcuts
│   └── settings/            # English UI settings
├── ru_RU/                   # Russian localization
│   ├── docs/                # Russian documentation
│   │   ├── guide/           # User guide
│   │   └── [various].txt    # Various Russian docs
│   └── settings/            # Russian UI settings
├── it_IT/                   # Italian localization
├── es_ES/                   # Spanish localization
└── et_EE/                   # Estonian localization
```

### Skins Directory (/skins)
```
skins/
├── default/                 # Default system skin
│   ├── default.asm          # [FASM] Skin definition
│   ├── default.dtp.asm      # [FASM] Desktop theme
│   └── Tupfile.lua          # [LUA] Build config
├── maxcodehack/             # MaxCodeHack's skins
│   └── blacky/              # Black theme
├── misc/                    # Miscellaneous skins
│   ├── night/               # Night theme
│   ├── loggy/               # Loggy theme
│   └── subsilv/             # Sub-silver theme
└── [various]/               # Other community skins
```

### Contrib Directory (/contrib)
```
contrib/
├── sdk/                     # Software Development Kit
│   ├── sources/             # Library sources
│   │   ├── freetype/        # [C] FreeType font library
│   │   ├── SDL-1.2.2/       # [C] SDL multimedia library
│   │   ├── Mesa/            # [C] Mesa 3D graphics
│   │   ├── newlib/          # [C] Newlib C library
│   │   └── tinygl/          # [C] TinyGL 3D library
│   ├── bin/                 # Compiled binaries
│   └── lib/                 # Static libraries
├── toolchain/               # Development toolchain
│   ├── gcc/                 # GCC compiler sources
│   ├── binutils/            # Binary utilities
│   └── avra/                # AVR assembler
├── other/                   # Other contributed software
│   └── [various]/           # Various contributed applications
└── games/                   # Contributed games
    └── [various]/           # Various game ports
```

### Tools Directory (/_tools)
```
_tools/
├── build/                   # Build scripts and utilities
├── img/                     # Image manipulation tools
├── lib/                     # Tool libraries
└── workspace/               # Development workspace tools
```

## File Type Associations

### Treesitter Language Grammars
```
assembly:
  - "*.asm"          # Primary FASM assembly files
  - "*.inc"          # Assembly include files
  - "*.mac"          # Assembly macro files

c:
  - "*.c"
  - "*.h"

cpp:
  - "*.cpp"
  - "*.hpp"
  - "*.cc"
  - "*.cxx"

lua:
  - "Tupfile.lua"    # Tup build files
  - "*.lua"          # Lua scripts

make:
  - "Makefile"
  - "*.mk"
  - "*.mak"

bash:
  - "*.sh"
  - "build.sh"

batch:
  - "*.bat"
  - "build.bat"
```

### IDE Configuration Suggestions

#### Language Server Protocol (LSP) Settings
```json
{
  "assembly": {
    "server": "asm-lsp",
    "filetypes": ["asm", "inc", "mac"],
    "root_markers": ["Tupfile.lua", "Makefile"]
  },
  "c": {
    "server": "clangd",
    "compile_commands": "compile_commands.json"
  },
  "lua": {
    "server": "lua-language-server"
  }
}
```

#### Syntax Highlighting Patterns
```
# FASM Assembly Patterns
keywords: format, include, macro, proc, endp, if, end, equ, db, dw, dd, dq
registers: eax, ebx, ecx, edx, esi, edi, esp, ebp, ax, bx, cx, dx
directives: align, section, entry, library, import, export
comments: ; (semicolon) for line comments

# Include File Patterns  
macro_definitions: macro.*{.*}
procedure_definitions: proc.*endp
constant_definitions: \w+\s+equ\s+
```

## Build System Integration

### Tup Build System
- **Root marker**: `Tupfile.lua` files throughout the tree
- **Build variants**: Multiple build configurations in `build-*` directories
- **Dependencies**: Automatic dependency tracking
- **Configuration**: `tup.config` files for build settings

### Language-Specific Build Patterns
```
FASM Assembly:
  Input: *.asm
  Output: executable or binary
  Command: fasm <input.asm> [output]

C/C++:
  Toolchain: kos32-gcc (KolibriOS-specific GCC)
  Libraries: Located in contrib/sdk/lib/
  Headers: Located in contrib/sdk/sources/

Drivers:
  Format: PE DLL
  Template: drivers/sceletone.asm
  Output: *.obj or *.drv
```

## Development Workflow Patterns

### Project Structure Recognition
1. **Root Detection**: Look for `tup.config.template` or `build.txt`
2. **Module Detection**: Presence of `Tupfile.lua` indicates buildable module
3. **Language Detection**: Use file extensions and content patterns
4. **Documentation**: Check for `docs/`, `doc/`, or `*.txt` files

### IDE Integration Recommendations
- **Project Root**: Directory containing `tup.config.template`
- **Build Commands**: Use `tup` for building, respect `CONFIG_*` variables
- **Documentation**: Integrate with existing `.txt` and `.md` files
- **Debugging**: Support for assembly-level debugging tools

This treesitter map provides comprehensive coverage of the KolibriOS codebase structure, enabling intelligent code navigation, syntax highlighting, and build system integration for development tools and IDEs.