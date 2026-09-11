import '@testing-library/jest-dom/vitest'

// Mock de IntersectionObserver para jsdom
class MockIntersectionObserver {
  observe = () => null
  unobserve = () => null
  disconnect = () => null
}
window.IntersectionObserver = MockIntersectionObserver as any

// Mock de HTMLMediaElement play/pause para jsdom
window.HTMLMediaElement.prototype.play = () => Promise.resolve()
window.HTMLMediaElement.prototype.pause = () => {}
