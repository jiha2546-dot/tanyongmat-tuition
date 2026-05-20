import { useState } from 'react'
import { Modal, FormRow, FormGroup, Input, Select, Button, Alert, EvidenceUpload } from './UI'
import { fmt, PAY_METHODS, today } from '../../lib/utils'

export function PaymentModal({ enrollment, onConfirm, onClose }) {
  const [amount, setAmount] = useState(enrollment.amount)
  const [payDate, setPayDate] = useState(today())
  const [payMethod, setPayMethod] = useState(PAY_METHODS[0])
  const [evidenceFile, setEvidenceFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)

  function handleFile(file) {
    if (!file) return
    setEvidenceFile(file)
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target.result)
    reader.readAsDataURL(file)
  }

  async function handleConfirm() {
    setLoading(true)
    await onConfirm({ amount: Number(amount), payDate, payMethod, evidenceFile })
    setLoading(false)
  }

  const studentName = enrollment.students?.name || enrollment.student_name || '—'
  const typeLabel = enrollment.type === 'course'
    ? `${enrollment.course_type} course`
    : 'Hourly'

  return (
    <Modal title={`Record payment — ${studentName} / ${enrollment.subject}`} onClose={onClose}>
      <Alert color="amber">
        Amount due: <strong>{fmt(enrollment.amount)} THB</strong> ({typeLabel})
      </Alert>

      <FormRow>
        <FormGroup label="Amount received (THB)">
          <Input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
        </FormGroup>
        <FormGroup label="Payment date">
          <Input
            type="date"
            value={payDate}
            onChange={e => setPayDate(e.target.value)}
          />
        </FormGroup>
      </FormRow>

      <div className="mb-4">
        <FormGroup label="Payment method">
          <Select value={payMethod} onChange={e => setPayMethod(e.target.value)}>
            {PAY_METHODS.map(m => <option key={m}>{m}</option>)}
          </Select>
        </FormGroup>
      </div>

      <div className="mb-4">
        <EvidenceUpload onFile={handleFile} preview={preview} />
      </div>

      <Button
        variant="primary"
        size="lg"
        className="w-full justify-center"
        onClick={handleConfirm}
        disabled={loading}
      >
        <i className="ti ti-check" aria-hidden="true" />
        {loading ? 'Saving...' : 'Confirm payment received'}
      </Button>
    </Modal>
  )
}
