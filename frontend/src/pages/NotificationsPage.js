import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/button';
import { Sun, Moon, Bell, Check, Trash2, UserPlus, MessageCircle, Bookmark, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { logger } from '../utils/logger';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const NOTIFICATION_ICONS = {
  new_follower: UserPlus,
  new_comment: MessageCircle,
  comment_reply: MessageCircle,
  project_saved: Bookmark,
  project_trending: TrendingUp,
  mention: MessageCircle
};

const NotificationsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API}/notifications`, { withCredentials: true });
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unread_count || 0);
    } catch (error) {
      logger.error('Error fetching notifications:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`${API}/notifications/read-all`, {}, { withCredentials: true });
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success('تم تعليم الكل كمقروء');
    } catch (error) {
      toast.error('حدث خطأ');
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${API}/notifications/${notificationId}/read`, {}, { withCredentials: true });
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      logger.error('Error marking as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`${API}/notifications/${notificationId}`, { withCredentials: true });
      setNotifications(notifications.filter(n => n.id !== notificationId));
      toast.success('تم حذف الإشعار');
    } catch (error) {
      toast.error('حدث خطأ');
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'الآن';
    if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
    if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
    if (diff < 604800) return `منذ ${Math.floor(diff / 86400)} يوم`;
    return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="glass border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-black text-foreground">الإشعارات</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Check className="w-3.5 h-3.5 ml-1" />
              تعليم الكل كمقروء
            </Button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((skeletonId) => (
              <div key={`notif-skeleton-${skeletonId}`} className="bg-card border border-border rounded-lg p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-lg">
            <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-base font-semibold text-foreground mb-2">لا توجد إشعارات</h3>
            <p className="text-sm text-muted-foreground">سيتم عرض الإشعارات الجديدة هنا</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(notification => {
              const Icon = NOTIFICATION_ICONS[notification.type] || Bell;
              
              return (
                <div
                  key={notification.id}
                  className={`group bg-card border rounded-lg p-4 transition-smooth hover:border-primary/50 ${
                    !notification.is_read ? 'border-primary/30 bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      !notification.is_read ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => handleNotificationClick(notification)}
                        className="text-right w-full"
                      >
                        <p className={`text-sm mb-1 ${
                          !notification.is_read ? 'font-semibold text-foreground' : 'text-muted-foreground'
                        }`}>
                          {notification.content}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(notification.created_at)}
                        </span>
                      </button>
                    </div>

                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1 shrink-0"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
