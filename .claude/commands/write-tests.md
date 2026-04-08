Write unit tests for the specified component, hook, or service.

## Instructions

The user will specify what to test. Follow these patterns:

1. **Test file location**: Same directory as the source, named `{Name}.test.ts(x)`

2. **Test framework**: Vitest + Testing Library (already configured)
   - Globals are enabled: use `describe`, `it`, `expect` without imports
   - For React components: use `@testing-library/react` (render, screen, fireEvent)
   - For hooks: use `@testing-library/react` renderHook
   - For services: test directly, no DOM needed

3. **Test structure**:
   ```typescript
   describe('ComponentName', () => {
     it('should render correctly', () => { ... });
     it('should handle user interaction', () => { ... });
     it('should display error state', () => { ... });
   });
   ```

4. **Mocking services**: When testing components that use `useServices()`, mock the ServiceProvider:
   ```typescript
   import { ServiceProvider } from '@/providers/ServiceProvider';
   // Wrap component in ServiceProvider for tests
   ```

5. **What to test**:
   - Components: rendering, user interactions, conditional displays, error states
   - Hooks: state changes, return values, side effects
   - Services: correct return types, error handling, edge cases
   - Utils: input/output for each function

6. Run the tests after writing: `cd frontend && npm run test`
