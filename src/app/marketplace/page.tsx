'use client';
import { useState, useEffect, useRef } from 'react';
import {
    ShoppingBag, Search, ShoppingCart, Plus, Package,
    Image as ImageIcon, MoreVertical, Edit, Archive, Trash2
} from 'lucide-react';
import EditProductModal from '@/components/EditProductModal';
import { useAuth } from '@/hooks/useAuth';
import toast, { Toaster } from "react-hot-toast";
import { PRODUCT_CATEGORIES } from '@/constants/productCategories';

interface Product {
    _id: string;
    name: string;
    brand?: string;
    category?: string;
    price: number;
    salePrice?: number;
    inventoryCount: number;
    condition?: string;
    status?: 'Active' | 'Inactive' | 'Draft' | 'Archived';
    description?: string;
    images?: string[];
    isDeleted?: boolean;
}

export default function Marketplace() {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Sold Out' | 'Archived'>('All');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Toggle menu
    const toggleMenu = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setOpenMenuId(prev => (prev === id ? null : id));
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenuId(null);
            }
        };

        if (openMenuId !== null) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openMenuId]);

    // Fetch products
    const fetchProducts = async () => {
        if (!user) return;
        try {
            const res = await fetch(`/api/products?userId=${user._id}&userRole=${user.role}`);
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                const activeProducts = data.data.filter((p: any) => !p.isDeleted);
                setProducts(activeProducts);
            }
        } catch (error:any) {
            console.error('Fetch error:', error);
            toast.error('Fetch error:', error);
        }
    };

    useEffect(() => {
        if (user) fetchProducts();
    }, [user]);

    // Delete product
    const handleDelete = async (productId: string) => {
        if (!confirm('Are you sure you want to permanently delete this product? This cannot be undone.')) return;

        try {
            const res = await fetch(`/api/products/${productId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setProducts(prev => prev.filter(p => p._id !== productId));
                toast.success( "Product delete sucessfully.");
            } else {
                const error = await res.json();
                toast.error(error.message|| "Failed to delete product.");
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error("An error occurred while deleting the product.");
        } finally {
            setOpenMenuId(null);
        }
    };

    // Archive product
    const handleArchive = async (productId: string) => {
        if (!confirm('Archive this product? It will no longer appear in active listings.')) return;

        try {
            const res = await fetch(`/api/products/${productId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Archived' }),
            });

            if (res.ok) {
                setProducts(prev =>
                    prev.map(p => p._id === productId ? { ...p, status: 'Archived' } : p)
                );
            } else {
                const error = await res.json();
                toast.error(error.message || 'Failed to archive product.');
            }
        } catch (error) {
            console.error('Archive error:', error);
             toast.error("An error occurred while archiving.");
        } finally {
            setOpenMenuId(null);
        }
    };

    // Open edit modal
    const openEditModal = (product: Product) => {
        setProductToEdit(product);
        setIsModalOpen(true);
        setOpenMenuId(null);
    };

    // Close modal
    const closeModal = () => {
        setIsModalOpen(false);
        setProductToEdit(null);
    };

    // Filter products
    const filteredProducts = products.filter((product) => {
        const matchesSearch =
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

        let matchesTab = true;
        if (activeTab === 'Active') {
            matchesTab = product.status === 'Active';
        } else if (activeTab === 'Sold Out') {
            matchesTab = product.inventoryCount === 0 && product.status === 'Active';
        } else if (activeTab === 'Archived') {
            matchesTab = ['Inactive', 'Archived'].includes(product.status || '');
        }

        return matchesSearch && matchesTab;
    });

    const activeProductsCount = products.filter(p => p.status === 'Active').length;

    return (
        <>
         <Toaster position="top-right" />
        
        <div className="min-h-screen bg-gray-50 text-gray-800 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h3 className="text-3xl font-bold text-gray-900">Marketplace</h3>
                        <p className="text-gray-500 mt-1">Manage your products and track sales</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 border bg-white px-4 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium shadow-sm transition">
                            <Package size={18} /> Orders
                        </button>
                        <button
                            onClick={() => {
                                setProductToEdit(null);
                                setIsModalOpen(true);
                            }}
                            className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:from-blue-700 hover:to-cyan-700"
                        >
                            <Plus size={18} /> Add Product
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard icon={<ShoppingBag className="text-green-600" />} label="Active Products" value={activeProductsCount} bg="bg-green-50" />
                    <StatCard icon={<span className="text-purple-600 font-bold text-lg">$</span>} label="Total Sales" value="$0" bg="bg-purple-50" />
                    <StatCard icon={<Package className="text-orange-600" />} label="Pending Orders" value="0" bg="bg-orange-50" />
                    <StatCard icon={<ShoppingCart className="text-blue-600" />} label="Total Orders" value="0" bg="bg-blue-50" />
                </div>

                {/* Search & Tabs */}
                <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-3 rounded-lg border shadow-sm">
                    {/* Search */}
                    <div className="relative w-full md:w-[350px]">
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="pl-10 pr-4 py-2.5 w-full border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Category Dropdown */}
                    <div className="w-full md:w-48">
                        <select
                            className="w-full border rounded-md px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600"
                        >
                            <option>All Categories</option>
                            {PRODUCT_CATEGORIES.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center bg-gray-100 rounded-md p-1 text-sm">
                        {(['All', 'Active', 'Sold Out', 'Archived'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-1.5 rounded-md transition-all ${activeTab === tab
                                        ? 'bg-white text-gray-900 shadow font-medium'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>


                {/* Empty State */}
                {products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl border-2 border-dashed border-gray-200">
                        <div className="bg-gray-50 p-6 rounded-full mb-4">
                            <ShoppingBag size={48} className="text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">No products yet</h3>
                        <button
                            onClick={() => {
                                setProductToEdit(null);
                                setIsModalOpen(true);
                            }}
                            className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:from-blue-700 hover:to-cyan-700"
                        >
                            + Add Product
                        </button>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        No products match your search or filter.
                    </div>
                ) : (
                    /* Product Grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                            <div
                                key={product._id}
                                className="bg-white border rounded-2xl overflow-visible shadow-sm hover:shadow-md transition duration-200 relative flex flex-col group"
                            >
                                <div className="relative aspect-square bg-gray-50 p-4 flex items-center justify-center">
                                    {/* Status & Sale Badges */}
                                    <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-sm text-white ${product.status === 'Active' ? 'bg-emerald-500' :
                                                ['Inactive', 'Archived'].includes(product.status || '') ? 'bg-gray-500' :
                                                    'bg-orange-500'
                                            }`}>
                                            {product.status || 'Draft'}
                                        </span>
                                        {product.salePrice && product.salePrice < product.price && (
                                            <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                                                Sale
                                            </span>
                                        )}
                                    </div>

                                    {/* Menu Button */}
                                    <div className="absolute top-3 right-3 z-20" ref={openMenuId === product._id ? menuRef : null}>
                                        <button
                                            onClick={(e) => toggleMenu(e, product._id)}
                                            className="p-1.5 bg-white hover:bg-gray-50 rounded-full shadow-md text-gray-600 transition"
                                        >
                                            <MoreVertical size={16} />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {openMenuId === product._id && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-50">
                                                <button
                                                    onClick={() => openEditModal(product)}
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                >
                                                    <Edit size={14} /> Edit
                                                </button>
                                                <button
                                                    onClick={() => handleArchive(product._id)}
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                >
                                                    <Archive size={14} /> Archive
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product._id)}
                                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                >
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Image */}
                                    {product.images && product.images.length > 0 ? (
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="w-full h-full object-contain mix-blend-multiply hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <ImageIcon className="text-gray-300 w-16 h-16" />
                                    )}
                                </div>

                                {/* Product Info */}
                                <div className="p-4 flex flex-col gap-1 flex-grow">
                                    <p className="text-xs text-gray-400 font-medium">
                                        {product.category || 'Uncategorized'}
                                    </p>
                                    <h3 className="font-bold text-gray-900 text-base line-clamp-2" title={product.name}>
                                        {product.name}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {product.brand || 'No Brand'}
                                    </p>

                                    <div className="flex items-end justify-between mt-4">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-emerald-700 font-bold text-xl">
                                                ${product.salePrice || product.price}
                                            </span>
                                            {product.salePrice && product.salePrice < product.price && (
                                                <span className="text-gray-400 text-sm line-through">
                                                    ${product.price}
                                                </span>
                                            )}
                                        </div>

                                        <span className={`text-[10px] font-bold px-2 py-1 rounded ${product.inventoryCount > 0
                                                ? 'bg-gray-100 text-gray-700'
                                                : 'bg-red-100 text-red-700'
                                            }`}>
                                            {product.inventoryCount > 0 ? `${product.inventoryCount} in stock` : 'Out of Stock'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit/Add Modal */}
            <EditProductModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onProductSaved={fetchProducts}
                productToEdit={productToEdit}
            />
        </div>
        </>
    );
}

// Stat Card Component
function StatCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: string | number; bg: string }) {
    return (
        <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${bg}`}>
                {icon}
            </div>
            <div>
                <p className="text-gray-500 text-sm font-medium">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
}