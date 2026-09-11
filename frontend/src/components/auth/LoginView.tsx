import React, { useState } from 'react'
import { Play, Mail, Lock, Eye, EyeOff, LogIn, ShieldCheck, Zap, BarChart3, Flame } from 'lucide-react'
import { loginApi } from '../../services/api'
import type { User } from '../../types/auth'

interface LoginViewProps {
  onLoginSuccess: (user: User) => void
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Por favor, preencha o e-mail e a senha.')
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const response = await loginApi({
        email: email.trim(),
        password: password.trim(),
      })
      onLoginSuccess(response.user)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage('Erro ao realizar login. Verifique suas credenciais.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      data-testid="login-view-container"
      style={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#f8fafc',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Coluna Esquerda: Formulário de Login */}
      <div
        data-testid="login-form-column"
        style={{
          flex: '1',
          maxWidth: '520px',
          minWidth: '380px',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '3rem 3.5rem',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.04)',
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)',
            }}
          >
            <Play size={20} color="#ffffff" fill="#ffffff" style={{ marginLeft: '2px' }} />
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
            Clone do VTurb
          </span>
        </div>

        {/* Título e Subtítulo */}
        <div style={{ marginBottom: '2rem' }}>
          <h1
            data-testid="login-heading"
            style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}
          >
            Bem-vindo de volta
          </h1>
          <p style={{ fontSize: '0.925rem', color: '#64748b', lineHeight: '1.5' }}>
            Acesse o painel para gerenciar seus vídeos, métricas e automações de alta conversão.
          </p>
        </div>

        {/* Mensagem de Erro */}
        {errorMessage && (
          <div
            data-testid="login-error-message"
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#dc2626',
              fontSize: '0.875rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label
              htmlFor="login-email"
              style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}
            >
              E-mail
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail
                size={18}
                color="#94a3b8"
                style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }}
              />
              <input
                id="login-email"
                data-testid="login-email-input"
                type="email"
                placeholder="seu-email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  fontSize: '0.95rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="login-password"
              style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}
            >
              Senha
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock
                size={18}
                color="#94a3b8"
                style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }}
              />
              <input
                id="login-password"
                data-testid="login-password-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.75rem 2.75rem 0.75rem 2.5rem',
                  fontSize: '0.95rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                data-testid="toggle-password-visibility"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  color: '#94a3b8',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            data-testid="login-submit-btn"
            disabled={isLoading}
            style={{
              marginTop: '0.5rem',
              padding: '0.85rem 1.25rem',
              backgroundColor: isLoading ? '#f87171' : '#ef4444',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: '8px',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
              transition: 'background-color 0.2s, transform 0.1s',
            }}
          >
            {isLoading ? (
              <span>Autenticando...</span>
            ) : (
              <>
                <LogIn size={18} />
                <span>Entrar no Painel</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Coluna Direita: Imagem e Showcase Visual */}
      <div
        data-testid="login-image-column"
        style={{
          flex: '1.4',
          position: 'relative',
          background: 'linear-gradient(135deg, #090d16 0%, #0f172a 40%, #1e1b4b 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem',
          overflow: 'hidden',
        }}
      >
        {/* Glows decorativos de fundo */}
        <div
          style={{
            position: 'absolute',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.25) 0%, rgba(239, 68, 68, 0) 70%)',
            top: '-50px',
            right: '-50px',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0) 70%)',
            bottom: '-50px',
            left: '50px',
            pointerEvents: 'none',
          }}
        />

        {/* Card Ilustrativo de Alta Conversão */}
        <div
          style={{
            width: '100%',
            maxWidth: '560px',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
            padding: '2rem',
            position: 'relative',
            zIndex: 5,
          }}
        >
          {/* Header do Card */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '999px',
                padding: '0.3rem 0.8rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#f87171',
              }}
            >
              <Flame size={13} />
              <span>Alta Conversão</span>
            </div>
          </div>

          {/* Visualização de Player Moderno */}
          <div
            style={{
              width: '100%',
              aspectRatio: '16/9',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              marginBottom: '1.5rem',
              overflow: 'hidden',
            }}
          >
            {/* Fake Video Player Preview */}
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(239, 68, 68, 0.5)',
                cursor: 'pointer',
              }}
            >
              <Play size={28} color="#ffffff" fill="#ffffff" style={{ marginLeft: '4px' }} />
            </div>

            {/* Smart Autoplay Banner Fake */}
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '6px',
                padding: '0.35rem 0.65rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.725rem',
                color: '#f8fafc',
              }}
            >
              <Zap size={13} color="#f59e0b" />
              <span>Smart Autoplay Ativo</span>
            </div>

            {/* Floating Player indicator */}
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                borderRadius: '6px',
                padding: '0.25rem 0.5rem',
                fontSize: '0.65rem',
                color: '#94a3b8',
              }}
            >
              Resolução Full HD • 60 FPS
            </div>
          </div>

          {/* 3 Recursos em Destaque */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div
              style={{
                padding: '0.85rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                textAlign: 'center',
              }}
            >
              <Zap size={18} color="#ef4444" style={{ margin: '0 auto 0.4rem' }} />
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc' }}>Turbo Autoplay</div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Engajamento Instantâneo</div>
            </div>

            <div
              style={{
                padding: '0.85rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                textAlign: 'center',
              }}
            >
              <BarChart3 size={18} color="#3b82f6" style={{ margin: '0 auto 0.4rem' }} />
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc' }}>Retenção Real</div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Gráficos por Segundo</div>
            </div>

            <div
              style={{
                padding: '0.85rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                textAlign: 'center',
              }}
            >
              <ShieldCheck size={18} color="#10b981" style={{ margin: '0 auto 0.4rem' }} />
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc' }}>Segurança Total</div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Tokens e Anti-Scrape</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
