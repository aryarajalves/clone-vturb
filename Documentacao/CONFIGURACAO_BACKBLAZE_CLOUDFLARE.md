# 🚀 Guia Completo: Configuração de CDN e Vídeos com Backblaze B2 & Cloudflare

Este guia documenta o passo a passo completo para configurar o armazenamento e a entrega de vídeos de alta escala no **Smart VSL**, utilizando a combinação de **Backblaze B2** com a **Cloudflare (Bandwidth Alliance)**.

---

## 🎯 Por que usar essa arquitetura?

Ao rodar campanhas com alto tráfego (ex: **50.000+ visitantes/dia**), o maior gargalo e custo de uma VSL é a transferência de gigabytes do arquivo de vídeo:

| Abordagem | Custo Mensal Estimado | Velocidade no Brasil | Risco de Travamento |
|---|:---:|:---:|:---:|
| **Vídeo no servidor local (VPS)** | Alto (exige VPS gigante) | Lenta / Depende do host | 🔴 Alto (servidor sobrecarrega) |
| **Backblaze B2 Direto** | **R$ 7.000+ / mês** (taxa de Egress) | 2 a 4s de delay (data center EUA) | 🟡 Médio (buffering em 4G) |
| **Backblaze B2 + Cloudflare** | **Menos de R$ 10 / mês** | **Instantânea (< 0.3s)** | 🟢 **Zero (Cache Edge no Brasil)** |

> 💡 **O Segredo:** A Cloudflare e o Backblaze possuem uma parceria oficial (*Bandwidth Alliance*) que **zera a taxa de transferência de dados (Egress)**. A Cloudflare faz o cache do vídeo em servidores no Brasil (São Paulo, Rio, etc.) e entrega o vídeo para os seus visitantes com custo zero de banda.

---

