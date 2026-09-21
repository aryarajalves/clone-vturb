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
