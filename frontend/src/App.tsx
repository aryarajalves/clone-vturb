import { useEffect, useState, useCallback } from 'react'
import { CheckCircle2 } from 'lucide-react'
import type { Video } from './types/video'
import type { User } from './types/auth'
import {
  fetchVideos,
  deleteVideo,
  bulkDeleteVideos,
  getAuthToken,
  removeAuthToken,
  getCurrentUserApi,
} from './services/api'
import { Topbar } from './components/Topbar'
import { Sidebar } from './components/Sidebar'
import { VideoList } from './components/VideoList'
import { DeleteConfirmModal } from './components/DeleteConfirmModal'
import { EmbedPlayer } from './components/EmbedPlayer'
import { VideoDetailView } from './components/video-detail/VideoDetailView'
import { VideoCreateView } from './components/video-create/VideoCreateView'
import { LoginView } from './components/auth/LoginView'
import './App.css'

function App() {
  const searchParams = new URLSearchParams(window.location.search)
  const embedId =
    searchParams.get('embed') ||
    (window.location.pathname.startsWith('/embed/')
      ? window.location.pathname.replace('/embed/', '')
      : null)

  // O embed player é público e não requer autenticação
  if (embedId) {
    return <EmbedPlayer videoId={embedId} />
  }

  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Estado do vídeo selecionado para o painel de gerenciamento
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)

  // Estado de criação de novo vídeo em tela cheia
  const [isCreatingVideo, setIsCreatingVideo] = useState(false)
  const [videoToDelete, setVideoToDelete] = useState<Video | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Estado para exclusão em massa
  const [bulkVideosToDelete, setBulkVideosToDelete] = useState<Video[] | null>(null)
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const loadVideos = useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetchVideos()
      setVideos(data)
    } catch {
      showToast('Erro ao carregar lista de vídeos.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Validação inicial do token JWT
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken()
      if (!token) {
        setIsCheckingAuth(false)
        return
      }

      try {
        const user = await getCurrentUserApi()
        setCurrentUser(user)
        await loadVideos()
      } catch {
        removeAuthToken()
        setCurrentUser(null)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [loadVideos])

  // Escuta evento de expiração de sessão (401 após 24 horas)
  useEffect(() => {
    const handleSessionExpired = () => {
      setCurrentUser(null)
      setSelectedVideo(null)
      setIsCreatingVideo(false)
      setVideos([])
      showToast('Sua sessão expirou (limite de 24 horas). Por favor, faça login novamente.')
    }

    window.addEventListener('auth:session_expired', handleSessionExpired)
    return () => {
      window.removeEventListener('auth:session_expired', handleSessionExpired)
    }
  }, [])

  const handleLoginSuccess = async (user: User) => {
    setCurrentUser(user)
    showToast(`Bem-vindo, ${user.email}!`)
    await loadVideos()
  }

  const handleLogout = () => {
    removeAuthToken()
    setCurrentUser(null)
    setSelectedVideo(null)
    setIsCreatingVideo(false)
    setVideos([])
    showToast('Sessão encerrada com sucesso.')
  }

  if (isCheckingAuth) {
    return (
      <div
        data-testid="auth-loading-screen"
        style={{
          height: '100vh',
          width: '100vw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
          color: '#64748b',
          fontSize: '1rem',
          fontWeight: 500,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <span>Carregando painel do VTurb...</span>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <>
        {toastMessage && (
          <div
            data-testid="toast-notification"
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              padding: '0.85rem 1.4rem',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
              zIndex: 10000,
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            <CheckCircle2 size={18} />
            {toastMessage}
          </div>
        )}
        <LoginView onLoginSuccess={handleLoginSuccess} />
      </>
    )
  }

  const handleDeleteConfirm = async () => {
    if (!videoToDelete) return
    try {
      setDeleteLoading(true)
      await deleteVideo(videoToDelete.id)
      setVideos((prev) => prev.filter((v) => v.id !== videoToDelete.id))
      if (selectedVideo?.id === videoToDelete.id) {
        setSelectedVideo(null)
      }
      showToast(`Vídeo "${videoToDelete.title}" excluído com sucesso!`)
      setVideoToDelete(null)
    } catch {
      showToast('Erro ao excluir o vídeo.')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleBulkDeleteConfirm = async () => {
    if (!bulkVideosToDelete || bulkVideosToDelete.length === 0) return
    try {
      setBulkDeleteLoading(true)
      const ids = bulkVideosToDelete.map((v) => v.id)
      await bulkDeleteVideos(ids)
      const idSet = new Set(ids)
      setVideos((prev) => prev.filter((v) => !idSet.has(v.id)))
      if (selectedVideo && idSet.has(selectedVideo.id)) {
        setSelectedVideo(null)
      }
      showToast(
        `${ids.length} ${ids.length === 1 ? 'vídeo excluído' : 'vídeos excluídos'} com sucesso!`
      )
      setBulkVideosToDelete(null)
    } catch {
      showToast('Erro ao excluir os vídeos selecionados.')
    } finally {
      setBulkDeleteLoading(false)
    }
  }

  return (
    <div style={{ height: '100vh', backgroundColor: '#f8fafc', color: '#1e293b', fontFamily: 'system-ui, -apple-system, sans-serif', width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          data-testid="toast-notification"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff',
            padding: '0.85rem 1.4rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
            zIndex: 10000,
            fontSize: '0.9rem',
            fontWeight: 500,
          }}
        >
          <CheckCircle2 size={18} />
          {toastMessage}
        </div>
      )}

      {/* Topbar VTurb (botão Novo Vídeo oculto durante a edição e criação) */}
      <Topbar
        onOpenImport={() => setIsCreatingVideo(true)}
        showCreateButton={!selectedVideo && !isCreatingVideo}
        user={currentUser}
        onLogout={handleLogout}
      />

      {/* Layout Principal */}
      <div style={{ display: 'flex', flex: 1, width: '100%', minHeight: 0, overflow: 'hidden' }}>
        {/* Barra Lateral Global (Meus vídeos) - Oculta durante a edição ou criação */}
        {!selectedVideo && !isCreatingVideo && <Sidebar />}

        {/* Alternância entre Tela de Lista, Painel de Criação e Painel de Gerenciamento do Vídeo */}
        {selectedVideo ? (
          <VideoDetailView
            video={selectedVideo}
            onBack={() => setSelectedVideo(null)}
            onUpdateVideo={(updated) => {
              setVideos((prev) => prev.map((v) => (v.id === updated.id ? updated : v)))
              setSelectedVideo(updated)
            }}
            showToast={showToast}
          />
        ) : isCreatingVideo ? (
          <VideoCreateView
            onBack={() => setIsCreatingVideo(false)}
            onSuccess={(newVideo) => {
              setVideos((prev) => [newVideo, ...prev])
              setIsCreatingVideo(false)
              setSelectedVideo(newVideo)
              showToast(`Vídeo "${newVideo.title}" criado com sucesso!`)
            }}
            showToast={showToast}
          />
        ) : (
          <main style={{ flex: 1, padding: '2rem 3rem', width: '100%', minWidth: 0, boxSizing: 'border-box', height: '100%', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2
                data-testid="page-title"
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#1e293b',
                  margin: 0,
                }}
              >
                Meus vídeos
              </h2>
              <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                {videos.length} {videos.length === 1 ? 'vídeo encontrado' : 'vídeos encontrados'}
              </span>
            </div>

            <VideoList
              videos={videos}
              loading={loading}
              onDelete={(v) => setVideoToDelete(v)}
              onBulkDelete={(toDelete) => setBulkVideosToDelete(toDelete)}
              onEdit={(v) => setSelectedVideo(v)}
              onOpenImport={() => setIsCreatingVideo(true)}
            />
          </main>
        )}
      </div>

      {/* Modal de exclusão individual */}
      <DeleteConfirmModal
        isOpen={Boolean(videoToDelete)}
        title="Excluir Vídeo"
        itemName={videoToDelete?.title || ''}
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setVideoToDelete(null)}
      />

      {/* Modal de exclusão em massa com confirmação obrigatória */}
      <DeleteConfirmModal
        isOpen={Boolean(bulkVideosToDelete && bulkVideosToDelete.length > 0)}
        title="Excluir Vídeos em Massa"
        itemCount={bulkVideosToDelete?.length || 0}
        loading={bulkDeleteLoading}
        onConfirm={handleBulkDeleteConfirm}
        onCancel={() => setBulkVideosToDelete(null)}
      />
    </div>
  )
}

export default App
