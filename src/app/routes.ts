// src/app/routes.ts
import type { ReactNode } from 'react';

export type RouteKey = 'home' | 'settings';

export type AppRoute = {
  key: RouteKey;
  label: string;
  hint?: string;
  title: string;
  subtitle?: string;
  render: () => ReactNode; // returns a screen component
};

export const ROUTE_KEYS: RouteKey[] = ['home', 'settings'];
