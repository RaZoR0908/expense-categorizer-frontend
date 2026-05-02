import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { resetPassword } from '../api/authApi';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      toast.error('Invalid reset link');
      navigate('/login');
    }
  }, [token, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(token, form.password);
      toast.success('Password reset successfully');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) return null;

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
        <section className="flex items-center justify-center px-6 py-10 lg:px-12 lg:py-14">
          <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-900/90 p-7 shadow-2xl shadow-black/30 backdrop-blur-xl lg:p-8">
            <h2 className="text-2xl font-semibold text-white lg:text-3xl">Create new password</h2>
            <p className="mt-2 text-sm text-slate-400">Enter your new password below.</p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <label className="block relative">
                <span className="mb-2 block text-sm text-slate-300">New password</span>
                <input
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 pr-12 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400 focus:bg-white/8"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    const next = !showPassword;
                    setShowPassword(next);
                    if (passwordRef.current) passwordRef.current.type = next ? 'text' : 'password';
                  }}
                  className="absolute right-3 top-8 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-violet-400/30"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.46 12.06C3.76 8.02 7.54 5 12 5c4.46 0 8.24 3.02 9.54 7.06a10.9 10.9 0 01-19.08 0Z" />
                      <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.58 10.58A3 3 0 0013.42 13.42" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.46 12.06C3.76 8.02 7.54 5 12 5c4.46 0 8.24 3.02 9.54 7.06a10.9 10.9 0 01-4.17 5.33" />
                    </svg>
                  )}
                </button>
              </label>

              <label className="block relative">
                <span className="mb-2 block text-sm text-slate-300">Confirm password</span>
                <input
                  ref={confirmRef}
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 pr-12 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400 focus:bg-white/8"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    const next = !showConfirm;
                    setShowConfirm(next);
                    if (confirmRef.current) confirmRef.current.type = next ? 'text' : 'password';
                  }}
                  className="absolute right-3 top-8 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-violet-400/30"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.46 12.06C3.76 8.02 7.54 5 12 5c4.46 0 8.24 3.02 9.54 7.06a10.9 10.9 0 01-19.08 0Z" />
                      <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.58 10.58A3 3 0 0013.42 13.42" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.46 12.06C3.76 8.02 7.54 5 12 5c4.46 0 8.24 3.02 9.54 7.06a10.9 10.9 0 01-4.17 5.33" />
                    </svg>
                  )}
                </button>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? 'Resetting password...' : 'Reset Password'}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-slate-400">
              <Link to="/login" className="font-medium text-violet-300 hover:text-violet-200">
                Back to Login
              </Link>
            </p>
          </div>
        </section>

        <section className="relative overflow-hidden px-6 py-8 lg:px-12 lg:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(139,92,246,0.28),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.12),_transparent_28%)]" />
          <div className="relative flex h-full flex-col justify-center rounded-[2rem] border border-white/10 bg-white/[0.03] p-7 shadow-2xl shadow-black/20 backdrop-blur-xl lg:p-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.35em] text-slate-300">
                FinAIlytics
              </div>
              <h1 className="mt-6 max-w-xl text-3xl font-semibold leading-tight text-white lg:text-5xl">
                Track spending, spot patterns, and keep budgets under control.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 lg:text-base">
                Upload Bank Statements, review categorized transactions, and ask the assistant for spending advice in one workspace.
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                ['Auto parsing', 'PDF, CSV, Excel support'],
                ['Live budgets', 'Monthly limit visibility'],
                ['AI chat', 'Spend guidance on demand'],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-3xl border border-white/10 bg-slate-900/60 p-4">
                  <p className="text-sm font-medium text-white">{title}</p>
                  <p className="mt-1 text-sm text-slate-400">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
