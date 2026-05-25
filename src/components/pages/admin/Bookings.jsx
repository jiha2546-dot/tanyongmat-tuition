import { useState } from 'react'
import { Card, SectionTitle, Button, Modal, FormRow, FormGroup, Input, Select, Badge, DataTable, Alert } from '../../shared/UI'
import { TableGrid } from '../../shared/TableGrid'
import { fmt, fmtDate, calcHours, calcFee, getUnavailableTables, ALL_TABLES, today, TIME_SLOTS } from '../../../lib/utils'

export function Bookings({ bookings, tutorNames = [], onAdd, onTogglePaid, onCancel }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    type: 'outside', booker_name: '', booker_phone: '', tutor_name: '',
    subject: '', table_name: '', date: today(), start_time: '17:00',
    end_time: '18:00', num_students: 1, paid: false, amount: 20,
  })
  const [saving, setSaving] = useState(false)

  const unavail = form.date && form.start_time && form.end_time
    ? getUnavailableTables(bookings, form.date, form.start_time, form.end_time)
    : []

  function set(k, v) {
    setForm(f => {
      const updated = { ...f, [k]: v }
      // Auto-calculate fee when time changes
      if ((k === 'start_time' || k === 'end_time') && updated.start_time && updated.end_time) {
        updated.amount = calcFee(updated.start_time, updated.end_time)
      }
      return updated
    })
  }

  async function save() {
    if (!form.table_name) { alert('Please select a table.'); return }
    setSaving(true)
    const hours = calcHours(form.start_time, form.end_time)
    const amount = calcFee(form.start_time, form.end_time)
    await onAdd({ ...form, hours, status: 'confirmed', amount })
    setShowForm(false)
    setSaving(false)
  }

  const cols = [
    { key: 'date', label: 'Date', width: '9%', render: b => fmtDate(b.date) },
    { key: 'table_name', label: 'Table', width: '8%' },
    { key: 'type', label: 'Type', width: '8%', render: b => <Badge color={b.type === 'our' ? 'green' : 'blue'}>{b.type === 'our' ? 'Our' : 'Out'}</Badge> },
    { key: 'who', label: 'Who', width: '15%', render: b => b.type === 'our' ? b.tutor_name : b.booker_name },
    { key: 'time', label: 'Time', width: '14%', render: b => `${b.start_time}–${b.end_time}` },
    { key: 'stu', label: 'Stu.', width: '6%', render: b => b.num_students },
    { key: 'amount', label: 'Fee', width: '9%', render: b => `${fmt(b.amount)} ฿` },
    { key: 'status', label: 'Status', width: '9%', render: b => <Badge color={b.status === 'confirmed' ? 'green' : 'red'}>{b.status}</Badge> },
    { key: 'paid', label: 'Paid', width: '8%', render: b => <Badge color={b.paid ? 'green' : 'red'}>{b.paid ? '✓' : '✗'}</Badge> },
    {
      key: 'actions', label: '', width: '14%',
      render: b => b.status !== 'cancelled' ? (
        <div className="flex gap-1">
          <Button size="sm" variant={b.paid ? 'default' : 'primary'} onClick={() => onTogglePaid(b.id, b.paid)}>
            {b.paid ? 'Unpay' : 'Pay'}
          </Button>
          <Button size="sm" variant="danger" onClick={() => onCancel(b.id)}>✕</Button>
        </div>
      ) : <span className="text-xs text-gray-300">cancelled</span>
    },
  ]

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-800">All bookings</h2>
        <Button variant="primary" onClick={() => setShowForm(s => !s)}>
          <i className="ti ti-plus" aria-hidden="true" /> Add booking
        </Button>
      </div>

      {showForm && (
        <Modal title="Add booking" onClose={() => setShowForm(false)}>
          <FormRow>
            <FormGroup label="Type">
              <Select value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="outside">Outside / parent</option>
                <option value="our">Our tutor</option>
              </Select>
            </FormGroup>
            <FormGroup label={form.type === 'our' ? 'Tutor name' : 'Booker name'}>
              {form.type === 'our' && tutorNames.length > 0
                ? <Select value={form.booker_name} onChange={e => set('booker_name', e.target.value)}>
                    <option value="">Select tutor…</option>
                    {tutorNames.map(t => <option key={t}>{t}</option>)}
                  </Select>
                : <Input value={form.booker_name} onChange={e => set('booker_name', e.target.value)} placeholder="Name" />
              }
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup label="Date">
              <Input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            </FormGroup>
            <FormGroup label="Students">
              <Input type="number" min="1" max="5" value={form.num_students} onChange={e => set('num_students', parseInt(e.target.value))} />
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup label="Start time">
              <select className="text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 w-full focus:outline-none focus:ring-2 focus:ring-green-200"
                value={form.start_time} onChange={e => set('start_time', e.target.value)}>
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="End time">
              <select className="text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 w-full focus:outline-none focus:ring-2 focus:ring-green-200"
                value={form.end_time} onChange={e => set('end_time', e.target.value)}>
                {TIME_SLOTS.filter(t => t > form.start_time).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormGroup>
          </FormRow>
          {form.start_time && form.end_time && form.end_time > form.start_time && (
            <div className="text-xs text-green-600 mb-3 px-1">
              Fee auto-calculated: <strong>{calcFee(form.start_time, form.end_time)} THB</strong>
              {' '}({calcHours(form.start_time, form.end_time) >= 1
                ? `${Math.floor(calcHours(form.start_time, form.end_time))}hr${calcHours(form.start_time, form.end_time) % 1 ? ' 30min' : ''}`
                : ''})
            </div>
          )}
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-2 block">Table</label>
            <TableGrid
              unavailable={unavail}
              selected={form.table_name}
              onSelect={t => set('table_name', t)}
            />
            {unavail.length > 0 && (
              <p className="text-xs text-amber-600 mt-2">{unavail.length} table(s) unavailable for this slot.</p>
            )}
          </div>
          <FormRow>
            <FormGroup label="Amount (฿)">
              <Input type="number" value={form.amount} onChange={e => set('amount', e.target.value)} />
            </FormGroup>
            <FormGroup label="Paid?">
              <Select value={form.paid} onChange={e => set('paid', e.target.value === 'true')}>
                <option value="false">Unpaid</option>
                <option value="true">Paid</option>
              </Select>
            </FormGroup>
          </FormRow>
          <Button variant="primary" size="lg" className="w-full justify-center" onClick={save} disabled={saving}>
            {saving ? 'Saving...' : 'Save booking'}
          </Button>
        </Modal>
      )}

      <Card>
        <DataTable cols={cols} rows={bookings} empty="No bookings yet." />
      </Card>
    </div>
  )
}
