"use client";

import Link from "next/link";
import { MessageSquare, Mic, Shield, BookOpen, ArrowRight, Users } from "lucide-react";
import { useState, useEffect } from "react";

// Rotating questions for each language (changes every 5 seconds)
const QUESTION_SETS = {
  ar: [
    [
      "شنو كايقول القانون الجنائي على السرقة؟",
      "واش عندي الحق نطلب الطلاق؟",
      "كيفاش نسجل شركة جديدة؟"
    ],
    [
      "شنو هي حقوق العامل في المغرب؟",
      "كيفاش نقدم شكاية للبوليس؟",
      "واش كاينة عقوبة على التشهير؟"
    ],
    [
      "شنو هي إجراءات الإرث في المغرب؟",
      "كيفاش نحمي العلامة التجارية ديالي؟",
      "واش يمكن ليا نسترجع الفلوس ديالي من شي منتوج خايب؟"
    ],
    [
      "شنو هي حقوق المستهلك في المغرب؟",
      "كيفاش نخرج من عقد الكراء؟",
      "واش عندي الحق نطلب تعويض من الضمان الاجتماعي؟"
    ]
  ],
  fr: [
    [
      "Que dit le code pénal sur le vol?",
      "Ai-je le droit de demander le divorce?",
      "Comment enregistrer une nouvelle entreprise?"
    ],
    [
      "Quels sont les droits des employés au Maroc?",
      "Comment déposer une plainte à la police?",
      "Y a-t-il une sanction pour la diffamation?"
    ],
    [
      "Quelles sont les procédures de succession?",
      "Comment protéger ma marque commerciale?",
      "Puis-je récupérer mon argent d'un produit défectueux?"
    ],
    [
      "Quels sont les droits des consommateurs?",
      "Comment résilier un contrat de bail?",
      "Ai-je droit à une indemnisation de la CNSS?"
    ]
  ],
  tz: [
    [
      "ⵎⴰⵏⴰⵢⴰ ⵉⵜⵜⵉⵏⵉ ⵓⵏⵥⴰⵕ ⵅⴼ ⵜⴰⴽⴽⵔⴰⴼⵜ?",
      "ⵎⴰⵏⴰⵢⴰ ⵉⵜⵜⵉⵏⵉ ⵓⵏⵥⴰⵕ ⵅⴼ ⵜⴰⵡⵙⴰⵔⵜ?",
      "ⵎⴰⵎⴽ ⴰⴷ ⵙⵙⴽⵔⵖ ⵜⴰⵙⵇⵇⵉⵎⵜ?"
    ],
    [
      "ⵎⴰⵏⴰⵢⴰ ⵉⴳⴰⵏ ⵉⵣⵔⴼⴰⵏ ⵏ ⵓⵎⵙⵡⵓⵔⵉ?",
      "ⵎⴰⵎⴽ ⴰⴷ ⵙⵙⴽⵔⵖ ⴰⵙⵏⵎⴰⵍⴰ?",
      "ⵎⴰⵏⴰⵢⴰ ⵉⴳⴰⵏ ⵉⵣⵔⴼⴰⵏ ⵏ ⵜⵎⵙⵏⵉⵡⵉⵏ?"
    ],
    [
      "ⵎⴰⵎⴽ ⴰⴷ ⵃⴹⵓⵖ ⵜⴰⵎⴰⵜⴰⵔⵜ ⵏ ⵜⵙⵇⵇⵉⵎⵜ?",
      "ⵎⴰⵏⴰⵢⴰ ⵉⴳⴰⵏ ⵉⵣⵔⴼⴰⵏ ⵏ ⵜⵡⵙⴰⵔⵜ?",
      "ⵎⴰⵎⴽ ⴰⴷ ⵙⵙⵉⵡⴹⵖ ⴰⵙⵏⵓⴱⴳ ⵏ ⵜⴽⵔⴰⵢⵜ?"
    ],
    [
      "ⵎⴰⵏⴰⵢⴰ ⵉⴳⴰⵏ ⵉⵣⵔⴼⴰⵏ ⵏ ⵓⵙⵙⵎⵔⵙ?",
      "ⵎⴰⵎⴽ ⴰⴷ ⴼⴼⵖⵖ ⵙⴳ ⵓⵙⵏⵓⴱⴳ?",
      "ⵎⴰⵏⴰⵢⴰ ⵉⴳⴰⵏ ⵉⵣⵔⴼⴰⵏ ⵏ ⵜⵡⵓⵔⵉⵡⵉⵏ?"
    ]
  ]
};

