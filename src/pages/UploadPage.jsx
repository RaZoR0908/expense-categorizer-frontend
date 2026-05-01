import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { uploadStatement } from '../api/statementApi';

const UploadPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) setSelectedFile(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      toast.error('Pick a statement file first');
      return;
    }

    setSubmitting(true);
    try {
      const data = await uploadStatement(selectedFile, password || null);
      setResult(data);
      toast.success('Statement processed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-[2rem] border border-white/10 bg-slate-900/85 p-6 shadow-lg shadow-black/10">
        <h2 className="text-2xl font-semibold text-white">Upload statement</h2>
        <p className="mt-2 text-sm text-slate-400">Import PDF, CSV, XLS, or XLSX files for parsing and auto-categorization.</p>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div
            {...getRootProps()}
            className={`cursor-pointer rounded-[2rem] border border-dashed px-6 py-14 text-center transition ${
              isDragActive
                ? 'border-violet-400 bg-violet-500/10'
                : 'border-white/10 bg-white/5 hover:bg-white/8'
            }`}
          >
            <input {...getInputProps()} />
            <p className="text-lg font-medium text-white">
              {isDragActive ? 'Drop the file here' : 'Drag and drop a bank statement here'}
            </p>
            <p className="mt-2 text-sm text-slate-400">or click to browse files from your device</p>
            <p className="mt-4 text-xs uppercase tracking-[0.3em] text-slate-500">Supported: PDF, CSV, XLS, XLSX</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Selected file</span>
              <input
                type="text"
                readOnly
                value={selectedFile?.name || ''}
                placeholder="No file chosen"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Password, if protected</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                placeholder="Optional"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-3 font-medium text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? 'Processing file...' : 'Upload and categorize'}
          </button>
        </form>
      </section>

      <aside className="space-y-4">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/85 p-6 shadow-lg shadow-black/10">
          <h3 className="text-lg font-semibold text-white">Processing flow</h3>
          <ol className="mt-4 space-y-3 text-sm text-slate-300">
            <li>1. Backend detects the file type and extracts rows or text.</li>
            <li>2. Each transaction is normalized and categorized by the AI service.</li>
            <li>3. Parsed records are stored under your account in PostgreSQL.</li>
            <li>4. Dashboard, budgets, and insights update from the saved data.</li>
          </ol>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/80">Result</p>
          <div className="mt-3 space-y-2 text-sm text-slate-200">
            <p>Transactions processed: {result?.transactionsProcessed ?? '—'}</p>
            <p>Transactions categorized: {result?.transactionsCategorized ?? '—'}</p>
            <p>User ID: {result?.userId ?? '—'}</p>
          </div>
          <p className="mt-4 text-sm text-slate-400">{result?.message || 'Upload a statement to see the parsed result here.'}</p>
        </div>
      </aside>
    </div>
  );
};

export default UploadPage;
