import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View
} from 'react-native';

import { AppButton, AppText, Chip, InputField } from '@/components/atoms';
import { WaveHeader } from '@/components/molecules/wave-header';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useOfficerBeneficiaries } from '@/hooks/use-officer-beneficiaries';
import type { BeneficiaryMetadata, BeneficiaryRecord } from '@/types/beneficiary';
import type { BeneficiaryLoan } from '@/types/entities';

const FILTER_OPTIONS = ['All', 'Pending', 'Approved', 'Rejected', 'High Priority'] as const;
type FilterOption = (typeof FILTER_OPTIONS)[number];

type DetailContext = { loan: BeneficiaryLoan; metadata?: BeneficiaryMetadata };
type EvidenceStatus = 'required' | 'pending' | 'submitted';
type ImageQuality = 'best' | 'good' | 'low';

type EvidenceRequirement = {
  id: string;
  label: string;
  status: EvidenceStatus;
  instructions?: string;
  dueDate?: string;
  shared?: boolean;
  removable?: boolean;
  permissions?: {
    camera: boolean;
    fileUpload: boolean;
  };
  responseType?: string;
  model?: string;
  imageQuality?: ImageQuality;
};
type RequirementFormState = {
  documentName: string;
  allowFileUpload: boolean;
  responseType: string;
  model: string;
  imageQuality: ImageQuality;
};

const createRequirementFormState = (): RequirementFormState => ({
  documentName: '',
  allowFileUpload: true,
  responseType: '',
  model: '',
  imageQuality: 'good',
});

const IMAGE_QUALITY_LABELS: Record<ImageQuality, string> = {
  best: 'Best',
  good: 'Good',
  low: 'Low',
};

const FALLBACK_BENEFICIARIES: BeneficiaryLoan[] = [
  {
    id: 'demo-1',
    loanId: 'LN-0002',
    name: 'Swastik Kumar Purohit',
    mobile: '+91 98234 56789',
    bank: 'Panjab',
    scheme: 'PMEGP',
    loanAmount: 308568,
    sanctionDate: '2025-11-18',
    status: 'sanctioned',
  },
  {
    id: 'demo-2',
    loanId: 'LN-0001',
    name: 'Deepankar Sahoo',
    mobile: '+91 98760 11223',
    bank: 'UCO',
    scheme: 'Stand-Up India',
    loanAmount: 2500080,
    sanctionDate: '2025-11-05',
    status: 'sanctioned',
  },
  {
    id: 'demo-3',
    loanId: 'LN-0015',
    name: 'Priya Sharma',
    mobile: '+91 97854 88992',
    bank: 'SBI',
    scheme: 'Mudra',
    loanAmount: 512000,
    sanctionDate: '2025-10-22',
    status: 'pending',
  },
];

const withAlpha = (color: string, alpha: number) => {
  if (!color.startsWith('#')) {
    return color;
  }
  const normalized =
    color.length === 4
      ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
      : color;
  const value = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');
  return `${normalized}${value}`;
};

const formatAmount = (value: number) => `₹${value.toLocaleString('en-IN')}`;

