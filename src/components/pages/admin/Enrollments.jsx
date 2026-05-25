import { useState } from 'react'
import { Card, Button, Modal, FormRow, FormGroup, Input, Select, Badge, DataTable, Alert } from '../../shared/UI'
import { fmt, fmtDate, SUBJECTS, COURSE_PRICES, today } from '../../../lib/utils'

const COURSE_TYPES = ['1on1', 'small group', 'group']
const COURSE_TYPE_LABELS = { '1on1': '1 ต่อ 1 · 1-on-1', 'small group': 'กลุ่มเล็ก 2-3 คน · Small group', 'group': 'กลุ่ม 4-5 คน · Group' }

export function Enrollments({ enrollments, students, tutorNames = [], onAdd, onRecordPayment, onMarkUnpaid }) {
  const [showForm, setShowForm] = useState(false)
  const [payId, setPayId] = useState(null)
  const [payAmount, setPayAmount] = useState('')
  const [payDate, setPayDate] = useState(today())
  const [payMethod, setPayMethod] = useState('เงินสด · Cash')
  const [payFile, setPayFile] = useState(null)
  const [payPreview, setPayPreview] = useState(null)
  const [paying, setPaying] = useState(false)
  const [form, setForm] = useState({
    student_id: '', subject: SUBJECTS[0], tutor: '',
    type: 'course', course_type: '1on1', amount: COURSE_PRICES['1on1'],
    notes: '',
  })
  const [saving, setSaving] = useState(false)

  function set(k, v) {
    setForm(f => {
      const updated = { ...f, [k]: v }
      if (k === 'course_type') updated.amount = COURSE_PRICES[v] || 0
      if (k === 'type' && v === 'hourly') updated.amount = 0
      return updated
    })
  }

  async function save() {
    if (!form.student_id) { alert('กรุณาเลือกนักเรียน · Please select a student.'); return }
    if (!form.tutor) { alert('กรุณาเลือกติวเตอร์ · Please select a tutor.'); return }
    setSaving(true)
    await onAdd({ ...form, paid: false })
    setShowForm(false); setSaving(false)
  }

  function openPay(e) {
    setPayId(e.id)
    setPayAmount(e.amount || '')
    setPayDate(today())
    setPayMethod('เงินสด · Cash')
    setPayFile(null)
    setPayPreview(null)
  }

  function handleFile(file) {
    if (!file) return
    setPayFile(file)
    const reader = new FileReader()
    reader.onload = e => setPayPreview(e.target.result)
    reader.readAsDataURL(file)
  }

  async function confirmPay() {
    if (!payId) return
    setPaying(true)
    await onRecordPayment(payId, { amount: Number(payAmount), payDate, payMethod, evidenceFile: payFile })
    setPayId(null); setPaying(false)
  }

  const payEnr = payId ? enrollments.find(e => e.id === payId) : null
  const payStudent = payEnr ? students.find(s => s.id === payEnr.student_id) : null

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">คอร์สและการชำระเงิน</h2>
          <p className="text-[10px] text-gray-400">Courses & Payments</p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(s => !s)}>
          <i className="ti ti-plus" /> ลงทะเบียน · Enroll
        </Button>
      </div>

      {showForm && (
        <Modal title="ลงทะเบียนนักเรียน · Enroll student" onClose={() => setShowForm(false)}>
          <FormRow>
            <FormGroup label="นักเรียน · Student">
              <Select value={form.student_id} onChange={e => set('student_id', e.target.value)}>
                <option value="">เลือกนักเรียน · Select student…</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.level})</option>)}
              </Select>
            </FormGroup>
            <FormGroup label="ติวเตอร์ · Tutor">
              <Select value={form.tutor} onChange={e => set('tutor', e.target.value)}>
                <option value="">เลือกติวเตอร์ · Select tutor…</option>
                {tutorNames.map(t => <option key={t}>{t}</option>)}
              </Select>
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup label="วิชา · Subject">
              <Select value={form.subject} onChange={e => set('subject', e.target.value)}>
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </Select>
            </FormGroup>
            <FormGroup label="ประเภท · Type">
              <Select value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="course">คอร์ส · Course</option>
                <option value="hourly">รายชั่วโมง · Hourly</option>
              </Select>
            </FormGroup>
          </FormRow>
          {form.type === 'course' && (
            <FormRow>
              <FormGroup label="รูปแบบ · Course type">
                <Select value={form.course_type} onChange={e => set('course_type', e.target.value)}>
                  {COURSE_TYPES.map(t => <option key={t} value={t}>{COURSE_TYPE_LABELS[t]}</option>)}
                </Select>
              </FormGroup>
              <FormGroup label="ราคา · Price (฿)">
                <Input type="number" value={form.amount} onChange={e => set('amount', e.target.value)} />
              </FormGroup>
            </FormRow>
          )}
          <Button variant="primary" size="lg" className="w-full justify-center mt-2" onClick={save} disabled={saving}>
            {saving ? 'กำลังบันทึก...' : 'บันทึก · Save'}
          </Button>
        </Modal>
      )}

      {payEnr && payStudent && (
        <Modal title={`รับชำระ · Payment — ${payStudent.name} / ${payEnr.subject}`} onClose={() => setPayId(null)}>
          <Alert color="amber">ราคาแนะนำ · Suggested: <strong>{fmt(payEnr.amount)} ฿</strong></Alert>
          <FormRow>
            <FormGroup label="จำนวนเงิน · Amount (฿)">
              <Input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} />
            </FormGroup>
            <FormGroup label="วันที่ชำระ · Payment date">
              <Input type="date" value={payDate} onChange={e => setPayDate(e.target.value)} />
            </FormGroup>
          </FormRow>
          <FormGroup label="วิธีชำระ · Payment method">
            <Select value={payMethod} onChange={e => setPayMethod(e.target.value)}>
              <option>เงินสด · Cash</option>
              <option>พร้อมเพย์ · PromptPay</option>
              <option>โอนธนาคาร · Bank transfer</option>
            </Select>
          </FormGroup>
          <div className="mb-4 mt-2">
            <label className="text-xs text-gray-400 mb-2 block">อัปโหลดสลิป · Upload slip (ไม่บังคับ · optional)</label>
            <input type="file" accept="image/*" onChange={e => handleFile(e.target.files[0])}
              className="text-xs text-gray-600 w-full border border-gray-200 rounded-lg px-3 py-2" />
            {payPreview && <img src={payPreview} alt="slip" className="mt-2 w-full max-h-40 object-contain rounded-lg border border-gray-100" />}
          </div>
          <Button variant="primary" size="lg" className="w-full justify-center" onClick={confirmPay} disabled={paying}>
            {paying ? 'กำลังบันทึก...' : 'ยืนยันการรับเงิน · Confirm payment'}
          </Button>
        </Modal>
      )}

      <Card>
        <DataTable
          cols={[
            { key: 'student', label: 'นักเรียน · Student', width: '14%', render: e => students.find(s=>s.id===e.student_id)?.name || '—' },
            { key: 'subject', label: 'วิชา · Subject', width: '10%' },
            { key: 'tutor', label: 'ติวเตอร์ · Tutor', width: '12%' },
            { key: 'type', label: 'ประเภท', width: '8%', render: e => <Badge color={e.type==='course'?'green':'blue'}>{e.type==='course'?'คอร์ส':'ชม.'}</Badge> },
            { key: 'course_type', label: 'รูปแบบ', width: '10%', render: e => e.course_type ? COURSE_TYPE_LABELS[e.course_type] : '—' },
            { key: 'amount', label: 'ราคา · Price', width: '9%', render: e => `${fmt(e.amount)} ฿` },
            { key: 'paid', label: 'ชำระ · Paid', width: '8%', render: e => <Badge color={e.paid?'green':'red'}>{e.paid?'✓ ชำระแล้ว':'✗ ค้างชำระ'}</Badge> },
            { key: 'pay_date', label: 'วันที่ชำระ', width: '9%', render: e => e.pay_date ? fmtDate(e.pay_date) : '—' },
            { key: 'evidence', label: 'สลิป · Slip', width: '9%', render: e => e.evidence_url
              ? <a href={e.evidence_url} target="_blank" rel="noreferrer" className="flex items-center gap-1">
                  <img src={e.evidence_url} alt="slip" className="w-8 h-6 object-cover rounded border border-gray-200" />
                  <span className="text-green-600 text-xs">ดู</span>
                </a>
              : <span className="text-gray-300 text-xs">—</span>
            },
            { key: 'actions', label: '', width: '11%', render: e => (
              <div className="flex gap-1">
                {!e.paid
                  ? <Button size="sm" variant="primary" onClick={() => openPay(e)}>รับเงิน</Button>
                  : <Button size="sm" variant="default" onClick={() => onMarkUnpaid(e.id)}>ยกเลิก</Button>
                }
              </div>
            )},
          ]}
          rows={enrollments}
          empty="ยังไม่มีการลงทะเบียน · No enrollments yet."
        />
      </Card>
    </div>
  )
}
