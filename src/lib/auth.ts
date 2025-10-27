'use server';

import { createServerClient } from '@supabase/ssr';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

// Create Supabase client with proper SSR cookie handling
const getSupabaseClient = async () => {
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
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};

export async function signup(
  email: string,
  username: string,
  password: string
) {
  const supabase = await getSupabaseClient();

  // Check if username already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('username')
    .eq('username', username)
    .single();

  if (existingUser) {
    return { error: 'Το όνομα χρήστη υπάρχει ήδη' };
  }

  // Create user in Supabase Auth
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
    },
  });

  if (signUpError) {
    console.error('Signup error:', signUpError);
    return { error: signUpError.message };
  }

  if (!signUpData.user) {
    return { error: 'Σφάλμα κατά τη δημιουργία χρήστη' };
  }

  // Create user record in public.users
  const { error: insertError } = await supabase.from('users').insert({
    id: signUpData.user.id,
    username,
  });

  if (insertError) {
    console.error('Insert user error:', insertError);
    return { error: 'Σφάλμα κατά την αποθήκευση του χρήστη' };
  }

  // Auto login after signup
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    // Signup succeeded but login failed, redirect to login
    redirect('/login');
  }

  // Session is automatically stored in cookies by Supabase client
  redirect('/dashboard');
}

export async function login(email: string, password: string) {
  const supabase = await getSupabaseClient();

  // Sign in with Supabase Auth
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    console.error('Sign in error:', signInError);
    return { error: 'Λάθος email ή κωδικός πρόσβασης' };
  }

  // Session is automatically stored in cookies by Supabase client
  redirect('/dashboard');
}

export async function logout() {
  const supabase = await getSupabaseClient();
  await supabase.auth.signOut(); // This clears cookies automatically
  redirect('/login');
}

export async function isAuthenticated() {
  // REAL AUTHENTICATION CHECK - validates with Supabase
  const supabase = await getSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // If there's an error or no user, they're not authenticated
  // NOTE: We can't delete cookies here (Server Component restriction)
  // Cookies will be cleared on next login/logout
  return !error && !!user;
}

export async function getUser() {
  const supabase = await getSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUserWithUsername() {
  const supabase = await getSupabaseClient();

  // Get authenticated user from Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch username from public.users table
  const { data: userData, error } = await supabase
    .from('users')
    .select('username')
    .eq('id', user.id)
    .single();

  if (error || !userData) return null;

  return {
    id: user.id,
    username: userData.username,
  };
}
