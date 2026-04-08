<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Centraliza todas as chamadas HTTP ao gateway de viagens.
 *
 * Base URL: ONFLY_GATEWAY_URL (ex: https://gateway.viagens.dev)
 * Autenticação: Bearer token do usuário Onfly, repassado a cada chamada.
 */
class GatewayService
{
    private string $baseUrl;

    private array $defaultHeaders = [
        'accept'          => 'application/json',
        'origin'          => 'https://onfly-dev.viagens.dev',
        'referer'         => 'https://onfly-dev.viagens.dev/',
    ];

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.onfly.gateway_url'), '/');
    }

    // -------------------------------------------------------------------------
    // Busca de destinos por modalidade
    // -------------------------------------------------------------------------

    /**
     * Busca aeroportos por nome ou código IATA.
     * Usado na modalidade: aéreo.
     *
     * GET /bff/destination/airports?lang=pt-br&search={search}
     */
    public function searchAirports(string $token, string $search): array
    {
        return $this->get($token, '/bff/destination/airports', [
            'lang'   => 'pt-br',
            'search' => $search,
        ]);
    }

    /**
     * Busca cidades por nome com autocomplete.
     * Usado na modalidade: hotel.
     *
     * GET /bff/destination/cities/autocomplete?lang=pt-br&search={search}
     */
    public function searchHotelCities(string $token, string $search): array
    {
        return $this->get($token, '/bff/destination/cities/autocomplete', [
            'lang'   => 'pt-br',
            'search' => $search,
        ]);
    }

    /**
     * Busca cidades disponíveis para retirada de carro.
     * Usado na modalidade: carro.
     *
     * GET /bff/destination/cities?name={name}
     */
    public function searchCarCities(string $token, string $name): array
    {
        return $this->get($token, '/bff/destination/cities', [
            'name' => $name,
        ]);
    }

    /**
     * Busca terminais de ônibus por nome.
     * Usado na modalidade: ônibus (origem e destino).
     *
     * GET /bff/destination/bus-destinations?search={search}
     */
    public function searchBusDestinations(string $token, string $search): array
    {
        return $this->get($token, '/bff/destination/bus-destinations', [
            'search' => $search,
        ]);
    }

    // -------------------------------------------------------------------------
    // HTTP helper
    // -------------------------------------------------------------------------

    /**
     * Executa GET no gateway com autenticação e query string.
     *
     * @return array  Dados da resposta ou array vazio em caso de erro.
     */
    private function get(string $token, string $path, array $query = []): array
    {
        try {
            $response = Http::withHeaders(array_merge($this->defaultHeaders, [
                'authorization' => "Bearer {$token}",
            ]))
            ->timeout(10)
            ->get($this->baseUrl . $path, $query);

            if ($response->failed()) {
                Log::warning('GatewayService: request failed', [
                    'path'   => $path,
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
                return [];
            }

            return $response->json() ?? [];

        } catch (\Throwable $e) {
            Log::error('GatewayService: exception', [
                'path'    => $path,
                'message' => $e->getMessage(),
            ]);
            return [];
        }
    }
}
