CREATE POLICY "Staff can view product images" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'product-images' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff can upload product images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff can update product images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff can delete product images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND public.is_staff(auth.uid()));