// Configuration Management for FASM eBook
// Centralizes all hardcoded paths, magic numbers, and configuration values

class FASMeBookConfig {
    constructor() {
        this.config = {
            // Directory structure
            paths: {
                chapters: 'chapters',
                assets: 'assets',
                scripts: 'scripts',
                styles: 'styles',
                tests: 'tests',
                testResults: 'test-results',
                playwrightReport: 'playwright-report',
                nodeModules: 'node_modules'
            },

            // File patterns and extensions
            files: {
                chapterIndex: 'chapters/index.json',
                manifest: 'manifest.json',
                serviceWorker: 'service-worker.js',
                chapterExtension: '.md',
                configFile: 'config.json'
            },

            // Server configuration
            server: {
                defaultPort: 8000,
                testPort: 8081,
                hostname: '127.0.0.1',
                timeout: 120000, // 2 minutes
                retryAttempts: 3,
                retryDelay: 1000 // 1 second
            },

            // Testing configuration
            testing: {
                defaultBrowser: 'chromium',
                supportedBrowsers: ['chromium', 'firefox', 'webkit'],
                mobileDevices: ['Mobile Chrome', 'Mobile Safari'],
                tabletDevices: ['iPad'],
                retryCount: 2,
                timeout: 30000, // 30 seconds
                screenshotOnFailure: true,
                videoOnFailure: true,
                traceOnRetry: true
            },

            // Artifact retention
            artifacts: {
                defaultRetentionDays: 30,
                failureRetentionDays: 7,
                maxArtifactSizeMB: 100,
                compressionLevel: 6,
                pruneOlderThanDays: 90
            },

            // Performance thresholds
            performance: {
                maxLoadTime: 3000, // 3 seconds
                maxFirstContentfulPaint: 1500, // 1.5 seconds
                maxLargestContentfulPaint: 2500, // 2.5 seconds
                maxFirstInputDelay: 100, // 100ms
                maxCumulativeLayoutShift: 0.1
            },

            // Accessibility standards
            accessibility: {
                wcagLevel: 'AA',
                minColorContrast: 4.5,
                maxTouchTargetSize: 44, // pixels
                supportedScreenReaders: ['NVDA', 'JAWS', 'VoiceOver']
            },

            // UI configuration
            ui: {
                animationDuration: 300, // milliseconds
                debounceDelay: 250, // milliseconds
                scrollThreshold: 10, // pixels
                mobileBreakpoint: 768, // pixels
                tabletBreakpoint: 1024, // pixels
                maxZIndex: 9999
            },

            // Drawing system
            drawing: {
                defaultBrushSize: 2,
                maxBrushSize: 20,
                defaultOpacity: 1.0,
                maxCanvasSize: 4096, // pixels
                maxSavedDrawings: 50,
                compressionQuality: 0.8
            },

            // Error handling
            errors: {
                maxRetries: 3,
                retryDelay: 1000,
                logLevel: 'warn', // 'debug', 'info', 'warn', 'error'
                enableStackTrace: true,
                enableUserReporting: false
            },

            // Features flags
            features: {
                enableOfflineMode: true,
                enablePWA: true,
                enableAnalytics: false,
                enableErrorReporting: false,
                enableDebugMode: false,
                enableExperimentalFeatures: false
            },

            // Security settings
            security: {
                enableCSP: true,
                allowInlineScripts: false,
                maxFileUploadSize: 10485760, // 10MB
                allowedOrigins: ['localhost', '127.0.0.1'],
                sanitizeUserInput: true
            }
        };

        // Environment-specific overrides
        this.applyEnvironmentConfig();
    }

    /**
     * Apply environment-specific configuration overrides
     */
    applyEnvironmentConfig() {
        const env = this.detectEnvironment();
        
        switch (env) {
            case 'development':
                this.config.errors.logLevel = 'debug';
                this.config.features.enableDebugMode = true;
                this.config.server.retryAttempts = 1;
                break;
                
            case 'testing':
                this.config.errors.enableStackTrace = true;
                this.config.testing.retryCount = 0; // Fail fast in tests
                this.config.artifacts.defaultRetentionDays = 1;
                break;
                
            case 'ci':
                this.config.testing.retryCount = 2;
                this.config.server.timeout = 180000; // 3 minutes for CI
                this.config.performance.maxLoadTime = 5000; // Slower CI environments
                break;
                
            case 'production':
                this.config.errors.logLevel = 'error';
                this.config.features.enableDebugMode = false;
                this.config.security.enableCSP = true;
                break;
        }
    }

