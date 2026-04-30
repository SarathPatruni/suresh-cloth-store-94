import { Link, NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { Lock, LogOut, Search, ShieldCheck, User as UserIcon } from "lucide-react";

const Header = () => {
  const { user, isAdmin, avatarUrl: headerAvatarUrl, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm tracking-wide uppercase transition-elegant hover:text-accent ${
      isActive ? "text-accent" : "text-foreground/80"
    }`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="container flex h-20 items-center gap-6">
        {/* Left: logo + search */}
        <div className="flex items-center gap-5 flex-1 min-w-0">
          <Link to="/" className="shrink-0 flex flex-col justify-center">
            <div className="font-display text-2xl md:text-[1.7rem] leading-none tracking-tight">
              Suresh<span className="text-accent">.</span>
            </div>
            <div className="text-[0.6rem] uppercase tracking-[0.32em] text-muted-foreground mt-1">
              Cloth Store
            </div>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:block relative flex-1 max-w-md min-w-0">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              aria-label="Search products"
              className="pl-10 h-10 rounded-full bg-secondary/60 border-transparent focus-visible:bg-background"
            />
          </form>
        </div>

        {/* Right: nav + auth */}
        <div className="flex items-center gap-7 shrink-0">
          <nav className="hidden lg:flex items-center gap-7">
            <NavLink to="/shop/men" className={navClass}>Men</NavLink>
            <NavLink to="/shop/women" className={navClass}>Women</NavLink>
            <NavLink to="/shop/kids" className={navClass}>Kids</NavLink>
          </nav>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex h-9">
                <Link to="/admin"><ShieldCheck className="w-4 h-4 mr-1.5" /> Admin</Link>
              </Button>
            )}
            {user ? (
              (() => {
                const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
                const name =
                  (meta.full_name as string) ||
                  (meta.name as string) ||
                  (user.email ?? "");
                const avatarUrl = headerAvatarUrl;
                const initial = (name || "U").trim().charAt(0).toUpperCase();
                return (
                  <Link
                    to="/profile"
                    aria-label="View profile"
                    className="rounded-full ring-1 ring-border/60 hover:ring-accent/60 transition-elegant focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <Avatar className="h-9 w-9">
                      {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
                      <AvatarFallback className="bg-accent/15 text-accent font-medium">
                        {initial}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                );
              })()
            ) : (
              <Button asChild size="sm" variant="default" className="h-9 rounded-none px-5">
                <Link to="/auth?tab=signup">Join Us</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search */}
      <form onSubmit={handleSearch} className="md:hidden container pb-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            aria-label="Search products"
            className="pl-10 h-10 rounded-full bg-secondary/60 border-transparent"
          />
        </div>
      </form>

      {/* Mobile sub-nav */}
      <nav className="lg:hidden flex items-center justify-center gap-6 pb-3">
        <NavLink to="/shop/men" className={navClass}>Men</NavLink>
        <NavLink to="/shop/women" className={navClass}>Women</NavLink>
        <NavLink to="/shop/kids" className={navClass}>Kids</NavLink>
      </nav>
    </header>
  );
};

export default Header;
