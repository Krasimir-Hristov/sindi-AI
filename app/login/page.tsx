import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/src/lib/auth';
import LoginForm from './LoginForm';
import Link from 'next/link';

export default async function LoginPage() {
  const authenticated = await isAuthenticated();

  if (authenticated) {
    redirect('/dashboard');
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100'>
      <div className='bg-white p-8 rounded-lg shadow-xl w-full max-w-md'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-800 mb-2'>
            Διαχείριση Παραγγελιών
          </h1>
          <p className='text-gray-600'>Συνδεθείτε για να συνεχίσετε</p>
        </div>
        <LoginForm />
        <div className='mt-6 text-center'>
          <p className='text-sm text-gray-600'>
            Δεν έχετε λογαριασμό;{' '}
            <Link
              href='/signup'
              className='text-blue-600 font-medium hover:text-blue-700 hover:underline'
            >
              Εγγραφείτε
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
