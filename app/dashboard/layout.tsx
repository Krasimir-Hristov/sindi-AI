import { logout, getUserWithUsername } from '@/src/lib/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserWithUsername();

  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center'>
          <h1 className='text-2xl font-bold text-gray-900'>
            Διαχείριση Παραγγελιών
          </h1>
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
      </header>
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {children}
      </main>
    </div>
  );
}
