import React, { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import type { Video } from './types/video'
import { fetchVideos, deleteVideo, bulkDeleteVideos } from './services/api'
import { Topbar } from './components/Topbar'
import { Sidebar } from './components/Sidebar'
import { VideoList } from './components/VideoList'
import { DeleteConfirmModal } from './components/DeleteConfirmModal'
import { EmbedPlayer } from './components/EmbedPlayer'
import { VideoDetailView } from './components/video-detail/VideoDetailView'
import { VideoCreateView } from './components/video-create/VideoCreateView'
import './App.css'

function App() {
  const searchParams = new URLSearchParams(window.location.search)
  const embedId =
    searchParams.get('embed') ||
    (window.location.pathname.startsWith('/embed/')
      ? window.location.pathname.replace('/embed/', '')
      : null)

  if (embedId) {
    return <EmbedPlayer videoId={embedId} />
  }

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

  const loadVideos = async () => {
    try {
      setLoading(true)
      const data = await fetchVideos()
      setVideos(data)
    } catch {
      showToast('Erro ao carregar lista de vídeos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVideos()
  }, [])

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
