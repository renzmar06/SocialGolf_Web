"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store/index';
import { fetchBookings, saveBooking, updateBooking, deleteBooking } from '@/store/slices/bookingSlice';
import {
    CalendarCheck2,
    GraduationCap,
    Plus,
    Search,
    X,
    ChevronLeft,
    ChevronRight,
    Clock,
    Users,
    Settings,
    Trash2,
} from "lucide-react";

const TABS = ["Booking Requests", "Calendar View", "Services", "Availability"] as const;
type Tab = (typeof TABS)[number];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function generateTimeOptions() {
    // generate times from 6:00 AM to 7:30 PM in 30 min steps
    const times: string[] = [];
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    for (let h = 6; h <= 19; h++) {
        for (let m = 0; m < 60; m += 30) {
            // stop after 7:30 PM (19:30)
            if (h === 19 && m > 30) continue;
            const hour12 = ((h + 11) % 12) + 1;
            const ampm = h < 12 ? "AM" : "PM";
            times.push(`${hour12}:${pad(m)} ${ampm}`);
        }
    }
    return times;
}
const TIME_OPTIONS = generateTimeOptions();

export default function BookingsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { data: bookings, loading, error } = useSelector((state: RootState) => state.booking);

    const [activeTab, setActiveTab] = useState<Tab>("Booking Requests");
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [editingBooking, setEditingBooking] = useState<any>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedStatus, setSelectedStatus] = useState("All Status");
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");

    const [formData, setFormData] = useState({
        serviceName: "",
        serviceType: "Lesson",
        duration: 60,
        price: 0,
        maxParticipants: 1,
        description: "",
    });

    // slot shape: { id: string, start: string, end: string }
    const [availabilities, setAvailabilities] = useState<Record<string, Record<string, { id: string, start: string, end: string }[]>>>({});

    // availability modal
    const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
    const [availabilityBooking, setAvailabilityBooking] = useState<any | null>(null);
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);

    useEffect(() => {
        dispatch(fetchBookings());
    }, [dispatch]);

    const statusOptions = ["All Status", "Pending", "Confirmed", "Completed", "Cancelled"];

    const openCreateModal = () => {
        setEditingBooking(null);
        setFormData({
            serviceName: "",
            serviceType: "Lesson",
            duration: 60,
            price: 0,
            maxParticipants: 1,
            description: "",
        });
        setIsServiceModalOpen(true);
    };

    const openEditModal = (booking: any) => {
        setEditingBooking(booking);
        setFormData({
            serviceName: booking.serviceName,
            serviceType: booking.serviceType,
            duration: booking.duration,
            price: booking.price,
            maxParticipants: booking.maxParticipants,
            description: booking.description,
        });
        setIsServiceModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsServiceModalOpen(false);
        setEditingBooking(null);
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        const numericFields = ["duration", "price", "maxParticipants"];

        setFormData(prev => ({
            ...prev,
            [name]: numericFields.includes(name) ? parseFloat(value) || 0 : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isFormValid) return;

        try {
            if (editingBooking) {
                await dispatch(updateBooking({ id: editingBooking._id, data: formData })).unwrap();
            } else {
                await dispatch(saveBooking(formData)).unwrap();
            }

            // refresh list so newly created/updated service appears immediately
            await dispatch(fetchBookings()).unwrap?.();
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save booking:', error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await dispatch(deleteBooking(id)).unwrap();
            // refresh list after delete
            await dispatch(fetchBookings()).unwrap?.();
            // also remove availability for that booking if any
            setAvailabilities(prev => {
                const next = { ...prev };
                delete next[id];
                return next;
            });
        } catch (err) {
            console.error("Failed to delete booking:", err);
        }
    };

    const isFormValid = formData.serviceName.trim() !== "" && formData.price > 0;

    const getWeekDays = (date: Date) => {
        const startOfWeek = new Date(date);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);

        const days = [];
        const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(startOfWeek);
            dayDate.setDate(startOfWeek.getDate() + i);
            days.push({
                label: dayLabels[i],
                date: dayDate.getDate(),
                fullDate: new Date(dayDate),
                active: dayDate.toDateString() === selectedDate.toDateString()
            });
        }
        return days;
    };

    const calendarDays = getWeekDays(currentDate);

    const goToPreviousWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 7);
        setCurrentDate(newDate);
    };

    const goToNextWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 7);
        setCurrentDate(newDate);
    };

    const goToToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setSelectedDate(today);
    };

    const selectDate = (date: Date) => {
        setSelectedDate(date);
    };

    const getMonthYear = () => {
        return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    const getSelectedDateString = () => {
        return selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    };

    // ---------- AVAILABILITY modal handlers ----------
    const openAvailabilityModal = (booking: any) => {
        setAvailabilityBooking(booking);
        setIsAvailabilityOpen(true);
        setSelectedDayIndex(0);

        // initialize availability if not present
        setAvailabilities(prev => {
            if (prev[booking._id]) return prev;
            const initDays: Record<string, { id: string, start: string, end: string }[]> = {};
            for (const d of DAYS) initDays[d] = [];
            return { ...prev, [booking._id]: initDays };
        });
    };

    const closeAvailabilityModal = () => {
        setIsAvailabilityOpen(false);
        setAvailabilityBooking(null);
    };

    const addSlotForSelectedDay = () => {
        if (!availabilityBooking) return;
        setAvailabilities(prev => {
            const copy = { ...prev };
            // ensure bookingAvail exists
            const bookingId = availabilityBooking._id;
            const bookingAvail = copy[bookingId] ? { ...copy[bookingId] } : {};
            const day = DAYS[selectedDayIndex];

            const arr = bookingAvail[day] ? [...bookingAvail[day]] : [];

            // default start/end as 9:00 AM - 5:00 PM (if available in options)
            const defaultStart = TIME_OPTIONS.includes("9:00 AM") ? "9:00 AM" : TIME_OPTIONS[0];
            const defaultEnd = TIME_OPTIONS.includes("5:00 PM") ? "5:00 PM" : TIME_OPTIONS[TIME_OPTIONS.length - 1];

            // create a single new slot object with unique id
            const newSlot = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, start: defaultStart, end: defaultEnd };

            // simple guard: if last slot exists and has exactly same start & end, don't add another identical one
            const last = arr[arr.length - 1];
            if (last && last.start === newSlot.start && last.end === newSlot.end) {
                // do nothing (prevents accidental duplicate adds)
                return prev;
            }

            arr.push(newSlot);
            bookingAvail[day] = arr;
            copy[bookingId] = bookingAvail;
            return copy;
        });
    };

    const updateSlot = (bookingId: string, day: string, slotIndex: number, field: "start" | "end", value: string) => {
        setAvailabilities(prev => {
            const copy = { ...prev };
            const bookingAvail = copy[bookingId] ? { ...copy[bookingId] } : {};
            const arr = bookingAvail[day] ? [...bookingAvail[day]] : [];
            if (!arr[slotIndex]) return prev;
            arr[slotIndex] = { ...arr[slotIndex], [field]: value };
            bookingAvail[day] = arr;
            copy[bookingId] = bookingAvail;
            return copy;
        });
    };

    const removeSlot = (bookingId: string, day: string, slotIndex: number) => {
        setAvailabilities(prev => {
            const copy = { ...prev };
            const bookingAvail = copy[bookingId] ? { ...copy[bookingId] } : {};
            const arr = bookingAvail[day] ? [...bookingAvail[day]] : [];
            arr.splice(slotIndex, 1);
            bookingAvail[day] = arr;
            copy[bookingId] = bookingAvail;
            return copy;
        });
    };

    const clearAllForBooking = (bookingId: string) => {
        setAvailabilities(prev => {
            const copy = { ...prev };
            const initDays: Record<string, { id: string, start: string, end: string }[]> = {};
            for (const d of DAYS) initDays[d] = [];
            copy[bookingId] = initDays;
            return copy;
        });
    };

    const saveAvailability = (bookingId: string) => {
        // currently saved to local state. Replace with dispatch/API call as needed.
        setIsAvailabilityOpen(false);
        setAvailabilityBooking(null);
    };

    const countSlotsForDay = (bookingId: string, day: string) => {
        return availabilities[bookingId] && availabilities[bookingId][day]
            ? availabilities[bookingId][day].length
            : 0;
    };

    // ----------------------------------------------------

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-semibold ">
                        Bookings
                    </h1>
                    <p className="text-stone-500">
                        Manage services and booking requests
                    </p>
                </div>

                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:from-blue-700 hover:to-cyan-700"
                >
                    <Plus className="h-4 w-4" />
                    Add Service
                </button>
            </div>

            {/* Tabs row */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex rounded-lg border border-gray-200  p-1 shadow-sm">
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`rounded-md px-5 py-1 text-xs md:text-sm font-medium transition ${isActive
                                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-sm"
                                    : "text-gray-800 hover:bg-gray-100"
                                    }`}
                            >
                                {tab}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* BOOKING REQUESTS TAB */}
            {activeTab === "Booking Requests" && (
                <>
                    {/* Search + Status (moved here from Services) */}
                    <div className="flex items-center gap-4 w-full">
                        <div className="flex-1 md:max-w-5xl">
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 " />
                                <input
                                    type="text"
                                    placeholder="Search bookings..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300  pl-9 pr-3 py-2 text-sm  placeholder:text-gray-400 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                                />
                            </div>
                        </div>

                        <div className="w-48">
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full rounded-lg border border-gray-300  px-3 py-2 text-sm  focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                            >
                                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex min-h-[380px] items-center justify-center rounded-lg border border-gray-200  px-4 py-16 shadow-sm">
                        <div className="text-center max-w-md">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100">
                                <CalendarCheck2 className="h-12 w-12 " />
                            </div>
                            <h2 className="text-xl font-semibold text-stone-800 mb-2">
                                No bookings found
                            </h2>
                            <p className="text-stone-500 max-w-sm mb-6">
                                Bookings will appear here when customers book your services
                            </p>
                        </div>
                    </div>
                </>
            )}

            {/* CALENDAR VIEW TAB */}
            {activeTab === "Calendar View" && (
                <div className="rounded-lg border border-gray-200  shadow-sm">
                    <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                        <h2 className="text-base md:text-lg font-semibold ">
                            {getMonthYear()}
                        </h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={goToPreviousWeek}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-300   hover:bg-gray-50"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                onClick={goToToday}
                                className="rounded-md border border-gray-300  px-3 py-1.5 text-xs md:text-sm font-medium  hover:bg-gray-50"
                            >
                                Today
                            </button>
                            <button
                                onClick={goToNextWeek}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-300   hover:bg-gray-50"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="px-6 py-4 space-y-6">
                        {/* Days row */}
                        <div className="flex flex-col gap-3 md:flex-row md:gap-4">
                            {calendarDays.map((day, index) => {
                                const today = new Date();
                                const isToday = day.fullDate.toDateString() === today.toDateString();
                                return (
                                    <div
                                        key={`${day.label}-${day.date}`}
                                        onClick={() => selectDate(day.fullDate)}
                                        className={`flex-1 rounded-2xl border px-4 py-3 text-sm md:text-base cursor-pointer transition-colors min-h-[92px] ${day.active
                                            ? "border-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50"
                                            : "border-gray-200 bg-white"
                                            } ${isToday ? "bg-yellow-50" : ""}`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <p className="text-xs  mb-2">{day.label}</p>

                                            {/* If today, show yellow circular badge with day number */}
                                            {isToday ? (
                                                <div className="ml-2 -mt-1 flex items-center justify-center h-8 w-8 rounded-full bg-amber-500 text-white font-semibold">
                                                    {day.date}
                                                </div>
                                            ) : (
                                                <span className="text-lg font-semibold ">
                                                    {day.date}
                                                </span>
                                            )}
                                        </div>

                                        {/* Leave space for other potential content (events etc.) */}
                                        <div className="mt-6" />
                                    </div>
                                );
                            })}
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <p className="font-semibold text-stone-800 mb-4">
                                {getSelectedDateString()}
                            </p>
                            <p className="text-stone-500 text-center py-10">
                                No bookings for this day
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* SERVICES TAB */}
            {activeTab === "Services" && (
                <>
                    {/* Services grid or empty state */}
                    {bookings.length === 0 ? (
                        <div className="flex min-h-[380px] items-center justify-center rounded-lg border border-gray-200  px-4 py-16 shadow-sm">
                            <div className="text-center max-w-md">
                                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100">
                                    <GraduationCap className="h-10 w-10 " />
                                </div>
                                <h2 className="text-xl font-semibold  mb-1">
                                    No services yet
                                </h2>
                                <p className="text-sm  mb-6">
                                    Create services that golfers can book
                                </p>
                                <button
                                    onClick={openCreateModal}
                                    className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:from-blue-700 hover:to-cyan-700"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Service
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {bookings.map((booking: any) => (
                                <div
                                    key={booking._id}
                                    className="relative bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col cursor-default"
                                >
                                    {/* top row: avatar + active pill */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                                <Users className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-md font-semibold ">
                                                    {booking.serviceName}
                                                </h3>
                                                <p className="text-sm ">
                                                    {booking.serviceType}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className="inline-flex items-center rounded-lg px-3 py-1 text-xs font-medium bg-green-100 text-green-700 border border-green-100">
                                                active
                                            </span>
                                        </div>
                                    </div>

                                    {/* description */}
                                    {booking.description && (
                                        <p className="text-sm  mt-4">
                                            {booking.description}
                                        </p>
                                    )}

                                    {/* meta row: duration, participants, price */}
                                    <div className="mt-6 flex items-center justify-between text-sm ">
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                <span>{booking.duration} min</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 " />
                                                <span>{booking.maxParticipants}</span>
                                            </div>
                                        </div>

                                        <div className="text-blue-700 font-semibold">
                                            ${booking.price}
                                        </div>
                                    </div>

                                    {/* footer actions */}
                                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-3">
                                        <button
                                            onClick={() => openEditModal(booking)}
                                            className="flex-1 rounded-md border border-gray-200 px-4 py-2 text-sm font-medium  hover:bg-gray-50"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => openAvailabilityModal(booking)}
                                            className="inline-flex items-center justify-center rounded-md border border-gray-200 p-2  hover:bg-gray-50"
                                        >
                                            <Settings className="h-4 w-4" />
                                        </button>

                                        <button
                                            onClick={() => handleDelete(booking._id)}
                                            className="inline-flex items-center justify-center rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* AVAILABILITY TAB */}
            {activeTab === "Availability" && (
                <div className="rounded-lg border border-gray-200  px-6 py-50 shadow-sm">

                </div>
            )}

            {/* Add Service Modal */}
            {isServiceModalOpen && (
                <div className="fixed left-0 right-0 top-[-30px] bottom-0 z-[100] flex items-center justify-center bg-black/60 p-4">
                    <div className="max-h-full w-full max-w-xl overflow-y-auto rounded-xl  bg-white dark:bg-gray-dark  shadow-2xl">
                        {/* Modal header */}
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                            <h2 className="text-lg md:text-xl font-semibold ">
                                {editingBooking ? "Edit Service" : "Add New Service"}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="rounded-full p-1 "
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal body */}
                        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
                            <div>
                                <label className="block text-sm font-medium  mb-1">
                                    Service Name *
                                </label>
                                <input
                                    type="text"
                                    name="serviceName"
                                    placeholder="Private Golf Lesson"
                                    value={formData.serviceName}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm   focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium  mb-1">
                                    Service Type
                                </label>
                                <select
                                    name="serviceType"
                                    value={formData.serviceType}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border border-gray-300  px-3 py-2 text-sm  focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                                >
                                    <option>Lesson</option>
                                    <option>Consultation</option>
                                    <option>Club Fitting</option>
                                    <option>Group Session</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium  mb-1">
                                        Duration (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        name="duration"
                                        min={0}
                                        placeholder="60"
                                        value={formData.duration}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm  focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium  mb-1">
                                        Price ($) *
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        min={0}
                                        placeholder="75"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm  focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium  mb-1">
                                    Max Participants
                                </label>
                                <input
                                    type="number"
                                    name="maxParticipants"
                                    min={1}
                                    placeholder="1"
                                    value={formData.maxParticipants}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm  focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium  mb-1">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    name="description"
                                    placeholder="Describe what's included in this service..."
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm  focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                                />
                            </div>

                            <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 pb-2 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="inline-flex items-center justify-center rounded-md border border-gray-300  px-4 py-2 text-sm font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                                {editingBooking && (
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(editingBooking._id)}
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
                                    {editingBooking ? "Update Service" : "Add Service"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Availability Modal */}
            {isAvailabilityOpen && availabilityBooking && (
                <div className="fixed left-0 right-0 top-16 bottom-0 z-[120] flex items-center justify-center bg-black/60 p-6">
                    <div className="w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                            <h2 className="text-base md:text-lg font-semibold ">Set Availability Schedule</h2>
                            <button onClick={closeAvailabilityModal} className="rounded-full p-1  hover:bg-gray-100 ">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-4">
                            <div className="rounded-lg border border-gray-100 p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="rounded-full border border-blue-200 p-2 text-blue-600">
                                        <Clock className="h-4 w-4" />
                                    </div>
                                    <h3 className="text-md font-semibold ">Availability for {availabilityBooking.serviceName}</h3>
                                </div>

                                <div className="flex gap-8">
                                    {/* Left: days list */}
                                    <div className="w-60">
                                        {DAYS.map((d, idx) => {
                                            const count = countSlotsForDay(availabilityBooking._id, d);
                                            const isSelected = idx === selectedDayIndex;
                                            return (
                                                <button
                                                    key={d}
                                                    onClick={() => setSelectedDayIndex(idx)}
                                                    className={`flex items-center justify-between w-full mb-2 rounded-lg px-3 py-2 text-left ${isSelected ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white" : "bg-gray-50 "}`}
                                                >
                                                    <span>{d}</span>
                                                    {count > 0 && <span className={`ml-2 inline-flex items-center justify-center h-6 w-6 rounded-full ${isSelected ? "bg-white text-green-700" : "bg-white text-green-700 border border-green-100"}`}>{count}</span>}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Right: slots for selected day */}
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-lg font-medium ">{DAYS[selectedDayIndex]}</h4>
                                            <button
                                                type="button"
                                                onClick={addSlotForSelectedDay}
                                                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-1 rounded-md shadow hover:from-blue-700"
                                            >
                                                <Plus className="h-4 w-4" /> Add Slot
                                            </button>
                                        </div>

                                        {/* slots list */}
                                        <div className="space-y-3">
                                            {(availabilities[availabilityBooking._id] && availabilities[availabilityBooking._id][DAYS[selectedDayIndex]]?.length ? availabilities[availabilityBooking._id][DAYS[selectedDayIndex]] : []).map((slot, sidx) => (
                                                <div key={slot.id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3">
                                                    <select
                                                        value={slot.start}
                                                        onChange={(e) => updateSlot(availabilityBooking._id, DAYS[selectedDayIndex], sidx, "start", e.target.value)}
                                                        className="rounded-md border border-gray-300 px-3 py-2 w-44"
                                                    >
                                                        {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                                                    </select>

                                                    <span className="text-sm ">to</span>

                                                    <select
                                                        value={slot.end}
                                                        onChange={(e) => updateSlot(availabilityBooking._id, DAYS[selectedDayIndex], sidx, "end", e.target.value)}
                                                        className="rounded-md border border-gray-300 px-3 py-2 w-44"
                                                    >
                                                        {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                                                    </select>

                                                    <button type="button" onClick={() => removeSlot(availabilityBooking._id, DAYS[selectedDayIndex], sidx)} className="ml-auto text-gray-400 hover:text-red-600">
                                                        <X className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            ))}

                                            {/* if no slots */}
                                            {(availabilities[availabilityBooking._id] && availabilities[availabilityBooking._id][DAYS[selectedDayIndex]]?.length === 0) && (
                                                <div className="text-center  py-12">
                                                    <div className="mx-auto mb-3 flex items-center justify-center rounded-full ">
                                                        <Clock className="h-12 w-12" />
                                                    </div>
                                                    <div>No availability set for {DAYS[selectedDayIndex]}</div>
                                                    <div className="text-sm  mt-1">Click "Add Slot" to set your hours</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 border-t border-gray-100 pt-4 flex items-center justify-end gap-3">
                                    <button
                                        onClick={() => { if (availabilityBooking) clearAllForBooking(availabilityBooking._id); }}
                                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium  hover:bg-gray-50"
                                    >
                                        Clear All
                                    </button>

                                    <button
                                        onClick={() => { if (availabilityBooking) saveAvailability(availabilityBooking._id); }}
                                        className="rounded-md bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-2 text-sm font-medium text-white hover:from-blue-700 hover:to-cyan-700"
                                    >
                                        Save Availability
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
