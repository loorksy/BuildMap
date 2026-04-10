import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
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
import { Progress } from '../components/ui/progress';
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
  Triangle,
  Plus,
  Eye,
  ChevronDown,
  ChevronUp,
  Cpu,
  FolderArchive,
  Shield,
  BookOpen,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Icon mapping for suggestions
const iconMap = {
  'globe': Globe,
  'smartphone': Smartphone,
  'server': Server,
  'layers': Layers,
  'users': Users,
  'building': Building,
  'code': Code,
  'shopping-cart': ShoppingCart,
  'clock': Clock,
  'message-circle': MessageCircle,
  'database': Database,
  'zap': Zap,
  'log-in': LogIn,
  'layout-dashboard': LayoutDashboard,
  'bell': Bell,
  'search': Search,
  'message-square': MessageSquare,
  'bar-chart': BarChart3,
  'terminal': Terminal,
  'triangle': Triangle,
  'sparkles': Sparkles,
  'plus': Plus
};

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
  const [activeTab, setActiveTab] = useState('chat');
  
  // Vibe Coding states
  const [analysis, setAnalysis] = useState(null);
  const [showPreview, setShowPreview] = useState(true);
  const [previewFile, setPreviewFile] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      
      // Fetch analysis
      try {
        const analysisRes = await axios.get(`${API}/projects/${projectId}/analysis`);
        setAnalysis(analysisRes.data);
      } catch (e) {
        console.log('Analysis not available');
      }
      
      // Fetch outputs
      try {
        const outputsRes = await axios.get(`${API}/projects/${projectId}/outputs`);
        setOutputs(outputsRes.data);
      } catch (e) {
        // No outputs yet
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error(error.response?.data?.detail || 'حدث خطأ في تحميل المشروع');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e, quickMessage = null) => {
    e?.preventDefault();
    const content = quickMessage || messageInput;
    if (!content.trim() || sending) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessageInput('');
    setSending(true);

    // Add a placeholder streaming message
    const streamingMsgId = (Date.now() + 1).toString();
    const streamingMsg = {
      id: streamingMsgId,
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString(),
      isStreaming: true
    };
    setMessages(prev => [...prev, streamingMsg]);

    try {
      const response = await fetch(`${API}/projects/${projectId}/messages/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || 'حدث خطأ في إرسال الرسالة');
      }

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
          const dataStr = line.slice(6).trim();
          if (!dataStr) continue;

          try {
            const event = JSON.parse(dataStr);
            
            if (event.type === 'chunk') {
              setMessages(prev => prev.map(m => 
                m.id === streamingMsgId 
                  ? { ...m, content: m.content + event.content }
                  : m
              ));
            } else if (event.type === 'done') {
              setMessages(prev => prev.map(m => 
                m.id === streamingMsgId 
                  ? { ...m, id: event.id, created_at: event.created_at, isStreaming: false }
                  : m
              ));
              if (event.analysis) {
                setAnalysis(event.analysis);
              }
              if (event.ready_to_generate) {
                toast.success('المشروع جاهز لتوليد المخرجات!', {
                  action: {
                    label: 'توليد الآن',
                    onClick: handleGenerateOutputs
                  }
                });
              }
            } else if (event.type === 'error') {
              toast.error(event.content);
              setMessages(prev => prev.filter(m => m.id !== streamingMsgId));
            }
          } catch (parseErr) {
            // ignore malformed SSE chunks
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.message || 'حدث خطأ في إرسال الرسالة');
      setMessages(prev => prev.filter(m => m.id !== userMessage.id && m.id !== streamingMsgId));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(null, suggestion.text);
  };

  const handleGenerateOutputs = async () => {
    setGenerating(true);
    try {
      const response = await axios.post(`${API}/projects/${projectId}/generate`);
      setOutputs(response.data);
      setActiveTab('frontend-readme');
      toast.success('تم توليد المخرجات بنجاح!');
    } catch (error) {
      console.error('Error generating outputs:', error);
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
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportZip = async () => {
    setExporting(true);
    try {
      const response = await axios.get(`${API}/projects/${projectId}/export`, {
        responseType: 'blob'
      });
      const url = URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BuildMap_${project?.title || 'project'}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('تم تحميل الملفات بنجاح!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error.response?.data?.detail || 'حدث خطأ في تصدير الملفات');
    } finally {
      setExporting(false);
    }
  };

  const renderMarkdown = (content) => {
    if (!content) return null;
    return content.split('\n').map((line, i) => {
      if (line.startsWith('# ')) {
        return <h1 key={i} className="text-2xl font-bold mb-4 text-foreground">{line.slice(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-xl font-semibold mb-3 text-foreground">{line.slice(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={i} className="text-lg font-medium mb-2 text-foreground">{line.slice(4)}</h3>;
      }
      if (line.startsWith('- ')) {
        return <li key={i} className="mr-4 mb-1 text-muted-foreground">{line.slice(2)}</li>;
      }
      if (line.startsWith('```')) return null;
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="mb-2 text-muted-foreground leading-relaxed">{line}</p>;
    });
  };

  const renderMindMap = (data) => {
    return <InteractiveMindMap data={data} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          جاري التحميل...
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

  const currentStageIndex = analysis?.stages?.findIndex(s => s.id === analysis?.current_stage) || 0;

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <header className="glass border-b border-border sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-lg">
              <ArrowRight className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-foreground">{project?.title}</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-xl">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            
            <Select value={project?.selected_model} onValueChange={handleModelChange}>
              <SelectTrigger className="w-40 rounded-xl text-sm" data-testid="project-model-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                <ScrollArea className="h-72">
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id} className="text-sm rounded-lg">
                      <div className="flex items-center gap-2">
                        <span>{model.name}</span>
                        {model.is_free && (
                          <Badge variant="secondary" className="bg-green-500/10 text-green-600 text-xs border-0">مجاني</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      {analysis && (
        <div className="bg-card border-b border-border px-4 py-3">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">تقدم المحادثة</span>
              <span className="text-sm text-primary font-bold">{Math.round(analysis.total_progress)}%</span>
            </div>
            <Progress value={analysis.total_progress} className="h-2 mb-3" />
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
              {analysis.stages?.slice(0, -1).map((stage, idx) => {
                const isCompleted = analysis.completed_stages?.includes(stage.id);
                const isCurrent = analysis.current_stage === stage.id;
                return (
                  <div 
                    key={stage.id}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      isCompleted 
                        ? 'bg-green-500/20 text-green-600 dark:text-green-400' 
                        : isCurrent 
                          ? 'bg-primary/20 text-primary ring-2 ring-primary/30' 
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isCompleted && <Check className="w-3 h-3" />}
                    {isCurrent && <Cpu className="w-3 h-3 animate-pulse" />}
                    {stage.name}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Chat Section */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[85%] p-4 ${
                      message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'
                    }`}
                    data-testid={`message-${message.role}`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {message.content}
                      {message.isStreaming && <span className="inline-block w-2 h-4 bg-primary animate-pulse mr-1 align-middle rounded-sm" />}
                    </p>
                    {!message.isStreaming && (
                      <span className={`text-xs mt-2 block ${message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {new Date(message.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              
              {sending && !messages.some(m => m.isStreaming) && (
                <div className="flex justify-end">
                  <div className="chat-bubble-assistant p-4">
                    <div className="flex items-center gap-1">
                      <span className="loading-dot w-2 h-2 bg-primary rounded-full"></span>
                      <span className="loading-dot w-2 h-2 bg-primary rounded-full"></span>
                      <span className="loading-dot w-2 h-2 bg-primary rounded-full"></span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Quick Suggestions */}
          {analysis?.suggestions && !sending && (
            <div className="px-4 py-3 border-t border-border bg-muted/30">
              <div className="max-w-3xl mx-auto">
                <p className="text-xs text-muted-foreground mb-2">اقتراحات سريعة:</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.suggestions.map((suggestion, idx) => {
                    const IconComponent = iconMap[suggestion.icon] || Sparkles;
                    return (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="rounded-full text-xs h-8 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                        data-testid={`suggestion-${idx}`}
                      >
                        <IconComponent className="w-3 h-3 ml-1" />
                        {suggestion.text}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Generate Button */}
          {(analysis?.ready_to_generate || analysis?.total_progress >= 60 || outputs) && !generating && (
            <div className="p-4 border-t border-border bg-gradient-to-r from-primary/10 to-blue-500/10">
              <div className="max-w-3xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-medium">
                    {outputs ? 'المخرجات جاهزة - يمكنك إعادة التوليد' : 'جاهز لتوليد ملفات المشروع!'}
                  </span>
                </div>
                <Button
                  onClick={handleGenerateOutputs}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg shadow-primary/25"
                  data-testid="generate-outputs-btn"
                >
                  <Sparkles className="w-4 h-4 ml-2" />
                  {outputs ? 'إعادة التوليد' : 'توليد المخرجات'}
                </Button>
              </div>
            </div>
          )}

          {/* Generating */}
          {generating && (
            <div className="p-4 border-t border-border bg-primary">
              <div className="max-w-3xl mx-auto flex items-center justify-center gap-3 text-primary-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>جاري توليد 6 ملفات... قد يستغرق دقيقة</span>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border bg-background">
            <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="اكتب رسالتك أو اختر من الاقتراحات..."
                  className="flex-1 h-12 rounded-xl border-border focus:ring-primary focus:border-primary"
                  disabled={sending || generating}
                  data-testid="chat-input"
                />
                <Button
                  type="submit"
                  disabled={!messageInput.trim() || sending || generating}
                  className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                  data-testid="send-message-btn"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Side Panel - Project Summary & Files Preview */}
        <div className="w-80 border-r border-border bg-card hidden lg:flex flex-col">
          {/* Project Summary */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Eye className="w-4 h-4" />
                ملخص المشروع
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowPreview(!showPreview)}
                className="h-6 w-6 p-0"
              >
                {showPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
            
            {showPreview && analysis?.project_summary && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                    {analysis.project_summary.type}
                  </Badge>
                  {analysis.complexity?.level_ar && (
                    <Badge variant="outline" className="text-xs">
                      {analysis.complexity.level_ar}
                    </Badge>
                  )}
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground mb-1">الفكرة:</p>
                  <p className="text-sm text-foreground">{analysis.project_summary.idea_summary}</p>
                </div>
                
                {analysis.complexity?.estimated_time && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>الوقت المقدر: {analysis.complexity.estimated_time}</span>
                  </div>
                )}
                
                <div>
                  <p className="text-xs text-muted-foreground mb-1">الميزات المكتشفة:</p>
                  <div className="flex flex-wrap gap-1">
                    {analysis.project_summary.features?.slice(0, 4).map((f, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {f.length > 20 ? f.slice(0, 20) + '...' : f}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {analysis.project_summary.technologies?.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">التقنيات:</p>
                    <div className="flex flex-wrap gap-1">
                      {analysis.project_summary.technologies.map((t, i) => (
                        <Badge key={i} variant="secondary" className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 border-0">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {analysis.suggested_skills?.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      المهارات المقترحة:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {analysis.suggested_skills.map((s, i) => (
                        <Badge key={i} variant="secondary" className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0">
                          {s.name_ar}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Verification */}
                {analysis.verification?.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      التحقق:
                    </p>
                    <div className="space-y-1">
                      {analysis.verification.map((v, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs">
                          {v.passed ? (
                            <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                          )}
                          <span className={v.passed ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}>
                            {v.message}
                          </span>
                        </div>
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
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  معاينة الملفات
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportZip}
                  disabled={exporting}
                  className="h-7 text-xs rounded-lg gap-1"
                  data-testid="export-zip-btn"
                >
                  {exporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <FolderArchive className="w-3 h-3" />}
                  {exporting ? 'جاري...' : 'تصدير ZIP'}
                </Button>
              </div>
              
              <div className="p-2 border-b border-border">
                <div className="grid grid-cols-3 gap-1">
                  {outputTabs.map((tab) => (
                    <Button
                      key={tab.id}
                      variant={previewFile === tab.id ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setPreviewFile(previewFile === tab.id ? null : tab.id)}
                      className={`text-xs h-8 rounded-lg ${previewFile === tab.id ? 'bg-primary text-primary-foreground' : ''}`}
                    >
                      <tab.icon className="w-3 h-3 ml-1" />
                      {tab.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              {previewFile && (
                <ScrollArea className="flex-1 p-4">
                  <div className="flex items-center justify-end gap-2 mb-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(outputTabs.find(t => t.id === previewFile)?.content, previewFile)}
                      className="h-7 text-xs"
                    >
                      {copiedTab === previewFile ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const tab = outputTabs.find(t => t.id === previewFile);
                        handleDownload(tab?.content, tab?.filename);
                      }}
                      className="h-7 text-xs"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="prose prose-sm max-w-none text-xs">
                    {previewFile === 'mindmap' 
                      ? renderMindMap(outputTabs.find(t => t.id === previewFile)?.content)
                      : renderMarkdown(outputTabs.find(t => t.id === previewFile)?.content)
                    }
                  </div>
                </ScrollArea>
              )}
              
              {!previewFile && (
                <div className="flex-1 flex items-center justify-center p-4">
                  <p className="text-sm text-muted-foreground text-center">
                    اختر ملفاً لمعاينته
                  </p>
                </div>
              )}
            </div>
          )}
          
          {!outputs && (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  ستظهر الملفات هنا بعد التوليد
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;
