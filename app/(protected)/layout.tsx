import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/src/lib/auth';
import Navbar from '@/components/Navbar';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // SECOND LAYER SECURITY: Validate with Supabase
  // This is the REAL security check - validates token with database
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    // Invalid/expired token - redirect to login
    redirect('/login');
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <Navbar />
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {children}
      </main>
    </div>
  );
}
