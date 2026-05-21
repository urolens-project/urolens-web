import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, User, Calendar, Phone, MapPin, Users2, ArrowRight } from 'lucide-react';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedId, setGeneratedId] = useState<string | null>(null);

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

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const randomSequence = Math.floor(10000 + Math.random() * 90000);
      setGeneratedId(`URLNS-2026-${randomSequence}`);
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-sans text-slate-800 tracking-tight">
      
      {/* PAGE HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Patient Account Registry</h2>
          <p className="text-xs text-slate-400 mt-1">Encode verified demographic data metrics to initialize laboratory routing sequence tracks.</p>
        </div>
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, is_walkin: false }))}
            className={`px-4 h-9 rounded-lg text-xs font-semibold transition-all border ${!formData.is_walkin ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            Standard Account (1.1)
          </button>
          <button 
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, is_walkin: true }))}
            className={`px-4 h-9 rounded-lg text-xs font-semibold transition-all border ${formData.is_walkin ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            New Walk-in Session (1.2)
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* STRUCTURAL FORM LAYOUT GRID */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          
          {/* CONTENT CARD OVERVIEW SUBHEADER */}
          <div className="bg-emerald-50/20 border-b border-slate-200 px-6 py-4 flex items-center gap-2.5">
            <User className="h-4 w-4 text-emerald-600/70" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Demographic Profile Fields</span>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className={`w-full h-10 rounded-xl border px-3.5 text-xs outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/5 ${errors.first_name ? 'border-red-300 bg-red-50/30' : 'border-slate-200 bg-white'}`}
                />
                {errors.first_name && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.first_name}</p>}
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Middle Name</label>
                <input
                  type="text"
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleInputChange}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className={`w-full h-10 rounded-xl border px-3.5 text-xs outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/5 ${errors.last_name ? 'border-red-300 bg-red-50/30' : 'border-slate-200 bg-white'}`}
                />
                {errors.last_name && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.last_name}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Date of Birth *</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  className={`w-full h-10 rounded-xl border px-3.5 text-xs outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/5 ${errors.date_of_birth ? 'border-red-300 bg-red-50/30' : 'border-slate-200 bg-white'}`}
                />
                {errors.date_of_birth && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.date_of_birth}</p>}
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Biological Sex *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className={`w-full h-10 rounded-xl border px-3 text-xs outline-none transition-all bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/5 ${errors.gender ? 'border-red-300 bg-red-50/30' : 'border-slate-200 bg-white'}`}
                >
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.gender}</p>}
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Contact Identity Number *</label>
                <input
                  type="text"
                  placeholder="09XXXXXXXXX"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleInputChange}
                  className={`w-full h-10 rounded-xl border px-3.5 text-xs outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/5 ${errors.contact_number ? 'border-red-300 bg-red-50/30' : 'border-slate-200 bg-white'}`}
                />
                {errors.contact_number && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.contact_number}</p>}
              </div>
            </div>

            <div className="pt-1">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Complete Core Address *</label>
              <input
                type="text"
                placeholder="St., Barangay, City/Municipality, Province"
                name="complete_address"
                value={formData.complete_address}
                onChange={handleInputChange}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* COMPACT DYNAMIC WALK-IN MODULE ACCESSORY (UC 1.2) */}
        {formData.is_walkin && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs animate-fadeIn">
            <div className="bg-emerald-50/20 border-b border-slate-200 px-6 py-4 flex items-center gap-2.5">
              <Users2 className="h-4 w-4 text-emerald-600/70" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Dynamic Emergency Variables</span>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Emergency Contact Name</label>
                <input
                  type="text"
                  name="emergency_name"
                  value={formData.emergency_name}
                  onChange={handleInputChange}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Relationship Metric</label>
                <input
                  type="text"
                  name="emergency_relationship"
                  value={formData.emergency_relationship}
                  onChange={handleInputChange}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Emergency Contact Phone</label>
                <input
                  type="text"
                  name="emergency_phone"
                  value={formData.emergency_phone}
                  onChange={handleInputChange}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* RA 10173 PRIVACY ENVELOPE CARD */}
        <div className={`rounded-2xl border p-6 transition-all shadow-xs ${hasConsent ? 'bg-emerald-50/10 border-emerald-200/60' : 'bg-amber-50/10 border-amber-200'}`}>
          <div className="flex gap-4">
            <input
              type="checkbox"
              id="privacy_consent"
              checked={hasConsent}
              onChange={(e) => {
                setHasConsent(e.target.checked);
                if (e.target.checked && errors.consent) setErrors((prev) => { const n = { ...prev }; delete n.consent; return n; });
              }}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <div className="text-left space-y-1">
              <label htmlFor="privacy_consent" className="text-xs font-bold text-slate-900 cursor-pointer flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" /> RA 10173 Philippine Data Privacy Act Integration Seal *
              </label>
              <p className="text-[11px] text-slate-500 leading-relaxed pt-0.5">
                By acknowledging this validation parameters switch, the logging operator certifies that the patient formally grants digital processing authority to record demographic data variables and capture urinary microfluid imagery for internal neural inference compilation tasks.
              </p>
              {errors.consent && <p className="text-[10px] text-red-500 mt-2 font-bold">{errors.consent}</p>}
            </div>
          </div>
        </div>

        {/* SUBMISSION BUTTON */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-11 px-6 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Processing Audit Entry...' : 'Commit & Provision Patient Record'}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>

      {/* TRACKER REGISTRY LOG OVERLAY MODAL */}
      {generatedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/10 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 max-w-sm w-full rounded-2xl p-6 shadow-xl text-center space-y-4">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100 text-emerald-500">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Registry Entry Composed</h4>
              <p className="text-[11px] text-slate-400 mt-1">Unique multi-module diagnostic identification tracker sequence has been successfully committed.</p>
            </div>
            
            <div className="bg-emerald-50/40 border border-emerald-100 p-3 rounded-xl font-mono text-xs font-bold text-emerald-700 tracking-wider">
              {generatedId}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setGeneratedId(null)}
                className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
              >
                Acknowledge & Close Canvas
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}