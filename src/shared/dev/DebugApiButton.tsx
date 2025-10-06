import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { debugApiPlaceholder } from '../../utils/api/debug';

type Props = {
  label?: string;
  context?: string; // optional tag for logs (e.g., 'Home', 'Drawer', etc.)
};

export default function DebugApiButton({ label = 'PING', context = 'DEBUG'}: Props) {
  const handlePress = () => {
    debugApiPlaceholder(context);
  };

  return (
    <Pressable onPress={handlePress} style={({ pressed }) => [styles.btn, pressed && { opacity: 0.7 }]}>
      <Text style={styles.txt}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: '#111',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  txt: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
