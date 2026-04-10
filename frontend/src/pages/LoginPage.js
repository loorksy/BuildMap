import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, formatApiError } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Eye, EyeOff, ArrowRight, Sun, Moon, AlertCircle, Sparkles } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
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
            <h1 className="text-headline text-foreground mb-1">تسجيل الدخول</h1>
            <p className="text-body-small text-muted-foreground">أدخل بياناتك للوصول إلى حسابك</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-3 py-2 rounded-lg flex items-center gap-2 animate-scale-in" data-testid="login-error">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="text-xs">{error}</span>
              </div>
            )}

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
                data-testid="login-email-input"
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
                  placeholder="ادخل كلمة المرور"
                  className="h-10 bg-card border-border rounded-lg pl-10 input-enhanced text-sm"
                  required
                  data-testid="login-password-input"
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
              data-testid="login-submit-btn"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري التحميل...
                </span>
              ) : 'تسجيل الدخول'}
            </Button>
          </form>

          <p className="text-center text-muted-foreground mt-4 text-xs sm:text-sm">
            ليس لديك حساب؟{' '}
            <Link to="/register" className="text-primary font-medium hover:underline underline-offset-4" data-testid="register-link">
              إنشاء حساب جديد
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary to-blue-600 relative overflow-hidden items-center justify-center">
        {/* Decorative elements */}
        <div className="absolute top-16 right-16 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-16 left-16 w-36 h-36 bg-blue-400/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }} />
        
        <div className="relative z-10 text-center text-white max-w-sm p-8 animate-fade-in">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-5 backdrop-blur-sm animate-bounce-soft">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-balance">حوّل الفوضى إلى نظام</h2>
          <p className="text-white/80 text-sm leading-relaxed text-balance">
            ابدأ رحلتك في تحويل أفكارك العشوائية إلى مشاريع تقنية منظمة ومدروسة.
          </p>
        </div>
        
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid-login" width="8" height="8" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="currentColor" className="text-white"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid-login)"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
