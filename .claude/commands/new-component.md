Create a new React component following the project's patterns and conventions.

## Instructions

The user will describe the component they need. Follow these rules:

1. **Determine the right folder**:
   - Full-page views → `frontend/src/components/screens/`
   - Modality-specific forms → `frontend/src/components/forms/`
   - Reusable UI pieces → `frontend/src/components/shared/`
   - Never put custom components in `components/ui/` (that's shadcn/ui only)

2. **Follow naming conventions**:
   - PascalCase file name: `MyComponent.tsx`
   - Props interface at the top of the file: `interface MyComponentProps { ... }`
   - Export as named function component

3. **Follow styling patterns**:
   - Use Tailwind CSS classes (reference `tailwind.config.ts` for Onfly design tokens)
   - Use `cn()` from `@/lib/utils` for conditional classes
   - Use shadcn/ui primitives from `@/components/ui/` when applicable
   - Respect the 380px sidebar width constraint
   - Use DM Sans for text, DM Mono for numbers/prices

4. **Follow data patterns**:
   - Access services via `useServices()` from `@/providers/ServiceProvider`
   - Use existing interfaces from `@/interfaces/models/`
   - UI text must be in Portuguese (pt-BR)

5. **Add animations** if appropriate (reference existing patterns in `index.css`)
