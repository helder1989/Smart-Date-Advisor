Convert a mock service to a real HTTP service implementation.

## Instructions

The user will specify which service to implement (e.g., "auth", "flight", "hotel", "car", "bus", "analysis").

1. Read the corresponding interface in `frontend/src/interfaces/services/I{Name}Service.ts`
2. Read the current mock implementation in `frontend/src/services/mockServices/{Name}MockService.ts`
3. Read the current HTTP stub in `frontend/src/services/httpServices/{Name}HttpService.ts`
4. Implement the HTTP service following the interface contract:
   - Use axios or fetch for HTTP calls
   - Follow the same return types as the mock service
   - Add proper error handling (try/catch with meaningful error messages)
   - Use the `@` path alias for imports
   - Handle token auth via Authorization header where needed
5. Ask the user for the backend base URL if not already known
6. After implementing, show the user what to change in `ServiceProvider.tsx` to swap the mock for the real service

Keep the mock service intact — both implementations should coexist.
