import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, ShieldCheck, User as UserIcon } from "lucide-react";

const Header = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm tracking-wide uppercase transition-elegant hover:text-accent ${
      isActive ? "text-accent" : "text-foreground/80"
    }`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="container flex h-20 items-center justify-between gap-4">
        <Link to="/" className="group">
          <div className="font-display text-2xl md:text-[1.7rem] leading-none tracking-tight">
            Suresh<span className="text-accent">.</span>
          </div>
          <div className="text-[0.62rem] uppercase tracking-[0.3em] text-muted-foreground mt-0.5">
            Cloth Store
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <NavLink to="/shop/men" className={navClass}>Men</NavLink>
          <NavLink to="/shop/women" className={navClass}>Women</NavLink>
          <NavLink to="/shop/kids" className={navClass}>Kids</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/admin"><ShieldCheck className="w-4 h-4 mr-1.5" /> Admin</Link>
            </Button>
          )}
          {user ? (
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          ) : (
            <Button asChild size="sm" variant="default">
              <Link to="/auth"><UserIcon className="w-4 h-4 sm:mr-1.5" /> <span className="hidden sm:inline">Sign in</span></Link>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile sub-nav */}
      <nav className="md:hidden flex items-center justify-center gap-6 pb-3 -mt-1">
        <NavLink to="/shop/men" className={navClass}>Men</NavLink>
        <NavLink to="/shop/women" className={navClass}>Women</NavLink>
        <NavLink to="/shop/kids" className={navClass}>Kids</NavLink>
      </nav>
    </header>
  );
};

export default Header;
