import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, View, ViewStyle } from 'react-native';

type DimmedModalProps = {
  visible: boolean;
  onRequestClose: () => void;
  children: React.ReactNode;
  contentStyle?: ViewStyle;
};

// Reusable modal with dimmed backdrop and fade + slide-in animation.
export const DimmedModal = ({ visible, onRequestClose, children, contentStyle }: DimmedModalProps) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;
  const [renderPortal, setRenderPortal] = useState(visible);

  const animateTo = useMemo(
    () => ({
      in: Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 7, tension: 80 }),
      ]),
      out: Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 24, duration: 150, useNativeDriver: true }),
      ]),
    }),
    [opacity, translateY]
  );

  useEffect(() => {
    if (visible) {
      setRenderPortal(true);
      animateTo.in.start();
    } else {
      animateTo.out.start(() => setRenderPortal(false));
    }
  }, [visible, animateTo]);

  if (!renderPortal) return null;

  return (
    <Modal transparent visible animationType="none" onRequestClose={onRequestClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onRequestClose}>
          <Animated.View style={[styles.backdrop, { opacity }]} />
        </Pressable>
        <Animated.View style={[styles.contentWrapper, { transform: [{ translateY }] }]}> 
          <View style={[styles.content, contentStyle]}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  contentWrapper: {
    padding: 20,
  },
  content: {
    borderRadius: 20,
    overflow: 'hidden',
  },
});

export default DimmedModal;