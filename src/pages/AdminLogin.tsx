import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShieldCheck, Lock } from "lucide-react";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // If already signed in as admin, send to dashboard
  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      navigate("/admin", { replace: true });
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !signInData.user) {
      setLoading(false);
      toast.error(error?.message ?? "Sign in failed");
      return;
    }

    // Verify admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", signInData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      await supabase.auth.signOut();
      setLoading(false);
      toast.error("This account does not have admin access.");
      return;
    }

    setLoading(false);
    toast.success("Welcome back, admin.");
    navigate("/admin", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/40 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-foreground text-background mb-5">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <span className="text-[0.7rem] uppercase tracking-[0.3em] text-accent">Restricted</span>
          <h1 className="font-display text-4xl mt-2">Admin Portal</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Authorized personnel only. Sign in to manage the catalog.
          </p>
        </div>

        <div className="border border-border bg-card p-7 shadow-soft">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="admin-email">Admin email</Label>
              <Input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <Button type="submit" className="w-full rounded-none h-11" disabled={loading}>
              <Lock className="w-4 h-4 mr-2" />
              {loading ? "Verifying…" : "Sign in to admin"}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-5 leading-relaxed">
            Non-admin accounts will be denied access automatically.
          </p>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6 space-x-3">
          <Link to="/" className="hover:text-foreground transition-elegant">← Back to store</Link>
          <span className="text-border">•</span>
          <Link to="/auth" className="hover:text-foreground transition-elegant">Customer sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
