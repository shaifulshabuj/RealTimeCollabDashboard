import { useState, useEffect } from 'react';
import { XMarkIcon, CheckIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import useDocumentStore from '@/store/documentStore';
import { DocumentComment } from '@/types/document';
import { useAuth } from '@/hooks/useAuth';

interface CommentSidebarProps {
  documentId: string;
  onClose: () => void;
}

export default function CommentSidebar({ documentId, onClose }: CommentSidebarProps) {
  const { user } = useAuth();
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const comments = useDocumentStore((state) => 
    state.documentComments.filter(c => c.documentId === documentId)
  );
  const fetchComments = useDocumentStore((state) => state.fetchComments);
  const addComment = useDocumentStore((state) => state.addComment);
  const resolveComment = useDocumentStore((state) => state.resolveComment);
  
  // Fetch comments when component mounts
  useEffect(() => {
    const loadComments = async () => {
      try {
        await fetchComments(documentId);
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      }
    };
    
    loadComments();
  }, [documentId, fetchComments]);
  
  // Handle submitting a new comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !newCommentText.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      await addComment({
        documentId,
        content: newCommentText,
        createdAt: new Date().toISOString(),
        createdBy: user,
        position: {
          // In a real implementation, we would get the current cursor position
        },
        resolved: false,
        replies: [],
      });
      
      setNewCommentText('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle resolving a comment
  const handleResolveComment = async (commentId: string) => {
    if (!user) return;
    
    try {
      await resolveComment(commentId, user.id);
    } catch (error) {
      console.error('Failed to resolve comment:', error);
    }
  };
  
  // Sort comments by creation time (newest first)
  const sortedComments = [...comments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  return (
    <div className="w-80 border-l border-neutral-200 bg-white flex flex-col h-full">
      <div className="border-b border-neutral-200 px-4 py-3 flex justify-between items-center">
        <h2 className="text-lg font-medium text-neutral-900 flex items-center">
          <ChatBubbleLeftIcon className="h-5 w-5 text-neutral-500 mr-2" />
          Comments
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-neutral-400 hover:text-neutral-500"
        >
          <XMarkIcon className="h-5 w-5" />
          <span className="sr-only">Close panel</span>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {sortedComments.length === 0 ? (
          <div className="text-center py-6">
            <ChatBubbleLeftIcon className="h-10 w-10 text-neutral-300 mx-auto mb-2" />
            <p className="text-neutral-500 text-sm">No comments yet</p>
            <p className="text-neutral-400 text-xs mt-1">
              Add a comment to start a discussion
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {sortedComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onResolve={handleResolveComment}
              />
            ))}
          </ul>
        )}
      </div>
      
      <div className="border-t border-neutral-200 p-4">
        <form onSubmit={handleSubmitComment}>
          <label htmlFor="new-comment" className="sr-only">
            Add a comment
          </label>
          <textarea
            id="new-comment"
            name="new-comment"
            rows={3}
            className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Add a comment..."
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            disabled={isSubmitting}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={!newCommentText.trim() || isSubmitting}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-neutral-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Adding...' : 'Add Comment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface CommentItemProps {
  comment: DocumentComment;
  onResolve: (commentId: string) => void;
}

function CommentItem({ comment, onResolve }: CommentItemProps) {
  return (
    <li className={`relative ${comment.resolved ? 'opacity-60' : ''}`}>
      <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
        <div className="flex justify-between items-start">
          <div className="flex items-start">
            <div className="mr-2 flex-shrink-0">
              {comment.createdBy.avatarUrl ? (
                <img
                  className="h-8 w-8 rounded-full"
                  src={comment.createdBy.avatarUrl}
                  alt={comment.createdBy.name}
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                  <span className="text-xs font-medium text-white">
                    {comment.createdBy.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900">
                {comment.createdBy.name}
              </p>
              <p className="text-xs text-neutral-500">
                {new Date(comment.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          
          {!comment.resolved && (
            <button
              type="button"
              onClick={() => onResolve(comment.id)}
              className="text-neutral-400 hover:text-green-600"
              title="Resolve comment"
            >
              <CheckIcon className="h-5 w-5" />
              <span className="sr-only">Resolve</span>
            </button>
          )}
        </div>
        
        <div className="mt-2">
          <p className="text-sm text-neutral-700 whitespace-pre-wrap">{comment.content}</p>
        </div>
        
        {comment.resolved && (
          <div className="mt-2 text-xs text-neutral-500 flex items-center">
            <CheckIcon className="h-3 w-3 text-green-500 mr-1" />
            <span>
              Resolved by {comment.resolvedBy?.name} on{' '}
              {comment.resolvedAt && new Date(comment.resolvedAt).toLocaleString()}
            </span>
          </div>
        )}
        
        {comment.replies.length > 0 && (
          <div className="mt-2 pl-3 border-l-2 border-neutral-200 space-y-2">
            {comment.replies.map((reply) => (
              <div key={reply.id} className="text-sm">
                <div className="flex items-baseline">
                  <span className="font-medium text-neutral-900 mr-1">{reply.createdBy.name}</span>
                  <span className="text-xs text-neutral-500">
                    {new Date(reply.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-neutral-700">{reply.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}
