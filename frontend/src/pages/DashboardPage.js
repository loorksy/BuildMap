import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Label } from '../components/ui/label';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';
import { 
  Plus, 
  Settings, 
  LogOut, 
  FolderOpen, 
  ChevronLeft,
  Key,
  Trash2,
  User,
  Sparkles,
  Sun,
  Moon,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [models, setModels] = useState([]);
  const [apiKeyInfo, setApiKeyInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // New Project Dialog
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectIdea, setNewProjectIdea] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);
  
  // API Key Dialog
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [newApiKey, setNewApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('openai/gpt-4o');
  const [savingApiKey, setSavingApiKey] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsRes, modelsRes, apiKeyRes] = await Promise.all([
        axios.get(`${API}/projects`),
        axios.get(`${API}/models`),
        axios.get(`${API}/api-keys`)
      ]);
      setProjects(projectsRes.data);
      setModels(modelsRes.data);
      setApiKeyInfo(apiKeyRes.data);
      
      if (apiKeyRes.data?.default_model) {
        setSelectedModel(apiKeyRes.data.default_model);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchModels = async () => {
    setLoadingModels(true);
    try {
      const response = await axios.get(`${API}/models`);
      setModels(response.data);
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectTitle.trim() || !newProjectIdea.trim()) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }

    if (!apiKeyInfo?.has_key) {
      toast.error('يرجى إضافة مفتاح API أولاً');
      setShowNewProject(false);
      setShowApiKeyDialog(true);
      return;
    }

    setCreatingProject(true);
    try {
      const response = await axios.post(`${API}/projects`, {
        title: newProjectTitle,
        idea: newProjectIdea
      });
      setShowNewProject(false);
      setNewProjectTitle('');
      setNewProjectIdea('');
      navigate(`/project/${response.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'حدث خطأ أثناء إنشاء المشروع');
    } finally {
      setCreatingProject(false);
    }
  };

  const handleSaveApiKey = async () => {
    if (!newApiKey.trim()) {
      toast.error('يرجى إدخال مفتاح API');
      return;
    }

    setSavingApiKey(true);
    try {
      await axios.post(`${API}/api-keys`, {
        api_key: newApiKey,
        default_model: selectedModel
      });
      toast.success('تم حفظ مفتاح API بنجاح');
      setShowApiKeyDialog(false);
      setNewApiKey('');
      fetchData();
      // Fetch models with new API key
      fetchModels();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'مفتاح API غير صالح');
    } finally {
      setSavingApiKey(false);
    }
  };

  const handleDeleteApiKey = async () => {
    try {
      await axios.delete(`${API}/api-keys`);
      toast.success('تم حذف مفتاح API');
      setApiKeyInfo({ has_key: false });
    } catch (error) {
      toast.error('حدث خطأ');
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await axios.delete(`${API}/projects/${projectId}`);
      toast.success('تم حذف المشروع');
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (error) {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>جاري التحميل...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <header className="glass border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-black text-lg">B</span>
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">BuildMap</span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-xl"
              data-testid="theme-toggle-btn"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {/* API Key Status */}
            <Button
              variant="ghost"
              onClick={() => setShowApiKeyDialog(true)}
              className={`flex items-center gap-2 rounded-xl ${apiKeyInfo?.has_key ? 'text-green-600 dark:text-green-400' : 'text-orange-500'}`}
              data-testid="api-key-status-btn"
            >
              <Key className="w-4 h-4" />
              <span className="hidden sm:inline">
                {apiKeyInfo?.has_key ? 'API متصل' : 'إعداد API'}
              </span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 rounded-xl" data-testid="user-menu-btn">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="hidden sm:inline text-foreground">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 rounded-xl">
                <DropdownMenuItem onClick={() => setShowApiKeyDialog(true)} className="rounded-lg">
                  <Settings className="w-4 h-4 ml-2" />
                  إعدادات API
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive rounded-lg" data-testid="logout-btn">
                  <LogOut className="w-4 h-4 ml-2" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            مرحباً، {user?.name}
          </h1>
          <p className="text-muted-foreground">
            ابدأ مشروعاً جديداً أو تابع العمل على مشاريعك السابقة
          </p>
        </div>

        {/* API Key Warning */}
        {!apiKeyInfo?.has_key && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <span className="text-orange-600 dark:text-orange-400">
                يجب إضافة مفتاح OpenRouter API لاستخدام المنصة
              </span>
            </div>
            <Button 
              onClick={() => setShowApiKeyDialog(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
              data-testid="add-api-key-warning-btn"
            >
              إضافة مفتاح
            </Button>
          </div>
        )}

        {/* Projects Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">مشاريعك</h2>
          <Button
            onClick={() => setShowNewProject(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl flex items-center gap-2"
            data-testid="new-project-btn"
          >
            <Plus className="w-4 h-4" />
            مشروع جديد
          </Button>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <FolderOpen className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">لا توجد مشاريع</h3>
            <p className="text-muted-foreground mb-6">ابدأ بإنشاء مشروعك الأول لتحويل فكرتك إلى واقع</p>
            <Button
              onClick={() => setShowNewProject(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl"
              data-testid="empty-new-project-btn"
            >
              إنشاء مشروع جديد
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {project.title}
                  </h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                        <span className="sr-only">القائمة</span>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="rounded-xl">
                      <DropdownMenuItem 
                        onClick={() => handleDeleteProject(project.id)}
                        className="text-destructive rounded-lg"
                        data-testid={`delete-project-${project.id}`}
                      >
                        <Trash2 className="w-4 h-4 ml-2" />
                        حذف
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{project.idea}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {project.has_outputs && (
                      <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400 border-0 rounded-lg">
                        <CheckCircle className="w-3 h-3 ml-1" />
                        جاهز
                      </Badge>
                    )}
                    <span className="text-muted-foreground">
                      {new Date(project.updated_at).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                  <Link to={`/project/${project.id}`}>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-primary hover:bg-primary/10 rounded-lg"
                      data-testid={`open-project-${project.id}`}
                    >
                      فتح
                      <ChevronLeft className="w-4 h-4 mr-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* New Project Dialog */}
      <Dialog open={showNewProject} onOpenChange={setShowNewProject}>
        <DialogContent className="sm:max-w-lg rounded-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">مشروع جديد</DialogTitle>
            <DialogDescription>
              أدخل معلومات فكرتك لبدء رحلة التحويل
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-title">عنوان المشروع</Label>
              <Input
                id="project-title"
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                placeholder="مثال: تطبيق توصيل طلبات"
                className="rounded-xl"
                data-testid="new-project-title-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-idea">صف فكرتك</Label>
              <textarea
                id="project-idea"
                value={newProjectIdea}
                onChange={(e) => setNewProjectIdea(e.target.value)}
                placeholder="اكتب فكرتك هنا... لا تقلق إذا كانت غير واضحة، المساعد الذكي سيساعدك"
                className="w-full h-32 p-3 border border-border bg-card rounded-xl focus:ring-1 focus:ring-primary focus:border-primary resize-none"
                data-testid="new-project-idea-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewProject(false)}
              className="rounded-xl"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={creatingProject}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
              data-testid="create-project-submit-btn"
            >
              {creatingProject ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : 'إنشاء المشروع'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* API Key Dialog */}
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent className="sm:max-w-lg rounded-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">إعدادات API</DialogTitle>
            <DialogDescription>
              أدخل مفتاح OpenRouter API الخاص بك للوصول إلى نماذج الذكاء الاصطناعي
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {apiKeyInfo?.has_key ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-green-600 dark:text-green-400 font-medium">مفتاح API متصل</p>
                      <p className="text-green-600/70 dark:text-green-400/70 text-sm">النموذج الافتراضي: {apiKeyInfo.default_model}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteApiKey}
                    className="text-destructive border-destructive/30 hover:bg-destructive/10 rounded-lg"
                    data-testid="delete-api-key-btn"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : null}
            
            <div className="space-y-2">
              <Label htmlFor="api-key">مفتاح API</Label>
              <Input
                id="api-key"
                type="password"
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                placeholder="sk-or-..."
                className="rounded-xl font-mono"
                data-testid="api-key-input"
              />
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                احصل على مفتاحك من
                <a 
                  href="https://openrouter.ai/keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  openrouter.ai/keys
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="default-model">النموذج الافتراضي</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="rounded-xl" data-testid="model-select">
                  <SelectValue placeholder="اختر النموذج" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  <ScrollArea className="h-72">
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.id} className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <span>{model.name}</span>
                          {model.is_free && (
                            <Badge variant="secondary" className="bg-green-500/10 text-green-600 text-xs border-0">
                              مجاني
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground mr-2">({model.provider})</span>
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                سيتم تحميل جميع النماذج المتاحة بعد إضافة المفتاح
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApiKeyDialog(false)}
              className="rounded-xl"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSaveApiKey}
              disabled={savingApiKey || !newApiKey.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
              data-testid="save-api-key-btn"
            >
              {savingApiKey ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardPage;
