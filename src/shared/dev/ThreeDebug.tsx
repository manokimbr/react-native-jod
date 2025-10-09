// shared/dev/ThreeDebug.tsx
import React, { useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  PixelRatio,
  LayoutChangeEvent,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { GLView } from 'expo-gl';
import type { ExpoWebGLRenderingContext } from 'expo-gl';
import * as THREE from 'three';

type Props = {
  /** Canvas height in dp (default 260) */
  height?: number;
  /** Outer wrapper style: margins, etc. */
  style?: StyleProp<ViewStyle>;
  /** Background color of the GL surface (default '#0b1020') */
  backgroundColor?: string;
  /** Corner radius for the canvas (default 16) */
  borderRadius?: number;
  /** MSAA samples (Android/iOS support varies) */
  msaaSamples?: number;
};

export default function ThreeDebug({
  height = 260,
  style,
  backgroundColor = '#0b1020',
  borderRadius = 16,
  msaaSamples = 0,
}: Props) {
  const sizeRef = useRef({ width: 0, height });

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height: h } = e.nativeEvent.layout;
    sizeRef.current = { width, height: h };
  }, []);

  const onContextCreate = useCallback(async (gl: ExpoWebGLRenderingContext) => {
    const pixelRatio = Math.max(1, PixelRatio.get());

    // Minimal canvas stub for Three (RN has no DOM canvas)
    const canvas = {
      width: gl.drawingBufferWidth || 1,
      height: gl.drawingBufferHeight || 1,
      style: {},
      clientWidth: gl.drawingBufferWidth || 1,
      clientHeight: gl.drawingBufferHeight || 1,
      addEventListener: () => {},
      removeEventListener: () => {},
      // @ts-ignore
      getContext: (_: string) => gl as unknown as WebGLRenderingContext,
    } as unknown as HTMLCanvasElement;

    // @ts-expect-error: keep a ref for libs peeking at gl.canvas
    gl.canvas = canvas;

    // Three renderer (no expo-three)
    const renderer = new THREE.WebGLRenderer({
      context: gl as unknown as WebGLRenderingContext,
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(pixelRatio);
    renderer.setClearColor(new THREE.Color(backgroundColor), 1);

    const initialW =
      gl.drawingBufferWidth || Math.max(1, Math.floor(sizeRef.current.width * pixelRatio));
    const initialH =
      gl.drawingBufferHeight || Math.max(1, Math.floor(sizeRef.current.height * pixelRatio));

    renderer.setSize(initialW, initialH, false);
    gl.viewport(0, 0, initialW, initialH);
    (canvas as any).width = initialW;
    (canvas as any).height = initialH;
    (canvas as any).clientWidth = initialW;
    (canvas as any).clientHeight = initialH;

    // Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, initialW / initialH, 0.01, 100);
    camera.position.z = 2.2;
    camera.lookAt(0, 0, 0);

    // Cube (no lights required)
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshNormalMaterial()
    );
    scene.add(cube);

    // Render loop with adaptive resize
    let frameId: number | null = null;
    let t = 0;

    const animate = () => {
      // Resize to wrapper
      const targetW = Math.max(1, Math.floor(sizeRef.current.width * pixelRatio));
      const targetH = Math.max(1, Math.floor(sizeRef.current.height * pixelRatio));
      if (targetW > 1 && targetH > 1) {
        const cur = renderer.getSize(new THREE.Vector2());
        if (Math.abs(cur.x - targetW) > 1 || Math.abs(cur.y - targetH) > 1) {
          renderer.setSize(targetW, targetH, false);
          camera.aspect = targetW / targetH;
          camera.updateProjectionMatrix();
          gl.viewport(0, 0, targetW, targetH);
          (canvas as any).width = targetW;
          (canvas as any).height = targetH;
          (canvas as any).clientWidth = targetW;
          (canvas as any).clientHeight = targetH;
        }
      }

      // Float + rotate
      t += 0.016;
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.013;
      cube.position.y = Math.sin(t) * 0.2;

      renderer.render(scene, camera);
      gl.endFrameEXP();
      frameId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      cube.geometry.dispose();
      (cube.material as THREE.Material).dispose();
      renderer.dispose();
    };
  }, [backgroundColor]);

  return (
    <View
      style={[
        styles.wrapper,
        { height, borderRadius, overflow: 'hidden' }, // rounded corners & clipping
        style,
      ]}
      onLayout={onLayout}
    >
      <GLView
        style={[StyleSheet.absoluteFill, { backgroundColor }]}
        onContextCreate={onContextCreate}
        msaaSamples={msaaSamples} // 0/2/4/8 depending on device
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    // some pleasant default spacing
    marginTop: 12,
    marginBottom: 12,
  },
});
