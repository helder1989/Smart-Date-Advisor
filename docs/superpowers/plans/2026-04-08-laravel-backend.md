# Smart Data Advisor — Laravel Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar o backend Laravel 12 + MySQL do Smart Data Advisor, com autenticação JWT, integração BigQuery para análise de preços e Claude API para geração de insights de viagem.

**Architecture:** Controllers delgam para Services (AuthService, AnalyzeTravelService, BigQueryClientService, ClaudeInsightService). O endpoint `/analyze` gera combinações de datas, consulta o BigQuery em paralelo por combinação, ordena por preço e retorna as 4 melhores + 1 insight gerado pelo Claude. Redis faz cache das queries do BigQuery por 5 minutos.

**Tech Stack:** Laravel 12, PHP 8.3, MySQL 8, Redis 7, `php-open-source-saver/jwt-auth`, `google/cloud-bigquery`, Claude Sonnet via Anthropic HTTP API, Docker Compose, PHPUnit.

> ⚠️ **Schemas do BigQuery:** Os nomes de colunas usados nas queries são **suposições razoáveis**. Antes de rodar o Task 9/10, validar os schemas reais com:
> `SELECT column_name FROM dw-onfly-dev.v3_quote.INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'flights'`

---

## Estrutura de Arquivos

```
smart-data-advisor/
├── api/                                  ← Laravel project (criado neste plano)
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── AuthController.php    ← login + googleLogin
│   │   │   │   └── AnalyzeController.php ← analyze endpoint
│   │   │   └── Requests/
│   │   │       ├── LoginRequest.php
│   │   │       ├── GoogleAuthRequest.php
│   │   │       └── AnalyzeRequest.php
│   │   ├── Services/
│   │   │   ├── Auth/
│   │   │   │   └── GoogleTokenService.php ← verifica token Google
│   │   │   ├── BigQuery/
│   │   │   │   ├── BigQueryClientService.php ← wrapper com cache Redis
│   │   │   │   └── PriceQueryService.php    ← queries por modalidade
│   │   │   ├── Analysis/
│   │   │   │   ├── CombinationGeneratorService.php ← lógica de combinações
│   │   │   │   └── AnalyzeTravelService.php        ← orquestrador
│   │   │   └── Insight/
│   │   │       └── ClaudeInsightService.php ← chama Anthropic API
│   │   └── Models/
│   │       └── User.php
│   ├── config/
│   │   └── bigquery.php                  ← config do BigQuery
│   ├── database/migrations/
│   │   └── 2026_04_08_000001_create_users_table.php
│   ├── routes/
│   │   └── api.php
│   ├── tests/
│   │   ├── Unit/Services/
│   │   │   ├── CombinationGeneratorServiceTest.php
│   │   │   ├── ClaudeInsightServiceTest.php
│   │   │   └── PriceQueryServiceTest.php
│   │   └── Feature/
│   │       ├── Auth/
│   │       │   ├── LoginTest.php
│   │       │   └── GoogleAuthTest.php
│   │       └── AnalyzeTest.php
│   ├── docker/
│   │   ├── php/Dockerfile
│   │   └── nginx/default.conf
│   ├── docker-compose.yml
│   └── .env.example
└── extension/                            ← mover onfly-extension/ aqui (fora do escopo)
```

---

## Task 1: Docker Compose + Infraestrutura

**Files:**
- Create: `api/docker-compose.yml`
- Create: `api/docker/php/Dockerfile`
- Create: `api/docker/nginx/default.conf`

- [ ] **Step 1.1: Criar estrutura de diretórios Docker**

```bash
cd /home/brunotrinchao/projetos/smart-data-advisor
mkdir -p api/docker/php api/docker/nginx
```

- [ ] **Step 1.2: Criar Dockerfile PHP 8.3-FPM**

Criar `/home/brunotrinchao/projetos/smart-data-advisor/api/docker/php/Dockerfile`:

```dockerfile
FROM php:8.3-fpm

RUN apt-get update && apt-get install -y \
    git curl zip unzip libonig-dev libxml2-dev libzip-dev \
    && docker-php-ext-install pdo_mysql mbstring zip bcmath pcntl \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN composer install --no-interaction --prefer-dist --optimize-autoloader \
    && chown -R www-data:www-data storage bootstrap/cache

CMD ["php-fpm"]
```

- [ ] **Step 1.3: Criar config Nginx**

Criar `/home/brunotrinchao/projetos/smart-data-advisor/api/docker/nginx/default.conf`:

```nginx
server {
    listen 80;
    root /var/www/html/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass app:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

- [ ] **Step 1.4: Criar docker-compose.yml**

Criar `/home/brunotrinchao/projetos/smart-data-advisor/api/docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: docker/php/Dockerfile
    container_name: sda_app
    restart: unless-stopped
    volumes:
      - .:/var/www/html
      - ${GOOGLE_BQ_SA_JSON:-/dev/null}:/var/secrets/bigquery-sa.json:ro
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - sda_network

  nginx:
    image: nginx:1.25-alpine
    container_name: sda_nginx
    restart: unless-stopped
    ports:
      - "8080:80"
    volumes:
      - .:/var/www/html
      - ./docker/nginx/default.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - app
    networks:
      - sda_network

  mysql:
    image: mysql:8.0
    container_name: sda_mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: secret
      MYSQL_DATABASE: smart_data_advisor
      MYSQL_USER: onfly
      MYSQL_PASSWORD: onfly_secret
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - sda_network

  redis:
    image: redis:7-alpine
    container_name: sda_redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    networks:
      - sda_network

volumes:
  mysql_data:

networks:
  sda_network:
    driver: bridge
```

- [ ] **Step 1.5: Commit infra**

```bash
cd /home/brunotrinchao/projetos/smart-data-advisor
git add api/docker-compose.yml api/docker/
git commit -m "chore: add Docker Compose infrastructure (PHP 8.3, Nginx, MySQL 8, Redis 7)"
```

---

## Task 2: Bootstrap Laravel 12 + Dependências

**Files:**
- Create: `api/` (projeto Laravel completo via composer)
- Create: `api/.env.example`
- Modify: `api/config/auth.php`
- Create: `api/config/bigquery.php`
- Modify: `api/config/services.php`

- [ ] **Step 2.1: Criar projeto Laravel 12**

```bash
cd /home/brunotrinchao/projetos/smart-data-advisor
# Se api/ já tem os arquivos Docker criados no Task 1:
composer create-project laravel/laravel:^12.0 api-tmp
cp -r api-tmp/. api/
rm -rf api-tmp
cd api
```

Expected: `Application ready! Build something amazing.`

- [ ] **Step 2.2: Instalar dependências JWT e BigQuery**

```bash
cd /home/brunotrinchao/projetos/smart-data-advisor/api
composer require php-open-source-saver/jwt-auth google/cloud-bigquery
```

Expected: dois pacotes instalados sem erros.

- [ ] **Step 2.3: Publicar config JWT e gerar secret**

```bash
php artisan vendor:publish --provider="PHPOpenSourceSaver\JWTAuth\Providers\LaravelServiceProvider"
php artisan jwt:secret
```

Expected: `jwt.php config file created` + `jwt-secret set successfully.`

- [ ] **Step 2.4: Criar `.env.example`**

Criar/substituir `/home/brunotrinchao/projetos/smart-data-advisor/api/.env.example`:

```dotenv
APP_NAME=SmartDataAdvisor
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8080
APP_LOCALE=pt_BR

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=smart_data_advisor
DB_USERNAME=onfly
DB_PASSWORD=onfly_secret

CACHE_STORE=redis
REDIS_CLIENT=phpredis
REDIS_HOST=redis
REDIS_PASSWORD=null
REDIS_PORT=6379

QUEUE_CONNECTION=sync

JWT_SECRET=
JWT_TTL=1440

BQ_PROJECT=dw-onfly-dev
GOOGLE_BQ_SA_JSON=/var/secrets/bigquery-sa.json

