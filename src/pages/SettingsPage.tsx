// src/pages/SettingsPage.tsx
import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

export default function SettingsPage() {
  return (
    <View style={styles.box}>
      <Text style={styles.h1}>Settings</Text>
      <Text style={styles.p}>(stub) Configure preferences here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { width: '100%', maxWidth: 520, padding: 16, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee' },
  h1: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  p: { color: '#555' },
});