    /**
     * Detect current environment
     * @returns {string} Environment name
     */
    detectEnvironment() {
        if (typeof process !== 'undefined' && process.env) {
            if (process.env.CI) return 'ci';
            if (process.env.NODE_ENV === 'test') return 'testing';
            if (process.env.NODE_ENV === 'development') return 'development';
            if (process.env.NODE_ENV === 'production') return 'production';
        }
        
        if (typeof window !== 'undefined') {
            if (window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1') {
                return 'development';
            }
        }
        
        return 'production';
    }

    /**
     * Get configuration value by path
     * @param {string} path - Dot-separated path to config value
     * @param {*} defaultValue - Default value if path not found
     * @returns {*} Configuration value
     */
    get(path, defaultValue = undefined) {
        const parts = path.split('.');
        let value = this.config;
        
        for (const part of parts) {
            if (value && typeof value === 'object' && part in value) {
                value = value[part];
            } else {
                return defaultValue;
            }
        }
        
        return value;
    }

    /**
     * Set configuration value by path
     * @param {string} path - Dot-separated path to config value
     * @param {*} value - Value to set
     */
    set(path, value) {
        const parts = path.split('.');
        let current = this.config;
        
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (!current[part] || typeof current[part] !== 'object') {
                current[part] = {};
            }
            current = current[part];
        }
        
        current[parts[parts.length - 1]] = value;
    }

    /**
     * Validate configuration
     * @returns {Array} Array of validation errors
     */
    validate() {
        const errors = [];
        
        // Validate required paths exist
        const requiredPaths = [
            'paths.chapters',
            'files.chapterIndex',
            'server.defaultPort',
            'testing.defaultBrowser'
        ];
        
        requiredPaths.forEach(path => {
            if (this.get(path) === undefined) {
                errors.push(`Missing required configuration: ${path}`);
            }
        });
        
        // Validate numeric ranges
        const numericValidations = [
            { path: 'server.defaultPort', min: 1000, max: 65535 },
            { path: 'server.testPort', min: 1000, max: 65535 },
            { path: 'testing.timeout', min: 1000, max: 300000 },
            { path: 'performance.maxLoadTime', min: 100, max: 60000 }
        ];
        
        numericValidations.forEach(({ path, min, max }) => {
            const value = this.get(path);
            if (typeof value === 'number' && (value < min || value > max)) {
                errors.push(`Configuration ${path} must be between ${min} and ${max}, got ${value}`);
            }
        });
        
        return errors;
    }

    /**
     * Get full file path
     * @param {string} relativePath - Relative path from config
     * @param {string} baseDir - Base directory (optional)
     * @returns {string} Full path
     */
    getPath(relativePath, baseDir = '') {
        if (baseDir) {
            return `${baseDir}/${relativePath}`.replace(/\/+/g, '/');
        }
        return relativePath;
    }

    /**
     * Get all configuration as a plain object
     * @returns {Object} Configuration object
     */
    getAll() {
        return JSON.parse(JSON.stringify(this.config));
    }

    /**
     * Load configuration from external file
     * @param {string} configPath - Path to configuration file
     * @returns {Promise<boolean>} Success status
     */
    async loadFromFile(configPath) {
        try {
            const response = await fetch(configPath);
            if (!response.ok) {
                console.warn(`Config file not found at ${configPath}, using defaults`);
                return false;
            }
            
            const externalConfig = await response.json();
            this.mergeConfig(externalConfig);
            return true;
        } catch (error) {
            console.error('Error loading configuration:', error);
            return false;
        }
    }

    /**
     * Merge external configuration with defaults
     * @param {Object} externalConfig - External configuration object
     */
    mergeConfig(externalConfig) {
        this.config = this.deepMerge(this.config, externalConfig);
        this.applyEnvironmentConfig();
    }

    /**
     * Deep merge two objects
     * @param {Object} target - Target object
     * @param {Object} source - Source object
     * @returns {Object} Merged object
     */
    deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }
}

// Create global configuration instance
const fasmeBookConfig = new FASMeBookConfig();

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FASMeBookConfig, fasmeBookConfig };
} else if (typeof window !== 'undefined') {
    window.FASMeBookConfig = FASMeBookConfig;
    window.fasmeBookConfig = fasmeBookConfig;
}