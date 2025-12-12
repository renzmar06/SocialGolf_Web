"use client";

import { useState, useRef } from "react";
import {
    Plus,
    Search,
    UploadCloud,
    Eye,
    Ticket,
    X,
    Sparkles,
    TrendingUp, 
} from "lucide-react";

const TABS = ["All", "Active", "Scheduled", "Boosted", "Expired"] as const;
type Tab = (typeof TABS)[number];

export default function PromotionsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("All");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state
    const [promoType, setPromoType] = useState("Percentage Off");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [promoCode, setPromoCode] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [visibility, setVisibility] = useState("Public");
    const [maxRedemptions, setMaxRedemptions] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        // keep form values or clear as needed
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
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    function generatePromoCode() {
        const code = ("PROMO" + Math.random().toString(36).slice(2, 8)).toUpperCase();
        setPromoCode(code);
    }

    function handleCreatePromotion(e?: React.FormEvent) {
        e?.preventDefault();
        // TODO: save promotion (call API / dispatch)
        // For now, just close modal and reset minimal fields
        setIsModalOpen(false);
        // (Keep user data or clear as required by your flow)
    }

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
                    onClick={openModal}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:from-blue-700 hover:to-cyan-700"
                >
                    <Plus className="h-4 w-4" />
                    Create Promotion
                </button>
            </div>

            {/* Stats cards (without "Total Saves") */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="rounded-xl bg-white p-5 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-600">Active Promotions</div>
                            <div className="mt-3 text-3xl font-bold text-gray-900">0</div>
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
                            <div className="mt-3 text-3xl font-bold text-gray-900">0</div>
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
                                className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Empty state */}
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
                        onClick={openModal}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:from-blue-700 hover:to-cyan-700"
                    >
                        <Plus className="h-4 w-4" />
                        Create Promotion
                    </button>
                </div>
            </div>

            {/* CREATE PROMOTION MODAL */}
            {isModalOpen && (
                <div className="fixed left-0 right-0 top-16 bottom-0 z-[100] flex items-center justify-center bg-black/60 p-4">
                    <div className="max-h-full w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl">
                        {/* Modal header */}
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                            <div>
                                <h2 className="text-xl md:text-2xl font-semibold text-gray-900">Create Promotion</h2>
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
                        <form onSubmit={handleCreatePromotion} className="px-6 py-5 space-y-6">
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

                            {/* Promotion Type (dropdown with 8 options) */}
                            <div>
                                <label className="text-sm font-medium text-gray-900">Promotion Type *</label>
                                <div className="mt-2">
                                    <select
                                        value={promoType}
                                        onChange={(e) => setPromoType(e.target.value)}
                                        className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
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

                            {/* Promo Code (optional) with generate button */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-gray-900">Promo Code (Optional)</label>
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

                            {/* Dates & Visibility + Max Redemptions */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-900">Start Date *</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="mt-2 w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-900">End Date *</label>
                                    <input
                                        type="date"
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
                                    Create Promotion
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
