'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

interface CustomerData {
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  address?: string;
  house_number?: string;
  city?: string;
  notes?: string;
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
        setAll(cookiesToSet: any) {
          cookiesToSet.forEach(({ name, value, options }: any) =>
            cookieStore.set(name, value, options)
          );
        },
      },
      auth: {
        storage: {
          getItem: async (key: string) => {
            const cookie = cookieStore.get(key);
            return cookie?.value ?? null;
          },
          setItem: async (key: string, value: string) => {
            cookieStore.set(key, value);
          },
          removeItem: async (key: string) => {
            cookieStore.delete(key);
          },
        },
        storageKey: `sb-${
          process.env.NEXT_PUBLIC_SUPABASE_URL!.split('//')[1].split('.')[0]
        }-auth-token`,
      },
    }
  );
}

export async function createCustomer(customerData: CustomerData) {
  try {
    const supabase = await getSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Δεν βρέθηκε χρήστης' };
    }

    const { data, error } = await supabase
      .from('clients')
      .insert([
        {
          user_id: user.id,
          ...customerData,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating customer:', error);
      return { error: 'Σφάλμα κατά τη δημιουργία πελάτη' };
    }

    revalidatePath('/dashboard/customers');
    return { data };
  } catch (error) {
    console.error('Error in createCustomer:', error);
    return { error: 'Σφάλμα κατά τη δημιουργία πελάτη' };
  }
}

export async function updateCustomer(
  id: string,
  customerData: Partial<CustomerData>
) {
  try {
    const supabase = await getSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Δεν βρέθηκε χρήστης' };
    }

    const { data, error } = await supabase
      .from('clients')
      .update(customerData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating customer:', error);
      return { error: 'Σφάλμα κατά την ενημέρωση πελάτη' };
    }

    revalidatePath('/dashboard/customers');
    return { data };
  } catch (error) {
    console.error('Error in updateCustomer:', error);
    return { error: 'Σφάλμα κατά την ενημέρωση πελάτη' };
  }
}

export async function deleteCustomer(id: string) {
  try {
    const supabase = await getSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Δεν βρέθηκε χρήστης' };
    }

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting customer:', error);
      return { error: 'Σφάλμα κατά τη διαγραφή πελάτη' };
    }

    revalidatePath('/dashboard/customers');
    return { success: true };
  } catch (error) {
    console.error('Error in deleteCustomer:', error);
    return { error: 'Σφάλμα κατά τη διαγραφή πελάτη' };
  }
}

export async function getCustomers() {
  try {
    const supabase = await getSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Δεν βρέθηκε χρήστης' };
    }

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customers:', error);
      return { error: 'Σφάλμα κατά τη φόρτωση πελατών' };
    }

    return { data };
  } catch (error) {
    console.error('Error in getCustomers:', error);
    return { error: 'Σφάλμα κατά τη φόρτωση πελατών' };
  }
}
