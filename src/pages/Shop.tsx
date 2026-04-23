import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Category = "men" | "women" | "kids";
const valid: Category[] = ["men", "women", "kids"];

const titles: Record<Category, { title: string; sub: string }> = {
  men: { title: "Menswear", sub: "Tailored, refined, effortless." },
  women: { title: "Womenswear", sub: "Pieces that move with you." },
  kids: { title: "Kidswear", sub: "Comfort meets character." },
};

const Shop = () => {
  const { category } = useParams<{ category: string }>();
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

  if (!category || !valid.includes(category as Category)) {
    return <Navigate to="/" replace />;
  }

  const meta = titles[category as Category];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <section className="container pt-12 md:pt-16 pb-10">
        <span className="text-[0.7rem] uppercase tracking-[0.3em] text-accent">Collection</span>
        <h1 className="font-display text-5xl md:text-6xl mt-2">{meta.title}</h1>
        <p className="text-muted-foreground mt-3 max-w-lg">{meta.sub}</p>
      </section>

      <section className="container pb-20">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-secondary animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-24 text-center text-muted-foreground">
            No products in this collection yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6 animate-fade-in">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Shop;
