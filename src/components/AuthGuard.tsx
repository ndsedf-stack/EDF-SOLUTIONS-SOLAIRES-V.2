import React, { useState, useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('dashboard_auth_token');
    if (auth === 'valid_session_secured') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mot de passe simple pour la démo : "admin" ou "edf"
    if (password === 'admin' || password === 'edf' || password === 'demo') {
      localStorage.setItem('dashboard_auth_token', 'valid_session_secured');
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[rgba(20,20,20,0.6)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="text-3xl mb-4">🔒</div>
          <h1 className="text-xl font-bold text-white mb-2 font-['Outfit'] tracking-wide">ACCÈS SÉCURISÉ</h1>
          <p className="text-gray-400 text-sm">Veuillez vous identifier pour accéder au système.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#f97316] transition-colors text-center tracking-widest"
              autoFocus
            />
          </div>

          {error && (
            <div className="text-red-400 text-xs text-center bg-red-500/10 py-2 rounded">
              Mot de passe incorrect
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(249,115,22,0.2)]"
          >
            DÉVERROUILLER
          </button>
          
          <div className="text-center mt-6">
              <p className="text-[10px] text-gray-600 uppercase tracking-widest">Système AutoPilote Sécurisé</p>
          </div>
        </form>
      </div>
    </div>
  );
};
