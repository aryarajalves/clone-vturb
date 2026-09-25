import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { VideoCreateHeader } from '../components/video-create/VideoCreateHeader'
import { PlayerQuickSettings } from '../components/video-create/PlayerQuickSettings'

describe('VideoCreateSubcomponents - Testes Unitários dos Submódulos Extraídos', () => {
  it('VideoCreateHeader: renderiza título, botão de voltar e dispara onBack', () => {
    const onBackMock = vi.fn()
    render(<VideoCreateHeader onBack={onBackMock} />)

    expect(screen.getByTestId('create-header')).toBeInTheDocument()
    expect(screen.getByTestId('create-view-title')).toHaveTextContent('Novo Vídeo')

    const backBtn = screen.getByTestId('back-to-videos-btn')
    fireEvent.click(backBtn)
    expect(onBackMock).toHaveBeenCalledTimes(1)
  })

  it('PlayerQuickSettings: permite alterar cor primária e alternar autoplay', () => {
    const setPrimaryColorMock = vi.fn()
    const setAutoplayMock = vi.fn()

    render(
      <PlayerQuickSettings
        primaryColor="#6366f1"
        setPrimaryColor={setPrimaryColorMock}
        autoplay={false}
        setAutoplay={setAutoplayMock}
      />
    )

    const colorPicker = screen.getByTestId('create-video-color-picker')
    fireEvent.change(colorPicker, { target: { value: '#10b981' } })
    expect(setPrimaryColorMock).toHaveBeenCalledWith('#10b981')

    const autoplayCheckbox = screen.getByTestId('create-video-autoplay-checkbox')
    fireEvent.click(autoplayCheckbox)
    expect(setAutoplayMock).toHaveBeenCalledWith(true)
  })
})
