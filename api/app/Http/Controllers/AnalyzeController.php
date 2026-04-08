<?php

namespace App\Http\Controllers;

use App\Services\ClaudeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class AnalyzeController extends Controller
{
    public function __construct(private readonly ClaudeService $claude) {}

    /**
     * Analisa histórico de reservas e retorna as 4 melhores combinações de datas.
     *
     * Lógica:
     *  1. Valida o request
     *  2. Verifica cache Redis (TTL 30 min)
     *  3. Chama ClaudeService::analyze()
     *  4. Persiste no cache e retorna
     */
    public function analyze(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'modality'          => 'required|in:aereo,hotel,carro,onibus',
            'origin'            => 'required|string',
            'destination'       => 'required|string',
            'date_from'         => 'required|date',
            'date_to'           => 'required|date',
            'flexibility_from'  => 'required|integer|min:0|max:7',
            'flexibility_to'    => 'required|integer|min:0|max:7',
            'travelers'         => 'required|integer|min:1',
            'historical_data'   => 'required|array',
            'historical_data.*' => 'array',
        ]);

        $cacheKey = 'analyze_' . md5(json_encode([
            $validated['modality'],
            $validated['origin'],
            $validated['destination'],
            $validated['date_from'],
            $validated['date_to'],
            $validated['flexibility_from'],
            $validated['flexibility_to'],
        ]));

        if ($cached = Cache::get($cacheKey)) {
            Log::info('AnalyzeController: cache hit', ['key' => $cacheKey]);
            return response()->json($cached);
        }

        $result = $this->claude->analyze($validated, $validated['historical_data']);

        $result['combinations_analyzed'] = $this->countCombinations(
            (int) $validated['flexibility_from'],
            (int) $validated['flexibility_to']
        );

        Cache::put($cacheKey, $result, now()->addMinutes(30));

        return response()->json($result);
    }

    /**
     * Health check simples — usado pelo Docker e monitoramento.
     */
    public function health(): JsonResponse
    {
        return response()->json([
            'status'    => 'ok',
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Calcula o número total de combinações possíveis dada a flexibilidade.
     * Fórmula: (2 * flex_from + 1) * (2 * flex_to + 1)
     */
    private function countCombinations(int $flex_from, int $flex_to): int
    {
        return (2 * $flex_from + 1) * (2 * $flex_to + 1);
    }
}
