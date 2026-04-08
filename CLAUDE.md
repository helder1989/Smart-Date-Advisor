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

## Architecture

**Frontend-only** (React + Vite), with a planned PHP/Laravel backend not yet implemented.
All API integrations are currently stubbed — mock services power the full UX flow.

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
```

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
Each modality has: Form component + SearchParams interface + Result interface + MockService + HttpService + mock data.

### Screen Flow
```
LoginScreen → FormScreen → LoadingScreen → ResultsScreen
                ↑                              │
                └──────── "Edit Search" ───────┘
```
Managed via `useState<ScreenState>` in `App.tsx`.

## Styling

- **Tailwind CSS** with custom Onfly design tokens (see `tailwind.config.ts`)
- **shadcn/ui** for primitives — add new components via `npx shadcn-ui@latest add <name>`
- **DM Sans** (default) / **DM Mono** (monospace for prices/dates)
- Fixed width: `380px` (Chrome extension sidebar constraint)
- Custom animations defined in `index.css`: fadeSlideUp, popIn, flyPlane, etc.

## Testing

- **Unit tests**: Vitest + Testing Library (`src/**/*.{test,spec}.{ts,tsx}`)
- **E2E**: Playwright (configured but minimal coverage)
- Test setup mocks `window.matchMedia` in `src/test/setup.ts`

## Important Notes

- `components/ui/` is the shadcn/ui library — do NOT manually edit these files
- All HTTP services are stubs. The real backend (PHP/Laravel) is not yet built
- The app runs as a Chrome Extension (Manifest V3) — keep bundle size in mind
- Mock credentials: check `mockDatabase/users.ts` for test logins
- Path alias: `@` → `frontend/src/` (configured in vite + tsconfig)
- Language: UI text is in **Portuguese (pt-BR)**

## MCP Integration

The `.claude/onfly-oauth-skill/` contains an MCP server that lets Claude Code authenticate
with the Onfly API. Tools available after connecting: `onfly_connect`, `onfly_auth_status`,
`onfly_list_travels`, `onfly_list_hotel_orders`, `onfly_list_bookings`, flight/hotel search, etc.
