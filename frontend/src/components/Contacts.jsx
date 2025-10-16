// Optimized Contact & Help Request page (no nav/footer here)
import { useState } from "react";

const staffMembers = [
  {
    id: 1,
    name: "Dr. Rajesh Kumar",
    role: "Chief Warden",
    description:
      "Overall hostel administration and student welfare coordination",
    badge: "Warden",
    badgeColor: "bg-gradient-to-r from-blue-500 to-indigo-600",
    image: "/images/profile_pic.png",
    whatsapp: "919876543210",
    phone: "+919876543210",
    email: "chief.warden@hostelia.edu",
  },
  {
    id: 2,
    name: "Ms. Priya Sharma",
    role: "Deputy Warden",
    description: "Student discipline, grievances and welfare management",
    badge: "Warden",
    badgeColor: "bg-gradient-to-r from-purple-500 to-pink-600",
    image: "/images/profile_pic.png",
    whatsapp: "919876543211",
    phone: "+919876543211",
    email: "deputy.warden@hostelia.edu",
  },
  {
    id: 3,
    name: "Mr. Anil Verma",
    role: "Admin Officer",
    description: "Billing, documentation and administrative operations",
    badge: "Admin",
    badgeColor: "bg-gradient-to-r from-emerald-500 to-teal-600",
    image: "/images/profile_pic.png",
    whatsapp: "919876543212",
    phone: "+919876543212",
    email: "admin@hostelia.edu",
  },
  {
    id: 4,
    name: "Mr. Suresh Patel",
    role: "Maintenance Head",
    description: "Infrastructure repairs and facility maintenance services",
    badge: "Support",
    badgeColor: "bg-gradient-to-r from-orange-500 to-red-600",
    image: "/images/profile_pic.png",
    whatsapp: "919876543213",
    phone: "+919876543213",
    email: "maintenance@hostelia.edu",
  },
  {
    id: 5,
    name: "Mrs. Lakshmi Iyer",
    role: "Mess Manager",
    description: "Food quality control, menu planning and mess operations",
    badge: "Support",
    badgeColor: "bg-gradient-to-r from-amber-500 to-yellow-600",
    image: "/images/profile_pic.png",
    whatsapp: "919876543214",
    phone: "+919876543214",
    email: "mess@hostelia.edu",
  },
  {
    id: 6,
    name: "Mr. Vikram Singh",
    role: "Security Supervisor",
    description: "Campus security, safety protocols and emergency response",
    badge: "Support",
    badgeColor: "bg-gradient-to-r from-slate-500 to-gray-700",
    image: "/images/profile_pic.png",
    whatsapp: "919876543215",
    phone: "+919876543215",
    email: "security@hostelia.edu",
  },
];

