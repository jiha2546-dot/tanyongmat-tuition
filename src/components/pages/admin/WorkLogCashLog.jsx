import { useState } from 'react'
import { Card, SectionTitle, Button, Modal, FormRow, FormGroup, Input, Select, Textarea, Badge, DataTable } from '../../shared/UI'
import { fmt, fmtDate, today } from '../../../lib/utils'

export function WorkLog({ worklog, totalHours, byPerson, onAdd, onDelete }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ date: today(), worker_name: 'Teh Ming', hours: 3.5, shift: 'เย็น · Evening', note: '' })
  const [saving, setSaving] = useState(false)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function save() {
    setSaving(true)
    await onAdd({ ...form, hours: Number(form.hours) })
    setShowForm(false)
    setSaving(false)
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">บันทึกการทำงาน</h2>
          <p className="text-[10px] text-gray-400">Work log</p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(s => !s)}>
          <i className="ti ti-plus" aria-hidden="true" /> บันทึก · Log
        </Button>
      </div>

      {showForm && (
        <Modal title="บันทึกการทำงาน · Log work" onClose={() => setShowForm(false)}>
          <FormRow>
            <FormGroup label="วันที่ · Date"><Input type="date" value={form.date} onChange={e => set('date', e.target.value)} /></FormGroup>
            <FormGroup label="ผู้ทำงาน · Worker"><Input value={form.worker_name} onChange={e => set('worker_name', e.target.value)} /></FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup label="จำนวนชั่วโมง · Hours"><Input type="number" step="0.5" min="0.5" value={form.hours} onChange={e => set('hours', e.target.value)} /></FormGroup>
            <FormGroup label="กะ · Shift">
              <Select value={form.shift} onChange={e => set('shift', e.target.value)}>
                <option value="เช้า · Morning">เช้า · Morning</option>
                <option value="เย็น · Evening">เย็น · Evening</option>
                <option value="เต็มวัน · Full day">เต็มวัน · Full day</option>
              </Select>
            </FormGroup>
          </FormRow>
          <FormGroup label="หมายเหตุ · Note"><Textarea value={form.note} onChange={e => set('note', e.target.value)} rows={2} /></FormGroup>
          <Button variant="primary" size="lg" className="w-full justify-center mt-2" onClick={save} disabled={saving}>
            {saving ? 'กำลังบันทึก...' : 'บันทึก · Save'}
          </Button>
        </Modal>
      )}

      <div className="grid grid-cols-2 gap-3 mb-3">
        <Card>
          <div className="text-xs text-gray-400 mb-1">ชั่วโมงทำงานเดือนนี้ · Total hours this month</div>
          <div className="text-2xl font-bold text-green-600">{totalHours} <span className="text-sm font-normal text-gray-400">ชม. · hrs</span></div>
        </Card>
        <Card>
          <div className="text-xs text-gray-400 mb-2">ชั่วโมงตามผู้ทำงาน · By worker</div>
          {Object.entries(byPerson).map(([name, hrs]) => (
            <div key={name} className="flex justify-between text-xs"><span>{name}</span><span className="font-semibold">{hrs} ชม.</span></div>
          ))}
        </Card>
      </div>

      <Card>
        <DataTable
          cols={[
            { key: 'date', label: 'วันที่ · Date', width: '12%', render: w => fmtDate(w.date) },
            { key: 'worker_name', label: 'ผู้ทำงาน · Worker', width: '18%' },
            { key: 'hours', label: 'ชม. · Hrs', width: '10%', render: w => `${w.hours} ชม.` },
            { key: 'shift', label: 'กะ · Shift', width: '20%' },
            { key: 'note', label: 'หมายเหตุ · Note', width: '30%', render: w => <span className="text-gray-400">{w.note || '—'}</span> },
            { key: 'del', label: '', width: '10%', render: w => (
              <Button size="sm" variant="danger" onClick={() => onDelete(w.id)}>ลบ · Del</Button>
            )},
          ]}
          rows={worklog}
          empty="ยังไม่มีบันทึก · No entries yet."
        />
      </Card>
    </div>
  )
}

