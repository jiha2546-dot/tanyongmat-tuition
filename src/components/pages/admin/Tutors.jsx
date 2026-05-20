import { useState } from 'react'
import { Card, SectionTitle, Button, Modal, FormRow, FormGroup, Input, Select, Badge, DataTable, Alert } from '../../shared/UI'

const TUTOR_TYPES = ['secondary', 'uni', 'grad', 'relative', 'other']
const TUTOR_TYPE_LABELS = {
  secondary: 'Secondary school student',
  uni: 'University student',
  grad: 'Graduate',
  relative: 'Relative',
  other: 'Other',
}
const TUTOR_TYPE_COLORS = {
  secondary: 'blue',
  uni: 'green',
  grad: 'purple',
  relative: 'amber',
  other: 'gray',
}

export function Tutors({ tutors, onAdd, onDeactivate }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: '', type: 'uni', subjects: '', phone: '',
  })
  const [saving, setSaving] = useState(false)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function save() {
    if (!form.name.trim()) { alert('Please enter tutor name.'); return }
    setSaving(true)
    await onAdd({
      name: form.name.trim(),
      type: form.type,
      subjects: form.subjects ? form.subjects.split(',').map(s => s.trim()).filter(Boolean) : [],
      phone: form.phone,
      active: true,
    })
    setForm({ name: '', type: 'uni', subjects: '', phone: '' })
    setShowForm(false)
    setSaving(false)
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-800">Tutors</h2>
        <Button variant="primary" onClick={() => setShowForm(s => !s)}>
          <i className="ti ti-plus" aria-hidden="true" /> Add tutor
        </Button>
      </div>

      <Alert color="blue">
        Tutors added here will appear in the dropdown when enrolling students or adding bookings. You can add more tutors anytime!
      </Alert>

      {showForm && (
        <Modal title="Add tutor" onClose={() => setShowForm(false)}>
          <FormRow>
            <FormGroup label="Full name">
              <Input
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="e.g. Aiman Bin Hassan"
              />
            </FormGroup>
            <FormGroup label="Type">
              <Select value={form.type} onChange={e => set('type', e.target.value)}>
                {TUTOR_TYPES.map(t => (
                  <option key={t} value={t}>{TUTOR_TYPE_LABELS[t]}</option>
                ))}
              </Select>
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup label="Subject specialties (comma separated)">
              <Input
                value={form.subjects}
                onChange={e => set('subjects', e.target.value)}
                placeholder="e.g. Math, Science"
              />
            </FormGroup>
            <FormGroup label="Phone (optional)">
              <Input
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="08x-xxx-xxxx"
              />
            </FormGroup>
          </FormRow>
          <Button variant="primary" size="lg" className="w-full justify-center" onClick={save} disabled={saving}>
            {saving ? 'Saving...' : 'Add tutor'}
          </Button>
        </Modal>
      )}

      {tutors.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <i className="ti ti-users text-4xl text-gray-200 block mb-3" aria-hidden="true" />
            <p className="text-sm text-gray-400 mb-1">No tutors yet</p>
            <p className="text-xs text-gray-300">Add your first tutor to get started</p>
          </div>
        </Card>
      ) : (
        <Card>
          <DataTable
            cols={[
              { key: 'name', label: 'Name', width: '25%', render: t => <span className="font-medium">{t.name}</span> },
              { key: 'type', label: 'Type', width: '22%', render: t => <Badge color={TUTOR_TYPE_COLORS[t.type]}>{TUTOR_TYPE_LABELS[t.type]}</Badge> },
              { key: 'subjects', label: 'Subjects', width: '30%', render: t => t.subjects?.length ? t.subjects.join(', ') : '—' },
              { key: 'phone', label: 'Phone', width: '15%', render: t => t.phone || '—' },
              {
                key: 'action', label: '', width: '8%',
                render: t => (
                  <Button size="sm" variant="danger" onClick={() => {
                    if (window.confirm(`Remove ${t.name} from tutor list?`)) onDeactivate(t.id)
                  }}>
                    Remove
                  </Button>
                )
              },
            ]}
            rows={tutors}
            empty="No tutors yet."
          />
        </Card>
      )}
    </div>
  )
}
