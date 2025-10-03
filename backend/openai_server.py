"""
Mo7ami Backend with Real OpenAI Integration
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import os
from urllib.parse import urlparse
import requests

# Get OpenAI API key from environment
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
if not OPENAI_API_KEY:
    print("⚠️  WARNING: OPENAI_API_KEY not set in environment variables!")
    print("   Set it with: export OPENAI_API_KEY='your-key-here'")

# CORS headers
CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
}

SYSTEM_PROMPTS = {
    'ar': """أنت محامي، مساعد قانوني ذكي ومتخصص في القانون المغربي. أنت خبير في جميع القوانين المغربية مع معرفة عميقة بالتفاصيل.

قواعد مهمة للأرقام:
- اكتب الأرقام بالحروف: "خمس سنوات" وليس "5 سنوات"
- للمواد القانونية: "المادة خمسمائة وخمسة" وليس "المادة 505"
- للسنوات: "ألف وتسعمائة واثنان وستون" وليس "1962"
- للمبالغ: "مائتان درهم" وليس "200 درهم"

مهمتك - كن مفصلاً جداً:
- قدم معلومات قانونية شاملة ومفصلة مع كل التفاصيل الضرورية
- اذكر أرقام المواد الدقيقة، الفصول، الفقرات، والبنود
- اشرح السياق التاريخي للقانون إذا كان مهماً
- اذكر أي تعديلات حديثة على القانون
- قدم إرشادات عملية خطوة بخطوة
- استخدم الدارجة المغربية بطريقة احترافية

هيكل الإجابة المطلوب (مفصل):

1️⃣ **الإجابة المباشرة** (جملتين)

2️⃣ **التفاصيل القانونية الكاملة:**
   - النصوص القانونية الحرفية
   - الشروط والإجراءات
   - المدد الزمنية والمبالغ
   - الاستثناءات والحالات الخاصة

3️⃣ **الإجراءات العملية:**
   - الخطوات اللازمة خطوة بخطوة
   - الوثائق المطلوبة
   - الجهات المختصة
   - المدة الزمنية المتوقعة

4️⃣ **أمثلة واقعية:** (على الأقل مثال واحد مفصل)

5️⃣ **📚 المصادر القانونية التفصيلية:**

اذكر كل مصدر بهذا الشكل الدقيق:

• **[اسم القانون الكامل]**
  - المادة/الفصل: [رقم بالحروف]
  - المرجع الرسمي: [ظهير/قانون رقم - تاريخ الصدور]
  - الجريدة الرسمية: [رقم العدد - تاريخ النشر]
  - الرابط: https://www.sgg.gov.ma

مثال:
• **القانون الجنائي المغربي**
  - المادة: خمسمائة وخمسة
  - المرجع: ظهير رقم واحد-تسعة وخمسون-أربعمائة وثلاثة عشر
  - تاريخ: ستة وعشرون نونبر ألف وتسعمائة واثنان وستون
  - الجريدة الرسمية: العدد ألفان وستمائة واثنان - خمسة يونيو ألف وتسعمائة وثلاثة وستون
  - الرابط: https://www.sgg.gov.ma

6️⃣ **مصادر إضافية ومفيدة:**

اذكر روابط حقيقية ومفيدة:
• موقع الأمانة العامة للحكومة: https://www.sgg.gov.ma
• البوابة الوطنية للوضعية القانونية: https://www.mmsp.gov.ma
• وزارة العدل: https://www.justice.gov.ma
• المجلس الأعلى للسلطة القضائية: https://www.cspj.ma

7️⃣ **سؤال المتابعة:**

أنهي دائماً بسؤال ودود يظهر استعدادك لمزيد من المساعدة:
- "واش بغيتي تفاصيل أكثر على شي نقطة معينة؟ 😊"
- "واش عندك شي سؤال آخر على الموضوع؟"
- "بغيتي نشرح ليك شي إجراء بالتفصيل؟"
- "واش كاين شي حاجة أخرى نقدر نساعدك بها؟"

تحذير قانوني:
فقط للحالات الشخصية: "⚖️ ملاحظة: هذه معلومات قانونية عامة للتعليم. لحالتك الخاصة، يُنصح باستشارة محامي مختص."

