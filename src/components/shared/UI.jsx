// ── Badge ─────────────────────────────────────────────────────────────────────
const BADGE_STYLES = {
  green:  'bg-green-50 text-green-600',
  amber:  'bg-amber-50 text-amber-600',
  red:    'bg-red-50 text-red-600',
  blue:   'bg-blue-50 text-blue-600',
  purple: 'bg-purple-100 text-purple-700',
  gray:   'bg-gray-100 text-gray-500',
}

export function Badge({ color = 'gray', children, className = '' }) {
  return (
    <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${BADGE_STYLES[color]} ${className}`}>
      {children}
    </span>
  )
}

// ── Alert ─────────────────────────────────────────────────────────────────────
const ALERT_STYLES = {
  green:  'bg-green-50 text-green-600',
  amber:  'bg-amber-50 text-amber-600',
  red:    'bg-red-50 text-red-600',
  blue:   'bg-blue-50 text-blue-600',
}

export function Alert({ color = 'blue', children, className = '' }) {
  return (
    <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed mb-3 ${ALERT_STYLES[color]} ${className}`}>
      {children}
    </div>
  )
}

// ── Button ────────────────────────────────────────────────────────────────────
export function Button({ variant = 'default', size = 'md', children, className = '', disabled, ...props }) {
  const base = 'inline-flex items-center gap-1.5 font-medium rounded-lg border transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
  const sizes = { sm: 'text-xs px-2.5 py-1', md: 'text-sm px-3 py-1.5', lg: 'text-sm px-4 py-2.5' }
  const variants = {
    default: 'bg-transparent border-gray-200 text-gray-700 hover:bg-gray-50',
    primary: 'bg-green-500 border-green-500 text-white hover:bg-green-600',
    danger:  'bg-transparent border-red-300 text-red-600 hover:bg-red-50',
    ghost:   'bg-transparent border-transparent text-gray-500 hover:bg-gray-50',
  }
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} disabled={disabled} {...props}>
      {children}
    </button>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white border border-gray-100 rounded-2xl p-4 mb-3 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

// ── Section title ─────────────────────────────────────────────────────────────
export function SectionTitle({ icon, children, action }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
        {icon && <i className={`ti ${icon} text-green-500`} aria-hidden="true" />}
        {children}
      </div>
      {action}
    </div>
  )
}

// ── Metric card ───────────────────────────────────────────────────────────────
export function Metric({ label, value, sub, valueColor = 'text-gray-800' }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className={`text-xl font-semibold ${valueColor}`}>{value}</div>
      {sub && <div className="text-[10px] text-gray-300 mt-0.5">{sub}</div>}
    </div>
  )
}

// ── Metrics grid ──────────────────────────────────────────────────────────────
export function MetricsGrid({ children }) {
  return <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">{children}</div>
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children }) {
  return (
    <div className="bg-black/30 rounded-2xl p-4 mb-3">
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-gray-800">{title}</span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <i className="ti ti-x" aria-hidden="true" /> Cancel
          </Button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── Form helpers ──────────────────────────────────────────────────────────────
export function FormRow({ children }) {
  return <div className="grid grid-cols-2 gap-3 mb-3">{children}</div>
}

export function FormGroup({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400">{label}</label>
      {children}
    </div>
  )
}

export function Input({ ...props }) {
  return (
    <input
      className="text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 w-full focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
      {...props}
    />
  )
}

export function Select({ children, ...props }) {
  return (
    <select
      className="text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 w-full focus:outline-none focus:ring-2 focus:ring-green-200"
      {...props}
    >
      {children}
    </select>
  )
}

export function Textarea({ ...props }) {
  return (
    <textarea
      className="text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 w-full focus:outline-none focus:ring-2 focus:ring-green-200 resize-none"
      {...props}
    />
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="w-8 h-8 border-4 border-green-100 border-t-green-500 rounded-full animate-spin" />
    </div>
  )
}

// ── Data table ────────────────────────────────────────────────────────────────
export function DataTable({ cols, rows, empty = 'No data.' }) {
  if (!rows.length) return <p className="text-sm text-gray-400 py-4 text-center">{empty}</p>
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            {cols.map(c => (
              <th key={c.key} className="text-left px-2 py-2 text-gray-400 font-medium border-b border-gray-100" style={{ width: c.width }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50 transition-colors" style={row._style}>
              {cols.map(c => (
                <td key={c.key} className="px-2 py-2 border-b border-gray-50 text-gray-700 align-middle">
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Progress bar ──────────────────────────────────────────────────────────────
export function ProgressBar({ percent, color = '#1D9E75' }) {
  return (
    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, percent)}%`, background: color }} />
    </div>
  )
}

// ── Evidence upload button ────────────────────────────────────────────────────
export function EvidenceUpload({ onFile, preview }) {
  return (
    <div>
      <label className="flex items-center gap-2 p-3 border-2 border-dashed border-green-300 rounded-xl cursor-pointer text-sm text-green-600 bg-green-50 hover:bg-green-100 transition-colors justify-center">
        <i className="ti ti-upload text-lg" aria-hidden="true" />
        <span>{preview ? 'Change payment slip' : 'Upload payment slip / evidence'}</span>
        <input type="file" accept="image/*" className="hidden" onChange={e => onFile(e.target.files[0])} />
      </label>
      {preview && (
        <div className="mt-2 flex items-center gap-3">
          <img src={preview} alt="Evidence preview" className="w-16 h-12 object-cover rounded-lg border border-gray-200" />
          <span className="text-xs text-green-600 flex items-center gap-1">
            <i className="ti ti-check" aria-hidden="true" /> Slip uploaded
          </span>
        </div>
      )}
    </div>
  )
}
