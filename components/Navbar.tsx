import Link from 'next/link';
import { logout, getUserWithUsername } from '@/src/lib/auth';

export default async function Navbar() {
  const user = await getUserWithUsername();

  return (
    <header className='bg-white shadow-sm border-b sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
        <div className='flex justify-between items-center'>
          <div className='flex items-center gap-8'>
            <Link href='/dashboard' className='text-2xl font-bold text-gray-900 hover:text-blue-600 transition'>
              Διαχείριση Παραγγελιών
            </Link>
            
            {/* Navigation Links */}
            <nav className='hidden md:flex gap-6'>
              <Link 
                href='/dashboard' 
                className='text-gray-700 hover:text-blue-600 font-medium transition'
              >
                Αρχική
              </Link>
              <Link 
                href='/dashboard/orders' 
                className='text-gray-700 hover:text-blue-600 font-medium transition'
              >
                Παραγγελίες
              </Link>
              <Link 
                href='/dashboard/customers' 
                className='text-gray-700 hover:text-blue-600 font-medium transition'
              >
                Πελάτες
              </Link>
              <Link 
                href='/dashboard/settings' 
                className='text-gray-700 hover:text-blue-600 font-medium transition'
              >
                Ρυθμίσεις
              </Link>
            </nav>
          </div>

          <div className='flex items-center gap-4'>
            {user && (
              <span className='text-gray-700 font-medium'>
                Γεια σου, {user.username}
              </span>
            )}
            <form action={logout}>
              <button
                type='submit'
                className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium'
              >
                Αποσύνδεση
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
