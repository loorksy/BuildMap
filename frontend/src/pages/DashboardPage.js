import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  DialogTrigger,
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
import { 
  Plus, 
  Settings, 
  LogOut, 
  FolderOpen, 
  ChevronLeft,
  Key,
  Trash2,
  User,
  Sparkles
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const DashboardPage = () => {
  const { user, logout } = useAuth();
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
  const [selectedModel, setSelectedModel] = useState('openai/gpt-4');
  const [savingApiKey, setSavingApiKey] = useState(false);

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
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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
      toast.error('حدث خطأ أثناء إنشاء المشروع');
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
    } catch (error) {
      toast.error('حدث خطأ أثناء حفظ المفتاح');
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
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center" dir="rtl">
        <div className="text-[#666666]">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]" dir="rtl">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <header className="bg-white border-b border-[#E5E5E5] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#002FA7] flex items-center justify-center">
              <span className="text-white font-black text-lg">B</span>
            </div>
            <span className="text-xl font-bold text-[#1A1A1A] tracking-tight">BuildMap</span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* API Key Status */}
            <Button
              variant="ghost"
              onClick={() => setShowApiKeyDialog(true)}
              className={`flex items-center gap-2 ${apiKeyInfo?.has_key ? 'text-green-600' : 'text-orange-500'}`}
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
                <Button variant="ghost" className="flex items-center gap-2" data-testid="user-menu-btn">
                  <div className="w-8 h-8 bg-[#002FA7] rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden sm:inline text-[#1A1A1A]">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => setShowApiKeyDialog(true)}>
                  <Settings className="w-4 h-4 ml-2" />
                  إعدادات API
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600" data-testid="logout-btn">
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
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
            مرحباً، {user?.name}
          </h1>
          <p className="text-[#666666]">
            ابدأ مشروعاً جديداً أو تابع العمل على مشاريعك السابقة
          </p>
        </div>

        {/* API Key Warning */}
        {!apiKeyInfo?.has_key && (
          <div className="bg-orange-50 border border-orange-200 p-4 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-orange-500" />
              <span className="text-orange-700">
                يجب إضافة مفتاح OpenRouter API لاستخدام المنصة
              </span>
            </div>
            <Button 
              onClick={() => setShowApiKeyDialog(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-none"
              data-testid="add-api-key-warning-btn"
            >
              إضافة مفتاح
            </Button>
          </div>
        )}

        {/* Projects Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[#1A1A1A]">مشاريعك</h2>
          <Button
            onClick={() => setShowNewProject(true)}
            className="bg-[#002FA7] hover:bg-[#002480] text-white font-bold rounded-none flex items-center gap-2"
            data-testid="new-project-btn"
          >
            <Plus className="w-4 h-4" />
            مشروع جديد
          </Button>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="bg-white border border-[#E5E5E5] p-12 text-center">
            <FolderOpen className="w-16 h-16 text-[#CCCCCC] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#1A1A1A] mb-2">لا توجد مشاريع</h3>
            <p className="text-[#666666] mb-6">ابدأ بإنشاء مشروعك الأول لتحويل فكرتك إلى واقع</p>
            <Button
              onClick={() => setShowNewProject(true)}
              className="bg-[#002FA7] hover:bg-[#002480] text-white font-bold rounded-none"
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
                className="bg-white border border-[#E5E5E5] p-6 hover:border-[#002FA7] transition-colors group"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#1A1A1A] group-hover:text-[#002FA7] transition-colors">
                    {project.title}
                  </h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">القائمة</span>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem 
                        onClick={() => handleDeleteProject(project.id)}
                        className="text-red-600"
                        data-testid={`delete-project-${project.id}`}
                      >
                        <Trash2 className="w-4 h-4 ml-2" />
                        حذف
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <p className="text-[#666666] text-sm mb-4 line-clamp-2">{project.idea}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {project.has_outputs && (
                      <span className="bg-green-100 text-green-700 px-2 py-1 text-xs">
                        مخرجات جاهزة
                      </span>
                    )}
                    <span className="text-[#999999]">
                      {new Date(project.updated_at).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                  <Link to={`/project/${project.id}`}>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-[#002FA7] hover:bg-[#E6EAF6]"
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
        <DialogContent className="sm:max-w-lg" dir="rtl">
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
                className="rounded-none"
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
                className="w-full h-32 p-3 border border-[#E5E5E5] bg-white focus:ring-1 focus:ring-[#002FA7] focus:border-[#002FA7] resize-none"
                data-testid="new-project-idea-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewProject(false)}
              className="rounded-none"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={creatingProject}
              className="bg-[#002FA7] hover:bg-[#002480] text-white rounded-none"
              data-testid="create-project-submit-btn"
            >
              {creatingProject ? 'جاري الإنشاء...' : 'إنشاء المشروع'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* API Key Dialog */}
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent className="sm:max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">إعدادات API</DialogTitle>
            <DialogDescription>
              أدخل مفتاح OpenRouter API الخاص بك
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {apiKeyInfo?.has_key ? (
              <div className="bg-green-50 border border-green-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-700 font-medium">مفتاح API متصل</p>
                    <p className="text-green-600 text-sm">المودل: {apiKeyInfo.default_model}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteApiKey}
                    className="text-red-600 border-red-300 hover:bg-red-50"
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
                className="rounded-none font-mono"
                data-testid="api-key-input"
              />
              <p className="text-xs text-[#999999]">
                احصل على مفتاحك من{' '}
                <a 
                  href="https://openrouter.ai/keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#002FA7] hover:underline"
                >
                  openrouter.ai/keys
                </a>
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="default-model">المودل الافتراضي</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="rounded-none" data-testid="model-select">
                  <SelectValue placeholder="اختر المودل" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name} - {model.provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApiKeyDialog(false)}
              className="rounded-none"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSaveApiKey}
              disabled={savingApiKey || !newApiKey.trim()}
              className="bg-[#002FA7] hover:bg-[#002480] text-white rounded-none"
              data-testid="save-api-key-btn"
            >
              {savingApiKey ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardPage;
