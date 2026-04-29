import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Sparkles, Truck, ShieldCheck, Heart } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const defaultTab = searchParams.get("tab") === "signup" ? "signup" : "signin";

  useEffect(() => {
    if (!authLoading && user) navigate("/", { replace: true });
  }, [user, authLoading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Welcome back."); navigate("/"); }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Account created. You're signed in."); navigate("/"); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-hero-gradient">
      <Header />
      <main className="flex-1 container py-12 md:py-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Welcome panel */}
          <div className="hidden lg:block relative">
            <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-accent/10 blur-2xl" aria-hidden />
            <div className="absolute bottom-0 right-10 w-32 h-32 rounded-full bg-gold/10 blur-3xl" aria-hidden />

            <div className="relative">
              <span className="inline-flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.3em] text-accent">
                <Sparkles className="w-3.5 h-3.5" /> A warm welcome
              </span>
              <h1 className="font-display text-5xl xl:text-6xl mt-4 leading-[1.05] text-balance">
                Welcome to <span className="italic text-accent">Suresh</span> Cloth Store
              </h1>
              <p className="text-muted-foreground mt-5 text-base leading-relaxed max-w-md">
                Step into timeless style. Enjoy your shopping with us — curated fabrics,
                heritage craftsmanship, and pieces made to feel uniquely yours.
              </p>

              <div className="mt-8 h-px w-16 bg-accent/60" aria-hidden />

              <ul className="mt-8 space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent shrink-0">
                    <Heart className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="font-medium text-foreground">Handpicked collections</p>
                    <p className="text-muted-foreground">Men, Women & Kids — chosen with love.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent shrink-0">
                    <Truck className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="font-medium text-foreground">Smooth, swift delivery</p>
                    <p className="text-muted-foreground">Right to your doorstep, beautifully packed.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="font-medium text-foreground">Safe & secure checkout</p>
                    <p className="text-muted-foreground">Your details stay protected, always.</p>
                  </div>
                </li>
              </ul>

              <p className="mt-10 font-display italic text-2xl text-foreground/80">
                “Wear the story, feel the craft.”
              </p>
            </div>
          </div>

          {/* Form card */}
          <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
            <div className="text-center lg:hidden mb-8">
              <span className="text-[0.7rem] uppercase tracking-[0.3em] text-accent">Welcome</span>
              <h1 className="font-display text-4xl mt-2">Suresh Cloth Store</h1>
              <p className="text-muted-foreground text-sm mt-2 px-2">
                Enjoy your shopping with us — sign in to continue.
              </p>
            </div>

            <div className="border border-border bg-card/95 backdrop-blur p-7 md:p-8 shadow-elegant">
              <div className="hidden lg:block mb-6">
                <span className="text-[0.7rem] uppercase tracking-[0.3em] text-accent">Account</span>
                <h2 className="font-display text-3xl mt-1.5">Glad you're here</h2>
                <p className="text-sm text-muted-foreground mt-1.5">
                  Sign in or create an account to continue.
                </p>
              </div>

              <Tabs defaultValue={defaultTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin">Sign in</TabsTrigger>
                  <TabsTrigger value="signup">Create account</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                      <Label htmlFor="si-email">Email</Label>
                      <Input id="si-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
                    </div>
                    <div>
                      <Label htmlFor="si-password">Password</Label>
                      <Input id="si-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" />
                    </div>
                    <Button type="submit" className="w-full rounded-none h-11" disabled={loading}>
                      {loading ? "Signing in…" : "Sign in"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div>
                      <Label htmlFor="su-email">Email</Label>
                      <Input id="su-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
                    </div>
                    <div>
                      <Label htmlFor="su-password">Password</Label>
                      <Input id="su-password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" />
                      <p className="text-xs text-muted-foreground mt-1.5">At least 6 characters.</p>
                    </div>
                    <Button type="submit" className="w-full rounded-none h-11" disabled={loading}>
                      {loading ? "Creating…" : "Create account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </div>

            <div className="flex items-center justify-between mt-6 text-xs text-muted-foreground">
              <Link to="/" className="hover:text-foreground transition-elegant">← Back to store</Link>
              <Link to="/admin/login" className="hover:text-accent transition-elegant uppercase tracking-[0.2em]">
                Admin access
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
