-- Add image_url column to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create storage bucket for message images if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('messages', 'messages', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy to allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'messages' AND auth.uid() = auth.uid());

-- Create storage policy to allow public access to read message images
CREATE POLICY "Allow public to read message images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'messages'); 