'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

interface ProductData {
  name: string;
  description?: string;
  sku?: string;
  category?: string;
  unit_price: number;
  stock_quantity: number;
  min_stock_level?: number;
  image_url?: string;
  is_active?: boolean;
}

async function getSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }: any) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore cookie errors in non-server-action contexts
          }
        },
      },
    }
  );
}

export async function createProduct(productData: ProductData) {
  try {
    const supabase = await getSupabaseClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Μη εξουσιοδοτημένος χρήστης' };
    }

    // Insert product
    const { data, error } = await supabase
      .from('products')
      .insert({
        ...productData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      return { error: 'Σφάλμα κατά τη δημιουργία προϊόντος' };
    }

    revalidatePath('/dashboard/products');
    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { error: 'Απροσδόκητο σφάλμα' };
  }
}

export async function getProducts() {
  try {
    const supabase = await getSupabaseClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    // Fetch products
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
}

export async function updateProduct(id: string, productData: ProductData) {
  try {
    const supabase = await getSupabaseClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Μη εξουσιοδοτημένος χρήστης' };
    }

    // Update product
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      return { error: 'Σφάλμα κατά την ενημέρωση προϊόντος' };
    }

    revalidatePath('/dashboard/products');
    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { error: 'Απροσδόκητο σφάλμα' };
  }
}

export async function deleteProduct(id: string) {
  try {
    const supabase = await getSupabaseClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Μη εξουσιοδοτημένος χρήστης' };
    }

    // Delete product
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting product:', error);
      return { error: 'Σφάλμα κατά τη διαγραφή προϊόντος' };
    }

    revalidatePath('/dashboard/products');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { error: 'Απροσδόκητο σφάλμα' };
  }
}
