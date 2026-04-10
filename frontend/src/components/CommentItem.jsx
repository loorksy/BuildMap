import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import CommentForm from './CommentForm';
import ReactionBar from './ReactionBar';
import { MessageCircle, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import axios from 'axios';
import { toast } from 'sonner';
import { logger } from '../utils/logger';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const COMMENT_TYPES = {
  comment: { label: '💬 تعليق', color: 'default' },
  code_review: { label: '🔍 مراجعة تقنية', color: 'secondary' },
  built_this: { label: '✅ بنيت هذا', color: 'default' },
  suggestion: { label: '💡 اقتراح', color: 'default' },
  question: { label: '❓ سؤال', color: 'default' }
};

const CommentItem = ({ comment, projectId, onReplyAdded, onCommentDeleted, isReply = false }) => {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwnComment = user?.id === comment.author_id;
  const commentType = COMMENT_TYPES[comment.type] || COMMENT_TYPES.comment;

  const handleDelete = async () => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التعليق؟')) return;
    
    setDeleting(true);
    try {
      await axios.delete(`${API}/comments/${comment.id}`, { withCredentials: true });
      onCommentDeleted(comment.id);
    } catch (error) {
      toast.error('حدث خطأ أثناء حذف التعليق');
    } finally {
      setDeleting(false);
    }
  };

  const handleReplySubmitted = (newReply) => {
    onReplyAdded(comment.id, newReply);
    setShowReplyForm(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds

    if (diff < 60) return 'الآن';
    if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
    if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
    if (diff < 604800) return `منذ ${Math.floor(diff / 86400)} يوم`;
    return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className={`${isReply ? 'mr-8 sm:mr-12' : ''}`}>
      <div className="flex gap-3 group">
        {/* Avatar */}
        <div className="shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
            {comment.author_name?.charAt(0) || '؟'}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-muted/30 rounded-lg p-3 sm:p-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-foreground text-sm">
                  {comment.author_name}
                </span>
                {comment.type !== 'comment' && (
                  <Badge variant={commentType.color} className="text-xs">
                    {commentType.label}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatDate(comment.created_at)}
                </span>
              </div>
              
              {isOwnComment && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Comment Content */}
            <p className="text-sm text-foreground whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-2 mr-2">
            <ReactionBar 
              commentId={comment.id} 
              reactions={comment.reactions || {}}
            />
            
            {user && !isReply && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                رد
              </button>
            )}
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-3">
              <CommentForm
                projectId={projectId}
                parentCommentId={comment.id}
                onCommentAdded={handleReplySubmitted}
                placeholder="اكتب ردك..."
                compact
              />
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-3">
              {comment.replies.map(reply => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  projectId={projectId}
                  onReplyAdded={onReplyAdded}
                  onCommentDeleted={onCommentDeleted}
                  isReply
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
