/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, UserContext, VideoQuality, Feedback } from './types';
import { generateTextImage, generateTextVideo, generateStyleSuggestion, generateAmbientSound, classifyContext, validatePromptSafety } from './services/geminiService';
import { getRandomStyle, fileToBase64, TYPOGRAPHY_SUGGESTIONS, AUDIO_MOODS, createGifFromVideo, createAudioBufferFromPCM } from './utils';
import { Loader2, Paintbrush, Play, ExternalLink, Type, Sparkles, Image as ImageIcon, X, Upload, Download, FileType, Wand2, Volume2, VolumeX, ChevronLeft, ChevronRight, ArrowLeft, Video as VideoIcon, Key, Pause, Maximize, Music, Camera, Info, Copy, Check, Palette, Code, Share2, AlertTriangle, Captions, Volume1, MessageSquarePlus, ThumbsUp, ThumbsDown, Send, ShieldCheck, UserCircle, Briefcase, Globe, Monitor, Settings2, LayoutTemplate, Film, FileImage, Music2, Mic } from 'lucide-react';

// -- Components --

const Concierge: React.FC<{ onComplete: (ctx: UserContext) => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<UserContext>({
    role: '', task: '', env: '', risk: 'Low', domain: 'General'
  });

  const handleNext = async () => {
    if (step === 1) {
      setLoading(true);
      const res = await classifyContext(context.role, context.task, context.env);
      setContext(prev => ({ ...prev, ...res }));
      setLoading(false);
      setStep(2);
    } else {
      onComplete(context);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-500 font-sans">
      <div className="w-full max-w-2xl bg-zinc-900/80 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl ring-1 ring-white/5">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
           <ShieldCheck size={200} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl flex items-center justify-center text-black shadow-lg shadow-orange-500/20">
              <ShieldCheck size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter font-display">SYSTEM ACCESS</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"/>
                <p className="text-zinc-400 text-xs font-mono uppercase tracking-widest">Protocol Step {step} / 2</p>
              </div>
            </div>
          </div>

          {step === 1 ? (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2"><Briefcase size={14} className="text-amber-500"/> Primary Role</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Engineer', 'Product', 'Ops', 'Exec', 'Research'].map(r => (
                    <button 
                      key={r} 
                      onClick={() => setContext({...context, role: r as any})} 
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border ${context.role === r ? 'bg-white text-black border-white shadow-lg scale-[1.02]' : 'bg-zinc-800/50 text-zinc-400 border-white/5 hover:bg-zinc-800 hover:border-white/10'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2"><LayoutTemplate size={14} className="text-amber-500"/> Intended Task</label>
                <div className="grid grid-cols-2 gap-3">
                  {['CodeGen', 'Analysis', 'Writing', 'Agentic Workflow'].map(t => (
                    <button 
                      key={t} 
                      onClick={() => setContext({...context, task: t as any})} 
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border ${context.task === t ? 'bg-white text-black border-white shadow-lg scale-[1.02]' : 'bg-zinc-800/50 text-zinc-400 border-white/5 hover:bg-zinc-800 hover:border-white/10'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2"><Globe size={14} className="text-amber-500"/> Target Environment</label>
                <div className="flex gap-3">
                  {['Experimentation', 'Staging', 'Production'].map(e => (
                    <button 
                      key={e} 
                      onClick={() => setContext({...context, env: e as any})} 
                      className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border ${context.env === e ? 'bg-white text-black border-white shadow-lg scale-[1.02]' : 'bg-zinc-800/50 text-zinc-400 border-white/5 hover:bg-zinc-800 hover:border-white/10'}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
              <div className="p-1 bg-gradient-to-br from-zinc-700/50 to-zinc-900/50 rounded-2xl border border-white/10">
                <div className="bg-zinc-900/90 rounded-xl p-6 backdrop-blur-sm">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <ShieldCheck className="text-green-500"/> Governance Profile
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                      <p className="text-xs text-zinc-500 uppercase font-bold mb-1.5">Detected Domain</p>
                      <p className="text-amber-500 font-mono text-lg">{context.domain}</p>
                    </div>
                    <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                      <p className="text-xs text-zinc-500 uppercase font-bold mb-1.5">Risk Assessment</p>
                      <div className="flex items-center gap-2">
                         <span className={`w-2 h-2 rounded-full ${context.risk === 'High' ? 'bg-red-500' : 'bg-green-500'}`} />
                         <p className={`font-mono text-lg ${context.risk === 'High' ? 'text-red-500' : 'text-green-500'}`}>{context.risk}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 space-y-3 pt-6 border-t border-white/5">
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-green-500" /> Safety Gates</span>
                      <span className="text-white font-mono">ONLINE</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span className="flex items-center gap-2"><Monitor size={14} className="text-green-500" /> Policy Enforcement</span>
                      <span className="text-white font-mono">ACTIVE</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-zinc-500 text-sm text-center">
                Session bound to <strong className="text-zinc-300">Gemini 3 Pro</strong>. All actions logged.
              </p>
            </div>
          )}

          <button 
            disabled={step === 1 && (!context.role || !context.task || !context.env)}
            onClick={handleNext}
            className="w-full mt-10 py-4 bg-white text-black font-black text-sm rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:hover:bg-white uppercase tracking-widest shadow-xl shadow-white/5"
          >
            {loading ? <Loader2 className="animate-spin" /> : step === 1 ? 'Analyze & Configure' : 'Initialize Session'}
          </button>
        </div>
      </div>
    </div>
  );
};

// -- Main App --

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [viewMode, setViewMode] = useState<'gallery' | 'create'>('gallery');
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [showEmbedDialog, setShowEmbedDialog] = useState(false);
  const [userContext, setUserContext] = useState<UserContext | null>(null);

  const [inputText, setInputText] = useState<string>("");
  const [inputStyle, setInputStyle] = useState<string>("");
  const [soundStyle, setSoundStyle] = useState<string>(""); // Empty string means "Auto"
  const [quality, setQuality] = useState<VideoQuality>('720p');
  const [showCaptions, setShowCaptions] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>({ rating: null, comment: '', submitted: false });
  
  const [loadingPhase, setLoadingPhase] = useState<string>("");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [embedCode, setEmbedCode] = useState<string>("");
  const [isGifLoading, setIsGifLoading] = useState(false);

  const [statusMessage, setStatusMessage] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const handleMainCta = async () => {
    const isKeySelected = await window.aistudio?.hasSelectedApiKey();
    if (!isKeySelected) {
      setShowKeyDialog(true);
    } else {
      setState(AppState.ONBOARDING);
    }
  };

  const onOnboardingComplete = (ctx: UserContext) => {
    setUserContext(ctx);
    setViewMode('create');
    setState(AppState.IDLE);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setStatusMessage("Validating safety...");
    const safety = await validatePromptSafety(inputText + " " + inputStyle);
    if (!safety.safe) {
       alert(`Prompt Blocked by Governance: ${safety.reason}`);
       return;
    }

    setImageSrc(null);
    setVideoSrc(null);
    setAudioBuffer(null);
    setFeedback({ rating: null, comment: '', submitted: false });
    
    setState(AppState.GENERATING_IMAGE);
    setLoadingPhase("Dreaming up concepts...");

    try {
      const styleToUse = inputStyle || getRandomStyle();
      const { data: imgData, mimeType: imgMime } = await generateTextImage({
        text: inputText,
        style: styleToUse,
        resolution: quality === '1080p' ? '4K' : '1080p'
      });
      const base64Image = `data:${imgMime};base64,${imgData}`;
      setImageSrc(base64Image);

      setState(AppState.GENERATING_VIDEO);
      setLoadingPhase("Rendering physics & motion...");
      
      const vUrl = await generateTextVideo(inputText, imgData, imgMime, styleToUse, quality);
      setVideoSrc(vUrl);

      setLoadingPhase("Composing audio track...");
      // Use soundStyle if selected, otherwise fallback to visual style
      const audioPrompt = soundStyle || styleToUse;
      const audioData = await generateAmbientSound(inputText, audioPrompt);
      
      if (audioData) {
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          audioContextRef.current = ctx;
          const decoded = createAudioBufferFromPCM(ctx, audioData);
          setAudioBuffer(decoded);
        } catch (audioErr) {
          console.error("Audio processing failed", audioErr);
        }
      }

      setState(AppState.PLAYING);
    } catch (error) {
      console.error(error);
      setState(AppState.ERROR);
      setStatusMessage("Generation failed. Please try again.");
    }
  };

  const handleEmbedGenerate = async () => {
    if (!videoSrc) return;
    try {
      const blob = await fetch(videoSrc).then(r => r.blob());
      const base64Video = await fileToBase64(blob as File);
      
      const code = `
<!-- Type Motion Embed -->
<div style="max-width: 600px; border-radius: 12px; overflow: hidden; font-family: sans-serif; background: #000; position: relative;">
  <video controls autoplay loop muted playsinline style="width: 100%; display: block;" src="${base64Video}"></video>
  <div style="padding: 12px; color: white; background: #111; display: flex; justify-content: space-between; align-items: center;">
    <span style="font-weight: bold; font-size: 14px;">${inputText}</span>
    <span style="font-size: 10px; opacity: 0.7;">Generative Video</span>
  </div>
</div>`.trim();
      
      setEmbedCode(code);
      setShowEmbedDialog(true);
    } catch (e) {
      alert("Failed to generate embed code.");
    }
  };

  const handleGifDownload = async () => {
    if (!videoSrc) return;
    setIsGifLoading(true);
    try {
        const gifBlob = await createGifFromVideo(videoSrc);
        const url = URL.createObjectURL(gifBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `typemotion-${Date.now()}.gif`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch(e) {
        console.error(e);
        alert("GIF creation failed. Please try again.");
    } finally {
        setIsGifLoading(false);
    }
  };

  const playAudio = () => {
    if (audioContextRef.current && audioBuffer) {
      if (audioSourceRef.current) audioSourceRef.current.stop();
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.start(0);
      audioSourceRef.current = source;
    }
  };

  const LoadingView = () => (
    <div className="flex flex-col items-center justify-center h-full w-full space-y-12 animate-in fade-in zoom-in duration-500">
      <div className="relative group">
        <div className="absolute inset-0 bg-amber-500/20 blur-[80px] rounded-full animate-pulse" />
        <div className="relative z-10 w-32 h-32 rounded-full border border-amber-500/30 flex items-center justify-center bg-black/50 backdrop-blur-md shadow-2xl shadow-amber-900/20">
           {/* Animated Orbiting Ring */}
           <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-amber-500 animate-spin opacity-50"></div>
           <div className="absolute inset-2 rounded-full border-b-2 border-l-2 border-orange-500 animate-spin duration-3000 opacity-50"></div>
           <Loader2 size={48} className="text-amber-500 animate-spin" />
        </div>
      </div>
      
      <div className="text-center space-y-4 relative z-10 max-w-sm px-4">
        <h3 className="text-3xl font-black text-white tracking-tighter font-display uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-500 animate-pulse">
            {loadingPhase}
        </h3>
        <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest border border-zinc-800 rounded-full py-1.5 px-4 inline-block bg-black/40">
           <Sparkles size={10} className="inline mr-2 text-amber-500"/>
           Rendering on {quality === '1080p' ? 'Veo High Fidelity' : 'Veo Standard'}
        </p>
      </div>
      
      {/* Enhanced Progress Steps */}
      <div className="flex gap-4 mt-8">
        {[
          { label: 'Concept', active: state === AppState.GENERATING_IMAGE || state === AppState.GENERATING_VIDEO, icon: Brain },
          { label: 'Motion', active: state === AppState.GENERATING_VIDEO, icon: Film },
          { label: 'Audio', active: state === AppState.PLAYING, icon: Music2 }
        ].map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-3 relative group">
            {i < 2 && <div className={`absolute top-4 left-1/2 w-full h-0.5 -z-10 transition-colors duration-1000 ${s.active ? 'bg-amber-500/50' : 'bg-zinc-800'}`} style={{width: 'calc(100% + 1rem)'}} />}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${s.active ? 'bg-amber-500 border-amber-500 text-black scale-110 shadow-lg shadow-amber-500/20' : 'bg-zinc-900 border-zinc-700 text-zinc-600'}`}>
                {s.active ? <Check size={16} strokeWidth={4} /> : <div className="w-2 h-2 rounded-full bg-zinc-700"/>}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-500 ${s.active ? 'text-amber-500' : 'text-zinc-700'}`}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // Helper for step icons
  const Brain = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>;


  return (
    <div className="w-full h-screen bg-black text-white overflow-hidden font-sans flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
       {state === AppState.ONBOARDING && <Concierge onComplete={onOnboardingComplete} />}
       
       {/* Embed Dialog */}
       {showEmbedDialog && (
         <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-white font-bold flex items-center gap-2 font-display text-xl"><Code size={20} className="text-amber-500"/> Embed Code</h3>
               <button onClick={() => setShowEmbedDialog(false)} className="text-zinc-500 hover:text-white transition-colors"><X size={20}/></button>
             </div>
             <div className="bg-black p-4 rounded-xl border border-zinc-800 relative group">
               <code className="text-xs text-zinc-400 block h-40 overflow-y-auto break-all font-mono leading-relaxed">
                 {embedCode}
               </code>
               <div className="absolute top-2 right-2 flex gap-2">
                 <button 
                    onClick={() => navigator.clipboard.writeText(embedCode)}
                    className="bg-zinc-800 text-zinc-300 text-xs px-3 py-1.5 rounded-lg hover:bg-white hover:text-black flex items-center gap-1.5 font-bold transition-all"
                 >
                   <Copy size={12} /> Copy Snippet
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}

       {/* Navbar */}
       {viewMode === 'create' && (
         <header className="h-16 border-b border-white/5 bg-zinc-950/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
           <div className="flex items-center gap-3 group cursor-default">
             <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center font-bold text-black text-xs shadow-lg shadow-orange-900/20 group-hover:scale-105 transition-transform">TM</div>
             <span className="font-bold text-white tracking-tight font-display text-lg">Type Motion</span>
           </div>
           {userContext && (
             <div className="hidden md:flex items-center gap-6 text-xs text-zinc-500 font-mono border-l border-white/5 pl-6">
               <span className="flex items-center gap-2"><Briefcase size={14}/> {userContext.role}</span>
               <span className="flex items-center gap-2"><Monitor size={14}/> {userContext.env}</span>
             </div>
           )}
           <button onClick={handleMainCta} className="md:hidden text-zinc-400 hover:text-white"><Settings2 size={20}/></button>
         </header>
       )}

       {viewMode === 'gallery' ? (
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-black overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none"></div>
            
            <div className="relative z-10 text-center space-y-8 animate-in fade-in zoom-in duration-1000 px-4">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-mono text-zinc-400 uppercase tracking-widest backdrop-blur-sm mb-4">
                 <Sparkles size={10} className="text-amber-500" /> Powered by Gemini 3 Pro
               </div>
               <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter font-display">
                 TYPE <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-red-500">MOTION</span>
               </h1>
               <p className="text-zinc-400 text-lg md:text-xl max-w-xl mx-auto font-light leading-relaxed">
                 Transform simple text into cinematic 3D motion graphics. <br className="hidden md:block"/> No 3D software required.
               </p>
               <button onClick={handleMainCta} className="group relative px-10 py-5 bg-white text-black font-bold text-lg rounded-full hover:scale-105 transition-all shadow-[0_0_60px_rgba(255,255,255,0.2)] flex items-center gap-3 mx-auto mt-8">
                 <span className="tracking-wide">INITIALIZE CREATOR</span>
                 <ChevronRight size={20} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>
       ) : (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
            
            {/* Sidebar Controls */}
            <div className="w-full md:w-[420px] bg-zinc-950 border-r border-white/5 p-6 flex flex-col gap-8 overflow-y-auto z-40 shadow-2xl md:shadow-none">
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2"><Type size={14} className="text-amber-500"/> Core Prompt</label>
                  </div>
                  <div className="relative group">
                    <textarea 
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      placeholder="e.g. 'NEON CITY' or 'LIQUID GOLD'"
                      className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all resize-none h-32 text-2xl font-black font-display tracking-tight"
                    />
                    <div className="absolute bottom-4 right-4 text-[10px] text-zinc-600 font-mono uppercase">
                       {inputText.length} chars
                    </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2"><Paintbrush size={14} className="text-amber-500"/> Art Direction</label>
                  <input 
                    type="text"
                    value={inputStyle}
                    onChange={e => setInputStyle(e.target.value)}
                    placeholder="Describe the look..."
                    className="w-full bg-zinc-900/50 border border-white/10 rounded-xl p-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm mb-3"
                  />
                  
                  {/* Expanded Typography Chips */}
                  <div className="grid grid-cols-2 gap-2 h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                     {TYPOGRAPHY_SUGGESTIONS.map(s => (
                       <button 
                          key={s.id} 
                          onClick={() => setInputStyle(s.prompt)} 
                          className={`text-xs px-3 py-2 rounded-lg transition-all border text-left flex flex-col gap-1 ${inputStyle === s.prompt ? 'bg-amber-500 text-black border-amber-500' : 'bg-zinc-900 text-zinc-400 border-white/5 hover:border-white/20 hover:text-white hover:bg-zinc-800'}`}
                       >
                         <span className="font-bold">{s.label}</span>
                       </button>
                     ))}
                  </div>
               </div>

               {/* New Soundscape Selection */}
               <div className="space-y-4">
                 <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2"><Music2 size={14} className="text-amber-500"/> Soundscape</label>
                 <div className="grid grid-cols-2 gap-2">
                    {AUDIO_MOODS.map(m => (
                       <button 
                          key={m.id}
                          onClick={() => setSoundStyle(m.prompt)}
                          className={`text-xs px-3 py-2 rounded-lg transition-all border ${soundStyle === m.prompt ? 'bg-zinc-100 text-black border-white' : 'bg-zinc-900/50 text-zinc-500 border-white/5 hover:text-zinc-300'}`}
                       >
                         {m.label}
                       </button>
                    ))}
                 </div>
               </div>

               <div className="space-y-4">
                 <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-2"><Settings2 size={14} className="text-amber-500"/> Output Quality</span>
                 </label>
                 <div className="grid grid-cols-2 bg-zinc-900/50 p-1 rounded-xl border border-white/5">
                    <button 
                      onClick={() => setQuality('720p')}
                      className={`py-2.5 text-xs font-bold rounded-lg transition-all ${quality === '720p' ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-white/10' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      Fast (720p)
                    </button>
                    <button 
                      onClick={() => setQuality('1080p')}
                      className={`py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${quality === '1080p' ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-black shadow-lg shadow-orange-900/20' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      High Res <Sparkles size={10} fill="black" />
                    </button>
                 </div>
               </div>

               <div className="flex-1" />

               <button 
                 onClick={startProcess}
                 disabled={state === AppState.GENERATING_IMAGE || state === AppState.GENERATING_VIDEO}
                 className="w-full py-5 bg-white text-black font-black text-sm rounded-2xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50 tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.1)] group"
               >
                 {state === AppState.GENERATING_IMAGE || state === AppState.GENERATING_VIDEO ? (
                   <><Loader2 className="animate-spin" size={18}/> PROCESSING ASSETS</>
                 ) : (
                   <><Play size={18} fill="currentColor" className="group-hover:scale-110 transition-transform"/> GENERATE SEQUENCE</>
                 )}
               </button>
            </div>

            {/* Main Preview Stage */}
            <div className="flex-1 bg-black relative flex items-center justify-center p-4 md:p-12 overflow-hidden">
               {/* Grid Background */}
               <div className="absolute inset-0 opacity-20" 
                    style={{ 
                      backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', 
                      backgroundSize: '100px 100px' 
                    }} 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none" />

               {state === AppState.IDLE && (
                 <div className="flex flex-col items-center gap-6 opacity-30 select-none">
                    <div className="w-24 h-24 rounded-3xl border-2 border-dashed border-zinc-700 flex items-center justify-center">
                       <Play size={40} className="text-zinc-700" fill="currentColor" />
                    </div>
                    <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">Preview Stage Ready</p>
                 </div>
               )}

               {(state === AppState.GENERATING_IMAGE || state === AppState.GENERATING_VIDEO) && (
                 <LoadingView />
               )}

               {state === AppState.PLAYING && videoSrc && (
                 <div className="relative w-full max-w-5xl aspect-video bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden group animate-in zoom-in-95 duration-500 border border-white/10 ring-1 ring-white/5">
                    <video 
                      ref={videoRef}
                      src={videoSrc}
                      className="w-full h-full object-cover"
                      autoPlay
                      loop
                      playsInline
                      onPlay={playAudio}
                    />

                    {/* Captions Overlay */}
                    {showCaptions && (
                      <div className="absolute bottom-24 left-0 right-0 text-center px-8 pointer-events-none">
                        <span className="bg-black/70 text-white px-6 py-3 rounded-full text-xl font-medium backdrop-blur-md border border-white/10 shadow-lg inline-block animate-in slide-in-from-bottom-2">
                          {inputText}
                        </span>
                      </div>
                    )}

                    {/* Minimal Controls Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6 md:p-8">
                       <div className="flex items-end justify-between">
                         <div className="flex items-center gap-5">
                            <button onClick={() => { if(videoRef.current) videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause() }} className="p-4 bg-white text-black rounded-full hover:scale-110 hover:bg-zinc-200 transition-all shadow-lg shadow-white/10">
                              <Play size={24} fill="currentColor" />
                            </button>
                            <div className="space-y-1">
                               <h3 className="text-white font-bold text-2xl font-display tracking-tight">{inputText}</h3>
                               <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-wider font-mono">
                                 <span className="bg-white/10 px-2 py-0.5 rounded text-white">{quality}</span>
                                 <span>•</span>
                                 <span>{inputStyle ? 'Custom Style' : 'Auto-Style'}</span>
                               </div>
                            </div>
                         </div>
                         
                         <div className="flex items-center gap-3">
                           {/* GIF Download Button */}
                           <button 
                             onClick={handleGifDownload}
                             disabled={isGifLoading}
                             className={`p-3 rounded-xl backdrop-blur-md border border-white/10 transition-all ${isGifLoading ? 'bg-amber-500 text-black animate-pulse' : 'bg-black/60 text-white hover:bg-white/10'}`}
                             title="Download as GIF"
                           >
                             {isGifLoading ? <Loader2 size={20} className="animate-spin" /> : <FileImage size={20} />}
                           </button>

                           <button 
                             onClick={() => setShowCaptions(!showCaptions)}
                             className={`p-3 rounded-xl backdrop-blur-md border border-white/10 transition-all ${showCaptions ? 'bg-amber-500 text-black border-amber-500' : 'bg-black/60 text-white hover:bg-white/10'}`}
                             title="Toggle Captions"
                           >
                             <Captions size={20} />
                           </button>

                           <button 
                             onClick={handleEmbedGenerate}
                             className="p-3 bg-black/60 text-white rounded-xl hover:bg-white/10 backdrop-blur-md border border-white/10 transition-all"
                             title="Get Embed Code"
                           >
                             <Code size={20} />
                           </button>

                           <a 
                             href={videoSrc} 
                             download={`typemotion-${Date.now()}.mp4`}
                             className="p-3 bg-white text-black rounded-xl hover:bg-zinc-200 backdrop-blur-md shadow-lg transition-all"
                           >
                             <Download size={20} />
                           </a>
                         </div>
                       </div>
                    </div>
                 </div>
               )}
            </div>
            
            {/* Feedback Float */}
            {state === AppState.PLAYING && (
              <div className="absolute top-6 right-6 z-50 animate-in slide-in-from-right-4">
                 {!feedback.submitted ? (
                   <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl w-72 space-y-4">
                      <div className="flex justify-between items-center">
                         <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Quality Feedback</p>
                         <div className="flex gap-2">
                            <button 
                              onClick={() => setFeedback({...feedback, rating: 'up'})}
                              className={`p-2 rounded-lg transition-all ${feedback.rating === 'up' ? 'bg-green-500 text-black' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
                            >
                              <ThumbsUp size={16} />
                            </button>
                            <button 
                              onClick={() => setFeedback({...feedback, rating: 'down'})}
                              className={`p-2 rounded-lg transition-all ${feedback.rating === 'down' ? 'bg-red-500 text-black' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
                            >
                              <ThumbsDown size={16} />
                            </button>
                         </div>
                      </div>
                      
                      {feedback.rating && (
                        <div className="animate-in fade-in slide-in-from-top-2 space-y-3 pt-2 border-t border-white/10">
                           <textarea 
                             className="w-full bg-zinc-900/50 text-white text-xs p-3 rounded-xl border border-white/10 focus:outline-none focus:border-amber-500/50 resize-none placeholder:text-zinc-600"
                             rows={2}
                             placeholder="How can we improve?"
                             value={feedback.comment}
                             onChange={e => setFeedback({...feedback, comment: e.target.value})}
                           />
                           <button 
                             onClick={() => setFeedback({...feedback, submitted: true})}
                             className="w-full py-2 bg-white text-black text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-zinc-200"
                           >
                             Submit Report
                           </button>
                        </div>
                      )}
                   </div>
                 ) : (
                   <div className="bg-green-500 text-black px-4 py-2 rounded-full font-bold text-xs shadow-xl flex items-center gap-2 animate-in fade-in zoom-in">
                      <Check size={14} strokeWidth={3} /> Review Logged
                   </div>
                 )}
              </div>
            )}
          </div>
       )}
    </div>
  );
};
export default App;