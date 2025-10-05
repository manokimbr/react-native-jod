// src/shared/dev/GlobalStatePanel.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  useTheme,
  useDevMode,
  useLastRoute,
  useVersion,
} from '../../store/appStore';

export default function GlobalStatePanel() {
  const theme = useTheme();
  const devMode = useDevMode();
  const lastRoute = useLastRoute();
  const version = useVersion();

  return (
    <View style={styles.card}>
      <Text style={styles.title}>🧠 Global State</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Theme:</Text>
        <Text style={styles.value}>{theme}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Dev mode:</Text>
        <Text style={[styles.value, devMode ? styles.on : styles.off]}>
          {devMode ? 'ON' : 'OFF'}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Last route:</Text>
        <Text style={styles.value}>{lastRoute}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Version:</Text>
        <Text style={styles.value}>{version}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 520,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 16,
    gap: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    width: 120,
  },
  value: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
    color: '#111',
  },
  on: {
    color: '#0a0',
    fontWeight: '700',
  },
  off: {
    color: '#a00',
    fontWeight: '700',
  },
});
