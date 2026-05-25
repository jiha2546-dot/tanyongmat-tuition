import { useState } from 'react'
import { Card, Button, Modal, FormRow, FormGroup, Input, Select, Badge, DataTable, Alert } from '../../shared/UI'

const TUTOR_TYPES = ['secondary', 'uni', 'grad', 'relative', 'other']
const TUTOR_TYPE_LABELS = {
  secondary: 'นักเรียนมัธยม · Secondary student',
  uni: 'นักศึกษามหาวิทยาลัย · University student',
  grad: 'บัณฑิต · Graduate',
  relative: 'ญาติ · Relative',
  other: 'อื่นๆ · Other',
}
const TUTOR_TYPE_COLORS = { secondary: 'blue', uni: 'green', grad: 'purple', relative: 'amber', other: 'gray' }

export function Tutors({ tutors, onAdd, onDeactivate }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'uni', subjects: '', phone: '' })
  const [saving, setSaving] = useState(false)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function save() {
    if (!form.name.trim()) { alert('กรุณากรอกชื่อติวเตอร์ · Please enter tutor name.'); return }
    setSaving(true)
    await onAdd({
      name: form.name.trim(), type: form.type,
      subjects: form.subjects ? form.subjects.split(',').map(s => s.trim()).filter(Boolean) : [],
      phone: form.phone, active: true,
    })
    setForm({ name: '', type: 'uni', subjects: '', phone: '' })
    setShowForm(false)
    setSaving(false)
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">ติวเตอร์</h2>
          <p className="text-[10px] text-gray-400">Tutors</p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(s => !s)}>
          <i className="ti ti-plus" aria-hidden="true" /> เพิ่มติวเตอร์ · Add tutor
        </Button>
      </div>

      <Alert color="blue">
        ติวเตอร์ที่เพิ่มที่นี่จะปรากฏในเมนูเลือกเมื่อลงทะเบียนนักเรียน · Tutors added here will appear in dropdowns when enrolling students.
      </Alert>

      {showForm && (
        <Modal title="เพิ่มติวเตอร์ · Add tutor" onClose={() => setShowForm(false)}>
          <FormRow>
            <FormGroup label="ชื่อ-นามสกุล · Full name">
              <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="เช่น · e.g. อาหมัด บิน ฮัสซัน" />
            </FormGroup>
            <FormGroup label="ประเภท · Type">
              <Select value={form.type} onChange={e => set('type', e.target.value)}>
                {TUTOR_TYPES.map(t => <option key={t} value={t}>{TUTOR_TYPE_LABELS[t]}</option>)}
              </Select>
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup label="วิชาที่สอน · Subjects (คั่นด้วยจุลภาค · comma separated)">
              <Input value={form.subjects} onChange={e => set('subjects', e.target.value)} placeholder="เช่น · e.g. คณิตศาสตร์, วิทยาศาสตร์" />
            </FormGroup>
            <FormGroup label="เบอร์โทร · Phone (ไม่บังคับ · optional)">
              <Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="08x-xxx-xxxx" />
            </FormGroup>
          </FormRow>
          <Button variant="primary" size="lg" className="w-full justify-center" onClick={save} disabled={saving}>
            {saving ? 'กำลังบันทึก... · Saving...' : 'บันทึก · Save'}
          </Button>
        </Modal>
      )}

      {tutors.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <i className="ti ti-users text-4xl text-gray-200 block mb-3" aria-hidden="true" />
            <p className="text-sm text-gray-400 mb-1">ยังไม่มีติวเตอร์ · No tutors yet</p>
            <p className="text-xs text-gray-300">เพิ่มติวเตอร์คนแรกเพื่อเริ่มต้น · Add your first tutor to get started</p>
          </div>
        </Card>
      ) : (
        <Card>
          <DataTable
            cols={[
              { key: 'name', label: 'ชื่อ · Name', width: '25%', render: t => <span className="font-medium">{t.name}</span> },
              { key: 'type', label: 'ประเภท · Type', width: '25%', render: t => <Badge color={TUTOR_TYPE_COLORS[t.type]}>{TUTOR_TYPE_LABELS[t.type]}</Badge> },
              { key: 'subjects', label: 'วิชา · Subjects', width: '28%', render: t => t.subjects?.length ? t.subjects.join(', ') : '—' },
              { key: 'phone', label: 'โทร · Phone', width: '14%', render: t => t.phone || '—' },
              { key: 'action', label: '', width: '8%', render: t => (
                <Button size="sm" variant="danger" onClick={() => { if (window.confirm(`ลบ ${t.name} ออกจากรายชื่อติวเตอร์?`)) onDeactivate(t.id) }}>
                  ลบ · Remove
                </Button>
              )},
            ]}
            rows={tutors}
            empty="ยังไม่มีติวเตอร์ · No tutors yet."
          />
        </Card>
      )}
    </div>
  )
}
