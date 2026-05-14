import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border/60 mt-24">
    <div className="container py-14 grid gap-10 md:grid-cols-4">
      <div className="md:col-span-2">
        <div className="font-display text-2xl">Suresh<span className="text-accent">.</span> Cloth Store</div>
        <p className="text-sm text-muted-foreground mt-3 max-w-sm leading-relaxed">
          Thoughtfully curated clothing for the modern family. Crafted with care, designed to last.
        </p>
      </div>
      <div>
        <h4 className="text-xs uppercase tracking-[0.2em] mb-4 text-foreground">Shop</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><Link to="/shop/men" className="hover:text-accent transition-elegant">Men</Link></li>
          <li><Link to="/shop/women" className="hover:text-accent transition-elegant">Women</Link></li>
          <li><Link to="/shop/kids" className="hover:text-accent transition-elegant">Kids</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="text-xs uppercase tracking-[0.2em] mb-4 text-foreground">Visit us</h4>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          Main Bazaar Road<br />Open Mon — Sat, 10am — 9pm
        </p>
        <a
          href="https://www.google.com/maps?q=18.480279,83.112672"
          target="_blank"
          rel="noopener noreferrer"
          className="block overflow-hidden rounded-md border border-border/60 hover:border-accent transition-elegant"
          aria-label="Open Suresh Cloth Store location in Google Maps"
        >
          <iframe
            title="Suresh Cloth Store location"
            src="https://www.google.com/maps?q=18.480279,83.112672&z=16&output=embed"
            width="100%"
            height="140"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="block w-full pointer-events-none"
          />
        </a>
      </div>
    </div>
    <div className="border-t border-border/60">
      <div className="container py-5 text-xs text-muted-foreground flex flex-col sm:flex-row justify-between gap-2">
        <span>© {new Date().getFullYear()} Suresh Cloth Store. All rights reserved.</span>
        <span>Crafted with intention.</span>
      </div>
    </div>
  </footer>
);

export default Footer;
