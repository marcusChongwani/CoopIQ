-- Create donations table
CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  donor_name TEXT,
  donor_email TEXT NOT NULL,
  donor_phone TEXT NOT NULL,
  donor_message TEXT,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  transaction_id TEXT,
  lenco_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Policy: Donations are publicly insertable (anyone can donate)
CREATE POLICY "Anyone can create donations"
ON public.donations
FOR INSERT
WITH CHECK (true);

-- Policy: Only admins can view donations
CREATE POLICY "Admins can view donations"
ON public.donations
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Policy: Admins can update donations
CREATE POLICY "Admins can update donations"
ON public.donations
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_donations_updated_at
BEFORE UPDATE ON public.donations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add lenco_reference column to book_purchases if not exists
ALTER TABLE public.book_purchases 
ADD COLUMN IF NOT EXISTS lenco_reference TEXT;