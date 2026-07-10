import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const COUNTRIES_LIST = [
  "Australia", "Canada", "China", "France", "Germany", "India", 
  "Indonesia", "Japan", "Malaysia", "New Zealand", "Philippines", 
  "Singapore", "South Korea", "Spain", "Taiwan", "Thailand", 
  "United Kingdom", "United States", "Vietnam"
].sort();

export default function UserProfileModal({ isOpen, onClose }) {
  // Live Internal Auth Tracking
  const [activeId, setActiveId] = useState(null);
  const [activeEmail, setActiveEmail] = useState(null);

  // Profile fields Data
  const [name, setName] = useState('Guest');
  const [country, setCountry] = useState('');
  const [highScore, setHighScore] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  // Internal Form Toggles
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  // 🔄 CORE MIGRATION ENGINE: Merges Guest data into Authenticated Profiles
  const migrateGuestProfile = async (newUid, newEmail) => {
    const cachedGuestId = localStorage.getItem('pre_auth_guest_id');
    if (!cachedGuestId || cachedGuestId === newUid) return;

    try {
      // 1. Download data from your old unlogged/guest profile slot
      const { data: guestProfile } = await supabase
        .from('players')
        .select('*')
        .eq('id', cachedGuestId)
        .maybeSingle();

      if (guestProfile) {
        // 2. Fetch or initialize the permanent profile slot data
        const { data: permProfile } = await supabase
          .from('players')
          .select('*')
          .eq('id', newUid)
          .maybeSingle();

        // 3. Compare values and pick the best achievements so nothing is wasted
        const finalScore = Math.max(guestProfile.score || 0, permProfile?.score || 0);
        const finalAttempts = (guestProfile.attempts || 0) + (permProfile?.attempts || 0);
        
        const finalName = permProfile?.name && permProfile.name !== 'Runner' && permProfile.name !== 'Guest'
          ? permProfile.name
          : (guestProfile.name !== 'Guest' ? guestProfile.name : 'Runner');

        const finalCountry = permProfile?.country || guestProfile.country || '';

        // 4. Write unified data to the verified cloud account
        await supabase
          .from('players')
          .upsert({
            id: newUid,
            email: newEmail,
            score: finalScore,
            attempts: finalAttempts,
            name: finalName,
            country: finalCountry
          }, { onConflict: 'id' });

        // 5. Safely drop old guest row structure to clean up database space
        await supabase.from('players').delete().eq('id', cachedGuestId);
        console.log("🚀 Guest run data successfully merged into cloud account!");
      }
    } catch (err) {
      console.error("Profile migration sequence failed:", err);
    } finally {
      localStorage.removeItem('pre_auth_guest_id');
    }
  };

  // Live Auth State Sync & Interceptor Hook
  useEffect(() => {
    if (!isOpen) return;

    const syncAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setActiveId(session.user.id);
        setActiveEmail(session.user.email || null);

        if (session.user.is_anonymous) {
          // Track this ID so we don't lose it on sign-in/redirect triggers
          localStorage.setItem('pre_auth_guest_id', session.user.id);
        } else {
          // User is fully authenticated, execute migration sweep immediately
          await migrateGuestProfile(session.user.id, session.user.email);
        }
        fetchProfile(session.user.id);
      }
    };
    
    syncAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setActiveId(session.user.id);
        setActiveEmail(session.user.email || null);

        if (session.user.is_anonymous) {
          localStorage.setItem('pre_auth_guest_id', session.user.id);
        } else {
          await migrateGuestProfile(session.user.id, session.user.email);
        }
        fetchProfile(session.user.id);
      } else {
        setActiveId(null);
        setActiveEmail(null);
        setName('Guest');
        setCountry('');
        setHighScore(0);
      }
    });

    return () => subscription.unsubscribe();
  }, [isOpen]);

  const fetchProfile = async (uid) => {
    const { data } = await supabase
      .from('players')
      .select('name, country, score')
      .eq('id', uid)
      .maybeSingle();

    if (data) {
      setName(data.name || 'Guest');
      setCountry(data.country || '');
      setHighScore(data.score || 0);
    }
  };

  if (!isOpen) return null;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!activeId) return;
    setIsSaving(true);
    setProfileMessage('');

    try {
      const { error } = await supabase
        .from('players')
        .update({ name, country })
        .eq('id', activeId);

      if (error) throw error;
      setProfileMessage('✅ Profile updated!');
      setTimeout(() => setProfileMessage(''), 2500);
    } catch (err) {
      console.error(err);
      setProfileMessage('❌ Save failed.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Snapshot current guest ID right before the Google redirect wipes our browser window context
      if (activeId) {
        localStorage.setItem('pre_auth_guest_id', activeId);
      }
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
    } catch (err) {
      alert(`Google Connection Error: ${err.message}`);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return alert("Please specify valid credentials.");

    try {
      if (activeId) {
        localStorage.setItem('pre_auth_guest_id', activeId);
      }

      if (authMode === 'link') {
        const { data, error } = await supabase.auth.updateUser({
          email: authEmail,
          password: authPassword
        });
        if (error) throw error;
        if (data?.user) {
          await migrateGuestProfile(data.user.id, data.user.email);
          alert("Progress linked successfully!");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword
        });
        if (error) throw error;
        alert("Welcome back, Runner!");
      }
    } catch (err) {
      alert(`Auth Error: ${err.message}`);
    }
  };

  return (
    <div className="absolute inset-0 bg-black/85 z-[100] flex items-center justify-center p-4 backdrop-blur-xs font-mono max-h-full overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl w-full max-w-sm shadow-2xl space-y-4 text-left relative max-h-[95vh] overflow-y-auto scrollbar-none">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold cursor-pointer text-xs">✖</button>

        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wide">🏆 Runner Dashboard</h3>
          <p className="text-[10px] text-slate-400 font-sans">Manage your metadata metrics and account authentication sync states.</p>
        </div>

        <div className="bg-slate-950 p-2 border border-slate-800 rounded-xl flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Personal Best:</span>
          <span className="text-xs text-amber-400 font-black tracking-wide">⭐ {highScore} pts</span>
        </div>

        {/* Profile Inputs */}
        <form onSubmit={handleUpdateProfile} className="space-y-3 border-b border-slate-800/60 pb-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1 tracking-wider">Callsign</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full bg-slate-950 border border-slate-800 text-xs p-2 rounded-lg text-white outline-none focus:border-indigo-500" 
                maxLength={15} 
                required 
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1 tracking-wider">Country</label>
              <select 
                value={country} 
                onChange={(e) => setCountry(e.target.value)} 
                className="w-full bg-slate-950 border border-slate-800 text-xs p-2 rounded-lg text-white outline-none focus:border-indigo-500 cursor-pointer appearance-none"
              >
                <option value="" disabled className="text-slate-600">Select Region</option>
                {COUNTRIES_LIST.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-400">{profileMessage}</span>
            <button type="submit" disabled={isSaving} className="px-3 py-1.5 text-[11px] bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors cursor-pointer">{isSaving ? 'Saving...' : 'Update Info'}</button>
          </div>
        </form>

        {/* Cloud Sync Layer Actions */}
        <div className="space-y-3 pt-1">
          <label className="block text-[9px] uppercase font-bold text-slate-500 tracking-wider">Cloud Synchronization</label>

          {activeEmail ? (
            <div className="p-3 bg-slate-950 border border-emerald-950/60 rounded-xl flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Connected:</span>
                <span className="text-emerald-400 font-bold underline truncate max-w-[180px]">{activeEmail}</span>
              </div>
              <button type="button" onClick={async () => { await supabase.auth.signOut(); onClose(); }} className="w-full py-1.5 text-[10px] bg-rose-950/40 text-rose-300 hover:bg-rose-900/50 border border-rose-900/40 font-bold rounded-lg transition-all cursor-pointer">Sign Out Account</button>
            </div>
          ) : (
            <div className="space-y-3 p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <div className="flex bg-slate-900 p-0.5 border border-slate-800 rounded-lg text-[9px] font-bold">
                <button type="button" onClick={() => setAuthMode('login')} className={`flex-1 py-1 rounded-md transition-all ${authMode === 'login' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>LOG IN</button>
                <button type="button" onClick={() => setAuthMode('link')} className={`flex-1 py-1 rounded-md transition-all ${authMode === 'link' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>LINK RUN</button>
              </div>

              <button type="button" onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-900 font-bold py-1.5 rounded-lg text-[10px] transition-all cursor-pointer">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.96 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.6 2.8C6.01 6.94 8.78 5.04 12 5.04z"/><path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.42 3.57v2.97h3.91c2.28-2.1 3.54-5.19 3.54-8.69z"/><path fill="#FBBC05" d="M5.1 14.3c-.25-.75-.39-1.55-.39-2.3s.14-1.55.39-2.3L1.5 6.9C.54 8.81 0 10.95 0 13s.54 4.19 1.5 6.1l3.6-2.8z"/><path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.91-2.97c-1.08.72-2.48 1.16-4.05 1.16-3.22 0-5.99-1.9-6.99-4.76l-3.6 2.8C3.4 20.35 7.35 23 12 23z"/>
                </svg> Google Connect
              </button>

              <div className="relative flex items-center justify-center text-[8px] text-slate-600 font-bold uppercase tracking-widest"><div className="absolute w-full border-t border-slate-900"></div><span className="relative bg-slate-950 px-2">Or Credentials</span></div>

              <form onSubmit={handleEmailAuth} className="space-y-2">
                <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-800 text-[11px] p-1.5 rounded-md text-white outline-none focus:border-indigo-500" placeholder="Email Address" required />
                <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="w-full bg-slate-900 border border-slate-800 text-[11px] p-1.5 rounded-md text-white outline-none focus:border-indigo-500" placeholder="Password Key" required />
                <button type="submit" className="w-full py-1.5 text-[11px] bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all shadow-md cursor-pointer">{authMode === 'login' ? 'Execute Login' : 'Secure Current Account'}</button>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}