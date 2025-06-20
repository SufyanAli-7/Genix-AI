"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

import axios from "axios";
import * as z from "zod";
import toast from "react-hot-toast";
import { Heading } from "@/components/heading";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { MessageSquare } from "lucide-react";
import { useForm } from "react-hook-form";
import { formSchema } from "./constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useProModal } from "@/hooks/use-pro-modal";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { UserAvatar } from "@/components/user-avatar";
import { BotAvatar } from "@/components/bot-avatar";
import { ConversationHistory } from "@/components/conversation-history";
import { Plus, Menu } from "lucide-react";

// Define the message type for GitHub AI model
interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const ConversationPage = () => {
  const proModel = useProModal();
  const router = useRouter();  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false); // Hide by default, will be shown on larger screens

  // Show sidebar by default on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setShowSidebar(true);
      } else {
        setShowSidebar(false);
      }
    };

    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load conversation from URL parameter or localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    if (id) {
      loadConversation(id);
    } else {
      // Try to load the last conversation from localStorage
      const lastConversationId = localStorage.getItem('lastConversationId');
      if (lastConversationId) {
        loadConversation(lastConversationId);
      }
    }
  }, []);  const loadConversation = async (id: string) => {
    try {
      const response = await axios.get(`/api/conversations?id=${id}`);
        // Add system message back when loading conversation
      const systemMessage: ChatMessage = {
        role: "system" as const,
        content: "You are Genix-AI, a smart, helpful, and friendly AI assistant created by Sufyan Ali. Always aim to provide clear, accurate, and respectful answers. Be professional yet approachable. When asked about your name or origin, respond by saying:'I am Genix-AI, an AI assistant created by Sufyan Ali to help you with anything you need.'"
      };
      
      const loadedMessages = [systemMessage, ...response.data.messages];
      setMessages(loadedMessages);
      setConversationId(id);
      localStorage.setItem('lastConversationId', id);
    } catch (error) {
      console.error('Failed to load conversation:', error);
      // If conversation doesn't exist, start fresh
      setMessages([]);
      setConversationId(null);
      localStorage.removeItem('lastConversationId');
    }
  };  const startNewConversation = () => {
    setMessages([]);
    setConversationId(null);
    localStorage.removeItem('lastConversationId');
    window.history.pushState({}, '', '/conversation');
    // Close sidebar after starting new conversation (both mobile and desktop)
    setShowSidebar(false);
  };

  const handleConversationDeleted = () => {
    // If the deleted conversation was the current one, start a new conversation
    startNewConversation();
  };

  const handleSelectConversation = (id: string) => {
    loadConversation(id);
    setShowSidebar(false); // Hide sidebar on mobile after selection
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: ""
    }
  });
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      
      const userMessage: ChatMessage = {
        role: "user",
        content: values.prompt
      };
        // Add a system message if this is the first message
      const systemMessage: ChatMessage = {
        role: "system" as const,
        content: "You are Genix-AI, a smart, helpful, and friendly AI assistant created by Sufyan Ali. Always aim to provide clear, accurate, and respectful answers. Be professional yet approachable. When asked about your name or origin, respond by saying:'I am Genix-AI, an AI assistant created by Sufyan Ali to help you with anything you need.'"
      };
      
      const newMessages = messages.length === 0 
        ? [systemMessage, userMessage] 
        : [...messages, userMessage];
      
      // Update UI immediately with user message
      setMessages(newMessages);
      
      const response = await axios.post("/api/conversation", {
        messages: newMessages,
        conversationId: conversationId
      });
      
      // Add the AI response to our messages state
      const finalMessages = [...newMessages, response.data];
      setMessages(finalMessages);
      
      // Update conversation ID and save to localStorage
      if (response.data.conversationId) {
        setConversationId(response.data.conversationId);
        localStorage.setItem('lastConversationId', response.data.conversationId);
        
        // Update URL without refreshing the page
        const newUrl = `/conversation?id=${response.data.conversationId}`;
        window.history.pushState({}, '', newUrl);
      }
      
      form.reset();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { status: number } };
        if (axiosError.response?.status === 403) {
          proModel.onOpen();
        } else {
          toast.error("Something went wrong. Please try again.");
        }
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
      router.refresh();
    }
  };  return (    <div className="flex h-full relative">
      {/* Overlay for mobile - appears behind sidebar */}
      {showSidebar && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 "
          onClick={() => setShowSidebar(false)}
        />
      )}      {/* Conversation History Sidebar */}
      {showSidebar && (
        <div className="
          fixed lg:relative top-0 left-0 z-40
          w-full lg:w-auto 
          transition-all duration-300 ease-in-out
          bg-white lg:bg-white
          h-full lg:h-auto
          shadow-lg lg:shadow-none
          lg:border lg:border-gray-200
          lg:border-l-0"><ConversationHistory
            currentConversationId={conversationId}
            onNewConversation={startNewConversation}
            onSelectConversation={handleSelectConversation}
            onConversationDeleted={handleConversationDeleted}
            onClose={() => setShowSidebar(false)}
          />
        </div>
      )}      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Heading
          title="Conversation"
          description="Our most advanced AI Assistant yet. Ask anything."
          icon={MessageSquare}
          iconColor="text-violet-500"
          bgColor="bg-violet-500/10"
        />
        <div className="px-4 lg:px-8 flex-1 min-w-0">
          {/* Current Conversation Info */}
          <div className="mb-4 flex items-center justify-between flex-wrap gap-2">            <div className="flex items-center gap-2 flex-wrap">
              <Button 
                onClick={startNewConversation}
                variant="outline"
                size="sm"
                className="flex-shrink-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Conversation
              </Button>
              
              {/* History Toggle for both Mobile and Desktop */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(!showSidebar)}
                className="flex flex-shrink-0"
              >
                <Menu className="w-4 h-4 mr-2" />
                {showSidebar ? 'Hide' : 'Show'} History
              </Button>
            </div>            
            {conversationId && (
              <p className="text-xs text-gray-500 truncate max-w-[120px]">
                ID: {conversationId.slice(0, 8)}...
              </p>
            )}
          </div>
          <div className="min-w-0">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="
                rounded-lg
                border
                w-full
                p-4
                px-3
                md:px-6
                focus-within:shadow-sm
                grid
                grid-cols-12
                gap-2
                max-w-full
                overflow-hidden
              "
            >              <FormField
                name="prompt"
                render={({ field }) => (
                  <FormItem className="col-span-12 lg:col-span-10 min-w-0">
                    <FormControl className="m-0 p-0">
                      <Input
                        className="border-0 outline-none 
                          focus-visible:ring-0 
                          focus-visible:ring-transparent
                          w-full min-w-0"
                        disabled={isLoading}
                        placeholder="What is the Radius of the Sun?"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button className="col-span-12 lg:col-span-2 w-full cursor-pointer min-w-0" disabled={isLoading}>
               Ask AI
              </Button>
            </form>
          </Form>
        </div>
        <div className="space-y-4 mt-4">
          {isLoading && (
            <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
             <Loader />              
            </div>
          )}
            
            {messages.length === 0 && !isLoading && (                
                    <Empty label="No Conversation Started." />
                )}
          <div className="flex flex-col-reverse gap-y-4">
            {messages.filter(message => message.role !== "system").map((message, index) => (
              <div 
                key={index} 
                className={cn(
                  "p-4 w-full flex items-start gap-x-4 rounded-lg",
                  message.role === "user" 
                    ? "bg-white border border-black/10" 
                    : "bg-muted"
                )}
              >
                <div className={cn(
                  "p-2 w-8 h-8 rounded-md flex items-center justify-center",
                  message.role === "user"
                    ? "bg-violet-500/10" 
                    : "bg-black/10"
                )}>
                  {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
                </div>

              <div className="text-sm overflow-hidden leading-7">
                <ReactMarkdown
                       components={{
                      pre: ({ ...props }) => ( // ✅ Fix 2: Removed unused 'node' parameter
                        <div className="overflow-auto w-full my-2 bg-black/10 p-2 rounded-lg">
                          <pre {...props} />
                        </div>
                      ),
                      }}                       remarkPlugins={[remarkGfm]}
                       rehypePlugins={[rehypeKatex]}
                  >
                      {message.content || ""}
                  </ReactMarkdown>
              </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default ConversationPage;