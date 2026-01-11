
import React, { useState } from 'react';
import { CitizenProfile } from '../types';

interface Props {
  mobile: string;
  onComplete: (profile: CitizenProfile) => void;
}

const Onboarding: React.FC<Props> = ({ mobile, onComplete }) => {
  const [form, setForm] = useState<CitizenProfile>({
    fullName: '',
    dob: '',
    mobile: mobile,
    address: '',
    district: '',
    aadhar: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(form);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white">
      <div className="bg-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col md:flex-row border border-slate-700">
        <div className="bg-black md:w-1/3 p-10 text-white flex flex-col justify-center border-r border-slate-700">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-3xl mb-8 border border-white/10 shadow-inner">
            <i className="fa-solid fa-id-card text-white"></i>
          </div>
          <h2 className="text-3xl font-black mb-6 tracking-tight italic">Civic Resolve</h2>
          <p className="text-slate-400 text-sm font-medium leading-relaxed">Identity verification is mandatory for municipal accountability. Your data is encrypted and stored securely.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-10 flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 text-white bg-slate-800">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Legal Full Name</label>
            <input required value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} className="w-full p-4 bg-slate-900/50 border border-slate-600 rounded-2xl focus:border-white outline-none text-white font-bold" placeholder="As per official documents" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Date of Birth</label>
            <input required type="date" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} className="w-full p-4 bg-slate-900/50 border border-slate-600 rounded-2xl focus:border-white outline-none text-white font-bold" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Aadhar ID</label>
            <input required maxLength={12} value={form.aadhar} onChange={e => setForm({...form, aadhar: e.target.value})} className="w-full p-4 bg-slate-900/50 border border-slate-600 rounded-2xl focus:border-white outline-none text-white font-bold tracking-widest" placeholder="12 digit number" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Permanent Address</label>
            <textarea required rows={2} value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full p-4 bg-slate-900/50 border border-slate-600 rounded-2xl focus:border-white outline-none text-white font-bold" placeholder="Complete postal address..." />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Municipal District</label>
            <input required value={form.district} onChange={e => setForm({...form, district: e.target.value})} className="w-full p-4 bg-slate-900/50 border border-slate-600 rounded-2xl focus:border-white outline-none text-white font-bold" placeholder="Select your district..." />
          </div>
          <button type="submit" className="md:col-span-2 bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all mt-6 shadow-2xl">
            Confirm & Access Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
