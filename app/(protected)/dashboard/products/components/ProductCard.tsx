'use client';

import { motion } from 'framer-motion';
import { Edit, Trash2, Package, AlertCircle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description?: string;
  category?: string;
  unit_price: number;
  stock_quantity: number;
  min_stock_level?: number;
  image_url?: string;
  is_active?: boolean;
}

interface ProductCardProps {
  product: Product;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export default function ProductCard({
  product,
  onView,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const isLowStock =
    product.min_stock_level &&
    product.stock_quantity <= product.min_stock_level;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onView(product)}
      className='bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-purple-100 cursor-pointer group'
    >
      {/* Product Image */}
      <div className='relative h-48 bg-linear-to-br from-pink-100 to-purple-100 flex items-center justify-center'>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className='w-full h-full object-cover'
          />
        ) : (
          <Package className='w-20 h-20 text-purple-300' />
        )}
        {isLowStock && (
          <div className='absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg'>
            <AlertCircle className='w-3 h-3' />
            Χαμηλό Απόθεμα
          </div>
        )}
        {!product.is_active && (
          <div className='absolute top-3 left-3 bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg'>
            Ανενεργό
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className='p-6'>
        <div className='flex items-start justify-between mb-3'>
          <div className='flex-1'>
            <h3 className='text-xl font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors'>
              {product.name}
            </h3>
          </div>
        </div>

        {product.description && (
          <p className='text-sm text-gray-600 mb-4 line-clamp-2'>
            {product.description}
          </p>
        )}

        {product.category && (
          <div className='mb-4'>
            <span className='inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold'>
              {product.category}
            </span>
          </div>
        )}

        {/* Price and Stock */}
        <div className='flex items-center justify-between mb-4 pb-4 border-b border-gray-100'>
          <div>
            <p className='text-xs text-gray-500'>Τιμή</p>
            <p className='text-2xl font-bold text-purple-600'>
              €{product.unit_price.toFixed(2)}
            </p>
          </div>
          <div className='text-right'>
            <p className='text-xs text-gray-500'>Απόθεμα</p>
            <p
              className={`text-2xl font-bold ${
                isLowStock ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {product.stock_quantity}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex gap-2'>
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(product);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className='flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all'
          >
            <Edit className='w-4 h-4' />
            Επεξεργασία
          </motion.button>
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(product.id);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className='px-4 py-2 bg-red-500 text-white rounded-xl font-semibold shadow-md hover:shadow-lg hover:bg-red-600 transition-all'
          >
            <Trash2 className='w-4 h-4' />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
