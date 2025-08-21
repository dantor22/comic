import http.server
import socketserver
import os
import json
from urllib.parse import urlparse, parse_qs

PORT = 8000

class ComicServerHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_GET(self):
        parsed_path = urlparse(self.path)
        
        # Ruta para servir el catálogo como API
        if parsed_path.path == '/api/catalog':
            try:
                catalog_path = os.path.join(os.getcwd(), 'catalog', 'catalog.json')
                if os.path.exists(catalog_path):
                    with open(catalog_path, 'r', encoding='utf-8') as f:
                        catalog_data = json.load(f)
                    
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps(catalog_data).encode())
                else:
                    self.send_response(404)
                    self.end_headers()
                    self.wfile.write(b'Catalog not found')
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(str(e).encode())
        
        # Ruta legacy para comics en assets/comics
        elif parsed_path.path == '/api/comics':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            comics_dir = os.path.join(os.getcwd(), 'assets', 'comics')
            comics = []
            
            if os.path.exists(comics_dir):
                for file in os.listdir(comics_dir):
                    if file.endswith('.pdf'):
                        comics.append({
                            'name': file,
                            'path': f'/assets/comics/{file}'
                        })
            
            self.wfile.write(json.dumps(comics).encode())
        else:
            super().do_GET()

def run_server():
    try:
        with socketserver.TCPServer(("", PORT), ComicServerHandler) as httpd:
            print(f"Servidor iniciado en http://localhost:{PORT}")
            print(f"Sirviendo desde: {os.getcwd()}")
            print(f"Coloca tus PDFs en: {os.path.join(os.getcwd(), 'assets', 'comics')}")
            print("\nPresiona Ctrl+C para detener el servidor")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    run_server()