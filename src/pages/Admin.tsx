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
import { SUBCATEGORIES } from "@/lib/subcategories";

type Product = Tables<"products">;
type Category = Database["public"]["Enums"]["product_category"];
type Size = Database["public"]["Enums"]["product_size"];

const SIZES: Size[] = ["S", "M", "L", "XL", "XXL", "XXXL"];

const defaultSubcategory = (cat: Category) => SUBCATEGORIES[cat]?.[0] ?? "";

const empty = {
  name: "", description: "", price: "", original_price: "", category: "men" as Category, image_url: "", in_stock: true, sizes: [] as Size[], colors: [] as string[], colorInput: "", subcategory: defaultSubcategory("men"),
};

const calcDiscount = (price: number, original?: number | null) => {
  if (!original || original <= price) return 0;
  return Math.round(((original - price) / original) * 100);
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
      original_price: p.original_price != null ? String(p.original_price) : "",
      category: p.category, image_url: p.image_url ?? "", in_stock: p.in_stock,
      sizes: (p.sizes ?? []) as Size[],
      colors: ((p as any).colors ?? []) as string[],
      colorInput: "",
      subcategory: ((p as any).subcategory as string | null) ?? "",
    });
    setShowForm(true);
  };

  const toggleSize = (s: Size) =>
    setForm((f) => ({ ...f, sizes: f.sizes.includes(s) ? f.sizes.filter((x) => x !== s) : [...f.sizes, s] }));

  const addColor = () => {
    const value = form.colorInput.trim();
    if (!value) return;
    setForm((f) => f.colors.some((c) => c.toLowerCase() === value.toLowerCase())
      ? { ...f, colorInput: "" }
      : { ...f, colors: [...f.colors, value], colorInput: "" });
  };
  const removeColor = (c: string) =>
    setForm((f) => ({ ...f, colors: f.colors.filter((x) => x !== c) }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subcategory) {
      return toast.error("Please select a subcategory");
    }
    const payload = {
      name: form.name, description: form.description || null,
      price: Number(form.price),
      original_price: form.original_price ? Number(form.original_price) : null,
      category: form.category,
      image_url: form.image_url || null, in_stock: form.in_stock,
      sizes: form.sizes,
      colors: form.colors,
      subcategory: form.subcategory,
    } as any;
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
                <Label>Offer price (₹)</Label>
                <Input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label>Original price (₹) <span className="text-muted-foreground text-xs">— optional</span></Label>
                <Input type="number" min="0" step="0.01" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} className="mt-1.5" placeholder="MRP before discount" />
                {form.original_price && form.price && Number(form.original_price) > Number(form.price) && (
                  <p className="text-xs text-accent mt-1.5">{calcDiscount(Number(form.price), Number(form.original_price))}% off</p>
                )}
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v: Category) =>
                    setForm({ ...form, category: v, subcategory: defaultSubcategory(v) })
                  }
                >
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="men">Men</SelectItem>
                    <SelectItem value="women">Women</SelectItem>
                    <SelectItem value="kids">Kids</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Subcategory <span className="text-destructive">*</span></Label>
                <Select
                  value={form.subcategory}
                  onValueChange={(v) => setForm({ ...form, subcategory: v })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select a subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBCATEGORIES[form.category]?.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
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
              <div className="md:col-span-2">
                <Label>Available colors</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    value={form.colorInput}
                    onChange={(e) => setForm({ ...form, colorInput: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); addColor(); }
                    }}
                    placeholder="e.g. Black, Navy Blue, Olive"
                  />
                  <Button type="button" variant="outline" className="rounded-none" onClick={addColor}>Add</Button>
                </div>
                {form.colors.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.colors.map((c) => (
                      <span key={c} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs uppercase tracking-widest border border-border bg-background">
                        {c}
                        <button type="button" onClick={() => removeColor(c)} className="text-muted-foreground hover:text-destructive">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
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
                  <th className="text-left p-3">Colors</th>
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
                    <td className="p-3 capitalize">
                      {p.category}
                      {((p as any).subcategory as string | null) && (
                        <span className="block text-xs text-muted-foreground normal-case">{(p as any).subcategory}</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-baseline gap-2">
                        <span className="font-medium">₹{Number(p.price).toLocaleString("en-IN")}</span>
                        {p.original_price && Number(p.original_price) > Number(p.price) && (
                          <>
                            <span className="text-muted-foreground line-through text-xs">₹{Number(p.original_price).toLocaleString("en-IN")}</span>
                            <span className="text-accent text-xs">{calcDiscount(Number(p.price), Number(p.original_price))}% off</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-xs tracking-wider">{p.sizes?.length ? p.sizes.join(", ") : "—"}</td>
                    <td className="p-3 text-xs">{((p as any).colors as string[] | undefined)?.length ? ((p as any).colors as string[]).join(", ") : "—"}</td>
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
