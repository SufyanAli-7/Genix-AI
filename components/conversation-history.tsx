"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConversationListItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface ConversationHistoryProps {
  currentConversationId?: string | null;
  onNewConversation: () => void;
  onSelectConversation: (id: string) => void;
  onConversationDeleted?: () => void; // Callback when conversation is deleted
  onClose?: () => void; // For mobile close functionality
}

export const ConversationHistory = ({ 
  currentConversationId, 
  onNewConversation, 
  onSelectConversation,
  onConversationDeleted,
  onClose
}: ConversationHistoryProps) => {
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  // Refresh conversations when currentConversationId changes (new conversation created)
  useEffect(() => {
    if (currentConversationId) {
      loadConversations();
    }
  }, [currentConversationId]);
  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const deleteConversation = async (conversationId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the conversation selection
    
    try {
      await axios.delete(`/api/conversations/${conversationId}`);
      toast.success("Conversation deleted successfully");
      
      // Reload conversations
      loadConversations();
      
      // If the deleted conversation was the current one, notify parent
      if (currentConversationId === conversationId && onConversationDeleted) {
        onConversationDeleted();
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      toast.error("Failed to delete conversation");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const truncateTitle = (title: string, maxLength: number = 40) => {
    if (title.length <= maxLength) return title;
    return title.slice(0, maxLength) + '...';
  };  return (
    <div className="w-full lg:w-80 h-full bg-white lg:border-r border-gray-200 flex flex-col">      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">History</h2>
        <div className="flex items-center gap-2">
          <Button 
            onClick={onNewConversation}
            size="sm" 
            className="p-2 bg-violet-500 hover:bg-violet-600 text-white"
            title="Start new conversation"
          >
            <Plus className="w-4 h-4" />
          </Button>
          {onClose && (
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="lg:hidden p-2"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Horizontal separator */}
      <hr className="border-t border-gray-200" />
      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading && conversations.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-gray-500">Loading...</div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-gray-500">No conversations yet</div>
          </div>        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <Card
                key={conversation.id}
                className={cn(
                  "p-3 cursor-pointer transition-all duration-200 hover:shadow-md relative group",
                  currentConversationId === conversation.id 
                    ? 'bg-violet-50 border-violet-200 shadow-sm' 
                    : 'bg-white hover:bg-gray-50 border-gray-200'
                )}
                onClick={() => onSelectConversation(conversation.id)}
              >
                {/* Delete button - positioned at top-right corner */}
                <Button
                  variant="default"
                  size="sm"
                  className="absolute top-2 right-2 z-10 w-6 h-6 p-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200 bg-violet-500 hover:bg-violet-600 text-white"
                  onClick={(e) => deleteConversation(conversation.id, e)}
                  title="Delete conversation"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>

                <div className="flex items-start gap-3 pr-8">
                  <div className={cn(
                    "p-1.5 rounded-full flex-shrink-0",
                    currentConversationId === conversation.id 
                      ? 'bg-violet-100' 
                      : 'bg-gray-100'
                  )}>
                    <MessageSquare className={cn(
                      "w-3 h-3",
                      currentConversationId === conversation.id 
                        ? 'text-violet-600' 
                        : 'text-gray-500'
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 leading-tight mb-1">
                      {truncateTitle(conversation.title || 'New Conversation')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(conversation.updatedAt)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 text-center">
        <div className="text-xs text-gray-500">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};
