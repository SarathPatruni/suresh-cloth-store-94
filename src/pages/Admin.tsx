import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Tables, Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, X } from "lucide-react";

type Product = Tables<"products">;
type Category = Database["public"]["Enums"]["product_category"];
type Size = Database["public"]["Enums"]["product_size"];

const SIZES: Size[] = ["S", "M", "L", "XL", "XXL", "XXXL"];

const empty = {
  name: "", description: "", price: "", category: "men" as Category, image_url: "", in_stock: true, sizes: [] as Size[],
};

const Admin = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts(data ?? []);
    setLoading(false);
  };

  useEffect(() => { if (isAdmin) fetchProducts(); }, [isAdmin]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  if (!user || !isAdmin) return <Navigate to="/admin/login" replace />;

  const openNew = () => { setEditing(null); setForm(empty); setShowForm(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description ?? "", price: String(p.price),
      category: p.category, image_url: p.image_url ?? "", in_stock: p.in_stock,
      sizes: (p.sizes ?? []) as Size[],
    });
    setShowForm(true);
  };

  const toggleSize = (s: Size) =>
    setForm((f) => ({ ...f, sizes: f.sizes.includes(s) ? f.sizes.filter((x) => x !== s) : [...f.sizes, s] }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name, description: form.description || null,
      price: Number(form.price), category: form.category,
      image_url: form.image_url || null, in_stock: form.in_stock,
      sizes: form.sizes,
    };
    const { error } = editing
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Product updated" : "Product added");
    setShowForm(false); fetchProducts();
  };

  const remove = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); fetchProducts();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-12">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-[0.7rem] uppercase tracking-[0.3em] text-accent">Admin</span>
            <h1 className="font-display text-4xl md:text-5xl mt-2">Manage Catalog</h1>
            <p className="text-muted-foreground text-sm mt-1">{products.length} products</p>
          </div>
          <Button onClick={openNew} className="rounded-none"><Plus className="w-4 h-4 mr-1.5" /> Add product</Button>
        </div>

        {showForm && (
          <div className="border border-border bg-card p-6 mb-10 shadow-soft animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display text-2xl">{editing ? "Edit product" : "New product"}</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="w-4 h-4" /></Button>
            </div>
            <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Name</Label>
                <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5" />
              </div>
              <div className="md:col-span-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1.5" rows={2} />
              </div>
              <div>
                <Label>Price (₹)</Label>
                <Input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v: Category) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="men">Men</SelectItem>
                    <SelectItem value="women">Women</SelectItem>
                    <SelectItem value="kids">Kids</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Image URL</Label>
                <Input type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="mt-1.5" placeholder="https://…" />
              </div>
              <div className="md:col-span-2">
                <Label>Available sizes</Label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {SIZES.map((s) => {
                    const active = form.sizes.includes(s);
                    return (
                      <button
                        type="button"
                        key={s}
                        onClick={() => toggleSize(s)}
                        className={`px-3 py-1.5 text-xs uppercase tracking-widest border transition-colors ${
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
              </div>
              <div className="flex items-center gap-3 md:col-span-2">
                <Switch checked={form.in_stock} onCheckedChange={(v) => setForm({ ...form, in_stock: v })} />
                <Label>In stock</Label>
              </div>
              <div className="md:col-span-2 flex gap-2 pt-2">
                <Button type="submit" className="rounded-none">{editing ? "Save changes" : "Add product"}</Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-muted-foreground">Loading…</div>
        ) : (
          <div className="border border-border bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left p-3">Product</th>
                  <th className="text-left p-3">Category</th>
                  <th className="text-left p-3">Price</th>
                  <th className="text-left p-3">Sizes</th>
                  <th className="text-left p-3">Stock</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="p-3 flex items-center gap-3">
                      {p.image_url && <img src={p.image_url} alt="" className="w-10 h-12 object-cover" />}
                      <span className="font-medium">{p.name}</span>
                    </td>
                    <td className="p-3 capitalize">{p.category}</td>
                    <td className="p-3">₹{Number(p.price).toLocaleString("en-IN")}</td>
                    <td className="p-3 text-xs tracking-wider">{p.sizes?.length ? p.sizes.join(", ") : "—"}</td>
                    <td className="p-3">{p.in_stock ? "Yes" : "No"}</td>
                    <td className="p-3 text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(p)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
