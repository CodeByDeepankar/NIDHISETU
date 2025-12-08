import React, { useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { useAuthStore } from "@/state/authStore";
import { AppText } from "@/components/atoms/app-text";
import { useT } from "lingo.dev/react";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { AppTheme } from "@/constants/theme";

const { width } = Dimensions.get("window");

export const BeneficiaryProfileScreen = ({ navigation }: any) => {
  const profile = useAuthStore((state) => state.profile);
    const t = useT();
    const theme = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const gradientColors = useMemo(() => [theme.colors.gradientStart, theme.colors.gradientEnd], [theme]);
    const waveFill = theme.colors.background;

  // Force refresh image by appending timestamp if avatarUrl exists
  const avatarUrl = useMemo(() => {
    if (!profile?.avatarUrl) return null;
    // If url already has query params, append with &, else ?
    const separator = profile.avatarUrl.includes("?") ? "&" : "?";
    return `${profile.avatarUrl}${separator}refresh=${Date.now()}`; // Force refresh on mount
  }, [profile?.avatarUrl]);

  // Mock data if profile is missing some fields
  const userProfile = useMemo(
    () => ({
      name: profile?.name || "Ramesh Kumar",
      id: profile?.id || "BEN-2024-001",
      loanCategory: (profile as any)?.scheme || "PM SVANidhi - Street Vendor",
      phone: profile?.mobile || "+91 98765 43210",
      email: (profile as any)?.email || "ramesh.kumar@example.com",
      address: (profile as any)?.village
        ? `${(profile as any).village}, ${(profile as any).district}`
        : "123, Market Road, Sector 4, New Delhi - 110001",
      kycStatus: (profile as any)?.kycStatus || "Verified",
      avatar:
        avatarUrl ||
        `https://randomuser.me/api/portraits/men/${parseInt(profile?.mobile?.slice(-2) || "32") % 100}.jpg`, // Placeholder
    }),
    [profile, avatarUrl]
  );

  const renderInfoRow = ({ icon, label, value, isStatus }: InfoRowProps) => (
    <View style={styles.infoRow}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={20} color={theme.colors.primary} />
      </View>
      <View style={styles.infoContent}>
        <AppText style={styles.infoLabel}>{label}</AppText>
        <AppText
          style={[styles.infoValue, isStatus && styles.statusValue]}
          translate={false}
        >
          {value}
        </AppText>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header with Wave */}
      <View style={styles.headerContainer}>
        <LinearGradient colors={gradientColors} style={styles.gradientHeader} />
        <View style={styles.waveContainer}>
          <Svg
            height="100"
            width={width}
            viewBox="0 0 1440 320"
            style={styles.wave}
          >
            <Path
              fill={waveFill}
              d="M0,128L48,138.7C96,149,192,171,288,170.7C384,171,480,149,576,133.3C672,117,768,107,864,112C960,117,1056,139,1152,149.3C1248,160,1344,160,1392,160L1440,160L1440,320L0,320Z"
            />
          </Svg>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Image */}
        <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: userProfile.avatar }}
            style={styles.profileImage}
          />
          <View style={styles.verifiedBadge}>
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={theme.colors.success}
            />
          </View>
        </View>

        {/* Name and ID */}
        <View style={styles.nameSection}>
          <AppText style={styles.nameText} translate={false}>
            {userProfile.name}
          </AppText>
          <AppText style={styles.idText} translate={false}>
            {`${t("ID")}: ${userProfile.id}`}
          </AppText>
        </View>

        {/* Info Cards */}
        <View style={styles.infoSection}>
          {renderInfoRow({
            icon: "briefcase-outline",
            label: t("Loan Category"),
            value: userProfile.loanCategory,
          })}
          {renderInfoRow({
            icon: "call-outline",
            label: t("Phone"),
            value: userProfile.phone,
          })}
          {renderInfoRow({
            icon: "mail-outline",
            label: t("Email"),
            value: userProfile.email,
          })}
          {renderInfoRow({
            icon: "location-outline",
            label: t("Address"),
            value: userProfile.address,
          })}
          {renderInfoRow({
            icon: "shield-checkmark-outline",
            label: t("KYC Status"),
            value: t(userProfile.kycStatus, userProfile.kycStatus),
            isStatus: true,
          })}
        </View>
      </ScrollView>

      {/* Floating Header Buttons */}
      <SafeAreaView edges={["top"]} style={styles.floatingHeader}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.colors.onPrimary}
            />
          </TouchableOpacity>
          <AppText style={styles.headerTitle}>{t("My Profile")}</AppText>
          <TouchableOpacity
            onPress={() => navigation.navigate("EditProfile")}
            style={styles.editButton}
          >
            <Ionicons
              name="create-outline"
              size={24}
              color={theme.colors.onPrimary}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};
type InfoRowProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
  isStatus?: boolean;
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    headerContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 240,
      zIndex: 0,
    },
    floatingHeader: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
    },
    gradientHeader: {
      flex: 1,
      paddingBottom: 40,
    },
    headerContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 10,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.colors.onPrimary,
    },
    backButton: {
      padding: 8,
    },
    editButton: {
      padding: 8,
    },
    waveContainer: {
      position: "absolute",
      bottom: -1,
      left: 0,
      right: 0,
      zIndex: 1,
    },
    wave: {
      width: "100%",
    },
    scrollContent: {
      paddingTop: 160,
      paddingBottom: 40,
      alignItems: "center",
      zIndex: 10,
    },
    profileImageContainer: {
      marginBottom: 16,
      position: "relative",
      zIndex: 20,
      shadowColor: theme.colors.border,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: theme.mode === "dark" ? 0.6 : 0.3,
      shadowRadius: 4,
      elevation: 6,
    },
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 4,
      borderColor: theme.colors.surface,
    },
    verifiedBadge: {
      position: "absolute",
      bottom: 0,
      right: 0,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 2,
    },
    nameSection: {
      alignItems: "center",
      marginBottom: 24,
    },
    nameText: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    idText: {
      fontSize: 14,
      color: theme.colors.subtext,
      marginTop: 4,
    },
    infoSection: {
      width: "90%",
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 24,
      gap: 20,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primaryContainer,
      justifyContent: "center",
      alignItems: "center",
    },
    infoContent: {
      flex: 1,
    },
    infoLabel: {
      fontSize: 12,
      color: theme.colors.subtext,
      marginBottom: 2,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    infoValue: {
      fontSize: 16,
      color: theme.colors.text,
      fontWeight: "500",
    },
    statusValue: {
      color: theme.colors.success,
      fontWeight: "bold",
    },
  });
