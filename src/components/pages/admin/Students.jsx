import { useState } from 'react'
import { Card, SectionTitle, Button, Modal, FormRow, FormGroup, Input, Select, Textarea, Badge, DataTable } from '../../shared/UI'
import { fmtDate, LEVELS, today } from '../../../lib/utils'

export function Students({ students, enrollments, onAdd, readOnly = false }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', age: 8, level: 'P1', school: 'Laemthong', notes: '', join_date: today() })
  const [saving, setSaving] = useState(false)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function save() {
    if (!form.name) { alert('Please enter student name.'); return }
    setSaving(true)
    await onAdd({ ...form, age: Number(form.age) })
    setShowForm(false)
    setSaving(false)
  }

  // Subject counts for insights
  const subjectCounts = {}
  enrollments.forEach(e => { subjectCounts[e.subject] = (subjectCounts[e.subject] || 0) + 1 })

  const levelCounts = {}
  students.forEach(s => { levelCounts[s.level] = (levelCounts[s.level] || 0) + 1 })

  const avgAge = students.length
    ? (students.reduce((s, x) => s + Number(x.age), 0) / students.length).toFixed(1)
    : '—'

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-800">Students</h2>
        {!readOnly && (
          <Button variant="primary" onClick={() => setShowForm(s => !s)}>
            <i className="ti ti-plus" aria-hidden="true" /> Add student
          </Button>
        )}
      </div>

      {showForm && (
        <Modal title="Add student" onClose={() => setShowForm(false)}>
          <FormRow>
            <FormGroup label="Full name">
              <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Student full name" />
            </FormGroup>
            <FormGroup label="Age">
              <Input type="number" min="4" max="18" value={form.age} onChange={e => set('age', e.target.value)} />
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup label="Level">
              <Select value={form.level} onChange={e => set('level', e.target.value)}>
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </Select>
            </FormGroup>
            <FormGroup label="School">
              <Input value={form.school} onChange={e => set('school', e.target.value)} />
            </FormGroup>
          </FormRow>
          <div className="mb-4">
            <FormGroup label="Notes">
              <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Any relevant notes..." />
            </FormGroup>
          </div>
          <Button variant="primary" size="lg" className="w-full justify-center" onClick={save} disabled={saving}>
            {saving ? 'Saving...' : 'Save student'}
          </Button>
        </Modal>
      )}

      <Card>
        <DataTable
          cols={[
            { key: 'name', label: 'Name', width: '20%', render: s => <span className="font-medium">{s.name}</span> },
            { key: 'age', label: 'Age', width: '8%', render: s => `${s.age}y` },
            { key: 'level', label: 'Level', width: '8%' },
            { key: 'school', label: 'School', width: '14%' },
            { key: 'join_date', label: 'Joined', width: '10%', render: s => fmtDate(s.join_date) },
            {
              key: 'courses', label: 'Enrolled subjects', width: '28%',
              render: s => {
                const enr = enrollments.filter(e => e.student_id === s.id)
                return enr.length
                  ? <div className="flex flex-wrap gap-1">{enr.map(e => <Badge key={e.id} color={e.paid ? 'green' : 'red'}>{e.subject}</Badge>)}</div>
                  : <span className="text-gray-300 text-xs">None yet</span>
              }
            },
            { key: 'notes', label: 'Notes', width: '12%', render: s => <span className="text-gray-400">{s.notes || '—'}</span> },
          ]}
          rows={students}
          empty="No students yet."
        />
      </Card>

      <Card>
        <SectionTitle icon="ti-chart-bar">Data insights</SectionTitle>
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <div className="font-medium text-gray-500 mb-2">Popular subjects</div>
            {Object.entries(subjectCounts).sort((a, b) => b[1] - a[1]).map(([s, c]) => (
              <div key={s} className="flex justify-between py-1 border-b border-gray-50">
                <span>{s}</span><span className="font-semibold">{c}</span>
              </div>
            ))}
          </div>
          <div>
            <div className="font-medium text-gray-500 mb-2">Levels</div>
            {Object.entries(levelCounts).sort().map(([l, c]) => (
              <div key={l} className="flex justify-between py-1 border-b border-gray-50">
                <span>{l}</span><span className="font-semibold">{c}</span>
              </div>
            ))}
          </div>
          <div>
            <div className="font-medium text-gray-500 mb-2">Enrollment types</div>
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span>Course</span><span className="font-semibold">{enrollments.filter(e => e.type === 'course').length}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span>Hourly</span><span className="font-semibold">{enrollments.filter(e => e.type === 'hourly').length}</span>
            </div>
            <div className="mt-3 text-gray-400">Avg age: <span className="font-semibold text-gray-600">{avgAge}y</span></div>
          </div>
        </div>
      </Card>
    </div>
  )
}
