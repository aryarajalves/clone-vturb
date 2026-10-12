export interface DocStep {
  stepNumber: number
  title: string
  description: string
  detail?: string
}

export interface DocTip {
  type: 'tip' | 'warning' | 'info'
  title: string
  message: string
}

export interface DocTopic {
  id: string
  title: string
  subtitle: string
  category: string
  iconName: string
  badge?: string
  summary: string
  image?: string
  imageCaption?: string
  secondaryImage?: string
  secondaryImageCaption?: string
  steps: DocStep[]
  tips?: DocTip[]
  codeExample?: {
    language: string
    code: string
    caption: string
  }
}

