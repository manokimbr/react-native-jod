import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Dimensions, Pressable, View, Easing } from 'react-native';

const SCREEN_W = Dimensions.get('window').width;
const DRAWER_W = Math.min(320, Math.round(SCREEN_W * 0.82));

type Props = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Animation duration in ms (panel + overlay). Default 140. */
  duration?: number;

  /** Fired when animation starts/ends (true while animating). */
  onAnimatingChange?: (animating: boolean) => void;
  /** Fired after the drawer finishes opening. */
  onDidOpen?: () => void;
  /** Fired after the drawer finishes closing. */
  onDidClose?: () => void;
};

export default function SideDrawer({
  open,
  onClose,
  children,
  duration = 180,
  onAnimatingChange,
  onDidOpen,
  onDidClose,
}: Props) {
  const x = useRef(new Animated.Value(-DRAWER_W)).current;
  const overlay = useRef(new Animated.Value(0)).current;
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    onAnimatingChange?.(true);

    Animated.parallel([
      Animated.timing(x, {
        toValue: open ? 0 : -DRAWER_W,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(overlay, {
        toValue: open ? 1 : 0,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (!finished) return;
      setIsAnimating(false);
      onAnimatingChange?.(false);
      if (open) onDidOpen?.();
      else onDidClose?.();
    });
  }, [open, duration, onAnimatingChange, onDidOpen, onDidClose, x, overlay]);

  return (
    <View pointerEvents="box-none" style={styles.container}>
      {/* Overlay (captures taps to close) */}
      <Pressable
        onPress={onClose}
        pointerEvents={open ? 'auto' : 'none'}
        style={StyleSheet.absoluteFill}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              opacity: overlay.interpolate({ inputRange: [0, 1], outputRange: [0, 0.25] }),
              backgroundColor: 'black',
            },
          ]}
        />
      </Pressable>

      {/* Drawer panel */}
      <Animated.View
        style={[
          styles.drawer,
          { width: DRAWER_W, transform: [{ translateX: x }] },
        ]}
        // The panel itself still needs to receive touches;
        // we’ll gate its *content* below to avoid mid-animation taps.
        pointerEvents="auto"
      >
        <View pointerEvents={isAnimating ? 'none' : 'auto'}>
          {children}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#eee',
    paddingTop: 12,
    paddingHorizontal: 12,
    zIndex: 10000,
    elevation: 10000,
  },
});
