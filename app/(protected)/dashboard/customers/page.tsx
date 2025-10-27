'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Mail,
  Phone,
  MapPin,
  Building2,
  Edit,
  Trash2,
  X,
  Save,
  User,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import {
  createCustomer,
  getCustomers,
  updateCustomer,
  deleteCustomer,
} from '@/src/lib/actions/customers';

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

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const loadCustomers = async () => {
    setLoading(true);
    const result = await getCustomers();
    if (result.data) {
      setCustomers(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingCustomer) {
        const result = await updateCustomer(editingCustomer.id, formData);
        if (result.error) {
          alert(result.error);
        } else {
          await loadCustomers();
          handleCloseModal();
        }
      } else {
        const result = await createCustomer(formData);
        if (result.error) {
          alert(result.error);
        } else {
          await loadCustomers();
          handleCloseModal();
        }
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Σφάλμα κατά την αποθήκευση');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      first_name: customer.first_name,
      last_name: customer.last_name,
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      city: customer.city || '',
      notes: customer.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const customerToDelete = customers.find((c) => c.id === id);
    if (!customerToDelete) return;

    setConfirmAction({
      title: 'Διαγραφή Πελάτη',
      message: `Είστε σίγουροι ότι θέλετε να διαγράψετε τον πελάτη "${customerToDelete.first_name} ${customerToDelete.last_name}";`,
      onConfirm: async () => {
        const result = await deleteCustomer(id);
        if (result.error) {
          alert(result.error);
        } else {
          await loadCustomers();
        }
        setShowConfirmModal(false);
      },
    });
    setShowConfirmModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCustomer(null);
    setFormData({
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      notes: '',
    });
  };

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedCustomer(null);
  };

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
        className='bg-white rounded-2xl shadow-lg p-8 border border-purple-100'
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <div className='p-4 bg-linear-to-br from-pink-500 to-purple-600 rounded-2xl shadow-lg'>
              <Users className='w-8 h-8 text-white' />
            </div>
            <div>
              <h1 className='text-4xl font-bold bg-linear-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent'>
                Πελάτες
              </h1>
              <p className='text-gray-600 mt-1'>
                {customers.length}{' '}
                {customers.length === 1 ? 'πελάτης' : 'πελάτες'}
              </p>
            </div>
          </div>
          <motion.button
            onClick={() => setShowModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className='flex items-center gap-2 px-6 py-3 bg-linear-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:from-pink-600 hover:to-purple-700 transition-all'
          >
            <Plus className='w-5 h-5' />
            Νέος Πελάτης
          </motion.button>
        </div>
      </motion.div>

      {/* Customers Grid */}
      {customers.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className='bg-white rounded-2xl shadow-lg p-12 border border-purple-100 text-center'
        >
          <Users className='w-16 h-16 text-gray-300 mx-auto mb-4' />
          <h3 className='text-xl font-semibold text-gray-600 mb-2'>
            Δεν υπάρχουν πελάτες
          </h3>
          <p className='text-gray-500 mb-6'>
            Ξεκινήστε προσθέτοντας τον πρώτο σας πελάτη
          </p>
          <motion.button
            onClick={() => setShowModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className='inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg'
          >
            <Plus className='w-5 h-5' />
            Προσθήκη Πελάτη
          </motion.button>
        </motion.div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {customers.map((customer, index) => (
            <motion.div
              key={customer.id}
              variants={itemVariants}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className='bg-white rounded-2xl shadow-lg border border-purple-100 hover:shadow-xl transition-all overflow-hidden'
            >
              {/* Clickable Card Content */}
              <div
                onClick={() => handleViewDetails(customer)}
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
                    handleEdit(customer);
                  }}
                  className='flex-1 flex items-center justify-center gap-2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition'
                >
                  <Edit className='w-4 h-4' />
                  <span className='text-sm font-medium'>Επεξεργασία</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(customer.id);
                  }}
                  className='flex-1 flex items-center justify-center gap-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition'
                >
                  <Trash2 className='w-4 h-4' />
                  <span className='text-sm font-medium'>Διαγραφή</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'
            onClick={handleCloseModal}
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
                  onClick={handleCloseModal}
                  className='p-2 hover:bg-gray-100 rounded-lg transition'
                >
                  <X className='w-6 h-6' />
                </button>
              </div>

              <form onSubmit={handleSubmit} className='p-6 space-y-6'>
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
                    onClick={handleCloseModal}
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

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseDetailModal}
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
                      {selectedCustomer.first_name[0]}
                      {selectedCustomer.last_name[0]}
                    </div>
                    <div className='text-white'>
                      <h2 className='text-3xl font-bold'>
                        {selectedCustomer.first_name}{' '}
                        {selectedCustomer.last_name}
                      </h2>
                      <p className='text-white/80 text-sm mt-1'>
                        Πληροφορίες Πελάτη
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseDetailModal}
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
                    {selectedCustomer.phone ? (
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center'>
                          <Phone className='w-5 h-5 text-purple-600' />
                        </div>
                        <div>
                          <p className='text-xs text-gray-500'>Τηλέφωνο</p>
                          <p className='text-gray-900 font-medium'>
                            {selectedCustomer.phone}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className='flex items-center gap-3 text-gray-400'>
                        <Phone className='w-5 h-5' />
                        <p className='text-sm'>Δεν έχει καταχωρηθεί τηλέφωνο</p>
                      </div>
                    )}

                    {selectedCustomer.email ? (
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center'>
                          <Mail className='w-5 h-5 text-pink-600' />
                        </div>
                        <div>
                          <p className='text-xs text-gray-500'>Email</p>
                          <p className='text-gray-900 font-medium'>
                            {selectedCustomer.email}
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
                    {selectedCustomer.city ? (
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center'>
                          <Building2 className='w-5 h-5 text-purple-600' />
                        </div>
                        <div>
                          <p className='text-xs text-gray-500'>Πόλη</p>
                          <p className='text-gray-900 font-medium'>
                            {selectedCustomer.city}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className='flex items-center gap-3 text-gray-400'>
                        <Building2 className='w-5 h-5' />
                        <p className='text-sm'>Δεν έχει καταχωρηθεί πόλη</p>
                      </div>
                    )}

                    {selectedCustomer.address ? (
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center'>
                          <MapPin className='w-5 h-5 text-pink-600' />
                        </div>
                        <div>
                          <p className='text-xs text-gray-500'>Διεύθυνση</p>
                          <p className='text-gray-900 font-medium'>
                            {selectedCustomer.address}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className='flex items-center gap-3 text-gray-400'>
                        <MapPin className='w-5 h-5' />
                        <p className='text-sm'>
                          Δεν έχει καταχωρηθεί διεύθυνση
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {selectedCustomer.notes && (
                  <div>
                    <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                      Σημειώσεις
                    </h3>
                    <div className='bg-yellow-50 border border-yellow-200 rounded-xl p-4'>
                      <p className='text-gray-700 whitespace-pre-wrap'>
                        {selectedCustomer.notes}
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
                        {selectedCustomer.id}
                      </p>
                    </div>
                    <div>
                      <p className='text-gray-500'>Δημιουργήθηκε</p>
                      <p className='text-gray-900 font-medium mt-1'>
                        {selectedCustomer.created_at
                          ? new Date(
                              selectedCustomer.created_at
                            ).toLocaleDateString('el-GR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className='flex gap-3 pt-4'>
                  <motion.button
                    onClick={() => {
                      handleCloseDetailModal();
                      handleEdit(selectedCustomer);
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
                      handleCloseDetailModal();
                      handleDelete(selectedCustomer.id);
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

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && confirmAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-60 p-4'
            onClick={() => setShowConfirmModal(false)}
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
                    <h3 className='text-2xl font-bold'>
                      {confirmAction.title}
                    </h3>
                    <p className='text-white/80 text-sm mt-1'>
                      Αυτή η ενέργεια δεν μπορεί να αναιρεθεί
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className='p-6'>
                <p className='text-gray-700 text-lg leading-relaxed'>
                  {confirmAction.message}
                </p>
              </div>

              {/* Buttons */}
              <div className='flex gap-3 p-6 pt-0'>
                <motion.button
                  onClick={() => setShowConfirmModal(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className='flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all'
                >
                  Όχι, Ακύρωση
                </motion.button>
                <motion.button
                  onClick={confirmAction.onConfirm}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className='flex-1 px-6 py-3 bg-linear-to-r from-red-500 to-orange-500 text-white rounded-xl font-semibold shadow-lg hover:from-red-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2'
                >
                  <CheckCircle className='w-5 h-5' />
                  Ναι, Διαγραφή
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
