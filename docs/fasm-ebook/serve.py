#!/usr/bin/env python3
"""
Simple HTTP server to serve the FASM eBook locally.
Run this script and open http://localhost:8000 in your browser.
"""

import http.server
import socketserver
import os
import sys
from pathlib import Path

# Change to the eBook directory
ebook_dir = Path(__file__).parent
os.chdir(ebook_dir)

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def guess_type(self, path):
        """Override to ensure proper MIME types"""
        mimetype = super().guess_type(path)
        if path.endswith('.md'):
            return 'text/markdown'
        elif path.endswith('.json'):
            return 'application/json'
        return mimetype

if __name__ == "__main__":
    print(f"Starting FASM eBook server on port {PORT}")
    print(f"Serving from: {ebook_dir}")
    print(f"Open your browser to: http://localhost:{PORT}")
    print("Press Ctrl+C to stop the server")
    
    try:
        with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
        sys.exit(0)