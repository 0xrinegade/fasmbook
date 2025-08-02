# KolibriOS Development Environment Setup - Complete Guide

This comprehensive guide will help you set up a complete, professional-grade development environment for KolibriOS programming. Whether you're a beginner or experienced developer, this guide covers everything from basic tool installation to advanced IDE configuration, performance optimization, and professional workflow setup.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [System Preparation and Base Tools](#system-preparation-and-base-tools)
3. [Installing FASM - The Primary Assembler](#installing-fasm)
4. [Setting up GCC Toolchain](#setting-up-gcc-toolchain)
5. [Installing Tup Build System](#installing-tup-build-system)
6. [Development Tools Ecosystem](#development-tools-ecosystem)
7. [IDE and Editor Configuration](#ide-and-editor-configuration)
8. [Version Control and Collaboration Setup](#version-control-and-collaboration)
9. [Debugging and Profiling Tools](#debugging-and-profiling-tools)
10. [Virtualization and Testing Environment](#virtualization-and-testing)
11. [Performance Optimization Tools](#performance-optimization)
12. [Advanced Development Workflows](#advanced-workflows)
13. [Cross-Platform Development](#cross-platform-development)
14. [Container-based Development](#container-development)
15. [CI/CD Pipeline Setup](#cicd-setup)
16. [Security Tools and Practices](#security-tools)
17. [Documentation and API Tools](#documentation-tools)
18. [Testing Your Complete Environment](#testing-complete-environment)
19. [Troubleshooting and Common Issues](#troubleshooting)
20. [Maintenance and Updates](#maintenance-updates)
21. [Advanced Customization](#advanced-customization)
22. [Performance Benchmarking](#performance-benchmarking)
23. [Community Tools and Resources](#community-tools)

## Prerequisites

### System Requirements and Architecture Considerations

**Host System Requirements:**
- **Operating System**: 
  - Linux (Ubuntu 20.04+ LTS, Debian 11+, Fedora 35+, openSUSE Leap 15.4+)
  - Windows 10/11 with WSL2 (Windows Subsystem for Linux)
  - macOS 11+ with Homebrew (experimental support)
- **Architecture**: x86_64 host system (32-bit target compilation supported)
- **CPU**: Multi-core processor recommended (Intel i5/AMD Ryzen 5 or better)
- **Memory**: 
  - Minimum: 4GB RAM
  - Recommended: 8GB+ RAM for large builds and parallel compilation
  - Optimal: 16GB+ RAM for full development workflow with VMs
- **Storage**:
  - Minimum: 10GB free space for basic setup
  - Recommended: 50GB+ for full development environment
  - SSD strongly recommended for build performance
- **Network**: Stable internet connection for package downloads and updates

**Hardware Compatibility Matrix:**

| Component | Minimum | Recommended | Optimal |
|-----------|---------|-------------|---------|
| CPU | Intel Core 2 Duo, AMD Athlon X2 | Intel i5-8th gen, AMD Ryzen 5 3600 | Intel i7-12th gen, AMD Ryzen 7 5800X |
| RAM | 4GB | 8GB | 16GB+ |
| Storage | 10GB HDD | 50GB SSD | 200GB+ NVMe SSD |
| GPU | Any | Dedicated GPU for VM acceleration | Modern GPU with hardware acceleration |

### Linux Distribution Specific Setup

#### Ubuntu/Debian Systems (Recommended)

**Ubuntu 22.04 LTS Setup:**
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential build tools and dependencies
sudo apt install -y \
    build-essential \
    git \
    wget \
    curl \
    unzip \
    tar \
    gzip \
    bzip2 \
    xz-utils \
    vim \
    nano \
    tree \
    htop \
    tmux \
    screen

# Install development libraries and headers
sudo apt install -y \
    libc6-dev-i386 \
    lib32z1-dev \
    lib32ncurses6-dev \
    lib32stdc++6 \
    gcc-multilib \
    g++-multilib

# Install additional development tools
sudo apt install -y \
    mtools \
    mkisofs \
    dosfstools \
    parted \
    kpartx \
    qemu-system-x86 \
    qemu-utils \
    gdb \
    valgrind \
    strace \
    ltrace

# Install image manipulation tools
sudo apt install -y \
    imagemagick \
    gimp \
    inkscape \
    optipng \
    jpegoptim

# Install network and system analysis tools
sudo apt install -y \
    wireshark \
    tcpdump \
    netcat \
    nmap \
    iperf3 \
    sysstat \
    iotop \
    nethogs
```

**Debian 11+ Setup:**
```bash
# Enable contrib and non-free repositories
echo "deb http://deb.debian.org/debian $(lsb_release -sc) main contrib non-free" | sudo tee /etc/apt/sources.list.d/contrib-nonfree.list

# Update and install similar packages as Ubuntu
sudo apt update
sudo apt install -y firmware-linux-nonfree
# ... (same package installation as Ubuntu)
```

#### Red Hat/Fedora/CentOS Systems

**Fedora 37+ Setup:**
```bash
# Update system
sudo dnf update -y

# Install development tools group
sudo dnf groupinstall -y "Development Tools"
sudo dnf groupinstall -y "C Development Tools and Libraries"

# Install essential packages
sudo dnf install -y \
    git \
    wget \
    curl \
    unzip \
    tar \
    vim \
    nano \
    tree \
    htop \
    tmux \
    screen

# Install 32-bit development libraries
sudo dnf install -y \
    glibc-devel.i686 \
    libgcc.i686 \
    libstdc++-devel.i686 \
    zlib-devel.i686

# Install additional tools
sudo dnf install -y \
    mtools \
    genisoimage \
    dosfstools \
    parted \
    kpartx \
    qemu-system-x86 \
    gdb \
    valgrind \
    strace

# Enable RPM Fusion for additional packages
sudo dnf install -y \
    https://mirrors.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm \
    https://mirrors.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-$(rpm -E %fedora).noarch.rpm
```

**RHEL/CentOS Stream Setup:**
```bash
# Enable EPEL repository
sudo dnf install -y epel-release

# Enable PowerTools/CodeReady repository (CentOS/RHEL 8+)
sudo dnf config-manager --set-enabled powertools

# Install similar packages as Fedora
# ... (same package installation)
```

#### openSUSE Systems

**openSUSE Leap/Tumbleweed Setup:**
```bash
# Update system
sudo zypper update -y

# Install development pattern
sudo zypper install -y -t pattern devel_basis

# Install essential packages
sudo zypper install -y \
    git \
    wget \
    curl \
    unzip \
    tar \
    vim \
    nano \
    tree \
    htop \
    tmux \
    screen

# Install 32-bit development libraries
sudo zypper install -y \
    glibc-devel-32bit \
    libgcc_s1-32bit \
    libstdc++6-devel-32bit

# Install additional tools
sudo zypper install -y \
    mtools \
    mkisofs \
    dosfstools \
    parted \
    kpartx \
    qemu-x86 \
    gdb \
    valgrind \
    strace
```

#### Arch Linux Systems

**Arch Linux Setup:**
```bash
# Update system
sudo pacman -Syu

# Install base development packages
sudo pacman -S --needed \
    base-devel \
    git \
    wget \
    curl \
    unzip \
    tar \
    vim \
    nano \
    tree \
    htop \
    tmux \
    screen

# Install multilib repository packages
sudo pacman -S --needed \
    lib32-glibc \
    lib32-gcc-libs \
    lib32-zlib

# Install additional tools
sudo pacman -S --needed \
    mtools \
    cdrtools \
    dosfstools \
    parted \
    qemu-desktop \
    gdb \
    valgrind \
    strace

# Install AUR helper (yay) for additional packages
git clone https://aur.archlinux.org/yay.git
cd yay
makepkg -si
cd .. && rm -rf yay
```

### Windows Subsystem for Linux (WSL2) Setup

**Installing WSL2:**
```powershell
# Run in Administrator PowerShell
wsl --install
wsl --set-default-version 2

# Install Ubuntu distribution
wsl --install -d Ubuntu-22.04

# Restart computer and complete Ubuntu setup
```

**WSL2 Configuration:**
```bash
# Create .wslconfig in Windows user directory
# C:\Users\<username>\.wslconfig
echo "[wsl2]
memory=8GB
processors=4
swap=2GB
localhostForwarding=true

[experimental]
autoMemoryReclaim=gradual
networkingMode=mirrored
dnsTunneling=true
firewall=true
autoProxy=true" > /mnt/c/Users/$(cmd.exe /c "echo %USERNAME%" 2>/dev/null | tr -d '\r')/'.wslconfig'

# Restart WSL
wsl --shutdown
```

**WSL2 Ubuntu Setup:**
```bash
# Update and install packages (same as Ubuntu setup above)
sudo apt update && sudo apt upgrade -y
# ... (continue with Ubuntu package installation)

# Install Windows-specific tools
sudo apt install -y wslu
```

### macOS Setup (Experimental)

**Prerequisites for macOS:**
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Add Homebrew to PATH
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**Install Development Tools:**
```bash
# Install essential tools
brew install \
    git \
    wget \
    curl \
    unzip \
    tar \
    vim \
    nano \
    tree \
    htop \
    tmux \
    screen

# Install build tools
brew install \
    gcc \
    make \
    cmake \
    ninja

# Install virtualization tools
brew install \
    qemu \
    utm  # Alternative to QEMU with GUI

# Install additional development tools
brew install \
    gdb \
    lldb \
    valgrind  # Note: Limited support on Apple Silicon
    dtrace
```

### Security and Permission Setup

**User and Group Configuration:**
```bash
# Create development group
sudo groupadd kolibrios-dev
sudo usermod -a -G kolibrios-dev $USER

# Create development directory with proper permissions
sudo mkdir -p /opt/kolibrios-dev
sudo chown -R $USER:kolibrios-dev /opt/kolibrios-dev
sudo chmod -R 775 /opt/kolibrios-dev

# Set up sudo rules for development tasks
echo "$USER ALL=(ALL) NOPASSWD: /usr/bin/mount, /usr/bin/umount, /usr/bin/losetup" | sudo tee /etc/sudoers.d/kolibrios-dev
```

**SSH Key Setup for Development:**
```bash
# Generate SSH key for development
ssh-keygen -t ed25519 -C "kolibrios-dev@$(hostname)" -f ~/.ssh/kolibrios_dev
ssh-keygen -t rsa -b 4096 -C "kolibrios-dev@$(hostname)" -f ~/.ssh/kolibrios_dev_rsa

# Add to SSH agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/kolibrios_dev
ssh-add ~/.ssh/kolibrios_dev_rsa

# Configure SSH client
cat >> ~/.ssh/config << EOF
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/kolibrios_dev
    IdentitiesOnly yes

Host gitlab.com
    HostName gitlab.com
    User git
    IdentityFile ~/.ssh/kolibrios_dev
    IdentitiesOnly yes
EOF
```

### Environment Variables and Shell Configuration

**Bash Configuration (~/.bashrc):**
```bash
# KolibriOS Development Environment
export KOLIBRIOS_DEV_ROOT="/opt/kolibrios-dev"
export KOLIBRIOS_SRC="$KOLIBRIOS_DEV_ROOT/kolibrios"
export KOLIBRIOS_TOOLS="$KOLIBRIOS_SRC/_tools"
export KOLIBRIOS_BUILD="$KOLIBRIOS_DEV_ROOT/builds"
export KOLIBRIOS_PROJECTS="$KOLIBRIOS_DEV_ROOT/projects"

# Add tools to PATH
export PATH="$KOLIBRIOS_TOOLS:$PATH"
export PATH="$HOME/.local/bin:$PATH"

# Development aliases
alias kos-cd='cd $KOLIBRIOS_SRC'
alias kos-build='cd $KOLIBRIOS_BUILD'
alias kos-proj='cd $KOLIBRIOS_PROJECTS'
alias kos-tools='cd $KOLIBRIOS_TOOLS'

# Build aliases
alias fasm-debug='fasm -m 65536 -p 16'
alias tup-verbose='tup -v'
alias make-parallel='make -j$(nproc)'

# QEMU aliases for testing
alias qemu-kos='qemu-system-i386 -hda kolibri.img -m 256 -vga vmware -enable-kvm'
alias qemu-kos-debug='qemu-system-i386 -hda kolibri.img -m 256 -vga vmware -s -S'
alias qemu-kos-monitor='qemu-system-i386 -hda kolibri.img -m 256 -vga vmware -monitor stdio'

# Development helpers
alias hex='hexdump -C'
alias objdump-32='objdump -M intel -b binary -m i386'
alias gdb-32='gdb -ex "set architecture i386"'

# Git aliases for development workflow
alias git-kos='git --git-dir=$KOLIBRIOS_SRC/.git --work-tree=$KOLIBRIOS_SRC'
alias glog='git log --oneline --graph --decorate --all'
alias gstatus='git status --short --branch'
alias gdiff='git diff --color-words'

# Performance monitoring aliases
alias monitor-build='watch -n 1 "ps aux | grep -E \"(fasm|gcc|tup|make)\" | head -20"'
alias disk-usage='du -sh * | sort -hr'
alias memory-usage='free -h && echo && ps aux --sort=-%mem | head -10'

# Environment information
echo "KolibriOS Development Environment Loaded"
echo "Source: $KOLIBRIOS_SRC"
echo "Tools: $KOLIBRIOS_TOOLS"
echo "Build: $KOLIBRIOS_BUILD"
echo "Projects: $KOLIBRIOS_PROJECTS"
```

**Zsh Configuration (~/.zshrc) - Alternative:**
```bash
# ZSH-specific enhancements for KolibriOS development
autoload -Uz compinit && compinit
autoload -Uz vcs_info

# Include bash configuration
source ~/.bashrc

# ZSH prompt with git information
setopt PROMPT_SUBST
zstyle ':vcs_info:*' enable git
zstyle ':vcs_info:git*' formats ' [%b]'
precmd() { vcs_info }

PROMPT='%F{green}%n@%m%f:%F{blue}%~%f%F{red}${vcs_info_msg_0_}%f$ '

# ZSH completions for development tools
fpath=(~/.zsh/completions $fpath)
autoload -U compinit && compinit

# Enhanced history
HISTSIZE=10000
SAVEHIST=10000
setopt SHARE_HISTORY
setopt HIST_IGNORE_DUPS
setopt HIST_IGNORE_SPACE
```

### Development Workspace Structure

**Create Organized Workspace:**
```bash
# Create comprehensive directory structure
mkdir -p $KOLIBRIOS_DEV_ROOT/{
    kolibrios,
    projects/{personal,contrib,experiments},
    builds/{debug,release,test},
    tools/{custom,scripts,configs},
    docs/{notes,references,api},
    images/{boot,test,backup},
    logs/{build,debug,performance},
    cache/{downloads,builds,temp},
    backup/{daily,weekly,projects}
}

# Set up symbolic links for easy access
ln -sf $KOLIBRIOS_DEV_ROOT ~/kos-dev
ln -sf $KOLIBRIOS_SRC ~/kos-src
ln -sf $KOLIBRIOS_PROJECTS ~/kos-projects
ln -sf $KOLIBRIOS_BUILD ~/kos-build

# Create workspace configuration
cat > $KOLIBRIOS_DEV_ROOT/workspace.conf << EOF
# KolibriOS Development Workspace Configuration
WORKSPACE_VERSION=1.0
CREATED=$(date -Iseconds)
USER=$USER
HOST=$(hostname)

# Directory Structure
SRC_DIR=$KOLIBRIOS_SRC
PROJECT_DIR=$KOLIBRIOS_PROJECTS  
BUILD_DIR=$KOLIBRIOS_BUILD
TOOLS_DIR=$KOLIBRIOS_TOOLS
DOCS_DIR=$KOLIBRIOS_DEV_ROOT/docs
IMAGES_DIR=$KOLIBRIOS_DEV_ROOT/images
LOGS_DIR=$KOLIBRIOS_DEV_ROOT/logs
CACHE_DIR=$KOLIBRIOS_DEV_ROOT/cache
BACKUP_DIR=$KOLIBRIOS_DEV_ROOT/backup

# Build Configuration
DEFAULT_ARCH=i386
DEFAULT_OPTIMIZATION=-O2
DEFAULT_DEBUG_FLAGS=-g
PARALLEL_JOBS=$(nproc)
EOF
```

### System Optimization for Development

**I/O Optimization:**
```bash
# Create development-specific mount options
sudo mkdir -p /mnt/kos-dev-tmp
echo "tmpfs /mnt/kos-dev-tmp tmpfs size=2G,uid=$UID,gid=$(id -g),mode=755 0 0" | sudo tee -a /etc/fstab

# Optimize filesystem for development
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
echo 'fs.inotify.max_user_watches=524288' | sudo tee -a /etc/sysctl.conf
echo 'kernel.shmmax=268435456' | sudo tee -a /etc/sysctl.conf

# Apply optimizations
sudo sysctl -p
```

**Build Performance Tuning:**
```bash
# Create performance tuning script
cat > $KOLIBRIOS_TOOLS/optimize-build.sh << 'EOF'
#!/bin/bash
# KolibriOS Build Performance Optimization

# Set CPU governor to performance
echo performance | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor

# Increase file descriptor limits
ulimit -n 65536

# Set optimal nice level for build processes
renice -n -5 $$

# Clear page cache before large builds
sudo sync && sudo sysctl vm.drop_caches=3

# Set optimal I/O scheduler
echo mq-deadline | sudo tee /sys/block/*/queue/scheduler 2>/dev/null

echo "Build environment optimized for performance"
EOF

chmod +x $KOLIBRIOS_TOOLS/optimize-build.sh
```

### Verification Scripts

**Environment Verification Script:**
```bash
cat > $KOLIBRIOS_TOOLS/verify-environment.sh << 'EOF'
#!/bin/bash
# KolibriOS Development Environment Verification

echo "=== KolibriOS Development Environment Verification ==="
echo

# Check system information
echo "System Information:"
echo "  OS: $(lsb_release -d 2>/dev/null | cut -f2 || uname -s)"
echo "  Kernel: $(uname -r)"
echo "  Architecture: $(uname -m)"
echo "  CPU: $(nproc) cores"
echo "  Memory: $(free -h | awk '/^Mem:/ {print $2}')"
echo "  Disk: $(df -h $KOLIBRIOS_DEV_ROOT | tail -1 | awk '{print $4}') available"
echo

# Check required tools
echo "Required Tools Check:"
tools=(
    "fasm:FASM Assembler"
    "gcc:GNU C Compiler" 
    "tup:Tup Build System"
    "git:Git Version Control"
    "qemu-system-i386:QEMU Emulator"
    "gdb:GNU Debugger"
    "make:GNU Make"
)

for tool_info in "${tools[@]}"; do
    tool=$(echo $tool_info | cut -d: -f1)
    desc=$(echo $tool_info | cut -d: -f2)
    if command -v $tool >/dev/null 2>&1; then
        version=$(command $tool --version 2>/dev/null | head -1 || echo "Unknown")
        echo "  ✓ $desc: $version"
    else
        echo "  ✗ $desc: Not found"
        ((missing++))
    fi
done

# Check directories
echo
echo "Directory Structure Check:"
dirs=(
    "$KOLIBRIOS_SRC:Source Directory"
    "$KOLIBRIOS_PROJECTS:Projects Directory"
    "$KOLIBRIOS_BUILD:Build Directory"
    "$KOLIBRIOS_TOOLS:Tools Directory"
)

for dir_info in "${dirs[@]}"; do
    dir=$(echo $dir_info | cut -d: -f1)
    desc=$(echo $dir_info | cut -d: -f2)
    if [[ -d "$dir" ]]; then
        size=$(du -sh "$dir" 2>/dev/null | cut -f1)
        echo "  ✓ $desc: $dir ($size)"
    else
        echo "  ✗ $desc: $dir (missing)"
        ((missing++))
    fi
done

# Check permissions
echo
echo "Permissions Check:"
if [[ -w "$KOLIBRIOS_DEV_ROOT" ]]; then
    echo "  ✓ Write access to development root"
else
    echo "  ✗ No write access to development root"
    ((missing++))
fi

# Check 32-bit compilation
echo
echo "32-bit Compilation Check:"
if echo 'int main(){return 0;}' | gcc -m32 -x c - -o /tmp/test32 2>/dev/null; then
    echo "  ✓ 32-bit compilation working"
    rm -f /tmp/test32
else
    echo "  ✗ 32-bit compilation failed"
    ((missing++))
fi

# Summary
echo
if [[ ${missing:-0} -eq 0 ]]; then
    echo "✓ Environment verification completed successfully!"
    echo "Your KolibriOS development environment is ready."
else
    echo "✗ Environment verification found $missing issues."
    echo "Please resolve the issues above before continuing."
    exit 1
fi
EOF

chmod +x $KOLIBRIOS_TOOLS/verify-environment.sh
```

Run the verification to ensure everything is properly set up:
```bash
$KOLIBRIOS_TOOLS/verify-environment.sh
```

## Installing FASM - The Primary Assembler

FASM (Flat Assembler) is the cornerstone of KolibriOS development. It's a fast, efficient, and powerful assembler that supports both 16-bit and 32-bit x86 architectures. This section provides comprehensive installation, configuration, and optimization guidance for FASM across different platforms.

### Understanding FASM Architecture and Capabilities

**FASM Features:**
- **Single-pass assembler**: Extremely fast compilation
- **Macro system**: Powerful preprocessing capabilities  
- **Multiple output formats**: Binary, PE, ELF, COFF, MZ, and more
- **Memory management**: Efficient handling of large projects
- **Symbolic debugging**: Debug information generation
- **Cross-platform**: Linux, Windows, DOS, and other systems

**FASM Versions and Compatibility:**

| Version | Release | Key Features | KolibriOS Compatibility |
|---------|---------|--------------|------------------------|
| 1.73.31 | Latest | Enhanced macros, bug fixes | ✓ Recommended |
| 1.73.30 | Stable | Full feature set | ✓ Fully compatible |
| 1.73.29 | Legacy | Older macro system | ✓ Compatible |
| 1.72.x | Old | Basic features | ⚠ Limited compatibility |

### Installation Methods

#### Method 1: Package Manager Installation (Recommended for Beginners)

**Ubuntu/Debian Systems:**
```bash
# Update package database
sudo apt update

# Install FASM from repositories
sudo apt install fasm

# Verify installation and check version
fasm
which fasm
fasm --version 2>/dev/null || echo "FASM $(fasm 2>&1 | head -1 | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+')"

# Install FASM documentation and examples
sudo apt install fasm-doc
```

**Fedora/RHEL/CentOS Systems:**
```bash
# Enable EPEL repository if needed
sudo dnf install epel-release

# Install FASM
sudo dnf install fasm

# Alternative: Install from RPM Fusion
sudo dnf install fasm

# Verify installation
fasm
```

**openSUSE Systems:**
```bash
# Search for FASM package
zypper search fasm

# Install FASM
sudo zypper install fasm

# Verify installation
fasm
```

**Arch Linux Systems:**
```bash
# Install from official repositories
sudo pacman -S fasm

# Alternative: Install from AUR for latest version
yay -S fasm-git

# Verify installation
fasm
```

#### Method 2: Manual Installation from Source (Recommended for Advanced Users)

**Download and Compile Latest FASM:**
```bash
# Create installation directory
sudo mkdir -p /opt/fasm
cd /tmp

# Download latest FASM source
FASM_VERSION="1.73.31"
wget "https://flatassembler.net/fasm-${FASM_VERSION}.tgz"
tar -xzf "fasm-${FASM_VERSION}.tgz"
cd fasm

# Examine source structure
ls -la
cat README.TXT

# Compile FASM (self-hosting)
# FASM can compile itself
make
# OR manually:
# ./fasm.x64 fasm.asm fasm

# Install system-wide
sudo cp fasm /usr/local/bin/
sudo chmod +x /usr/local/bin/fasm

# Install documentation and examples
sudo mkdir -p /usr/local/share/fasm
sudo cp -r EXAMPLES/ /usr/local/share/fasm/examples/
sudo cp -r TOOLS/ /usr/local/share/fasm/tools/
sudo cp *.TXT /usr/local/share/fasm/

# Create symbolic links for easy access
sudo ln -sf /usr/local/share/fasm/examples /opt/fasm/examples
sudo ln -sf /usr/local/share/fasm/tools /opt/fasm/tools

# Verify installation
fasm
echo $?  # Should return 1 (normal for FASM without arguments)
```

**Alternative: Install in User Directory:**
```bash
# Install FASM in user's local bin
mkdir -p ~/.local/bin
cp fasm ~/.local/bin/

# Ensure ~/.local/bin is in PATH
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Verify installation
fasm
```

#### Method 3: Docker-based Installation

**Create FASM Development Container:**
```bash
# Create Dockerfile for FASM
cat > /tmp/Dockerfile.fasm << 'EOF'
FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    wget \
    tar \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install FASM from source
WORKDIR /tmp
RUN wget https://flatassembler.net/fasm-1.73.31.tgz && \
    tar -xzf fasm-1.73.31.tgz && \
    cd fasm && \
    make && \
    cp fasm /usr/local/bin/ && \
    mkdir -p /usr/local/share/fasm && \
    cp -r EXAMPLES/ /usr/local/share/fasm/examples/ && \
    cp -r TOOLS/ /usr/local/share/fasm/tools/

WORKDIR /workspace
ENTRYPOINT ["fasm"]
CMD ["--help"]
EOF

# Build FASM container
docker build -t fasm:latest -f /tmp/Dockerfile.fasm /tmp/

# Create wrapper script
cat > ~/.local/bin/fasm-docker << 'EOF'
#!/bin/bash
docker run --rm -v "$(pwd)":/workspace fasm:latest "$@"
EOF
chmod +x ~/.local/bin/fasm-docker

# Test container
fasm-docker
```

### Windows Installation (Comprehensive Guide)

#### Method 1: Native Windows Installation

**Direct Installation:**
```batch
@echo off
REM Download FASM for Windows
mkdir C:\Tools\FASM
cd C:\Tools\FASM

REM Download using PowerShell (Windows 10+)
powershell -Command "Invoke-WebRequest -Uri 'https://flatassembler.net/fasmw17331.zip' -OutFile 'fasm.zip'"

REM Extract using built-in Windows tools
powershell -Command "Expand-Archive -Path 'fasm.zip' -DestinationPath '.'"

REM Add to PATH permanently
setx PATH "%PATH%;C:\Tools\FASM" /M

REM Verify installation (restart cmd first)
fasm.exe
```

**Advanced Windows Setup:**
```batch
@echo off
REM Enhanced Windows FASM installation script

REM Create directories
mkdir C:\KolibriOS\Tools\FASM
mkdir C:\KolibriOS\Projects
mkdir C:\KolibriOS\Build

REM Set environment variables
setx FASM_PATH "C:\KolibriOS\Tools\FASM" /M
setx KOLIBRIOS_DEV "C:\KolibriOS" /M
setx PATH "%PATH%;%FASM_PATH%" /M

REM Download and install FASM
cd C:\KolibriOS\Tools\FASM
powershell -Command "& {
    $url = 'https://flatassembler.net/fasmw17331.zip'
    $output = 'fasm.zip'
    Write-Host 'Downloading FASM...'
    Invoke-WebRequest -Uri $url -OutFile $output
    Write-Host 'Extracting FASM...'
    Expand-Archive -Path $output -DestinationPath '.' -Force
    Write-Host 'Cleaning up...'
    Remove-Item $output
    Write-Host 'FASM installation completed!'
}"

REM Create batch files for development
echo @echo off > C:\KolibriOS\fasm-dev.bat
echo cd /d "%%KOLIBRIOS_DEV%%" >> C:\KolibriOS\fasm-dev.bat
echo cmd /k >> C:\KolibriOS\fasm-dev.bat

echo Installation completed! Restart your command prompt.
pause
```

#### Method 2: WSL2 Installation (Recommended)

**Install FASM in WSL2:**
```bash
# Install in WSL2 Ubuntu (same as Linux installation)
sudo apt update
sudo apt install fasm

# Create Windows-WSL bridge script
cat > /mnt/c/Tools/fasm-wsl.bat << 'EOF'
@echo off
wsl fasm %*
EOF

# Add to Windows PATH
# Add C:\Tools to PATH in Windows System Properties
```

### macOS Installation (Experimental)

**Using Homebrew:**
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Try to install FASM (may not be available)
brew search fasm
brew install fasm  # If available

# Alternative: Manual installation
cd /tmp
curl -O https://flatassembler.net/fasm-1.73.31.tgz
tar -xzf fasm-1.73.31.tgz
cd fasm

# Compile (may require modifications for macOS)
make
cp fasm /usr/local/bin/

# Verify installation
fasm
```

### FASM Configuration and Optimization

#### Memory Configuration

**Increase FASM Memory Limits:**
```bash
# Create FASM configuration script
cat > ~/.local/bin/fasm-config << 'EOF'
#!/bin/bash
# FASM with optimized settings for large projects

# Memory settings
MEMORY_LIMIT=134217728  # 128MB
PASSES=16              # Maximum passes
RECURSION_LIMIT=10000  # Macro recursion limit

# Execute FASM with optimized parameters
exec fasm -m $MEMORY_LIMIT -p $PASSES -r $RECURSION_LIMIT "$@"
EOF

chmod +x ~/.local/bin/fasm-config

# Create alias for optimized FASM
echo "alias fasm-opt='fasm-config'" >> ~/.bashrc
source ~/.bashrc
```

#### FASM Environment Variables

**Set FASM-specific Environment:**
```bash
# Add to ~/.bashrc
export FASM_MEMORY=134217728    # 128MB memory limit
export FASM_PASSES=16           # Maximum compilation passes
export FASM_RECURSION=10000     # Macro recursion limit
export FASM_TEMP_DIR=/tmp/fasm  # Temporary files directory

# Create temp directory
mkdir -p $FASM_TEMP_DIR

# FASM wrapper function with environment
fasm_env() {
    local mem=${FASM_MEMORY:-67108864}
    local passes=${FASM_PASSES:-16}
    local recursion=${FASM_RECURSION:-1000}
    
    fasm -m $mem -p $passes -r $recursion "$@"
}

# Add to aliases
alias fasm='fasm_env'
```

### Advanced FASM Features and Usage

#### Debugging Support

**Enable Debug Information:**
```bash
# Create debug-enabled FASM wrapper
cat > ~/.local/bin/fasm-debug << 'EOF'
#!/bin/bash
# FASM with debug information generation

# Default debug options
DEBUG_FORMAT="dwarf"  # or "stabs", "coff"
OUTPUT_DEBUG=1

# Parse arguments to detect output format
for arg in "$@"; do
    case $arg in
        *.exe|*.dll) DEBUG_FORMAT="coff" ;;
        *.elf|*.o) DEBUG_FORMAT="dwarf" ;;
        *) ;;
    esac
done

# Add debug flags
exec fasm -g "$@"
EOF

chmod +x ~/.local/bin/fasm-debug
```

#### Profile-Guided Optimization

**Performance Profiling Setup:**
```bash
# Create FASM performance profiler
cat > ~/.local/bin/fasm-profile << 'EOF'
#!/bin/bash
# FASM with performance profiling

PROFILE_FILE="fasm-profile-$(date +%Y%m%d-%H%M%S).log"

echo "=== FASM Performance Profile ===" > $PROFILE_FILE
echo "Date: $(date)" >> $PROFILE_FILE
echo "Command: fasm $*" >> $PROFILE_FILE
echo "Working Directory: $(pwd)" >> $PROFILE_FILE
echo >> $PROFILE_FILE

# Measure compilation time and memory usage
/usr/bin/time -v fasm "$@" 2>&1 | tee -a $PROFILE_FILE

echo >> $PROFILE_FILE
echo "Profile saved to: $PROFILE_FILE"
EOF

chmod +x ~/.local/bin/fasm-profile
```

### Integration with Development Tools

#### IDE Integration

**Visual Studio Code Configuration:**
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "FASM Build",
            "type": "node",
            "request": "launch",
            "program": "${workspaceFolder}/build.js",
            "console": "integratedTerminal",
            "args": ["${file}"]
        }
    ],
    "tasks": [
        {
            "label": "FASM Compile",
            "type": "shell",
            "command": "fasm",
            "args": ["${file}", "${fileDirname}/${fileBasenameNoExtension}"],
            "group": {
                "kind": "build",
                "isDefault": true
            },
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared"
            },
            "problemMatcher": {
                "owner": "fasm",
                "fileLocation": "absolute",
                "pattern": {
                    "regexp": "^(.*)\\(([0-9]+)\\)\\s*:\\s*(error|warning)\\s*:\\s*(.*)$",
                    "file": 1,
                    "line": 2,
                    "severity": 3,
                    "message": 4
                }
            }
        }
    ]
}
```

**Vim/Neovim Configuration:**
```vim
" FASM syntax highlighting and compilation
autocmd BufNewFile,BufRead *.asm set filetype=fasm
autocmd BufNewFile,BufRead *.inc set filetype=fasm

" FASM compilation mapping
autocmd FileType fasm nnoremap <buffer> <F9> :!fasm % %:r<CR>
autocmd FileType fasm nnoremap <buffer> <F10> :!fasm -g % %:r<CR>

" FASM error format
set errorformat+=%.%#%f(%l)\ :\ %m
```

#### Make Integration

**Makefile Templates:**
```makefile
# FASM Makefile template
FASM = fasm
FASMFLAGS = -m 67108864

# Source and output directories
SRCDIR = src
BUILDDIR = build
SOURCES = $(wildcard $(SRCDIR)/*.asm)
OBJECTS = $(SOURCES:$(SRCDIR)/%.asm=$(BUILDDIR)/%)

# Default target
all: $(OBJECTS)

# Pattern rule for FASM compilation
$(BUILDDIR)/%: $(SRCDIR)/%.asm | $(BUILDDIR)
	$(FASM) $(FASMFLAGS) $< $@

# Create build directory
$(BUILDDIR):
	mkdir -p $(BUILDDIR)

# Debug build
debug: FASMFLAGS += -g
debug: $(OBJECTS)

# Clean build artifacts
clean:
	rm -rf $(BUILDDIR)

# Profile build performance
profile:
	time -v $(MAKE) all

# Install targets
install: all
	cp $(BUILDDIR)/* /usr/local/bin/

.PHONY: all debug clean profile install
```

### Testing FASM Installation

#### Comprehensive Test Suite

**Basic Functionality Test:**
```assembly
; test-basic.asm - Basic FASM functionality test
format binary
org 0x7c00

; Boot sector signature test
times 510-($-$$) db 0
dw 0xaa55
```

**Advanced Features Test:**
```assembly
; test-advanced.asm - Advanced FASM features test
format PE console
entry start

include 'win32a.inc'

; Macro definition test
macro print_string string {
    push string
    call [printf]
    add esp, 4
}

section '.text' code readable executable
start:
    ; Test basic instructions
    mov eax, 42h
    mov ebx, eax
    add eax, ebx
    
    ; Test macro usage
    print_string hello_msg
    print_string result_msg
    
    ; Test conditional assembly
    if DEBUGGING = 1
        print_string debug_msg
    end if
    
    ; Exit
    push 0
    call [ExitProcess]

section '.data' data readable
    hello_msg db 'FASM Advanced Test', 0Ah, 0
    result_msg db 'All tests passed!', 0Ah, 0
    
    if DEBUGGING = 1
        debug_msg db 'Debug mode enabled', 0Ah, 0
    end if

section '.idata' import data readable
    library kernel32,'KERNEL32.DLL',\
            msvcrt,'MSVCRT.DLL'
    
    import kernel32,\
           ExitProcess,'ExitProcess'
    
    import msvcrt,\
           printf,'printf'
```

**Performance Benchmark Test:**
```assembly
; test-performance.asm - FASM performance benchmark
format binary

; Generate large amounts of code to test compiler performance
repeat 10000
    mov eax, %
    mov ebx, eax
    add eax, ebx
    mul ebx
end repeat

; Test macro expansion performance
macro generate_code count {
    repeat count
        nop
        mov eax, %
    end repeat
}

generate_code 50000
```

**Compilation Test Script:**
```bash
#!/bin/bash
# FASM comprehensive test script

echo "=== FASM Installation Test Suite ==="
echo

# Test basic FASM functionality
echo "1. Testing basic FASM functionality..."
cat > test-basic.asm << 'EOF'
format binary
org 0x7c00
times 510-($-$$) db 0
dw 0xaa55
EOF

if fasm test-basic.asm test-basic.bin; then
    echo "   ✓ Basic compilation successful"
    if [[ -f test-basic.bin && $(stat -f%z test-basic.bin 2>/dev/null || stat -c%s test-basic.bin) -eq 512 ]]; then
        echo "   ✓ Output file size correct (512 bytes)"
    else
        echo "   ✗ Output file size incorrect"
    fi
else
    echo "   ✗ Basic compilation failed"
fi

# Test error handling
echo
echo "2. Testing error handling..."
cat > test-error.asm << 'EOF'
format binary
invalid_instruction_test
EOF

if ! fasm test-error.asm test-error.bin 2>/dev/null; then
    echo "   ✓ Error handling works correctly"
else
    echo "   ✗ Error handling not working"
fi

# Test macro system
echo
echo "3. Testing macro system..."
cat > test-macro.asm << 'EOF'
format binary

macro test_macro value {
    db value
}

test_macro 0x42
test_macro 0x43
EOF

if fasm test-macro.asm test-macro.bin; then
    echo "   ✓ Macro compilation successful"
else
    echo "   ✗ Macro compilation failed"
fi

# Test memory limits
echo
echo "4. Testing memory limits..."
if fasm -m 1048576 test-basic.asm test-memory.bin; then
    echo "   ✓ Memory limit parameter works"
else
    echo "   ✗ Memory limit parameter failed"
fi

# Performance test
echo
echo "5. Testing compilation performance..."
cat > test-performance.asm << 'EOF'
format binary
repeat 1000
    mov eax, %
    nop
end repeat
EOF

time_output=$(time fasm test-performance.asm test-performance.bin 2>&1)
if [[ $? -eq 0 ]]; then
    echo "   ✓ Performance test completed"
    echo "   Compilation time: $(echo "$time_output" | grep real | awk '{print $2}')"
else
    echo "   ✗ Performance test failed"
fi

# Clean up test files
rm -f test-*.asm test-*.bin

echo
echo "=== FASM Test Suite Completed ==="
```

**Run the test suite:**
```bash
chmod +x test-fasm.sh
./test-fasm.sh
```

### Troubleshooting Common FASM Issues

#### Installation Issues

**"fasm: command not found"**
```bash
# Check if FASM is installed
which fasm
ls -la /usr/local/bin/fasm
ls -la /usr/bin/fasm

# Check PATH
echo $PATH | grep -E "(local/bin|usr/bin)"

# Reinstall if necessary
sudo apt reinstall fasm
# OR
sudo cp /path/to/fasm /usr/local/bin/
sudo chmod +x /usr/local/bin/fasm
```

**Permission Denied Errors**
```bash
# Fix permissions
sudo chmod +x /usr/local/bin/fasm
sudo chown root:root /usr/local/bin/fasm

# Check file permissions
ls -la $(which fasm)
```

#### Compilation Issues

**"Not enough memory" Error**
```bash
# Increase memory limit
fasm -m 134217728 source.asm output.bin

# Check available memory
free -h
ulimit -v
```

**"Too many passes" Error**
```bash
# Increase passes limit
fasm -p 32 source.asm output.bin

# Check for circular dependencies in macros
```

**"Recursion limit exceeded" Error**
```bash
# Increase recursion limit
fasm -r 10000 source.asm output.bin

# Review macro definitions for infinite recursion
```

#### Platform-Specific Issues

**Linux 64-bit Issues**
```bash
# Install 32-bit libraries if needed
sudo apt install libc6-dev-i386 lib32stdc++6

# Check architecture compatibility
file $(which fasm)
```

**Windows PATH Issues**
```batch
REM Check PATH
echo %PATH%

REM Add FASM to PATH permanently
setx PATH "%PATH%;C:\Tools\FASM" /M

REM Restart command prompt
```

### FASM Updates and Maintenance

#### Update Checking Script
```bash
#!/bin/bash
# Check for FASM updates

CURRENT_VERSION=$(fasm 2>&1 | head -1 | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+' | head -1)
echo "Current FASM version: $CURRENT_VERSION"

# Check online for latest version (requires curl/wget)
LATEST_VERSION=$(curl -s https://flatassembler.net/download.php | grep -o 'fasm-[0-9]\+\.[0-9]\+\.[0-9]\+' | head -1 | cut -d'-' -f2)
echo "Latest FASM version: $LATEST_VERSION"

if [[ "$CURRENT_VERSION" != "$LATEST_VERSION" ]]; then
    echo "Update available: $CURRENT_VERSION -> $LATEST_VERSION"
    echo "Download from: https://flatassembler.net/fasm-${LATEST_VERSION}.tgz"
else
    echo "FASM is up to date"
fi
```

#### Automated Update Script
```bash
#!/bin/bash
# Automated FASM update script

set -e

BACKUP_DIR="/opt/fasm/backup/$(date +%Y%m%d)"
INSTALL_DIR="/usr/local/bin"

echo "Creating backup..."
mkdir -p "$BACKUP_DIR"
cp "$INSTALL_DIR/fasm" "$BACKUP_DIR/fasm.backup"

echo "Downloading latest FASM..."
cd /tmp
wget https://flatassembler.net/fasm-1.73.31.tgz
tar -xzf fasm-1.73.31.tgz

echo "Installing new version..."
cd fasm
make
sudo cp fasm "$INSTALL_DIR/fasm"
sudo chmod +x "$INSTALL_DIR/fasm"

echo "Verifying installation..."
if fasm >/dev/null 2>&1; then
    echo "✓ FASM update successful"
    echo "New version: $(fasm 2>&1 | head -1 | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+')"
else
    echo "✗ Update failed, restoring backup..."
    sudo cp "$BACKUP_DIR/fasm.backup" "$INSTALL_DIR/fasm"
    exit 1
fi

# Cleanup
rm -rf /tmp/fasm*
echo "Update completed successfully"
```

This comprehensive FASM installation guide provides everything needed to get FASM running optimally on any development system. The next section will cover GCC toolchain setup with similar depth and detail.

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