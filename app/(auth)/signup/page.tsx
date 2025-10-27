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
    <div className='min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100'>
      <div className='bg-white p-8 rounded-lg shadow-xl w-full max-w-md'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-800 mb-2'>Εγγραφή</h1>
          <p className='text-gray-600'>Δημιουργήστε νέο λογαριασμό</p>
        </div>
        <SignupForm />
        <div className='mt-6 text-center'>
          <p className='text-gray-600'>
            Έχετε ήδη λογαριασμό;{' '}
            <Link
              href='/login'
              className='text-blue-600 hover:text-blue-700 font-medium'
            >
              Συνδεθείτε
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
