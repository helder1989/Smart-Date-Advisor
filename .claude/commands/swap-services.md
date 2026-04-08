Switch between mock and HTTP service implementations in ServiceProvider.

## Instructions

The user will specify which direction:
- **"mock"** — switch all services to mock implementations (for development/testing)
- **"http"** — switch all services to HTTP implementations (for real API integration)
- **specific service** — switch only one service (e.g., "auth to http", "flight to mock")

1. Read `frontend/src/providers/ServiceProvider.tsx`

2. For each service to switch:
   - Change the import from `mockServices/` to `httpServices/` (or vice versa)
   - Change the instantiation in the `useMemo` block

3. The services are:
   | Service | Mock | HTTP |
   |---------|------|------|
   | auth | AuthMockService | AuthHttpService |
   | flight | FlightMockService | FlightHttpService |
   | hotel | HotelMockService | HotelHttpService |
   | car | CarMockService | CarHttpService |
   | bus | BusMockService | BusHttpService |
   | analysis | AnalysisMockService | AnalysisHttpService |

4. After swapping, run `npm run build` from `frontend/` to verify no type errors

**Warning**: HTTP services are stubs that throw errors. Only swap to HTTP after implementing the actual HTTP service (use `/project:implement-http-service` first).
