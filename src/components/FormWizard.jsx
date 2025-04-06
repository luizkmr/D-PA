import React, { useState, useRef } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import InputMask from 'react-input-mask'

const API_URL = 'https://d-pa-backend-production.up.railway.app/analyze'

export default function FormWizard() {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState({})
  const [resultado, setResultado] = useState(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(null)
  const resultRef = useRef()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (type === 'checkbox') {
      const atual = formData[name] || []
      if (checked) {
        setFormData({ ...formData, [name]: [...atual, value] })
      } else {
        setFormData({ ...formData, [name]: atual.filter((v) => v !== value) })
      }
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleNext = () => {
    if (step === 0) {
      const email = formData.email || ''
      const telefone = (formData.whatsapp || '').replace(/\D/g, '')

      const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      const telefoneValido = telefone.length === 11

      if (!emailValido) {
        alert('Por favor, informe um e-mail válido.')
        return
      }

      if (!telefoneValido) {
        alert('Informe um número de WhatsApp válido com DDD.')
        return
      }
    }

    if (step < steps.length - 1) setStep(step + 1)
    else handleSubmit()
  }

  const handleBack = () => {
    if (step > 0) setStep(step - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setErro(null)
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      setResultado(data.resultado)
    } catch (err) {
      setErro('Erro ao processar análise com IA.')
    } finally {
      setLoading(false)
    }
  }

  const gerarPDF = async () => {
    const elemento = resultRef.current
    const canvas = await html2canvas(elemento)
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const largura = pdf.internal.pageSize.getWidth()
    const altura = pdf.internal.pageSize.getHeight()
    pdf.addImage(imgData, 'PNG', 0, 0, largura, altura)
    pdf.save(`diagnostico-${formData.nomeEmpresa || 'empresa'}.pdf`)
  }

  const steps = [/* 👇 mantém seu bloco completo de perguntas aqui */]
  // 👆 Cole aqui o MESMO bloco `steps` que você postou acima, sem alterações

  const currentStep = steps[step]

  if (loading) return <p>🔄 Processando com IA... Aguarde...</p>

  if (resultado)
    return (
      <div ref={resultRef} style={{ maxWidth: 900, margin: 'auto', whiteSpace: 'pre-wrap' }}>
        <h2>✅ Diagnóstico Gerado</h2>
        <p>{resultado}</p>
        <button onClick={gerarPDF} style={{ marginTop: 20 }}>📥 Baixar Diagnóstico em PDF</button>
      </div>
    )

  if (erro) return <p style={{ color: 'red' }}>{erro}</p>

  return (
    <div style={{ maxWidth: 700, margin: 'auto' }}>
      <h2>{currentStep.title}</h2>
      <form>
        {currentStep.questions.map((q) => (
          <div key={q.name} style={{ marginBottom: 12 }}>
            <label>
              {q.label}<br />
              {q.type === 'select' ? (
                <select name={q.name} value={formData[q.name] || ''} onChange={handleChange}>
                  <option value="">Selecione</option>
                  {q.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : q.type === 'radio' ? (
                q.options.map((opt) => (
                  <label key={opt} style={{ marginRight: 10 }}>
                    <input
                      type="radio"
                      name={q.name}
                      value={opt}
                      checked={formData[q.name] === opt}
                      onChange={handleChange}
                    /> {opt}
                  </label>
                ))
              ) : q.type === 'checkbox' ? (
                q.options.map((opt) => (
                  <label key={opt} style={{ display: 'block' }}>
                    <input
                      type="checkbox"
                      name={q.name}
                      value={opt}
                      checked={(formData[q.name] || []).includes(opt)}
                      onChange={handleChange}
                    /> {opt}
                  </label>
                ))
              ) : q.name === 'whatsapp' ? (
                <InputMask
                  mask="(99) 99999-9999"
                  name={q.name}
                  value={formData[q.name] || ''}
                  onChange={handleChange}
                >
                  {(inputProps) => (
                    <input
                      {...inputProps}
                      type="tel"
                      placeholder="(00) 90000-0000"
                      style={{ width: '100%', padding: 8 }}
                    />
                  )}
                </InputMask>
              ) : (
                <input
                  type={q.type || 'text'}
                  name={q.name}
                  value={formData[q.name] || ''}
                  onChange={handleChange}
                  style={{ width: '100%', padding: 8 }}
                />
              )}
            </label>
          </div>
        ))}
      </form>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={handleBack} disabled={step === 0}>⬅️ Voltar</button>
        <button onClick={handleNext}>
          {step === steps.length - 1 ? '✅ Enviar' : 'Próximo ➡️'}
        </button>
      </div>
    </div>
  )
}
