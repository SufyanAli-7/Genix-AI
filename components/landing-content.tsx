"use client";

import { TESTIMONIALS } from "@/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";

const AI_TOOLS = [
  {
    title: "🧠AI Conversation",
    subtitle:
      "Chat Smarter, Not Harder. Get instant answers with our AI Conversation tool.",
    description:
      "Genix-AI offers intelligent, natural, and context-aware conversations powered by advanced AI models. Ask questions, brainstorm ideas, get writing assistance, or solve complex problems — all through a seamless chat interface. Whether you're a student, creator, developer, or business professional, Genix-AI adapts to your needs in real time, delivering smart, personalized responses instantly.",
    image: "/testimonials/ai conversation.jpeg",
    position: "left",
  },
  {
    title: "🎨Image Generation",
    subtitle:
      "Turn Your Imagination Into Art with AI Image Generation.",
    description:
      "With Genix-AI's image generation feature, simply type your idea and watch it transform into a vivid visual masterpiece. Powered by cutting-edge text-to-image models, you can create artwork, concept designs, marketing visuals, social media graphics, and more — all tailored to your vision. Customize style, lighting, details, and even moods. No design skills required just your imagination.",
    image: "/testimonials/image generation.png",
    position: "right",
  },
  {
    title: "💻Code Generation",
    subtitle:
      "Your AI-Powered Coding Assistant for Faster Development.",
    description:
      "Need help with frontend, backend, APIs, or debugging? Genix-AI can write, explain, or optimize code in multiple languages including JavaScript, Python, Java, and more. Whether you’re a beginner learning to code or a senior developer streamlining your workflow, our AI understands your requirements and delivers clean, efficient, and modular code. Accelerate development without sacrificing quality.",
    image: "/testimonials/code generation.jpeg",
    position: "left",
  },
  {
    title: "🎵Music Generation",
    subtitle:
      "Create Original Music in Seconds with AI Music Generation.",
    description:
      "Transform text prompts into professionally composed audio tracks. Whether you’re making background music for videos, composing game soundtracks, or just exploring creativity, Genix-AI composes unique music based on your input — from genre and mood to instruments and tempo. Enjoy unlimited royalty-free tracks, perfect for creators, filmmakers, and hobbyists alike.",
    image: "/testimonials/music generation.jpeg",
    position: "right",
  },
  {
    title: "🎬Video Generation",
    subtitle:
      "Transform your ideas into captivating videos with our AI-powered Video Generation tool.",
    description:
      "Create professional-quality videos without complex editing software or technical expertise. Our Video Generation AI uses advanced algorithms to transform text prompts into stunning visual narratives. Whether you need promotional videos, educational content, or creative storytelling, our tool generates high-quality videos that engage your audience. Perfect for marketers, content creators, and businesses looking to enhance their video marketing strategy with AI-generated content.",
    image: "/testimonials/video generation.jpeg",
    position: "left",
  },
];

