
import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { DashboardMenuItem } from '../components/UserDashboardComponents';
import { AuthState } from '../services/authManager';
import { UserProfile } from '../types';
import {
  EditProfileView,
  AuthSettingsView,
  WalletView,
  TransactionsView,
  SavedChartsView,
  NotificationsView,
  PreferencesView
} from '../components/user_dashboard/UserDashboardViews';
import UserSupport from './support/UserSupport';
import { AuthGate } from '../components/AuthGate';

interface UserDashboardPageProps {
  authState: AuthState;
  onLogout: () => void;
  onLogin: () => void;
  onSignUp: () => void;
  onClose: () => void;
  onLoadProfile: (profile: UserProfile) => void;
  onRevertToOwnChart: () => void;
  loggingOut?: boolean;
}

type DashboardView = 'MAIN' | 'PROFILE' | 'AUTH' | 'WALLET' | 'TRANSACTIONS' | 'CHARTS' | 'PREFERENCES' | 'SUPPORT' | 'NOTIFICATIONS' | 'GUEST_GATE';

const FullScreenPage: React.FC<{ children: React.ReactNode; isOpen: boolean }> = ({ children, isOpen }) => (
  <div
    className={`absolute inset-0 z-[200] bg-ivory-50 dark:bg-[#141413] flex flex-col transition-transform duration-300 ease-out will-change-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
  >
    {children}
  </div>
);

const UserDashboardPage: React.FC<UserDashboardPageProps> = ({ authState, onLogout, onLogin, onSignUp, onClose, onLoadProfile, onRevertToOwnChart, loggingOut }) => {
  const { role, user, isLoggedIn } = authState;
  const [currentView, setCurrentView] = useState<DashboardView>('MAIN');
  const [renderView, setRenderView] = useState<DashboardView>('MAIN');

  useEffect(() => {
    if (currentView !== 'MAIN') {
      setRenderView(currentView);
    } else {
      const t = setTimeout(() => setRenderView('MAIN'), 300);
      return () => clearTimeout(t);
    }
  }, [currentView]);

  const handleProfileLoad = (p: UserProfile) => {
    onLoadProfile(p);
    onClose();
  };

  const handleBack = () => setCurrentView('MAIN');

  // Unified click handler for menu items
  const handleMenuClick = (view: DashboardView) => {
    if (!isLoggedIn && view !== 'SUPPORT' && view !== 'PREFERENCES') {
      setCurrentView('GUEST_GATE');
    } else {
      setCurrentView(view);
    }
  };

  const goToAuth = () => {
    onLogin();
    onClose();
  };

  const goToSignUp = () => {
    onSignUp();
    onClose();
  };

  return (
    <>
      {/* --- Main Dashboard --- */}
      <div className="flex flex-col h-full overflow-y-auto no-scrollbar animate-fade-in">
        <div className="p-6 pb-2">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={onClose}
              className="p-2 -ml-2 text-stone-400 hover:text-charcoal-800 dark:hover:text-ivory-50 transition-colors active:scale-90"
            >
              <Icons.ChevronLeft />
            </button>
            <h2 className="font-serif text-2xl text-charcoal-900 dark:text-ivory-50">Dashboard</h2>
          </div>

          <div className="bg-white dark:bg-[#1c1b19] rounded-[32px] p-6 shadow-sm border border-stone-100 dark:border-[#33312e] mb-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold-400/5 dark:bg-gold-400/10 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
            {isLoggedIn && user ? (
              <div className="relative z-10">
                <div className="w-16 h-16 bg-charcoal-900 dark:bg-gold-500/10 text-gold-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-charcoal-900/10">
                  <span className="text-2xl font-serif">{user.name.charAt(0)}</span>
                </div>
                <h3 className="text-xl font-serif text-charcoal-900 dark:text-ivory-50 mb-1">{user.name}</h3>
                <p className="text-xs text-gold-600 font-bold uppercase tracking-[0.2em] mb-4">
                  Divine Soul
                </p>

                <div className="grid grid-cols-2 gap-y-3 pt-4 border-t border-stone-50 dark:border-[#33312e]">
                  <div>
                    <span className="block text-[9px] uppercase tracking-widest text-stone-400">Place</span>
                    <span className="text-xs font-medium text-charcoal-800 dark:text-stone-300">{user.location ? user.location.split(',')[0] : 'Not Set'}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-widest text-stone-400">DOB</span>
                    <span className="text-xs font-medium text-charcoal-800 dark:text-stone-300">{user.date || 'Not Set'}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-widest text-stone-400">Time</span>
                    <span className="text-xs font-medium text-charcoal-800 dark:text-stone-300">{user.time || 'Not Set'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-stone-50 dark:bg-charcoal-800 text-stone-300 dark:text-stone-500 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                  <Icons.Users />
                </div>
                <h3 className="text-lg font-serif text-charcoal-800 dark:text-ivory-50 mb-1">Guest Traveler</h3>
                <p className="text-xs text-stone-400">Sign in to sync your charts across devices.</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 px-6">
          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 pl-1">Personal</div>
          <DashboardMenuItem icon={<Icons.Users />} label="My Profile" onClick={() => handleMenuClick('PROFILE')} />
          <DashboardMenuItem icon={<Icons.History />} label="Saved Charts" onClick={() => handleMenuClick('CHARTS')} />
          <DashboardMenuItem icon={<div className="font-serif font-bold text-charcoal-900 dark:text-ivory-50">@</div>} label="Login & Security" onClick={() => handleMenuClick('AUTH')} />

          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 mt-8 pl-1">Finance</div>
          <DashboardMenuItem icon={<Icons.Wallet />} label="My Wallet" onClick={() => handleMenuClick('WALLET')} />
          <DashboardMenuItem icon={<div className="font-serif font-bold text-charcoal-900 dark:text-ivory-50">₹</div>} label="Transactions" onClick={() => handleMenuClick('TRANSACTIONS')} />

          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 mt-8 pl-1">Experience</div>
          <DashboardMenuItem
            icon={<div className="relative"><div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></div><Icons.Activity /></div>}
            label="Notifications"
            onClick={() => handleMenuClick('NOTIFICATIONS')}
          />
          <DashboardMenuItem icon={<Icons.Grid />} label="Preferences & Settings" onClick={() => handleMenuClick('PREFERENCES')} />
          <DashboardMenuItem icon={<Icons.Sparkles />} label="Support" onClick={() => handleMenuClick('SUPPORT')} />
        </div>

        <div className="p-6 bg-stone-50/50 dark:bg-[#1c1b19]/50 border-t border-stone-100 dark:border-[#33312e]">
          {!isLoggedIn ? (
            <div className="space-y-3">
              <button
                onClick={goToAuth}
                className="w-full bg-charcoal-900 text-ivory-50 py-4 rounded-xl font-serif text-sm tracking-widest uppercase shadow-xl shadow-charcoal-900/10 active:scale-95 transition-all"
              >
                Sign In
              </button>
            </div>
          ) : (
            <DashboardMenuItem
              icon={<Icons.X />}
              label={loggingOut ? 'Signing Out...' : 'Sign Out'}
              danger
              loading={loggingOut}
              disabled={loggingOut}
              onClick={onLogout}
            />
          )}
        </div>
      </div>

      {/* --- Full Screen Sub-Views --- */}
      <FullScreenPage isOpen={currentView !== 'MAIN'}>
        {renderView === 'GUEST_GATE' && (
          <AuthGate
            title="Dashboard Locked"
            message="To view your profile, saved charts and manage your wallet, please authorize your access."
            onLogin={goToAuth}
            onSignUp={goToSignUp}
            onBack={handleBack}
          />
        )}
        {renderView === 'PROFILE' && user && (
          <EditProfileView user={user} onBack={handleBack} onSave={(u) => { console.log('Update user', u); handleBack(); }} onLogout={onLogout} />
        )}
        {renderView === 'AUTH' && (
          <AuthSettingsView email={authState.email} onBack={handleBack} onLogout={onLogout} />
        )}
        {renderView === 'WALLET' && (
          <WalletView onBack={handleBack} />
        )}
        {renderView === 'TRANSACTIONS' && (
          <TransactionsView onBack={handleBack} />
        )}
        {renderView === 'CHARTS' && (
          <SavedChartsView onBack={handleBack} onLoadProfile={handleProfileLoad} onRevertToOwnChart={onRevertToOwnChart} />
        )}
        {renderView === 'NOTIFICATIONS' && (
          <NotificationsView onBack={handleBack} />
        )}
        {renderView === 'PREFERENCES' && (
          <PreferencesView onBack={handleBack} />
        )}
        {renderView === 'SUPPORT' && (
          <UserSupport onBack={handleBack} />
        )}
      </FullScreenPage>
    </>
  );
};

export default UserDashboardPage;