export const BeneficiaryListScreen = () => {
  const navigation = useNavigation<any>();
  const theme = useAppTheme();
  const { records, loans, isLoading, isRefreshing, refresh, error } = useOfficerBeneficiaries();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterOption>('All');
  const [detailContext, setDetailContext] = useState<DetailContext | null>(null);

  const accent = theme.colors.gradientStart;
  const accentSoft = withAlpha(accent, 0.12);
  const borderSoft = withAlpha(theme.colors.border, 0.7);

  const recordMap = useMemo(
    () =>
      records.reduce<Record<string, BeneficiaryRecord>>((acc, record) => {
        acc[record.id] = record;
        return acc;
      }, {}),
    [records]
  );

  const dataSource = loans.length ? loans : FALLBACK_BENEFICIARIES;

  const filtered = useMemo(() => {
    return dataSource.filter((item) => {
      const haystack = `${item.name} ${item.loanId} ${item.mobile}`.toLowerCase();
      const matchesQuery = haystack.includes(query.trim().toLowerCase());
      if (!matchesQuery) {
        return false;
      }
      switch (filter) {
        case 'Pending':
          return item.status === 'pending';
        case 'Approved':
          return item.status === 'sanctioned' || item.status === 'disbursed';
        case 'Rejected':
          return item.status === 'closed';
        case 'High Priority':
          return false;
        default:
          return true;
      }
    });
  }, [dataSource, filter, query]);

  const getStatusColor = (status: BeneficiaryLoan['status']) => {
    switch (status) {
      case 'sanctioned':
      case 'disbursed':
        return accent;
      case 'pending':
        return '#F59E0B';
      case 'closed':
        return '#DC2626';
      default:
        return theme.colors.muted;
    }
  };

  const handleViewDetails = (loan: BeneficiaryLoan) => {
    setDetailContext({ loan, metadata: recordMap[loan.id]?.metadata });
  };

  const closeDetails = () => setDetailContext(null);

  const renderCard = ({ item }: { item: BeneficiaryLoan }) => (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: borderSoft,
          shadowColor: withAlpha('#000000', 0.08),
        },
      ]}
      activeOpacity={0.85}
      onPress={() => handleViewDetails(item)}
    >
      <View style={styles.cardHeader}>
        <View>
          <AppText style={[styles.cardTitle, { color: theme.colors.text }]}>{item.name}</AppText>
          <AppText style={[styles.cardSubtitle, { color: theme.colors.muted }]}>Loan ID: {item.loanId}</AppText>
        </View>
        <View style={[styles.statusPill, { backgroundColor: withAlpha(getStatusColor(item.status), 0.16) }]}> 
          <AppText style={[styles.statusPillText, { color: getStatusColor(item.status) }]}>
            {item.status === 'sanctioned' ? 'Synced' : item.status.toUpperCase()}
          </AppText>
        </View>
      </View>

      <View style={styles.cardFooterCompact}>
        <AppText style={[styles.compactMeta, { color: theme.colors.muted }]}>
          Tap to view evidence & instructions
        </AppText>
        <AppButton
          label="View Details"
          variant="outline"
          compact
          icon="chevron-right"
          iconPosition="right"
          onPress={() => handleViewDetails(item)}
          style={styles.viewDetailsButton}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <WaveHeader title="Beneficiaries" onBack={() => navigation.goBack()} />

      <View style={styles.contentContainer}>
        <View style={styles.searchContainer}>
          <InputField
            label=""
            placeholder="Search by name, ID, or mobile..."
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            style={[styles.searchInput, { backgroundColor: theme.colors.surface, borderColor: borderSoft }]}
          />
        </View>

        <View style={styles.filterContainer}>
          <FlatList
            horizontal
            data={FILTER_OPTIONS}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
            renderItem={({ item }) => (
              <Chip
                label={item}
                tone={filter === item ? 'gradientStart' : 'muted'}
                backgroundColor={filter === item ? accentSoft : theme.colors.surface}
                onPress={() => setFilter(item)}
                style={[styles.filterChip, { borderColor: borderSoft }]}
              />
            )}
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: 40 }]}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} />}
          renderItem={renderCard}
          ListEmptyComponent={
            isLoading ? (
              <ActivityIndicator style={styles.loader} color={theme.colors.primary} />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color={theme.colors.muted} />
                <AppText style={[styles.emptyText, { color: theme.colors.muted }]}>
                  {error ? 'Unable to load beneficiaries.' : 'No beneficiaries found.'}
                </AppText>
              </View>
            )
          }
        />
      </View>

      <BeneficiaryDetailSheet
        visible={Boolean(detailContext)}
        loan={detailContext?.loan ?? null}
        metadata={detailContext?.metadata}
        onClose={closeDetails}
      />
    </View>
  );
};

