import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/src/lib/auth';

export default async function Home() {
  const authenticated = await isAuthenticated();
  
  if (authenticated) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
