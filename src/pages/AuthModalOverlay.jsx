import React from 'react';

export default function AuthModalOverlay({
  showAuthForm,
  authMode,
  setAuthMode,
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  handleEmailAuth,
  handleGoogleLogin,
  setShowAuthForm
}) {
  if (!showAuthForm) return null;

  return (
    <div className="absolute inset-0 bg-black/85 z-[100] flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl w-full max-w-sm shadow-2xl space-y-4 font-mono">
        
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide">
            {authMode === 'login' ? 'Welcome Back, Runner' : 'Save Progress via Email'}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5 font-sans">
            {authMode === 'login' ? 'Log into your existing permanent profile.' : 'Secure your guest stats to load them on any device.'}
          </p>
        </div>

        {/* Switch tabs mode interface element */}
        <div className="flex bg-slate-950 p-1 border border-slate-800 rounded-lg text-[10px] font-bold">
          <button 
            type="button"
            onClick={() => setAuthMode('login')}
            className={`flex-1 py-1 rounded-md transition-all ${authMode === 'login' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            LOG IN
          </button>
          <button 
            type="button"
            onClick={() => setAuthMode('link')}
            className={`flex-1 py-1 rounded-md transition-all ${authMode === 'link' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            LINK GUEST RUN
          </button>
        </div>

        {/* Google Authentication Anchor Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-900 font-bold py-2 rounded-xl text-xs transition-all shadow-md cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.96 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.6 2.8C6.01 6.94 8.78 5.04 12 5.04z"/>
            <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.42 3.57v2.97h3.91c2.28-2.1 3.54-5.19 3.54-8.69z"/>
            <path fill="#FBBC05" d="M5.1 14.3c-.25-.75-.39-1.55-.39-2.3s.14-1.55.39-2.3L1.5 6.9C.54 8.81 0 10.95 0 13s.54 4.19 1.5 6.1l3.6-2.8z"/>
            <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.91-2.97c-1.08.72-2.48 1.16-4.05 1.16-3.22 0-5.99-1.9-6.99-4.76l-3.6 2.8C3.4 20.35 7.35 23 12 23z"/>
          </svg>
          Continue with Google
        </button>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-3 text-[9px] text-slate-500 uppercase tracking-widest font-bold">Or Email</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Email Authentication form handler context wrapper */}
        <form onSubmit={handleEmailAuth} className="space-y-3 text-left">
          <div>
            <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1 tracking-wider">Email Address</label>
            <input 
              type="email" 
              value={authEmail} 
              onChange={(e) => setAuthEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs p-2 rounded-lg text-white outline-hidden focus:border-indigo-500 font-mono" 
              placeholder="runner@pixel.com"
              required
            />
          </div>

          <div>
            <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1 tracking-wider">Password</label>
            <input 
              type="password" 
              value={authPassword} 
              onChange={(e) => setAuthPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs p-2 rounded-lg text-white outline-hidden focus:border-indigo-500 font-mono" 
              placeholder="••••••••"
              required
                />
          </div>

          <div className="flex gap-2 pt-2">
            <button 
              type="button" 
              onClick={() => setShowAuthForm(false)}
              className="flex-1 py-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-2 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              {authMode === 'login' ? 'Sign In' : 'Link Account'}
            </button>
          </div>
        </form>
        
      </div>
    </div>
  );
}