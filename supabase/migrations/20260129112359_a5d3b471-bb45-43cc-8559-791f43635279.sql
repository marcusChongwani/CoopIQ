-- Add is_verified column to donations table
ALTER TABLE public.donations 
ADD COLUMN is_verified boolean NOT NULL DEFAULT false;

-- Add is_verified column to book_purchases table
ALTER TABLE public.book_purchases 
ADD COLUMN is_verified boolean NOT NULL DEFAULT false;

-- Update existing completed records to be verified
UPDATE public.donations SET is_verified = true WHERE status = 'completed';
UPDATE public.book_purchases SET is_verified = true WHERE status = 'completed';