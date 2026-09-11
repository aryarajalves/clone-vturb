# Clone do VTurb - Player de Alta Conversão e Hospedagem de Vídeos

Plataforma completa inspirada no VTurb para hospedagem, gerenciamento e reprodução de vídeos de vendas (VSLs) de alta conversão. O sistema conta com **Frontend** em React (Vite + TypeScript), **Backend** em Python (FastAPI + SQLAlchemy), banco de dados **PostgreSQL** orquestrado via **Docker**, suporte a armazenamento local e em nuvem via **Backblaze B2 Object Storage**, e auditoria automatizada de segurança de dependências.

---

## ⚡ Funcionalidades do Sistema

### 🎬 Gerenciamento de Vídeos
- **Criação de Vídeos em Tela Cheia**: Interface moderna de edição para cadastrar vídeos via upload de arquivo (`.mp4`, `.mov`, `.webm`, `.avi`) ou inserção de URL externa.
- **Listagem com Timestamp Completo**: Exibição da data e horário exato de envio no formato brasileiro (`DD/MM/YYYY às HH:mm`) referenciado no Horário Oficial de Brasília.
- **Paginação Inteligente**: Divisão automática da lista de vídeos em até 20 itens por página com controles intuitivos de navegação.
- **Seleção Múltipla e Exclusão em Massa**: Seleção individual ou checkbox mestre ("Selecionar Todos") para deletar múltiplos vídeos com popup centralizado de confirmação à prova de cliques acidentais.

### 🚀 Recursos Avançados por Vídeo (Configuráveis Individualmente)
- **Modo Turbo (Acelerador de Velocidade)**:
  - Velocidades predefinidas de `0.5x` até `2.0x` com controle fino via slider.
  - Switch de ativação/desativação integrado com prévia interativa ao vivo.
- **Smart Autoplay™**:
  - Inicia o vídeo automaticamente mudo para contornar o bloqueio de navegadores e exibe uma chamada animada para o visitante ativar o som.
  - Personalização de textos, cores do botão, opção de reiniciar o vídeo ao desmutar e prévia em tempo real.
- **Player Flutuante (Picture-in-Picture / Mini-Player)**:
  - Mantém o vídeo reproduzindo no canto inferior (direito ou esquerdo) enquanto o visitante rola a página de vendas.
  - Ajuste dinâmico de largura e botão para fechar o mini-player.
- **Conteúdo Oculto (Pitch Delay da Página)**:
  - Libera seções externas da landing page (ofertas, botão de checkout, depoimentos) no momento exato do pitch de vendas.
  - Suporte a seletor CSS, auto-scroll suave até a oferta e persistência no `localStorage`.
- **Pixels de Rastreamento (Facebook, Google Ads/Tag, TikTok)**:
  - Disparo de eventos de remarketing e conversão aos 25%, 50%, 75%, 100% de reprodução e no momento do pitch.
- **Segurança & Domínios Autorizados (Whitelist & Anti-Download)**:
  - Restringe a reprodução do player exclusivamente aos domínios autorizados, bloqueando tentativas de cópia não autorizadas.
  - Proteção anti-download (desativa clique direito e downloads nativos).
### 🔐 Autenticação e Segurança de Acesso
- **Tela de Login Moderna**: Layout em 2 colunas com formulário de login (e-mail, senha com visualização toggle e loading) à esquerda e imagem/showcase com tema de alta conversão à direita.
- **Conta Super Admin Automática**: Credenciais configuradas no `.env` (`SUPER_ADMIN_EMAIL` e `SUPER_ADMIN_PASSWORD`), sincronizadas automaticamente no banco de dados na inicialização do backend.
- **Criptografia Memory-Hard (Argon2id)**: Senhas criptografadas com `argon2-cffi` utilizando 64MB de memória RAM por cálculo (`memory_cost=65536`), 3 iterações e 4 threads, inviabilizando ataques de força bruta com GPU/ASIC.
- **Proteção de Rotas com Tokens JWT**: Todas as rotas administrativas exigem cabeçalho `Authorization: Bearer <token>`.
- **Expiração Automática de Sessão (24h) e Logout Reativo**: Tokens JWT possuem tempo de vida configurável em horas (`JWT_ACCESS_TOKEN_EXPIRE_HOURS=24h`). Ao expirar, a aplicação detecta o vencimento, encerra a sessão de forma segura e redireciona para o login com toast informativo.
- **Embeds e Telemetria Públicos**: As rotas `/videos/{id}` e `/videos/{id}/events` permanecem abertas sem autenticação para permitir a incorporação de players e registro de telemetria por visitantes externos.
- **Credenciais de Desenvolvimento**:
  - **E-mail:** `admin@vturb.com`
  - **Senha:** `Admin123456!`

