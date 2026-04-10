import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/button';
import { Sun, Moon, Bell } from 'lucide-react';

const NotificationsPage = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="glass border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-black text-sm">B</span>
            </div>
            <span className="text-base font-bold text-foreground hidden sm:block">BuildMap</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="w-8 h-8 rounded-lg">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-6 h-6 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">الإشعارات</h1>
        </div>

        <div className="text-center py-16 bg-card border border-border rounded-lg">
          <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-base font-semibold text-foreground mb-2">لا توجد إشعارات</h3>
          <p className="text-sm text-muted-foreground">سيتم عرض الإشعارات الجديدة هنا</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
