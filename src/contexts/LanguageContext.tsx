import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "en" | "te";

type Ctx = {
  lang: Lang;
  toggle: () => void;
  setLang: (l: Lang) => void;
};

const LanguageContext = createContext<Ctx | undefined>(undefined);

// English -> Telugu dictionary. Lookup is case-insensitive on trimmed text.
const DICT: Record<string, string> = {
  // Header / nav
  "Men": "పురుషులు",
  "Women": "మహిళలు",
  "Kids": "పిల్లలు",
  "Search products…": "ఉత్పత్తులను శోధించండి…",
  "Search products...": "ఉత్పత్తులను శోధించండి…",
  "Join Us": "మాతో చేరండి",
  "Admin": "నిర్వాహకుడు",
  "Sign out": "సైన్ అవుట్",
  "Cloth Store": "క్లాత్ స్టోర్",

  // Hero / home
  "Spring Edit · 2026": "స్ప్రింగ్ ఎడిట్ · 2026",
  "Threads woven with": "ఉద్దేశంతో అల్లిన దారాలు",
  "intention.": "ఉద్దేశం.",
  "Suresh Cloth Store brings together craftsmanship and quiet luxury for men, women and the little ones — all under one warm roof.":
    "సురేష్ క్లాత్ స్టోర్ పురుషులు, మహిళలు మరియు పిల్లల కోసం హస్తకళ మరియు నిశ్శబ్ద విలాసాలను ఒకే వెచ్చని పైకప్పు క్రింద తీసుకువస్తుంది.",
  "Explore the collection": "సేకరణను అన్వేషించండి",
  "Shop menswear": "పురుషుల వస్త్రాలు",
  "Since": "నుండి",
  "Shop by": "ద్వారా షాపింగ్",
  "Our Collections": "మా సేకరణలు",
  "Just in": "కొత్తగా వచ్చినవి",
  "New arrivals": "కొత్త రాకలు",
  "Our story": "మా కథ",
  "Three generations of dressing the family.": "కుటుంబాన్ని ధరింపజేస్తున్న మూడు తరాలు.",
  "What began as a single shop on Main Bazaar Road has grown into a beloved local destination for thoughtfully made clothing — without ever losing the warmth of being family run.":
    "మెయిన్ బజార్ రోడ్‌లో ఒకే దుకాణంగా ప్రారంభమైనది, కుటుంబ నిర్వహణలోని వెచ్చదనాన్ని కోల్పోకుండా, ఆలోచనతో తయారు చేసిన దుస్తుల కోసం ఒక ప్రియమైన స్థానిక గమ్యంగా ఎదిగింది.",
  "Drape & flow": "డ్రేప్ & ఫ్లో",
  "Tailored essentials": "టైలర్ చేసిన అవసరాలు",
  "Little wonders": "చిన్న అద్భుతాలు",

  // Profile
  "Back to home": "హోమ్‌కు తిరిగి",
  "Your profile": "మీ ప్రొఫైల్",
  "Remove photo": "ఫోటోను తీసివేయండి",
  "First name": "మొదటి పేరు",
  "Email": "ఇమెయిల్",
  "Hi,": "నమస్తే,",

  // Auth / common
  "Sign in": "సైన్ ఇన్",
  "Sign up": "సైన్ అప్",
  "Log in": "లాగిన్",
  "Login": "లాగిన్",
  "Continue with Google": "గూగుల్‌తో కొనసాగండి",
  "Password": "పాస్‌వర్డ్",
  "Full name": "పూర్తి పేరు",
  "Create account": "ఖాతా సృష్టించండి",
  "Loading…": "లోడ్ అవుతోంది…",
  "Loading...": "లోడ్ అవుతోంది…",

  // Footer common
  "All rights reserved.": "అన్ని హక్కులు రిజర్వ్ చేయబడ్డాయి.",
  "Contact": "సంప్రదించండి",
  "About": "మా గురించి",
  "Shop": "షాప్",
  "Home": "హోమ్",
};

const ATTRS = ["placeholder", "aria-label", "title", "alt"] as const;

