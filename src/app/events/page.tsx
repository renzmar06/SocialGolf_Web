"use client";

import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import {
    fetchEvents,
    saveEvent,
    updateEvent,
    deleteEvent,
} from "@/store/slices/eventSlice";
import {
    Calendar,
    Plus,
    X,
    Search,
    UploadCloud,
    MapPin,
    Users,
    Edit2,
    Trash2,
    QrCode,
    Download,
} from "lucide-react";
import QRCode from "react-qr-code";
import toast, { Toaster } from "react-hot-toast";

const TABS = ["All", "Upcoming", "Drafts", "Past"] as const;
type Tab = (typeof TABS)[number];

export default function EventsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { data: events, loading, error } = useSelector(
        (state: RootState) => state.event
    );

    const [activeTab, setActiveTab] = useState<Tab>("All");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<any>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // QR modal state
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [qrEvent, setQrEvent] = useState<any | null>(null);
    const qrSvgRef = useRef<any>(null);

    // Participants modal state
    const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
    const [participantsEvent, setParticipantsEvent] = useState<any | null>(null);

    // Location autocomplete state
    const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const locationInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        title: "",
        eventType: "Tournament",
        format: "Scramble",
        date: "",
        startTime: "",
        endTime: "",
        location: "",
        price: 0,
        maxParticipants: "",
        description: "",
        rules: "",
        prizes: "",
        coverImage: "",
        status: "Draft",
    });

    const [prizeRows, setPrizeRows] = useState([{ id: 1, name: "", value: "" }]);

    useEffect(() => {
        dispatch(fetchEvents());
    }, [dispatch]);

    // Load Google Maps API
    useEffect(() => {
        if (!window.google) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_MAP_API_KEY || 'AIzaSyDkdvQ-Qr14JYjH9qV3l15YB4uGvOn-mFs'}&libraries=places`;
            script.async = true;
            document.head.appendChild(script);
        }
    }, []);

    const openCreateModal = () => {
        setEditingEvent(null);
        setFormData({
            title: "",
            eventType: "Tournament",
            format: "Scramble",
            date: "",
            startTime: "",
            endTime: "",
            location: "",
            price: 0,
            maxParticipants: "",
            description: "",
            rules: "",
            prizes: "",
            coverImage: "",
            status: "Draft",
        });
        setPrizeRows([{ id: 1, name: "", value: "" }]);
        setSelectedImage(null);
        setImagePreview(null);
        setIsModalOpen(true);
    };

    const openEditModal = (event: any) => {
        setEditingEvent(event);
        setFormData({
            title: event.title,
            eventType: event.eventType,
            format: event.format,
            date: event.date,
            startTime: event.startTime,
            endTime: event.endTime,
            location: event.location,
            price: event.price,
            maxParticipants: event.maxParticipants,
            description: event.description,
            rules: event.rules,
            prizes: event.prizes,
            coverImage: event.coverImage,
            status: event.status,
        });

        // Parse prizes string back to prize rows for editing
        if (event.prizes) {
            const parsedPrizes = event.prizes.split(', ').map((prize: string, index: number) => {
                const [name, value] = prize.split(': ');
                return { id: index + 1, name: name || '', value: value || '' };
            });
            setPrizeRows(parsedPrizes.length > 0 ? parsedPrizes : [{ id: 1, name: "", value: "" }]);
        } else {
            setPrizeRows([{ id: 1, name: "", value: "" }]);
        }

        if (event.coverImage) {
            setImagePreview(event.coverImage);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingEvent(null);
        setSelectedImage(null);
        setImagePreview(null);
    };

    const handleFileSelect = (file: File) => {
        if (
            file &&
            (file.type === "image/png" || file.type === "image/jpeg") &&
            file.size <= 10 * 1024 * 1024
        ) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setImagePreview(result);
                setFormData((prev) => ({ ...prev, coverImage: result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file);
    };

    const handleInputChange = (
        e:
            | React.ChangeEvent<HTMLInputElement>
            | React.ChangeEvent<HTMLTextAreaElement>
            | React.ChangeEvent<HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        const numericFields = ["price"];

        setFormData((prev) => ({
            ...prev,
            [name]: numericFields.includes(name) ? parseFloat(value) || 0 : value,
        }));

        // Handle location autocomplete
        if (name === 'location' && value.length > 2) {
            searchPlaces(value);
        } else if (name === 'location') {
            setLocationSuggestions([]);
            setShowLocationDropdown(false);
        }
    };

    const searchPlaces = (query: string) => {
        if (!window.google) return;

        const service = new window.google.maps.places.AutocompleteService();
        service.getPlacePredictions(
            {
                input: query,
                types: ['establishment', 'geocode'],
            },
            (predictions, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                    setLocationSuggestions(predictions.slice(0, 5));
                    setShowLocationDropdown(true);
                } else {
                    setLocationSuggestions([]);
                    setShowLocationDropdown(false);
                }
            }
        );
    };

    const handleLocationSelect = (suggestion: any) => {
        setFormData(prev => ({ ...prev, location: suggestion.description }));
        setLocationSuggestions([]);
        setShowLocationDropdown(false);
        locationInputRef.current?.blur();
    };

    const addPrizeRow = () => {
        const newId = Math.max(...prizeRows.map(row => row.id)) + 1;
        setPrizeRows(prev => [...prev, { id: newId, name: "", value: "" }]);
    };

    const removePrizeRow = (id: number) => {
        if (prizeRows.length > 1) {
            setPrizeRows(prev => prev.filter(row => row.id !== id));
        }
    };

    const updatePrizeRow = (id: number, field: 'name' | 'value', value: string) => {
        setPrizeRows(prev => prev.map(row =>
            row.id === id ? { ...row, [field]: value } : row
        ));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isFormValid) return;

        try {
            // Convert prize rows to string format
            const prizesString = prizeRows
                .filter(row => row.name.trim() || row.value.trim())
                .map(row => `${row.name}: ${row.value}`)
                .join(', ');

            const submitData = {
                ...formData,
                prizes: prizesString
            };

            if (editingEvent) {
                await dispatch(
                    updateEvent({ id: editingEvent._id, data: submitData })
                ).unwrap();
                toast.success('Event updated successfully!');
            } else {
                await dispatch(saveEvent(submitData)).unwrap();
                toast.success('Event created successfully!');
            }

            handleCloseModal();
        } catch (error) {
            console.error("Failed to save event:", error);
            toast.error(editingEvent ? 'Failed to update event' : 'Failed to create event');
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this event?')) {
            try {
                dispatch(deleteEvent(id));
                toast.success('Event deleted successfully!');
            } catch (error) {
                toast.error('Failed to delete event');
            }
        }
    };

    // publish button – just updates status to "Published"
    const handlePublish = async (event: any) => {
        try {
            const payload = {
                ...event,
                status: "Published",
                updatedAt: new Date()
            };
            await dispatch(updateEvent({ id: event._id, data: payload })).unwrap();
            toast.success('Event published successfully!');
        } catch (err) {
            console.error("Failed to publish:", err);
            toast.error('Failed to publish event');
        }
    };

    const isFormValid =
        formData.title.trim() !== "" && formData.date.trim() !== "";

    // ---- QR MODAL HANDLERS ----
    const openQRModal = (event: any) => {
        setQrEvent(event);
        setIsQRModalOpen(true);
    };

    const closeQRModal = () => {
        setIsQRModalOpen(false);
        setQrEvent(null);
    };

    const handleDownloadQR = () => {
        if (!qrSvgRef.current || !qrEvent) return;

        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(qrSvgRef.current);
        const blob = new Blob([svgString], {
            type: "image/svg+xml;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `${qrEvent.title || "event-qr"}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // ---- PARTICIPANTS MODAL HANDLERS ----
    const openParticipantsModal = (event: any) => {
        setParticipantsEvent(event);
        setIsParticipantsModalOpen(true);
    };

    const closeParticipantsModal = () => {
        setIsParticipantsModalOpen(false);
        setParticipantsEvent(null);
    };

    // QR value (simple JSON with some event data)
    const qrValue =
        qrEvent &&
        JSON.stringify({
            id: qrEvent._id,
            title: qrEvent.title,
            date: qrEvent.date,
            location: qrEvent.location,
        });

    // For now no participants data is provided – using 0
    const participantsCount = participantsEvent?.participants
        ? participantsEvent.participants.length
        : 0;

    return (
        <>
            <Toaster position="top-right" />
            <div className="space-y-6">
            {/* Header row */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                        Events
                    </h1>
                    <p className="text-stone-500">
                        Create and manage your golf events
                    </p>
                </div>

                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:from-blue-700 hover:to-cyan-700"
                >
                    <Plus className="h-4 w-4" />
                    Create Event
                </button>
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
                                    : "text-gray-700 hover:bg-gray-100 "
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
                                placeholder="Search events..."
                                className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                            />
                        </div>
                    </div>

                    {/* (Kept layout flexible — no additional dropdown added per your request) */}
                </div>
            </div>

            {/* Events grid or empty state */}
            {events.length === 0 ? (
                <div className="flex min-h-[380px] items-center justify-center rounded-3xl border border-gray-200 bg-white px-4 py-16 shadow-sm">
                    <div className="text-center max-w-md">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100">
                            <Calendar className="h-12 w-12 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-1">
                            No events yet
                        </h2>
                        <p className="text-sm text-gray-600 mb-6">
                            Create your first event to start engaging with golfers
                        </p>
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:from-blue-700 hover:to-cyan-700"
                        >
                            <Plus className="h-4 w-4" />
                            Create Event
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {events.map((event: any) => {
                        const statusLower = (event.status || "").toLowerCase();
                        const isDraft = statusLower === "draft";
                        const isPublished = statusLower === "published";

                        return (
                            <div
                                key={event._id}
                                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col"
                            >
                                {/* Image + badges + hover actions */}
                                <div className="relative group h-56 w-full overflow-hidden">
                                    {event.coverImage ? (
                                        <img
                                            src={event.coverImage}
                                            alt={event.title}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-gradient-to-tr from-blue-200 via-blue-500 to-cyan-500" />
                                    )}

                                    {/* Status + type pills */}
                                    <div className="absolute left-4 top-4 flex items-center gap-2">
                                        <span
                                            className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize ${isDraft
                                                ? "bg-amber-500 text-white"
                                                : isPublished
                                                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                                                    : "bg-gray-600 text-white"
                                                }`}
                                        >
                                            {statusLower || "draft"}
                                        </span>
                                        {event.eventType && (
                                            <span className="rounded-lg bg-white/90 px-3 py-1 text-xs font-medium text-gray-900 shadow-sm">
                                                {event.eventType}
                                            </span>
                                        )}
                                    </div>

                                    {/* Hover edit/delete buttons */}
                                    <div className="absolute right-4 top-4 flex flex-col gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                        <button
                                            type="button"
                                            onClick={() => openEditModal(event)}
                                            className="inline-flex items-center justify-center rounded-full bg-white/95 p-2 shadow-sm hover:bg-cyan-50"
                                        >
                                            <Edit2 className="h-4 w-4 text-gray-800" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(event._id)}
                                            className="inline-flex items-center justify-center rounded-full bg-white/95 p-2 shadow-sm hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4 text-red-600" />
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="px-6 pt-5 pb-4 flex-1 flex flex-col">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {event.title || "Golf Tournament"}
                                    </h3>

                                    {/* Meta rows */}
                                    <div className="space-y-1 text-sm text-gray-600 mb-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <span>
                                                {event.date
                                                    ? new Date(event.date).toLocaleDateString(undefined, {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    })
                                                    : "Date TBA"}
                                            </span>
                                        </div>
                                        {event.location && (
                                            <div className="flex items-start gap-2">
                                                <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                                <span className="break-words">{event.location}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between text-sm">
                                            {/* left: participants */}
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-gray-400" />
                                                <span>
                                                    0/
                                                    {event.maxParticipants ? event.maxParticipants : "0"}
                                                </span>
                                            </div>

                                            {/* right: price */}
                                            <span className="text-blue-700 font-semibold">
                                                ${event.price ?? 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom action bar */}
                                <div className="border-t border-gray-100 px-6 py-3 ">
                                    {isDraft ? (
                                        <button
                                            type="button"
                                            onClick={() => handlePublish(event)}
                                            className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 py-2 text-sm font-semibold text-white hover:from-blue-700 hover:to-cyan-700"
                                        >
                                            Publish
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => openParticipantsModal(event)}
                                                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                                            >
                                                <Users className="h-4 w-4" />
                                                Participants
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => openQRModal(event)}
                                                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                                            >
                                                <QrCode className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create / Edit Event Modal */}
            {isModalOpen && (
                <div className="fixed left-0 right-0 top-16 bottom-0 z-[100] flex items-center justify-center bg-black/60 p-4">
                    <div className="max-h-full w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl">
                        {/* Modal header */}
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                            <div>
                                <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                                    {editingEvent ? "Edit Event" : "Create New Event"}
                                </h2>
                                <p className="mt-1 text-xs md:text-sm text-gray-600">
                                    Set up a golf event with format details, pricing, and prizes.
                                </p>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal body */}
                        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">
                            {/* Event title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1">
                                    Event Name *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="Annual Golf Tournament"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                                />
                            </div>

                            {/* Event type + format */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-1">
                                        Event Type
                                    </label>
                                    <select
                                        name="eventType"
                                        value={formData.eventType}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                                    >
                                        <option>Tournament</option>
                                        <option>Meet Up</option>
                                        <option>Group Lesson</option>
                                        <option>Demo Day</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-1">
                                        Format
                                    </label>
                                    <select
                                        name="format"
                                        value={formData.format}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                                    >
                                        <option>Scramble</option>
                                        <option>Stroke Play</option>
                                        <option>Skins</option>
                                        <option>Best Ball</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>

                            {/* Date & time */}
                            <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-1">
                                        Date *
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-1">
                                        Start Time
                                    </label>
                                    <input
                                        type="time"
                                        name="startTime"
                                        value={formData.startTime}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-1">
                                        End Time
                                    </label>
                                    <input
                                        type="time"
                                        name="endTime"
                                        value={formData.endTime}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                                    />
                                </div>
                            </div>

                            {/* Location */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-900 mb-1">
                                    Location
                                </label>
                                <input
                                    ref={locationInputRef}
                                    type="text"
                                    name="location"
                                    placeholder="Pine Valley Golf Club"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    onFocus={() => formData.location.length > 2 && setShowLocationDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                                />
                                {showLocationDropdown && locationSuggestions.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                        {locationSuggestions.map((suggestion, index) => (
                                            <button
                                                key={suggestion.place_id}
                                                type="button"
                                                onClick={() => handleLocationSelect(suggestion)}
                                                className="w-full px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                    <span className="truncate">{suggestion.description}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Price + Max participants */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-1">
                                        Price ($)
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        min={0}
                                        placeholder="0"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-1">
                                        Max Participants
                                    </label>
                                    <input
                                        type="text"
                                        name="maxParticipants"
                                        placeholder="Unlimited"
                                        value={formData.maxParticipants}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    name="description"
                                    placeholder="Describe your event..."
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                                />
                            </div>

                            {/* Rules & format details */}
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1">
                                    Rules &amp; Format Details
                                </label>
                                <textarea
                                    rows={3}
                                    name="rules"
                                    placeholder="Event rules and format details..."
                                    value={formData.rules}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                                />
                            </div>

                            {/* Prizes */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-medium text-gray-900">
                                        Prizes (Optional)
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addPrizeRow}
                                        className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-blue-600 to-cyan-600 px-3 py-1 text-xs font-md text-white hover:from-blue-700 hover:to-cyan-700"
                                    >
                                        <Plus className="h-3 w-3" />
                                        Add
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {prizeRows.map((row) => (
                                        <div key={row.id} className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                placeholder="Prize name (e.g., 1st Place)"
                                                value={row.name}
                                                onChange={(e) => updatePrizeRow(row.id, 'name', e.target.value)}
                                                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Prize value (e.g., $500)"
                                                value={row.value}
                                                onChange={(e) => updatePrizeRow(row.id, 'value', e.target.value)}
                                                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                                            />
                                            {prizeRows.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removePrizeRow(row.id)}
                                                    className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Cover image uploader */}
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1">
                                    Cover Image
                                </label>
                                <div
                                    className="mt-1 flex h-40 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 cursor-pointer hover:bg-gray-100 hover:border-cyan-500 transition-colors"
                                    onDrop={handleDrop}
                                    onDragOver={(e) => e.preventDefault()}
                                    onClick={() =>
                                        document.getElementById("file-input")?.click()
                                    }
                                >
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="h-full w-full object-cover rounded-lg"
                                        />
                                    ) : (
                                        <div className="text-center">
                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm mb-3">
                                                <UploadCloud className="h-6 w-6 text-gray-400" />
                                            </div>
                                            <p className="text-sm font-medium text-gray-800">
                                                Drop images here or click to upload
                                            </p>
                                            <p className="mt-1 text-xs text-gray-500">
                                                Single image • PNG, JPG up to 10MB
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <input
                                    id="file-input"
                                    type="file"
                                    accept="image/png,image/jpeg"
                                    onChange={handleFileInput}
                                    className="hidden"
                                />
                            </div>

                            {/* Footer buttons */}
                            <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 pb-2 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                                {editingEvent && (
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(editingEvent._1d)}
                                        className="inline-flex items-center justify-center rounded-md bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700"
                                    >
                                        Delete
                                    </button>
                                )}

                                <button
                                    type="submit"
                                    disabled={!isFormValid}
                                    className={`inline-flex items-center justify-center rounded-md px-5 py-2 text-sm font-medium shadow-sm transition ${isFormValid
                                        ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        }`}
                                >
                                    {editingEvent ? "Update Event" : "Create Event"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* QR Code Modal */}
            {isQRModalOpen && qrEvent && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4">
                    <div className="w-full max-w-sm rounded-lg bg-white shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                                Event QR Code
                            </h2>
                            <button
                                onClick={closeQRModal}
                                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 pt-6 pb-4 text-center">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {qrEvent.title}
                            </h3>
                            <p className="mt-1 text-sm text-gray-600">
                                {qrEvent.date
                                    ? new Date(qrEvent.date).toLocaleDateString(undefined, {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })
                                    : ""}
                            </p>

                            <div className="mt-6 flex justify-center">
                                <div className="rounded-2xl bg-gray-50 p-6 md:p-8 shadow-inner">
                                    <QRCode
                                        ref={qrSvgRef}
                                        value={qrValue || ""}
                                        size={220}
                                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                    />
                                </div>
                            </div>

                            <p className="mt-6 text-sm text-gray-600">
                                Participants can scan this code to view event details and check
                                in.
                            </p>

                            <div className="mt-6 mb-4 flex justify-center">
                                <button
                                    type="button"
                                    onClick={handleDownloadQR}
                                    className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-2 text-sm font-semibold text-white shadow-md hover:from-blue-700 hover:to-cyan-700"
                                >
                                    <Download className="h-4 w-4" />
                                    Download QR Code
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Participants Modal */}
            {isParticipantsModalOpen && participantsEvent && (
                <div className="fixed inset-0 z-[115] flex items-center justify-center bg-black/60 p-4">
                    <div className="w-full max-w-xl rounded-lg bg-white shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                                {participantsEvent.title || "Event"} - Participants (
                                {participantsCount})
                            </h2>
                            <button
                                onClick={closeParticipantsModal}
                                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-10 flex flex-col items-center justify-center text-center">
                            <div className="flex items-center justify-center rounded-2xl bg-gray-100 h-24 w-24 mb-6">
                                <Users className="h-12 w-12 text-gray-400" />
                            </div>
                            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                                No participants yet
                            </h3>
                            <p className="text-sm md:text-base text-gray-600">
                                Participants will appear here once they register
                            </p>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </>
    );
}
