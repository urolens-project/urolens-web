import React, { useState } from 'react';
import { ShieldCheck, User, Users2, ArrowRight } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { intakeApi } from '../../api/intakeApi';
import type { PatientRegistrationPayload } from '../../types/types';

interface PatientFormData {
  first_name: string;
  middle_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  contact_number: string;
  complete_address: string;
  is_walkin: boolean;
  emergency_name: string;
  emergency_relationship: string;
  emergency_phone: string;
}

export default function PatientRegistration() {
  const [formData, setFormData] = useState<PatientFormData>({
    first_name: '',
    middle_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    contact_number: '',
    complete_address: '',
    is_walkin: false,
    emergency_name: '',
    emergency_relationship: '',
    emergency_phone: '',
  });

  const [hasConsent, setHasConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [, setGeneratedId] = useState<string | null>(null);

  const registrationMutation = useMutation({
    mutationFn: (payload: PatientRegistrationPayload) => intakeApi.registerPatient(payload),
    onSuccess: (data) => {
      setGeneratedId(data.patient_id);
    },
    onError: (error: any) => {
      setErrors((prev) => ({
        ...prev,
        submit: error.response?.data?.detail || 'An unexpected backend connection fault occurred during registration.',
      }));
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.first_name.trim()) newErrors.first_name = 'First name required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name required';
    if (!formData.date_of_birth) newErrors.date_of_birth = 'DOB required';
    if (!formData.gender) newErrors.gender = 'Gender required';
    if (!formData.contact_number.trim()) newErrors.contact_number = 'Contact number required';
    if (!hasConsent) newErrors.consent = 'Required privacy consent verification check unconfirmed';
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload: PatientRegistrationPayload = {
      first_name: formData.first_name,
      middle_name: formData.middle_name || undefined,
      last_name: formData.last_name,
      date_of_birth: formData.date_of_birth,
      gender: formData.gender,
      contact_number: formData.contact_number,
      complete_address: formData.complete_address,
      is_walkin: formData.is_walkin,
      emergency_name: formData.is_walkin ? formData.emergency_name : undefined,
      emergency_relationship: formData.is_walkin ? formData.emergency_relationship : undefined,
      emergency_phone: formData.is_walkin ? formData.emergency_phone : undefined,
    };

    registrationMutation.mutate(payload);
  };

  return (
  <div className="min-h-screen bg-slate-50 px-4 py-8">
    <div className="max-w-6xl mx-auto space-y-8">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Patient Registration
          </h1>

          <p className="text-sm text-slate-500 mt-2 max-w-2xl leading-relaxed">
            Register and initialize a new patient profile for laboratory
            processing and diagnostic routing.
          </p>
        </div>

        {/* ACCOUNT TYPE TOGGLE */}
        <div className="bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm flex gap-2">
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                is_walkin: false,
              }))
            }
            className={`h-11 px-5 rounded-xl text-sm font-semibold transition-all ${
              !formData.is_walkin
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Standard Patient
          </button>

          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                is_walkin: true,
              }))
            }
            className={`h-11 px-5 rounded-xl text-sm font-semibold transition-all ${
              formData.is_walkin
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Walk-in Patient
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* MAIN CARD */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">

          {/* CARD HEADER */}
          <div className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Personal Information
                </h2>

                <p className="text-sm text-slate-500 mt-0.5">
                  Enter the patient’s demographic and contact information.
                </p>
              </div>
            </div>
          </div>

          {/* FORM BODY */}
          <div className="p-8 space-y-8">

            {/* NAME GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* FIRST NAME */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  First Name *
                </label>

                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  placeholder="Juan"
                  className={`w-full h-12 rounded-2xl border bg-slate-50 px-4 text-sm outline-none transition-all
                  focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10
                  ${
                    errors.first_name
                      ? 'border-red-300'
                      : 'border-slate-200'
                  }`}
                />

                {errors.first_name && (
                  <p className="text-xs text-red-500 font-medium">
                    {errors.first_name}
                  </p>
                )}
              </div>

              {/* MIDDLE NAME */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Middle Name
                </label>

                <input
                  type="text"
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleInputChange}
                  placeholder="Santos"
                  className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              {/* LAST NAME */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Last Name *
                </label>

                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  placeholder="Dela Cruz"
                  className={`w-full h-12 rounded-2xl border bg-slate-50 px-4 text-sm outline-none transition-all
                  focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10
                  ${
                    errors.last_name
                      ? 'border-red-300'
                      : 'border-slate-200'
                  }`}
                />

                {errors.last_name && (
                  <p className="text-xs text-red-500 font-medium">
                    {errors.last_name}
                  </p>
                )}
              </div>
            </div>

            {/* SECOND GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* DOB */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Date of Birth *
                </label>

                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  className={`w-full h-12 rounded-2xl border bg-slate-50 px-4 text-sm outline-none transition-all
                  focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10
                  ${
                    errors.date_of_birth
                      ? 'border-red-300'
                      : 'border-slate-200'
                  }`}
                />
              </div>

              {/* GENDER */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Gender *
                </label>

                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className={`w-full h-12 rounded-2xl border bg-slate-50 px-4 text-sm outline-none transition-all
                  focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10
                  ${
                    errors.gender
                      ? 'border-red-300'
                      : 'border-slate-200'
                  }`}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* CONTACT */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Contact Number *
                </label>

                <input
                  type="text"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleInputChange}
                  placeholder="09XXXXXXXXX"
                  className={`w-full h-12 rounded-2xl border bg-slate-50 px-4 text-sm outline-none transition-all
                  focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10
                  ${
                    errors.contact_number
                      ? 'border-red-300'
                      : 'border-slate-200'
                  }`}
                />
              </div>
            </div>

            {/* ADDRESS */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Complete Address
              </label>

              <input
                type="text"
                name="complete_address"
                value={formData.complete_address}
                onChange={handleInputChange}
                placeholder="Street, Barangay, City, Province"
                className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

          </div>
        </div>

        {/* WALK-IN SECTION */}
        {formData.is_walkin && (
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden animate-fadeIn">

            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Users2 className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Emergency Contact
                  </h2>

                  <p className="text-sm text-slate-500">
                    Required for walk-in patients.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">

              <input
                type="text"
                name="emergency_name"
                value={formData.emergency_name}
                onChange={handleInputChange}
                placeholder="Emergency contact name"
                className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />

              <input
                type="text"
                name="emergency_relationship"
                value={formData.emergency_relationship}
                onChange={handleInputChange}
                placeholder="Relationship"
                className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />

              <input
                type="text"
                name="emergency_phone"
                value={formData.emergency_phone}
                onChange={handleInputChange}
                placeholder="Emergency contact number"
                className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />

            </div>
          </div>
        )}

        {/* PRIVACY */}
        <div className={`rounded-3xl border p-6 transition-all ${
          hasConsent
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex gap-4">

            <input
              type="checkbox"
              checked={hasConsent}
              onChange={(e) => setHasConsent(e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-slate-300 text-emerald-600"
            />

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />

                <h3 className="text-sm font-bold text-slate-900">
                  Data Privacy Consent
                </h3>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                The patient authorizes the collection and processing of
                demographic and laboratory-related information in compliance
                with the Philippine Data Privacy Act of 2012.
              </p>

              {errors.consent && (
                <p className="text-xs font-medium text-red-500">
                  {errors.consent}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* SUBMIT */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={registrationMutation.isPending}
            className="h-12 px-7 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
          >
            {registrationMutation.isPending
              ? 'Registering Patient...'
              : 'Register Patient'}

            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  </div>
);
}