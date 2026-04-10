import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import { MessageCircle, Filter } from 'lucide-react';
import { Button } from './ui/button';
import axios from 'axios';
import { toast } from 'sonner';
import { logger } from '../utils/logger';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CommentsSection = ({ projectId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, sortBy]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${API}/projects/${projectId}/comments`);
      let fetchedComments = response.data.comments || [];
      
      // Sort based on sortBy
      if (sortBy === 'oldest') {
        fetchedComments = [...fetchedComments].reverse();
      }
      
      setComments(fetchedComments);
    } catch (error) {
      logger.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentAdded = (newComment) => {
    setComments([newComment, ...comments]);
    toast.success('تم إضافة التعليق');
  };

  const handleReplyAdded = (parentId, newReply) => {
    setComments(comments.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newReply]
        };
      }
      return comment;
    }));
  };

  const handleCommentDeleted = (commentId) => {
    setComments(comments.filter(c => c.id !== commentId));
    toast.success('تم حذف التعليق');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((skeletonId) => (
          <div key={`comment-skeleton-${skeletonId}`} className="animate-pulse">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-muted rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full mb-1"></div>
                <div className="h-3 bg-muted rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          التعليقات ({comments.length})
        </h3>
        
        <div className="flex items-center gap-2">
          <Button
            variant={sortBy === 'newest' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSortBy('newest')}
            className="text-xs"
          >
            الأحدث
          </Button>
          <Button
            variant={sortBy === 'oldest' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSortBy('oldest')}
            className="text-xs"
          >
            الأقدم
          </Button>
        </div>
      </div>

      {/* Comment Form */}
      {user && (
        <CommentForm 
          projectId={projectId} 
          onCommentAdded={handleCommentAdded}
        />
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>لا توجد تعليقات بعد. كن أول من يعلق!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              projectId={projectId}
              onReplyAdded={handleReplyAdded}
              onCommentDeleted={handleCommentDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