## 📋 Sumário
1. [Parte 1: Configuração no Backblaze B2](#parte-1-configuração-no-backblaze-b2)
2. [Parte 2: Configuração na Cloudflare](#parte-2-configuração-na-cloudflare)
3. [Parte 3: Integração no Smart VSL (Variáveis de Ambiente)](#parte-3-integração-no-smart-vsl-variáveis-de-ambiente)
4. [Parte 4: Validação e Teste em Produção](#parte-4-validação-e-teste-em-produção)
5. [Resolução de Problemas Frequentes (Troubleshooting)](#resolução-de-problemas-frequentes-troubleshooting)

---

## Parte 1: Configuração no Backblaze B2

### 1.1 Criar o Bucket Público
1. Acesse sua conta no **[Backblaze B2](https://secure.backblaze.com/b2_buckets.htm)**.
2. No menu lateral esquerdo, clique em **Buckets** e depois em **Create a Bucket**.
3. Defina as configurações:
   - **Bucket Unique Name:** Escolha um nome único (ex: `meu-bucket-vsl-2026`).
   - **Files in Bucket are:** Marque obrigatoriamente como **`Public`**.
   - **Default Encryption:** Pode deixar *Disable* ou *Enable (SSE-B2)*.
   - **Object Lock:** *Disable*.
4. Clique em **Create a Bucket**.

### 1.2 Anotar o Endpoint do Bucket
Após criar o Bucket, localize o cartão dele na lista de Buckets e anote:
- **Endpoint:** Exemplo: `s3.us-west-004.backblazeb2.com` *(ou us-east-005, etc.)*.
- **Bucket Name:** O nome exato que você deu ao bucket.

### 1.3 Gerar as Chaves de API (Application Key)
1. No menu lateral esquerdo, clique em **Application Keys**.
2. Clique no botão azul **Add a New Application Key**:
   - **Name of Key:** `smartvsl-api`
   - **Allow access to Bucket(s):** Selecione o seu bucket recém-criado (ou *All*).
   - **Type of Access:** `Read and Write`.
3. Clique em **Create New Key**.
4. ⚠️ **ATENÇÃO:** Copie imediatamente o **`keyID`** e o **`applicationKey`**. O *applicationKey* só é exibido uma única vez nesta tela!

---

## Parte 2: Configuração na Cloudflare

### 2.1 Criar o Registro CNAME para o Subdomínio de Mídia
1. Acesse o painel da **[Cloudflare](https://dash.cloudflare.com/)** e clique no seu domínio (ex: `aryaraj.shop`).
2. No menu lateral esquerdo, vá em **DNS > Records** e clique em **Add record**:
   - **Tipo:** `CNAME`
   - **Nome:** `midia` *(isso criará o subdomínio `midia.seudominio.com`)*
   - **Destino:** Cole o **Endpoint** do seu Backblaze **sem `https://`** (ex: `s3.us-west-004.backblazeb2.com`).
   - **Status do proxy:** **Com proxy (Nuvem Laranja ATIVADA)** ☁️ *(Obrigatório para ativar a isenção de tráfego e o cache)*.
   - **TTL:** `Auto`.
3. Clique em **Salvar**.

### 2.2 Configurar o Modo de Criptografia SSL para "Completo" (Full)
> ⚠️ **Passo Obrigatório:** O Backblaze B2 exige conexões seguras por HTTPS. Se a Cloudflare estiver no modo "Flexível", ela tentará acessar por HTTP comum, gerando erro de loop infinito (`ERR_TOO_MANY_REDIRECTS`).

1. No menu lateral da Cloudflare, vá em **SSL/TLS > Visão geral**.
2. Clique no botão azul **"Configurar"** (ou role a tela até as opções).
3. Selecione a opção:
   - 🔘 **Completo** *(Full)*
4. Verifique que a etiqueta mudou para verde com o desenho de dois cadeados:
   - `Navegador 🔒 -> Cloudflare 🔒 -> Servidor de Origem`

### 2.3 Ativar o Cache de Vídeos (Cache Rule)
1. No menu lateral da Cloudflare, vá em **Caching > Cache Rules** e clique em **Create rule**.
2. Preencha os campos:
   - **Rule name:** `Cache de Vídeos MP4`
   - **When incoming requests match:**
     - Campo: `URI Path`
     - Operador: `ends with`
     - Valor: `.mp4`
   - **Cache status:** Selecione **Eligible for cache**.
   - **Edge TTL:** Marque **Override origin and use TTL** e defina como **1 month** (1 mês).
3. Clique em **Deploy**.

---

## Parte 3: Integração no Smart VSL (Variáveis de Ambiente)

O Smart VSL já possui a rotina de envio automatizado para o Backblaze B2 integrada em seu serviço de armazenamento (`backend/app/services/storage.py`).

Para ativá-la, basta adicionar as variáveis no arquivo `backend/.env` do projeto:

```env
# -------------------------------------------------------------
# INTEGRAÇÃO BACKBLAZE B2 + CLOUDFLARE CDN
# -------------------------------------------------------------
# Chaves de API obtidas na Parte 1.3:
BACKBLAZE_KEY_ID=004xxxxxxxxxxxx0000000001
BACKBLAZE_APPLICATION_KEY=K004xxxxxxxxxxxxxxxxxxxxxxxxxxx

# Nome do Bucket obtido na Parte 1.1:
BACKBLAZE_BUCKET_NAME=meu-bucket-vsl-2026

# Endpoint do Backblaze obtido na Parte 1.2 (com https://):
BACKBLAZE_ENDPOINT_URL=https://s3.us-west-004.backblazeb2.com

# URL pública da sua CDN na Cloudflare configurada na Parte 2.1:
BACKBLAZE_CDN_URL=https://midia.seudominio.com/file/meu-bucket-vsl-2026
```

> 💡 **Como o Smart VSL processa isso:**
> Quando você (ou qualquer usuário) entrar no painel e fizer o upload de um vídeo `.mp4`, o sistema automaticamente envia o arquivo para o Backblaze B2 por baixo dos panos e já vincula o vídeo diretamente à URL da Cloudflare (`BACKBLAZE_CDN_URL`), sem consumir espaço nem processamento no disco do seu servidor local!

---

## Parte 4: Validação e Teste em Produção

### 4.1 Como provar que o vídeo está vindo pela Cloudflare no Brasil:
1. Abra a página onde o vídeo está incorporado no navegador (Google Chrome ou Edge).
2. Pressione **F12** no teclado para abrir as Ferramentas do Desenvolvedor.
3. Clique na aba **Network** (Rede) e selecione o filtro **Media** (ou *All*).
4. Dê um **F5** na página e aperte o Play no vídeo.
5. Clique no arquivo `.mp4` na lista e olhe a seção **Response Headers**:

```http
server: cloudflare
cf-cache-status: HIT
cf-ray: 8xxxxxxxxxxxx-GRU
```

- **`server: cloudflare`**: Prova que a requisição está sendo servida pela Cloudflare.
- **`cf-cache-status: HIT`**: Prova de ouro! Significa que o vídeo foi entregue **direto da memória de cache da Cloudflare** com custo **R$ 0,00 no Backblaze**. *(Na primeira vez pode aparecer `MISS`, e a partir da segunda vira `HIT`).*
- **`cf-ray: ...-GRU`**: Prova física que o vídeo foi entregue do data center de **Guarulhos / São Paulo** (ou `-GIG` para Galeão / Rio de Janeiro), com velocidade máxima nacional.

---

## Resolução de Problemas Frequentes (Troubleshooting)

### 1. Erro `ERR_TOO_MANY_REDIRECTS` (Loop de Redirecionamento)
- **Causa:** O SSL da Cloudflare está configurado como "Flexível".
- **Solução:** Acesse *SSL/TLS > Visão geral* na Cloudflare e altere para **Completo** (Full).

### 2. Erro `403 Forbidden` ao abrir o link do vídeo
- **Causa:** O bucket no Backblaze foi criado como "Private" em vez de "Public".
- **Solução:** No painel do Backblaze, vá em *Buckets*, clique em *Bucket Settings* e altere *Files in Bucket are* para **Public**.

### 4. Erro `404 Not Found` no vídeo ou imagem de capa (tela preta ou miniatura quebrada)
- **Causa:** A URL gerada pela CDN não continha o segmento `/file/<nome-do-bucket>/`. O Backblaze B2 exige obrigatoriamente esse formato para requisições amigáveis (Friendly Download URLs) via CNAME/Cloudflare.
- **Solução:** No arquivo `backend/.env`, certifique-se de definir a variável com o prefixo `/file/<nome-do-bucket>`, por exemplo:
  ```env
  BACKBLAZE_CDN_URL=https://midia.seudominio.com/file/meu-bucket
  ```
  *(Nota: O sistema Smart VSL possui tratamento automático para injetar `/file/<bucket>` caso o usuário informe apenas o domínio ou esqueça o segmento `/file/`).*

---

*Documentação elaborada para a plataforma Smart VSL.*
