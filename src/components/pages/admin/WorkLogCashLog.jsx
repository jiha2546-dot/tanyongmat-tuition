import { useState } from 'react'
import { Card, SectionTitle, Button, Modal, FormRow, FormGroup, Input, Select, Badge, DataTable, Metric, MetricsGrid } from '../../shared/UI'
import { fmt, fmtDate, SHIFTS, EXPENSE_CATS, today } from '../../../lib/utils'

// ── Work Log ──────────────────────────────────────────────────────────────────
export function WorkLog({ worklog, totalHours, byPerson, distributable, onAdd, onDelete }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ date: today(), worker_name: 'Teh Ming', hours: 3.5, shift: 'evening', note: '' })
  const [saving, setSaving] = useState(false)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function save() {
    setSaving(true)
    await onAdd({ ...form, hours: Number(form.hours) })
    setShowForm(false)
    setSaving(false)
  }

  const laborPool = distributable * 0.4

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-800">Work log</h2>
        <Button variant="primary" onClick={() => setShowForm(s => !s)}>
          <i className="ti ti-plus" aria-hidden="true" /> Add entry
        </Button>
      </div>

      {showForm && (
        <Modal title="Add work log entry" onClose={() => setShowForm(false)}>
          <FormRow>
            <FormGroup label="Date">
              <Input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            </FormGroup>
            <FormGroup label="Who worked">
              <Input value={form.worker_name} onChange={e => set('worker_name', e.target.value)} placeholder="Name" />
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup label="Hours">
              <Input type="number" step="0.5" min="0.5" max="12" value={form.hours} onChange={e => set('hours', e.target.value)} />
            </FormGroup>
            <FormGroup label="Shift">
              <Select value={form.shift} onChange={e => set('shift', e.target.value)}>
                {SHIFTS.map(s => <option key={s}>{s}</option>)}
              </Select>
            </FormGroup>
          </FormRow>
          <div className="mb-4">
            <FormGroup label="Note">
              <Input value={form.note} onChange={e => set('note', e.target.value)} placeholder="Optional note" />
            </FormGroup>
          </div>
          <Button variant="primary" size="lg" className="w-full justify-center" onClick={save} disabled={saving}>
            {saving ? 'Saving...' : 'Save entry'}
          </Button>
        </Modal>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <Metric label="Total hours" value={`${totalHours}h`} />
        {Object.entries(byPerson).map(([name, hours]) => (
          <Metric
            key={name}
            label={name}
            value={`${hours}h`}
            sub={`${totalHours ? Math.round(hours / totalHours * 100) : 0}% of labor`}
          />
        ))}
      </div>

      <Card>
        <SectionTitle icon="ti-wallet">Labor pay split (40% = {fmt(laborPool)} ฿)</SectionTitle>
        {Object.entries(byPerson).map(([name, hours]) => {
          const share = totalHours ? laborPool * (hours / totalHours) : 0
          return (
            <div key={name} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0">
              <span className="text-sm">
                {name}{' '}
                <span className="text-xs text-gray-300">({hours}h / {totalHours}h total)</span>
              </span>
              <span className="font-semibold text-green-600 text-sm">{fmt(share)} ฿</span>
            </div>
          )
        })}
      </Card>

      <Card>
        <DataTable
          cols={[
            { key: 'date', label: 'Date', width: '14%', render: w => fmtDate(w.date) },
            { key: 'worker_name', label: 'Who', width: '22%', render: w => <span className="font-medium">{w.worker_name}</span> },
            { key: 'hours', label: 'Hours', width: '12%', render: w => `${w.hours}h` },
            { key: 'shift', label: 'Shift', width: '16%', render: w => <Badge color="gray">{w.shift}</Badge> },
            { key: 'note', label: 'Note', width: '26%', render: w => w.note || '—' },
            { key: 'del', label: '', width: '10%', render: w => <Button size="sm" variant="danger" onClick={() => onDelete(w.id)}>Del</Button> },
          ]}
          rows={worklog}
          empty="No work log entries yet."
        />
      </Card>
    </div>
  )
}

