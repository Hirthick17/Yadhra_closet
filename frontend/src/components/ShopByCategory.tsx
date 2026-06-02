import React, { useEffect, useRef, useState } from 'react';
import { Link } from "@tanstack/react-router";

interface CategoryItem {
  id: string;
  name: string;
  count: number;
  badge?: string;
  img: any; // Can be string or imported asset object
  wide?: boolean;
}

interface ShopByCategoryProps {
  CATEGORIES: CategoryItem[];
}

const ShopByCategory = ({ CATEGORIES }: ShopByCategoryProps) => {
  // We use a ref to target the section and state to track its visibility
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // The IntersectionObserver watches the section and fires when 15% of it is visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once it triggers, we can unobserve to prevent the animation from repeating
          if (sectionRef.current) observer.unobserve(sectionRef.current);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  return (
    <section 
      id="categories" 
      ref={sectionRef}
      className="max-w-[1400px] mx-auto px-5 md:px-10 py-20 scroll-mt-20 overflow-hidden"
    >
      {/* Header Reveal */}
      <div 
        className={`flex items-end justify-between mb-8 transition-all duration-1000 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div>
          <p className="text-[18px] font-bold uppercase tracking-[0.18em] text-text-muted">Browse</p>
          <h2 className="font-serif text-4xl mt-2 text-deep-blue">Shop by Category</h2>
        </div>
      </div>
      
      {/* 2x2 Grid Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {CATEGORIES.map((c, index) => (
          <Link
            key={c.id}
            to="/catalog"
            search={{ cat: c.id }}
            // We apply the animation class only if isVisible is true, and stagger the delay by multiplying the index by 150 milliseconds.
            className={`group relative overflow-hidden rounded-2xl min-h-[180px] md:min-h-[260px] shadow-sm hover:shadow-xl transition-all duration-500 ${
              isVisible ? 'opacity-0 animate-fade-up' : 'opacity-0'
            }`}
            style={{ 
              animationDelay: isVisible ? `${index * 150}ms` : '0ms',
              animationFillMode: 'forwards' // Ensures the opacity stays at 1 after animation ends
            }}
          >
            {/* 
              The critical fix: Changing object-cover to include object-top. 
              This anchors the image to the ceiling, preventing the decapitation issue.
            */}
            <img 
              src={c.img} 
              alt={c.name} 
              className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.08]" 
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-deep-blue/80 via-deep-blue/20 to-transparent transition-opacity duration-500 group-hover:opacity-90" />
            
            {c.badge && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/95 text-[10px] font-bold uppercase tracking-wider text-deep-blue shadow-sm">
                {c.badge}
              </span>
            )}
            
            <div className="absolute bottom-5 left-5 text-white transform transition-transform duration-500 group-hover:-translate-y-1">
              <h3 className="font-serif text-2xl md:text-3xl">{c.name}</h3>
              <p className="text-[12px] md:text-[13px] opacity-90 mt-1 tracking-wide">{c.count} designs</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default ShopByCategory;
