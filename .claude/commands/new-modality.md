Add a new travel modality to Smart Date Advisor end-to-end.

## Instructions

The user will name the new modality (e.g., "transfer", "cruise"). Create everything needed:

1. **Add to type system** — Update the `Modality` type in `frontend/src/interfaces/models/ICommon.ts`

2. **Create model interface** — `frontend/src/interfaces/models/I{Name}.ts`:
   - `I{Name}SearchParams` extending common patterns
   - `I{Name}Result` extending `ISearchResultBase`
   - Export from the models index if one exists

3. **Create service interface** — `frontend/src/interfaces/services/I{Name}Service.ts`:
   - Follow the same pattern as `IFlightService`

4. **Create mock service** — `frontend/src/services/mockServices/{Name}MockService.ts`:
   - Simulated delay (800-1500ms)
   - Return 4-5 mock results (1 marked `isBestPick`)

5. **Create HTTP stub** — `frontend/src/services/httpServices/{Name}HttpService.ts`:
   - All methods throw "API not yet connected"

6. **Create mock data** — `frontend/src/mockDatabase/{name}s.ts`

7. **Create form component** — `frontend/src/components/forms/{Name}Form.tsx`:
   - Follow existing form patterns (FlightForm, HotelForm)
   - Include appropriate fields, date inputs, flexibility sliders

8. **Create icon** — Add the modality icon to `frontend/src/components/icons/ModalityIcon.tsx`

9. **Wire up**:
   - Add to `MODALITY_CONFIG` in `frontend/src/constants/modalities.ts`
   - Add defaults in `frontend/src/constants/defaults.ts`
   - Register in `ServiceProvider.tsx` (mock service + interface)
   - Add form rendering case in `FormScreen.tsx`
   - Add mock insight in `mockDatabase/insights.ts`
   - Update `IAnalysisRequest`/`IAnalysisResponse` union types if needed

10. **Verify** — Run `npm run build` from `frontend/` to check for type errors
