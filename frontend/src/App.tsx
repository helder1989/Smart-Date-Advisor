import { useState, useCallback, useRef } from 'react';
import { ServiceProvider } from './providers/ServiceProvider';
import { useAuth } from './hooks/useAuth';
import { useModality } from './hooks/useModality';
import { useSearch } from './hooks/useSearch';
import { ScreenState, Modality } from './interfaces/models/ICommon';
import { IFlightSearchParams } from './interfaces/models/IFlight';
import { IHotelSearchParams } from './interfaces/models/IHotel';
import { ICarSearchParams } from './interfaces/models/ICar';
import { IBusSearchParams } from './interfaces/models/IBus';
import { LoginScreen } from './components/screens/LoginScreen';
import { FormScreen } from './components/screens/FormScreen';
import { LoadingScreen } from './components/screens/LoadingScreen';
import { ResultsScreen } from './components/screens/ResultsScreen';

type SearchParams = IFlightSearchParams | IHotelSearchParams | ICarSearchParams | IBusSearchParams;

function AppContent() {
  const [screen, setScreen] = useState<ScreenState>('login');
  const { user, loading: authLoading, error: authError, login } = useAuth();
  const { modality, changeModality } = useModality();
  const { loading: searchLoading, results, submit, reset } = useSearch();
  const lastSearchParams = useRef<SearchParams | null>(null);
  const analysisResolvedRef = useRef(false);

  const handleLogin = useCallback(async (email: string, password: string) => {
    const result = await login(email, password);
    if (result.success) {
      setScreen('form');
    }
  }, [login]);

  const handleSubmit = useCallback(async (mod: Modality, params: SearchParams) => {
    lastSearchParams.current = params;
    analysisResolvedRef.current = false;
    setScreen('loading');

    const response = await submit(mod, params);
    analysisResolvedRef.current = true;
    if (response) {
      // Will transition when loading steps complete
    }
  }, [submit]);

  const handleLoadingComplete = useCallback(() => {
    if (results) {
      setScreen('results');
    }
  }, [results]);

  const handleEditSearch = useCallback(() => {
    reset();
    setScreen('form');
  }, [reset]);

  switch (screen) {
    case 'login':
      return (
        <LoginScreen
          onLogin={handleLogin}
          loading={authLoading}
          error={authError}
        />
      );
    case 'form':
      return (
        <FormScreen
          userInitials={user?.initials || 'U'}
          modality={modality}
          onModalityChange={changeModality}
          onSubmit={handleSubmit}
          loading={searchLoading}
        />
      );
    case 'loading':
      return (
        <LoadingScreen
          userInitials={user?.initials || 'U'}
          onComplete={handleLoadingComplete}
        />
      );
    case 'results':
      return results && lastSearchParams.current ? (
        <ResultsScreen
          userInitials={user?.initials || 'U'}
          response={results}
          searchParams={lastSearchParams.current}
          onEditSearch={handleEditSearch}
        />
      ) : null;
  }
}

function App() {
  return (
    <ServiceProvider>
      <div className="sidebar-panel bg-background">
        <AppContent />
      </div>
    </ServiceProvider>
  );
}

export default App;
