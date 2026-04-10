import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Send } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { logger } from '../utils/logger';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const COMMENT_TYPES = [
  { value: 'comment', label: '💬 تعليق عادي' },
  { value: 'code_review', label: '🔍 مراجعة تقنية' },
  { value: 'suggestion', label: '💡 اقتراح تحسين' },
  { value: 'question', label: '❓ سؤال' },
  { value: 'built_this', label: '✅ بنيت هذا' }
];

const CommentForm = ({ 
  projectId, 
  parentCommentId = null, 
  onCommentAdded, 
  placeholder = 'أضف تعليقك...', 
  compact = false 
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [type, setType] = useState('comment');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('الرجاء إدخال تعليق');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(
        `${API}/projects/${projectId}/comments`,
        { 
          content: content.trim(), 
          type, 
          parent_comment_id: parentCommentId 
        },
        { withCredentials: true }
      );

      onCommentAdded(response.data);
      setContent('');
      setType('comment');
    } catch (error) {
      logger.error('Error submitting comment:', error);
      toast.error(error.response?.data?.detail || 'حدث خطأ أثناء إضافة التعليق');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-4 text-sm text-muted-foreground bg-muted/30 rounded-lg">
        يجب تسجيل الدخول للتعليق
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {!compact && !parentCommentId && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {COMMENT_TYPES.map(commentType => (
            <button
              key={commentType.value}
              type="button"
              onClick={() => setType(commentType.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-smooth ${
                type === commentType.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted-foreground/10'
              }`}
            >
              {commentType.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <div className="shrink-0">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
            {user.name?.charAt(0) || '؟'}
          </div>
        </div>
        
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            rows={compact ? 2 : 3}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            disabled={submitting}
          />
          
          <div className="flex justify-end mt-2">
            <Button
              type="submit"
              size="sm"
              disabled={submitting || !content.trim()}
              className="rounded-lg"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 ml-1" />
                  {parentCommentId ? 'رد' : 'نشر'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;