CLAUDE_API_KEY=
```

- [ ] **Step 2.5: Configurar guard JWT em `config/auth.php`**

Localizar o bloco `'guards'` e substituir:

```php
'guards' => [
    'api' => [
        'driver' => 'jwt',
        'provider' => 'users',
    ],
    'web' => [
        'driver' => 'session',
        'provider' => 'users',
    ],
],
```

- [ ] **Step 2.6: Criar `config/bigquery.php`**

```php
<?php

return [
    'project_id' => env('BQ_PROJECT', 'dw-onfly-dev'),
    'sa_json_path' => env('GOOGLE_BQ_SA_JSON', '/var/secrets/bigquery-sa.json'),
];
```

- [ ] **Step 2.7: Adicionar Claude em `config/services.php`**

Adicionar ao array retornado:

```php
'claude' => [
    'api_key' => env('CLAUDE_API_KEY'),
    'model' => 'claude-sonnet-4-5',
    'api_url' => 'https://api.anthropic.com/v1/messages',
],
```

- [ ] **Step 2.8: Copiar `.env.example` para `.env` e gerar APP_KEY**

```bash
cp .env.example .env
php artisan key:generate
```

Expected: `Application key set successfully.`

- [ ] **Step 2.9: Verificar que Laravel está funcionando**

```bash
php artisan --version
```

Expected: `Laravel Framework 12.x.x`

- [ ] **Step 2.10: Commit bootstrap**

```bash
cd /home/brunotrinchao/projetos/smart-data-advisor/api
git add composer.json composer.lock .env.example config/auth.php config/bigquery.php config/services.php config/jwt.php
git commit -m "feat: bootstrap Laravel 12 with JWT auth and BigQuery dependencies"
```

---

## Task 3: Migration de Usuários + User Model

**Files:**
- Modify: `api/database/migrations/0001_01_01_000000_create_users_table.php`
- Modify: `api/app/Models/User.php`

- [ ] **Step 3.1: Escrever o teste unitário da migration (verificação estrutural)**

Criar `tests/Feature/Auth/UserModelTest.php`:

```php
<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_table_has_required_columns(): void
    {
        $user = User::create([
            'name' => 'Teste Onfly',
            'email' => 'teste@onfly.com.br',
            'password' => bcrypt('secret123'),
        ]);

        $this->assertDatabaseHas('users', [
            'email' => 'teste@onfly.com.br',
        ]);
        $this->assertNull($user->google_id);
        $this->assertNull($user->avatar);
    }

    public function test_user_can_be_created_without_password_for_google_oauth(): void
    {
        $user = User::create([
            'name' => 'Google User',
            'email' => 'google@onfly.com.br',
            'google_id' => '123456789',
            'avatar' => 'https://lh3.googleusercontent.com/a/photo.jpg',
        ]);

        $this->assertNotNull($user->id);
        $this->assertNull($user->password);
    }
}
```

- [ ] **Step 3.2: Rodar teste para verificar que FALHA (tabela sem colunas google_id/avatar)**

```bash
php artisan test tests/Feature/Auth/UserModelTest.php
```

Expected: FAIL — `Column 'google_id' not found` ou similar.

- [ ] **Step 3.3: Atualizar migration de users**

Editar `database/migrations/0001_01_01_000000_create_users_table.php` — substituir o método `up()`:

```php
public function up(): void
{
    Schema::create('users', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('email')->unique();
        $table->string('password')->nullable(); // null para usuários OAuth
        $table->string('google_id')->nullable()->index();
        $table->string('avatar')->nullable();
        $table->timestamp('email_verified_at')->nullable();
        $table->rememberToken();
        $table->timestamps();
    });
}
```

- [ ] **Step 3.4: Atualizar User Model para implementar JWTSubject**

Substituir `app/Models/User.php` completamente:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
        'avatar',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return [];
    }
}
```

- [ ] **Step 3.5: Rodar migration e confirmar**

```bash
php artisan migrate:fresh
```

Expected: `Migrated: ...create_users_table`

- [ ] **Step 3.6: Rodar teste novamente — deve PASSAR**

```bash
php artisan test tests/Feature/Auth/UserModelTest.php
```

Expected: `PASS  Tests\Feature\Auth\UserModelTest` — 2 tests, 3 assertions.

- [ ] **Step 3.7: Commit**

```bash
git add database/migrations/ app/Models/User.php tests/Feature/Auth/UserModelTest.php
git commit -m "feat: add users table migration with google_id/avatar and JWTSubject interface"
```

---

## Task 4: Endpoint POST /auth/login

**Files:**
- Create: `api/app/Http/Requests/LoginRequest.php`
- Create: `api/app/Http/Controllers/AuthController.php`
- Modify: `api/routes/api.php`
- Create: `api/tests/Feature/Auth/LoginTest.php`

- [ ] **Step 4.1: Escrever o teste de feature para login**

Criar `tests/Feature/Auth/LoginTest.php`:

```php
<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'joao@onfly.com.br',
            'password' => bcrypt('senha123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'joao@onfly.com.br',
            'password' => 'senha123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['token', 'type'])
            ->assertJsonPath('type', 'bearer');
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create(['email' => 'joao@onfly.com.br', 'password' => bcrypt('certa')]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'joao@onfly.com.br',
            'password' => 'errada',
        ]);

        $response->assertStatus(401)
            ->assertJsonPath('message', 'Credenciais inválidas.');
    }

    public function test_login_validates_required_fields(): void
    {
        $response = $this->postJson('/api/v1/auth/login', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_login_validates_email_format(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'nao-é-email',
            'password' => 'senha123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }
}
```

- [ ] **Step 4.2: Rodar para confirmar FAIL**

```bash
php artisan test tests/Feature/Auth/LoginTest.php
```

Expected: FAIL — rota não existe.

- [ ] **Step 4.3: Criar LoginRequest**

Criar `app/Http/Requests/LoginRequest.php`:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email'    => 'required|email',
            'password' => 'required|string|min:6',
        ];
    }
}
```

- [ ] **Step 4.4: Criar AuthController com método login**

Criar `app/Http/Controllers/AuthController.php`:

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\GoogleAuthRequest;
use App\Http\Requests\LoginRequest;
use App\Models\User;
use App\Services\Auth\GoogleTokenService;

class AuthController extends Controller
{
    public function login(LoginRequest $request): \Illuminate\Http\JsonResponse
    {
        $credentials = $request->only('email', 'password');

        if (! $token = auth('api')->attempt($credentials)) {
            return response()->json(['message' => 'Credenciais inválidas.'], 401);
        }

        return response()->json(['token' => $token, 'type' => 'bearer']);
    }

    public function googleLogin(GoogleAuthRequest $request, GoogleTokenService $googleTokenService): \Illuminate\Http\JsonResponse
    {
        // Implementado no Task 5
        return response()->json(['message' => 'Not implemented'], 501);
    }
}
```

- [ ] **Step 4.5: Configurar routes/api.php**

Substituir o conteúdo de `routes/api.php`:

```php
<?php

use App\Http\Controllers\AnalyzeController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Rotas públicas
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/google', [AuthController::class, 'googleLogin']);

    // Rotas protegidas por JWT
    Route::middleware('auth:api')->group(function () {
        Route::post('/analyze', [AnalyzeController::class, 'analyze']);
    });
});
```

- [ ] **Step 4.6: Rodar testes — devem PASSAR**

```bash
php artisan test tests/Feature/Auth/LoginTest.php
```

Expected: `PASS  Tests\Feature\Auth\LoginTest` — 4 tests, 8 assertions.

- [ ] **Step 4.7: Commit**

```bash
git add app/Http/Requests/LoginRequest.php app/Http/Controllers/AuthController.php routes/api.php tests/Feature/Auth/LoginTest.php
git commit -m "feat: implement POST /v1/auth/login with JWT authentication"
```

---

## Task 5: Endpoint POST /auth/google

**Files:**
- Create: `api/app/Services/Auth/GoogleTokenService.php`
- Create: `api/app/Http/Requests/GoogleAuthRequest.php`
- Modify: `api/app/Http/Controllers/AuthController.php`
- Create: `api/tests/Feature/Auth/GoogleAuthTest.php`

- [ ] **Step 5.1: Escrever teste de feature para Google Auth**

Criar `tests/Feature/Auth/GoogleAuthTest.php`:

