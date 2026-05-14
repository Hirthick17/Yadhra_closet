import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";
import { useCms } from "@/lib/cms";
import { ShieldCheck } from "lucide-react";
import heroImg from "@/assets/hero_section_image.png";
import { useProducts } from "@/hooks/useProducts";
import { cartStore } from "@/lib/cart";
import { ShoppingBag } from "lucide-react";
import catEveryday from "@/assets/cat-everyday.jpg";
import catFestive from "@/assets/cat-festive.jpg";
import catFloral from "@/assets/cat-floral.jpg";
import catMinimal from "@/assets/cat-minimal.jpg";
import festiveCollection from "@/assets/festive-collection.jpg";
import founderImg from "@/assets/founder.jpg";
import { WhyYadhra } from "@/components/WhyYadhra";
import HeroSection from "@/components/HeroSection";
import ShopByCategory from "@/components/ShopByCategory";
import NewArrivalsSection from "@/components/NewArrivalsSection";
import HighlyRatedSection from "@/components/HighlyRatedSection";
import ReviewsSection from "@/components/ReviewsSection";
export const Route = createFileRoute("/")({ component: Home });

const CATEGORIES = [
  { id: "everyday", name: "Everyday Wear", count: 32, badge: "Most Popular", img: catEveryday, wide: true },
  { id: "festive", name: "Festive", count: 18, badge: "🔥 Hot", img: catFestive },
  { id: "floral", name: "Floral Prints", count: 24, img: catFloral },
  { id: "minimal", name: "Minimal", count: 21, img: catMinimal },
];

function Home() {
  const hero     = useCms((s) => s.content.home.hero);
  const sections = useCms((s) => s.content.home.sections);
  const story    = useCms((s) => s.content.home.brandStory);
  const reviews  = useCms((s) => s.content.home.reviews);

  // ── Live data from MongoDB ─────────────────────────────────────────
  const { data: newData }    = useProducts({ limit: 6 });
  const { data: ratedData }  = useProducts({ limit: 4 });
  const newArrivals  = newData?.data  ?? [];
  const highlyRated  = ratedData?.data ?? [];

  return (
    <SiteShell>
      {/* HERO */}
      <section className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden bg-deep-blue">
        {/* The Image Layer */}
        <img 
          src={heroImg}
          className="absolute inset-0 w-full h-full object-cover object-top animate-ken-burns"
          alt="Yadhra Closet Summer Collection"
        />
        {/* Dark scrim so text is always readable after reveal */}
        <div className="absolute inset-0 bg-deep-blue/30 z-[5]" />
        {/* Glow Reveal: starts as white wash, bursts then fades away completely */}
        <div className="absolute inset-0 animate-glow-reveal pointer-events-none z-[8]" />

        {/* Hero Content with Animation */}
        <HeroSection hero={hero} />
      </section>

      {/* CATEGORIES */}
      {sections.categories && (
        <ShopByCategory CATEGORIES={CATEGORIES} />
      )}

      {/* NEW ARRIVALS / HOT */}
      {sections.newArrivals && (
        <NewArrivalsSection sections={sections} newArrivals={newArrivals} cartStore={cartStore} />
      )}

      {/* HIGHLY RATED — DARK */}
      {sections.highlyRated && (
        <HighlyRatedSection sections={sections} highlyRated={highlyRated} />
      )}

      {/* WHY YADHRA — T-04: brand-differentiation section */}
      <WhyYadhra />

      {/* REVIEWS / SOCIAL PROOF */}
      {sections.reviews && (
        <ReviewsSection sections={sections} festiveCollection={festiveCollection} reviews={reviews} />
      )}

      {/* BRAND STORY — DARK */}
      {sections.brandStory && (
      <section className="bg-deep-blue text-white">
        <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-20 grid lg:grid-cols-[1fr_1.2fr] gap-12 items-center">
          <div className="relative">
            <div className="aspect-[3/4] rounded-[20px] overflow-hidden">
              <img src={founderImg} alt="Yadhra founder" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-6 -right-4 md:right-6 w-[150px] h-[150px] bg-white text-accent-blue rounded-2xl shadow-xl flex flex-col items-center justify-center text-center">
              <div className="font-serif text-[32px] font-semibold text-deep-blue">{story.yearsBadge}</div>
              <div className="text-[9px] uppercase tracking-[0.14em] text-text-muted px-3">Years of Designing</div>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">{story.eyebrow}</p>
            <h2 className="font-serif italic text-[clamp(26px,3vw,40px)] leading-[1.25] mt-3">{story.quote}</h2>
            <p className="text-[14px] leading-[1.9] text-white/55 mt-6 max-w-[520px]">{story.body}</p>
            <div className="flex items-center gap-4 mt-8">
              <div className="w-12 h-12 rounded-full bg-white/15 text-white font-serif text-xl flex items-center justify-center">{story.founderName.charAt(0)}</div>
              <div>
                <p className="text-[14px] font-semibold">{story.founderName}</p>
                <p className="text-[11px] text-white/55">{story.founderRole}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}
    </SiteShell>
  );
}
