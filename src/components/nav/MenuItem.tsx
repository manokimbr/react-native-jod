// src/components/nav/MenuItem.tsx
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { label: string; hint?: string; onPress?: () => void; };
export default function MenuItem({ label, hint, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      <Text style={styles.chev}>›</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  row: { paddingVertical: 14, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f1f1f1' },
  label: { fontSize: 16, fontWeight: '600' },
  hint: { fontSize: 12, color: '#888', marginTop: 2 },
  chev: { fontSize: 20, marginLeft: 8, color: '#aaa' },
});
