// src/app/AppRoot.tsx
import React, { useMemo, useState } from 'react';
import HomePage from '../pages/HomePage';
import SettingsPage from '../pages/SettingsPage';
import AppLayout from './AppLayout';
import type { AppRoute, RouteKey } from './routes';

export default function AppRoot() {
  const routes: AppRoute[] = useMemo(
    () => [
      {
        key: 'home',
        label: 'Home',
        hint: 'Main screen',
        title: 'JOD Playground',
        subtitle: 'React Native • Expo',
        render: () => <HomePage />,
      },
      {
        key: 'settings',
        label: 'Settings',
        hint: 'Preferences',
        title: 'Settings',
        subtitle: 'Personalize your app',
        render: () => <SettingsPage />,
      },
    ],
    []
  );

  const [current, setCurrent] = useState<RouteKey>('home');
  const route = routes.find(r => r.key === current)!;

  return (
    <AppLayout route={route} routes={routes} onNavigate={setCurrent}>
      {route.render()}
    </AppLayout>
  );
}