```php
<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Services\Auth\GoogleTokenService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class GoogleAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_google_login_creates_new_user_and_returns_token(): void
    {
        $this->mock(GoogleTokenService::class, function ($mock) {
            $mock->shouldReceive('verify')
                ->once()
                ->with('valid_google_token')
                ->andReturn([
                    'sub' => 'google_id_123',
                    'email' => 'novo@onfly.com.br',
                    'name' => 'Novo Usuário',
                    'picture' => 'https://photo.jpg',
                ]);
        });

        $response = $this->postJson('/api/v1/auth/google', [
            'google_token' => 'valid_google_token',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['token', 'type']);

        $this->assertDatabaseHas('users', [
            'email' => 'novo@onfly.com.br',
            'google_id' => 'google_id_123',
        ]);
    }

    public function test_google_login_finds_existing_user(): void
    {
        $existing = User::factory()->create([
            'email' => 'existente@onfly.com.br',
            'google_id' => 'google_id_456',
        ]);

        $this->mock(GoogleTokenService::class, function ($mock) {
            $mock->shouldReceive('verify')
                ->once()
                ->andReturn([
                    'sub' => 'google_id_456',
                    'email' => 'existente@onfly.com.br',
                    'name' => 'Existente',
                    'picture' => null,
                ]);
        });

        $response = $this->postJson('/api/v1/auth/google', [
            'google_token' => 'valid_token',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseCount('users', 1);
    }

    public function test_google_login_fails_with_invalid_token(): void
    {
        $this->mock(GoogleTokenService::class, function ($mock) {
            $mock->shouldReceive('verify')->once()->andReturn(null);
        });

        $response = $this->postJson('/api/v1/auth/google', [
            'google_token' => 'invalid_token',
        ]);

        $response->assertStatus(401)
            ->assertJsonPath('message', 'Token Google inválido.');
    }

    public function test_google_login_validates_required_field(): void
    {
        $response = $this->postJson('/api/v1/auth/google', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['google_token']);
    }
}
```

- [ ] **Step 5.2: Rodar para confirmar FAIL**

```bash
php artisan test tests/Feature/Auth/GoogleAuthTest.php
```

Expected: FAIL — classe `GoogleTokenService` não existe.

- [ ] **Step 5.3: Criar GoogleAuthRequest**

Criar `app/Http/Requests/GoogleAuthRequest.php`:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GoogleAuthRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'google_token' => 'required|string',
        ];
    }
}
```

- [ ] **Step 5.4: Criar GoogleTokenService**

Criar `app/Services/Auth/GoogleTokenService.php`:

```php
<?php

namespace App\Services\Auth;

use Illuminate\Support\Facades\Http;

class GoogleTokenService
{
    private const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/tokeninfo';

    /**
     * Verifica o token Google e retorna os dados do usuário ou null se inválido.
     *
     * @return array{sub: string, email: string, name: string, picture: string|null}|null
     */
    public function verify(string $googleToken): ?array
    {
        $response = Http::get(self::GOOGLE_TOKEN_URL, ['id_token' => $googleToken]);

        if ($response->failed()) {
            return null;
        }

        $data = $response->json();

        // Validar que o token não expirou e tem email verificado
        if (
            empty($data['sub']) ||
            empty($data['email']) ||
            ($data['email_verified'] ?? 'false') !== 'true'
        ) {
            return null;
        }

        return [
            'sub'     => $data['sub'],
            'email'   => $data['email'],
            'name'    => $data['name'] ?? $data['email'],
            'picture' => $data['picture'] ?? null,
        ];
    }
}
```

- [ ] **Step 5.5: Atualizar AuthController — implementar googleLogin**

Substituir o método `googleLogin` em `app/Http/Controllers/AuthController.php`:

```php
public function googleLogin(GoogleAuthRequest $request, GoogleTokenService $googleTokenService): \Illuminate\Http\JsonResponse
{
    $googleUser = $googleTokenService->verify($request->google_token);

    if (! $googleUser) {
        return response()->json(['message' => 'Token Google inválido.'], 401);
    }

    $user = User::firstOrCreate(
        ['email' => $googleUser['email']],
        [
            'name'      => $googleUser['name'],
            'google_id' => $googleUser['sub'],
            'avatar'    => $googleUser['picture'],
        ]
    );

    $token = auth('api')->login($user);

    return response()->json(['token' => $token, 'type' => 'bearer']);
}
```

- [ ] **Step 5.6: Rodar testes — devem PASSAR**

```bash
php artisan test tests/Feature/Auth/GoogleAuthTest.php
```

Expected: `PASS  Tests\Feature\Auth\GoogleAuthTest` — 4 tests, 8 assertions.

- [ ] **Step 5.7: Rodar todos os testes de Auth**

```bash
php artisan test tests/Feature/Auth/
```

Expected: 8 tests passing.

- [ ] **Step 5.8: Commit**

```bash
git add app/Services/Auth/ app/Http/Requests/GoogleAuthRequest.php app/Http/Controllers/AuthController.php tests/Feature/Auth/GoogleAuthTest.php
git commit -m "feat: implement POST /v1/auth/google with Google OAuth token verification"
```

---

## Task 6: CombinationGeneratorService

**Files:**
- Create: `api/app/Services/Analysis/CombinationGeneratorService.php`
- Create: `api/tests/Unit/Services/CombinationGeneratorServiceTest.php`

- [ ] **Step 6.1: Escrever teste unitário**

Criar `tests/Unit/Services/CombinationGeneratorServiceTest.php`:

```php
<?php

namespace Tests\Unit\Services;

use App\Services\Analysis\CombinationGeneratorService;
use Tests\TestCase;

class CombinationGeneratorServiceTest extends TestCase
{
    private CombinationGeneratorService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new CombinationGeneratorService();
    }

    public function test_zero_flexibility_returns_single_combination(): void
    {
        $result = $this->service->generate('2026-05-15', '2026-05-22', 0, 0);

        $this->assertCount(1, $result);
        $this->assertEquals('2026-05-15', $result[0]['date_ida']);
        $this->assertEquals('2026-05-22', $result[0]['date_volta']);
    }

    public function test_flexibility_one_returns_nine_combinations(): void
    {
        // (2*1+1) * (2*1+1) = 3 * 3 = 9 combinações
        $result = $this->service->generate('2026-05-15', '2026-05-22', 1, 1);

        $this->assertCount(9, $result);
    }

    public function test_flexibility_seven_returns_correct_count(): void
    {
        // (2*7+1) * (2*7+1) = 15 * 15 = 225 combinações
        $result = $this->service->generate('2026-05-15', '2026-05-30', 7, 7);

        $this->assertCount(225, $result);
    }

    public function test_combinations_exclude_when_volta_before_or_equal_ida(): void
    {
        // Com flex 3 na ida e 0 na volta, pode gerar data_ida > data_volta
        $result = $this->service->generate('2026-05-20', '2026-05-21', 3, 0);

        foreach ($result as $combo) {
            $this->assertLessThan(
                $combo['date_volta'],
                $combo['date_ida'],
                "date_ida deve ser anterior a date_volta"
            );
        }
    }

    public function test_combinations_have_correct_structure(): void
    {
        $result = $this->service->generate('2026-05-15', '2026-05-22', 1, 1);

        foreach ($result as $combo) {
            $this->assertArrayHasKey('date_ida', $combo);
            $this->assertArrayHasKey('date_volta', $combo);
            $this->assertMatchesRegularExpression('/^\d{4}-\d{2}-\d{2}$/', $combo['date_ida']);
            $this->assertMatchesRegularExpression('/^\d{4}-\d{2}-\d{2}$/', $combo['date_volta']);
        }
    }

    public function test_flex_asymmetric(): void
    {
        // (2*2+1) * (2*1+1) = 5 * 3 = 15 combinações (excluindo inválidas)
        $result = $this->service->generate('2026-05-15', '2026-05-22', 2, 1);

        // Máximo seria 15, mas algumas são excluídas quando volta <= ida
        $this->assertLessThanOrEqual(15, count($result));
        $this->assertGreaterThan(0, count($result));
    }
}
```

- [ ] **Step 6.2: Rodar para confirmar FAIL**

```bash
php artisan test tests/Unit/Services/CombinationGeneratorServiceTest.php
```

Expected: FAIL — classe não existe.

- [ ] **Step 6.3: Implementar CombinationGeneratorService**

Criar `app/Services/Analysis/CombinationGeneratorService.php`:

```php
<?php

