'use server';

import { revalidatePath } from 'next/cache';
import { getServerSupabase } from '@/lib/supabase/server';

interface ProductData {
  name: string;
  description?: string;
  category?: string;
  unit_price: number;
  stock_quantity: number;
  min_stock_level?: number;
  image_url?: string;
  is_active?: boolean;
}

export async function createProduct(productData: ProductData) {
  try {
    const supabase = await getServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { data, error } = await supabase
      .from('products')
      .insert({ ...productData, user_id: user.id })
      .select()
      .single();

    if (error) return { error: 'Error creating product' };
    revalidatePath('/dashboard/products');
    return { success: true, data };
  } catch (error) {
    return { error: 'Unexpected error' };
  }
}

export async function getProducts() {
  try {
    const supabase = await getServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return null;
    return data;
  } catch (error) {
    return null;
  }
}

export async function updateProduct(
  id: string,
  productData: Partial<ProductData>
) {
  try {
    const supabase = await getServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) return { error: 'Error updating product' };
    revalidatePath('/dashboard/products');
    return { success: true, data };
  } catch (error) {
    return { error: 'Unexpected error' };
  }
}

export async function deleteProduct(id: string) {
  try {
    const supabase = await getServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) return { error: 'Error deleting product' };
    revalidatePath('/dashboard/products');
    return { success: true };
  } catch (error) {
    return { error: 'Unexpected error' };
  }
}
