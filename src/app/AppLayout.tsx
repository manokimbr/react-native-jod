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
import { AppActions, useDevMode } from '../store/appStore';
import type { AppRoute } from './routes';

type Props = {
  route: AppRoute;
  routes: AppRoute[];
  onNavigate: (key: AppRoute['key']) => void;
  children: ReactNode;
};

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
  const [pendingNavKey, setPendingNavKey] = useState<AppRoute['key'] | null>(null);
  const insets = useApproxInsets();

  const devMode = useDevMode();

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
      <SideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onDidClose={() => {
          // If a nav choice was made while the drawer was open,
          // run it only after the close animation fully completes.
          if (pendingNavKey) {
            const key = pendingNavKey;
            setPendingNavKey(null);
            console.log(`[NAV] navigating to "${key}" after drawer close ✓`);
            onNavigate(key);
          }
        }}
      >
        <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
          <Text style={styles.menuTitle}>Navigation</Text>
          {routes.map((r) => (
            <MenuItem
              key={r.key}
              label={r.label}
              hint={r.hint}
              onPress={() => {
                // Queue navigation and close the drawer.
                // Navigation will run in SideDrawer.onDidClose.
                setPendingNavKey(r.key);
                setDrawerOpen(false);
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
