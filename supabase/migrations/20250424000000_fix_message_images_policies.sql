-- Update storage policies for messages bucket to ensure proper image uploads

-- First ensure the storage extension is enabled
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- Make sure the messages bucket exists (won't create if it already exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('messages', 'messages', true)
ON CONFLICT (id) DO NOTHING;

-- Remove any existing policies for the messages bucket that might be conflicting
DROP POLICY IF EXISTS "Allow authenticated users to upload images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload message images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to read message images" ON storage.objects;

-- Create storage policy to allow authenticated users to upload images to messages bucket
CREATE POLICY "Allow authenticated users to upload message images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'messages' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policy to allow authenticated users to update their own uploaded images
CREATE POLICY "Allow users to update their own message images" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'messages' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policy to allow public access to read message images
CREATE POLICY "Allow public to read message images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'messages');