// Dynamic Instruction Glossary Manager
// Replaces static maps with JSON-based dynamic system

class DynamicGlossary {
    constructor() {
        this.instructions = new Map();
        this.categories = new Map();
        this.usageIndex = new Map();
        this.searchIndex = new Map();
        this.patterns = [];
        this.optimizations = [];
        this.isLoaded = false;
        this.loadPromise = null;
        this.observers = new Set(); // For real-time updates
        
        // Performance optimizations
        this.cache = {
            searchResults: new Map(),
            relatedInstructions: new Map(),
            categoryFilters: new Map()
        };
        
        this.loadGlossaryData();
    }

    async loadGlossaryData() {
        if (this.loadPromise) {
            return this.loadPromise;
        }

        this.loadPromise = this.fetchAndParseGlossary();
        return this.loadPromise;
    }

    async fetchAndParseGlossary() {
        try {
            const response = await fetch('js/glossary-data.json');
            if (!response.ok) {
                throw new Error(`Failed to load glossary: ${response.status}`);
            }
            
            const data = await response.json();
            this.parseGlossaryData(data);
            this.buildSearchIndex();
            this.isLoaded = true;
            
            // Notify observers
            this.notifyObservers('loaded', { instructionCount: this.instructions.size });
            
            console.log(`Dynamic glossary loaded: ${this.instructions.size} instructions`);
            return true;
        } catch (error) {
            console.error('Failed to load glossary data:', error);
            this.loadFallbackData();
            return false;
        }
    }

    parseGlossaryData(data) {
        // Parse instructions
        for (const [name, instruction] of Object.entries(data.instructions)) {
            this.instructions.set(name.toLowerCase(), {
                name,
                ...instruction,
                lastUsed: null,
                usageCount: instruction.usageCount || 0
            });
            
            // Build category index
            const category = instruction.category;
            if (!this.categories.has(category)) {
                this.categories.set(category, new Set());
            }
            this.categories.get(category).add(name.toLowerCase());
        }

        // Parse patterns and optimizations
        if (data.patterns) {
            this.patterns = data.patterns.common_sequences || [];
            this.optimizations = data.patterns.optimization_tips || [];
        }

        // Build metadata
        this.metadata = data.meta || {};
    }

    buildSearchIndex() {
        this.searchIndex.clear();
        
        for (const [key, instruction] of this.instructions) {
            const searchableText = [
                instruction.name,
                instruction.description,
                instruction.category,
                ...(instruction.keywords || []),
                ...(instruction.examples || []).join(' ').split(/\s+/)
            ].join(' ').toLowerCase();
            
            // Create ngrams for fuzzy search
            const words = searchableText.split(/\s+/);
            for (const word of words) {
                if (word.length >= 2) {
                    if (!this.searchIndex.has(word)) {
                        this.searchIndex.set(word, new Set());
                    }
                    this.searchIndex.get(word).add(key);
                }
                
                // Create bigrams for better matching
                for (let i = 0; i < word.length - 1; i++) {
                    const bigram = word.slice(i, i + 2);
                    if (!this.searchIndex.has(bigram)) {
                        this.searchIndex.set(bigram, new Set());
                    }
                    this.searchIndex.get(bigram).add(key);
                }
            }
        }
    }

    loadFallbackData() {
        // Minimal fallback data if JSON fails to load
        const fallbackInstructions = [
            {
                name: 'MOV',
                category: 'Data Movement',
                syntax: 'MOV destination, source',
                description: 'Copies data from source to destination',
                examples: ['mov eax, ebx', 'mov [ebx], eax'],
                difficulty: 'beginner'
            },
            {
                name: 'ADD',
                category: 'Arithmetic',
                syntax: 'ADD destination, source',
                description: 'Adds source to destination',
                examples: ['add eax, ebx', 'add eax, 10'],
                difficulty: 'beginner'
            }
        ];

        for (const instruction of fallbackInstructions) {
            this.instructions.set(instruction.name.toLowerCase(), instruction);
        }
        
        this.isLoaded = true;
        console.warn('Using fallback glossary data');
    }

    // Public API methods

    /**
     * Get instruction details by name
     */
    getInstruction(name) {
        this.trackUsage(name);
        return this.instructions.get(name.toLowerCase());
    }

