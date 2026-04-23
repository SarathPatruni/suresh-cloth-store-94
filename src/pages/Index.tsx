import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { ArrowRight } from "lucide-react";
import hero from "@/assets/hero.jpg";
import catMen from "@/assets/category-men.jpg";
import catWomen from "@/assets/category-women.jpg";
import catKids from "@/assets/category-kids.jpg";

const categories = [
  { name: "Women", slug: "women", image: catWomen, copy: "Drape & flow" },
  { name: "Men", slug: "men", image: catMen, copy: "Tailored essentials" },
  { name: "Kids", slug: "kids", image: catKids, copy: "Little wonders" },
];

const Index = () => {
  const [featured, setFeatured] = useState<Tables<"products">[]>([]);

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(4)
      .then(({ data }) => setFeatured(data ?? []));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-gradient">
        <div className="container grid md:grid-cols-2 gap-8 items-center py-16 md:py-24 min-h-[80vh]">
          <div className="space-y-7 animate-fade-up order-2 md:order-1">
            <span className="inline-block text-[0.7rem] uppercase tracking-[0.3em] text-accent">
              Spring Edit · 2026
            </span>
            <h1 className="font-display text-5xl md:text-7xl leading-[0.95] text-balance">
              Threads woven with <em className="not-italic text-accent">intention.</em>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-md leading-relaxed">
              Suresh Cloth Store brings together craftsmanship and quiet luxury for men, women and the little ones — all under one warm roof.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild size="lg" className="rounded-none px-8 h-12">
                <Link to="/shop/women">Explore the collection <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-none px-8 h-12 border-foreground/30">
                <Link to="/shop/men">Shop menswear</Link>
              </Button>
            </div>
          </div>
          <div className="relative order-1 md:order-2">
            <img
              src={hero}
              alt="Models wearing Suresh Cloth Store collection"
              width={1600}
              height={1100}
              className="w-full h-[55vh] md:h-[75vh] object-cover shadow-elegant"
            />
            <div className="hidden md:block absolute -bottom-4 -left-4 bg-background border border-border px-5 py-3 shadow-soft">
              <div className="text-[0.65rem] uppercase tracking-widest text-muted-foreground">Since</div>
              <div className="font-display text-2xl">1987</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-20 md:py-28">
        <div className="flex items-end justify-between mb-10 md:mb-14">
          <div>
            <span className="text-[0.7rem] uppercase tracking-[0.3em] text-accent">Shop by</span>
            <h2 className="font-display text-4xl md:text-5xl mt-2">Our Collections</h2>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-5 md:gap-6">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to={`/shop/${c.slug}`}
              className="group relative overflow-hidden block aspect-[3/4]"
            >
              <img
                src={c.image}
                alt={`${c.name} collection`}
                loading="lazy"
                className="w-full h-full object-cover transition-elegant group-hover:scale-105"
              />
              <div className="absolute inset-0" style={{ background: "var(--gradient-overlay)" }} />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-primary-foreground">
                <div className="text-[0.7rem] uppercase tracking-[0.3em] opacity-80">{c.copy}</div>
                <div className="flex items-center justify-between mt-1">
                  <h3 className="font-display text-3xl">{c.name}</h3>
                  <ArrowRight className="w-5 h-5 transition-elegant group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="container pb-20 md:pb-28">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-[0.7rem] uppercase tracking-[0.3em] text-accent">Just in</span>
              <h2 className="font-display text-4xl md:text-5xl mt-2">New arrivals</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Story */}
      <section className="bg-secondary/60 border-y border-border/60">
        <div className="container py-20 md:py-24 max-w-3xl text-center">
          <span className="text-[0.7rem] uppercase tracking-[0.3em] text-accent">Our story</span>
          <h2 className="font-display text-4xl md:text-5xl mt-3 leading-tight text-balance">
            Three generations of dressing the family.
          </h2>
          <p className="text-muted-foreground mt-6 leading-relaxed">
            What began as a single shop on Main Bazaar Road has grown into a beloved local destination for thoughtfully made clothing — without ever losing the warmth of being family run.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
