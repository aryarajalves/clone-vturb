import React, { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'

export const PreviewFaqAndFooter: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqItems = [
    {
      q: 'Como recebo o acesso ao material após a inscrição?',
      a: 'Assim que sua compra for confirmada, você receberá automaticamente os dados de login e senha no seu e-mail cadastrado, podendo iniciar os estudos imediatamente no seu computador, tablet ou celular.',
    },
    {
      q: 'O player flutuante funciona em celulares e smartphones?',
      a: 'Sim! O Smart VSL foi desenvolvido com tecnologia responsiva de ponta. Em telas mobile, o player acompanha a rolagem em formato miniatura no canto da tela sem travar e sem cobrir botões essenciais.',
    },
    {
      q: 'Preciso ter conhecimentos avançados de programação para usar?',
      a: 'Não. Todo o processo foi pensado para ser no estilo "copiar e colar". Você só precisa colar o código gerado no seu site ou construtor (WordPress, Elementor, Hotmart Pages, Webflow, etc.) uma única vez.',
    },
    {
      q: 'Como funciona a garantia de 7 dias?',
      a: 'Você tem 7 dias corridos a partir da data de compra para testar tudo. Se por qualquer motivo não ficar satisfeito, basta solicitar o reembolso e seu pagamento será estornado integralmente.',
    },
    {
      q: 'Por quanto tempo terei acesso a todo o conteúdo?',
      a: 'Seu acesso é vitalício! Você poderá assistir às aulas quantas vezes quiser, no seu próprio ritmo, e ainda receberá todas as atualizações futuras sem pagar nada a mais por isso.',
    },
  ]

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx)
  }

  return (
    <>
      {/* Seção FAQ */}
      <section style={{ marginBottom: '5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#818cf8',
              fontSize: '0.82rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.5rem',
            }}
          >
            <HelpCircle size={16} /> Dúvidas Comuns
          </div>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fff', margin: '0 0 0.5rem' }}>
            Perguntas Frequentes
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '650px', margin: '0 auto' }}>
            Tudo o que você precisa saber antes de iniciar sua jornada com o Smart VSL.
          </p>
        </div>

        <div style={{ maxWidth: '750px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {faqItems.map((item, idx) => {
            const isOpen = openFaq === idx
            return (
              <div
                key={idx}
                style={{
                  background: '#090d1a',
                  border: isOpen ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  style={{
                    width: '100%',
                    padding: '1.25rem 1.5rem',
                    background: 'transparent',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    textAlign: 'left',
                    color: '#fff',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    size={18}
                    color="#818cf8"
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      flexShrink: 0,
                    }}
                  />
                </button>
                {isOpen && (
                  <div
                    style={{
                      padding: '0 1.5rem 1.25rem',
                      color: '#94a3b8',
                      fontSize: '0.88rem',
                      lineHeight: 1.6,
                    }}
                  >
                    {item.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Rodapé da Página Completa */}
      <footer
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '3rem',
          color: '#64748b',
          fontSize: '0.82rem',
          lineHeight: 1.6,
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <span style={{ color: '#94a3b8', cursor: 'pointer' }}>Termos de Uso</span>
          <span>•</span>
          <span style={{ color: '#94a3b8', cursor: 'pointer' }}>Políticas de Privacidade</span>
          <span>•</span>
          <span style={{ color: '#94a3b8', cursor: 'pointer' }}>Avisos Legais</span>
          <span>•</span>
          <span style={{ color: '#94a3b8', cursor: 'pointer' }}>Suporte ao Aluno</span>
        </div>

        <p style={{ margin: '0 0 0.5rem', maxWidth: '650px', marginLeft: 'auto', marginRight: 'auto' }}>
          Este site não é afiliado ao Facebook, Google, TikTok ou qualquer entidade do Meta. Todos os conteúdos e estratégias
          apresentados são frutos de testes práticos de mercado e têm fins estritamente educacionais.
        </p>
        <p style={{ margin: 0, color: '#475569' }}>
          Smart VSL Tecnologia de Vídeos • Todos os direitos reservados © {new Date().getFullYear()}
        </p>
      </footer>
    </>
  )
}
