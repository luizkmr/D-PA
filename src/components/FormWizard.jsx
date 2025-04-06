import React, { useState } from 'react'

const steps = [
  {
    title: 'Informações do Negócio',
    questions: [
      { name: 'nomeEmpresa', label: 'Nome da Empresa' },
      { name: 'tipoNegocio', label: 'Tipo de Negócio (Físico, Online, Híbrido)' },
      { name: 'segmento', label: 'Segmento de Atuação' },
    ],
  },
  {
    title: 'Performance e Finanças',
    questions: [
      { name: 'ticketMedio', label: 'Ticket Médio (R$)' },
      { name: 'vendasUltimosMeses', label: 'Total de vendas dos últimos 3 meses' },
      { name: 'metaMensal', label: 'Meta de Faturamento Mensal (R$)' },
    ],
  },
  {
    title: 'Investimentos e Projeções',
    questions: [
      { name: 'orcamentoInvestimento', label: 'Orçamento disponível para investir (R$)' },
      { name: 'gastosMarketing', label: 'Gastos mensais com marketing e vendas (R$)' },
    ],
  },
  {
    title: 'Desafios e Oportunidades',
    questions: [
      { name: 'desafios', label: 'Principais desafios enfrentados' },
      { name: 'oportunidades', label: 'Oportunidades identificadas' },
    ],
  },
  {
    title: 'Metas e Objetivos',
    questions: [
      { name: 'objetivo3Meses', label: 'Objetivo para os próximos 3 meses' },
      { name: 'objetivo12Meses', label: 'Objetivo para os próximos 12 meses' },
    ],
  },
]

const API_URL = 'https://SEU_PROJETO.up.railway.app/analyze' // substitua pelo seu endpoint real

export default function FormWizard() {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [erro, setErro] = useState(null)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const nextStep = () => {
    if (step < steps.length - 1) setStep(step + 1)
    else handleSubmit()
  }

  const prevStep = () => {
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

  const currentStep = steps[step]

  if (loading) return <p>🔄 Analisando com IA... Aguarde alguns segundos...</p>

  if (resultado) return (
    <div style={{ whiteSpace: 'pre-wrap' }}>
      <h2>✅ Diagnóstico Gerado</h2>
      <p>{resultado}</p>
    </div>
  )

  if (erro) return <p style={{ color: 'red' }}>⚠️ {erro}</p>

  return (
    <div style={{ maxWidth: '600px', margin: 'auto' }}>
      <h2>{currentStep.title}</h2>
      <form>
        {currentStep.questions.map((q) => (
          <div key={q.name} style={{ marginBottom: '1rem' }}>
            <label>
              {q.label}
              <input
                type="text"
                name={q.name}
                value={formData[q.name] || ''}
                onChange={handleChange}
                style={{ display: 'block', width: '100%', padding: '8px' }}
              />
            </label>
          </div>
        ))}
      </form>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={prevStep} disabled={step === 0}>Voltar</button>
        <button onClick={nextStep}>
          {step === steps.length - 1 ? 'Enviar' : 'Próximo'}
        </button>
      </div>
    </div>
  )
}
