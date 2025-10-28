'use client';

import { useState, useEffect } from 'react';
import { Plus, Package, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from './components/ProductCard';
import ProductFormModal from './components/ProductFormModal';
import ProductDetailModal from './components/ProductDetailModal';
import ConfirmModal from './components/ConfirmModal';
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} from '@/lib/actions/products';

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
  created_at?: string;
  updated_at?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const data = await getProducts();
    if (data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const handleOpenFormModal = () => {
    setEditingProduct(null);
    setShowFormModal(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowFormModal(true);
    setShowDetailModal(false);
  };

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setShowConfirmModal(true);
    setShowDetailModal(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;

    const result = await deleteProduct(deleteId);
    if (result.success) {
      setProducts(products.filter((p) => p.id !== deleteId));
      setShowConfirmModal(false);
      setDeleteId(null);
    }
  };

  const handleSubmit = async (formData: {
    name: string;
    description: string;
    category: string;
    unit_price: string;
    stock_quantity: string;
    min_stock_level: string;
    image_url: string;
    is_active: boolean;
  }) => {
    setSaving(true);

    const productData = {
      name: formData.name,
      description: formData.description || undefined,
      category: formData.category || undefined,
      unit_price: parseFloat(formData.unit_price) || 0,
      stock_quantity: parseInt(formData.stock_quantity) || 0,
      min_stock_level: formData.min_stock_level
        ? parseInt(formData.min_stock_level)
        : undefined,
      image_url: formData.image_url || undefined,
      is_active: formData.is_active,
    };

    if (editingProduct) {
      const result = await updateProduct(editingProduct.id, productData);
      if (result.success && result.data) {
        setProducts(
          products.map((p) => (p.id === editingProduct.id ? result.data! : p))
        );
      }
    } else {
      const result = await createProduct(productData);
      if (result.success && result.data) {
        setProducts([result.data, ...products]);
      }
    }

    setSaving(false);
    setShowFormModal(false);
    setEditingProduct(null);
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteProductName =
    products.find((p) => p.id === deleteId)?.name || 'το προϊόν';

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
              <Package className='w-8 h-8 text-white' />
            </div>
            <div>
              <h1 className='text-4xl font-bold bg-linear-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent'>
                Προϊόντα
              </h1>
              <p className='text-gray-600 mt-1'>
                {products.length}{' '}
                {products.length === 1 ? 'προϊόν' : 'προϊόντα'}
              </p>
            </div>
          </div>
          <motion.button
            onClick={handleOpenFormModal}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className='flex items-center gap-2 px-6 py-3 bg-linear-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:from-pink-600 hover:to-purple-700 transition-all'
          >
            <Plus className='w-5 h-5' />
            Νέο Προϊόν
          </motion.button>
        </div>
      </motion.div>

      {/* Search Bar */}
      {products.length > 0 && (
        <motion.div variants={itemVariants} className='max-w-md'>
          <div className='relative'>
            <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
            <input
              type='text'
              placeholder='Αναζήτηση προϊόντων...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pl-12 pr-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all bg-white'
            />
          </div>
        </motion.div>
      )}

      {/* Content */}
      {filteredProducts.length === 0 && searchTerm === '' ? (
        /* Empty State */
        <motion.div
          variants={itemVariants}
          className='bg-white rounded-2xl shadow-lg p-12 border border-purple-100 text-center'
        >
          <Package className='w-16 h-16 text-gray-300 mx-auto mb-4' />
          <h3 className='text-xl font-semibold text-gray-600 mb-2'>
            Δεν υπάρχουν προϊόντα
          </h3>
          <p className='text-gray-500 mb-6'>
            Ξεκινήστε προσθέτοντας το πρώτο σας προϊόν
          </p>
          <motion.button
            onClick={handleOpenFormModal}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className='inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg'
          >
            <Plus className='w-5 h-5' />
            Προσθήκη Προϊόντος
          </motion.button>
        </motion.div>
      ) : filteredProducts.length === 0 ? (
        /* No Search Results */
        <motion.div
          variants={itemVariants}
          className='bg-white rounded-2xl shadow-lg p-12 border border-purple-100 text-center'
        >
          <p className='text-gray-500 text-lg'>
            Δεν βρέθηκαν προϊόντα που να ταιριάζουν με "{searchTerm}"
          </p>
        </motion.div>
      ) : (
        /* Products Grid */
        <motion.div
          variants={itemVariants}
          className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
        >
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          ))}
        </motion.div>
      )}

      {/* Modals */}
      <ProductFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSubmit}
        product={editingProduct}
        saving={saving}
      />

      <ProductDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setDeleteId(null);
        }}
        onConfirm={handleConfirmDelete}
        title='Διαγραφή Προϊόντος'
        message={`Είστε σίγουροι ότι θέλετε να διαγράψετε το προϊόν "${deleteProductName}";`}
      />
    </motion.div>
  );
}
