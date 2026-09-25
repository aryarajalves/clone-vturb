import React, { useRef, useState, useEffect } from 'react'

interface UseStylingPreviewPlayerOptions {
  initialDuration?: number
}

export function useStylingPreviewPlayer({ initialDuration = 60 }: UseStylingPreviewPlayerOptions = {}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(initialDuration)
  const [isMuted, setIsMuted] = useState(false)
  const [volumeLevel, setVolumeLevel] = useState(1.0)
  const [currentSpeed, setCurrentSpeed] = useState(1.0)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = currentSpeed
    }
  }, [currentSpeed])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play().catch(() => {})
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration)
      }
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = Number(e.target.value)
    if (videoRef.current) {
      videoRef.current.currentTime = target
      setCurrentTime(target)
    }
  }

  const handleChapterClick = (start: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = start
      setCurrentTime(start)
    }
  }

  const handleRewind10 = () => {
    if (!videoRef.current) return
    const nextTime = Math.max(0, videoRef.current.currentTime - 10)
    videoRef.current.currentTime = nextTime
    setCurrentTime(nextTime)
  }

  const handleForward10 = () => {
    if (!videoRef.current) return
    const nextTime = Math.min(duration, videoRef.current.currentTime + 10)
    videoRef.current.currentTime = nextTime
    setCurrentTime(nextTime)
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    const nextMute = !isMuted
    videoRef.current.muted = nextMute
    setIsMuted(nextMute)
    if (!nextMute && videoRef.current.volume === 0) {
      videoRef.current.volume = 1.0
      setVolumeLevel(1.0)
    }
  }

  const handleVolumeChange = (val: number) => {
    if (!videoRef.current) return
    videoRef.current.volume = val
    setVolumeLevel(val)
    if (val === 0) {
      videoRef.current.muted = true
      setIsMuted(true)
    } else if (isMuted) {
      videoRef.current.muted = false
      setIsMuted(false)
    }
  }

  const cycleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 2.0]
    const nextIdx = (speeds.indexOf(currentSpeed) + 1) % speeds.length
    setCurrentSpeed(speeds[nextIdx])
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  return {
    videoRef,
    containerRef,
    isPlaying,
    setIsPlaying,
    currentTime,
    duration,
    isMuted,
    volumeLevel,
    currentSpeed,
    togglePlay,
    handleTimeUpdate,
    handleSeek,
    handleChapterClick,
    handleRewind10,
    handleForward10,
    toggleMute,
    handleVolumeChange,
    cycleSpeed,
    toggleFullscreen,
  }
}
