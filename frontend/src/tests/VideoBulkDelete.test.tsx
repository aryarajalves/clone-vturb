import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { VideoList } from '../components/VideoList'
import App from '../App'
import type { Video } from '../types/video'

const mockVideos: Video[] = [
  {
    id: 'vid-1',
    title: 'Vídeo Promocional Alpha',
    video_url: 'https://exemplo.com/v1.mp4',
    thumbnail_url: 'https://exemplo.com/thumb1.jpg',
    duration: 100,
    plays_count: 5,
    player_settings: { primary_color: '#4f46e5' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'vid-2',
    title: 'Vídeo Promocional Beta',
    video_url: 'https://exemplo.com/v2.mp4',
    thumbnail_url: 'https://exemplo.com/thumb2.jpg',
    duration: 200,
    plays_count: 12,
    player_settings: { primary_color: '#4f46e5' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'vid-3',
    title: 'Vídeo Promocional Gamma',
    video_url: 'https://exemplo.com/v3.mp4',
    thumbnail_url: 'https://exemplo.com/thumb3.jpg',
    duration: 150,
    plays_count: 8,
    player_settings: { primary_color: '#4f46e5' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

describe('Seleção Múltipla e Exclusão em Massa de Vídeos', () => {
  it('permite selecionar todos os vídeos de uma só vez pelo checkbox mestre', () => {
    const onBulkDeleteMock = vi.fn()

    render(
      <VideoList
        videos={mockVideos}
        loading={false}
        onDelete={() => {}}
        onBulkDelete={onBulkDeleteMock}
        onEdit={() => {}}
        onOpenImport={() => {}}
      />
    )

    const selectAllCheckbox = screen.getByTestId('select-all-checkbox') as HTMLInputElement
    expect(selectAllCheckbox.checked).toBe(false)
    expect(screen.queryByTestId('bulk-delete-btn')).not.toBeInTheDocument()

    // Clica no checkbox "Selecionar todos"
    fireEvent.click(selectAllCheckbox)
    expect(selectAllCheckbox.checked).toBe(true)

    // Todos os checkboxes individuais devem estar marcados
    const cb1 = screen.getByTestId('video-checkbox-vid-1') as HTMLInputElement
    const cb2 = screen.getByTestId('video-checkbox-vid-2') as HTMLInputElement
    const cb3 = screen.getByTestId('video-checkbox-vid-3') as HTMLInputElement
    expect(cb1.checked).toBe(true)
    expect(cb2.checked).toBe(true)
    expect(cb3.checked).toBe(true)

    // O botão de exclusão em massa deve exibir a contagem total (3)
    const bulkBtn = screen.getByTestId('bulk-delete-btn')
    expect(bulkBtn).toHaveTextContent(/Excluir selecionados \(3\)/i)

    // Clica no botão de exclusão em massa
    fireEvent.click(bulkBtn)
    expect(onBulkDeleteMock).toHaveBeenCalledWith(mockVideos)

    // Clicar em "Desmarcar todos" desmarca tudo
    const clearBtn = screen.getByTestId('clear-selection-btn')
    fireEvent.click(clearBtn)
    expect(selectAllCheckbox.checked).toBe(false)
    expect(cb1.checked).toBe(false)
    expect(screen.queryByTestId('bulk-delete-btn')).not.toBeInTheDocument()
  })

  it('permite selecionar vídeos individualmente e exibe botão de exclusão com a contagem exata', () => {
    const onBulkDeleteMock = vi.fn()

    render(
      <VideoList
        videos={mockVideos}
        loading={false}
        onDelete={() => {}}
        onBulkDelete={onBulkDeleteMock}
        onEdit={() => {}}
        onOpenImport={() => {}}
      />
    )

    const cb1 = screen.getByTestId('video-checkbox-vid-1') as HTMLInputElement
    const cb2 = screen.getByTestId('video-checkbox-vid-2') as HTMLInputElement

    // Marca o primeiro vídeo
    fireEvent.click(cb1)
    expect(cb1.checked).toBe(true)
    expect(screen.getByTestId('bulk-delete-btn')).toHaveTextContent(/Excluir selecionados \(1\)/i)

    // Marca o segundo vídeo
    fireEvent.click(cb2)
    expect(cb2.checked).toBe(true)
    expect(screen.getByTestId('bulk-delete-btn')).toHaveTextContent(/Excluir selecionados \(2\)/i)

    // Dispara a exclusão dos 2 selecionados
    fireEvent.click(screen.getByTestId('bulk-delete-btn'))
    expect(onBulkDeleteMock).toHaveBeenCalledWith([mockVideos[0], mockVideos[1]])
  })

  it('abre popup de confirmação centralizado no App que não fecha ao clicar fora', async () => {
    localStorage.setItem('vturb_access_token', 'valid-token')
    // Mock das requisições de API
    vi.spyOn(global, 'fetch').mockImplementation((url: RequestInfo | URL, init?: RequestInit) => {
      const urlStr = url.toString()
      if (urlStr.includes('/auth/me')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            id: 'admin-123',
            email: 'admin@vturb.com',
            is_super_admin: true,
            created_at: new Date().toISOString(),
          }),
        } as Response)
      }
      if (urlStr.includes('/videos/') && (!init || !init.method || init.method.toUpperCase() === 'GET')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockVideos,
        } as Response)
      }
      if (urlStr.includes('/videos/bulk-delete') && init?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ deleted_count: 2, deleted_ids: ['vid-1', 'vid-2'] }),
        } as Response)
      }
      return Promise.resolve({ ok: true, json: async () => ({}) } as Response)
    })

    render(<App />)

    // Aguarda carregar vídeos
    await waitFor(() => {
      expect(screen.getByTestId('video-row-vid-1')).toBeInTheDocument()
    })

    // Seleciona os vídeos 1 e 2
    fireEvent.click(screen.getByTestId('video-checkbox-vid-1'))
    fireEvent.click(screen.getByTestId('video-checkbox-vid-2'))

    // Clica em "Excluir selecionados (2)"
    const bulkBtn = screen.getByTestId('bulk-delete-btn')
    fireEvent.click(bulkBtn)

    // O modal de confirmação de exclusão em massa deve abrir no centro
    await waitFor(() => {
      expect(screen.getByText('Excluir Vídeos em Massa')).toBeInTheDocument()
    })

    const modalContent = screen.getByTestId('delete-modal-content')
    expect(modalContent).toHaveTextContent(/2 vídeos selecionados/i)

    // Valida que clicar no backdrop NÃO fecha o modal
    const backdrop = screen.getByTestId('delete-modal-backdrop')
    fireEvent.click(backdrop)
    expect(screen.getByText('Excluir Vídeos em Massa')).toBeInTheDocument()

    // Clica em "Sim, Excluir"
    const confirmBtn = screen.getByTestId('delete-modal-confirm')
    await act(async () => {
      fireEvent.click(confirmBtn)
    })

    // Confirma que a exclusão ocorreu e exibiu o toast de sucesso
    await waitFor(() => {
      expect(screen.getByTestId('toast-notification')).toHaveTextContent(/2 vídeos excluídos com sucesso/i)
      expect(screen.queryByTestId('video-row-vid-1')).not.toBeInTheDocument()
      expect(screen.queryByTestId('video-row-vid-2')).not.toBeInTheDocument()
      expect(screen.getByTestId('video-row-vid-3')).toBeInTheDocument()
    })
  })
})
