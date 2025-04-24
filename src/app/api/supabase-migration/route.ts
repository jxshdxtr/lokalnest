import { NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';

export async function GET() {
  try {
    // Add image_url column to messages table
    const { error: alterTableError } = await supabase.rpc(
      'exec',
      { query: 'ALTER TABLE messages ADD COLUMN IF NOT EXISTS image_url TEXT;' }
    );

    if (alterTableError) {
      console.error('Error altering table:', alterTableError);
      return NextResponse.json({ error: alterTableError.message }, { status: 500 });
    }

    // Create storage bucket for message images
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();

    if (bucketsError) {
      console.error('Error checking buckets:', bucketsError);
      return NextResponse.json({ error: bucketsError.message }, { status: 500 });
    }

    // Check if messages bucket exists
    const messagesBucketExists = buckets.some(bucket => bucket.name === 'messages');

    if (!messagesBucketExists) {
      // Create the messages bucket
      const { error: createBucketError } = await supabase
        .storage
        .createBucket('messages', {
          public: true,
          fileSizeLimit: 5242880, // 5MB limit
          allowedMimeTypes: ['image/*']
        });

      if (createBucketError) {
        console.error('Error creating bucket:', createBucketError);
        return NextResponse.json({ error: createBucketError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
} 