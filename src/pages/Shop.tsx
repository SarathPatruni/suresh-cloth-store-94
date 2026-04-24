import { useEffect, useMemo, useState } from "react";
import { useParams, Navigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { SUBCATEGORIES, matchesSubcategory } from "@/lib/subcategories";

type Category = "men" | "women" | "kids";
const valid: Category[] = ["men", "women", "kids"];

const titles: Record<Category, { title: string; sub: string }> = {
  men: { title: "Menswear", sub: "Tailored, refined, effortless." },
  women: { title: "Womenswear", sub: "Pieces that move with you." },
  kids: { title: "Kidswear", sub: "Comfort meets character." },
};

const Shop = () => {
  const { category } = useParams<{ category: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSub = searchParams.get("type");
  const [products, setProducts] = useState<Tables<"products">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category || !valid.includes(category as Category)) return;
    setLoading(true);
    supabase
      .from("products")
      .select("*")
      .eq("category", category as Category)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProducts(data ?? []);
        setLoading(false);
      });
  }, [category]);

  const cat = category as Category;

  // Build chip list: defaults + any custom subcategories present in the data
  const chips = useMemo(() => {
    if (!valid.includes(cat)) return [] as string[];
    const defaults = SUBCATEGORIES[cat] ?? [];
    const fromData = products
      .map((p) => ((p as any).subcategory as string | null) ?? "")
      .filter((s) => s.trim().length > 0);
    const seen = new Set<string>();
    const merged: string[] = [];
    for (const s of [...defaults, ...fromData]) {
      const key = s.trim().toLowerCase();
      if (!seen.has(key)) { seen.add(key); merged.push(s); }
    }
    return merged;
  }, [cat, products]);

  const filtered = useMemo(() => {
    if (!activeSub) return products;
    return products.filter((p) =>
      matchesSubcategory((p as any).subcategory as string | null, activeSub)
    );
  }, [products, activeSub]);

  const setSub = (sub: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (sub) next.set("type", sub); else next.delete("type");
    setSearchParams(next, { replace: true });
  };

  if (!category || !valid.includes(cat)) {
    return <Navigate to="/" replace />;
  }

  const meta = titles[cat];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <section className="container pt-12 md:pt-16 pb-6">
        <span className="text-[0.7rem] uppercase tracking-[0.3em] text-accent">Collection</span>
        <h1 className="font-display text-5xl md:text-6xl mt-2">{meta.title}</h1>
        <p className="text-muted-foreground mt-3 max-w-lg">{meta.sub}</p>
      </section>

      {chips.length > 0 && (
        <section className="container pb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSub(null)}
              className={`px-4 py-2 text-xs uppercase tracking-widest border transition-colors ${
                !activeSub
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background text-foreground border-border hover:border-foreground"
              }`}
            >
              All
            </button>
            {chips.map((s) => {
              const active = matchesSubcategory(activeSub, s);
              return (
                <button
                  key={s}
                  onClick={() => setSub(s)}
                  className={`px-4 py-2 text-xs uppercase tracking-widest border transition-colors ${
                    active
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background text-foreground border-border hover:border-foreground"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section className="container pb-20">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-secondary animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center text-muted-foreground">
            {activeSub
              ? `No ${activeSub} in this collection yet.`
              : "No products in this collection yet."}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6 animate-fade-in">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Shop;
