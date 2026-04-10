import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeft, Zap, Target, FileCode, Brain, Sparkles, Sun, Moon } from 'lucide-react';
import { Button } from '../components/ui/button';

const LandingPage = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="glass border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-black text-lg">B</span>
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">BuildMap</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-xl"
              data-testid="theme-toggle-btn"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Link to="/login">
              <Button 
                variant="ghost" 
                className="text-muted-foreground hover:text-foreground rounded-xl"
                data-testid="header-login-btn"
              >
                تسجيل الدخول
              </Button>
            </Link>
            <Link to="/register">
              <Button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 rounded-xl"
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
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5" />
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">مدعوم بالذكاء الاصطناعي</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-tight">
                حوّل أفكارك العشوائية
                <br />
                <span className="gradient-text">إلى مشاريع جاهزة</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                منصة ذكية تساعدك في تحويل فكرتك من مجرد خاطرة إلى خطة تقنية متكاملة وجاهزة للتنفيذ، من خلال حوار تفاعلي مع الذكاء الاصطناعي.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register">
                  <Button 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-lg rounded-xl flex items-center gap-2 shadow-lg shadow-primary/25"
                    data-testid="hero-start-btn"
                  >
                    ابدأ مجاناً
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button 
                    variant="outline"
                    className="border-border hover:bg-accent font-semibold px-8 py-6 text-lg rounded-xl"
                    data-testid="hero-login-btn"
                  >
                    لدي حساب
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square relative rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://static.prod-images.emergentagent.com/jobs/b878669f-29c7-48e6-a252-07344449ce6e/images/113d56e53b5a78e8d35bcd15c548bcdb4ec9ecc61997cfc6ac208a9f0efd2d82.png"
                  alt="من الفوضى إلى النظام"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">
              كيف يعمل BuildMap؟
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              ثلاث خطوات بسيطة لتحويل فكرتك إلى مشروع منظم
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg hover:border-primary/30 transition-all duration-300 group">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Brain className="w-7 h-7 text-primary" />
              </div>
              <div className="text-sm font-semibold text-muted-foreground mb-2">الخطوة الأولى</div>
              <h3 className="text-xl font-bold text-foreground mb-3">اطرح فكرتك</h3>
              <p className="text-muted-foreground">
                شارك فكرتك مهما كانت عشوائية أو غير مكتملة. المساعد الذكي سيساعدك في صقلها.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg hover:border-primary/30 transition-all duration-300 group">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Target className="w-7 h-7 text-primary" />
              </div>
              <div className="text-sm font-semibold text-muted-foreground mb-2">الخطوة الثانية</div>
              <h3 className="text-xl font-bold text-foreground mb-3">أجب على الأسئلة</h3>
              <p className="text-muted-foreground">
                سيطرح عليك المساعد أسئلة ذكية ومتدرجة لفهم فكرتك بشكل أعمق.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg hover:border-primary/30 transition-all duration-300 group">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <FileCode className="w-7 h-7 text-primary" />
              </div>
              <div className="text-sm font-semibold text-muted-foreground mb-2">الخطوة الثالثة</div>
              <h3 className="text-xl font-bold text-foreground mb-3">احصل على المخرجات</h3>
              <p className="text-muted-foreground">
                استلم ملفات جاهزة: خطة العمل، المتطلبات التقنية، خريطة ذهنية، والمزيد.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Outputs Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">
              المخرجات التي ستحصل عليها
            </h2>
            <p className="text-muted-foreground text-lg">
              6 ملفات احترافية جاهزة للتنفيذ
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'README Frontend', desc: 'توثيق كامل للواجهة الأمامية', Icon: FileCode },
              { title: 'README Backend', desc: 'توثيق الخادم الخلفي والـ APIs', Icon: FileCode },
              { title: 'خطة العمل', desc: 'مراحل التنفيذ والجدول الزمني', Icon: Target },
              { title: 'المهارات المطلوبة', desc: 'التقنيات والأدوات اللازمة', Icon: Zap },
              { title: 'تقييم المشروع', desc: 'تحليل SWOT وتقييم الجدوى', Icon: Brain },
              { title: 'خريطة ذهنية', desc: 'تصور بصري لهيكل المشروع', Icon: Sparkles },
            ].map((item, i) => (
              <div 
                key={i} 
                className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <item.Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-gradient-to-br from-primary to-blue-600 rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyem0tNiA2aC00djJoNHYtMnptMC02aC00djJoNHYtMnptMC02aC00djJoNHYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
            <div className="relative">
              <Zap className="w-12 h-12 text-white/80 mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                جاهز لتحويل فكرتك إلى واقع؟
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
                لا تدع أفكارك تضيع. ابدأ الآن وحولها إلى مشاريع منظمة وقابلة للتنفيذ.
              </p>
              <Link to="/register">
                <Button 
                  className="bg-white text-primary hover:bg-white/90 font-bold px-10 py-6 text-lg rounded-xl shadow-xl"
                  data-testid="cta-register-btn"
                >
                  ابدأ مجاناً الآن
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-black">B</span>
              </div>
              <span className="font-bold text-foreground">BuildMap</span>
            </div>
            <p className="text-muted-foreground text-sm">
              جميع الحقوق محفوظة 2025
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
