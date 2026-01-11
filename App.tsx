
import React, { useState, useEffect } from 'react';
import { UserRole, User, OfficialType, Complaint, ComplaintStatus, CitizenProfile } from './types';
import Login from './components/Login';
import Onboarding from './components/Onboarding';
import CitizenDashboard from './components/CitizenDashboard';
import OfficialDashboard from './components/OfficialDashboard';
import { checkContent, classifyToDepartment } from './services/geminiService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [allComplaints, setAllComplaints] = useState<Complaint[]>([]);
  const [allUsers, setAllUsers] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Persistence: Load all data from localStorage
  useEffect(() => {
    const savedComplaints = localStorage.getItem('civic_resolve_all_complaints');
    const savedUsers = localStorage.getItem('civic_resolve_all_users');
    if (savedComplaints) setAllComplaints(JSON.parse(savedComplaints));
    if (savedUsers) setAllUsers(JSON.parse(savedUsers));
  }, []);

  // Sync data to localStorage
  useEffect(() => {
    localStorage.setItem('civic_resolve_all_complaints', JSON.stringify(allComplaints));
    localStorage.setItem('civic_resolve_all_users', JSON.stringify(allUsers));
  }, [allComplaints, allUsers]);

  const handleLogin = (role: UserRole, identifier: string, officialType?: OfficialType) => {
    if (role === UserRole.CITIZEN) {
      const existingUser = allUsers[identifier];
      if (existingUser) {
        setUser(existingUser);
      } else {
        const newUser: User = { id: identifier, role };
        setUser(newUser);
        setAllUsers(prev => ({ ...prev, [identifier]: newUser }));
      }
    } else {
      setUser({ id: `OFF-${officialType}-${Date.now()}`, role, officialType });
    }
  };

  const handleOnboarding = (profile: CitizenProfile) => {
    if (user) {
      const updatedUser = { ...user, profile };
      setUser(updatedUser);
      setAllUsers(prev => ({ ...prev, [user.id]: updatedUser }));
    }
  };

  const submitComplaint = async (title: string, desc: string, loc: string, media?: { images: string[], audio?: string }) => {
    if (!user || !user.profile) return;
    setLoading(true);
    try {
      const guard = await checkContent(desc);
      if (!guard.isSafe) {
        alert(`Content Rejected / உள்ளடக்கம் நிராகரிக்கப்பட்டது: ${guard.reason}`);
        return;
      }

      const classification = await classifyToDepartment(desc);
      const complaintId = `CMP-${Date.now()}`;
      const newComplaint: Complaint = {
        id: complaintId,
        citizenId: user.id,
        citizenName: user.profile.fullName,
        citizenMobile: user.profile.mobile,
        title,
        description: desc,
        location: loc,
        status: ComplaintStatus.SUBMITTED,
        department: classification.department as OfficialType,
        aiSummary: classification.summary,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        history: [{ status: ComplaintStatus.SUBMITTED, timestamp: Date.now() }],
        media
      };

      setAllComplaints(prev => [newComplaint, ...prev]);
      
      // AI Simulation of processing
      setTimeout(() => {
        updateComplaintStatus(complaintId, ComplaintStatus.CLASSIFIED);
      }, 3000);

    } finally {
      setLoading(false);
    }
  };

  const updateComplaintStatus = (id: string, nextStatus: ComplaintStatus) => {
    setAllComplaints(prev => prev.map(c => {
      if (c.id === id) {
        const isResolving = nextStatus === ComplaintStatus.RESOLVED && c.status !== ComplaintStatus.RESOLVED;
        if (isResolving) {
          // Official Alert
          alert(`IMPORTANT: Complaint ${c.id} has been RESOLVED by the department. A notification has been logged for citizen ${c.citizenName}.`);
        }
        return {
          ...c,
          status: nextStatus,
          updatedAt: Date.now(),
          history: [...c.history, { status: nextStatus, timestamp: Date.now() }]
        };
      }
      return c;
    }));
  };

  if (!user) return <Login onLogin={handleLogin} />;
  
  if (user.role === UserRole.CITIZEN && !user.profile) {
    return <Onboarding mobile={user.id} onComplete={handleOnboarding} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-slate-900">
      <nav className="bg-slate-900 text-white p-4 shadow-xl flex justify-between items-center sticky top-0 z-40 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
             <i className="fa-solid fa-landmark-flag text-xl text-white"></i>
          </div>
          <h1 className="text-xl font-black tracking-tighter uppercase italic text-white">
            Civic Resolve <span className="text-indigo-400 not-italic">AI</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4 relative">
          {user.role === UserRole.OFFICIAL && (
             <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Authorized Personnel</span>
                <span className="text-xs font-bold text-white">{user.officialType} Department</span>
             </div>
          )}
          
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center border-2 border-slate-700 hover:bg-slate-700 transition-all shadow-lg overflow-hidden group"
          >
            {user.profile ? (
              <span className="font-black text-lg text-white group-hover:scale-110 transition-transform">{user.profile.fullName.charAt(0)}</span>
            ) : (
              <i className="fa-solid fa-user-shield text-xl text-white"></i>
            )}
          </button>

          {/* Profile Details Dropdown */}
          {showProfile && (
            <>
              <div className="fixed inset-0 z-[-1]" onClick={() => setShowProfile(false)}></div>
              <div className="absolute right-0 top-16 w-80 bg-white text-slate-800 rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-4">
                <div className="p-6 bg-slate-50 border-b flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl font-bold">
                    {user.profile?.fullName.charAt(0) || <i className="fa-solid fa-user-lock"></i>}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verified Account</p>
                    <p className="font-black text-slate-900 leading-tight">{user.profile?.fullName || user.officialType}</p>
                  </div>
                </div>
                <div className="p-6 space-y-5">
                  {user.profile ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div><p className="text-[10px] font-black text-indigo-400 uppercase mb-1">District</p><p className="text-xs font-bold text-slate-700">{user.profile.district}</p></div>
                      <div><p className="text-[10px] font-black text-indigo-400 uppercase mb-1">D.O.B</p><p className="text-xs font-bold text-slate-700">{user.profile.dob}</p></div>
                      <div className="col-span-2"><p className="text-[10px] font-black text-indigo-400 uppercase mb-1">Mobile Contact</p><p className="text-xs font-bold text-slate-700">{user.profile.mobile}</p></div>
                      <div className="col-span-2"><p className="text-[10px] font-black text-indigo-400 uppercase mb-1">Aadhar Identity</p><p className="text-xs font-bold text-slate-700 tracking-widest">XXXX-XXXX-{user.profile.aadhar.slice(-4)}</p></div>
                      <div className="col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Registered Address</p>
                        <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{user.profile.address}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 text-slate-900">
                      <p className="text-xs font-bold italic">"Official session logged for department management."</p>
                    </div>
                  )}
                  <button 
                    onClick={() => { setUser(null); setShowProfile(false); }}
                    className="w-full mt-4 py-4 bg-rose-50 text-rose-600 rounded-[1.2rem] text-xs font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all border border-rose-100 flex items-center justify-center gap-3"
                  >
                    <i className="fa-solid fa-power-off"></i> Secure Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {user.role === UserRole.CITIZEN ? (
          <CitizenDashboard 
            profile={user.profile!} 
            complaints={allComplaints.filter(c => c.citizenId === user.id)}
            onSubmit={submitComplaint}
            loading={loading}
          />
        ) : (
          <OfficialDashboard 
            user={user}
            complaints={allComplaints}
            onUpdate={updateComplaintStatus}
          />
        )}
      </main>
    </div>
  );
};

export default App;
