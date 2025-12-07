import { Image, StyleSheet, TouchableOpacity, View, ViewStyle, type ImageStyle, type ImageResizeMode } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AppText } from '@/components/atoms/app-text';
import { useAppTheme } from '@/hooks/use-app-theme';

interface InfoCardProps {
  title: string;
  description?: string;
  image: string;
  variant?: 'standard' | 'overlay';
  onPress?: () => void;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
  imageResizeMode?: ImageResizeMode;
  imageContainerStyle?: ViewStyle;
  imageAspectRatio?: number;
}

export const InfoCard = ({
  title,
  description,
  image,
  variant = 'standard',
  onPress,
  style,
  imageStyle,
  imageResizeMode = 'cover',
  imageContainerStyle,
  imageAspectRatio,
}: InfoCardProps) => {
  const theme = useAppTheme();

  if (variant === 'overlay') {
    return (
      <TouchableOpacity 
        style={[styles.card, styles.overlayCard, { backgroundColor: theme.colors.surface }, style]} 
        onPress={onPress}
        activeOpacity={0.9}
      >
        <Image source={{ uri: image }} style={[styles.overlayImage, imageStyle]} resizeMode={imageResizeMode} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        >
          <AppText style={styles.overlayTitle} numberOfLines={2}>{title}</AppText>
          {description && (
            <AppText style={styles.overlayDescription} numberOfLines={1}>{description}</AppText>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={[styles.card, styles.standardCard, { backgroundColor: theme.colors.surface }, style]} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View
        style={[
          styles.standardImageContainer,
          { backgroundColor: theme.colors.surfaceVariant, aspectRatio: imageAspectRatio ?? 16 / 9 },
          imageContainerStyle,
        ]}
      >
        <Image
          source={{ uri: image }}
          style={[styles.standardImage, imageStyle]}
          resizeMode={imageResizeMode}
        />
      </View>
      <View style={styles.content}>
        <AppText style={styles.title} numberOfLines={1}>{title}</AppText>
        {description && (
          <AppText style={styles.description} numberOfLines={2}>{description}</AppText>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
  },
  standardCard: {
    width: '100%',
  },
  overlayCard: {
    width: '100%',
    height: 180,
  },
  standardImageContainer: {
    width: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  standardImage: {
    width: '100%',
    height: '100%',
  },
  overlayImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingTop: 32,
  },
  overlayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  overlayDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
});
