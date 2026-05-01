import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { clearChatHistory, getChatHistory, sendMessage } from '../api/chatApi';
import { formatDate } from '../utils/formatters';

const quickPrompts = [
  'What is my biggest spending category this month?',
  'How much room do I have left in my budget?',
];

const ChatPage = () => {
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  const loadHistory = useCallback(async () => {
    try {
      const data = await getChatHistory();
      setHistory(data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load chat history');
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadHistory();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadHistory]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [history, submitting]);

  const handleSubmit = async (event) => {
    event?.preventDefault();
    if (!message.trim()) {
      toast.error('Write a message first');
      return;
    }
    setSubmitting(true);
    try {
      await sendMessage(message.trim());
      setMessage('');
      await loadHistory();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = async () => {
    try {
      await clearChatHistory();
      setHistory([]);
      toast.success('Chat history cleared');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to clear chat history');
    }
  };

  const submitDisabled = submitting || !message.trim();

  const handlePromptClick = (prompt) => {
    setMessage(prompt);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleComposerKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!submitDisabled) {
        void handleSubmit(event);
      }
    }
  };

  return (
    <div className="grid h-[calc(100vh-8rem)] grid-cols-[320px_1fr] gap-4 overflow-hidden">

      {/* ── ASIDE ── */}
      {/* Removed scroll-related classes and optimized gap */}
      <aside className="flex flex-col gap-3 overflow-hidden">

        {/* Info card - tightened padding and text */}
        <div className="shrink-0 rounded-[1.75rem] border border-white/10 bg-slate-900/85 p-4 shadow-lg shadow-black/10">
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Assistant</p>
          <h2 className="mt-1.5 text-lg font-semibold text-white">AI chat</h2>
          <p className="mt-1.5 text-xs leading-5 text-slate-400">
            Ask about spending, budgets, and patterns. You will get contextual answers from your transactions and budget activity.
          </p>
        </div>

        {/* Quick prompts - tightened padding to fit on screen */}
        <div className="flex flex-col rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
          <p className="shrink-0 text-[10px] uppercase tracking-[0.3em] text-slate-500">Quick prompts</p>

          <div className="mt-2.5 flex flex-col gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handlePromptClick(prompt)}
                className="group flex w-full shrink-0 items-start gap-2 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-2.5 text-left text-sm text-slate-300 transition hover:border-violet-400/40 hover:bg-white/10 hover:text-white"
              >
                <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400/80 transition group-hover:bg-violet-300" />
                <span className="leading-snug">{prompt}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Clear button - Reduced outer padding and used mt-auto to push to bottom */}
        <div className="mt-auto shrink-0 rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-2">
          <button
            type="button"
            onClick={handleClear}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-rose-500/10 hover:text-rose-200"
          >
            Clear conversation
          </button>
        </div>
      </aside>

      {/* ── CHAT SECTION ── */}
      <section className="flex min-h-0 flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900/85 shadow-lg shadow-black/10">

        {/* Header */}
        <div className="shrink-0 flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.26em] text-slate-500">Conversation</p>
            <p className="mt-1 text-sm text-slate-300">{history.length} messages</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </div>
        </div>

        {/* Messages */}
        <div
          ref={listRef}
          className="min-h-0 flex-1 overflow-y-auto p-5 [scrollbar-width:thin] scroll-smooth"
          style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
        >
          {history.length === 0 && !submitting ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center text-slate-400">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-violet-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10h8M8 14h5m-7 7 4-4h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12l2-2Z" />
                </svg>
              </div>
              <p className="text-sm">Start a conversation to see recommendations and spending breakdowns here.</p>
            </div>
          ) : null}

          {history.map((entry) => (
            <div
              key={entry.id}
              className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-[1.25rem] px-4 py-3 shadow-sm ${
                  entry.role === 'user'
                    ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white'
                    : 'border border-white/10 bg-white/[0.03] text-slate-200'
                }`}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
                      entry.role === 'user' ? 'bg-white/20 text-white' : 'bg-violet-500/20 text-violet-200'
                    }`}
                  >
                    {entry.role === 'user' ? 'Y' : 'AI'}
                  </span>
                  <span className={`text-xs ${entry.role === 'user' ? 'text-violet-100/90' : 'text-slate-400'}`}>
                    {entry.role === 'user' ? 'You' : 'Assistant'}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-7">{entry.content}</p>
                <p className={`mt-2 text-xs ${entry.role === 'user' ? 'text-violet-100/80' : 'text-slate-500'}`}>
                  {formatDate(entry.createdAt)}
                </p>
              </div>
            </div>
          ))}

          {submitting ? (
            <div className="flex justify-start">
              <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                Assistant is thinking...
              </div>
            </div>
          ) : null}
        </div>

        {/* Composer */}
        <div className="shrink-0 border-t border-white/10 p-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={handleComposerKeyDown}
              rows={3}
              className="min-h-[84px] flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/60"
              placeholder="Ask about spending, budgets, or anomalies..."
            />
            <button
              type="button"
              disabled={submitDisabled}
              onClick={handleSubmit}
              className="rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 px-6 py-3 font-medium text-white transition hover:scale-[1.01] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 md:self-end"
            >
              {submitting ? 'Sending...' : 'Send'}
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500">Press Enter to send · Shift+Enter for a new line.</p>
        </div>
      </section>
    </div>
  );
};

export default ChatPage;