namespace App\Services\Analysis;

use Carbon\Carbon;

class CombinationGeneratorService
{
    /**
     * Gera todas as combinações de datas baseado na flexibilidade.
     * Total = (2 * flexibility_from + 1) * (2 * flexibility_to + 1)
     * Exclui combinações onde data_volta <= data_ida.
     *
     * @return array<int, array{date_ida: string, date_volta: string}>
     */
    public function generate(
        string $date_from,
        string $date_to,
        int $flexibility_from,
        int $flexibility_to
    ): array {
        $base_ida   = Carbon::parse($date_from);
        $base_volta = Carbon::parse($date_to);
        $combinations = [];

        for ($i = -$flexibility_from; $i <= $flexibility_from; $i++) {
            for ($j = -$flexibility_to; $j <= $flexibility_to; $j++) {
                $ida   = $base_ida->copy()->addDays($i);
                $volta = $base_volta->copy()->addDays($j);

                if ($volta->greaterThan($ida)) {
                    $combinations[] = [
                        'date_ida'   => $ida->toDateString(),
                        'date_volta' => $volta->toDateString(),
                    ];
                }
            }
        }

        return $combinations;
    }
}
```

- [ ] **Step 6.4: Rodar testes — devem PASSAR**

```bash
php artisan test tests/Unit/Services/CombinationGeneratorServiceTest.php
```

Expected: `PASS  Tests\Unit\Services\CombinationGeneratorServiceTest` — 5 tests.

- [ ] **Step 6.5: Commit**

```bash
git add app/Services/Analysis/CombinationGeneratorService.php tests/Unit/Services/CombinationGeneratorServiceTest.php
git commit -m "feat: add CombinationGeneratorService with flexibility logic (2*flex+1)^2"
```

---

## Task 7: BigQueryClientService com Cache Redis

**Files:**
- Create: `api/app/Services/BigQuery/BigQueryClientService.php`

> ⚠️ Este service usa o arquivo de service account JSON do Google. Em ambiente de teste, ele será mockado. Não há teste unitário isolado aqui — o teste de integração está no Task 12.

- [ ] **Step 7.1: Criar BigQueryClientService**

Criar `app/Services/BigQuery/BigQueryClientService.php`:

```php
<?php

namespace App\Services\BigQuery;

use Google\Cloud\BigQuery\BigQueryClient;
use Illuminate\Support\Facades\Cache;

class BigQueryClientService
{
    private BigQueryClient $client;

    public function __construct()
    {
        $saJsonPath = config('bigquery.sa_json_path');
        $keyFile = json_decode(file_get_contents($saJsonPath), true);

        $this->client = new BigQueryClient([
            'projectId' => config('bigquery.project_id'),
            'keyFile'   => $keyFile,
        ]);
    }

    /**
     * Executa uma query no BigQuery com cache Redis.
     *
     * @param  array<string, mixed>  $params  Parâmetros nomeados (@param_name)
     * @param  int  $cacheTtl  TTL em segundos (padrão: 5 minutos)
     * @return array<int, array<string, mixed>>
     */
    public function query(string $sql, array $params = [], int $cacheTtl = 300): array
    {
        $cacheKey = 'bq_' . md5($sql . serialize($params));

        return Cache::remember($cacheKey, $cacheTtl, function () use ($sql, $params) {
            $queryConfig = $this->client->query($sql, ['parameters' => $params]);
            $results     = $this->client->runQuery($queryConfig);

            $rows = [];
            foreach ($results->rows() as $row) {
                $rows[] = iterator_to_array($row);
            }
            return $rows;
        });
    }
}
```

- [ ] **Step 7.2: Confirmar que a classe está correta sem erros de sintaxe**

```bash
php artisan config:clear && php -l app/Services/BigQuery/BigQueryClientService.php
```

Expected: `No syntax errors detected in app/Services/BigQuery/BigQueryClientService.php`

- [ ] **Step 7.3: Commit**

```bash
git add app/Services/BigQuery/BigQueryClientService.php
git commit -m "feat: add BigQueryClientService with Redis cache layer (5min TTL)"
```

---

## Task 8: PriceQueryService — todas as modalidades

**Files:**
- Create: `api/app/Services/BigQuery/PriceQueryService.php`
- Create: `api/tests/Unit/Services/PriceQueryServiceTest.php`

> ⚠️ As queries SQL são suposições. Validar os schemas reais antes de executar em produção.
> Para cada modalidade, execute: `SELECT column_name, data_type FROM dw-onfly-dev.<dataset>.INFORMATION_SCHEMA.COLUMNS WHERE table_name = '<tabela>'`

- [ ] **Step 8.1: Escrever teste unitário com mock do BigQueryClientService**

Criar `tests/Unit/Services/PriceQueryServiceTest.php`:

```php
<?php

namespace Tests\Unit\Services;

use App\Services\BigQuery\BigQueryClientService;
use App\Services\BigQuery\PriceQueryService;
use Mockery;
use Tests\TestCase;

class PriceQueryServiceTest extends TestCase
{
    private PriceQueryService $service;
    private $bigQueryMock;

    protected function setUp(): void
    {
        parent::setUp();
        $this->bigQueryMock = Mockery::mock(BigQueryClientService::class);
        $this->service = new PriceQueryService($this->bigQueryMock);
    }

    public function test_aereo_returns_structured_result_when_found(): void
    {
        $this->bigQueryMock->shouldReceive('query')
            ->once()
            ->andReturn([[
                'price'            => 3950.00,
                'airline'          => 'LATAM',
                'flight_number'    => 'LA8092',
                'duration_minutes' => 540,
            ]]);

        $result = $this->service->aereo('SSA', 'GRU', '2026-05-15', '2026-05-22', 1);

        $this->assertNotEmpty($result);
        $this->assertEquals('2026-05-15', $result['date_ida']);
        $this->assertEquals('2026-05-22', $result['date_volta']);
        $this->assertEquals(3950.00, $result['price']);
        $this->assertEquals('LATAM', $result['airline']);
    }

    public function test_aereo_returns_empty_when_no_results(): void
    {
        $this->bigQueryMock->shouldReceive('query')->once()->andReturn([]);

        $result = $this->service->aereo('SSA', 'GRU', '2026-05-15', '2026-05-22', 1);

        $this->assertEmpty($result);
    }

    public function test_hotel_returns_structured_result(): void
    {
        $this->bigQueryMock->shouldReceive('query')
            ->once()
            ->andReturn([[
                'price'     => 1200.00,
                'hotel_name' => 'Hotel Ibis',
                'stars'      => 3,
            ]]);

        $result = $this->service->hotel('SSA', 'GRU', '2026-05-15', '2026-05-22', 2);

        $this->assertNotEmpty($result);
        $this->assertEquals(1200.00, $result['price']);
        $this->assertEquals('Hotel Ibis', $result['hotel_name']);
    }

    public function test_carro_returns_structured_result(): void
    {
        $this->bigQueryMock->shouldReceive('query')
            ->once()
            ->andReturn([[
                'price'          => 450.00,
                'rental_company' => 'Localiza',
                'car_model'      => 'HB20',
                'category'       => 'economy',
            ]]);

        $result = $this->service->carro('GRU', 'GRU', '2026-05-15', '2026-05-22', 1);

        $this->assertNotEmpty($result);
        $this->assertEquals('Localiza', $result['rental_company']);
    }

    public function test_onibus_returns_structured_result(): void
    {
        $this->bigQueryMock->shouldReceive('query')
            ->once()
            ->andReturn([[
                'price'   => 180.00,
                'company' => 'Cometa',
                'class'   => 'executivo',
            ]]);

        $result = $this->service->onibus('SSA', 'REC', '2026-05-15', '2026-05-22', 1);

        $this->assertNotEmpty($result);
        $this->assertEquals(180.00, $result['price']);
    }
}
```

- [ ] **Step 8.2: Rodar para confirmar FAIL**

```bash
php artisan test tests/Unit/Services/PriceQueryServiceTest.php
```

Expected: FAIL — classe não existe.

- [ ] **Step 8.3: Implementar PriceQueryService**

Criar `app/Services/BigQuery/PriceQueryService.php`:

```php
<?php

