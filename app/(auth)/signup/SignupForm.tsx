'use client';

import { useState } from 'react';
import { signup } from '@/lib/auth';

export default function SignupForm() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Οι κωδικοί δεν ταιριάζουν');
      return;
    }

    if (password.length < 6) {
      setError('Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες');
      return;
    }

    if (username.length < 2) {
      setError('Το όνομα χρήστη πρέπει να έχει τουλάχιστον 2 χαρακτήρες');
      return;
    }

    setLoading(true);

    const result = await signup(email, username, password);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <label
          htmlFor='email'
          className='block text-sm font-semibold text-gray-700 mb-2'
        >
          Email
        </label>
        <input
          id='email'
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className='w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition bg-white/50'
          placeholder='example@email.com'
          autoComplete='email'
        />
      </div>

      <div>
        <label
          htmlFor='username'
          className='block text-sm font-semibold text-gray-700 mb-2'
        >
          Όνομα Χρήστη
        </label>
        <input
          id='username'
          type='text'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className='w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition bg-white/50'
          placeholder='Εισάγετε όνομα χρήστη'
          autoComplete='username'
        />
      </div>

      <div>
        <label
          htmlFor='password'
          className='block text-sm font-semibold text-gray-700 mb-2'
        >
          Κωδικός Πρόσβασης
        </label>
        <input
          id='password'
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className='w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition bg-white/50'
          placeholder='Τουλάχιστον 6 χαρακτήρες'
          autoComplete='new-password'
        />
      </div>

      <div>
        <label
          htmlFor='confirmPassword'
          className='block text-sm font-semibold text-gray-700 mb-2'
        >
          Επιβεβαίωση Κωδικού
        </label>
        <input
          id='confirmPassword'
          type='password'
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className='w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition bg-white/50'
          placeholder='Επαναλάβετε τον κωδικό'
          autoComplete='new-password'
        />
      </div>

      {error && (
        <div className='bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium'>
          {error}
        </div>
      )}

      <button
        type='submit'
        disabled={loading}
        className='w-full bg-linear-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
      >
        {loading ? 'Δημιουργία λογαριασμού...' : 'Εγγραφή'}
      </button>
    </form>
  );
}
