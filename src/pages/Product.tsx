import { useEffect, useState } from "react";
import { useParams, Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowDown, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const formatPrice = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const formatPlain = (n: number) => n.toLocaleString("en-IN");

const Product = () => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const preselectedSize = searchParams.get("size");
  const preselectedColor = searchParams.get("color");
  const [product, setProduct] = useState<Tables<"products"> | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) setNotFound(true);
        setProduct(data ?? null);
        const sizes = data?.sizes ?? [];
        const initial =
          preselectedSize && sizes.includes(preselectedSize as never)
            ? preselectedSize
            : sizes[0] ?? null;
        setSelectedSize(initial);
        const colors = ((data as any)?.colors as string[] | undefined) ?? [];
        const initialColor =
          preselectedColor && colors.includes(preselectedColor)
            ? preselectedColor
            : colors[0] ?? null;
        setSelectedColor(initialColor);
        setLoading(false);
      });
  }, [id, preselectedSize, preselectedColor]);

  if (notFound) return <Navigate to="/" replace />;

  const price = product ? Number(product.price) : 0;
  const original = product?.original_price != null ? Number(product.original_price) : null;
  const hasDiscount = original !== null && original > price;
  const discountPct = hasDiscount ? Math.round(((original! - price) / original!) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <section className="container py-8 md:py-12 flex-1">
        <Link
          to={product ? `/shop/${product.category}` : "/"}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-elegant mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-8 md:gap-14">
            <div className="aspect-[3/4] bg-secondary animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 w-2/3 bg-secondary animate-pulse" />
              <div className="h-6 w-1/3 bg-secondary animate-pulse" />
              <div className="h-24 w-full bg-secondary animate-pulse" />
            </div>
          </div>
        ) : product ? (
          <div className="grid md:grid-cols-2 gap-8 md:gap-14">
            <div className="aspect-[3/4] overflow-hidden bg-secondary">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs uppercase tracking-widest">
                  No image
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <span className="text-[0.7rem] uppercase tracking-[0.3em] text-accent">
                {product.category}
              </span>
              <h1 className="font-display text-3xl md:text-4xl mt-2">{product.name}</h1>

              <div className="flex items-center gap-3 mt-4 flex-wrap">
                <span className="text-2xl font-bold text-foreground">{formatPrice(price)}</span>
                {hasDiscount && (
                  <>
                    <span className="text-base text-muted-foreground line-through">
                      {formatPlain(original!)}
                    </span>
                    <span className="inline-flex items-center text-base font-bold text-[hsl(142_71%_35%)]">
                      <ArrowDown className="h-4 w-4" strokeWidth={3} />
                      {discountPct}% off
                    </span>
                  </>
                )}
              </div>

              {product.description && (
                <p className="text-muted-foreground mt-6 leading-relaxed">{product.description}</p>
              )}

              {product.sizes && product.sizes.length > 0 && (
                <div className="mt-8">
                  <div className="text-[0.7rem] uppercase tracking-[0.3em] text-muted-foreground mb-3">
                    Select size
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`min-w-[3rem] h-11 px-4 border text-sm transition-elegant ${
                          selectedSize === s
                            ? "border-foreground bg-foreground text-background"
                            : "border-border hover:border-foreground"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(((product as any).colors as string[] | undefined) ?? []).length > 0 && (
                <div className="mt-6">
                  <div className="text-[0.7rem] uppercase tracking-[0.3em] text-muted-foreground mb-3">
                    Select color {selectedColor && <span className="ml-2 normal-case tracking-normal text-foreground">— {selectedColor}</span>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(((product as any).colors as string[]) ?? []).map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`h-11 px-4 border text-sm transition-elegant ${
                          selectedColor === c
                            ? "border-foreground bg-foreground text-background"
                            : "border-border hover:border-foreground"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-none px-8 h-12"
                  disabled={!product.in_stock}
                  onClick={() => {
                    if (!product) return;
                    addItem({
                      id: product.id,
                      name: product.name,
                      price: Number(product.price),
                      image_url: product.image_url,
                      size: selectedSize,
                      color: selectedColor,
                    });
                    toast.success("Added to bag");
                  }}
                >
                  {product.in_stock ? "Add to bag" : "Sold out"}
                </Button>
                <Button
                  size="lg"
                  className="rounded-none px-8 h-12"
                  disabled={!product.in_stock}
                  onClick={() => {
                    if (!product) return;
                    addItem({
                      id: product.id,
                      name: product.name,
                      price: Number(product.price),
                      image_url: product.image_url,
                      size: selectedSize,
                      color: selectedColor,
                    });
                    navigate("/checkout");
                  }}
                >
                  Buy now
                </Button>
              </div>

              {!product.in_stock && (
                <p className="text-sm text-muted-foreground mt-3">
                  This piece is currently unavailable.
                </p>
              )}
            </div>
          </div>
        ) : null}
      </section>

      <Footer />
    </div>
  );
};

export default Product;
