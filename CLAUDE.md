# Smart Date Advisor — Onfly Hackathon 2026

Chrome Extension that analyzes Onfly's real price history and suggests the cheapest travel date combinations using AI.

## Quick Reference

```bash
cd frontend
npm run dev        # Dev server on :8080
npm run build      # Production build
npm run lint       # ESLint
npm run test       # Vitest (once)
npm run test:watch # Vitest (watch mode)
```

```bash
cd api
php artisan serve  # Laravel API on :8000
```

## Architecture

**Frontend:** React + TypeScript + Vite + Tailwind + shadcn/ui (Chrome Extension Manifest V3 sidebar)
**Backend:** Laravel (PHP) — proxy para Claude API + gateway de viagens

```
frontend/src/
├── components/
│   ├── screens/       # LoginScreen, FormScreen, LoadingScreen, ResultsScreen
│   ├── forms/         # FlightForm, HotelForm, CarForm, BusForm
│   ├── shared/        # Reusable UI (DateInput, ResultCard, BestPickCard, etc.)
│   ├── icons/         # ModalityIcon, OnflyLogo, OnflyLogoSmall
│   └── ui/            # shadcn/ui primitives (40+ components, do NOT edit manually)
├── interfaces/
│   ├── models/        # IFlight, IHotel, ICar, IBus, IUser, ICommon
│   └── services/      # IAuthService, IFlightService, IAnalysisService, etc.
├── services/
│   ├── mockServices/  # Working implementations with simulated delays
│   └── httpServices/  # Stubs — all throw "API not yet connected"
├── hooks/             # useAuth, useModality, useSearch
├── providers/         # ServiceProvider (DI via React Context)
├── constants/         # Modality config, default form values
├── utils/             # formatters, validators, calculations
├── mockDatabase/      # Hardcoded test data (users, flights, hotels, etc.)
└── lib/               # cn() utility (clsx + tailwind-merge)

api/
├── app/Http/Controllers/   # AnalyzeController, AuthController, SearchController
├── app/Services/           # ClaudeService, GatewayService, OnflyAuthService
├── app/Http/Middleware/    # ValidateOnflyToken
└── routes/api.php          # GET /health, POST /auth/login, POST /analyze, GET /search/*
```

## API Endpoints

| Método | Path | Descrição |
|--------|------|-----------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/login` | Login OAuth2 Onfly |
| POST | `/api/analyze` | Análise de datas via Claude AI |
| GET | `/api/search/airports` | Busca aeroportos (aéreo) |
| GET | `/api/search/hotel-cities` | Busca cidades (hotel) |
| GET | `/api/search/car-cities` | Busca cidades (carro) |
| GET | `/api/search/bus-destinations` | Busca terminais (ônibus) |

Spec completa: `docs/openapi.yaml`

## Gateway de Viagens

Base URL: `https://gateway.viagens.dev`

| Modalidade | Endpoint busca destino | Endpoint cotação |
|---|---|---|
| ✈️ Aéreo | `GET /bff/destination/airports?search=` | `POST /bff/quote/create` |
| 🏨 Hotel | `GET /bff/destination/cities/autocomplete?search=` | — |
| 🚗 Carro | `GET /bff/destination/cities?name=` | — |
| 🚌 Ônibus | `GET /bff/destination/bus-destinations?search=` | — |

## Key Patterns

### Service Injection (DI)
All business logic goes through service interfaces. `ServiceProvider.tsx` wires implementations:
- Currently: `AuthMockService`, `FlightMockService`, etc.
- To integrate backend: swap to `AuthHttpService`, `FlightHttpService`, etc.
- Access services via `useServices()` hook anywhere in the tree.

### Naming Conventions
- **Interfaces**: Prefix with `I` → `IFlightService`, `IUser`, `IAnalysisResponse`
- **Components**: PascalCase files → `FlightForm.tsx`, `BestPickCard.tsx`
- **Hooks**: camelCase with `use` prefix → `useAuth.ts`, `useSearch.ts`
- **Services**: `{Name}MockService.ts` / `{Name}HttpService.ts`
- **Models**: `I{Name}.ts` in `interfaces/models/`

### Modalities
```typescript
type Modality = 'aereo' | 'hotel' | 'carro' | 'onibus';
```

### Screen Flow
```
LoginScreen → FormScreen → LoadingScreen → ResultsScreen
                ↑                              │
                └──────── "Edit Search" ───────┘
```

## Styling

- **Tailwind CSS** com tokens Onfly (`tailwind.config.ts`)
- **shadcn/ui** para primitivos
- **DM Sans** (body) / **DM Mono** (preços/datas)
- Cor primária: `#0052CC` | Cor economia: `#00B37E`
- Fixed width: `380px` (Chrome extension sidebar)

## Variáveis de Ambiente (api/.env)

```
CLAUDE_API_KEY=
ONFLY_CLIENT_ID=
ONFLY_CLIENT_SECRET=
ONFLY_API_BASE=https://onfly-dev.viagens.dev
ONFLY_GATEWAY_URL=https://gateway.viagens.dev
TOKEN_DEV=   # Token fixo para dev local (deixe vazio em produção)
```

## Convenções

- PHP: PSR-12, snake_case variáveis, PascalCase classes
- React: componentes funcionais, hooks
- Commits: `feat:` / `fix:` / `chore:`
- Token Chrome: `chrome.storage.local` (nunca localStorage)
- Sem API keys expostas no frontend
