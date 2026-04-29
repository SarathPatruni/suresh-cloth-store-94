import { Link, NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { Lock, LogOut, Search, ShieldCheck, User as UserIcon } from "lucide-react";

const Header = () => {
  const { user, isAdmin, signOut } = useAuth();
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
      <div className="container grid h-20 grid-cols-2 items-center gap-6 lg:grid-cols-[auto_1fr_auto]">
        {/* Logo */}
        <Link to="/" className="group shrink-0 flex flex-col justify-center">
          <div className="font-display text-2xl md:text-[1.7rem] leading-none tracking-tight">
            Suresh<span className="text-accent">.</span>
          </div>
          <div className="text-[0.6rem] uppercase tracking-[0.32em] text-muted-foreground mt-1">
            Cloth Store
          </div>
        </Link>

        {/* Center: nav + search */}
        <div className="hidden lg:flex items-center justify-center gap-6 min-w-0">
          <nav className="flex items-center gap-7 shrink-0">
            <NavLink to="/shop/men" className={navClass}>Men</NavLink>
            <NavLink to="/shop/women" className={navClass}>Women</NavLink>
            <NavLink to="/shop/kids" className={navClass}>Kids</NavLink>
          </nav>
          <span className="h-5 w-px bg-border/80" aria-hidden />
          <form onSubmit={handleSearch} className="relative flex-1 max-w-md min-w-0">
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

        {/* Right: actions */}
        <div className="flex items-center justify-end gap-1.5 shrink-0">
          {isAdmin ? (
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex h-9">
              <Link to="/admin"><ShieldCheck className="w-4 h-4 mr-1.5" /> Admin</Link>
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex h-9 text-muted-foreground hover:text-foreground">
              <Link to="/admin/login"><ShieldCheck className="w-4 h-4 mr-1.5" /> Admin</Link>
            </Button>
          )}
          {user ? (
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="h-9">
              <LogOut className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          ) : (
            <Button asChild size="sm" variant="default" className="h-9">
              <Link to="/auth"><UserIcon className="w-4 h-4 sm:mr-1.5" /> <span className="hidden sm:inline">Sign in</span></Link>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile search */}
      <form onSubmit={handleSearch} className="md:hidden container pb-3 relative">
        <Search className="w-4 h-4 absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products…"
          aria-label="Search products"
          className="pl-9 h-10 rounded-full bg-secondary/60 border-transparent"
        />
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
