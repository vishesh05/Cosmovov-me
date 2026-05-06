import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';
import { AppView } from '../types';

export const useNativeFeatures = (
  currentView: AppView,
  setView: (view: AppView) => void,
  drawerOpen: boolean,
  setDrawerOpen: (open: boolean) => void
) => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // Configure Status Bar
    const configureStatusBar = async () => {
      try {
        await StatusBar.setStyle({ style: Style.Light });
        await StatusBar.setBackgroundColor({ color: '#ffffff' });
      } catch (err) {
        console.warn('StatusBar configuration failed', err);
      }
    };

    configureStatusBar();

    // Hide Splash Screen once React is ready
    SplashScreen.hide().catch(() => {});

    // Hardware Back Button Handling
    const handleBackButton = async (data: { canGoBack: boolean }) => {
      // 1. If drawer is open, close it
      if (drawerOpen) {
        setDrawerOpen(false);
        return;
      }

      // 2. Map views to their natural "Back" targets
      switch (currentView) {
        case AppView.Today:
        case AppView.Dashboard:
        case AppView.Tools:
        case AppView.Reports:
        case AppView.Splash:
        case AppView.Login:
        case AppView.AdminDashboard:
          // We are on a main tab or root screen. Don't exit, minimize.
          App.minimizeApp();
          break;
        
        case AppView.Chat:
        case AppView.AstrologerProfile:
          setView(AppView.Today);
          break;
        
        case AppView.Dashas:
        case AppView.Kundli:
          setView(AppView.Tools);
          break;
          
        case AppView.ReportDetail:
          setView(AppView.Reports);
          break;

        case AppView.SignUp:
          setView(AppView.Login);
          break;
          
        case AppView.VerifyEmail:
          setView(AppView.Login);
          break;

        case AppView.LiveCall:
        case AppView.LiveChat:
          // Keep user in current view to avoid accidental hangups
          // Typically needs an internal confirmation modal before leaving
          break;

        default:
          App.minimizeApp();
          break;
      }
    };

    App.addListener('backButton', handleBackButton);

    return () => {
      App.removeAllListeners();
    };
  }, [currentView, setView, drawerOpen, setDrawerOpen]);
};
