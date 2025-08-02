#!/usr/bin/env node

/**
 * Simple HTTP server to serve the FASM eBook locally.
 * Replaces Python server with Node.js-based solution.
 * Run this script and open http://localhost:8000 in your browser.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Command line argument parsing
const args = process.argv.slice(2);
let port = 8000;

// Parse --port argument
for (let i = 0; i < args.length; i++) {
    if (args[i] === '--port' && i + 1 < args.length) {
        port = parseInt(args[i + 1], 10);
        if (isNaN(port)) {
            console.error('Invalid port number');
            process.exit(1);
        }
    }
}

// MIME type mapping
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.md': 'text/markdown',
    '.txt': 'text/plain',
    '.pdf': 'application/pdf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
};

function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return mimeTypes[ext] || 'application/octet-stream';
}

const server = http.createServer((req, res) => {
    // Add CORS headers for local development
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // Default to index.html for root requests
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    // Security: prevent directory traversal
    const safePath = pathname.replace(/\.\./g, '');
    const filePath = path.join(__dirname, safePath);
    
    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // File not found
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.end('<h1>404 Not Found</h1><p>The requested resource was not found.</p>');
            return;
        }
        
        // Check if it's a directory
        fs.stat(filePath, (err, stats) => {
            if (err) {
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.end('Internal Server Error');
                return;
            }
            
            if (stats.isDirectory()) {
                // Try to serve index.html from directory
                const indexPath = path.join(filePath, 'index.html');
                fs.access(indexPath, fs.constants.F_OK, (err) => {
                    if (err) {
                        // Directory listing (simple)
                        fs.readdir(filePath, (err, files) => {
                            if (err) {
                                res.writeHead(500, {'Content-Type': 'text/plain'});
                                res.end('Internal Server Error');
                                return;
                            }
                            
                            res.writeHead(200, {'Content-Type': 'text/html'});
                            res.write(`<h1>Directory listing for ${pathname}</h1><ul>`);
                            files.forEach(file => {
                                const href = path.join(pathname, file);
                                res.write(`<li><a href="${href}">${file}</a></li>`);
                            });
                            res.write('</ul>');
                            res.end();
                        });
                    } else {
                        // Serve index.html
                        serveFile(indexPath, res);
                    }
                });
            } else {
                // Serve the file
                serveFile(filePath, res);
            }
        });
    });
});

function serveFile(filePath, res) {
    const mimeType = getMimeType(filePath);
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.end('Internal Server Error');
            return;
        }
        
        res.writeHead(200, {'Content-Type': mimeType});
        res.end(data);
    });
}

server.listen(port, '0.0.0.0', () => {
    console.log(`Starting FASM eBook server on port ${port}`);
    console.log(`Serving from: ${__dirname}`);
    console.log(`Open your browser to: http://localhost:${port}`);
    console.log('Press Ctrl+C to stop the server');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nServer stopped.');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nServer stopped.');
    process.exit(0);
});