import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { AppIcon, IconName } from '@/components/atoms/app-icon';
import { AppText } from '@/components/atoms/app-text';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { BeneficiaryLoan } from '@/types/entities';

export interface LoanDetailCardProps {
  loan: BeneficiaryLoan;
  status?: string;
  progress?: number;
}

const metaIcons: Record<keyof Pick<BeneficiaryLoan, 'bank' | 'scheme' | 'sanctionDate'>, IconName> = {
  bank: 'bank',
  scheme: 'account-group',
  sanctionDate: 'calendar',
};

export const LoanDetailCard = ({ loan }: LoanDetailCardProps) => {
  const theme = useAppTheme();

  return (
    <LinearGradient
      colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradientShell, { borderRadius: theme.radii.lg + 4 }]}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.card,
            borderRadius: theme.radii.lg,
            ...theme.elevations.card,
          },
        ]}
        accessibilityRole="summary"
      >
        <AppText variant="titleMedium" color="text">
          {loan.scheme}
        </AppText>
        <AppText variant="displayMedium" color="primary" weight="600" style={styles.amount}>
          ₹ {loan.loanAmount.toLocaleString('en-IN')}
        </AppText>
        <View style={styles.metaGrid}>
          <MetaRow icon={metaIcons.bank} label="Bank" value={loan.bank} />
          <MetaRow icon="card-account-phone" label="Loan ID" value={loan.loanId} />
          <MetaRow icon={metaIcons.scheme} label="Beneficiary" value={loan.name} />
          <MetaRow icon={metaIcons.sanctionDate} label="Sanctioned" value={loan.sanctionDate} />
        </View>
        <View style={{ marginTop: 8 }}>
          {/* status badge + progress */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            {/* status shown via small text; consumer can pass status prop */}
            <AppText variant="labelSmall" color="muted">
              {loan.status?.toString() ?? ''}
            </AppText>
          </View>
          {/* optional progress visual */}
          {typeof (loan as any).progress === 'number' ? (
            <View style={{ marginTop: 8 }}>
              {/* If a progress prop exists on loan, render a bar */}
              <View style={{ height: 8, borderRadius: 8, backgroundColor: theme.colors.surfaceVariant }}>
                <View style={{ width: `${(loan as any).progress}%`, height: '100%', backgroundColor: theme.colors.primary }} />
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </LinearGradient>
  );
};

const MetaRow = ({ icon, label, value }: { icon: IconName; label: string; value: string }) => {
  const theme = useAppTheme();
  return (
    <View style={styles.metaRow}>
      <View
        style={[styles.iconBadge, { backgroundColor: theme.colors.primaryContainer }]}
        accessibilityRole="image" aria-label={label}
      >
        <AppIcon name={icon} size={20} color="primary" />
      </View>
      <View style={styles.metaText}>
        <AppText variant="labelSmall" color="muted">
          {label}
        </AppText>
        <AppText variant="bodyMedium" color="text">
          {value}
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gradientShell: {
    padding: 2,
    width: '100%',
  },
  card: {
    padding: 20,
    gap: 12,
  },
  amount: {
    marginTop: -8,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    gap: 12,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaText: {
    flexShrink: 1,
  },
});
