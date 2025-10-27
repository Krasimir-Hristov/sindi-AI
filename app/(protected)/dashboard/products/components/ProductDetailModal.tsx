'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Package,
  Euro,
  Boxes,
  AlertCircle,
  Edit,
  Trash2,
  Tag,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  category?: string;
  unit_price: number;
  stock_quantity: number;
  min_stock_level?: number;
  image_url?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export default function ProductDetailModal({
  isOpen,
  onClose,
  product,
  onEdit,
  onDelete,
}: ProductDetailModalProps) {
  if (!product) return null;

  const isLowStock =
    product.min_stock_level && product.stock_quantity <= product.min_stock_level;

  return (
    <AnimatePresence>
      {isOpen && (
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
            className='bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'
          >
            {/* Header with Product Image */}
            <div className='relative h-80 bg-linear-to-br from-pink-500 to-purple-600'>
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className='w-full h-full object-cover'
                />
              ) : (
                <div className='w-full h-full flex items-center justify-center'>
                  <Package className='w-32 h-32 text-white/50' />
                </div>
              )}

              {/* Status Badges */}
              <div className='absolute top-4 left-4 flex gap-2'>
                {isLowStock && (
                  <div className='bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg'>
                    <AlertCircle className='w-4 h-4' />
                    Χαμηλό Απόθεμα
                  </div>
                )}
                {!product.is_active && (
                  <div className='bg-gray-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg'>
                    Ανενεργό
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className='absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-colors'
              >
                <X className='w-6 h-6 text-white' />
              </button>

              {/* Product Name Overlay */}
              <div className='absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-8'>
                <h2 className='text-4xl font-bold text-white mb-2'>
                  {product.name}
                </h2>
                {product.sku && (
                  <p className='text-white/80 font-mono text-sm'>
                    SKU: {product.sku}
                  </p>
                )}
              </div>
            </div>

            {/* Content */}
            <div className='p-8 space-y-6'>
              {/* Description */}
              {product.description && (
                <div>
                  <h3 className='text-lg font-semibold text-gray-800 mb-2'>
                    Περιγραφή
                  </h3>
                  <p className='text-gray-600 leading-relaxed'>
                    {product.description}
                  </p>
                </div>
              )}

              {/* Category */}
              {product.category && (
                <div>
                  <h3 className='text-lg font-semibold text-gray-800 mb-3'>
                    Κατηγορία
                  </h3>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center'>
                      <Tag className='w-5 h-5 text-purple-600' />
                    </div>
                    <span className='px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-semibold'>
                      {product.category}
                    </span>
                  </div>
                </div>
              )}

              {/* Price & Stock Grid */}
              <div>
                <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                  Τιμολόγηση & Απόθεμα
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  {/* Unit Price */}
                  <div className='bg-linear-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-100'>
                    <div className='flex items-center gap-3 mb-2'>
                      <div className='w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center'>
                        <Euro className='w-5 h-5 text-green-600' />
                      </div>
                      <p className='text-sm text-gray-600 font-semibold'>
                        Τιμή Μονάδας
                      </p>
                    </div>
                    <p className='text-3xl font-bold text-green-600'>
                      €{product.unit_price.toFixed(2)}
                    </p>
                  </div>

                  {/* Stock Quantity */}
                  <div
                    className={`rounded-xl p-6 border-2 ${
                      isLowStock
                        ? 'bg-linear-to-br from-red-50 to-orange-50 border-red-100'
                        : 'bg-linear-to-br from-blue-50 to-cyan-50 border-blue-100'
                    }`}
                  >
                    <div className='flex items-center gap-3 mb-2'>
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isLowStock ? 'bg-red-100' : 'bg-blue-100'
                        }`}
                      >
                        <Boxes
                          className={`w-5 h-5 ${
                            isLowStock ? 'text-red-600' : 'text-blue-600'
                          }`}
                        />
                      </div>
                      <p className='text-sm text-gray-600 font-semibold'>
                        Διαθέσιμο Απόθεμα
                      </p>
                    </div>
                    <p
                      className={`text-3xl font-bold ${
                        isLowStock ? 'text-red-600' : 'text-blue-600'
                      }`}
                    >
                      {product.stock_quantity}
                    </p>
                  </div>

                  {/* Min Stock Level */}
                  {product.min_stock_level !== undefined && (
                    <div className='bg-linear-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-100'>
                      <div className='flex items-center gap-3 mb-2'>
                        <div className='w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center'>
                          <AlertCircle className='w-5 h-5 text-purple-600' />
                        </div>
                        <p className='text-sm text-gray-600 font-semibold'>
                          Ελάχιστο Απόθεμα
                        </p>
                      </div>
                      <p className='text-3xl font-bold text-purple-600'>
                        {product.min_stock_level}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div className='bg-gray-50 rounded-xl p-4 border border-gray-200'>
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  {product.created_at && (
                    <div>
                      <p className='text-gray-500 mb-1'>Δημιουργήθηκε</p>
                      <p className='text-gray-900 font-semibold'>
                        {new Date(product.created_at).toLocaleDateString('el-GR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                  {product.updated_at && (
                    <div>
                      <p className='text-gray-500 mb-1'>Ενημερώθηκε</p>
                      <p className='text-gray-900 font-semibold'>
                        {new Date(product.updated_at).toLocaleDateString('el-GR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex gap-3 pt-4'>
                <motion.button
                  onClick={() => onEdit(product)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className='flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all'
                >
                  <Edit className='w-5 h-5' />
                  Επεξεργασία
                </motion.button>
                <motion.button
                  onClick={() => onDelete(product.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className='flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:bg-red-600 transition-all'
                >
                  <Trash2 className='w-5 h-5' />
                  Διαγραφή
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