const BeneficiaryDetailSheet = ({
  visible,
  loan,
  metadata,
  onClose,
}: {
  visible: boolean;
  loan: BeneficiaryLoan | null;
  metadata?: BeneficiaryMetadata;
  onClose: () => void;
}) => {
  const theme = useAppTheme();
  const baseRequests = useMemo(() => (loan ? buildEvidenceRequests(loan, metadata) : []), [loan, metadata]);
  const [requests, setRequests] = useState<EvidenceRequirement[]>(baseRequests);
  const [isFormOpen, setFormOpen] = useState(false);
  const [customRequirement, setCustomRequirement] = useState<RequirementFormState>(createRequirementFormState());
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setRequests(baseRequests);
    setFormOpen(false);
    setCustomRequirement(createRequirementFormState());
    setFormError('');
  }, [baseRequests, loan?.id]);

  const handleFormChange = <K extends keyof RequirementFormState>(key: K, value: RequirementFormState[K]) => {
    setCustomRequirement((prev) => ({ ...prev, [key]: value }));
    if (formError) {
      setFormError('');
    }
  };

  const handleSaveRequirement = () => {
    const trimmedName = customRequirement.documentName.trim();
    const trimmedType = customRequirement.responseType.trim();

    if (!trimmedName || !trimmedType) {
      setFormError('Document name and response type are required.');
      return;
    }

    if (requests.some((req) => req.label.toLowerCase() === trimmedName.toLowerCase())) {
      setFormError('A requirement with this document name already exists.');
      return;
    }

    const newRequirement: EvidenceRequirement = {
      id: `custom-${Date.now()}`,
      label: trimmedName,
      status: 'required',
      instructions: 'Custom evidence request created by the officer.',
      shared: true,
      removable: true,
      permissions: {
        camera: true,
        fileUpload: customRequirement.allowFileUpload,
      },
      responseType: trimmedType,
      model: customRequirement.model.trim() || undefined,
      imageQuality: customRequirement.imageQuality,
    };

    setRequests((prev) => [...prev, newRequirement]);
    setCustomRequirement(createRequirementFormState());
    setFormOpen(false);
    setFormError('');
  };

  const handleRemoveRequirement = (id: string) => {
    setRequests((prev) => prev.filter((req) => req.id !== id));
  };

  if (!loan) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.detailOverlay}>
        <Pressable style={styles.detailBackdrop} onPress={onClose} />
        <View style={[styles.detailSheet, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.sheetHandle} />
          <ScrollView contentContainerStyle={styles.detailContent} showsVerticalScrollIndicator={false}>
            <View style={styles.detailHeader}>
              <View>
                <AppText style={[styles.detailTitle, { color: theme.colors.text }]}>{loan.name}</AppText>
                <AppText style={[styles.detailSubtitle, { color: theme.colors.muted }]}>Loan ID: {loan.loanId}</AppText>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={22} color={theme.colors.muted} />
              </TouchableOpacity>
            </View>

            <View style={styles.detailStatsRow}>
              <DetailStat label="Loan Amount" value={formatAmount(loan.loanAmount)} accent={theme.colors.gradientStart} />
              <DetailStat label="Status" value={loan.status.toUpperCase()} accent={theme.colors.primary} />
            </View>
            <View style={styles.detailStatsRow}>
              <DetailStat label="Bank" value={loan.bank} accent={theme.colors.text} flat />
              <DetailStat
                label="Sanctioned"
                value={new Date(loan.sanctionDate).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
                accent={theme.colors.text}
                flat
              />
            </View>

            <View style={styles.detailNotice}>
              <Ionicons name="sync-outline" size={18} color={theme.colors.gradientStart} />
              <AppText style={[styles.detailNoticeText, { color: theme.colors.text }]}>
                Evidence requests below are instantly visible to the beneficiary app.
              </AppText>
            </View>

            <View style={styles.sectionHeaderRow}>
              <AppText style={[styles.sectionTitle, { color: theme.colors.text }]}>Evidence Requirements</AppText>
              <AppText style={[styles.sectionSubtitle, { color: theme.colors.muted }]}>
                {requests.length} active
              </AppText>
            </View>

            <View style={styles.catalogToggleRow}>
              <AppButton
                label={isFormOpen ? 'Hide Requirement Form' : 'Add Requirement'}
                variant="secondary"
                compact
                icon={isFormOpen ? 'chevron-up' : 'plus'}
                onPress={() => setFormOpen((prev) => !prev)}
              />
            </View>

            {isFormOpen ? (
              <View
                style={[styles.requirementFormContainer, { borderColor: withAlpha(theme.colors.border, 0.5) }]}
              >
                <AppText style={[styles.formTitle, { color: theme.colors.text }]}>Add Requirement - Instruction Prompt</AppText>
                <AppText style={[styles.formSubtitle, { color: theme.colors.muted }]}>
                  Please fill the fields below to create a new document requirement for the beneficiary. All requirements added here will appear in the beneficiary's upload screen.
                </AppText>

                <InputField
                  label="1. Document Name (Required)"
                  placeholder="Enter the document/evidence name"
                  value={customRequirement.documentName}
                  onChangeText={(text) => handleFormChange('documentName', text)}
                />

                <View style={styles.formSection}>
                  <AppText style={[styles.formSectionTitle, { color: theme.colors.text }]}>2. Required Permissions</AppText>
                  <AppText style={[styles.formHelper, { color: theme.colors.muted }]}>
                    Camera access is mandatory and always enabled.
                  </AppText>
                  <View style={styles.permissionRow}>
                    <View style={styles.permissionCopy}>
                      <AppText style={[styles.permissionLabel, { color: theme.colors.text }]}>File Upload</AppText>
                      <AppText style={[styles.formHelper, { color: theme.colors.muted }]}>
                        Enable if the beneficiary can upload from storage.
                      </AppText>
                    </View>
                    <Switch
                      value={customRequirement.allowFileUpload}
                      onValueChange={(value: boolean) => handleFormChange('allowFileUpload', value)}
                      trackColor={{ false: withAlpha(theme.colors.border, 0.7), true: theme.colors.primary }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                </View>

                <View style={styles.formSection}>
                  <AppText style={[styles.formSectionTitle, { color: theme.colors.text }]}>3. Required Response Type (Mandatory)</AppText>
                  <AppText style={[styles.formHelper, { color: theme.colors.muted }]}>
                    Enter the type of object or document needed (e.g., Aadhaar, Machine, Invoice, Shop Photo).
                  </AppText>

                  <InputField
                    label="Response Type"
                    placeholder="e.g., Aadhaar, Shop Photo"
                    value={customRequirement.responseType}
                    onChangeText={(text) => handleFormChange('responseType', text)}
                  />
                  <InputField
                    label="Model (Optional)"
                    placeholder="Add model or unique identification"
                    value={customRequirement.model}
                    onChangeText={(text) => handleFormChange('model', text)}
                  />

                  <InputField
                    label="Image Quality"
                    value={`${IMAGE_QUALITY_LABELS[customRequirement.imageQuality]} quality`}
                    editable={false}
                    helperText="Good quality is chosen by default for clarity"
                  />
                </View>

                {formError ? (
                  <AppText style={[styles.formErrorText, { color: theme.colors.error }]}>{formError}</AppText>
                ) : null}

                <AppButton
                  label="Save Requirement"
                  icon="content-save-outline"
                  onPress={handleSaveRequirement}
                />
              </View>
            ) : null}

            {requests.map((request) => (
              <EvidenceRequestCard
                key={request.id}
                request={request}
                onRemove={request.removable ? () => handleRemoveRequirement(request.id) : undefined}
              />
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const DetailStat = ({ label, value, accent, flat }: { label: string; value: string; accent: string; flat?: boolean }) => (
  <View style={[styles.detailStat, flat ? styles.detailStatFlat : null]}>
    <AppText style={styles.detailStatLabel}>{label}</AppText>
    <AppText style={[styles.detailStatValue, { color: accent }]}>{value}</AppText>
  </View>
);

const EvidenceRequestCard = ({ request, onRemove }: { request: EvidenceRequirement; onRemove?: () => void }) => {
  const theme = useAppTheme();
  const palette = getEvidencePalette(theme, request.status);
  return (
    <View style={[styles.evidenceCard, { borderColor: palette.border }]}> 
      <View style={styles.evidenceHeader}>
        <AppText style={[styles.evidenceTitle, { color: theme.colors.text }]}>{request.label}</AppText>
        <View style={styles.evidenceHeaderActions}>
          <View style={[styles.evidenceStatusPill, { backgroundColor: palette.background }]}>
            <AppText style={[styles.evidenceStatusText, { color: palette.text }]}>{palette.label}</AppText>
          </View>
          {onRemove ? (
            <TouchableOpacity onPress={onRemove} style={styles.removeButton} accessibilityRole="button">
              <Ionicons name="trash-outline" size={16} color={theme.colors.error} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      {request.instructions ? (
        <AppText style={[styles.evidenceSubtitle, { color: theme.colors.muted }]}>
          {request.instructions}
        </AppText>
      ) : null}
      {(request.responseType || request.model || request.imageQuality) ? (
        <View style={styles.evidenceMetaRow}>
          {request.responseType ? (
            <View style={[styles.metaChip, { backgroundColor: withAlpha(theme.colors.primary, 0.14) }]}>
              <AppText style={[styles.metaChipText, { color: theme.colors.primary }]}>
                {request.responseType}
              </AppText>
            </View>
          ) : null}
          {request.model ? (
            <View style={[styles.metaChip, { backgroundColor: withAlpha(theme.colors.gradientEnd, 0.14) }]}>
              <AppText style={[styles.metaChipText, { color: theme.colors.gradientEnd }]}>
                Model: {request.model}
              </AppText>
            </View>
          ) : null}
          {request.imageQuality ? (
            <View style={[styles.metaChip, { backgroundColor: withAlpha(theme.colors.info, 0.14) }]}>
              <AppText style={[styles.metaChipText, { color: theme.colors.info }]}>
                {IMAGE_QUALITY_LABELS[request.imageQuality]} quality
              </AppText>
            </View>
          ) : null}
        </View>
      ) : null}
      {request.permissions ? (
        <AppText style={[styles.evidenceMetaText, { color: theme.colors.muted }]}> 
          Camera: Enabled · File upload: {request.permissions.fileUpload ? 'Allowed' : 'Disabled'}
        </AppText>
      ) : null}
      {request.dueDate ? (
        <AppText style={[styles.evidenceDue, { color: theme.colors.muted }]}>Due: {request.dueDate}</AppText>
      ) : null}
      <View style={styles.evidenceFooter}>
        <AppText style={[styles.sharedLabel, { color: theme.colors.muted }]}>
          {request.shared === false ? 'Not shared with beneficiary' : 'Beneficiary can view this request'}
        </AppText>
        <AppButton
          label={request.status === 'submitted' ? 'Review Upload' : 'Request Upload'}
          variant={request.status === 'submitted' ? 'outline' : 'primary'}
          compact
          icon={request.status === 'submitted' ? 'eye-outline' : 'cloud-upload'}
          onPress={() => {}}
        />
      </View>
    </View>
  );
};

const getEvidencePalette = (theme: ReturnType<typeof useAppTheme>, status: EvidenceStatus) => {
  switch (status) {
    case 'submitted':
      return {
        background: `${theme.colors.success}20`,
        text: theme.colors.success,
        border: `${theme.colors.success}40`,
        label: 'Submitted',
      };
    case 'pending':
      return {
        background: `${theme.colors.info}20`,
        text: theme.colors.info,
        border: `${theme.colors.info}40`,
        label: 'In Review',
      };
    default:
      return {
        background: `${theme.colors.warning}20`,
        text: theme.colors.warning,
        border: `${theme.colors.warning}40`,
        label: 'Required',
      };
  }
};

const buildEvidenceRequests = (
  loan: BeneficiaryLoan,
  metadata?: BeneficiaryMetadata,
): EvidenceRequirement[] => {
  const fromMetadata = (metadata as any)?.requiredEvidence;
  if (Array.isArray(fromMetadata) && fromMetadata.length) {
    return fromMetadata.map((entry: any, index: number) => ({
      id: entry.id ?? `req-${index}`,
      label: entry.label ?? entry.text ?? 'Additional evidence',
      status: (entry.status ?? 'required') as EvidenceStatus,
      instructions: entry.instructions ?? entry.description,
      dueDate: entry.dueDate,
      shared: entry.shared ?? true,
      removable: false,
      permissions: {
        camera: true,
        fileUpload: entry.permissions?.fileUpload ?? true,
      },
      responseType: entry.responseType ?? entry.type,
      model: entry.model,
      imageQuality: (entry.imageQuality as ImageQuality) ?? 'good',
    }));
  }

  if (metadata?.notes?.length) {
    return metadata.notes.map((note, index) => ({
      id: note.timestamp ?? `note-${index}`,
      label: note.text,
      status: note.text.toLowerCase().includes('upload') ? 'required' : 'pending',
      instructions: note.author ? `Officer ${note.author}` : undefined,
      dueDate: note.timestamp ? new Date(note.timestamp).toLocaleDateString('en-IN') : undefined,
      shared: true,
      removable: false,
      permissions: {
        camera: true,
        fileUpload: true,
      },
      imageQuality: 'good',
    }));
  }

  return [];
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { flex: 1, marginTop: 100 },
  searchContainer: { paddingHorizontal: 20, marginBottom: 12 },
  searchInput: {
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  filterContainer: { marginBottom: 16 },
  filterList: { paddingHorizontal: 20, gap: 8 },
  filterChip: { borderWidth: 1 },
  listContent: { paddingHorizontal: 20, gap: 16 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  cardSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  statusPill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  statusPillText: { fontWeight: '600' },
  cardFooterCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
    gap: 12,
  },
  compactMeta: { flex: 1, fontSize: 12 },
  viewDetailsButton: { minWidth: 130 },
  loader: { marginTop: 40 },
  emptyState: { alignItems: 'center', marginTop: 40, gap: 12 },
  emptyText: { fontSize: 14 },
  detailOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  detailBackdrop: { flex: 1 },
  detailSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 24,
    maxHeight: '85%',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  sheetHandle: {
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginVertical: 12,
  },
  detailContent: { paddingHorizontal: 20, paddingBottom: 24, gap: 16 },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailTitle: { fontSize: 20, fontWeight: '700' },
  detailSubtitle: { marginTop: 4, fontSize: 13 },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  detailStatsRow: { flexDirection: 'row', gap: 12 },
  detailStat: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  detailStatFlat: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  detailStatLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  detailStatValue: { fontSize: 16, fontWeight: '600' },
  detailNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
  },
  detailNoticeText: { flex: 1, fontSize: 13 },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { fontSize: 16, fontWeight: '600' },
  sectionSubtitle: { fontSize: 13 },
  catalogToggleRow: { alignItems: 'flex-start', marginBottom: 12 },
  requirementFormContainer: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    gap: 16,
  },
  formTitle: { fontSize: 15, fontWeight: '600' },
  formSubtitle: { fontSize: 13, lineHeight: 18 },
  formSection: { gap: 8 },
  formSectionTitle: { fontSize: 14, fontWeight: '600' },
  formHelper: { fontSize: 12, lineHeight: 16 },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  permissionCopy: { flex: 1 },
  permissionLabel: { fontSize: 13, fontWeight: '500' },
  formErrorText: { fontSize: 12, fontWeight: '600' },
  evidenceCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#FFF',
  },
  evidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  evidenceHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  evidenceTitle: { fontSize: 15, fontWeight: '600' },
  evidenceStatusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  evidenceStatusText: { fontSize: 12, fontWeight: '600' },
  evidenceMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  metaChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  metaChipText: { fontSize: 12, fontWeight: '600' },
  removeButton: { marginLeft: 12, padding: 4, borderRadius: 999 },
  evidenceSubtitle: { fontSize: 13, marginBottom: 8 },
  evidenceMetaText: { fontSize: 12, marginBottom: 8 },
  evidenceDue: { fontSize: 12, marginBottom: 12 },
  evidenceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sharedLabel: { flex: 1, fontSize: 12 },
});
