import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, formatApiError } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
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
    <div className="min-h-screen bg-[#FAFAFA] flex" dir="rtl">
      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-[#666666] hover:text-[#1A1A1A] mb-8 transition-colors">
            <ArrowRight className="w-4 h-4" />
            <span>العودة للرئيسية</span>
          </Link>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#002FA7] flex items-center justify-center">
                <span className="text-white font-black text-lg">B</span>
              </div>
              <span className="text-xl font-bold text-[#1A1A1A]">BuildMap</span>
            </div>
            <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">تسجيل الدخول</h1>
            <p className="text-[#666666]">أدخل بياناتك للوصول إلى حسابك</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm" data-testid="login-error">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#1A1A1A] font-medium">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="h-12 bg-white border-[#E5E5E5] rounded-none focus:ring-[#002FA7] focus:border-[#002FA7]"
                required
                data-testid="login-email-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#1A1A1A] font-medium">كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 bg-white border-[#E5E5E5] rounded-none focus:ring-[#002FA7] focus:border-[#002FA7] pl-12"
                  required
                  data-testid="login-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999999] hover:text-[#666666]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#002FA7] hover:bg-[#002480] text-white font-bold rounded-none"
              data-testid="login-submit-btn"
            >
              {loading ? 'جاري التحميل...' : 'تسجيل الدخول'}
            </Button>
          </form>

          <p className="text-center text-[#666666] mt-6">
            ليس لديك حساب؟{' '}
            <Link to="/register" className="text-[#002FA7] font-medium hover:underline" data-testid="register-link">
              إنشاء حساب جديد
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Image */}
      <div className="hidden lg:block lg:w-1/2 bg-[#002FA7] relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-6">حوّل الفوضى إلى نظام</h2>
            <p className="text-white/80 text-lg max-w-md">
              ابدأ رحلتك في تحويل أفكارك العشوائية إلى مشاريع تقنية منظمة ومدروسة.
            </p>
          </div>
        </div>
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://static.prod-images.emergentagent.com/jobs/b878669f-29c7-48e6-a252-07344449ce6e/images/0ea3a9de1ee5fd3aec53f20d2c592822cc4327538d63aa350dd5bc03ddf9833e.png"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
