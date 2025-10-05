import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { AppActions, useDevMode } from '../../store/appStore';

type Props = {
  showState?: boolean;                 // show "ON/OFF" next to the label
  label?: string;                      // base label
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  onToggled?: (nextValue: boolean) => void; // callback after toggle
};

export default function DebugGlobalStateButton({
  showState = true,
  label = 'Dev Mode',
  variant = 'solid',
  size = 'md',
  style,
  onToggled,
}: Props) {
  const devMode = useDevMode();

  const onPress = () => {
    AppActions.toggleDevMode();
    const next = !devMode;
    console.log(`[DEV] devMode -> ${next ? 'ON' : 'OFF'}`);
    onToggled?.(next);
  };

  const sz = size === 'sm' ? 36 : size === 'lg' ? 48 : 44;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label} toggle`}
      style={({ pressed }) => [
        styles.base,
        { height: sz, paddingHorizontal: sz / 2 },
        variant === 'solid' && styles.solid,
        variant === 'outline' && styles.outline,
        variant === 'ghost' && styles.ghost,
        pressed && { opacity: 0.7 },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          (variant === 'outline' || variant === 'ghost') && styles.textDark,
        ]}
      >
        {label}
        {showState ? `: ${devMode ? 'ON' : 'OFF'}` : ''}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111',
    borderColor: '#111',
  },
  solid: { backgroundColor: '#111', borderColor: '#111' },
  outline: { backgroundColor: 'transparent', borderColor: '#111' },
  ghost: { backgroundColor: 'transparent', borderColor: 'transparent' },
  text: { color: '#fff', fontWeight: '700' },
  textDark: { color: '#111' },
});
