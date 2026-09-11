# Regras de Negócio do Sistema (Clone do VTurb)

## 1. Gestão de Usuários e Acesso
- **Super Administrador Oficial:** O e-mail configurado na variável de ambiente `SUPER_ADMIN_EMAIL` é o Super Administrador oficial do sistema.
- **Exclusividade do Super Admin:** Não pode haver mais de um Super Admin. Apenas administradores comuns (`admin`) e usuários (`user`) podem ser criados.
- **Proteção do Super Admin:** O Super Admin nunca pode ser excluído nem via endpoint individual nem via exclusão em lote.
- **Exclusão de Conta Própria:** Nenhum usuário pode excluir a si mesmo enquanto estiver autenticado.
- **Visibilidade de Menus:** O menu "Gestão de Usuário" e o menu "Backup Automático" são de acesso estrito ao Super Admin oficial. Usuários comuns e administradores não visualizam esses botões na barra lateral.
- **Paginação:** As listas de usuários ativos e de convites gerados possuem paginação limitando a exibição em até 20 itens por página.
- **Validação de Senha Forte:** O cadastro exige senha com mínimo de 12 caracteres, contendo ao menos uma letra maiúscula, uma minúscula, um número e um caractere especial.
- **Verificação via Brevo:** Ao solicitar ativação de conta via convite, um código de 6 dígitos numéricos é disparado para o e-mail do usuário via Brevo e validado antes da conclusão.
- **Bloqueio de E-mail Duplicado:** É terminantemente proibido registrar ou enviar código para um e-mail que já possua conta ativa no sistema.
- **Confirmação de Logout:** A ação de sair do sistema exige confirmação através de um modal centralizado com fundo escuro translúcido.

---

## 2. Backup Automático e Armazenamento no Backblaze B2 (S3)
- **Localização no Sidebar:** O botão "Backup Automático" fica posicionado **logo acima** do botão "Gestão de Usuário" e visível exclusivamente para o Super Admin.
- **Provedor de Armazenamento:** Os dumps do banco de dados PostgreSQL são armazenados no **Backblaze B2** utilizando o protocolo S3.
- **Identidade Visual:** A tela de backups deve seguir a identidade visual padrão do VTurb (fundo claro, cartões brancos com sombras sutis, bordas elegantes e elementos em vermelho/azul), NÃO utilizando o tema escuro/navy de outros sistemas.
- **Abas do Painel de Backup:**
  1. **Backups no S3:** Exibe métricas de último backup, próximo backup e política de retenção; botão de snapshot manual imediato ("Fazer Backup Agora"); e tabela com seleção múltipla, paginação, download, restauração e exclusão.
  2. **Agendamento Automático:** Permite ativar/desativar a rotina automática, configurar frequência e intervalo em horas/dias, diretório no bucket S3 (ex: `vturb/backups/`) e quantidade máxima de retenção (ex: 30 backups mantidos).
  3. **Importar Backup Externo:** Permite envio de arquivos `.dump`, `.dump.gz` ou `.sql` externos diretamente para o Backblaze S3 com restauração guiada.
- **Política de Retenção:** Ao atingir o limite máximo configurado (padrão: 30 backups), o sistema exclui automaticamente os backups mais antigos do S3 e do banco.
- **Modo de Desenvolvimento:** Quando as chaves do Backblaze B2 não estiverem configuradas, o sistema armazena localmente em `backend/backups/` e simula as operações do S3 para permitir desenvolvimento e testes sem interrupções.

---

## 3. Persistência de Navegação
- Ao recarregar a página (F5 ou refresh do navegador), a aplicação deve obrigatoriamente restaurar a última página/aba carregada (armazenada em `localStorage` com as chaves `vturb_current_tab` e `vturb_user_tab`), evitando que o usuário perca o contexto do trabalho em andamento.
