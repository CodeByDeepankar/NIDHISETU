import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { evidenceRequirementApi, type EvidenceRequirementRecord } from "@/services/api/evidenceRequirements";
import { submissionRepository } from "@/services/api/submissionRepository";
import type { SubmissionEvidence } from "@/types/entities";
import { useAuthStore } from "@/state/authStore";
import { useNavigation } from "@react-navigation/native";

const HEADER_COLOR = "#A7FFEB";
const CARD_BORDER = "#E5E7EB";
const PURPLE = "#6C63FF";

function EvidenceTasksScreen() {
  const navigation = useNavigation<any>();
  const styles = useMemo(() => createStyles(), []);
  const beneficiaryId = useAuthStore((s) => s.profile?.id);
  const beneficiaryMobile = useAuthStore((s) => s.profile?.mobile ?? s.mobile);

  const [requirements, setRequirements] = useState<EvidenceRequirementRecord[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionEvidence[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!beneficiaryId && !beneficiaryMobile) return;
    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        const primaryKey = beneficiaryId || beneficiaryMobile || "";
        const [primaryReq, primarySub] = await Promise.all([
          primaryKey ? evidenceRequirementApi.list(primaryKey) : [],
          primaryKey ? submissionRepository.listByBeneficiary(primaryKey) : [],
        ]);

        if (!active) return;

        let foundReq = primaryReq;
        let foundSub = primarySub;

        if (!primaryReq.length && beneficiaryMobile && beneficiaryMobile !== primaryKey) {
          const fallbackReq = await evidenceRequirementApi.list(beneficiaryMobile);
          if (!active) return;
          foundReq = fallbackReq;
        }

        setRequirements(foundReq);
        setSubmissions(foundSub);
      } catch (err) {
        console.error("Load evidence tasks failed", err);
        if (active) Alert.alert("Error", "Unable to load evidence tasks");
      } finally {
        if (active) setLoading(false);
      }
    };

      const load = async () => {
        setLoading(true);
        try {
          const primaryKey = beneficiaryId || beneficiaryMobile || '';
          
          if (!primaryKey) {
             setLoading(false);
             return;
          }

          const [primaryReq, primarySub] = await Promise.all([
            evidenceRequirementApi.list(primaryKey).catch(err => {
                console.error('Failed to load requirements:', JSON.stringify(err, null, 2));
                return [];
            }),
            submissionRepository.listByBeneficiary(primaryKey).catch(err => {
                console.error('Failed to load submissions:', JSON.stringify(err, null, 2));
                return [];
            })
          ]);
          
          if (!active) return;
          
          let foundReq = primaryReq;
          let foundSub = primarySub;

          if (!primaryReq.length && beneficiaryMobile && beneficiaryMobile !== primaryKey) {
            const fallbackReq = await evidenceRequirementApi.list(beneficiaryMobile).catch(() => []);
             if (!active) return;
             if (fallbackReq.length) foundReq = fallbackReq;
          }
          setRequirements(foundReq);
          setSubmissions(foundSub);
        } catch (err) {
          console.error('Load evidence tasks failed', err);
          if (active) Alert.alert('Error', 'Unable to load evidence tasks');
        } finally {
          if (active) setLoading(false);
        }
      };
    load();
    return () => {
      active = false;
    };
  }, [beneficiaryId, beneficiaryMobile]);

  const handleUploadPress = (req: EvidenceRequirementRecord) => {
    const allowCamera = req.permissions?.camera !== false;
    const allowFiles = req.permissions?.fileUpload !== false;

    if (!allowCamera && !allowFiles) {
      Alert.alert("Not Allowed", "Uploads are disabled for this requirement.");
      return;
    }

    const goCamera = () =>
      navigation.navigate("UploadEvidence", {
        requirementId: req.id,
        requirementName: req.label,
        startWithLibrary: false,
      });
    const goFiles = () =>
      navigation.navigate("UploadEvidence", {
        requirementId: req.id,
        requirementName: req.label,
        startWithLibrary: true,
      });

    if (allowCamera && allowFiles) {
      Alert.alert("Choose source", "Select how you want to upload", [
        { text: "Camera", onPress: goCamera },
        { text: "Files", onPress: goFiles },
        { text: "Cancel", style: "cancel" },
      ]);
      return;
    }

    if (allowCamera) {
      goCamera();
      return;
    }

    if (allowFiles) {
      goFiles();
    }
  };

  const renderCard = (req: EvidenceRequirementRecord) => {
    const submission = submissions.find((s) => s.requirementId === req.id);
    const bullets = [
      `Camera: ${req.permissions?.camera === false ? "Disabled" : "Allowed"}`,
      `Files: ${req.permissions?.fileUpload === false ? "Disabled" : "Allowed"}`,
      req.response_type ? `Type: ${req.response_type}` : null,
      req.model ? `Model: ${req.model}` : null,
      req.image_quality ? `Quality: ${req.image_quality}` : null,
    ].filter(Boolean) as string[];

    return (
      <TaskCard
        key={req.id}
        title={req.label}
        subtitle={req.instructions}
        bullets={bullets}
        onUpload={() => handleUploadPress(req)}
        isPending={Boolean(submission)}
        styles={styles}
      />
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[HEADER_COLOR, HEADER_COLOR]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.8}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Evidence Tasks</Text>
            <View style={{ width: 24 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Officer-assigned evidence</Text>
        <Text style={styles.sectionSubtitle}>
          Select a task and upload as per the allowed sources.
        </Text>

        {loading ? (
          <View style={styles.loaderRow}>
            <ActivityIndicator size="small" color={PURPLE} />
            <Text style={styles.loaderText}>Loading tasks...</Text>
          </View>
        ) : requirements.length === 0 ? (
          <Text style={styles.emptyText}>No evidence tasks available.</Text>
        ) : (
          requirements.map((req) => {
            const submission = submissions.find(s => s.requirementId === req.id);
            return (
            <TouchableOpacity 
              key={req.id} 
              style={[styles.card, { borderColor: theme.colors.border }]}
              disabled={req.status !== 'submitted' || !submission}
              onPress={() => {
                if (submission) {
                  navigation.navigate('SubmissionDetail', { submission });
                }
              }}
              activeOpacity={0.7}
            > 
              <View style={styles.cardHeader}>
                <AppIcon name="clipboard-text-outline" size={20} color={theme.colors.secondary} />
                <View style={{ flex: 1 }}>
                  <AppText variant="titleSmall" color="text">{req.label}</AppText>
                  {req.instructions ? (
                    <AppText variant="labelSmall" color="muted" numberOfLines={2}>{req.instructions}</AppText>
                  ) : null}
                  <View style={styles.metaRow}>
                    <AppText variant="labelSmall" color="muted">Camera: {req.permissions?.camera === false ? 'Disabled' : 'Allowed'}</AppText>
                    <AppText variant="labelSmall" color="muted">Files: {req.permissions?.fileUpload === false ? 'Disabled' : 'Allowed'}</AppText>
                  </View>
                  <View style={styles.metaRow}>
                    {req.response_type ? (
                      <AppText variant="labelSmall" color="muted">Type: {req.response_type}</AppText>
                    ) : null}
                    {req.model ? (
                      <AppText variant="labelSmall" color="muted">Model: {req.model}</AppText>
                    ) : null}
                    {req.image_quality ? (
                      <AppText variant="labelSmall" color="muted">Quality: {req.image_quality}</AppText>
                    ) : null}
                  </View>
                </View>
              </View>
              {submission || req.status === 'submitted' ? (
                <AppButton
                  label="Pending for Review"
                  tone="secondary"
                  icon="clock-check-outline"
                  disabled
                  style={styles.uploadButton}
                />
              ) : (
                <AppButton
                  label="Upload"
                  tone="secondary"
                  icon="cloud-upload-outline"
                  onPress={() => handleUploadPress(req)}
                  style={styles.uploadButton}
                />
              )}
            </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

type TaskCardProps = {
  title: string;
  subtitle?: string;
  bullets: string[];
  onUpload: () => void;
  isPending: boolean;
  styles: ReturnType<typeof createStyles>;
};

const TaskCard = ({ title, subtitle, bullets, onUpload, isPending, styles }: TaskCardProps) => (
  <View style={styles.card}>
    <View style={styles.cardHeaderRow}>
      <Ionicons name="document-text-outline" size={28} color={PURPLE} />
      <Text style={styles.cardTitle} numberOfLines={2}>
        {title}
      </Text>
    </View>

    {subtitle ? (
      <Text style={styles.cardSubtitle} numberOfLines={3}>
        {subtitle}
      </Text>
    ) : null}

    <View style={styles.bulletList}>
      {bullets.map((item) => (
        <Text key={item} style={styles.bulletItem}>
          • {item}
        </Text>
      ))}
    </View>

    {isPending ? (
      <View style={[styles.uploadButton, styles.uploadButtonDisabled]}>
        <View style={styles.uploadContent}>
          <Ionicons name="time-outline" size={20} color="#FFFFFF" />
          <Text style={styles.uploadText}>Pending for Review</Text>
        </View>
      </View>
    ) : (
      <TouchableOpacity activeOpacity={0.85} onPress={onUpload} style={styles.uploadButton}>
        <View style={styles.uploadContent}>
          <Ionicons name="cloud-upload-outline" size={22} color="#FFFFFF" />
          <Text style={styles.uploadText}>Upload</Text>
        </View>
      </TouchableOpacity>
    )}
  </View>
);

const createStyles = () =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFFFFF" },
    header: {
      paddingTop: 50,
      paddingBottom: 25,
      paddingHorizontal: 20,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: "#000",
    },
    content: {
      padding: 20,
      paddingBottom: 40,
      gap: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: "#000",
    },
    sectionSubtitle: {
      color: "#666",
      marginBottom: 6,
      fontSize: 14,
    },
    loaderRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingVertical: 8,
    },
    loaderText: {
      color: "#666",
      fontSize: 14,
    },
    emptyText: {
      color: "#666",
      fontSize: 14,
    },
    card: {
      backgroundColor: "#FFFFFF",
      padding: 20,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: CARD_BORDER,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 4,
      elevation: 3,
      gap: 10,
    },
    cardHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginLeft: 10,
      color: "#000",
      flex: 1,
      flexWrap: "wrap",
    },
    cardSubtitle: {
      color: "#666",
      marginTop: 2,
      fontSize: 14,
    },
    bulletList: {
      marginTop: 10,
      gap: 4,
    },
    bulletItem: {
      color: "#444",
      marginBottom: 2,
      fontSize: 14,
    },
    uploadButton: {
      backgroundColor: PURPLE,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
    },
    uploadButtonDisabled: {
      opacity: 0.8,
    },
    uploadContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    uploadText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 8,
    },
  });

export { EvidenceTasksScreen };
export default EvidenceTasksScreen;
