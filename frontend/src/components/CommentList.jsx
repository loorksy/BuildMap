import React from 'react';
import CommentItem from './CommentItem';

/**
 * CommentList - Renders a flat list of comments with replies
 * This component prevents infinite recursion by flattening the comment tree
 */
const CommentList = ({ comments, projectId, onReplyAdded, onCommentDeleted }) => {
  const renderComment = (comment, isReply = false, depth = 0) => {
    const MAX_DEPTH = 3;
    
    return (
      <div key={comment.id}>
        <CommentItem
          comment={comment}
          projectId={projectId}
          onReplyAdded={onReplyAdded}
          onCommentDeleted={onCommentDeleted}
          isReply={isReply}
          showReplies={false}
        />
        
        {/* Render replies recursively up to MAX_DEPTH */}
        {comment.replies && comment.replies.length > 0 && depth < MAX_DEPTH && (
          <div className="mt-3">
            {comment.replies.map(reply => 
              renderComment(reply, true, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {comments.map(comment => renderComment(comment))}
    </div>
  );
};

export default CommentList;
