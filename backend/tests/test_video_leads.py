import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.api.deps import get_current_user
from app.models.user import User

client = TestClient(app)

mock_admin = User(
    id="test-lead-admin-id",
    email="admin@vturb.com",
    is_super_admin=True
)

@pytest.fixture(autouse=True)
def override_auth_dependency():
    app.dependency_overrides[get_current_user] = lambda: mock_admin
    yield
    app.dependency_overrides.pop(get_current_user, None)

def test_record_lead_play_and_query_flow():
    # 1. Cria vídeo de teste com momento da oferta (CTA) aos 15 segundos
    video_res = client.post("/videos/", json={
        "title": "VSL com Rastreamento de Leads",
        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        "duration": 60.0,
        "player_settings": {
            "cta_time": 15,
            "cta_enabled": True
        }
    })
    assert video_res.status_code == 201
    video_id = video_res.json()["id"]

    # 2. Envia evento de play do lead exatamente no formato solicitado pelo usuário
    payload_lead_1 = {
        "event": "vsl_play",
        "video_id": video_id,
        "name": "Flavia Fernandes",
        "phone": "+55 (18) 99787-7100",
        "lead_id": "20260928-164404-3054288f"
    }
    lead_res = client.post("/videos/lead-event", json=payload_lead_1)
    assert lead_res.status_code == 201
    lead_data = lead_res.json()
    assert lead_data["status"] == "ok"
    assert lead_data["lead_id"] == "20260928-164404-3054288f"
    assert lead_data["name"] == "Flavia Fernandes"
    assert lead_data["phone"] == "+55 (18) 99787-7100"
    assert lead_data["play_count"] == 1
    assert lead_data["reached_cta"] is False

    # 3. Consulta lista de leads do vídeo
    leads_list_res = client.get(f"/videos/{video_id}/leads")
    assert leads_list_res.status_code == 200
    leads_list_data = leads_list_res.json()
    assert leads_list_data["video_id"] == video_id
    assert leads_list_data["total_leads"] == 1
    assert leads_list_data["leads_reached_cta"] == 0

    first_lead = leads_list_data["leads"][0]
    assert first_lead["name"] == "Flavia Fernandes"
    assert first_lead["phone"] == "+55 (18) 99787-7100"
    assert first_lead["lead_id"] == "20260928-164404-3054288f"

    # 4. Lead assiste a VSL e atinge 25% e momento da oferta via telemetria
    prog_res = client.post(f"/videos/{video_id}/events", json={
        "event_type": "progress_25",
        "watch_time_seconds": 15.0,
        "lead_id": "20260928-164404-3054288f",
        "phone": "+55 (18) 99787-7100"
    })
    assert prog_res.status_code == 201

    cta_res = client.post(f"/videos/{video_id}/events", json={
        "event_type": "cta_reached",
        "watch_time_seconds": 16.0,
        "lead_id": "20260928-164404-3054288f"
    })
    assert cta_res.status_code == 201

    # 5. Verifica se o progresso do lead foi atualizado na listagem
    leads_list_res_after = client.get(f"/videos/{video_id}/leads")
    assert leads_list_res_after.status_code == 200
    updated_data = leads_list_res_after.json()
    assert updated_data["total_leads"] == 1
    assert updated_data["leads_reached_cta"] == 1

    updated_lead = updated_data["leads"][0]
    assert updated_lead["reached_cta"] is True
    assert updated_lead["max_progress_percent"] >= 25.0
    assert updated_lead["watch_time_seconds"] >= 15.0

    # 6. Registra segundo lead via endpoint alternativo /lead-play
    payload_lead_2 = {
        "event": "vsl_play",
        "video_id": video_id,
        "name": "Carlos Eduardo",
        "phone": "+55 (11) 98765-4321",
        "lead_id": "20260928-170000-abcd1234"
    }
    lead_res_2 = client.post("/videos/lead-play", json=payload_lead_2)
    assert lead_res_2.status_code == 201

    final_leads = client.get(f"/videos/{video_id}/leads").json()
    assert final_leads["total_leads"] == 2
    assert final_leads["leads_reached_cta"] == 1

def test_lead_play_404_for_nonexistent_video():
    res = client.post("/videos/lead-event", json={
        "event": "vsl_play",
        "video_id": "nonexistent-video-uuid",
        "name": "Teste",
        "phone": "+5511999999999"
    })
    assert res.status_code == 404
