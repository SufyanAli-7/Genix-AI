"use client";

import toast from "react-hot-toast";
import axios from "axios";
import * as z from "zod";
import { VideoIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heading } from "@/components/heading";
import { useProModal } from "@/hooks/use-pro-modal";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";

import { formSchema } from "./constants";

const VideoPage = () => {
  const proModel = useProModal();
  const router = useRouter();
  const [video, setVideo] = useState<string>();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setVideo(undefined);

      const response = await axios.post("/api/video", values);

      // Handle different response formats
      let videoUrl;
      if (Array.isArray(response.data)) {
        videoUrl = response.data[0];
      } else {
        videoUrl = response.data;
      }

      // Ensure we have a valid string URL
      if (typeof videoUrl === "object") {
        // If it's an object, try to extract URL property
        videoUrl = videoUrl.url || videoUrl.video || videoUrl.data;
      }

      console.log("Video URL received:", videoUrl);
      setVideo(videoUrl);
      form.reset();
    } catch (error: unknown) { // ✅ Fix: Changed from 'any' to 'unknown'
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
      router.refresh();
    }
  };

  return (
    <div>
      <Heading
        title="Video Generation"
        description="Turn your prompt into video."
        icon={VideoIcon}
        iconColor="text-orange-700"
        bgColor="bg-orange-700/10"
      />
      <div className="px-4 lg:px-8">
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2"
            >
              <FormField
                name="prompt"
                render={({ field }) => (
                  <FormItem className="col-span-12 lg:col-span-10">
                    <FormControl className="m-0 p-0">
                      <Input
                        className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                        disabled={isLoading}
                        placeholder="Clown fish swimming around a coral reef."
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                className="col-span-12 lg:col-span-2 w-full cursor-pointer"
                disabled={isLoading}
              >
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
          {!video && !isLoading && <Empty label="No video generated." />}{" "}
          {video && (
            <div className="w-full mt-8">
              {video.includes("placeholder") ? (
                <div className="aspect-video rounded-lg border bg-muted flex items-center justify-center">
                  <div className="text-center p-8">
                    <VideoIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">
                      Video Generation Temporarily Unavailable
                    </p>
                    <p className="text-sm text-muted-foreground">
                      The video generation service is currently experiencing
                      high traffic. Please try again in a few minutes.
                    </p>
                  </div>
                </div>
              ) : (
                <video
                  controls
                  className="w-full aspect-video rounded-lg border bg-black"
                >
                  <source src={video} />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPage;
