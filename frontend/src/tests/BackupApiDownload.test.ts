import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { getDownloadBackupUrl, downloadBackupFile } from '../services/backupApi'

describe('backupApi - getDownloadBackupUrl e downloadBackupFile', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('anexa o token de autenticação JWT na URL gerada por getDownloadBackupUrl', () => {
    localStorage.setItem('vturb_access_token', 'test-jwt-token-12345')
    const url = getDownloadBackupUrl('backup-uuid-abc')

    expect(url).toContain('/backups/backup-uuid-abc/download?token=test-jwt-token-12345')
  })

  it('gera URL sem query param quando nenhum token está armazenado', () => {
    const url = getDownloadBackupUrl('backup-uuid-abc')
    expect(url).toMatch(/\/backups\/backup-uuid-abc\/download$/)
  })

  it('downloadBackupFile realiza requisição autenticada e cria elemento de download via blob', async () => {
    localStorage.setItem('vturb_access_token', 'test-jwt-token-12345')

    const fakeBlob = new Blob(['conteudo-dump-gz'], { type: 'application/gzip' })
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: vi.fn().mockResolvedValue(fakeBlob),
    })
    globalThis.fetch = mockFetch

    const mockCreateObjectURL = vi.fn().mockReturnValue('blob:http://localhost/fake-url')
    const mockRevokeObjectURL = vi.fn()
    window.URL.createObjectURL = mockCreateObjectURL
    window.URL.revokeObjectURL = mockRevokeObjectURL

    const appendChildSpy = vi.spyOn(document.body, 'appendChild')
    const removeChildSpy = vi.spyOn(document.body, 'removeChild')

    await downloadBackupFile('backup-uuid-abc', 'vturb_backup_test.dump.gz')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/backups/backup-uuid-abc/download?token=test-jwt-token-12345'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-jwt-token-12345',
        }),
      })
    )
    expect(mockCreateObjectURL).toHaveBeenCalledWith(fakeBlob)
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/fake-url')
    expect(appendChildSpy).toHaveBeenCalled()
    expect(removeChildSpy).toHaveBeenCalled()
  })

  it('downloadBackupFile lança erro quando o backend retorna status de erro', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ detail: 'Falha de permissão.' }),
    })
    globalThis.fetch = mockFetch

    await expect(downloadBackupFile('backup-uuid-abc', 'file.dump.gz')).rejects.toThrow('Falha de permissão.')
  })
})
