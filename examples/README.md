# FASM Examples

This directory contains example FASM programs that demonstrate various concepts from the FASM Programming eBook.

## Files

- `hello_world.asm` - Basic Windows console application
- `counter_loop.asm` - Demonstrates loops and memory operations  
- `hello_linux.asm` - Basic Linux executable using system calls

## Compilation Instructions

### Windows (using FASM)
```bash
fasm hello_world.asm
fasm counter_loop.asm
```

### Linux (using FASM)
```bash
fasm hello_linux.asm
```

## GitHub Actions

The `.github/workflows/fasm-compile-test.yml` workflow automatically:

1. **Downloads and installs FASM** on both Windows and Linux runners
2. **Extracts code examples** from the eBook chapters automatically
3. **Compiles all FASM code** found in the documentation
4. **Tests execution** of compiled programs
5. **Validates syntax** of code examples in the eBook
6. **Provides detailed reports** on compilation success rates

The workflow runs on:
- Push to main/master branches
- Pull requests
- Manual trigger via workflow_dispatch
- Changes to FASM eBook content or examples

## Features

✅ **Cross-platform compilation** (Windows & Linux)  
✅ **Automatic code extraction** from markdown documentation  
✅ **Comprehensive error reporting** with detailed logs  
✅ **Artifact preservation** for downloaded compiled examples  
✅ **Performance testing** with timeout protection  
✅ **Content validation** ensuring eBook code quality  

This ensures that all FASM code examples in the eBook remain compilable and functional as the documentation evolves.