const Contacts = ({ user = null }) => {
  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    roomNumber: user?.roomNumber || "",
    email: user?.email || "",
    phone: "",
    hostelNumber: user?.hostelNumber || "",
    requestType: "",
    message: "",
    urgency: "medium",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "message") setCharCount(value.length);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) return "Full name is required";
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      return "Please enter a valid email address";
    if (!formData.phone.match(/^\d{10}$/))
      return "Phone number must be exactly 10 digits";
    if (!formData.requestType) return "Please select a request type";
    if (formData.message.length < 10)
      return "Message must be at least 10 characters";
    if (formData.message.length > 500)
      return "Message cannot exceed 500 characters";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setStatus({ type: "error", message: validationError });
      return;
    }
    setIsSubmitting(true);
    setStatus({ type: "", message: "" });
    try {
      const response = await fetch("/api/help-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        setStatus({
          type: "success",
          message:
            data.message ||
            "Your help request has been submitted successfully! Our team will contact you soon.",
        });
        setFormData({
          fullName: user?.name || "",
          roomNumber: user?.roomNumber || "",
          email: user?.email || "",
          phone: "",
          hostelNumber: user?.hostelNumber || "",
          requestType: "",
          message: "",
          urgency: "medium",
        });
        setCharCount(0);
      } else {
        setStatus({
          type: "error",
          message:
            data.error || "Failed to submit your request. Please try again.",
        });
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helpers for UI
  const isRoomDisabled =
    user?.role === "admin" ||
    user?.role === "warden" ||
    user?.role === "student";
  const isHostelReadOnly = user?.role === "warden" || user?.role === "student";
  const isHostelNA = user?.role === "admin";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#4a90e2] via-[#357abd] to-[#2a6ba8] pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg
            className="absolute top-0 left-0 w-full h-full"
            viewBox="0 0 800 600"
          >
            <circle cx="100" cy="100" r="200" fill="white" opacity="0.1" />
            <circle cx="700" cy="500" r="250" fill="white" opacity="0.1" />
            <circle cx="500" cy="300" r="180" fill="white" opacity="0.15" />
          </svg>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Get in Touch
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto font-light">
            Our dedicated team is here to assist you 24/7. Reach out for
            support, guidance, or any queries.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            className="w-full h-12 md:h-20 fill-current text-slate-50"
          >
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </section>
      {/* Staff Directory */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Meet Our Team
            </h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-[#4a90e2] to-[#357abd] mx-auto rounded-full mb-6"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experienced professionals committed to making your hostel life
              comfortable and productive
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {staffMembers.map((staff) => (
              <div
                key={staff.id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
              >
                <div className="relative">
                  <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                    <img
                      src={staff.image}
                      alt={`${staff.name} - ${staff.role}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/profile_pic.png";
                      }}
                    />
                  </div>
                  <div
                    className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold text-white ${staff.badgeColor} shadow-lg`}
                  >
                    {staff.badge.toUpperCase()}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">
                    {staff.name}
                  </h3>
                  <p className="text-[#4a90e2] font-semibold text-sm mb-3">
                    {staff.role}
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed mb-6">
                    {staff.description}
                  </p>
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <a
                      href={`https://wa.me/${staff.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`WhatsApp ${staff.name}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all hover:shadow-md"
                    >
                      {/* WhatsApp SVG */}
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                      <span className="text-sm font-semibold">Chat</span>
                    </a>
                    <a
                      href={`tel:${staff.phone}`}
                      aria-label={`Call ${staff.name}`}
                      className="flex items-center justify-center w-12 h-11 bg-[#4a90e2] hover:bg-[#357abd] text-white rounded-lg transition-all hover:shadow-md"
                    >
                      {/* Call SVG */}
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </a>
                    <a
                      href={`mailto:${staff.email}`}
                      aria-label={`Email ${staff.name}`}
                      className="flex items-center justify-center w-12 h-11 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all hover:shadow-md"
                    >
                      {/* Mail SVG */}
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Help Request Form */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Submit a Help Request
            </h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-[#4a90e2] to-[#357abd] mx-auto rounded-full mb-6"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experiencing an issue? Fill out the form below and our team will
              respond promptly
            </p>
          </div>
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl p-8 md:p-12 border border-blue-100">
            <form onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-bold text-gray-700 mb-2"
                  >
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    readOnly={!!user}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4a90e2] focus:border-[#4a90e2] transition-all read-only:bg-gray-50 read-only:cursor-not-allowed"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="roomNumber"
                    className="block text-sm font-bold text-gray-700 mb-2"
                  >
                    Room Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="roomNumber"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleInputChange}
                    required
                    disabled={isRoomDisabled}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4a90e2] focus:border-[#4a90e2] transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="e.g., 201"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-bold text-gray-700 mb-2"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    readOnly={!!user}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4a90e2] focus:border-[#4a90e2] transition-all read-only:bg-gray-50 read-only:cursor-not-allowed"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-bold text-gray-700 mb-2"
                  >
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    pattern="[0-9]{10}"
                    maxLength="10"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4a90e2] focus:border-[#4a90e2] transition-all"
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label
                    htmlFor="hostelNumber"
                    className="block text-sm font-bold text-gray-700 mb-2"
                  >
                    Hostel Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="hostelNumber"
                    name="hostelNumber"
                    value={isHostelNA ? "N/A" : formData.hostelNumber}
                    onChange={handleInputChange}
                    required={!isHostelNA}
                    readOnly={isHostelReadOnly || isHostelNA}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4a90e2] focus:border-[#4a90e2] transition-all read-only:bg-gray-50 read-only:cursor-not-allowed"
                    placeholder="e.g., Block A"
                  />
                </div>
                <div>
                  <label
                    htmlFor="requestType"
                    className="block text-sm font-bold text-gray-700 mb-2"
                  >
                    Request Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="requestType"
                    name="requestType"
                    value={formData.requestType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4a90e2] focus:border-[#4a90e2] transition-all bg-white cursor-pointer"
                  >
                    <option value="">Select request type</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="electrical">Electrical Issue</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="mess">Mess/Food Related</option>
                    <option value="security">Security Concern</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="mb-6">
                <label
                  htmlFor="message"
                  className="block text-sm font-bold text-gray-700 mb-2"
                >
                  Describe Your Issue <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  minLength="10"
                  maxLength="500"
                  rows="5"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4a90e2] focus:border-[#4a90e2] transition-all resize-none"
                  placeholder="Please describe your issue in detail (minimum 10 characters)"
                ></textarea>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">
                    Minimum 10 characters
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      charCount > 500
                        ? "text-red-500"
                        : charCount > 450
                        ? "text-orange-500"
                        : "text-gray-600"
                    }`}
                  >
                    {charCount}/500
                  </span>
                </div>
              </div>
              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Urgency Level <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-4">
                  {[
                    {
                      value: "low",
                      label: "Low Priority",
                      color: "border-green-500 text-green-700 bg-green-50",
                    },
                    {
                      value: "medium",
                      label: "Medium Priority",
                      color: "border-yellow-500 text-yellow-700 bg-yellow-50",
                    },
                    {
                      value: "high",
                      label: "High Priority",
                      color: "border-red-500 text-red-700 bg-red-50",
                    },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center px-5 py-3 border-2 rounded-xl cursor-pointer transition-all ${
                        formData.urgency === option.value
                          ? option.color
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="urgency"
                        value={option.value}
                        checked={formData.urgency === option.value}
                        onChange={handleInputChange}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="ml-3 text-sm font-semibold">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              {status.message && (
                <div
                  role="alert"
                  aria-live="polite"
                  className={`mb-6 p-4 rounded-xl border-2 flex items-start gap-3 ${
                    status.type === "success"
                      ? "bg-green-50 text-green-800 border-green-200"
                      : "bg-red-50 text-red-800 border-red-200"
                  }`}
                >
                  {status.type === "success" ? (
                    <svg
                      className="w-6 h-6 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-6 h-6 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  <span className="flex-1 font-medium">{status.message}</span>
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#4a90e2] to-[#357abd] text-white font-bold py-4 px-6 rounded-xl hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] focus:ring-4 focus:ring-blue-300 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center text-lg"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting Request...
                  </>
                ) : (
                  <>
                    Submit Help Request
                    <svg
                      className="ml-2 w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contacts;
