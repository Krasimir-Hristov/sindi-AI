'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export default function CancelOrderModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: CancelOrderModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-60 p-4'
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className='bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden'
          >
            {/* Header with Icon */}
            <div className='bg-linear-to-r from-red-500 to-orange-500 p-6'>
              <div className='flex items-center gap-4'>
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className='w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30'
                >
                  <AlertTriangle className='w-8 h-8 text-white' />
                </motion.div>
                <div className='text-white'>
                  <h3 className='text-2xl font-bold'>{title}</h3>
                  <p className='text-white/80 text-sm mt-1'>
                    Αυτή η ενέργεια δεν μπορεί να αναιρεθεί
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className='p-6'>
              <p className='text-gray-700 text-lg leading-relaxed'>{message}</p>
            </div>

            {/* Buttons */}
            <div className='flex gap-3 p-6 pt-0'>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className='flex-1 px-6 py-3 border-2 cursor-pointer border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all'
              >
                Όχι, Ακύρωση
              </motion.button>
              <motion.button
                onClick={onConfirm}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className='flex-1 px-6 py-3 bg-linear-to-r cursor-pointer from-red-500 to-orange-500 text-white rounded-xl font-semibold shadow-lg hover:from-red-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2'
              >
                <CheckCircle className='w-5 h-5' />
                Ναι, Ακύρωση
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
