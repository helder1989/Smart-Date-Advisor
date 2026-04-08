# Arquitetura do Sistema

## Visão geral

```
┌─────────────────────────────────────────────────────┐
│                  CHROME EXTENSION                    │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │              popup.html (React)              │    │
│  │  [origem] [destino] [ida] [volta]            │    │
│  │  [antecipar X dias] [adiar Y dias]           │    │
│  │  [budget opcional]                           │    │
│  │                    [→ Buscar]                │    │
│  └──────────────────────┬──────────────────────┘    │
│                         │ POST /api/suggest-dates    │
└─────────────────────────┼────────────────────────────┘
                          │
┌─────────────────────────▼────────────────────────────┐
│                  BACKEND PHP                          │
│                                                      │
│  SuggestDatesController                              │
│       │                                              │
│       ├─── BigQueryService ──→ dw-onfly-dev          │
│       │       └── v3_quote.quotes                    │
│       │                                              │
│       └─── ClaudeService ───→ Claude Sonnet API      │
│               └── raciocínio + linguagem natural     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## Fluxo de dados

### 1. Input do usuário (extensão)

```json
{
  "origem": "GRU",
  "destino": "SDU",
  "data_ida": "2026-04-15",
  "data_volta": "2026-04-25",
  "flexibilidade_ida_antes": 3,
  "flexibilidade_ida_depois": 3,
  "flexibilidade_volta_antes": 5,
  "flexibilidade_volta_depois": 5,
  "budget": 800
}
```

### 2. Query BigQuery (BigQueryService)

O serviço calcula a janela de datas com base na flexibilidade informada e consulta o histórico de cotações reais.

Retorno: array de `{ data_ida, data_volta, menor_preco, preco_medio, num_cotacoes }`.

### 3. Raciocínio Claude API (ClaudeService)

O serviço envia o contexto do usuário + dados do BigQuery para o Claude Sonnet.

O Claude retorna as 3 melhores sugestões com explicação e delta de economia.

### 4. Output para a extensão

```json
{
  "sugestoes": [
    {
      "data_ida": "2026-04-15",
      "data_volta": "2026-04-20",
      "preco": 680,
      "economia_vs_original": 520,
      "motivo": "Volta às quartas-feiras concentra menor demanda corporativa nesse trecho."
    },
    {
      "data_ida": "2026-04-14",
      "data_volta": "2026-04-20",
      "preco": 620,
      "economia_vs_original": 580,
      "motivo": "Antecipando 1 dia na ida e 5 na volta, você foge dos picos de segunda e sexta."
    }
  ],
  "melhor_opcao": { ... },
  "insight": "Neste trecho GRU→SDU, tarifas às terças e quartas são em média 28% mais baratas que às segundas e sextas."
}
```

## Decisões de design

### Por que extensão Chrome?

A extensão opera no momento exato de decisão do viajante, sem exigir que ele mude de aba ou navegue para outra tela. É o menor atrito possível.

### Por que BigQuery e não API de preços em tempo real?

Dados históricos do próprio BigQuery da Onfly (`dw-onfly-dev`) são:
- Mais confiáveis (dados reais de cotações feitas por clientes Onfly)
- Sem custo de API externa
- Representativos do comportamento real de preços no segmento corporativo

### Por que Claude Sonnet?

A query retorna dados brutos. O Claude:
- Filtra dentro da janela de flexibilidade do usuário
- Pondera combinações de ida+volta (não só preço isolado)
- Gera explicação contextualizada em linguagem natural
- Considera sazonalidade e padrões implícitos nos dados

Isso não é possível com SQL puro.

## Segurança

- O token de autenticação do usuário Onfly é lido da sessão do portal (cookie httpOnly) via `chrome.cookies` — nunca armazenado no localStorage da extensão
- Todas as chamadas ao backend usam HTTPS
- A chave da API Anthropic fica exclusivamente no backend — nunca exposta no cliente
- Queries BigQuery usam parâmetros tipados (`@origem`, `@destino`) — sem interpolação de string
