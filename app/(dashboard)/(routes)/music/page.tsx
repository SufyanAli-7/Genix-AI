'use client';

import axios from 'axios';
import toast from 'react-hot-toast';
import * as z from 'zod';
import { Download, Music, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useProModal } from '@/hooks/use-pro-modal';
import { Heading } from '@/components/heading';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardFooter } from '@/components/ui/card';
import { Empty } from '@/components/empty';
import { Loader } from '@/components/loader';
import { formSchema } from './constants';

interface SavedMusic {
  id: string;
  prompt: string;
  musicUrl: string;
  createdAt: string;
}

const MusicPage = () => {
  const proModel = useProModal();
  const router = useRouter();
  const [music, setMusic] = useState<string>();
  const [savedMusic, setSavedMusic] = useState<SavedMusic[]>([]);
  const [isLoadingMusic, setIsLoadingMusic] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
    },
  });

  // Load saved music on component mount
  useEffect(() => {
    loadSavedMusic();
  }, []);

  const loadSavedMusic = async () => {
    try {
      setIsLoadingMusic(true);
      const response = await axios.get('/api/music-storage');
      setSavedMusic(response.data);
    } catch (error) {
      console.error('Failed to load saved music:', error);
    } finally {
      setIsLoadingMusic(false);
    }
  };

  const deleteMusic = async (musicId: string) => {
    try {
      await axios.delete(`/api/music-storage/${musicId}`);
      toast.success("Music deleted successfully");
      // Refresh the saved music list
      loadSavedMusic();
    } catch (error) {
      console.error('Failed to delete music:', error);
      toast.error("Failed to delete music");
    }
  };

  const isLoading = form.formState.isSubmitting;
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setMusic(undefined);

      const response = await axios.post('/api/music', values);

      setMusic(response.data.audio);
      form.reset();
      // Refresh saved music to show the new one
      loadSavedMusic();
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
      router.refresh();
    }
  };

  return (
    <div>
      <Heading
        title="Music Generation"
        description="Turn your Prompt into music."
        icon={Music}
        iconColor="text-emerald-500"
        bgColor="bg-emerald-500/10"
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
                        placeholder="80's disco theme"
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
          {music && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Latest Generation</h3>
              <Card className="rounded-lg overflow-hidden p-4">
                <audio controls className="w-full">
                  <source src={music} />
                </audio>
                <CardFooter className="p-0 mt-4">
                  <Button
                    className="w-full cursor-pointer"
                    variant="secondary"
                    onClick={() => {
                      const a = document.createElement("a");
                      a.href = music;
                      a.download = `generated-music-${Date.now()}.mp3`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* Saved Music History */}
          {isLoadingMusic && savedMusic.length === 0 && (
            <div className="p-8">
              <Loader />
            </div>
          )}
          
          {savedMusic.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Music History</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedMusic.map((savedItem) => (
                  <Card
                    key={savedItem.id}
                    className="rounded-lg overflow-hidden p-4 relative group"
                  >                    {/* Delete button - positioned at top-right corner */}
                    <Button
                      variant="default"
                      size="sm"
                      className="absolute top-2 right-2 z-10 w-8 h-8 p-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200 bg-violet-600 hover:bg-violet-700"
                      onClick={() => deleteMusic(savedItem.id)}
                      title="Delete music"
                    >
                      <X className="w-4 h-4" />
                    </Button>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2" title={savedItem.prompt}>
                        {savedItem.prompt}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(savedItem.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <audio controls className="w-full mb-4">
                      <source src={savedItem.musicUrl} />
                    </audio>
                    
                    <CardFooter className="p-0">
                      <Button
                        className="w-full cursor-pointer"
                        variant="secondary"
                        onClick={() => {
                          const a = document.createElement("a");
                          a.href = savedItem.musicUrl;
                          a.download = `music-${savedItem.id}.mp3`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isLoadingMusic && !music && savedMusic.length === 0 && (
            <Empty label="No music generated yet." />
          )}
        </div>
      </div>
    </div>
  );
};

export default MusicPage;