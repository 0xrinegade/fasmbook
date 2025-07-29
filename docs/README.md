# KolibriOS Documentation Index

This directory contains comprehensive documentation for KolibriOS development, including project overview, codebase mapping, and detailed tutorials for developers.

## Quick Start

If you're new to KolibriOS development, start with these essential documents:

1. **[llms.txt](../llms.txt)** - Complete project overview and architecture
2. **[treesitter-map.md](../treesitter-map.md)** - Codebase structure and file organization
3. **[Development Environment Setup](development-tutorials/01-development-environment-setup.md)** - Set up your development tools

## Documentation Overview

### Project Information
- **[llms.txt](../llms.txt)** - Comprehensive project description for LLMs and developers
  - Project architecture and philosophy
  - Directory structure and organization
  - Programming languages and technologies
  - System call interface overview
  - Community resources and contribution guidelines

- **[treesitter-map.md](../treesitter-map.md)** - Detailed codebase mapping
  - Language identification patterns
  - Directory structure with file type annotations
  - IDE and development tool integration guide
  - Build system configuration
  - Syntax highlighting and language server setup

## Development Tutorials

### 1. [Development Environment Setup](development-tutorials/01-development-environment-setup.md)
**Prerequisites for KolibriOS development**
- Installing FASM assembler
- Setting up GCC toolchain
- Configuring Tup build system
- IDE configuration and setup
- Testing and verification

**Key Topics:**
- Cross-platform setup (Linux/Windows)
- Toolchain installation and configuration
- Build system integration
- Development workflow setup
- Troubleshooting common issues

### 2. [Building Your First KolibriOS Program](development-tutorials/02-building-your-first-program.md)
**Creating your first KolibriOS applications**
- Understanding program structure
- System call interface basics
- Console and GUI application development
- Event-driven programming model
- Common programming patterns

**Key Topics:**
- Hello World console application
- GUI window creation and management
- Event handling and user input
- Graphics and text rendering
- File I/O operations
- Memory management basics

### 3. [Understanding KolibriOS System Calls and APIs](development-tutorials/03-understanding-system-calls.md)
**Deep dive into the KolibriOS system interface**
- System call architecture and conventions
- Window and graphics functions
- File system operations
- Memory management APIs
- Process and thread control
- Network programming interfaces

**Key Topics:**
- Complete system call reference
- Parameter encoding and conventions
- Error handling and return values
- Advanced API usage patterns
- Performance considerations
- Best practices and common pitfalls

### 4. [Driver Development Basics](development-tutorials/04-driver-development-basics.md)
**Creating device drivers for KolibriOS**
- Driver architecture and PE DLL format
- Hardware detection and initialization
- Interrupt handling and service routines
- PCI device access and memory mapping
- Driver debugging and testing
- Installation and deployment

**Key Topics:**
- Driver template analysis
- Hardware abstraction layer
- Service procedure implementation
- Multi-device support
- Power management
- Resource cleanup and error handling

### 5. [Contributing to KolibriOS: Workflow and Best Practices](development-tutorials/05-contributing-workflow.md)
**Professional contribution workflow**
- Community guidelines and communication
- Git workflow and branch management
- Code quality standards and review process
- Testing methodologies and requirements
- Pull request submission and review
- Long-term contribution strategy

**Key Topics:**
- Setting up contribution environment
- Finding and choosing issues to work on
- Code style and documentation standards
- Comprehensive testing strategies
- Effective communication with maintainers
- Building expertise and community relationships

## Learning Paths

### Beginner Path
For those new to systems programming or KolibriOS specifically:

1. **Start Here**: Read [llms.txt](../llms.txt) for project overview
2. **Setup**: Follow [Development Environment Setup](development-tutorials/01-development-environment-setup.md)
3. **First Steps**: Complete [Building Your First Program](development-tutorials/02-building-your-first-program.md)
4. **Learn APIs**: Study [Understanding System Calls](development-tutorials/03-understanding-system-calls.md)
5. **Contribute**: Follow [Contributing Workflow](development-tutorials/05-contributing-workflow.md)

### Advanced Path
For experienced developers ready for complex contributions:

