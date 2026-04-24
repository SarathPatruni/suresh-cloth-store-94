import { ArrowDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;

const formatPrice = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const formatPlain = (n: number) => n.toLocaleString("en-IN");

const ProductCard = ({ product }: { product: Product }) => {
  const navigate = useNavigate();
  const price = Number(product.price);
  const original = product.original_price != null ? Number(product.original_price) : null;
  const hasDiscount = original !== null && original > price;
  const discountPct = hasDiscount ? Math.round(((original! - price) / original!) * 100) : 0;

  const handleSizeClick = (e: React.MouseEvent, size: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/product/${product.id}?size=${encodeURIComponent(size)}`);
  };

  return (
    <Link to={`/product/${product.id}`} className="group cursor-pointer block">
      <div className="aspect-[3/4] overflow-hidden bg-secondary relative">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-elegant group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs uppercase tracking-widest">
            No image
          </div>
        )}
        {!product.in_stock && (
          <div className="absolute top-3 left-3 bg-background/90 px-2.5 py-1 text-[0.65rem] uppercase tracking-widest">
            Sold out
          </div>
        )}
      </div>
      <div className="pt-4">
        <h3 className="font-display text-lg leading-tight">{product.name}</h3>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {hasDiscount ? (
            <>
              <span className="text-base font-bold text-foreground">{formatPrice(price)}</span>
              <span className="text-sm text-muted-foreground line-through">{formatPlain(original!)}</span>
              <span className="inline-flex items-center text-sm font-bold text-[hsl(142_71%_35%)]">
                <ArrowDown className="h-4 w-4" strokeWidth={3} />
                {discountPct}%
              </span>
            </>
          ) : (
            <span className="text-base font-bold text-foreground">{formatPrice(price)}</span>
          )}
        </div>
        {product.sizes && product.sizes.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={(e) => handleSizeClick(e, s)}
                className="min-w-[2rem] h-7 px-2 border border-border text-[0.7rem] uppercase tracking-wider hover:border-foreground hover:bg-foreground hover:text-background transition-elegant"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