const ORIG_TEXT = new WeakMap<Text, string>();
const ORIG_ATTR = new WeakMap<Element, Map<string, string>>();

function translateString(value: string): string | null {
  // Preserve leading/trailing whitespace
  const match = value.match(/^(\s*)([\s\S]*?)(\s*)$/);
  if (!match) return null;
  const [, lead, core, trail] = match;
  if (!core) return null;
  const hit = DICT[core] ?? DICT[core.replace(/\s+/g, " ")];
  if (!hit) return null;
  return lead + hit + trail;
}

function applyToTextNode(node: Text, lang: Lang) {
  if (lang === "en") {
    const orig = ORIG_TEXT.get(node);
    if (orig !== undefined && node.nodeValue !== orig) node.nodeValue = orig;
    return;
  }
  const original = ORIG_TEXT.get(node) ?? node.nodeValue ?? "";
  if (!ORIG_TEXT.has(node)) ORIG_TEXT.set(node, original);
  const translated = translateString(original);
  if (translated !== null && node.nodeValue !== translated) {
    node.nodeValue = translated;
  }
}

function applyToElementAttrs(el: Element, lang: Lang) {
  for (const attr of ATTRS) {
    const current = el.getAttribute(attr);
    if (current === null && !ORIG_ATTR.get(el)?.has(attr)) continue;

    if (lang === "en") {
      const map = ORIG_ATTR.get(el);
      const orig = map?.get(attr);
      if (orig !== undefined && el.getAttribute(attr) !== orig) {
        el.setAttribute(attr, orig);
      }
      continue;
    }
    const map = ORIG_ATTR.get(el) ?? new Map<string, string>();
    if (!map.has(attr) && current !== null) map.set(attr, current);
    ORIG_ATTR.set(el, map);
    const source = map.get(attr) ?? current ?? "";
    const translated = translateString(source);
    if (translated !== null && el.getAttribute(attr) !== translated) {
      el.setAttribute(attr, translated);
    }
  }
}

function shouldSkip(node: Node): boolean {
  let p: Node | null = node;
  while (p) {
    if (p.nodeType === Node.ELEMENT_NODE) {
      const tag = (p as Element).tagName;
      if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") return true;
      if ((p as Element).hasAttribute?.("data-no-translate")) return true;
    }
    p = p.parentNode;
  }
  return false;
}

function walk(root: Node, lang: Lang) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let cur: Node | null = walker.currentNode;
  // Visit root itself if it's an element
  if (root.nodeType === Node.ELEMENT_NODE && !shouldSkip(root)) {
    applyToElementAttrs(root as Element, lang);
  }
  while ((cur = walker.nextNode())) {
    if (shouldSkip(cur)) continue;
    if (cur.nodeType === Node.TEXT_NODE) {
      applyToTextNode(cur as Text, lang);
    } else if (cur.nodeType === Node.ELEMENT_NODE) {
      applyToElementAttrs(cur as Element, lang);
    }
  }
}

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    const saved = window.localStorage.getItem("app_lang");
    return saved === "te" ? "te" : "en";
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem("app_lang", l);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    setLang(lang === "en" ? "te" : "en");
  }, [lang, setLang]);

  // Apply translation on lang change and observe DOM mutations
  useEffect(() => {
    document.documentElement.lang = lang === "te" ? "te" : "en";
    walk(document.body, lang);

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "childList") {
          m.addedNodes.forEach((n) => {
            if (shouldSkip(n)) return;
            if (n.nodeType === Node.TEXT_NODE) applyToTextNode(n as Text, lang);
            else if (n.nodeType === Node.ELEMENT_NODE) walk(n, lang);
          });
        } else if (m.type === "characterData" && m.target.nodeType === Node.TEXT_NODE) {
          if (!shouldSkip(m.target)) applyToTextNode(m.target as Text, lang);
        } else if (m.type === "attributes" && m.target.nodeType === Node.ELEMENT_NODE) {
          if (!shouldSkip(m.target)) applyToElementAttrs(m.target as Element, lang);
        }
      }
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...ATTRS],
    });

    return () => observer.disconnect();
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, toggle, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
};
