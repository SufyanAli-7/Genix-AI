"use client";
 
import axios from "axios";
import * as z from "zod";
import { Heading } from "@/components/heading";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Code } from "lucide-react";
import { useForm } from "react-hook-form";
import { useProModal } from "@/hooks/use-pro-modal";
import { formSchema } from "./constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { UserAvatar } from "@/components/user-avatar";
import { BotAvatar } from "@/components/bot-avatar";
import toast from "react-hot-toast";

// Define the message type for GitHub AI model
interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const CodePage = () => {
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
        ? [{ role: "system",
          content: "You are a professional code generation assistant. You must answer only in markdown code snippets. Use code comments for explaination.",
         }, userMessage] 
        : [...messages, userMessage];
      
      const response = await axios.post("/api/code", {
        messages: newMessages
      });
      
      // Add both the user message and the response to our messages state
      setMessages([...newMessages, response.data]);
      
      form.reset();
    } catch (error: unknown) { // ✅ Fix 1: Changed from 'any' to 'unknown'
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
  };

  return (
    <div>
      <Heading
        title="Code Generation"
        description="Generate code snippets and solutions."
         icon={Code}
        iconColor="text-red-700"
        bgColor="bg-red-700/10"
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
                        placeholder="Simple toggle button using React hooks"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button className="col-span-12 lg:col-span-2 w-full cursor-pointer" disabled={isLoading}>
                 Generate
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
                    <Empty label="No Code Generated." />
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
                      code: ({ ...props }) => ( // ✅ Fix 3: Removed unused 'node' parameter
                        <code
                          className="bg-black/10 rounded-lg p-1"
                          {...props}
                        />
                      ),
                    }}
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
  );
};

export default CodePage;