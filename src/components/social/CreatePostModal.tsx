"use client";

import { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        content: string;
        postType: string;
        images: string[];
        status?: string;
    }) => Promise<void>;
    initialData?: {
        content: string;
        postType: string;
        images: string[];
        status: string;
    };
};

export default function CreatePostModal({ isOpen, onClose, onSubmit, initialData }: Props) {
    const [content, setContent] = useState(initialData?.content || "");
    const [selectedType, setSelectedType] = useState(initialData?.postType || "");
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>(initialData?.images || []);
    const [status, setStatus] = useState(initialData?.status || "draft");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (initialData) {
            setContent(initialData.content);
            setSelectedType(initialData.postType);
            setImagePreviews(initialData.images);
            setImageFiles([]);
            setStatus(initialData.status);
        } else {
            setContent("");
            setSelectedType("");
            setImageFiles([]);
            setImagePreviews([]);
            setStatus("draft");
        }
    }, [initialData]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + imageFiles.length > 4) {
            alert("Maximum 4 images allowed");
            return;
        }
        
        const newFiles: File[] = [];
        const newPreviews: string[] = [];
        
        files.forEach((file) => {
            if (file.type.startsWith("image/")) {
                newFiles.push(file);
                newPreviews.push(URL.createObjectURL(file));
            }
        });
        
        setImageFiles(prev => [...prev, ...newFiles]);
        setImagePreviews(prev => [...prev, ...newPreviews]);
        e.target.value = "";
    };

    const removeImage = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => {
            if (prev[index] && prev[index].startsWith('blob:')) {
                URL.revokeObjectURL(prev[index]);
            }
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleSubmit = async () => {
        if (!content.trim()) {
            setError("Please write something in the content");
            return;
        }
        setError("");
        setIsSubmitting(true);

        try {
            let imageUrls = imagePreviews.filter(url => !url.startsWith('blob:'));
            
            if (imageFiles.length > 0) {
                const formData = new FormData();
                imageFiles.forEach(file => {
                    formData.append('images', file);
                });
                
                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });
                
                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    imageUrls = [...imageUrls, ...uploadData.urls];
                }
            }
            
            await onSubmit({
                content: content.trim(),
                postType: selectedType,
                images: imageUrls,
                status,
            });

            if (!initialData) {
                setContent("");
                setSelectedType("");
                setImageFiles([]);
                setImagePreviews([]);
                setStatus("draft");
            }
            onClose();
        } catch (err) {
            setError("Failed to publish post. Try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-screen overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold">{initialData ? "Edit Post" : "Create New Post"}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Post Type</label>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                        >
                            <option value="">Select Type</option>
                            <option value="Promotion">Promotion</option>
                            <option value="Announcement">Announcement</option>
                            <option value="Event Reminder">Event Reminder</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Content <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Share what's happening at your business..."
                            rows={6}
                            className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none"
                        />
                        <div className="flex justify-between items-center mt-2">
                            {error && <p className="text-sm text-red-500">{error}</p>}
                            <span className="text-sm text-gray-500 ml-auto">{content.length} characters</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Media (Optional)</label>
                        <div className="mt-3 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                            {imagePreviews.length > 0 ? (
                                <div className="grid grid-cols-4 gap-3">
                                    {imagePreviews.map((img, i) => (
                                        <div key={i} className="relative group">
                                            <img
                                                src={img}
                                                alt={`Preview ${i + 1}`}
                                                className="w-full h-24 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(i)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs opacity-0 group-hover:opacity-100 transition"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <>
                                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-sm text-gray-600">Drop images here or click to upload</p>
                                    <p className="text-xs text-gray-500 mt-1">Up to 4 images • PNG, JPG up to 10MB</p>
                                </>
                            )}

                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                id="image-upload"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                            <label
                                htmlFor="image-upload"
                                className={`${imagePreviews.length > 0 ? 'mt-4 px-4 py-2 bg-gray-100 text-gray-700 text-sm' : 'mt-5 px-8 py-3 bg-teal-500 text-white'} inline-block font-medium rounded-lg cursor-pointer hover:bg-teal-600 transition`}
                            >
                                {imagePreviews.length > 0 ? 'Add More Images' : 'Choose Images'}
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !content.trim()}
                            className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:from-blue-700 hover:to-cyan-700"
                        >
                            {isSubmitting ? (initialData ? "Updating..." : "Publishing...") : (initialData ? "Update Post" : "Publish Now")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}