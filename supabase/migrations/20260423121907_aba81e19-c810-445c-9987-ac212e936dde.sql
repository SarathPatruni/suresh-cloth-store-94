-- Create enum for product sizes
CREATE TYPE public.product_size AS ENUM ('S', 'M', 'L', 'XL', 'XXL', 'XXXL');

-- Add sizes array column to products
ALTER TABLE public.products
ADD COLUMN sizes public.product_size[] NOT NULL DEFAULT '{}';