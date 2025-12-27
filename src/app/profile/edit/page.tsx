"use client";

import { useEffect, useState } from "react";
import {
  Target,
  UserCheck,
  ShoppingBag,
  Settings,
  Map,
  Flag,
  Heart,
} from "lucide-react";
import { Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

type BusinessHours = Record<
  typeof days[number],
  { open: string; close: string; closed: boolean }
>;

type Option = {
  id: string;
  title: string;
  subtitle: string;
  Icon: React.ComponentType<any>;
};

const OPTIONS: Option[] = [
  // { id: "golf-course", title: "Golf Course", subtitle: "Full courses & country clubs", Icon: Target },
  { id: "coach-trainer", title: "Coach / Trainer", subtitle: "Lessons & instruction", Icon: UserCheck },
  { id: "retail", title: "Retail Shop", subtitle: "Pro shops & equipment", Icon: ShoppingBag },
  // { id: "club-fitter", title: "Club Fitter", subtitle: "Custom fitting services", Icon: Settings },
  // { id: "driving-range", title: "Driving Range", subtitle: "Practice facilities", Icon: Map },
  { id: "event-host", title: "Event Host", subtitle: "Tournaments & events", Icon: Flag },
  // { id: "nonprofit", title: "Nonprofit", subtitle: "Golf charities & foundations", Icon: Heart },
];

export default function ProfileEditPage() {
  const [userData, setUserData] = useState({
    _id: "",
    name: "",
    email: "",
    password: "", // hashed from DB
  });

  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [businessData, setBusinessData] = useState<any | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // -----------------
  // LOAD DATA
  // -----------------
  useEffect(() => {
    async function loadData() {
      const res = await fetch("/api/profile/get-all");
      const { user, userDetail } = await res.json();

      setUserData({
        _id: user?._id || "",
        name: user?.name || "",
        email: user?.email || "",
        password: user?.password || "",
      });

      // Default business hours (fallback)
      const defaultHours: BusinessHours = days.reduce((acc, day) => {
        acc[day] = { open: "09:00", close: "17:00", closed: false };
        return acc;
      }, {} as BusinessHours);

      // Start with empty or existing detail
      let bd = userDetail || {};

      // Ensure businessHours exists and is complete
      bd.businessHours = { ...defaultHours, ...(bd.businessHours || {}) };

      days.forEach((day) => {
        const existing = bd.businessHours[day];
        bd.businessHours[day] = {
          open: existing?.open || "09:00",
          close: existing?.close || "17:00",
          closed: !!existing?.closed,
        };
      });

      // Ensure teamMembers is array
      bd.teamMembers = Array.isArray(bd.teamMembers) ? bd.teamMembers : [];

      setBusinessData(bd);
    }

    loadData();
  }, []);

  if (!businessData) return <p className="text-center py-10">Loading...</p>;

  // -----------------
  // HANDLERS
  // -----------------
  const handleBusinessChange = (key: string, value: any) => {
    setBusinessData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleTeamMemberChange = (idx: number, key: string, value: string) => {
    setBusinessData((prev: any) => {
      const members = [...(prev.teamMembers || [])];
      members[idx] = { ...members[idx], [key]: value };
      return { ...prev, teamMembers: members };
    });
  };

  const addTeamMember = () => {
    setBusinessData((prev: any) => ({
      ...prev,
      teamMembers: [...(prev.teamMembers || []), { name: "", email: "", role: "" }],
    }));
  };

  const removeTeamMember = (idx: number) => {
    setBusinessData((prev: any) => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_: any, i: number) => i !== idx),
    }));
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setLogoPreview(null);
      setLogoFile(null);
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleVerificationFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setVerificationFile(file || null);
  };

  const handleHoursChange = (day: string, key: "open" | "close" | "closed", value: any) => {
    setBusinessData((prev: any) => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: { ...prev.businessHours[day], [key]: value },
      },
    }));
  };

  // -----------------
  // SUBMIT
  // -----------------
 const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSaving(true);

  try {
    // Validate password if provided
    if (passwordData.password.trim()) {
      if (passwordData.password !== passwordData.confirmPassword) {
        alert("Passwords do not match!");
        setIsSaving(false);
        return;
      }
    }

    // Create FormData
    const formData = new FormData();

    // User fields
    formData.append("userId", userData._id);
    formData.append("name", userData.name);
    if (passwordData.password.trim()) {
      formData.append("password", passwordData.password);
    }

    // Business text fields
    const textFields = [
      "businessName",
      "phoneNumber",
      "website",
      "type",
      "aboutBusiness",
      "streetAddress",
      "city",
      "state",
      "zip",
      "isVerified",
    ];

    textFields.forEach((field) => {
      const value = businessData[field];
      if (value !== undefined && value !== null) {
        formData.append(field, value.toString());
      }
    });

    // JSON fields
    formData.append("businessHours", JSON.stringify(businessData.businessHours));
    formData.append("teamMembers", JSON.stringify(businessData.teamMembers || []));

    // Existing gallery URLs (the ones we want to keep)
    formData.append("existingGallery", JSON.stringify(businessData.gallery || []));

    // Logo file
    if (logoFile) {
      formData.append("logo", logoFile);
    }

    // Verification document file
    if (verificationFile) {
      formData.append("verificationDoc", verificationFile);
    }

    // New gallery files
    (businessData.newGalleryFiles || []).forEach((file: File) => {
      formData.append("gallery", file);
    });

    // ========================
    // SEND REQUEST
    // ========================
    const res = await fetch("/api/profile/update-all", {
      method: "PUT",
      body: formData,
    });

    const result = await res.json();

    if (result.success) {
       toast.success(result.message || "Profile updated successfully!");

      // Move newly uploaded images to saved gallery and clear temp arrays
      setBusinessData((prev: any) => ({
        ...prev,
        newGalleryFiles: [],
        newGalleryPreviews: prev.newGalleryPreviews?.map((url: string) => {
          URL.revokeObjectURL(url);
          return url;
        }) || [],
       
      }));

      window.location.reload(); // Simple way
     
    } else {
       toast.error(result.message || 'Failed to save profile. Please try again.');
    }
  } catch (error: any) {
    console.error("Update error:", error);
    toast.error(error.message || 'Failed to save profile. Please try again.');
  } finally {
    setIsSaving(false);
  }

};

  // -----------------
  // RENDER
  // -----------------
  return (
    <>
     <Toaster position="top-right" />
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-10">Edit Profile</h1>

      <form onSubmit={onSubmit} className="space-y-10">

        {/* Account Info */}
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <h2 className="text-2xl font-semibold text-blue-700 mb-6">Account Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={userData.name}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg"
                placeholder="Full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={userData.email}
                disabled
                className="w-full px-4 py-3 border rounded-lg bg-gray-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm mb-2">New Password (optional)</label>
              <input
                type="password"
                value={passwordData.password}
                onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg"
                placeholder="Leave empty to keep current"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Confirm Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Business Profile */}
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <h2 className="text-2xl font-semibold text-green-700 mb-6">Business Profile</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Business Name</label>
              <input
                type="text"
                value={businessData.businessName || ""}
                onChange={(e) => handleBusinessChange("businessName", e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
                placeholder="Business name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="text"
                value={businessData.phoneNumber || ""}
                onChange={(e) => handleBusinessChange("phoneNumber", e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Website</label>
              <input
                type="url"
                value={businessData.website || ""}
                onChange={(e) => handleBusinessChange("website", e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
                placeholder="https://example.com"
              />
            </div>

            {/* BEAUTIFUL BUSINESS TYPE CARDS */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-4 text-gray-700">
                Business Type <span className="text-red-500">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {OPTIONS.map(({ id, title, subtitle, Icon }) => {
                  const isSelected = businessData.type === id;

                  return (
                    <div
                      key={id}
                      onClick={() => handleBusinessChange("type", id)}
                      className={`relative cursor-pointer rounded-xl border-2 p-5 transition-all hover:shadow-md ${isSelected
                        ? "border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200"
                        : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${isSelected ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{title}</h4>
                          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="absolute top-3 right-4">
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4 10-10" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm mb-2">About Business</label>
              <textarea
                rows={4}
                value={businessData.aboutBusiness || ""}
                onChange={(e) => handleBusinessChange("aboutBusiness", e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
                placeholder="Tell us about your business..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoFileChange}
                className="w-full px-4 py-3 border rounded-lg"
              />

              {(logoPreview || businessData.logo) && (
                <img
                  src={logoPreview || businessData.logo}
                  alt="Logo preview"
                  className="h-24 mt-4 object-contain rounded"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Verification Document</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleVerificationFileChange}
                className="w-full px-4 py-3 border rounded-lg mb-2"
              />
              {verificationFile && (
                <p className="text-sm text-green-600">Selected: {verificationFile.name}</p>
              )}
              {businessData.verificationDoc && (
                <a href={businessData.verificationDoc} target="_blank" rel="noreferrer" className="text-blue-600 underline block mt-2">
                  View current document
                </a>
              )}
              <div className="mt-3">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={!!businessData.isVerified}
                    onChange={(e) => handleBusinessChange("isVerified", e.target.checked)}
                    className="rounded"
                  />
                  <span className="ml-2 text-sm">Mark as Verified</span>
                </label>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Business Address</h3>
            <input
              type="text"
              value={businessData.streetAddress || ""}
              onChange={(e) => handleBusinessChange("streetAddress", e.target.value)}
              className="w-full px-4 py-3 border rounded-lg mb-3"
              placeholder="Street address"
            />
            <div className="grid grid-cols-3 gap-4">
              <input
                value={businessData.city || ""}
                onChange={(e) => handleBusinessChange("city", e.target.value)}
                className="px-4 py-3 border rounded-lg"
                placeholder="City"
              />
              <input
                value={businessData.state || ""}
                onChange={(e) => handleBusinessChange("state", e.target.value)}
                className="px-4 py-3 border rounded-lg"
                placeholder="State"
              />
              <input
                value={businessData.zip || ""}
                onChange={(e) => handleBusinessChange("zip", e.target.value)}
                className="px-4 py-3 border rounded-lg"
                placeholder="ZIP"
              />
            </div>
          </div>

          {/* Team Members */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-3">Team Members</h3>
            {(businessData.teamMembers || []).map((m: any, idx: number) => (
              <div key={idx} className="grid grid-cols-12 gap-3 items-center mb-3">
                <input
                  placeholder="Name"
                  value={m.name || ""}
                  onChange={(e) => handleTeamMemberChange(idx, "name", e.target.value)}
                  className="col-span-4 px-3 py-2 border rounded"
                />

                <input
                  placeholder="Email"
                  value={m.email || ""}
                  onChange={(e) => handleTeamMemberChange(idx, "email", e.target.value)}
                  className="col-span-4 px-3 py-2 border rounded"
                />

                {/* Updated Role field — now a select box */}
                <select
                  value={m.role || ""}
                  onChange={(e) => handleTeamMemberChange(idx, "role", e.target.value)}
                  className="col-span-3 px-3 py-2 border rounded"
                >
                  <option value="">Select role</option>
                  <option value="member">Member</option>
                  <option value="staff">Staff</option>
                </select>

                <button
                  type="button"
                  onClick={() => removeTeamMember(idx)}
                  className="col-span-1 text-red-600 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}

            <button type="button" onClick={addTeamMember} className="text-sm text-blue-600">
              + Add team member
            </button>
          </div>


          {/* Business Hours */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Business Hours</h3>
            {days.map((day) => (
              <div key={day} className="flex items-center gap-6 py-2">
                <span className="w-28 capitalize text-gray-700">{day}</span>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!businessData.businessHours[day]?.closed}
                    onChange={(e) => handleHoursChange(day, "closed", e.target.checked)}
                  />
                  <span className="text-sm">Closed</span>
                </label>

                {!businessData.businessHours[day]?.closed && (
                  <>
                    <input
                      type="time"
                      value={businessData.businessHours[day]?.open || "09:00"}
                      onChange={(e) => handleHoursChange(day, "open", e.target.value)}
                      className="px-3 py-2 border rounded"
                    />
                    <span>to</span>
                    <input
                      type="time"
                      value={businessData.businessHours[day]?.close || "17:00"}
                      onChange={(e) => handleHoursChange(day, "close", e.target.value)}
                      className="px-3 py-2 border rounded"
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
          {/* ==================== GALLERY PHOTOS SECTION ==================== */}
                <div className="bg-white rounded-xl shadow-sm border p-8">
          <h2 className="text-2xl font-semibold text-green-700 mb-6">Gallery Photos</h2>
<div>
  {/* <h2 className="text-2xl font-bold text-purple-700 mb-6"></h2> */}
  {/* <p className="text-gray-600 mb-6">Showcase your facility, team, events — up to 100 photos.</p> */}

  {/* Upload Input */}
  <input
    type="file"
    accept="image/*"
    multiple
    onChange={(e) => {
      const files = e.target.files;
      if (!files) return;

      const newFiles: File[] = [];
      const newPreviews: string[] = [];

      Array.from(files).forEach((file) => {
        if (file.type.startsWith("image/")) {
          newFiles.push(file);
          newPreviews.push(URL.createObjectURL(file));
        }
      });

      setBusinessData((prev: any) => ({
        ...prev,
        newGalleryFiles: [...(prev.newGalleryFiles || []), ...newFiles],
        newGalleryPreviews: [...(prev.newGalleryPreviews || []), ...newPreviews],
      }));
    }}
    className="w-full px-4 py-3 border rounded-lg"
  />

  {/* Photos Grid */}
  <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
    {/* Existing saved photos */}
    {(businessData.gallery || []).map((url: string, i: number) => (
      <div key={`saved-${i}`} className="relative group">
        <img
          src={url}
          alt={`Gallery ${i + 1}`}
          className="w-full h-32 object-cover rounded-lg border shadow-sm"
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-lg transition flex items-center justify-center">
          <button
            type="button"
            onClick={() => {
              setBusinessData((prev: any) => ({
                ...prev,
                gallery: prev.gallery.filter((_: any, idx: number) => idx !== i),
              }));
            }}
            className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    ))}

    {/* Newly added photos */}
    {(businessData.newGalleryPreviews || []).map((url: string, i: number) => (
      <div key={`new-${i}`} className="relative group">
        <img
          src={url}
          alt={`New ${i + 1}`}
          className="w-full h-32 object-cover rounded-lg border-2 border-dashed border-purple-400"
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-lg transition flex items-center justify-center">
          <button
            type="button"
            onClick={() => {
              URL.revokeObjectURL(url);
              setBusinessData((prev: any) => ({
                ...prev,
                newGalleryFiles: prev.newGalleryFiles.filter((_: any, idx: number) => idx !== i),
                newGalleryPreviews: prev.newGalleryPreviews.filter((_: any, idx: number) => idx !== i),
              }));
            }}
            className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    ))}
  </div>

  {/* Counter */}
  {(businessData.gallery?.length || 0) + (businessData.newGalleryPreviews?.length || 0) > 0 && (
    <p className="mt-5 text-sm text-gray-600">
      Total: {businessData.gallery?.length || 0} saved + {businessData.newGalleryPreviews?.length || 0} new
    </p>
  )}
</div>
</div>
{/* ==================== END OF GALLERY SECTION ==================== */}

        <div className="flex justify-end mt-10">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70"
          >
            {isSaving ? "Saving..." : "Save All Changes"}
          </button>
        </div>
      </form>
    </div>
    </>
  );
}