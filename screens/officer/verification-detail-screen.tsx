import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Image, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';

import { AppButton } from '@/components/atoms/app-button';
import { AppText } from '@/components/atoms/app-text';
import { WaveHeader } from '@/components/molecules/wave-header';
import { useAppTheme } from '@/hooks/use-app-theme';
import { beneficiaryRepository } from '@/services/api/beneficiaryRepository';
import { submissionRepository } from '@/services/api/submissionRepository';
import type { BeneficiaryRecord } from '@/types/beneficiary';
import type { SubmissionEvidence } from '@/types/entities';

export const VerificationDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useAppTheme();
  const { id } = route.params as { id: string }; // This is the mobile number

  const [beneficiary, setBeneficiary] = useState<BeneficiaryRecord | null>(null);
  const [evidences, setEvidences] = useState<SubmissionEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'note' | 'reject' | 'return'>('note');
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [benData, subData] = await Promise.all([
        beneficiaryRepository.getRecordByMobile(id),
        submissionRepository.listByBeneficiary(id)
      ]);
      setBeneficiary(benData);
      setEvidences(subData);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load beneficiary details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: string, reason?: string) => {
    try {
      setActionLoading(true);
      await beneficiaryRepository.updateStatus(id, status, reason);
      Alert.alert('Success', `Application ${status}`);
      loadData(); // Refresh data
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setActionLoading(false);
      setModalVisible(false);
      setNoteText('');
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    try {
      setActionLoading(true);
      // Assuming 'Officer' as author for now, ideally get from auth context
      await beneficiaryRepository.addNote(id, noteText, 'Officer');
      Alert.alert('Success', 'Note added');
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to add note');
    } finally {
      setActionLoading(false);
      setModalVisible(false);
      setNoteText('');
    }
  };

  const openActionModal = (type: 'note' | 'reject' | 'return') => {
    setModalType(type);
    setNoteText('');
    setModalVisible(true);
  };

  const submitModalAction = () => {
    if (modalType === 'note') {
      handleAddNote();
    } else if (modalType === 'reject') {
      handleStatusUpdate('rejected', noteText);
    } else if (modalType === 'return') {
      handleStatusUpdate('correction_needed', noteText);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return '#16A34A';
      case 'pending': return '#F59E0B';
      case 'rejected': return '#DC2626';
      case 'correction_needed': return '#EAB308';
      default: return '#6B7280';
    }
  };

  const EvidenceCard = ({ item }: { item: SubmissionEvidence }) => (
    <TouchableOpacity 
      style={styles.evidenceCard}
      onPress={() => navigation.navigate('OfficerSubmissionDetail', { submission: item, beneficiaryId: id })}
    >
      <View style={styles.evidenceHeader}>
        <View style={styles.evidenceInfo}>
          <AppText style={styles.evidenceTitle}>{item.assetName}</AppText>
          <AppText style={styles.evidenceType}>{item.mediaType}</AppText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: '#F3F4F6' }]}>
          <AppText style={[styles.statusText, { color: '#6B7280' }]}>
            {new Date(item.capturedAt).toLocaleDateString()}
          </AppText>
        </View>
      </View>

      <Image 
        source={{ uri: item.mediaUrl || item.thumbnailUrl || 'https://placehold.co/600x400/png' }} 
        style={styles.evidenceImage} 
        resizeMode="cover" 
      />
      
      {item.remarks && (
        <AppText style={styles.remarksText}>"{item.remarks}"</AppText>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!beneficiary) {
    return (
      <View style={styles.container}>
        <WaveHeader title="Verification" onBack={() => navigation.goBack()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <AppText>Beneficiary not found</AppText>
        </View>
      </View>
    );
  }

  const currentStatus = beneficiary.metadata?.status || 'pending';

  return (
    <View style={styles.container}>
      <WaveHeader title="Verification Details" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Beneficiary Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View>
              <AppText style={styles.label}>Beneficiary Name</AppText>
              <AppText style={styles.value}>{beneficiary.fullName}</AppText>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <AppText style={styles.label}>Mobile</AppText>
              <AppText style={styles.value}>{beneficiary.mobile}</AppText>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <View>
              <AppText style={styles.label}>Village</AppText>
              <AppText style={styles.value}>{beneficiary.village}</AppText>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <AppText style={styles.label}>Status</AppText>
              <AppText style={[styles.value, { color: getStatusColor(currentStatus) }]}>
                {currentStatus.toUpperCase()}
              </AppText>
            </View>
          </View>
          {beneficiary.metadata?.statusReason && (
             <View style={{ marginTop: 12, padding: 8, backgroundColor: '#FEF2F2', borderRadius: 8 }}>
               <AppText style={{ color: '#DC2626', fontSize: 12 }}>Reason: {beneficiary.metadata.statusReason}</AppText>
             </View>
          )}
        </View>

        {/* Timeline Section */}
        {beneficiary.metadata?.timeline && beneficiary.metadata.timeline.length > 0 && (
          <View style={styles.sectionContainer}>
            <AppText style={styles.sectionTitle}>Timeline</AppText>
            {beneficiary.metadata.timeline.map((event, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: getStatusColor(event.status) }]} />
                <View style={styles.timelineContent}>
                  <AppText style={styles.timelineStatus}>{event.status.toUpperCase()}</AppText>
                  <AppText style={styles.timelineDate}>{new Date(event.timestamp).toLocaleString()}</AppText>
                  {event.reason && <AppText style={styles.timelineReason}>{event.reason}</AppText>}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Notes Section */}
        <View style={styles.sectionContainer}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <AppText style={styles.sectionTitle}>Internal Notes</AppText>
            <TouchableOpacity onPress={() => openActionModal('note')}>
              <AppText style={{ color: theme.colors.primary, fontWeight: '600' }}>+ Add Note</AppText>
            </TouchableOpacity>
          </View>
          
          {beneficiary.metadata?.notes?.map((note, index) => (
            <View key={index} style={styles.noteItem}>
              <AppText style={styles.noteText}>{note.text}</AppText>
              <View style={styles.noteFooter}>
                <AppText style={styles.noteAuthor}>{note.author}</AppText>
                <AppText style={styles.noteDate}>{new Date(note.timestamp).toLocaleDateString()}</AppText>
              </View>
            </View>
          ))}
          {(!beneficiary.metadata?.notes || beneficiary.metadata.notes.length === 0) && (
            <AppText style={{ color: '#9CA3AF', fontStyle: 'italic' }}>No notes added yet.</AppText>
          )}
        </View>

        <AppText style={styles.sectionTitle}>Uploaded Evidence</AppText>
        
        <View style={styles.evidenceList}>
          {evidences.length > 0 ? (
            evidences.map((item) => (
              <EvidenceCard key={item.id} item={item} />
            ))
          ) : (
            <AppText style={{ color: '#6B7280', textAlign: 'center', padding: 20 }}>No evidence uploaded yet.</AppText>
          )}
        </View>

        <View style={styles.footerActions}>
          <AppButton 
            label="Approve Application" 
            onPress={() => handleStatusUpdate('approved')} 
            style={{ backgroundColor: '#16A34A', marginBottom: 12 }}
            disabled={actionLoading}
          />
          <AppButton 
            label="Return for Correction" 
            onPress={() => openActionModal('return')} 
            style={{ backgroundColor: '#F59E0B', marginBottom: 12 }}
            disabled={actionLoading}
          />
          <AppButton 
            label="Reject Application" 
            onPress={() => openActionModal('reject')} 
            style={{ backgroundColor: '#DC2626' }}
            disabled={actionLoading}
          />
        </View>
      </ScrollView>

      {/* Action Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <AppText style={styles.modalTitle}>
              {modalType === 'note' ? 'Add Internal Note' : 
               modalType === 'reject' ? 'Reject Application' : 'Return for Correction'}
            </AppText>
            
            <AppText style={styles.modalSubtitle}>
              {modalType === 'note' ? 'Enter your note below:' : 
               'Please provide a reason:'}
            </AppText>

            <TextInput
              style={styles.input}
              multiline
              numberOfLines={4}
              value={noteText}
              onChangeText={setNoteText}
              placeholder="Type here..."
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: '#F3F4F6' }]}
                onPress={() => setModalVisible(false)}
              >
                <AppText style={{ color: '#374151' }}>Cancel</AppText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: theme.colors.primary }]}
                onPress={submitModalAction}
              >
                <AppText style={{ color: 'white', fontWeight: '600' }}>Submit</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingTop: 100,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 16,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  evidenceList: {
    gap: 16,
    marginBottom: 24,
  },
  evidenceCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  evidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  evidenceInfo: {
    flex: 1,
  },
  evidenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  evidenceType: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  evidenceImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
  },
  remarksText: {
    marginTop: 8,
    fontSize: 14,
    color: '#4B5563',
    fontStyle: 'italic',
  },
  footerActions: {
    marginTop: 24,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  timelineDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  timelineReason: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2,
  },
  noteItem: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#E5E7EB',
  },
  noteText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  noteAuthor: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  noteDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1F2937',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
});