### 👥 Gestão de Usuários e Links de Convite
- **Navegação por Abas na Barra Lateral**: Acesso direto entre "Meus vídeos" e "Gestão de Usuário".
- **SuperAdmin Protegido**: O SuperAdmin é exibido na lista com badge imutável e proteção rígida contra exclusão via interface e API (`HTTP 400`).
- **Geração de Convites Personalizados**: Modal para criação de convites com perfil restrito a **Admin** ou **Usuário** (o SuperAdmin não pode ser gerado via convite) e tempo de expiração customizável (`1h`, `6h`, `24h`, `48h`, `7 dias`).
- **Página de Cadastro Seguro via Convite (`/invite/:token`)**:
  - Validação do convite em tempo real (bloqueia links expirados ou já utilizados).
  - Política de **Senha Forte de 12+ caracteres** com checklist visual dinâmico (mínimo 12 caracteres, maiúscula, minúscula, número, caractere especial e confirmação idêntica).
  - Criptografia com Argon2id ao persistir no banco de dados.

---

## 📁 Estrutura de Pastas

```text
clone-vturb/
├── .gitignore                      # Arquivos e diretórios ignorados pelo Git
├── .dockerignore                   # Arquivos ignorados nas builds Docker
├── README.md                       # Documentação completa do projeto
├── BUSINESS_RULES.md               # Especificação das regras de negócio
├── DATABASE_SCHEMA_LOG.md          # Histórico de alterações e migrações do banco
├── scripts/                        # Scripts utilitários e de manutenção
│   └── audit_security.py           # Auditoria unificada de vulnerabilidades (pip-audit + npm audit)
├── docker/                         # Configuração e orquestração Docker
│   ├── docker-compose-local.yml     # Orquestração do PostgreSQL, Backend e Frontend
│   ├── backend/Dockerfile          # Imagem de produção/desenvolvimento do backend
│   └── frontend/Dockerfile         # Imagem de produção/desenvolvimento do frontend
├── backend/                        # Backend Python (FastAPI)
│   ├── .env.example                # Modelo oficial de variáveis de ambiente
│   ├── app/
│   │   ├── api/                    # Rotas e controladores REST (vídeos, health, etc.)
│   │   ├── core/                   # Configurações, banco de dados e logs
│   │   ├── models/                 # Modelos relacionais SQLAlchemy
│   │   ├── schemas/                # Schemas de validação Pydantic
│   │   ├── services/               # Camada de serviços e regras de negócio
│   │   └── main.py                 # Ponto de entrada FastAPI com Exception Handler Global
│   ├── tests/                      # Suíte de testes unitários Pytest
│   ├── pytest.ini
│   └── requirements.txt            # Dependências Python com versões fixas
└── frontend/                       # Frontend React (Vite + TypeScript)
    ├── src/
    │   ├── components/             # Componentes modulares, player e abas de vídeo
    │   ├── services/               # Cliente HTTP e integração com a API
    │   ├── types/                  # Definições de tipos TypeScript
    │   ├── tests/                  # Suíte de testes unitários Vitest
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    ├── vite.config.ts
    └── tsconfig.json
```

---

## 🚀 Como Executar o Projeto Localmente

### 1. Inicializando com Docker Compose (Recomendado)
Para subir o banco de dados PostgreSQL, backend e frontend de forma integrada:
```bash
docker compose -f docker/docker-compose-local.yml up -d
```

Validar o status dos containers:
```bash
docker compose -f docker/docker-compose-local.yml ps
```

### 2. Executando o Backend Individualmente
```bash
cd backend
python -m venv venv
# No Windows: venv\Scripts\activate | No Linux/Mac: source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8003 --reload
```
Acesse a documentação interativa Swagger em: `http://localhost:8003/docs`

### 3. Executando o Frontend Individualmente
```bash
cd frontend
npm install
npm run dev
```
Acesse a aplicação no navegador em: `http://localhost:5175`

---

## 🛡️ Auditoria de Segurança de Dependências

O projeto possui verificação automática de vulnerabilidades conhecidas (CVEs) para bibliotecas Python e pacotes NPM:

```bash
python scripts/audit_security.py
```
- **Backend**: Executa `pip-audit` consultando as bases oficiais OSV e PyPI.
- **Frontend**: Executa `npm audit` consultando o GitHub Advisory Database.

---

## 🧪 Testes Automatizados

### Backend (Pytest)
```bash
docker exec backend pytest -v
# ou localmente:
cd backend && pytest -v
```

### Frontend (Vitest)
```bash
cd frontend
npm test
```
