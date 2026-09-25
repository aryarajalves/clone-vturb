export const paddingTopMap: Record<string, string> = {
  '16:9': '56.25%',
  '9:16': '177.77%',
  '4:3': '75%',
}

export interface DimensionOptions {
  widthPreset: '360' | '640' | '800' | '960' | '100%' | 'custom'
  customWidth: string
  heightPreset: '16:9' | '9:16' | '4:3' | 'custom'
  customHeight: string
}

export const resolveWidth = (
  widthPreset: DimensionOptions['widthPreset'],
  customWidth: string
): string => {
  if (widthPreset === '100%') return '100%'
  if (widthPreset === 'custom') {
    const trimmed = customWidth.trim()
    return trimmed.endsWith('%') || trimmed.endsWith('px') ? trimmed : `${trimmed}px`
  }
  return `${widthPreset}px`
}

export const resolveHeight = (
  heightPreset: DimensionOptions['heightPreset'],
  customHeight: string
): string | null => {
  if (heightPreset === 'custom') {
    const trimmed = customHeight.trim()
    return trimmed.endsWith('px') || trimmed.endsWith('vh') ? trimmed : `${trimmed}px`
  }
  return null
}

export const buildEmbedUrls = (
  videoId: string,
  heightPreset: string,
  resolvedWidth: string,
  resolvedHeight: string | null,
  transparentBg: boolean
) => {
  const origin = window.location.origin
  const heightQuery = heightPreset === 'custom' && resolvedHeight ? `&height=${encodeURIComponent(resolvedHeight)}` : ''
  const baseParams = `embed=${videoId}&ratio=${heightPreset}&width=${encodeURIComponent(resolvedWidth)}&transparent=${transparentBg ? '1' : '0'}${heightQuery}`
  
  const embedUrl = `${origin}/?${baseParams}`
  const previewTestUrl = `${origin}/?preview=${videoId}&ratio=${heightPreset}&width=${encodeURIComponent(resolvedWidth)}&transparent=${transparentBg ? '1' : '0'}${heightQuery}`

  return { embedUrl, previewTestUrl }
}
