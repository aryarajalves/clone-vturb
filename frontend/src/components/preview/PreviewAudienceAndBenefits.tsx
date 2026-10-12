import React from 'react'
import { Layers, Zap, Play, Target, Users, TrendingUp, ShieldCheck } from 'lucide-react'

export const PreviewAudienceAndBenefits: React.FC = () => {
  return (
    <>
      {/* Barra de Métricas e Destaques Rápidos */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '3.5rem',
        }}
      >
        {[
          { label: 'Taxa de Retenção', val: '98.7%', desc: 'no início da apresentação' },
          { label: 'Carregamento', val: '< 0.2s', desc: 'CDN de alta velocidade' },
          { label: 'Plays Concluídos', val: '+50.000', desc: 'espectadores impactados' },
          { label: 'Proteção Ativa', val: '100%', desc: 'contra downloads indevidos' },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '1.25rem 1.5rem',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', marginBottom: '0.25rem' }}>
              {item.val}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.15rem' }}>
              {item.label}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.desc}</div>
          </div>
        ))}
      </section>

      {/* Indicador de Teste de Rolagem do Player Flutuante */}
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

      {/* Para Quem É Esta Solução */}
      <section style={{ marginBottom: '4.5rem' }}>
        <h3 style={{ fontSize: '1.6rem', fontWeight: 700, textAlign: 'center', margin: '0 0 0.5rem', color: '#fff' }}>
          Para Quem Foi Criada Esta Solução
        </h3>
        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
          Desenvolvida especificamente para negócios que dependem de vídeos para gerar faturamento e autoridade.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {[
            {
              icon: Target,
              title: 'Infoprodutores & Lançadores',
              desc: 'Garanta que cada lead que clica no seu anúncio assista sua VSL sem buffering nem telas brancas.',
            },
            {
              icon: TrendingUp,
              title: 'Gestores de Tráfego Direto',
              desc: 'Diminua seu custo por aquisição (CPA) aumentando a retenção média até o momento da oferta.',
            },
            {
              icon: Users,
              title: 'Copywriters & Estrategistas',
              desc: 'Valide cada segundo do seu roteiro com métricas precisas de retenção e drop-off em tempo real.',
            },
            {
              icon: ShieldCheck,
              title: 'Empresas & Negócios Locais',
              desc: 'Apresentações comerciais e institucionais com acabamento premium e reprodução instantânea em celulares.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                background: '#090d1a',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                borderRadius: '14px',
                padding: '1.75rem',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(99, 102, 241, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#818cf8',
                  marginBottom: '1rem',
                }}
              >
                <item.icon size={22} />
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', margin: '0 0 0.5rem' }}>
                {item.title}
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tecnologia de VSL Projetada para Máxima Conversão */}
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

      {/* Seção de Texto Longo de Apresentação para Teste de Scroll */}
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
    </>
  )
}
