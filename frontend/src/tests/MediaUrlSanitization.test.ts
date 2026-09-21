import { describe, it, expect } from 'vitest'
import { getMediaUrl } from '../services/api'

describe('getMediaUrl - Sanitização e Normalização de URLs de Mídia', () => {
  it('retorna string vazia quando url for indefinida ou nula', () => {
    expect(getMediaUrl(undefined)).toBe('')
    expect(getMediaUrl('')).toBe('')
  })

  it('anexa API_BASE para rotas relativas do storage local', () => {
    const relativeUrl = '/static/uploads/meu_video.mp4'
    const result = getMediaUrl(relativeUrl)
    expect(result).toContain(relativeUrl)
    expect(result.startsWith('http://') || result.startsWith('https://')).toBe(true)
  })

  it('preserva URLs blob e data URI sem alterações', () => {
    const blobUrl = 'blob:http://localhost:5175/12345'
    const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg=='
    expect(getMediaUrl(blobUrl)).toBe(blobUrl)
    expect(getMediaUrl(dataUrl)).toBe(dataUrl)
  })

  it('preserva URLs externas normais intactas', () => {
    const standardUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    expect(getMediaUrl(standardUrl)).toBe(standardUrl)
  })

  it('corrige automaticamente URLs do Backblaze B2 no endpoint S3 removendo o segmento /file/', () => {
    const brokenB2Video = 'https://s3.us-west-004.backblazeb2.com/file/zap-voice/4bcae895-5c25-4971-9bd4-e4dd50fd5f41.mp4'
    const expectedVideo = 'https://s3.us-west-004.backblazeb2.com/zap-voice/4bcae895-5c25-4971-9bd4-e4dd50fd5f41.mp4'
    expect(getMediaUrl(brokenB2Video)).toBe(expectedVideo)

    const brokenB2Thumb = 'https://s3.us-west-004.backblazeb2.com/file/zap-voice/5c937b8b-1d9f-454f-80c6-859a15343210.jpg'
    const expectedThumb = 'https://s3.us-west-004.backblazeb2.com/zap-voice/5c937b8b-1d9f-454f-80c6-859a15343210.jpg'
    expect(getMediaUrl(brokenB2Thumb)).toBe(expectedThumb)
  })

  it('funciona para múltiplos clusters do Backblaze S3 (us-east, us-west, eu-central)', () => {
    const brokenEast = 'https://s3.us-east-005.backblazeb2.com/file/meu-bucket/video.mp4'
    const brokenEu = 'https://s3.eu-central-003.backblazeb2.com/file/meu-bucket/video.mp4'
    expect(getMediaUrl(brokenEast)).toBe('https://s3.us-east-005.backblazeb2.com/meu-bucket/video.mp4')
    expect(getMediaUrl(brokenEu)).toBe('https://s3.eu-central-003.backblazeb2.com/meu-bucket/video.mp4')
  })
})
