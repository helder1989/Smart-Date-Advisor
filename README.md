# Smart Date Advisor

> Extensão Chrome com IA que analisa o histórico real de preços da Onfly e sugere as combinações de data de ida/volta mais baratas para viagens corporativas.

---

## O problema

Empresas planejam viagens com datas fixas. Mas datas têm preço. Um colaborador que precisa ir a São Paulo na semana do dia 15 pode economizar R$ 400 simplesmente saindo na terça em vez de segunda — e ninguém mostra isso no momento certo.

## A solução

O Smart Date Advisor intercepta o momento de decisão do viajante. Com a extensão instalada, o usuário informa origem, destino, datas pretendidas e quantos dias pode antecipar ou adiar. A IA consulta o histórico real de cotações no BigQuery da Onfly e retorna os combos de data mais baratos, com explicação em linguagem natural.

```
Planejado:    GRU → SDU   15/04 ida   25/04 volta   R$ 1.200/pessoa
Sugestão IA:  GRU → SDU   15/04 ida   20/04 volta   R$   680/pessoa

Economia:     R$ 520 × 3 colaboradores = R$ 1.560 nessa viagem
```

---

## Funcionalidades

- **Modo Flexibilidade** — informa as datas pretendidas e quantos dias pode antecipar/adiar
- **Modo Budget** — informa o orçamento disponível e vê quais datas cabem
- **Ranking visual** — top 3 combinações de ida+volta ordenadas por preço
- **Explicação IA** — motivo em linguagem natural ("Tarifas às terças são 30% menores nesse trecho por menor demanda corporativa")
- **Delta de economia** — diferença em reais em relação à data original escolhida

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend (extensão) | React (Lovable) empacotado como Chrome Extension Manifest V3 |
| Backend | PHP — Laravel ou Hyperf |
| Dados | BigQuery via MCP (`dw-onfly-dev`) |
| IA | Claude Sonnet API |
| Auth | Token do usuário Onfly (sessão do portal) |

---

## Estrutura do repositório

```
smart-date-advisor/
├── extension/          # Extensão Chrome (React/Lovable)
│   ├── manifest.json
│   ├── popup/
│   │   ├── index.html
│   │   ├── App.tsx
│   │   └── components/
│   └── background.js
├── backend/            # API PHP
│   ├── app/
│   │   ├── Http/Controllers/SuggestDatesController.php
│   │   └── Services/
│   │       ├── BigQueryService.php
│   │       └── ClaudeService.php
│   └── routes/api.php
├── docs/               # Documentação técnica
│   ├── ARCHITECTURE.md
│   ├── BIGQUERY.md
│   ├── API.md
│   └── CHROME_EXTENSION.md
└── README.md
```

---

## Início rápido

### Pré-requisitos

- PHP 8.2+
- Composer
- Node.js 20+
- Conta Google Cloud com acesso ao projeto `dw-onfly-dev`
- Chave da API Anthropic (Claude Sonnet)

### Instalação do backend

```bash
cd backend
composer install
cp .env.example .env
# Preencha ANTHROPIC_API_KEY e GOOGLE_APPLICATION_CREDENTIALS no .env
php artisan serve
```

### Instalação da extensão

```bash
cd extension
npm install
npm run build
```

No Chrome: `chrome://extensions` → **Modo desenvolvedor** → **Carregar sem compactação** → selecione a pasta `extension/dist`.

---

## Documentação

- [Arquitetura do sistema](docs/ARCHITECTURE.md)
- [BigQuery — queries e schema](docs/BIGQUERY.md)
- [API Backend — endpoints e contratos](docs/API.md)
- [Chrome Extension — estrutura e build](docs/CHROME_EXTENSION.md)

---

## Contexto

Projeto desenvolvido no **Hackathon Onfly Tech 2026** — 8 de Abril, Belo Horizonte.

Tema: *"O papel do desenvolvedor está evoluindo de escrever código para orquestrar agentes inteligentes."*
