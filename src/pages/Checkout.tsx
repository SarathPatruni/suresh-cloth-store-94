import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cartItemKey, useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const formatPrice = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const shippingSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(100),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(20)
    .regex(/^[0-9+\-\s()]+$/, "Phone can only contain digits"),
  address_line1: z.string().trim().min(3, "Address is required").max(200),
  address_line2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(2, "City is required").max(100),
  state: z.string().trim().min(2, "State is required").max(100),
  postal_code: z
    .string()
    .trim()
    .min(4, "Postal code is required")
    .max(12)
    .regex(/^[A-Za-z0-9\s-]+$/, "Invalid postal code"),
  country: z.string().trim().min(2).max(60),
});

const Checkout = () => {
  const { user, loading: authLoading } = useAuth();
  const { items, subtotal, updateQty, removeItem, clear } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
  });

  if (!authLoading && !user) {
    return <Navigate to="/auth?redirect=/checkout" replace />;
  }

  const shipping = items.length > 0 ? (subtotal >= 999 ? 0 : 79) : 0;
  const total = subtotal + shipping;

  const handleChange = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handlePlaceOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    const parsed = shippingSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your details");
      return;
    }
    if (!user) return;
    setSubmitting(true);
    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        items: items as unknown as never,
        ...parsed.data,
        subtotal,
        total,
        status: "pending",
      })
      .select("id")
      .single();
    setSubmitting(false);
    if (error) {
      toast.error(error.message ?? "Could not place order");
      return;
    }
    clear();
    toast.success("Order placed successfully");
    navigate(`/profile?order=${data?.id ?? ""}`, { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <section className="container py-8 md:py-12 flex-1">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-elegant mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Continue shopping
        </Link>

        <h1 className="font-display text-3xl md:text-4xl mb-8">Checkout</h1>

        {items.length === 0 ? (
          <div className="text-center py-20 border border-border/60">
            <p className="text-muted-foreground mb-6">Your cart is empty.</p>
            <Button asChild className="rounded-none">
              <Link to="/">Browse products</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="grid lg:grid-cols-[1fr_400px] gap-10">
            {/* Items + Shipping */}
            <div className="space-y-10">
              <div>
                <h2 className="text-[0.7rem] uppercase tracking-[0.3em] text-muted-foreground mb-4">
                  Review items ({items.length})
                </h2>
                <ul className="divide-y divide-border/60 border border-border/60">
                  {items.map((it) => {
                    const k = cartItemKey(it);
                    return (
                      <li key={k} className="flex gap-4 p-4">
                        <div className="w-20 h-24 bg-secondary shrink-0 overflow-hidden">
                          {it.image_url ? (
                            <img src={it.image_url} alt={it.name} className="w-full h-full object-cover" />
                          ) : null}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-display text-base leading-tight truncate">{it.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {[it.size, it.color].filter(Boolean).join(" · ") || "—"}
                          </div>
                          <div className="mt-3 flex items-center gap-3">
                            <div className="inline-flex items-center border border-border">
                              <button
                                type="button"
                                aria-label="Decrease quantity"
                                onClick={() => updateQty(k, it.quantity - 1)}
                                className="h-8 w-8 inline-flex items-center justify-center hover:bg-secondary"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-8 text-center text-sm">{it.quantity}</span>
                              <button
                                type="button"
                                aria-label="Increase quantity"
                                onClick={() => updateQty(k, it.quantity + 1)}
                                className="h-8 w-8 inline-flex items-center justify-center hover:bg-secondary"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(k)}
                              className="text-xs text-muted-foreground hover:text-destructive inline-flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remove
                            </button>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-bold">{formatPrice(it.price * it.quantity)}</div>
                          <div className="text-xs text-muted-foreground mt-1">{formatPrice(it.price)} each</div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div>
                <h2 className="text-[0.7rem] uppercase tracking-[0.3em] text-muted-foreground mb-4">
                  Shipping details
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label htmlFor="full_name">Full name</Label>
                    <Input id="full_name" value={form.full_name} onChange={handleChange("full_name")} required maxLength={100} />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={form.phone} onChange={handleChange("phone")} required inputMode="tel" maxLength={20} />
                  </div>
                  <div>
                    <Label htmlFor="postal_code">Postal code</Label>
                    <Input id="postal_code" value={form.postal_code} onChange={handleChange("postal_code")} required maxLength={12} />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="address_line1">Address</Label>
                    <Input id="address_line1" value={form.address_line1} onChange={handleChange("address_line1")} required maxLength={200} />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="address_line2">Apartment, suite (optional)</Label>
                    <Input id="address_line2" value={form.address_line2} onChange={handleChange("address_line2")} maxLength={200} />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={form.city} onChange={handleChange("city")} required maxLength={100} />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input id="state" value={form.state} onChange={handleChange("state")} required maxLength={100} />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" value={form.country} onChange={handleChange("country")} required maxLength={60} />
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <aside className="lg:sticky lg:top-28 h-fit border border-border/60 p-6 space-y-4">
              <h2 className="text-[0.7rem] uppercase tracking-[0.3em] text-muted-foreground">
                Order summary
              </h2>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
              </div>
              <div className="border-t border-border/60 pt-4 flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="w-full rounded-none h-12"
              >
                {submitting ? "Placing order…" : "Place order"}
              </Button>
              <p className="text-xs text-muted-foreground">
                By placing your order you agree to our terms. Cash on delivery only at this time.
              </p>
            </aside>
          </form>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Checkout;