export const LandingContent = () => {
  const { isSignedIn } = useAuth();
  return (
    <div className="px-10 pb-20">
      {/* AI Tools Section */}
      <div className="mb-20">
        <h2 className="text-center text-4xl text-white font-extrabold mb-16">
          Discover What Genix-AI Can Do
        </h2>{" "}
        <div className="max-w-6xl mx-auto space-y-8">
          {AI_TOOLS.map((tool, index) => (
            <div
              key={tool.title}
              className={`flex ${
                tool.position === "left" ? "justify-start" : "justify-end"
              }`}
            >
              <Card className="bg-[#1e2939] border border-[#2a3441] text-white overflow-hidden max-w-3xl w-4/5 pt-0 pb-0">
                <CardContent className="p-6 lg:p-8">
                  <div
                    className={`flex flex-col lg:flex-row items-center gap-6 lg:gap-8 ${
                      tool.position === "right" ? "lg:flex-row-reverse" : ""
                    }`}
                  >
                    {" "}
                    {/* Content Section */}
                    <div className="flex-1 space-y-3 lg:space-y-4 max-w-md lg:max-w-lg">
                      <div>
                        <h3 className="text-xl lg:text-2xl font-bold text-white mb-2">
                          {tool.title}
                        </h3>
                        <p className="text-gray-300 text-sm mb-3">
                          {tool.subtitle}
                        </p>
                      </div>

                      <p className="text-gray-400 text-xs lg:text-sm leading-relaxed mb-4">
                        {tool.description}
                      </p>
                      <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
                      <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-2 px-5 rounded-full text-sm transition-all duration-200 transform hover:scale-105 cursor-pointer">
                        Try It Free!
                      </Button>
                      </Link>
                    </div>
                    {/* Image Section */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <Image
                          src={tool.image}
                          alt={tool.title}
                          width={200}
                          height={200}
                          className="rounded-full object-cover"
                        />
                      </div>
                    </div>{" "}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>      </div>

      {/* Pricing Section */}
      <div className="mb-20">
        <h2 className="text-center text-4xl text-white font-extrabold mb-4">
          Friendly Pricing
        </h2>
        <p className="text-center text-gray-400 mb-16">
         The modern, customer-first approach to acquisition, engagement, and support.
        </p>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <Card className="bg-[#1e2939] border border-[#2a3441] text-white p-8 relative">
            <CardContent className="p-0">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">FREE</h3>
                <p className="text-gray-400 text-sm">Essential tools for individuals and talents</p>
              </div>
              
              <div className="mb-8">
                <span className="text-5xl font-bold text-white">$0</span>
                <span className="text-gray-400 ml-2">forever</span>
              </div>

              <div className="mb-8">
                <p className="text-gray-300 font-semibold mb-4">What's included?</p>
                <ul className="space-y-3">
                  <li className="flex items-center text-gray-300">
                    <span className="text-green-500 mr-3">✦</span>
                    12 AI Credits
                  </li>
                  <li className="flex items-center text-gray-300">
                    <span className="text-green-500 mr-3">✦</span>
                    Dashboard Access
                  </li>
                  <li className="flex items-center text-gray-400">
                    <span className="text-gray-500 mr-3">✦</span>
                    All AI Features
                  </li>
                  <li className="flex items-center text-gray-400">
                    <span className="text-gray-500 mr-3">✦</span>
                    Priority Support
                  </li>
                  <li className="flex items-center text-gray-400">
                    <span className="text-gray-500 mr-3">✦</span>
                    Premium Quality
                  </li>
                </ul>
              </div>

              <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
                <Button className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg cursor-pointer">
                  Get Started
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="bg-[#1e2939] border-2 border-blue-500 text-white p-8 relative transform scale-105">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            </div>
            <CardContent className="p-0">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">PRO</h3>
                <p className="text-gray-400 text-sm">Perfect for professionals and creators</p>
              </div>
              
              <div className="mb-8">
                <span className="text-5xl font-bold text-white">$20</span>
                <span className="text-gray-400 ml-2">/per month</span>
              </div>

              <div className="mb-8">
                <p className="text-gray-300 font-semibold mb-4">What's included?</p>
                <ul className="space-y-3">
                  <li className="flex items-center text-white">
                    <span className="text-green-500 mr-3">✦</span>
                    Unlimited AI Credits
                  </li>
                  <li className="flex items-center text-white">
                    <span className="text-green-500 mr-3">✦</span>
                    Full Dashboard Access
                  </li>
                  <li className="flex items-center text-white">
                    <span className="text-green-500 mr-3">✦</span>
                    All AI Features
                  </li>
                  <li className="flex items-center text-white">
                    <span className="text-green-500 mr-3">✦</span>
                    Priority Support
                  </li>
                  <li className="flex items-center text-white">
                    <span className="text-green-500 mr-3">✦</span>
                    Premium Quality
                  </li>
                </ul>
              </div>

              <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-lg cursor-pointer">
                  Choose Pro
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Enterprise Plan */}
          <Card className="bg-[#1e2939] border border-[#2a3441] text-white p-8 relative">
            <CardContent className="p-0">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">ENTERPRISE</h3>
                <p className="text-gray-400 text-sm">For teams and large organizations</p>
              </div>
              
              <div className="mb-8">
                <span className="text-5xl font-bold text-white">$79</span>
                <span className="text-gray-400 ml-2">/per month</span>
              </div>

              <div className="mb-8">
                <p className="text-gray-300 font-semibold mb-4">What's included?</p>
                <ul className="space-y-3">
                  <li className="flex items-center text-white">
                    <span className="text-green-500 mr-3">✦</span>
                    Unlimited Everything
                  </li>
                  <li className="flex items-center text-white">
                    <span className="text-green-500 mr-3">✦</span>
                    Team Collaboration
                  </li>
                  <li className="flex items-center text-white">
                    <span className="text-green-500 mr-3">✦</span>
                    API Access
                  </li>
                  <li className="flex items-center text-white">
                    <span className="text-green-500 mr-3">✦</span>
                    24/7 Dedicated Support
                  </li>
                  <li className="flex items-center text-white">
                    <span className="text-green-500 mr-3">✦</span>
                    Custom Integrations
                  </li>
                </ul>
              </div>

              <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
                <Button className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg cursor-pointer">
                  Contact Sales
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Testimonials Section */}
      <h2 className="text-center text-4xl text-white font-extrabold mb-10">
        Testimonials
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {TESTIMONIALS.map((testimonial) => (
          <Card
            key={testimonial.description}
            className="bg-[#192339] border-none text-white"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-x-2">
                <div>
                  <Image
                    src={testimonial.image}
                    alt="user"
                    height={48}
                    width={48}
                    className="rounded-full"
                  />
                </div>
                <div>
                  <p className="text-lg">{testimonial.name}</p>
                  <p className="text-zinc-400 text-sm">{testimonial.title}</p>
                </div>
              </CardTitle>

              <CardContent className="pt-4 px-0">
                {testimonial.description}
              </CardContent>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};
