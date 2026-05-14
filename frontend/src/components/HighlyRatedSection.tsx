import React, { useEffect, useRef, useState } from 'react';
import { Link } from "@tanstack/react-router";

const HighlyRatedSection = ({ sections, highlyRated }) => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (sectionRef.current) observer.unobserve(sectionRef.current);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  if (!sections?.highlyRated) return null;

  return (
    <section ref={sectionRef} className="bg-deep-blue text-white py-24 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-5 md:px-10">
        <div 
          className={`mb-10 transition-all duration-1000 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-white/60">Loved by customers</p>
          <h2 className="font-serif text-4xl md:text-5xl mt-2">Highly Rated</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {highlyRated.length === 0 && Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse flex flex-col">
              <div className="bg-white/5 rounded-[24px] aspect-[3/4]" />
              <div className="mt-4 px-2 space-y-2">
                <div className="h-4 bg-white/5 rounded w-3/4" />
                <div className="h-4 bg-white/5 rounded w-1/2" />
              </div>
            </div>
          ))}

          {highlyRated.map((p, index) => (
            <Link 
              key={p._id}
              to={`/product/${p.slug || p._id}`}
              className={`group flex flex-col rounded-[24px] bg-white/5 border border-white/10 overflow-hidden hover:bg-white/10 hover:border-white/20 hover:-translate-y-2 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-black/50 ${
                isVisible ? 'opacity-0 animate-fade-up' : 'opacity-0'
              }`}
              style={{ animationDelay: isVisible ? `${index * 150}ms` : '0ms', animationFillMode: 'forwards' }}
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={p.images?.[0] || p.image || ''}
                  alt={p.name}
                  className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                {p.rating > 0 && (
                  <span className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-deep-blue text-[11px] md:text-[12px] font-bold px-3 py-1.5 rounded-full shadow-lg transform transition-transform group-hover:scale-105">
                    ⭐ {p.rating}
                  </span>
                )}
              </div>

              <div className="p-5">
                <h3 className="font-serif text-[18px] md:text-[20px] leading-snug group-hover:text-gray-200 transition-colors">{p.name}</h3>
                <div className="flex justify-between items-center mt-2.5">
                  <span className="text-[12px] md:text-[13px] uppercase tracking-wider text-white/60 font-semibold">{p.ratingCount} reviews</span>
                  <span className="font-mono text-[15px] md:text-[16px] font-semibold text-white">₹{p.price.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HighlyRatedSection;
