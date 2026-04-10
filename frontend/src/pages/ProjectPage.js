import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import { ScrollArea } from '../components/ui/scroll-area';
import { 
  ArrowRight, 
  Send, 
  Settings, 
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
  Check
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProjectPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
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
  const [readyToGenerate, setReadyToGenerate] = useState(false);
  const [copiedTab, setCopiedTab] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');

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
      
      // Try to fetch outputs
      try {
        const outputsRes = await axios.get(`${API}/projects/${projectId}/outputs`);
        setOutputs(outputsRes.data);
      } catch (e) {
        // No outputs yet
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('حدث خطأ في تحميل المشروع');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!messageInput.trim() || sending) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageInput,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessageInput('');
    setSending(true);

    try {
      const response = await axios.post(`${API}/projects/${projectId}/messages`, {
        content: userMessage.content
      });

      setMessages(prev => [...prev, response.data]);
      
      if (response.data.ready_to_generate) {
        setReadyToGenerate(true);
        toast.success('المساعد جاهز لتوليد المخرجات!');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.detail || 'حدث خطأ في إرسال الرسالة');
      // Remove the optimistic message
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
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
      await axios.patch(`${API}/projects/${projectId}`, {
        selected_model: model
      });
      setProject(prev => ({ ...prev, selected_model: model }));
      toast.success('تم تغيير المودل');
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

  const renderMarkdown = (content) => {
    if (!content) return null;
    // Simple markdown rendering
    return content.split('\n').map((line, i) => {
      if (line.startsWith('# ')) {
        return <h1 key={i} className="text-2xl font-bold mb-4 text-[#1A1A1A]">{line.slice(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-xl font-semibold mb-3 text-[#1A1A1A]">{line.slice(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={i} className="text-lg font-medium mb-2 text-[#1A1A1A]">{line.slice(4)}</h3>;
      }
      if (line.startsWith('- ')) {
        return <li key={i} className="mr-4 mb-1 text-[#666666]">{line.slice(2)}</li>;
      }
      if (line.startsWith('```')) {
        return null; // Skip code block markers
      }
      if (line.trim() === '') {
        return <br key={i} />;
      }
      return <p key={i} className="mb-2 text-[#666666] leading-relaxed">{line}</p>;
    });
  };

  const renderMindMap = (data) => {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      
      const renderNode = (node, level = 0) => (
        <div key={node.title} className={`${level > 0 ? 'mr-6 border-r-2 border-[#E5E5E5] pr-4' : ''}`}>
          <div className={`p-3 mb-2 ${level === 0 ? 'bg-[#002FA7] text-white' : 'bg-[#F5F5F5] border border-[#E5E5E5]'}`}>
            <span className="font-medium">{node.title}</span>
          </div>
          {node.children && node.children.map(child => renderNode(child, level + 1))}
        </div>
      );

      return (
        <div className="p-4">
          {renderNode(parsed)}
        </div>
      );
    } catch (e) {
      return <pre className="bg-[#F5F5F5] p-4 overflow-x-auto text-sm">{data}</pre>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center" dir="rtl">
        <div className="flex items-center gap-2 text-[#666666]">
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
    { id: 'mindmap', label: 'خريطة ذهنية', icon: GitBranch, content: outputs?.mindmap, filename: 'MindMap.json' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col" dir="rtl">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <header className="bg-white border-b border-[#E5E5E5] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-[#666666] hover:text-[#1A1A1A] transition-colors">
              <ArrowRight className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-[#1A1A1A]">{project?.title}</h1>
              <p className="text-sm text-[#999999] hidden sm:block truncate max-w-xs">
                {project?.idea}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={project?.selected_model} onValueChange={handleModelChange}>
              <SelectTrigger className="w-40 rounded-none text-sm" data-testid="project-model-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id} className="text-sm">
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Chat Section */}
        <div className="flex-1 flex flex-col border-l border-[#E5E5E5] bg-white">
          {/* Chat Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[85%] p-4 ${
                      message.role === 'user'
                        ? 'chat-bubble-user'
                        : 'chat-bubble-assistant'
                    }`}
                    data-testid={`message-${message.role}`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    <span className={`text-xs mt-2 block ${message.role === 'user' ? 'text-white/70' : 'text-[#999999]'}`}>
                      {new Date(message.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              
              {sending && (
                <div className="flex justify-end">
                  <div className="chat-bubble-assistant p-4">
                    <div className="flex items-center gap-1">
                      <span className="loading-dot w-2 h-2 bg-[#002FA7] rounded-full"></span>
                      <span className="loading-dot w-2 h-2 bg-[#002FA7] rounded-full"></span>
                      <span className="loading-dot w-2 h-2 bg-[#002FA7] rounded-full"></span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Generate Button */}
          {(readyToGenerate || outputs) && !generating && (
            <div className="p-4 border-t border-[#E5E5E5] bg-[#E6EAF6]">
              <div className="max-w-3xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#002FA7]">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-medium">
                    {outputs ? 'يمكنك إعادة توليد المخرجات' : 'المساعد جاهز لتوليد المخرجات'}
                  </span>
                </div>
                <Button
                  onClick={handleGenerateOutputs}
                  className="bg-[#002FA7] hover:bg-[#002480] text-white rounded-none"
                  data-testid="generate-outputs-btn"
                >
                  {outputs ? 'إعادة التوليد' : 'توليد المخرجات'}
                </Button>
              </div>
            </div>
          )}

          {/* Generating Indicator */}
          {generating && (
            <div className="p-4 border-t border-[#E5E5E5] bg-[#002FA7]">
              <div className="max-w-3xl mx-auto flex items-center justify-center gap-3 text-white">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>جاري توليد المخرجات... قد يستغرق هذا دقيقة أو أكثر</span>
              </div>
            </div>
          )}

          {/* Chat Input */}
          <div className="p-4 border-t border-[#E5E5E5]">
            <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="اكتب رسالتك هنا..."
                  className="flex-1 h-12 rounded-none border-[#E5E5E5] focus:ring-[#002FA7] focus:border-[#002FA7]"
                  disabled={sending || generating}
                  data-testid="chat-input"
                />
                <Button
                  type="submit"
                  disabled={!messageInput.trim() || sending || generating}
                  className="h-12 px-6 bg-[#002FA7] hover:bg-[#002480] text-white rounded-none"
                  data-testid="send-message-btn"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Outputs Panel */}
        {outputs && (
          <div className="lg:w-[500px] border-t lg:border-t-0 border-[#E5E5E5] bg-white">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="w-full justify-start rounded-none border-b border-[#E5E5E5] bg-transparent p-0 h-auto flex-wrap">
                <TabsTrigger 
                  value="chat"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#002FA7] data-[state=active]:bg-transparent px-4 py-3"
                  data-testid="tab-chat"
                >
                  المحادثة
                </TabsTrigger>
                {outputTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#002FA7] data-[state=active]:bg-transparent px-3 py-3"
                    data-testid={`tab-${tab.id}`}
                  >
                    <tab.icon className="w-4 h-4 ml-1" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value="chat" className="flex-1 m-0 p-4">
                <div className="text-center text-[#666666] py-8">
                  <p>استخدم المحادثة على اليمين للتفاعل مع المساعد</p>
                </div>
              </TabsContent>
              
              {outputTabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="flex-1 m-0 overflow-hidden">
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-end gap-2 p-3 border-b border-[#E5E5E5]">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(tab.content, tab.id)}
                        className="text-[#666666]"
                        data-testid={`copy-${tab.id}`}
                      >
                        {copiedTab === tab.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(tab.content, tab.filename)}
                        className="text-[#666666]"
                        data-testid={`download-${tab.id}`}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                    <ScrollArea className="flex-1 p-4">
                      {tab.id === 'mindmap' ? (
                        renderMindMap(tab.content)
                      ) : (
                        <div className="prose prose-sm max-w-none">
                          {renderMarkdown(tab.content)}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectPage;