namespace App\Services\BigQuery;

class PriceQueryService
{
    public function __construct(private BigQueryClientService $bigQuery) {}

    /**
     * Busca o menor preço de voo para uma combinação de datas.
     *
     * @return array<string, mixed>
     */
    public function aereo(
        string $origin,
        string $destination,
        string $date_ida,
        string $date_volta,
        int $travelers
    ): array {
        $sql = <<<SQL
            SELECT
                MIN(q.total_price)   AS price,
                q.airline,
                q.flight_number,
                q.duration_minutes
            FROM `dw-onfly-dev.v3_quote.flights` q
            WHERE
                q.origin              = @origin
                AND q.destination     = @destination
                AND DATE(q.departure_date) = @date_ida
                AND DATE(q.return_date)    = @date_volta
                AND q.seats_available >= @travelers
                AND q.created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 90 DAY)
            GROUP BY q.airline, q.flight_number, q.duration_minutes
            ORDER BY price ASC
            LIMIT 1
        SQL;

        $rows = $this->bigQuery->query($sql, [
            'origin'      => $origin,
            'destination' => $destination,
            'date_ida'    => $date_ida,
            'date_volta'  => $date_volta,
            'travelers'   => $travelers,
        ]);

        if (empty($rows)) {
            return [];
        }

        return [
            'date_ida'   => $date_ida,
            'date_volta' => $date_volta,
            'price'      => (float) $rows[0]['price'],
            'airline'    => $rows[0]['airline'] ?? 'N/A',
            'origin'     => $origin,
            'destination' => $destination,
            'details'    => [
                'duration_minutes' => $rows[0]['duration_minutes'] ?? null,
                'flight_number'    => $rows[0]['flight_number'] ?? null,
            ],
        ];
    }

    /**
     * Busca o menor preço de hotel para uma combinação de datas.
     *
     * @return array<string, mixed>
     */
    public function hotel(
        string $origin,
        string $destination,
        string $date_ida,
        string $date_volta,
        int $travelers
    ): array {
        $sql = <<<SQL
            SELECT
                MIN(b.total_price) AS price,
                h.name             AS hotel_name,
                h.stars
            FROM `dw-onfly-dev.v3_booking.hotels` h
            JOIN `dw-onfly-dev.v3_booking.bookings` b ON h.booking_id = b.id
            WHERE
                b.destination        = @destination
                AND DATE(b.check_in) = @date_ida
                AND DATE(b.check_out) = @date_volta
                AND b.guests         >= @travelers
                AND b.created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 90 DAY)
            GROUP BY h.name, h.stars
            ORDER BY price ASC
            LIMIT 1
        SQL;

        $rows = $this->bigQuery->query($sql, [
            'destination' => $destination,
            'date_ida'    => $date_ida,
            'date_volta'  => $date_volta,
            'travelers'   => $travelers,
        ]);

        if (empty($rows)) {
            return [];
        }

        return [
            'date_ida'   => $date_ida,
            'date_volta' => $date_volta,
            'price'      => (float) $rows[0]['price'],
            'hotel_name' => $rows[0]['hotel_name'] ?? 'N/A',
            'destination' => $destination,
            'details'    => [
                'stars' => $rows[0]['stars'] ?? null,
            ],
        ];
    }

    /**
     * Busca o menor preço de aluguel de carro para uma combinação de datas.
     *
     * @return array<string, mixed>
     */
    public function carro(
        string $origin,
        string $destination,
        string $date_ida,
        string $date_volta,
        int $travelers
    ): array {
        $sql = <<<SQL
            SELECT
                MIN(q.total_price)  AS price,
                q.rental_company,
                q.car_model,
                q.category
            FROM `dw-onfly-dev.v3_quote.car_rentals` q
            WHERE
                q.pickup_location   = @destination
                AND DATE(q.pickup_date)   = @date_ida
                AND DATE(q.return_date)   = @date_volta
                AND q.created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 90 DAY)
            GROUP BY q.rental_company, q.car_model, q.category
            ORDER BY price ASC
            LIMIT 1
        SQL;

        $rows = $this->bigQuery->query($sql, [
            'destination' => $destination,
            'date_ida'    => $date_ida,
            'date_volta'  => $date_volta,
        ]);

        if (empty($rows)) {
            return [];
        }

        return [
            'date_ida'       => $date_ida,
            'date_volta'     => $date_volta,
            'price'          => (float) $rows[0]['price'],
            'rental_company' => $rows[0]['rental_company'] ?? 'N/A',
            'destination'    => $destination,
            'details'        => [
                'car_model' => $rows[0]['car_model'] ?? null,
                'category'  => $rows[0]['category'] ?? null,
            ],
        ];
    }

    /**
     * Busca o menor preço de ônibus para uma combinação de datas.
     *
     * @return array<string, mixed>
     */
    public function onibus(
        string $origin,
        string $destination,
        string $date_ida,
        string $date_volta,
        int $travelers
    ): array {
        $sql = <<<SQL
            SELECT
                MIN(q.total_price) AS price,
                q.company,
                q.class,
                q.duration_minutes
            FROM `dw-onfly-dev.v3_quote.buses` q
            WHERE
                q.origin             = @origin
                AND q.destination    = @destination
                AND DATE(q.departure_date) = @date_ida
                AND DATE(q.return_date)    = @date_volta
                AND q.seats_available >= @travelers
                AND q.created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 90 DAY)
            GROUP BY q.company, q.class, q.duration_minutes
            ORDER BY price ASC
            LIMIT 1
        SQL;

        $rows = $this->bigQuery->query($sql, [
            'origin'      => $origin,
            'destination' => $destination,
            'date_ida'    => $date_ida,
            'date_volta'  => $date_volta,
            'travelers'   => $travelers,
        ]);

        if (empty($rows)) {
            return [];
        }

        return [
            'date_ida'   => $date_ida,
            'date_volta' => $date_volta,
            'price'      => (float) $rows[0]['price'],
            'company'    => $rows[0]['company'] ?? 'N/A',
            'origin'     => $origin,
            'destination' => $destination,
            'details'    => [
                'class'            => $rows[0]['class'] ?? null,
                'duration_minutes' => $rows[0]['duration_minutes'] ?? null,
            ],
        ];
    }
}
```

- [ ] **Step 8.4: Rodar testes — devem PASSAR**

```bash
php artisan test tests/Unit/Services/PriceQueryServiceTest.php
```

Expected: `PASS  Tests\Unit\Services\PriceQueryServiceTest` — 5 tests.

- [ ] **Step 8.5: Commit**

```bash
git add app/Services/BigQuery/PriceQueryService.php tests/Unit/Services/PriceQueryServiceTest.php
git commit -m "feat: add PriceQueryService with aereo/hotel/carro/onibus BigQuery queries"
```

---

## Task 9: ClaudeInsightService

**Files:**
- Create: `api/app/Services/Insight/ClaudeInsightService.php`
- Create: `api/tests/Unit/Services/ClaudeInsightServiceTest.php`

- [ ] **Step 9.1: Escrever teste unitário (mock HTTP)**

Criar `tests/Unit/Services/ClaudeInsightServiceTest.php`:

```php
<?php

namespace Tests\Unit\Services;