    /**
     * Search instructions by query
     */
    search(query, options = {}) {
        const cacheKey = `${query}_${JSON.stringify(options)}`;
        if (this.cache.searchResults.has(cacheKey)) {
            return this.cache.searchResults.get(cacheKey);
        }

        const results = this.performSearch(query, options);
        this.cache.searchResults.set(cacheKey, results);
        
        // Limit cache size
        if (this.cache.searchResults.size > 100) {
            const firstKey = this.cache.searchResults.keys().next().value;
            this.cache.searchResults.delete(firstKey);
        }
        
        return results;
    }

    performSearch(query, options = {}) {
        if (!query || query.length < 2) {
            return this.getAllInstructions(options);
        }

        const queryLower = query.toLowerCase();
        const matches = new Map();
        
        // Exact name match gets highest score
        if (this.instructions.has(queryLower)) {
            matches.set(queryLower, 100);
        }
        
        // Search in index
        for (const [term, instructionSet] of this.searchIndex) {
            if (term.includes(queryLower) || queryLower.includes(term)) {
                const score = this.calculateSearchScore(term, queryLower);
                for (const instruction of instructionSet) {
                    matches.set(instruction, Math.max(matches.get(instruction) || 0, score));
                }
            }
        }
        
        // Sort by score and apply filters
        let results = Array.from(matches.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([name]) => this.instructions.get(name))
            .filter(Boolean);
            
        results = this.applyFilters(results, options);
        
        return {
            results: results.slice(0, options.limit || 20),
            total: results.length,
            query
        };
    }

    calculateSearchScore(term, query) {
        if (term === query) return 90;
        if (term.startsWith(query)) return 80;
        if (term.endsWith(query)) return 70;
        if (term.includes(query)) return 60;
        return 30;
    }

    applyFilters(results, options) {
        if (options.category) {
            results = results.filter(inst => inst.category === options.category);
        }
        
        if (options.difficulty) {
            results = results.filter(inst => inst.difficulty === options.difficulty);
        }
        
        if (options.sortBy) {
            switch (options.sortBy) {
                case 'usage':
                    results.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
                    break;
                case 'name':
                    results.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'category':
                    results.sort((a, b) => a.category.localeCompare(b.category));
                    break;
            }
        }
        
        return results;
    }

    /**
     * Get all instructions with optional filtering
     */
    getAllInstructions(options = {}) {
        let results = Array.from(this.instructions.values());
        results = this.applyFilters(results, options);
        
        return {
            results: results.slice(0, options.limit || 50),
            total: results.length
        };
    }

    /**
     * Get instructions by category
     */
    getInstructionsByCategory(category) {
        const instructionNames = this.categories.get(category) || new Set();
        return Array.from(instructionNames).map(name => this.instructions.get(name)).filter(Boolean);
    }

    /**
     * Get related instructions based on cross-references
     */
    getRelatedInstructions(instructionName) {
        const cacheKey = instructionName.toLowerCase();
        if (this.cache.relatedInstructions.has(cacheKey)) {
            return this.cache.relatedInstructions.get(cacheKey);
        }

        const instruction = this.getInstruction(instructionName);
        if (!instruction || !instruction.crossRefs) {
            return [];
        }

        const related = instruction.crossRefs
            .map(name => this.getInstruction(name))
            .filter(Boolean)
            .slice(0, 5); // Limit to 5 related instructions

        this.cache.relatedInstructions.set(cacheKey, related);
        return related;
    }

    /**
     * Get all available categories
     */
    getCategories() {
        return Array.from(this.categories.keys()).sort();
    }

    /**
     * Get common instruction patterns
     */
    getPatterns() {
        return this.patterns;
    }

    /**
     * Get optimization tips
     */
    getOptimizations() {
        return this.optimizations;
    }

    /**
     * Track instruction usage for analytics
     */
    trackUsage(instructionName) {
        const instruction = this.instructions.get(instructionName.toLowerCase());
        if (instruction) {
            instruction.usageCount = (instruction.usageCount || 0) + 1;
            instruction.lastUsed = new Date();
            
            // Update usage index for current context
            const currentChapter = this.getCurrentChapter();
            if (currentChapter) {
                if (!this.usageIndex.has(currentChapter)) {
                    this.usageIndex.set(currentChapter, new Map());
                }
                const chapterUsage = this.usageIndex.get(currentChapter);
                chapterUsage.set(instructionName.toLowerCase(), 
                    (chapterUsage.get(instructionName.toLowerCase()) || 0) + 1);
            }
            
            // Notify observers
            this.notifyObservers('usage', { instruction: instructionName, count: instruction.usageCount });
        }
    }

