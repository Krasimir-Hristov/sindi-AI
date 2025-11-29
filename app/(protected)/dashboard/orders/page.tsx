'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Plus, Search } from 'lucide-react';
import { getOrders } from '@/lib/actions/orders';
import OrderCard from './components/OrderCard';
import OrderFormModal from './components/OrderFormModal';

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

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    const data = await getOrders();
    if (data) {
      setOrders(data);
    }
    setLoading(false);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        `${order.client?.first_name || ''} ${order.client?.last_name || ''}`
          .toLowerCase()
          .trim()
          .includes(searchTerm.toLowerCase()) ||
        order.client?.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOrderCreated = () => {
    setIsModalOpen(false);
    fetchOrders();
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Φόρτωση παραγγελιών...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className='flex items-center justify-between'
      >
        <div className='flex items-center gap-3'>
          <div className='p-3 bg-linear-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg'>
            <ShoppingBag className='w-6 h-6 text-white' />
          </div>
          <div>
            <h1 className='text-3xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
              Παραγγελίες
            </h1>
            <p className='text-gray-600'>Διαχειριστείτε τις παραγγελίες σας</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className='flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base'
        >
          <Plus className='w-4 h-4 sm:w-5 sm:h-5' />
          <span className='hidden xs:inline sm:inline'>Νέα Παραγγελία</span>
          <span className='xs:hidden'>Νέα</span>
        </motion.button>
      </motion.div>

      {/* Search Bar */}
      {orders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className='max-w-md'
        >
          <div className='relative'>
            <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
            <input
              type='text'
              placeholder='Αναζήτηση παραγγελιών...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pl-12 pr-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all bg-white'
            />
          </div>
        </motion.div>
      )}

      {/* Orders List */}
      {orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className='text-center py-16 bg-white rounded-2xl shadow-lg'
        >
          <ShoppingBag className='w-16 h-16 mx-auto mb-4 text-gray-300' />
          <h3 className='text-xl font-semibold text-gray-700 mb-2'>
            Δεν υπάρχουν παραγγελίες
          </h3>
          <p className='text-gray-500 mb-6'>
            Δημιουργήστε την πρώτη σας παραγγελία
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className='px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300'
          >
            Δημιουργία Παραγγελίας
          </button>
        </motion.div>
      ) : filteredOrders.length === 0 && searchTerm !== '' ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className='text-center py-16 bg-white rounded-2xl shadow-lg'
        >
          <Search className='w-16 h-16 mx-auto mb-4 text-gray-300' />
          <h3 className='text-xl font-semibold text-gray-700 mb-2'>
            Δεν βρέθηκαν παραγγελίες
          </h3>
          <p className='text-gray-500 mb-6'>
            Δεν υπάρχουν παραγγελίες που να ταιριάζουν με "{searchTerm}"
          </p>
          <button
            onClick={() => setSearchTerm('')}
            className='px-6 py-3 bg-purple-100 text-purple-700 rounded-xl font-medium hover:bg-purple-200 transition-colors'
          >
            Εκκαθάριση αναζήτησης
          </button>
        </motion.div>
      ) : (
        <motion.div
          key={`orders-${searchTerm}-${filteredOrders.length}`}
          variants={containerVariants}
          initial='hidden'
          animate='visible'
          className='space-y-4'
        >
          {filteredOrders.map((order) => (
            <motion.div key={order.id} variants={itemVariants}>
              <OrderCard order={order} onUpdate={fetchOrders} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Order Form Modal */}
      {isModalOpen && (
        <OrderFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleOrderCreated}
        />
      )}
    </div>
  );
}
