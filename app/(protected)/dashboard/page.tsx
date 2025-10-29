'use client';

import { useState, useEffect } from 'react';
import { getDashboardData } from '@/lib/actions/orders';
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
import OrderCard from './orders/components/OrderCard';

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
  const [dashboardData, setDashboardData] = useState<{
    stats: {
      totalSales: number;
      totalPaid: number;
      totalOrders: number;
      completedOrders: number;
      pendingOrders: number;
      completionRate: number;
      activeCustomers: number;
    };
    recentOrders: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const handleOrderClick = (order: any) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleOrderUpdate = async () => {
    // Refresh dashboard data after order changes
    try {
      const data = await getDashboardData();
      setDashboardData(data);

      // Check if the selected order still exists or was cancelled
      if (selectedOrder) {
        const updatedOrder = data?.recentOrders.find(
          (order) => order.id === selectedOrder.id
        );
        if (!updatedOrder || updatedOrder.status === 'cancelled') {
          // Order was deleted or cancelled, close the modal
          setShowOrderModal(false);
          setSelectedOrder(null);
        } else {
          // Update the selected order with fresh data
          setSelectedOrder(updatedOrder);
        }
      }
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600'></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <p className='text-gray-500'>Не можаха да се заредят данните</p>
      </div>
    );
  }

  const { stats, recentOrders } = dashboardData;

  const statsCards = [
    {
      title: 'Συνολικές Πωλήσεις',
      value: `€${stats.totalSales.toFixed(2)}`,
      change:
        stats.totalOrders > 0
          ? `+${
              Math.round((stats.totalSales / stats.totalOrders) * 100) / 100
            }%`
          : '+0%',
      icon: DollarSign,
      color: 'from-pink-500 to-rose-500',
    },
    {
      title: 'Νέες Παραγγελίες',
      value: stats.totalOrders.toString(),
      change: `+${stats.pendingOrders}`,
      icon: ShoppingBag,
      color: 'from-purple-500 to-indigo-500',
    },
    {
      title: 'Ενεργοί Πελάτες',
      value: stats.activeCustomers.toString(),
      change: '+0',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Ποσοστό Ολοκλήρωσης',
      value: `${stats.completionRate}%`,
      change: `+${stats.completedOrders}`,
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
    },
  ];
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
              {stats.pendingOrders > 0
                ? `Έχεις ${stats.pendingOrders} νέες παραγγελίες που περιμένουν σήμερα`
                : 'Όλες οι παραγγελίες σου είναι ενημερωμένες'}
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
        {statsCards.map((stat) => {
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
          {recentOrders.map((order: any, index: number) => {
            const getStatusInfo = (status: string) => {
              switch (status) {
                case 'paid':
                  return {
                    text: 'Ολοκληρώθηκε',
                    color: 'bg-green-100 text-green-700',
                    icon: CheckCircle,
                  };
                case 'partial':
                  return {
                    text: 'Μερική Πληρωμή',
                    color: 'bg-yellow-100 text-yellow-700',
                    icon: Clock,
                  };
                case 'cancelled':
                  return {
                    text: 'Ακυρώθηκε',
                    color: 'bg-red-100 text-red-700',
                    icon: XCircle,
                  };
                default:
                  return {
                    text: 'Εκκρεμεί',
                    color: 'bg-gray-100 text-gray-700',
                    icon: Clock,
                  };
              }
            };

            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo.icon;
            const customerName =
              `${order.client?.first_name || ''} ${
                order.client?.last_name || ''
              }`.trim() || 'Άγνωστος Πελάτης';
            const timeAgo = new Date(order.created_at).toLocaleString('el-GR', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => handleOrderClick(order)}
                className='flex items-center justify-between p-4 bg-linear-to-r from-pink-50 to-purple-50 rounded-xl hover:shadow-md transition-all cursor-pointer'
              >
                <div className='flex items-center gap-4'>
                  <div className='w-12 h-12 bg-linear-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold'>
                    {customerName.charAt(0)}
                  </div>
                  <div>
                    <p className='font-semibold text-gray-900'>
                      {customerName}
                    </p>
                    <p className='text-sm text-gray-600'>
                      #{order.id} • {timeAgo}
                    </p>
                  </div>
                </div>

                <div className='flex items-center gap-6'>
                  <p className='font-bold text-gray-900 text-lg'>
                    €{order.total_amount?.toFixed(2) || '0.00'}
                  </p>
                  <span
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}
                  >
                    <StatusIcon className='w-4 h-4' />
                    {statusInfo.text}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Order Modal */}
      {showOrderModal && selectedOrder && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden'>
            <div className='flex items-center justify-between p-6 border-b border-gray-200'>
              <h3 className='text-xl font-bold text-gray-900'>
                Λεπτομέρειες Παραγγελίας #{selectedOrder.id}
              </h3>
              <button
                onClick={() => {
                  setShowOrderModal(false);
                  setSelectedOrder(null);
                }}
                className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <XCircle className='w-6 h-6 text-gray-500' />
              </button>
            </div>
            <div className='overflow-y-auto max-h-[calc(90vh-120px)]'>
              <OrderCard order={selectedOrder} onUpdate={handleOrderUpdate} />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
