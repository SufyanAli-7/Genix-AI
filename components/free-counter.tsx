"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Max_FREE_COUNTS } from "@/constants";
import { useProModal } from "@/hooks/use-pro-modal";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";


interface FreeCounterProps {
    apiLimitCount: number;
    isPro: boolean;
};


export const FreeCounter=({
    apiLimitCount = 0,
    isPro = false
}: FreeCounterProps)=>{
    const proModal = useProModal();
   const [mounted, setMounted] = useState(false); 

   useEffect(() => {
       setMounted(true);    
    }, []);

    if (!mounted) {
         return null; // Prevents server-side rendering issues  
    }
    if (isPro) {
        return null; // If the user is a Pro member, do not show the free counter
    }

    return(
        <div className="px-3">
            <Card className="bg-white/10 border-0">
            <CardContent className="py-6">
             <div className="text-center text-sm text-white mb-4 space-y-2">
               <p>
                { apiLimitCount } / {Max_FREE_COUNTS} Free Generations
               </p>
                <Progress 
                className="h-3 bg-white"
                value={(apiLimitCount / Max_FREE_COUNTS) * 100}                                
                />
             </div>
             <Button onClick={proModal.onOpen} className="w-full cursor-pointer" variant="premium">
                Upgrade
                <Zap className="w-4 h-4 ml-2 fill-white" />
             </Button>
            </CardContent>                
            </Card>
        </div>
    )
}