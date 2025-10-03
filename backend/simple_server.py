"""
Simple Mock Backend for Mo7ami Demo
Runs without heavy dependencies
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import time
from urllib.parse import urlparse, parse_qs

# CORS headers
CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
}

# Mock responses in Arabic and French
MOCK_RESPONSES = {
    'ar': {
        'default': 'شكراً على سؤالك. القانون المغربي ينص على أن... (المادة 505 من القانون الجنائي)',
        'theft': 'القانون الجنائي المغربي كيعاقب على السرقة بالحبس من سنة إلى خمس سنوات والغرامة من 200 إلى 500 درهم (المادة 505 من القانون الجنائي، ظهير 1-59-413 لسنة 1962)',
        'divorce': 'حسب مدونة الأسرة، يمكن طلب الطلاق للزوج والزوجة على حد سواء. الإجراءات تتضمن تقديم طلب إلى المحكمة (الفصل 78 من مدونة الأسرة، قانون 70-03 لسنة 2004)',
        'work': 'قانون الشغل المغربي ينظم العلاقة بين المشغل والأجير. ساعات العمل القانونية هي 44 ساعة في الأسبوع (المادة 184 من مدونة الشغل، قانون 65-99 لسنة 2003)',
    },
    'fr': {
        'default': 'Merci pour votre question. La loi marocaine stipule que... (Article 505 du Code Pénal)',
        'theft': 'Le Code Pénal marocain punit le vol d\'une peine d\'emprisonnement d\'un à cinq ans et d\'une amende de 200 à 500 dirhams (Article 505 du Code Pénal, Dahir 1-59-413 de 1962)',
        'divorce': 'Selon le Code de la Famille, le divorce peut être demandé par l\'époux et l\'épouse. La procédure implique le dépôt d\'une demande au tribunal (Article 78 du Code de la Famille, Loi 70-03 de 2004)',
        'work': 'Le Code du Travail marocain régit la relation entre l\'employeur et l\'employé. Les heures de travail légales sont de 44 heures par semaine (Article 184 du Code du Travail, Loi 65-99 de 2003)',
    }
}

MOCK_CITATIONS = {
    'ar': [
        {
            'source': 'القانون الجنائي المغربي',
            'article': '505',
            'reference': 'ظهير 1-59-413 (1962)',
            'url': 'https://www.sgg.gov.ma'
        }
    ],
    'fr': [
        {
            'source': 'Code Pénal Marocain',
            'article': '505',
            'reference': 'Dahir 1-59-413 (1962)',
            'url': 'https://www.sgg.gov.ma'
        }
    ]
}

def get_mock_response(text, language):
    """Get appropriate mock response based on query"""
    text_lower = text.lower()

    if 'سرق' in text or 'vol' in text_lower or 'theft' in text_lower:
        return MOCK_RESPONSES[language]['theft']
    elif 'طلاق' in text or 'divorce' in text_lower:
        return MOCK_RESPONSES[language]['divorce']
    elif 'شغل' in text or 'عمل' in text or 'travail' in text_lower or 'work' in text_lower:
        return MOCK_RESPONSES[language]['work']
    else:
        return MOCK_RESPONSES[language]['default']

class MockAPIHandler(BaseHTTPRequestHandler):

    def log_message(self, format, *args):
        """Custom logging"""
        print(f"[{self.log_date_time_string()}] {format % args}")

    def _send_cors_headers(self):
        """Send CORS headers"""
        for key, value in CORS_HEADERS.items():
            self.send_header(key, value)

    def do_OPTIONS(self):
        """Handle preflight requests"""
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)

        # Health check
        if parsed_path.path == '/' or parsed_path.path == '/health':
            self.send_response(200)
            self._send_cors_headers()
            self.end_headers()
            response = {
                'message': 'Mo7ami Mock Backend API',
                'version': '0.1.0',
                'status': 'running'
            }
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))

        # Voice voices endpoint
        elif parsed_path.path == '/api/v1/voice/voices':
            self.send_response(200)
            self._send_cors_headers()
            self.end_headers()
            response = {
                'voices': {
                    'ar': [
                        {'id': 'ar-female-1', 'name': 'Maryam', 'gender': 'female'},
                        {'id': 'ar-male-1', 'name': 'Ahmed', 'gender': 'male'}
                    ],
                    'fr': [
                        {'id': 'fr-female-1', 'name': 'Marie', 'gender': 'female'},
                        {'id': 'fr-male-1', 'name': 'Pierre', 'gender': 'male'}
                    ]
                }
            }
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))

        # Documents domains endpoint
        elif parsed_path.path == '/api/v1/documents/domains':
            self.send_response(200)
            self._send_cors_headers()
            self.end_headers()
            response = {
                'domains': [
                    {'id': 'penal', 'name_ar': 'القانون الجنائي', 'name_fr': 'Droit pénal'},
                    {'id': 'civil', 'name_ar': 'القانون المدني', 'name_fr': 'Droit civil'},
                    {'id': 'family', 'name_ar': 'قانون الأسرة', 'name_fr': 'Droit de la famille'},
                ]
            }
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))

        else:
            self.send_response(404)
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Not found'}).encode('utf-8'))

    def do_POST(self):
        """Handle POST requests"""
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')

        try:
            data = json.loads(body) if body else {}
        except:
            data = {}

        parsed_path = urlparse(self.path)

        # Chat endpoint
        if parsed_path.path == '/api/v1/chat':
            message = data.get('message', '')
            language = data.get('language', 'ar')

            # Simulate processing time
            time.sleep(0.5)

            # Generate mock response
            answer = get_mock_response(message, language)
            citations = MOCK_CITATIONS[language]

            self.send_response(200)
            self._send_cors_headers()
            self.end_headers()

            response = {
                'answer': answer,
                'language': language,
                'citations': citations,
                'conversation_id': 'mock-conversation-id',
                'processing_time': 0.5
            }

            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
            print(f"✓ Chat request processed: {message[:50]}...")

        # Voice transcribe endpoint (mock)
        elif parsed_path.path == '/api/v1/voice/transcribe':
            self.send_response(200)
            self._send_cors_headers()
            self.end_headers()

            response = {
                'text': 'شنو كايقول القانون على السرقة؟',
                'language': data.get('language', 'ar'),
                'confidence': 0.95
            }

            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
            print("✓ Voice transcription (mock)")

        # Voice synthesize endpoint (mock)
        elif parsed_path.path == '/api/v1/voice/synthesize':
            # Return empty audio blob for demo
            self.send_response(200)
            self.send_header('Content-Type', 'audio/mpeg')
            self._send_cors_headers()
            self.end_headers()
            # Send minimal valid MP3 header
            self.wfile.write(b'\xff\xfb\x90\x00')
            print("✓ Voice synthesis (mock)")

        else:
            self.send_response(404)
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Endpoint not found'}).encode('utf-8'))

def run_server(port=8000):
    """Run the mock backend server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, MockAPIHandler)
    print(f"""
    🚀 Mo7ami Mock Backend Server Started!

    📍 Server: http://localhost:{port}
    📊 Health: http://localhost:{port}/health

    📝 Available Endpoints:
    - POST /api/v1/chat - Chat with mock responses
    - POST /api/v1/voice/transcribe - Mock STT
    - POST /api/v1/voice/synthesize - Mock TTS
    - GET  /api/v1/voice/voices - List voices
    - GET  /api/v1/documents/domains - List domains

    ✅ Ready to serve requests!
    Press Ctrl+C to stop
    """)

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Shutting down server...")
        httpd.shutdown()

if __name__ == '__main__':
    run_server(8000)
