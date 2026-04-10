import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import NotificationBell from '../components/NotificationBell';
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
  Loader2,
  MoreVertical,
  Share2,
  Eye,
  Globe,
  Lock
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PROVIDER_INFO = {
  openrouter: { name: 'OpenRouter', color: 'bg-blue-500', prefix: 'sk-or-', url: 'https://openrouter.ai/keys', desc: 'يدعم جميع النماذج' },
  openai: { name: 'OpenAI', color: 'bg-green-600', prefix: 'sk-', url: 'https://platform.openai.com/api-keys', desc: 'GPT-4o, GPT-4o Mini' },
  anthropic: { name: 'Anthropic', color: 'bg-amber-600', prefix: 'sk-ant-', url: 'https://console.anthropic.com/settings/keys', desc: 'Claude 3.5 Sonnet' },
  google: { name: 'Google AI', color: 'bg-red-500', prefix: 'AI', url: 'https://aistudio.google.com/apikey', desc: 'Gemini Pro, Flash' },
};

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
  const [selectedProvider, setSelectedProvider] = useState('openrouter');

  // Publish Dialog - Phase 1
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [publishingProject, setPublishingProject] = useState(null);
  const [publishVisibility, setPublishVisibility] = useState('public');
  const [publishCategory, setPublishCategory] = useState('');
  const [publishing, setPublishing] = useState(false);

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
        provider: selectedProvider,
        default_model: selectedModel
      });
      toast.success(`تم حفظ مفتاح ${PROVIDER_INFO[selectedProvider]?.name || selectedProvider} بنجاح`);
      setShowApiKeyDialog(false);
      setNewApiKey('');
      fetchData();
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
      toast.success('تم حذف جميع المفاتيح');
      setApiKeyInfo({ has_key: false, providers: [] });
    } catch (error) {
      toast.error('حدث خطأ');
    }
  };

  const handleDeleteProviderKey = async (provider) => {
    try {
      await axios.delete(`${API}/api-keys/${provider}`);
      toast.success(`تم حذف مفتاح ${PROVIDER_INFO[provider]?.name || provider}`);
      fetchData();
    } catch (error) {
      toast.error('حدث خطأ');
    }
  };

  const handlePublishProject = (project) => {
    setPublishingProject(project);
    setPublishCategory('');
    setPublishVisibility('public');
    setShowPublishDialog(true);
  };

  const confirmPublish = async () => {
    if (!publishingProject) return;
    
    setPublishing(true);
    try {
      await axios.post(
        `${API}/projects/${publishingProject.id}/publish`,
        {
          visibility: publishVisibility,
          category: publishCategory || null,
          status: 'idea',
          public_outputs: [],
          for_sale: false
        },
        { withCredentials: true }
      );
      
      toast.success('تم نشر المشروع بنجاح! 🎉');
      setShowPublishDialog(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'حدث خطأ أثناء النشر');
    } finally {
      setPublishing(false);
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
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">جاري التحميل...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <header className="glass border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center shadow-glow transition-smooth group-hover:shadow-glow-lg">
              <span className="text-primary-foreground font-black text-sm">B</span>
            </div>
            <span className="text-base font-bold text-foreground tracking-tight hidden sm:inline">BuildMap</span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Explore Link - Phase 1 */}
            <Link to="/explore">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-lg text-xs sm:text-sm hidden sm:flex"
              >
                <Globe className="w-3.5 h-3.5 ml-1" />
                استكشف
              </Button>
            </Link>

            {/* Notification Bell - Phase 1 */}
            <NotificationBell />

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg transition-smooth"
              data-testid="theme-toggle-btn"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {/* API Key Status */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowApiKeyDialog(true)}
              className={`flex items-center gap-1.5 rounded-lg transition-smooth h-8 px-2 text-xs ${apiKeyInfo?.has_key ? 'text-green-600 dark:text-green-400 hover:bg-green-500/10' : 'text-orange-500 hover:bg-orange-500/10'}`}
              data-testid="api-key-status-btn"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {apiKeyInfo?.has_key ? 'متصل' : 'إعداد API'}
              </span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-1.5 rounded-lg transition-smooth h-8 px-2" data-testid="user-menu-btn">
                  <div className="w-6 h-6 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-primary-foreground" />
                  </div>
                  <span className="hidden sm:inline text-foreground text-xs font-medium max-w-[80px] truncate">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40 rounded-lg">
                <DropdownMenuItem onClick={() => setShowApiKeyDialog(true)} className="rounded-md text-xs">
                  <Settings className="w-3.5 h-3.5 ml-2" />
                  إعدادات API
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive rounded-md text-xs" data-testid="logout-btn">
                  <LogOut className="w-3.5 h-3.5 ml-2" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Welcome Section */}
        <div className="mb-5 sm:mb-6 animate-fade-in">
          <h1 className="text-headline text-foreground mb-1">
            مرحباً، {user?.name}
          </h1>
          <p className="text-body-small text-muted-foreground">
            ابدأ مشروعاً جديداً أو تابع العمل على مشاريعك السابقة
          </p>
        </div>

        {/* API Key Warning */}
        {!apiKeyInfo?.has_key && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mb-5 flex items-center justify-between animate-scale-in">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-orange-500" />
              </div>
              <span className="text-orange-600 dark:text-orange-400 text-xs sm:text-sm font-medium">
                يجب إضافة مفتاح API لاستخدام المنصة
              </span>
            </div>
            <Button 
              size="sm"
              onClick={() => setShowApiKeyDialog(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-smooth h-8 text-xs"
              data-testid="add-api-key-warning-btn"
            >
              إضافة مفتاح
            </Button>
          </div>
        )}

        {/* Projects Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-title text-foreground">مشاريعك</h2>
          <Button
            size="sm"
            onClick={() => setShowNewProject(true)}
            className="btn-primary font-medium rounded-lg flex items-center gap-1.5 h-8 text-xs"
            data-testid="new-project-btn"
          >
            <Plus className="w-3.5 h-3.5" />
            مشروع جديد
          </Button>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="card-elevated p-8 sm:p-10 text-center animate-fade-in">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-muted rounded-xl flex items-center justify-center mx-auto mb-3">
              <FolderOpen className="w-7 h-7 sm:w-8 sm:h-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1.5">لا توجد مشاريع</h3>
            <p className="text-muted-foreground text-xs sm:text-sm mb-4">ابدأ بإنشاء مشروعك الأول</p>
            <Button
              size="sm"
              onClick={() => setShowNewProject(true)}
              className="btn-primary font-medium rounded-lg h-9 text-xs"
              data-testid="empty-new-project-btn"
            >
              إنشاء مشروع جديد
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {projects.map((project, index) => (
              <div
                key={project.id}
                className="card-elevated p-4 interactive-card group animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors-smooth line-clamp-1">
                    {project.title}
                  </h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="sr-only">القائمة</span>
                        <MoreVertical className="w-3.5 h-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="rounded-lg w-36">
                      <DropdownMenuItem 
                        onClick={() => handlePublishProject(project)}
                        className="rounded-md text-xs"
                      >
                        <Share2 className="w-3 h-3 ml-2" />
                        نشر للعامة
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteProject(project.id)}
                        className="text-destructive rounded-md text-xs"
                        data-testid={`delete-project-${project.id}`}
                      >
                        <Trash2 className="w-3 h-3 ml-2" />
                        حذف
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <p className="text-muted-foreground text-xs mb-3 line-clamp-2 leading-relaxed">{project.idea}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {project.has_outputs && (
                      <Badge className="badge-success rounded-md text-[10px] h-5 px-1.5">
                        <CheckCircle className="w-2.5 h-2.5 ml-0.5" />
                        جاهز
                      </Badge>
                    )}
                    <span className="text-muted-foreground text-[10px]">
                      {new Date(project.updated_at).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                  <Link to={`/project/${project.id}`}>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-primary hover:bg-primary/10 rounded-md transition-smooth h-7 text-xs px-2"
                      data-testid={`open-project-${project.id}`}
                    >
                      فتح
                      <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
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
        <DialogContent className="sm:max-w-md rounded-xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">مشروع جديد</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              أدخل معلومات فكرتك لبدء رحلة التحويل
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-3">
            <div className="space-y-1.5">
              <Label htmlFor="project-title" className="text-xs">عنوان المشروع</Label>
              <Input
                id="project-title"
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                placeholder="مثال: تطبيق توصيل طلبات"
                className="rounded-lg input-enhanced h-9 text-sm"
                data-testid="new-project-title-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="project-idea" className="text-xs">صف فكرتك</Label>
              <textarea
                id="project-idea"
                value={newProjectIdea}
                onChange={(e) => setNewProjectIdea(e.target.value)}
                placeholder="اكتب فكرتك هنا..."
                className="w-full h-24 p-2.5 border border-border bg-card rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-smooth text-sm"
                data-testid="new-project-idea-input"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewProject(false)}
              className="rounded-lg h-8 text-xs"
            >
              إلغاء
            </Button>
            <Button
              size="sm"
              onClick={handleCreateProject}
              disabled={creatingProject}
              className="btn-primary rounded-lg h-8 text-xs"
              data-testid="create-project-submit-btn"
            >
              {creatingProject ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 ml-1.5 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : 'إنشاء المشروع'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* API Key Dialog */}
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent className="sm:max-w-md rounded-xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">إعدادات API</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              أدخل مفتاح OpenRouter API للوصول إلى نماذج الذكاء الاصطناعي
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-3">
            {apiKeyInfo?.has_key && apiKeyInfo?.providers?.length > 0 ? (
              <div className="space-y-2">
                {apiKeyInfo.providers.map((p) => (
                  <div key={p.provider} className="bg-green-500/10 border border-green-500/20 rounded-lg p-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${PROVIDER_INFO[p.provider]?.color || 'bg-gray-400'}`} />
                        <div>
                          <p className="text-green-600 dark:text-green-400 font-medium text-xs">{p.provider_name} متصل</p>
                          <p className="text-green-600/70 dark:text-green-400/70 text-[10px]">{p.default_model}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProviderKey(p.provider)}
                        className="text-destructive h-6 w-6 p-0 rounded-md hover:bg-destructive/10"
                        data-testid={`delete-${p.provider}-key-btn`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : apiKeyInfo?.has_key ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-green-600 dark:text-green-400 font-medium text-xs">مفتاح API متصل</p>
                      <p className="text-green-600/70 dark:text-green-400/70 text-[10px]">النموذج: {apiKeyInfo.default_model}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteApiKey}
                    className="text-destructive border-destructive/30 hover:bg-destructive/10 rounded-md h-7"
                    data-testid="delete-api-key-btn"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ) : null}
            
            {/* Provider Selection */}
            <div className="space-y-1.5">
              <Label className="text-xs">المزود</Label>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(PROVIDER_INFO).map(([id, info]) => (
                  <button
                    key={id}
                    onClick={() => setSelectedProvider(id)}
                    className={`p-2 rounded-lg border-2 text-right transition-smooth ${
                      selectedProvider === id 
                        ? 'border-primary bg-primary/5 shadow-soft' 
                        : 'border-border hover:border-muted-foreground/30 hover:bg-muted/50'
                    }`}
                    data-testid={`provider-${id}-btn`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <div className={`w-2 h-2 rounded-full ${info.color}`} />
                      <span className="font-medium text-[11px] text-foreground">{info.name}</span>
                    </div>
                    <p className="text-[9px] text-muted-foreground leading-tight">{info.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="api-key" className="text-xs">مفتاح {PROVIDER_INFO[selectedProvider]?.name || 'API'}</Label>
              <Input
                id="api-key"
                type="password"
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                placeholder={`${PROVIDER_INFO[selectedProvider]?.prefix || ''}...`}
                className="rounded-lg font-mono input-enhanced h-9 text-xs"
                data-testid="api-key-input"
              />
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                احصل على مفتاحك من
                <a 
                  href={PROVIDER_INFO[selectedProvider]?.url || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline underline-offset-2 inline-flex items-center gap-0.5"
                >
                  {PROVIDER_INFO[selectedProvider]?.name}
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </p>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="default-model" className="text-xs">النموذج الافتراضي</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="rounded-lg h-9 text-xs" data-testid="model-select">
                  <SelectValue placeholder="اختر النموذج" />
                </SelectTrigger>
                <SelectContent className="max-h-64 rounded-lg">
                  <ScrollArea className="h-56">
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.id} className="rounded-md text-xs">
                        <div className="flex items-center gap-1.5">
                          <span>{model.name}</span>
                          {model.is_free && (
                            <Badge className="badge-success text-[9px] h-4 px-1">
                              مجاني
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowApiKeyDialog(false)}
              className="rounded-lg h-8 text-xs"
            >
              إلغاء
            </Button>
            <Button
              size="sm"
              onClick={handleSaveApiKey}
              disabled={savingApiKey || !newApiKey.trim()}
              className="btn-primary rounded-lg h-8 text-xs"
              data-testid="save-api-key-btn"
            >
              {savingApiKey ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 ml-1.5 animate-spin" />
                  جاري الحفظ...
                </>
              ) : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publish Dialog - Phase 1 */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent className="sm:max-w-md rounded-xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">نشر المشروع للعامة</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              اجعل مشروعك مرئياً في صفحة الاستكشاف
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-3">
            {/* Visibility */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">مستوى الخصوصية</Label>
              <div className="space-y-2">
                <button
                  onClick={() => setPublishVisibility('public')}
                  className={`w-full p-3 rounded-lg border-2 text-right transition-smooth ${
                    publishVisibility === 'public'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">عام</span>
                  </div>
                  <p className="text-xs text-muted-foreground">يظهر في صفحة الاستكشاف للجميع</p>
                </button>
                
                <button
                  onClick={() => setPublishVisibility('unlisted')}
                  className={`w-full p-3 rounded-lg border-2 text-right transition-smooth ${
                    publishVisibility === 'unlisted'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">غير مدرج</span>
                  </div>
                  <p className="text-xs text-muted-foreground">فقط من لديه الرابط يمكنه رؤيته</p>
                </button>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-xs">الفئة (اختياري)</Label>
              <Select value={publishCategory} onValueChange={setPublishCategory}>
                <SelectTrigger className="rounded-lg h-9 text-sm">
                  <SelectValue placeholder="اختر فئة المشروع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Web Application">Web Application</SelectItem>
                  <SelectItem value="Mobile App">Mobile App</SelectItem>
                  <SelectItem value="API & Backend">API & Backend</SelectItem>
                  <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                  <SelectItem value="Dashboard & Analytics">Dashboard & Analytics</SelectItem>
                  <SelectItem value="E-commerce">E-commerce</SelectItem>
                  <SelectItem value="SaaS">SaaS</SelectItem>
                  <SelectItem value="AI & ML">AI & ML</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPublishDialog(false)}
              disabled={publishing}
              className="rounded-lg h-8 text-xs"
            >
              إلغاء
            </Button>
            <Button
              size="sm"
              onClick={confirmPublish}
              disabled={publishing}
              className="btn-primary rounded-lg h-8 text-xs"
            >
              {publishing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 ml-1.5 animate-spin" />
                  جاري النشر...
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 ml-1.5" />
                  نشر الآن
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardPage;
