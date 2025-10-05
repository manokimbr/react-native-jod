import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = { label: string; value: string | number; hint?: string };
export default function MetricBadge({ label, value, hint }: Props) {
  return (
    <View style={styles.box}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  value: { fontSize: 20, fontWeight: '700' },
  label: { marginTop: 4, fontSize: 12, color: '#666' },
  hint: { marginTop: 2, fontSize: 11, color: '#999' },
});
