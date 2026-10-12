import React from 'react'
import { PreviewAudienceAndBenefits } from './PreviewAudienceAndBenefits'
import { PreviewModulesSection } from './PreviewModulesSection'
import { PreviewPricingAndBonuses } from './PreviewPricingAndBonuses'
import { PreviewFaqAndFooter } from './PreviewFaqAndFooter'

export const PreviewMockLandingPageSections: React.FC = () => {
  return (
    <>
      {/* 1. Métricas, Área de Teste de Rolagem, Público-Alvo e Benefícios Técnicos */}
      <PreviewAudienceAndBenefits />

      {/* 2. Grade Curricular Completa & Módulos Detalhados */}
      <PreviewModulesSection />

      {/* 3. Bônus Exclusivos, Depoimentos de Clientes, Tabela de Preço e Garantia */}
      <PreviewPricingAndBonuses />

      {/* 4. Perguntas Frequentes (FAQ) Interativas e Rodapé Institucional */}
      <PreviewFaqAndFooter />
    </>
  )
}
