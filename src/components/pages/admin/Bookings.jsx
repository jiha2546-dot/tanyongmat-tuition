import { useState } from 'react'
import { Card, Button, Modal, FormRow, FormGroup, Input, Select, Badge, DataTable, Alert } from '../../shared/UI'
import { TableGrid } from '../../shared/TableGrid'
import { fmt, fmtDate, calcHours, calcFee, getUnavailableTables, today, TIME_SLOTS } from '../../../lib/utils'
import { supabase } from '../../../lib/supabase'

export function Bookings({ bookings, tutorNames = [], onAdd, onTogglePaid, onCancel, onUpdate }) {
  const [showForm, setShowForm] = useState(false)
  const [payId, setPayId] = useState(null)
  const [payPreview, setPayPreview] = useState(null)
  const [payFile, setPayFile] = useState(null)
  const [payMethod, setPayMethod] = useState('เงินสด · Cash')
  const [paying, setPaying] = useState(false)
  const [form, setForm] = useState({
    type: 'outside', booker_name: '', booker_phone: '', tutor_name: '',
    subject: '', table_name: '', date: today(), start_time: '17:00',
    end_time: '18:00', num_students: 1, paid: false, amount: 20,
  })
  const [saving, setSaving] = useState(false)

  const unavail = form.date && form.start_time && form.end_time
    ? getUnavailableTables(bookings, form.date, form.start_time, form.end_time) : []

  function set(k, v) {
    setForm(f => {
      const updated = { ...f, [k]: v }
      if ((k === 'start_time' || k === 'end_time') && updated.start_time && updated.end_time)
        updated.amount = calcFee(updated.start_time, updated.end_time)
      return updated
    })
  }

  async function save() {
    if (!form.table_name) { alert('กรุณาเลือกโต๊ะ · Please select a table.'); return }
    setSaving(true)
    await onAdd({ ...form, hours: calcHours(form.start_time, form.end_time), status: 'confirmed', amount: calcFee(form.start_time, form.end_time) })
    setShowForm(false); setSaving(false)
  }

  function openPay(b) { setPayId(b.id); setPayPreview(b.evidence_url || null); setPayFile(null); setPayMethod('เงินสด · Cash') }

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
      const { data: uploadData, error: uploadError } = await supabase.storage.from('evidence').upload(path, payFile, { upsert: true })
      if (!uploadError && uploadData) {
        const { data: { publicUrl } } = supabase.storage.from('evidence').getPublicUrl(path)
        evidence_url = publicUrl
      }
    }
    const { error } = await supabase.from('bookings').update({ paid: true, evidence_url, pay_method: payMethod }).eq('id', payId)
    if (!error) {
      onUpdate && onUpdate(payId, { paid: true, evidence_url, pay_method: payMethod })
      const b = bookings.find(x => x.id === payId)
      if (b) {
        await supabase.from('cash_entries').insert([{
          date: new Date().toISOString().slice(0,10),
          description: `ค่าเช่าโต๊ะ · Table rental — ${b.type === 'our' ? b.tutor_name : b.booker_name} (${b.table_name})`,
          amount: b.amount, type: 'income',
          note: `วิธีชำระ · Payment: ${payMethod}${evidence_url ? ' · มีสลิป' : ''}`,
        }])
      }
    }
    setPayId(null); setPayPreview(null); setPayFile(null); setPaying(false)
  }

  const payBooking = payId ? bookings.find(b => b.id === payId) : null

  const cols = [
    { key: 'date', label: 'วันที่ · Date', width: '9%', render: b => fmtDate(b.date) },
    { key: 'table_name', label: 'โต๊ะ · Table', width: '8%' },
    { key: 'type', label: 'ประเภท', width: '7%', render: b => <Badge color={b.type === 'our' ? 'green' : 'blue'}>{b.type === 'our' ? 'เรา' : 'นอก'}</Badge> },
    { key: 'who', label: 'ผู้จอง · Who', width: '13%', render: b => b.type === 'our' ? b.tutor_name : b.booker_name },
    { key: 'time', label: 'เวลา · Time', width: '13%', render: b => `${b.start_time}–${b.end_time}` },
    { key: 'stu', label: 'นร.', width: '5%', render: b => b.num_students },
    { key: 'amount', label: 'ค่าเช่า · Fee', width: '8%', render: b => `${fmt(b.amount)} ฿` },
    { key: 'status', label: 'สถานะ', width: '8%', render: b => <Badge color={b.status === 'confirmed' ? 'green' : 'red'}>{b.status === 'confirmed' ? 'ยืนยัน' : 'ยกเลิก'}</Badge> },
    { key: 'paid', label: 'ชำระ', width: '7%', render: b => <Badge color={b.paid ? 'green' : 'red'}>{b.paid ? '✓' : '✗'}</Badge> },
    { key: 'evidence', label: 'สลิป', width: '7%', render: b => b.evidence_url
      ? <a href={b.evidence_url} target="_blank" rel="noreferrer"><Badge color="green">ดู</Badge></a>
      : <Badge color="gray">—</Badge> },
    { key: 'actions', label: '', width: '15%',
      render: b => b.status !== 'cancelled' ? (
        <div className="flex gap-1 flex-wrap">
          {!b.paid ? <Button size="sm" variant="primary" onClick={() => openPay(b)}>รับเงิน</Button>
            : <Button size="sm" variant="default" onClick={() => onTogglePaid(b.id, b.paid)}>ยกเลิก</Button>}
          <Button size="sm" variant="danger" onClick={() => onCancel(b.id)}>✕</Button>
        </div>
      ) : <span className="text-xs text-gray-300">ยกเลิกแล้ว</span> },
  ]

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">การจองทั้งหมด</h2>
          <p className="text-[10px] text-gray-400">All bookings</p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(s => !s)}>
          <i className="ti ti-plus" /> เพิ่มการจอง · Add
        </Button>
      </div>

      {payBooking && (
        <Modal title={`รับชำระ · Payment — ${payBooking.type === 'our' ? payBooking.tutor_name : payBooking.booker_name} (${payBooking.table_name})`} onClose={() => setPayId(null)}>
          <Alert color="amber">ยอดชำระ · Amount: <strong>{fmt(payBooking.amount)} ฿</strong></Alert>
          <div className="mb-4">
            <FormGroup label="วิธีชำระ · Payment method">
              <Select value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                <option>เงินสด · Cash</option>
                <option>พร้อมเพย์ · PromptPay</option>
                <option>โอนธนาคาร · Bank transfer</option>
              </Select>
            </FormGroup>
          </div>
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-2 block">อัปโหลดสลิป · Upload slip (ไม่บังคับ · optional)</label>
            <input type="file" accept="image/*" onChange={e => handleEvidenceFile(e.target.files[0])}
              className="text-xs text-gray-600 w-full border border-gray-200 rounded-lg px-3 py-2" />
            {payPreview && <img src={payPreview} alt="slip" className="mt-2 w-full max-h-40 object-contain rounded-lg border border-gray-100" />}
          </div>
          <Button variant="primary" size="lg" className="w-full justify-center" onClick={confirmPay} disabled={paying}>
            {paying ? 'กำลังบันทึก...' : 'ยืนยันการรับเงิน · Confirm payment'}
          </Button>
        </Modal>
      )}

      {showForm && (
        <Modal title="เพิ่มการจอง · Add booking" onClose={() => setShowForm(false)}>
          <FormRow>
            <FormGroup label="ประเภท · Type">
              <Select value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="outside">ครูภายนอก / ผู้ปกครอง · Outside</option>
                <option value="our">ติวเตอร์เรา · Our tutor</option>
              </Select>
            </FormGroup>
            <FormGroup label={form.type === 'our' ? 'ชื่อติวเตอร์ · Tutor' : 'ชื่อผู้จอง · Name'}>
              {form.type === 'our' && tutorNames.length > 0
                ? <Select value={form.booker_name} onChange={e => set('booker_name', e.target.value)}>
                    <option value="">เลือกติวเตอร์ · Select…</option>
                    {tutorNames.map(t => <option key={t}>{t}</option>)}
                  </Select>
                : <Input value={form.booker_name} onChange={e => set('booker_name', e.target.value)} placeholder="ชื่อ · Name" />}
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup label="วันที่ · Date"><Input type="date" value={form.date} onChange={e => set('date', e.target.value)} /></FormGroup>
            <FormGroup label="จำนวนนักเรียน · Students"><Input type="number" min="1" max="5" value={form.num_students} onChange={e => set('num_students', parseInt(e.target.value))} /></FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup label="เวลาเริ่ม · Start">
              <select className="text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white w-full focus:outline-none focus:ring-2 focus:ring-green-200"
                value={form.start_time} onChange={e => set('start_time', e.target.value)}>
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="เวลาสิ้นสุด · End">
              <select className="text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white w-full focus:outline-none focus:ring-2 focus:ring-green-200"
                value={form.end_time} onChange={e => set('end_time', e.target.value)}>
                {TIME_SLOTS.filter(t => t > form.start_time).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormGroup>
          </FormRow>
          {form.start_time && form.end_time && form.end_time > form.start_time && (
            <div className="text-xs text-green-600 mb-3 px-1">ค่าเช่า · Fee: <strong>{calcFee(form.start_time, form.end_time)} ฿</strong></div>
          )}
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-2 block">เลือกโต๊ะ · Select table</label>
            <TableGrid unavailable={unavail} selected={form.table_name} onSelect={t => set('table_name', t)} />
          </div>
          <Button variant="primary" size="lg" className="w-full justify-center" onClick={save} disabled={saving}>
            {saving ? 'กำลังบันทึก...' : 'บันทึกการจอง · Save'}
          </Button>
        </Modal>
      )}

      <Card><DataTable cols={cols} rows={bookings} empty="ยังไม่มีการจอง · No bookings yet." /></Card>
    </div>
  )
}
