import React from 'react'
import { Gift, Star, ShieldCheck, Check, Sparkles } from 'lucide-react'

export const PreviewPricingAndBonuses: React.FC = () => {
  return (
    <>
      {/* Seção de Bônus Exclusivos */}
      <section style={{ marginBottom: '4.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#f59e0b',
              fontSize: '0.82rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.5rem',
            }}
          >
            <Gift size={16} /> Bônus Exclusivos de Ação Rápida
          </div>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fff', margin: '0 0 0.5rem' }}>
            Presentes Especiais Incluídos na Sua Inscrição
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '650px', margin: '0 auto' }}>
            Ao garantir seu acesso hoje, você recebe gratuitamente todos estes materiais complementares de alta conversão.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {[
            {
              title: 'Pack de 15 Thumbnails de Alto CTR',
              originalPrice: 'R$ 297,00',
              desc: 'Modelos prontos editáveis no Canva e Photoshop para dobrar a taxa de cliques inicial no seu vídeo.',
            },
            {
              title: 'Planilha de Métricas & Retenção Seg a Seg',
              originalPrice: 'R$ 197,00',
              desc: 'Calcule automaticamente seu ponto de equilíbrio, CPA ideal e taxa de conversão esperada por minuto assistido.',
            },
            {
              title: 'Comunidade Privada & Networking VIP',
              originalPrice: 'R$ 497,00',
              desc: 'Grupo seleto de infoprodutores e gestores trocando testes reais de criativos e estratégias de escala.',
            },
          ].map((bonus, bIdx) => (
            <div
              key={bIdx}
              style={{
                background: '#0f172a',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: '16px',
                padding: '1.75rem',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#fbbf24',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                }}
              >
                100% GRÁTIS
              </div>

              <div style={{ fontSize: '0.8rem', color: '#64748b', textDecoration: 'line-through', marginBottom: '0.25rem' }}>
                Valor normal: {bonus.originalPrice}
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: '0 0 0.5rem' }}>
                {bonus.title}
              </h4>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>{bonus.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Depoimentos de Clientes */}
      <section style={{ marginBottom: '4.5rem' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, textAlign: 'center', margin: '0 0 2rem', color: '#fff' }}>
          O Que Nossos Clientes Dizem
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {[
            {
              name: 'Ricardo Mendes',
              role: 'Gestor de Tráfego Direto',
              text: 'O player flutuante no canto da tela dobrou o tempo médio de visualização da nossa VSL vertical!',
            },
            {
              name: 'Juliana Costa',
              role: 'Infoprodutora de Alta Escala',
              text: 'Zero telas brancas e carregamento imediato. É a ferramenta mais profissional que já integrei às minhas páginas.',
            },
            {
              name: 'Marcos Silveira',
              role: 'Copywriter & Estrategista',
              text: 'O Smart Autoplay fez os testes de criativos responderem com muito mais força no tráfego frio.',
            },
            {
              name: 'Beatriz Almeida',
              role: 'Head de Growth & Operações',
              text: 'A velocidade de entrega através da Cloudflare com cache em São Paulo reduziu nosso custo de servidor para quase zero.',
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                background: '#0f172a',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '1.75rem',
              }}
            >
              <div style={{ display: 'flex', gap: '0.25rem', color: '#f59e0b', marginBottom: '0.75rem' }}>
                {[...Array(5)].map((_, s) => (
                  <Star key={s} size={14} fill="#f59e0b" />
                ))}
              </div>
              <p
                style={{
                  fontSize: '0.9rem',
                  color: '#cbd5e1',
                  fontStyle: 'italic',
                  marginBottom: '1rem',
                  lineHeight: 1.5,
                }}
              >
                "{item.text}"
              </p>
              <div>
                <strong style={{ display: 'block', fontSize: '0.85rem', color: '#fff' }}>{item.name}</strong>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tabela de Oferta e Preço */}
      <section style={{ marginBottom: '4.5rem' }}>
        <div
          style={{
            maxWidth: '650px',
            margin: '0 auto',
            background: 'linear-gradient(145deg, #0f172a, #0b1120)',
            border: '2px solid rgba(99, 102, 241, 0.4)',
            borderRadius: '24px',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-14px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '0.35rem 1.25rem',
              borderRadius: '999px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            🔥 Oferta Especial por Tempo Limitado
          </div>

          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: '0.5rem 0 0.5rem' }}>
            Acesso Completo & Vitalício
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
            Tudo o que você precisa para implementar e faturar mais com seus vídeos hoje mesmo.
          </p>

          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.9rem', color: '#64748b', textDecoration: 'line-through' }}>
              De R$ 997,00 por apenas:
            </span>
            <div style={{ fontSize: '2.75rem', fontWeight: 900, color: '#10b981', lineHeight: 1.1 }}>
              12x de R$ 29,90
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
              ou R$ 297,00 à vista no PIX ou Cartão
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
              textAlign: 'left',
              maxWidth: '420px',
              margin: '0 auto 2rem',
            }}
          >
            {[
              'Acesso imediato a todos os 5 módulos práticos',
              'Player com Smart Autoplay e Modo Turbo integrados',
              'Miniatura Flutuante (Picture-in-Picture) automática',
              'CDN de alta velocidade com tráfego gratuito',
              '3 Super Bônus Exclusivos inclusos sem custo',
              'Suporte prioritário e atualizações futuras',
            ].map((feature, fIdx) => (
              <div key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: '#e2e8f0' }}>
                <Check size={16} color="#10b981" style={{ flexShrink: 0 }} />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{
              width: '100%',
              maxWidth: '420px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              fontSize: '1.15rem',
              fontWeight: 800,
              padding: '1.1rem 2rem',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
              transition: 'transform 0.2s',
            }}
          >
            QUERO GARANTIR MINHA VAGA AGORA ➔
          </button>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.75rem' }}>
            🔒 Compra 100% Segura • Acesso Imediato no seu E-mail
          </div>
        </div>
      </section>

      {/* Seção de Garantia Incondicional */}
      <section
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(5, 150, 105, 0.03))',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '20px',
          padding: '2.5rem',
          textAlign: 'center',
          marginBottom: '4.5rem',
        }}
      >
        <ShieldCheck size={42} color="#10b981" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#fff' }}>
          Garantia Incondicional de 7 Dias
        </h3>
        <p style={{ color: '#94a3b8', maxWidth: '650px', margin: '0 auto', fontSize: '0.92rem', lineHeight: 1.7 }}>
          Se dentro de 7 dias você achar que o conteúdo não é para você, basta nos enviar um único e-mail e devolveremos
          100% do seu dinheiro, centavo por centavo. Sem perguntas, sem letras miúdas e sem ressentimentos. O risco é todo nosso.
        </p>
      </section>
    </>
  )
}
