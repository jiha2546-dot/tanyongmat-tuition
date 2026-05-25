import { useState } from 'react'
import { Card, Button, Modal, FormRow, FormGroup, Input, Select, Badge, DataTable, Alert, EvidenceUpload } from '../../shared/UI'
import { TableGrid } from '../../shared/TableGrid'
import { fmt, fmtDate, calcHours, calcFee, getUnavailableTables, today, TIME_SLOTS } from '../../../lib/utils'
import { supabase } from '../../../lib/supabase'

export function Bookings({ bookings, tutorNames = [], onAdd, onTogglePaid, onCancel, onUpdate }) {
  const [showForm, setShowForm] = useState(false)
  const [payId, setPayId] = useState(null)
  const [payPreview, setPayPreview] = useState(null)
  const [payFile, setPayFile] = useState(null)
  const [payMethod, setPayMethod] = useState('Cash')
  const [paying, setPaying] = useState(false)
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

  function openPay(b) {
    setPayId(b.id)
    setPayPreview(b.evidence_url || null)
    setPayFile(null)
    setPayMethod('Cash')
  }

  function handleEvidenceFile(file) {
    if (!file) return
    setPayFile(file)
    const reader = new FileReader()
    reader.onload = e => setPayPreview(e.target.result)
    reader.readAsDataURL(file)
  }

  async function confirmPay() {
    if (!payId) return
    setPaying(true)
    let evidence_url = null
    if (payFile) {
      const ext = payFile.name.split('.').pop()
      const path = `evidence/booking-${payId}-${Date.now()}.${ext}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('evidence').upload(path, payFile, { upsert: true })
      if (!uploadError && uploadData) {
        const { data: { publicUrl } } = supabase.storage.from('evidence').getPublicUrl(path)
        evidence_url = publicUrl
      }
    }
    // Update booking with paid + evidence
    const { error } = await supabase.from('bookings')
      .update({ paid: true, evidence_url, pay_method: payMethod })
      .eq('id', payId)
    if (!error) {
      onUpdate && onUpdate(payId, { paid: true, evidence_url, pay_method: payMethod })
      // Auto cash entry
      const b = bookings.find(x => x.id === payId)
      if (b) {
        const name = b.type === 'our' ? b.tutor_name : b.booker_name
        await supabase.from('cash_entries').insert([{
          date: new Date().toISOString().slice(0,10),
          description: `Table rental — ${name} (${b.table_name})`,
          amount: b.amount,
          type: 'income',
          note: `Payment method: ${payMethod}${evidence_url ? ' · Evidence uploaded' : ''}`,
        }])
      }
    }
    setPayId(null)
    setPayPreview(null)
    setPayFile(null)
    setPaying(false)
  }

  const payBooking = payId ? bookings.find(b => b.id === payId) : null

  const cols = [
    { key: 'date', label: 'Date', width: '9%', render: b => fmtDate(b.date) },
    { key: 'table_name', label: 'Table', width: '8%' },
    { key: 'type', label: 'Type', width: '7%', render: b => <Badge color={b.type === 'our' ? 'green' : 'blue'}>{b.type === 'our' ? 'Our' : 'Out'}</Badge> },
    { key: 'who', label: 'Who', width: '13%', render: b => b.type === 'our' ? b.tutor_name : b.booker_name },
    { key: 'time', label: 'Time', width: '13%', render: b => `${b.start_time}–${b.end_time}` },
    { key: 'stu', label: 'Stu.', width: '5%', render: b => b.num_students },
    { key: 'amount', label: 'Fee', width: '8%', render: b => `${fmt(b.amount)} ฿` },
    { key: 'status', label: 'Status', width: '8%', render: b => <Badge color={b.status === 'confirmed' ? 'green' : 'red'}>{b.status}</Badge> },
    { key: 'paid', label: 'Paid', width: '7%', render: b => <Badge color={b.paid ? 'green' : 'red'}>{b.paid ? '✓' : '✗'}</Badge> },
    { key: 'evidence', label: 'Slip', width: '7%', render: b => b.evidence_url
      ? <a href={b.evidence_url} target="_blank" rel="noreferrer"><Badge color="green"><i className="ti ti-check" aria-hidden="true" /> View</Badge></a>
      : <Badge color="gray">—</Badge>
    },
    {
      key: 'actions', label: '', width: '15%',
      render: b => b.status !== 'cancelled' ? (
        <div className="flex gap-1 flex-wrap">
          {!b.paid
            ? <Button size="sm" variant="primary" onClick={() => openPay(b)}>Pay</Button>
            : <Button size="sm" variant="default" onClick={() => onTogglePaid(b.id, b.paid)}>Unpay</Button>
          }
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

      {payBooking && (
        <Modal title={`Record payment — ${payBooking.type === 'our' ? payBooking.tutor_name : payBooking.booker_name} (${payBooking.table_name})`} onClose={() => setPayId(null)}>
          <Alert color="amber">Amount due: <strong>{fmt(payBooking.amount)} THB</strong> · Table rental</Alert>
          <div className="mb-4">
            <FormGroup label="Payment method">
              <Select value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                <option>Cash</option>
                <option>PromptPay transfer</option>
                <option>Bank transfer</option>
              </Select>
            </FormGroup>
          </div>
          <div className="mb-4">
            <EvidenceUpload onFile={handleEvidenceFile} preview={payPreview} />
          </div>
          <Button variant="primary" size="lg" className="w-full justify-center" onClick={confirmPay} disabled={paying}>
            <i className="ti ti-check" aria-hidden="true" />
            {paying ? 'Saving...' : 'Confirm payment received'}
          </Button>
        </Modal>
      )}

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
            </div>
          )}
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-2 block">Table</label>
            <TableGrid unavailable={unavail} selected={form.table_name} onSelect={t => set('table_name', t)} />
            {unavail.length > 0 && <p className="text-xs text-amber-600 mt-2">{unavail.length} table(s) unavailable.</p>}
          </div>
          <FormRow>
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
