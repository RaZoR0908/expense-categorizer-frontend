import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
    <div className="max-w-md rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl shadow-black/20 backdrop-blur-xl">
      <p className="text-sm uppercase tracking-[0.3em] text-slate-500">404</p>
      <h1 className="mt-4 text-3xl font-semibold text-white">Page not found</h1>
      <p className="mt-3 text-sm leading-7 text-slate-400">The route you tried to open does not exist in this workspace.</p>
      <Link to="/dashboard" className="mt-6 inline-flex rounded-2xl bg-violet-500 px-5 py-3 font-medium text-white transition hover:bg-violet-400">
        Return to dashboard
      </Link>
    </div>
  </div>
);

export default NotFoundPage;
