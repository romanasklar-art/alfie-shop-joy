
CREATE POLICY "Anyone can upload order files" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'orders');

CREATE POLICY "Anyone can read order files" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'orders');
