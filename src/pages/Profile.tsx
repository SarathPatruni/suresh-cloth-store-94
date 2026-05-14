import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Camera,
  Loader2,
  LogOut,
  Mail,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

const Profile = () => {
  const { user, loading, avatarUrl, refreshUser, signOut } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

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
  const initial = (firstName || email || "U").trim().charAt(0).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/");
  };

  const handlePick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-pick of same file
    if (!file) return;

    if (!ALLOWED.includes(file.type)) {
      toast.error("Please choose a PNG, JPG or WEBP image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Image must be 5 MB or smaller.");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = `${pub.publicUrl}?t=${Date.now()}`;

      const { error: updErr } = await supabase.auth.updateUser({
        data: { custom_avatar_url: publicUrl, custom_avatar_path: path },
      });
      if (updErr) throw updErr;

      await refreshUser();
      toast.success("Profile photo updated");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    setUploading(true);
    try {
      const path = (meta.custom_avatar_path as string) || "";
      if (path) {
        await supabase.storage.from("avatars").remove([path]);
      }
      const { error } = await supabase.auth.updateUser({
        data: { custom_avatar_url: null, custom_avatar_path: null },
      });
      if (error) throw error;
      await refreshUser();
      toast.success("Profile photo removed");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not remove photo";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const hasCustom = Boolean(meta.custom_avatar_url);

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

          <div
            className="relative rounded-[1.5rem] p-[1.5px]"
            style={{
              background:
                "linear-gradient(135deg, hsl(14 75% 60% / 0.9), hsl(38 60% 60% / 0.5) 45%, hsl(14 75% 60% / 0.9))",
            }}
          >
            <div className="rounded-[calc(1.5rem-1.5px)] bg-card/90 backdrop-blur-md p-8 md:p-10">
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <Avatar className="h-28 w-28 ring-2 ring-accent/40 shadow-elegant">
                    {avatarUrl ? <AvatarImage src={avatarUrl} alt={firstName} /> : null}
                    <AvatarFallback className="bg-accent/15 text-accent text-3xl font-semibold">
                      {initial}
                    </AvatarFallback>
                  </Avatar>

                  <button
                    type="button"
                    onClick={handlePick}
                    disabled={uploading}
                    aria-label="Change profile photo"
                    className="absolute -bottom-1 -right-1 inline-flex items-center justify-center h-9 w-9 rounded-full bg-accent text-accent-foreground shadow-elegant ring-2 ring-card hover:scale-105 transition-elegant disabled:opacity-60"
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <h1 className="font-display text-3xl md:text-4xl mt-5">
                  Hi, {firstName}
                </h1>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mt-2">
                  Your profile
                </p>

                {hasCustom && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemove}
                    disabled={uploading}
                    className="mt-4 gap-2 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" /> Remove photo
                  </Button>
                )}
                <p className="text-[0.7rem] text-muted-foreground mt-2">
                  Tap the camera to use your camera or choose a file · PNG, JPG, WEBP · up to 5 MB
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
