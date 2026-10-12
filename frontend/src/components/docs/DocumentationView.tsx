import React, { useState, useMemo } from 'react'
import {
  HelpCircle,
  Search,
  PlayCircle,
  Palette,
  Zap,
  Volume2,
  Clock,
  Tv,
  Code,
  BarChart2,
  Users,
  ArrowLeft,
} from 'lucide-react'
import { DOC_TOPICS } from './docsData'
import { DocTopicDetail } from './DocTopicDetail'
import type { DocTopic } from './types'

interface DocumentationViewProps {
  onBack?: () => void
}

export const DocumentationView: React.FC<DocumentationViewProps> = ({ onBack }) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>(DOC_TOPICS[0].id)
  const [searchTerm, setSearchTerm] = useState<string>('')

  const getTopicIcon = (name: string, isActive: boolean) => {
    const color = isActive ? '#0284c7' : '#64748b'
    const size = 18
    switch (name) {
      case 'PlayCircle':
        return <PlayCircle size={size} color={color} />
      case 'Palette':
        return <Palette size={size} color={color} />
      case 'Zap':
        return <Zap size={size} color={color} />
      case 'Volume2':
        return <Volume2 size={size} color={color} />
      case 'Clock':
        return <Clock size={size} color={color} />
      case 'Tv':
        return <Tv size={size} color={color} />
      case 'Code':
        return <Code size={size} color={color} />
      case 'BarChart2':
        return <BarChart2 size={size} color={color} />
      case 'Users':
        return <Users size={size} color={color} />
      default:
        return <HelpCircle size={size} color={color} />
    }
  }

  // Filtro por termo de busca
  const filteredTopics = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return DOC_TOPICS

    return DOC_TOPICS.filter((t) => {
      const matchTitle = t.title.toLowerCase().includes(term)
      const matchSub = t.subtitle.toLowerCase().includes(term)
      const matchSummary = t.summary.toLowerCase().includes(term)
      const matchCategory = t.category.toLowerCase().includes(term)
      const matchSteps = t.steps.some(
        (s) => s.title.toLowerCase().includes(term) || s.description.toLowerCase().includes(term)
      )
      return matchTitle || matchSub || matchSummary || matchCategory || matchSteps
    })
  }, [searchTerm])

  // Identifica o tópico atual
  const currentTopic: DocTopic = useMemo(() => {
    const found = filteredTopics.find((t) => t.id === selectedTopicId)
    if (found) return found
    return filteredTopics[0] || DOC_TOPICS[0]
  }, [filteredTopics, selectedTopicId])

  // Encontra vizinhos para navegação
  const currentIndex = DOC_TOPICS.findIndex((t) => t.id === currentTopic.id)
  const prevTopic = currentIndex > 0 ? DOC_TOPICS[currentIndex - 1] : null
  const nextTopic = currentIndex < DOC_TOPICS.length - 1 ? DOC_TOPICS[currentIndex + 1] : null

  return (
    <main
      data-testid="documentation-view"
      style={{
        flex: 1,
        padding: '1.75rem 2.5rem',
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: '#f8fafc',
      }}
    >
      {/* Cabeçalho da Central de Ajuda */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {onBack && (
            <div>
              <button
                type="button"
                data-testid="btn-back-to-videos"
                onClick={onBack}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  padding: '0.45rem 0.9rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  transition: 'all 0.15s ease',
                }}
              >
                <ArrowLeft size={16} />
                <span>Voltar para Meus Vídeos</span>
              </button>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#e0f2fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HelpCircle size={18} color="#0284c7" />
            </div>
            <h1
              data-testid="doc-main-title"
              style={{
                fontSize: '1.65rem',
                fontWeight: 800,
                color: '#0f172a',
                margin: 0,
                letterSpacing: '-0.5px',
              }}
            >
              Central de Ajuda & Tutoriais
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '0.92rem', color: '#64748b' }}>
            Aprenda o passo a passo completo de cada funcionalidade e ferramenta do seu player.
          </p>
        </div>

        {/* Barra de Pesquisa */}
        <div style={{ position: 'relative', width: '320px' }}>
          <Search
            size={16}
            color="#94a3b8"
            style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            data-testid="doc-search-input"
            placeholder="Buscar ferramenta, pitch, embed..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 1rem 0.6rem 2.4rem',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              fontSize: '0.88rem',
              color: '#1e293b',
              outline: 'none',
              boxSizing: 'border-box',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          />
        </div>
      </div>

      {/* Estrutura de Duas Colunas com Scroll Isolado */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          minHeight: 0,
          gap: '1.75rem',
          overflow: 'hidden',
        }}
      >
        {/* Menu Lateral de Tópicos - Fixo e independente de scroll */}
        <nav
          data-testid="doc-topics-list"
          style={{
            width: '280px',
            flexShrink: 0,
            height: '100%',
            overflowY: 'auto',
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          }}
        >
          <div
            style={{
              padding: '0.5rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: '#94a3b8',
            }}
          >
            Tópicos ({filteredTopics.length})
          </div>

          {filteredTopics.length === 0 ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
              Nenhum tópico encontrado com "{searchTerm}".
            </div>
          ) : (
            filteredTopics.map((topic) => {
              const isActive = topic.id === currentTopic.id
              return (
                <button
                  key={topic.id}
                  type="button"
                  data-testid={`doc-topic-item-${topic.id}`}
                  onClick={() => setSelectedTopicId(topic.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.75rem 0.85rem',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: isActive ? '#e0f2fe' : 'transparent',
                    color: isActive ? '#0284c7' : '#334155',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.88rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isActive ? '0 1px 3px rgba(2, 132, 199, 0.1)' : 'none',
                  }}
                >
                  <div style={{ flexShrink: 0 }}>{getTopicIcon(topic.iconName, isActive)}</div>
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {topic.title.split('&')[0].trim()}
                  </span>
                  {topic.badge && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        backgroundColor: isActive ? '#bae6fd' : '#f1f5f9',
                        color: isActive ? '#0369a1' : '#64748b',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        flexShrink: 0,
                      }}
                    >
                      {topic.badge}
                    </span>
                  )}
                </button>
              )
            })
          )}
        </nav>

        {/* Visualização do Conteúdo do Tópico - Scroll independente */}
        <section
          style={{
            flex: 1,
            height: '100%',
            overflowY: 'auto',
            minWidth: 0,
            paddingRight: '0.5rem',
          }}
        >
          {filteredTopics.length > 0 ? (
            <DocTopicDetail
              topic={currentTopic}
              onSelectTopic={(id) => setSelectedTopicId(id)}
              prevTopic={prevTopic}
              nextTopic={nextTopic}
            />
          ) : (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '3rem',
                textAlign: 'center',
                color: '#64748b',
              }}
            >
              <Search size={36} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>Nenhum resultado para "{searchTerm}"</h3>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                Tente buscar por termos como "Vídeo", "Turbo", "CTA", "Embed" ou "Elementor".
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
