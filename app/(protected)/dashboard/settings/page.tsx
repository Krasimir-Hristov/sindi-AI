'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingDown, TrendingUp, Save, RefreshCw } from 'lucide-react';
import { useSettings } from '@/src/contexts/SettingsContext';

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

export default function SettingsPage() {
  const { settings, loading, updateSettings } = useSettings();
  const [buyPrice, setBuyPrice] = useState<string>('0');
  const [sellPrice, setSellPrice] = useState<string>('0');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!loading && settings) {
      setBuyPrice(settings.buy_price.toString());
      setSellPrice(settings.sell_price.toString());
    }
  }, [settings, loading]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setSuccessMessage('');

      const buyPriceNum = parseFloat(buyPrice);
      const sellPriceNum = parseFloat(sellPrice);

      if (isNaN(buyPriceNum) || isNaN(sellPriceNum)) {
        alert('Παρακαλώ εισάγετε έγκυρες τιμές');
        return;
      }

      if (buyPriceNum < 0 || sellPriceNum < 0) {
        alert('Οι τιμές δεν μπορούν να είναι αρνητικές');
        return;
      }

      await updateSettings(buyPriceNum, sellPriceNum);
      setSuccessMessage('Οι ρυθμίσεις αποθηκεύτηκαν επιτυχώς! ✓');
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Σφάλμα κατά την αποθήκευση των ρυθμίσεων');
    } finally {
      setSaving(false);
    }
  };

  const profit = parseFloat(sellPrice) - parseFloat(buyPrice);
  const profitPercentage = parseFloat(buyPrice) > 0 
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
      <motion.div variants={itemVariants} className='bg-white rounded-2xl shadow-lg p-8 border border-purple-100'>
        <div className='flex items-center gap-4'>
          <div className='p-4 bg-linear-to-br from-pink-500 to-purple-600 rounded-2xl shadow-lg'>
            <DollarSign className='w-8 h-8 text-white' />
          </div>
          <div>
            <h1 className='text-4xl font-bold bg-linear-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent'>
              Ρυθμίσεις Τιμών
            </h1>
            <p className='text-gray-600 mt-1'>Διαχείριση τιμών λαδιού</p>
          </div>
        </div>
      </motion.div>

      {/* Price Settings */}
      <motion.div variants={itemVariants} className='bg-white rounded-2xl shadow-lg p-8 border border-purple-100'>
        <h2 className='text-2xl font-bold text-gray-900 mb-6'>Τιμές Λαδιού (τενεκές)</h2>
        
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
          {/* Buy Price */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-3'>
              <div className='flex items-center gap-2'>
                <TrendingDown className='w-5 h-5 text-red-500' />
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
                className='w-full px-4 py-3 pl-12 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition bg-white text-lg font-semibold'
                placeholder='0.00'
              />
              <DollarSign className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
            </div>
            <p className='text-sm text-gray-500 mt-2'>Τιμή που αγοράζετε τον τενεκέ λαδιού</p>
          </div>

          {/* Sell Price */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-3'>
              <div className='flex items-center gap-2'>
                <TrendingUp className='w-5 h-5 text-green-500' />
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
                className='w-full px-4 py-3 pl-12 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition bg-white text-lg font-semibold'
                placeholder='0.00'
              />
              <DollarSign className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
            </div>
            <p className='text-sm text-gray-500 mt-2'>Τιμή που πουλάτε τον τενεκέ λαδιού</p>
          </div>
        </div>

        {/* Profit Calculation */}
        <div className='bg-linear-to-r from-pink-50 to-purple-50 rounded-xl p-6 mb-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>Κέρδος ανά Τενεκέ</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='bg-white rounded-lg p-4 shadow-sm'>
              <p className='text-sm text-gray-600 mb-1'>Κέρδος σε €</p>
              <p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {profit >= 0 ? '+' : ''}{profit.toFixed(2)} €
              </p>
            </div>
            <div className='bg-white rounded-lg p-4 shadow-sm'>
              <p className='text-sm text-gray-600 mb-1'>Ποσοστό Κέρδους</p>
              <p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {profit >= 0 ? '+' : ''}{profitPercentage}%
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium mb-6'
          >
            {successMessage}
          </motion.div>
        )}

        {/* Save Button */}
        <motion.button
          onClick={handleSave}
          disabled={saving}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className='w-full bg-linear-to-r from-pink-500 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
        >
          {saving ? (
            <>
              <RefreshCw className='w-5 h-5 animate-spin' />
              Αποθήκευση...
            </>
          ) : (
            <>
              <Save className='w-5 h-5' />
              Αποθήκευση Ρυθμίσεων
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Info Section */}
      <motion.div variants={itemVariants} className='bg-blue-50 border-2 border-blue-200 rounded-2xl p-6'>
        <h3 className='text-lg font-semibold text-blue-900 mb-2'>ℹ️ Πληροφορίες</h3>
        <p className='text-blue-800'>
          Αυτές οι τιμές θα χρησιμοποιηθούν για τον υπολογισμό του κέρδους σε όλες τις σελίδες της εφαρμογής. 
          Αλλάξτε τις όταν αγοράζετε ή πουλάτε σε νέες τιμές.
        </p>
      </motion.div>
    </motion.div>
  );
}
