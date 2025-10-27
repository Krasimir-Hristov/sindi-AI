'use server';

import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

// Get the Supabase project reference from URL
const getProjectRef = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const match = url.match(/https:\/\/([a-z]+)\./);
  return match ? match[1] : 'unknown';
};

// Create Supabase client with cookie-based auth
const createServerClient = async () => {
  const cookieStore = await cookies();
  const projectRef = getProjectRef();

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storage: {
          getItem: async (key: string) => {
            return cookieStore.get(key)?.value ?? null;
          },
          setItem: async (key: string, value: string) => {
            cookieStore.set(key, value, {
              httpOnly: false, // Supabase needs to read this
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 60 * 60 * 24 * 7, // 7 days
              path: '/',
            });
          },
          removeItem: async (key: string) => {
            cookieStore.delete(key);
          },
        },
        storageKey: `sb-${projectRef}-auth-token`,
      },
    }
  );
};

export async function signup(
  email: string,
  username: string,
  password: string
) {
  const supabase = await createServerClient();

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
  const supabase = await createServerClient();

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
  const supabase = await createServerClient();
  await supabase.auth.signOut(); // This clears cookies automatically
  redirect('/login');
}

export async function isAuthenticated() {
  // REAL AUTHENTICATION CHECK - validates with Supabase
  const supabase = await createServerClient();
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
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUserWithUsername() {
  const supabase = await createServerClient();

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