export function CashLog({ entries, income, expenses, distributable, onAdd, onDelete }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ date: today(), description: '', amount: '', type: 'income', category: '', note: '' })
  const [saving, setSaving] = useState(false)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function save() {
    if (!form.description || !form.amount) { alert('กรุณากรอกรายละเอียดและจำนวนเงิน · Please fill description and amount'); return }
    setSaving(true)
    await onAdd({ ...form, amount: Number(form.amount) })
    setShowForm(false)
    setSaving(false)
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">รายรับ-รายจ่าย</h2>
          <p className="text-[10px] text-gray-400">Cash log</p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(s => !s)}>
          <i className="ti ti-plus" aria-hidden="true" /> เพิ่มรายการ · Add entry
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <Card><div className="text-xs text-gray-400">รายรับ · Income</div><div className="text-xl font-bold text-green-600 mt-1">{fmt(income)} ฿</div></Card>
        <Card><div className="text-xs text-gray-400">รายจ่าย · Expenses</div><div className="text-xl font-bold text-red-500 mt-1">{fmt(expenses)} ฿</div></Card>
        <Card><div className="text-xs text-gray-400">คงเหลือ · Net</div><div className={`text-xl font-bold mt-1 ${distributable >= 0 ? 'text-green-600' : 'text-red-500'}`}>{fmt(distributable)} ฿</div></Card>
      </div>

      {showForm && (
        <Modal title="เพิ่มรายการ · Add entry" onClose={() => setShowForm(false)}>
          <FormRow>
            <FormGroup label="วันที่ · Date"><Input type="date" value={form.date} onChange={e => set('date', e.target.value)} /></FormGroup>
            <FormGroup label="ประเภท · Type">
              <Select value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="income">รายรับ · Income</option>
                <option value="expense">รายจ่าย · Expense</option>
              </Select>
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup label="รายละเอียด · Description"><Input value={form.description} onChange={e => set('description', e.target.value)} placeholder="รายละเอียด · Description" /></FormGroup>
            <FormGroup label="จำนวนเงิน · Amount (฿)"><Input type="number" min="0" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0" /></FormGroup>
          </FormRow>
          <FormGroup label="หมายเหตุ · Note"><Textarea value={form.note} onChange={e => set('note', e.target.value)} rows={2} /></FormGroup>
          <Button variant="primary" size="lg" className="w-full justify-center mt-2" onClick={save} disabled={saving}>
            {saving ? 'กำลังบันทึก...' : 'บันทึก · Save'}
          </Button>
        </Modal>
      )}

      <Card>
        <DataTable
          cols={[
            { key: 'date', label: 'วันที่ · Date', width: '11%', render: e => fmtDate(e.date) },
            { key: 'type', label: 'ประเภท · Type', width: '10%', render: e => <Badge color={e.type === 'income' ? 'green' : 'red'}>{e.type === 'income' ? 'รับ · In' : 'จ่าย · Out'}</Badge> },
            { key: 'description', label: 'รายละเอียด · Description', width: '35%' },
            { key: 'amount', label: 'จำนวน · Amount', width: '14%', render: e => <span className={e.type === 'income' ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'}>{e.type === 'income' ? '+' : '-'}{fmt(e.amount)} ฿</span> },
            { key: 'note', label: 'หมายเหตุ · Note', width: '20%', render: e => <span className="text-gray-400">{e.note || '—'}</span> },
            { key: 'del', label: '', width: '10%', render: e => <Button size="sm" variant="danger" onClick={() => onDelete(e.id)}>ลบ · Del</Button> },
          ]}
          rows={entries}
          empty="ยังไม่มีรายการ · No entries yet."
        />
      </Card>
    </div>
  )
}
