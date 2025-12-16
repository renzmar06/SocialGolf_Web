'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import toast, { Toaster } from "react-hot-toast";
import { PRODUCT_CATEGORIES } from '@/constants/productCategories';

interface Product {
  _id?: string;
  name: string;
  category?: string;
  brand?: string;
  price: number;
  salePrice?: number;
  inventoryCount: number;
  condition?: string;
  status?: 'Active' | 'Inactive' | 'Archived' | 'Draft';
  description?: string;
  images?: string[];
}

export default function EditProductModal({
  isOpen,
  onClose,
  onProductSaved,
  productToEdit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onProductSaved: () => void;
  productToEdit?: Product | null;
}) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const isEditMode = !!productToEdit;

  const [formData, setFormData] = useState({
    name: '',
    category: 'Golf Clubs',
    brand: '',
    price: '',
    salePrice: '',
    inventoryCount: '',
    condition: 'New',
    status: 'Active',
    description: '',
  });

  useEffect(() => {
    if (isOpen && productToEdit) {
      setFormData({
        name: productToEdit.name || '',
        category: productToEdit.category || 'Golf Clubs',
        brand: productToEdit.brand || '',
        price: productToEdit.price?.toString() || '',
        salePrice: productToEdit.salePrice?.toString() || '',
        inventoryCount: productToEdit.inventoryCount?.toString() || '',
        condition: productToEdit.condition || 'New',
        status: productToEdit.status || 'Active',
        description: productToEdit.description || '',
      });

      if (productToEdit.images?.[0]) {
        setPreviewUrl(productToEdit.images[0]);
      } else {
        setPreviewUrl(null);
      }
      setImage(null);
    } else if (isOpen && !productToEdit) {
      setFormData({
        name: '',
        category: 'Golf Clubs',
        brand: '',
        price: '',
        salePrice: '',
        inventoryCount: '',
        condition: 'New',
        status: 'Active',
        description: '',
      });
      setImage(null);
      setPreviewUrl(null);
    }
  }, [isOpen, productToEdit]);

  useEffect(() => {
    return () => {
      if (previewUrl && image) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl, image]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previewUrl && image) URL.revokeObjectURL(previewUrl);
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImage(null);
    if (previewUrl && image) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) return alert('Please log in');

    setLoading(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '') data.append(key, value);
      });
      if (image) data.append('image', image);
      if (user._id) data.append('userId', user._id);

      const url = isEditMode ? `/api/products/${productToEdit?._id}` : '/api/products';
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, { method, body: data });

      if (res.ok) {
        onProductSaved();
        onClose();
        toast.success('Product update successfully.');
      } else {
        const err = await res.json();
        toast.error('Fetch error:', err.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while Adding the product.', );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold">{isEditMode ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose}><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Product Image</label>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
            <div
              onClick={triggerFileInput}
              className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 relative"
            >
              {previewUrl ? (
                <div className="relative group">
                  <img src={previewUrl} alt="Preview" className="h-48 object-contain rounded-md" />
                  <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload size={24} className="text-gray-500 mb-3" />
                  <p className="font-medium">Click to upload</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                </>
              )}
            </div>
          </div>

          {/* All other form fields (same as before) */}
          <div>
            <label className="block text-sm font-medium mb-1">Product Name *</label>
            <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full border rounded-md p-2.5" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full border rounded-md p-2.5">
                {PRODUCT_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Brand</label>
              <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full border rounded-md p-2.5" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price ($)*</label>
              <input type="number" name="price" required min="0" step="0.01" value={formData.price} onChange={handleChange} className="w-full border rounded-md p-2.5" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sale Price ($)</label>
              <input type="number" name="salePrice" min="0" step="0.01" value={formData.salePrice} onChange={handleChange} className="w-full border rounded-md p-2.5" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Stock</label>
              <input type="number" name="inventoryCount" min="0" value={formData.inventoryCount} onChange={handleChange} className="w-full border rounded-md p-2.5" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Condition</label>
              <select name="condition" value={formData.condition} onChange={handleChange} className="w-full border rounded-md p-2.5">
                <option>New</option><option>Used</option><option>Refurbished</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full border rounded-md p-2.5">
                <option>Active</option><option>Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea name="description" rows={4} value={formData.description} onChange={handleChange} className="w-full border rounded-md p-2.5 resize-none" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 rounded-md">Cancel</button>
            <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50">
              {loading ? 'Saving...' : isEditMode ? 'Update' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}