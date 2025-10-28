'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';
import { createOrder } from '@/lib/actions/orders';
import { getCustomers } from '@/lib/actions/customers';
import { getProducts } from '@/lib/actions/products';

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface OrderItem {
  product_id: string;
  quantity: number;
  productName?: string;
  unitPrice?: number;
  maxStock?: number;
}

export default function OrderFormModal({
  isOpen,
  onClose,
  onSuccess,
}: OrderFormModalProps) {
  const [clients, setClients] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    const [clientsData, productsData] = await Promise.all([
      getCustomers(),
      getProducts(),
    ]);

    if (clientsData?.data) setClients(clientsData.data);
    if (productsData) setProducts(productsData);
  };

  const addItem = () => {
    setOrderItems([...orderItems, { product_id: '', quantity: 0 }]);
  };

  const removeItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...orderItems];
    if (field === 'product_id') {
      const product = products.find((p) => p.id === value);
      newItems[index] = {
        ...newItems[index],
        product_id: value,
        productName: product?.name,
        unitPrice: product?.unit_price,
        maxStock: product?.stock_quantity,
        quantity: 0,
      };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setOrderItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedClientId) {
      setError('Παρακαλώ επιλέξτε πελάτη');
      return;
    }

    if (orderItems.length === 0) {
      setError('Παρακαλώ προσθέστε τουλάχιστον ένα προϊόν');
      return;
    }

    // Validate all items
    for (const item of orderItems) {
      if (!item.product_id) {
        setError('Παρακαλώ επιλέξτε προϊόν για όλα τα στοιχεία');
        return;
      }
      if (item.quantity <= 0) {
        setError('Η ποσότητα πρέπει να είναι μεγαλύτερη από 0');
        return;
      }
      if (item.maxStock && item.quantity > item.maxStock) {
        setError(`Ανεπαρκές απόθεμα για ${item.productName}`);
        return;
      }
    }

    setLoading(true);

    const result = await createOrder(
      selectedClientId,
      orderItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
      notes || undefined
    );

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      onSuccess();
    }
  };

  const totalAmount = orderItems.reduce(
    (sum, item) => sum + (item.unitPrice || 0) * item.quantity,
    0
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-linear-to-r from-purple-600 to-pink-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Νέα Παραγγελία</h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                    {error}
                  </div>
                )}

                {/* Client Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Πελάτης *
                  </label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Επιλέξτε πελάτη</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.first_name} {client.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-semibold text-gray-700">
                      Προϊόντα *
                    </label>
                    <button
                      type="button"
                      onClick={addItem}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Προσθήκη
                    </button>
                  </div>

                  <div className="space-y-4">
                    {orderItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex gap-4 items-start p-4 bg-gray-50 rounded-xl"
                      >
                        {/* Product Selection */}
                        <div className="flex-1">
                          <select
                            value={item.product_id}
                            onChange={(e) =>
                              updateItem(index, 'product_id', e.target.value)
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            required
                          >
                            <option value="">Επιλέξτε προϊόν</option>
                            {products.map((product) => (
                              <option
                                key={product.id}
                                value={product.id}
                                disabled={product.stock_quantity === 0}
                              >
                                {product.name} (Απόθεμα: {product.stock_quantity})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity */}
                        <div className="w-32">
                          <input
                            type="number"
                            min="1"
                            max={item.maxStock || 999}
                            value={item.quantity === 0 ? '' : item.quantity}
                            onChange={(e) => {
                              const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                              updateItem(index, 'quantity', value);
                            }}
                            placeholder="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            required
                          />
                          {item.maxStock && item.quantity > item.maxStock && (
                            <p className="text-xs text-red-500 mt-1">
                              Μέγιστο: {item.maxStock}
                            </p>
                          )}
                        </div>

                        {/* Price */}
                        {item.unitPrice && (
                          <div className="w-32 px-4 py-2 bg-white rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-600">Σύνολο</p>
                            <p className="font-semibold">
                              €{(item.unitPrice * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        )}

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}

                    {orderItems.length === 0 && (
                      <p className="text-center text-gray-500 py-8">
                        Δεν έχουν προστεθεί προϊόντα. Κάντε κλικ στο "Προσθήκη" για να ξεκινήσετε.
                      </p>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Σημειώσεις
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    placeholder="Προαιρετικές σημειώσεις..."
                  />
                </div>

                {/* Total */}
                {orderItems.length > 0 && (
                  <div className="mb-6 p-4 bg-purple-50 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-700">
                        Συνολικό Ποσό:
                      </span>
                      <span className="text-2xl font-bold text-purple-600">
                        €{totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Ακύρωση
                  </button>
                  <button
                    type="submit"
                    disabled={loading || orderItems.length === 0}
                    className="flex-1 px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Δημιουργία...' : 'Δημιουργία Παραγγελίας'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
