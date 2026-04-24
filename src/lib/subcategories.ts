// Subcategory options per main category. Admin can also type a custom value.
export const SUBCATEGORIES: Record<"men" | "women" | "kids", string[]> = {
  men: [
    "Shirts",
    "T-Shirts",
    "Jeans",
    "Innerwear",
    "Lungi",
    "Pancha",
    "Shorts",
    "Trackpants",
  ],
  women: [
    "Sarees",
    "Kurtis",
    "Tops",
    "Jeans",
    "Leggings",
    "Innerwear",
    "Dresses",
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
