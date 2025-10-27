'use client';

import { motion } from 'framer-motion';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  DollarSign,
  Package,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const stats = [
  {
    title: 'Συνολικές Πωλήσεις',
    value: '€12,450',
    change: '+12.5%',
    icon: DollarSign,
    color: 'from-pink-500 to-rose-500',
  },
  {
    title: 'Νέες Παραγγελίες',
    value: '48',
    change: '+8.2%',
    icon: ShoppingBag,
    color: 'from-purple-500 to-indigo-500',
  },
  {
    title: 'Ενεργοί Πελάτες',
    value: '1,234',
    change: '+15.3%',
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Ποσοστό Ολοκλήρωσης',
    value: '94%',
    change: '+2.1%',
    icon: TrendingUp,
    color: 'from-green-500 to-emerald-500',
  },
];

const recentOrders = [
  {
    id: '#2456',
    customer: 'Μαρία Παπαδοπούλου',
    amount: '€145.00',
    status: 'completed',
    time: 'πριν 5 λεπτά',
  },
  {
    id: '#2455',
    customer: 'Ελένη Γεωργίου',
    amount: '€89.50',
    status: 'pending',
    time: 'πριν 15 λεπτά',
  },
  {
    id: '#2454',
    customer: 'Σοφία Ανδρέου',
    amount: '€234.00',
    status: 'completed',
    time: 'πριν 1 ώρα',
  },
  {
    id: '#2453',
    customer: 'Κατερίνα Δημητρίου',
    amount: '€67.00',
    status: 'cancelled',
    time: 'πριν 2 ώρες',
  },
  {
    id: '#2452',
    customer: 'Άννα Νικολάου',
    amount: '€198.50',
    status: 'completed',
    time: 'πριν 3 ώρες',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

export default function DashboardPage() {
  return (
    <motion.div
      variants={containerVariants}
      initial='hidden'
      animate='visible'
      className='space-y-8'
    >
      <motion.div
        variants={itemVariants}
        className='bg-white rounded-2xl shadow-lg p-8 border border-purple-100'
      >
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-4xl font-bold bg-linear-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2'>
              Καλώς ήρθες πίσω! ✨
            </h1>
            <p className='text-gray-600 text-lg'>
              Έχεις 12 νέες παραγγελίες που περιμένουν σήμερα
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className='bg-linear-to-br from-pink-500 to-purple-600 p-4 rounded-2xl shadow-lg'
          >
            <Package className='w-12 h-12 text-white' />
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -5 }}
              className='bg-white rounded-2xl shadow-lg p-6 border border-purple-100 hover:shadow-xl transition-shadow'
            >
              <div className='flex items-start justify-between mb-4'>
                <div
                  className={`bg-linear-to-br ${stat.color} p-3 rounded-xl shadow-lg`}
                >
                  <Icon className='w-6 h-6 text-white' />
                </div>
                <span className='text-green-600 font-semibold text-sm'>
                  {stat.change}
                </span>
              </div>
              <h3 className='text-gray-600 text-sm font-medium mb-1'>
                {stat.title}
              </h3>
              <p className='text-3xl font-bold text-gray-900'>{stat.value}</p>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div
        variants={itemVariants}
        className='bg-white rounded-2xl shadow-lg p-8 border border-purple-100'
      >
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold text-gray-900'>
            Πρόσφατες Παραγγελίες
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className='px-4 py-2 bg-linear-to-r from-pink-500 to-purple-600 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition'
          >
            Προβολή Όλων
          </motion.button>
        </div>

        <div className='space-y-4'>
          {recentOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.01 }}
              className='flex items-center justify-between p-4 bg-linear-to-r from-pink-50 to-purple-50 rounded-xl hover:shadow-md transition-all'
            >
              <div className='flex items-center gap-4'>
                <div className='w-12 h-12 bg-linear-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold'>
                  {order.customer.charAt(0)}
                </div>
                <div>
                  <p className='font-semibold text-gray-900'>
                    {order.customer}
                  </p>
                  <p className='text-sm text-gray-600'>
                    {order.id} • {order.time}
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-6'>
                <p className='font-bold text-gray-900 text-lg'>
                  {order.amount}
                </p>
                {order.status === 'completed' && (
                  <span className='flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium'>
                    <CheckCircle className='w-4 h-4' />
                    Ολοκληρώθηκε
                  </span>
                )}
                {order.status === 'pending' && (
                  <span className='flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium'>
                    <Clock className='w-4 h-4' />
                    Εκκρεμεί
                  </span>
                )}
                {order.status === 'cancelled' && (
                  <span className='flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium'>
                    <XCircle className='w-4 h-4' />
                    Ακυρώθηκε
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
