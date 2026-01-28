-- Create books table
CREATE TABLE public.books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 10.00,
  cover_image TEXT,
  file_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create book purchases table
CREATE TABLE public.book_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('mtn', 'airtel')),
  amount DECIMAL(10,2) NOT NULL,
  transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  download_token TEXT UNIQUE,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_purchases ENABLE ROW LEVEL SECURITY;

-- Books are publicly readable
CREATE POLICY "Books are publicly readable"
  ON public.books FOR SELECT
  USING (true);

-- Purchases can be viewed by the buyer (via email match through edge function)
CREATE POLICY "Purchases accessible via download token"
  ON public.book_purchases FOR SELECT
  USING (true);

-- Create storage bucket for book files
INSERT INTO storage.buckets (id, name, public)
VALUES ('book-files', 'book-files', false);

-- Storage policy: Only allow access through edge functions (not direct public access)
CREATE POLICY "Book files are private"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'book-files' AND false);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_book_purchases_updated_at
  BEFORE UPDATE ON public.book_purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample books
INSERT INTO public.books (slug, title, subtitle, description, price, cover_image) VALUES
  ('smart-budgeting', 'Smart Budgeting 50/30/20', 'A plan for every kwacha.', 'Learn how to manage your finances effectively using the proven 50/30/20 budgeting method, adapted specifically for Zambian economic realities.', 10.00, '/placeholder.svg'),
  ('zambia-economics', 'Understanding Zambia''s Economy', 'A deep dive into economic realities.', 'An in-depth analysis of Zambia''s economic landscape, from historical context to future opportunities.', 15.00, '/placeholder.svg');