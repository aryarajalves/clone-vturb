#!/bin/sh
set -e

# ==============================================================================
# Script de Entrada Nginx: Gera env-config.js dinamicamente antes de subir o servidor
# Permite que a mesma imagem Docker seja implantada em qualquer servidor/cliente
# ==============================================================================

ENV_FILE="/usr/share/nginx/html/env-config.js"

echo "[VTurb Frontend] Gerando runtime config em ${ENV_FILE}..."

# Remove barra final se houver
API_URL="${VITE_API_BASE_URL}"

cat <<EOF > "${ENV_FILE}"
// Configurações injetadas dinamicamente na inicialização do contêiner Docker
window.__ENV__ = {
  VITE_API_BASE_URL: "${API_URL}"
};
EOF

chmod 644 "${ENV_FILE}"
echo "[VTurb Frontend] Configuração gerada com sucesso: VITE_API_BASE_URL='${API_URL}'"
