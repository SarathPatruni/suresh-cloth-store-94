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
          <li>Men</li><li>Women</li><li>Kids</li>
        </ul>
      </div>
      <div>
        <h4 className="text-xs uppercase tracking-[0.2em] mb-4 text-foreground">Visit us</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Main Bazaar Road<br />Open Mon — Sat, 10am — 9pm
        </p>
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
