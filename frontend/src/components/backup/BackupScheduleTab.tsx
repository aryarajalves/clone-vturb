import React, { useState, useEffect } from 'react'
import { Clock, Folder, Shield, Save, Loader2 } from 'lucide-react'
import type { BackupSchedule, UpdateSchedulePayload } from '../../types/backup'

interface BackupScheduleTabProps {
  schedule: BackupSchedule | null
  loading: boolean
  saving: boolean
  onSaveSchedule: (payload: UpdateSchedulePayload) => Promise<void>
}

export const BackupScheduleTab: React.FC<BackupScheduleTabProps> = ({
  schedule,
  loading,
  saving,
  onSaveSchedule,
}) => {
  const [isActive, setIsActive] = useState(true)
  const [intervalValue, setIntervalValue] = useState(24)
  const [s3Folder, setS3Folder] = useState('vturb/backups/')
  const [retentionLimit, setRetentionLimit] = useState(30)

  useEffect(() => {
    if (schedule) {
      setIsActive(schedule.is_active)
      setIntervalValue(schedule.interval_value || 24)
      setS3Folder(schedule.s3_folder || 'vturb/backups/')
      setRetentionLimit(schedule.retention_limit || 30)
    }
  }, [schedule])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSaveSchedule({
      is_active: isActive,
      frequency: 'hours',
      interval_value: Number(intervalValue),
      s3_folder: s3Folder.trim(),
      retention_limit: Number(retentionLimit),
    })
  }

  if (loading && !schedule) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
        <Loader2 size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem auto' }} />
        <div>Carregando configurações de agendamento...</div>
      </div>
    )
  }

  return (
    <div data-testid="backup-schedule-tab" style={{ maxWidth: '780px' }}>
      <form onSubmit={handleSubmit}>
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            padding: '2rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
              Agendamento de Backup Automático
            </h3>
            <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.875rem', color: '#64748b' }}>
              Configure a rotina periódica de backups do banco de dados no Backblaze B2 (protocolo S3).
            </p>
          </div>

          {/* Toggle de Ativação */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem',
              borderRadius: '12px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              marginBottom: '1.75rem',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>
                Ativar Backup Automático
              </div>
              <div style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '0.2rem' }}>
                {isActive
                  ? 'Rotina ativa. O sistema executará os dumps conforme o intervalo configurado.'
                  : 'Rotina pausada. Nenhum backup automático será disparado.'}
              </div>
            </div>

            <button
              type="button"
              data-testid="toggle-backup-enabled"
              onClick={() => setIsActive(!isActive)}
              style={{
                width: '50px',
                height: '28px',
                borderRadius: '14px',
                backgroundColor: isActive ? '#0284c7' : '#cbd5e1',
                border: 'none',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                padding: 0,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: '3px',
                  left: isActive ? '25px' : '3px',
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  transition: 'left 0.2s',
                }}
              />
            </button>
          </div>

          {/* Frequência em Horas */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="frequency-select"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '0.5rem',
              }}
            >
              <Clock size={16} color="#0284c7" />
              <span>Frequência de Execução</span>
            </label>
            <select
              id="frequency-select"
              data-testid="input-frequency-hours"
              value={intervalValue}
              onChange={(e) => setIntervalValue(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '0.9rem',
                color: '#1e293b',
                outline: 'none',
              }}
            >
              <option value={1}>A cada 1 hora</option>
              <option value={3}>A cada 3 horas</option>
              <option value={6}>A cada 6 horas</option>
              <option value={12}>A cada 12 horas</option>
              <option value={24}>A cada 24 horas (Diário - Recomendado)</option>
              <option value={48}>A cada 48 horas (A cada 2 dias)</option>
              <option value={168}>A cada 7 dias (Semanal)</option>
            </select>
          </div>

          {/* Pasta de Destino no S3 */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="s3-folder-input"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '0.5rem',
              }}
            >
              <Folder size={16} color="#0284c7" />
              <span>Pasta de Destino no S3 / Bucket B2</span>
            </label>
            <input
              id="s3-folder-input"
              type="text"
              data-testid="input-s3-folder"
              value={s3Folder}
              onChange={(e) => setS3Folder(e.target.value)}
              placeholder="vturb/backups/"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '0.9rem',
                color: '#1e293b',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
              Caminho relativo dentro do bucket onde os arquivos <code>.dump.gz</code> serão gravados.
            </span>
          </div>

          {/* Limite de Retenção Máxima */}
          <div style={{ marginBottom: '2rem' }}>
            <label
              htmlFor="max-retention-input"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '0.5rem',
              }}
            >
              <Shield size={16} color="#0284c7" />
              <span>Limite de Retenção de Backups (Máximo de Dumps)</span>
            </label>
            <input
              id="max-retention-input"
              type="number"
              data-testid="input-max-retention"
              min={1}
              max={365}
              value={retentionLimit}
              onChange={(e) => setRetentionLimit(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '0.9rem',
                color: '#1e293b',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
              Quando a quantidade de backups ultrapassar esse limite, o backup mais antigo é excluído automaticamente do bucket.
            </span>
          </div>

          {/* Botão de Salvar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              data-testid="btn-save-schedule"
              disabled={saving}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.75rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.75 : 1,
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
              }}
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              <span>{saving ? 'Salvando...' : 'Salvar Configurações'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