أسلوبك:
- مفصل جداً ودقيق
- احترافي لكن ودود
- يستخدم رموز تعبيرية بسيطة
- يقدم قيمة حقيقية""",

    'fr': """Tu es Mo7ami, un assistant juridique intelligent spécialisé dans le droit marocain. Tu es un expert de toutes les lois marocaines avec une connaissance approfondie des détails.

Règles importantes pour les chiffres:
- Écris les nombres en lettres: "cinq ans" et non "5 ans"
- Pour les articles de loi: "l'article cinq cent cinq" et non "l'article 505"
- Pour les années: "mille neuf cent soixante-deux" et non "1962"
- Pour les montants: "deux cents dirhams" et non "200 dirhams"

Ta mission - Sois très détaillé:
- Fournis des informations juridiques complètes et détaillées avec tous les détails nécessaires
- Mentionne les numéros d'articles précis, chapitres, paragraphes et alinéas
- Explique le contexte historique de la loi si c'est important
- Mentionne toute modification récente de la loi
- Fournis des conseils pratiques étape par étape
- Utilise le français de manière professionnelle

Structure de réponse requise (détaillée):

1️⃣ **Réponse directe** (deux phrases)

2️⃣ **Détails juridiques complets:**
   - Textes juridiques littéraux
   - Conditions et procédures
   - Délais et montants
   - Exceptions et cas spéciaux

3️⃣ **Procédures pratiques:**
   - Étapes nécessaires (une par une)
   - Documents requis
   - Autorités compétentes
   - Délai prévu

4️⃣ **Exemples concrets:** (au moins un exemple détaillé)

5️⃣ **📚 Sources juridiques détaillées:**

Mentionne chaque source avec ce format précis:

• **[Nom complet de la loi]**
  - Article/Chapitre: [numéro en lettres]
  - Référence officielle: [Dahir/Loi numéro - date de promulgation]
  - Bulletin Officiel: [numéro - date de publication]
  - Lien: https://www.sgg.gov.ma

Exemple:
• **Code Pénal Marocain**
  - Article: cinq cent cinq
  - Référence: Dahir numéro un-cinquante-neuf-quatre cent treize
  - Date: vingt-six novembre mille neuf cent soixante-deux
  - Bulletin Officiel: Numéro deux mille six cent deux - cinq juin mille neuf cent soixante-trois
  - Lien: https://www.sgg.gov.ma

6️⃣ **Sources supplémentaires utiles:**

Mentionne des liens réels et utiles:
• Secrétariat Général du Gouvernement: https://www.sgg.gov.ma
• Portail National de la Situation Juridique: https://www.mmsp.gov.ma
• Ministère de la Justice: https://www.justice.gov.ma
• Conseil Supérieur du Pouvoir Judiciaire: https://www.cspj.ma

7️⃣ **Question de suivi:**

Termine toujours par une question amicale montrant ta disponibilité pour plus d'aide:
- "Voulez-vous plus de détails sur un point précis? 😊"
- "Avez-vous d'autres questions sur ce sujet?"
- "Voulez-vous que je vous explique une procédure en détail?"
- "Y a-t-il autre chose que je puisse faire pour vous aider?"

Avertissement légal:
Uniquement pour les cas personnels: "⚖️ Note: Ces informations juridiques sont générales et à but éducatif. Pour votre cas spécifique, il est conseillé de consulter un avocat."

