-- Create storage bucket for book covers
INSERT INTO storage.buckets (id, name, public)
VALUES ('book-covers', 'book-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to book covers
CREATE POLICY "Public read access for book covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'book-covers');

-- Allow admins to upload book covers
CREATE POLICY "Admins can upload book covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'book-covers' AND public.has_role(auth.uid(), 'admin'));

-- Allow admins to update book covers
CREATE POLICY "Admins can update book covers"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'book-covers' AND public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete book covers
CREATE POLICY "Admins can delete book covers"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'book-covers' AND public.has_role(auth.uid(), 'admin'));

-- Add policies for book-files bucket (already exists but needs admin policies)
CREATE POLICY "Admins can upload book files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'book-files' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update book files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'book-files' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete book files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'book-files' AND public.has_role(auth.uid(), 'admin'));