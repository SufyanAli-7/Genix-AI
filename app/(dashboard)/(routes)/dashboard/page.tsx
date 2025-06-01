"use client";

import { ArrowRight, Code, ImageIcon, MessageSquare, Music, VideoIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const tools = [
  {
    label : "Conversation",
    icon : MessageSquare,
    color : "text-violet-500",
    bgcolor : "bg-violet-500/10",
    herf : "/conversation",
  },

  {
    label : "Image Generation",
    icon : ImageIcon,
    color : "text-pink-700",
    bgcolor : "bg-pink-700/10",
    herf : "/image",
  },
  {
    label : "Video Generation",
    icon : VideoIcon,
    color : "text-orange-700",
    bgcolor : "bg-orange-700/10",
    herf : "/video",
  },
  {
    label : "Music Generation",
    icon : Music,
    color : "text-emerald-500",
    bgcolor : "bg-emerald-500/10",
    herf : "/music",
  },
  {
    label : "Code Generation",
    icon : Code,
    color : "text-red-700",
    bgcolor : "bg-red-700/10",
    herf : "/code",
  },
]

const DashboardPage = () => {
  const router = useRouter();
  return (
    <div>  
        <div className="mb-8 space-y-4">
          <h2 className="text-2xl md:text-4xl font-bold text-center">
              Explore the power of AI
          </h2>  
          <p className="text-muted-foreground font-light text-sm md:text-lg text-center">
            Chat with the smartest AI - Experience the power of AI
          </p>        
        </div>  
        <div className="px-4 md:px-20 lg:px-32 space-y-4">
          {tools.map((tool) => (
            <Card
             onClick={() => router.push(tool.herf)}
              key={tool.herf}
              className="p-4 border-black/5 border hover:shadow-md transition cursor-pointer"
            >
              <div className="flex items-center w-full">
                <div className="flex-grow flex items-center gap-x-4">
                  <div className={cn("p-2 w-fit rounded-md", tool.bgcolor)}>
                    <tool.icon className={cn("w-8 h-8", tool.color)} />
                  </div>   
                  <div className="font-semibold">
                    {tool.label}
                  </div>           
                </div>
                
                <div className="ml-auto">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Card>
          ))}
        </div>
    </div>
  )
}

export default DashboardPage;