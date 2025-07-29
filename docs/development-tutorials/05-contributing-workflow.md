# Contributing to KolibriOS: Workflow and Best Practices

This tutorial covers the complete workflow for contributing to the KolibriOS project, from setting up your development environment to submitting high-quality pull requests that get accepted by the community.

## Table of Contents

1. [Understanding the KolibriOS Community](#understanding-the-kolibrios-community)
2. [Setting Up Your Contribution Environment](#setting-up-your-contribution-environment)
3. [Finding Issues to Work On](#finding-issues-to-work-on)
4. [Development Workflow](#development-workflow)
5. [Code Quality Standards](#code-quality-standards)
6. [Testing Your Changes](#testing-your-changes)
7. [Submitting Pull Requests](#submitting-pull-requests)
8. [Code Review Process](#code-review-process)
9. [Community Guidelines](#community-guidelines)
10. [Long-term Contribution Strategy](#long-term-contribution-strategy)

## Understanding the KolibriOS Community

### Project Values
- **Performance**: Assembly-first approach for maximum efficiency
- **Simplicity**: Clean, understandable code over complex abstractions
- **Compatibility**: Maintain backward compatibility with existing software
- **Quality**: Thorough testing and code review before integration
- **Community**: Collaborative development with respectful communication

### Key Community Resources
- **Main Repository**: https://git.kolibrios.org/KolibriOS/kolibrios
- **GitHub Mirror**: https://github.com/KolibriOS/kolibrios
- **Forum**: http://board.kolibrios.org/
- **IRC**: #kolibrios (various networks)
- **Wiki**: Community documentation and guides

### Communication Languages
- **Primary**: English for international collaboration
- **Secondary**: Russian (many core developers are Russian speakers)
- **Code Comments**: English preferred for new contributions

## Setting Up Your Contribution Environment

### 1. Fork and Clone the Repository

```bash
# Fork the repository on GitHub/GitLab
# Then clone your fork
git clone https://github.com/yourusername/kolibrios.git
cd kolibrios

# Add upstream remote
git remote add upstream https://git.kolibrios.org/KolibriOS/kolibrios.git
# or
git remote add upstream https://github.com/KolibriOS/kolibrios.git

# Verify remotes
git remote -v
```

### 2. Set Up Development Tools

Follow the [Development Environment Setup](01-development-environment-setup.md) tutorial to install:
- FASM assembler
- KolibriOS GCC toolchain
- Tup build system
- Testing environment (QEMU/VirtualBox)

### 3. Configure Git for KolibriOS

```bash
# Set up your identity
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Configure line endings (important for cross-platform)
git config core.autocrlf input

# Set up useful aliases
git config alias.co checkout
git config alias.br branch
git config alias.ci commit
git config alias.st status
```

### 4. Understand the Build System

```bash
# Initialize Tup in repository root
tup init

# Copy and configure build settings
cp tup.config.template tup.config

# Edit tup.config to match your environment
# Enable/disable compilers based on what you have installed
echo "CONFIG_NO_NASM=full" >> tup.config      # If you don't have NASM
echo "CONFIG_NO_CMM=full" >> tup.config       # If you don't have c--
echo "CONFIG_LANG=en" >> tup.config           # Set interface language
```

## Finding Issues to Work On

### 1. Issue Sources

**Official Issue Tracker**
- https://git.kolibrios.org/KolibriOS/kolibrios/issues
- Look for labels like "good first issue", "bug", "enhancement"

**Forum Discussions**
- http://board.kolibrios.org/
- User-reported problems and feature requests
- Development discussions

**Code Analysis**
- Find TODO comments in source code
- Look for FIXME markers
- Identify outdated or inefficient code patterns

### 2. Types of Contributions

**Bug Fixes**
- System crashes or incorrect behavior
- Memory leaks or resource management issues
- Compatibility problems with hardware/software

**Feature Additions**
- New applications or utilities
- Enhanced existing functionality
- Hardware driver support

**Documentation**
- Code documentation and comments
- User guides and tutorials
- API documentation

**Performance Improvements**
- Algorithm optimizations
- Memory usage reduction
- Boot time improvements

### 3. Choosing Your First Contribution

**Good First Issues:**
- Documentation improvements
- Simple bug fixes in applications
- Adding missing features to existing programs
- Code cleanup and style improvements

**Avoid as First Contributions:**
- Kernel modifications
- Critical system components
- Complex architectural changes
- Driver development (unless experienced)

## Development Workflow

### 1. Create a Feature Branch

```bash
# Always start from latest upstream
git checkout main
git pull upstream main

# Create and switch to feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-description
```

### 2. Branch Naming Conventions

```bash
# Feature branches
feature/add-calculator-app
feature/improve-file-manager
feature/network-diagnostics

# Bug fix branches  
fix/window-resize-crash
fix/memory-leak-in-editor
fix/usb-driver-detection

# Documentation branches
docs/api-reference
docs/build-instructions
docs/driver-development
```

### 3. Development Cycle

```bash
# Make your changes
# ... edit files ...

# Test your changes frequently
tup                          # Build affected components
# ... test in KolibriOS ...

# Commit logical units of work
git add specific-files       # Don't use 'git add .'
git commit -m "Descriptive commit message"

# Push to your fork regularly
git push origin feature/your-feature-name
```

### 4. Keeping Your Branch Updated

```bash
# Regularly sync with upstream
git fetch upstream
git rebase upstream/main

# Or merge if rebase is problematic
git merge upstream/main

# Push updated branch
git push origin feature/your-feature-name --force-with-lease
```

## Code Quality Standards

### 1. Assembly Code Standards

**File Headers**
```assembly
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;                                                              ;;
;; Copyright (C) KolibriOS team 2004-2024. All rights reserved. ;;
;; Distributed under terms of the GNU General Public License    ;;
;;                                                              ;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

; Program name and description
; Author: Your Name
; Date: Current date
```

**Code Formatting**
```assembly
; Use consistent indentation (4 spaces or 1 tab)
start:
    mov     eax, 10
    int     0x40
    
    cmp     eax, 1
    je      redraw_event
    cmp     eax, 2
    je      key_event
    cmp     eax, 3
    je      button_event
    
    jmp     event_loop

; Align data properly
align 4
window_title    db 'My Application', 0
buffer          times 1024 db 0
```

**Comments**
```assembly
; Explain what the code does, not how
; Good:
    ; Calculate window center position
    mov     eax, [screen_width]
    sub     eax, WINDOW_WIDTH
    shr     eax, 1
    mov     [window_x], eax

; Bad:
    ; Move screen width to eax and subtract window width
    mov     eax, [screen_width]
    sub     eax, WINDOW_WIDTH
```

### 2. C Code Standards

**Function Documentation**
```c
/**
 * Calculate the square root of a number using Newton's method
 * @param value The input value (must be >= 0)
 * @return Square root of the input value, or -1 on error
 */
double sqrt_newton(double value) {
    if (value < 0) return -1;
    
    // Implementation...
}
```

**Error Handling**
```c
// Always check return values
FILE *fp = fopen(filename, "r");
if (!fp) {
    printf("Error: Cannot open file %s\n", filename);
    return ERROR_FILE_NOT_FOUND;
}

// Use meaningful error codes
#define ERROR_SUCCESS           0
#define ERROR_INVALID_PARAMETER -1
#define ERROR_OUT_OF_MEMORY     -2
#define ERROR_FILE_NOT_FOUND    -3
```

### 3. General Standards

**File Organization**
```
program/
├── main.asm              # Main program file
├── ui.asm               # User interface code
├── logic.asm            # Business logic
├── data.asm             # Data definitions
├── Tupfile.lua          # Build configuration
└── readme.txt           # Program documentation
```

**Memory Management**
```assembly
; Always check allocation success
mov     eax, 68
mov     ebx, 12
mov     ecx, buffer_size
int     0x40
test    eax, eax
jz      allocation_failed
mov     [buffer_ptr], eax

; Always free allocated memory
cmp     [buffer_ptr], 0
je      .no_buffer
mov     eax, 68
mov     ebx, 13
mov     ecx, [buffer_ptr]
int     0x40
mov     [buffer_ptr], 0
.no_buffer:
```

## Testing Your Changes

### 1. Build Testing

```bash
# Test that your changes build correctly
tup                              # Build changed components

# Test different build configurations
echo "CONFIG_LANG=ru" > tup.config
tup                              # Test Russian language build

echo "CONFIG_LANG=en" > tup.config
echo "CONFIG_KPACK_CMD=&& kpack %o" >> tup.config
tup                              # Test with compression
```

### 2. Functional Testing

**Create Test Cases**
```assembly
; test_calculator.asm - Test cases for calculator application
include 'testing_framework.inc'

test_addition:
    ; Test: 2 + 3 = 5
    call    calculator_add
    mov     ebx, 2
    mov     ecx, 3
    call    add_numbers
    cmp     eax, 5
    je      .test_passed
    call    test_failed
    ret
.test_passed:
    call    test_passed
    ret
```

**Manual Testing Checklist**
- [ ] Program starts without errors
- [ ] All menu items work correctly
- [ ] Keyboard shortcuts function properly
- [ ] Mouse interactions behave as expected
- [ ] Program exits cleanly
- [ ] No memory leaks or crashes
- [ ] Error conditions handled gracefully

### 3. Regression Testing

```bash
# Test that existing functionality still works
# Run a set of existing programs to ensure compatibility

# Test core system functions
./test_basic_functions.sh

# Test your changes don't break existing programs
./test_compatibility.sh
```

### 4. Testing Environment

**Virtual Machine Testing**
```bash
# Use QEMU for quick testing
qemu-system-i386 -hda kolibri.img -m 128

# Copy your program to the image
mcopy -i kolibri.img your_program ::your_program

# Boot and test
```

**Real Hardware Testing**
- Test on different hardware configurations when possible
- Verify compatibility with various graphics cards
- Test USB and other hardware features if relevant

## Submitting Pull Requests

### 1. Pre-submission Checklist

- [ ] Code follows KolibriOS style guidelines
- [ ] All changes are tested and working
- [ ] Commit messages are descriptive and follow conventions
- [ ] No unrelated changes included
- [ ] Documentation updated if necessary
- [ ] Build system updated if new files added

### 2. Commit Message Format

```
component: Short description of the change

Longer explanation of what this change does and why it was
necessary. Include any relevant issue numbers.

Fixes #123
```

**Examples:**
```
calc: Add support for scientific notation

The calculator now supports entering and displaying numbers
in scientific notation (e.g., 1.23e-4). This makes it more
useful for scientific calculations.

Fixes #456

programs/games: Fix memory leak in tetris

The game was not properly freeing the game board memory
when exiting, causing a memory leak. Added proper cleanup
in the exit handler.

kernel/gui: Improve window resize performance

Optimized the window resize algorithm to reduce flickering
and improve responsiveness during resize operations.
```

### 3. Creating the Pull Request

```bash
# Ensure your branch is up to date
git fetch upstream
git rebase upstream/main

# Push your changes
git push origin feature/your-feature-name

# Create pull request through web interface
# Include detailed description of changes
```

### 4. Pull Request Description Template

```markdown
## Description
Brief description of what this PR does.

## Changes Made
- List of specific changes
- Another change
- Third change

## Testing
- [ ] Tested on QEMU
- [ ] Tested on real hardware (specify which)
- [ ] All existing functionality still works
- [ ] New functionality works as expected

## Screenshots (if applicable)
[Include screenshots of GUI changes]

## Related Issues
Fixes #123
Related to #456

## Additional Notes
Any additional information reviewers should know.
```

## Code Review Process

### 1. Understanding Review Feedback

**Common Review Comments:**
- **Style issues**: Code formatting, naming conventions
- **Logic problems**: Potential bugs or edge cases
- **Performance concerns**: Inefficient algorithms or memory usage
- **Architecture issues**: Better ways to structure the code
- **Missing error handling**: Need for additional safety checks

### 2. Responding to Reviews

**Positive Response:**
```markdown
Thank you for the review! I'll address these issues:

1. Fixed the indentation in lines 45-50
2. Added error checking for the memory allocation
3. Renamed the variable to be more descriptive

I'll push the updates shortly.
```

**Asking for Clarification:**
```markdown
Could you clarify what you mean by "improve the error handling"? 
Are you referring to:
1. Adding more specific error codes?
2. Better user error messages?
3. Additional validation of input parameters?

I want to make sure I address this correctly.
```

### 3. Making Requested Changes

```bash
# Make the requested changes
# ... edit files ...

# Commit with descriptive message
git commit -m "Address review feedback: improve error handling"

# Push updates
git push origin feature/your-feature-name
```

### 4. Review Iterations

Be prepared for multiple rounds of review:
1. Initial submission
2. Address first round of feedback
3. Address any remaining issues
4. Final approval and merge

## Community Guidelines

### 1. Communication Principles

**Be Respectful**
- Treat all community members with respect
- Avoid personal attacks or inflammatory language
- Focus on the code and technical issues

**Be Constructive**
- Provide specific, actionable feedback
- Suggest improvements rather than just pointing out problems
- Help newcomers learn the codebase

**Be Patient**
- Reviews take time, especially for complex changes
- Core developers are volunteers with limited time
- Multiple iterations are normal and expected

### 2. Working with Maintainers

**Understanding Roles**
- **Core Maintainers**: Have final say on architectural decisions
- **Component Maintainers**: Experts in specific areas (kernel, drivers, etc.)
- **Regular Contributors**: Experienced community members who help review

**Building Relationships**
- Participate in community discussions
- Help review other people's contributions
- Share knowledge and help newcomers
- Be consistent and reliable in your contributions

### 3. Conflict Resolution

If you disagree with review feedback:
1. **Understand the concern**: Ask for clarification
2. **Provide rationale**: Explain your approach with technical reasons
3. **Seek compromise**: Find a solution that addresses both concerns
4. **Escalate if needed**: Involve core maintainers for architectural decisions

## Long-term Contribution Strategy

### 1. Building Expertise

**Start Small**
- Begin with simple bug fixes and documentation
- Gradually take on more complex issues
- Specialize in specific areas (GUI, networking, drivers)

**Learn the Codebase**
- Study existing code patterns and conventions
- Understand the system architecture
- Read documentation and design documents

### 2. Becoming a Trusted Contributor

**Consistency**
- Regular contributions over time
- Reliable code quality
- Helpful code reviews for others

**Expertise Development**
- Become the go-to person for specific components
- Help maintain and improve your areas of expertise
- Mentor new contributors

### 3. Contributing Beyond Code

**Documentation**
- Write tutorials and guides
- Improve API documentation
- Create examples and demos

**Community Support**
- Answer questions on forums and IRC
- Help troubleshoot issues
- Test and report bugs

**Project Infrastructure**
- Improve build systems
- Enhance testing frameworks
- Contribute to project tools

### 4. Advanced Contributions

Once you're an experienced contributor:
- **Architecture Design**: Propose and implement major features
- **Code Review**: Help review complex changes from others
- **Mentoring**: Guide new contributors
- **Project Leadership**: Help make project decisions

## Conclusion

Contributing to KolibriOS is a rewarding experience that allows you to:
- Learn low-level systems programming
- Contribute to a unique operating system
- Work with a passionate community
- Develop expertise in assembly language and system design

### Key Success Factors

1. **Start small** and gradually increase complexity
2. **Follow conventions** and maintain code quality
3. **Test thoroughly** before submitting changes
4. **Communicate effectively** with the community
5. **Be patient** and persistent through the review process
6. **Help others** and contribute beyond just code

### Resources for Continued Learning

- **Source Code**: Study existing implementations
- **Documentation**: Read system documentation thoroughly
- **Community**: Engage with other developers
- **Practice**: Build personal projects using KolibriOS APIs

### Getting Help

When you need assistance:
- **Forum**: http://board.kolibrios.org/ for general questions
- **IRC**: #kolibrios for real-time chat
- **Issues**: Use issue tracker for bug reports and feature requests
- **Code Reviews**: Learn from feedback on your pull requests

Remember: Every expert was once a beginner. The KolibriOS community welcomes newcomers who are willing to learn and contribute thoughtfully. Your unique perspective and skills can help improve this fascinating operating system project.

Happy contributing!