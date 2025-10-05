import { createStore } from './nanoStore';

export type Theme = 'light' | 'dark';
export type RouteKey = 'home' | 'settings';

type AppState = {
  theme: Theme;
  devMode: boolean;
  lastRoute: RouteKey;
  version: string;
};

const initialState: AppState = {
  theme: 'light',
  devMode: true,
  lastRoute: 'home',
  version: '0.0.1',
};

export const appStore = createStore(initialState);

// Selectors
export const useTheme = () => appStore.useStore(s => s.theme);
export const useDevMode = () => appStore.useStore(s => s.devMode);
export const useLastRoute = () => appStore.useStore(s => s.lastRoute);
export const useVersion = () => appStore.useStore(s => s.version);

// Actions (keep simple, side-effect free)
export const AppActions = {
  setTheme(theme: Theme) {
    appStore.setState({ theme });
  },
  toggleTheme() {
    appStore.setState(s => ({ theme: s.theme === 'light' ? 'dark' : 'light' }));
  },
  setDevMode(devMode: boolean) {
    appStore.setState({ devMode });
  },
  toggleDevMode() {
    appStore.setState(s => ({ devMode: !s.devMode }));
  },
  setLastRoute(key: RouteKey) {
    appStore.setState({ lastRoute: key });
  },
};
