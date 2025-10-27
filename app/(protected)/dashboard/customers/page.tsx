'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus } from 'lucide-react';
import {
  createCustomer,
  getCustomers,
  updateCustomer,
  deleteCustomer,
} from '@/lib/actions/customers';
import CustomerCard from './components/CustomerCard';
import CustomerFormModal from './components/CustomerFormModal';
import CustomerDetailModal from './components/CustomerDetailModal';
import ConfirmModal from './components/ConfirmModal';

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
  house_number?: string;
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
    house_number: '',
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
      house_number: customer.house_number || '',
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
      house_number: '',
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
            className='flex items-center gap-2 px-6 py-3 bg-linear-to-r cursor-pointer from-pink-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:from-pink-600 hover:to-purple-700 transition-all'
          >
            <Plus className='w-5 h-5' />
            Νέος Πελάτης
          </motion.button>
        </div>
      </motion.div>

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
            className='inline-flex cursor-pointer items-center gap-2 px-6 py-3 bg-linear-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg'
          >
            <Plus className='w-5 h-5' />
            Προσθήκη Πελάτη
          </motion.button>
        </motion.div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {customers.map((customer, index) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              index={index}
              onView={handleViewDetails}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <CustomerFormModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        editingCustomer={editingCustomer}
        saving={saving}
      />
      <CustomerDetailModal
        isOpen={showDetailModal}
        onClose={handleCloseDetailModal}
        customer={selectedCustomer}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      {confirmAction && (
        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={confirmAction.onConfirm}
          title={confirmAction.title}
          message={confirmAction.message}
        />
      )}
    </motion.div>
  );
}
