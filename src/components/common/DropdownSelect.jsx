import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const DropdownSelect = ({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select',
  emptyOptionLabel = 'All categories',
  name = 'category',
  className = '',
}) => {
  const btnRef = useRef(null);
  const dropdownRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setCoords({ top: r.bottom + window.scrollY + 6, left: r.left + window.scrollX, width: r.width });
    }
  }, [open]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!btnRef.current) return;
      // keep open when clicking inside the button or dropdown portal
      if (btnRef.current.contains(e.target)) return;
      if (dropdownRef.current && dropdownRef.current.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const handleSelect = (val) => {
    onChange({ target: { name, value: val } });
    setOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        ref={btnRef}
        onClick={() => setOpen((s) => !s)}
        className="flex items-center justify-between w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-white outline-none transition focus:border-violet-400"
      >
        <span className="truncate">{value || placeholder}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && createPortal(
        <div
          ref={dropdownRef}
          className="rounded-md bg-white shadow-lg ring-1 ring-black/10"
          style={{ position: 'absolute', top: coords.top, left: coords.left, width: coords.width, zIndex: 9999 }}
        >
          <div className="max-h-64 overflow-auto" onWheel={(e) => e.stopPropagation()}>
            <button onClick={() => handleSelect('')} className="block w-full text-left px-4 py-3 hover:bg-slate-100">{emptyOptionLabel}</button>
            {options.map((opt) => (
              <button key={opt} onClick={() => handleSelect(opt)} className="block w-full text-left px-4 py-3 hover:bg-slate-100">
                {opt}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default DropdownSelect;
