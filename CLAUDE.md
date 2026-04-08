# Smart Date Advisor — Contexto do Projeto

## O que é
Extensão Chrome (sidebar 380px) para o hackathon Onfly.
Sugere as melhores combinações de datas de viagem com base
no histórico real de reservas da Onfly, analisado pela Claude API.

## Stack
- Frontend:  React + TypeScript + Vite + Tailwind + shadcn/ui
             Chrome Extension Manifest V3 (sidebar)
- Backend:   Laravel (PHP) — proxy mínimo para chamadas à Claude API
- Dados:     API pública Onfly (histórico de reservas)
- IA:        Claude Sonnet via API
- Auth:      OAuth2 da própria Onfly (token Bearer)
- Infra:     Docker Compose, GitHub Actions

## Estrutura de pastas
/extension   → React app (sidebar)
/api         → Laravel (proxy Claude API)
/docs        → Prompts, decisões de arquitetura

## Variáveis de ambiente (.env)
CLAUDE_API_KEY=
ONFLY_CLIENT_ID=
ONFLY_CLIENT_SECRET=
ONFLY_API_BASE=https://api.onfly.com.br

## API Onfly — Base URL
https://api.onfly.com.br
Rate limit: 200 requests / 30 min
Auth: Bearer token em todas as rotas

## Auth flow
1. Usuário informa e-mail + senha na extensão
2. Extensão chama POST /oauth/token com grant_type=password
3. Token salvo em chrome.storage.local
4. Todas as chamadas seguintes usam Authorization: Bearer <token>

POST /oauth/token
Body: {
  grant_type: "password",
  scope: "*",
  client_id: ONFLY_CLIENT_ID,
  client_secret: ONFLY_CLIENT_SECRET,
  username: <email_usuario>,
  password: <senha_usuario>
}

## Endpoints de dados (histórico de reservas)

GET /travel/order/fly-order      → reservas aéreo
GET /travel/order/hotel-order    → reservas hotel
GET /travel/order/bus-order      → reservas ônibus
GET /travel/order/auto-order     → reservas carro
GET /employees/me                → perfil do usuário logado

Campos relevantes por modalidade:

AÉREO (fly-order):
  - protocol         → ID da reserva
  - outbound.from    → origem (IATA)
  - outbound.to      → destino (IATA)
  - outbound.departureDate → data de ida
  - inbound.departureDate  → data de volta
  - outbound.price + outbound.tax → preço total
  - createdAt        → data da compra

HOTEL (hotel-order):
  - checkin          → data entrada
  - checkout         → data saída
  - city             → destino
  - price            → valor total

ÔNIBUS (bus-order):
  - outbound.departureDate → data ida
  - inbound.departureDate  → data volta
  - outbound.from / .to    → trecho
  - outbound.price + .tax  → preço

CARRO (auto-order):
  - withdrawDate     → data retirada
  - deliveryDate     → data devolução
  - city             → cidade retirada
  - price            → valor total

## Endpoint /analyze (backend próprio — proxy Claude)

POST /analyze
Headers: Authorization: Bearer <onfly_token>
Body: {
  modality: "aereo"|"hotel"|"carro"|"onibus",
  origin: string,
  destination: string,
  date_from: "YYYY-MM-DD",
  date_to: "YYYY-MM-DD",
  flexibility_from: 0-7,
  flexibility_to: 0-7,
  travelers: number,
  historical_data: [...] // dados vindos da API Onfly
}
Response: {
  suggestions: [
    {
      date_from: string,
      date_to: string,
      price: number,
      savings: number,
      label: string
    }
  ],
  insight: string  // gerado pelo Claude, pt-BR, máx 2 frases
}

## Fluxo completo da análise
1. Extensão busca histórico dos últimos 90 dias no endpoint
   correspondente à modalidade selecionada
2. Filtra por trecho (origem/destino) do usuário
3. Envia os dados filtrados + parâmetros para POST /analyze
4. Backend monta o prompt, chama Claude API, parseia JSON
5. Extensão exibe os 4 melhores combos + insight

## Regras de negócio
- Retornar exatamente 4 sugestões ordenadas por menor preço
- Combinações = (2×flex_from+1) × (2×flex_to+1)
- Insight em pt-BR, máx 2 frases, gerado pelo Claude
- Rate limit Onfly: 200 req/30min — cachear resultados no Redis

## Identidade visual
Cor primária:  #0052CC
Cor economia:  #00B37E
Fonte body:    DM Sans
Fonte números: DM Mono
Sidebar width: 380px fixo

## Convenções
- PHP: PSR-12, snake_case variáveis, PascalCase classes
- React: componentes funcionais, hooks
- Commits: feat: / fix: / chore:
- Token Chrome: chrome.storage.local (nunca localStorage)
- Sem API keys expostas no frontend