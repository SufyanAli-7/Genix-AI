"use client";

export const LandingFooter = () => {
  return (
    <nav className="p-8 bg-transparent flex items-center justify-center">      
      <div className="text-white text-[15px]">
        &copy; <span className="font-bold">Genix-AI</span>{" "}
        {new Date().getFullYear()}. All rights reserved.
      </div>      
    </nav>
  );
};