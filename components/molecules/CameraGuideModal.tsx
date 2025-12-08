import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { AppIcon } from '@/components/atoms/app-icon';
import { AppText } from '@/components/atoms/app-text';
import DimmedModal from '@/components/ui/dimmed-modal';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useT } from 'lingo.dev/react';

type CameraGuideModalProps = {
  visible: boolean;
  onClose: () => void;
  onContinue: () => void;
};

const bulletItems = [
  { icon: 'image-filter-center-focus', key: 'camera.guide.bullet1' },
  { icon: 'white-balance-sunny', key: 'camera.guide.bullet2' },
  { icon: 'crop-free', key: 'camera.guide.bullet3' },
  { icon: 'eye-outline', key: 'camera.guide.bullet4' },
];

export const CameraGuideModal = ({ visible, onClose, onContinue }: CameraGuideModalProps) => {
  const theme = useAppTheme();
  const isDark = theme.mode === 'dark';
  const t = useT();

  return (
    <DimmedModal visible={visible} onRequestClose={onClose} contentStyle={{ backgroundColor: theme.colors.surface }}>
      <LinearGradient
        colors={isDark ? ['#1B2833', '#0F1A24'] : ['#E5F8EF', '#C7F1DE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <AppText style={[styles.title, { color: theme.colors.text }]}>{t('camera.guide.title')}</AppText>
          <TouchableOpacity style={styles.closeButton} onPress={onClose} accessibilityLabel="Close guide">
            <AppIcon name="close" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        <View style={[styles.illustration, { backgroundColor: `${theme.colors.primary}15` }]}>
          <AppIcon name="camera-outline" size={40} color={theme.colors.primary} />
        </View>
      </LinearGradient>

      <View style={[styles.body, { backgroundColor: theme.colors.surface }]}> 
        {bulletItems.map((item) => (
          <View key={item.key} style={styles.bulletRow}>
            <View style={[styles.bulletIcon, { backgroundColor: `${theme.colors.primary}12` }]}>
              <AppIcon name={item.icon as any} size={18} color={theme.colors.primary} />
            </View>
            <AppText style={[styles.bulletText, { color: theme.colors.text }]}>{t(item.key)}</AppText>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.ctaButton, { backgroundColor: theme.colors.primary }]}
        onPress={onContinue}
        accessibilityLabel="Continue to Upload Evidence"
      >
        <AppText style={[styles.ctaText, { color: theme.colors.onPrimary }]}>{t('Continue')}</AppText>
      </TouchableOpacity>
    </DimmedModal>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  illustration: {
    marginTop: 12,
    alignSelf: 'flex-start',
    padding: 12,
    borderRadius: 12,
  },
  body: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bulletIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  ctaButton: {
    marginHorizontal: 20,
    marginBottom: 18,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CameraGuideModal;