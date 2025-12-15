'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { PRODUCT_CATEGORIES } from '@/constants/productCategories';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: () => void;
}

export default function AddProductModal({ isOpen, onClose, onProductAdded }: AddProductModalProps) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image State
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { user } = useAuth();

  // Initialize formData with userId only if user exists
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
    userId: user?._id || '', // Safe access
  });

  // Update userId if user changes (e.g., after login)
  useEffect(() => {
    if (user?._id) {
      setFormData((prev) => ({ ...prev, userId: user._id }));
    }
  }, [user?._id]);

  // Cleanup object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
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
        userId: user?._id || '',
      });
      setImage(null);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isOpen, user?._id]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Revoke previous URL if exists
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent submission if no user
    if (!user?._id) {
      alert('User not authenticated. Please log in.');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key as keyof typeof formData]);
      });

      if (image) {
        data.append('image', image);
      }

      const res = await fetch('/api/products', {
        method: 'POST',
        body: data,
      });

      if (res.ok) {
        onProductAdded();
        onClose();
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('Failed to add product:', errorData);
        alert('Failed to add product: ' + (errorData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to add product', error);
      alert('An error occurred while adding the product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">Add New Product</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Image
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
              accept="image/*"
            />
            <div
              onClick={triggerFileInput}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition cursor-pointer relative"
            >
              {previewUrl ? (
                <div className="relative group">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-48 object-contain rounded-md"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-gray-100 p-3 rounded-full mb-3">
                    <Upload className="text-gray-500" size={24} />
                  </div>
                  <p className="text-gray-600 font-medium">Click to upload image</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                </>
              )}
            </div>
          </div>

          {/* Rest of the form remains the same */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              required
              className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-green-600 focus:outline-none"
              onChange={handleChange}
              value={formData.name}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-green-600 focus:outline-none"
                onChange={handleChange}
                value={formData.category}
              >
                {PRODUCT_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand
              </label>
              <input
                type="text"
                name="brand"
                className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-green-600 focus:outline-none"
                onChange={handleChange}
                value={formData.brand}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price ($) *
              </label>
              <input
                type="number"
                name="price"
                required
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-green-600 focus:outline-none"
                onChange={handleChange}
                value={formData.price}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sale Price ($)
              </label>
              <input
                type="number"
                name="salePrice"
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-green-600 focus:outline-none"
                onChange={handleChange}
                value={formData.salePrice}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock
              </label>
              <input
                type="number"
                name="inventoryCount"
                min="0"
                className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-green-600 focus:outline-none"
                onChange={handleChange}
                value={formData.inventoryCount}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condition
              </label>
              <select
                name="condition"
                className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-green-600 focus:outline-none"
                onChange={handleChange}
                value={formData.condition}
              >
                <option>New</option>
                <option>Used</option>
                <option>Refurbished</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-green-600 focus:outline-none"
                onChange={handleChange}
                value={formData.status}
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-green-600 focus:outline-none resize-none"
              onChange={handleChange}
              value={formData.description}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-white bg-green-800 rounded-md hover:bg-green-900 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Saving...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}