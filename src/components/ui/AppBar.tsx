// src/components/ui/AppBar.tsx
import React, { ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  StatusBar,
  useWindowDimensions,
} from 'react-native';

type Props = {
  title: string;
  subtitle?: string;
  left?: ReactNode;   // e.g. <AppBarIcon .../>
  right?: ReactNode;
  height?: number;    // content height (excludes top inset)
};

function useApproxTopInset() {
  const { width, height } = useWindowDimensions();
  if (Platform.OS === 'android') {
    // When StatusBar is translucent, Android draws *behind* the bar.
    // This returns a safe padding to push content below it.
    return StatusBar.currentHeight ?? 0;
  }
  // iOS heuristic: >= 812 in either dimension => notch devices
  const hasNotch = Math.max(width, height) >= 812;
  return hasNotch ? 44 : 20;
}

export default function AppBar({ title, subtitle, left, right, height = 72 }: Props) {
  const topInset = useApproxTopInset();

  return (
    <View style={[styles.wrapper, { paddingTop: topInset }]}>
      <View style={[styles.bar, { height }]}>
        <View style={styles.side}>{left}</View>
        <View style={styles.center}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {!!subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
        </View>
        <View style={styles.side}>{right}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'stretch',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 8 } },
      android: { elevation: 4 },
    }),
  },
  bar: { paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center' },
  side: { width: 64, height: '100%', alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800' },
  subtitle: { marginTop: 2, fontSize: 12, color: '#666' },
});
