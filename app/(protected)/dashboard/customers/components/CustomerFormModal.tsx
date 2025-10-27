'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  notes?: string;
}

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    notes: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      first_name: string;
      last_name: string;
      phone: string;
      email: string;
      address: string;
      city: string;
      notes: string;
    }>
  >;
  editingCustomer: Customer | null;
  saving: boolean;
}

export default function CustomerFormModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  editingCustomer,
  saving,
}: CustomerFormModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className='bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'
          >
            <div className='sticky top-0 bg-white border-b border-purple-100 p-6 flex items-center justify-between z-10'>
              <h2 className='text-2xl font-bold bg-linear-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent'>
                {editingCustomer ? 'Επεξεργασία Πελάτη' : 'Νέος Πελάτης'}
              </h2>
              <button
                onClick={onClose}
                className='p-2 hover:bg-gray-100 rounded-lg transition'
              >
                <X className='w-6 h-6' />
              </button>
            </div>

            <form onSubmit={onSubmit} className='p-6 space-y-6'>
              {/* Name Fields */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Όνομα *
                  </label>
                  <input
                    type='text'
                    required
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                    className='w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition'
                    placeholder='Όνομα'
                  />
                </div>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Επώνυμο *
                  </label>
                  <input
                    type='text'
                    required
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                    className='w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition'
                    placeholder='Επώνυμο'
                  />
                </div>
              </div>

              {/* Contact Fields */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Τηλέφωνο
                  </label>
                  <input
                    type='tel'
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className='w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition'
                    placeholder='+30 123 456 7890'
                  />
                </div>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Email
                  </label>
                  <input
                    type='email'
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className='w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition'
                    placeholder='email@example.com'
                  />
                </div>
              </div>

              {/* Address Fields */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Διεύθυνση
                </label>
                <input
                  type='text'
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className='w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition'
                  placeholder='Οδός και αριθμός'
                />
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Πόλη
                </label>
                <input
                  type='text'
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className='w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition'
                  placeholder='Πόλη'
                />
              </div>

              {/* Notes */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Σημειώσεις
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                  className='w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition resize-none'
                  placeholder='Προσθέστε σημειώσεις...'
                />
              </div>

              {/* Buttons */}
              <div className='flex gap-3'>
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
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className='flex-1 px-6 py-3 bg-linear-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2'
                >
                  <Save className='w-5 h-5' />
                  {saving ? 'Αποθήκευση...' : 'Αποθήκευση'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
