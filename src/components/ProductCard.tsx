import { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;

const formatPrice = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const ProductCard = ({ product }: { product: Product }) => (
  <article className="group cursor-pointer">
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
      <p className="text-sm text-muted-foreground mt-1">{formatPrice(Number(product.price))}</p>
    </div>
  </article>
);

export default ProductCard;
