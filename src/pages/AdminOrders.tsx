import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, Eye } from "lucide-react";

type Order = Tables<"orders">;
type OrderItem = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  size: string | null;
  color: string | null;
  quantity: number;
};

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;
type Status = (typeof STATUSES)[number];

const statusClass: Record<string, string> = {
  pending: "bg-secondary text-foreground",
  processing: "bg-accent/20 text-accent-foreground",
  shipped: "bg-primary/15 text-primary",
  delivered: "bg-green-500/15 text-green-700 dark:text-green-400",
  cancelled: "bg-destructive/15 text-destructive",
};

const formatPrice = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;
const formatDate = (s: string) =>
  new Date(s).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

const AdminOrders = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);
  const [filter, setFilter] = useState<"all" | Status>("all");

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setOrders(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchOrders();
  }, [isAdmin]);

  if (authLoading)
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  if (!user || !isAdmin) return <Navigate to="/admin/login" replace />;

  const updateStatus = async (id: string, status: Status) => {
    const prev = orders;
    setOrders((os) => os.map((o) => (o.id === id ? { ...o, status } : o)));
    if (selected?.id === id) setSelected({ ...selected, status });
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) {
      setOrders(prev);
      toast.error(error.message);
    } else {
      toast.success(`Order marked ${status}`);
    }
  };

  const visible = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const items = (o: Order): OrderItem[] => (Array.isArray(o.items) ? (o.items as unknown as OrderItem[]) : []);
  const itemCount = (o: Order) => items(o).reduce((s, i) => s + (i.quantity ?? 0), 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-12">
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to catalog
        </Link>

        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-[0.7rem] uppercase tracking-[0.3em] text-accent">Admin</span>
            <h1 className="font-display text-4xl md:text-5xl mt-2">Orders</h1>
            <p className="text-muted-foreground text-sm mt-1">{orders.length} total</p>
          </div>
          <div className="w-48">
            <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="text-muted-foreground">Loading…</div>
        ) : visible.length === 0 ? (
          <div className="border border-border bg-card p-10 text-center text-muted-foreground">
            No orders found.
          </div>
        ) : (
          <div className="border border-border bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left p-3">Order</th>
                  <th className="text-left p-3">Customer</th>
                  <th className="text-left p-3">Items</th>
                  <th className="text-left p-3">Total</th>
                  <th className="text-left p-3">Placed</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((o) => (
                  <tr key={o.id} className="border-t border-border align-top">
                    <td className="p-3 font-mono text-xs">#{o.id.slice(0, 8)}</td>
                    <td className="p-3">
                      <div className="font-medium">{o.full_name}</div>
                      <div className="text-xs text-muted-foreground">{o.phone}</div>
                    </td>
                    <td className="p-3">{itemCount(o)}</td>
                    <td className="p-3 font-medium">{formatPrice(Number(o.total))}</td>
                    <td className="p-3 text-xs text-muted-foreground">{formatDate(o.created_at)}</td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-1 text-[0.65rem] uppercase tracking-widest ${statusClass[o.status] ?? "bg-secondary"}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v as Status)}>
                          <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((s) => (
                              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" onClick={() => setSelected(o)} aria-label="View details">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">
                  Order #{selected.id.slice(0, 8)}
                </DialogTitle>
                <p className="text-xs text-muted-foreground">{formatDate(selected.created_at)}</p>
              </DialogHeader>

              <div className="grid sm:grid-cols-2 gap-6 mt-4">
                <div>
                  <h3 className="text-[0.7rem] uppercase tracking-[0.3em] text-muted-foreground mb-2">Customer</h3>
                  <div className="text-sm">
                    <div className="font-medium">{selected.full_name}</div>
                    <div className="text-muted-foreground">{selected.phone}</div>
                  </div>
                </div>
                <div>
                  <h3 className="text-[0.7rem] uppercase tracking-[0.3em] text-muted-foreground mb-2">Shipping address</h3>
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    {selected.address_line1}
                    {selected.address_line2 ? <>, {selected.address_line2}</> : null}
                    <br />
                    {selected.city}, {selected.state} {selected.postal_code}
                    <br />
                    {selected.country}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-[0.7rem] uppercase tracking-[0.3em] text-muted-foreground mb-3">Items</h3>
                <ul className="divide-y divide-border border border-border">
                  {items(selected).map((it, idx) => (
                    <li key={`${it.id}-${idx}`} className="flex gap-3 p-3">
                      <div className="w-14 h-16 bg-secondary shrink-0 overflow-hidden">
                        {it.image_url ? (
                          <img src={it.image_url} alt={it.name} className="w-full h-full object-cover" />
                        ) : null}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{it.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {[it.size, it.color].filter(Boolean).join(" · ") || "—"}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Qty {it.quantity} × {formatPrice(it.price)}
                        </div>
                      </div>
                      <div className="text-right text-sm font-medium">
                        {formatPrice(it.price * it.quantity)}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 border border-border p-4 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatPrice(Number(selected.subtotal))}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>{formatPrice(Number(selected.total) - Number(selected.subtotal))}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t border-border">
                  <span>Total</span>
                  <span>{formatPrice(Number(selected.total))}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <span className="text-[0.7rem] uppercase tracking-[0.3em] text-muted-foreground">Status</span>
                <Select value={selected.status} onValueChange={(v) => updateStatus(selected.id, v as Status)}>
                  <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AdminOrders;
