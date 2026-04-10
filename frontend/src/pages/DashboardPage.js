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
  Loader2,
  MoreVertical
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PROVIDER_INFO = {
  openrouter: { name: 'OpenRouter', color: 'bg-blue-500', prefix: 'sk-or-', url: 'https://openrouter.ai/keys', desc: 'يدعم جميع النماذج (OpenAI, Anthropic, Google, Meta وأكثر)' },
  openai: { name: 'OpenAI', color: 'bg-green-600', prefix: 'sk-', url: 'https://platform.openai.com/api-keys', desc: 'GPT-4o, GPT-4o Mini وغيرها' },
  anthropic: { name: 'Anthropic', color: 'bg-amber-600', prefix: 'sk-ant-', url: 'https://console.anthropic.com/settings/keys', desc: 'Claude 3.5 Sonnet, Claude 3 Opus' },
  google: { name: 'Google AI', color: 'bg-red-500', prefix: 'AI', url: 'https://aistudio.google.com/apikey', desc: 'Gemini Pro, Gemini Flash' },
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
      <header className="glass border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-glow transition-smooth group-hover:shadow-glow-lg">
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
              className="rounded-xl transition-smooth"
              data-testid="theme-toggle-btn"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {/* API Key Status */}
            <Button
              variant="ghost"
              onClick={() => setShowApiKeyDialog(true)}
              className={`flex items-center gap-2 rounded-xl transition-smooth ${apiKeyInfo?.has_key ? 'text-green-600 dark:text-green-400 hover:bg-green-500/10' : 'text-orange-500 hover:bg-orange-500/10'}`}
              data-testid="api-key-status-btn"
            >
              <Key className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">
                {apiKeyInfo?.has_key ? 'API متصل' : 'إعداد API'}
              </span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 rounded-xl transition-smooth" data-testid="user-menu-btn">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="hidden sm:inline text-foreground font-medium">{user?.name}</span>
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
        <div className="mb-8 animate-fade-in">
          <h1 className="text-headline text-foreground mb-2">
            مرحباً، {user?.name}
          </h1>
          <p className="text-body text-muted-foreground">
            ابدأ مشروعاً جديداً أو تابع العمل على مشاريعك السابقة
          </p>
        </div>

        {/* API Key Warning */}
        {!apiKeyInfo?.has_key && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-8 flex items-center justify-between animate-scale-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-orange-500" />
              </div>
              <span className="text-orange-600 dark:text-orange-400 font-medium">
                يجب إضافة مفتاح OpenRouter API لاستخدام المنصة
              </span>
            </div>
            <Button 
              onClick={() => setShowApiKeyDialog(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-smooth"
              data-testid="add-api-key-warning-btn"
            >
              إضافة مفتاح
            </Button>
          </div>
        )}

        {/* Projects Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-title text-foreground">مشاريعك</h2>
          <Button
            onClick={() => setShowNewProject(true)}
            className="btn-primary font-semibold rounded-xl flex items-center gap-2"
            data-testid="new-project-btn"
          >
            <Plus className="w-4 h-4" />
            مشروع جديد
          </Button>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="card-elevated p-12 text-center animate-fade-in">
            <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">لا توجد مشاريع</h3>
            <p className="text-muted-foreground mb-6">ابدأ بإنشاء مشروعك الأول لتحويل فكرتك إلى واقع</p>
            <Button
              onClick={() => setShowNewProject(true)}
              className="btn-primary font-semibold rounded-xl"
              data-testid="empty-new-project-btn"
            >
              إنشاء مشروع جديد
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <div
                key={project.id}
                className="card-elevated p-6 interactive-card group animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors-smooth line-clamp-1">
                    {project.title}
                  </h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="sr-only">القائمة</span>
                        <MoreVertical className="w-4 h-4" />
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
                
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">{project.idea}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {project.has_outputs && (
                      <Badge className="badge-success rounded-lg text-xs">
                        <CheckCircle className="w-3 h-3 ml-1" />
                        جاهز
                      </Badge>
                    )}
                    <span className="text-muted-foreground text-xs">
                      {new Date(project.updated_at).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                  <Link to={`/project/${project.id}`}>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-primary hover:bg-primary/10 rounded-lg transition-smooth"
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
            <DialogTitle className="text-title">مشروع جديد</DialogTitle>
            <DialogDescription className="text-muted-foreground">
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
                className="rounded-xl input-enhanced"
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
                className="w-full h-32 p-3 border border-border bg-card rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-smooth"
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
              className="btn-primary rounded-xl"
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
            <DialogTitle className="text-title">إعدادات API</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              أدخل مفتاح OpenRouter API الخاص بك للوصول إلى نماذج الذكاء الاصطناعي
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {apiKeyInfo?.has_key && apiKeyInfo?.providers?.length > 0 ? (
              <div className="space-y-2">
                {apiKeyInfo.providers.map((p) => (
                  <div key={p.provider} className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${PROVIDER_INFO[p.provider]?.color || 'bg-gray-400'}`} />
                        <div>
                          <p className="text-green-600 dark:text-green-400 font-medium text-sm">{p.provider_name} متصل</p>
                          <p className="text-green-600/70 dark:text-green-400/70 text-xs">{p.default_model}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProviderKey(p.provider)}
                        className="text-destructive h-7 w-7 p-0 rounded-lg hover:bg-destructive/10"
                        data-testid={`delete-${p.provider}-key-btn`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : apiKeyInfo?.has_key ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-green-600 dark:text-green-400 font-medium">مفتاح API متصل</p>
                      <p className="text-green-600/70 dark:text-green-400/70 text-sm">النموذج: {apiKeyInfo.default_model}</p>
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
            
            {/* Provider Selection */}
            <div className="space-y-2">
              <Label>المزود</Label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(PROVIDER_INFO).map(([id, info]) => (
                  <button
                    key={id}
                    onClick={() => setSelectedProvider(id)}
                    className={`p-3 rounded-xl border-2 text-right transition-smooth ${
                      selectedProvider === id 
                        ? 'border-primary bg-primary/5 shadow-soft' 
                        : 'border-border hover:border-muted-foreground/30 hover:bg-muted/50'
                    }`}
                    data-testid={`provider-${id}-btn`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2.5 h-2.5 rounded-full ${info.color}`} />
                      <span className="font-medium text-sm text-foreground">{info.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{info.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="api-key">مفتاح {PROVIDER_INFO[selectedProvider]?.name || 'API'}</Label>
              <Input
                id="api-key"
                type="password"
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                placeholder={`${PROVIDER_INFO[selectedProvider]?.prefix || ''}...`}
                className="rounded-xl font-mono input-enhanced"
                data-testid="api-key-input"
              />
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                احصل على مفتاحك من
                <a 
                  href={PROVIDER_INFO[selectedProvider]?.url || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline underline-offset-2 inline-flex items-center gap-1"
                >
                  {PROVIDER_INFO[selectedProvider]?.name}
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
                <SelectContent className="max-h-80 rounded-xl">
                  <ScrollArea className="h-72">
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.id} className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <span>{model.name}</span>
                          {model.is_free && (
                            <Badge className="badge-success text-xs">
                              مجاني
                            </Badge>
                          )}
                          {model.source && model.source !== 'openrouter' && model.source !== 'default' && (
                            <Badge variant="outline" className="text-xs">
                              مباشر
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
                سيتم تحميل جميع النماذج المتاحة من جميع المزودين المتصلين
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
              className="btn-primary rounded-xl"
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
