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
      {/* Subtle Mosaic Background */}
      <div className="absolute inset-0 bg-gray-50">
        {/* Moroccan Zellige/Mosaic Pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23134E4A' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 0h40v40H0V0zm40 40h40v40H40V40zm0-40h2l-2 2V0zm0 4l4-4h2l-6 6V4zm0 4l8-8h2L40 10V8zm0 4L52 0h2L40 14v-2zm0 4L56 0h2L40 18v-2zm0 4L60 0h2L40 22v-2zm0 4L64 0h2L40 26v-2zm0 4L68 0h2L40 30v-2zm0 4L72 0h2L40 34v-2zm0 4L76 0h2L40 38v-2zm0 4L80 0v2L42 40h-2zm4 0L80 4v2L46 40h-2zm4 0L80 8v2L50 40h-2zm4 0l28-28v2L54 40h-2zm4 0l24-24v2L58 40h-2zm4 0l20-20v2L62 40h-2zm4 0l16-16v2L66 40h-2zm4 0l12-12v2L70 40h-2zm4 0l8-8v2l-6 6h-2zm4 0l4-4v2l-2 2h-2z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '80px 80px'
        }}></div>
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/30 via-gray-50 to-slate-100/30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Language Selector */}
        <div className="container mx-auto px-4 pt-6">
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setCurrentLanguage('ar')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentLanguage === 'ar'
                  ? 'bg-teal-700 text-white'
                  : 'bg-white/90 text-gray-700 hover:bg-white border border-gray-200'
              }`}
            >
              العربية
            </button>
            <button
              onClick={() => setCurrentLanguage('fr')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentLanguage === 'fr'
                  ? 'bg-teal-700 text-white'
                  : 'bg-white/90 text-gray-700 hover:bg-white border border-gray-200'
              }`}
            >
              Français
            </button>
            <button
              onClick={() => setCurrentLanguage('tz')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentLanguage === 'tz'
                  ? 'bg-teal-700 text-white'
                  : 'bg-white/90 text-gray-700 hover:bg-white border border-gray-200'
              }`}
            >
              ⵜⴰⵎⴰⵣⵉⵖⵜ
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="text-center max-w-5xl mx-auto">

            {/* Professional Logo/Icon */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 bg-white rounded-2xl shadow-xl border border-gray-200 flex items-center justify-center">
                  <svg className="w-20 h-20 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Logo/Title */}
            <div className="mb-8">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-800 mb-4">
                {currentLanguage === 'ar' && 'محامي'}
                {currentLanguage === 'fr' && 'Mo7ami'}
                {currentLanguage === 'tz' && 'ⴰⵎⴰⵢⵏⴰⵙ'}
                <span className="block text-2xl sm:text-3xl lg:text-4xl mt-3 text-teal-700 font-normal">
                  {currentLanguage === 'ar' && 'مساعدك القانوني الذكي'}
                  {currentLanguage === 'fr' && 'Votre assistant juridique intelligent'}
                  {currentLanguage === 'tz' && 'ⴰⵎⵙⵡⵓⵔⵉ ⵏⵏⴽ ⵏ ⵓⵏⵥⴰⵕ'}
                </span>
              </h1>
            </div>

            {/* Description */}
            <div className="mb-12 max-w-3xl mx-auto">
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                {currentLanguage === 'ar' && 'اسأل عن القانون المغربي بالدارجة أو الأمازيغية أو الفرنسية واحصل على إجابات دقيقة مع المراجع الرسمية'}
                {currentLanguage === 'fr' && 'Posez des questions sur le droit marocain en darija, amazigh ou français et obtenez des réponses précises avec des références officielles'}
                {currentLanguage === 'tz' && 'ⵙⵙⵇⵙⴰ ⵅⴰⴼ ⵓⵏⵥⴰⵕ ⴰⵎⵖⵔⵉⴱⵉ ⵙ ⵜⴷⴰⵔⵉⵊⵜ ⵏⵖ ⵜⴰⵎⴰⵣⵉⵖⵜ ⵏⵖ ⵜⴼⵕⴰⵏⵙⵉⵙⵜ'}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="mb-16 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
                <Link
                  href="/chat"
                  className="group px-10 py-4 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-semibold text-lg sm:text-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                >
                  {currentLanguage === 'ar' && 'ابدأ المحادثة'}
                  {currentLanguage === 'fr' && 'Commencer'}
                  {currentLanguage === 'tz' && 'ⴱⴷⵓ ⴷⵖⵉ'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/signin"
                  className="px-8 py-3 bg-white hover:bg-gray-50 text-teal-700 border-2 border-teal-700 rounded-xl font-semibold text-base sm:text-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
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
              <h3 className="text-lg font-semibold text-gray-700 mb-6">
                {currentLanguage === 'ar' && 'أمثلة على الأسئلة:'}
                {currentLanguage === 'fr' && 'Exemples de questions:'}
                {currentLanguage === 'tz' && 'ⵉⵎⴷⵢⴰⵜⵏ ⵏ ⵉⵙⵇⵙⵉⵜⵏ:'}
              </h3>
              <div className="grid gap-3 max-w-3xl mx-auto">
                {currentQuestions.map((question, i) => {
                  const targetLang = currentLanguage === 'fr' ? 'fr' : 'ar';
                  return (
                    <Link
                      key={`${currentQuestionSet}-${i}`}
                      href={`/chat?prompt=${encodeURIComponent(question)}&lang=${targetLang}`}
                      className="p-4 bg-white rounded-lg border border-gray-200 hover:border-teal-600 hover:shadow-md transition-all cursor-pointer animate-fade-in"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <p className="text-gray-700">{question}</p>
                    </Link>
                  );
                })}
              </div>
              <p className="mt-4 text-sm text-gray-500 flex items-center justify-center gap-2">
                <span className="inline-block w-2 h-2 bg-teal-600 rounded-full animate-pulse"></span>
                {currentLanguage === 'ar' && 'تتغير الأسئلة تلقائياً كل 5 ثواني'}
                {currentLanguage === 'fr' && 'Les questions changent automatiquement toutes les 5 secondes'}
                {currentLanguage === 'tz' && 'ⵜⵜⵎⵙⵙⵉⵏⵜⵏ ⵜⵙⵇⵙⵉⵜⵉⵏ ⵙ ⵡⵓⵙⵙⴰⵏ'}
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              <FeatureCard
                icon={<Mic className="w-8 h-8" />}
                title={currentLanguage === 'ar' ? 'تفاعل صوتي' : currentLanguage === 'fr' ? 'Interaction vocale' : 'ⴰⵎⵙⴰⵡⴰⵍ ⵙ ⵉⵎⵙⵍⵉ'}
                description={currentLanguage === 'ar' ? 'اسأل بصوتك واستمع للإجابة' : currentLanguage === 'fr' ? 'Parlez et écoutez les réponses' : 'ⵙⵙⵇⵙⴰ ⵙ ⵉⵎⵙⵍⵉ ⵏⵏⴽ'}
              />
              <FeatureCard
                icon={<MessageSquare className="w-8 h-8" />}
                title={currentLanguage === 'ar' ? '3 لغات' : currentLanguage === 'fr' ? '3 langues' : '3 ⵜⵓⵜⵍⴰⵢⵉⵏ'}
                description={currentLanguage === 'ar' ? 'العربية، الأمازيغية، الفرنسية' : currentLanguage === 'fr' ? 'Arabe, Amazigh, Français' : 'ⵜⴰⵄⵔⴰⴱⵜ، ⵜⴰⵎⴰⵣⵉⵖⵜ، ⵜⴰⴼⵕⴰⵏⵙⵉⵙⵜ'}
              />
              <FeatureCard
                icon={<Shield className="w-8 h-8" />}
                title={currentLanguage === 'ar' ? 'مراجع رسمية' : currentLanguage === 'fr' ? 'Sources officielles' : 'ⵉⵙⵓⵖⴰⵍ ⵓⵏⵚⵉⴱⵏ'}
                description={currentLanguage === 'ar' ? 'الجريدة الرسمية المغربية' : currentLanguage === 'fr' ? 'Bulletin Officiel du Maroc' : 'ⴰⵖⵎⵉⵙ ⵓⵏⵚⵉⴱ'}
              />
              <FeatureCard
                icon={<BookOpen className="w-8 h-8" />}
                title={currentLanguage === 'ar' ? '12+ مجال' : currentLanguage === 'fr' ? '12+ domaines' : '12+ ⵉⴳⵔⴰⵏ'}
                description={currentLanguage === 'ar' ? 'جنائي، مدني، أسري، عمل...' : currentLanguage === 'fr' ? 'Pénal, civil, famille, travail...' : 'ⴰⵣⵔⴼⴰⵏ، ⵜⴰⵡⵙⴰⵔⵜ، ⵜⴰⵡⵓⵔⵉ...'}
              />
            </div>

            {/* Smart Legal Disclaimer - Morocco Compliant */}
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Primary Disclaimer */}
              <div className="p-6 bg-white border border-gray-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-teal-700 flex-shrink-0 mt-1" />
                  <div className="text-left">
                    {currentLanguage === 'ar' && (
                      <>
                        <p className="text-sm font-semibold text-gray-800 mb-2">تنبيه قانوني مهم</p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          محامي هي منصة <strong>تعليمية</strong> توفر معلومات قانونية عامة فقط. نحن <strong>لا نقدم استشارات قانونية مهنية</strong> ولا نستبدل محامياً مؤهلاً.
                          جميع المعلومات المقدمة خاضعة للقانون المغربي رقم <strong>09-08</strong> المتعلق بحماية الأشخاص الذاتيين تجاه معالجة المعطيات ذات الطابع الشخصي.
                        </p>
                      </>
                    )}
                    {currentLanguage === 'fr' && (
                      <>
                        <p className="text-sm font-semibold text-gray-800 mb-2">Avertissement légal important</p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Mo7ami est une plateforme <strong>éducative</strong> qui fournit des informations juridiques générales uniquement. Nous <strong>ne fournissons pas de conseils juridiques professionnels</strong> et ne remplaçons pas un avocat qualifié.
                          Toutes les informations fournies sont soumises à la loi marocaine n° <strong>09-08</strong> relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel.
                        </p>
                      </>
                    )}
                    {currentLanguage === 'tz' && (
                      <>
                        <p className="text-sm font-semibold text-gray-800 mb-2">ⴰⵍⵖⵓ ⵏ ⵓⵏⵥⴰⵕ</p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          ⴰⵎⴰⵢⵏⴰⵙ ⵉⴳⴰ ⵜⴰⵏⴼⵍⵉⵜ ⵏ ⵓⵙⵙⵍⵎⴷ. ⵓⵔ ⵏⵙⵙⵎⴰⵔⴰⵙ ⴰⵎⴰⵢⵏⴰⵙ ⵏ ⵓⵎⵙⵙⵓⴷⵙ. ⴰⵏⵥⴰⵕ ⴰⵎⵖⵔⴰⴱⵉ 09-08.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Social Consciousness Message */}
              <div className="p-5 bg-teal-50 border border-teal-200 rounded-xl">
                <div className="text-center">
                  {currentLanguage === 'ar' && (
                    <>
                      <p className="text-base font-semibold text-gray-800 mb-2">نحو وعي قانوني أفضل للمغاربة</p>
                      <p className="text-sm text-gray-600">
                        معرفة حقوقك وواجباتك القانونية هي الخطوة الأولى نحو مجتمع أكثر عدلاً ووعياً.
                        <strong> محامي</strong> تساهم في رفع الوعي القانوني وتمكين المواطنين من فهم القوانين التي تحكمهم.
                      </p>
                    </>
                  )}
                  {currentLanguage === 'fr' && (
                    <>
                      <p className="text-base font-semibold text-gray-800 mb-2">Vers une meilleure conscience juridique pour les Marocains</p>
                      <p className="text-sm text-gray-600">
                        Connaître vos droits et devoirs juridiques est la première étape vers une société plus juste et consciente.
                        <strong> Mo7ami</strong> contribue à élever la conscience juridique et à permettre aux citoyens de comprendre les lois qui les régissent.
                      </p>
                    </>
                  )}
                  {currentLanguage === 'tz' && (
                    <>
                      <p className="text-base font-semibold text-gray-800 mb-2">ⵖⵔ ⵜⴰⵏⴰⴼⵓⵜ ⵜⴰⵏⵥⴰⴹⵜ ⵉⴼⵓⵍⴽⵉⵏ</p>
                      <p className="text-sm text-gray-600">
                        ⴰⵙⵙⵏ ⵏ ⵉⵣⵔⴼⴰⵏ ⵏⵏⴽ ⴷ ⵜⵡⵓⵔⵉⵡⵉⵏ ⵏⵏⴽ ⵉⴳⴰ ⵜⴰⵙⵓⵜⵍⵜ ⵜⴰⵎⵣⵡⴰⵔⵓⵜ ⵖⵔ ⵜⵎⵜⵜⵉ ⵜⴰⵏⵥⴰⴹⵜ.
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* When to Consult a Lawyer */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  {currentLanguage === 'ar' && (
                    <>
                      <strong>متى يجب استشارة محامٍ؟</strong> عند مواجهة قضية قانونية شخصية، نزاع قضائي، أو حاجة لتمثيل قانوني رسمي.
                      قائمة المحامين المعتمدين متوفرة على موقع <a href="https://www.justice.gov.ma" className="underline text-teal-700 hover:text-teal-800" target="_blank" rel="noopener">وزارة العدل</a>.
                    </>
                  )}
                  {currentLanguage === 'fr' && (
                    <>
                      <strong>Quand consulter un avocat?</strong> En cas de litige personnel, procédure judiciaire, ou besoin de représentation légale officielle.
                      La liste des avocats agréés est disponible sur le site du <a href="https://www.justice.gov.ma" className="underline text-teal-700 hover:text-teal-800" target="_blank" rel="noopener">Ministère de la Justice</a>.
                    </>
                  )}
                  {currentLanguage === 'tz' && (
                    <>
                      <strong>ⵎⴰⵎⴽ ⴰⴷ ⵜⵙⵙⵇⵙⴰⴷ ⴰⵎⴰⵢⵏⴰⵙ?</strong> ⵎⴽ ⵜⵍⵍⴰⴷ ⵜⵓⴳⵜ ⵜⴰⵏⵥⴰⴹⵜ, ⵜⴰⵎⵍⵉⵍⵜ ⵜⴰⵏⵥⴰⴹⵜ, ⵏⵖ ⵜⵙⵙⵓⵜⵔⴷ ⴰⵏⵎⵀⴰⵍ ⵓⵏⵚⵉⴱ.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-slate-800 text-white py-8 mt-20">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm opacity-90">
              {currentLanguage === 'ar' && '© 2024 محامي - كل الحقوق محفوظة | مبادرة لرفع الوعي القانوني في المغرب'}
              {currentLanguage === 'fr' && '© 2024 Mo7ami - Tous droits réservés | Initiative pour élever la conscience juridique au Maroc'}
              {currentLanguage === 'tz' && '© 2024 ⴰⵎⴰⵢⵏⴰⵙ - ⴰⴽⴽ ⵉⵣⵔⴼⴰⵏ ⵃⴹⵓⵏⵉⵏ'}
            </p>
            <div className="mt-4 flex justify-center gap-6 text-sm">
              <a href="https://www.sgg.gov.ma" target="_blank" rel="noopener" className="hover:text-teal-300 transition-colors">
                {currentLanguage === 'ar' && 'الأمانة العامة للحكومة'}
                {currentLanguage === 'fr' && 'SGG'}
                {currentLanguage === 'tz' && 'ⴰⵙⵖⵏⵓ ⴰⵎⴰⵜⴰⵢ'}
              </a>
              <a href="https://www.justice.gov.ma" target="_blank" rel="noopener" className="hover:text-teal-300 transition-colors">
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
    <div className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100">
      <div className="text-teal-700 mb-3 flex justify-center">{icon}</div>
      <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
