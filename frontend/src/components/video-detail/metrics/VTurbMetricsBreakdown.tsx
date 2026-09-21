import React from 'react'
import { Smartphone, Laptop, Globe, Compass, Share2 } from 'lucide-react'

export type BreakdownTab = 'countries' | 'devices' | 'os' | 'browsers' | 'traffic'

interface VTurbMetricsBreakdownProps {
  tab: BreakdownTab
}

export const VTurbMetricsBreakdown: React.FC<VTurbMetricsBreakdownProps> = ({ tab }) => {
  return (
    <div
      data-testid={`vturb-panel-${tab}`}
      style={{
        background: '#000000',
        borderRadius: '10px',
        padding: '1.75rem',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {tab === 'devices' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h5 style={{ margin: 0, fontSize: '0.95rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Smartphone size={16} color="#38bdf8" /> Distribuição por Dispositivo
          </h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <span>Celular (Mobile)</span>
                <span style={{ color: '#22c55e', fontWeight: 700 }}>82%</span>
              </div>
              <div style={{ height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '82%', height: '100%', background: '#22c55e' }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <span>Desktop (Computador)</span>
                <span style={{ color: '#38bdf8', fontWeight: 700 }}>18%</span>
              </div>
              <div style={{ height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '18%', height: '100%', background: '#38bdf8' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'countries' && (
        <div>
          <h5 style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Globe size={16} color="#38bdf8" /> Acessos por País
          </h5>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #1e293b' }}>
            <span>🇧🇷 Brasil</span>
            <span style={{ color: '#22c55e', fontWeight: 700 }}>98.4%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0' }}>
            <span>🇺🇸 Estados Unidos</span>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>1.6%</span>
          </div>
        </div>
      )}

      {tab === 'os' && (
        <div>
          <h5 style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Laptop size={16} color="#38bdf8" /> Sistemas Operacionais
          </h5>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
            <span>Android</span>
            <span style={{ color: '#22c55e', fontWeight: 700 }}>58%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
            <span>iOS (iPhone)</span>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>28%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
            <span>Windows</span>
            <span style={{ color: '#a855f7', fontWeight: 700 }}>14%</span>
          </div>
        </div>
      )}

      {tab === 'browsers' && (
        <div>
          <h5 style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Compass size={16} color="#38bdf8" /> Navegadores
          </h5>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
            <span>Chrome Mobile / Desktop</span>
            <span style={{ color: '#22c55e', fontWeight: 700 }}>71%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
            <span>Safari / WebKit</span>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>24%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
            <span>Outros</span>
            <span style={{ color: '#94a3b8', fontWeight: 700 }}>5%</span>
          </div>
        </div>
      )}

      {tab === 'traffic' && (
        <div>
          <h5 style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Share2 size={16} color="#38bdf8" /> Origem do Tráfego
          </h5>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
            <span>Tráfego Direto / Orgânico</span>
            <span style={{ color: '#22c55e', fontWeight: 700 }}>46%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
            <span>Campanhas / Anúncios (Facebook / TikTok / Google)</span>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>54%</span>
          </div>
        </div>
      )}
    </div>
  )
}
