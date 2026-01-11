
import React, { useState } from 'react';
import { User, Complaint, ComplaintStatus, OfficialType } from '../types';

interface Props {
  user: User;
  complaints: Complaint[];
  onUpdate: (id: string, next: ComplaintStatus) => void;
}

const OfficialDashboard: React.FC<Props> = ({ user, complaints, onUpdate }) => {
  const [selected, setSelected] = useState<Complaint | null>(null);

  const isAuthority = user.officialType === OfficialType.AUTHORITY;
  const filtered = isAuthority 
    ? complaints 
    : complaints.filter(c => c.department === user.officialType);

  const statusOptions = [
    ComplaintStatus.SUBMITTED,
    ComplaintStatus.CLASSIFIED,
    ComplaintStatus.ACCEPTED,
    ComplaintStatus.EN_ROUTE,
    ComplaintStatus.ONGOING,
    ComplaintStatus.RESOLVED
  ];

  const handleStatusUpdate = (id: string, next: ComplaintStatus) => {
    onUpdate(id, next);
    if (selected && selected.id === id) {
      setSelected({ ...selected, status: next });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                 <i className={`fa-solid ${isAuthority ? 'fa-shield-halved' : 'fa-building-ngo'}`}></i>
              </div>
              {isAuthority ? 'Governance Control Panel' : `${user.officialType} Control Hub`}
            </h2>
            <p className="text-gray-500 mt-1">Manage local service requests and audit progress.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-indigo-50 px-6 py-4 rounded-2xl border border-indigo-100 text-center min-w-[120px] shadow-sm">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Active</p>
              <p className="text-3xl font-black text-indigo-700">{filtered.filter(c => c.status !== ComplaintStatus.RESOLVED).length}</p>
            </div>
            <div className="bg-emerald-50 px-6 py-4 rounded-2xl border border-emerald-100 text-center min-w-[120px] shadow-sm">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Resolved</p>
              <p className="text-3xl font-black text-emerald-700">{filtered.filter(c => c.status === ComplaintStatus.RESOLVED).length}</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4 text-left">Citizen / District</th>
                <th className="px-6 py-4 text-left">ID & Summary</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group" onClick={() => setSelected(c)}>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-800 text-sm">{c.citizenName}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Mobile: {c.citizenMobile}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 mb-0.5">
                       <span className="text-[9px] font-black bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded uppercase">{c.id}</span>
                       <p className="font-semibold text-sm text-gray-800 truncate max-w-[200px]">{c.title}</p>
                    </div>
                    <p className="text-[10px] text-indigo-400 italic font-medium truncate max-w-[250px]">{c.aiSummary}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full border shadow-sm ${c.status === ComplaintStatus.RESOLVED ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100">
                      Audit
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="py-24 text-center text-gray-300 font-bold opacity-50">No requests in queue. Everything is running smoothly!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit & Control Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row border border-white/20">
            <div className="bg-slate-50 md:w-1/3 p-8 border-r overflow-y-auto">
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-2xl text-indigo-600 shadow-xl border border-indigo-50 font-bold uppercase">
                  {selected.citizenName.charAt(0)}
                </div>
                <span className="text-[10px] font-black bg-indigo-900 text-white px-3 py-1 rounded-full uppercase tracking-widest">{selected.id}</span>
              </div>
              
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b pb-2">Verified Profile</h4>
              
              <div className="space-y-6">
                <div><p className="text-[10px] font-bold text-indigo-300 uppercase mb-1">Name</p><p className="font-bold text-slate-800">{selected.citizenName}</p></div>
                <div><p className="text-[10px] font-bold text-indigo-300 uppercase mb-1">Mobile</p><p className="font-bold text-slate-800">{selected.citizenMobile}</p></div>
                <div><p className="text-[10px] font-bold text-indigo-300 uppercase mb-1">Incident Area</p><p className="font-bold text-slate-800">{selected.location}</p></div>
                <div className="bg-white p-4 rounded-xl shadow-sm"><p className="text-[10px] font-bold text-indigo-300 uppercase mb-1">Audit Entry</p><p className="font-medium text-slate-500 text-[11px]">{new Date(selected.createdAt).toLocaleString()}</p></div>
              </div>

              <div className="mt-8 p-6 bg-indigo-950 text-white rounded-[1.5rem] shadow-xl relative overflow-hidden">
                <p className="text-[9px] font-black uppercase opacity-50 tracking-[0.2em] mb-4">AI Triage Data</p>
                <p className="text-xs font-medium leading-relaxed italic">"{selected.aiSummary}"</p>
              </div>
            </div>

            <div className="flex-1 p-8 overflow-y-auto flex flex-col bg-white">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-3xl font-black text-slate-800 tracking-tight">{selected.title}</h3>
                  <div className="flex gap-2 mt-2">
                    <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-1 rounded-lg uppercase border border-slate-200">{selected.department} DEPARTMENT</span>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="w-10 h-10 bg-slate-100 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-all"><i className="fa-solid fa-xmark text-xl"></i></button>
              </div>
              
              <div className="flex-1 space-y-8">
                <div className="bg-slate-50 border border-slate-100 rounded-[1.5rem] p-8 relative">
                   <p className="text-slate-700 leading-loose text-sm font-medium">"{selected.description}"</p>
                </div>

                <div>
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex justify-between items-center">
                    Media Proofs 
                    <span className="text-[9px] text-gray-300 normal-case italic font-medium">Intake from citizen device</span>
                  </h5>
                  <div className="grid grid-cols-3 gap-4">
                    {selected.media?.images?.map((url, i) => (
                      <div key={i} className="aspect-video bg-slate-100 rounded-2xl overflow-hidden border shadow-sm">
                        <img src={url} alt="Grievance Proof" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {(!selected.media?.images || selected.media.images.length === 0) && (
                      <div className="col-span-3 py-10 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-slate-200">
                         <i className="fa-solid fa-camera text-3xl mb-2 opacity-30"></i>
                         <p className="text-[10px] font-black">No Photos Attached</p>
                      </div>
                    )}
                  </div>
                  {selected.media?.audio && (
                    <div className="mt-4 p-4 bg-indigo-50 rounded-2xl flex items-center gap-4 border border-indigo-100">
                       <i className="fa-solid fa-microphone-lines text-indigo-600"></i>
                       <audio src={selected.media.audio} controls className="flex-1 h-8" />
                    </div>
                  )}
                </div>

                <div className="pt-8 border-t space-y-6">
                   <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update Resolution Stage</h5>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {statusOptions.map(opt => {
                      const isCurrent = selected.status === opt;
                      return (
                        <button 
                          key={opt}
                          onClick={() => handleStatusUpdate(selected.id, opt)}
                          className={`py-4 px-4 rounded-2xl text-[10px] font-black transition-all border-2 flex flex-col gap-1 items-center justify-center text-center ${isCurrent ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl' : 'bg-white text-slate-500 border-slate-100 hover:border-indigo-200'}`}
                        >
                          {opt}
                          {isCurrent && <i className="fa-solid fa-circle-check text-sm mt-1"></i>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficialDashboard;
