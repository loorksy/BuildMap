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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center shadow-glow transition-smooth group-hover:shadow-glow-lg">
              <span className="text-primary-foreground font-black text-sm sm:text-base">B</span>
            </div>
            <span className="text-base sm:text-lg font-bold text-foreground tracking-tight">BuildMap</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg transition-smooth hover:bg-muted"
              data-testid="theme-toggle-btn"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Link to="/login">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-muted-foreground hover:text-foreground rounded-lg transition-smooth text-xs sm:text-sm hidden sm:flex"
                data-testid="header-login-btn"
              >
                تسجيل الدخول
              </Button>
            </Link>
            <Link to="/register">
              <Button 
                size="sm"
                className="btn-primary font-medium px-3 sm:px-4 rounded-lg text-xs sm:text-sm"
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
        <div className="absolute top-10 right-10 w-48 sm:w-64 h-48 sm:h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 left-10 w-56 sm:w-80 h-56 sm:h-80 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-5 sm:space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20 transition-smooth hover:bg-primary/15">
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="text-xs font-medium text-primary">مدعوم بالذكاء الاصطناعي</span>
              </div>
              <h1 className="text-display text-foreground text-balance">
                حوّل أفكارك العشوائية
                <br />
                <span className="gradient-text">إلى مشاريع جاهزة</span>
              </h1>
              <p className="text-body-large text-muted-foreground max-w-md text-balance">
                منصة ذكية تساعدك في تحويل فكرتك من مجرد خاطرة إلى خطة تقنية متكاملة وجاهزة للتنفيذ.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/register">
                  <Button 
                    className="btn-primary font-medium px-5 sm:px-6 h-10 sm:h-11 text-sm rounded-lg flex items-center gap-2 shadow-glow hover:shadow-glow-lg"
                    data-testid="hero-start-btn"
                  >
                    ابدأ مجاناً
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button 
                    variant="outline"
                    className="border-border hover:bg-accent font-medium px-5 sm:px-6 h-10 sm:h-11 text-sm rounded-lg transition-smooth"
                    data-testid="hero-login-btn"
                  >
                    لدي حساب
                  </Button>
                </Link>
              </div>
              
              {/* Trust indicators */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-4 h-4 rounded-full bg-success/20 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-success" />
                  </div>
                  <span>مجاني للبدء</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-4 h-4 rounded-full bg-success/20 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-success" />
                  </div>
                  <span>بدون بطاقة ائتمان</span>
                </div>
              </div>
            </div>
            <div className="relative animate-slide-in hidden lg:block" style={{ animationDelay: '0.2s' }}>
              <div className="aspect-square relative rounded-2xl overflow-hidden card-elevated max-w-md mx-auto">
                <img 
                  src="https://static.prod-images.emergentagent.com/jobs/b878669f-29c7-48e6-a252-07344449ce6e/images/113d56e53b5a78e8d35bcd15c548bcdb4ec9ecc61997cfc6ac208a9f0efd2d82.png"
                  alt="من الفوضى إلى النظام"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
              </div>
              
              {/* Floating badge */}
              <div className="absolute -bottom-3 -right-3 glass-card rounded-xl p-3 shadow-large animate-bounce-soft">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">6 ملفات</p>
                    <p className="text-[10px] text-muted-foreground">جاهزة للتنفيذ</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 border-t border-border/50 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-12 animate-fade-in">
            <h2 className="text-headline text-foreground mb-2 sm:mb-3">
              كيف يعمل BuildMap؟
            </h2>
            <p className="text-body text-muted-foreground max-w-xl mx-auto text-balance">
              ثلاث خطوات بسيطة لتحويل فكرتك إلى مشروع منظم
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: Brain, step: 'الخطوة الأولى', title: 'اطرح فكرتك', desc: 'شارك فكرتك مهما كانت عشوائية أو غير مكتملة.', delay: '0s' },
              { icon: Target, step: 'الخطوة الثانية', title: 'أجب على الأسئلة', desc: 'سيطرح عليك المساعد أسئلة ذكية لفهم فكرتك.', delay: '0.1s' },
              { icon: FileCode, step: 'الخطوة الثالثة', title: 'احصل على المخرجات', desc: 'استلم ملفات جاهزة: خطة العمل، المتطلبات، والمزيد.', delay: '0.2s' }
            ].map((item, i) => (
              <div 
                key={i} 
                className="card-elevated p-5 sm:p-6 interactive-card group animate-fade-in"
                style={{ animationDelay: item.delay }}
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center mb-4 group-hover:from-primary/30 group-hover:to-primary/10 transition-smooth">
                  <item.icon className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-primary" />
                </div>
                <div className="text-[10px] sm:text-xs font-semibold text-muted-foreground mb-1">{item.step}</div>
                <h3 className="text-title text-foreground mb-2">{item.title}</h3>
                <p className="text-body-small text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Outputs Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-muted/30 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-headline text-foreground mb-2 sm:mb-3">
              المخرجات التي ستحصل عليها
            </h2>
            <p className="text-body text-muted-foreground">
              6 ملفات احترافية جاهزة للتنفيذ
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[
              { title: 'README Frontend', desc: 'توثيق كامل للواجهة الأمامية', Icon: FileCode },
              { title: 'README Backend', desc: 'توثيق الخادم والـ APIs', Icon: FileCode },
              { title: 'خطة العمل', desc: 'مراحل التنفيذ والجدول الزمني', Icon: Target },
              { title: 'المهارات المطلوبة', desc: 'التقنيات والأدوات اللازمة', Icon: Zap },
              { title: 'تقييم المشروع', desc: 'تحليل SWOT والجدوى', Icon: Brain },
              { title: 'خريطة ذهنية', desc: 'تصور بصري لهيكل المشروع', Icon: Sparkles },
            ].map((item, i) => (
              <div 
                key={i} 
                className="bg-card border border-border rounded-lg p-3 sm:p-4 interactive-card group"
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-smooth">
                    <item.Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-foreground text-xs sm:text-sm mb-0.5 group-hover:text-primary transition-colors-smooth truncate">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-[10px] sm:text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-primary via-primary to-blue-600 rounded-2xl p-8 sm:p-10 text-center relative overflow-hidden card-elevated">
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
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-5 backdrop-blur-sm animate-bounce-soft">
                <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4 text-balance">
                جاهز لتحويل فكرتك إلى واقع؟
              </h2>
              <p className="text-white/80 text-sm sm:text-base mb-5 sm:mb-6 max-w-lg mx-auto text-balance">
                لا تدع أفكارك تضيع. ابدأ الآن وحولها إلى مشاريع منظمة.
              </p>
              <Link to="/register">
                <Button 
                  className="bg-white text-primary hover:bg-white/90 font-semibold px-6 sm:px-8 h-10 sm:h-11 text-sm rounded-lg shadow-large transition-smooth hover:shadow-glow-lg"
                  data-testid="cta-register-btn"
                >
                  ابدأ مجاناً الآن
                  <ArrowUpLeft className="w-4 h-4 mr-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-6 sm:py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 group">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-primary to-blue-600 rounded-md flex items-center justify-center transition-smooth group-hover:shadow-glow">
                <span className="text-primary-foreground font-black text-xs">B</span>
              </div>
              <span className="font-semibold text-foreground text-sm">BuildMap</span>
            </div>
            <p className="text-muted-foreground text-xs">
              جميع الحقوق محفوظة © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
