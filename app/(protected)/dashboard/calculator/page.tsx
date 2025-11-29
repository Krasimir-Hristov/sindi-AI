'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calculator,
  TrendingDown,
  TrendingUp,
  DollarSign,
  RotateCcw,
} from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

export default function CalculatorPage() {
  const { settings, loading, updateSettings } = useSettings();
  const [buyPrice, setBuyPrice] = useState<string>('0');
  const [sellPrice, setSellPrice] = useState<string>('0');
  const [quantity, setQuantity] = useState<string>('1');

  // Load from database on mount
  useEffect(() => {
    if (!loading && settings) {
      setBuyPrice(settings.buy_price.toString());
      setSellPrice(settings.sell_price.toString());
    }
  }, [settings, loading]);

  // Auto-save to database whenever values change (debounced)
  useEffect(() => {
    const buyNum = parseFloat(buyPrice);
    const sellNum = parseFloat(sellPrice);

    if (isNaN(buyNum) || isNaN(sellNum) || loading) return;

    const timer = setTimeout(() => {
      updateSettings(buyNum, sellNum).catch((err) => {
        console.error('Error auto-saving calculator:', err);
      });
    }, 1000); // Debounce 1 second

    return () => clearTimeout(timer);
  }, [buyPrice, sellPrice, updateSettings, loading]);

  const handleReset = async () => {
    setBuyPrice('0');
    setSellPrice('0');
    setQuantity('1');
    try {
      await updateSettings(0, 0);
    } catch (err) {
      console.error('Error resetting calculator:', err);
    }
  };

  const profit = parseFloat(sellPrice) - parseFloat(buyPrice);
  const profitPercentage =
    parseFloat(buyPrice) > 0
      ? ((profit / parseFloat(buyPrice)) * 100).toFixed(2)
      : '0';

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className='w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full'
        />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial='hidden'
      animate='visible'
      className='space-y-8'
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className='bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-purple-100'
      >
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div className='flex items-center gap-3 sm:gap-4'>
            <div className='p-2 sm:p-3 lg:p-4 bg-linear-to-br from-pink-500 to-purple-600 rounded-2xl shadow-lg flex-shrink-0'>
              <Calculator className='w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white' />
            </div>
            <div>
              <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold bg-linear-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent'>
                Υπολογιστής Κέρδους
              </h1>
              <p className='text-gray-600 mt-1 text-sm sm:text-base'>Υπολογισμός κέρδους για λάδι</p>
            </div>
          </div>
          <motion.button
            onClick={handleReset}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className='flex items-center justify-center sm:justify-start gap-2 px-4 py-2 bg-gray-100 cursor-pointer hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all shadow-sm text-sm sm:text-base'
          >
            <RotateCcw className='w-4 h-4' />
            Επαναφορά
          </motion.button>
        </div>
      </motion.div>

      {/* Price Settings */}
      <motion.div
        variants={itemVariants}
        className='bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-purple-100'
      >
        <h2 className='text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6'>
          Τιμές Λαδιού (τενεκές)
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6'>
          {/* Buy Price */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
              <div className='flex items-center gap-2'>
                <TrendingDown className='w-4 h-4 sm:w-5 sm:h-5 text-red-500' />
                Τιμή Αγοράς (€)
              </div>
            </label>
            <div className='relative'>
              <input
                type='number'
                step='0.01'
                min='0'
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                className='w-full px-4 py-2.5 sm:py-3 pl-10 sm:pl-12 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition bg-white text-base sm:text-lg font-semibold'
                placeholder='0.00'
              />
              <DollarSign className='absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400' />
            </div>
            <p className='text-xs sm:text-sm text-gray-500 mt-2'>
              Τιμή που αγοράζετε τον τενεκέ λαδιού
            </p>
          </div>

          {/* Sell Price */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2 sm:mb-3'>
              <div className='flex items-center gap-2'>
                <TrendingUp className='w-4 h-4 sm:w-5 sm:h-5 text-green-500' />
                Τιμή Πώλησης (€)
              </div>
            </label>
            <div className='relative'>
              <input
                type='number'
                step='0.01'
                min='0'
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
                className='w-full px-4 py-2.5 sm:py-3 pl-10 sm:pl-12 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition bg-white text-base sm:text-lg font-semibold'
                placeholder='0.00'
              />
              <DollarSign className='absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400' />
            </div>
            <p className='text-xs sm:text-sm text-gray-500 mt-2'>
              Τιμή που πουλάτε τον τενεκέ λαδιού
            </p>
          </div>
        </div>

        {/* Profit Calculation */}
        <div className='bg-linear-to-r from-pink-50 to-purple-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6'>
          <h3 className='text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4'>
            Κέρδος ανά Τενεκέ
          </h3>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
            <div className='bg-white rounded-lg p-3 sm:p-4 shadow-sm'>
              <p className='text-xs sm:text-sm text-gray-600 mb-1'>Κέρδος σε €</p>
              <p
                className={`text-xl sm:text-2xl font-bold ${
                  profit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {profit >= 0 ? '+' : ''}
                {profit.toFixed(2)} €
              </p>
            </div>
            <div className='bg-white rounded-lg p-3 sm:p-4 shadow-sm'>
              <p className='text-xs sm:text-sm text-gray-600 mb-1'>Ποσοστό Κέρδους</p>
              <p
                className={`text-xl sm:text-2xl font-bold ${
                  profit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {profit >= 0 ? '+' : ''}
                {profitPercentage}%
              </p>
            </div>
          </div>
        </div>

        {/* Bulk Calculator */}
        <div className='bg-linear-to-r from-purple-50 to-pink-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 border-2 border-purple-200'>
          <h3 className='text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4'>
            🧮 Υπολογισμός για Πολλαπλά Τενεκέδες
          </h3>

          <div className='mb-4'>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              Πόσα τενεκέδες;
            </label>
            <input
              type='number'
              min='1'
              step='1'
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className='w-full px-4 py-2.5 sm:py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition bg-white text-base sm:text-lg font-semibold'
              placeholder='1'
            />
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'>
            <div className='bg-white rounded-lg p-3 sm:p-4 shadow-md border-2 border-red-100'>
              <p className='text-xs sm:text-sm text-gray-600 mb-1 flex items-center gap-1'>
                <TrendingDown className='w-3 h-3 sm:w-4 sm:h-4 text-red-500' />
                Πληρωμή στον Προμηθευτή
              </p>
              <p className='text-xl sm:text-2xl font-bold text-red-600'>
                {(parseFloat(buyPrice) * parseFloat(quantity || '0')).toFixed(
                  2
                )}{' '}
                €
              </p>
              <p className='text-xs text-gray-500 mt-1'>
                {buyPrice} € × {quantity || '0'} τενεκέδες
              </p>
            </div>

            <div className='bg-white rounded-lg p-3 sm:p-4 shadow-md border-2 border-blue-100'>
              <p className='text-xs sm:text-sm text-gray-600 mb-1 flex items-center gap-1'>
                <DollarSign className='w-3 h-3 sm:w-4 sm:h-4 text-blue-500' />
                Συνολική Πώληση
              </p>
              <p className='text-xl sm:text-2xl font-bold text-blue-600'>
                {(parseFloat(sellPrice) * parseFloat(quantity || '0')).toFixed(
                  2
                )}{' '}
                €
              </p>
              <p className='text-xs text-gray-500 mt-1'>
                {sellPrice} € × {quantity || '0'} τενεκέδες
              </p>
            </div>

            <div className='bg-white rounded-lg p-3 sm:p-4 shadow-md border-2 border-green-100'>
              <p className='text-xs sm:text-sm text-gray-600 mb-1 flex items-center gap-1'>
                <TrendingUp className='w-3 h-3 sm:w-4 sm:h-4 text-green-500' />
                Καθαρό Κέρδος
              </p>
              <p className='text-xl sm:text-2xl font-bold text-green-600'>
                +
                {(
                  (parseFloat(sellPrice) - parseFloat(buyPrice)) *
                  parseFloat(quantity || '0')
                ).toFixed(2)}{' '}
                €
              </p>
              <p className='text-xs text-gray-500 mt-1'>
                {profit.toFixed(2)} € × {quantity || '0'} τενεκέδες
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Info Section */}
      <motion.div
        variants={itemVariants}
        className='bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 sm:p-6'
      >
        <h3 className='text-base sm:text-lg font-semibold text-blue-900 mb-2'>
          ℹ️ Πληροφορίες
        </h3>
        <p className='text-blue-800 text-sm sm:text-base'>
          Ο υπολογιστής αποθηκεύει αυτόματα τις τελευταίες τιμές που εισαγάγατε.
          Οι τιμές θα είναι διαθέσιμες ακόμα και μετά από έξοδο και
          επανασύνδεση.
        </p>
      </motion.div>
    </motion.div>
  );
}
