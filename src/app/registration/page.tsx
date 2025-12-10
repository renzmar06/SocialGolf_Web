// /src/app/onboarding/page.tsx
"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import logo from "@/assets/logos/Social-golf-logo.png";
import { useRouter } from "next/navigation";
import {
  Map,
  ShoppingBag,
  Target,
  UserCheck,
  Settings,
  Flag,
  Heart,
  CheckCircle,
  ArrowLeft,
  FileText,
  Trash2,
  MapPin,
  Phone,
  Globe,
  Mail,
  Lock,
  Clock,
  User,
  Plus,
  X,
  UserPlus,
  Minus,
  
} from "lucide-react";

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

export default function OnboardingPage() {
  const router = useRouter();

  // selection + step
  const [selected, setSelected] = useState<string>("golf-course");
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 5;

  // form state for step 2
  const [businessName, setBusinessName] = useState<string>("");
  const [aboutBusiness, setAboutBusiness] = useState<string>("");

  // form state for step 3
  const [streetAddress, setStreetAddress] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [zip, setZip] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [website, setWebsite] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [businessHours, setBusinessHours] = useState<{
    [key: string]: { open: string; close: string; closed: boolean }
  }>({
    monday: { open: "09:00", close: "17:00", closed: false },
    tuesday: { open: "09:00", close: "17:00", closed: false },
    wednesday: { open: "09:00", close: "17:00", closed: false },
    thursday: { open: "09:00", close: "17:00", closed: false },
    friday: { open: "09:00", close: "17:00", closed: false },
    saturday: { open: "09:00", close: "17:00", closed: false },
    sunday: { open: "09:00", close: "17:00", closed: false },
  });

  const updateBusinessHours = (day: string, field: string, value: string | boolean) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  // form state for step 4 - team members
  const [teamMemberName, setTeamMemberName] = useState<string>("");
  const [teamMemberEmail, setTeamMemberEmail] = useState<string>("");
  const [teamMemberPassword, setTeamMemberPassword] = useState<string>("");
  const [teamMemberRole, setTeamMemberRole] = useState<string>("");
  const [teamMembers, setTeamMembers] = useState<Array<{id: string, name: string, email: string, password: string, role: string}>>([]);

  const addTeamMember = () => {
    if (!teamMemberName.trim() || !teamMemberEmail.trim() || !teamMemberPassword.trim() || !teamMemberRole) {
      alert("Please fill in all fields");
      return;
    }
    
    const newMember = {
      id: Date.now().toString(),
      name: teamMemberName.trim(),
      email: teamMemberEmail.trim(),
      password: teamMemberPassword.trim(),
      role: teamMemberRole
    };
    
    setTeamMembers(prev => [...prev, newMember]);
    setTeamMemberName("");
    setTeamMemberEmail("");
    setTeamMemberPassword("");
    setTeamMemberRole("");
  };

  const removeTeamMember = (id: string) => {
    setTeamMembers(prev => prev.filter(member => member.id !== id));
  };

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [verificationPreview, setVerificationPreview] = useState<string | null>(null);

  // file input refs
  const logoRef = useRef<HTMLInputElement | null>(null);
  const docRef = useRef<HTMLInputElement | null>(null);

  // step flow
  const handleSelectContinue = () => {
    if (!selected) return;
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStep2Continue = () => {
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStep3Continue = () => {
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.back();
    }
  };

  const handleFinalContinue = () => {
    // placeholder submit — replace with real API call
    const payload = {
      selected,
      businessName,
      aboutBusiness,
      logoFileName: logoFile?.name || null,
      verificationFileName: verificationFile?.name || null,
    };
    console.log("submit payload", payload);
    // advance for demo
    setCurrentStep((s) => Math.min(totalSteps, s + 1));
  };

  // file handling
  const onFileChange = (file: File | null, field: "logo" | "doc") => {
    if (!file) {
      if (field === "logo") {
        setLogoFile(null);
        setLogoPreview(null);
      } else {
        setVerificationFile(null);
        setVerificationPreview(null);
      }
      return;
    }
    const url = URL.createObjectURL(file);
    if (field === "logo") {
      setLogoFile(file);
      setLogoPreview(url);
    } else {
      setVerificationFile(file);
      setVerificationPreview(file.type.includes("image") ? url : null);
    }
  };

  const prevent = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e: React.DragEvent, field: "logo" | "doc") => {
    prevent(e);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    onFileChange(files[0], field);
  };

  /* --- small upload components --- */

  const UploadFullVerification = () => (
    <div
      onDragOver={prevent}
      onDragEnter={prevent}
      onDrop={(e) => onDrop(e, "doc")}
      className="w-full rounded-xl border-2 border-dashed border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
      style={{ borderColor: verificationFile ? "rgba(6,182,212,0.35)" : undefined }}
    >
      {!verificationPreview && !verificationFile ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-lg bg-cyan-50 flex items-center justify-center border border-cyan-100">
            <FileText size={26} className="text-cyan-600" />
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-700">Drop image or PDF here, or click to upload</p>
            <p className="text-xs text-slate-400">PNG, JPG or PDF • up to 10 MB</p>
          </div>

          <div className="mt-4">
            <label htmlFor="doc-upload-top" className="px-4 py-2 bg-white border rounded-md text-sm cursor-pointer">Upload Document</label>
            <input id="doc-upload-top" ref={docRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => onFileChange(e.target.files?.[0] || null, "doc")} />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          {verificationPreview ? (
            <img src={verificationPreview} alt="verification" className="w-36 h-24 object-cover rounded-md border" />
          ) : (
            <div className="w-36 h-24 rounded-md border flex items-center justify-center bg-slate-50 text-sm text-slate-600">
              {verificationFile?.type.includes("pdf") ? "PDF Document" : "Preview"}
            </div>
          )}

          <div className="flex-1">
            <div className="font-medium text-slate-800 truncate">{verificationFile?.name}</div>
            <div className="text-xs text-slate-400 mt-1">{verificationFile ? `${Math.round(verificationFile.size / 1024)} KB` : ""}</div>
            <div className="mt-3 flex gap-2">
              <label htmlFor="doc-upload-top" className="px-3 py-2 bg-white border rounded-md text-sm cursor-pointer">Change</label>
              <button onClick={() => onFileChange(null, "doc")} className="px-3 py-2 bg-red-50 border border-red-100 text-red-600 rounded-md text-sm flex items-center gap-2"><Trash2 /> Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const UploadBoxLogo = () => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">Business Logo</label>
      <p className="text-xs text-slate-400">Upload your company logo for branding</p>
      <div
        onDragOver={prevent}
        onDragEnter={prevent}
        onDrop={(e) => onDrop(e, "logo")}
        className="h-32 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-cyan-400 flex flex-col items-center justify-center px-4 transition-all cursor-pointer"
      >
        {!logoPreview ? (
          <>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center border">
                <FileText size={18} className="text-slate-500" />
              </div>
              <div className="text-sm text-slate-600 font-medium">Drop image here, or click to upload</div>
              <div className="text-xs text-slate-400">PNG, JPG • Max 5MB</div>
            </div>
            <input id="logo-upload" ref={logoRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFileChange(e.target.files?.[0] || null, "logo")} />
          </>
        ) : (
          <div className="w-full flex items-center gap-3">
            <img src={logoPreview} alt="logo" className="w-16 h-16 object-cover rounded-lg border" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-slate-800 truncate text-sm">{logoFile?.name}</div>
              <div className="text-xs text-slate-400 mt-1">{logoFile ? `${Math.round(logoFile.size / 1024)} KB` : ""}</div>
              <div className="mt-2 flex gap-2">
                <button onClick={() => logoRef.current?.click()} className="px-2 py-1 bg-white border rounded-md text-xs hover:bg-gray-50">Change</button>
                <button onClick={() => onFileChange(null, "logo")} className="px-2 py-1 bg-red-50 border border-red-100 text-red-600 rounded-md text-xs hover:bg-red-100">Remove</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col">
      {/* Header (polished background + subtle shadow and thin bottom border) */}
      <header className="sticky top-0 z-50  w-full mx-auto px-6 py-5 flex items-center justify-between"
        style={{ background: "rgba(255, 255, 255, 0.8)", backdropFilter: "saturate(180%) blur(20px)", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
      >
        <div className="flex items-center px-6  max-w-6xl w-full mx-auto">

        <div className="flex items-center gap-4">
          <div className=" bg-white shadow-md border border-white overflow-hidden">
            <Image
              src={logo}
              alt="Social Golf Logo"
              width={60}
              height={60}
              className="object-cover rounded-lg"
            />

          </div>
        </div>

        <div className="flex-1 pl-6">
          <h2 className="text-lg font-semibold text-slate-700">Business Setup</h2>
          <p className="text-sm text-slate-400 mt-1">Step {currentStep} of {totalSteps}</p>

          <div className="mt-3 relative w-full">
            {/* Background Line */}
            <div className="w-full h-[3px] bg-slate-200 rounded-full"></div>

            {/* Completed Fill Line */}
            <div
              className="h-[3px] rounded-full absolute top-0 left-0 transition-all duration-300"
              style={{
                width: `${(currentStep / totalSteps) * 100}%`,
                background: "linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%)",
              }}
            ></div>

            {/* Moving Dot */}
            <div
              className="w-4 h-4 rounded-full border-2 border-white shadow-md absolute -top-[6px] transition-all duration-300"
              style={{
                left: `calc(${(currentStep / totalSteps) * 100}% - 8px)`,
                background: "linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%)",
              }}
            ></div>
          </div>
        </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-start justify-center pb-12 pt-6">
        <div className="max-w-6xl w-full px-6">
          <div className="bg-white rounded-3xl p-8 border border-white shadow-md">

            {currentStep === 1 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {OPTIONS.map((opt) => {
                  const isActive = selected === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setSelected(opt.id)}
                      className={`w-full text-left flex items-center gap-4 p-4 rounded-xl transition-all duration-200 border
                        ${isActive ? "border-cyan-300 bg-cyan-50 shadow-md" : "border-gray-200 bg-white shadow-sm hover:shadow-md"}`}
                      aria-pressed={isActive}
                    >
                      <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${isActive ? "bg-white" : "bg-gray-100"}`}>
                        <opt.Icon size={20} className={isActive ? "text-cyan-600" : "text-slate-500"} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className={`text-base font-semibold ${isActive ? "text-slate-800" : "text-slate-700"}`}>{opt.title}</h3>
                          {isActive && <CheckCircle size={18} className="text-cyan-600" />}
                        </div>
                        <p className="text-sm text-slate-400 mt-1">{opt.subtitle}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : currentStep === 2 ? (
              <>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Golf Course Details</h3>
                  <p className="text-slate-500">Fill basic details and upload verification & logo</p>
                </div>

                {/* 1) Upload Files Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <UploadBoxLogo />
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Verification Document</label>
                    <p className="text-xs text-slate-400">Upload a business license or Certificate To Get Verify</p>
                    <div
                      onDragOver={prevent}
                      onDragEnter={prevent}
                      onDrop={(e) => onDrop(e, "doc")}
                      className="h-32 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-cyan-400 flex flex-col items-center justify-center px-4 transition-all cursor-pointer"
                    >
                      {!verificationPreview && !verificationFile ? (
                        <>
                          <div className="flex flex-col items-center gap-2 text-center">
                            <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center border">
                              <FileText size={18} className="text-slate-500" />
                            </div>
                            <div className="text-sm text-slate-600 font-medium">Drop PDF or image here, or click to upload</div>
                            <div className="text-xs text-slate-400">PDF, PNG, JPG • Max 10MB</div>
                          </div>
                          <input id="doc-upload" ref={docRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => onFileChange(e.target.files?.[0] || null, "doc")} />
                        </>
                      ) : (
                        <div className="w-full flex items-center gap-3">
                          {verificationPreview ? (
                            <img src={verificationPreview} alt="verification" className="w-16 h-16 object-cover rounded-lg border" />
                          ) : (
                            <div className="w-16 h-16 rounded-lg border flex items-center justify-center bg-slate-100 text-xs text-slate-600 font-medium">
                              {verificationFile?.type.includes("pdf") ? "PDF" : "DOC"}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-slate-800 truncate text-sm">{verificationFile?.name}</div>
                            <div className="text-xs text-slate-400 mt-1">{verificationFile ? `${Math.round(verificationFile.size / 1024)} KB` : ""}</div>
                            <div className="mt-2 flex gap-2">
                              <button onClick={() => docRef.current?.click()} className="px-2 py-1 bg-white border rounded-md text-xs hover:bg-gray-50">Change</button>
                              <button onClick={() => onFileChange(null, "doc")} className="px-2 py-1 bg-red-50 border border-red-100 text-red-600 rounded-md text-xs hover:bg-red-100">Remove</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2) Business Name - Full Width */}
                <div className="space-y-2 mb-6">
                  <label className="block text-sm font-medium text-slate-700">Business Name</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Enter your golf course name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  />
                </div>



                {/* 3) About Your Business - full width */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">About Your Business</label>
                  <textarea
                    value={aboutBusiness}
                    onChange={(e) => setAboutBusiness(e.target.value)}
                    placeholder="Brief description of your golf course..."
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
              </>
            ) : currentStep === 3 ? (
              // Step 3: Business Information
              <>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Business Information</h3>
                  <p className="text-slate-500">Complete your business profile with contact and location details</p>
                </div>

                {/* Street Address - Full Width */}
                <div className="space-y-2 mb-6">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <MapPin size={16} className="text-cyan-600" />
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="Enter your business address"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* City, State, Zip - 3 Columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Map size={16} className="text-cyan-600" />
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Enter city"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Flag size={16} className="text-cyan-600" />
                      State
                    </label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select state</option>
                      <option value="CA">California</option>
                      <option value="TX">Texas</option>
                      <option value="FL">Florida</option>
                      <option value="NY">New York</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <MapPin size={16} className="text-cyan-600" />
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      placeholder="12345"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Phone Number, Website - 2 Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Phone size={16} className="text-cyan-600" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="(555) 123-4567"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Globe size={16} className="text-cyan-600" />
                      Website
                    </label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://yourgolfcourse.com"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Email, Password - 2 Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Mail size={16} className="text-cyan-600" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="info@yourgolfcourse.com"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Lock size={16} className="text-cyan-600" />
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a secure password"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Business Hours - 7 Days Selector */}
                <div className="space-y-4 mb-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Clock size={16} className="text-cyan-600" />
                    Business Hours
                  </label>
                  <div className="space-y-3">
                    {Object.entries(businessHours).map(([day, hours]) => (
                      <div key={day} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl">
                        <div className="w-20">
                          <span className="text-sm font-medium text-slate-700 capitalize">{day}</span>
                        </div>
                        <div className="flex items-center gap-3 flex-1">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={hours.closed}
                              onChange={(e) => updateBusinessHours(day, 'closed', e.target.checked)}
                              className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                            />
                            <span className="text-sm text-slate-600">{hours.closed ? 'Select' : 'Closed'}</span>
                          </label>
                          {!hours.closed && (
                            <>
                              <div className="flex items-center gap-2">
                                <input
                                  type="time"
                                  value={hours.open}
                                  onChange={(e) => updateBusinessHours(day, 'open', e.target.value)}
                                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                                />
                                <span className="text-slate-400">to</span>
                                <input
                                  type="time"
                                  value={hours.close}
                                  onChange={(e) => updateBusinessHours(day, 'close', e.target.value)}
                                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : currentStep === 4 ? (
              // Step 4: Team Members
              <>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Add Team Members</h3>
                  <p className="text-slate-500">Invite your staff to join your golf course management</p>
                </div>

                {/* Add Team Member Form */}
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <User size={16} className="text-cyan-600" />
                        Name
                      </label>
                      <input
                        type="text"
                        value={teamMemberName}
                        onChange={(e) => setTeamMemberName(e.target.value)}
                        placeholder="Enter full name"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Mail size={16} className="text-cyan-600" />
                        Email
                      </label>
                      <input
                        type="email"
                        value={teamMemberEmail}
                        onChange={(e) => setTeamMemberEmail(e.target.value)}
                        placeholder="Enter email address"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Lock size={16} className="text-cyan-600" />
                        Password
                      </label>
                      <input
                        type="password"
                        value={teamMemberPassword}
                        onChange={(e) => setTeamMemberPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Settings size={16} className="text-cyan-600" />
                        Role
                      </label>
                      <select
                        value={teamMemberRole}
                        onChange={(e) => setTeamMemberRole(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none transition-all"
                      >
                        <option value="">Select role</option>
                        <option value="Manager">Manager</option>
                        <option value="Pro Shop Staff">Pro Shop Staff</option>
                        <option value="Golf Instructor">Golf Instructor</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={addTeamMember}
                      className="flex items-center justify-center gap-2 bg-gradient-to-br from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl shadow-md hover:scale-105 transition-transform"
                    >
                      <Plus size={18} />
                      Add Team Member
                    </button>
                  </div>
                </div>

                {/* Team Members List */}
                {teamMembers.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-slate-800">Team Members ({teamMembers.length})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {teamMembers.map((member) => (
                        <div key={member.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
                                <User size={18} className="text-cyan-600" />
                              </div>
                              <div>
                                <h5 className="font-medium text-slate-800">{member.name}</h5>
                                <p className="text-sm text-slate-500">{member.email}</p>
                                <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-xs text-slate-600 rounded-md">
                                  {member.role}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => removeTeamMember(member.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Minus size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              // Step 5 or completion
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Setup Complete!</h3>
                <p className="text-slate-500">Your golf course profile has been successfully created.</p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8">
              <button
                onClick={handleBack}
                className="flex items-center gap-3 bg-white text-slate-600 px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-200"
              >
                <ArrowLeft size={18} />
                <span>Back</span>
              </button>

              <div className="flex items-center gap-3">
                {currentStep === 1 ? (
                  <button
                    onClick={handleSelectContinue}
                    className="flex items-center gap-3 bg-gradient-to-br from-cyan-500 to-blue-600 text-white px-5 py-2 rounded-md shadow-md hover:scale-105 transition-transform"
                  >
                    <span>Continue</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ) : currentStep === 2 ? (
                  <button
                    onClick={handleStep2Continue}
                    className="flex items-center gap-3 bg-gradient-to-br from-cyan-500 to-blue-600 text-white px-5 py-2 rounded-md shadow-md hover:scale-105 transition-transform"
                  >
                    <span>Continue</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ) : currentStep === 3 ? (
                  <button
                    onClick={handleStep3Continue}
                    className="flex items-center gap-3 bg-gradient-to-br from-cyan-500 to-blue-600 text-white px-5 py-2 rounded-md shadow-md hover:scale-105 transition-transform"
                  >
                    <span>Continue</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ) : currentStep === 4 ? (
                  <button
                    onClick={handleFinalContinue}
                    className="flex items-center gap-3 bg-gradient-to-br from-cyan-500 to-blue-600 text-white px-5 py-2 rounded-md shadow-md hover:scale-105 transition-transform"
                  >
                    <span>Complete Setup</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ) : null}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
