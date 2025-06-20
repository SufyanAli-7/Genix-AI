"use client";

import axios from "axios";
import toast from "react-hot-toast";
import * as z from "zod";
import { Download, ImageIcon, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useProModal } from "@/hooks/use-pro-modal";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Heading } from "@/components/heading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { Card, CardFooter } from "@/components/ui/card";

import { amountOptions, formSchema, resolutionOptions } from "./constants";

interface SavedImage {
  id: string;
  prompt: string;
  imageUrl: string;
  amount?: string;
  resolution?: string;
  createdAt: string;
}

const ImagePage = () => {
  const proModel = useProModal();
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [savedImages, setSavedImages] = useState<SavedImage[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      amount: "1",
      resolution: "auto",
    },
  });

  // Load saved images on component mount
  useEffect(() => {
    loadSavedImages();
  }, []);
  const loadSavedImages = async () => {
    try {
      setIsLoadingImages(true);
      const response = await axios.get('/api/images');
      setSavedImages(response.data);
    } catch (error) {
      console.error('Failed to load saved images:', error);
    } finally {
      setIsLoadingImages(false);
    }
  };

  const deleteImage = async (imageId: string) => {
    try {
      await axios.delete(`/api/images/${imageId}`);
      toast.success("Image deleted successfully");
      // Refresh the saved images list
      loadSavedImages();
    } catch (error) {
      console.error('Failed to delete image:', error);
      toast.error("Failed to delete image");
    }
  };

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setImages([]);
      const response = await axios.post("/api/image", values);
      console.log("API Response:", response.data);

      // Handle base64 encoded images
      if (Array.isArray(response.data)) {
        // Convert base64 data to data URLs
        const imageUrls = response.data
          .map((image: { b64_json?: string; url?: string }) => {
            if (image.b64_json) {
              return `data:image/jpeg;base64,${image.b64_json}`;
            } else if (image.url) {
              return image.url;
            }
            return null;
          })
          .filter(Boolean) as string[];

        console.log("Processed image URLs:", imageUrls);
        setImages(imageUrls);
      } else if (response.data.data && Array.isArray(response.data.data)) {
        // Handle nested data property
        const imageUrls = response.data.data
          .map((image: { b64_json?: string; url?: string }) => {
            if (image.b64_json) {
              return `data:image/jpeg;base64,${image.b64_json}`;
            } else if (image.url) {
              return image.url;
            }
            return null;
          })
          .filter(Boolean) as string[];

        console.log("Processed nested image URLs:", imageUrls);        setImages(imageUrls);
      } else {
        console.error("Unexpected response format:", response.data);
        toast.error("Received unexpected data format from API");
      }

      // Refresh saved images after successful generation
      loadSavedImages();

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
      router.refresh();
    }
  };

  return (
    <div>
      <Heading
        title="Image Generation"
        description="Turn your prompt into an image."
        icon={ImageIcon}
        iconColor="text-pink-700"
        bgColor="bg-pink-700/10"
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
                  <FormItem className="col-span-12 lg:col-span-6">
                    <FormControl className="m-0 p-0">
                      <Input
                        className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                        disabled={isLoading}
                        placeholder="A cat wearing sunglasses and reading a book."
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="col-span-6 lg:col-span-2">
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue defaultValue={field.value} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {amountOptions.map((options) => (
                          <SelectItem key={options.value} value={options.value}>
                            {options.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="resolution"
                render={({ field }) => (
                  <FormItem className="col-span-6 lg:col-span-2">
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue defaultValue={field.value} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {resolutionOptions.map((options) => (
                          <SelectItem key={options.value} value={options.value}>
                            {options.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
            <div className="p-20">
              <Loader />
            </div>
          )}
          
          {/* Current Generation Results */}
          {images.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Latest Generation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {images.map((src, index) => (
                  <Card
                    key={`current-${index}-${src}`}
                    className="rounded-lg overflow-hidden flex flex-col p-0"
                  >
                    {src && (
                      <div className="flex flex-col w-full">
                        <div className="relative aspect-square w-full">
                          <Image
                            src={src}
                            alt={`Generated Image ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            priority={index < 2}
                          />
                        </div>
                        <CardFooter className="p-0 mt-0">
                          <Button
                            className="w-full rounded-t-none cursor-pointer"
                            variant="secondary"
                            disabled={!src}
                            onClick={() => {
                              if (src) {
                                const a = document.createElement("a");
                                a.href = src;
                                a.download = `generated-image-${index + 1}.jpg`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                              }
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </CardFooter>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Saved Images History */}
          {isLoadingImages && savedImages.length === 0 && (
            <div className="p-8">
              <Loader />
            </div>
          )}
          
          {savedImages.length > 0 && (            <div>
              <h3 className="text-lg font-semibold mb-4">Image History</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">                {savedImages.map((savedImage) => (
                  <Card
                    key={savedImage.id}
                    className="rounded-lg overflow-hidden flex flex-col p-0 relative group"
                  >{/* Delete button - positioned at top-right corner */}
                    <Button
                      variant="default"
                      size="sm"
                      className="absolute top-2 right-2 z-10 w-8 h-8 p-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200 bg-violet-600 hover:bg-violet-700"
                      onClick={() => deleteImage(savedImage.id)}
                      title="Delete image"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    
                    <div className="flex flex-col w-full">
                      <div className="relative aspect-square w-full">
                        <Image
                          src={savedImage.imageUrl}
                          alt={`Saved Image: ${savedImage.prompt.slice(0, 50)}...`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      </div>
                      <div className="p-2">
                        <p className="text-sm text-gray-600 truncate" title={savedImage.prompt}>
                          {savedImage.prompt}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(savedImage.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <CardFooter className="p-0 mt-0">
                        <Button
                          className="w-full rounded-t-none cursor-pointer"
                          variant="secondary"
                          onClick={() => {
                            const a = document.createElement("a");
                            a.href = savedImage.imageUrl;
                            a.download = `image-${savedImage.id}.jpg`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </CardFooter>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isLoadingImages && images.length === 0 && savedImages.length === 0 && (
            <Empty label="No images generated yet." />
          )}
        </div>
      </div>
    </div>
  );
};

export default ImagePage;
