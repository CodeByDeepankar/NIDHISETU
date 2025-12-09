import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { AppButton } from '@/components/atoms/app-button';
import { AppText } from '@/components/atoms/app-text';
import { WaveHeader } from '@/components/molecules/wave-header';
import { useAppTheme } from '@/hooks/use-app-theme';
import { evidenceRequirementApi, EvidenceRequirementRecord } from '@/services/api/evidenceRequirements';
import { useAuthStore } from '@/state/authStore';

// --- Constants & Options ---
const INVOICE_TYPES = [
  'Product Purchase Invoice',
  'Machine Purchase Invoice',
  'Vehicle Purchase Invoice',
  'Service Bill',
  'GST Invoice',
  'Non-GST Invoice',
  'Other',
];

const REQUIRED_FIELDS_OPTIONS = [
  'Vendor Name',
  'Invoice Number',
  'Invoice Date',
  'Total Amount',
  'GSTIN',
  'Item Details',
  'Vendor Address',
  'Signature/Stamp',
  'QR Code',
];

const FRAUD_CHECKS_OPTIONS = [
  'Digital Editing/Cloning Detection',
  'GSTIN Format Check',
  'Invoice Number Format Check',
  'Font + Alignment Consistency',
  'Logo Authenticity Check',
  'Line Item vs Total Validation',
  'Missing Mandatory Fields',
  'Metadata/Manipulation Anomalies',
];

const IMAGE_QUALITY_OPTIONS = ['Good', 'High', 'Very High'];

// --- Helper Functions ---
export const buildAIRequestMetadata = (requirement: Partial<EvidenceRequirementRecord>) => {
  return {
    expected_document: requirement.document_name,
    response_type: requirement.response_type,
    invoice_type: requirement.invoice_type,
    fields_to_extract: requirement.required_fields,
    fraud_detection_rules: requirement.fraud_checks,
    quality: requirement.image_quality,
    unique_model_id: requirement.model_or_id
  };
};

