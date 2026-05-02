import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { forgotPassword } from '../api/authApi';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await forgotPassword(email);
      setEmailSent(true);
      toast.success('Reset link sent to your email');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
        <section className="flex items-center justify-center px-6 py-10 lg:px-12 lg:py-14">
          <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-900/90 p-7 shadow-2xl shadow-black/30 backdrop-blur-xl lg:p-8">
            <h2 className="text-2xl font-semibold text-white lg:text-3xl">Reset your password</h2>
            <p className="mt-2 text-sm text-slate-400">Enter your email and we'll send you a reset link.</p>

            {emailSent ? (
              <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <p className="text-sm text-emerald-300">
                  Check your email for a reset link. If you don't see it, check your spam folder.
                </p>
              </div>
            ) : (
              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400 focus:bg-white/8"
                    placeholder="you@example.com"
                  />
                </label>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? 'Sending link...' : 'Send Reset Link'}
                </button>
              </form>
            )}

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

export default ForgotPasswordPage;
