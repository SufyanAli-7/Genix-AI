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
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useProModal } from "@/hooks/use-pro-modal";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { UserAvatar } from "@/components/user-avatar";
import { BotAvatar } from "@/components/bot-avatar";

// Define the message type for GitHub AI model
interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const ConversationPage = () => {
  const proModel = useProModal();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
      const newMessages = messages.length === 0 
        ? [{ role: "system", content: "You are Genix-AI, a smart, helpful, and friendly AI assistant created by Sufyan Ali. Always aim to provide clear, accurate, and respectful answers. Be professional yet approachable. When asked about your name or origin, respond by saying:'I am Genix-AI, an AI assistant created by Sufyan Ali to help you with anything you need.'"

         }, userMessage] 
        : [...messages, userMessage];
      
      const response = await axios.post("/api/conversation", {
        messages: newMessages
      });
      
      // Add both the user message and the response to our messages state
      setMessages([...newMessages, response.data]);
      
      form.reset();
    } catch (error: any) {
      if (error?.response?.status === 403) {
        proModel.onOpen();
      } else{
        toast.error( "Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
      router.refresh();
    }
  };

  return (
    <div>
      <Heading
        title="Conversation"
        description="Our most advanced AI Assistant yet. Ask anything."
        icon={MessageSquare}
        iconColor="text-violet-500"
        bgColor="bg-violet-500/10"
      />
      <div className="px-4 lg:px-8">
        <div>
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
              "
            >
              <FormField
                name="prompt"
                render={({ field }) => (
                  <FormItem className="col-span-12 lg:col-span-10">
                    <FormControl className="m-0 p-0">
                      <Input
                        className="border-0 outline-none 
                          focus-visible:ring-0 
                          focus-visible:ring-transparent"
                        disabled={isLoading}
                        placeholder="What is the Radius of the Sun?"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button className="col-span-12 lg:col-span-2 w-full cursor-pointer" disabled={isLoading}>
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
                      pre: ({ node, ...props }) => (
                        <div className="overflow-auto w-full my-2 bg-black/10 p-2 rounded-lg">
                          <pre {...props} />
                        </div>
                      ),
                      }}
                       remarkPlugins={[remarkGfm]}
                       rehypePlugins={[rehypeKatex]}
                  >
                      {message.content || ""}
                  </ReactMarkdown>
              </div>
                {/* <p className="text-sm">{message.content}</p> */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationPage;