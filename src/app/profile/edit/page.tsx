"use client";

import { useEffect, useState } from "react";

const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

type BusinessHours = Record<
  typeof days[number],
  { open: string; close: string; closed: boolean }
>;

export default function ProfileEditPage() {
  const [userData, setUserData] = useState({
    _id: "",
    name: "",
    email: "",
    password: "", // store hashed original password
  });

  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [businessData, setBusinessData] = useState<any | undefined>(undefined);

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // -----------------
  // LOAD ALL DATA
  // -----------------
  useEffect(() => {
    async function loadData() {
      const res = await fetch("/api/profile/get-all");
      const data = await res.json();

      setUserData({
        _id: data.user?._id || "",
        name: data.user?.name || "",
        email: data.user?.email || "",
        password: data.user?.password || "",
      });

      // ensure businessHours exists to avoid runtime errors
      const defaultHours = days.reduce((acc, d) => {
        acc[d] = { open: "09:00", close: "17:00", closed: false };
        return acc;
      }, {} as Record<string, { open: string; close: string; closed: boolean }>);

      const bd = data.userDetail || { businessHours: defaultHours, teamMembers: [] };
      if (!bd.businessHours) bd.businessHours = defaultHours;
      if (!bd.teamMembers) bd.teamMembers = [];

      setBusinessData(bd);
    }

    loadData();
  }, []);

  if (businessData === undefined) return <p>Loading...</p>;

  // -----------------
  // UPDATE BUSINESS FIELDS
  // -----------------
  const handleBusinessChange = (key: string, value: any) => {
    setBusinessData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleTeamMemberChange = (idx: number, key: string, value: string) => {
    setBusinessData((prev: any) => {
      const members = Array.isArray(prev.teamMembers) ? [...prev.teamMembers] : [];
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
      setBusinessData((prev: any) => ({ ...prev, logo: null }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setBusinessData((prev: any) => ({ ...prev, logo: result }));
      setLogoPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleHoursChange = (day: string, key: string, value: any) => {
    setBusinessData((prev: any) => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: { ...prev.businessHours[day], [key]: value },
      },
    }));
  };

  // -----------------
  // SUBMIT FORM
  // -----------------
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    let updatedPassword = userData.password;

    // If password entered → validate
    if (passwordData.password.trim() !== "") {
      if (passwordData.password !== passwordData.confirmPassword) {
        alert("Passwords do not match!");
        setIsSaving(false);
        return;
      }
      updatedPassword = passwordData.password;
    }

    const payload = {
      user: {
        ...userData,
        password: updatedPassword,
      },
      business: businessData,
    };

    await fetch("/api/profile/update-all", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    alert("Profile updated successfully!");
    setIsSaving(false);
  };

  // -------------------------------------------------------------
  // UI BELOW (SAME AS YOUR CODE, JUST USING LOADED DATABASE DATA)
  // -------------------------------------------------------------
  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-10">Edit Profile</h1>

      <form onSubmit={onSubmit} className="space-y-10">

        {/* Account Info */}
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <h2 className="text-2xl font-semibold text-blue-700 mb-6">
            Account Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                id="full-name"
                title="Full name"
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
                id="email"
                title="Email address"
                type="email"
                value={userData.email}
                className="w-full px-4 py-3 border rounded-lg bg-gray-100"
                disabled
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm mb-2">New Password (optional)</label>
              <input
                type="password"
                value={passwordData.password}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, password: e.target.value })
                }
                className="w-full px-4 py-3 border rounded-lg"
                placeholder="Leave empty to keep existing password"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Confirm Password</label>
              <input
                id="confirm-password"
                title="Confirm password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                className="w-full px-4 py-3 border rounded-lg"
                placeholder="Confirm new password"
              />
            </div>
          </div>
        </div>

        {/* Business Section */}
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <h2 className="text-2xl font-semibold text-green-700 mb-6">
            Business Profile
          </h2>

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
              <label className="block text-sm font-medium mb-2">Business Type</label>
              <select
                title="Business type"
                value={businessData.type || ""}
                onChange={(e) => handleBusinessChange("type", e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
              >
                <option value="">Select type</option>
                <option value="golf-course">Golf Course</option>
                <option value="retail">Retail</option>
                <option value="service">Service</option>
                <option value="wholesale">Wholesale</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="text"
                value={businessData.phoneNumber || ""}
                onChange={(e) => handleBusinessChange("phoneNumber", e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
                placeholder="Phone number"
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

            <div className="md:col-span-2">
              <label className="block text-sm mb-2">About Business</label>
              <textarea
                rows={4}
                value={businessData.aboutBusiness || ""}
                onChange={(e) => handleBusinessChange("aboutBusiness", e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
                placeholder="Describe your business"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Logo</label>
              <input
                title="Upload logo"
                type="file"
                accept="image/*"
                onChange={handleLogoFileChange}
                className="w-full px-4 py-3 border rounded-lg"
              />
              {(logoPreview || businessData.logo) && (
                <img src={logoPreview || businessData.logo} alt="logo preview" className="h-20 mt-3 object-contain" />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Verification Document</label>
              {businessData.verificationDoc ? (
                <a href={businessData.verificationDoc} target="_blank" rel="noreferrer" className="text-blue-600 underline">View document</a>
              ) : (
                <span className="text-sm text-gray-500">No document uploaded</span>
              )}
              <div className="mt-2">
                <label className="inline-flex items-center">
                  <input title="is verified" type="checkbox" checked={!!businessData.isVerified} onChange={(e) => handleBusinessChange("isVerified", e.target.checked ? true : false)} />
                  <span className="ml-2">Verified</span>
                </label>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Business Address</h3>

            <label className="sr-only">Street address</label>
            <input
              type="text"
              value={businessData.streetAddress || ""}
              onChange={(e) => handleBusinessChange("streetAddress", e.target.value)}
              className="w-full px-4 py-3 border rounded-lg mb-3"
              placeholder="Street address"
            />

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="sr-only">City</label>
                <input
                  value={businessData.city || ""}
                  onChange={(e) => handleBusinessChange("city", e.target.value)}
                  className="px-4 py-3 border rounded-lg"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="sr-only">State</label>
                <input
                  value={businessData.state || ""}
                  onChange={(e) => handleBusinessChange("state", e.target.value)}
                  className="px-4 py-3 border rounded-lg"
                  placeholder="State"
                />
              </div>
              <div>
                <label className="sr-only">ZIP</label>
                <input
                  value={businessData.zip || ""}
                  onChange={(e) => handleBusinessChange("zip", e.target.value)}
                  className="px-4 py-3 border rounded-lg"
                  placeholder="ZIP"
                />
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Team Members</h3>
            {(businessData.teamMembers || []).map((m: any, idx: number) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center mb-2">
                <div className="col-span-4">
                  <input
                    placeholder="Name"
                    value={m.name || ""}
                    onChange={(e) => handleTeamMemberChange(idx, "name", e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div className="col-span-4">
                  <input
                    placeholder="Email"
                    value={m.email || ""}
                    onChange={(e) => handleTeamMemberChange(idx, "email", e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    placeholder="Role"
                    value={m.role || ""}
                    onChange={(e) => handleTeamMemberChange(idx, "role", e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div className="col-span-1">
                  <button type="button" onClick={() => removeTeamMember(idx)} className="text-red-600">Remove</button>
                </div>
              </div>
            ))}
            <div>
              <button type="button" onClick={addTeamMember} className="text-sm text-blue-600">+ Add team member</button>
            </div>
          </div>

          {/* Business Hours */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Business Hours</h3>

            {days.map((day) => (
              <div key={day} className="flex items-center gap-6 py-2">
                <span className="w-24 capitalize">{day}</span>

                <input
                  title={`${day} closed`}
                  type="checkbox"
                  checked={!!businessData.businessHours?.[day]?.closed}
                  onChange={(e) =>
                    handleHoursChange(day, "closed", e.target.checked)
                  }
                />

                {!businessData.businessHours?.[day]?.closed && (
                  <>
                    <input
                      title={`${day} open time`}
                      type="time"
                      value={businessData.businessHours[day].open}
                      onChange={(e) =>
                        handleHoursChange(day, "open", e.target.value)
                      }
                      className="px-3 py-2 border rounded"
                    />

                    <input
                      title={`${day} close time`}
                      type="time"
                      value={businessData.businessHours[day].close}
                      onChange={(e) =>
                        handleHoursChange(day, "close", e.target.value)
                      }
                      className="px-3 py-2 border rounded"
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-8 py-4 bg-blue-600 text-white rounded-lg"
          >
            {isSaving ? "Saving..." : "Save All Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
