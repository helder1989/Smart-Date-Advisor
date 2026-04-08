# API Backend — Endpoints e Contratos

## Base URL

```
https://api.onfly.com.br/smart-date-advisor
```

Em desenvolvimento local:
```
http://localhost:8000/api
```

---

## POST `/suggest-dates`

Retorna as melhores combinações de datas para um trecho, com base no histórico BigQuery e raciocínio do Claude.

### Request

**Headers**

```
Content-Type: application/json
Authorization: Bearer {token_onfly}
```

**Body**

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
  "budget": 800,
  "num_passageiros": 1
}
```

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `origem` | string | sim | Código IATA de origem |
| `destino` | string | sim | Código IATA de destino |
| `data_ida` | date (YYYY-MM-DD) | sim | Data pretendida de ida |
| `data_volta` | date (YYYY-MM-DD) | sim | Data pretendida de volta |
| `flexibilidade_ida_antes` | int | não | Dias que pode antecipar a ida (default: 0) |
| `flexibilidade_ida_depois` | int | não | Dias que pode adiar a ida (default: 0) |
| `flexibilidade_volta_antes` | int | não | Dias que pode antecipar a volta (default: 0) |
| `flexibilidade_volta_depois` | int | não | Dias que pode adiar a volta (default: 0) |
| `budget` | float | não | Orçamento máximo em BRL (filtra resultados) |
| `num_passageiros` | int | não | Número de passageiros (default: 1) |

### Response 200

```json
{
  "sugestoes": [
    {
      "data_ida": "2026-04-15",
      "data_volta": "2026-04-20",
      "preco_unitario": 680,
      "preco_total": 680,
      "economia_vs_original": 520,
      "economia_percentual": 43,
      "motivo": "Volta às quartas-feiras concentra menor demanda corporativa nesse trecho, reduzindo as tarifas significativamente."
    },
    {
      "data_ida": "2026-04-14",
      "data_volta": "2026-04-20",
      "preco_unitario": 620,
      "preco_total": 620,
      "economia_vs_original": 580,
      "economia_percentual": 48,
      "motivo": "Antecipando 1 dia na ida e 5 na volta, você evita os picos de segunda e sexta-feira."
    },
    {
      "data_ida": "2026-04-16",
      "data_volta": "2026-04-22",
      "preco_unitario": 710,
      "preco_total": 710,
      "economia_vs_original": 490,
      "economia_percentual": 41,
      "motivo": "Deslocando a viagem 1 dia para frente em ambas as pontas, você sai dos dias de maior demanda."
    }
  ],
  "melhor_opcao": {
    "data_ida": "2026-04-14",
    "data_volta": "2026-04-20",
    "preco_unitario": 620,
    "economia_vs_original": 580
  },
  "preco_original_estimado": 1200,
  "insight": "Neste trecho GRU→SDU, tarifas às terças e quartas são em média 28% mais baratas que às segundas e sextas. Evitar o retorno às sextas reduz ainda mais o custo.",
  "base_historica": {
    "periodo_analisado_dias": 90,
    "total_cotacoes": 847
  }
}
```

### Response 422 — Validação

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "origem": ["O campo origem é obrigatório."],
    "data_volta": ["A data de volta deve ser posterior à data de ida."]
  }
}
```

### Response 404 — Sem dados históricos

```json
{
  "message": "Sem histórico de cotações suficiente para este trecho no período analisado.",
  "trecho": "GRU → SDU",
  "cotacoes_encontradas": 0
}
```

---

## GET `/iata-search?q={termo}`

Busca códigos IATA por nome de cidade ou aeroporto (autocomplete no popup).

### Request

```
GET /iata-search?q=sao+paulo
Authorization: Bearer {token_onfly}
```

### Response 200

```json
{
  "resultados": [
    { "iata": "GRU", "nome": "São Paulo — Guarulhos (GRU)" },
    { "iata": "CGH", "nome": "São Paulo — Congonhas (CGH)" },
    { "iata": "VCP", "nome": "São Paulo — Viracopos (VCP)" }
  ]
}
```

---

## Implementação PHP — SuggestDatesController

