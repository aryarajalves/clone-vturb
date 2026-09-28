import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def get_utc_now():
    return datetime.now(timezone.utc)

class Video(Base):
    __tablename__ = "videos"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    video_url = Column(String(1024), nullable=False)
    thumbnail_url = Column(String(1024), nullable=True)
    duration = Column(Float, default=0.0)
    player_settings = Column(JSON, default=lambda: {
        "primary_color": "#6366f1",
        "autoplay": False,
        "show_controls": True,
        "cta_enabled": False,
        "cta_time": 0,
        "cta_text": "Comprar Agora",
        "cta_link": "https://example.com",
        "controls_config": {
            "rewind_10s": True,
            "forward_10s": True,
            "volume": True,
            "fullscreen": True,
            "speed_control": True
        }
    })
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)

    analytics = relationship("VideoAnalytics", back_populates="video", cascade="all, delete-orphan")
    leads = relationship("VideoLead", back_populates="video", cascade="all, delete-orphan")


class VideoAnalytics(Base):
    __tablename__ = "video_analytics"

    id = Column(Integer, primary_key=True, autoincrement=True)
    video_id = Column(String(36), ForeignKey("videos.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type = Column(String(50), nullable=False, index=True) # impression, play, progress_25, progress_50, progress_75, progress_100, click
    watch_time_seconds = Column(Float, default=0.0)
    session_id = Column(String(100), nullable=True)
    referer = Column(String(512), nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, index=True)

    video = relationship("Video", back_populates="analytics")


class VideoLead(Base):
    __tablename__ = "video_leads"

    id = Column(Integer, primary_key=True, autoincrement=True)
    video_id = Column(String(36), ForeignKey("videos.id", ondelete="CASCADE"), nullable=False, index=True)
    lead_id = Column(String(100), nullable=True, index=True)
    name = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True, index=True)
    session_id = Column(String(100), nullable=True, index=True)
    event = Column(String(50), default="vsl_play")
    watch_time_seconds = Column(Float, default=0.0)
    max_progress_percent = Column(Float, default=0.0)
    reached_cta = Column(Integer, default=0) # 0 ou 1 para compatibilidade total
    play_count = Column(Integer, default=1)
    first_play_at = Column(DateTime(timezone=True), default=get_utc_now)
    last_seen_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, index=True)

    video = relationship("Video", back_populates="leads")