    /**
     * Get usage statistics
     */
    getUsageStats() {
        const totalUsage = Array.from(this.instructions.values())
            .reduce((sum, inst) => sum + (inst.usageCount || 0), 0);
            
        const topUsed = Array.from(this.instructions.values())
            .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
            .slice(0, 10);
            
        return {
            totalInstructions: this.instructions.size,
            totalUsage,
            averageUsage: totalUsage / this.instructions.size,
            topUsed: topUsed.map(inst => ({
                name: inst.name,
                count: inst.usageCount || 0
            }))
        };
    }

    /**
     * Sync glossary with AI helper with validation
     */
    syncWithAI(instructionName) {
        const instruction = this.getInstruction(instructionName);
        if (!instruction) return null;

        const syncData = {
            name: instruction.name,
            syntax: instruction.syntax,
            description: instruction.description,
            examples: instruction.examples || [],
            difficulty: instruction.difficulty,
            category: instruction.category,
            crossRefs: instruction.crossRefs || [],
            usageHints: this.generateUsageHints(instruction),
            relatedPatterns: this.findRelatedPatterns(instruction),
            syncTimestamp: new Date().toISOString(),
            checksum: this.calculateChecksum(instruction)
        };

        // Validate sync data integrity
        if (!this.validateSyncData(syncData)) {
            console.error('Sync data validation failed for instruction:', instructionName);
            return null;
        }

        // Notify observers of sync
        this.notifyObservers('synced', { instruction: instructionName, data: syncData });
        
        return syncData;
    }

    /**
     * Validate sync data integrity
     */
    validateSyncData(syncData) {
        const requiredFields = ['name', 'description', 'category'];
        
        for (const field of requiredFields) {
            if (!syncData[field] || typeof syncData[field] !== 'string' || syncData[field].trim() === '') {
                console.error(`Sync validation failed: missing or invalid ${field}`);
                return false;
            }
        }

        // Validate examples array
        if (syncData.examples && !Array.isArray(syncData.examples)) {
            console.error('Sync validation failed: examples must be an array');
            return false;
        }

        // Validate cross-references
        if (syncData.crossRefs && !Array.isArray(syncData.crossRefs)) {
            console.error('Sync validation failed: crossRefs must be an array');
            return false;
        }

        // Check for reasonable string lengths
        if (syncData.description.length > 500) {
            console.warn('Sync validation warning: description is unusually long');
        }

        return true;
    }

