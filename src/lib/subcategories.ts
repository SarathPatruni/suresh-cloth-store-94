// Subcategory options per main category. Admin can also type a custom value.
export const SUBCATEGORIES: Record<"men" | "women" | "kids", string[]> = {
  men: [
    "Shirts",
    "T-Shirts",
    "Jeans",
    "Underwear",
    "Lungi",
    "Panche",
    "Shorts",
    "Track Pants",
  ],
  women: [
    "Sarees",
    "Gagras",
    "Chudidars",
    "Lehenga",
    "Pattu",
    "Blouse Pieces",
    "Inners",
    "Chunnis",
    "Leggings",
  ],
  kids: [
    "T-Shirts",
    "Shirts",
    "Shorts",
    "Frocks",
    "Trousers",
    "Innerwear",
  ],
};

export const matchesSubcategory = (a?: string | null, b?: string | null) =>
  (a ?? "").trim().toLowerCase() === (b ?? "").trim().toLowerCase();
