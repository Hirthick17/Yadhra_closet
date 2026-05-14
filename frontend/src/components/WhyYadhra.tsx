import React, { useEffect, useRef, useState } from 'react';

const FEATURES = [
  {
    icon: '✂️',
    title: 'Handpicked, Not Mass-Produced',
    desc: 'Every kurti is sourced directly from artisan weavers in Tamil Nadu — each piece is reviewed before it reaches you.',
  },
  {
    icon: '🌿',
    title: 'Natural Fabrics Only',
    desc: 'We work exclusively with cotton, linen, and silk — breathable, comfortable, and kind to your skin in Chennai\'s heat.',
  },
  {
    icon: '🚚',
    title: 'Delivered to Your Door',
    desc: 'Free delivery within Chennai. Pan-India shipping available. Your order is packed with care — not thrown in a box.',
  },
  {
    icon: '💬',
    title: 'Personal Styling Help',
    desc: 'Not sure what suits you? Message us on WhatsApp — we will help you pick the right piece, size, and colour combination.',
  },
];

export function WhyYadhra() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
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

  return (
    <section ref={sectionRef} className="py-24 bg-stone-50 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-5 md:px-10">

        {/* Header Reveal */}
        <div
          className={`flex flex-col items-center mb-16 transition-all duration-1000 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-center mb-3 text-deep-blue font-serif text-[clamp(2.5rem,5vw,3.5rem)] leading-tight">
            Why Yadhra?
          </h2>
          <p className="text-center text-text-muted text-[12px] md:text-[13px] tracking-[0.2em] uppercase font-bold">
            What makes us different
          </p>
        </div>

        {/* Responsive grid: 1 → 2 → 4 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {FEATURES.map((f, index) => (
            <div
              key={f.title}
              className={`group flex flex-col items-center text-center p-8 md:p-10 bg-white rounded-[24px] shadow-sm border border-stone-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 ${
                isVisible ? 'opacity-0 animate-fade-up' : 'opacity-0'
              }`}
              style={{
                animationDelay: isVisible ? `${index * 150}ms` : '0ms',
                animationFillMode: 'forwards',
              }}
            >
              <div className="w-20 h-20 mb-6 rounded-full bg-blue-900/5 flex items-center justify-center transform group-hover:scale-110 group-hover:bg-blue-900/10 transition-all duration-500">
                <span className="text-4xl" role="img" aria-label={f.title}>
                  {f.icon}
                </span>
              </div>

              <h3 className="font-serif text-[20px] text-deep-blue mb-4 leading-tight group-hover:text-blue-700 transition-colors">
                {f.title}
              </h3>

              <p className="text-text-muted text-[15px] md:text-[16px] leading-[1.8]">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
