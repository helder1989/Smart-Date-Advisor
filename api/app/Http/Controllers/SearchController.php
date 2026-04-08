<?php

namespace App\Http\Controllers;

use App\Services\GatewayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SearchController extends Controller
{
    public function __construct(private readonly GatewayService $gateway) {}

    /**
     * Busca aeroportos por nome ou código IATA.
     * Modalidade: aéreo
     *
     * GET /api/search/airports?search=gru
     */
    public function airports(Request $request): JsonResponse
    {
        $request->validate([
            'search' => 'required|string|min:2|max:100',
        ]);
        
        $results = $this->cached(
            key: 'search_airports_' . strtolower($request->search),
            ttl: 60,
            fn: fn() => $this->gateway->searchAirports(
                $request->bearerToken(),
                $request->search
            )
        );

        return response()->json($results);
    }

    /**
     * Busca cidades para hospedagem com autocomplete.
     * Modalidade: hotel
     *
     * GET /api/search/hotel-cities?search=salvador
     */
    public function hotelCities(Request $request): JsonResponse
    {
        $request->validate([
            'search' => 'required|string|min:2|max:100',
        ]);

        $results = $this->cached(
            key: 'search_hotel_cities_' . strtolower($request->search),
            ttl: 60,
            fn: fn() => $this->gateway->searchHotelCities(
                $request->bearerToken(),
                $request->search
            )
        );

        return response()->json($results);
    }

    /**
     * Busca cidades para retirada de carro.
     * Modalidade: carro
     *
     * GET /api/search/car-cities?name=salvador
     */
    public function carCities(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|min:2|max:100',
        ]);

        $results = $this->cached(
            key: 'search_car_cities_' . strtolower($request->name),
            ttl: 60,
            fn: fn() => $this->gateway->searchCarCities(
                $request->bearerToken(),
                $request->name
            )
        );

        return response()->json($results);
    }

    /**
     * Busca terminais de ônibus por nome (origem ou destino).
     * Modalidade: ônibus
     *
     * GET /api/search/bus-destinations?search=salvador
     */
    public function busDestinations(Request $request): JsonResponse
    {
        $request->validate([
            'search' => 'required|string|min:2|max:100',
        ]);

        $results = $this->cached(
            key: 'search_bus_' . strtolower($request->search),
            ttl: 60,
            fn: fn() => $this->gateway->searchBusDestinations(
                $request->bearerToken(),
                $request->search
            )
        );

        return response()->json($results);
    }

    /**
     * Cache helper — evita repetição do padrão Cache::remember() nos métodos.
     * TTL em minutos. Dados de destino mudam pouco, 60 min é seguro.
     */
    private function cached(string $key, int $ttl, \Closure $fn): mixed
    {
        return Cache::remember($key, now()->addMinutes($ttl), $fn);
    }
}
