import Link from "next/link";
import { MessageSquare, Mic, Shield, BookOpen } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Moroccan Avatar Character */}
          <div className="mb-6 flex justify-center">
            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-2xl border-4 border-white">
              <span className="text-6xl sm:text-7xl">👨‍⚖️</span>
            </div>
          </div>

          {/* Logo/Title */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-900 mb-2 sm:mb-4">
              محامي
              <span className="block text-2xl sm:text-3xl lg:text-4xl mt-2 text-primary-600">Mo7ami</span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 font-arabic">
              مساعدك القانوني الذكي
            </p>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mt-1 sm:mt-2">
              Votre assistant juridique intelligent
            </p>
          </div>

          {/* Description */}
          <div className="mb-12 space-y-4">
            <p className="text-lg text-gray-700 leading-relaxed font-arabic">
              اسأل عن القانون المغربي بالدارجة أو بالفرنسية واحصل على إجابات دقيقة مع المراجع الرسمية
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Posez des questions sur le droit marocain en darija ou en français et obtenez des réponses précises avec des références officielles
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/chat"
              className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold text-lg transition-colors shadow-lg hover:shadow-xl"
            >
              ابدأ المحادثة / Commencer
            </Link>
            <Link
              href="/auth/signin"
              className="px-8 py-4 bg-white hover:bg-gray-50 text-primary-600 border-2 border-primary-600 rounded-lg font-bold text-lg transition-colors"
            >
              تسجيل الدخول / Se connecter
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            <FeatureCard
              icon={<Mic className="w-8 h-8" />}
              titleAr="تفاعل صوتي"
              titleFr="Interaction vocale"
              descriptionAr="اسأل بصوتك واستمع للإجابة"
              descriptionFr="Parlez et écoutez les réponses"
            />
            <FeatureCard
              icon={<MessageSquare className="w-8 h-8" />}
              titleAr="دعم متعدد اللغات"
              titleFr="Multilingue"
              descriptionAr="العربية والدارجة والفرنسية"
              descriptionFr="Arabe, Darija et Français"
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              titleAr="مراجع رسمية"
              titleFr="Sources officielles"
              descriptionAr="إجابات مستندة إلى الجريدة الرسمية"
              descriptionFr="Réponses basées sur le BO"
            />
            <FeatureCard
              icon={<BookOpen className="w-8 h-8" />}
              titleAr="12+ مجال قانوني"
              titleFr="12+ domaines"
              descriptionAr="الجنائي، المدني، الأسرة، الشغل..."
              descriptionFr="Pénal, civil, famille, travail..."
            />
          </div>

          {/* Legal Disclaimer */}
          <div className="mt-16 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-gray-700 font-arabic mb-2">
              <strong>تنبيه:</strong> هذه المنصة توفر معلومات قانونية للأغراض التعليمية فقط، وليست استشارة قانونية مهنية.
            </p>
            <p className="text-sm text-gray-600">
              <strong>Avertissement:</strong> Cette plateforme fournit des informations juridiques à des fins éducatives uniquement, et non des conseils juridiques professionnels.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  titleAr,
  titleFr,
  descriptionAr,
  descriptionFr,
}: {
  icon: React.ReactNode;
  titleAr: string;
  titleFr: string;
  descriptionAr: string;
  descriptionFr: string;
}) {
  return (
    <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
      <div className="text-primary-600 mb-4 flex justify-center">{icon}</div>
      <h3 className="font-bold text-gray-900 mb-2 font-arabic">{titleAr}</h3>
      <p className="text-sm text-gray-600 mb-3">{titleFr}</p>
      <p className="text-xs text-gray-500 font-arabic mb-1">{descriptionAr}</p>
      <p className="text-xs text-gray-500">{descriptionFr}</p>
    </div>
  );
}
