<?php

use App\Http\Controllers\AnalyzeController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SearchController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Smart Data Advisor
|--------------------------------------------------------------------------
|
| GET  /api/health                      → health check público
| POST /api/auth/login                  → autenticação via Onfly OAuth2
|
| POST /api/analyze                     → análise de datas (requer token)
|
| GET  /api/search/airports             → busca aeroportos        (aéreo)
| GET  /api/search/hotel-cities         → busca cidades           (hotel)
| GET  /api/search/car-cities           → busca cidades           (carro)
| GET  /api/search/bus-destinations     → busca terminais         (ônibus)
|
*/

Route::get('/health', [AnalyzeController::class, 'health']);

Route::post('/auth/login', [AuthController::class, 'login']);

// Route::middleware('onfly.auth')->group(function () {
    Route::post('/analyze', [AnalyzeController::class, 'analyze']);

    Route::prefix('search')->group(function () {
        Route::get('/airports',          [SearchController::class, 'airports']);
        Route::get('/hotel-cities',      [SearchController::class, 'hotelCities']);
        Route::get('/car-cities',        [SearchController::class, 'carCities']);
        Route::get('/bus-destinations',  [SearchController::class, 'busDestinations']);
    });
// });
