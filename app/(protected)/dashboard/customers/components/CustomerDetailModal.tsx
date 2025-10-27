'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Mail, MapPin, Building2, Edit, Trash2 } from 'lucide-react';

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

interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
}

export default function CustomerDetailModal({
  isOpen,
  onClose,
  customer,
  onEdit,
  onDelete,
}: CustomerDetailModalProps) {
  if (!customer) return null;

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
            className='bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto'
          >
            {/* Header */}
            <div className='sticky top-0 bg-linear-to-r from-pink-500 to-purple-600 p-6 rounded-t-3xl'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                  <div className='w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg border-2 border-white/30'>
                    {customer.first_name[0]}
                    {customer.last_name[0]}
                  </div>
                  <div className='text-white'>
                    <h2 className='text-3xl font-bold'>
                      {customer.first_name} {customer.last_name}
                    </h2>
                    <p className='text-white/80 text-sm mt-1'>
                      Πληροφορίες Πελάτη
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className='p-2 hover:bg-white/20 rounded-full transition text-white'
                >
                  <X className='w-6 h-6' />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className='p-6 space-y-6'>
              {/* Contact Information */}
              <div>
                <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
                  <Phone className='w-5 h-5 text-purple-600' />
                  Στοιχεία Επικοινωνίας
                </h3>
                <div className='bg-gray-50 rounded-xl p-4 space-y-3'>
                  {customer.phone ? (
                    <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center'>
                        <Phone className='w-5 h-5 text-purple-600' />
                      </div>
                      <div>
                        <p className='text-xs text-gray-500'>Τηλέφωνο</p>
                        <p className='text-gray-900 font-medium'>
                          {customer.phone}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className='flex items-center gap-3 text-gray-400'>
                      <Phone className='w-5 h-5' />
                      <p className='text-sm'>Δεν έχει καταχωρηθεί τηλέφωνο</p>
                    </div>
                  )}

                  {customer.email ? (
                    <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center'>
                        <Mail className='w-5 h-5 text-pink-600' />
                      </div>
                      <div>
                        <p className='text-xs text-gray-500'>Email</p>
                        <p className='text-gray-900 font-medium'>
                          {customer.email}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className='flex items-center gap-3 text-gray-400'>
                      <Mail className='w-5 h-5' />
                      <p className='text-sm'>Δεν έχει καταχωρηθεί email</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Location Information */}
              <div>
                <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
                  <MapPin className='w-5 h-5 text-purple-600' />
                  Τοποθεσία
                </h3>
                <div className='bg-gray-50 rounded-xl p-4 space-y-3'>
                  {customer.city ? (
                    <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center'>
                        <Building2 className='w-5 h-5 text-purple-600' />
                      </div>
                      <div>
                        <p className='text-xs text-gray-500'>Πόλη</p>
                        <p className='text-gray-900 font-medium'>
                          {customer.city}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className='flex items-center gap-3 text-gray-400'>
                      <Building2 className='w-5 h-5' />
                      <p className='text-sm'>Δεν έχει καταχωρηθεί πόλη</p>
                    </div>
                  )}

                  {customer.address ? (
                    <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center'>
                        <MapPin className='w-5 h-5 text-pink-600' />
                      </div>
                      <div>
                        <p className='text-xs text-gray-500'>Διεύθυνση</p>
                        <p className='text-gray-900 font-medium'>
                          {customer.address}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className='flex items-center gap-3 text-gray-400'>
                      <MapPin className='w-5 h-5' />
                      <p className='text-sm'>Δεν έχει καταχωρηθεί διεύθυνση</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {customer.notes && (
                <div>
                  <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                    Σημειώσεις
                  </h3>
                  <div className='bg-yellow-50 border border-yellow-200 rounded-xl p-4'>
                    <p className='text-gray-700 whitespace-pre-wrap'>
                      {customer.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className='pt-4 border-t border-gray-200'>
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div>
                    <p className='text-gray-500'>ID Πελάτη</p>
                    <p className='text-gray-900 font-mono text-xs mt-1'>
                      {customer.id}
                    </p>
                  </div>
                  <div>
                    <p className='text-gray-500'>Δημιουργήθηκε</p>
                    <p className='text-gray-900 font-medium mt-1'>
                      {customer.created_at
                        ? new Date(customer.created_at).toLocaleDateString(
                            'el-GR',
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            }
                          )
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex gap-3 pt-4'>
                <motion.button
                  onClick={() => {
                    onClose();
                    onEdit(customer);
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className='flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all'
                >
                  <Edit className='w-5 h-5' />
                  Επεξεργασία
                </motion.button>
                <motion.button
                  onClick={() => {
                    onClose();
                    onDelete(customer.id);
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className='flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold shadow-lg hover:bg-red-600 transition-all'
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