```php
<?php

namespace App\Http\Controllers;

use App\Services\BigQueryService;
use App\Services\ClaudeService;
use Illuminate\Http\Request;

class SuggestDatesController extends Controller
{
    public function __construct(
        private BigQueryService $bigquery,
        private ClaudeService $claude
    ) {}

    public function suggest(Request $request)
    {
        $validated = $request->validate([
            'origem'                      => 'required|string|size:3',
            'destino'                     => 'required|string|size:3',
            'data_ida'                    => 'required|date|after:today',
            'data_volta'                  => 'required|date|after:data_ida',
            'flexibilidade_ida_antes'     => 'integer|min:0|max:7',
            'flexibilidade_ida_depois'    => 'integer|min:0|max:7',
            'flexibilidade_volta_antes'   => 'integer|min:0|max:14',
            'flexibilidade_volta_depois'  => 'integer|min:0|max:14',
            'budget'                      => 'nullable|numeric|min:0',
            'num_passageiros'             => 'integer|min:1|max:10',
        ]);

        $historico = $this->bigquery->getPrecosPorData($validated);

        if (empty($historico)) {
            return response()->json([
                'message' => 'Sem histórico de cotações suficiente para este trecho.',
                'cotacoes_encontradas' => 0,
            ], 404);
        }

        $sugestoes = $this->claude->sugerirDatas($validated, $historico);

        return response()->json($sugestoes);
    }
}
```

## Implementação PHP — ClaudeService

```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class ClaudeService
{
    private string $apiKey;
    private string $model = 'claude-sonnet-4-6';

    public function __construct()
    {
        $this->apiKey = config('services.anthropic.key');
    }

    public function sugerirDatas(array $params, array $historico): array
    {
        $prompt = $this->buildPrompt($params, $historico);

        $response = Http::withHeaders([
            'x-api-key'         => $this->apiKey,
            'anthropic-version' => '2023-06-01',
            'content-type'      => 'application/json',
        ])->post('https://api.anthropic.com/v1/messages', [
            'model'      => $this->model,
            'max_tokens' => 1024,
            'messages'   => [
                ['role' => 'user', 'content' => $prompt],
            ],
        ]);

        $content = $response->json('content.0.text');

        // Extrai JSON da resposta do Claude
        preg_match('/\{.*\}/s', $content, $matches);
        return json_decode($matches[0], true);
    }

    private function buildPrompt(array $params, array $historico): string
    {
        $historicoJson = json_encode($historico, JSON_PRETTY_PRINT);

        return <<<PROMPT
Você é um assistente de viagens corporativas da Onfly. Responda APENAS com JSON válido, sem texto adicional.

Contexto do usuário:
- Trecho: {$params['origem']} → {$params['destino']}
- Data pretendida: ida {$params['data_ida']} / volta {$params['data_volta']}
- Pode antecipar ida: {$params['flexibilidade_ida_antes']} dias
- Pode adiar ida: {$params['flexibilidade_ida_depois']} dias
- Pode antecipar volta: {$params['flexibilidade_volta_antes']} dias
- Pode adiar volta: {$params['flexibilidade_volta_depois']} dias
- Budget máximo: {$params['budget']} BRL (null = sem limite)

Histórico de preços reais (BigQuery, últimos 90 dias):
{$historicoJson}

Retorne JSON com esta estrutura exata:
{
  "sugestoes": [
    {
      "data_ida": "YYYY-MM-DD",
      "data_volta": "YYYY-MM-DD",
      "preco_unitario": 0,
      "economia_vs_original": 0,
      "economia_percentual": 0,
      "motivo": "explicação em 1-2 frases"
    }
  ],
  "melhor_opcao": { ... },
  "preco_original_estimado": 0,
  "insight": "padrão sazonal identificado em linguagem natural"
}

Regras:
1. Retorne exatamente 3 sugestões dentro da janela de flexibilidade
2. Ordene por menor preço
3. Se budget foi informado, inclua apenas combos dentro do budget
4. O campo "motivo" deve ser em português, objetivo e baseado nos dados
PROMPT;
    }
}
```
