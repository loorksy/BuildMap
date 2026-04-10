import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import InteractiveMindMap from '../components/InteractiveMindMap';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';
import { 
  ArrowRight, 
  Send, 
  FileText, 
  Code, 
  ListChecks, 
  Award, 
  BarChart3, 
  GitBranch,
  Loader2,
  Sparkles,
  Download,
  Copy,
  Check,
  Sun,
  Moon,
  MessageSquare,
  Globe,
  Smartphone,
  Server,
  Layers,
  Users,
  Building,
  ShoppingCart,
  Clock,
  MessageCircle,
  Database,
  Zap,
  LogIn,
  LayoutDashboard,
  Bell,
  Search,
  Terminal,
  Plus,
  Eye,
  ChevronDown,
  ChevronUp,
  FolderArchive,
  Shield,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Target,
  Palette,
  Rocket,
  PanelRight,
  PanelRightClose,
  X,
  CreditCard,
  Settings,
  Mail,
  Star,
  TrendingUp,
  Lock,
  Share2,
  FileSearch,
  Languages,
  Wallet,
  MapPin
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Project feature suggestions with detailed prompts
const projectSuggestions = [
  {
    id: 'new_customers',
    label: 'عملاء جدد',
    icon: Users,
    prompt: 'أريد إضافة نظام لإدارة العملاء الجدد يشمل:\n- صفحة تسجيل عملاء جدد\n- نموذج جمع بيانات العميل (الاسم، البريد، الهاتف)\n- إشعار ترحيبي للعميل الجديد\n- لوحة تحكم لعرض العملاء الجدد'
  },
  {
    id: 'payments',
    label: 'نظام دفع',
    icon: CreditCard,
    prompt: 'أريد إضافة نظام دفع إلكتروني يشمل:\n- بوابة دفع متعددة (بطاقات، محافظ إلكترونية)\n- صفحة إتمام الشراء\n- فواتير تلقائية\n- سجل المعاملات المالية'
  },
  {
    id: 'notifications',
    label: 'إشعارات',
    icon: Bell,
    prompt: 'أريد إضافة نظام إشعارات يشمل:\n- إشعارات فورية داخل التطبيق\n- إشعارات بريد إلكتروني\n- إشعارات SMS اختيارية\n- إعدادات تخصيص الإشعارات للمستخدم'
  },
  {
    id: 'dashboard',
    label: 'لوحة تحكم',
    icon: LayoutDashboard,
    prompt: 'أريد إضافة لوحة تحكم إدارية تشمل:\n- إحصائيات عامة (المستخدمين، المبيعات، الزيارات)\n- رسوم بيانية تفاعلية\n- تقارير قابلة للتصدير\n- فلترة حسب التاريخ'
  },
  {
    id: 'search',
    label: 'بحث متقدم',
    icon: Search,
    prompt: 'أريد إضافة نظام بحث متقدم يشمل:\n- بحث نصي سريع\n- فلترة متعددة المعايير\n- اقتراحات تلقائية أثناء الكتابة\n- حفظ عمليات البحث السابقة'
  },
  {
    id: 'chat',
    label: 'دردشة مباشرة',
    icon: MessageCircle,
    prompt: 'أريد إضافة نظام دردشة مباشرة يشمل:\n- محادثات فورية بين المستخدمين\n- دعم الملفات والصور\n- حالة الاتصال (متصل/غير متصل)\n- أرشيف المحادثات'
  },
  {
    id: 'reviews',
    label: 'تقييمات',
    icon: Star,
    prompt: 'أريد إضافة نظام تقييمات ومراجعات يشمل:\n- تقييم بالنجوم (1-5)\n- كتابة مراجعات نصية\n- الرد على المراجعات\n- عرض متوسط التقييم'
  },
  {
    id: 'analytics',
    label: 'تحليلات',
    icon: TrendingUp,
    prompt: 'أريد إضافة نظام تحليلات يشمل:\n- تتبع سلوك المستخدم\n- تحليل مصادر الزيارات\n- معدلات التحويل\n- تقارير أداء مفصلة'
  },
  {
    id: 'security',
    label: 'حماية متقدمة',
    icon: Lock,
    prompt: 'أريد إضافة ميزات أمان متقدمة تشمل:\n- تسجيل دخول ثنائي (2FA)\n- تشفير البيانات الحساسة\n- سجل نشاط المستخدم\n- إدارة الجلسات النشطة'
  },
  {
    id: 'sharing',
    label: 'مشاركة اجتماعية',
    icon: Share2,
    prompt: 'أريد إضافة ميزات المشاركة الاجتماعية تشمل:\n- مشاركة على فيسبوك، تويتر، واتساب\n- روابط قابلة للمشاركة\n- معاينة عند المشاركة (Open Graph)\n- تتبع المشاركات'
  },
  {
    id: 'reports',
    label: 'تقارير PDF',
    icon: FileSearch,
    prompt: 'أريد إضافة نظام تقارير PDF يشمل:\n- توليد تقارير تلقائية\n- قوالب تقارير متعددة\n- تصدير بصيغ مختلفة (PDF, Excel)\n- جدولة إرسال التقارير'
  },
  {
    id: 'multilang',
    label: 'تعدد اللغات',
    icon: Languages,
    prompt: 'أريد إضافة دعم تعدد اللغات يشمل:\n- دعم العربية والإنجليزية\n- تبديل سهل بين اللغات\n- ترجمة المحتوى الديناميكي\n- حفظ تفضيل اللغة للمستخدم'
  }
];

const ProjectPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [project, setProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [outputs, setOutputs] = useState(null);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [copiedTab, setCopiedTab] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [showPreview, setShowPreview] = useState(true);
  const [previewFile, setPreviewFile] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  
  // Suggestion prompt preview
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);

  useEffect(() => { fetchProjectData(); }, [projectId]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchProjectData = async () => {
    try {
      const [projectRes, messagesRes, modelsRes] = await Promise.all([
        axios.get(`${API}/projects/${projectId}`),
        axios.get(`${API}/projects/${projectId}/messages`),
        axios.get(`${API}/models`)
      ]);
      setProject(projectRes.data);
      setMessages(messagesRes.data);
      setModels(modelsRes.data);
      try {
        const analysisRes = await axios.get(`${API}/projects/${projectId}/analysis`);
        setAnalysis(analysisRes.data);
      } catch (e) {}
      try {
        const outputsRes = await axios.get(`${API}/projects/${projectId}/outputs`);
        setOutputs(outputsRes.data);
      } catch (e) {}
    } catch (error) {
      toast.error(error.response?.data?.detail || 'حدث خطأ في تحميل المشروع');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e, customMessage = null) => {
    e?.preventDefault();
    const content = customMessage || messageInput;
    if (!content.trim() || sending) return;

    const userMessage = { id: Date.now().toString(), role: 'user', content, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setMessageInput('');
    setSelectedSuggestion(null);
    setSending(true);

    const streamingMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: streamingMsgId, role: 'assistant', content: '', created_at: new Date().toISOString(), isStreaming: true }]);

    try {
      const response = await fetch(`${API}/projects/${projectId}/messages/stream`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ content })
      });
      if (!response.ok) throw new Error((await response.json().catch(() => null))?.detail || 'حدث خطأ');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6).trim());
            if (event.type === 'chunk') {
              setMessages(prev => prev.map(m => m.id === streamingMsgId ? { ...m, content: m.content + event.content } : m));
            } else if (event.type === 'done') {
              setMessages(prev => prev.map(m => m.id === streamingMsgId ? { ...m, id: event.id, created_at: event.created_at, isStreaming: false } : m));
              if (event.analysis) setAnalysis(event.analysis);
              if (event.ready_to_generate) toast.success('المشروع جاهز لتوليد المخرجات!');
            } else if (event.type === 'error') {
              toast.error(event.content);
              setMessages(prev => prev.filter(m => m.id !== streamingMsgId));
            }
          } catch (parseErr) {}
        }
      }
    } catch (error) {
      toast.error(error.message || 'حدث خطأ');
      setMessages(prev => prev.filter(m => m.id !== userMessage.id && m.id !== streamingMsgId));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setMessageInput(suggestion.prompt);
  };

  const handleSendSuggestion = () => {
    if (selectedSuggestion) {
      handleSendMessage(null, selectedSuggestion.prompt);
    }
  };

  const handleCancelSuggestion = () => {
    setSelectedSuggestion(null);
    setMessageInput('');
  };

  const handleGenerateOutputs = async () => {
    setGenerating(true);
    try {
      const response = await axios.post(`${API}/projects/${projectId}/generate`);
      setOutputs(response.data);
      toast.success('تم توليد المخرجات بنجاح!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'حدث خطأ في توليد المخرجات');
    } finally {
      setGenerating(false);
    }
  };

  const handleModelChange = async (model) => {
    try {
      await axios.patch(`${API}/projects/${projectId}`, { selected_model: model });
      setProject(prev => ({ ...prev, selected_model: model }));
      toast.success('تم تغيير النموذج');
    } catch (error) {
      toast.error('حدث خطأ');
    }
  };

  const handleCopy = (content, tab) => {
    navigator.clipboard.writeText(content);
    setCopiedTab(tab);
    toast.success('تم النسخ');
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const handleDownload = (content, filename) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportZip = async () => {
    setExporting(true);
    try {
      const response = await axios.get(`${API}/projects/${projectId}/export`, { responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url; a.download = `BuildMap_${project?.title || 'project'}.zip`; a.click();
      URL.revokeObjectURL(url);
      toast.success('تم تحميل الملفات!');
    } catch (error) {
      toast.error('حدث خطأ في تصدير الملفات');
    } finally {
      setExporting(false);
    }
  };

  const renderMarkdown = (content) => {
    if (!content) return null;
    return content.split('\n').map((line, i) => {
      if (line.startsWith('# ')) return <h1 key={i} className="text-base sm:text-lg font-bold mb-2 text-foreground">{line.slice(2)}</h1>;
      if (line.startsWith('## ')) return <h2 key={i} className="text-sm sm:text-base font-semibold mb-2 text-foreground">{line.slice(3)}</h2>;
      if (line.startsWith('### ')) return <h3 key={i} className="text-xs sm:text-sm font-medium mb-1 text-foreground">{line.slice(4)}</h3>;
      if (line.startsWith('- ')) return <li key={i} className="mr-3 mb-0.5 text-muted-foreground text-xs">{line.slice(2)}</li>;
      if (line.startsWith('```') || line.trim() === '') return line.trim() === '' ? <br key={i} /> : null;
      return <p key={i} className="mb-1.5 text-muted-foreground text-xs leading-relaxed">{line}</p>;
    });
  };

  const getStageInfo = (stageId) => {
    const stageNames = {
      'idea_understanding': { name: 'فهم الفكرة', icon: Lightbulb, color: 'text-yellow-500' },
      'target_audience': { name: 'الجمهور', icon: Users, color: 'text-blue-500' },
      'features': { name: 'الميزات', icon: Layers, color: 'text-purple-500' },
      'technical': { name: 'التقنية', icon: Code, color: 'text-green-500' },
      'design': { name: 'التصميم', icon: Palette, color: 'text-pink-500' },
      'timeline': { name: 'الجدول', icon: Clock, color: 'text-orange-500' },
      'generation': { name: 'التوليد', icon: Rocket, color: 'text-red-500' },
    };
    return stageNames[stageId] || { name: stageId, icon: Target, color: 'text-gray-500' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-xs">جاري التحميل...</span>
        </div>
      </div>
    );
  }

  const outputTabs = [
    { id: 'frontend-readme', label: 'Frontend', icon: FileText, content: outputs?.frontend_readme, filename: 'README-Frontend.md' },
    { id: 'backend-readme', label: 'Backend', icon: Code, content: outputs?.backend_readme, filename: 'README-Backend.md' },
    { id: 'plan', label: 'الخطة', icon: ListChecks, content: outputs?.plan, filename: 'Plan.md' },
    { id: 'skills', label: 'المهارات', icon: Award, content: outputs?.skills, filename: 'Skills.md' },
    { id: 'evaluation', label: 'التقييم', icon: BarChart3, content: outputs?.evaluation, filename: 'Evaluation.md' },
    { id: 'mindmap', label: 'خريطة', icon: GitBranch, content: outputs?.mindmap, filename: 'MindMap.json' },
  ];

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden" dir="rtl">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <header className="glass border-b border-border/50 sticky top-0 z-50 shrink-0">
        <div className="max-w-full mx-auto px-3 sm:px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors-smooth p-1.5 hover:bg-muted rounded-md">
              <ArrowRight className="w-4 h-4" />
            </Link>
            <h1 className="text-sm font-semibold text-foreground truncate max-w-[150px] sm:max-w-none">{project?.title}</h1>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button variant="ghost" size="icon" onClick={() => setShowSidebar(!showSidebar)} className="w-7 h-7 rounded-md transition-smooth hidden lg:flex">
              {showSidebar ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRight className="w-3.5 h-3.5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="w-7 h-7 rounded-md transition-smooth">
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </Button>
            <Select value={project?.selected_model} onValueChange={handleModelChange}>
              <SelectTrigger className="w-28 sm:w-32 rounded-md text-[10px] sm:text-xs h-7" data-testid="project-model-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-64 rounded-lg">
                <ScrollArea className="h-56">
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id} className="text-xs rounded-md">
                      <div className="flex items-center gap-1">
                        <span className="truncate">{model.name}</span>
                        {model.is_free && <Badge className="badge-success text-[8px] h-3.5 px-1">مجاني</Badge>}
                      </div>
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Section */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Progress Bar */}
          {analysis && (
            <div className="bg-gradient-to-l from-card via-card/80 to-card border-b border-border/50 px-3 sm:px-4 py-2.5 sm:py-3 shrink-0">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const stageInfo = getStageInfo(analysis.current_stage);
                      const StageIcon = stageInfo.icon;
                      return (
                        <>
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <StageIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${stageInfo.color}`} />
                          </div>
                          <div>
                            <p className="text-[10px] sm:text-xs font-medium text-foreground">{stageInfo.name}</p>
                            <p className="text-[9px] sm:text-[10px] text-muted-foreground">المرحلة الحالية</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <span className="text-base sm:text-lg font-bold text-primary">{Math.round(analysis.total_progress)}%</span>
                </div>
                
                <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-2">
                  <div className="absolute inset-y-0 right-0 bg-gradient-to-l from-primary to-blue-500 rounded-full transition-all duration-500 ease-out" style={{ width: `${analysis.total_progress}%` }} />
                </div>
                
                <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                  {analysis.stages?.slice(0, -1).map((stage) => {
                    const isCompleted = analysis.completed_stages?.includes(stage.id);
                    const isCurrent = analysis.current_stage === stage.id;
                    const stageInfo = getStageInfo(stage.id);
                    const StageIcon = stageInfo.icon;
                    return (
                      <div key={stage.id} className={`flex items-center gap-1 px-2 py-1 rounded-md text-[9px] sm:text-[10px] font-medium whitespace-nowrap transition-all ${
                        isCompleted ? 'bg-green-500/15 text-green-600 dark:text-green-400' 
                        : isCurrent ? 'bg-primary/15 text-primary border border-primary/30' 
                        : 'bg-muted/50 text-muted-foreground'
                      }`}>
                        {isCompleted ? <CheckCircle2 className="w-2.5 h-2.5" /> : isCurrent ? <StageIcon className="w-2.5 h-2.5 animate-pulse" /> : <div className="w-2.5 h-2.5 rounded-full border border-current opacity-50" />}
                        <span className="hidden sm:inline">{stage.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Messages Area - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto p-3 sm:p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-10 sm:py-14 animate-fade-in">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1">ابدأ المحادثة</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm max-w-sm mx-auto">اكتب فكرتك أو اختر من الاقتراحات</p>
                </div>
              )}
              
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'} animate-fade-in`}>
                  <div className={`max-w-[90%] sm:max-w-[85%] p-2.5 sm:p-3 ${message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}>
                    <p className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm">
                      {message.content}
                      {message.isStreaming && <span className="inline-block w-1.5 h-4 bg-primary animate-pulse mr-0.5 align-middle rounded-sm" />}
                    </p>
                  </div>
                </div>
              ))}
              
              {sending && !messages.some(m => m.isStreaming) && (
                <div className="flex justify-end animate-fade-in">
                  <div className="chat-bubble-assistant p-3">
                    <div className="flex items-center gap-1">
                      <span className="loading-dot w-1.5 h-1.5 bg-primary rounded-full"></span>
                      <span className="loading-dot w-1.5 h-1.5 bg-primary rounded-full"></span>
                      <span className="loading-dot w-1.5 h-1.5 bg-primary rounded-full"></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Fixed Bottom Section */}
          <div className="shrink-0 border-t border-border/50 bg-background">
            {/* Generate Button */}
            {(analysis?.ready_to_generate || analysis?.total_progress >= 60 || outputs) && !generating && (
              <div className="p-2.5 bg-gradient-to-r from-primary/10 via-primary/5 to-blue-500/10 border-b border-border/50">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center animate-bounce-soft">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <span className="font-medium text-foreground text-xs block">{outputs ? 'المخرجات جاهزة' : 'جاهز للتوليد!'}</span>
                      <span className="text-[10px] text-muted-foreground">{outputs ? 'يمكنك إعادة التوليد' : '6 ملفات احترافية'}</span>
                    </div>
                  </div>
                  <Button size="sm" onClick={handleGenerateOutputs} className="btn-primary rounded-lg shadow-glow h-8 text-xs" data-testid="generate-outputs-btn">
                    <Sparkles className="w-3 h-3 ml-1" />
                    {outputs ? 'إعادة' : 'توليد'}
                  </Button>
                </div>
              </div>
            )}

            {generating && (
              <div className="p-2.5 bg-primary border-b border-primary">
                <div className="max-w-3xl mx-auto flex items-center justify-center gap-2 text-primary-foreground">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span className="text-xs font-medium">جاري التوليد...</span>
                </div>
              </div>
            )}

            {/* Suggestion Preview */}
            {selectedSuggestion && (
              <div className="px-3 sm:px-4 py-3 bg-primary/5 border-b border-primary/20">
                <div className="max-w-3xl mx-auto">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <selectedSuggestion.icon className="w-4 h-4 text-primary" />
                      <span className="text-xs font-medium text-foreground">{selectedSuggestion.label}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleCancelSuggestion} className="h-6 w-6 p-0 rounded-md hover:bg-destructive/10 hover:text-destructive">
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-3 mb-2">
                    <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">{selectedSuggestion.prompt}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSendSuggestion} className="btn-primary rounded-lg h-8 text-xs flex-1" disabled={sending}>
                      <Send className="w-3 h-3 ml-1" />
                      إرسال الاقتراح
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelSuggestion} className="rounded-lg h-8 text-xs">
                      إلغاء
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Project Feature Suggestions */}
            {!selectedSuggestion && !sending && !generating && (
              <div className="px-3 sm:px-4 py-2.5 bg-muted/30 border-b border-border/50">
                <div className="max-w-3xl mx-auto">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Plus className="w-3 h-3 text-muted-foreground" />
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground font-medium">إضافة ميزة للمشروع:</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {projectSuggestions.slice(0, 8).map((suggestion) => {
                      const Icon = suggestion.icon;
                      return (
                        <Button
                          key={suggestion.id}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="rounded-full text-[10px] sm:text-xs h-7 px-2.5 bg-background hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-smooth"
                        >
                          <Icon className="w-3 h-3 ml-1" />
                          {suggestion.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Input Area - Always Fixed */}
            <div className="p-3 sm:p-4 bg-background">
              <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto">
                <div className="flex gap-2 items-center">
                  <Input
                    ref={inputRef}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="اكتب رسالتك..."
                    className="flex-1 h-9 sm:h-10 pr-3 pl-10 rounded-lg border-border input-enhanced text-xs sm:text-sm"
                    disabled={sending || generating || selectedSuggestion}
                    data-testid="chat-input"
                  />
                  <Button type="submit" disabled={!messageInput.trim() || sending || generating || selectedSuggestion} className="h-9 sm:h-10 w-9 sm:w-10 btn-primary rounded-lg shrink-0" data-testid="send-message-btn">
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        {showSidebar && (
          <div className="w-64 sm:w-72 border-r border-border/50 bg-card/50 backdrop-blur-sm hidden lg:flex flex-col shrink-0">
            {/* Project Summary */}
            <div className="p-3 border-b border-border/50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-foreground flex items-center gap-1.5 text-xs">
                  <Eye className="w-3.5 h-3.5" />
                  ملخص المشروع
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)} className="h-5 w-5 p-0 rounded-md">
                  {showPreview ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </Button>
              </div>
              
              {showPreview && analysis?.project_summary && (
                <div className="space-y-2 animate-fade-in">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge className="badge-primary text-[9px] h-4 px-1.5">{analysis.project_summary.type}</Badge>
                    {analysis.complexity?.level_ar && <Badge variant="outline" className="text-[9px] h-4 px-1.5">{analysis.complexity.level_ar}</Badge>}
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground mb-0.5 font-medium">الفكرة:</p>
                    <p className="text-[10px] text-foreground leading-relaxed">{analysis.project_summary.idea_summary}</p>
                  </div>
                  {analysis.complexity?.estimated_time && (
                    <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
                      <Clock className="w-2.5 h-2.5" />
                      <span>الوقت: {analysis.complexity.estimated_time}</span>
                    </div>
                  )}
                  {analysis.project_summary.features?.length > 0 && (
                    <div>
                      <p className="text-[9px] text-muted-foreground mb-0.5 font-medium">الميزات:</p>
                      <div className="flex flex-wrap gap-1">
                        {analysis.project_summary.features.slice(0, 3).map((f, i) => (
                          <Badge key={i} variant="outline" className="text-[8px] h-4 px-1">{f.slice(0, 15)}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Files Preview */}
            {outputs && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-3 border-b border-border/50 flex items-center justify-between">
                  <h3 className="font-medium text-foreground flex items-center gap-1.5 text-xs">
                    <FileText className="w-3.5 h-3.5" />
                    الملفات
                  </h3>
                  <Button variant="outline" size="sm" onClick={handleExportZip} disabled={exporting} className="h-6 text-[10px] rounded-md gap-1 px-1.5" data-testid="export-zip-btn">
                    {exporting ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <FolderArchive className="w-2.5 h-2.5" />}
                    ZIP
                  </Button>
                </div>
                <div className="p-2 border-b border-border/50">
                  <div className="grid grid-cols-3 gap-1">
                    {outputTabs.map((tab) => (
                      <Button key={tab.id} variant={previewFile === tab.id ? "default" : "ghost"} size="sm"
                        onClick={() => setPreviewFile(previewFile === tab.id ? null : tab.id)}
                        className={`text-[9px] h-6 rounded-md transition-smooth ${previewFile === tab.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                      >
                        <tab.icon className="w-2.5 h-2.5 ml-0.5" />
                        {tab.label}
                      </Button>
                    ))}
                  </div>
                </div>
                {previewFile && (
                  <ScrollArea className="flex-1 p-3">
                    <div className="flex items-center justify-end gap-1.5 mb-2">
                      <Button variant="ghost" size="sm" onClick={() => handleCopy(outputTabs.find(t => t.id === previewFile)?.content, previewFile)} className="h-5 w-5 p-0 rounded-md">
                        {copiedTab === previewFile ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { const tab = outputTabs.find(t => t.id === previewFile); handleDownload(tab?.content, tab?.filename); }} className="h-5 w-5 p-0 rounded-md">
                        <Download className="w-2.5 h-2.5" />
                      </Button>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      {previewFile === 'mindmap' ? <InteractiveMindMap data={outputTabs.find(t => t.id === previewFile)?.content} /> : renderMarkdown(outputTabs.find(t => t.id === previewFile)?.content)}
                    </div>
                  </ScrollArea>
                )}
                {!previewFile && (
                  <div className="flex-1 flex items-center justify-center p-3">
                    <p className="text-[10px] text-muted-foreground text-center">اختر ملفاً لمعاينته</p>
                  </div>
                )}
              </div>
            )}
            
            {!outputs && (
              <div className="flex-1 flex items-center justify-center p-3">
                <div className="text-center">
                  <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center mx-auto mb-2">
                    <FileText className="w-5 h-5 text-muted-foreground/50" />
                  </div>
                  <p className="text-[10px] text-muted-foreground">ستظهر الملفات بعد التوليد</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectPage;
