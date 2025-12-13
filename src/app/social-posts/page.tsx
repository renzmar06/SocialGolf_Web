"use client";

import { useState, useEffect } from "react";
import CreatePostModal from "@/components/social/CreatePostModal";
import { Eye, Heart, Bookmark, Search, Edit, Trash2, Calendar } from "lucide-react";
import { SocialPost } from "@/types/socialPost";
import DataTable from "react-data-table-component";
import toast, { Toaster } from "react-hot-toast";

export default function SocialPostsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [posts, setPosts] = useState<SocialPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingPost, setEditingPost] = useState<SocialPost | null>(null);
    const [activeTab, setActiveTab] = useState<"all" | "published" | "drafts">("all");

    const fetchPosts = async () => {
        try {
            const res = await fetch("/api/social-posts");
            if (res.ok) {
                const data = await res.json();
                setPosts(data.posts);
            }
        } catch (error) {
            console.error("Failed to fetch posts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase());
        let matchesTab = true;
        if (activeTab === "published") {
            matchesTab = post.status === "published";
        } else if (activeTab === "drafts") {
            matchesTab = post.status === "draft";
        }
        return matchesSearch && matchesTab;
    });

    const handleCreatePost = async (data: any) => {
        try {
            const res = await fetch("/api/social-posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(data.message || "Post created successfully!");
                setIsModalOpen(false);
                fetchPosts();
            } else {
                const error = await res.json();
                toast.error(error.message || "Failed to create post");
            }
        } catch (error) {
            toast.error("Network error. Please try again.");
        }
    };

    const handleEditPost = async (data: any) => {
        if (!editingPost) return;
        
        try {
            const res = await fetch(`/api/social-posts/${editingPost._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(data.message || "Post updated successfully!");
                setEditingPost(null);
                fetchPosts();
            } else {
                const error = await res.json();
                toast.error(error.message || "Failed to update post");
            }
        } catch (error) {
            toast.error("Network error. Please try again.");
        }
    };

    const handleDeletePost = async (id: string) => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        
        try {
            const res = await fetch(`/api/social-posts/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(data.message || "Post deleted successfully!");
                fetchPosts();
            } else {
                const error = await res.json();
                toast.error(error.message || "Failed to delete post");
            }
        } catch (error) {
            toast.error("Network error. Please try again.");
        }
    };

    const getStats = () => {
        return {
            totalViews: posts.reduce((sum, post) => sum + post.views, 0),
            totalLikes: posts.reduce((sum, post) => sum + post.likes, 0),
            totalSaves: posts.reduce((sum, post) => sum + post.saves, 0),
        };
    };

    const stats = getStats();

    return (
        <>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto p-6">

                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Social Posts</h1>
                            <p className="text-gray-600 mt-2">Share updates with your golf community</p>
                        </div>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:from-blue-700 hover:to-cyan-700"
                        >
                            + Create Post
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Views</p>
                                    <p className="text-3xl font-bold mt-2">{stats.totalViews}</p>
                                </div>
                                <Eye className="w-10 h-10 text-blue-500" />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Likes</p>
                                    <p className="text-3xl font-bold mt-2">{stats.totalLikes}</p>
                                </div>
                                <Heart className="w-10 h-10 text-pink-500" />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Saves</p>
                                    <p className="text-3xl font-bold mt-2">{stats.totalSaves}</p>
                                </div>
                                <Bookmark className="w-10 h-10 text-orange-500" />
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-8 border-b border-gray-200 mb-8">
                        <button 
                            onClick={() => setActiveTab("all")}
                            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === "all" 
                                    ? "border-teal-500 text-teal-600" 
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            All Posts ({posts.length})
                        </button>
                        <button 
                            onClick={() => setActiveTab("published")}
                            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === "published" 
                                    ? "border-teal-500 text-teal-600" 
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            Published ({posts.filter(p => p.status === "published").length})
                        </button>
                        <button 
                            onClick={() => setActiveTab("drafts")}
                            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === "drafts" 
                                    ? "border-teal-500 text-teal-600" 
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            Drafts ({posts.filter(p => p.status === "draft").length})
                        </button>
                    </div>

                    {/* Search Input */}
                    <div className="mb-6 w-full">
                        <div className="relative">
                            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                            <input
                                type="text"
                                placeholder="Search posts..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Posts Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        {loading ? (
                            <div className="p-20 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
                                <p className="text-gray-600 mt-4">Loading posts...</p>
                            </div>
                        ) : filteredPosts.length === 0 ? (
                            <div className="p-20 text-center">
                                <div className="max-w-md mx-auto">
                                    <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 border-2 border-dashed border-gray-300 rounded-xl" />
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        {searchTerm ? "No posts found" : "No posts yet"}
                                    </h3>
                                    <p className="text-gray-600 mt-3">
                                        {searchTerm ? "Try adjusting your search" : "Create your first post to engage with golfers"}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <DataTable
                                columns={[
                                    {
                                        name: 'Author',
                                        selector: (row: SocialPost) => typeof row.author === 'string' ? row.author : 'Unknown',
                                        cell: (row: SocialPost) => (
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                                                    <span className="text-teal-600 font-semibold text-sm">
                                                        {(row.author as any)?.name?.charAt(0)?.toUpperCase()}
                                                    </span>
                                                </div>
                                                <span className="font-medium">{typeof row.author === 'string' ? row.author : (row.author as any)?.name || 'Unknown'}</span>
                                            </div>
                                        ),
                                        width: '250px'
                                    },
                                    {
                                        name: 'Content',
                                        selector: (row: SocialPost) => row.content,
                                        cell: (row: SocialPost) => (
                                            <div className="max-w-xs">
                                                <p className="text-sm text-gray-900 truncate">{row.content}</p>
                                                {row.images.length > 0 && (
                                                    <div className="flex gap-1 mt-2">
                                                        {row.images.slice(0, 3).map((img, idx) => (
                                                            <img key={idx} src={img} alt={`Post ${idx + 1}`} className="w-8 h-8 object-cover rounded" />
                                                        ))}
                                                        {row.images.length > 3 && (
                                                            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-xs">+{row.images.length - 3}</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ),
                                        width: '200px'
                                    },
                                    {
                                        name: 'Type',
                                        selector: (row: SocialPost) => row.postType || '',
                                        cell: (row: SocialPost) => row.postType && (
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">{row.postType}</span>
                                        ),
                                        width: '180px'
                                    },
                                    {
                                        name: 'Status',
                                        selector: (row: SocialPost) => row.status,
                                        cell: (row: SocialPost) => (
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                row.status === "published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                            }`}>{row.status}</span>
                                        ),
                                        width: '100px'
                                    },
                                    {
                                        name: 'Engagement',
                                        cell: (row: SocialPost) => (
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <div className="flex items-center gap-1"><Eye className="w-3 h-3" /><span>{row.views}</span></div>
                                                <div className="flex items-center gap-1"><Heart className="w-3 h-3" /><span>{row.likes}</span></div>
                                                <div className="flex items-center gap-1"><Bookmark className="w-3 h-3" /><span>{row.saves}</span></div>
                                            </div>
                                        ),
                                        width: '150px'
                                    },
                                    {
                                        name: 'Date',
                                        selector: (row: SocialPost) => new Date(row.createdAt).toLocaleDateString(),
                                        cell: (row: SocialPost) => <span className="text-sm text-gray-500">{new Date(row.createdAt).toLocaleDateString()}</span>,
                                        width: '100px'
                                    },
                                    {
                                        name: 'Actions',
                                        cell: (row: SocialPost) => (
                                            <div className="flex gap-2">
                                                <button onClick={() => setEditingPost(row)} className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDeletePost(row._id)} className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ),
                                        width: '100px'
                                    }
                                ]}
                                data={filteredPosts}
                                pagination
                                paginationPerPage={10}
                                paginationRowsPerPageOptions={[5, 10, 15, 20]}
                                highlightOnHover
                                striped
                                responsive
                            />
                        )}
                    </div>

                </div>
            </div>

            <CreatePostModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreatePost}
            />
            
            {editingPost && (
                <CreatePostModal
                    isOpen={true}
                    onClose={() => setEditingPost(null)}
                    onSubmit={handleEditPost}
                    initialData={{
                        content: editingPost.content,
                        postType: editingPost.postType,
                        images: editingPost.images,
                        status: editingPost.status
                    }}
                />
            )}
            
            <Toaster position="top-right" />
        </>
    );
}