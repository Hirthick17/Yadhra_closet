import React, { useEffect, useRef, useState } from 'react';
import { Link } from "@tanstack/react-router";
import { ShoppingBag } from 'lucide-react';

const NewArrivalsSection = ({ sections, newArrivals, cartStore }) => {
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

  if (!sections?.newArrivals) return null;

  return (
    <section id="hot" ref={sectionRef} className="bg-secondary-bg py-24 scroll-mt-20 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-5 md:px-10">
        
        {/* Header Reveal */}
        <div 
          className={`flex items-end justify-between mb-10 transition-all duration-1000 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-text-muted">Just dropped</p>
            <h2 className="font-serif text-4xl md:text-5xl mt-2 text-deep-blue">New Arrivals</h2>
          </div>
          <Link to="/catalog" className="hidden md:inline text-[13px] font-bold uppercase tracking-wider text-deep-blue hover:opacity-70 transition-opacity">
            View all →
          </Link>
        </div>

        {/* Product Carousel */}
        <div className="flex gap-6 md:gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-5 px-5 pb-8">
          {newArrivals.length === 0 && (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-[280px] md:w-[340px] flex-shrink-0 snap-start animate-pulse">
                <div className="bg-white rounded-[24px] aspect-[3/4] shadow-sm" />
                <div className="mt-4 space-y-2 px-2">
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))
          )}

          {newArrivals.map((p, index) => (
            <div 
              key={p._id} 
              className={`w-[280px] md:w-[340px] flex-shrink-0 snap-start group relative ${
                isVisible ? 'opacity-0 animate-fade-up' : 'opacity-0'
              }`}
              style={{ 
                animationDelay: isVisible ? `${index * 150}ms` : '0ms',
                animationFillMode: 'forwards'
              }}
            >
              <Link to={`/product/${p.slug || p._id}`}>
                <div className="rounded-[24px] overflow-hidden bg-white aspect-[3/4] shadow-sm group-hover:shadow-xl transition-all duration-500 relative">
                  <img 
                    src={p.images?.[0] || p.image || ''} 
                    alt={p.name} 
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                </div>
                <div className="mt-4 px-2">
                  <p className="text-[11px] md:text-[12px] uppercase tracking-[0.16em] text-text-muted font-bold">
                    {p.categoryLabel}
                  </p>
                  <h3 className="font-serif text-[18px] md:text-[20px] mt-1 text-deep-blue leading-snug group-hover:text-blue-700 transition-colors">
                    {p.name}
                  </h3>
                  <p className="font-mono text-[15px] md:text-[16px] font-semibold mt-1.5 text-gray-900">
                    ₹{p.price.toLocaleString('en-IN')}
                  </p>
                </div>
              </Link>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  cartStore.addItem({ 
                    productId: p._id, 
                    slug: p.slug, 
                    name: p.name, 
                    price: p.price, 
                    image: p.images?.[0] || p.image, 
                    categoryLabel: p.categoryLabel 
                  });
                }}
                className="absolute top-4 right-4 w-10 h-10 md:w-12 md:h-12 rounded-full bg-deep-blue text-white flex items-center justify-center shadow-lg transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-blue-800 hover:scale-110"
                aria-label={`Add ${p.name} to cart`}
              >
                <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrivalsSection;
