import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, StyleSheet } from 'react-native';

type Props = {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'solid' | 'outline' | 'ghost';
};

export default function Button({ title, onPress, loading, disabled, variant = 'solid' }: Props) {
  const style = [
    styles.base,
    variant === 'solid' && styles.solid,
    variant === 'outline' && styles.outline,
    variant === 'ghost' && styles.ghost,
    (disabled || loading) && { opacity: 0.6 },
  ];
  return (
    <TouchableOpacity disabled={disabled || loading} onPress={onPress} style={style}>
      {loading ? <ActivityIndicator /> : <Text style={[
        styles.text,
        (variant === 'outline' || variant === 'ghost') && { color: '#111' }
      ]}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  solid: { backgroundColor: '#111', borderColor: '#111' },
  outline: { backgroundColor: 'transparent', borderColor: '#111' },
  ghost: { backgroundColor: 'transparent', borderColor: 'transparent' },
  text: { color: '#fff', fontWeight: '600' },
});
