import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Zap, Target, FileCode, Brain, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#FAFAFA]" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E5E5] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#002FA7] flex items-center justify-center">
              <span className="text-white font-black text-lg">B</span>
            </div>
            <span className="text-xl font-bold text-[#1A1A1A] tracking-tight">BuildMap</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button 
                variant="ghost" 
                className="text-[#666666] hover:text-[#1A1A1A] hover:bg-[#F5F5F5]"
                data-testid="header-login-btn"
              >
                تسجيل الدخول
              </Button>
            </Link>
            <Link to="/register">
              <Button 
                className="bg-[#002FA7] hover:bg-[#002480] text-white font-bold px-6 rounded-none"
                data-testid="header-register-btn"
              >
                ابدأ الآن
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E6EAF6] border border-[#002FA7]/20">
                <Sparkles className="w-4 h-4 text-[#002FA7]" />
                <span className="text-sm font-medium text-[#002FA7]">مدعوم بالذكاء الاصطناعي</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-[#1A1A1A] leading-tight">
                حوّل أفكارك العشوائية
                <br />
                <span className="text-[#002FA7]">إلى مشاريع جاهزة</span>
              </h1>
              <p className="text-lg text-[#666666] leading-relaxed max-w-lg">
                منصة ذكية تساعدك في تحويل فكرتك من مجرد خاطرة إلى خطة تقنية متكاملة وجاهزة للتنفيذ، من خلال حوار تفاعلي مع الذكاء الاصطناعي.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register">
                  <Button 
                    className="bg-[#002FA7] hover:bg-[#002480] text-white font-bold px-8 py-6 text-lg rounded-none flex items-center gap-2"
                    data-testid="hero-start-btn"
                  >
                    ابدأ مجاناً
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button 
                    variant="outline"
                    className="border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#F5F5F5] font-bold px-8 py-6 text-lg rounded-none"
                    data-testid="hero-login-btn"
                  >
                    لدي حساب
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square relative">
                <img 
                  src="https://static.prod-images.emergentagent.com/jobs/b878669f-29c7-48e6-a252-07344449ce6e/images/113d56e53b5a78e8d35bcd15c548bcdb4ec9ecc61997cfc6ac208a9f0efd2d82.png"
                  alt="من الفوضى إلى النظام"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#FAFAFA] to-transparent opacity-30"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white border-t border-b border-[#E5E5E5] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight mb-4">
              كيف يعمل BuildMap؟
            </h2>
            <p className="text-[#666666] text-lg max-w-2xl mx-auto">
              ثلاث خطوات بسيطة لتحويل فكرتك إلى مشروع منظم
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-0 border border-[#E5E5E5]">
            <div className="p-8 border-l border-[#E5E5E5] hover:bg-[#F5F5F5] transition-colors">
              <div className="w-12 h-12 bg-[#002FA7] flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-bold text-[#999999] tracking-wider mb-2">01</div>
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-3">اطرح فكرتك</h3>
              <p className="text-[#666666]">
                شارك فكرتك مهما كانت عشوائية أو غير مكتملة. المساعد الذكي سيساعدك في صقلها.
              </p>
            </div>
            
            <div className="p-8 border-l border-[#E5E5E5] hover:bg-[#F5F5F5] transition-colors">
              <div className="w-12 h-12 bg-[#002FA7] flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-bold text-[#999999] tracking-wider mb-2">02</div>
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-3">أجب على الأسئلة</h3>
              <p className="text-[#666666]">
                سيطرح عليك المساعد أسئلة ذكية ومتدرجة لفهم فكرتك بشكل أعمق.
              </p>
            </div>
            
            <div className="p-8 hover:bg-[#F5F5F5] transition-colors">
              <div className="w-12 h-12 bg-[#002FA7] flex items-center justify-center mb-6">
                <FileCode className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-bold text-[#999999] tracking-wider mb-2">03</div>
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-3">احصل على المخرجات</h3>
              <p className="text-[#666666]">
                استلم ملفات جاهزة: خطة العمل، المتطلبات التقنية، خريطة ذهنية، والمزيد.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Outputs Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight mb-4">
              المخرجات التي ستحصل عليها
            </h2>
            <p className="text-[#666666] text-lg">
              6 ملفات احترافية جاهزة للتنفيذ
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'README Frontend', desc: 'توثيق كامل للواجهة الأمامية', icon: '📄' },
              { title: 'README Backend', desc: 'توثيق الخادم الخلفي والـ APIs', icon: '⚙️' },
              { title: 'خطة العمل', desc: 'مراحل التنفيذ والجدول الزمني', icon: '📋' },
              { title: 'المهارات المطلوبة', desc: 'التقنيات والأدوات اللازمة', icon: '🎯' },
              { title: 'تقييم المشروع', desc: 'تحليل SWOT وتقييم الجدوى', icon: '📊' },
              { title: 'خريطة ذهنية', desc: 'تصور بصري لهيكل المشروع', icon: '🗺️' },
            ].map((item, i) => (
              <div 
                key={i} 
                className="bg-white border border-[#E5E5E5] p-6 hover:border-[#002FA7] transition-colors group"
              >
                <span className="text-3xl mb-4 block">{item.icon}</span>
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2 group-hover:text-[#002FA7] transition-colors">
                  {item.title}
                </h3>
                <p className="text-[#666666] text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#002FA7] py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Zap className="w-12 h-12 text-white/80 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            جاهز لتحويل فكرتك إلى واقع؟
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            لا تدع أفكارك تضيع. ابدأ الآن وحولها إلى مشاريع منظمة وقابلة للتنفيذ.
          </p>
          <Link to="/register">
            <Button 
              className="bg-white text-[#002FA7] hover:bg-[#F5F5F5] font-bold px-10 py-6 text-lg rounded-none"
              data-testid="cta-register-btn"
            >
              ابدأ مجاناً الآن
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#002FA7] flex items-center justify-center">
                <span className="text-white font-black">B</span>
              </div>
              <span className="font-bold">BuildMap</span>
            </div>
            <p className="text-[#999999] text-sm">
              © 2025 BuildMap. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
