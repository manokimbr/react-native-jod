// src/components/ui/AppBarIcon.tsx
import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

type Props = {
  label?: string;          // fallback text/icon (e.g. "≡")
  onPress?: () => void;
  onLongPress?: () => void;
  size?: number;           // icon font size
  disabled?: boolean;
  testID?: string;
};
export default function AppBarIcon({
  label = '•',
  onPress,
  onLongPress,
  size = 22,
  disabled,
  testID,
}: Props) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      style={({ pressed }) => [styles.base, pressed && { opacity: 0.6 }]}
    >
      <Text style={[styles.text, { fontSize: size }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  text: { fontWeight: '800' },
});
