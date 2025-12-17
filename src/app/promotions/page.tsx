"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import {
    fetchPromotions,
    savePromotion,
    updatePromotion,
    deletePromotion,
} from "@/store/slices/promotionSlice";
import {
    Plus,
    Search,
    UploadCloud,
    Eye,
    Ticket,
    X,
    Sparkles,
    TrendingUp,
    MoreVertical,
    Bookmark,
    Edit3,
    QrCode,
    Pause,
    Play,
    Zap,
    Trash2,
    Download,
    Share2,
    MapPin,
    Clock,
} from "lucide-react";
import QRCode from "react-qr-code";

const TABS = ["All", "Active", "Scheduled", "Boosted", "Expired"] as const;
type Tab = (typeof TABS)[number];

interface Promotion {
    _id: string;
    title: string;
    description: string;
    promoType: string;
    promoCode?: string;
    startDate: string;
    endDate: string;
    coverImage?: string;
    currentRedemptions: number;
    maxRedemptions?: number;
    discountValue: number;
    visibility: string;
    status: string;
}

export default function PromotionsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { data: promotions, loading, error } = useSelector(
        (state: RootState) => state.promotion
    );

    const [activeTab, setActiveTab] = useState<Tab>("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [menuId, setMenuId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState<any>(null);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [qrPromotion, setQrPromotion] = useState<any | null>(null);
    const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);
    const [boostPromotion, setBoostPromotion] = useState<any | null>(null);
    const [selectedPackage, setSelectedPackage] = useState("basic");
    const [radius, setRadius] = useState(13);
    const [duration, setDuration] = useState(3);
    const [isQrGenerated, setIsQrGenerated] = useState(false);
    const [generatedQRs, setGeneratedQRs] = useState<Set<string>>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('generatedQRs');
            return saved ? new Set(JSON.parse(saved)) : new Set();
        }
        return new Set();
    });
    const qrSvgRef = useRef<HTMLDivElement>(null);

    // Form state
    const [promoType, setPromoType] = useState("Percentage Off");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [promoCode, setPromoCode] = useState("");
    const [discountValue, setDiscountValue] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [visibility, setVisibility] = useState("Public");
    const [maxRedemptions, setMaxRedemptions] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        dispatch(fetchPromotions());
    }, [dispatch]);

    useEffect(() => {
        const handleClickOutside = () => {
            setMenuId(null);
        };
        
        if (menuId) {
            document.addEventListener('click', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [menuId]);

    const getStatus = (start: string, end: string): "Active" | "Scheduled" | "Expired" => {
        const now = new Date();
        const startDateObj = new Date(start);
        const endDateObj = new Date(end);
        if (now < startDateObj) return "Scheduled";
        if (now > endDateObj) return "Expired";
        return "Active";
    };

    const formatDateRange = (start: string, end: string) => {
        const s = new Date(start);
        const e = new Date(end);
        const monthDay = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        return `${monthDay(s)} - ${monthDay(e)}, ${e.getFullYear()}`;
    };

    const activeCount = useMemo(() => promotions.filter(p => getStatus(p.startDate, p.endDate) === "Active").length, [promotions]);
    const totalViews = useMemo(() => promotions.length * 10, [promotions]); // Mock views
    const totalRedemptions = useMemo(() => promotions.reduce((sum, p) => sum + p.currentRedemptions, 0), [promotions]);

    const filteredPromotions = useMemo(() => {
        let filtered = promotions.filter(
            p => p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 (p.promoCode && p.promoCode.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        if (activeTab === "Active") {
            filtered = filtered.filter(p => getStatus(p.startDate, p.endDate) === "Active");
        } else if (activeTab === "Scheduled") {
            filtered = filtered.filter(p => getStatus(p.startDate, p.endDate) === "Scheduled");
        } else if (activeTab === "Expired") {
            filtered = filtered.filter(p => getStatus(p.startDate, p.endDate) === "Expired");
        } else if (activeTab === "Boosted") {
            filtered = filtered.filter(p => getStatus(p.startDate, p.endDate) === "Active");
        }
        return filtered;
    }, [promotions, searchTerm, activeTab]);

    const openCreateModal = () => {
        setEditingPromotion(null);
        setTitle("");
        setDescription("");
        setPromoType("Percentage Off");
        setPromoCode("");
        setDiscountValue("");
        setStartDate("");
        setEndDate("");
        setVisibility("Public");
        setMaxRedemptions("");
        setImageFile(null);
        setImagePreview(undefined);
        setIsModalOpen(true);
    };

    const openEditModal = (promotion: any) => {
        setEditingPromotion(promotion);
        setTitle(promotion.title);
        setDescription(promotion.description);
        setPromoType(promotion.promoType);
        setPromoCode(promotion.promoCode || "");
        setDiscountValue(promotion.discountValue?.toString() || "");
        setStartDate(promotion.startDate);
        setEndDate(promotion.endDate);
        setVisibility(promotion.visibility || "Public");
        setMaxRedemptions(promotion.maxRedemptions?.toString() || "");
        if (promotion.coverImage) {
            setImagePreview(promotion.coverImage);
        }
        setIsModalOpen(true);
    };

    const openQRModal = (promotion: any) => {
        setQrPromotion(promotion);
        const wasGenerated = generatedQRs.has(promotion._id);
        setIsQrGenerated(wasGenerated);
        setIsQRModalOpen(true);
        if (wasGenerated) {
            setIsQrGenerated(true);
        }
    };

    const closeQRModal = () => {
        setIsQRModalOpen(false);
        setQrPromotion(null);
        setIsQrGenerated(false);
    };

    const handleGenerateQR = () => {
        setIsQrGenerated(true);
        if (qrPromotion) {
            const newSet = new Set(generatedQRs).add(qrPromotion._id);
            setGeneratedQRs(newSet);
            localStorage.setItem('generatedQRs', JSON.stringify([...newSet]));
        }
    };

    const handleDownloadQR = () => {
        if (qrSvgRef.current) {
            const svg = qrSvgRef.current.querySelector('svg');
            if (svg) {
                const svgData = new XMLSerializer().serializeToString(svg);
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const img = new Image();
                img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx?.drawImage(img, 0, 0);
                    const link = document.createElement('a');
                    link.download = `${qrPromotion.title} QR Code.png`;
                    link.href = canvas.toDataURL();
                    link.click();
                };
                img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
            }
        }
        closeQRModal();
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingPromotion(null);
        setImageFile(null);
        setImagePreview(undefined);
    };

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        if (!file) return;
        if (!["image/png", "image/jpeg"].includes(file.type)) return;
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    }

    function clearImage() {
        setImageFile(null);
        setImagePreview(undefined);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    function generatePromoCode() {
        const code = ("GOLF" + Math.random().toString(36).slice(2, 8)).toUpperCase();
        setPromoCode(code);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !startDate || !endDate) return;
        
        const promotionData = {
            title,
            description,
            promoType,
            promoCode: promoCode || `PROMO${Date.now()}`,
            discountValue: parseFloat(discountValue) || 0,
            startDate,
            endDate,
            visibility,
            maxRedemptions: maxRedemptions ? parseInt(maxRedemptions) : 0,
            coverImage: imagePreview || "",
            currentRedemptions: 0,
            status: "Active"
        };

        try {
            if (editingPromotion) {
                await dispatch(updatePromotion({ id: editingPromotion._id, data: promotionData })).unwrap();
            } else {
                await dispatch(savePromotion(promotionData)).unwrap();
            }
            closeModal();
        } catch (error) {
            console.error('Failed to save promotion:', error);
        }
    };

    const handleDelete = (id: string) => {
        dispatch(deletePromotion(id));
    };

    const handlePauseResume = async (promotion: any) => {
        const newStatus = promotion.status === "Paused" ? "Active" : "Paused";
        try {
            await dispatch(updatePromotion({ 
                id: promotion._id, 
                data: { status: newStatus } 
            })).unwrap();
        } catch (error) {
            console.error('Failed to update promotion status:', error);
        }
    };

    const openBoostModal = (promotion: any) => {
        setBoostPromotion(promotion);
        setIsBoostModalOpen(true);
    };

    const closeBoostModal = () => {
        setIsBoostModalOpen(false);
        setBoostPromotion(null);
    };

    const calculateTotalCost = () => {
        const basePrices = {
            starter: 5,
            basic: 10,
            standard: 25,
            premium: 50,
            citywide: 100
        };
        const basePrice = basePrices[selectedPackage as keyof typeof basePrices];
        const radiusMultiplier = radius / 15; // Base radius is 15 miles
        const durationMultiplier = duration / 3; // Base duration is 3 days
        return Math.round(basePrice * radiusMultiplier * durationMultiplier);
    };

    return (
        <div className="space-y-6">
            {/* Header row */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                        Promotions
                    </h1>
                    <p className="text-stone-500">
                        Create and manage special offers for golfers
                    </p>
                </div>

                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:from-blue-700 hover:to-cyan-700"
                >
                    <Plus className="h-4 w-4" />
                    Create Promotion
                </button>
            </div>

            {/* Stats cards */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="rounded-xl bg-white p-5 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-600">Active Promotions</div>
                            <div className="mt-3 text-3xl font-bold text-gray-900">{activeCount}</div>
                        </div>
                        <div className="rounded-md bg-blue-50 p-3">
                            <TrendingUp className="h-5 w-5 text-blue-700" />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl bg-white p-5 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-600">Total Views</div>
                            <div className="mt-3 text-3xl font-bold text-gray-900">0</div>
                        </div>
                        <div className="rounded-md bg-blue-50 p-3">
                            <Eye className="h-5 w-5 text-blue-700" />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl bg-white p-5 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-600">Redemptions</div>
                            <div className="mt-3 text-3xl font-bold text-gray-900">{totalRedemptions}</div>
                        </div>
                        <div className="rounded-md bg-blue-50 p-3">
                            <Ticket className="h-5 w-5 text-blue-700" />
                        </div>
                    </div>
                </div>

                {/* You may include extra card or keep blank */}
                <div className="hidden lg:block" />
            </div>

            <div className="space-y-3">
                {/* Tabs row */}
                <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`rounded-md px-5 py-1 text-xs md:text-sm font-medium transition ${isActive
                                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-sm"
                                    : "text-gray-700 hover:bg-gray-100"
                                    }`}
                            >
                                {tab}
                            </button>
                        );
                    })}
                </div>

                {/* Search row (below tabs) */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 md:max-w-8xl w-full">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search promotions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Promotions list or empty state */}
            {filteredPromotions.length === 0 ? (
                <div className="flex min-h-[380px] items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-16 shadow-sm">
                    <div className="text-center max-w-md">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100">
                            <Ticket className="h-12 w-12 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-1">
                            No promotions yet
                        </h2>
                        <p className="text-sm text-gray-600 mb-6">
                            Create your first promotion to attract more customers
                        </p>
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:from-blue-700 hover:to-cyan-700"
                        >
                            <Plus className="h-4 w-4" />
                            Create Promotion
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredPromotions.map((promo) => {
                        const status = getStatus(promo.startDate, promo.endDate);
                        return (
                        <div key={promo._id} className="relative rounded-lg border border-gray-200 bg-white p-5 shadow-md">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setMenuId(menuId === promo._id ? null : promo._id);
                                }}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                <MoreVertical className="h-5 w-5" />
                            </button>
                            {menuId === promo._id && (
                                <div className="absolute top-4 right-4 mt-8 bg-white rounded-lg shadow-lg py-1 z-10 min-w-[160px] border border-gray-200">
                                    <button 
                                        onClick={() => openEditModal(promo)}
                                        className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        <Edit3 className="h-4 w-4" />
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => openQRModal(promo)}
                                        className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        <QrCode className="h-4 w-4" />
                                        {generatedQRs.has(promo._id) ? "View QR Code" : "Generate QR Code"}
                                    </button>
                                    {(status === "Active" || promo.status === "Paused") && (
                                        <>
                                            <button 
                                                onClick={() => handlePauseResume(promo)}
                                                className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                {promo.status === "Paused" ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                                                {promo.status === "Paused" ? "Resume Promotion" : "Pause Promotion"}
                                            </button>
                                            {status === "Active" && (
                                                <button 
                                                    onClick={() => openBoostModal(promo)}
                                                    className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    <Zap className="h-4 w-4" />
                                                    Boost Promotion
                                                </button>
                                            )}
                                            <hr className="my-1 border-gray-200" />
                                        </>
                                    )}
                                    <button 
                                        onClick={() => handleDelete(promo._id)}
                                        className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                    </button>
                                </div>
                            )}
                            <div className="flex items-start justify-between">
                                <div className="flex gap-4">
                                    {/* Image */}
                                    <img
                                        src={promo.coverImage || "/placeholder.png"}
                                        alt="promotion"
                                        className="h-14 w-14 rounded-lg object-cover"
                                    />
                                    {/* Content */}
                                    <div>
                                        <h3 className="text-base font-semibold text-gray-900">
                                            {promo.title}
                                        </h3>
                                        <p className="text-sm text-gray-500">{promo.description}</p>
                                        {/* Badges */}
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            <span
                                                className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                                                    (status === "Active" && promo.status !== "Paused")
                                                        ? "bg-green-100 text-green-700"
                                                        : promo.status === "Paused"
                                                        ? "bg-orange-100 text-orange-700"
                                                        : status === "Scheduled"
                                                        ? "bg-blue-100 text-blue-700"
                                                        : "bg-gray-200 text-gray-700"
                                                }`}
                                            >
                                                {promo.status === "Paused" ? "paused" : status.toLowerCase()}
                                            </span>
                                            <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                                {promo.promoType}
                                            </span>
                                            {promo.promoCode && (
                                                <span className="rounded-md border border-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-900">
                                                    {promo.promoCode}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Stats */}
                            <div className="mt-4 grid grid-cols-3 gap-4 border-t border-gray-100 pt-4 text-center">
                                <div>
                                    <Eye className="mx-auto h-4 w-4 text-gray-400" />
                                    <div className="mt-1 text-sm font-semibold text-gray-900">0</div>
                                    <div className="text-xs text-gray-500">Views</div>
                                </div>
                                <div>
                                    <Bookmark className="mx-auto h-4 w-4 text-gray-400" />
                                    <div className="mt-1 text-sm font-semibold text-gray-900">0</div>
                                    <div className="text-xs text-gray-500">Saves</div>
                                </div>
                                <div>
                                    <Ticket className="mx-auto h-4 w-4 text-gray-400" />
                                    <div className="mt-1 text-sm font-semibold text-gray-900">0</div>
                                    <div className="text-xs text-gray-500">Redeemed</div>
                                </div>
                            </div>
                            {/* Footer */}
                            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                                <span>
                                    {formatDateRange(promo.startDate, promo.endDate)}
                                </span>
                                <span>{promo.currentRedemptions} / {promo.maxRedemptions || "Unlimited"} used</span>
                            </div>
                        </div>
                    );
                    })}
                </div>
            )}

            {/* CREATE PROMOTION MODAL */}
            {isModalOpen && (
                <div className="fixed left-0 right-0 top-16 bottom-0 z-[100] flex items-center justify-center bg-black/60 p-4">
                    <div className="max-h-full w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl">
                        {/* Modal header */}
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                            <div>
                                <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                                    {editingPromotion ? "Edit Promotion" : "Create Promotion"}
                                </h2>
                                <p className="mt-1 text-xs md:text-sm text-gray-600">
                                    Set up a special offer to attract more golfers.
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal body */}
                        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">
                            {/* Title */}
                            <div>
                                <label className="text-sm font-medium text-gray-900">Title *</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g., 20% Off All Lessons"
                                    className="mt-2 w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                                    required
                                />
                            </div>

                            {/* Promotion Type + Discount Value */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-900">Promotion Type *</label>
                                    <select
                                        value={promoType}
                                        onChange={(e) => setPromoType(e.target.value)}
                                        className="mt-2 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                                    >
                                        <option>Percentage Off</option>
                                        <option>Dollar Off</option>
                                        <option>BOGO</option>
                                        <option>Free Add-On</option>
                                        <option>Early Bird</option>
                                        <option>Limited Time</option>
                                        <option>Promo Code</option>
                                        <option>First Timer</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-900">Discount Value *</label>
                                    <input
                                        type="number"
                                        value={discountValue}
                                        onChange={(e) => setDiscountValue(e.target.value)}
                                        placeholder="20"
                                        className="mt-2 w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-sm font-medium text-gray-900">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    placeholder="Describe your promotion..."
                                    className="mt-2 w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                                />
                            </div>

                            {/* Promo Code with generate button */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-gray-900">Promo Code</label>
                                    <input
                                        type="text"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                        placeholder="GOLF2025"
                                        className="mt-2 w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                                    />
                                </div>

                                <div className="flex items-end">
                                    <button
                                        type="button"
                                        onClick={generatePromoCode}
                                        className="ml-auto inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200"
                                    >
                                        <Sparkles className="h-4 w-4 text-gray-800" />
                                        Generate
                                    </button>
                                </div>
                            </div>

                            {/* Dates with Time */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-900">Start Date & Time *</label>
                                    <input
                                        type="datetime-local"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="mt-2 w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-900">End Date & Time *</label>
                                    <input
                                        type="datetime-local"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="mt-2 w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-900">Visibility</label>
                                    <select
                                        value={visibility}
                                        onChange={(e) => setVisibility(e.target.value)}
                                        className="mt-2 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                                    >
                                        <option>Public</option>
                                        <option>Followers Only</option>
                                        <option>Event Participants</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-900">Max Redemptions (Optional)</label>
                                    <input
                                        type="text"
                                        value={maxRedemptions}
                                        onChange={(e) => setMaxRedemptions(e.target.value)}
                                        placeholder="Unlimited"
                                        className="mt-2 w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                                    />
                                </div>
                            </div>

                            {/* Promotion Image */}
                            <div>
                                <label className="text-sm font-medium text-gray-900">Promotion Image</label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        const f = e.dataTransfer.files[0];
                                        if (f) {
                                            setImageFile(f);
                                            const reader = new FileReader();
                                            reader.onload = () => setImagePreview(reader.result as string);
                                            reader.readAsDataURL(f);
                                        }
                                    }}
                                    className="mt-2 flex h-40 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-cyan-500 transition-colors"
                                >
                                    {imagePreview ? (
                                        <div className="h-full w-full overflow-hidden rounded-lg">
                                            <img className="h-full w-full object-cover" src={imagePreview} alt="Preview" />
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                                                <UploadCloud className="h-6 w-6 text-gray-400" />
                                            </div>
                                            <p className="text-sm font-medium text-gray-800">Drop images here or click to upload</p>
                                            <p className="mt-1 text-xs text-gray-500">Single image • PNG, JPG up to 10MB</p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-2 flex items-center gap-2">
                                    <input
                                        ref={fileInputRef}
                                        id="promo-image"
                                        type="file"
                                        accept="image/png,image/jpeg"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    {imagePreview && (
                                        <button type="button" onClick={clearImage} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                            Remove Image
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Footer buttons */}
                            <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 pb-2 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="inline-flex items-center justify-center rounded-md px-5 py-2 text-sm font-medium shadow-sm transition bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700"
                                >
                                    {editingPromotion ? "Update Promotion" : "Create Promotion"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* QR Code Modal */}
            {isQRModalOpen && qrPromotion && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4">
                  <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          Promotion QR Code
                        </h2>
                        <p className="text-sm text-gray-500">
                          Share this QR code for easy promotion redemption
                        </p>
                      </div>
                      <button
                        onClick={closeQRModal}
                        className="rounded-full p-1 text-gray-400 hover:bg-gray-100"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    {/* Body */}
                    <div className="p-6">
                      {!isQrGenerated ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 px-6 py-12 text-center">
                          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100">
                            <Share2 className="h-7 w-7 text-gray-400" />
                          </div>
                          <p className="mb-5 text-sm text-gray-500">
                            No QR code generated yet
                          </p>
                          <button 
                            onClick={handleGenerateQR}
                            className="rounded-md bg-emerald-700 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-800"
                          >
                            Generate QR Code
                          </button>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-gray-200 p-6 text-center">
                          {/* QR IMAGE */}
                          <div className="mx-auto mb-6 w-56 h-56 flex items-center justify-center">
                            <div ref={qrSvgRef} className="w-full h-full">
                              <QRCode
                                value={qrPromotion.promoCode || qrPromotion._id}
                                size={224}
                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                              />
                            </div>
                          </div>
                          {/* Promotion info */}
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {qrPromotion.promoType === "Percentage Off" 
                              ? `${qrPromotion.discountValue}% off` 
                              : `${qrPromotion.discountValue} off`
                            }
                          </h3>
                          <p className="text-sm text-gray-500 mb-4">{qrPromotion.description}</p>
                          {/* Code */}
                          <div className="mx-auto w-fit rounded-lg bg-blue-100 px-6 py-3 text-center">
                            <p className="text-xs text-blue-700 mb-1">Code:</p>
                            <p className="text-base font-semibold text-blue-800">
                              {qrPromotion.promoCode || qrPromotion._id}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Footer - only show when generated */}
                    {isQrGenerated && (
                      <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
                        <button
                          onClick={handleDownloadQR}
                          className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-14 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </button>
                        <button
                          onClick={closeQRModal}
                          className="rounded-md bg-gradient-to-r from-blue-600 to-cyan-600 px-19 py-2 text-sm font-medium text-white hover:from-blue-700 hover:to-cyan-700"
                        >
                          Done
                        </button>
                      </div>
                    )}
                  </div>
                </div>
            )}

            {/* Boost Promotion Modal */}
            {isBoostModalOpen && boostPromotion && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4">
                    <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl">
                        {/* Header */}
                        <div className="flex items-start justify-between border-b px-6 py-4">
                            <div className="flex gap-3">
                                <Zap className="h-5 w-5 text-yellow-500 mt-1" />
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Boost Promotion
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        Increase visibility and reach more golfers in your area
                                    </p>
                                </div>
                            </div>
                            <button onClick={closeBoostModal} className="rounded-full p-1 text-gray-400 hover:bg-gray-100">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Promotion Preview */}
                        <div className="px-6 pt-6">
                            <div className="flex items-center gap-4 rounded-lg border p-4">
                                <img
                                    src={boostPromotion.coverImage || "/placeholder.png"}
                                    alt="promo"
                                    className="h-16 w-16 rounded-lg object-cover"
                                />
                                <div>
                                    <h3 className="text-base font-semibold text-gray-900">
                                        {boostPromotion.promoType === "Percentage Off" 
                                            ? `${boostPromotion.discountValue}% off` 
                                            : `${boostPromotion.discountValue} off`
                                        }
                                    </h3>
                                    <p className="text-sm text-gray-500">{boostPromotion.description}</p>
                                </div>
                            </div>
                        </div>

                        {/* Packages */}
                        <div className="px-6 pt-6">
                            <h3 className="mb-3 text-sm font-semibold text-gray-900">
                                Choose Your Boost Package
                            </h3>

                            <div className="space-y-4">
                                {/* Starter */}
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="flex items-start gap-3">
                                        <input 
                                            type="radio" 
                                            name="package" 
                                            value="starter"
                                            checked={selectedPackage === "starter"}
                                            onChange={(e) => setSelectedPackage(e.target.value)}
                                        />
                                        <div>
                                            <p className="font-medium">Starter Boost</p>
                                            <p className="text-sm text-gray-500">Great for testing</p>
                                            <p className="text-xs text-gray-400">1,000 impressions</p>
                                        </div>
                                    </div>
                                    <span className="text-lg font-semibold text-green-700">$5</span>
                                </div>

                                {/* Basic (Selected) */}
                                <div className={`relative flex items-center justify-between rounded-lg border-2 p-4 ${
                                    selectedPackage === "basic" ? "border-green-600 bg-green-50" : "border-gray-200"
                                }`}>
                                    {selectedPackage === "basic" && (
                                        <span className="absolute right-4 top-2 rounded-full bg-yellow-400 px-3 py-0.5 text-xs font-semibold text-white">
                                            POPULAR
                                        </span>
                                    )}
                                    <div className="flex items-start gap-3">
                                        <input 
                                            type="radio" 
                                            name="package" 
                                            value="basic"
                                            checked={selectedPackage === "basic"}
                                            onChange={(e) => setSelectedPackage(e.target.value)}
                                        />
                                        <div>
                                            <p className="font-medium">Basic Boost</p>
                                            <p className="text-sm text-gray-600">Good local reach</p>
                                            <p className="text-xs text-gray-500">2,500 impressions</p>
                                        </div>
                                    </div>
                                    <span className="text-xl font-bold text-green-700">$10</span>
                                </div>

                                {/* Standard */}
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="flex items-start gap-3">
                                        <input 
                                            type="radio" 
                                            name="package" 
                                            value="standard"
                                            checked={selectedPackage === "standard"}
                                            onChange={(e) => setSelectedPackage(e.target.value)}
                                        />
                                        <div>
                                            <p className="font-medium">Standard Boost</p>
                                            <p className="text-sm text-gray-500">Strong visibility</p>
                                            <p className="text-xs text-gray-400">7,500 impressions</p>
                                        </div>
                                    </div>
                                    <span className="text-lg font-semibold text-green-700">$25</span>
                                </div>

                                {/* Premium */}
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="flex items-start gap-3">
                                        <input 
                                            type="radio" 
                                            name="package" 
                                            value="premium"
                                            checked={selectedPackage === "premium"}
                                            onChange={(e) => setSelectedPackage(e.target.value)}
                                        />
                                        <div>
                                            <p className="font-medium">Premium Boost</p>
                                            <p className="text-sm text-gray-500">Maximum exposure</p>
                                            <p className="text-xs text-gray-400">20,000 impressions</p>
                                        </div>
                                    </div>
                                    <span className="text-lg font-semibold text-green-700">$50</span>
                                </div>

                                {/* Citywide */}
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="flex items-start gap-3">
                                        <input 
                                            type="radio" 
                                            name="package" 
                                            value="citywide"
                                            checked={selectedPackage === "citywide"}
                                            onChange={(e) => setSelectedPackage(e.target.value)}
                                        />
                                        <div>
                                            <p className="font-medium">Citywide</p>
                                            <p className="text-sm text-gray-500">Blanket coverage</p>
                                            <p className="text-xs text-gray-400">50,000 impressions</p>
                                        </div>
                                    </div>
                                    <span className="text-lg font-semibold text-green-700">$100</span>
                                </div>
                            </div>
                        </div>

                        {/* Radius & Duration */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 pt-6">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    Radius (miles)
                                </label>
                                <input
                                    type="number"
                                    value={radius}
                                    onChange={(e) => setRadius(parseInt(e.target.value) || 15)}
                                    className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Target golfers within {radius} miles
                                </p>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium">
                                    <Clock className="h-4 w-4 text-gray-400" />
                                    Duration (days)
                                </label>
                                <input
                                    type="number"
                                    value={duration}
                                    onChange={(e) => setDuration(parseInt(e.target.value) || 3)}
                                    className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Boost will run for {duration} days
                                </p>
                            </div>
                        </div>

                        {/* Estimated Results */}
                        <div className="mx-6 mt-6 rounded-xl bg-green-50 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="h-5 w-5 text-green-700" />
                                <h4 className="font-semibold text-green-900">
                                    Estimated Results
                                </h4>
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-2xl font-bold text-green-700">2,500</p>
                                    <p className="text-sm text-gray-600">Impressions</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-green-700">375</p>
                                    <p className="text-sm text-gray-600">Est. Clicks</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-green-700">200</p>
                                    <p className="text-sm text-gray-600">Est. Saves</p>
                                </div>
                            </div>
                        </div>

                        {/* Total */}
                        <div className="mx-6 mt-6 flex items-center justify-between rounded-lg bg-gray-100 px-6 py-4">
                            <div>
                                <p className="text-sm font-medium">Total Cost</p>
                                <p className="text-xs text-gray-500">{duration} day boost • {radius}mi radius</p>
                            </div>
                            <p className="text-2xl font-bold">
                                ${calculateTotalCost()}
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 border-t px-6 py-4">
                            <button onClick={closeBoostModal} className="rounded-md border px-4 py-2 text-sm">
                                Cancel
                            </button>
                            <button className="flex items-center gap-2 rounded-md bg-yellow-500 px-5 py-2 text-sm font-semibold text-white hover:bg-yellow-600">
                                <Zap className="h-4 w-4" />
                                Boost for ${calculateTotalCost()}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}