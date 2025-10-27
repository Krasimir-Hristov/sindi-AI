import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/src/lib/auth';
import SignupForm from './SignupForm';
import Link from 'next/link';

export default async function SignupPage() {
  const authenticated = await isAuthenticated();

  if (authenticated) {
    redirect('/dashboard');
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-linear-to-br from-pink-50 via-purple-50 to-indigo-100 relative overflow-hidden'>
      {/* Decorative background elements */}
      <div className='absolute top-0 left-0 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob' />
      <div className='absolute top-0 right-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000' />
      <div className='absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000' />

      <div className='relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md border border-purple-100'>
        <div className='text-center mb-8'>
          <div className='inline-block p-4 bg-linear-to-br from-pink-500 to-purple-600 rounded-2xl shadow-lg mb-4'>
            <svg
              className='w-12 h-12 text-white'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'
              />
            </svg>
          </div>
          <h1 className='text-4xl font-bold bg-linear-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2'>
            Εγγραφή
          </h1>
          <p className='text-gray-600'>Δημιουργήστε νέο λογαριασμό ✨</p>
        </div>
        <SignupForm />
        <div className='mt-6 text-center'>
          <p className='text-gray-600'>
            Έχετε ήδη λογαριασμό;{' '}
            <Link
              href='/login'
              className='font-semibold bg-linear-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent hover:from-pink-700 hover:to-purple-700 transition'
            >
              Συνδεθείτε
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
