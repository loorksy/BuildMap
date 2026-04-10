import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/button';
import ProjectCard from '../components/ProjectCard';
import { Sun, Moon, Bookmark, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { logger } from '../utils/logger';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SavedProjectsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSavedProjects = async () => {
    try {
      const response = await axios.get(`${API}/saves`, { withCredentials: true });
      setProjects(response.data.projects || []);
    } catch (error) {
      logger.error('Error fetching saved projects:', error);
      toast.error('حدث خطأ أثناء جلب المشاريع المحفوظة');
    } finally {
      setLoading(false);
    }
  };

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
            <Link to="/explore">
              <Button size="sm" variant="outline" className="rounded-lg text-xs sm:text-sm">
                استكشف
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center gap-3 mb-6">
          <Bookmark className="w-6 h-6 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">مشاريعي المحفوظة</h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {[1, 2, 3, 4, 5, 6].map((skeletonId) => (
              <div key={`saved-skeleton-${skeletonId}`} className="bg-card border border-border rounded-lg p-5 animate-pulse">
                <div className="h-5 bg-muted rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-muted rounded w-full mb-2"></div>
                <div className="h-3 bg-muted rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-lg">
            <Bookmark className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-base font-semibold text-foreground mb-2">لا توجد مشاريع محفوظة</h3>
            <p className="text-sm text-muted-foreground mb-4">ابدأ بحفظ المشاريع التي تهمك من صفحة الاستكشاف</p>
            <Link to="/explore">
              <Button>استكشف المشاريع</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {projects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedProjectsPage;
