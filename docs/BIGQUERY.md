# BigQuery — Queries e Schema

## Projeto e dataset

| Item | Valor |
|---|---|
| Projeto GCP | `dw-onfly-dev` |
| Dataset principal | `v3_quote` |
| Tabela de cotações | `v3_quote.quotes` |
| Dataset auxiliar | `v3_booking` |

## Schema relevante — `v3_quote.quotes`

| Campo | Tipo | Descrição |
|---|---|---|
| `origin_iata` | STRING | Código IATA de origem (ex: `GRU`) |
| `destination_iata` | STRING | Código IATA de destino (ex: `SDU`) |
| `departure_date` | TIMESTAMP | Data/hora do voo de ida |
| `return_date` | TIMESTAMP | Data/hora do voo de volta |
| `total_price` | FLOAT | Preço total cotado (BRL) |
| `created_at` | TIMESTAMP | Quando a cotação foi gerada |

## Query principal

Retorna o histórico de preços por combinação de data de ida + volta para um trecho, nos últimos 90 dias:

```sql
SELECT
  DATE(q.departure_date)     AS data_ida,
  DATE(q.return_date)        AS data_volta,
  MIN(q.total_price)         AS menor_preco,
  AVG(q.total_price)         AS preco_medio,
  COUNT(*)                   AS num_cotacoes
FROM `dw-onfly-dev.v3_quote.quotes` q
WHERE
  q.origin_iata       = @origem
  AND q.destination_iata  = @destino
  AND q.departure_date BETWEEN
        DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
        AND CURRENT_DATE()
  AND q.return_date IS NOT NULL
GROUP BY 1, 2
ORDER BY menor_preco ASC
LIMIT 60
```

### Parâmetros

| Parâmetro | Tipo | Exemplo |
|---|---|---|
| `@origem` | STRING | `'GRU'` |
| `@destino` | STRING | `'SDU'` |

## Query com janela de flexibilidade aplicada no SQL

Quando o usuário informa flexibilidade, a janela pode ser aplicada diretamente no WHERE para reduzir o volume transferido ao Claude:

```sql
SELECT
  DATE(q.departure_date)     AS data_ida,
  DATE(q.return_date)        AS data_volta,
  MIN(q.total_price)         AS menor_preco,
  AVG(q.total_price)         AS preco_medio,
  COUNT(*)                   AS num_cotacoes
FROM `dw-onfly-dev.v3_quote.quotes` q
WHERE
  q.origin_iata       = @origem
  AND q.destination_iata  = @destino
  AND DATE(q.departure_date) BETWEEN @ida_min AND @ida_max
  AND DATE(q.return_date)    BETWEEN @volta_min AND @volta_max
GROUP BY 1, 2
ORDER BY menor_preco ASC
LIMIT 30
```

### Parâmetros adicionais

| Parâmetro | Cálculo | Exemplo |
|---|---|---|
| `@ida_min` | `data_ida - flexibilidade_ida_antes` | `2026-04-12` |
| `@ida_max` | `data_ida + flexibilidade_ida_depois` | `2026-04-18` |
| `@volta_min` | `data_volta - flexibilidade_volta_antes` | `2026-04-20` |
| `@volta_max` | `data_volta + flexibilidade_volta_depois` | `2026-04-30` |

## Query auxiliar — preço médio por dia da semana (insight sazonal)

Usada para enriquecer o prompt do Claude com padrões de sazonalidade semanal:

```sql
SELECT
  FORMAT_DATE('%A', DATE(q.departure_date))  AS dia_semana,
  MIN(q.total_price)                          AS menor_preco,
  AVG(q.total_price)                          AS preco_medio,
  COUNT(*)                                    AS volume
FROM `dw-onfly-dev.v3_quote.quotes` q
WHERE
  q.origin_iata      = @origem
  AND q.destination_iata = @destino
  AND q.departure_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 180 DAY)
GROUP BY 1
ORDER BY preco_medio ASC
```

Este resultado permite ao Claude afirmar com embasamento: *"Terças-feiras têm tarifa média 27% menor nesse trecho."*

## Configuração do BigQuery no backend

### Via Google Application Credentials

```env
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
BIGQUERY_PROJECT=dw-onfly-dev
```

### Via MCP (Model Context Protocol)

O MCP do BigQuery permite que o Claude acesse diretamente as tabelas durante o raciocínio, sem necessidade de endpoint intermediário. Configuração no `claude_mcp_config.json`:

```json
{
  "mcpServers": {
    "bigquery": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-bigquery"],
      "env": {
        "GOOGLE_PROJECT_ID": "dw-onfly-dev",
        "GOOGLE_APPLICATION_CREDENTIALS": "/path/to/service-account.json"
      }
    }
  }
}
```
