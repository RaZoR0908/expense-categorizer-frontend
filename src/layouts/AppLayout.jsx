import { useMemo, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';

const titleMap = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transactions',
  '/upload': 'Upload Bank Statement',
  '/budgets': 'Budgets',
  '/insights': 'Insights',
  '/chat': 'AI Chat',
};

const AppLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  const pageTitle = useMemo(() => {
    const matched = Object.entries(titleMap).find(([path]) =>
      location.pathname.startsWith(path)
    );
    return matched ? matched[1] : 'FinAIlytics';
  }, [location.pathname]);

  const closeMobileSidebar = () => setMobileSidebarOpen(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-12%] top-[-10%] h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute right-[-8%] top-[18%] h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute bottom-[-12%] left-[20%] h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="flex min-h-screen">
        <aside className="hidden lg:block lg:w-72 lg:shrink-0">
          <div className="sticky top-0 h-screen p-4">
            <Sidebar />
          </div>
        </aside>

        {mobileSidebarOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
              aria-label="Close navigation menu"
              onClick={closeMobileSidebar}
            />
            <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] p-3">
              <Sidebar onNavigate={closeMobileSidebar} />
            </div>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 px-4 py-4 backdrop-blur-xl lg:px-8">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100 transition hover:bg-white/10 lg:hidden"
                aria-label="Open navigation menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">FinAIlytics</p>
                <h1 className="truncate text-2xl font-semibold text-white">{pageTitle}</h1>
              </div>

              <Link
                to="/upload"
                className="hidden rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.02] sm:inline-flex"
              >
                Upload Bank Statement
              </Link>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