use App\Services\Insight\ClaudeInsightService;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ClaudeInsightServiceTest extends TestCase
{
    private ClaudeInsightService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ClaudeInsightService();
        config(['services.claude.api_key' => 'test-key-123']);
    }

    public function test_generate_returns_claude_insight_text(): void
    {
        Http::fake([
            'api.anthropic.com/*' => Http::response([
                'content' => [
                    ['type' => 'text', 'text' => 'As melhores tarifas são na terça-feira. Reserve com 3 semanas de antecedência para economizar até 20%.'],
                ],
            ], 200),
        ]);

        $top4 = [
            ['date_ida' => '2026-05-13', 'date_volta' => '2026-05-20', 'price' => 3800.00],
            ['date_ida' => '2026-05-15', 'date_volta' => '2026-05-22', 'price' => 3950.00],
            ['date_ida' => '2026-05-14', 'date_volta' => '2026-05-21', 'price' => 4100.00],
            ['date_ida' => '2026-05-16', 'date_volta' => '2026-05-23', 'price' => 4300.00],
        ];

        $result = $this->service->generate('aereo', 'SSA', 'GRU', $top4);

        $this->assertStringContainsString('terça-feira', $result);

        Http::assertSent(function (Request $request) {
            return $request->url() === 'https://api.anthropic.com/v1/messages'
                && $request->hasHeader('x-api-key', 'test-key-123')
                && $request->hasHeader('anthropic-version', '2023-06-01');
        });
    }

    public function test_generate_returns_fallback_on_api_failure(): void
    {
        Http::fake([
            'api.anthropic.com/*' => Http::response([], 500),
        ]);

        $result = $this->service->generate('aereo', 'SSA', 'GRU', []);

        $this->assertEquals('Não foi possível gerar um insight no momento.', $result);
    }

    public function test_generate_sends_correct_prompt_structure(): void
    {
        Http::fake([
            'api.anthropic.com/*' => Http::response([
                'content' => [['type' => 'text', 'text' => 'Insight aqui.']],
            ], 200),
        ]);

        $top4 = [
            ['date_ida' => '2026-05-15', 'date_volta' => '2026-05-22', 'price' => 3950.00],
        ];

        $this->service->generate('aereo', 'SSA', 'GRU', $top4);

        Http::assertSent(function (Request $request) {
            $body = $request->data();
            return $body['model'] === config('services.claude.model')
                && isset($body['messages'][0]['content'])
                && str_contains($body['messages'][0]['content'], 'SSA')
                && str_contains($body['messages'][0]['content'], 'GRU');
        });
    }
}
```

- [ ] **Step 9.2: Rodar para confirmar FAIL**

```bash
php artisan test tests/Unit/Services/ClaudeInsightServiceTest.php
```

Expected: FAIL — classe não existe.

- [ ] **Step 9.3: Implementar ClaudeInsightService**

Criar `app/Services/Insight/ClaudeInsightService.php`:

```php
<?php

namespace App\Services\Insight;

use Illuminate\Support\Facades\Http;

class ClaudeInsightService
{
    /**
     * Gera um insight de viagem usando Claude Sonnet.
     * Retorna máximo 2 frases em pt-BR sobre a melhor combinação.
     */
    public function generate(
        string $modality,
        string $origin,
        string $destination,
        array $top4
    ): string {
        $pricesJson = json_encode(
            array_map(fn ($s) => [
                'data_ida'   => $s['date_ida'],
                'data_volta' => $s['date_volta'],
                'preco'      => $s['price'],
            ], $top4),
            JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE
        );

        $prompt = "Analise as seguintes opções de {$modality} de {$origin} para {$destination}:\n"
            . "{$pricesJson}\n\n"
            . "Gere um insight breve em português brasileiro (máximo 2 frases) sobre a melhor "
            . "combinação de datas e o potencial de economia. Seja direto e útil para o viajante corporativo.";

        $response = Http::withHeaders([
            'x-api-key'         => config('services.claude.api_key'),
            'anthropic-version' => '2023-06-01',
            'content-type'      => 'application/json',
        ])->post(config('services.claude.api_url'), [
            'model'      => config('services.claude.model'),
            'max_tokens' => 150,
            'messages'   => [
                ['role' => 'user', 'content' => $prompt],
            ],
        ]);

        if ($response->failed()) {
            return 'Não foi possível gerar um insight no momento.';
        }

        return $response->json('content.0.text', 'Não foi possível gerar um insight no momento.');
    }
}
```

- [ ] **Step 9.4: Rodar testes — devem PASSAR**

```bash
php artisan test tests/Unit/Services/ClaudeInsightServiceTest.php
```

Expected: `PASS  Tests\Unit\Services\ClaudeInsightServiceTest` — 3 tests.

- [ ] **Step 9.5: Commit**

```bash
git add app/Services/Insight/ClaudeInsightService.php tests/Unit/Services/ClaudeInsightServiceTest.php
git commit -m "feat: add ClaudeInsightService for travel insights via Anthropic API"
```

---

## Task 10: AnalyzeTravelService (Orquestrador)

**Files:**
- Create: `api/app/Services/Analysis/AnalyzeTravelService.php`
- Create: `api/tests/Unit/Services/AnalyzeTravelServiceTest.php`

- [ ] **Step 10.1: Escrever teste unitário**

Criar `tests/Unit/Services/AnalyzeTravelServiceTest.php`:

```php
<?php

namespace Tests\Unit\Services;

use App\Services\Analysis\AnalyzeTravelService;
use App\Services\Analysis\CombinationGeneratorService;
use App\Services\BigQuery\PriceQueryService;
use App\Services\Insight\ClaudeInsightService;
use Mockery;
use Tests\TestCase;

class AnalyzeTravelServiceTest extends TestCase
{
    private AnalyzeTravelService $service;
    private $combinationMock;
    private $priceQueryMock;
    private $claudeMock;

    protected function setUp(): void
    {
        parent::setUp();
        $this->combinationMock = Mockery::mock(CombinationGeneratorService::class);
        $this->priceQueryMock  = Mockery::mock(PriceQueryService::class);
        $this->claudeMock      = Mockery::mock(ClaudeInsightService::class);

        $this->service = new AnalyzeTravelService(
            $this->combinationMock,
            $this->priceQueryMock,
            $this->claudeMock
        );
    }

    public function test_analyze_returns_top4_ordered_by_price(): void
    {
        $this->combinationMock->shouldReceive('generate')->once()->andReturn([
            ['date_ida' => '2026-05-13', 'date_volta' => '2026-05-20'],
            ['date_ida' => '2026-05-15', 'date_volta' => '2026-05-22'],
            ['date_ida' => '2026-05-14', 'date_volta' => '2026-05-21'],
            ['date_ida' => '2026-05-16', 'date_volta' => '2026-05-23'],
            ['date_ida' => '2026-05-17', 'date_volta' => '2026-05-24'],
        ]);

        $this->priceQueryMock->shouldReceive('aereo')->andReturnUsing(function ($o, $d, $ida, $volta) {
            $prices = [
                '2026-05-13' => 3500.00,
                '2026-05-15' => 4000.00,
                '2026-05-14' => 3800.00,
                '2026-05-16' => 4200.00,
                '2026-05-17' => 3650.00,
            ];
            return [
                'date_ida' => $ida, 'date_volta' => $volta,
                'price' => $prices[$ida], 'airline' => 'LATAM',
            ];
        });

        $this->claudeMock->shouldReceive('generate')->once()->andReturn('Melhor tarifa na segunda-feira.');

        $result = $this->service->analyze(
            'aereo', 'SSA', 'GRU',
            '2026-05-15', '2026-05-22', 1, 1, 1
        );

        $this->assertArrayHasKey('suggestions', $result);
        $this->assertArrayHasKey('insight', $result);
        $this->assertCount(4, $result['suggestions']);
        $this->assertEquals(3500.00, $result['suggestions'][0]['price']);
        $this->assertEquals(3650.00, $result['suggestions'][1]['price']);
        $this->assertEquals(3800.00, $result['suggestions'][2]['price']);
        $this->assertEquals(4000.00, $result['suggestions'][3]['price']);
    }

    public function test_analyze_pads_to_4_when_fewer_results(): void
    {
        $this->combinationMock->shouldReceive('generate')->once()->andReturn([
            ['date_ida' => '2026-05-15', 'date_volta' => '2026-05-22'],
            ['date_ida' => '2026-05-16', 'date_volta' => '2026-05-23'],
        ]);

        $this->priceQueryMock->shouldReceive('aereo')->andReturnUsing(function ($o, $d, $ida, $volta) {
            return ['date_ida' => $ida, 'date_volta' => $volta, 'price' => 4000.00, 'airline' => 'GOL'];
        });

        $this->claudeMock->shouldReceive('generate')->once()->andReturn('Insight.');

        $result = $this->service->analyze('aereo', 'SSA', 'GRU', '2026-05-15', '2026-05-22', 0, 0, 1);

        // Com 0 flexibilidade, apenas 1 combinação — deve ser padded para 4
        $this->assertCount(4, $result['suggestions']);
    }

