import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { AppText } from '@/components/atoms/app-text';
import { useAppTheme } from '@/hooks/use-app-theme';

const { width } = Dimensions.get('window');

interface WaveHeaderProps {
  title: string;
  subtitle?: string;
  height?: number;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const WaveHeader = ({ title, subtitle, height, onBack, rightAction }: WaveHeaderProps) => {
  const theme = useAppTheme();
  return (
    <View style={[styles.headerContainer, height ? { height } : null]}>
      <LinearGradient
        colors={['#008080', '#20B2AA']} // Teal gradient
        style={styles.gradientHeader}
      />
      <View
        pointerEvents="none"
        style={[styles.waveEdgeMask, { backgroundColor: theme.colors.background }]}
      />
      <View style={styles.waveContainer}>
        <Svg height="100" width={width} viewBox="0 0 1440 320" style={styles.wave}>
          <Path
            fill="#F5F5F5"
            d="M0,128L48,138.7C96,149,192,171,288,170.7C384,171,480,149,576,133.3C672,117,768,107,864,112C960,117,1056,139,1152,149.3C1248,160,1344,160,1392,160L1440,160L1440,320L0,320Z"
          />
        </Svg>
      </View>

      <SafeAreaView edges={['top']} style={styles.floatingHeader}>
        <View style={styles.headerContent}>
          {onBack ? (
            <TouchableOpacity onPress={onBack} style={styles.iconButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholderIcon} />
          )}

          <View style={styles.titleStack}>
            <AppText style={styles.headerTitle}>{title}</AppText>
            {subtitle ? <AppText style={styles.headerSubtitle}>{subtitle}</AppText> : null}
          </View>

          <View style={styles.rightAction}>
            {rightAction || <View style={styles.placeholderIcon} />}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 240,
    zIndex: 0,
  },
  gradientHeader: {
    flex: 1,
    paddingBottom: 40,
  },
  waveEdgeMask: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 24,
    zIndex: 0,
  },
  waveContainer: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  wave: {
    width: '100%',
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    textAlign: 'center',
  },
  titleStack: {
    flex: 1,
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    width: 40,
    alignItems: 'center',
  },
  placeholderIcon: {
    width: 40,
  },
  rightAction: {
    width: 40,
    alignItems: 'center',
  },
});
