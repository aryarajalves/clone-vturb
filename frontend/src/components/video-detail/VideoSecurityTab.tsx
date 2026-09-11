import React, { useState } from 'react'
import { ShieldCheck, Plus, Trash2, AlertCircle } from 'lucide-react'
import type { Video, DomainProtectionSettings } from '../../types/video'
import { updateVideo } from '../../services/api'

interface VideoSecurityTabProps {
  video: Video
  onSave: (updated: Video) => void
  showToast: (msg: string) => void
}

export const VideoSecurityTab: React.FC<VideoSecurityTabProps> = ({
  video,
  onSave,
  showToast,
}) => {
  const current = video.player_settings?.domain_protection || {
    enabled: false,
    allowed_domains: ['localhost'],
    anti_download: true,
  }

  const [enabled, setEnabled] = useState(Boolean(current.enabled))
  const [domains, setDomains] = useState<string[]>(current.allowed_domains || ['localhost'])
  const [newDomain, setNewDomain] = useState('')
  const [antiDownload, setAntiDownload] = useState(current.anti_download ?? true)
  const [saving, setSaving] = useState(false)

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault()
    const cleaned = newDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
    if (!cleaned) return
    if (domains.includes(cleaned)) {
      showToast('Este domínio já está na lista.')
      return
    }
    setDomains([...domains, cleaned])
    setNewDomain('')
  }

  const handleRemoveDomain = (dom: string) => {
    setDomains(domains.filter((d) => d !== dom))
  }

  const handleToggle = async (newVal: boolean) => {
    setEnabled(newVal)
    if (!newVal) {
      try {
        setSaving(true)
        const domainData: DomainProtectionSettings = {
          enabled: false,
          allowed_domains: domains,
          anti_download: antiDownload,
        }

        const updatedSettings = {
          ...video.player_settings,
          domain_protection: domainData,
        }

        const updated = await updateVideo(video.id, { player_settings: updatedSettings })
        onSave(updated)
        showToast('Proteção de domínio desativada com sucesso!')
      } catch {
        showToast('Erro ao desativar proteção de domínio.')
      } finally {
        setSaving(false)
      }
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const domainData: DomainProtectionSettings = {
        enabled,
        allowed_domains: domains,
        anti_download: antiDownload,
      }

      const updatedSettings = {
        ...video.player_settings,
        domain_protection: domainData,
      }

      const updated = await updateVideo(video.id, { player_settings: updatedSettings })
      onSave(updated)
      showToast(
        enabled
          ? 'Proteção de domínio ativada e salva com sucesso!'
          : 'Proteção de domínio desativada com sucesso!'
      )
    } catch {
      showToast('Erro ao salvar configurações de segurança.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div data-testid="security-tab" style={{ maxWidth: '850px', margin: '0 auto' }}>
      {/* Banner de Ativação */}
      <div
        style={{
          background: enabled
            ? 'linear-gradient(135deg, rgba(8, 145, 178, 0.1), rgba(14, 116, 144, 0.05))'
            : '#ffffff',
          border: enabled ? '1px solid #a5f3fc' : '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '1.5rem 2rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: enabled ? '#cffafe' : '#f1f5f9',
              color: enabled ? '#0891b2' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.15rem', color: '#1e293b' }}>
              Segurança & Domínios Autorizados (Whitelist)
            </h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
              Impede que concorrentes ou terceiros copiem seu código e exibam o vídeo em sites não autorizados.
            </p>
          </div>
        </div>

        {/* Switch */}
        <label
          style={{
            position: 'relative',
            display: 'inline-block',
            width: '56px',
            height: '30px',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            data-testid="security-toggle"
            checked={enabled}
            onChange={(e) => handleToggle(e.target.checked)}
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <span
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: enabled ? '#0891b2' : '#cbd5e1',
              borderRadius: '34px',
              transition: 'all 0.25s ease',
            }}
          >
            <span
              style={{
                position: 'absolute',
                height: '22px',
                width: '22px',
                left: enabled ? '30px' : '4px',
                bottom: '4px',
                backgroundColor: 'white',
                borderRadius: '50%',
                transition: 'all 0.25s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            />
          </span>
        </label>
      </div>

      {/* Formulário (Visível EXCLUSIVAMENTE quando Ativado) */}
      {enabled && (
        <div
          data-testid="security-content"
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '2rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          }}
        >
        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#1e293b', fontWeight: 600 }}>
          Domínios Onde o Vídeo Tem Permissão para Rodar
        </h4>
        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1.25rem 0' }}>
          Qualquer tentativa de carregar o vídeo em um domínio fora desta lista será bloqueada pelo player.
        </p>

        {/* Adicionar Domínio */}
        <form onSubmit={handleAddDomain} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <input
            type="text"
            data-testid="security-domain-input"
            disabled={!enabled}
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            placeholder="Ex: meusite.com.br ou app.kiwify.com.br"
            style={{
              flex: 1,
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.9rem',
            }}
          />
          <button
            type="submit"
            data-testid="security-add-domain-btn"
            disabled={!enabled || !newDomain.trim()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.65rem 1.2rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#0891b2',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: enabled && newDomain.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            <Plus size={16} />
            Adicionar
          </button>
        </form>

        {/* Lista de Domínios */}
        <div data-testid="security-domains-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {domains.map((dom) => (
            <div
              key={dom}
              data-testid={`domain-item-${dom}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
              }}
            >
              <span style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 600 }}>{dom}</span>
              <button
                type="button"
                data-testid={`remove-domain-${dom}`}
                disabled={!enabled}
                onClick={() => handleRemoveDomain(dom)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ef4444',
                  cursor: enabled ? 'pointer' : 'not-allowed',
                  padding: '0.2rem',
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Anti-Download */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
          <input
            type="checkbox"
            id="anti-download-checkbox"
            data-testid="security-anti-download"
            disabled={!enabled}
            checked={antiDownload}
            onChange={(e) => setAntiDownload(e.target.checked)}
            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#0891b2' }}
          />
          <label htmlFor="anti-download-checkbox" style={{ fontSize: '0.875rem', color: '#334155', cursor: 'pointer' }}>
            Desativar clique com botão direito e atalhos de download no player
          </label>
        </div>

        {/* Botão Salvar */}
        <div style={{ marginTop: '2rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            data-testid="security-save-btn"
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '0.7rem 1.6rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#0891b2',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 6px rgba(8, 145, 178, 0.25)',
            }}
          >
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </div>
      )}
    </div>
  )
}
