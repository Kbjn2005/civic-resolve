
import React, { useState } from 'react';
import { UserRole, OfficialType } from '../types';

interface Props {
  onLogin: (role: UserRole, identifier: string, officialType?: OfficialType) => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
  const [mode, setMode] = useState<UserRole>(UserRole.CITIZEN);
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [officialType, setOfficialType] = useState<OfficialType>(OfficialType.AUTHORITY);
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden text-black border border-slate-200">
        <div className="flex border-b">
          <button 
            onClick={() => { setMode(UserRole.CITIZEN); setStep(1); }}
            className={`flex-1 py-5 font-bold transition-all ${mode === UserRole.CITIZEN ? 'text-indigo-600 border-b-4 border-indigo-600 bg-indigo-50/50' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <i className="fa-solid fa-user mr-2"></i> Citizen / குடிமகன்
          </button>
          <button 
            onClick={() => setMode(UserRole.OFFICIAL)}
            className={`flex-1 py-5 font-bold transition-all ${mode === UserRole.OFFICIAL ? 'text-indigo-600 border-b-4 border-indigo-600 bg-indigo-50/50' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <i className="fa-solid fa-user-tie mr-2"></i> Official / அதிகாரி
          </button>
        </div>

        <div className="p-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-slate-900 italic tracking-tighter uppercase">Civic Resolve</h2>
            <p className="text-slate-500 mt-2 font-medium">Public Works Resolution Portal</p>
          </div>

          {mode === UserRole.CITIZEN ? (
            <div className="space-y-6">
              {step === 1 ? (
                <>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Mobile Number / கைபேசி எண்</label>
                  <input 
                    type="tel" 
                    placeholder="+91 00000 00000"
                    className="w-full p-4 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 outline-none transition-all text-black font-semibold bg-white"
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                  />
                  <button 
                    disabled={!mobile}
                    onClick={() => setStep(2)}
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all disabled:opacity-30"
                  >
                    Send OTP / ஓடிபி அனுப்புக
                  </button>
                </>
              ) : (
                <>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Verify OTP / ஓடிபி-யை உள்ளிடவும்</label>
                  <input 
                    type="text" 
                    placeholder="1234"
                    maxLength={4}
                    className="w-full p-4 border-2 border-slate-100 rounded-2xl text-center text-2xl tracking-[1em] focus:border-indigo-600 outline-none font-bold text-black bg-white"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                  />
                  <button 
                    onClick={() => onLogin(UserRole.CITIZEN, mobile)}
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all"
                  >
                    Verify & Access
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Select Department / துறை</label>
              <select 
                className="w-full p-4 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 outline-none appearance-none bg-slate-50 font-semibold text-black"
                value={officialType}
                onChange={e => setOfficialType(e.target.value as OfficialType)}
              >
                {Object.values(OfficialType).map(type => (
                  <option key={type} value={type}>{type} Dept</option>
                ))}
              </select>
              <div className="relative">
                <input type="password" placeholder="Authorization Token" className="w-full p-4 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 outline-none font-semibold text-black bg-white" />
                <i className="fa-solid fa-shield-halved absolute right-5 top-5 text-slate-200"></i>
              </div>
              <button 
                onClick={() => onLogin(UserRole.OFFICIAL, `OFF-${officialType}`, officialType)}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all"
              >
                Login Authorized
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
