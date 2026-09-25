import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PreviewTopHeader } from '../components/preview/PreviewTopHeader'
import { PreviewPlayerWrapper } from '../components/preview/PreviewPlayerWrapper'
import { PreviewMockLandingPageSections } from '../components/preview/PreviewMockLandingPageSections'

describe('Preview Subcomponents', () => {
  it('renderiza PreviewTopHeader com dimensões e modo Sem Fundo', () => {
    render(
      <PreviewTopHeader
        rawWidth="640px"
        rawHeight={null}
        effectiveRatio="9:16"
        isTransparent={true}
      />
    )

    expect(screen.getByText(/Página de Teste Ativa/i)).toBeInTheDocument()
    expect(screen.getByText('640px')).toBeInTheDocument()
    expect(screen.getByText(/• Sem Fundo/i)).toBeInTheDocument()
    expect(screen.getByText(/Role a página para testar o player flutuante/i)).toBeInTheDocument()
  })

  it('renderiza PreviewPlayerWrapper com iframe e botão de Pitch Delay quando habilitado', () => {
    const mockVideo: any = {
      id: 'v-123',
      title: 'VSL Oferta Especial',
      player_settings: { border_radius: 16 },
    }

    render(
      <PreviewPlayerWrapper
        video={mockVideo}
        rawWidth="800px"
        rawHeight={null}
        paddingTop="56.25%"
        isTransparent={false}
        embedSrc="http://localhost:3000/?embed=v-123"
        pitchEnabled={true}
        isPitchReached={true}
      />
    )

    expect(screen.getByText('VSL Oferta Especial')).toBeInTheDocument()
    expect(screen.getByTestId('preview-test-wrapper')).toBeInTheDocument()
    expect(screen.getByTestId('preview-test-iframe')).toHaveAttribute('src', 'http://localhost:3000/?embed=v-123')
    expect(screen.getByText(/QUERO GARANTIR MEU ACESSO AGORA!/i)).toBeVisible()
  })

  it('renderiza PreviewMockLandingPageSections com todas as seções de rolagem', () => {
    render(<PreviewMockLandingPageSections />)

    expect(screen.getByText(/Área de Teste do Player Flutuante/i)).toBeInTheDocument()
    expect(screen.getByText(/Tecnologia de VSL Projetada para Máxima Conversão/i)).toBeInTheDocument()
    expect(screen.getByText(/Garantia Incondicional de 7 Dias/i)).toBeInTheDocument()
  })
})
