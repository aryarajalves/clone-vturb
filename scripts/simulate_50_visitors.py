import uuid
import random
import time
import requests

VIDEO_ID = "c4b4d4b3-fdfd-46f3-8c47-959a6bfe0afb"
API_URL = "http://localhost:8003"

def get_metrics():
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
    print("=" * 65)
    print("SIMULAÇÃO DE TRÁFEGO: 50 NOVOS USUÁRIOS DISTINTOS")
    print("=" * 65)

    before = get_metrics()
    print("ESTADO ANTERIOR:")
    print(f"• Visitantes Únicos:   {before['unique_impressions']}")
    print(f"• Impressões Totais:   {before['total_impressions']}")
    print(f"• Plays Únicos:        {before['unique_plays']}")
    print(f"• Plays Totais:        {before['total_plays']}")
    print(f"• Play Rate:           {before['play_rate']}%")
    print(f"• Retenção:            {before['retention']}")
    print(f"• Cliques CTA:         {before['total_clicks']} (CTR: {before['ctr']}%)")
    print(f"• Tempo Médio:         {before['avg_watch_time_seconds']}s")
    print("-" * 65)

    print("Iniciando envio de telemetria para 50 visitantes novos...")

    expected_plays = 0
    expected_p25 = 0
    expected_p50 = 0
    expected_p75 = 0
    expected_p100 = 0
    expected_clicks = 0

    dur = 336.0  # Duração do vídeo

    for i in range(1, 51):
        sess_id = f"visitante_real_{i}_{uuid.uuid4().hex[:6]}"

        # 1. Toda pessoa que abre a página gera IMPRESSÃO
        res_imp = requests.post(f"{API_URL}/videos/{VIDEO_ID}/events", json={
            "event_type": "impression",
            "session_id": sess_id,
            "watch_time_seconds": 0.0
        })
        if res_imp.status_code != 201:
            print(f"Erro na impressão do usuário {i}: {res_imp.text}")

        # 2. ~80% dos visitantes dão PLAY no vídeo (40 de 50)
        # Os primeiros 40 dão play com certeza para termos previsibilidade exata no teste
        gave_play = i <= 40

        if gave_play:
            expected_plays += 1
            res_play = requests.post(f"{API_URL}/videos/{VIDEO_ID}/events", json={
                "event_type": "play",
                "session_id": sess_id,
                "watch_time_seconds": 0.0
            })

            # Distribuição realista de retenção entre os 40 que deram play:
            # Usuários 1 a 35: chegam aos 25% (35 usuários)
            # Usuários 1 a 24: chegam aos 50% (24 usuários)
            # Usuários 1 a 14: chegam aos 75% (14 usuários)
            # Usuários 1 a 8:  chegam aos 100% (8 usuários)
            watch_time = 15.0

            if i <= 35:
                expected_p25 += 1
                watch_time = 85.0
                requests.post(f"{API_URL}/videos/{VIDEO_ID}/events", json={
                    "event_type": "progress_25",
                    "session_id": sess_id,
                    "watch_time_seconds": 84.0
                })

            if i <= 24:
                expected_p50 += 1
                watch_time = 170.0
                requests.post(f"{API_URL}/videos/{VIDEO_ID}/events", json={
                    "event_type": "progress_50",
                    "session_id": sess_id,
                    "watch_time_seconds": 168.0
                })

            if i <= 14:
                expected_p75 += 1
                watch_time = 255.0
                requests.post(f"{API_URL}/videos/{VIDEO_ID}/events", json={
                    "event_type": "progress_75",
                    "session_id": sess_id,
                    "watch_time_seconds": 252.0
                })

            if i <= 8:
                expected_p100 += 1
                watch_time = 336.0
                requests.post(f"{API_URL}/videos/{VIDEO_ID}/events", json={
                    "event_type": "progress_100",
                    "session_id": sess_id,
                    "watch_time_seconds": 336.0
                })

            # Usuários que chegaram na oferta e clicaram no botão de compra (5 cliques)
            if i <= 5:
                expected_clicks += 1
                requests.post(f"{API_URL}/videos/{VIDEO_ID}/events", json={
                    "event_type": "click",
                    "session_id": sess_id,
                    "watch_time_seconds": watch_time
                })

        if i % 10 == 0:
            print(f"[OK] {i}/50 visitantes processados...")

    print("[OK] Todos os 50 visitantes processados com sucesso!")
    print("-" * 65)

    time.sleep(1)
    after = get_metrics()

    print("MÉTRICAS ATUALIZADAS (APÓS OS 50 VISITANTES):")
    print(f"* Visitantes Únicos:   {before['unique_impressions']} -> {after['unique_impressions']} (Aumento de +50!)")
    print(f"* Impressões Totais:   {before['total_impressions']} -> {after['total_impressions']} (+50)")
    print(f"* Plays Únicos:        {before['unique_plays']} -> {after['unique_plays']} (+{expected_plays})")
    print(f"* Plays Totais:        {before['total_plays']} -> {after['total_plays']} (+{expected_plays})")
    print(f"* Play Rate Atual:     {after['play_rate']}%")
    print(f"* Retenção 25%:        {before['retention']['25%']} -> {after['retention']['25%']} (+{expected_p25})")
    print(f"* Retenção 50%:        {before['retention']['50%']} -> {after['retention']['50%']} (+{expected_p50})")
    print(f"* Retenção 75%:        {before['retention']['75%']} -> {after['retention']['75%']} (+{expected_p75})")
    print(f"* Retenção 100%:       {before['retention']['100%']} -> {after['retention']['100%']} (+{expected_p100})")
    print(f"* Cliques no CTA:      {before['total_clicks']} -> {after['total_clicks']} (+{expected_clicks})")
    print(f"* CTR Atual:           {after['ctr']}%")
    print(f"* Tempo Médio Atual:   {after['avg_watch_time_seconds']}s")
    print("=" * 65)

    # Verificações de consistência matemática
    assert after['unique_impressions'] == before['unique_impressions'] + 50, "Erro no incremento de Visitantes Únicos!"
    assert after['total_impressions'] == before['total_impressions'] + 50, "Erro no incremento de Impressões Totais!"
    assert after['unique_plays'] == before['unique_plays'] + expected_plays, "Erro no incremento de Plays Únicos!"
    assert after['total_plays'] == before['total_plays'] + expected_plays, "Erro no incremento de Plays Totais!"
    print("[SUCESSO] TODAS AS VALIDAÇÕES MATEMÁTICAS PASSARAM COM 100% DE EXATIDÃO!")

if __name__ == "__main__":
    main()
