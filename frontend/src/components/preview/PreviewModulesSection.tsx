import React from 'react'
import { BookOpen, CheckCircle, Clock, Video } from 'lucide-react'

export const PreviewModulesSection: React.FC = () => {
  const modules = [
    {
      num: '01',
      title: 'Fundamentos de Retenção & Gancho Inicial (0-30s)',
      duration: '4 aulas • 45 min',
      topics: [
        'Como quebrar o padrão de rolagem no feed em menos de 3 segundos',
        'Estruturação de promessas irresistíveis sem parecer exagerado',
        'Configuração de Smart Autoplay para contornar bloqueios de navegadores',
      ],
    },
    {
      num: '02',
      title: 'História, Identificação e Construção da Dor',
      duration: '6 aulas • 1h 20min',
      topics: [
        'A jornada emocional que mantém a atenção por mais de 10 minutos',
        'Técnicas de micro-compromissos ao longo do vídeo',
        'Como usar o Modo Turbo para acelerar trechos lentos da narrativa',
      ],
    },
    {
      num: '03',
      title: 'O Ponto de Virada & Apresentação da Solução',
      duration: '5 aulas • 1h 10min',
      topics: [
        'O momento exato de introduzir seu método ou produto',
        'Como quebrar as 5 maiores objeções antes mesmo de falar o preço',
        'Demonstrações práticas e ancoragem visual de alto impacto',
      ],
    },
    {
      num: '04',
      title: 'A Oferta Irresistível & Ancoragem de Preço',
      duration: '5 aulas • 55 min',
      topics: [
        'Configuração de Pitch Delay para sincronizar a aparição do botão de compra',
        'Estrutura de bônus que fazem o preço parecer insignificante',
        'Escassez real vs escassez falsa: como aplicar com ética e conversão',
      ],
    },
    {
      num: '05',
      title: 'Análise de Dados, Escala & Otimização Contínua',
      duration: '4 aulas • 50 min',
      topics: [
        'Como ler os gráficos de retenção segundo a segundo do Smart VSL',
        'Identificação de pontos exatos de abandono e testes A/B de novas introduções',
        'Escala previsível com tráfego direto no Facebook, Google e TikTok Ads',
      ],
    },
  ]

  return (
    <section style={{ marginBottom: '4.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#10b981',
            fontSize: '0.82rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.5rem',
          }}
        >
          <BookOpen size={16} /> Grade Curricular Completa
        </div>
        <h3 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fff', margin: '0 0 0.5rem' }}>
          O Que Você Vai Aprender Passo a Passo
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '650px', margin: '0 auto' }}>
          Uma estrutura validada de ponta a ponta para transformar espectadores casuais em compradores fiéis.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {modules.map((mod, idx) => (
          <div
            key={idx}
            style={{
              background: '#090d1a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '1.75rem',
              display: 'flex',
              gap: '1.5rem',
              alignItems: 'flex-start',
              transition: 'all 0.2s ease',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(16, 185, 129, 0.15))',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                fontWeight: 800,
                color: '#818cf8',
                flexShrink: 0,
              }}
            >
              {mod.num}
            </div>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  marginBottom: '0.75rem',
                }}
              >
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                  Módulo {mod.num}: {mod.title}
                </h4>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.78rem',
                    color: '#64748b',
                  }}
                >
                  <Clock size={13} /> {mod.duration}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.5rem' }}>
                {mod.topics.map((topic, tIdx) => (
                  <div
                    key={tIdx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#cbd5e1',
                      fontSize: '0.85rem',
                    }}
                  >
                    <CheckCircle size={14} color="#10b981" style={{ flexShrink: 0 }} />
                    <span>{topic}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
