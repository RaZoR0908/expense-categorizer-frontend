import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await register(form.fullName, form.email, form.password);
      toast.success('Account created');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative order-2 flex items-center justify-center px-6 py-8 lg:order-1 lg:px-12 lg:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(139,92,246,0.28),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.12),_transparent_28%)]" />
          <div className="relative w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-900/90 p-7 shadow-2xl shadow-black/30 backdrop-blur-xl lg:p-8">
            <h2 className="text-2xl font-semibold text-white lg:text-3xl">Create your account</h2>
            <p className="mt-2 text-sm text-slate-400">Start tracking expenses and budgets in minutes.</p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Full name</span>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400 focus:bg-white/8"
                  placeholder="Akhil Sharma"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Email</span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400 focus:bg-white/8"
                  placeholder="you@example.com"
                />
              </label>

              <label className="block relative">
                <span className="mb-2 block text-sm text-slate-300">Password</span>
                <input
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 pr-12 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400 focus:bg-white/8"
                  placeholder="Create a secure password"
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

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-violet-300 hover:text-violet-200">
                Sign in
              </Link>
            </p>
          </div>
        </section>

        <section className="relative order-1 overflow-hidden px-6 py-8 lg:order-2 lg:px-12 lg:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(139,92,246,0.22),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(34,211,238,0.12),_transparent_30%)]" />
          <div className="relative flex h-full flex-col justify-center rounded-[2rem] border border-white/10 bg-white/[0.03] p-7 shadow-2xl shadow-black/20 backdrop-blur-xl lg:p-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.35em] text-slate-300">
                FinAIlytics
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.35em] text-slate-300">
                Smart onboarding
              </div>
              <h1 className="mt-6 max-w-2xl text-3xl font-semibold leading-tight text-white lg:text-5xl">
                A cleaner financial workflow starts with one login.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 lg:text-base">
                Once registered, your Bank Statements, budgets, and AI chat history stay private and are tied to your account.
              </p>
            </div>

            {/* Info boxes removed per user request */}
          </div>
        </section>
      </div>
    </div>
  );
};

export default RegisterPage;
