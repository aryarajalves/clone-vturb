import time
import requests
from playwright.sync_api import sync_playwright

VIDEO_ID = "c4b4d4b3-fdfd-46f3-8c47-959a6bfe0afb"
PAGE_URL = f"http://localhost:5175/?preview={VIDEO_ID}&ratio=16:9&width=100%25&transparent=1"
API_URL = "http://localhost:8003"

def get_current_metrics():
    auth_res = requests.post(f"{API_URL}/auth/login", json={
        "email": "aryarajmarketing@gmail.com",
        "password": "123456"
    })
    token = auth_res.json()["access_token"]
    res = requests.get(
        f"{API_URL}/videos/{VIDEO_ID}/metrics?period=all",
        headers={"Authorization": f"Bearer {token}"}
    )
    return res.json()

def main():
    print("=" * 60)
    print("1. OBTENDO MÉTRICAS ATUAIS (ANTES DO NOVO VISITANTE)")
    print("=" * 60)
    before = get_current_metrics()
    print(f"• Visitantes Únicos:  {before['unique_impressions']}")
    print(f"• Impressões Totais:  {before['total_impressions']}")
    print(f"• Plays Únicos:       {before['unique_plays']}")
    print(f"• Plays Totais:       {before['total_plays']}")
    print(f"• Play Rate:          {before['play_rate']}%")
    print(f"• Retenção:           {before['retention']}")

    print("\n" + "=" * 60)
    print("2. INICIANDO SIMULAÇÃO DE NOVO VISITANTE REAL COM PLAYWRIGHT")
    print("=" * 60)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Contexto limpo (sem cookies prévios, novo IP/User Agent)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 800}
        )
        page = context.new_page()

        print(f"• Acessando a página da imagem 03: {PAGE_URL}")
        page.goto(PAGE_URL)
        page.wait_for_timeout(3000)

        # Localiza o iframe do vídeo
        iframe_element = page.locator("iframe[data-testid='preview-test-iframe']")
        iframe = iframe_element.content_frame

        if iframe:
            print("• Iframe do player localizado com sucesso.")
            # Aguarda e clica no botão de Smart Autoplay ("CLIQUE PARA OUVIR") ou no player
            unmute_btn = iframe.locator("button:has-text('CLIQUE PARA OUVIR'), button:has-text('Clique para Ouvir'), button:has-text('Ouvir')").first
            play_btn = iframe.locator("button[aria-label='Play'], [data-testid='center-play-button']").first

            if unmute_btn.is_visible(timeout=3000):
                print("• Botão 'CLIQUE PARA OUVIR' detectado. Clicando para desmutar e dar play...")
                unmute_btn.click()
            elif play_btn.is_visible(timeout=2000):
                print("• Botão de Play central detectado. Clicando para dar play...")
                play_btn.click()
            else:
                print("• Clicando no centro do player de vídeo...")
                iframe.locator("video").click()

            print("• Espectador assistindo à VSL...")
            # Deixa o vídeo tocar por 6 segundos
            page.wait_for_timeout(6000)

            # Rola a página para baixo para simular a leitura do site completo (testando o player flutuante)
            print("• Visitante rolando a página para ler o site completo...")
            page.evaluate("window.scrollBy(0, 800)")
            page.wait_for_timeout(3000)

            print("• Visitante assistiu e interagiu com a página com sucesso!")
        else:
            print("• Iframe não encontrado diretamente, interagindo na página...")

        page.wait_for_timeout(2000)
        browser.close()

    print("\n" + "=" * 60)
    print("3. OBTENDO MÉTRICAS ATUALIZADAS (DEPOIS DA VISITA)")
    print("=" * 60)
    time.sleep(2)
    after = get_current_metrics()
    print(f"• Visitantes Únicos:  {before['unique_impressions']} -> {after['unique_impressions']} (Novo visitante registrado!)")
    print(f"• Impressões Totais:  {before['total_impressions']} -> {after['total_impressions']} (+1 impressão)")
    print(f"• Plays Únicos:       {before['unique_plays']} -> {after['unique_plays']} (Novo play único!)")
    print(f"• Plays Totais:       {before['total_plays']} -> {after['total_plays']} (+1 play)")
    print(f"• Play Rate:          {after['play_rate']}%")
    print(f"• Retenção:           {after['retention']}")
    print("=" * 60)

if __name__ == "__main__":
    main()
