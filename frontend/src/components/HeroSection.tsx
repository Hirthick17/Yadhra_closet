import React, { useState, useEffect } from 'react';
import { Link } from "@tanstack/react-router";

const HeroSection = ({ hero }) => {
  // State to trigger the movement to the left corner
  const [moveToLeft, setMoveToLeft] = useState(false);

  useEffect(() => {
    // 3000ms allows the initial fade-up animation to finish
    // before triggering the slide and border reveal.
    const timer = setTimeout(() => {
      setMoveToLeft(true);
    }, 3000); 

    return () => clearTimeout(timer);
  }, []);

  return (
    // The main viewport container remains relative to constrain the absolute child
    <div className="absolute inset-0 z-20 overflow-hidden">
      
      {/* 
        MASTER CONTENT WRAPPER 
        This absolute div controls the sliding motion, the borders, and the padding.
      */}
      <div 
        className={`
          absolute top-1/2 -translate-y-1/2 flex flex-col 
          transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${moveToLeft 
            ? 'left-[5%] md:left-[8%] lg:left-[10%] translate-x-0 w-[90%] md:w-auto text-left border border-deep-blue/20 bg-white/30 backdrop-blur-md p-8 md:p-12 rounded-3xl' 
            : 'left-1/2 -translate-x-1/2 w-full max-w-2xl text-center border-transparent bg-transparent p-0'
          }
        `}
      >
        
        {/* Eyebrow */}
        <p 
          className={`text-[12px] md:text-[14px] font-bold uppercase tracking-[0.2em] text-text-muted mb-4 opacity-0 animate-fade-up transition-all duration-1000 ${moveToLeft ? 'mx-0' : 'mx-auto'}`} 
          style={{ animationDelay: '0.2s' }}
        >
          {hero.eyebrow}
        </p>

        {/* Title */}
        <h1 
          className="font-serif text-[clamp(48px,7vw,84px)] leading-[1.05] text-deep-blue mb-6 opacity-0 animate-fade-up" 
          style={{ animationDelay: '0.4s' }}
        >
          {hero.titleTop}
          <br />
          <span>{hero.titleBottom}</span>
        </h1>

        {/* Body */}
        <p 
          className={`text-[16px] md:text-[18px] leading-[1.8] text-text-muted mb-8 opacity-0 animate-fade-up transition-all duration-1000 ${moveToLeft ? 'max-w-xl mx-0' : 'max-w-lg mx-auto'}`} 
          style={{ animationDelay: '0.6s' }}
        >
          {hero.body}
        </p>

        {/* Call to Action Buttons */}
        <div 
          className={`flex gap-4 opacity-0 animate-fade-up transition-all duration-1000 ${moveToLeft ? 'justify-start' : 'justify-center'}`} 
          style={{ animationDelay: '0.8s' }}
        >
           <Link to="/catalog" className="px-8 py-3 bg-deep-blue text-white rounded-full text-sm font-medium hover:shadow-[0_14px_30px_-12px_rgba(13,26,99,0.55)] hover:-translate-y-0.5 transition-all">
             {hero.cta1}
           </Link>
           <Link to="/faq" className="px-8 py-3 bg-transparent border border-gray-400 text-deep-blue rounded-full text-sm font-medium hover:bg-white/50 transition-colors">
             {hero.cta2}
           </Link>
        </div>

      </div>
    </div>
  );
};

export default HeroSection;
