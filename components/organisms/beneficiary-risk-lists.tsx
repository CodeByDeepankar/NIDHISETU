import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/atoms/app-button';
import { AppText } from '@/components/atoms/app-text';
import type { ColorToken } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

export type LoanItem = {
  id: string;
  name: string;
  address: string;
  category: string;
  loanId: string;
  bank: string;
  status: 'High Risk' | 'Pending' | 'Deadline Crossed' | string;
  assignedTo: string;
  documents: number;
  lastUpdated: string;
};

export type BeneficiaryRiskListsProps = {
  onViewDetails?: (loan: LoanItem) => void;
  highRiskData?: LoanItem[];
  pendingReviewData?: LoanItem[];
  deadlineCrossedData?: LoanItem[];
};

export const highRiskLoans: LoanItem[] = [
  {
    id: 'HR001',
    name: 'Ramesh Kumar',
    address: 'MG Road',
    category: 'High Risk',
    loanId: 'LN-98234',
    bank: 'SBI',
    status: 'High Risk',
    assignedTo: 'Officer A',
    documents: 2,
    lastUpdated: '2 hours ago',
  },
  {
    id: 'HR002',
    name: 'Neha Verma',
    address: 'Brigade Road',
    category: 'High Risk',
    loanId: 'LN-98299',
    bank: 'HDFC',
    status: 'High Risk',
    assignedTo: 'Officer D',
    documents: 3,
    lastUpdated: '30 mins ago',
  },
  {
    id: 'HR003',
    name: 'Manaswini Patro',
    address: 'Jayadev Vihar',
    category: 'High Priority',
    loanId: '9981345206',
    bank: 'Canara Bank',
    status: 'High Priority',
    assignedTo: 'Officer G',
    documents: 1,
    lastUpdated: '45 mins ago',
  },
];

export const pendingReviewLoans: LoanItem[] = [
  {
    id: 'PR005',
    name: 'Swastik Kumar Purohit',
    address: 'Danish Nagar',
    category: 'Normal',
    loanId: '9861510432',
    bank: 'Punjab Bank',
    status: 'Synced',
    assignedTo: 'Officer B',
    documents: 0,
    lastUpdated: 'Just now',
  },
  {
    id: 'PR006',
    name: 'Kavita Joshi',
    address: 'Civil Lines',
    category: 'Normal',
    loanId: 'LN-11229',
    bank: 'Axis Bank',
    status: 'Pending',
    assignedTo: 'Officer E',
    documents: 1,
    lastUpdated: '15 mins ago',
  },
  {
    id: 'PR007',
    name: 'Aarav Mishra',
    address: 'Shivaji Nagar',
    category: 'Normal',
    loanId: '7345129081',
    bank: 'Bank of Baroda',
    status: 'Pending',
    assignedTo: 'Officer H',
    documents: 2,
    lastUpdated: '10 mins ago',
  },
  {
    id: 'PR008',
    name: 'Sonal Tiwari',
    address: 'Saket Nagar',
    category: 'Normal',
    loanId: '9034572211',
    bank: 'SBI',
    status: 'Approved',
    assignedTo: 'Officer I',
    documents: 3,
    lastUpdated: '1 hour ago',
  },
  {
    id: 'PR009',
    name: 'Rahul Patra',
    address: 'Old Town',
    category: 'Normal',
    loanId: '8023114455',
    bank: 'ICICI',
    status: 'Rejected',
    assignedTo: 'Officer J',
    documents: 1,
    lastUpdated: '2 hours ago',
  },
];

export const deadlineCrossedLoans: LoanItem[] = [
  {
    id: 'DC010',
    name: 'Anita Sharma',
    address: 'Sector 12',
    category: 'Overdue',
    loanId: 'LN-77331',
    bank: 'BOI',
    status: 'Deadline Crossed',
    assignedTo: 'Officer C',
    documents: 1,
    lastUpdated: '1 day ago',
  },
  {
    id: 'DC011',
    name: 'Vikram Singh',
    address: 'Ring Road',
    category: 'Overdue',
    loanId: 'LN-77345',
    bank: 'ICICI',
    status: 'Deadline Crossed',
    assignedTo: 'Officer F',
    documents: 4,
    lastUpdated: '3 days ago',
  },
];

const statusTokens: Record<string, { text: ColorToken; background: ColorToken }> = {
  'High Risk': { text: 'error', background: 'errorContainer' },
  'High Priority': { text: 'error', background: 'warningContainer' },
  Pending: { text: 'warning', background: 'warningContainer' },
  Synced: { text: 'success', background: 'successContainer' },
  Approved: { text: 'success', background: 'successContainer' },
  Rejected: { text: 'error', background: 'errorContainer' },
  'Deadline Crossed': { text: 'secondary', background: 'primaryContainer' },
};

const Section = ({ title, data, onViewDetails }: { title: string; data: LoanItem[]; onViewDetails?: (loan: LoanItem) => void }) => {
  const theme = useAppTheme();

  const renderDetail = (label: string, value: string | number) => (
    <View key={label} style={styles.detailRow}>
      <AppText variant="bodySmall" color="muted" style={styles.detailLabel} translate={false}>
        {label}
      </AppText>
      <AppText variant="bodyMedium" color="text" translate={false}>
        {value}
      </AppText>
    </View>
  );

  const renderCard = (item: LoanItem) => {
    const statusColor = statusTokens[item.status]?.text ?? 'info';
    const statusBackground = statusTokens[item.status]?.background ?? 'infoContainer';

    return (
      <View key={item.id} style={[styles.card, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}> 
        <View style={styles.cardHeader}>
          <View>
            <AppText variant="titleMedium" weight="600" translate={false}>
              {item.name}
            </AppText>
            <AppText variant="bodySmall" color="muted" translate={false}>
              {item.address}
            </AppText>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: theme.colors[statusBackground] }]}>
            <AppText variant="labelSmall" color={theme.colors[statusColor]} translate={false}>
              {item.status}
            </AppText>
          </View>
        </View>

        <View style={styles.detailGrid}>
          {renderDetail('Category', item.category)}
          {renderDetail('Loan ID', item.loanId)}
          {renderDetail('Bank', item.bank)}
          {renderDetail('Assigned Officer', item.assignedTo)}
          {renderDetail('Documents', item.documents)}
          {renderDetail('Last Updated', item.lastUpdated)}
        </View>

        <AppButton
          label="View Details"
          variant="outline"
          onPress={() => onViewDetails?.(item)}
          style={styles.button}
        />
      </View>
    );
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <AppText variant="headlineMedium" weight="600" translate={false}>
          {title}
        </AppText>
        <AppText variant="bodySmall" color="muted" translate={false}>
          {data.length} beneficiaries
        </AppText>
      </View>
      {data.map(renderCard)}
    </View>
  );
};

export const BeneficiaryRiskLists = ({
  onViewDetails,
  highRiskData,
  pendingReviewData,
  deadlineCrossedData,
}: BeneficiaryRiskListsProps) => {
  const highRisk = highRiskData ?? highRiskLoans;
  const pendingReview = pendingReviewData ?? pendingReviewLoans;
  const deadlineCrossed = deadlineCrossedData ?? deadlineCrossedLoans;

  return (
    <View style={styles.container}>
      <Section title="High Risk" data={highRisk} onViewDetails={onViewDetails} />
      <Section title="Pending Review" data={pendingReview} onViewDetails={onViewDetails} />
      <Section title="Deadline Crossed" data={deadlineCrossed} onViewDetails={onViewDetails} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  section: {
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  detailGrid: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    width: 130,
  },
  button: {
    alignSelf: 'flex-start',
  },
});
