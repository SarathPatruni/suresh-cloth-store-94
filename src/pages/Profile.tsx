import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut, Mail, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/auth", { replace: true });
  }, [user, loading, navigate]);

  if (!user) return null;

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const email = user.email ?? "";
  const fullName =
    (meta.full_name as string) || (meta.name as string) || "";
  const firstName =
    (meta.given_name as string) ||
    (fullName ? fullName.split(" ")[0] : "") ||
    (email ? email.split("@")[0] : "User");
  const avatarUrl =
    (meta.avatar_url as string) || (meta.picture as string) || "";
  const initial = (firstName || email || "U").trim().charAt(0).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-hero-gradient">
      <Header />
      <main className="flex-1 container py-10 md:py-14">
        <div className="max-w-2xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-elegant mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>

          <div className="relative rounded-[1.5rem] p-[1.5px]"
            style={{
              background:
                "linear-gradient(135deg, hsl(14 75% 60% / 0.9), hsl(38 60% 60% / 0.5) 45%, hsl(14 75% 60% / 0.9))",
            }}
          >
            <div className="rounded-[calc(1.5rem-1.5px)] bg-card/90 backdrop-blur-md p-8 md:p-10">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-28 w-28 ring-2 ring-accent/40 shadow-elegant">
                  {avatarUrl ? <AvatarImage src={avatarUrl} alt={firstName} /> : null}
                  <AvatarFallback className="bg-accent/15 text-accent text-3xl font-semibold">
                    {initial}
                  </AvatarFallback>
                </Avatar>

                <h1 className="font-display text-3xl md:text-4xl mt-5">
                  Hi, {firstName}
                </h1>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mt-2">
                  Your profile
                </p>
              </div>

              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/40 px-4 py-3">
                  <UserIcon className="w-4 h-4 text-accent shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
                      First name
                    </p>
                    <p className="text-sm truncate">{firstName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/40 px-4 py-3">
                  <Mail className="w-4 h-4 text-accent shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
                      Email
                    </p>
                    <p className="text-sm truncate">{email}</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSignOut}
                variant="destructive"
                className="w-full h-11 mt-8 gap-2"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
