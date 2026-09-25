import React from 'react'
import { Layers, Zap, Play, Star, ShieldCheck } from 'lucide-react'

export const PreviewMockLandingPageSections: React.FC = () => {
  return (
    <>
      {/* Indicador de Teste de Rolagem */}
      <section
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5), rgba(15, 23, 42, 0.8))',
          border: '1px dashed rgba(99, 102, 241, 0.4)',
          borderRadius: '16px',
          padding: '2rem',
          textAlign: 'center',
          marginBottom: '4rem',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            padding: '0.6rem',
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.15)',
            color: '#818cf8',
            marginBottom: '0.75rem',
          }}
        >
          <Layers size={24} />
        </div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#fff' }}>
          Área de Teste do Player Flutuante
        </h2>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
          Role a tela para baixo. Conforme o vídeo acima sair da janela, a miniatura flutuará no canto inferior
          direito. Ao retornar para cima, o vídeo reassume seu espaço original suavemente.
        </p>
      </section>

      {/* Seção 1: Benefícios Estruturais */}
      <section style={{ marginBottom: '4rem' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, textAlign: 'center', margin: '0 0 2rem', color: '#fff' }}>
          Tecnologia de VSL Projetada para Máxima Conversão
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {[
            {
              icon: Zap,
              title: 'Smart Autoplay™ com Áudio Transparente',
              desc: 'Permite que o vídeo inicie imediatamente sem perder o impacto inicial, superando as restrições de navegadores.',
            },
            {
              icon: Play,
              title: 'Modo Turbo com Aceleração Personalizada',
              desc: 'Acelere o ritmo da fala e da apresentação para aumentar a retenção do espectador até o momento da oferta.',
            },
            {
              icon: Layers,
              title: 'Mini-Player Flutuante (Picture-in-Picture)',
              desc: 'O visitante continua assistindo e ouvindo sua oferta mesmo enquanto rola para conferir os depoimentos e preços.',
            },
          ].map((card, i) => (
            <div
              key={i}
              style={{
                background: '#0f172a',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '1.75rem',
              }}
            >
              <card.icon size={28} color="#818cf8" style={{ marginBottom: '1rem' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.5rem', color: '#fff' }}>
                {card.title}
              </h4>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Seção 2: Texto Longo de Apresentação para Teste de Scroll */}
      <section
        style={{
          background: '#090d1a',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '20px',
          padding: '2.5rem',
          marginBottom: '4rem',
          lineHeight: 1.8,
          color: '#cbd5e1',
        }}
      >
        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginTop: 0, marginBottom: '1.25rem' }}>
          Como os maiores players do mercado aumentam a retenção em mais de 37%
        </h3>
        <p style={{ marginBottom: '1.25rem' }}>
          Em uma página de vendas com VSL tradicional, o visitante médio rola a tela antes mesmo dos primeiros 2
          minutos de vídeo para checar o preço ou os depoimentos. Quando isso ocorre em players comuns, o vídeo
          desaparece do campo de visão, a taxa de atenção despenca e a conversão final é seriamente prejudicada.
        </p>
        <p style={{ marginBottom: '1.25rem' }}>
          Com o Smart VSL, o player acompanha a movimentação do usuário em uma miniatura flutuante de alta
          definição no canto inferior da tela. O áudio segue perfeitamente sincronizado e o visitante não perde
          nenhuma palavra do pitch de vendas.
        </p>
        <p style={{ margin: 0 }}>
          Além disso, os tempos de carregamento instantâneos e a eliminação de qualquer tela branca garantem que
          100% dos cliques em anúncios sejam convertidos em visualizações reais.
        </p>
      </section>

      {/* Seção 3: Depoimentos Fictícios */}
      <section style={{ marginBottom: '4rem' }}>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 700, textAlign: 'center', margin: '0 0 2rem', color: '#fff' }}>
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
          ].map((item, i) => (
            <div
              key={i}
              style={{
                background: '#0f172a',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '1.5rem',
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

      {/* Seção 4: Garantia */}
      <section
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(5, 150, 105, 0.03))',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '20px',
          padding: '2.5rem',
          textAlign: 'center',
          marginBottom: '4rem',
        }}
      >
        <ShieldCheck size={36} color="#10b981" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#fff' }}>
          Garantia Incondicional de 7 Dias
        </h3>
        <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0 auto', fontSize: '0.9rem', lineHeight: 1.6 }}>
          Demonstração de estabilidade e segurança. Esta página simula um ambiente de vendas completo para teste de
          scroll e comportamento do player.
        </p>
      </section>

      {/* Rodapé da Página */}
      <footer
        style={{
          textAlign: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '2.5rem',
          color: '#64748b',
          fontSize: '0.8rem',
        }}
      >
        <p style={{ margin: '0 0 0.5rem' }}>Smart VSL • Todos os direitos reservados.</p>
        <p style={{ margin: 0 }}>Página de teste gerada para validação ao vivo de recursos do player.</p>
      </footer>
    </>
  )
}