1. **Architecture**: Study [treesitter-map.md](../treesitter-map.md) for detailed structure
2. **System Programming**: Deep dive into [System Calls and APIs](development-tutorials/03-understanding-system-calls.md)
3. **Driver Development**: Master [Driver Development Basics](development-tutorials/04-driver-development-basics.md)
4. **Kernel Development**: Study kernel source code and documentation
5. **Leadership**: Follow advanced sections in [Contributing Workflow](development-tutorials/05-contributing-workflow.md)

### Specific Interest Areas

#### Application Development
- [Building Your First Program](development-tutorials/02-building-your-first-program.md)
- [Understanding System Calls](development-tutorials/03-understanding-system-calls.md) (Focus on GUI and file operations)
- Study existing applications in `programs/` directory

#### System-Level Programming
- [Understanding System Calls](development-tutorials/03-understanding-system-calls.md) (Focus on memory and process management)
- [Driver Development Basics](development-tutorials/04-driver-development-basics.md)
- Study kernel source code in `kernel/trunk/`

#### Documentation and Community
- All tutorials contain documentation best practices
- [Contributing Workflow](development-tutorials/05-contributing-workflow.md) (Focus on documentation contributions)
- Study existing documentation in `data/*/docs/`

## Additional Resources

### Official Documentation
- **[build.txt](../build.txt)** - Comprehensive build instructions and toolchain setup
- **[CONTRIBUTING.md](../CONTRIBUTING.md)** - Official contribution guidelines
- **[README.md](../README.md)** - Project overview and getting started

### Source Code Documentation
- **kernel/trunk/docs/** - Kernel API documentation
  - `sysfuncs.txt` - Complete system function reference
  - `drivers_api.txt` - Driver development API
  - `events_subsystem.txt` - Event system documentation
- **programs/develop/libraries/** - Library documentation
- **Individual program docs** - Many programs include their own documentation

### Community Resources
- **Forum**: http://board.kolibrios.org/ - Community discussions and support
- **Main Repository**: https://git.kolibrios.org/KolibriOS/kolibrios
- **GitHub Mirror**: https://github.com/KolibriOS/kolibrios
- **Automated Builds**: http://builds.kolibrios.org/

## How to Use This Documentation

### For New Developers
1. **Read the overview** ([llms.txt](../llms.txt)) to understand the project
2. **Set up your environment** following the setup tutorial
3. **Complete the tutorials in order** - they build upon each other
4. **Practice with examples** from the programs directory
5. **Join the community** and ask questions

### For Experienced Developers
1. **Scan the treesitter map** to understand the codebase structure
2. **Focus on specific areas** relevant to your interests
3. **Study existing implementations** for patterns and best practices
4. **Review the contribution workflow** for project-specific practices
5. **Start contributing** with documentation or simple fixes

### For Project Maintainers
1. **Use this documentation** as a reference for onboarding new contributors
2. **Keep tutorials updated** as the project evolves
3. **Reference these guides** when reviewing contributions
4. **Encourage community members** to improve and expand the documentation

## Contributing to Documentation

This documentation is a community effort. To improve it:

1. **Report Issues**: If you find errors or outdated information
2. **Suggest Improvements**: Identify areas that need more detail
3. **Add Examples**: Provide practical examples and use cases
4. **Update Content**: Keep information current with project changes
5. **Translate**: Help make documentation available in other languages

### Documentation Standards
- **Clarity**: Write for developers at all skill levels
- **Accuracy**: Verify all code examples and instructions
- **Completeness**: Cover both common and edge cases
- **Currency**: Keep information up-to-date with latest developments
- **Consistency**: Follow established formatting and style conventions

## Getting Help

If you need assistance while using this documentation:

1. **Check existing resources** - many questions are already answered
2. **Search the forum** for similar questions and solutions
3. **Ask specific questions** with context about what you're trying to achieve
4. **Provide details** about your environment and what you've tried
5. **Be patient** - community members are volunteers

---

This documentation represents the collective knowledge and experience of the KolibriOS community. It's designed to help you become a productive contributor to this unique and fascinating operating system project.

**Last Updated**: January 2024
**Contributors**: KolibriOS Community
**License**: GNU General Public License v2.0