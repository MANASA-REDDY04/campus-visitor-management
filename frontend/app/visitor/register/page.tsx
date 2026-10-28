'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerVisit } from '@/lib/api';
import { RegistrationFormData, VisitorType } from '@/types/visitor';
import {
  User, Phone, Mail, Building2, Calendar, Clock, FileText,
  ChevronLeft, CheckCircle, AlertCircle, Loader2
} from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { NavbarUser } from '@/components/NavbarUser';

const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Mechanical Engineering',
  'Civil Engineering',
  'Administration',
  'Library',
  'Finance & Accounts',
  'Examination Cell',
  'Placement Cell',
  'Sports Department',
  'Other',
];

const VISITOR_TYPES: { value: VisitorType; label: string }[] = [
  { value: 'PARENT', label: 'Parent' },
  { value: 'GUEST', label: 'Guest' },
  { value: 'VENDOR', label: 'Vendor' },
  { value: 'ALUMNI', label: 'Alumni' },
  { value: 'OTHER', label: 'Other' },
];

const EMPTY_FORM: RegistrationFormData = {
  full_name: '',
  phone: '',
  email: '',
  visitor_type: 'GUEST',
  person_to_visit: '',
  department: '',
  purpose: '',
  visit_date: '',
  arrival_time: '',
  departure_time: '',
};

// Calculate today's date string safely (only on client)
function getTodayString(): string {
  if (typeof window === 'undefined') return '';
  return new Date().toISOString().split('T')[0];
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<RegistrationFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<RegistrationFormData>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{
    visitId: string;
    passId: string;
  } | null>(null);
  const [apiError, setApiError] = useState('');

  const validate = (): boolean => {
    const errs: Partial<RegistrationFormData> = {};
    if (!form.full_name.trim()) errs.full_name = 'Full name is required';
    if (!form.phone.trim()) errs.phone = 'Mobile number is required';
    if (!form.person_to_visit.trim()) errs.person_to_visit = 'Person to visit is required';
    if (!form.department) errs.department = 'Department is required';
    if (!form.purpose.trim()) errs.purpose = 'Purpose of visit is required';
    if (!form.visit_date) errs.visit_date = 'Visit date is required';
    if (!form.arrival_time) errs.arrival_time = 'Arrival time is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof RegistrationFormData]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError('');
    try {
      const result = await registerVisit(form);
      setSuccess({ visitId: result.visit_id, passId: result.pass_id });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } }; message?: string };
      setApiError(
        error?.response?.data?.detail || error?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
          <p className="text-gray-500 mb-6">
            Your visit request has been submitted successfully and is pending approval.
          </p>

          <div className="bg-blue-50 rounded-2xl p-4 mb-6 text-left space-y-2">
            <div>
              <p className="text-xs text-gray-500">Visit ID</p>
              <p className="font-mono font-semibold text-gray-800 text-sm">{success.visitId}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Pass ID (save this!)</p>
              <p className="font-mono font-bold text-blue-700">{success.passId}</p>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-8">
            Once approved, you can view your digital pass using the Pass ID above.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => router.push(`/visitor/pass/${success.passId}`)}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              View My Pass
            </button>
            <button
              onClick={() => { setSuccess(null); setForm(EMPTY_FORM); }}
              className="w-full py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Register Another Visit
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']} portalName="Pass Registration Portal">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Navbar */}
        <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4 shadow-xs">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              href="/"
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center gap-1 border border-gray-200/70 sm:border-0 flex-shrink-0"
              title="Return to Home"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-medium hidden md:inline">Home</span>
            </Link>
            <div className="h-5 w-px bg-gray-200 hidden sm:block flex-shrink-0" />
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.jpg"
                alt="CBIT Logo"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover border border-gray-200 bg-white flex-shrink-0 shadow-xs"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-bold text-gray-900 text-sm sm:text-base leading-tight truncate">
                    Pass Registration
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex-shrink-0">
                    CBIT
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 hidden lg:block leading-none mt-0.5">
                  Chaitanya Bharathi Institute of Technology
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            <NavbarUser />
          </div>
        </nav>

        <div className="max-w-2xl mx-auto p-4 sm:p-6 py-6 sm:py-10">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Register Your Visit to CBIT</h2>
          <p className="text-gray-500 text-sm sm:text-base mt-1.5 sm:mt-2">
            Fill in the details below to request a visit to Chaitanya Bharathi Institute of Technology (CBIT). You will receive a digital pass once approved.
          </p>
        </div>

        {apiError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.full_name ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                  }`}
                />
                {errors.full_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                      errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="optional@email.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visitor Type <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {VISITOR_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, visitor_type: type.value }))}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                        form.visitor_type === type.value
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Visit Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-500" />
              Visit Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Person to Visit <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="person_to_visit"
                  value={form.person_to_visit}
                  onChange={handleChange}
                  placeholder="e.g. Dr. Priya Sharma"
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.person_to_visit ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                  }`}
                />
                {errors.person_to_visit && (
                  <p className="text-red-500 text-xs mt-1">{errors.person_to_visit}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.department ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <option value="">Select department</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                {errors.department && (
                  <p className="text-red-500 text-xs mt-1">{errors.department}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purpose of Visit <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <textarea
                    name="purpose"
                    value={form.purpose}
                    onChange={handleChange}
                    placeholder="Briefly describe the purpose of your visit"
                    rows={3}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none ${
                      errors.purpose ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                </div>
                {errors.purpose && (
                  <p className="text-red-500 text-xs mt-1">{errors.purpose}</p>
                )}
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Schedule
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visit Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    name="visit_date"
                    value={form.visit_date}
                    onChange={handleChange}
                    min={getTodayString()}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                      errors.visit_date ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                </div>
                {errors.visit_date && (
                  <p className="text-red-500 text-xs mt-1">{errors.visit_date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Arrival <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="time"
                    name="arrival_time"
                    value={form.arrival_time}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                      errors.arrival_time ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                </div>
                {errors.arrival_time && (
                  <p className="text-red-500 text-xs mt-1">{errors.arrival_time}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Departure
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="time"
                    name="departure_time"
                    value={form.departure_time}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-blue-200"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting Request...
              </>
            ) : (
              'Submit Visit Request'
            )}
          </button>
        </form>
      </div>
    </div>
  </ProtectedRoute>
  );
}