    /**
     * Calculate checksum for data integrity
     */
    calculateChecksum(instruction) {
        const dataString = JSON.stringify({
            name: instruction.name,
            description: instruction.description,
            syntax: instruction.syntax,
            category: instruction.category
        });
        
        // Simple hash function for checksum
        let hash = 0;
        for (let i = 0; i < dataString.length; i++) {
            const char = dataString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(16);
    }

    /**
     * Validate glossary data consistency during updates
     */
    validateGlossaryConsistency() {
        const inconsistencies = [];
        
        // Check for duplicate instruction names
        const nameMap = new Map();
        for (const [key, instruction] of this.instructions) {
            const name = instruction.name.toLowerCase();
            if (nameMap.has(name)) {
                inconsistencies.push({
                    type: 'duplicate_name',
                    instruction: instruction.name,
                    duplicate: nameMap.get(name)
                });
            } else {
                nameMap.set(name, instruction.name);
            }
        }

        // Check for broken cross-references
        for (const [key, instruction] of this.instructions) {
            if (instruction.crossRefs) {
                for (const ref of instruction.crossRefs) {
                    if (!this.instructions.has(ref.toLowerCase())) {
                        inconsistencies.push({
                            type: 'broken_crossref',
                            instruction: instruction.name,
                            brokenRef: ref
                        });
                    }
                }
            }
        }

        // Check for orphaned categories
        const usedCategories = new Set();
        for (const instruction of this.instructions.values()) {
            usedCategories.add(instruction.category);
        }
        
        for (const category of this.categories.keys()) {
            if (!usedCategories.has(category)) {
                inconsistencies.push({
                    type: 'orphaned_category',
                    category
                });
            }
        }

        // Report inconsistencies
        if (inconsistencies.length > 0) {
            console.warn('Glossary consistency issues found:', inconsistencies);
            this.notifyObservers('validation_issues', { issues: inconsistencies });
        } else {
            this.notifyObservers('validation_passed', { timestamp: new Date() });
        }

        return inconsistencies;
    }

    /**
     * Auto-fix common glossary inconsistencies
     */
    autoFixInconsistencies() {
        const inconsistencies = this.validateGlossaryConsistency();
        let fixedCount = 0;

        for (const issue of inconsistencies) {
            switch (issue.type) {
                case 'broken_crossref':
                    // Remove broken cross-references
                    const instruction = this.instructions.get(issue.instruction.toLowerCase());
                    if (instruction && instruction.crossRefs) {
                        instruction.crossRefs = instruction.crossRefs.filter(ref => 
                            this.instructions.has(ref.toLowerCase())
                        );
                        fixedCount++;
                    }
                    break;
                    
                case 'orphaned_category':
                    // Remove orphaned categories
                    this.categories.delete(issue.category);
                    fixedCount++;
                    break;
            }
        }

        if (fixedCount > 0) {
            console.log(`Auto-fixed ${fixedCount} glossary inconsistencies`);
            this.notifyObservers('auto_fixed', { count: fixedCount });
            this.buildSearchIndex(); // Rebuild index after fixes
        }

        return fixedCount;
    }

    generateUsageHints(instruction) {
        const hints = [];
        
        if (instruction.difficulty === 'beginner') {
            hints.push('This is a fundamental instruction - master it first');
        }
        
        if (instruction.category === 'Arithmetic' && instruction.flags) {
            hints.push('Remember: this instruction affects flags');
        }
        
        if (instruction.usageCount > 10) {
            hints.push('Frequently used instruction - worth memorizing');
        }
        
        return hints;
    }

    findRelatedPatterns(instruction) {
        return this.patterns.filter(pattern => 
            pattern.instructions.includes(instruction.name)
        );
    }

    /**
     * Observer pattern for real-time updates
     */
    addObserver(callback) {
        this.observers.add(callback);
    }

    removeObserver(callback) {
        this.observers.delete(callback);
    }

    notifyObservers(event, data) {
        for (const callback of this.observers) {
            try {
                callback(event, data);
            } catch (error) {
                console.error('Observer error:', error);
            }
        }
    }

    /**
     * Utility methods
     */
    getCurrentChapter() {
        // Integration with main app - get current chapter from global state
        return window.fasmEbook?.currentChapter || 'unknown';
    }

    clearCache() {
        this.cache.searchResults.clear();
        this.cache.relatedInstructions.clear();
        this.cache.categoryFilters.clear();
    }

    /**
     * Export/Import functionality for custom instruction sets
     */
    exportData() {
        return {
            instructions: Object.fromEntries(this.instructions),
            usageStats: this.getUsageStats(),
            timestamp: new Date().toISOString()
        };
    }

    async importCustomInstructions(data) {
        try {
            if (data.instructions) {
                for (const [name, instruction] of Object.entries(data.instructions)) {
                    this.instructions.set(name.toLowerCase(), {
                        ...instruction,
                        custom: true,
                        imported: new Date()
                    });
                }
                this.buildSearchIndex();
                this.notifyObservers('imported', { count: Object.keys(data.instructions).length });
            }
        } catch (error) {
            console.error('Failed to import custom instructions:', error);
        }
    }

    /**
     * Health check for glossary system with validation
     */
    getStatus() {
        const inconsistencies = this.validateGlossaryConsistency();
        
        return {
            loaded: this.isLoaded,
            instructionCount: this.instructions.size,
            categoryCount: this.categories.size,
            cacheSize: {
                search: this.cache.searchResults.size,
                related: this.cache.relatedInstructions.size
            },
            observerCount: this.observers.size,
            lastUpdated: this.metadata?.lastUpdated,
            version: this.metadata?.version,
            validation: {
                consistent: inconsistencies.length === 0,
                issues: inconsistencies.length,
                lastValidation: new Date().toISOString()
            }
        };
    }
}

// Create global instance
window.dynamicGlossary = new DynamicGlossary();

// Validate glossary periodically and on important events
setInterval(() => {
    if (window.dynamicGlossary && window.dynamicGlossary.isLoaded) {
        window.dynamicGlossary.validateGlossaryConsistency();
    }
}, 300000); // Every 5 minutes

// Auto-fix on load if needed
window.addEventListener('load', () => {
    setTimeout(() => {
        if (window.dynamicGlossary && window.dynamicGlossary.isLoaded) {
            window.dynamicGlossary.autoFixInconsistencies();
        }
    }, 2000);
});