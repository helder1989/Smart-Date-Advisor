Run all project quality checks and report results.

## Instructions

Run these checks sequentially from the `frontend/` directory:

1. **TypeScript** — `npx tsc --noEmit` (type checking without emitting)
2. **ESLint** — `npm run lint`
3. **Unit tests** — `npm run test`
4. **Build** — `npm run build`

For each step:
- If it passes, note it and move on
- If it fails, show the errors clearly and suggest fixes
- After all checks complete, give a summary of pass/fail status

Do NOT auto-fix issues — present them to the user and ask before making changes.
