from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class SmartAutoplaySettings(BaseModel):
    model_config = ConfigDict(extra="allow")
    enabled: bool = False
    text: str = "Seu vídeo já começou!"
    subtext: str = "Clique no botão abaixo para ativar o som"
    button_color: str = "#ef4444"
    button_text: str = "CLIQUE PARA OUVIR"
    restart_on_unmute: bool = False
    size: Optional[str] = "medium"

class FloatingPlayerSettings(BaseModel):
    model_config = ConfigDict(extra="allow")
    enabled: bool = False
    position: str = "bottom-right"
    width: int = 320
    closeable: bool = True

class PitchDelaySettings(BaseModel):
    model_config = ConfigDict(extra="allow")
    enabled: bool = False
    time: int = 60
    target_css_selector: str = ".delay-pitch"
    auto_scroll: bool = True
    scroll_offset: int = 50
    persistence: bool = True

class PixelEventConfig(BaseModel):
    model_config = ConfigDict(extra="allow")
    trigger: str
    event_name: str
    enabled: bool = True

class TrackingPixelsSettings(BaseModel):
    model_config = ConfigDict(extra="allow")
    enabled: bool = False
    facebook_pixel_id: Optional[str] = None
    google_analytics_id: Optional[str] = None
    tiktok_pixel_id: Optional[str] = None
    events: Optional[List[PixelEventConfig]] = None

class DomainProtectionSettings(BaseModel):
    model_config = ConfigDict(extra="allow")
    enabled: bool = False
    allowed_domains: List[str] = Field(default_factory=list)
    anti_download: bool = True

class PlayerSettings(BaseModel):
    model_config = ConfigDict(extra="allow")
    primary_color: str = "#6366f1"
    autoplay: bool = False
    show_controls: bool = True
    cta_enabled: bool = False
    cta_time: int = 0
    cta_text: str = "Comprar Agora"
    cta_link: str = "https://example.com"
    turbo_enabled: Optional[bool] = False
    playback_rate: Optional[float] = 1.0
    smart_autoplay: Optional[SmartAutoplaySettings] = None
    floating_player: Optional[FloatingPlayerSettings] = None
    pitch_delay: Optional[PitchDelaySettings] = None
    tracking_pixels: Optional[TrackingPixelsSettings] = None
    domain_protection: Optional[DomainProtectionSettings] = None



class VideoCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    video_url: str = Field(..., min_length=1, max_length=1024)
    thumbnail_url: Optional[str] = Field(None, max_length=1024)
    duration: Optional[float] = 0.0
    player_settings: Optional[PlayerSettings] = None

class VideoUpdate(BaseModel):
    title: Optional[str] = None
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    player_settings: Optional[PlayerSettings] = None

class VideoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    video_url: str
    thumbnail_url: Optional[str] = None
    duration: float
    plays_count: Optional[int] = 0
    player_settings: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

class AnalyticsEventCreate(BaseModel):
    event_type: str = Field(..., description="impression, play, progress_25, progress_50, progress_75, progress_100, click")
    watch_time_seconds: Optional[float] = 0.0
    session_id: Optional[str] = None
    referer: Optional[str] = None

class HourlyMetric(BaseModel):
    hour: int
    label: str
    impressions: int
    plays: int
    clicks: int = 0

class PeakHour(BaseModel):
    hour: int
    label: str
    impressions: int
    plays: int
    total_activity: int

class VideoMetricsResponse(BaseModel):
    video_id: str
    period: Optional[str] = "all"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    timezone: str = "America/Sao_Paulo (Horário de Brasília / UTC-3)"
    total_impressions: int
    unique_impressions: int
    total_plays: int
    unique_plays: int
    play_rate: float
    total_clicks: int
    ctr: float
    avg_watch_time_seconds: float
    retention: Dict[str, int]
    hourly_distribution: List[HourlyMetric] = []
    peak_hour: Optional[PeakHour] = None


class BulkDeleteRequest(BaseModel):
    video_ids: List[str] = Field(..., min_length=1)


class BulkDeleteResponse(BaseModel):
    deleted_count: int
    deleted_ids: List[str]


