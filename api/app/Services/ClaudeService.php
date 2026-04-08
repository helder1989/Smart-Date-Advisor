<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ClaudeService
{
    private const API_URL    = 'https://api.anthropic.com/v1/messages';
    private const MODEL      = 'claude-sonnet-4-20250514';
    private const MAX_TOKENS = 1000;

    /**
     * Analisa o histórico de reservas e retorna sugestões de datas via Claude API.
     *
     * Nunca lança exceção para o caller — erros retornam fallback mockado.
     *
     * @param  array<string, mixed>  $params      Parâmetros validados da requisição
     * @param  array<int, array>     $historical  Histórico de reservas do frontend
     * @return array{suggestions: array, insight: string}
     */
    public function analyze(array $params, array $historical): array
    {
        try {
            $systemPrompt = $this->systemPrompt();
            $userPrompt   = $this->buildPrompt($params, $historical);

            $response = Http::withHeaders([
                'x-api-key'         => config('services.claude.api_key'),
                'anthropic-version' => '2023-06-01',
                'content-type'      => 'application/json',
            ])
            ->timeout(30)
            ->post(self::API_URL, [
                'model'      => self::MODEL,
                'max_tokens' => self::MAX_TOKENS,
                'system'     => $systemPrompt,
                'messages'   => [
                    ['role' => 'user', 'content' => $userPrompt],
                ],
            ]);

            if ($response->failed()) {
                Log::error('ClaudeService: API error', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
                return $this->fallback($params);
            }

            $text    = $response->json('content.0.text', '');
            $decoded = json_decode($text, true);

            if (json_last_error() !== JSON_ERROR_NONE || empty($decoded['suggestions'])) {
                Log::error('ClaudeService: JSON parse error', [
                    'error' => json_last_error_msg(),
                    'text'  => substr($text, 0, 500),
                ]);
                return $this->fallback($params);
            }

            return $decoded;

        } catch (\Throwable $e) {
            Log::error('ClaudeService: exception', [
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);
            return $this->fallback($params);
        }
    }

    /**
     * System prompt que instrui o Claude a responder apenas com JSON puro.
     */
    private function systemPrompt(): string
    {
        return 'Você é um assistente de viagens corporativas da Onfly. '
            . 'Analise dados históricos de preços e sugira as melhores combinações '
            . 'de datas dentro da janela de flexibilidade do viajante. '
            . 'Responda APENAS com JSON válido, sem texto antes ou depois. '
            . 'Sem markdown, sem backticks. Apenas o objeto JSON puro.';
    }

    /**
     * Monta o prompt com os parâmetros da viagem e o histórico filtrado.
     * Limita o histórico a 50 registros para não exceder a janela de tokens.
     */
    private function buildPrompt(array $params, array $historical): string
    {
        $historicalJson = json_encode(
            array_slice($historical, 0, 50),
            JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE
        );

        $dataLabel = ($params['data_source'] ?? 'history') === 'quote'
            ? 'Cotações reais por combinação de datas em BRL (JSON). Campos: price_brl = tarifa base, total_price_brl = total com taxas. Ordene pelo menor total_price_brl:'
            : 'Histórico de reservas para esse trecho em BRL (JSON — use para inferir padrões de preço):';

        return <<<PROMPT
Modalidade: {$params['modality']}
Trecho: {$params['origin']} → {$params['destination']}
Data pretendida de ida: {$params['date_from']}
Data pretendida de volta: {$params['date_to']}
Flexibilidade de ida: ±{$params['flexibility_from']} dias
Flexibilidade de volta: ±{$params['flexibility_to']} dias
Viajantes: {$params['travelers']}

{$dataLabel}
{$historicalJson}

Retorne um JSON com esta estrutura exata:
{
  "suggestions": [
    {
      "date_from": "YYYY-MM-DD",
      "date_to": "YYYY-MM-DD",
      "price": 0.00,
      "savings": 0.00,
      "label": "string"
    }
  ],
  "insight": "string em pt-BR, máximo 2 frases explicando por que essas datas são mais baratas"
}

Regras:
- Retorne exatamente 4 sugestões
- Ordene por menor preço (index 0 = mais barato)
- Label do index 0: "Melhor opção"
- Labels dos demais: "2ª opção", "3ª opção", "4ª opção"
- savings = preço original (data exata pedida) - price
- Se não houver dados suficientes, estime baseado nos padrões do trecho
- insight máximo 2 frases, direto ao ponto, em português
PROMPT;
    }

    /**
     * Fallback com dados mockados.
     * Garante que o frontend nunca receba erro — só dados estimados.
     *
     * @return array{suggestions: array, insight: string}
     */
    private function fallback(array $params): array
    {
        $base = 1200.00;

        $offset = fn(string $date, int $days): string =>
            date('Y-m-d', strtotime("{$date} {$days} days"));

        return [
            'suggestions' => [
                [
                    'date_from' => $params['date_from'],
                    'date_to'   => $params['date_to'],
                    'price'     => $base,
                    'savings'   => 0.00,
                    'label'     => 'Melhor opção',
                ],
                [
                    'date_from' => $offset($params['date_from'], 1),
                    'date_to'   => $offset($params['date_to'], 1),
                    'price'     => round($base * 1.05, 2),
                    'savings'   => round(-$base * 0.05, 2),
                    'label'     => '2ª opção',
                ],
                [
                    'date_from' => $offset($params['date_from'], -1),
                    'date_to'   => $offset($params['date_to'], -1),
                    'price'     => round($base * 1.10, 2),
                    'savings'   => round(-$base * 0.10, 2),
                    'label'     => '3ª opção',
                ],
                [
                    'date_from' => $offset($params['date_from'], 2),
                    'date_to'   => $offset($params['date_to'], 2),
                    'price'     => round($base * 1.15, 2),
                    'savings'   => round(-$base * 0.15, 2),
                    'label'     => '4ª opção',
                ],
            ],
            'insight' => 'Não foi possível analisar os dados no momento. Exibindo estimativas baseadas na data solicitada.',
        ];
    }
}
