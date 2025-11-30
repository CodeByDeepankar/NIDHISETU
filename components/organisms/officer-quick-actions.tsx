import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { AppIcon } from '@/components/atoms/app-icon';
import { AppText } from '@/components/atoms/app-text';
import { useAppTheme } from '@/hooks/use-app-theme';

interface QuickActionProps {
  label: string;
  icon: React.ComponentProps<typeof AppIcon>['name'];
  onPress: () => void;
}

const QuickActionCard = ({ label, icon, onPress }: QuickActionProps) => {
  const theme = useAppTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} style={styles.cardWrapper}>
      <Animated.View style={[styles.cardContainer, animatedStyle, { shadowColor: theme.colors.primary }]}>
        <LinearGradient
          colors={[theme.colors.gradientStart, theme.colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.iconCircle}>
            <AppIcon name={icon} size={24} color="primary" />
          </View>
          <AppText variant="labelMedium" color="onPrimary" weight="600" style={styles.label}>
            {label}
          </AppText>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
};

interface OfficerQuickActionsProps {
  onAddBeneficiary: () => void;
  onTodaysVisits: () => void;
  onPendingVerification: () => void;
  onOpenMap: () => void;
}

export const OfficerQuickActions = ({
  onAddBeneficiary,
  onTodaysVisits,
  onPendingVerification,
  onOpenMap,
}: OfficerQuickActionsProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <QuickActionCard label="Add Beneficiary" icon="account-plus" onPress={onAddBeneficiary} />
        <QuickActionCard label="Today's Visits" icon="calendar-check" onPress={onTodaysVisits} />
      </View>
      <View style={styles.row}>
        <QuickActionCard label="Pending Verification" icon="clock-outline" onPress={onPendingVerification} />
        <QuickActionCard label="Open Map" icon="map-marker" onPress={onOpenMap} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  cardWrapper: {
    flex: 1,
  },
  cardContainer: {
    borderRadius: 22,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  gradient: {
    padding: 16,
    borderRadius: 22,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    height: 110,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  label: {
    marginTop: 'auto',
  },
});
