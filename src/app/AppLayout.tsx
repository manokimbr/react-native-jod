// src/app/AppLayout.tsx
import React, { ReactNode, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Platform,
  StatusBar,
  useWindowDimensions,
} from 'react-native';

import AppBar from '../components/ui/AppBar';
import AppBarIcon from '../components/ui/AppBarIcon';
import SideDrawer from '../components/nav/SideDrawer';
import MenuItem from '../components/nav/MenuItem';
import { AppActions, useDevMode } from '../store/appStore'; // ✅ store integration
import type { AppRoute } from './routes';

type Props = {
  route: AppRoute;
  routes: AppRoute[];
  onNavigate: (key: AppRoute['key']) => void;
  children: ReactNode;
};

// Manual safe insets (no deps)
function useApproxInsets() {
  const { width, height } = useWindowDimensions();
  const isIOS = Platform.OS === 'ios';
  const hasNotch = isIOS && Math.max(width, height) >= 812;
  return {
    top: isIOS ? (hasNotch ? 44 : 20) : StatusBar.currentHeight ?? 0,
    bottom: isIOS ? (hasNotch ? 34 : 0) : 0,
  };
}

export default function AppLayout({ route, routes, onNavigate, children }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const insets = useApproxInsets();

  const devMode = useDevMode(); // subscribe to devMode only

  return (
    <View style={styles.root}>
      <AppBar
        title={route.title}
        subtitle={route.subtitle}
        left={<AppBarIcon label="≡" size={26} onPress={() => setDrawerOpen(true)} />}
        right={
          <AppBarIcon
            label="⚙"
            size={26}
            onPress={() => {
              // Toggle dev mode via global store
              AppActions.toggleDevMode();
              console.log(`[DEV] mode toggled → ${!devMode}`);
            }}
          />
        }
        height={72}
      />

      {/* Main content */}
      <View style={[styles.content, { paddingBottom: insets.bottom }]}>
        {children}
      </View>

      {/* Drawer LAST so it overlays AppBar */}
      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
          <Text style={styles.menuTitle}>Navigation</Text>
          {routes.map((r) => (
            <MenuItem
              key={r.key}
              label={r.label}
              hint={r.hint}
              onPress={() => {
                setDrawerOpen(false);
                onNavigate(r.key);
              }}
            />
          ))}
        </View>
      </SideDrawer>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fafafa' },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
  },
  menuTitle: {
    fontSize: 12,
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
});
