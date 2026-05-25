import { CHAIR_TABLES, FLOOR_TABLES, isFloor } from '../../lib/utils'

export function TableGrid({ unavailable = [], selected, onSelect, disabled = false }) {
  function TableCard({ table }) {
    const busy = unavailable.includes(table)
    const sel = selected === table
    const floor = isFloor(table)

    return (
      <div
        onClick={() => !busy && !disabled && onSelect(table)}
        className={[
          'border-2 rounded-xl p-2.5 text-center transition-all select-none',
          busy
            ? 'opacity-40 cursor-not-allowed bg-gray-50 border-gray-200'
            : sel
            ? 'border-green-500 bg-green-500 text-white cursor-pointer'
            : disabled
            ? 'border-gray-200 cursor-default'
            : 'border-gray-200 hover:border-green-400 hover:bg-green-50 cursor-pointer',
        ].join(' ')}
      >
        <i
          className={`ti ${floor ? 'ti-mood-kid' : 'ti-armchair'} block text-lg mb-1 ${
            sel ? 'text-green-100' : busy ? 'text-gray-300' : 'text-green-500'
          }`}
          aria-hidden="true"
        />
        <div className={`text-xs font-semibold ${sel ? 'text-white' : 'text-gray-700'}`}>{table}</div>
        <div className={`text-[10px] mt-0.5 ${sel ? 'text-green-100' : 'text-gray-400'}`}>
          {busy ? 'Unavailable' : sel ? 'Selected' : floor ? 'โต๊ะสำหรับเด็กเล็ก' : 'Available'}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
        <i className="ti ti-armchair mr-1" aria-hidden="true" />
        Chair tables — standard
      </div>
      <div className="grid grid-cols-5 gap-2 mb-4">
        {CHAIR_TABLES.map(t => <TableCard key={t} table={t} />)}
      </div>

      <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
        <i className="ti ti-mood-kid mr-1" aria-hidden="true" />
        Floor tables — kindergarten (low, no chairs)
      </div>
      <div className="grid grid-cols-3 gap-2">
        {FLOOR_TABLES.map(t => <TableCard key={t} table={t} />)}
      </div>
    </div>
  )
}
