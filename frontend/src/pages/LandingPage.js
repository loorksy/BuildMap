import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeft, Zap, Target, FileCode, Brain, Sparkles, Sun, Moon, ArrowUpLeft, Check } from 'lucide-react';
import { Button } from '../components/ui/button';

const LandingPage = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="glass border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-glow transition-smooth group-hover:shadow-glow-lg">
              <span className="text-primary-foreground font-black text-lg">B</span>
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">BuildMap</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-xl transition-smooth hover:bg-muted"
              data-testid="theme-toggle-btn"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Link to="/login">
              <Button 
                variant="ghost" 
                className="text-muted-foreground hover:text-foreground rounded-xl transition-smooth"
                data-testid="header-login-btn"
              >
                تسجيل الدخول
              </Button>
            </Link>
            <Link to="/register">
              <Button 
                className="btn-primary font-semibold px-6 rounded-xl"
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
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        
        <div className="max-w-7xl mx-auto px-6 py-24 lg:py-36 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 transition-smooth hover:bg-primary/15">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">مدعوم بالذكاء الاصطناعي</span>
              </div>
              <h1 className="text-display text-foreground text-balance">
                حوّل أفكارك العشوائية
                <br />
                <span className="gradient-text">إلى مشاريع جاهزة</span>
              </h1>
              <p className="text-body-large text-muted-foreground max-w-lg text-balance">
                منصة ذكية تساعدك في تحويل فكرتك من مجرد خاطرة إلى خطة تقنية متكاملة وجاهزة للتنفيذ، من خلال حوار تفاعلي مع الذكاء الاصطناعي.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register">
                  <Button 
                    className="btn-primary font-semibold px-8 py-6 text-lg rounded-xl flex items-center gap-2 shadow-glow hover:shadow-glow-lg"
                    data-testid="hero-start-btn"
                  >
                    ابدأ مجاناً
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button 
                    variant="outline"
                    className="border-border hover:bg-accent font-semibold px-8 py-6 text-lg rounded-xl transition-smooth"
                    data-testid="hero-login-btn"
                  >
                    لدي حساب
                  </Button>
                </Link>
              </div>
              
              {/* Trust indicators */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-success" />
                  </div>
                  <span>مجاني للبدء</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-success" />
                  </div>
                  <span>بدون بطاقة ائتمان</span>
                </div>
              </div>
            </div>
            <div className="relative animate-slide-in" style={{ animationDelay: '0.2s' }}>
              <div className="aspect-square relative rounded-3xl overflow-hidden card-elevated">
                <img 
                  src="https://static.prod-images.emergentagent.com/jobs/b878669f-29c7-48e6-a252-07344449ce6e/images/113d56e53b5a78e8d35bcd15c548bcdb4ec9ecc61997cfc6ac208a9f0efd2d82.png"
                  alt="من الفوضى إلى النظام"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
              </div>
              
              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 glass-card rounded-2xl p-4 shadow-large animate-bounce-soft">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">6 ملفات</p>
                    <p className="text-xs text-muted-foreground">جاهزة للتنفيذ</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 border-t border-border/50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-headline text-foreground mb-4">
              كيف يعمل BuildMap؟
            </h2>
            <p className="text-body-large text-muted-foreground max-w-2xl mx-auto text-balance">
              ثلاث خطوات بسيطة لتحويل فكرتك إلى مشروع منظم
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Brain, step: 'الخطوة الأولى', title: 'اطرح فكرتك', desc: 'شارك فكرتك مهما كانت عشوائية أو غير مكتملة. المساعد الذكي سيساعدك في صقلها.', delay: '0s' },
              { icon: Target, step: 'الخطوة الثانية', title: 'أجب على الأسئلة', desc: 'سيطرح عليك المساعد أسئلة ذكية ومتدرجة لفهم فكرتك بشكل أعمق.', delay: '0.1s' },
              { icon: FileCode, step: 'الخطوة الثالثة', title: 'احصل على المخرجات', desc: 'استلم ملفات جاهزة: خطة العمل، المتطلبات التقنية، خريطة ذهنية، والمزيد.', delay: '0.2s' }
            ].map((item, i) => (
              <div 
                key={i} 
                className="card-elevated p-8 interactive-card group animate-fade-in"
                style={{ animationDelay: item.delay }}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mb-6 group-hover:from-primary/30 group-hover:to-primary/10 transition-smooth">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <div className="text-sm font-semibold text-muted-foreground mb-2">{item.step}</div>
                <h3 className="text-title text-foreground mb-3">{item.title}</h3>
                <p className="text-body-small text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Outputs Section */}
      <section className="py-24 bg-muted/30 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-headline text-foreground mb-4">
              المخرجات التي ستحصل عليها
            </h2>
            <p className="text-body-large text-muted-foreground">
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
                className="bg-card border border-border rounded-xl p-5 interactive-card group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-smooth">
                    <item.Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors-smooth">
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
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-gradient-to-br from-primary via-primary to-blue-600 rounded-3xl p-12 text-center relative overflow-hidden card-elevated">
            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" className="text-white"/>
              </svg>
            </div>
            
            <div className="relative">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm animate-bounce-soft">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 text-balance">
                جاهز لتحويل فكرتك إلى واقع؟
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto text-balance">
                لا تدع أفكارك تضيع. ابدأ الآن وحولها إلى مشاريع منظمة وقابلة للتنفيذ.
              </p>
              <Link to="/register">
                <Button 
                  className="bg-white text-primary hover:bg-white/90 font-bold px-10 py-6 text-lg rounded-xl shadow-large transition-smooth hover:shadow-glow-lg"
                  data-testid="cta-register-btn"
                >
                  ابدأ مجاناً الآن
                  <ArrowUpLeft className="w-5 h-5 mr-2" />
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
            <div className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center transition-smooth group-hover:shadow-glow">
                <span className="text-primary-foreground font-black">B</span>
              </div>
              <span className="font-bold text-foreground">BuildMap</span>
            </div>
            <p className="text-muted-foreground text-sm">
              جميع الحقوق محفوظة © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
