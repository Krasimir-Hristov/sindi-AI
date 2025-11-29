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
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
} from 'lucide-react';
import {
  updateOrderPayment,
  cancelOrder,
  payFullOrder,
  updateOrderItemQuantity,
  deleteOrderItem,
} from '@/lib/actions/orders';
import ConfirmModal from '@/components/shared/ConfirmModal';

interface OrderCardProps {
  order: any;
  onUpdate: () => void;
}

export default function OrderCard({ order, onUpdate }: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    title: string;
    message: string;
    icon?: any;
    confirmButtonText?: string;
    onConfirm: () => void;
    additionalContent?: any;
  } | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [tempPaidQuantities, setTempPaidQuantities] = useState<
    Record<string, number>
  >({});
  const [editingQuantityId, setEditingQuantityId] = useState<string | null>(
    null
  );
  const [tempQuantities, setTempQuantities] = useState<Record<string, number>>(
    {}
  );

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
    setTempPaidQuantities({
      ...tempPaidQuantities,
      [itemId]: currentPaidQuantity,
    });
  };

  const cancelEditing = () => {
    setEditingItemId(null);
  };

  const savePayment = (itemId: string) => {
    handlePaymentUpdate(itemId, tempPaidQuantities[itemId] || 0);
  };

  const openCancelOrderModal = () => {
    setConfirmModalConfig({
      title: 'Διαγραφή Παραγγελίας',
      message:
        'Είστε σίγουροι ότι θέλετε να διαγράψετε ολόκληρη την παραγγελία; Η παραγγελία θα αφαιρεθεί οριστικά και το απόθεμα για τα μη πληρωμένα προϊόντα θα επιστραφεί.',
      icon: AlertTriangle,
      confirmButtonText: 'Ναι, Ακύρωση',
      onConfirm: handleCancelOrder,
    });
    setShowConfirmModal(true);
  };

  const handleCancelOrder = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    const result = await cancelOrder(order.id);
    setLoading(false);

    if (result.success) {
      onUpdate();
    } else {
      alert(result.error || 'Σφάλμα κατά την ακύρωση παραγγελίας');
    }
  };

  const handlePayFullOrder = async () => {
    setLoading(true);
    const result = await payFullOrder(order.id);
    setLoading(false);

    if (result.success) {
      onUpdate();
    } else {
      alert(result.error || 'Σφάλμα κατά την πληρωμή');
    }
  };

  const handleQuantityUpdate = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      alert('Η ποσότητα πρέπει να είναι μεγαλύτερη από 0');
      return;
    }

    setLoading(true);
    const result = await updateOrderItemQuantity(order.id, itemId, newQuantity);
    setLoading(false);

    if (result.success) {
      setEditingQuantityId(null);
      onUpdate();
    } else {
      alert(result.error || 'Σφάλμα κατά την ενημέρωση της ποσότητας');
    }
  };

  const handleDeleteItem = async (itemId: string, productName: string) => {
    setConfirmModalConfig({
      title: 'Διαγραφή Προϊόντος',
      message: `Είστε σίγουροι ότι θέλετε να διαγράψετε το προϊόν "${productName}" από αυτή την παραγγελία;`,
      icon: Package,
      confirmButtonText: 'Ναι, Διαγραφή',
      onConfirm: () => confirmDeleteItem(itemId),
      additionalContent: (
        <div className='bg-amber-50 border border-amber-200 rounded-xl p-4'>
          <div className='flex items-start gap-3'>
            <div className='w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center mt-0.5'>
              <span className='text-white text-xs'>⚠️</span>
            </div>
            <div>
              <p className='text-amber-800 text-sm font-medium mb-1'>
                Σημαντικό:
              </p>
              <p className='text-amber-700 text-sm'>
                Το απόθεμα για τα μη πληρωμένα τεμάχια θα επιστραφεί αυτόματα.
                Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.
              </p>
            </div>
          </div>
        </div>
      ),
    });
    setShowConfirmModal(true);
  };

  const confirmDeleteItem = async (itemId: string) => {
    setShowConfirmModal(false);
    setLoading(true);
    const result = await deleteOrderItem(order.id, itemId);
    setLoading(false);

    if (result.success) {
      onUpdate();
    } else {
      alert(result.error || 'Σφάλμα κατά τη διαγραφή του προϊόντος');
    }
  };

  const startEditingQuantity = (itemId: string, currentQuantity: number) => {
    setEditingQuantityId(itemId);
    setTempQuantities({
      ...tempQuantities,
      [itemId]: currentQuantity,
    });
  };

  const cancelQuantityEditing = () => {
    setEditingQuantityId(null);
  };

  const saveQuantity = (itemId: string) => {
    handleQuantityUpdate(itemId, tempQuantities[itemId] || 0);
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
          className='p-3 sm:p-4 lg:p-6 cursor-pointer hover:bg-gray-50 transition-colors'
        >
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4'>
            <div className='flex items-center gap-3 flex-1 min-w-0'>
              {/* Client Info */}
              <div className='flex items-center gap-2 sm:gap-3 min-w-0 flex-1'>
                <div className='p-2 sm:p-3 bg-purple-100 rounded-xl flex-shrink-0'>
                  <User className='w-4 h-4 sm:w-5 sm:h-5 text-purple-600' />
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='font-semibold text-gray-900 text-sm sm:text-base truncate'>
                    {order.client.first_name} {order.client.last_name}
                  </p>
                  <p className='text-xs sm:text-sm text-gray-500 truncate'>
                    {order.client.phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Info - Stacked on mobile, row on desktop */}
            <div className='flex items-center justify-between sm:justify-end gap-2 sm:gap-4 lg:gap-6'>
              {/* Total Amount */}
              <div className='text-left sm:text-right'>
                <p className='text-xs text-gray-500'>Σύνολο</p>
                <p className='font-semibold text-gray-900 text-sm sm:text-base'>
                  €{order.total_amount.toFixed(2)}
                </p>
              </div>

              {/* Paid Amount */}
              <div className='text-left sm:text-right'>
                <p className='text-xs text-gray-500'>Πληρωμένο</p>
                <p className='font-semibold text-green-600 text-sm sm:text-base'>
                  €{order.paid_amount.toFixed(2)}
                </p>
              </div>

              {/* Remaining Amount - Hidden on very small screens */}
              <div className='hidden xs:block text-left sm:text-right'>
                <p className='text-xs text-gray-500'>Υπόλοιπο</p>
                <p className='font-semibold text-orange-600 text-sm sm:text-base'>
                  €{(order.total_amount - order.paid_amount).toFixed(2)}
                </p>
              </div>

              {/* Status */}
              <div
                className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg border ${getStatusColor(
                  order.status
                )} flex items-center gap-1 sm:gap-2 font-semibold text-xs sm:text-sm whitespace-nowrap`}
              >
                {getStatusIcon(order.status)}
                <span className='hidden xs:inline'>
                  {getStatusText(order.status)}
                </span>
              </div>

              {/* Expand Icon */}
              <div className='text-gray-400 flex-shrink-0'>
                {expanded ? (
                  <ChevronUp className='w-4 h-4 sm:w-5 sm:h-5' />
                ) : (
                  <ChevronDown className='w-4 h-4 sm:w-5 sm:h-5' />
                )}
              </div>
            </div>
          </div>

          {/* Date */}
          <div className='mt-3 sm:mt-4 flex items-center gap-2 text-xs sm:text-sm text-gray-500'>
            <Clock className='w-3 h-3 sm:w-4 sm:h-4' />
            <span className='truncate'>
              {new Date(order.created_at).toLocaleString('el-GR')}
            </span>
          </div>
        </div>

        {/* Expanded Content */}
        {expanded && (
          <div className='border-t border-gray-100 p-3 sm:p-4 lg:p-6 bg-gray-50'>
            {/* Order Items */}
            <div className='space-y-3 sm:space-y-4'>
              {order.order_items.map((item: any) => (
                <div
                  key={item.id}
                  className='bg-white p-3 sm:p-4 rounded-xl border border-gray-200'
                >
                  <div className='flex items-start sm:items-center justify-between mb-2 sm:mb-3 gap-2'>
                    <div className='flex items-center gap-2 sm:gap-3 min-w-0 flex-1'>
                      <Package className='w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0' />
                      <div className='min-w-0 flex-1'>
                        <p className='font-semibold text-gray-900 text-sm sm:text-base truncate'>
                          {item.product.name}
                        </p>
                      </div>
                    </div>

                    {/* Item Actions */}
                    {order.status !== 'cancelled' && (
                      <div className='flex gap-1 sm:gap-2 flex-shrink-0'>
                        <button
                          onClick={() =>
                            startEditingQuantity(item.id, item.quantity)
                          }
                          disabled={loading}
                          className='p-1.5 sm:p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50'
                          title='Επεξεργασία Ποσότητας'
                        >
                          <Edit className='w-3.5 h-3.5 sm:w-4 sm:h-4' />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteItem(item.id, item.product.name)
                          }
                          disabled={loading}
                          className='p-1.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50'
                          title='Διαγραφή Προϊόντος'
                        >
                          <Trash2 className='w-3.5 h-3.5 sm:w-4 sm:h-4' />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Quantity Editing */}
                  {editingQuantityId === item.id ? (
                    <div className='mb-2 sm:mb-3 p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200'>
                      <div className='flex flex-wrap items-center gap-2 sm:gap-3'>
                        <label className='text-xs sm:text-sm font-semibold text-blue-900'>
                          Ποσότητα:
                        </label>
                        <input
                          type='number'
                          min='1'
                          value={tempQuantities[item.id] || item.quantity}
                          onChange={(e) =>
                            setTempQuantities({
                              ...tempQuantities,
                              [item.id]: parseInt(e.target.value) || 1,
                            })
                          }
                          className='w-16 sm:w-20 px-2 sm:px-3 py-1.5 sm:py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-semibold text-sm'
                          disabled={loading}
                        />
                        <button
                          onClick={() => saveQuantity(item.id)}
                          disabled={
                            loading ||
                            (tempQuantities[item.id] || item.quantity) <= 0
                          }
                          className='p-1.5 sm:p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50'
                        >
                          <CheckCircle className='w-3.5 h-3.5 sm:w-4 sm:h-4' />
                        </button>
                        <button
                          onClick={cancelQuantityEditing}
                          disabled={loading}
                          className='p-1.5 sm:p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50'
                        >
                          <XCircle className='w-3.5 h-3.5 sm:w-4 sm:h-4' />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className='mb-2 sm:mb-3'>
                      <p className='text-xs sm:text-sm text-gray-600'>
                        Ποσότητα:{' '}
                        <span className='font-semibold'>{item.quantity}</span>
                      </p>
                    </div>
                  )}

                  {/* Product Financial Summary */}
                  <div className='grid grid-cols-3 gap-2 sm:gap-3 mb-2 sm:mb-3 p-2 sm:p-3 bg-gray-50 rounded-lg'>
                    <div className='text-center'>
                      <p className='text-xs text-gray-500 mb-0.5 sm:mb-1'>
                        Σύνολο
                      </p>
                      <p className='font-semibold text-gray-900 text-xs sm:text-sm lg:text-base'>
                        €{(item.unit_price * item.quantity).toFixed(2)}
                      </p>
                      <p className='text-xs text-gray-400 hidden sm:block'>
                        €{item.unit_price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <div className='text-center'>
                      <p className='text-xs text-gray-500 mb-0.5 sm:mb-1'>
                        Πληρωμένο
                      </p>
                      <p className='font-semibold text-green-600 text-xs sm:text-sm lg:text-base'>
                        €{(item.unit_price * item.paid_quantity).toFixed(2)}
                      </p>
                      <p className='text-xs text-gray-400 hidden sm:block'>
                        {item.paid_quantity} τεμ.
                      </p>
                    </div>
                    <div className='text-center'>
                      <p className='text-xs text-gray-500 mb-0.5 sm:mb-1'>
                        Υπόλοιπο
                      </p>
                      <p className='font-semibold text-orange-600 text-xs sm:text-sm lg:text-base'>
                        €
                        {(
                          item.unit_price *
                          (item.quantity - item.paid_quantity)
                        ).toFixed(2)}
                      </p>
                      <p className='text-xs text-gray-400 hidden sm:block'>
                        {item.quantity - item.paid_quantity} τεμ.
                      </p>
                    </div>
                  </div>

                  {/* Payment Progress Bar */}
                  <div className='mb-2 sm:mb-3'>
                    <div className='flex items-center justify-between mb-1.5 sm:mb-2'>
                      <span className='text-xs sm:text-sm text-gray-600'>
                        Πρόοδος Πληρωμής:
                      </span>
                      <span className='font-semibold text-purple-600 text-xs sm:text-sm'>
                        {item.paid_quantity} / {item.quantity}
                      </span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-1.5 sm:h-2'>
                      <div
                        className='bg-green-500 h-1.5 sm:h-2 rounded-full transition-all'
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
                    <div className='flex flex-wrap gap-2 items-center justify-end'>
                      {editingItemId === item.id ? (
                        <>
                          {/* Edit Mode */}
                          <input
                            type='number'
                            min='0'
                            max={item.quantity}
                            value={tempPaidQuantities[item.id] || 0}
                            onChange={(e) =>
                              setTempPaidQuantities({
                                ...tempPaidQuantities,
                                [item.id]: parseInt(e.target.value) || 0,
                              })
                            }
                            className='w-16 sm:w-20 px-2 sm:px-3 py-1.5 sm:py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center font-semibold text-sm'
                            disabled={loading}
                          />
                          <button
                            onClick={() => savePayment(item.id)}
                            disabled={
                              loading ||
                              (tempPaidQuantities[item.id] || 0) < 0 ||
                              (tempPaidQuantities[item.id] || 0) > item.quantity
                            }
                            className='p-1.5 sm:p-2 sm:px-3 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50'
                          >
                            <CheckCircle className='w-4 h-4' />
                          </button>
                          <button
                            onClick={cancelEditing}
                            disabled={loading}
                            className='p-1.5 sm:p-2 sm:px-3 sm:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50'
                          >
                            <XCircle className='w-4 h-4' />
                          </button>
                        </>
                      ) : (
                        <>
                          {/* View Mode */}
                          {item.paid_quantity < item.quantity && (
                            <button
                              onClick={() =>
                                handlePaymentUpdate(item.id, item.quantity)
                              }
                              disabled={loading}
                              className='px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2'
                            >
                              <DollarSign className='w-3.5 h-3.5 sm:w-4 sm:h-4' />
                              <span className='hidden sm:inline'>
                                Πλήρης Πληρωμή
                              </span>
                              <span className='sm:hidden'>Πληρωμή</span>
                            </button>
                          )}
                          <button
                            onClick={() =>
                              startEditing(item.id, item.paid_quantity)
                            }
                            disabled={loading}
                            className='px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50 text-xs sm:text-sm font-semibold'
                          >
                            <span className='hidden sm:inline'>
                              Επεξεργασία Πληρωμής
                            </span>
                            <span className='sm:hidden'>Επεξ. Πληρ.</span>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Notes */}
            {order.notes && (
              <div className='mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-200'>
                <p className='text-xs sm:text-sm font-semibold text-blue-900 mb-1'>
                  Σημειώσεις:
                </p>
                <p className='text-xs sm:text-sm text-blue-700'>
                  {order.notes}
                </p>
              </div>
            )}

            {/* Cancel Order Button */}
            {order.status !== 'cancelled' && (
              <div className='mt-4 sm:mt-6 flex flex-wrap justify-end gap-2 sm:gap-3'>
                {order.status !== 'paid' && (
                  <button
                    onClick={handlePayFullOrder}
                    disabled={loading}
                    className='flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 text-xs sm:text-sm lg:text-base'
                  >
                    <DollarSign className='w-4 h-4 sm:w-5 sm:h-5' />
                    <span className='hidden sm:inline'>
                      Πλήρης Πληρωμή Παραγγελίας
                    </span>
                    <span className='sm:hidden'>Πλήρης Πληρ.</span>
                  </button>
                )}
                <button
                  onClick={openCancelOrderModal}
                  disabled={loading}
                  className='flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 text-xs sm:text-sm lg:text-base'
                >
                  <XCircle className='w-4 h-4 sm:w-5 sm:h-5' />
                  <span className='hidden sm:inline'>Διαγραφή Παραγγελίας</span>
                  <span className='sm:hidden'>Διαγραφή</span>
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Confirm Modal */}
      {confirmModalConfig && (
        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => {
            setShowConfirmModal(false);
            setConfirmModalConfig(null);
          }}
          onConfirm={confirmModalConfig.onConfirm}
          title={confirmModalConfig.title}
          message={confirmModalConfig.message}
          icon={confirmModalConfig.icon}
          confirmButtonText={confirmModalConfig.confirmButtonText}
          additionalContent={confirmModalConfig.additionalContent}
        />
      )}
    </>
  );
}
