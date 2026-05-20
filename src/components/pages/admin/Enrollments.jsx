import { useState } from 'react'
import { Card, SectionTitle, Button, Modal, FormRow, FormGroup, Input, Select, Badge, DataTable, Alert } from '../../shared/UI'
import { PaymentModal } from '../../shared/PaymentModal'
import { fmt, fmtDate, SUBJECTS, TUTORS, COURSE_PRICES, today } from '../../../lib/utils'

export function Enrollments({ enrollments, students, onAdd, onRecordPayment, onMarkUnpaid }) {
  const [showForm, setShowForm] = useState(false)
  const [payId, setPayId] = useState(null)
  const [form, setForm] = useState({
    student_id: '', subject: SUBJECTS[0], tutor: TUTORS[0],
    type: 'course', course_type: '1on1', amount: 2800, paid: false, notes: '',
  })
  const [saving, setSaving] = useState(false)

  function set(k, v) {
    setForm(f => {
      const updated = { ...f, [k]: v }
      if (k === 'course_type') updated.amount = COURSE_PRICES[v] || 1600
      if (k === 'type' && v === 'hourly') updated.amount = 70
      return updated
    })
  }

  async function save() {
    if (!form.student_id) { alert('Please select a student.'); return }
    setSaving(true)
    await onAdd({ ...form, amount: Number(form.amount) })
    setShowForm(false)
    setSaving(false)
  }

  const payEnrollment = payId ? enrollments.find(e => e.id === payId) : null
  const paid = enrollments.filter(e => e.paid).reduce((s, e) => s + Number(e.amount), 0)
  const outstanding = enrollments.filter(e => !e.paid).reduce((s, e) => s + Number(e.amount), 0)
  const rate = enrollments.length ? Math.round(enrollments.filter(e => e.paid).length / enrollments.length * 100) : 0

  return (
    <div className="p-4">
      {payEnrollment && (
        <PaymentModal
          enrollment={payEnrollment}
          onConfirm={async (data) => { await onRecordPayment(payId, data); setPayId(null) }}
          onClose={() => setPayId(null)}
        />
      )}

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-800">Courses & Payments</h2>
        <Button variant="primary" onClick={() => setShowForm(s => !s)}>
          <i className="ti ti-plus" aria-hidden="true" /> Add enrollment
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-green-50 rounded-xl p-3">
          <div className="text-xs text-gray-400">Paid</div>
          <div className="text-xl font-semibold text-green-600">{fmt(paid)} ฿</div>
          <div className="text-[10px] text-gray-300">{enrollments.filter(e => e.paid).length} enrollments</div>
        </div>
        <div className="bg-red-50 rounded-xl p-3">
          <div className="text-xs text-gray-400">Outstanding</div>
          <div className="text-xl font-semibold text-red-500">{fmt(outstanding)} ฿</div>
          <div className="text-[10px] text-gray-300">{enrollments.filter(e => !e.paid).length} unpaid</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-400">Collection rate</div>
          <div className="text-xl font-semibold">{rate}%</div>
        </div>
      </div>

      {showForm && (
        <Modal title="Add enrollment" onClose={() => setShowForm(false)}>
          <FormRow>
            <FormGroup label="Student">
              <Select value={form.student_id} onChange={e => set('student_id', e.target.value)}>
                <option value="">Select student…</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </FormGroup>
            <FormGroup label="Subject / Course">
              <Select value={form.subject} onChange={e => set('subject', e.target.value)}>
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </Select>
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup label="Tutor">
              <Select value={form.tutor} onChange={e => set('tutor', e.target.value)}>
                {TUTORS.map(t => <option key={t}>{t}</option>)}
              </Select>
            </FormGroup>
            <FormGroup label="Type">
              <Select value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="course">Full course</option>
                <option value="hourly">Hourly</option>
              </Select>
            </FormGroup>
          </FormRow>
          {form.type === 'course' && (
            <FormRow>
              <FormGroup label="Course type">
                <Select value={form.course_type} onChange={e => set('course_type', e.target.value)}>
                  <option value="1on1">1-on-1 (2,800 ฿)</option>
                  <option value="small group">Small group 2–3 (2,200 ฿)</option>
                  <option value="group">Group 4–5 (1,600 ฿)</option>
                </Select>
              </FormGroup>
              <FormGroup label="Amount (฿)">
                <Input type="number" value={form.amount} onChange={e => set('amount', e.target.value)} />
              </FormGroup>
            </FormRow>
          )}
          {form.type === 'hourly' && (
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
          )}
          <div className="mb-4">
            <FormGroup label="Notes">
              <Input value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Optional notes" />
            </FormGroup>
          </div>
          <Button variant="primary" size="lg" className="w-full justify-center" onClick={save} disabled={saving}>
            {saving ? 'Saving...' : 'Save enrollment'}
          </Button>
        </Modal>
      )}

      <Card>
        <DataTable
          cols={[
            { key: 'student', label: 'Student', width: '16%', render: e => <span className="font-medium">{e.students?.name || '—'}</span> },
            { key: 'subject', label: 'Subject', width: '10%', render: e => <Badge color="blue">{e.subject}</Badge> },
            { key: 'tutor', label: 'Tutor', width: '13%' },
            { key: 'type', label: 'Type', width: '11%', render: e => <Badge color={e.type === 'course' ? 'green' : 'amber'}>{e.type === 'course' ? e.course_type : 'Hourly'}</Badge> },
            { key: 'amount', label: 'Amount', width: '9%', render: e => <span className={`font-semibold ${e.paid ? 'text-green-600' : 'text-red-500'}`}>{fmt(e.amount)} ฿</span> },
            { key: 'status', label: 'Status', width: '9%', render: e => <Badge color={e.paid ? 'green' : 'red'}>{e.paid ? 'Paid' : 'Unpaid'}</Badge> },
            { key: 'pay_method', label: 'Method', width: '9%', render: e => e.pay_method || '—' },
            { key: 'pay_date', label: 'Date', width: '8%', render: e => e.pay_date ? fmtDate(e.pay_date) : '—' },
            {
              key: 'evidence', label: 'Evidence', width: '8%',
              render: e => e.evidence_url
                ? <a href={e.evidence_url} target="_blank" rel="noreferrer"><Badge color="green"><i className="ti ti-check mr-0.5" aria-hidden="true" />View</Badge></a>
                : <Badge color="gray">None</Badge>
            },
            {
              key: 'action', label: '', width: '7%',
              render: e => e.paid
                ? <Button size="sm" variant="danger" onClick={() => onMarkUnpaid(e.id)}>✕</Button>
                : <Button size="sm" variant="primary" onClick={() => setPayId(e.id)}><i className="ti ti-cash" aria-hidden="true" />Pay</Button>
            },
          ]}
          rows={enrollments}
          empty="No enrollments yet."
        />
      </Card>
    </div>
  )
}
