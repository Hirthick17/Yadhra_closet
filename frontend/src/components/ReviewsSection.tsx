import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck } from 'lucide-react';

interface Review {
  initial: string;
  name: string;
  city?: string;
  product?: string;
  text: string;
}

interface ReviewsSectionProps {
  sections?: any;
  festiveCollection: string;
  reviews: Review[];
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ sections, festiveCollection, reviews }) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (el) observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!sections?.reviews) return null;

  return (
    <section ref={sectionRef} className="max-w-[1400px] mx-auto px-5 md:px-10 py-24 relative overflow-hidden">
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-50/60 to-purple-50/40 rounded-full blur-3xl -z-10 translate-x-1/4 pointer-events-none" />

      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div
          className={`relative rounded-[24px] overflow-hidden aspect-[4/5] shadow-2xl ${isVisible ? 'opacity-0 animate-fade-up' : 'opacity-0'}`}
          style={{ animationFillMode: 'forwards' }}
        >
          <img
            src={festiveCollection}
            alt="Festive collection"
            className="absolute inset-0 w-full h-full object-cover object-top hover:scale-105 transition-transform duration-1000"
          />
          <span className="absolute top-6 left-6 px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-white/50 text-[11px] md:text-[12px] font-bold uppercase tracking-wider text-deep-blue shadow-sm">
            Festive Collection
          </span>
        </div>

        <div className="space-y-6">
          <div className={`${isVisible ? 'opacity-0 animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '150ms', animationFillMode: 'forwards' }}>
            <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-text-muted">Real Reviews</p>
            <h2 className="font-serif text-4xl md:text-5xl mt-2 text-deep-blue leading-tight">What women say</h2>
          </div>

          <div className="space-y-5 mt-8">
            {reviews.map((r, i) => (
              <div
                key={i}
                className={`relative p-6 md:p-8 rounded-[20px] bg-white/60 backdrop-blur-lg border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 ${
                  isVisible ? 'opacity-0 animate-fade-up' : 'opacity-0'
                }`}
                style={{ animationDelay: isVisible ? `${300 + i * 150}ms` : '0ms', animationFillMode: 'forwards' }}
              >
                <span className="absolute top-5 right-5 text-[11px] md:text-[12px] font-bold text-emerald-700 bg-emerald-50/80 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-emerald-100">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified
                </span>

                <div className="flex items-center gap-4">
                  <div className="w-[44px] h-[44px] rounded-full bg-gradient-to-br from-deep-blue to-blue-700 text-white font-bold flex items-center justify-center text-lg shadow-inner">
                    {r.initial}
                  </div>
                  <div>
                    <p className="text-[15px] md:text-[16px] font-bold text-deep-blue">{r.name}</p>
                    <p className="text-[12px] md:text-[13px] text-text-muted font-medium mt-0.5">{r.city} <span className="mx-1.5 opacity-50">•</span> {r.product}</p>
                  </div>
                </div>

                <p className="text-amber-400 text-[14px] mt-4 tracking-widest drop-shadow-sm">★★★★★</p>

                <p className="text-[15px] md:text-[16px] leading-[1.8] mt-3 text-gray-700">"{r.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
