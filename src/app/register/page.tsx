"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Target, UserCheck, ShoppingBag, Settings, Map, Flag, Heart,
  CheckCircle, ArrowLeft, FileText, Trash2, Phone, Globe,
  Mail, Lock, UserPlus, X
} from "lucide-react";
import logo from "@/assets/logos/Social-golf-logo.png";

type Option = {
  id: string;
  title: string;
  subtitle: string;
  Icon: React.ComponentType<any>;
};

const OPTIONS: Option[] = [
  { id: "golf-course", title: "Golf Course", subtitle: "Full courses & country clubs", Icon: Target },
  { id: "coach", title: "Coach / Trainer", subtitle: "Lessons & instruction", Icon: UserCheck },
  { id: "retail", title: "Retail Shop", subtitle: "Pro shops & equipment", Icon: ShoppingBag },
  { id: "club-fitter", title: "Club Fitter", subtitle: "Custom fitting services", Icon: Settings },
  { id: "driving-range", title: "Driving Range", subtitle: "Practice facilities", Icon: Map },
  { id: "event-host", title: "Event Host", subtitle: "Tournaments & events", Icon: Flag },
  { id: "nonprofit", title: "Nonprofit", subtitle: "Golf charities & foundations", Icon: Heart },
];

export default function RegisterPage() {
  const router = useRouter();

  // Steps
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Step 1
  const [selected, setSelected] = useState<string>("golf-course");

  // Step 2
  const [businessName, setBusinessName] = useState("");
  const [aboutBusiness, setAboutBusiness] = useState("");

  // Step 3
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [businessHours, setBusinessHours] = useState({
    monday: { open: "09:00", close: "17:00", closed: false },
    tuesday: { open: "09:00", close: "17:00", closed: false },
    wednesday: { open: "09:00", close: "17:00", closed: false },
    thursday: { open: "09:00", close: "17:00", closed: false },
    friday: { open: "09:00", close: "17:00", closed: false },
    saturday: { open: "09:00", close: "17:00", closed: false },
    sunday: { open: "09:00", close: "17:00", closed: false },
  });

  // Step 4 - Team Members (NO PASSWORD)
  const [teamMemberName, setTeamMemberName] = useState("");
  const [teamMemberEmail, setTeamMemberEmail] = useState("");
  const [teamMemberRole, setTeamMemberRole] = useState("");
  const [teamMembers, setTeamMembers] = useState<Array<{ id: string; name: string; email: string; role: string }>>([]);

  // Files
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [verificationPreview, setVerificationPreview] = useState<string | null>(null);

  const logoRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handlers
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/");
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && !selected) return alert("Please select a business type");
    if (currentStep === 2 && !businessName.trim()) return alert("Business name is required");
    if (currentStep === 3 && (!email || !password || !streetAddress || !city || !state || !zip)) {
      return alert("Please fill all required contact fields");
    }

    setCurrentStep(prev => Math.min(totalSteps, prev + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateBusinessHours = (day: string, field: "open" | "close" | "closed", value: string | boolean) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: { ...prev[day as keyof typeof prev], [field]: value }
    }));
  };

  const addTeamMember = () => {
    if (!teamMemberName.trim() || !teamMemberEmail.trim()) {
      alert("Name and email are required for team members");
      return;
    }

    setTeamMembers(prev => [...prev, {
      id: Date.now().toString(),
      name: teamMemberName.trim(),
      email: teamMemberEmail.toLowerCase().trim(),
      role: teamMemberRole.trim() || "Staff"
    }]);

    setTeamMemberName("");
    setTeamMemberEmail("");
    setTeamMemberRole("");
  };

  const removeTeamMember = (id: string) => {
    setTeamMembers(prev => prev.filter(m => m.id !== id));
  };

  const onFileChange = (file: File | null, type: string) => {
    if (!file) {
      if (type === "logo") {
        setLogoFile(null); setLogoPreview(null);
      } else {
        setVerificationFile(null); setVerificationPreview(null);
      }
      return;
    }
    const url = URL.createObjectURL(file);
    if (type === "logo") {
      setLogoFile(file);
      setLogoPreview(url);
    } else {
      setVerificationFile(file);
      setVerificationPreview(file.type.includes("image") ? url : null);
    }
  };

  const handleSubmit = async () => {
    if (!email || !password || !businessName) {
      alert("Email, password, and business name are required");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("selected", selected);
    formData.append("businessName", businessName);
    formData.append("aboutBusiness", aboutBusiness);
    formData.append("streetAddress", streetAddress);
    formData.append("city", city);
    formData.append("state", state);
    formData.append("zip", zip);
    formData.append("phoneNumber", phoneNumber);
    formData.append("website", website);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("businessHours", JSON.stringify(businessHours));
    formData.append("teamMembers", JSON.stringify(teamMembers));
    if (logoFile) formData.append("logo", logoFile);
    if (verificationFile) formData.append("verificationDoc", verificationFile);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setCurrentStep(5);
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full px-6 py-5 bg-white/90 backdrop-blur-xl shadow-sm border-b">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <Image src={logo} alt="Logo" width={60} height={60} className="rounded-lg" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-700">Business Registration</h2>
              <p className="text-sm text-slate-400">Step {currentStep} of {totalSteps}</p>
              <div className="mt-2 w-64 h-1.5 bg-slate-200 rounded-full relative overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center py-8 px-6">
        <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl p-8 lg:p-12">
          {/* Step 1 */}
          {currentStep === 1 && (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-slate-800">What type of golf business are you?</h1>
                <p className="text-slate-500 mt-3">Choose the one that best describes your operation</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {OPTIONS.map(opt => {
                  const isActive = selected === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setSelected(opt.id)}
                      className={`p-6 rounded-2xl border-2 transition-all ${isActive ? "border-cyan-500 bg-cyan-50 shadow-xl scale-105" : "border-gray-200 hover:border-gray-300 hover:shadow-md"}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${isActive ? "bg-cyan-500 text-white" : "bg-gray-100 text-slate-600"}`}>
                          <opt.Icon size={28} />
                        </div>
                        <div className="text-left flex-1">
                          <h3 className="font-bold text-lg">{opt.title}</h3>
                          <p className="text-sm text-slate-500">{opt.subtitle}</p>
                        </div>
                        {isActive && <CheckCircle className="text-cyan-600" size={28} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2 */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-center text-slate-800">Business Details</h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold mb-3 text-slate-700">Business Logo (Optional)</label>
                  <input type="file" accept="image/*" ref={logoRef} className="hidden" onChange={e => onFileChange(e.target.files?.[0] || null, "logo")} />
                  {logoPreview ? (
                    <div className="relative group">
                      <img src={logoPreview} alt="Logo preview" className="w-32 h-32 object-cover rounded-xl border-2 border-dashed" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => logoRef.current?.click()} className="mx-2 px-3 py-1 bg-white text-sm rounded">Change</button>
                        <button onClick={() => onFileChange(null, "logo")} className="mx-2 px-3 py-1 bg-red-600 text-white text-sm rounded">Remove</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => logoRef.current?.click()} className="w-full h-40 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center hover:border-cyan-500 transition">
                      <FileText size={40} className="text-gray-400" />
                      <span className="mt-3 font-medium">Upload Logo</span>
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-slate-700">Verification Document (License, PDF, etc.)</label>
                  <input type="file" accept="image/*,.pdf" ref={docRef} className="hidden" onChange={e => onFileChange(e.target.files?.[0] || null, "verification")} />
                  {verificationFile ? (
                    <div className="flex items-center gap-4 p-4 border rounded-xl">
                      {verificationPreview ? (
                        <img src={verificationPreview} alt="Doc" className="w-20 h-20 object-cover rounded-lg" />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 border-2 border-dashed rounded-lg flex items-center justify-center text-xs font-bold">PDF</div>
                      )}
                      <div>
                        <p className="font-medium truncate w-40">{verificationFile.name}</p>
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => docRef.current?.click()} className="text-xs text-blue-600">Change</button>
                          <button onClick={() => onFileChange(null, "verification")} className="text-xs text-red-600">Remove</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => docRef.current?.click()} className="w-full h-40 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center hover:border-cyan-500 transition">
                      <FileText size={40} className="text-gray-400" />
                      <span className="mt-3 font-medium">Upload Document</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Business Name *</label>
                  <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="e.g. Augusta National Golf Club" className="w-full px-5 py-4 border rounded-xl focus:ring-4 focus:ring-cyan-200 focus:border-cyan-500 transition" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">About Your Business (Optional)</label>
                  <textarea rows={5} value={aboutBusiness} onChange={e => setAboutBusiness(e.target.value)} placeholder="Tell us about your golf course, services, or mission..." className="w-full px-5 py-4 border rounded-xl focus:ring-4 focus:ring-cyan-200 focus:border-cyan-500 resize-none" />
                </div>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {currentStep === 3 && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-center text-slate-800">Contact & Location</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-4 text-gray-400" size={20} />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@yourbusiness.com" className="w-full pl-12 pr-5 py-4 border rounded-xl focus:ring-4 focus:ring-cyan-200 focus:border-cyan-500" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-4 text-gray-400" size={20} />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a strong password" className="w-full pl-12 pr-5 py-4 border rounded-xl focus:ring-4 focus:ring-cyan-200 focus:border-cyan-500" required />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold">Business Address *</h3>
                <input type="text" value={streetAddress} onChange={e => setStreetAddress(e.target.value)} placeholder="Street Address" className="w-full px-5 py-4 border rounded-xl" required />
                <div className="grid md:grid-cols-3 gap-4">
                  <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="City" className="px-5 py-4 border rounded-xl" required />
                  <input type="text" value={state} onChange={e => setState(e.target.value)} placeholder="State" className="px-5 py-4 border rounded-xl" required />
                  <input type="text" value={zip} onChange={e => setZip(e.target.value)} placeholder="ZIP Code" className="px-5 py-4 border rounded-xl" required />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-4 text-gray-400" size={20} />
                    <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="(555) 123-4567" className="w-full pl-12 pr-5 py-4 border rounded-xl" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Website</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-4 text-gray-400" size={20} />
                    <input type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yourbusiness.com" className="w-full pl-12 pr-5 py-4 border rounded-xl" />
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <h3 className="text-xl font-bold mb-6">Business Hours</h3>
                {Object.keys(businessHours).map(day => (
                  <div key={day} className="flex items-center gap-4 mb-4 pb-4 border-b last:border-0">
                    <span className="w-32 capitalize font-medium">{day}</span>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={businessHours[day as keyof typeof businessHours].closed} onChange={e => updateBusinessHours(day, "closed", e.target.checked)} className="w-5 h-5 text-cyan-600 rounded" />
                      <span>Closed</span>
                    </label>
                    {!businessHours[day as keyof typeof businessHours].closed && (
                      <>
                        <input type="time" value={businessHours[day as keyof typeof businessHours].open} onChange={e => updateBusinessHours(day, "open", e.target.value)} className="px-4 py-2 border rounded-lg" />
                        <span>to</span>
                        <input type="time" value={businessHours[day as keyof typeof businessHours].close} onChange={e => updateBusinessHours(day, "close", e.target.value)} className="px-4 py-2 border rounded-lg" />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4 - Team Members (NO PASSWORD) */}
          {currentStep === 4 && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-center text-slate-800">Add Team Members (Optional)</h2>
              <p className="text-center text-slate-600">
                Add staff who should have access. They will receive an invitation email to create their own password.
              </p>

              <div className="grid md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-2xl">
                <input
                  type="text"
                  value={teamMemberName}
                  onChange={(e) => setTeamMemberName(e.target.value)}
                  placeholder="Full Name"
                  className="px-5 py-4 border rounded-xl"
                />
                <input
                  type="email"
                  value={teamMemberEmail}
                  onChange={(e) => setTeamMemberEmail(e.target.value)}
                  placeholder="Email Address"
                  className="px-5 py-4 border rounded-xl"
                />
                <input
                  type="text"
                  value={teamMemberRole}
                  onChange={(e) => setTeamMemberRole(e.target.value)}
                  placeholder="Role (e.g. Pro, Manager, Staff)"
                  className="md:col-span-2 px-5 py-4 border rounded-xl"
                />
                <button
                  onClick={addTeamMember}
                  className="md:col-span-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-4 rounded-xl hover:scale-105 transition flex items-center justify-center gap-2"
                >
                  <UserPlus size={20} /> Add Team Member
                </button>
              </div>

              {teamMembers.length > 0 && (
                <div className="space-y-3">
                  {teamMembers.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-semibold">{member.name}</p>
                        <p className="text-sm text-slate-600">{member.email} • {member.role}</p>
                      </div>
                      <button
                        onClick={() => removeTeamMember(member.id)}
                        className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 5 - Success */}
          {currentStep === 5 && (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                <CheckCircle size={56} className="text-green-600" />
              </div>
              <h1 className="text-4xl font-bold text-slate-800 mb-4">Welcome to Social Golf!</h1>
              <p className="text-xl text-slate-600 mb-8">Your business account has been created successfully.</p>
              <p className="text-slate-500 mb-10">You can now log in and start managing your profile.</p>
              <button onClick={() => router.push("/login")} className="px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-lg font-bold rounded-xl hover:scale-105 transition shadow-lg">
                Go to Login
              </button>
            </div>
          )}

          {/* Navigation */}
          {currentStep < 5 && (
            <div className="flex justify-between mt-16">
              <button onClick={handleBack} className="flex items-center gap-3 px-8 py-4 border-2 border-slate-300 rounded-xl hover:bg-slate-50 transition font-medium">
                <ArrowLeft size={20} /> Back
              </button>

              {currentStep < 4 ? (
                <button onClick={handleNext} className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:scale-105 transition shadow-lg">
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:scale-105 transition shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Creating Account..." : "Complete Registration"}
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}