'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Package } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description?: string;
  // sku removed
  category?: string;
  unit_price: number;
  stock_quantity: number;
  min_stock_level?: number;
  image_url?: string;
  is_active?: boolean;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: {
    name: string;
    description: string;
    category: string;
    unit_price: string;
    stock_quantity: string;
    min_stock_level: string;
    image_url: string;
    is_active: boolean;
  }) => void;
  product: Product | null;
  saving: boolean;
}

export default function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  product,
  saving,
}: ProductFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    unit_price: '0',
    stock_quantity: '0',
    min_stock_level: '0',
    image_url: '',
    is_active: true,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        category: product.category || '',
        unit_price: product.unit_price.toString(),
        stock_quantity: product.stock_quantity.toString(),
        min_stock_level: product.min_stock_level?.toString() || '0',
        image_url: product.image_url || '',
        is_active: product.is_active ?? true,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        unit_price: '0',
        stock_quantity: '0',
        min_stock_level: '0',
        image_url: '',
        is_active: true,
      });
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50'
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className='bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto'
        >
          {/* Header */}
          <div className='sticky top-0 bg-linear-to-r from-pink-500 to-purple-600 p-6 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-white/20 rounded-xl backdrop-blur-sm'>
                <Package className='w-6 h-6 text-white' />
              </div>
              <h2 className='text-2xl font-bold text-white'>
                {product ? 'Επεξεργασία Προϊόντος' : 'Νέο Προϊόν'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className='p-2 hover:bg-white/20 rounded-xl transition-colors'
            >
              <X className='w-6 h-6 text-white' />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className='p-6 space-y-6'>
            {/* Basic Info */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold text-gray-800'>
                Βασικές Πληροφορίες
              </h3>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='md:col-span-2'>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Όνομα Προϊόντος <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className='w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all'
                    placeholder='π.χ. Φόρεμα Καλοκαιρινό'
                  />
                </div>

                {/* SKU field removed */}

                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Κατηγορία
                  </label>
                  <input
                    type='text'
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className='w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all'
                    placeholder='π.χ. Φορέματα'
                  />
                </div>

                <div className='md:col-span-2'>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Περιγραφή
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className='w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all resize-none'
                    placeholder='Περιγραφή του προϊόντος...'
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold text-gray-800'>
                Τιμολόγηση & Απόθεμα
              </h3>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Τιμή Μονάδας (€) <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='number'
                    step='0.01'
                    min='0'
                    required
                    value={formData.unit_price}
                    onChange={(e) =>
                      setFormData({ ...formData, unit_price: e.target.value })
                    }
                    className='w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all'
                    placeholder='0.00'
                  />
                </div>

                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Απόθεμα <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='number'
                    min='0'
                    required
                    value={formData.stock_quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stock_quantity: e.target.value,
                      })
                    }
                    className='w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all'
                    placeholder='0'
                  />
                </div>

                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Ελάχιστο Απόθεμα
                  </label>
                  <input
                    type='number'
                    min='0'
                    value={formData.min_stock_level}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        min_stock_level: e.target.value,
                      })
                    }
                    className='w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all'
                    placeholder='0'
                  />
                </div>
              </div>
            </div>

            {/* Image & Status */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold text-gray-800'>
                Εικόνα & Κατάσταση
              </h3>

              <div className='grid grid-cols-1 gap-4'>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    URL Εικόνας
                  </label>
                  <input
                    type='url'
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData({ ...formData, image_url: e.target.value })
                    }
                    className='w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all'
                    placeholder='https://...'
                  />
                </div>

                <div className='flex items-center gap-3'>
                  <input
                    type='checkbox'
                    id='is_active'
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className='w-5 h-5 rounded border-2 border-purple-300 text-purple-600 focus:ring-4 focus:ring-purple-100'
                  />
                  <label
                    htmlFor='is_active'
                    className='text-sm font-semibold text-gray-700 cursor-pointer'
                  >
                    Ενεργό Προϊόν
                  </label>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className='flex gap-3 pt-4'>
              <motion.button
                type='button'
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className='flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all'
              >
                Ακύρωση
              </motion.button>
              <motion.button
                type='submit'
                disabled={saving}
                whileHover={{ scale: saving ? 1 : 1.02 }}
                whileTap={{ scale: saving ? 1 : 0.98 }}
                className='flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {saving ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      className='w-5 h-5 border-2 border-white border-t-transparent rounded-full'
                    />
                    Αποθήκευση...
                  </>
                ) : (
                  <>
                    <Save className='w-5 h-5' />
                    Αποθήκευση
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