// ── Cash Log ──────────────────────────────────────────────────────────────────
export function CashLog({ entries, income, expenses, distributable, onAdd, onDelete }) {
  const [showIncome, setShowIncome] = useState(false)
  const [showExpense, setShowExpense] = useState(false)
  const [incForm, setIncForm] = useState({ date: today(), description: '', amount: '', note: '' })
  const [expForm, setExpForm] = useState({ date: today(), category: EXPENSE_CATS[0], amount: '', note: '' })
  const [saving, setSaving] = useState(false)

  async function saveIncome() {
    setSaving(true)
    await onAdd({ ...incForm, amount: Number(incForm.amount), type: 'income' })
    setShowIncome(false)
    setSaving(false)
  }

  async function saveExpense() {
    setSaving(true)
    await onAdd({ ...expForm, description: expForm.category, amount: Number(expForm.amount), type: 'expense' })
    setShowExpense(false)
    setSaving(false)
  }

  const incomeRows = entries.filter(e => e.type === 'income')
  const expenseRows = entries.filter(e => e.type === 'expense')

  const entryCols = (isExpense = false) => [
    { key: 'date', label: 'Date', width: '14%', render: e => fmtDate(e.date) },
    { key: 'description', label: 'Description', width: '38%' },
    { key: 'amount', label: 'Amount', width: '18%', render: e => <span className={`font-semibold ${isExpense ? 'text-red-500' : 'text-green-600'}`}>{fmt(e.amount)} ฿</span> },
    { key: 'note', label: 'Note', width: '20%', render: e => e.note || '—' },
    { key: 'del', label: '', width: '10%', render: e => <Button size="sm" variant="danger" onClick={() => onDelete(e.id)}>Del</Button> },
  ]

  return (
    <div className="p-4">
      <h2 className="text-sm font-semibold text-gray-800 mb-3">Cash log</h2>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <Metric label="Cash collected" value={`${fmt(income)} ฿`} valueColor="text-green-600" />
        <Metric label="Expenses paid" value={`${fmt(expenses)} ฿`} valueColor="text-red-500" />
        <Metric label="Net" value={`${fmt(income - expenses)} ฿`} />
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <SectionTitle icon="ti-arrow-down-circle" children="Income entries" />
          <Button variant="primary" size="sm" onClick={() => setShowIncome(s => !s)}>
            <i className="ti ti-plus" aria-hidden="true" /> Add
          </Button>
        </div>
        {showIncome && (
          <div className="mb-4 p-3 bg-gray-50 rounded-xl">
            <FormRow>
              <FormGroup label="Date">
                <Input type="date" value={incForm.date} onChange={e => setIncForm(f => ({ ...f, date: e.target.value }))} />
              </FormGroup>
              <FormGroup label="Amount (฿)">
                <Input type="number" value={incForm.amount} onChange={e => setIncForm(f => ({ ...f, amount: e.target.value }))} />
              </FormGroup>
            </FormRow>
            <FormRow>
              <FormGroup label="Description">
                <Input value={incForm.description} onChange={e => setIncForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Table rental — Khun Arisa" />
              </FormGroup>
              <FormGroup label="Note">
                <Input value={incForm.note} onChange={e => setIncForm(f => ({ ...f, note: e.target.value }))} placeholder="Optional" />
              </FormGroup>
            </FormRow>
            <Button variant="primary" onClick={saveIncome} disabled={saving}>Add income entry</Button>
          </div>
        )}
        <DataTable cols={entryCols(false)} rows={incomeRows} empty="No income entries yet." />
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <SectionTitle icon="ti-arrow-up-circle" children="Expenses" />
          <Button variant="primary" size="sm" onClick={() => setShowExpense(s => !s)}>
            <i className="ti ti-plus" aria-hidden="true" /> Add
          </Button>
        </div>
        {showExpense && (
          <div className="mb-4 p-3 bg-gray-50 rounded-xl">
            <FormRow>
              <FormGroup label="Date">
                <Input type="date" value={expForm.date} onChange={e => setExpForm(f => ({ ...f, date: e.target.value }))} />
              </FormGroup>
              <FormGroup label="Category">
                <Select value={expForm.category} onChange={e => setExpForm(f => ({ ...f, category: e.target.value }))}>
                  {EXPENSE_CATS.map(c => <option key={c}>{c}</option>)}
                </Select>
              </FormGroup>
            </FormRow>
            <FormRow>
              <FormGroup label="Amount (฿)">
                <Input type="number" value={expForm.amount} onChange={e => setExpForm(f => ({ ...f, amount: e.target.value }))} />
              </FormGroup>
              <FormGroup label="Note">
                <Input value={expForm.note} onChange={e => setExpForm(f => ({ ...f, note: e.target.value }))} placeholder="Optional" />
              </FormGroup>
            </FormRow>
            <Button variant="primary" onClick={saveExpense} disabled={saving}>Add expense</Button>
          </div>
        )}
        <DataTable cols={entryCols(true)} rows={expenseRows} empty="No expenses yet." />
      </Card>
    </div>
  )
}
