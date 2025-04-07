import React, { useState, useRef } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import InputMask from 'react-input-mask'

const API_URL = 'https://d-pa-backend-production.up.railway.app/analyze'

export default function FormWizard() {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState({})
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
  const [resultado, setResultado] = useState(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(null)
  const resultRef = useRef()
const handleSubmit = async () => {
  setLoading(true)
  setErro(null)

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData),
    })

    const text = await response.text()
    console.log("📦 Resposta bruta:", text)

    let data
    try {
      data = JSON.parse(text)
    } catch (parseError) {
      console.error("❌ Erro ao fazer parse do JSON:", parseError)
      throw new Error('Resposta da IA não está em formato JSON válido.')
    }

    // Verificando se a chave resultado existe
    if (data && data.resultado) {
      setResultado(data.resultado)
    } else {
      console.warn("⚠️ A resposta não possui a chave 'resultado':", data)
      setResultado("⚠️ Nenhum diagnóstico foi retornado pela IA.")
    }

  } catch (err) {
    console.error("❌ Erro no envio da API:", err)
    setErro('Erro ao processar análise com IA.')
  } finally {
    setLoading(false)
  }
}
const renderInput = (q) => {
  if (!q || !q.name || !q.label) return null
  const options = Array.isArray(q.options) ? q.options : []

  if (q.name === 'whatsapp') {
    return (
      <InputMask
        mask="(99) 99999-9999"
        value={formData[q.name] || ''}
        onChange={handleChange}
      >
        {(inputProps) => (
          <input
            {...inputProps}
            type="tel"
            name={q.name}
            placeholder="(00) 90000-0000"
            style={{ width: '100%', padding: 8 }}
          />
        )}
      </InputMask>
    )
  }

  if (q.type === 'number') {
    return (
      <input
        type="number"
        name={q.name}
        value={formData[q.name] || ''}
        onChange={(e) => {
          const onlyNums = e.target.value.replace(/\D/g, '')
          setFormData({ ...formData, [q.name]: onlyNums })
        }}
        style={{ width: '100%', padding: 8 }}
      />
    )
  }

  switch (q.type) {
    case 'select':
      return (
        <select name={q.name} value={formData[q.name] || ''} onChange={handleChange}>
          <option value="">Selecione</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )
    case 'radio':
      return options.map((opt) => (
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
    case 'checkbox':
      return options.map((opt) => (
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
    default:
      return (
        <input
          type={q.type || 'text'}
          name={q.name}
          value={formData[q.name] || ''}
          onChange={handleChange}
          style={{ width: '100%', padding: 8 }}
        />
      )
  }
}



  const steps = [
    {
      title: 'Dados Pessoais',
      questions: [
        { name: 'nome', label: 'Seu nome *' },
        { name: 'email', label: 'Seu melhor email *', type: 'email' },
        { name: 'whatsapp', label: 'WhatsApp *', type: 'tel' },
        { name: 'cidade', label: 'Sua Cidade *' },
        { name: 'site', label: 'Informe seu Site' },
        { name: 'instagram', label: 'Perfil do Instagram' }
      ]
    },
    {
      title: 'Sobre o Negócio',
      questions: [
        { name: 'nomeEmpresa', label: 'Nome do seu negócio *' },
        {
          name: 'tipoNegocio',
          label: 'Tipo de negócio',
          type: 'select',
          options: ['Loja Física', 'E-commerce Online', 'Prestação de Serviços', 'Híbrido (Online & Físico)', 'Consultoria/Serviços Profissionais', 'Outro']
        },
        {
          name: 'anosOperacao',
          label: 'Há quantos anos seu negócio está operando?',
          type: 'select',
          options: ['Menos de 1 ano', '1-3 anos', '4-10 anos', 'Mais de 10 anos']
        },
        {
          name: 'temSocios',
          label: 'Você tem sócios?',
          type: 'radio',
          options: ['Sim', 'Não']
        },
        {
          name: 'posicaoMercado',
          label: 'Como você descreveria sua posição atual no mercado?',
          type: 'radio',
          options: ['Líder de Mercado', 'Concorrente Forte', 'Presença Crescente', 'Novo Entrante', 'Dificuldade em Ganhar Tração']
        },
        {
          name: 'nicho',
          label: 'Qual é o seu nicho de mercado e o principal problema que resolve?'
        },
        {
          name: 'produtoServico',
          label: 'Qual Produto/Serviço você oferece?'
        },
        {
          name: 'modeloNegocio',
          label: 'Modelo de negócios e principais fontes de receita'
        },
        {
          name: 'publicoAlvo',
          label: 'Quem é seu público-alvo e como os atrai hoje?'
        },
        {
          name: 'momentoAtual',
          label: 'Como você descreveria o momento atual do seu negócio?'
        }
      ]
    },
    {
      title: 'Performance e Finanças',
      questions: [
        {
          name: 'ticketMedio',
          label: 'Ticket médio (R$)',
          type: 'number'
        },
        {
          name: 'vendas3Meses',
          label: 'Total de vendas nos últimos 3 meses',
          type: 'number'
        },
        {
          name: 'metaCrescimento',
          label: 'Meta de crescimento para os próximos 6 meses *'
        },
        {
          name: 'acompanhaFaturamento',
          label: 'Você acompanha regularmente faturamento e lucro?',
          type: 'radio',
          options: ['Sim', 'Não', 'Às vezes']
        },
        {
          name: 'investimentoMarketing',
          label: 'Investimento médio mensal em marketing digital (últimos 6 meses)',
          type: 'select',
          options: ['Menos de R$ 5.000,00', 'Entre R$ 5.001,00 e R$ 10.000,00', 'Entre R$ 10.001,00 e R$ 20.000,00', 'Mais de R$ 20.001,00']
        }
      ]
    },
    {
      title: 'Marketing e Estratégia',
      questions: [
        {
          name: 'estrategiasMarketing',
          label: 'Quais estratégias de marketing você usa e quais funcionam melhor?'
        },
        {
          name: 'conversaoLeads',
          label: 'Como é seu processo atual de conversão de leads em clientes?'
        },
        {
          name: 'pesquisaClientes',
          label: 'Você realizou pesquisa com clientes nos últimos 12 meses?',
          type: 'radio',
          options: ['Sim, pesquisa extensiva', 'Sim, pesquisa limitada', 'Apenas feedback informal', 'Sem pesquisa recente']
        },
        {
          name: 'desafios',
          label: 'Maiores desafios enfrentados atualmente:',
          type: 'checkbox',
          options: ['Aquisição de Clientes', 'Retenção de Clientes', 'Aumento da Concorrência', 'Gestão de Fluxo de Caixa', 'Eficiência Operacional', 'Dimensionamento do Negócio', 'Encontrar/Reter Talentos', 'Implementação de Tecnologia', 'Eficácia de Marketing']
        },
        {
          name: 'objetivoNegocio',
          label: 'Principal objetivo de negócio para os próximos 12 meses:',
          type: 'select',
          options: ['Aumentar Receita', 'Expandir Alcance de Mercado', 'Melhorar Rentabilidade', 'Lançar Novo Produto/Serviço', 'Melhorar Eficiência Operacional', 'Transformação Digital', 'Desenvolvimento de Equipe/Talentos']
        }
      ]
    },
    {
      title: 'Estrutura e Gestão',
      questions: [
        {
          name: 'tamanhoEquipe',
          label: 'Qual o tamanho atual da sua equipe?',
          type: 'select',
          options: ['Empreendedor Solo', '2–5 funcionários', '6–20 funcionários', '21–50 funcionários', '51–200 funcionários', 'Mais de 200 funcionários']
        },
        {
          name: 'estruturaEquipe',
          label: 'Se tiver equipe, como ela está estruturada?'
        },
        {
          name: 'ferramentas',
          label: 'Ferramentas ou plataformas que utiliza:',
          type: 'checkbox',
          options: ['Google Ads', 'Meta Ads', 'TikTok Ads', 'Taboola Ads', 'Linkedin Ads', 'WhatsApp (Grupos)', 'Outros']
        },
        {
          name: 'pontosFortes',
          label: 'Pontos fortes do seu negócio:',
          type: 'checkbox',
          options: ['Qualidade de Produto/Serviço', 'Atendimento ao Cliente', 'Tecnologia e Inovação', 'Reconhecimento de Marca', 'Expertise da Equipe', 'Eficiência Operacional', 'Parcerias Estratégicas', 'Localização/Presença Geográfica', 'Preços Competitivos']
        },
        {
          name: 'concorrenciaNivel',
          label: 'Como você caracteriza a concorrência no seu mercado?',
          type: 'select',
          options: ['Extremamente alta', 'Alta', 'Moderada', 'Baixa', 'Muito baixa']
        },
        {
          name: 'roiEsperado',
          label: 'Expectativa de retorno sobre investimento (ROI)',
          type: 'select',
          options: ['Conservador (até 20%)', 'Moderado (21–50%)', 'Agressivo (51–100%)', 'Muito agressivo (acima de 100%)']
        },
        {
          name: 'capacidadeInvestimento',
          label: 'Capacidade para novos investimentos:',
          type: 'radio',
          options: ['Significativa', 'Moderada', 'Limitada', 'Mínima', 'Incapaz de investir']
        }
      ]
    },
    {
      title: 'Finalização e Expectativas',
      questions: [
        {
          name: 'resultadoEsperado',
          label: 'Qual é o principal resultado que você imagina ao final desta análise?'
        },
        {
          name: 'planoAjudaComo',
          label: 'Como imagina que o Plano de Ação pode te ajudar?'
        },
        {
          name: 'interesseApoio',
          label: 'Você gostaria de ajuda profissional para aplicar esse plano?',
          type: 'radio',
          options: ['Sim, claro', 'Não']
        }
      ]
    }
  ]

  const gerarPDF = async () => 
{
  if (!resultRef.current) return
  const canvas = await html2canvas(resultRef.current)
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF('p', 'mm', 'a4')
  const largura = pdf.internal.pageSize.getWidth()
  const altura = pdf.internal.pageSize.getHeight()
  pdf.addImage(imgData, 'PNG', 0, 0, largura, altura)
  pdf.save(`diagnostico-${formData.nomeEmpresa || 'empresa'}.pdf`)
}

  const currentStep = steps[step]

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1)
    else handleSubmit()
  }

  const handleBack = () => {
    if (step > 0) setStep(step - 1)
  }

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
                  <label key={opt}>
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
                  <label key={opt}>
                    <input
                      type="checkbox"
                      name={q.name}
                      value={opt}
                      checked={formData[q.name]?.includes(opt)}
                      onChange={handleChange}
                    /> {opt}
                  </label>
                ))
              ) : (() => {
  if (q.name === 'whatsapp') {
    return (
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
    )
  }

  if (q.name === 'ticketMedio' || q.name === 'vendas3Meses') {
    return (
      <input
        type="number"
        name={q.name}
        min="0"
        step="0.01"
        value={formData[q.name] || ''}
        onChange={handleChange}
        style={{ width: '100%', padding: 8 }}
        placeholder="Digite um valor numérico"
      />
    )
  }
      {renderInput(q)}
  })()}
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