    public function test_analyze_skips_empty_price_results(): void
    {
        $this->combinationMock->shouldReceive('generate')->once()->andReturn([
            ['date_ida' => '2026-05-15', 'date_volta' => '2026-05-22'],
            ['date_ida' => '2026-05-16', 'date_volta' => '2026-05-23'],
        ]);

        // Primeira combinação sem resultado, segunda com resultado
        $this->priceQueryMock->shouldReceive('aereo')
            ->andReturnUsing(function ($o, $d, $ida) {
                return $ida === '2026-05-15' ? [] : ['date_ida' => $ida, 'date_volta' => '2026-05-23', 'price' => 3800.00, 'airline' => 'AZUL'];
            });

        $this->claudeMock->shouldReceive('generate')->once()->andReturn('Insight.');

        $result = $this->service->analyze('aereo', 'SSA', 'GRU', '2026-05-15', '2026-05-22', 0, 0, 1);

        // Apenas 1 resultado real, padded para 4
        $this->assertCount(4, $result['suggestions']);
        foreach ($result['suggestions'] as $suggestion) {
            $this->assertEquals(3800.00, $suggestion['price']);
        }
    }
}
```

- [ ] **Step 10.2: Rodar para confirmar FAIL**

```bash
php artisan test tests/Unit/Services/AnalyzeTravelServiceTest.php
```

Expected: FAIL.

- [ ] **Step 10.3: Implementar AnalyzeTravelService**

Criar `app/Services/Analysis/AnalyzeTravelService.php`:

```php
<?php

namespace App\Services\Analysis;

use App\Services\BigQuery\PriceQueryService;
use App\Services\Insight\ClaudeInsightService;

class AnalyzeTravelService
{
    public function __construct(
        private CombinationGeneratorService $combinationGenerator,
        private PriceQueryService $priceQuery,
        private ClaudeInsightService $claudeInsight
    ) {}

