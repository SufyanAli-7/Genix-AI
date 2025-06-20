"use client";

import toast from "react-hot-toast";
import axios from "axios";
import * as z from "zod";
import { VideoIcon, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Heading } from "@/components/heading";
import { useProModal } from "@/hooks/use-pro-modal";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";

import { formSchema } from "./constants";

interface SavedVideo {
  id: string;
  prompt: string;
  videoUrl: string;
  createdAt: string;
}

const VideoPage = () => {
  const proModel = useProModal();
  const router = useRouter();
  const [video, setVideo] = useState<string>();
  const [savedVideos, setSavedVideos] = useState<SavedVideo[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  // Load saved videos on component mount
  useEffect(() => {
    loadSavedVideos();
  }, []);

  const loadSavedVideos = async () => {
    try {
      setIsLoadingVideos(true);
      const response = await axios.get('/api/videos');
      setSavedVideos(response.data);
    } catch (error) {
      console.error('Failed to load saved videos:', error);
    } finally {
      setIsLoadingVideos(false);
    }
  };

  const deleteVideo = async (videoId: string) => {
    try {
      await axios.delete(`/api/videos/${videoId}`);
      toast.success("Video deleted successfully");
      // Refresh the saved videos list
      loadSavedVideos();
    } catch (error) {
      console.error('Failed to delete video:', error);
      toast.error("Failed to delete video");
    }
  };

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
      }      console.log("Video URL received:", videoUrl);
      setVideo(videoUrl);
      
      // Refresh saved videos after successful generation
      loadSavedVideos();
      
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
        </div>        <div className="space-y-4 mt-4">
          {isLoading && (
            <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
              <Loader />
            </div>
          )}
          
          {/* Current Generation Result */}
          {video && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Latest Generation</h3>
              <div className="w-full">
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
            </div>
          )}

          {/* Saved Videos History */}
          {isLoadingVideos && savedVideos.length === 0 && (
            <div className="p-8">
              <Loader />
            </div>
          )}
          
          {savedVideos.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Video History</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedVideos.map((savedVideo) => (
                  <div
                    key={savedVideo.id}
                    className="rounded-lg border bg-card text-card-foreground shadow-sm relative group"
                  >                    {/* Delete button - positioned at top-right corner */}
                    <Button
                      variant="default"
                      size="sm"
                      className="absolute top-2 right-2 z-10 w-8 h-8 p-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200 bg-violet-600 hover:bg-violet-700"
                      onClick={() => deleteVideo(savedVideo.id)}
                      title="Delete video"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    
                    <div className="p-4">
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 line-clamp-2" title={savedVideo.prompt}>
                          {savedVideo.prompt}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(savedVideo.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <video
                        controls
                        className="w-full aspect-video rounded-lg border bg-black"
                      >
                        <source src={savedVideo.videoUrl} />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isLoadingVideos && !video && savedVideos.length === 0 && (
            <Empty label="No videos generated yet." />
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPage;