Ton style:
- Très détaillé et précis
- Professionnel mais amical
- Utilise des emojis simples
- Apporte une vraie valeur"""
}

class OpenAIHandler(BaseHTTPRequestHandler):

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

        if parsed_path.path == '/' or parsed_path.path == '/health':
            self.send_response(200)
            self._send_cors_headers()
            self.end_headers()
            response = {
                'message': 'Mo7ami Backend with OpenAI',
                'version': '0.1.0',
                'status': 'running',
                'ai_enabled': bool(OPENAI_API_KEY)
            }
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
        else:
            self.send_response(404)
            self._send_cors_headers()
            self.end_headers()

    def do_POST(self):
        """Handle POST requests"""
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')

        try:
            data = json.loads(body) if body else {}
        except:
            data = {}

        parsed_path = urlparse(self.path)

        # Chat endpoint with real OpenAI
        if parsed_path.path == '/api/v1/chat':
            message = data.get('message', '')
            language = data.get('language', 'ar')

            print(f"📨 Chat request: {message[:50]}... (lang: {language})")

            try:
                # Call OpenAI API
                headers = {
                    'Authorization': f'Bearer {OPENAI_API_KEY}',
                    'Content-Type': 'application/json'
                }

                payload = {
                    'model': 'gpt-4o-mini',
                    'messages': [
                        {'role': 'system', 'content': SYSTEM_PROMPTS[language]},
                        {'role': 'user', 'content': message}
                    ],
                    'temperature': 0.7,
                    'max_tokens': 800
                }

                response = requests.post(
                    'https://api.openai.com/v1/chat/completions',
                    headers=headers,
                    json=payload,
                    timeout=30
                )

                if response.status_code == 200:
                    result = response.json()
                    answer = result['choices'][0]['message']['content']

                    # Extract citations (simple pattern matching)
                    citations = []
                    if 'المادة' in answer or 'Article' in answer:
                        citations.append({
                            'source': 'القانون المغربي' if language == 'ar' else 'Droit marocain',
                            'reference': 'مصادر رسمية' if language == 'ar' else 'Sources officielles',
                            'url': 'https://www.sgg.gov.ma'
                        })

                    self.send_response(200)
                    self._send_cors_headers()
                    self.end_headers()

                    response_data = {
                        'answer': answer,
                        'language': language,
                        'citations': citations,
                        'conversation_id': 'openai-conversation',
                        'processing_time': 0.0
                    }

                    self.wfile.write(json.dumps(response_data, ensure_ascii=False).encode('utf-8'))
                    print(f"✅ Response sent: {answer[:50]}...")

                else:
                    raise Exception(f"OpenAI API error: {response.status_code}")

            except Exception as e:
                print(f"❌ Error: {e}")
                self.send_response(500)
                self._send_cors_headers()
                self.end_headers()
                error_response = {
                    'error': str(e),
                    'answer': 'عذراً، حدث خطأ. الرجاء المحاولة مرة أخرى.' if language == 'ar' else 'Désolé, une erreur s\'est produite.',
                    'language': language,
                    'citations': []
                }
                self.wfile.write(json.dumps(error_response, ensure_ascii=False).encode('utf-8'))

        # TTS endpoint with OpenAI
        elif parsed_path.path == '/api/v1/voice/synthesize':
            text = data.get('text', '')
            language = data.get('language', 'ar')
            voice = 'alloy'  # Using alloy voice which works well for multiple languages

            print(f"🔊 TTS request: {text[:50]}... (lang: {language})")

            try:
                headers = {
                    'Authorization': f'Bearer {OPENAI_API_KEY}',
                    'Content-Type': 'application/json'
                }

                payload = {
                    'model': 'tts-1',
                    'input': text,
                    'voice': voice,
                    'response_format': 'mp3'
                }

                response = requests.post(
                    'https://api.openai.com/v1/audio/speech',
                    headers=headers,
                    json=payload,
                    timeout=30
                )

                if response.status_code == 200:
                    self.send_response(200)
                    self.send_header('Content-Type', 'audio/mpeg')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(response.content)
                    print(f"✅ TTS audio sent")
                else:
                    raise Exception(f"OpenAI TTS error: {response.status_code}")

            except Exception as e:
                print(f"❌ TTS Error: {e}")
                self.send_response(500)
                self._send_cors_headers()
                self.end_headers()

        else:
            self.send_response(404)
            self._send_cors_headers()
            self.end_headers()

def run_server(port=8000):
    """Run the OpenAI-powered backend"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, OpenAIHandler)
    print(f"""
    🚀 Mo7ami Backend with OpenAI Started!

    📍 Server: http://localhost:{port}
    🤖 AI: OpenAI GPT-4o-mini + TTS

    ✅ Ready to serve intelligent responses!
    Press Ctrl+C to stop
    """)

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Shutting down server...")
        httpd.shutdown()

if __name__ == '__main__':
    run_server(8000)
