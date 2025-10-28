'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  icon?: LucideIcon;
  confirmButtonText?: string;
  confirmButtonColor?: 'red' | 'blue' | 'green';
  additionalContent?: ReactNode;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  icon: Icon = AlertTriangle,
  confirmButtonText = 'Ναι, Διαγραφή',
  confirmButtonColor = 'red',
  additionalContent,
}: ConfirmModalProps) {
  const getButtonColors = () => {
    switch (confirmButtonColor) {
      case 'blue':
        return 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700';
      case 'green':
        return 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700';
      default:
        return 'from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600';
    }
  };

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
            <div className={`bg-linear-to-r ${confirmButtonColor === 'blue' ? 'from-blue-500 to-blue-600' : confirmButtonColor === 'green' ? 'from-green-500 to-green-600' : 'from-red-500 to-orange-500'} p-6`}>
              <div className='flex items-center gap-4'>
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className='w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30'
                >
                  <Icon className='w-8 h-8 text-white' />
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
              <p className='text-gray-700 text-lg leading-relaxed mb-4'>{message}</p>
              {additionalContent}
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
                className={`flex-1 px-6 py-3 bg-linear-to-r cursor-pointer ${getButtonColors()} text-white rounded-xl font-semibold shadow-lg transition-all flex items-center justify-center gap-2`}
              >
                <CheckCircle className='w-5 h-5' />
                {confirmButtonText}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}