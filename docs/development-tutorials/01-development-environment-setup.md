# KolibriOS Development Environment Setup

This guide will help you set up a complete development environment for KolibriOS programming, covering all necessary tools and configurations for both assembly and C development.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installing FASM](#installing-fasm)
3. [Setting up GCC Toolchain](#setting-up-gcc-toolchain)
4. [Installing Tup Build System](#installing-tup-build-system)
5. [Setting up Development Tools](#setting-up-development-tools)
6. [Testing Your Environment](#testing-your-environment)
7. [IDE Configuration](#ide-configuration)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- **Operating System**: Linux (Ubuntu/Debian recommended) or Windows with MinGW
- **Architecture**: x86 or x86_64 host system
- **Disk Space**: At least 2GB free space for toolchain and sources
- **Memory**: Minimum 1GB RAM for compilation

### Linux Setup (Recommended)
```bash
# Update package manager
sudo apt update

# Install essential build tools
sudo apt install build-essential git wget curl unzip

# Install additional tools for image manipulation
sudo apt install mtools mkisofs

# Install development libraries
sudo apt install libcloog-isl4
```

### Windows Setup
```batch
# Install MinGW from https://www.mingw.org/
# Install Git for Windows from https://git-scm.com/
# Install 7-Zip for archive extraction
```

## Installing FASM

FASM (Flat Assembler) is the primary assembly language compiler for KolibriOS.

### Linux Installation
```bash
# Download FASM
cd /tmp
wget https://flatassembler.net/fasm-1.73.31.tgz
tar -xzf fasm-1.73.31.tgz

# Install FASM
sudo cp fasm/fasm /usr/local/bin/
sudo chmod +x /usr/local/bin/fasm

# Verify installation
fasm
```

### Windows Installation
```batch
# Download FASM from https://flatassembler.net/download.php
# Extract to C:\fasm\
# Add C:\fasm\ to your PATH environment variable
```

### Testing FASM Installation
Create a simple test file:

```assembly
; test.asm
format PE console
entry start

start:
    ; Exit with code 0
    push 0
    call [ExitProcess]

section '.idata' import data readable
library kernel32,'kernel32.dll'
import kernel32,\
       ExitProcess,'ExitProcess'
```

Compile and test:
```bash
fasm test.asm
# Should create test.exe (Windows) or test (Linux)
```

## Setting up GCC Toolchain

The KolibriOS GCC toolchain is a cross-compiler specifically built for KolibriOS development.

### Download Toolchain

#### Linux (64-bit)
```bash
# Create toolchain directory
sudo mkdir -p /home/autobuild/tools/win32

# Download and extract toolchain
cd /tmp
wget http://ftp.kolibrios.org/users/Serge/new/Toolchain/toolchain-linux.7z
7z x toolchain-linux.7z -o/home/autobuild/tools/win32/

# Set permissions
sudo chown -R $USER:$USER /home/autobuild/tools/
```

#### Windows with MinGW
```batch
# Download toolchain from:
# http://ftp.kolibrios.org/users/Serge/new/Toolchain/toolchain-msys.7z
# Extract to C:\MinGW\msys\1.0\home\autobuild\tools\win32\
```

### Configure Toolchain
Add toolchain to your PATH:

#### Linux
```bash
# Add to ~/.bashrc or ~/.profile
export PATH="/home/autobuild/tools/win32/bin:$PATH"

# Reload configuration
source ~/.bashrc
```

#### Windows
```batch
# Add to PATH environment variable:
# C:\MinGW\msys\1.0\home\autobuild\tools\win32\bin
```

### Test GCC Installation
```bash
# Test compiler
kos32-gcc --version

# Test basic compilation
echo 'int main() { return 0; }' > test.c
kos32-gcc -o test test.c
```

## Installing Tup Build System

Tup is the modern build system used by KolibriOS for dependency tracking and efficient builds.

### Linux Installation
```bash
# Install dependencies
sudo apt install libfuse-dev pkg-config

# Clone and build Tup
cd /tmp
git clone https://github.com/gittup/tup.git
cd tup
./build.sh
sudo cp tup /usr/local/bin/
sudo chmod +x /usr/local/bin/tup
```

### Windows Installation
```batch
# Download pre-built binary from:
# http://gittup.org/tup/win32/tup-latest.zip
# Extract tup.exe to a directory in your PATH
```

### Test Tup Installation
```bash
tup --version
```

## Setting up Development Tools

### Code Editor Configuration

#### Visual Studio Code
Install useful extensions:
```bash
# Install VSCode extensions
code --install-extension ms-vscode.cpptools
code --install-extension 13xforever.language-x86-64-assembly
code --install-extension slevesque.vscode-multiclip
```

Create VSCode workspace configuration:
```json
{
  "folders": [
    {
      "path": "/path/to/kolibrios"
    }
  ],
  "settings": {
    "files.associations": {
      "*.asm": "asm-intel-x86-generic",
      "*.inc": "asm-intel-x86-generic",
      "Tupfile.lua": "lua"
    },
    "C_Cpp.default.includePath": [
      "/home/autobuild/tools/win32/mingw32/include"
    ],
    "C_Cpp.default.compilerPath": "/home/autobuild/tools/win32/bin/kos32-gcc"
  }
}
```

#### Vim/Neovim Configuration
Add assembly syntax highlighting:
```vim
" Add to ~/.vimrc or ~/.config/nvim/init.vim
autocmd BufRead,BufNewFile *.asm set filetype=asm
autocmd BufRead,BufNewFile *.inc set filetype=asm
autocmd BufRead,BufNewFile Tupfile.lua set filetype=lua

" Enable syntax highlighting for FASM
let g:asmsyntax = 'fasm'
```

### Additional Development Tools

#### Image Tools (for system image manipulation)
```bash
# Linux
sudo apt install mtools mkisofs

# Test mtools
mdir -i /path/to/kolibri.img
```

#### Debugging Tools
```bash
# Install GDB for debugging
sudo apt install gdb

# Install QEMU for testing
sudo apt install qemu-system-x86
```

#### Compression Tools
```bash
# For kpack utility (optional)
# Download from http://diamond.kolibrios.org/prg/kpack.exe (Windows)
# Or compile from sources in programs/other/kpack/linux/
```

## Testing Your Environment

### Clone KolibriOS Repository
```bash
# Clone the repository
git clone https://git.kolibrios.org/KolibriOS/kolibrios.git
cd kolibrios

# Or if using GitHub mirror:
git clone https://github.com/KolibriOS/kolibrios.git
cd kolibrios
```

### Test Build System
```bash
# Initialize Tup
tup init

# Configure build (copy and edit configuration)
cp tup.config.template tup.config

# Edit tup.config to enable/disable compilers as needed
# For basic setup, you might want to disable some compilers:
echo "CONFIG_NO_NASM=full" >> tup.config
echo "CONFIG_NO_JWASM=full" >> tup.config
echo "CONFIG_NO_CMM=full" >> tup.config
echo "CONFIG_NO_TCC=full" >> tup.config

# Test building a simple program
cd programs/develop/libraries/console/examples
tup init
tup

# This should build the console examples
```

### Test FASM Program
```bash
# Navigate to a simple FASM program
cd programs/demos/life

# Build with FASM directly
fasm life.asm

# Or use Tup
tup init
tup
```

### Test C Program
```bash
# Navigate to a C program
cd programs/demos/gears

# Create local tup configuration
echo "CONFIG_HELPERDIR=." > tup.config

# Copy necessary helpers
cp ../../use_gcc.lua .

# Initialize and build
tup init
tup
```

## IDE Configuration

### Assembly Development
Configure your IDE to recognize FASM syntax:
- File extensions: `.asm`, `.inc`, `.mac`
- Syntax highlighting: Intel x86 assembly
- Build command: `fasm %filename%`

### C Development
Configure for KolibriOS C development:
- Compiler: `kos32-gcc`
- Include paths: `/home/autobuild/tools/win32/mingw32/include`
- Library paths: `/home/autobuild/tools/win32/mingw32/lib`

### Project Templates
Create templates for common project types:

#### FASM Console Application Template
```assembly
format PE console 0.8
include '../../../proc32.inc'
include '../../../import.inc'

start:
    ; Your code here
    push    0
    call    [ExitProcess]

align 4
data import
library kernel32,'kernel32.dll'
import kernel32,\
       ExitProcess,'ExitProcess'
end data
```

#### C Application Template
```c
#include <stdio.h>
#include <stdlib.h>

int main() {
    printf("Hello, KolibriOS!\n");
    return 0;
}
```

## Troubleshooting

### Common Issues

#### FASM Not Found
```bash
# Check if FASM is in PATH
which fasm

# If not found, add to PATH or install properly
export PATH="/path/to/fasm:$PATH"
```

#### GCC Toolchain Issues
```bash
# Check toolchain installation
ls -la /home/autobuild/tools/win32/bin/kos32-gcc

# Verify library path
ls -la /home/autobuild/tools/win32/mingw32/lib/
```

#### Tup Build Failures
```bash
# Clean and reinitialize
tup stop
rm -rf .tup
tup init

# Check for missing dependencies
tup
```

#### Permission Issues (Linux)
```bash
# Fix ownership of autobuild directory
sudo chown -R $USER:$USER /home/autobuild/

# Fix executable permissions
chmod +x /home/autobuild/tools/win32/bin/*
```

### Getting Help

- **Forum**: http://board.kolibrios.org/
- **Documentation**: Check `build.txt` for detailed build instructions
- **IRC**: #kolibrios on various networks
- **GitHub Issues**: For toolchain-specific problems

### Environment Verification Script

Create a script to verify your setup:
```bash
#!/bin/bash
# verify-setup.sh

echo "=== KolibriOS Development Environment Verification ==="

# Check FASM
if command -v fasm &> /dev/null; then
    echo "✓ FASM installed"
    fasm | head -1
else
    echo "✗ FASM not found"
fi

# Check GCC toolchain
if command -v kos32-gcc &> /dev/null; then
    echo "✓ KolibriOS GCC toolchain installed"
    kos32-gcc --version | head -1
else
    echo "✗ KolibriOS GCC toolchain not found"
fi

# Check Tup
if command -v tup &> /dev/null; then
    echo "✓ Tup build system installed"
    tup --version
else
    echo "✗ Tup build system not found"
fi

# Check additional tools
for tool in mtools mkisofs git; do
    if command -v $tool &> /dev/null; then
        echo "✓ $tool available"
    else
        echo "✗ $tool not found"
    fi
done

echo "=== Environment verification complete ==="
```

Run with:
```bash
chmod +x verify-setup.sh
./verify-setup.sh
```

Your development environment is now ready for KolibriOS development! Proceed to the next tutorial to learn about building your first KolibriOS program.