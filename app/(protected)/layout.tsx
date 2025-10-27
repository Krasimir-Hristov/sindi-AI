import { redirect } from 'next/navigation';
import { isAuthenticated, getUserWithUsername } from '@/src/lib/auth';
import Navbar from '@/components/Navbar';
import { SettingsProvider } from '@/src/contexts/SettingsContext';

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

  const user = await getUserWithUsername();

  return (
    <SettingsProvider>
      <div className='min-h-screen bg-linear-to-br from-pink-50 via-purple-50 to-blue-50'>
        <Navbar username={user?.username || 'User'} />
        <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {children}
        </main>
      </div>
    </SettingsProvider>
  );
}
