import os
import time
from playwright.sync_api import sync_playwright

SCREENSHOTS_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "help-screenshots")
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

def capture_screenshots():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1366, "height": 768}, device_scale_factor=1.5)
        page = context.new_page()

        print("Acessando tela de login...")
        page.goto("http://localhost:5175")
        page.wait_for_timeout(1000)

        if page.locator('[data-testid="login-email-input"]').is_visible():
            print("Preenchendo credenciais...")
            page.fill('[data-testid="login-email-input"]', "aryarajmarketing@gmail.com")
            page.fill('[data-testid="login-password-input"]', "123456")
            page.click('[data-testid="login-submit-btn"]')
            page.wait_for_timeout(2500)

        print("Capturando 1: Primeiros Passos (Dashboard)...")
        page.wait_for_selector('[data-testid="page-title"]')
        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "primeiros-passos.png"))

        print("Capturando 2: Tela de Criação e Upload...")
        page.click('[data-testid="btn-novo-video"]')
        page.wait_for_selector('[data-testid="video-create-view"]')
        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "video-create.png"))

        print("Voltando para a lista de vídeos...")
        page.click('[data-testid="back-to-videos-btn"]')
        page.wait_for_selector('[data-testid="page-title"]')
        time.sleep(0.8)

        print("Abrindo editor do vídeo...")
        page.wait_for_selector('[data-testid^="edit-btn-"]')
        page.locator('[data-testid^="edit-btn-"]').first.click()

        page.wait_for_selector('[data-testid="video-detail-view"]')
        time.sleep(1.2)

        # 3. Estilização
        print("Capturando 3: Estilização do Player...")
        page.click('[data-testid="tab-btn-styling"]')
        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "estilizacao-player.png"))

        # 4. Modo Turbo
        print("Capturando 4: Modo Turbo...")
        if not page.locator('[data-testid="tab-btn-turbo"]').is_visible():
            page.click('[data-testid="tab-btn-controls"]')
            time.sleep(0.5)
        page.click('[data-testid="tab-btn-turbo"]')
        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "modo-turbo.png"))

        # 5. Smart Autoplay
        print("Capturando 5: Smart Autoplay...")
        page.click('[data-testid="tab-btn-smart_autoplay"]')
        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "smart-autoplay.png"))

        # 6. Conteúdo Oculto (Pitch Delay)
        print("Capturando 6: Pitch Delay...")
        page.click('[data-testid="tab-btn-pitch_delay"]')
        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "pitch-delay-cta.png"))

        # 7. Player Flutuante
        print("Capturando 7: Player Flutuante...")
        page.click('[data-testid="tab-btn-floating_player"]')
        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "player-flutuante.png"))

        # 8. Incorporação (Embed)
        print("Capturando 8: Incorporação (Embed)...")
        page.click('[data-testid="tab-btn-embed"]')
        time.sleep(1.2)
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "incorporacao-embed.png"))

        # 9. Métricas & Leads
        print("Capturando 9: Métricas & Leads...")
        page.click('[data-testid="tab-btn-metrics"]')
        time.sleep(1.5)
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "metricas-leads.png"))

        # Volta aos vídeos e vai para Gestão de Usuários
        print("Voltando aos vídeos...")
        page.click('[data-testid="back-to-videos-btn"]')
        page.wait_for_selector('[data-testid="page-title"]')
        time.sleep(1)

        print("Capturando 10: Gestão de Usuários...")
        page.click('[data-testid="nav-gestao-usuarios"]')
        page.wait_for_selector('[data-testid="user-management-view"]')
        time.sleep(1.2)
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "gestao-usuarios.png"))

        print("Todas as capturas foram concluídas com sucesso!")
        browser.close()

if __name__ == "__main__":
    capture_screenshots()