export default function HomePage() {
  const [currentQuestionSet, setCurrentQuestionSet] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState<'ar' | 'fr' | 'tz'>('ar');

  // Rotate questions every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuestionSet((prev) => (prev + 1) % QUESTION_SETS[currentLanguage].length);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentLanguage]);

  const currentQuestions = QUESTION_SETS[currentLanguage][currentQuestionSet];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Moroccan Government-Inspired Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-red-50">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-600 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-600 rounded-full filter blur-3xl"></div>
        </div>
        {/* Moroccan pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30 30 0zm0 10L10 30l20 20 20-20-20-20z' fill='%23006233' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Language Selector */}
        <div className="container mx-auto px-4 pt-6">
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setCurrentLanguage('ar')}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                currentLanguage === 'ar'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-white/80 text-gray-700 hover:bg-white'
              }`}
            >
              العربية
            </button>
            <button
              onClick={() => setCurrentLanguage('fr')}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                currentLanguage === 'fr'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-white/80 text-gray-700 hover:bg-white'
              }`}
            >
              Français
            </button>
            <button
              onClick={() => setCurrentLanguage('tz')}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                currentLanguage === 'tz'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-white/80 text-gray-700 hover:bg-white'
              }`}
            >
              ⵜⴰⵎⴰⵣⵉⵖⵜ
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="text-center max-w-5xl mx-auto">

            {/* Moroccan Avatar Character */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="w-40 h-40 sm:w-48 sm:h-48 bg-gradient-to-br from-emerald-600 to-red-600 rounded-full flex items-center justify-center shadow-2xl border-8 border-white/50 backdrop-blur-sm">
                  <span className="text-7xl sm:text-8xl">👨‍⚖️</span>
                </div>
                {/* Moroccan star decoration */}
                <div className="absolute -top-2 -right-2 w-12 h-12 text-yellow-500">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Logo/Title */}
            <div className="mb-8">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-emerald-800 mb-4 drop-shadow-sm">
                {currentLanguage === 'ar' && 'محامي'}
                {currentLanguage === 'fr' && 'Mo7ami'}
                {currentLanguage === 'tz' && 'ⴰⵎⴰⵢⵏⴰⵙ'}
                <span className="block text-3xl sm:text-4xl lg:text-5xl mt-3 text-red-700">
                  {currentLanguage === 'ar' && 'مساعدك القانوني الذكي'}
                  {currentLanguage === 'fr' && 'Votre assistant juridique intelligent'}
                  {currentLanguage === 'tz' && 'ⴰⵎⵙⵡⵓⵔⵉ ⵏⵏⴽ ⵏ ⵓⵏⵥⴰⵕ'}
                </span>
              </h1>
            </div>

            {/* Description */}
            <div className="mb-12 max-w-3xl mx-auto">
              <p className="text-xl sm:text-2xl text-gray-700 leading-relaxed font-medium">
                {currentLanguage === 'ar' && 'اسأل عن القانون المغربي بالدارجة أو الأمازيغية أو الفرنسية واحصل على إجابات دقيقة مع المراجع الرسمية'}
                {currentLanguage === 'fr' && 'Posez des questions sur le droit marocain en darija, amazigh ou français et obtenez des réponses précises avec des références officielles'}
                {currentLanguage === 'tz' && 'ⵙⵙⵇⵙⴰ ⵅⴰⴼ ⵓⵏⵥⴰⵕ ⴰⵎⵖⵔⵉⴱⵉ ⵙ ⵜⴷⴰⵔⵉⵊⵜ ⵏⵖ ⵜⴰⵎⴰⵣⵉⵖⵜ ⵏⵖ ⵜⴼⵕⴰⵏⵙⵉⵙⵜ'}
              </p>
            </div>

            {/* MAIN FOCUS: CTA Buttons */}
            <div className="mb-16 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
                <Link
                  href="/chat"
                  className="group px-10 py-5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-2xl font-bold text-xl sm:text-2xl transition-all shadow-2xl hover:shadow-emerald-500/50 hover:scale-105 transform flex items-center justify-center gap-3"
                >
                  {currentLanguage === 'ar' && '🚀 ابدأ المحادثة الآن'}
                  {currentLanguage === 'fr' && '🚀 Commencer maintenant'}
                  {currentLanguage === 'tz' && '🚀 ⴱⴷⵓ ⴷⵖⵉ'}
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/signin"
                  className="px-8 py-4 bg-white hover:bg-gray-50 text-emerald-700 border-3 border-emerald-600 rounded-xl font-bold text-lg sm:text-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Users className="w-5 h-5" />
                  {currentLanguage === 'ar' && 'تسجيل الدخول'}
                  {currentLanguage === 'fr' && 'Se connecter'}
                  {currentLanguage === 'tz' && 'ⴽⵛⵎ'}
                </Link>
              </div>
            </div>

            {/* Dynamic Rotating Example Questions */}
            <div className="mb-16">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                {currentLanguage === 'ar' && '📝 أمثلة على الأسئلة:'}
                {currentLanguage === 'fr' && '📝 Exemples de questions:'}
                {currentLanguage === 'tz' && '📝 ⵉⵎⴷⵢⴰⵜⵏ ⵏ ⵉⵙⵇⵙⵉⵜⵏ:'}
              </h3>
              <div className="grid gap-4 max-w-3xl mx-auto">
                {currentQuestions.map((question, i) => (
                  <div
                    key={`${currentQuestionSet}-${i}`}
                    className="p-4 bg-white/90 backdrop-blur-sm rounded-xl border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02] transform animate-fade-in"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <p className="text-gray-800 font-medium">{question}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-gray-500 flex items-center justify-center gap-2">
                <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                {currentLanguage === 'ar' && 'تتغير الأسئلة تلقائياً كل 5 ثواني'}
                {currentLanguage === 'fr' && 'Les questions changent automatiquement toutes les 5 secondes'}
                {currentLanguage === 'tz' && 'ⵜⵜⵎⵙⵙⵉⵏⵜⵏ ⵜⵙⵇⵙⵉⵜⵉⵏ ⵙ ⵡⵓⵙⵙⴰⵏ'}
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              <FeatureCard
                icon={<Mic className="w-10 h-10" />}
                title={currentLanguage === 'ar' ? 'تفاعل صوتي' : currentLanguage === 'fr' ? 'Interaction vocale' : 'ⴰⵎⵙⴰⵡⴰⵍ ⵙ ⵉⵎⵙⵍⵉ'}
                description={currentLanguage === 'ar' ? 'اسأل بصوتك واستمع للإجابة' : currentLanguage === 'fr' ? 'Parlez et écoutez les réponses' : 'ⵙⵙⵇⵙⴰ ⵙ ⵉⵎⵙⵍⵉ ⵏⵏⴽ'}
              />
              <FeatureCard
                icon={<MessageSquare className="w-10 h-10" />}
                title={currentLanguage === 'ar' ? '3 لغات' : currentLanguage === 'fr' ? '3 langues' : '3 ⵜⵓⵜⵍⴰⵢⵉⵏ'}
                description={currentLanguage === 'ar' ? 'العربية، الأمازيغية، الفرنسية' : currentLanguage === 'fr' ? 'Arabe, Amazigh, Français' : 'ⵜⴰⵄⵔⴰⴱⵜ، ⵜⴰⵎⴰⵣⵉⵖⵜ، ⵜⴰⴼⵕⴰⵏⵙⵉⵙⵜ'}
              />
              <FeatureCard
                icon={<Shield className="w-10 h-10" />}
                title={currentLanguage === 'ar' ? 'مراجع رسمية' : currentLanguage === 'fr' ? 'Sources officielles' : 'ⵉⵙⵓⵖⴰⵍ ⵓⵏⵚⵉⴱⵏ'}
                description={currentLanguage === 'ar' ? 'الجريدة الرسمية المغربية' : currentLanguage === 'fr' ? 'Bulletin Officiel du Maroc' : 'ⴰⵖⵎⵉⵙ ⵓⵏⵚⵉⴱ'}
              />
              <FeatureCard
                icon={<BookOpen className="w-10 h-10" />}
                title={currentLanguage === 'ar' ? '12+ مجال' : currentLanguage === 'fr' ? '12+ domaines' : '12+ ⵉⴳⵔⴰⵏ'}
                description={currentLanguage === 'ar' ? 'جنائي، مدني، أسري، عمل...' : currentLanguage === 'fr' ? 'Pénal, civil, famille, travail...' : 'ⴰⵣⵔⴼⴰⵏ، ⵜⴰⵡⵙⴰⵔⵜ، ⵜⴰⵡⵓⵔⵉ...'}
              />
            </div>

            {/* Smart Legal Disclaimer - Morocco Compliant */}
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Primary Disclaimer */}
              <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl shadow-lg">
                <div className="flex items-start gap-3 mb-3">
                  <Shield className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                  <div className="text-left">
                    {currentLanguage === 'ar' && (
                      <>
                        <p className="text-base font-bold text-amber-900 mb-2">⚖️ تنبيه قانوني مهم</p>
                        <p className="text-sm text-amber-800 leading-relaxed">
                          محامي هي منصة <strong>تعليمية</strong> توفر معلومات قانونية عامة فقط. نحن <strong>لا نقدم استشارات قانونية مهنية</strong> ولا نستبدل محامياً مؤهلاً.
                          جميع المعلومات المقدمة خاضعة للقانون المغربي رقم <strong>09-08</strong> المتعلق بحماية الأشخاص الذاتيين تجاه معالجة المعطيات ذات الطابع الشخصي.
                        </p>
                      </>
                    )}
                    {currentLanguage === 'fr' && (
                      <>
                        <p className="text-base font-bold text-amber-900 mb-2">⚖️ Avertissement légal important</p>
                        <p className="text-sm text-amber-800 leading-relaxed">
                          Mo7ami est une plateforme <strong>éducative</strong> qui fournit des informations juridiques générales uniquement. Nous <strong>ne fournissons pas de conseils juridiques professionnels</strong> et ne remplaçons pas un avocat qualifié.
                          Toutes les informations fournies sont soumises à la loi marocaine n° <strong>09-08</strong> relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel.
                        </p>
                      </>
                    )}
                    {currentLanguage === 'tz' && (
                      <>
                        <p className="text-base font-bold text-amber-900 mb-2">⚖️ ⴰⵍⵖⵓ ⵏ ⵓⵏⵥⴰⵕ</p>
                        <p className="text-sm text-amber-800 leading-relaxed">
                          ⴰⵎⴰⵢⵏⴰⵙ ⵉⴳⴰ ⵜⴰⵏⴼⵍⵉⵜ ⵏ ⵓⵙⵙⵍⵎⴷ. ⵓⵔ ⵏⵙⵙⵎⴰⵔⴰⵙ ⴰⵎⴰⵢⵏⴰⵙ ⵏ ⵓⵎⵙⵙⵓⴷⵙ. ⴰⵏⵥⴰⵕ ⴰⵎⵖⵔⴰⴱⵉ 09-08.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Social Consciousness Message */}
              <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl">
                <div className="text-center">
                  {currentLanguage === 'ar' && (
                    <>
                      <p className="text-lg font-bold text-emerald-900 mb-2">🇲🇦 نحو وعي قانوني أفضل للمغاربة</p>
                      <p className="text-sm text-emerald-800">
                        معرفة حقوقك وواجباتك القانونية هي الخطوة الأولى نحو مجتمع أكثر عدلاً ووعياً.
                        <strong> محامي</strong> تساهم في رفع الوعي القانوني وتمكين المواطنين من فهم القوانين التي تحكمهم.
                      </p>
                    </>
                  )}
                  {currentLanguage === 'fr' && (
                    <>
                      <p className="text-lg font-bold text-emerald-900 mb-2">🇲🇦 Vers une meilleure conscience juridique pour les Marocains</p>
                      <p className="text-sm text-emerald-800">
                        Connaître vos droits et devoirs juridiques est la première étape vers une société plus juste et consciente.
                        <strong> Mo7ami</strong> contribue à élever la conscience juridique et à permettre aux citoyens de comprendre les lois qui les régissent.
                      </p>
                    </>
                  )}
                  {currentLanguage === 'tz' && (
                    <>
                      <p className="text-lg font-bold text-emerald-900 mb-2">🇲🇦 ⵖⵔ ⵜⴰⵏⴰⴼⵓⵜ ⵜⴰⵏⵥⴰⴹⵜ ⵉⴼⵓⵍⴽⵉⵏ</p>
                      <p className="text-sm text-emerald-800">
                        ⴰⵙⵙⵏ ⵏ ⵉⵣⵔⴼⴰⵏ ⵏⵏⴽ ⴷ ⵜⵡⵓⵔⵉⵡⵉⵏ ⵏⵏⴽ ⵉⴳⴰ ⵜⴰⵙⵓⵜⵍⵜ ⵜⴰⵎⵣⵡⴰⵔⵓⵜ ⵖⵔ ⵜⵎⵜⵜⵉ ⵜⴰⵏⵥⴰⴹⵜ.
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* When to Consult a Lawyer */}
              <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-900">
                  {currentLanguage === 'ar' && (
                    <>
                      <strong>🏛️ متى يجب استشارة محامٍ؟</strong> عند مواجهة قضية قانونية شخصية، نزاع قضائي، أو حاجة لتمثيل قانوني رسمي.
                      قائمة المحامين المعتمدين متوفرة على موقع <a href="https://www.justice.gov.ma" className="underline text-blue-700 hover:text-blue-900" target="_blank" rel="noopener">وزارة العدل</a>.
                    </>
                  )}
                  {currentLanguage === 'fr' && (
                    <>
                      <strong>🏛️ Quand consulter un avocat?</strong> En cas de litige personnel, procédure judiciaire, ou besoin de représentation légale officielle.
                      La liste des avocats agréés est disponible sur le site du <a href="https://www.justice.gov.ma" className="underline text-blue-700 hover:text-blue-900" target="_blank" rel="noopener">Ministère de la Justice</a>.
                    </>
                  )}
                  {currentLanguage === 'tz' && (
                    <>
                      <strong>🏛️ ⵎⴰⵎⴽ ⴰⴷ ⵜⵙⵙⵇⵙⴰⴷ ⴰⵎⴰⵢⵏⴰⵙ?</strong> ⵎⴽ ⵜⵍⵍⴰⴷ ⵜⵓⴳⵜ ⵜⴰⵏⵥⴰⴹⵜ, ⵜⴰⵎⵍⵉⵍⵜ ⵜⴰⵏⵥⴰⴹⵜ, ⵏⵖ ⵜⵙⵙⵓⵜⵔⴷ ⴰⵏⵎⵀⴰⵍ ⵓⵏⵚⵉⴱ.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white py-8 mt-20">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm opacity-90">
              {currentLanguage === 'ar' && '© 2024 محامي - كل الحقوق محفوظة | مبادرة لرفع الوعي القانوني في المغرب'}
              {currentLanguage === 'fr' && '© 2024 Mo7ami - Tous droits réservés | Initiative pour élever la conscience juridique au Maroc'}
              {currentLanguage === 'tz' && '© 2024 ⴰⵎⴰⵢⵏⴰⵙ - ⴰⴽⴽ ⵉⵣⵔⴼⴰⵏ ⵃⴹⵓⵏⵉⵏ'}
            </p>
            <div className="mt-4 flex justify-center gap-6 text-sm">
              <a href="https://www.sgg.gov.ma" target="_blank" rel="noopener" className="hover:text-emerald-200 transition-colors">
                {currentLanguage === 'ar' && 'الأمانة العامة للحكومة'}
                {currentLanguage === 'fr' && 'SGG'}
                {currentLanguage === 'tz' && 'ⴰⵙⵖⵏⵓ ⴰⵎⴰⵜⴰⵢ'}
              </a>
              <a href="https://www.justice.gov.ma" target="_blank" rel="noopener" className="hover:text-emerald-200 transition-colors">
                {currentLanguage === 'ar' && 'وزارة العدل'}
                {currentLanguage === 'fr' && 'Ministère de la Justice'}
                {currentLanguage === 'tz' && 'ⵜⴰⵏⴱⴰⴹⵜ ⵏ ⵓⵏⵥⴰⵕ'}
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 transform border border-emerald-100">
      <div className="text-emerald-600 mb-4 flex justify-center">{icon}</div>
      <h3 className="font-bold text-gray-900 mb-2 text-lg">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
