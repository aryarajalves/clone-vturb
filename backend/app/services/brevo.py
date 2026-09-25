import logging
from typing import Optional
import httpx
from app.core.config import settings

logger = logging.getLogger("projetovturb.brevo")

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"

def send_verification_code_email(to_email: str, code: str, to_name: Optional[str] = None) -> bool:
    """
    Envia e-mail com o código de 6 dígitos para validação de ativação de conta via API Brevo.
    Se a chave BREVO_API_KEY não estiver configurada (ambiente local/dev), opera em modo de simulação.
    """
    api_key = settings.BREVO_API_KEY.strip()
    recipient_name = to_name.strip() if to_name and to_name.strip() else to_email.split("@")[0]

    # Modo de Simulação para Desenvolvimento Local e Testes
    if not api_key or api_key.startswith("xkeysib-xxxx"):
        logger.info(
            f"📧 [BREVO SIMULAÇÃO / DEV] Código de ativação gerado para {to_email}: [{code}]. "
            f"(Configure BREVO_API_KEY no .env para disparo real)."
        )
        return True

    headers = {
        "accept": "application/json",
        "api-key": api_key,
        "content-type": "application/json",
    }

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Código de Verificação - Smart VSL</title>
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }}
        .card {{ max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }}
        .header {{ text-align: center; margin-bottom: 24px; }}
        .logo {{ font-size: 24px; font-weight: 800; color: #0f172a; display: inline-flex; align-items: center; gap: 8px; }}
        .title {{ font-size: 20px; font-weight: 700; color: #1e293b; margin: 16px 0 8px; }}
        .text {{ font-size: 15px; color: #64748b; line-height: 1.6; margin: 0 0 24px; }}
        .code-box {{ background: #f0fdf4; border: 2px dashed #16a34a; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0; }}
        .code {{ font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #15803d; font-family: monospace; }}
        .footer {{ font-size: 13px; color: #94a3b8; text-align: center; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="logo">▶ Smart VSL</div>
          <h2 class="title">Ativação da Sua Conta</h2>
        </div>
        <p class="text">Olá, <strong>{recipient_name}</strong>!</p>
        <p class="text">Recebemos sua solicitação para criar uma conta na plataforma. Utilize o código de 6 dígitos abaixo para confirmar e ativar seu acesso:</p>
        
        <div class="code-box">
          <div class="code">{code}</div>
        </div>

        <p class="text">Este código expira em <strong>15 minutos</strong>. Se você não solicitou este cadastro, ignore este e-mail.</p>

        <div class="footer">
          &copy; Smart VSL - Player de Alta Conversão. Todos os direitos reservados.
        </div>
      </div>
    </body>
    </html>
    """

    payload = {
        "sender": {
            "name": settings.BREVO_SENDER_NAME,
            "email": settings.BREVO_SENDER_EMAIL,
        },
        "to": [
            {
                "email": to_email,
                "name": recipient_name,
            }
        ],
        "subject": f"Seu código de ativação Smart VSL: {code}",
        "htmlContent": html_content,
    }

    try:
        logger.info(f"Disparando e-mail de verificação via Brevo para {to_email}...")
        with httpx.Client(timeout=10.0) as client:
            response = client.post(BREVO_API_URL, headers=headers, json=payload)
            if response.status_code in [200, 201, 202]:
                logger.info(f"E-mail de verificação enviado com sucesso para {to_email} (Status {response.status_code})")
                return True
            else:
                logger.error(
                    f"Falha ao enviar e-mail via Brevo para {to_email}. "
                    f"Status: {response.status_code}, Resposta: {response.text}"
                )
                return False
    except Exception as exc:
        logger.error(f"Erro inesperado na comunicação com a API Brevo para {to_email}: {exc}")
        return False


def send_password_reset_email(to_email: str, reset_url: str, to_name: Optional[str] = None) -> bool:
    """
    Envia e-mail com link de redefinição de senha para o usuário via API Brevo.
    Em modo local ou sem chave configurada, opera em modo de simulação com log.
    """
    api_key = settings.BREVO_API_KEY.strip()
    recipient_name = to_name.strip() if to_name and to_name.strip() else to_email.split("@")[0]

    # Modo de Simulação para Desenvolvimento Local e Testes
    if not api_key or api_key.startswith("xkeysib-xxxx"):
        logger.info(
            f"📧 [BREVO SIMULAÇÃO / DEV] Redefinição de senha gerada para {to_email}. "
            f"Link: [{reset_url}]. (Configure BREVO_API_KEY no .env para disparo real)."
        )
        return True

    headers = {
        "accept": "application/json",
        "api-key": api_key,
        "content-type": "application/json",
    }

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Redefinição de Senha - Smart VSL</title>
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }}
        .card {{ max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }}
        .header {{ text-align: center; margin-bottom: 24px; }}
        .logo {{ font-size: 24px; font-weight: 800; color: #0f172a; display: inline-flex; align-items: center; gap: 8px; }}
        .title {{ font-size: 20px; font-weight: 700; color: #1e293b; margin: 16px 0 8px; }}
        .text {{ font-size: 15px; color: #64748b; line-height: 1.6; margin: 0 0 24px; }}
        .btn-box {{ text-align: center; margin: 28px 0; }}
        .btn {{ display: inline-block; background-color: #0284c7; color: #ffffff; padding: 14px 28px; border-radius: 10px; font-size: 16px; font-weight: 700; text-decoration: none; }}
        .footer {{ font-size: 13px; color: #94a3b8; text-align: center; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="logo">▶ Smart VSL</div>
          <h2 class="title">Redefinição de Senha</h2>
        </div>
        <p class="text">Olá, <strong>{recipient_name}</strong>!</p>
        <p class="text">Uma solicitação de redefinição de senha foi iniciada para sua conta pelo Administrador da plataforma. Clique no botão abaixo para criar sua nova senha de acesso:</p>
        
        <div class="btn-box">
          <a href="{reset_url}" class="btn" style="color:#ffffff;">Redefinir Minha Senha</a>
        </div>

        <p class="text" style="font-size:13px; color:#94a3b8;">Se o botão acima não funcionar, copie e cole o seguinte link em seu navegador:<br><a href="{reset_url}" style="color:#0284c7; word-break:break-all;">{reset_url}</a></p>
        <p class="text">Este link é válido por <strong>24 horas</strong>. Se você não esperava essa alteração, contate o administrador do sistema.</p>

        <div class="footer">
          &copy; Smart VSL - Player de Alta Conversão. Todos os direitos reservados.
        </div>
      </div>
    </body>
    </html>
    """

    payload = {
        "sender": {
            "name": settings.BREVO_SENDER_NAME,
            "email": settings.BREVO_SENDER_EMAIL,
        },
        "to": [
            {
                "email": to_email,
                "name": recipient_name,
            }
        ],
        "subject": "Redefinição de Senha - Smart VSL",
        "htmlContent": html_content,
    }

    try:
        logger.info(f"Disparando e-mail de redefinição de senha via Brevo para {to_email}...")
        with httpx.Client(timeout=10.0) as client:
            response = client.post(BREVO_API_URL, headers=headers, json=payload)
            if response.status_code in [200, 201, 202]:
                logger.info(f"E-mail de redefinição de senha enviado com sucesso para {to_email} (Status {response.status_code})")
                return True
            else:
                logger.error(
                    f"Falha ao enviar e-mail de redefinição via Brevo para {to_email}. "
                    f"Status: {response.status_code}, Resposta: {response.text}"
                )
                return False
    except Exception as exc:
        logger.error(f"Erro inesperado na comunicação com a API Brevo para {to_email}: {exc}")
        return False
