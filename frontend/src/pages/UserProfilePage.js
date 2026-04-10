import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import FollowButton from '../components/FollowButton';
import ProjectCard from '../components/ProjectCard';
import {
  Sun,
  Moon,
  MapPin,
  Link as LinkIcon,
  Github,
  Sparkles,
  FolderOpen,
  Users,
  Star,
  TrendingUp,
  ArrowRight,
  Settings
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LEVEL_INFO = {
  seed: { label: '🌱 Seed', color: 'text-green-600' },
  builder: { label: '🌿 Builder', color: 'text-blue-600' },
  innovator: { label: '🚀 Innovator', color: 'text-purple-600' },
  visionary: { label: '💎 Visionary', color: 'text-yellow-600' },
  legend: { label: '👑 Legend', color: 'text-red-600' }
};

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user: currentUser } = useAuth();
  
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('projects');
  const [isFollowing, setIsFollowing] = useState(false);

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    fetchUserProfile();
    fetchUserProjects();
    if (currentUser && !isOwnProfile) {
      checkIfFollowing();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${API}/users/${userId}/profile`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('حدث خطأ أثناء جلب البروفايل');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProjects = async () => {
    try {
      const response = await axios.get(`${API}/users/${userId}/projects`);
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const checkIfFollowing = async () => {
    try {
      const response = await axios.get(`${API}/users/${userId}/is-following`, { withCredentials: true });
      setIsFollowing(response.data.is_following);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">المستخدم غير موجود</h2>
          <Link to="/explore">
            <Button>العودة للاستكشاف</Button>
          </Link>
        </div>
      </div>
    );
  }

  const levelInfo = LEVEL_INFO[user.stats?.level || 'seed'];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="glass border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/explore" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-black text-sm">B</span>
            </div>
            <span className="text-base font-bold text-foreground hidden sm:block">BuildMap</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            {currentUser && (
              <Link to="/dashboard">
                <Button size="sm" variant="outline" className="rounded-lg text-xs sm:text-sm">
                  لوحة التحكم
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Profile Header */}
        <div className="bg-card border border-border rounded-xl p-6 sm:p-8 mb-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="shrink-0">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-primary-foreground text-4xl font-black mx-auto sm:mx-0">
                {user.name?.charAt(0) || '؟'}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-right">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-1">
                    {user.name}
                  </h1>
                  {user.profile?.bio && (
                    <p className="text-sm sm:text-base text-muted-foreground">
                      {user.profile.bio}
                    </p>
                  )}
                </div>
                
                {isOwnProfile ? (
                  <Link to="/dashboard">
                    <Button size="sm" className="rounded-lg">
                      <Settings className="w-4 h-4 ml-2" />
                      تعديل البروفايل
                    </Button>
                  </Link>
                ) : currentUser && (
                  <FollowButton 
                    userId={userId} 
                    initialIsFollowing={isFollowing}
                    onFollowChange={setIsFollowing}
                  />
                )}
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs sm:text-sm text-muted-foreground mb-4">
                {user.profile?.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {user.profile.location}
                  </div>
                )}
                {user.profile?.website && (
                  <a 
                    href={user.profile.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <LinkIcon className="w-4 h-4" />
                    الموقع
                  </a>
                )}
                {user.profile?.github_username && (
                  <a 
                    href={`https://github.com/${user.profile.github_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    {user.profile.github_username}
                  </a>
                )}
              </div>

              {/* Skills */}
              {user.profile?.skills && user.profile.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-4">
                  {user.profile.skills.map((skill, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border/50">
                <div className="text-center sm:text-right">
                  <div className="text-lg sm:text-xl font-bold text-foreground">
                    {user.stats?.projects_published || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">مشروع منشور</div>
                </div>
                <div className="text-center sm:text-right">
                  <div className="text-lg sm:text-xl font-bold text-foreground">
                    {user.stats?.followers_count || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">متابع</div>
                </div>
                <div className="text-center sm:text-right">
                  <div className="text-lg sm:text-xl font-bold text-foreground">
                    {user.stats?.following_count || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">يتابع</div>
                </div>
                <div className="text-center sm:text-right">
                  <div className={`text-base sm:text-lg font-bold ${levelInfo.color}`}>
                    {levelInfo.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user.stats?.points || 0} نقطة
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'projects'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <FolderOpen className="w-4 h-4 inline-block ml-1" />
            المشاريع ({projects.length})
          </button>
        </div>

        {/* Projects Grid */}
        {activeTab === 'projects' && (
          <div className="animate-fade-in">
            {projects.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border rounded-lg">
                <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-base font-semibold text-foreground mb-2">
                  لا توجد مشاريع منشورة
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isOwnProfile ? 'ابدأ بنشر مشروعك الأول!' : 'لم ينشر هذا المستخدم أي مشاريع بعد'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {projects.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