    /**
     * Analisa preços para todas as combinações de datas e retorna top 4 + insight.
     *
     * @return array{suggestions: array<int, array<string, mixed>>, insight: string}
     */
    public function analyze(
        string $modality,
        string $origin,
        string $destination,
        string $date_from,
        string $date_to,
        int $flexibility_from,
        int $flexibility_to,
        int $travelers
    ): array {
        $combinations = $this->combinationGenerator->generate(
            $date_from, $date_to, $flexibility_from, $flexibility_to
        );

        $results = [];
        foreach ($combinations as $combo) {
            $price = $this->priceQuery->{$modality}(
                $origin,
                $destination,
                $combo['date_ida'],
                $combo['date_volta'],
                $travelers
            );

            if (! empty($price)) {
                $results[] = $price;
            }
        }

        // Ordena por preço crescente
        usort($results, fn ($a, $b) => $a['price'] <=> $b['price']);

        // Top 4 — padded com o último resultado se houver menos de 4
        $top4 = array_slice($results, 0, 4);
        if (! empty($results)) {
            while (count($top4) < 4) {
                $top4[] = end($results);
            }
        }

        $insight = $this->claudeInsight->generate($modality, $origin, $destination, $top4);

        return ['suggestions' => $top4, 'insight' => $insight];
    }
}
```

- [ ] **Step 10.4: Rodar testes — devem PASSAR**

```bash
php artisan test tests/Unit/Services/AnalyzeTravelServiceTest.php
```

Expected: `PASS  Tests\Unit\Services\AnalyzeTravelServiceTest` — 3 tests.

- [ ] **Step 10.5: Commit**

```bash
git add app/Services/Analysis/AnalyzeTravelService.php tests/Unit/Services/AnalyzeTravelServiceTest.php
git commit -m "feat: add AnalyzeTravelService orchestrating combinations, BigQuery and Claude insight"
```

---

## Task 11: Endpoint POST /analyze

**Files:**
- Create: `api/app/Http/Requests/AnalyzeRequest.php`
- Create: `api/app/Http/Controllers/AnalyzeController.php`
- Create: `api/tests/Feature/AnalyzeTest.php`

- [ ] **Step 11.1: Escrever teste de feature**

Criar `tests/Feature/AnalyzeTest.php`:

```php
<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\Analysis\AnalyzeTravelService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class AnalyzeTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user  = User::factory()->create();
        $this->token = auth('api')->login($this->user);
    }

    public function test_analyze_returns_top4_and_insight(): void
    {
        $this->mock(AnalyzeTravelService::class, function ($mock) {
            $mock->shouldReceive('analyze')->once()->andReturn([
                'suggestions' => [
                    ['date_ida' => '2026-05-13', 'date_volta' => '2026-05-20', 'price' => 3500.00, 'airline' => 'LATAM'],
                    ['date_ida' => '2026-05-15', 'date_volta' => '2026-05-22', 'price' => 3800.00, 'airline' => 'GOL'],
                    ['date_ida' => '2026-05-14', 'date_volta' => '2026-05-21', 'price' => 4000.00, 'airline' => 'AZUL'],
                    ['date_ida' => '2026-05-16', 'date_volta' => '2026-05-23', 'price' => 4200.00, 'airline' => 'TAP'],
                ],
                'insight' => 'As melhores tarifas são nas terças-feiras. Reserve com antecedência.',
            ]);
        });

        $response = $this->withToken($this->token)->postJson('/api/v1/analyze', [
            'modality'         => 'aereo',
            'origin'           => 'SSA',
            'destination'      => 'GRU',
            'date_from'        => '2026-05-15',
            'date_to'          => '2026-05-22',
            'flexibility_from' => 2,
            'flexibility_to'   => 2,
            'travelers'        => 1,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'suggestions' => [
                        '*' => ['date_ida', 'date_volta', 'price'],
                    ],
                    'insight',
                ],
            ])
            ->assertJsonCount(4, 'data.suggestions');
    }

    public function test_analyze_requires_authentication(): void
    {
        $response = $this->postJson('/api/v1/analyze', [
            'modality' => 'aereo',
        ]);

        $response->assertStatus(401);
    }

    public function test_analyze_validates_modality(): void
    {
        $response = $this->withToken($this->token)->postJson('/api/v1/analyze', [
            'modality'         => 'aviaoInvalido',
            'origin'           => 'SSA',
            'destination'      => 'GRU',
            'date_from'        => '2026-05-15',
            'date_to'          => '2026-05-22',
            'flexibility_from' => 0,
            'flexibility_to'   => 0,
            'travelers'        => 1,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['modality']);
    }

    public function test_analyze_validates_flexibility_range(): void
    {
        $response = $this->withToken($this->token)->postJson('/api/v1/analyze', [
            'modality'         => 'aereo',
            'origin'           => 'SSA',
            'destination'      => 'GRU',
            'date_from'        => '2026-05-15',
            'date_to'          => '2026-05-22',
            'flexibility_from' => 10, // > 7, inválido
            'flexibility_to'   => 0,
            'travelers'        => 1,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['flexibility_from']);
    }

    public function test_analyze_validates_date_to_after_date_from(): void
    {
        $response = $this->withToken($this->token)->postJson('/api/v1/analyze', [
            'modality'         => 'aereo',
            'origin'           => 'SSA',
            'destination'      => 'GRU',
            'date_from'        => '2026-05-22',
            'date_to'          => '2026-05-15', // antes do date_from
            'flexibility_from' => 0,
            'flexibility_to'   => 0,
            'travelers'        => 1,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['date_to']);
    }
}
```

- [ ] **Step 11.2: Rodar para confirmar FAIL**

```bash
php artisan test tests/Feature/AnalyzeTest.php
```

Expected: FAIL — controller não existe.

- [ ] **Step 11.3: Criar AnalyzeRequest**

Criar `app/Http/Requests/AnalyzeRequest.php`:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AnalyzeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'modality'         => 'required|in:aereo,hotel,carro,onibus',
            'origin'           => 'required|string|min:2|max:10',
            'destination'      => 'required|string|min:2|max:10',
            'date_from'        => 'required|date|after_or_equal:today',
            'date_to'          => 'required|date|after:date_from',
            'flexibility_from' => 'required|integer|min:0|max:7',
            'flexibility_to'   => 'required|integer|min:0|max:7',
            'travelers'        => 'required|integer|min:1|max:20',
        ];
    }
}
```

- [ ] **Step 11.4: Criar AnalyzeController**

Criar `app/Http/Controllers/AnalyzeController.php`:

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\AnalyzeRequest;
use App\Services\Analysis\AnalyzeTravelService;

class AnalyzeController extends Controller
{
    public function __construct(private AnalyzeTravelService $analyzeService) {}

    public function analyze(AnalyzeRequest $request): \Illuminate\Http\JsonResponse
    {
        $result = $this->analyzeService->analyze(
            $request->modality,
            $request->origin,
            $request->destination,
            $request->date_from,
            $request->date_to,
            (int) $request->flexibility_from,
            (int) $request->flexibility_to,
            (int) $request->travelers
        );

        return response()->json(['data' => $result]);
    }
}
```

- [ ] **Step 11.5: Rodar testes — devem PASSAR**

```bash
php artisan test tests/Feature/AnalyzeTest.php
```

Expected: `PASS  Tests\Feature\AnalyzeTest` — 5 tests.

- [ ] **Step 11.6: Commit**

```bash
git add app/Http/Requests/AnalyzeRequest.php app/Http/Controllers/AnalyzeController.php tests/Feature/AnalyzeTest.php
git commit -m "feat: implement POST /v1/analyze endpoint with JWT auth and full validation"
```

---

## Task 12: Exception Handler — Respostas JSON padronizadas

**Files:**
- Modify: `api/bootstrap/app.php`

- [ ] **Step 12.1: Escrever teste**

Criar `tests/Feature/ExceptionHandlerTest.php`:

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExceptionHandlerTest extends TestCase
{
    public function test_unauthenticated_returns_401_json(): void
    {
        $response = $this->postJson('/api/v1/analyze', []);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Não autenticado.']);
    }

    public function test_not_found_returns_404_json(): void
    {
        $response = $this->getJson('/api/v1/rota-inexistente');

        $response->assertStatus(404);
    }
}
```

- [ ] **Step 12.2: Rodar para verificar comportamento atual**

```bash
php artisan test tests/Feature/ExceptionHandlerTest.php
```

Expected: test_unauthenticated pode falhar com mensagem diferente de 'Não autenticado.'

- [ ] **Step 12.3: Atualizar `bootstrap/app.php` com handlers de exceção**

Localizar o método `->withExceptions(...)` e substituir pelo bloco completo:

```php
->withExceptions(function (Exceptions $exceptions) {
    $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, \Illuminate\Http\Request $request) {
        if ($request->expectsJson()) {
            return response()->json(['message' => 'Não autenticado.'], 401);
        }
    });

    $exceptions->render(function (\Illuminate\Validation\ValidationException $e, \Illuminate\Http\Request $request) {
        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Dados inválidos.',
                'errors'  => $e->errors(),
            ], 422);
        }
    });

    $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\NotFoundHttpException $e, \Illuminate\Http\Request $request) {
        if ($request->expectsJson()) {
            return response()->json(['message' => 'Recurso não encontrado.'], 404);
        }
    });

    $exceptions->render(function (\Throwable $e, \Illuminate\Http\Request $request) {
        if ($request->expectsJson() && ! app()->isLocal()) {
            return response()->json(['message' => 'Erro interno do servidor.'], 500);
        }
    });
})
```

- [ ] **Step 12.4: Rodar testes — devem PASSAR**

```bash
php artisan test tests/Feature/ExceptionHandlerTest.php
```

Expected: 2 tests passing.

- [ ] **Step 12.5: Rodar todos os testes**

```bash
php artisan test
```

Expected: todos os testes passando (mínimo 30+ assertions).

- [ ] **Step 12.6: Commit final**

```bash
git add bootstrap/app.php tests/Feature/ExceptionHandlerTest.php
git commit -m "feat: add structured JSON error responses for auth, validation and 404 exceptions"
```

---

## Task 13: Verificação Final e Documentação da API

**Files:**
- Create: `api/docs/api.md` (referência dos endpoints)

- [ ] **Step 13.1: Rodar suite de testes completa**

```bash
cd /home/brunotrinchao/projetos/smart-data-advisor/api
php artisan test --coverage-text
```

Expected: cobertura > 80%, todos os testes passando.

- [ ] **Step 13.2: Verificar que Docker Compose sobe corretamente**

```bash
cd /home/brunotrinchao/projetos/smart-data-advisor/api
cp .env.example .env
# Editar .env com os valores corretos
docker compose up -d --build
docker compose exec app php artisan migrate
docker compose ps
```

Expected: todos os containers com status `Up`.

- [ ] **Step 13.3: Smoke test no container**

```bash
curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"naoexiste@onfly.com.br","password":"teste"}' | jq .
```

Expected: `{"message": "Credenciais inválidas."}` com status 401.

- [ ] **Step 13.4: Criar referência de endpoints**

Criar `docs/api.md`:

```markdown
# Smart Data Advisor — API Reference

Base URL: `http://localhost:8080/api/v1`

## POST /auth/login
Autentica com email e senha.

Request:
```json
{ "email": "joao@onfly.com.br", "password": "senha123" }
```

Response 200:
```json
{ "token": "eyJ...", "type": "bearer" }
```

## POST /auth/google
Autentica com token Google OAuth.

Request:
```json
{ "google_token": "eyJ..." }
```

Response 200:
```json
{ "token": "eyJ...", "type": "bearer" }
```

## POST /analyze
Analisa preços por combinações de data. Requer `Authorization: Bearer <token>`.

Request:
```json
{
  "modality": "aereo",
  "origin": "SSA",
  "destination": "GRU",
  "date_from": "2026-05-15",
  "date_to": "2026-05-22",
  "flexibility_from": 2,
  "flexibility_to": 2,
  "travelers": 1
}
```

Response 200:
```json
{
  "data": {
    "suggestions": [
      { "date_ida": "2026-05-13", "date_volta": "2026-05-20", "price": 3500.00, "airline": "LATAM" },
      { "date_ida": "2026-05-15", "date_volta": "2026-05-22", "price": 3800.00, "airline": "GOL" },
      { "date_ida": "2026-05-14", "date_volta": "2026-05-21", "price": 4000.00, "airline": "AZUL" },
      { "date_ida": "2026-05-16", "date_volta": "2026-05-23", "price": 4200.00, "airline": "TAP" }
    ],
    "insight": "As melhores tarifas são na terça-feira. Reserve com 3 semanas de antecedência."
  }
}
```
```

- [ ] **Step 13.5: Commit final**

```bash
git add docs/api.md
git commit -m "docs: add API reference documentation with all endpoints"
```

---

## Resumo

| Task | Componente | Status |
|------|-----------|--------|
| 1 | Docker Compose + Nginx + MySQL + Redis | ⬜ |
| 2 | Bootstrap Laravel 12 + JWT + BigQuery deps | ⬜ |
| 3 | Migration users + User Model (JWTSubject) | ⬜ |
| 4 | POST /auth/login | ⬜ |
| 5 | POST /auth/google | ⬜ |
| 6 | CombinationGeneratorService | ⬜ |
| 7 | BigQueryClientService + Redis cache | ⬜ |
| 8 | PriceQueryService (aereo/hotel/carro/onibus) | ⬜ |
| 9 | ClaudeInsightService | ⬜ |
| 10 | AnalyzeTravelService (orquestrador) | ⬜ |
| 11 | POST /analyze | ⬜ |
| 12 | Exception Handler JSON | ⬜ |
| 13 | Verificação final + docs | ⬜ |

**Variáveis de ambiente obrigatórias antes de rodar:**
- `CLAUDE_API_KEY` — chave da API Anthropic
- `JWT_SECRET` — gerado via `php artisan jwt:secret`
- `GOOGLE_BQ_SA_JSON` — caminho para o JSON da service account Google
- `APP_KEY` — gerado via `php artisan key:generate`
