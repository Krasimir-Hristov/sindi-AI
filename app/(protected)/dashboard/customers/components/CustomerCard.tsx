'use client';

import { motion } from 'framer-motion';
import { Phone, Mail, Building2, Edit, Trash2 } from 'lucide-react';

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface CustomerCardProps {
  customer: Customer;
  index: number;
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

export default function CustomerCard({
  customer,
  index,
  onView,
  onEdit,
  onDelete,
}: CustomerCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className='bg-white rounded-2xl shadow-lg border border-purple-100 hover:shadow-xl transition-all overflow-hidden'
    >
      {/* Clickable Card Content */}
      <div
        onClick={() => onView(customer)}
        className='p-6 cursor-pointer hover:bg-gray-50 transition-colors'
      >
        <div className='flex items-start justify-between mb-4'>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 bg-linear-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md'>
              {customer.first_name[0]}
              {customer.last_name[0]}
            </div>
            <div>
              <h3 className='font-bold text-gray-900 text-lg'>
                {customer.first_name} {customer.last_name}
              </h3>
            </div>
          </div>
        </div>

        <div className='space-y-2'>
          {customer.phone && (
            <div className='flex items-center gap-2 text-sm text-gray-600'>
              <Phone className='w-4 h-4 text-purple-500' />
              {customer.phone}
            </div>
          )}
          {customer.email && (
            <div className='flex items-center gap-2 text-sm text-gray-600'>
              <Mail className='w-4 h-4 text-purple-500' />
              {customer.email}
            </div>
          )}
          {customer.city && (
            <div className='flex items-center gap-2 text-sm text-gray-600'>
              <Building2 className='w-4 h-4 text-purple-500' />
              {customer.city}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex gap-2 px-6 pb-4 border-t border-gray-100 pt-4'>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(customer);
          }}
          className='flex-1 flex items-center justify-center gap-2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition'
        >
          <Edit className='w-4 h-4' />
          <span className='text-sm font-medium'>Επεξεργασία</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(customer.id);
          }}
          className='flex-1 flex items-center justify-center gap-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition'
        >
          <Trash2 className='w-4 h-4' />
          <span className='text-sm font-medium'>Διαγραφή</span>
        </button>
      </div>
    </motion.div>
  );
}
