
import React from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{ 
          backgroundImage: "url('https://images.pexels.com/photos/2933636/pexels-photo-2933636.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')",
          filter: "brightness(0.5)"
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center text-white">
        <h1 className="animate-fade-in mb-6 text-5xl font-bold tracking-tighter md:text-6xl">
          Textile Production Management
        </h1>
        <p className="animate-fade-in text-xl leading-relaxed opacity-90 [animation-delay:200ms] md:text-2xl">
          Streamline your production process with our comprehensive tracking system designed specifically for textile manufacturing workflows.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link 
            to="/quality-control" 
            className="animate-fade-in rounded-md bg-white px-6 py-3 text-base font-medium text-textile-900 shadow-md transition-colors hover:bg-gray-100 [animation-delay:400ms]"
          >
            Get Started
          </Link>
          <Link 
            to="/analytics" 
            className="animate-fade-in rounded-md border border-white bg-transparent px-6 py-3 text-base font-medium text-white transition-colors hover:bg-white/10 [animation-delay:600ms]"
          >
            View Analytics
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;
