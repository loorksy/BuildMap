import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const REACTIONS = [
  { type: 'fire', emoji: '🔥', label: 'فكرة قوية' },
  { type: 'money', emoji: '💰', label: 'مربحة' },
  { type: 'check', emoji: '✅', label: 'قابلة للتنفيذ' },
  { type: 'think', emoji: '🤔', label: 'تحتاج دراسة' },
  { type: 'repeat', emoji: '🔄', label: 'موجودة مسبقاً' }
];

const ReactionBar = ({ commentId, reactions = {} }) => {
  const { user } = useAuth();
  const [localReactions, setLocalReactions] = useState(reactions);
  const [loading, setLoading] = useState(null);

  const handleReaction = async (reactionType) => {
    if (!user) {
      toast.error('يجب تسجيل الدخول للتفاعل');
      return;
    }

    setLoading(reactionType);
    try {
      await axios.put(
        `${API}/comments/${commentId}/reaction`,
        { reaction: reactionType },
        { withCredentials: true }
      );

      // Optimistically update UI
      setLocalReactions(prev => ({
        ...prev,
        [reactionType]: (prev[reactionType] || 0) + 1
      }));
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error('حدث خطأ');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {REACTIONS.map(reaction => {
        const count = localReactions[reaction.type] || 0;
        const isLoading = loading === reaction.type;
        
        return (
          <button
            key={reaction.type}
            onClick={() => handleReaction(reaction.type)}
            disabled={isLoading}
            className="group relative px-2 py-1 rounded-md hover:bg-muted/50 transition-colors flex items-center gap-1"
            title={reaction.label}
          >
            <span className="text-sm group-hover:scale-110 transition-transform">
              {reaction.emoji}
            </span>
            {count > 0 && (
              <span className="text-xs text-muted-foreground group-hover:text-foreground">
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ReactionBar;
