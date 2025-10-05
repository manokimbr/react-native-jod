import React from 'react';
import { View, StyleSheet } from 'react-native';
import MetricBadge from '../ui/MetricBadge';

type Item = { label: string; value: string | number; hint?: string };
export default function StatGrid({ items }: { items: Item[] }) {
  return (
    <View style={styles.grid}>
      {items.map((it, idx) => (
        <View key={idx} style={styles.cell}>
          <MetricBadge label={it.label} value={it.value} hint={it.hint} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  cell: { width: '50%', padding: 6 },
});
