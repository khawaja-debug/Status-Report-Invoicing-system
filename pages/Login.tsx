
import React, { useState } from 'react';
import { MOCK_USERS } from '../constants';

interface LoginProps {
  onLogin: (email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = MOCK_USERS.find(u => u.email === email);
    if (user) {
      onLogin(email);
    } else {
      setError('Invalid email. Try mark@build.co or admin@build.co');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl text-white text-3xl font-bold mb-4">
            CB
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
          <p className="text-slate-500 mt-2">Sign in to manage your construction billing</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. mark@build.co"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100">
          <p className="text-xs text-slate-400 text-center uppercase tracking-widest font-bold mb-4">Demo Credentials</p>
          <div className="grid grid-cols-1 gap-2">
            {MOCK_USERS.map(u => (
              <button
                key={u.id}
                onClick={() => setEmail(u.email)}
                className="text-left px-4 py-2 text-xs bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600 border border-slate-200"
              >
                <span className="font-bold">{u.role}:</span> {u.email}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
