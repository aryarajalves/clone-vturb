import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { VTurbLeadsPagination } from '../components/video-detail/metrics/VTurbLeadsPagination'

describe('VTurbLeadsPagination - Paginação da Tabela de Contatos (Máx. 20 por Página)', () => {
  it('renderiza as informações da paginação corretamente para 35 contatos (2 páginas)', () => {
    const onPageChange = vi.fn()

    render(
      <VTurbLeadsPagination
        currentPage={1}
        totalPages={2}
        totalItems={35}
        startIndex={0}
        endIndex={20}
        itemsPerPage={20}
        onPageChange={onPageChange}
      />
    )

    // Barra de paginação presente
    expect(screen.getByTestId('leads-pagination-bar')).toBeInTheDocument()

    // Texto informativo
    const info = screen.getByTestId('pagination-leads-info')
    expect(info).toHaveTextContent('Mostrando 1 a 20 de 35 contatos (máx. 20 por página)')

    // Botões Anterior e Próximo
    const prevBtn = screen.getByTestId('pagination-leads-prev')
    const nextBtn = screen.getByTestId('pagination-leads-next')
    expect(prevBtn).toBeDisabled()
    expect(nextBtn).not.toBeDisabled()

    // Botões numéricos de páginas 1 e 2
    expect(screen.getByTestId('pagination-leads-page-1')).toBeInTheDocument()
    expect(screen.getByTestId('pagination-leads-page-2')).toBeInTheDocument()
  })

  it('permite avançar de página clicando no botão Próximo e no botão numérico', () => {
    const onPageChange = vi.fn()

    render(
      <VTurbLeadsPagination
        currentPage={1}
        totalPages={2}
        totalItems={35}
        startIndex={0}
        endIndex={20}
        itemsPerPage={20}
        onPageChange={onPageChange}
      />
    )

    const nextBtn = screen.getByTestId('pagination-leads-next')
    fireEvent.click(nextBtn)
    expect(onPageChange).toHaveBeenCalledWith(2)

    const page2Btn = screen.getByTestId('pagination-leads-page-2')
    fireEvent.click(page2Btn)
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('permite voltar para a página anterior quando estiver na página 2', () => {
    const onPageChange = vi.fn()

    render(
      <VTurbLeadsPagination
        currentPage={2}
        totalPages={2}
        totalItems={35}
        startIndex={20}
        endIndex={35}
        itemsPerPage={20}
        onPageChange={onPageChange}
      />
    )

    const prevBtn = screen.getByTestId('pagination-leads-prev')
    const nextBtn = screen.getByTestId('pagination-leads-next')

    expect(prevBtn).not.toBeDisabled()
    expect(nextBtn).toBeDisabled()

    fireEvent.click(prevBtn)
    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  it('não renderiza botões de navegação quando todos os contatos cabem em uma única página (<= 20)', () => {
    const onPageChange = vi.fn()

    render(
      <VTurbLeadsPagination
        currentPage={1}
        totalPages={1}
        totalItems={15}
        startIndex={0}
        endIndex={15}
        itemsPerPage={20}
        onPageChange={onPageChange}
      />
    )

    const info = screen.getByTestId('pagination-leads-info')
    expect(info).toHaveTextContent('Mostrando 1 a 15 de 15 contatos (máx. 20 por página)')

    // Não deve renderizar botões Anterior/Próximo pois só há 1 página
    expect(screen.queryByTestId('pagination-leads-prev')).not.toBeInTheDocument()
    expect(screen.queryByTestId('pagination-leads-next')).not.toBeInTheDocument()
  })
})
