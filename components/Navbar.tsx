'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Home, 
  ShoppingBag, 
  Users, 
  Settings, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { logout } from '@/src/lib/auth';

interface NavbarProps {
  username: string;
}

export default function Navbar({ username }: NavbarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Αρχική', icon: Home },
    { href: '/dashboard/orders', label: 'Παραγγελίες', icon: ShoppingBag },
    { href: '/dashboard/customers', label: 'Πελάτες', icon: Users },
    { href: '/dashboard/settings', label: 'Ρυθμίσεις', icon: Settings },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className='bg-linear-to-r from-pink-50 via-purple-50 to-blue-50 border-b border-purple-100 sticky top-0 z-50 backdrop-blur-sm bg-opacity-90'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
        <div className='flex justify-between items-center'>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className='flex items-center gap-2'
          >
            <div className='bg-linear-to-br from-pink-500 to-purple-600 p-2 rounded-xl shadow-lg'>
              <Sparkles className='w-6 h-6 text-white' />
            </div>
            <Link href='/dashboard' className='text-2xl font-bold bg-linear-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent hover:from-pink-700 hover:to-purple-700 transition'>
              Sindi AI
            </Link>
          </motion.div>
          
          {/* Navigation Links */}
          <nav className='hidden md:flex gap-2'>
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link 
                    href={item.href}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300
                      ${active 
                        ? 'bg-linear-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-purple-300/50' 
                        : 'text-gray-700 hover:bg-white hover:shadow-md'
                      }
                    `}
                  >
                    <Icon className='w-4 h-4' />
                    <span>{item.label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className='flex items-center gap-4'
          >
            <div className='hidden sm:flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-md'>
              <div className='w-8 h-8 bg-linear-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm'>
                {username.charAt(0).toUpperCase()}
              </div>
              <span className='text-gray-700 font-medium'>
                {username}
              </span>
            </div>
            <form action={logout}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type='submit'
                className='flex items-center gap-2 px-4 py-2 bg-linear-to-r from-red-500 to-pink-600 text-white rounded-full hover:from-red-600 hover:to-pink-700 transition shadow-lg shadow-red-300/50 font-medium'
              >
                <LogOut className='w-4 h-4' />
                <span className='hidden sm:inline'>Αποσύνδεση</span>
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
