import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Footer from "@/components/Footer";
import { Sparkles } from "lucide-react";

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
    if (error) {
      const msg = error.message?.toLowerCase() ?? "";
      if (msg.includes("invalid") || msg.includes("credentials") || msg.includes("not found")) {
        toast.error("Create the account first, then login.");
      } else {
        toast.error(error.message);
      }
    } else { toast.success("Welcome back."); navigate("/"); }
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
      
      <main className="flex-1 container py-12 md:py-16">
        {/* Outer glowing wrapper */}
        <div className="relative max-w-6xl mx-auto">
          {/* Glow halo */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-1 rounded-[1.75rem] blur-2xl opacity-70"
            style={{
              background:
                "linear-gradient(135deg, hsl(14 75% 55% / 0.55), hsl(38 60% 55% / 0.35) 50%, hsl(14 75% 55% / 0.55))",
            }}
          />
          {/* Gradient border via padding trick */}
          <div
            className="relative rounded-[1.5rem] p-[1.5px]"
            style={{
              background:
                "linear-gradient(135deg, hsl(14 75% 60% / 0.9), hsl(38 60% 60% / 0.5) 45%, hsl(14 75% 60% / 0.9))",
            }}
          >
            <div className="rounded-[calc(1.5rem-1.5px)] bg-background/95 backdrop-blur-md p-4 md:p-6">
              <div className="grid lg:grid-cols-2 gap-4 lg:gap-5 items-stretch">
                {/* Welcome panel — dark glowing hero card */}
                <div className="hidden lg:block">
                  <div className="relative overflow-hidden rounded-2xl bg-[hsl(25_25%_10%)] text-[hsl(38_30%_94%)] p-10 xl:p-12 h-full min-h-[640px] shadow-elegant">
              {/* Glow gradient */}
              <div
                aria-hidden
                className="absolute -top-32 left-1/2 -translate-x-1/2 w-[120%] h-[420px] rounded-full blur-3xl opacity-80"
                style={{ background: "radial-gradient(closest-side, hsl(14 75% 55% / 0.55), hsl(38 60% 50% / 0.25), transparent 70%)" }}
              />
              <div
                aria-hidden
                className="absolute bottom-0 right-0 w-[280px] h-[280px] rounded-full blur-3xl opacity-50"
                style={{ background: "radial-gradient(closest-side, hsl(38 60% 55% / 0.4), transparent 70%)" }}
              />

              {/* Subtle grid sparkle */}
              <div aria-hidden className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />

              <div className="relative">
                <div className="flex items-center gap-2 text-[hsl(38_30%_94%)]">
                  <Sparkles className="w-5 h-5 text-[hsl(14_75%_65%)]" />
                  <span className="font-display text-2xl tracking-tight">Suresh<span className="text-[hsl(14_75%_65%)]">.</span></span>
                </div>

                <h2 className="font-display text-4xl xl:text-5xl mt-10 leading-[1.05] text-balance">
                  Welcome to <span className="italic">Suresh Cloth Store</span>
                </h2>
                <p className="mt-4 text-sm xl:text-base text-[hsl(38_30%_94%/0.7)] max-w-sm">
                  Enjoy your shopping with us — a few easy steps to begin your journey.
                </p>

                {/* Steps timeline */}
                <ol className="relative mt-12 space-y-4 pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-[hsl(38_30%_94%/0.18)]">
                  {[
                    { icon: "🛍️", title: "Sign up your account", desc: "Quick & easy — just an email and password." },
                    { icon: "✨", title: "Explore the collection", desc: "Men, Women & Kids — handpicked with love." },
                    { icon: "🎁", title: "Shop with positive vibes", desc: "Smooth checkout, secure & beautifully packed." },
                  ].map((s, i) => (
                    <li key={i} className="relative">
                      <span className="absolute -left-6 top-4 w-3 h-3 rounded-full bg-[hsl(14_75%_60%)] ring-4 ring-[hsl(25_25%_10%)]" />
                      <div className="rounded-lg bg-[hsl(38_30%_94%/0.06)] border border-[hsl(38_30%_94%/0.1)] backdrop-blur-sm px-4 py-3.5">
                        <p className="font-medium flex items-center gap-2 text-[hsl(38_30%_94%)]">
                          <span aria-hidden>{s.icon}</span> {s.title}
                        </p>
                        <p className="text-xs mt-1 text-[hsl(38_30%_94%/0.65)]">{s.desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>

                <p className="mt-10 font-display italic text-xl text-[hsl(38_30%_94%/0.8)]">
                  “Wear the story, feel the craft.”
                </p>
              </div>
            </div>
          </div>

          {/* Form card */}
          <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto h-full flex flex-col justify-center lg:py-10">
            <div className="text-center lg:hidden mb-8">
              <span className="text-[0.7rem] uppercase tracking-[0.3em] text-accent">Welcome</span>
              <h1 className="font-display text-4xl mt-2">Suresh Cloth Store</h1>
              <p className="text-muted-foreground text-sm mt-2 px-2">
                Enjoy your shopping with us — sign in to continue.
              </p>
            </div>

            <div className="bg-card/80 backdrop-blur p-7 md:p-8 rounded-xl">
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
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
