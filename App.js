 // App.js

import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import {
  Feather,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

// ❗ CORRECT IMPORTS FOR TRANSLATION
import LocalizeProvider from "./src/i18n/LocalizeProvider";
import { useT, useAppLocale } from "lingo.dev/react"; // resolved by shim
import LanguageSwitcher from "./src/components/LanguageSwitcher";

// ---------------- ICON SHORTCUTS ----------------
const Icon = {
  Bell: (props) => <Feather name="bell" {...props} />,
  Settings: (props) => <Feather name="settings" {...props} />,
  TrendingUp: (props) => <Feather name="trending-up" {...props} />,
  Download: (props) => <Feather name="download" {...props} />,
  Share2: (props) => <Feather name="share-2" {...props} />,
  Eye: (props) => <Feather name="eye" {...props} />,
  Calendar: (props) => <Feather name="calendar" {...props} />,
  Clock: (props) => <Feather name="clock" {...props} />,
  CheckCircle: (props) => <Feather name="check-circle" {...props} />,
  AlertCircle: (props) => <MaterialIcons name="error-outline" {...props} />,
  ChevronRight: (props) => <Feather name="chevron-right" {...props} />,
  Home: (props) => <Feather name="home" {...props} />,
  FileText: (props) => <Feather name="file-text" {...props} />,
  Wallet: (props) => <MaterialCommunityIcons name="wallet" {...props} />,
  User: (props) => <Feather name="user" {...props} />,
  Upload: (props) => <Feather name="upload" {...props} />,
  Camera: (props) => <Feather name="camera" {...props} />,
  Receipt: (props) => <MaterialIcons name="receipt" {...props} />,
  Building: (props) => (
    <MaterialCommunityIcons name="office-building" {...props} />
  ),
};

// ---------------- UPLOAD ITEM COMPONENT ----------------
function UploadItem({ title, status, isLast, textMain, textSub, isDark }) {
  const t = useT();

  const getIcon = () => {
    switch (title) {
      case "Asset Photo":
      case "Selfie with Asset":
        return Icon.Camera;
      case "Invoice/Bill":
        return Icon.Receipt;
      case "Workshop Photo":
        return Icon.Building;
      default:
        return Icon.FileText;
    }
  };

  const rowBg = isDark ? "#111827" : "#FFFFFF";
  const rowBorder = isDark ? "#334155" : "#F3F4F6";
  const ItemIcon = getIcon();

  return (
    <View
      style={[
        styles.uploadRow,
        !isLast && styles.uploadRowBorder,
        { backgroundColor: rowBg, borderColor: rowBorder },
      ]}
    >
      <View style={[styles.uploadIconWrap, { backgroundColor: "#DBEAFE" }]}>
        <ItemIcon size={22} color="#2563EB" />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={[styles.uploadTitle, { color: textMain }]}>
          {t(title)}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {status === "not-uploaded" && (
            <View style={styles.badgeOrange}>
              <Text
                style={[
                  styles.badgeOrangeText,
                  { color: isDark ? "#FF9A5F" : "#C2410C" },
                ]}
              >
                {t("Not Uploaded")}
              </Text>
            </View>
          )}

          {status === "uploaded" && (
            <View style={styles.badgeGreen}>
              <Icon.CheckCircle size={12} color="#047857" />
              <Text style={styles.badgeGreenText}> {t("Uploaded")}</Text>
            </View>
          )}

          {status === "pending" && (
            <View style={styles.badgeBlue}>
              <Text style={styles.badgeBlueText}>{t("Pending Review")}</Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.uploadButton,
          {
            backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
            borderColor: isDark ? "#334155" : "#DBEAFE",
          },
        ]}
      >
        <Icon.Upload size={16} color="#2563EB" />
        <Text style={[styles.uploadButtonText, { color: textMain }]}>
          {" "}
          {t("Upload")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ---------------- MAIN UI COMPONENT ----------------
function MainApp() {
  const [activeTab, setActiveTab] = useState("home");
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => setIsDark(!isDark);

  // LOCALIZATION HOOKS
  const t = useT();
  const { setLocale } = useAppLocale();

  // THEME HELPERS
  const cardBg = isDark ? "#1E293B" : "#FFFFFF";
  const cardBorder = isDark ? "#334155" : "#E5E7EB";
  const textMain = isDark ? "#F9FAFB" : "#111827";
  const textSub = isDark ? "#CBD5E1" : "#6B7280";

  // ---------------- RENDER ----------------
  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        style={[
          styles.root,
          { backgroundColor: isDark ? "#0F172A" : "#F3F4F6" },
        ]}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* ---------------- HEADER ---------------- */}
          <View style={styles.headerWrapper}>
            <LinearGradient
              colors={["#2563EB", "#3B82F6", "#60A5FA"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerGradient}
            >
              <View style={[styles.circle, styles.circleTopRight]} />
              <View style={[styles.circle, styles.circleBottomLeft]} />

              <View style={{ zIndex: 1 }}>
                <View style={styles.headerTopRow}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity
                      style={styles.menuButton}
                      onPress={() => setIsDashboardOpen(true)}
                    >
                      <Feather name="menu" size={20} color="#FFFFFF" />
                    </TouchableOpacity>

                    <View>
                      <Text style={styles.headerWelcome}>
                        {t("Welcome back")}
                      </Text>
                      <Text style={styles.headerName}>{t("Swastik Kumar")}</Text>
                    </View>
                  </View>

                  {/* RIGHT ICONS */}
                  <View style={styles.headerIconsRow}>
                    <TouchableOpacity style={styles.headerIconButton}>
                      <Icon.Bell size={18} color="#FFFFFF" />
                      <View style={styles.headerDot} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.headerIconButton}>
                      <Icon.Settings size={18} color="#FFFFFF" />
                    </TouchableOpacity>

                    {/* LANGUAGE QUICK SWITCH (Hindi) */}
                    <TouchableOpacity
                      style={[
                        styles.headerIconButton,
                        styles.languageIconButton,
                      ]}
                      onPress={() => setLocale("hi")}
                    >
                      <Text style={styles.languageIconLabel}>{t("हिन्दी")}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* FULL LANGUAGE SWITCHER */}
                <LanguageSwitcher />

                <Text style={styles.translationHelper}>
                  {t("Welcome to our App")}
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* ---------------- QUICK STATS ---------------- */}
          <View style={styles.quickStatsRow}>
            <View style={[styles.quickCard, { marginRight: 8 }]}>
              <View style={styles.quickIconWrapGreen}>
                <Icon.CheckCircle size={16} color="#BBF7D0" />
              </View>
              <Text style={styles.quickLabel}>{t("Active")}</Text>
              <Text style={styles.quickValue}>{t("1")} {t("Loan")}</Text>
            </View>

            <View style={[styles.quickCard, { marginHorizontal: 4 }]}>
              <View style={styles.quickIconWrapOrange}>
                <Icon.Clock size={16} color="#FFEDD5" />
              </View>
              <Text style={styles.quickLabel}>{t("Pending")}</Text>
              <Text style={styles.quickValue}>{t("2")} {t("Tasks")}</Text>
            </View>

            <View style={[styles.quickCard, { marginLeft: 8 }]}>
              <View style={styles.quickIconWrapBlue}>
                <Icon.TrendingUp size={16} color="#DBEAFE" />
              </View>
              <Text style={styles.quickLabel}>{t("Status")}</Text>
              <Text style={styles.quickValue}>{t("Good")}</Text>
            </View>
          </View>

          {/* ---------------- LOAN CARD ---------------- */}
          <View
            style={[
              styles.loanCard,
              { backgroundColor: cardBg, borderColor: cardBorder },
            ]}
          >
            <LinearGradient
              colors={["#2563EB", "#1D4ED8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.loanHeader}
            >
              <View style={[styles.circleSmall, styles.circleLoanTopRight]} />

              <View style={{ zIndex: 1 }}>
                <View style={styles.loanHeaderTopRow}>
                  <View style={styles.badgeWhiteOutline}>
                    <Text style={styles.badgeWhiteOutlineText}>
                      {t("PMEGP Loan")}
                    </Text>
                  </View>
                  <View style={styles.badgeGreenSolid}>
                    <Icon.CheckCircle size={12} color="#ECFDF5" />
                    <Text style={styles.badgeGreenSolidText}>
                      {" "}
                      {t("Sanctioned")}
                    </Text>
                  </View>
                </View>

                <Text style={styles.loanLabel}>{t("Sanctioned Amount")}</Text>
                <Text style={styles.loanAmount}>{t("₹3,08,568")}</Text>
                <Text style={styles.loanId}>
                  {t("Loan ID")}: {t("LN-0002")}
                </Text>
              </View>
            </LinearGradient>
            {/* QUICK ACTIONS */}
            <View
              style={[
                styles.actionRow,
                {
                  backgroundColor: isDark ? "#1E293B" : "#F9FAFB",
                  borderColor: isDark ? "#334155" : "#E5E7EB",
                },
              ]}
            >
              <TouchableOpacity style={styles.actionItem}>
                <View
                  style={[
                    styles.actionIconWrap,
                    { backgroundColor: "#DBEAFE" },
                  ]}
                >
                  <Icon.Eye size={20} color="#2563EB" />
                </View>
                <Text style={[styles.actionLabel, { color: textMain }]}>
                  {t("View")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionItem}>
                <View
                  style={[
                    styles.actionIconWrap,
                    { backgroundColor: "#DBEAFE" },
                  ]}
                >
                  <Icon.Download size={20} color="#2563EB" />
                </View>
                <Text style={[styles.actionLabel, { color: textMain }]}>
                  {t("Download")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionItem}>
                <View
                  style={[
                    styles.actionIconWrap,
                    { backgroundColor: "#DBEAFE" },
                  ]}
                >
                  <Icon.Share2 size={20} color="#2563EB" />
                </View>
                <Text style={[styles.actionLabel, { color: textMain }]}>
                  {t("Share")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* LOAN DETAILS */}
            <View style={styles.loanDetails}>
              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <View
                    style={[
                      styles.detailIconWrap,
                      { backgroundColor: "#EFF6FF" },
                    ]}
                  >
                    <Icon.Wallet size={20} color="#2563EB" />
                  </View>
                  <View>
                    <Text style={[styles.detailValue, { color: textMain }]}>
                      {t("Bank Name")}
                    </Text>
                    <Text style={[styles.detailValue, { color: textMain }]}>
                      {t("Punjab National Bank")}
                    </Text>
                  </View>
                </View>
                <Icon.ChevronRight size={18} color="#9CA3AF" />
              </View>

              <View
                style={[
                  styles.detailRow,
                  { borderBottomColor: isDark ? "#334155" : "#E5E7EB" },
                ]}
              >
                <View style={styles.detailLeft}>
                  <View style={styles.detailIconWrap}>
                    <Icon.User size={20} color="#2563EB" />
                  </View>
                  <View>
                    <Text style={[styles.detailValue, { color: textMain }]}>
                      {t("Beneficiary Name")}
                    </Text>
                    <Text style={[styles.detailValue, { color: textMain }]}>
                      {t("Swastik Kumar Purohit")}
                    </Text>
                  </View>
                </View>
                <Icon.ChevronRight size={18} color="#9CA3AF" />
              </View>

              <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                <View style={styles.detailLeft}>
                  <View style={styles.detailIconWrap}>
                    <Icon.Calendar size={20} color="#2563EB" />
                  </View>
                  <View>
                    <Text style={[styles.detailLabel, { color: textSub }]}>
                      {t("Sanctioned Date")}
                    </Text>
                    <Text style={[styles.detailValue, { color: textMain }]}>
                      {t("18 November 2025")}
                    </Text>
                  </View>
                </View>
                <Icon.ChevronRight size={18} color="#9CA3AF" />
              </View>
            </View>

            {/* VIEW COMPLETE DETAILS */}
            <TouchableOpacity style={styles.loanCta}>
              <Text style={styles.loanCtaText}>{t("View Complete Details")}</Text>
              <Icon.ChevronRight size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* GAP */}
          <View style={{ height: 16 }} />

          {/* VERIFICATION PROGRESS */}
          <View style={styles.section}>
            <View
              style={[
                styles.cardWhite,
                { backgroundColor: cardBg, borderColor: cardBorder },
              ]}
            >
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { color: textMain }]}>
                  {t("Verification Progress")}
                </Text>
                <Text style={styles.sectionAccent}>{t("0%")}</Text>
              </View>

              <View style={styles.progressBg}>
                <View style={[styles.progressBar, { width: "0%" }]} />
              </View>

              <Text style={[styles.sectionHint, { color: textSub }]}>
                {t("Complete all required uploads to verify your loan")}
              </Text>
            </View>
          </View>

          {/* REQUIRED UPLOADS */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: textMain }]}>
                {t("Required Uploads")}
              </Text>
              <Text style={[styles.sectionAccentSmall, { color: textMain }]}>
                {t("0/4")} {t("Completed")}
              </Text>
            </View>

            <View
              style={[
                styles.uploadCard,
                { backgroundColor: cardBg, borderColor: cardBorder },
              ]}
            >
              <UploadItem
                title="Asset Photo"
                status="not-uploaded"
                textMain={textMain}
                textSub={textSub}
                isDark={isDark}
              />
              <UploadItem
                title="Selfie with Asset"
                status="not-uploaded"
                textMain={textMain}
                textSub={textSub}
                isDark={isDark}
              />
              <UploadItem
                title="Invoice/Bill"
                status="not-uploaded"
                textMain={textMain}
                textSub={textSub}
                isDark={isDark}
              />
              <UploadItem
                title="Workshop Photo"
                status="not-uploaded"
                isLast
                textMain={textMain}
                textSub={textSub}
                isDark={isDark}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.secondaryButton,
                {
                  backgroundColor: isDark ? "#1E293B" : "#EFF6FF",
                  borderColor: isDark ? "#334155" : "#BFDBFE",
                  borderWidth: 1,
                },
              ]}
            >
              <Text style={[styles.secondaryButtonText, { color: textMain }]}>
                {t("View All Uploads")}
              </Text>
              <Icon.ChevronRight size={18} color="#2563EB" />
            </TouchableOpacity>
          </View>

          {/* PENDING ACTIONS */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: textMain }]}>
                {t("Pending Actions")}
              </Text>
              <TouchableOpacity>
                <Text style={styles.sectionAccentSmall}>{t("View All")}</Text>
              </TouchableOpacity>
            </View>

            {/* LIST ITEMS */}
            <View>
              <View
                style={[
                  styles.listCardRow,
                  { backgroundColor: cardBg, borderColor: cardBorder },
                ]}
              >
                <View style={styles.listIconOrange}>
                  <Icon.FileText size={22} color="#EA580C" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.listTitle, { color: textMain }]}>
                    {t("Document Upload Required")}
                  </Text>
                  <Text style={[styles.listSubtitle, { color: textSub }]}>
                    {t("Submit identity proof")}
                  </Text>
                </View>
                <View style={styles.dotOrange} />
              </View>

              <View
                style={[
                  styles.listCardRow,
                  { backgroundColor: cardBg, borderColor: cardBorder },
                ]}
              >
                <View style={styles.listIconBlue}>
                  <Icon.AlertCircle size={22} color="#2563EB" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.listTitle, { color: textMain }]}>
                    {t("Verify Bank Account")}
                  </Text>
                  <Text style={[styles.listSubtitle, { color: textSub }]}>
                    {t("Complete verification process")}
                  </Text>
                </View>
                <View style={styles.dotBlue} />
              </View>
            </View>
          </View>

          {/* RECENT ACTIVITY */}
          <View style={[styles.section, { marginBottom: 96 }]}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: textMain }]}>
                {t("Recent Activity")}
              </Text>
              <TouchableOpacity>
                <Text style={styles.sectionAccentSmall}>{t("See All")}</Text>
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.activityCard,
                { backgroundColor: cardBg, borderColor: cardBorder },
              ]}
            >
              <View style={styles.activityRow}>
                <View style={styles.activityIconGreen}>
                  <Icon.CheckCircle size={18} color="#16A34A" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.detailLabel, { color: textMain }]}>
                    {t("Sanctioned Date")}
                  </Text>
                  <Text style={[styles.activitySubtitle, { color: textSub }]}>
                    {t("Your PMEGP loan has been approved")}
                  </Text>
                  <Text style={[styles.activityTime, { color: textSub }]}>
                    {t("2 days ago")}
                  </Text>
                </View>
              </View>

              <View style={styles.activityDivider} />

              <View style={styles.activityRow}>
                <View style={styles.activityIconBlue}>
                  <Icon.FileText size={18} color="#2563EB" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.listTitle, { color: textMain }]}>
                    {t("Documents Verified")}
                  </Text>
                  <Text style={[styles.listSubtitle, { color: textSub }]}>
                    {t("All submitted documents approved")}
                  </Text>
                  <Text style={[styles.activityTime, { color: textSub }]}>
                    {t("5 days ago")}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* DASHBOARD OVERLAY */}
        {isDashboardOpen && (
          <View style={styles.dashboardOverlay}>
            <View
              style={[
                styles.dashboardPanel,
                { backgroundColor: isDark ? "#020617" : "#FFFFFF" },
              ]}
            >
              <Text
                style={[
                  styles.dashboardTitle,
                  { color: isDark ? "#E5E7EB" : "#111827" },
                ]}
              >
                {t("Dashboard")}
              </Text>

              {/* HOME */}
              <TouchableOpacity
                style={[
                  styles.dashboardItem,
                  activeTab === "home" && styles.dashboardItemActive,
                ]}
                onPress={() => {
                  setActiveTab("home");
                  setIsDashboardOpen(false);
                }}
              >
                <Icon.Home
                  size={20}
                  color={activeTab === "home" ? "#2563EB" : "#6B7280"}
                />
                <Text
                  style={[
                    styles.dashboardItemText,
                    {
                      color:
                        activeTab === "home"
                          ? "#2563EB"
                          : isDark
                          ? "#E5E7EB"
                          : "#111827",
                    },
                  ]}
                >
                  {t("Home")}
                </Text>
              </TouchableOpacity>

              {/* LOANS */}
              <TouchableOpacity
                style={[
                  styles.dashboardItem,
                  activeTab === "loans" && styles.dashboardItemActive,
                ]}
                onPress={() => {
                  setActiveTab("loans");
                  setIsDashboardOpen(false);
                }}
              >
                <Icon.Wallet
                  size={20}
                  color={activeTab === "loans" ? "#2563EB" : "#6B7280"}
                />
                <Text
                  style={[
                    styles.dashboardItemText,
                    {
                      color:
                        activeTab === "loans"
                          ? "#2563EB"
                          : isDark
                          ? "#E5E7EB"
                          : "#111827",
                    },
                  ]}
                >
                  {t("Loans")}
                </Text>
              </TouchableOpacity>

              {/* DOCUMENTS */}
              <TouchableOpacity
                style={[
                  styles.dashboardItem,
                  activeTab === "documents" && styles.dashboardItemActive,
                ]}
                onPress={() => {
                  setActiveTab("documents");
                  setIsDashboardOpen(false);
                }}
              >
                <Icon.FileText
                  size={20}
                  color={activeTab === "documents" ? "#2563EB" : "#6B7280"}
                />
                <Text
                  style={[
                    styles.dashboardItemText,
                    {
                      color:
                        activeTab === "documents"
                          ? "#2563EB"
                          : isDark
                          ? "#E5E7EB"
                          : "#111827",
                    },
                  ]}
                >
                  {t("Documents")}
                </Text>
              </TouchableOpacity>

              {/* PROFILE */}
              <TouchableOpacity
                style={[
                  styles.dashboardItem,
                  activeTab === "profile" && styles.dashboardItemActive,
                ]}
                onPress={() => {
                  setActiveTab("profile");
                  setIsDashboardOpen(false);
                }}
              >
                <Icon.User
                  size={20}
                  color={activeTab === "profile" ? "#2563EB" : "#6B7280"}
                />
                <Text
                  style={[
                    styles.dashboardItemText,
                    {
                      color:
                        activeTab === "profile"
                          ? "#2563EB"
                          : isDark
                          ? "#E5E7EB"
                          : "#111827",
                    },
                  ]}
                >
                  {t("Profile")}
                </Text>
              </TouchableOpacity>

              {/* SETTINGS */}
              <TouchableOpacity style={styles.dashboardItem}>
                <Icon.Settings
                  size={20}
                  color={isDark ? "#93C5FD" : "#2563EB"}
                />
                <Text
                  style={[
                    styles.dashboardItemText,
                    { color: isDark ? "#E5E7EB" : "#111827" },
                  ]}
                >
                  {t("Settings")}
                </Text>
              </TouchableOpacity>

              <View style={styles.dashboardDivider} />

              {/* THEME TOGGLE */}
              <TouchableOpacity
                style={styles.dashboardItem}
                onPress={toggleTheme}
              >
                <Feather
                  name={isDark ? "sun" : "moon"}
                  size={20}
                  color={isDark ? "#FACC15" : "#2563EB"}
                />
                <Text
                  style={[
                    styles.dashboardItemText,
                    { color: isDark ? "#FACC15" : "#111827" },
                  ]}
                >
                  {isDark
                    ? t("Switch to Light Theme")
                    : t("Switch to Dark Theme")}
                </Text>
              </TouchableOpacity>

              <View style={styles.dashboardDivider} />

              {/* LOGOUT */}
              <TouchableOpacity
                style={styles.dashboardItem}
                onPress={() => setIsDashboardOpen(false)}
              >
                <MaterialIcons name="logout" size={20} color="#DC2626" />
                <Text
                  style={[styles.dashboardItemText, { color: "#DC2626" }]}
                >
                  {t("Logout")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* BACKDROP */}
            <TouchableOpacity
              style={styles.dashboardBackdrop}
              activeOpacity={1}
              onPress={() => setIsDashboardOpen(false)}
            />
          </View>
        )}

        {/* BOTTOM NAV */}
        <View
          style={[
            styles.bottomNav,
            {
              backgroundColor: isDark ? "#020617" : "#FFFFFF",
              borderTopColor: isDark ? "#1F2937" : "#E5E7EB",
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => setActiveTab("home")}
            style={styles.navItem}
          >
            <Icon.Home
              size={20}
              color={activeTab === "home" ? "#2563EB" : "#9CA3AF"}
            />
            <Text
              style={[
                styles.navLabel,
                activeTab === "home" && styles.navLabelActive,
              ]}
            >
              {t("Home")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("loans")}
            style={styles.navItem}
          >
            <Icon.Wallet
              size={20}
              color={activeTab === "loans" ? "#2563EB" : "#9CA3AF"}
            />
            <Text
              style={[
                styles.navLabel,
                activeTab === "loans" && styles.navLabelActive,
              ]}
            >
              {t("Loans")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("documents")}
            style={styles.navItem}
          >
            <Icon.FileText
              size={20}
              color={activeTab === "documents" ? "#2563EB" : "#9CA3AF"}
            />
            <Text
              style={[
                styles.navLabel,
                activeTab === "documents" && styles.navLabelActive,
              ]}
            >
              {t("Docs")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("profile")}
            style={styles.navItem}
          >
            <Icon.User
              size={20}
              color={activeTab === "profile" ? "#2563EB" : "#9CA3AF"}
            />
            <Text
              style={[
                styles.navLabel,
                activeTab === "profile" && styles.navLabelActive,
              ]}
            >
              {t("Profile")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ---------------- ROOT WRAPPER ----------------
export default function App() {
  return (
    <LocalizeProvider>
      <MainApp />
    </LocalizeProvider>
  );
}
