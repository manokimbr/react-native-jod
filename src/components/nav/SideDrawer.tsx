// src/components/nav/SideDrawer.tsx
import React, { ReactNode, useEffect, useRef } from 'react';
import { Animated, StyleSheet, Dimensions, Pressable, View, Platform } from 'react-native';

const SCREEN_W = Dimensions.get('window').width;
const DRAWER_W = Math.min(320, Math.round(SCREEN_W * 0.82));

type Props = {
  open: boolean;
  onClose: () => void;
  children: ReactNode; // drawer content
};

export default function SideDrawer({ open, onClose, children }: Props) {
  const x = useRef(new Animated.Value(-DRAWER_W)).current;
  const overlay = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(x, { toValue: open ? 0 : -DRAWER_W, useNativeDriver: true }),
      Animated.timing(overlay, { toValue: open ? 1 : 0, duration: 180, useNativeDriver: true }),
    ]).start();
  }, [open, x, overlay]);

  return (
    // Absolute full-screen layer ABOVE everything else
    <View
      pointerEvents="box-none"
      style={styles.container}
    >
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
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    // Make sure we sit above AppBar (which usually has elevation 4~6)
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

    // Also give the panel its own stacking on Android
    zIndex: 10000,
    elevation: 10000,
  },
});
