'use server';

import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

// Create a simple Supabase client
const getSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

export async function signup(
  email: string,
  username: string,
  password: string
) {
  const supabase = getSupabaseClient();

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
  const { data: signInData, error: signInError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (signInError || !signInData.session) {
    // Signup succeeded but login failed, redirect to login
    redirect('/login');
  }

  // Store session in cookie
  const cookieStore = await cookies();
  cookieStore.set('supabase-auth-token', signInData.session!.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  cookieStore.set('user-id', signUpData.user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect('/dashboard');
}

export async function login(email: string, password: string) {
  const supabase = getSupabaseClient();

  // Sign in with Supabase Auth
  const { data: signInData, error: signInError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (signInError || !signInData.session || !signInData.user) {
    console.error('Sign in error:', signInError);
    return { error: 'Λάθος email ή κωδικός πρόσβασης' };
  }

  // Store session in cookie
  const cookieStore = await cookies();
  cookieStore.set('supabase-auth-token', signInData.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  cookieStore.set('user-id', signInData.user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect('/dashboard');
}

export async function logout() {
  const supabase = getSupabaseClient();
  await supabase.auth.signOut();
  const cookieStore = await cookies();
  cookieStore.delete('supabase-auth-token');
  redirect('/login');
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get('supabase-auth-token');
  return !!token;
}

export async function getUser() {
  const supabase = getSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUserWithUsername() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('user-id')?.value;

  if (!userId) return null;

  const supabase = getSupabaseClient();
  const { data: userData, error } = await supabase
    .from('users')
    .select('username')
    .eq('id', userId)
    .single();

  if (error || !userData) return null;

  return {
    id: userId,
    username: userData.username,
  };
}
