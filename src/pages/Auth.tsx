import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { toast } from "sonner";
import { Sparkles, ArrowLeft } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const defaultTab =
    searchParams.get("tab") === "signup"
      ? "signup"
      : "signin";

  // Redirect authenticated users
  useEffect(() => {
    if (!authLoading && user) {
      navigate("/", { replace: true });
    }
  }, [user, authLoading, navigate]);

  // =========================
  // EMAIL SIGN IN
  // =========================
  const handleSignIn = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      const { error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        const msg =
          error.message?.toLowerCase() ?? "";

        if (
          msg.includes("invalid") ||
          msg.includes("credentials")
        ) {
          toast.error(
            "Invalid email or password"
          );
        } else {
          toast.error(error.message);
        }

        return;
      }

      toast.success("Welcome back!");
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      toast.error("Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // EMAIL SIGN UP
  // =========================
  const handleSignUp = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      const { data, error } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo:
              `${window.location.origin}/auth`,
          },
        });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.session) {
        toast.success(
          "Account created successfully"
        );

        navigate("/", {
          replace: true,
        });
      } else {
        toast.success(
          "Check your email to confirm your account"
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to create account");
    } finally {
      setLoading(false);
    }
  };


  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hero-gradient">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-[3px] border-accent/30 border-t-accent rounded-full animate-spin" />

          <p className="text-sm text-muted-foreground">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-hero-gradient">

      <main className="flex-1 container py-8 md:py-10">

        {/* TOP BAR */}
        <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between">

          <Link
            to="/"
            className="flex items-center gap-2"
          >
            <span className="w-10 h-10 rounded-full bg-[hsl(25_25%_10%)] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-accent" />
            </span>

            <div>
              <h1 className="font-display text-2xl">
                Suresh
                <span className="text-accent">
                  .
                </span>
              </h1>

              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Cloth Store
              </p>
            </div>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>

        {/* AUTH CARD */}
        <div className="max-w-md mx-auto bg-card rounded-2xl p-8 shadow-elegant">

          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.3em] text-accent">
              Account
            </p>

            <h2 className="font-display text-3xl mt-2">
              Welcome
            </h2>

            <p className="text-muted-foreground text-sm mt-1">
              Sign in or create your account
            </p>
          </div>

          <Tabs defaultValue={defaultTab}>

            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="signin">
                Sign in
              </TabsTrigger>

              <TabsTrigger value="signup">
                Create account
              </TabsTrigger>
            </TabsList>

            {/* SIGN IN */}
            <TabsContent value="signin">

              <form
                onSubmit={handleSignIn}
                className="space-y-4"
              >
                <div>
                  <Label>Email</Label>

                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Password</Label>

                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    className="mt-1.5"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11"
                  disabled={loading}
                >
                  {loading
                    ? "Signing in..."
                    : "Sign in"}
                </Button>
              </form>

            </TabsContent>

            {/* SIGN UP */}
            <TabsContent value="signup">

              <form
                onSubmit={handleSignUp}
                className="space-y-4"
              >
                <div>
                  <Label>Email</Label>

                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Password</Label>

                  <Input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    className="mt-1.5"
                  />

                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum 6 characters
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11"
                  disabled={loading}
                >
                  {loading
                    ? "Creating..."
                    : "Create account"}
                </Button>
              </form>

            </TabsContent>
          </Tabs>


        </div>
      </main>
    </div>
  );
};

export default Auth;