'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { updateOrderPayment, cancelOrder } from '@/lib/actions/orders';
import CancelOrderModal from './CancelOrderModal';

interface OrderCardProps {
  order: any;
  onUpdate: () => void;
}

export default function OrderCard({ order, onUpdate }: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCancelOrderModal, setShowCancelOrderModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [tempPaidQuantity, setTempPaidQuantity] = useState<number>(0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'partial':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className='w-4 h-4' />;
      case 'partial':
        return <AlertCircle className='w-4 h-4' />;
      case 'cancelled':
        return <XCircle className='w-4 h-4' />;
      default:
        return <Clock className='w-4 h-4' />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Πληρωμένη';
      case 'partial':
        return 'Μερική Πληρωμή';
      case 'cancelled':
        return 'Ακυρωμένη';
      default:
        return 'Εκκρεμεί';
    }
  };

  const handlePaymentUpdate = async (itemId: string, paidQuantity: number) => {
    setLoading(true);
    const result = await updateOrderPayment(order.id, [
      { item_id: itemId, paid_quantity: paidQuantity },
    ]);
    setLoading(false);

    if (result.success) {
      setEditingItemId(null);
      onUpdate();
    } else {
      alert(result.error || 'Σφάλμα κατά την ενημέρωση');
    }
  };

  const startEditing = (itemId: string, currentPaidQuantity: number) => {
    setEditingItemId(itemId);
    setTempPaidQuantity(currentPaidQuantity);
  };

  const cancelEditing = () => {
    setEditingItemId(null);
    setTempPaidQuantity(0);
  };

  const savePayment = (itemId: string) => {
    handlePaymentUpdate(itemId, tempPaidQuantity);
  };

  const handleCancelOrder = async () => {
    setShowCancelOrderModal(false);
    setLoading(true);
    const result = await cancelOrder(order.id);
    setLoading(false);

    if (result.success) {
      onUpdate();
    } else {
      alert(result.error || 'Σφάλμα κατά την ακύρωση παραγγελίας');
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100'
      >
        {/* Header */}
        <div
          onClick={() => setExpanded(!expanded)}
          className='p-6 cursor-pointer hover:bg-gray-50 transition-colors'
        >
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4 flex-1'>
              {/* Client Info */}
              <div className='flex items-center gap-3'>
                <div className='p-3 bg-purple-100 rounded-xl'>
                  <User className='w-5 h-5 text-purple-600' />
                </div>
                <div>
                  <p className='font-semibold text-gray-900'>
                    {order.client.first_name} {order.client.last_name}
                  </p>
                  <p className='text-sm text-gray-500'>{order.client.phone}</p>
                </div>
              </div>

              {/* Order Info */}
              <div className='flex items-center gap-6 ml-auto'>
                {/* Total Amount */}
                <div className='text-right'>
                  <p className='text-sm text-gray-500'>Σύνολο</p>
                  <p className='font-semibold text-gray-900'>
                    €{order.total_amount.toFixed(2)}
                  </p>
                </div>

                {/* Paid Amount */}
                <div className='text-right'>
                  <p className='text-sm text-gray-500'>Πληρωμένο</p>
                  <p className='font-semibold text-green-600'>
                    €{order.paid_amount.toFixed(2)}
                  </p>
                </div>

                {/* Status */}
                <div
                  className={`px-4 py-2 rounded-lg border ${getStatusColor(
                    order.status
                  )} flex items-center gap-2 font-semibold`}
                >
                  {getStatusIcon(order.status)}
                  {getStatusText(order.status)}
                </div>

                {/* Expand Icon */}
                <div className='text-gray-400'>
                  {expanded ? (
                    <ChevronUp className='w-5 h-5' />
                  ) : (
                    <ChevronDown className='w-5 h-5' />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Date */}
          <div className='mt-4 flex items-center gap-2 text-sm text-gray-500'>
            <Clock className='w-4 h-4' />
            {new Date(order.created_at).toLocaleString('el-GR')}
          </div>
        </div>

        {/* Expanded Content */}
        {expanded && (
          <div className='border-t border-gray-100 p-6 bg-gray-50'>
            {/* Order Items */}
            <div className='space-y-4'>
              {order.order_items.map((item: any) => (
                <div
                  key={item.id}
                  className='bg-white p-4 rounded-xl border border-gray-200'
                >
                  <div className='flex items-center justify-between mb-3'>
                    <div className='flex items-center gap-3'>
                      <Package className='w-5 h-5 text-purple-600' />
                      <div>
                        <p className='font-semibold text-gray-900'>
                          {item.product.name}
                        </p>
                        {item.product.sku && (
                          <p className='text-sm text-gray-500'>
                            SKU: {item.product.sku}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm text-gray-500'>
                        €{item.unit_price.toFixed(2)} × {item.quantity}
                      </p>
                      <p className='font-semibold text-gray-900'>
                        €{(item.unit_price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Payment Status */}
                  <div className='flex items-center gap-4'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-2'>
                        <span className='text-sm text-gray-600'>
                          Πληρωμένα:
                        </span>
                        <span className='font-semibold text-green-600'>
                          {item.paid_quantity} / {item.quantity}
                        </span>
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-2'>
                        <div
                          className='bg-green-500 h-2 rounded-full transition-all'
                          style={{
                            width: `${
                              (item.paid_quantity / item.quantity) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Payment Actions */}
                    {order.status !== 'cancelled' && (
                      <div className='flex gap-2 items-center'>
                        {editingItemId === item.id ? (
                          <>
                            {/* Edit Mode */}
                            <input
                              type='number'
                              min='0'
                              max={item.quantity}
                              value={tempPaidQuantity}
                              onChange={(e) =>
                                setTempPaidQuantity(
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className='w-20 px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center font-semibold'
                              disabled={loading}
                            />
                            <button
                              onClick={() => savePayment(item.id)}
                              disabled={
                                loading ||
                                tempPaidQuantity < 0 ||
                                tempPaidQuantity > item.quantity
                              }
                              className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm font-semibold'
                            >
                              <CheckCircle className='w-4 h-4' />
                            </button>
                            <button
                              onClick={cancelEditing}
                              disabled={loading}
                              className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 text-sm font-semibold'
                            >
                              <XCircle className='w-4 h-4' />
                            </button>
                          </>
                        ) : (
                          <>
                            {/* View Mode */}
                            <button
                              onClick={() =>
                                startEditing(item.id, item.paid_quantity)
                              }
                              disabled={loading}
                              className='px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50 text-sm font-semibold'
                            >
                              Επεξεργασία Πληρωμής
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Notes */}
            {order.notes && (
              <div className='mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200'>
                <p className='text-sm font-semibold text-blue-900 mb-1'>
                  Σημειώσεις:
                </p>
                <p className='text-sm text-blue-700'>{order.notes}</p>
              </div>
            )}

            {/* Cancel Order Button */}
            {order.status !== 'cancelled' && (
              <div className='mt-6 flex justify-end'>
                <button
                  onClick={() => setShowCancelOrderModal(true)}
                  disabled={loading}
                  className='flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50'
                >
                  <XCircle className='w-5 h-5' />
                  Διαγραφή Παραγγελίας
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Cancel Order Modal */}
      <CancelOrderModal
        isOpen={showCancelOrderModal}
        onClose={() => setShowCancelOrderModal(false)}
        onConfirm={handleCancelOrder}
        title='Διαγραφή Παραγγελίας'
        message='Είστε σίγουροι ότι θέλετε να διαγράψετε ολόκληρη την παραγγελία; Η παραγγελία θα αφαιρεθεί οριστικά και το απόθεμα για τα μη πληρωμένα προϊόντα θα επιστραφεί.'
      />
    </>
  );
}
