import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, formatApiError } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Eye, EyeOff, ArrowRight, Sun, Moon, AlertCircle, Rocket } from 'lucide-react';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoading(true);

    try {
      await register(email, password, name);
      navigate('/dashboard');
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex" dir="rtl">
      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors-smooth group text-xs sm:text-sm">
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              <span>العودة للرئيسية</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg transition-smooth"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center shadow-glow">
                <span className="text-primary-foreground font-black text-base">B</span>
              </div>
              <span className="text-lg font-bold text-foreground">BuildMap</span>
            </div>
            <h1 className="text-headline text-foreground mb-1">إنشاء حساب جديد</h1>
            <p className="text-body-small text-muted-foreground">ابدأ رحلتك في تحويل أفكارك إلى مشاريع</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-3 py-2 rounded-lg flex items-center gap-2 animate-scale-in" data-testid="register-error">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="text-xs">{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-foreground font-medium text-xs sm:text-sm">الاسم</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أدخل اسمك"
                className="h-10 bg-card border-border rounded-lg input-enhanced text-sm"
                required
                data-testid="register-name-input"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-foreground font-medium text-xs sm:text-sm">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="h-10 bg-card border-border rounded-lg input-enhanced text-sm"
                required
                data-testid="register-email-input"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-foreground font-medium text-xs sm:text-sm">كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6 أحرف على الأقل"
                  className="h-10 bg-card border-border rounded-lg pl-10 input-enhanced text-sm"
                  required
                  data-testid="register-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors-smooth p-1 rounded-md hover:bg-muted"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 btn-primary font-medium rounded-lg text-sm"
              data-testid="register-submit-btn"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري التحميل...
                </span>
              ) : 'إنشاء حساب'}
            </Button>
          </form>

          <p className="text-center text-muted-foreground mt-4 text-xs sm:text-sm">
            لديك حساب بالفعل؟{' '}
            <Link to="/login" className="text-primary font-medium hover:underline underline-offset-4" data-testid="login-link">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary to-blue-600 relative overflow-hidden items-center justify-center">
        {/* Decorative elements */}
        <div className="absolute top-24 left-16 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-24 right-16 w-52 h-52 bg-blue-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        
        <div className="relative z-10 text-center text-white max-w-sm p-8 animate-fade-in">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-5 backdrop-blur-sm animate-bounce-soft">
            <Rocket className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-balance">انضم إلى BuildMap</h2>
          <p className="text-white/80 text-sm leading-relaxed text-balance">
            أكثر من مجرد أداة، هي شريكك في رحلة تحويل الأفكار إلى واقع ملموس.
          </p>
        </div>
        
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid-register" width="8" height="8" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="currentColor" className="text-white"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid-register)"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
