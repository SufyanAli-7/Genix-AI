'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Plus, X, Code, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CodeGeneration {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Array<{
    id: string;
    role: string;
    content: string;
    createdAt: string;
  }>;
}

interface CodeHistoryProps {
  currentCodeGenerationId: string | null;
  onNewCodeGeneration: () => void;
  onSelectCodeGeneration: (id: string) => void;
  onCodeGenerationDeleted?: () => void;  onClose?: () => void;
}

export const CodeHistory = ({
  currentCodeGenerationId,
  onNewCodeGeneration,
  onSelectCodeGeneration,
  onCodeGenerationDeleted,
  onClose
}: CodeHistoryProps) => {
  const [codeGenerations, setCodeGenerations] = useState<CodeGeneration[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadCodeGenerations = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/code-generations');
      setCodeGenerations(response.data);
    } catch (error) {
      console.error('Failed to load code generations:', error);
      toast.error('Failed to load code generation history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCodeGenerations();
  }, []);

  const deleteCodeGeneration = async (codeGenerationId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the code generation selection
    
    try {
      await axios.delete(`/api/code-generations/${codeGenerationId}`);
      toast.success("Code generation deleted successfully");
      
      // Reload code generations
      loadCodeGenerations();
      
      // If the deleted code generation was the current one, notify parent
      if (currentCodeGenerationId === codeGenerationId && onCodeGenerationDeleted) {
        onCodeGenerationDeleted();
      }
    } catch (error) {
      console.error('Failed to delete code generation:', error);
      toast.error("Failed to delete code generation");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;

    if (diffInHours < 24) {
      return 'Today';
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  return (
    <div className="w-full lg:w-80 h-full bg-white lg:border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Code History</h2>
        <div className="flex items-center gap-2">
          <Button
            onClick={onNewCodeGeneration}
            size="sm"
            className="p-2 bg-red-700 hover:bg-red-800 text-white"
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

      {/* Code Generations List */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading && codeGenerations.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-gray-500">Loading...</div>
          </div>
        ) : codeGenerations.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-gray-500">No code generated yet</div>
          </div>
        ) : (
          <div className="space-y-2">
            {codeGenerations.map((codeGeneration) => (
              <div
                key={codeGeneration.id}
                className={cn(
                  "group relative p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-sm",
                  currentCodeGenerationId === codeGeneration.id
                    ? 'bg-red-50 border-red-200 shadow-sm' 
                    : 'bg-white hover:bg-gray-50 border-gray-200'
                )}
                onClick={() => onSelectCodeGeneration(codeGeneration.id)}
              >
                {/* Delete button - positioned at top-right corner */}
                <Button
                  variant="default"
                  size="sm"
                  className="absolute top-2 right-2 z-10 w-6 h-6 p-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200 bg-red-700 hover:bg-red-800 text-white"
                  onClick={(e) => deleteCodeGeneration(codeGeneration.id, e)}
                  title="Delete code generation"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>

                <div className="flex items-start gap-3 pr-8">
                  <div className={cn(
                    "p-1.5 rounded-full flex-shrink-0",
                    currentCodeGenerationId === codeGeneration.id 
                      ? 'bg-red-100' 
                      : 'bg-gray-100'
                  )}>
                    <Code className={cn(
                      "w-3 h-3",
                      currentCodeGenerationId === codeGeneration.id 
                        ? 'text-red-700' 
                        : 'text-gray-600'
                    )} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 truncate mb-1">
                      {codeGeneration.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(codeGeneration.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 text-center">
        <div className="text-xs text-gray-500">
          {codeGenerations.length} code generation{codeGenerations.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};
