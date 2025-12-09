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
import { submissionRepository } from '@/services/api/submissionRepository';
import type { BeneficiaryMetadata, BeneficiaryRecord } from '@/types/beneficiary';

import type { BeneficiaryLoan, SubmissionEvidence } from '@/types/entities';

import type { BeneficiaryLoan } from '@/types/entities';
import { evidenceRequirementApi, type EvidenceRequirementRecord } from '@/services/api/evidenceRequirements';


const FILTER_OPTIONS = ['All', 'Pending', 'Approved', 'Rejected', 'High Priority'] as const;
type FilterOption = (typeof FILTER_OPTIONS)[number];

type DetailContext = { loan: BeneficiaryLoan; metadata?: BeneficiaryMetadata };
type EvidenceStatus = 'required' | 'pending' | 'submitted' | 'uploaded' | 'rejected';
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
  createdAt?: string;
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

const HIGH_PRIORITY_LOAN_IDS = new Set(['9981345206']);

const FALLBACK_BENEFICIARIES: BeneficiaryLoan[] = [
  {
    id: 'demo-1',
    loanId: '9861510432',
    name: 'Swastik Kumar Purohit',
    mobile: '+91 98234 56789',
    bank: 'Punjab Bank',
    scheme: 'PMEGP',
    loanAmount: 308568,
    sanctionDate: '2025-11-18',
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
  {
    id: 'demo-4',
    loanId: '7345129081',
    name: 'Aarav Mishra',
    mobile: '+91 98111 22334',
    bank: 'Bank of Baroda',
    scheme: 'PMEGP',
    loanAmount: 450000,
    sanctionDate: '2025-11-20',
    status: 'pending',
  },
  {
    id: 'demo-5',
    loanId: '9034572211',
    name: 'Sonal Tiwari',
    mobile: '+91 97777 88990',
    bank: 'SBI',
    scheme: 'Mudra',
    loanAmount: 520000,
    sanctionDate: '2025-10-30',
    status: 'disbursed',
  },
  {
    id: 'demo-6',
    loanId: '8023114455',
    name: 'Rahul Patra',
    mobile: '+91 97555 66778',
    bank: 'ICICI',
    scheme: 'Stand-Up India',
    loanAmount: 980000,
    sanctionDate: '2025-09-18',
    status: 'closed',
  },
  {
    id: 'demo-7',
    loanId: '9981345206',
    name: 'Manaswini Patro',
    mobile: '+91 98989 11223',
    bank: 'Canara Bank',
    scheme: 'PMEGP',
    loanAmount: 760000,
    sanctionDate: '2025-11-10',
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

const useBeneficiaryUploads = (beneficiaryId?: string) => {
  const [uploads, setUploads] = useState<SubmissionEvidence[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    if (!beneficiaryId || beneficiaryId.startsWith('demo-')) {
      setUploads([]);
      setIsLoading(false);
      setError(undefined);
      return () => {
        cancelled = true;
      };
    }

    const load = async () => {
      setIsLoading(true);
      try {
        const results = await submissionRepository.listByBeneficiary(beneficiaryId);
        if (!cancelled) {
          setUploads(results);
          setError(undefined);
        }
      } catch (err) {
        if (!cancelled) {
          setUploads([]);
          setError(err instanceof Error ? err.message : 'Unable to load uploads.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [beneficiaryId]);

  return { uploads, isLoading, error };
};

const formatUploadTimestamp = (value?: string) => {
  if (!value) return 'Just now';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getUploadStatusPalette = (
  theme: ReturnType<typeof useAppTheme>,
  status: SubmissionEvidence['status'],
) => {
  switch (status) {
    case 'approved':
      return { background: `${theme.colors.success}20`, text: theme.colors.success, label: 'Approved' };
    case 'rejected':
      return { background: `${theme.colors.error}20`, text: theme.colors.error, label: 'Rejected' };
    case 'pending':
      return { background: `${theme.colors.warning}20`, text: theme.colors.warning, label: 'Pending' };
    case 'syncing':
      return { background: `${theme.colors.info}20`, text: theme.colors.info, label: 'Syncing' };
    default:
      return { background: `${theme.colors.primary}20`, text: theme.colors.primary, label: 'Submitted' };
  }
};

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

  const dataSource = useMemo(() => {
    if (!loans.length) {
      return FALLBACK_BENEFICIARIES;
    }
    const existingIds = new Set(loans.map((item) => item.loanId));
    const demoAdditions = FALLBACK_BENEFICIARIES.filter((item) => !existingIds.has(item.loanId));
    return [...loans, ...demoAdditions];
  }, [loans]);

  const getDisplayStatus = (loan: BeneficiaryLoan) => {
    if (HIGH_PRIORITY_LOAN_IDS.has(loan.loanId)) {
      return 'High Priority';
    }
    switch (loan.status as string) {
      case 'sanctioned':
        return 'Synced';
      case 'disbursed':
      case 'approved':
        return 'Approved';
      case 'pending':
      case 'pending-review':
        return 'Pending';
      case 'rejected':
      case 'closed':
        return 'Rejected';
      default:
        return loan.status.toString().toUpperCase();
    }
  };

  const filtered = useMemo(() => {
    return dataSource.filter((item) => {
      const haystack = `${item.name} ${item.loanId} ${item.mobile}`.toLowerCase();
      const matchesQuery = haystack.includes(query.trim().toLowerCase());
      if (!matchesQuery) {
        return false;
      }
      switch (filter) {
        case 'Pending':
          return ['pending', 'pending-review'].includes(item.status as string);
        case 'Approved':
          return ['approved', 'sanctioned', 'disbursed', 'synced'].includes(item.status as string);
        case 'Rejected':
          return ['rejected', 'closed'].includes(item.status as string);
        case 'High Priority':
          return HIGH_PRIORITY_LOAN_IDS.has(item.loanId);
        default:
          return true;
      }
    });
  }, [dataSource, filter, query]);

  const getStatusColor = (status: BeneficiaryLoan['status']) => {
    switch (status as string) {
      case 'sanctioned':
      case 'disbursed':
      case 'approved':
      case 'synced':
        return accent;
      case 'pending':
      case 'pending-review':
        return '#F59E0B';
      case 'rejected':
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
    <BeneficiaryCard
      loan={item}
      metadata={recordMap[item.id]?.metadata}
      accent={accent}
      accentSoft={accentSoft}
      borderSoft={borderSoft}
      onViewDetails={handleViewDetails}
      getStatusColor={getStatusColor}
      getDisplayStatus={getDisplayStatus}
    />
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

type BeneficiaryCardProps = {
  loan: BeneficiaryLoan;
  metadata?: BeneficiaryMetadata;
  accent: string;
  accentSoft: string;
  borderSoft: string;
  onViewDetails: (loan: BeneficiaryLoan) => void;
  getStatusColor: (status: BeneficiaryLoan['status']) => string;
  getDisplayStatus: (loan: BeneficiaryLoan) => string;
};

const BeneficiaryCard = ({
  loan,
  metadata,
  accent,
  accentSoft,
  borderSoft,
  onViewDetails,
  getStatusColor,
  getDisplayStatus,
}: BeneficiaryCardProps) => {
  const theme = useAppTheme();
  const beneficiaryId = metadata?.beneficiaryUid ?? loan.id;
  const { uploads, isLoading, error } = useBeneficiaryUploads(beneficiaryId);
  const previewUploads = uploads.slice(0, 3);
  const totalUploads = uploads.length || metadata?.docCount || 0;
  const isHighPriority = HIGH_PRIORITY_LOAN_IDS.has(loan.loanId);
  const statusColor = isHighPriority ? '#C2410C' : getStatusColor(loan.status);

  return (
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
      onPress={() => onViewDetails(loan)}
    >
      <View style={styles.cardHeader}>
        <View>
          <AppText style={[styles.cardTitle, { color: theme.colors.text }]}>{loan.name}</AppText>
          <AppText style={[styles.cardSubtitle, { color: theme.colors.muted }]}>Loan ID: {loan.loanId}</AppText>
        </View>
        <View style={[styles.statusPill, { backgroundColor: withAlpha(statusColor, 0.16) }]}>
          <AppText style={[styles.statusPillText, { color: statusColor }]}>
            {getDisplayStatus(loan)}
          </AppText>
        </View>
      </View>

      <View style={[styles.evidencePreviewContainer, { borderColor: borderSoft }]}
        accessibilityLabel={`Evidence uploads for ${loan.name}`}
      >
        <View style={styles.evidencePreviewHeader}>
          <AppText style={[styles.evidencePreviewTitle, { color: theme.colors.text }]}>Evidence uploads</AppText>
          <AppText style={[styles.evidencePreviewCount, { color: theme.colors.muted }]}>
            {totalUploads} item{totalUploads === 1 ? '' : 's'}
          </AppText>
        </View>

        {isLoading ? (
          <ActivityIndicator color={theme.colors.primary} style={styles.previewLoader} />
        ) : previewUploads.length ? (
          previewUploads.map((upload) => (
            <EvidencePreviewRow key={upload.id} upload={upload} theme={theme} />
          ))
        ) : (
          <View style={styles.previewEmptyRow}>
            <Ionicons name="cloud-upload-outline" size={16} color={theme.colors.muted} />
            <AppText style={[styles.previewMeta, { color: theme.colors.muted }]}>No uploads yet</AppText>
          </View>
        )}

        {error ? <AppText style={[styles.previewError, { color: theme.colors.error }]}>{error}</AppText> : null}
      </View>

      <View style={styles.cardFooterCompact}>
        <AppText style={[styles.compactMeta, { color: theme.colors.muted }]}>
          Tap to view all evidence & instructions
        </AppText>
        <AppButton
          label="View Details"
          variant="outline"
          compact
          icon="chevron-right"
          iconPosition="right"
          onPress={() => onViewDetails(loan)}
          style={styles.viewDetailsButton}
        />
      </View>
    </TouchableOpacity>
  );
};

const EvidencePreviewRow = ({
  upload,
  theme,
}: {
  upload: SubmissionEvidence;
  theme: ReturnType<typeof useAppTheme>;
}) => {
  const palette = getUploadStatusPalette(theme, upload.status);
  const isVideo = upload.mediaType === 'video';

  return (
    <View style={styles.evidencePreviewRow}>
      <View style={[styles.previewIcon, { backgroundColor: withAlpha(theme.colors.primary, 0.14) }]}>
        <Ionicons
          name={isVideo ? 'videocam-outline' : 'image-outline'}
          size={16}
          color={theme.colors.primary}
        />
      </View>
      <View style={styles.previewTextCol}>
        <AppText numberOfLines={1} style={[styles.previewTitle, { color: theme.colors.text }]}>
          {upload.assetName || (isVideo ? 'Video upload' : 'Photo upload')}
        </AppText>
        <AppText numberOfLines={1} style={[styles.previewMeta, { color: theme.colors.muted }]}>
          {formatUploadTimestamp(upload.capturedAt || upload.submittedAt)}
        </AppText>
      </View>
      <View style={[styles.uploadStatusPill, { backgroundColor: palette.background }]}>
        <AppText style={[styles.uploadStatusText, { color: palette.text }]}>{palette.label}</AppText>
      </View>
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
  const [reqLoading, setReqLoading] = useState(false);
  const [isFormOpen, setFormOpen] = useState(false);
  const [customRequirement, setCustomRequirement] = useState<RequirementFormState>(createRequirementFormState());
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setRequests(baseRequests);
    setFormOpen(false);
    setCustomRequirement(createRequirementFormState());
    setFormError('');
  }, [baseRequests, loan?.id]);

  useEffect(() => {
    const fetchRemote = async () => {
      if (!loan?.id) return;
      try {
        setReqLoading(true);
        const remote = await evidenceRequirementApi.list(loan.id);
        if (remote.length) {
          setRequests(
            remote.map((item): EvidenceRequirement => ({
              id: item.id,
              label: item.label,
              status: (item.status as EvidenceStatus) ?? 'required',
              instructions: item.instructions,
              permissions: item.permissions ?? { camera: true, fileUpload: true },
              responseType: item.response_type,
              model: item.model,
              imageQuality: item.image_quality as ImageQuality,
              removable: true,
              shared: true,
              createdAt: item.created_at,
            }))
          );
        }
      } catch (error) {
        console.error('Requirement fetch failed', error);
      } finally {
        setReqLoading(false);
      }
    };
    fetchRemote();
  }, [loan?.id]);

  const handleFormChange = <K extends keyof RequirementFormState>(key: K, value: RequirementFormState[K]) => {
    setCustomRequirement((prev) => ({ ...prev, [key]: value }));
    if (formError) {
      setFormError('');
    }
  };

  const handleSaveRequirement = async () => {
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

    try {
      if (!loan?.id) {
        setFormError('Beneficiary missing.');
        return;
      }

      const created = await evidenceRequirementApi.create({
        beneficiary_id: loan.id,
        label: trimmedName,
        status: 'required',
        instructions: 'Custom evidence request created by the officer.',
        permissions: {
          camera: true,
          fileUpload: customRequirement.allowFileUpload,
        },
        response_type: trimmedType,
        model: customRequirement.model.trim() || undefined,
        image_quality: customRequirement.imageQuality,
      });

      const newRequirement: EvidenceRequirement = {
        id: created.id,
        label: created.label,
        status: (created.status as EvidenceStatus) ?? 'required',
        instructions: created.instructions,
        permissions: created.permissions ?? { camera: true, fileUpload: true },
        responseType: created.response_type,
        model: created.model,
        imageQuality: created.image_quality as ImageQuality,
        removable: true,
        shared: true,
        createdAt: created.created_at,
      };

      setRequests((prev) => [...prev, newRequirement]);
      setCustomRequirement(createRequirementFormState());
      setFormOpen(false);
      setFormError('');
    } catch (error) {
      console.error('Save requirement failed', error);
      setFormError('Unable to save requirement.');
    }
  };

  const handleRemoveRequirement = async (id: string) => {
    try {
      await evidenceRequirementApi.remove(id);
      setRequests((prev) => prev.filter((req) => req.id !== id));
    } catch (error) {
      console.error('Remove requirement failed', error);
    }
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
              {reqLoading ? <ActivityIndicator size="small" color={theme.colors.primary} /> : null}
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
        <View style={[styles.evidenceStatusPill, { backgroundColor: palette.background }]}> 
          <AppText style={[styles.evidenceStatusText, { color: palette.text }]}>{palette.label}</AppText>
        </View>
      </View>
    </View>
  );
};

const getEvidencePalette = (theme: ReturnType<typeof useAppTheme>, status: EvidenceStatus) => {
  switch (status) {
    case 'submitted':
    case 'uploaded':
      return {
        background: `${theme.colors.success}20`,
        text: theme.colors.success,
        border: `${theme.colors.success}40`,
        label: 'Uploaded',
      };
    case 'pending':
      return {
        background: `${theme.colors.info}20`,
        text: theme.colors.info,
        border: `${theme.colors.info}40`,
        label: 'Pending',
      };
    case 'rejected':
      return {
        background: `${theme.colors.error}20`,
        text: theme.colors.error,
        border: `${theme.colors.error}40`,
        label: 'Rejected',
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
  evidencePreviewContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
    gap: 8,
  },
  evidencePreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  evidencePreviewTitle: { fontSize: 14, fontWeight: '600' },
  evidencePreviewCount: { fontSize: 12 },
  evidencePreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  previewIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewTextCol: { flex: 1 },
  previewTitle: { fontSize: 13, fontWeight: '600' },
  previewMeta: { fontSize: 12 },
  uploadStatusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  uploadStatusText: { fontSize: 12, fontWeight: '600' },
  previewEmptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewLoader: { marginVertical: 4 },
  previewError: { fontSize: 12, marginTop: 2 },
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
