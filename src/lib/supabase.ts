import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is required');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is required');
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function uploadComplaintImage(file: File): Promise<{ url: string | null; error: string | null }> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `complaints/${fileName}`;

    const { data, error } = await supabase.storage
      .from('complaint-images')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading file:', error);
      return { url: null, error: error.message };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('complaint-images')
      .getPublicUrl(filePath);

    return { url: publicUrl, error: null };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { url: null, error: 'Failed to upload image' };
  }
}