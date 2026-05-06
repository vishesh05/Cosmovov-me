
import React, { useState, useEffect, useCallback } from 'react';
import LayoutWrapper from './components/LayoutWrapper';
import Loader from './components/Loader';
import { Icons } from './components/Icons';
import { generateBirthChartAnalysis } from './services/geminiService';
import { UserProfile, BirthChartAnalysis, AppView, Astrologer } from './types';

// Page Imports
import Splash from './pages/Splash';
import WelcomeFlow from './pages/WelcomeFlow';
import VerifyEmailPage from './pages/VerifyEmailPage';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Today from './pages/Today';
import KundliView from './pages/Kundli';
import ChatView from './pages/Chat';
import DashaView from './pages/Dasha';
import ToolsView from './pages/Tools';
import Reports from './pages/Reports';
import ReportPage from './pages/ReportPage';
import AstrologerProfilePage from './pages/AstrologerProfilePage';
import LiveChatRoom from './pages/LiveChatRoom';
import LiveCallScreen from './pages/LiveCallScreen';

// Admin Module Imports
import AdminDashboardLayout from './admin_app/pages/AdminDashboardLayout';
import AdminOverviewPage from './admin_app/pages/AdminOverviewPage';
import AdminUsersPage from './admin_app/pages/AdminUsersPage';
import AdminAstrologersPage from './admin_app/pages/AdminAstrologersPage';
import AdminFinancePage from './admin_app/pages/AdminFinancePage';
import AdminSupportPage from './admin_app/pages/AdminSupportPage';

// Dashboard / Auth Imports
import { UserDashboardDrawer } from './components/UserDashboardComponents';
import UserDashboardPage from './pages/UserDashboardPage';
import {
  AuthState,
  getAuthState,
  setAuthState as persistAuthState,
  signOut,
  getUserProfile,
  updateUserProfile,
  getAnalysisCacheKey,
  normalizeDOB
} from './services/auth';
import { supabase } from './services/supabase';
import { CallConfirmationModal } from './components/AstrologerComponents';

import WelcomeScreens from './pages/WelcomeScreens';
import { AuthGate } from './components/AuthGate';
import { ThemeProvider } from './contexts/ThemeContext';


import { useNativeFeatures } from './hooks/useNativeFeatures';

// Check if the cache is valid and contains outer planets
const isCacheValid = (cachedJSON: string) => {
  try {
    const parsed = JSON.parse(cachedJSON);
    if (!parsed || !parsed.planetaryDetails || parsed.planetaryDetails.length === 0) return false;
    
    // Invalidate old caches that do not have Uranus, Neptune, Pluto
    const hasOuterPlanetsInDetails = parsed.planetaryDetails.some((p: any) => p.name === 'Uranus');
    
    // Crucial: also verify it was mapped to the houses (to catch half-upgraded caches)
    const hasOuterPlanetsInHouses = parsed.houses && parsed.houses.some((h: any) => h.planets.includes('Uranus'));
    
    return hasOuterPlanetsInDetails && hasOuterPlanetsInHouses;
  } catch {
    return false;
  }
};

// Synchronously load cached analysis from localStorage for instant boot
const getInitialAnalysis = (): { analysis: BirthChartAnalysis | null; profile: UserProfile | null } => {
  try {
    // 1. Try to load the active profile the user was just looking at (e.g., from a saved chart)
    const storedActiveProfile = localStorage.getItem('astroveda_active_profile');
    if (storedActiveProfile) {
      const activeProfile = JSON.parse(storedActiveProfile);
      if (activeProfile.date && activeProfile.location) {
        const cacheKey = getAnalysisCacheKey(activeProfile);
        const cached = localStorage.getItem(cacheKey);
        if (cached && isCacheValid(cached)) {
          return { analysis: JSON.parse(cached), profile: activeProfile };
        }
      }
    }

    // 2. Fallback to auth owner profile if no specific active profile was saved
    const storedAuth = localStorage.getItem('astroveda_auth_state');
    if (storedAuth) {
      const authData = JSON.parse(storedAuth);
      if (authData.isLoggedIn && authData.user && authData.user.date && authData.user.location) {
        const cacheKey = getAnalysisCacheKey(authData.user);
        const cached = localStorage.getItem(cacheKey);
        if (cached && isCacheValid(cached)) {
          return { analysis: JSON.parse(cached), profile: authData.user };
        }
      }
    }
  } catch (e) {
    console.error('Failed to pre-load cached analysis:', e);
  }
  return { analysis: null, profile: null };
};

