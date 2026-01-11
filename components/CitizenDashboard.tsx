
import React, { useState, useRef, useEffect } from 'react';
import { CitizenProfile, Complaint, ComplaintStatus } from '../types';
import { chatWithAssistant } from '../services/geminiService';

interface Props {
  profile: CitizenProfile;
  complaints: Complaint[];
  onSubmit: (title: string, desc: string, loc: string, media?: { images: string[], audio?: string }) => void;
  loading: boolean;
}

const CitizenDashboard: React.FC<Props> = ({ profile, complaints, onSubmit, loading }) => {
  const [tab, setTab] = useState<'history' | 'raise'>('history');
  const [form, setForm] = useState({ title: '', desc: '', loc: '' });
  const [media, setMedia] = useState<{ images: string[], audio?: string }>({ images: [] });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
    { role: 'bot', text: "Hello! I am your Civic Resolve Assistant. How can I help you today? / வணக்கம்! நான் உங்கள் சிவிக்-ரிசால்வ் உதவியாளர். நான் இன்று உங்களுக்கு எப்படி உதவ முடியும்?" }
  ]);
  const [isBotTyping, setIsBotTyping] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const stages = [
    ComplaintStatus.SUBMITTED,
    ComplaintStatus.CLASSIFIED,
    ComplaintStatus.ACCEPTED,
    ComplaintStatus.EN_ROUTE,
    ComplaintStatus.ONGOING,
    ComplaintStatus.RESOLVED
  ];

  const getStatusIndex = (status: ComplaintStatus) => stages.indexOf(status);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const urls = Array.from(e.target.files).map(file => URL.createObjectURL(file as File));
      setMedia(prev => ({ ...prev, images: [...prev.images, ...urls] }));
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMedia(prev => ({ ...prev, audio: URL.createObjectURL(e.target.files[0] as File) }));
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput("");
    setIsBotTyping(true);

    try {
      const response = await chatWithAssistant(userMsg, complaints);
      setChatMessages(prev => [...prev, { role: 'bot', text: response || "I'm sorry, I couldn't process that." }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'bot', text: "Service unavailable." }]);
    } finally {
      setIsBotTyping(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-slate-900">
      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setTab('raise')}
          className={`flex-1 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${tab === 'raise' ? 'bg-indigo-600 text-white shadow-xl scale-[1.02]' : 'bg-white text-indigo-600 border border-indigo-100 hover:bg-indigo-50'}`}
        >
          <i className="fa-solid fa-plus-circle text-xl"></i> Raise New Complaint
        </button>
        <button 
          onClick={() => setTab('history')}
          className={`flex-1 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${tab === 'history' ? 'bg-indigo-600 text-white shadow-xl scale-[1.02]' : 'bg-white text-indigo-600 border border-indigo-100 hover:bg-indigo-50'}`}
        >
          <i className="fa-solid fa-clock-rotate-left text-xl"></i> View My History
        </button>
      </div>

      <div>
        {tab === 'raise' ? (
          <div className="bg-white rounded-3xl shadow-sm border p-6 md:p-10 animate-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold mb-8 flex justify-between items-center text-slate-900 border-b pb-4">
              Submit Your Grievance
              <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full uppercase tracking-widest border border-indigo-100">
                District: {profile.district}
              </span>
            </h2>
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-3 uppercase tracking-wider">Describe the Problem / புகாரை விளக்கவும்</label>
                <textarea 
                  required
                  rows={6}
                  value={form.desc}
                  onChange={e => setForm({...form, desc: e.target.value})}
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 ring-indigo-50 outline-none transition-all text-lg text-black"
                  placeholder="Type in English or Tamil. Please maintain a polite tone..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-3 uppercase tracking-wider">Specific Location / இடம்</label>
                  <div className="relative">
                    <i className="fa-solid fa-map-pin absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input 
                      value={form.loc}
                      onChange={e => setForm({...form, loc: e.target.value})}
                      className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 ring-indigo-50 outline-none text-black"
                      placeholder="Street name, landmark..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-3 uppercase tracking-wider">Evidence / சான்றுகள்</label>
                  <div className="flex gap-3 h-full">
                    <input type="file" multiple accept="image/*" className="hidden" ref={imageInputRef} onChange={handleImageUpload} />
                    <input type="file" accept="audio/*" className="hidden" ref={audioInputRef} onChange={handleAudioUpload} />
                    
                    <button 
                      onClick={() => imageInputRef.current?.click()}
                      className={`flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-2xl transition-all ${media.images.length > 0 ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-400'}`}
                    >
                      <i className="fa-solid fa-camera text-2xl mb-2"></i>
                      <span className="text-[10px] font-black uppercase">{media.images.length > 0 ? `${media.images.length} Photos` : 'Add Photos'}</span>
                    </button>
                    <button 
                      onClick={() => audioInputRef.current?.click()}
                      className={`flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-2xl transition-all ${media.audio ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-400'}`}
                    >
                      <i className="fa-solid fa-microphone-lines text-2xl mb-2"></i>
                      <span className="text-[10px] font-black uppercase">{media.audio ? 'Audio Recorded' : 'Voice Note'}</span>
                    </button>
                  </div>
                </div>
              </div>
              <button 
                disabled={loading || !form.desc}
                onClick={() => { onSubmit(form.desc.slice(0, 30) + '...', form.desc, form.loc, media); setTab('history'); setForm({title:'',desc:'',loc:''}); setMedia({images:[]}); }}
                className="w-full bg-indigo-600 text-white py-6 rounded-3xl font-black text-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-4 disabled:opacity-50 shadow-2xl shadow-indigo-100 mt-4"
              >
                {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-shield-check"></i>}
                File Official Complaint
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 text-black">
            {complaints.length === 0 ? (
              <div className="bg-white rounded-[2rem] border-2 border-dashed p-24 text-center text-slate-300">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="fa-solid fa-folder-open text-5xl opacity-20 text-slate-400"></i>
                </div>
                <p className="text-lg font-medium text-slate-400">Your grievance history is empty.</p>
                <p className="text-sm text-slate-400">Start by reporting a problem in your local area.</p>
              </div>
            ) : complaints.map(c => (
              <div key={c.id} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 space-y-8 animate-in slide-in-from-bottom-4 transition-all hover:shadow-md hover:border-indigo-100 group">
                <div className="flex justify-between items-start flex-wrap gap-4 text-black">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                       <span className="text-[10px] font-black text-white bg-indigo-900 px-3 py-1 rounded-lg uppercase tracking-widest shadow-sm">{c.id}</span>
                       <h4 className="text-2xl font-bold text-slate-800 group-hover:text-indigo-900 transition-colors">{c.title}</h4>
                    </div>
                    <p className="text-slate-500 font-medium flex items-center gap-2">
                      <i className="fa-solid fa-location-arrow text-indigo-500"></i> {c.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-slate-100 text-slate-600 px-5 py-2 rounded-2xl text-xs font-black border border-slate-200 uppercase tracking-widest">
                      {c.department}
                    </span>
                  </div>
                </div>

                <div className="relative pt-10 pb-4 text-black">
                  <div className="overflow-x-auto no-scrollbar">
                    <div className="min-w-[700px] relative h-20 flex justify-between items-center px-4">
                      <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full"></div>
                      <div className="absolute top-1/2 left-0 h-1 bg-indigo-500 -translate-y-1/2 rounded-full transition-all duration-1000" style={{ width: `${(getStatusIndex(c.status) / (stages.length - 1)) * 100}%` }}></div>
                      {stages.map((s, idx) => {
                        const isActive = getStatusIndex(c.status) >= idx;
                        return (
                          <div key={s} className="flex flex-col items-center gap-3 relative z-10 group/stage">
                            <div className={`w-8 h-8 rounded-full border-4 transition-all duration-500 ${isActive ? 'bg-indigo-600 border-indigo-100 shadow-xl scale-110' : 'bg-white border-slate-100 shadow-sm'}`}>
                               {isActive && idx === getStatusIndex(c.status) && <div className="w-full h-full rounded-full animate-ping bg-indigo-400 opacity-20"></div>}
                            </div>
                            <span className={`text-[10px] font-black text-center w-24 leading-tight uppercase tracking-tighter transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-300'}`}>
                              {s}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50/50 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 border border-indigo-50 group-hover:bg-indigo-50 transition-colors">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100 group-hover:rotate-12 transition-transform">
                      <i className="fa-solid fa-brain-circuit text-2xl"></i>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">AI Automated Response</p>
                      <p className="text-slate-700 font-medium italic leading-relaxed">"{c.aiSummary}"</p>
                    </div>
                  </div>
                  {c.status === ComplaintStatus.RESOLVED && (
                    <div className="bg-emerald-600 text-white px-6 py-3 rounded-2xl text-xs font-black shadow-lg shadow-emerald-100 flex items-center gap-3 border-2 border-emerald-500 animate-in fade-in zoom-in">
                       <i className="fa-solid fa-certificate text-lg"></i> WORK COMPLETED
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Chatbot */}
      <div className="fixed bottom-8 right-8 z-50">
        {!isChatOpen ? (
          <button 
            onClick={() => setIsChatOpen(true)} 
            className="w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center text-3xl hover:scale-110 transition-all border-4 border-white active:scale-95 group"
          >
            <i className="fa-solid fa-comments group-hover:rotate-12 transition-transform text-white"></i>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full"></div>
          </button>
        ) : (
          <div className="bg-white w-[380px] h-[550px] rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10">
            <div className="bg-indigo-950 text-white p-6 flex justify-between items-center shadow-lg text-white">
              <div className="flex items-center gap-4 text-white">
                <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
                  <i className="fa-solid fa-robot-astromech text-lg text-white"></i>
                </div>
                <div>
                  <h4 className="font-black text-sm tracking-tight text-white uppercase italic">Civic Resolve Concierge</h4>
                  <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Neural Link Ready</p>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-white/30 hover:text-white transition-colors p-2"><i className="fa-solid fa-chevron-down text-white"></i></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-3xl text-xs font-medium leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isBotTyping && (
                <div className="flex justify-start">
                   <div className="bg-white p-4 rounded-3xl shadow-sm border flex gap-1.5">
                      <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce delay-150"></div>
                      <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce delay-300"></div>
                   </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-5 border-t bg-white">
              <div className="relative group">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Neural Link Interface... (Ask me anything)"
                  className="w-full pl-5 pr-14 py-4 bg-slate-100 border-none rounded-2xl text-xs font-medium focus:ring-2 ring-indigo-500 outline-none transition-all group-hover:bg-slate-200 text-black"
                />
                <button 
                  onClick={handleSendMessage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 shadow-lg active:scale-90 transition-all"
                >
                  <i className="fa-solid fa-paper-plane-top text-[10px] text-white"></i>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CitizenDashboard;
