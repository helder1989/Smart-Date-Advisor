import { useState, useCallback, useEffect, useRef } from 'react';
import { ServiceProvider } from './providers/ServiceProvider';
import { useAuth } from './hooks/useAuth';
import { useTripPlanner } from './hooks/useTripPlanner';
import { ScreenState } from './interfaces/models/ICommon';
import { LoginScreen } from './components/screens/LoginScreen';
import { WizardScreen } from './components/screens/WizardScreen';
import { LoadingScreen } from './components/screens/LoadingScreen';
import { ResultsScreen } from './components/screens/ResultsScreen';

function AppContent() {
  const [screen, setScreen] = useState<ScreenState>('login');
  const { user, loading: authLoading, checking, error: authError, login } = useAuth();
  const planner = useTripPlanner();
  const analysisResolvedRef = useRef(false);

  useEffect(() => {
    if (!checking && user) {
      setScreen('wizard');
    }
  }, [checking, user]);

  const handleLogin = useCallback(async (email: string, password: string) => {
    const result = await login(email, password);
    if (result.success) {
      setScreen('wizard');
    }
  }, [login]);

  const handleSubmit = useCallback(async () => {
    analysisResolvedRef.current = false;
    setScreen('loading');

    const response = await planner.submitPlan();
    analysisResolvedRef.current = true;
    // Will transition when loading steps complete
  }, [planner]);

  const handleLoadingComplete = useCallback(() => {
    if (planner.results) {
      setScreen('results');
    }
  }, [planner.results]);

  const handleEditSearch = useCallback(() => {
    planner.reset();
    setScreen('wizard');
  }, [planner]);

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  switch (screen) {
    case 'login':
      return (
        <LoginScreen
          onLogin={handleLogin}
          loading={authLoading}
          error={authError}
        />
      );
    case 'wizard':
      return (
        <WizardScreen
          userInitials={user?.initials || 'U'}
          currentStep={planner.currentStep}
          tripPlan={planner.tripPlan}
          hasSelections={planner.hasSelections}
          loading={planner.loading}
          onTransportChange={planner.setTransport}
          onHotelChange={planner.setHotel}
          onCarChange={planner.setCar}
          onNext={planner.nextStep}
          onPrev={planner.prevStep}
          onSkip={planner.skipStep}
          onSubmit={handleSubmit}
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
      return planner.results ? (
        <ResultsScreen
          userInitials={user?.initials || 'U'}
          response={planner.results}
          tripPlan={planner.tripPlan}
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
