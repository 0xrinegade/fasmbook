# FASM Examples

This directory contains example FASM programs that demonstrate various concepts from the FASM Programming eBook, ranging from basic concepts to advanced systems programming.

## Basic Examples

- `hello_world.asm` - Basic Windows console application demonstrating program structure
- `counter_loop.asm` - Demonstrates loops and memory operations  
- `hello_linux.asm` - Basic Linux executable using system calls

## Advanced Examples

### `advanced_calculator.asm` - Expression Parser and Calculator
**Demonstrates:**
- String parsing and tokenization algorithms
- Recursive descent parsing implementation
- Stack-based expression evaluation
- Advanced error handling and validation
- User interface with input/output operations
- Memory management for dynamic data structures

**Key Concepts:**
- Complex control flow with nested function calls
- Advanced stack manipulation techniques
- String processing and character analysis
- Mathematical expression evaluation
- Interactive user input handling

### `network_server.asm` - High-Performance Network Server
**Demonstrates:**
- Winsock API usage and network programming
- Multi-threaded server architecture
- Asynchronous I/O operations and event handling
- Memory pool management for performance
- HTTP-like protocol implementation
- Thread synchronization with mutexes
- Performance monitoring and metrics collection

**Key Concepts:**
- Systems programming with Windows APIs
- Multi-threading and concurrent programming
- Network socket programming
- Memory management and optimization
- Protocol design and implementation
- Resource pooling and lifecycle management

### `graphics_engine.asm` - Real-Time 3D Graphics Engine
**Demonstrates:**
- 3D mathematics (vectors, matrices, quaternions)
- Perspective projection and viewport transformation
- Z-buffer depth testing implementation
- Backface culling optimization
- 3D scene management and animation
- Performance-optimized rendering pipeline
- Frame buffer and depth buffer management

**Key Concepts:**
- Advanced mathematical computations using FPU
- 3D graphics programming fundamentals
- Matrix mathematics and transformations
- Real-time rendering techniques
- Performance optimization strategies
- Memory-mapped graphics buffers

## Compilation Instructions

### Windows (using FASM)
```bash
# Basic examples
fasm hello_world.asm
fasm counter_loop.asm

# Advanced examples
fasm advanced_calculator.asm
fasm network_server.asm
fasm graphics_engine.asm
```

### Linux (using FASM)
```bash
# Linux-specific example
fasm hello_linux.asm

# Note: Windows-specific examples require Windows API libraries
# For cross-platform development, use conditional compilation
```

## Educational Value

These examples progressively demonstrate:

1. **Basic Programming Concepts** - Variables, loops, conditionals
2. **System Programming** - API usage, memory management, threading
3. **Algorithm Implementation** - Parsing, evaluation, data structures
4. **Performance Optimization** - Memory pools, efficient algorithms
5. **Advanced Mathematics** - 3D transformations, floating-point operations
6. **Real-World Applications** - Network servers, graphics engines, calculators

## GitHub Actions Comprehensive Testing

The `.github/workflows/fasm-compile-test.yml` workflow provides enterprise-grade testing:

### 🔧 **Cross-Platform Compilation**
- **Windows PE**: Native Windows executable generation with complete API support
- **Linux ELF64**: Modern 64-bit Linux executable compilation
- **macOS Support**: Future expansion for Apple Silicon compatibility

### 📊 **Advanced Analysis Features**
- **Automatic Code Extraction**: Intelligently extracts assembly code from eBook documentation
- **Syntax Validation**: Comprehensive FASM instruction validation and error reporting
- **Performance Benchmarking**: CPU cycle counting and memory usage analysis
- **Code Quality Metrics**: Complexity analysis and optimization recommendations
- **Binary Analysis**: File format inspection and section analysis

### 🧪 **Comprehensive Testing Pipeline**
- **Compilation Testing**: Validates all code examples compile successfully
- **Execution Validation**: Runtime testing with timeout protection
- **Memory Safety**: Leak detection and buffer overflow protection
- **Performance Regression**: Continuous performance monitoring
- **Documentation Coverage**: Ensures code examples match documentation

### 📈 **Quality Assurance**
- **Automated Reporting**: Detailed compilation and execution reports
- **Visual Analytics**: Performance charts and code complexity visualizations  
- **Coverage Analysis**: Instruction usage statistics and coverage metrics
- **Error Diagnostics**: Advanced error reporting with optimization suggestions

### 🚀 **Pipeline Features**
- **Smart Triggers**: Runs on code changes, PRs, and manual dispatch
- **Artifact Management**: Preserves compiled examples and detailed reports
- **Multi-Matrix Support**: Dynamic build matrix based on available platforms
- **Performance Monitoring**: Real-time FPS and throughput measurements
- **Stress Testing**: Optional high-load testing for server applications

## Usage in CI/CD

### Manual Trigger Options
```yaml
# Enable performance benchmarking
benchmark: true

# Enable stress testing
stress_test: true
```

### Automated Features
- **Smart Code Detection**: Automatically finds and compiles new examples
- **Cross-Reference Validation**: Ensures eBook content matches working code
- **Performance Regression Detection**: Alerts on performance degradation
- **Quality Gate Enforcement**: Blocks merges if compilation fails

## Performance Benchmarks

The testing pipeline provides detailed performance metrics:

- **Compilation Speed**: FASM compilation times across platforms
- **Binary Size Analysis**: Executable size optimization tracking
- **Runtime Performance**: Execution speed and memory usage
- **Instruction Efficiency**: CPU cycle analysis per instruction type
- **Throughput Measurements**: Network server and graphics engine performance

## Advanced Features

### Memory Pool Management
The network server example demonstrates enterprise-grade memory management:
- Pre-allocated buffer pools for zero-allocation request handling
- Thread-safe memory allocation with mutex synchronization
- Automatic buffer lifecycle management
- Performance monitoring with allocation/deallocation tracking

### Real-Time Graphics Pipeline
The graphics engine showcases production-quality 3D programming:
- Hardware-accelerated matrix mathematics using FPU instructions
- Optimized vertex transformation pipeline
- Z-buffer depth testing for correct rendering
- Frame rate optimization and performance monitoring

### Expression Evaluation Engine
The calculator demonstrates compiler-like programming techniques:
- Tokenization and lexical analysis
- Recursive descent parsing algorithm
- Abstract syntax tree evaluation
- Error recovery and detailed diagnostics

This comprehensive example collection provides everything needed to teach professional assembly programming - from fundamental concepts to production-ready applications with enterprise-grade testing and validation.