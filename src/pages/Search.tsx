import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

const Search = () => {
  const [params] = useSearchParams();
  const q = (params.get("q") ?? "").trim();
  const [products, setProducts] = useState<Tables<"products">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let query = supabase.from("products").select("*").order("created_at", { ascending: false });
    if (q) query = query.ilike("name", `%${q}%`);
    query.then(({ data }) => {
      setProducts(data ?? []);
      setLoading(false);
    });
  }, [q]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <section className="container pt-12 md:pt-16 pb-10">
        <span className="text-[0.7rem] uppercase tracking-[0.3em] text-accent">Search</span>
        <h1 className="font-display text-4xl md:text-5xl mt-2">
          {q ? <>Results for “{q}”</> : "All products"}
        </h1>
        <p className="text-muted-foreground mt-3">
          {loading ? "Searching…" : `${products.length} ${products.length === 1 ? "item" : "items"} found`}
        </p>
      </section>

      <section className="container pb-20 flex-1">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-secondary animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-24 text-center text-muted-foreground">
            No products match your search.
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

export default Search;