export const InvoiceRequirementFormScreen = () => {
  const navigation = useNavigation();
  const theme = useAppTheme();
  
  // Get current user ID (Officer ID)
  const officerId = useAuthStore((state) => state.profile?.id);

  // --- Form State ---
  const [documentName, setDocumentName] = useState('');
  const [fileUploadEnabled, setFileUploadEnabled] = useState(true);
  const [responseType] = useState('Invoice / Bill'); // Read-only
  const [invoiceType, setInvoiceType] = useState<string>(''); // Required
  const [customInvoiceType, setCustomInvoiceType] = useState(''); // For "Other"
  const [requiredFields, setRequiredFields] = useState<string[]>([]);
  const [fraudChecks, setFraudChecks] = useState<string[]>([]);
  const [modelOrId, setModelOrId] = useState('');
  const [imageQuality, setImageQuality] = useState('Good');
  const [notes, setNotes] = useState('');

  // UI States
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);

  // --- Validation Logic ---
  useEffect(() => {
    const isDocNameValid = documentName.trim().length > 0;
    const isInvoiceTypeValid = invoiceType === 'Other' ? customInvoiceType.trim().length > 0 : invoiceType.length > 0;
    // User requirements say: "Save button disabled until form is valid"
    // "At least ONE Required Invoice Field -> recommended (warn if empty)" - implying it might not block save legally but recommended. 
    // However, strict validation ensures better data. Let's block save if primary fields are missing.
    setIsValid(isDocNameValid && isInvoiceTypeValid);
  }, [documentName, invoiceType, customInvoiceType]);

  const toggleSelection = (item: string, current: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const handleSave = async () => {
    if (!isValid) return;
    if (requiredFields.length === 0) {
      Alert.alert(
        'Warning',
        'No Required Invoice Fields selected. It is recommended to select at least one field for AI extraction.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Save Anyway', onPress: submitForm }
        ]
      );
    } else {
      submitForm();
    }
  };

  const submitForm = async () => {
    setLoading(true);
    try {
      const finalInvoiceType = invoiceType === 'Other' ? customInvoiceType : invoiceType;

      const payload: Partial<EvidenceRequirementRecord> = {
        type: 'invoice_requirement',
        document_name: documentName.trim(),
        file_upload_enabled: fileUploadEnabled,
        response_type: responseType,
        invoice_type: finalInvoiceType,
        required_fields: requiredFields,
        fraud_checks: fraudChecks,
        model_or_id: modelOrId.trim(),
        image_quality: imageQuality as 'good' | 'best' | 'low', // Needs casting or mapping if strict
        notes: notes.trim(),
        officer_id: officerId,
        // Existing fields for backward compatibility if needed by table constraints
        label: documentName.trim(), // Mapping to existing 'label' column too
        status: 'required',
      };

      // 1. Save to Supabase
      const savedRecord = await evidenceRequirementApi.create(payload as any);

      // 2. Generate AI Metadata (Requirement asked to generate it, though typically this happens on consumption)
      const aiMetadata = buildAIRequestMetadata(payload);
      console.log('AI Metadata generated:', aiMetadata);

      Alert.alert('Success', 'Requirement saved successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save requirement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- Components ---

  const CheckboxRow = ({ label, selected, onPress }: { label: string, selected: boolean, onPress: () => void }) => (
    <TouchableOpacity style={styles.checkboxRow} onPress={onPress}>
       <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
          {selected && <Ionicons name="checkmark" size={14} color="white" />}
       </View>
       <AppText style={styles.checkboxLabel}>{label}</AppText>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <WaveHeader title="Invoice Requirement" onBack={() => navigation.goBack()} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        {/* 1. Document Name */}
        <View style={styles.formGroup}>
          <AppText style={styles.label}>Document Name <AppText style={{color: 'red'}}>*</AppText></AppText>
          <TextInput
            style={styles.textInput}
            value={documentName}
            onChangeText={setDocumentName}
            placeholder="Enter the invoice or bill name"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* 2. File Upload Toggle */}
        <View style={styles.rowBetween}>
          <AppText style={styles.label}>Allow upload from gallery</AppText>
          <Switch
            value={fileUploadEnabled}
            onValueChange={setFileUploadEnabled}
            trackColor={{ false: '#D1D5DB', true: theme.colors.primary }}
            thumbColor={'#FFFFFF'}
          />
        </View>

        {/* 3. Response Type (Read-only) */}
        <View style={styles.formGroup}>
          <AppText style={styles.label}>Response Type <AppText style={{color: 'red'}}>*</AppText></AppText>
          <View style={styles.readOnlyInput}>
            <AppText style={{ color: '#6B7280' }}>{responseType}</AppText>
            <Ionicons name="lock-closed-outline" size={16} color="#9CA3AF" />
          </View>
        </View>

        {/* 4. Invoice Type */}
        <View style={styles.formGroup}>
          <AppText style={styles.label}>Invoice Type <AppText style={{color: 'red'}}>*</AppText></AppText>
          <TouchableOpacity 
            style={styles.dropdownButton} 
            onPress={() => setShowInvoiceModal(true)}
          >
            <AppText style={invoiceType ? styles.dropdownText : styles.placeholderText}>
              {invoiceType || 'Select Invoice Type'}
            </AppText>
            <Ionicons name="chevron-down" size={20} color="#6B7280" />
          </TouchableOpacity>
          
          {invoiceType === 'Other' && (
             <TextInput
               style={[styles.textInput, { marginTop: 8 }]}
               value={customInvoiceType}
               onChangeText={setCustomInvoiceType}
               placeholder="Enter custom invoice type"
               placeholderTextColor="#9CA3AF"
             />
          )}
        </View>

        {/* 5. Required Invoice Fields */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Required Invoice Fields</AppText>
          <View style={styles.checkboxGroup}>
             {REQUIRED_FIELDS_OPTIONS.map(opt => (
               <CheckboxRow 
                  key={opt} 
                  label={opt} 
                  selected={requiredFields.includes(opt)} 
                  onPress={() => toggleSelection(opt, requiredFields, setRequiredFields)} 
               />
             ))}
          </View>
        </View>

        {/* 6. Fraud Detection Rules */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Fraud Detection Rules</AppText>
          <View style={styles.checkboxGroup}>
             {FRAUD_CHECKS_OPTIONS.map(opt => (
               <CheckboxRow 
                  key={opt} 
                  label={opt} 
                  selected={fraudChecks.includes(opt)} 
                  onPress={() => toggleSelection(opt, fraudChecks, setFraudChecks)} 
               />
             ))}
          </View>
        </View>

        {/* 7. Model / Unique ID */}
        <View style={styles.formGroup}>
          <AppText style={styles.label}>Model / Unique Identification (Optional)</AppText>
          <TextInput
            style={styles.textInput}
            value={modelOrId}
            onChangeText={setModelOrId}
            placeholder="Machine model, vehicle number, etc."
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* 8. Image Quality */}
        <View style={styles.formGroup}>
           <AppText style={styles.label}>Image Quality <AppText style={{color: 'red'}}>*</AppText></AppText>
           <TouchableOpacity 
             style={styles.dropdownButton} 
             onPress={() => setShowQualityModal(true)}
           >
             <AppText style={styles.dropdownText}>{imageQuality}</AppText>
             <Ionicons name="chevron-down" size={20} color="#6B7280" />
           </TouchableOpacity>
        </View>

        {/* 9. Additional Notes */}
        <View style={styles.formGroup}>
          <AppText style={styles.label}>Additional Notes (Optional)</AppText>
          <TextInput
            style={[styles.textInput, { height: 100, textAlignVertical: 'top' }]}
            value={notes}
            onChangeText={setNotes}
            multiline
            placeholder="Add any specific instructions for the beneficiary..."
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* 10. Save Button */}
        <View style={styles.footer}>
           <AppButton
             label={loading ? 'Saving...' : 'Save Requirement'}
             onPress={handleSave}
             disabled={!isValid || loading}
             loading={loading}
           />
        </View>

      </ScrollView>

      {/* Picker Modal Reuse */}
      <PickerModal 
         visible={showInvoiceModal}
         title="Select Invoice Type"
         options={INVOICE_TYPES}
         onSelect={setInvoiceType}
         selected={invoiceType}
         onClose={() => setShowInvoiceModal(false)}
      />

      <PickerModal 
         visible={showQualityModal}
         title="Select Image Quality"
         options={IMAGE_QUALITY_OPTIONS}
         onSelect={setImageQuality}
         selected={imageQuality}
         onClose={() => setShowQualityModal(false)}
      />

    </View>
  );
};

// --- Reusable Modal Component ---
const PickerModal = ({ visible, title, options, selected, onSelect, onClose }: any) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
           <AppText style={styles.modalTitle}>{title}</AppText>
           <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#6B7280" /></TouchableOpacity>
        </View>
        <ScrollView style={{ maxHeight: 400 }}>
          {options.map((opt: string) => (
            <TouchableOpacity 
              key={opt}
              style={[styles.modalItem, opt === selected && styles.modalItemSelected]}
              onPress={() => { onSelect(opt); onClose(); }}
            >
              <AppText style={[styles.modalItemText, opt === selected && styles.modalItemTextSelected]}>{opt}</AppText>
              {opt === selected && <Ionicons name="checkmark" size={20} color="#4F46E5" />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  formGroup: {
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#111827',
  },
  readOnlyInput: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 15,
    color: '#111827',
  },
  placeholderText: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  checkboxGroup: {
    gap: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: 'white',
  },
  checkboxSelected: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#374151',
  },
  footer: {
    marginTop: 20,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalItemSelected: {
    backgroundColor: '#F5F3FF',
  },
  modalItemText: {
    fontSize: 16,
    color: '#374151',
  },
  modalItemTextSelected: {
    color: '#4F46E5',
    fontWeight: '600',
  },
});