const App: React.FC = () => {
  // Pre-load cached data synchronously for instant boot
  const [initialData] = useState(() => getInitialAnalysis());
  
  const [view, setView] = useState<AppView>(AppView.Splash);
  const [profile, setProfile] = useState<UserProfile | null>(initialData.profile);
  const [analysis, setAnalysis] = useState<BirthChartAnalysis | null>(initialData.analysis);
  const [loading, setLoading] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Initialize native features (Capacitor)
  useNativeFeatures(view, setView, drawerOpen, setDrawerOpen);

  // User's OWN personal chart — never changes when switching saved charts
  // The Today page always uses these to avoid recalculation costs
  // Initialize from the same source as analysis/profile to prevent mismatch
  const [userOwnProfile, setUserOwnProfile] = useState<UserProfile | null>(initialData.profile);
  const [userOwnAnalysis, setUserOwnAnalysis] = useState<BirthChartAnalysis | null>(initialData.analysis);

  const [authState, setAuthState] = useState<AuthState>(getAuthState());
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [showGuestToast, setShowGuestToast] = useState(false);
  const [emailToVerify, setEmailToVerify] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const logoutInFlight = React.useRef(false);

  // Astrologer Specific State
  const [selectedAstrologer, setSelectedAstrologer] = useState<Astrologer | null>(null);
  const [showCallModal, setShowCallModal] = useState(false);

  // Reports
  const [currentReportType, setCurrentReportType] = useState<string>('life');

  // Navigation State for Profile
  const [activeProfileSection, setActiveProfileSection] = useState<'MENU' | 'BANKING' | 'PERSONAL'>('MENU');

  useEffect(() => {
    if (authState.isLoggedIn && authState.user && !profile) {
      setProfile(authState.user);
      if (authState.role !== 'admin') {
        if (authState.user.location && authState.user.date && authState.user.time) {
          // Only generate analysis if not already pre-loaded from cache
          if (!analysis) {
            handleOnboardingComplete(authState.user);
          }
        }
      }
    } else if (!authState.isLoggedIn && !profile) {
      setShowGuestToast(true);
    }
  }, [authState.isLoggedIn, authState.user, authState.role, profile]);

  // Keep userOwnAnalysis/Profile in sync when the active profile IS the auth user's own chart
  // This fixes the bug where Today page shows stale data after a fresh sign-up
  useEffect(() => {
    if (analysis && profile) {
      // For guests: always sync since there's only one chart
      // For logged-in users: sync when active profile matches auth user
      const isGuest = authState.role === 'guest';
      const isSameUser = authState.user && profile.name === authState.user.name && profile.date === authState.user.date;
      if (isGuest || isSameUser) {
        setUserOwnAnalysis(analysis);
        setUserOwnProfile(profile);
      }
    }
  }, [analysis, profile, authState.role, authState.user]);

  useEffect(() => {
    if (showGuestToast) {
      const timer = setTimeout(() => setShowGuestToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showGuestToast]);

  // Handle URL Hash Errors (Supabase Redirects)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('error=')) {
      const params = new URLSearchParams(hash.substring(1)); // remove #
      const errorDescription = params.get('error_description');
      const errorCode = params.get('error_code');

      if (errorDescription) {
        // Show alert or toast
        // For now, simpler: alert + redirect to proper view
        console.error("Auth Redirect Error:", errorDescription);

        // If OTP expired, guide user
        if (errorCode === 'otp_expired') {
          alert("Verification Link Expired. Please request a new one.");
          // Ensure we are on Login or Verify view to allow resend.
          // We don't have email state here if new session, but we can send to Login.
          setView(AppView.Login);
        } else {
          alert(`Authentication Error: ${errorDescription.replace(/\+/g, ' ')}`);
        }

        // Clear hash to prevent loops/persistent error
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, []);

  // Supabase Auth Listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth Event:", event);

      if (session) {
        // User is signed in
        // FAST PATH: Try to load from cache using metadata before awaiting DB profile
        const metadataProfile: UserProfile = {
          name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || 'User',
          gender: session.user.user_metadata?.gender || 'other',
          date: normalizeDOB(session.user.user_metadata?.dob),
          time: session.user.user_metadata?.tob || '',
          location: session.user.user_metadata?.place_of_birth || '',
          language: 'en'
        };

        // FAST PATH: Try to load from active profile cache first, then fallback to metadata
        const storedActiveProfile = localStorage.getItem('astroveda_active_profile');
        const activeProfileToUse = storedActiveProfile ? JSON.parse(storedActiveProfile) : metadataProfile;

        if (activeProfileToUse.date && activeProfileToUse.location) {
          const cacheKey = getAnalysisCacheKey(activeProfileToUse);
          const cachedAnalysis = localStorage.getItem(cacheKey);
          if (cachedAnalysis && isCacheValid(cachedAnalysis) && !analysis) {
            console.log("Fast loading Analysis from Cache (Active Profile/Metadata)...");
            setAnalysis(JSON.parse(cachedAnalysis));
            setProfile(activeProfileToUse);
          }
        }

        const { profile: dbProfile, role: dbRole } = await getUserProfile(session.user.id);

        let userProfile = dbProfile || metadataProfile;
        const userRole = dbRole || (session.user.user_metadata.role as AuthState['role']) || 'user';

        setAuthState({
          isLoggedIn: true,
          user: userProfile,
          role: userRole,
          email: session.user.email,
          isLoading: false
        });

        // Auth state is now set. Profile for display comes from DB or metadata.
        // IMPORTANT: Do NOT generate analysis here. handleOnboardingComplete is the
        // single owner of analysis generation to avoid race conditions where metadata
        // (stale) overwrites what the live form just calculated correctly.
        // For returning users, we only load from cache here.
        const profileForChart = storedActiveProfile ? JSON.parse(storedActiveProfile) : userProfile;

        if (profileForChart.date && profileForChart.location && userRole !== 'admin') {
          const cacheKey = getAnalysisCacheKey(profileForChart);
          const cachedAnalysis = localStorage.getItem(cacheKey);

          if (cachedAnalysis && isCacheValid(cachedAnalysis)) {
            // Returning user with valid cache — load it (do NOT regenerate)
            if (!analysis) {
              console.log("Returning user: Loading analysis from cache...");
              setAnalysis(JSON.parse(cachedAnalysis));
              setProfile(profileForChart);
            }
          }
          // If no cache and no analysis: handleOnboardingComplete will generate it,
          // OR the useEffect below will redirect to Onboarding for first-time setup.
        }

        setLoading(false);

      } else {
        // User is signed out, but check if we are in Mock Admin or Guest mode
        const stored = getAuthState();
        if (stored.isLoggedIn && (stored.role === 'admin' || stored.role === 'guest')) {
          console.log(`Keeping ${stored.role === 'admin' ? 'Admin' : 'Guest'} Session`);
          
          // FOR GUESTS: Also need to ensure their analysis is loaded if missing
          if (stored.role === 'guest' && stored.user && !analysis) {
            const cacheKey = getAnalysisCacheKey(stored.user);
            const cachedAnalysis = localStorage.getItem(cacheKey);
            if (cachedAnalysis && isCacheValid(cachedAnalysis)) {
               console.log("Loading Guest Analysis from Cache...");
               setAnalysis(JSON.parse(cachedAnalysis));
            }
          }
          return;
        }

        setAuthState({
          isLoggedIn: false,
          user: null,
          role: 'guest',
          isLoading: false
        });
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Effect to redirect first-time users to Onboarding if profile is incomplete
  useEffect(() => {
    if (authState.isLoggedIn && authState.user && !loading && !analysis && view !== AppView.Onboarding && authState.role === 'user') {
      // Check if critical profile fields are missing (indicating first login)
      if (!authState.user.location || !authState.user.date || !authState.user.time) {
        console.log("Redirecting to Onboarding - Incomplete Profile");
        setView(AppView.Onboarding);
      }
    }
  }, [authState, loading, analysis, view]);

  // NEW: Auto-redirect from Auth pages if already logged in
  useEffect(() => {
    if (authState.isLoggedIn && analysis && (view === AppView.Login || view === AppView.SignUp || view === AppView.VerifyEmail)) {
      const onboardingComplete = localStorage.getItem('onboardingComplete');
      if (!onboardingComplete) {
        console.log("Auto-redirecting new user to WelcomeScreens");
        setView(AppView.WelcomeScreens);
      } else {
        console.log("Auto-redirecting logged in user to Today");
        setView(AppView.Today);
      }
    }
  }, [authState.isLoggedIn, analysis, view]);

  // Handle returning users: profile is complete but no analysis in state (no cache or new device).
  // This runs ONLY when authState has loaded a logged-in user with complete profile
  // and there's no analysis yet (meaning the listener didn't find a cache).
  // Uses handleOnboardingComplete with isSwitchingChart=true so it still checks/uses cache if found.
  useEffect(() => {
    if (
      authState.isLoggedIn &&
      authState.role === 'user' &&
      !authState.isLoading &&
      !analysis &&
      !loading &&
      authState.user?.date &&
      authState.user?.location &&
      view !== AppView.Onboarding &&
      view !== AppView.Splash
    ) {
      console.log("Returning user: No analysis found, generating from profile...");
      handleOnboardingComplete(authState.user, true);
    }
  }, [authState.isLoggedIn, authState.user, authState.isLoading, analysis, loading]);

  const handleOnboardingComplete = async (userProfile: UserProfile, isSwitchingChart = false) => {
    // Save profile to DB first, only if we are not just switching to a saved chart
    if (!isSwitchingChart) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await updateUserProfile(session.user.id, userProfile);
        }
      } catch (err) {
        console.error("Failed to save profile:", err);
      }

      // Save state to localStorage for persistence (especially for guests)
      persistAuthState({
        ...authState,
        isLoggedIn: true,
        user: userProfile,
        isLoading: false
      });
    }

    // Set as active profile locally to proceed
    setProfile(userProfile);
    localStorage.setItem('astroveda_active_profile', JSON.stringify(userProfile));

    const cacheKey = getAnalysisCacheKey(userProfile);
    const cachedAnalysis = localStorage.getItem(cacheKey);

    // For first-time onboarding, ALWAYS recompute from scratch.
    // Reason: the onAuthStateChange listener may have already run concurrently and
    // cached a WRONG analysis (e.g., computed with empty time = today's date).
    // By bypassing the cache here, we guarantee the correct birth data is used.
    // Saved chart switches (isSwitchingChart=true) still use the cache normally.
    const shouldUseCache = isSwitchingChart && cachedAnalysis && isCacheValid(cachedAnalysis);

    if (shouldUseCache) {
      console.log("Loading Analysis from Cache (Chart Switch)...");
      const parsedAnalysis = JSON.parse(cachedAnalysis!);
      setAnalysis(parsedAnalysis);
      setTimeout(() => setView(AppView.Today), 0);
    } else {
      setLoading(true);
      try {
        const result = await generateBirthChartAnalysis(userProfile);
        setAnalysis(result);
        // Overwrite any stale/wrong cache with the fresh correct analysis
        localStorage.setItem(cacheKey, JSON.stringify(result));
        // Store as user's own chart only if this is NOT a saved chart switch
        if (!isSwitchingChart) {
          setUserOwnProfile(userProfile);
          setUserOwnAnalysis(result);
        }
        const onboardingComplete = localStorage.getItem('onboardingComplete');
        if (!isSwitchingChart && !onboardingComplete) setView(AppView.WelcomeScreens);
        else setView(AppView.Today);
      } catch (e) {
        console.error("Chart generation error:", e);
        if (!isSwitchingChart) setView(AppView.Onboarding);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSwitchActiveProfile = (newProfile: UserProfile) => {
    handleOnboardingComplete(newProfile, true);
  };

  // Revert to user's own chart (after deleting a saved chart that was being viewed)
  const handleRevertToOwnChart = () => {
    if (userOwnProfile && userOwnAnalysis) {
      setProfile(userOwnProfile);
      setAnalysis(userOwnAnalysis);
      localStorage.setItem('astroveda_active_profile', JSON.stringify(userOwnProfile));
      console.log('Reverted to own chart:', userOwnProfile.name);
    }
  };

  const handleSplashFinish = useCallback(async () => {
    setTransitioning(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      // For returning users with cached data, skip animation delay
      const hasPreloadedData = analysis !== null;
      if (!hasPreloadedData) {
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        // Minimal delay for smooth transition
        await new Promise(resolve => setTimeout(resolve, 150));
      }

      if (session || (authState.isLoggedIn && authState.role === 'guest')) {
        const onboardingComplete = localStorage.getItem('onboardingComplete');
        // Valid session or guest found!
        if (onboardingComplete) {
            setView(AppView.Today);
        } else if (analysis) {
            setView(AppView.WelcomeScreens);
        } else {
            setView(AppView.Today);
        }
      } else {
        setView(AppView.Login);
      }
    } catch (err) {
      console.error("Failed getting auth session on splash finish", err);
      setView(AppView.Login);
    } finally {
      setTransitioning(false);
    }
  }, [authState.isLoggedIn, authState.role, analysis]);

  const handleLogout = async () => {
    // Guard against multiple rapid taps firing concurrent logout flows
    if (logoutInFlight.current) return;
    logoutInFlight.current = true;
    setLoggingOut(true);

    try {
      // 1. Sign out from Supabase
      await signOut();

      // 2. Wipe ALL app data from localStorage so no residue bleeds into next session.
      //    Only preserve UI preferences (theme) since they are device-level settings.
      const keysToPreserve = new Set(['astroveda_theme', 'astroveda_preferences']);
      const allKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && !keysToPreserve.has(k)) allKeys.push(k);
      }
      allKeys.forEach(k => localStorage.removeItem(k));

      // 3. Reset all in-memory state
      setAuthState({ isLoggedIn: false, user: null, role: 'guest', isLoading: false });
      setProfile(null);
      setAnalysis(null);
      setUserOwnProfile(null);
      setUserOwnAnalysis(null);
      setDrawerOpen(false);

      // 4. Navigate to login
      setView(AppView.Login);
    } finally {
      setLoggingOut(false);
      logoutInFlight.current = false;
    }
  };

  const handleUnifiedLogin = (profile: UserProfile, email: string, role: 'user' | 'astrologer' | 'admin') => {
    // This is primarily called by SignUp success callback now, or legacy calls.
    // Real auth state is handled by the subscription.
    // We can use this to force view transitions if needed.

    if (role === 'admin') {
      const adminState: AuthState = {
        isLoggedIn: true,
        user: profile,
        role: 'admin',
        email: email,
        isLoading: false
      };
      setAuthState(adminState);
      // Persist to local storage to survive refreshes (since we bypass Supabase)
      localStorage.setItem('astroveda_auth_state', JSON.stringify(adminState));
      setView(AppView.AdminDashboard);
      return;
    }

    // For regular users, the listener handles state.
    // We just ensure View is correct.

    handleOnboardingComplete(profile);
    setShowAuthGate(false);
  };

  const handleExploreAsGuest = () => {
    setView(AppView.Onboarding);
  };

  const checkAuthAndNavigate = (viewToGo: AppView, astrologer: Astrologer) => {
    setSelectedAstrologer(astrologer);
    if (!authState.isLoggedIn) {
      setShowAuthGate(true);
      return;
    }
    setView(viewToGo);
  };

  const handleAuthGateLogin = () => {
    setShowAuthGate(false);
    setView(AppView.Login);
  };

  const handleAuthGateSignUp = () => {
    setShowAuthGate(false);
    setView(AppView.SignUp);
  };

  const NavButton: React.FC<{ id: AppView, icon: React.ReactNode, label: string }> = ({ id, icon, label }) => (
    <button
      onClick={() => setView(id)}
      className="flex flex-col items-center gap-1.5 transition-colors duration-200"
    >
      <div className={`transition-colors ${view === id ? 'text-gold-600' : 'text-stone-400'}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-medium tracking-wide ${view === id ? 'text-gold-600' : 'text-stone-400'}`}>
        {label}
      </span>
    </button>
  );

  const hideNavViews = [AppView.Login, AppView.SignUp, AppView.VerifyEmail, AppView.Chat, AppView.Splash, AppView.Onboarding, AppView.AstrologerProfile, AppView.WelcomeScreens, AppView.ReportDetail];

  // Admin View - Full Screen Desktop Mode
  if (view.startsWith('ADMIN_')) {
    return (
      <ThemeProvider>
      <AdminDashboardLayout
        activeView={view}
        onNavigate={setView}
        onLogout={handleLogout}
      >
        {view === AppView.AdminDashboard && <AdminOverviewPage />}
        {view === AppView.AdminUsers && <AdminUsersPage />}
        {view === AppView.AdminAstrologers && <AdminAstrologersPage />}
        {view === AppView.AdminFinance && <AdminFinancePage />}
        {view === AppView.AdminSupport && <AdminSupportPage />}
      </AdminDashboardLayout>
      </ThemeProvider>
    );
  }

  // User / Astrologer App - Mobile Frame Mode
  return (
    <ThemeProvider>
        <LayoutWrapper>
      {showAuthGate ? (
        <AuthGate
          title="Consultation Locked"
          message="To connect with expert astrologers and receive personalized guidance, please sign in to your account."
          onLogin={handleAuthGateLogin}
          onSignUp={handleAuthGateSignUp}
          onBack={() => setShowAuthGate(false)}
        />
      ) : (
          <>
            {view === AppView.Splash ? (
              <div className={`h-full w-full transition-opacity duration-500 ${transitioning ? 'opacity-0' : 'opacity-100'}`}>
                <Splash onFinish={handleSplashFinish} />
              </div>
            ) : loading ? (
              <Loader text="Analyzing Cosmos..." />
            ) : view === AppView.Login || view === AppView.SignUp ? (
              <WelcomeFlow
                onLogin={handleUnifiedLogin}
                onExploreAsGuest={handleExploreAsGuest}
                initialMode={
                  view === AppView.SignUp ? 'signup' : 'landing'
                }
              />
            ) : view === AppView.VerifyEmail ? (
              <VerifyEmailPage
                email={emailToVerify}
                onBackToLogin={() => setView(AppView.Login)}
              />
            ) : view === AppView.Onboarding ? (
            <Onboarding onComplete={handleOnboardingComplete} onBack={() => setView(AppView.Login)} />

          ) : view === AppView.WelcomeScreens ? (
            <WelcomeScreens profile={profile!} analysis={analysis!} onComplete={() => {
                localStorage.setItem('onboardingComplete', 'true');
                setView(AppView.Today);
            }} />
          ) : !analysis && authState.role !== 'admin' && ![AppView.Login, AppView.SignUp, AppView.VerifyEmail, AppView.Splash].includes(view) ? (
            <Loader text="Synchronizing with Cosmos..." />
          ) : (
            <>
              <div className={`flex-1 relative ${[AppView.Chat, AppView.LiveChat, AppView.LiveCall].includes(view) ? 'flex flex-col overflow-hidden' : 'overflow-y-auto no-scrollbar'}`}>
                {view === AppView.Today && (userOwnAnalysis || analysis) && <Today analysis={(userOwnAnalysis || analysis)!} profile={(userOwnProfile || profile)!} onOpenDashboard={() => setDrawerOpen(true)} authState={authState} />}
                {view === AppView.Dashboard && analysis && <Dashboard analysis={analysis} profile={profile!} onOpenDashboard={() => setDrawerOpen(true)} authState={authState} />}
                {view === AppView.Tools && <ToolsView analysis={analysis!} profile={profile!} onNavigate={setView} />}
                {view === AppView.Dashas && analysis && <DashaView analysis={analysis} onBack={() => setView(AppView.Tools)} />}
                {view === AppView.Chat && analysis && <ChatView analysis={analysis} profile={profile!} onBack={() => setView(AppView.Today)} />}
                {view === AppView.Kundli && analysis && <KundliView analysis={analysis} profile={profile!} onBack={() => setView(AppView.Tools)} />}
                {view === AppView.Reports && <Reports onGetReport={(type) => { setCurrentReportType(type); setView(AppView.ReportDetail); }} />}
                {view === AppView.ReportDetail && analysis && <ReportPage reportType={currentReportType} profile={profile!} analysis={analysis} onBack={() => setView(AppView.Reports)} />}
                {view === AppView.AstrologerProfile && selectedAstrologer && <AstrologerProfilePage astrologer={selectedAstrologer} onBack={() => setView(AppView.Today)} onChat={() => checkAuthAndNavigate(AppView.LiveChat, selectedAstrologer)} onCall={() => { if (!authState.isLoggedIn) setShowAuthGate(true); else setShowCallModal(true); }} />}
              </div>

              {!authState.isLoggedIn && !hideNavViews.includes(view) && showGuestToast && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[100] animate-fade-in pointer-events-none transition-all duration-700">
                  <div className="bg-charcoal-900/90 backdrop-blur-md text-gold-400 px-6 py-2.5 rounded-full border border-white/10 shadow-2xl flex items-center gap-3">
                    <div className="w-2 h-2 bg-gold-400 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Sign in for full access</span>
                  </div>
                </div>
              )}

              <UserDashboardDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)}>
              <UserDashboardPage
                  authState={authState}
                  onLogout={handleLogout}
                  loggingOut={loggingOut}
                  onLogin={() => { setView(AppView.Login); setDrawerOpen(false); }}
                  onSignUp={() => { setView(AppView.SignUp); setDrawerOpen(false); }}
                  onClose={() => setDrawerOpen(false)}
                  onLoadProfile={handleSwitchActiveProfile}
                  onRevertToOwnChart={handleRevertToOwnChart}
                />
              </UserDashboardDrawer>

              {showCallModal && selectedAstrologer && <CallConfirmationModal isOpen={showCallModal} astrologer={selectedAstrologer} onClose={() => setShowCallModal(false)} onConfirm={() => { setShowCallModal(false); setView(AppView.LiveCall); }} />}

              {!hideNavViews.includes(view) && (
                <div className="nav-bottom-bar absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-stone-100 pt-3 pb-6 px-8 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] z-20">
                  <div className="flex justify-between items-center max-w-sm mx-auto">
                    <NavButton id={AppView.Today} icon={<Icons.Sun />} label="Today" />
                    <NavButton id={AppView.Dashboard} icon={<Icons.Home />} label="Path" />

                    {/* Central Chat Node */}
                    <div className="relative -top-3">
                      <button
                        onClick={() => setView(AppView.Chat)}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg
                          ${view === AppView.Chat
                            ? 'bg-charcoal-900 text-gold-400 shadow-charcoal-900/20'
                            : 'bg-white border text-charcoal-900 border-stone-200 hover:border-gold-300 hover:text-gold-600'
                          }
                        `}
                      >
                        <Icons.AstroChat className="w-6 h-6" strokeWidth={1.5} />
                      </button>
                      <span className={`absolute -bottom-5 w-full text-center text-[10px] font-medium tracking-wide ${view === AppView.Chat ? 'text-gold-600' : 'text-stone-400'}`}>
                        Ask
                      </span>
                    </div>

                    <NavButton id={AppView.Tools} icon={<Icons.Chart />} label="Tools" />
                    <NavButton id={AppView.Reports} icon={<Icons.Scroll />} label="Reports" />
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
      </LayoutWrapper>
    </ThemeProvider>
  );
};

export default App;
