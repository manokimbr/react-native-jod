// src/components/nav/MenuItem.tsx
import React, { useRef } from 'react';
import { Pressable, StyleSheet, Text, View, GestureResponderEvent } from 'react-native';

type Props = {
  label: string;
  hint?: string;
  onPress?: () => void;
  disabled?: boolean;
  testID?: string; // useful in logs & tests
};

export default function MenuItem({ label, hint, onPress, disabled, testID }: Props) {
  // simple debounce to avoid double fires when closing drawers etc.
  const lastPress = useRef(0);

  const stamp = () => new Date().toISOString().slice(11, 23); // HH:MM:SS.mmm

  const handlePressIn = (e: GestureResponderEvent) => {
    console.log(`[${stamp()}] MenuItem<${label}>: onPressIn`, { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY });
  };

  const handlePressOut = () => {
    console.log(`[${stamp()}] MenuItem<${label}>: onPressOut`);
  };

  const handleLongPress = () => {
    console.log(`[${stamp()}] MenuItem<${label}>: onLongPress`);
  };

  const handleFocus = () => {
    console.log(`[${stamp()}] MenuItem<${label}>: onFocus`);
  };

  const handleBlur = () => {
    console.log(`[${stamp()}] MenuItem<${label}>: onBlur`);
  };

  const handlePress = () => {
    const now = Date.now();
    const delta = now - lastPress.current;
    console.log(`[${stamp()}] MenuItem<${label}>: onPress (delta=${delta}ms)`);
    if (delta < 300) {
      console.log(`[${stamp()}] MenuItem<${label}>: press ignored (debounced)`);
      return;
    }
    lastPress.current = now;

    if (disabled) {
      console.log(`[${stamp()}] MenuItem<${label}>: press ignored (disabled=true)`);
      return;
    }

    if (onPress) {
      try {
        console.log(`[${stamp()}] MenuItem<${label}>: calling onPress →`);
        onPress(); // ← THIS is where your parent’s function gets called
        console.log(`[${stamp()}] MenuItem<${label}>: onPress returned ✓`);
      } catch (err) {
        console.log(`[${stamp()}] MenuItem<${label}>: onPress threw`, err);
      }
    } else {
      console.log(`[${stamp()}] MenuItem<${label}>: no onPress provided`);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLongPress={handleLongPress}
      onFocus={handleFocus}
      onBlur={handleBlur}
      disabled={!!disabled}
      hitSlop={8}
      pressRetentionOffset={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID ?? `menu-item-${label}`}
      style={({ pressed }) => [styles.row, pressed && styles.pressed, disabled && styles.disabled]}
    >
      <View style={styles.flex}>
        <Text style={styles.label}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      <Text style={styles.chev}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  pressed: { opacity: 0.6 },
  disabled: { opacity: 0.35 },
  flex: { flex: 1 },
  label: { fontSize: 16, fontWeight: '600' },
  hint: { fontSize: 12, color: '#888', marginTop: 2 },
  chev: { fontSize: 20, marginLeft: 8, color: '#aaa' },
});
