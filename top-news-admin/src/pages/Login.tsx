import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, AlertCircle, CheckCircle2, ArrowLeft, KeyRound, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';

export const Login: React.FC = () => {
  const [portalType, setPortalType] = useState<'admin' | 'reporter'>('admin');
  const [isResetMode, setIsResetMode] = useState(false);
  const [email, setEmail] = useState('jasanim99@gmail.com');
  const [password, setPassword] = useState('');
  const [masterKey, setMasterKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const result = await login(email.trim(), password.trim());
      if (result?.admin?.role === 'reporter' || portalType === 'reporter') {
        navigate('/reporter/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      console.error('Login submit error:', err);
      const message = err?.message || 'Invalid email or password for this portal.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !masterKey.trim() || !newPassword.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccessMessage(null);
      const res = await authService.resetPasswordWithKey(email.trim(), masterKey.trim(), newPassword.trim());
      setSuccessMessage(res.message);
      if (res.message.includes('Logging you in')) {
        setTimeout(() => {
          if (portalType === 'reporter') {
            navigate('/reporter/dashboard', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        }, 1000);
      }
    } catch (err: any) {
      console.error('Key reset error:', err);
      setError(err?.message || 'Failed to update password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Top Logo & Title */}
        <div className="flex justify-center mb-3">
          <img 
            src="/logo.png" 
            alt="TOP NEWS Logo" 
            className="w-16 h-16 rounded-2xl object-cover shadow-md border border-gray-100"
          />
        </div>
        
        <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          {isResetMode 
            ? 'Reset Password' 
            : portalType === 'reporter' 
            ? 'Reporter Portal Login' 
            : 'Admin Portal Login'}
        </h2>
        <p className="mt-1.5 text-center text-sm text-gray-500 font-medium">
          {isResetMode 
            ? 'Enter your Security Key to update your password' 
            : portalType === 'reporter'
            ? 'Accredited Journalist & News Submission Desk'
            : 'TOP NEWS Management & Editorial Dashboard'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-gray-200/80"
        >
          {/* DUAL PORTAL SWITCHER TABS */}
          {!isResetMode && (
            <div className="flex items-center justify-center p-1.5 bg-gray-100 rounded-2xl mb-6 border border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setPortalType('admin');
                  if (email === 'reporter@topnews.com') setEmail('jasanim99@gmail.com');
                  setError(null);
                }}
                className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  portalType === 'admin' 
                    ? 'bg-[#0058be] text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Login</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPortalType('reporter');
                  if (email === 'jasanim99@gmail.com') setEmail('reporter@topnews.com');
                  setError(null);
                }}
                className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  portalType === 'reporter' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Reporter Login</span>
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 bg-red-50 border-l-4 border-red-500 p-4 text-red-700 flex items-center space-x-2 rounded-r-lg"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </motion.div>
            )}

            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 bg-emerald-50 border-l-4 border-emerald-500 p-4 text-emerald-800 flex items-center space-x-2 rounded-r-lg"
              >
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
                <span className="text-sm font-medium">{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {!isResetMode ? (
            /* Login Form */
            <form className="space-y-5" onSubmit={handleLoginSubmit}>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  {portalType === 'reporter' ? 'Reporter Email Address' : 'Admin Email Address'}
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] text-sm font-medium"
                    placeholder={portalType === 'reporter' ? 'reporter@topnews.com' : 'jasanim99@gmail.com'}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetMode(true);
                      setMasterKey('');
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className="text-xs font-semibold text-[#0058be] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white disabled:opacity-50 transition-all active:scale-[0.99] ${
                    portalType === 'reporter' 
                      ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500' 
                      : 'bg-[#0058be] hover:bg-[#004395] focus:ring-[#0058be]'
                  }`}
                >
                  {submitting 
                    ? 'Authenticating...' 
                    : portalType === 'reporter' 
                    ? 'Sign In as Reporter' 
                    : 'Sign In as Admin'}
                </button>
              </div>
            </form>
          ) : (
            /* Secure Admin/Reporter Password Reset Form */
            <form className="space-y-4" onSubmit={handleKeyPasswordReset}>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Account Email Address
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] text-sm"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Master Security Key
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <ShieldCheck className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={masterKey}
                    onChange={(e) => setMasterKey(e.target.value)}
                    className="block w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] text-sm font-mono"
                    placeholder="TOPNEWS2026"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  New Password
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] text-sm"
                    placeholder="Enter your new password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#0058be] hover:bg-[#004395] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0058be] disabled:opacity-50 transition-all active:scale-[0.99]"
              >
                <KeyRound className="w-4 h-4" />
                {submitting ? 'Updating Password...' : 'Update Password & Sign In'}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsResetMode(false);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
