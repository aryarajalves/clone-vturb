import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { DocumentationView } from '../components/docs/DocumentationView'
import { Sidebar } from '../components/Sidebar'
import type { User } from '../types/auth'

describe('Central de Ajuda & Regras de Acesso da Sidebar', () => {
  it('renderiza a central de ajuda com título, tópico inicial e captura real ilustrada', () => {
    render(<DocumentationView />)

    expect(screen.getByTestId('doc-main-title')).toHaveTextContent('Central de Ajuda & Tutoriais')
    expect(screen.getByTestId('doc-topic-title')).toHaveTextContent('Primeiros Passos & Criação de Vídeos')
    expect(screen.getByTestId('doc-topics-list')).toBeInTheDocument()

    // Valida que o print ilustrativo e a legenda da ferramenta foram renderizados
    const screenshot = screen.getByTestId('doc-topic-screenshot')
    expect(screenshot).toBeInTheDocument()
    expect(screenshot).toHaveAttribute('src', '/help-screenshots/primeiros-passos.png')
    expect(screen.getByTestId('doc-topic-image-caption')).toBeInTheDocument()
    expect(screen.getByTestId('doc-topic-secondary-screenshot')).toBeInTheDocument()
  })

  it('exibe o botão "Voltar para Meus Vídeos" quando a prop onBack é fornecida e aciona o callback', async () => {
    const onBackMock = vi.fn()
    render(<DocumentationView onBack={onBackMock} />)

    const backBtn = screen.getByTestId('btn-back-to-videos')
    expect(backBtn).toBeInTheDocument()
    expect(backBtn).toHaveTextContent('Voltar para Meus Vídeos')

    await act(async () => {
      fireEvent.click(backBtn)
    })

    expect(onBackMock).toHaveBeenCalledTimes(1)
  })

  it('NÃO inclui tópico de backup automático na documentação', () => {
    render(<DocumentationView />)

    const topicsNav = screen.getByTestId('doc-topics-list')
    expect(topicsNav.textContent?.toLowerCase()).not.toContain('backup')
  })

  it('permite alternar entre tópicos clicando na lista lateral e exibe o print correspondente', async () => {
    render(<DocumentationView />)

    const turboTopicBtn = screen.getByTestId('doc-topic-item-modo-turbo')
    await act(async () => {
      fireEvent.click(turboTopicBtn)
    })

    expect(screen.getByTestId('doc-topic-title')).toHaveTextContent('Modo Turbo (Aceleração Inteligente)')
    const screenshot = screen.getByTestId('doc-topic-screenshot')
    expect(screenshot).toHaveAttribute('src', '/help-screenshots/modo-turbo.png')
  })

  it('permite navegar para o próximo tópico através do botão "Próximo"', async () => {
    render(<DocumentationView />)

    const nextBtn = screen.getByTestId('btn-doc-next')
    await act(async () => {
      fireEvent.click(nextBtn)
    })

    expect(screen.getByTestId('doc-topic-title')).toHaveTextContent('Estilização & Personalização do Player')
    const screenshot = screen.getByTestId('doc-topic-screenshot')
    expect(screenshot).toHaveAttribute('src', '/help-screenshots/estilizacao-player.png')
  })

  it('filtra tópicos pela barra de busca e exibe mensagem amigável caso não encontre', async () => {
    render(<DocumentationView />)

    const searchInput = screen.getByTestId('doc-search-input')
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Pitch Delay' } })
    })

    expect(screen.getByTestId('doc-topic-title')).toHaveTextContent('Pitch Delay & Botão de Compra')

    // Busca inexistente
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'termo_totalmente_inexistente_xyz' } })
    })

    expect(screen.getByText(/Nenhum resultado para/i)).toBeInTheDocument()
  })

  it('permite copiar o código de exemplo na documentação', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    })

    render(<DocumentationView />)

    // Navega para o tópico de Pitch Delay que contém exemplo de código
    const pitchTopicBtn = screen.getByTestId('doc-topic-item-pitch-delay-cta')
    await act(async () => {
      fireEvent.click(pitchTopicBtn)
    })

    const copyBtn = screen.getByTestId('btn-copy-doc-code')
    await act(async () => {
      fireEvent.click(copyBtn)
    })

    expect(writeTextMock).toHaveBeenCalled()
    expect(screen.getByText('Copiado!')).toBeInTheDocument()
  })

  it('posiciona o botão "Central de Ajuda" na Sidebar logo abaixo de "Meus vídeos"', () => {
    const onSelectTab = vi.fn()
    render(<Sidebar currentTab="videos" onSelectTab={onSelectTab} />)

    const nav = screen.getByTestId('sidebar').querySelector('nav')
    expect(nav).toBeInTheDocument()

    const buttons = nav!.querySelectorAll('button')
    // Primeiro botão: Meus vídeos
    expect(buttons[0]).toHaveAttribute('data-testid', 'nav-meus-videos')
    // Segundo botão (logo abaixo): Central de Ajuda
    expect(buttons[1]).toHaveAttribute('data-testid', 'nav-central-ajuda')
    expect(buttons[1]).toHaveTextContent('Central de Ajuda')

    // Ao clicar em Central de Ajuda, dispara onSelectTab('docs')
    fireEvent.click(buttons[1])
    expect(onSelectTab).toHaveBeenCalledWith('docs')
  })

  it('exibe o botão "Gestão de Usuário" para o usuário com perfil Admin além de Super Admin', () => {
    const adminUser: User = {
      id: 'admin-role-id',
      email: 'gestor@empresa.com',
      role: 'admin',
      is_super_admin: false,
      created_at: new Date().toISOString(),
    }

    const { rerender } = render(<Sidebar currentTab="videos" user={adminUser} />)
    expect(screen.getByTestId('nav-gestao-usuarios')).toBeInTheDocument()

    // Para usuário comum (role: 'user'), NÃO deve exibir Gestão de Usuário
    const standardUser: User = {
      id: 'regular-user-id',
      email: 'comum@empresa.com',
      role: 'user',
      is_super_admin: false,
      created_at: new Date().toISOString(),
    }

    rerender(<Sidebar currentTab="videos" user={standardUser} />)
    expect(screen.queryByTestId('nav-gestao-usuarios')).not.toBeInTheDocument()
  })

  it('categoriza a Sidebar com as seções GERAL e SEGURANÇA & ACESSO conforme o perfil', () => {
    const superAdminUser: User = {
      id: 'super-admin-id',
      email: 'admin@vturb.com',
      role: 'admin',
      is_super_admin: true,
      created_at: new Date().toISOString(),
    }

    const { rerender } = render(<Sidebar currentTab="videos" user={superAdminUser} />)

    // Seção Geral sempre presente com Meus vídeos e Central de Ajuda
    const sectionGeral = screen.getByTestId('sidebar-section-geral')
    expect(sectionGeral).toHaveTextContent(/geral/i)
    expect(screen.getByTestId('nav-meus-videos')).toBeInTheDocument()
    expect(screen.getByTestId('nav-central-ajuda')).toBeInTheDocument()

    // Seção Segurança & Acesso presente para Super Admin com Backup e Gestão de Usuário
    const sectionSeguranca = screen.getByTestId('sidebar-section-seguranca')
    expect(sectionSeguranca).toHaveTextContent(/segurança & acesso/i)
    expect(screen.getByTestId('nav-backup-automatico')).toBeInTheDocument()
    expect(screen.getByTestId('nav-gestao-usuarios')).toBeInTheDocument()

    // Para usuário comum (role: 'user'), a seção Segurança & Acesso NÃO deve aparecer
    const regularUser: User = {
      id: 'regular-id',
      email: 'user@vturb.com',
      role: 'user',
      is_super_admin: false,
      created_at: new Date().toISOString(),
    }
    rerender(<Sidebar currentTab="videos" user={regularUser} />)
    expect(screen.queryByTestId('sidebar-section-seguranca')).not.toBeInTheDocument()
  })
})

