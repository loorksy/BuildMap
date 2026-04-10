import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import SaveButton from '../components/SaveButton';
import { Sun, Moon, ArrowRight, Eye, MessageCircle, Bookmark } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PublicProjectPage = () => {
  const { projectId } = useParams();
  const { theme, toggleTheme } = useTheme();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`${API}/projects/${projectId}/public`);
      setProject(response.data);
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('حدث خطأ أثناء جلب المشروع');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">المشروع غير موجود</h2>
          <Link to="/explore">
            <Button>العودة للاستكشاف</Button>
          </Link>
        </div>
      </div>
    );
  }

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
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="w-8 h-8 rounded-lg">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Hero */}
        <div className="bg-card border border-border rounded-xl p-6 sm:p-8 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-2">
                {project.title}
              </h1>
              {project.category && (
                <Badge variant="outline" className="mb-3">{project.category}</Badge>
              )}
              <p className="text-sm sm:text-base text-muted-foreground">
                {project.description}
              </p>
            </div>
            <SaveButton projectId={projectId} />
          </div>

          {/* Tech Stack */}
          {project.tech_stack && project.tech_stack.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tech_stack.map((tech, idx) => (
                <span key={idx} className="px-3 py-1 bg-primary/5 text-primary text-xs rounded-md border border-primary/10">
                  {tech}
                </span>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 pt-4 border-t border-border/50 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {project.stats?.views || 0} مشاهدة
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              {project.stats?.comments_count || 0} تعليق
            </div>
            <div className="flex items-center gap-1">
              <Bookmark className="w-4 h-4" />
              {project.stats?.saves || 0} حفظ
            </div>
          </div>
        </div>

        {/* Owner */}
        {project.owner && (
          <Link 
            to={`/profile/${project.owner_id}`}
            className="block bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-smooth mb-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {project.owner.name?.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-foreground">{project.owner.name}</div>
                <div className="text-xs text-muted-foreground">
                  {project.owner.stats?.projects_published || 0} مشروع منشور
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Outputs (TODO: Add tabs for different outputs) */}
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <p className="text-muted-foreground">مخرجات المشروع ستظهر هنا قريباً...</p>
        </div>
      </div>
    </div>
  );
};

export default PublicProjectPage;
