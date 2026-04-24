-- Backfill any existing NULL subcategories so we can enforce NOT NULL
UPDATE public.products
SET subcategory = 'Other'
WHERE subcategory IS NULL OR btrim(subcategory) = '';

-- Enforce subcategory as required going forward
ALTER TABLE public.products
ALTER COLUMN subcategory SET NOT NULL;

-- Helpful composite index for category + subcategory filtering
CREATE INDEX IF NOT EXISTS idx_products_category_subcategory
ON public.products (category, subcategory);