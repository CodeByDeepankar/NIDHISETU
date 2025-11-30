// App.js
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

// icon shortcuts
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
  Building: (props) => <MaterialCommunityIcons name="office-building" {...props} />,
};

function UploadItem({ title, status, isLast, textMain, textSub, isDark }) {
  const getIcon = () => {
    switch (title) {
      case 'Asset Photo':
      case 'Selfie with Asset':
        return Icon.Camera;
      case 'Invoice/Bill':
        return Icon.Receipt;
      case 'Workshop Photo':
        return Icon.Building;
      default:
        return Icon.FileText;
    }
  };

  const rowBg = isDark ? '#111827' : '#FFFFFF';
  const rowBorder = isDark ? '#334155' : '#F3F4F6';
  const ItemIcon = getIcon();

  return (
    <View
      style={[
        styles.uploadRow,
        !isLast && styles.uploadRowBorder,
        { backgroundColor: rowBg, borderColor: rowBorder },
      ]}
    >
      {/* icon mini background – always light blue */}
      <View
        style={[
          styles.uploadIconWrap,
          { backgroundColor: '#DBEAFE' },
        ]}
      >
        <ItemIcon size={22} color="#2563EB" />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={[styles.uploadTitle, { color: textMain }]}>{title}</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {status === 'not-uploaded' && (
            <View style={styles.badgeOrange}>
              <Text
                style={[
                  styles.badgeOrangeText,
                  { color: isDark ? '#FF9A5F' : '#C2410C' },
                ]}
              >
                Not Uploaded
              </Text>
            </View>
          )}

          {status === 'uploaded' && (
            <View style={styles.badgeGreen}>
              <Icon.CheckCircle size={12} color="#047857" />
              <Text style={styles.badgeGreenText}> Uploaded</Text>
            </View>
          )}

          {status === 'pending' && (
            <View style={styles.badgeBlue}>
              <Text style={styles.badgeBlueText}>Pending Review</Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.uploadButton,
          {
            backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
            borderColor: isDark ? '#334155' : '#DBEAFE',
          },
        ]}
      >
        <Icon.Upload size={16} color="#2563EB" />
        <Text style={[styles.uploadButtonText, { color: textMain }]}> Upload</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => setIsDark(!isDark);

  // theme helpers
  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const cardBorder = isDark ? '#334155' : '#E5E7EB';
  const textMain = isDark ? '#F9FAFB' : '#111827';
  const textSub = isDark ? '#CBD5E1' : '#6B7280';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        style={[
          styles.root,
          { backgroundColor: isDark ? '#0F172A' : '#F3F4F6' },
        ]}
      >
        {/* MAIN CONTENT */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}
          <View style={styles.headerWrapper}>
            <LinearGradient
              colors={['#2563EB', '#3B82F6', '#60A5FA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerGradient}
            >
              {/* decorative circles */}
              <View style={[styles.circle, styles.circleTopRight]} />
              <View style={[styles.circle, styles.circleBottomLeft]} />

              <View style={{ zIndex: 1 }}>
                {/* top bar */}
                <View style={styles.headerTopRow}>
                  {/* LEFT: menu + text */}
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                      style={styles.menuButton}
                      onPress={() => setIsDashboardOpen(true)}
                    >
                      <Feather name="menu" size={20} color="#FFFFFF" />
                    </TouchableOpacity>

                    <View>
                      <Text style={styles.headerWelcome}>Welcome back</Text>
                      <Text style={styles.headerName}>Swastik Kumar</Text>
                    </View>
                  </View>

                  {/* RIGHT: icons */}
                  <View style={styles.headerIconsRow}>
                    <TouchableOpacity style={styles.headerIconButton}>
                      <Icon.Bell size={18} color="#FFFFFF" />
                      <View style={styles.headerDot} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerIconButton}>
                      <Icon.Settings size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* quick stats */}
                <View style={styles.quickStatsRow}>
                  {/* Active */}
                  <View style={[styles.quickCard, { marginRight: 8 }]}>
                    <View style={styles.quickIconWrapGreen}>
                      <Icon.CheckCircle size={16} color="#BBF7D0" />
                    </View>
                    <Text style={styles.quickLabel}>Active</Text>
                    <Text style={styles.quickValue}>1 Loan</Text>
                  </View>

                  {/* Pending */}
                  <View style={[styles.quickCard, { marginHorizontal: 4 }]}>
                    <View style={styles.quickIconWrapOrange}>
                      <Icon.Clock size={16} color="#FFEDD5" />
                    </View>
                    <Text style={styles.quickLabel}>Pending</Text>
                    <Text style={styles.quickValue}>2 Tasks</Text>
                  </View>

                  {/* Status */}
                  <View style={[styles.quickCard, { marginLeft: 8 }]}>
                    <View style={styles.quickIconWrapBlue}>
                      <Icon.TrendingUp size={16} color="#DBEAFE" />
                    </View>
                    <Text style={styles.quickLabel}>Status</Text>
                    <Text style={styles.quickValue}>Good</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* LOAN CARD */}
          <View
            style={[
              styles.loanCard,
              { backgroundColor: cardBg, borderColor: cardBorder },
            ]}
          >
            <LinearGradient
              colors={['#2563EB', '#1D4ED8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.loanHeader}
            >
              <View style={[styles.circleSmall, styles.circleLoanTopRight]} />

              <View style={{ zIndex: 1 }}>
                <View style={styles.loanHeaderTopRow}>
                  <View style={styles.badgeWhiteOutline}>
                    <Text style={styles.badgeWhiteOutlineText}>PMEGP Loan</Text>
                  </View>
                  <View style={styles.badgeGreenSolid}>
                    <Icon.CheckCircle size={12} color="#ECFDF5" />
                    <Text style={styles.badgeGreenSolidText}> Sanctioned</Text>
                  </View>
                </View>

                <Text style={styles.loanLabel}>Sanctioned Amount</Text>
                <Text style={styles.loanAmount}>₹3,08,568</Text>
                <Text style={styles.loanId}>Loan ID: LN-0002</Text>
              </View>
            </LinearGradient>

            {/* quick actions */}
            <View
              style={[
                styles.actionRow,
                {
                  backgroundColor: isDark ? '#1E293B' : '#F9FAFB',
                  borderColor: isDark ? '#334155' : '#E5E7EB',
                },
              ]}
            >
              {/* View – icon mini bg always light */}
              <TouchableOpacity style={styles.actionItem}>
                <View
                  style={[
                    styles.actionIconWrap,
                    { backgroundColor: '#DBEAFE' },
                  ]}
                >
                  <Icon.Eye size={20} color="#2563EB" />
                </View>
                <Text style={[styles.actionLabel, { color: textMain }]}>
                  View
                </Text>
              </TouchableOpacity>

              {/* Download – always light bg */}
              <TouchableOpacity style={styles.actionItem}>
                <View
                  style={[
                    styles.actionIconWrap,
                    { backgroundColor: '#DBEAFE' },
                  ]}
                >
                  <Icon.Download size={20} color="#2563EB" />
                </View>
                <Text style={[styles.actionLabel, { color: textMain }]}>
                  Download
                </Text>
              </TouchableOpacity>

              {/* Share – always light bg */}
              <TouchableOpacity style={styles.actionItem}>
                <View
                  style={[
                    styles.actionIconWrap,
                    { backgroundColor: '#DBEAFE' },
                  ]}
                >
                  <Icon.Share2 size={20} color="#2563EB" />
                </View>
                <Text style={[styles.actionLabel, { color: textMain }]}>
                  Share
                </Text>
              </TouchableOpacity>
            </View>

            {/* loan details */}
            <View style={styles.loanDetails}>
              {/* bank row – icon box ALWAYS light */}
              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <View
                    style={[
                      styles.detailIconWrap,
                      { backgroundColor: '#EFF6FF' },
                    ]}
                  >
                    <Icon.Wallet size={20} color="#2563EB" />
                  </View>
                  <View>
                    <Text style={[styles.detailValue, { color: textMain }]}>
                      Bank Name
                    </Text>
                    <Text style={[styles.detailValue, { color: textMain }]}>
                      Panjab National Bank
                    </Text>
                  </View>
                </View>
                <Icon.ChevronRight size={18} color="#9CA3AF" />
              </View>

              {/* beneficiary */}
              <View
                style={[
                  styles.detailRow,
                  { borderBottomColor: isDark ? '#334155' : '#E5E7EB' },
                ]}
              >
                <View style={styles.detailLeft}>
                  <View style={styles.detailIconWrap}>
                    <Icon.User size={20} color="#2563EB" />
                  </View>
                  <View>
                    <Text style={[styles.detailValue, { color: textMain }]}>
                      Beneficiary Name
                    </Text>
                    <Text style={[styles.detailValue, { color: textMain }]}>
                      Swastik Kumar Purohit
                    </Text>
                  </View>
                </View>
                <Icon.ChevronRight size={18} color="#9CA3AF" />
              </View>

              {/* date */}
              <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                <View style={styles.detailLeft}>
                  <View style={styles.detailIconWrap}>
                    <Icon.Calendar size={20} color="#2563EB" />
                  </View>
                  <View>
                    <Text style={[styles.detailLabel, { color: textSub }]}>
                      Sanctioned Date
                    </Text>
                    <Text style={[styles.detailValue, { color: textMain }]}>
                      18 November 2025
                    </Text>
                  </View>
                </View>
                <Icon.ChevronRight size={18} color="#9CA3AF" />
              </View>
            </View>

            {/* CTA */}
            <TouchableOpacity style={styles.loanCta}>
              <Text style={styles.loanCtaText}>View Complete Details</Text>
              <Icon.ChevronRight size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* GAP BETWEEN CARDS */}
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
                  Verification Progress
                </Text>
                <Text style={styles.sectionAccent}>0%</Text>
              </View>

              <View style={styles.progressBg}>
                <View style={[styles.progressBar, { width: '0%' }]} />
              </View>

              <Text style={[styles.sectionHint, { color: textSub }]}>
                Complete all required uploads to verify your loan
              </Text>
            </View>
          </View>

          {/* REQUIRED UPLOADS */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: textMain }]}>
                Required Uploads
              </Text>
              <Text style={[styles.sectionAccentSmall, { color: textMain }]}>
                0/4 Completed
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
                  backgroundColor: isDark ? '#1E293B' : '#EFF6FF',
                  borderColor: isDark ? '#334155' : '#BFDBFE',
                  borderWidth: 1,
                },
              ]}
            >
              <Text style={[styles.secondaryButtonText, { color: textMain }]}>
                View All Uploads
              </Text>
              <Icon.ChevronRight size={18} color="#2563EB" />
            </TouchableOpacity>
          </View>

          {/* PENDING ACTIONS */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: textMain }]}>
                Pending Actions
              </Text>
              <TouchableOpacity>
                <Text style={styles.sectionAccentSmall}>View All</Text>
              </TouchableOpacity>
            </View>

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
                    Document Upload Required
                  </Text>
                  <Text style={[styles.listSubtitle, { color: textSub }]}>
                    Submit identity proof
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
                    Verify Bank Account
                  </Text>
                  <Text style={[styles.listSubtitle, { color: textSub }]}>
                    Complete verification process
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
                Recent Activity
              </Text>
              <TouchableOpacity>
                <Text style={styles.sectionAccentSmall}>See All</Text>
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
                    Sanctioned Date
                  </Text>
                  <Text style={[styles.activitySubtitle, { color: textSub }]}>
                    Your PMEGP loan has been approved
                  </Text>
                  <Text style={[styles.activityTime, { color: textSub }]}>
                    2 days ago
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
                    Documents Verified
                  </Text>
                  <Text style={[styles.listSubtitle, { color: textSub }]}>
                    All submitted documents approved
                  </Text>
                  <Text style={[styles.activityTime, { color: textSub }]}>
                    5 days ago
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* DASHBOARD OVERLAY – modern (Option 3) */}
        {isDashboardOpen && (
          <View style={styles.dashboardOverlay}>
            <View
              style={[
                styles.dashboardPanel,
                { backgroundColor: isDark ? '#020617' : '#FFFFFF' },
              ]}
            >
              <Text
                style={[
                  styles.dashboardTitle,
                  { color: isDark ? '#E5E7EB' : '#111827' },
                ]}
              >
                Dashboard
              </Text>

              {/* Home */}
              <TouchableOpacity
                style={[
                  styles.dashboardItem,
                  activeTab === 'home' && styles.dashboardItemActive,
                ]}
                onPress={() => {
                  setActiveTab('home');
                  setIsDashboardOpen(false);
                }}
              >
                <Icon.Home
                  size={20}
                  color={activeTab === 'home' ? '#2563EB' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.dashboardItemText,
                    {
                      color:
                        activeTab === 'home'
                          ? '#2563EB'
                          : isDark
                          ? '#E5E7EB'
                          : '#111827',
                    },
                  ]}
                >
                  Home
                </Text>
              </TouchableOpacity>

              {/* Loans */}
              <TouchableOpacity
                style={[
                  styles.dashboardItem,
                  activeTab === 'loans' && styles.dashboardItemActive,
                ]}
                onPress={() => {
                  setActiveTab('loans');
                  setIsDashboardOpen(false);
                }}
              >
                <Icon.Wallet
                  size={20}
                  color={activeTab === 'loans' ? '#2563EB' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.dashboardItemText,
                    {
                      color:
                        activeTab === 'loans'
                          ? '#2563EB'
                          : isDark
                          ? '#E5E7EB'
                          : '#111827',
                    },
                  ]}
                >
                  Loans
                </Text>
              </TouchableOpacity>

              {/* Documents */}
              <TouchableOpacity
                style={[
                  styles.dashboardItem,
                  activeTab === 'documents' && styles.dashboardItemActive,
                ]}
                onPress={() => {
                  setActiveTab('documents');
                  setIsDashboardOpen(false);
                }}
              >
                <Icon.FileText
                  size={20}
                  color={activeTab === 'documents' ? '#2563EB' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.dashboardItemText,
                    {
                      color:
                        activeTab === 'documents'
                          ? '#2563EB'
                          : isDark
                          ? '#E5E7EB'
                          : '#111827',
                    },
                  ]}
                >
                  Documents
                </Text>
              </TouchableOpacity>

              {/* Profile */}
              <TouchableOpacity
                style={[
                  styles.dashboardItem,
                  activeTab === 'profile' && styles.dashboardItemActive,
                ]}
                onPress={() => {
                  setActiveTab('profile');
                  setIsDashboardOpen(false);
                }}
              >
                <Icon.User
                  size={20}
                  color={activeTab === 'profile' ? '#2563EB' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.dashboardItemText,
                    {
                      color:
                        activeTab === 'profile'
                          ? '#2563EB'
                          : isDark
                          ? '#E5E7EB'
                          : '#111827',
                    },
                  ]}
                >
                  Profile
                </Text>
              </TouchableOpacity>

              {/* Settings (just a placeholder for now) */}
              <TouchableOpacity style={styles.dashboardItem}>
                <Icon.Settings
                  size={20}
                  color={isDark ? '#93C5FD' : '#2563EB'}
                />
                <Text
                  style={[
                    styles.dashboardItemText,
                    { color: isDark ? '#E5E7EB' : '#111827' },
                  ]}
                >
                  Settings
                </Text>
              </TouchableOpacity>

              <View style={styles.dashboardDivider} />

              {/* Theme toggle (inside panel) */}
              <TouchableOpacity
                style={styles.dashboardItem}
                onPress={toggleTheme}
              >
                <Feather
                  name={isDark ? 'sun' : 'moon'}
                  size={20}
                  color={isDark ? '#FACC15' : '#2563EB'}
                />
                <Text
                  style={[
                    styles.dashboardItemText,
                    { color: isDark ? '#FACC15' : '#111827' },
                  ]}
                >
                  {isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                </Text>
              </TouchableOpacity>

              <View style={styles.dashboardDivider} />

              {/* Logout */}
              <TouchableOpacity
                style={styles.dashboardItem}
                onPress={() => {
                  setIsDashboardOpen(false);
                  // you can add real logout logic later
                }}
              >
                <MaterialIcons name="logout" size={20} color="#DC2626" />
                <Text
                  style={[
                    styles.dashboardItemText,
                    { color: '#DC2626' },
                  ]}
                >
                  Logout
                </Text>
              </TouchableOpacity>
            </View>

            {/* backdrop */}
            <TouchableOpacity
              style={styles.dashboardBackdrop}
              activeOpacity={1}
              onPress={() => setIsDashboardOpen(false)}
            />
          </View>
        )}

        {/* BOTTOM NAVIGATION */}
        <View
          style={[
            styles.bottomNav,
            {
              backgroundColor: isDark ? '#020617' : '#FFFFFF',
              borderTopColor: isDark ? '#1F2937' : '#E5E7EB',
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => setActiveTab('home')}
            style={styles.navItem}
          >
            <Icon.Home
              size={20}
              color={activeTab === 'home' ? '#2563EB' : '#9CA3AF'}
            />
            <Text
              style={[
                styles.navLabel,
                activeTab === 'home' && styles.navLabelActive,
              ]}
            >
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('loans')}
            style={styles.navItem}
          >
            <Icon.Wallet
              size={20}
              color={activeTab === 'loans' ? '#2563EB' : '#9CA3AF'}
            />
            <Text
              style={[
                styles.navLabel,
                activeTab === 'loans' && styles.navLabelActive,
              ]}
            >
              Loans
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('documents')}
            style={styles.navItem}
          >
            <Icon.FileText
              size={20}
              color={activeTab === 'documents' ? '#2563EB' : '#9CA3AF'}
            />
            <Text
              style={[
                styles.navLabel,
                activeTab === 'documents' && styles.navLabelActive,
              ]}
            >
              Docs
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('profile')}
            style={styles.navItem}
          >
            <Icon.User
              size={20}
              color={activeTab === 'profile' ? '#2563EB' : '#9CA3AF'}
            />
            <Text
              style={[
                styles.navLabel,
                activeTab === 'profile' && styles.navLabelActive,
              ]}
            >
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  root: { flex: 1 },

  headerWrapper: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 },
  headerGradient: {
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    overflow: 'hidden',
  },

  circle: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  circleTopRight: { top: -70, right: -60 },
  circleBottomLeft: { bottom: -50, left: -80 },

  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerWelcome: { color: '#DBEAFE', fontSize: 12, marginBottom: 4 },
  headerName: { color: '#FFFFFF', fontSize: 20, fontWeight: '600' },

  headerIconsRow: { flexDirection: 'row', alignItems: 'center' },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  headerDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },

  quickStatsRow: { flexDirection: 'row' },
  quickCard: {
    flex: 1,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  quickIconWrapGreen: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(34,197,94,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickIconWrapOrange: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(249,115,22,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickIconWrapBlue: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(59,130,246,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickLabel: { color: 'rgba(239,246,255,0.9)', fontSize: 11, marginBottom: 2 },
  quickValue: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },

  scrollContent: { paddingHorizontal: 16, paddingBottom: 24 },

  loanCard: {
    borderRadius: 26,
    marginTop: -32,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    overflow: 'hidden',
    borderWidth: 1,
  },
  loanHeader: {
    padding: 16,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    overflow: 'hidden',
  },
  circleSmall: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  circleLoanTopRight: { top: -40, right: -40 },
  loanHeaderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeWhiteOutline: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.24)',
  },
  badgeWhiteOutlineText: { color: '#FFFFFF', fontSize: 11 },
  badgeGreenSolid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22C55E',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeGreenSolidText: { color: '#FFFFFF', fontSize: 11 },
  loanLabel: { color: '#BFDBFE', fontSize: 12, marginBottom: 4 },
  loanAmount: { color: '#FFFFFF', fontSize: 24, fontWeight: '700' },
  loanId: { color: '#E0F2FE', fontSize: 12, marginTop: 2 },

  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  actionItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  actionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  actionLabel: { fontSize: 12, color: '#374151' },

  loanDetails: { paddingHorizontal: 16, paddingVertical: 8 },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  detailLeft: { flexDirection: 'row', alignItems: 'center' },
  detailIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  detailLabel: { fontSize: 12, color: '#6B7280' },
  detailValue: { fontSize: 14, color: '#111827' },

  loanCta: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 18,
    paddingVertical: 12,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loanCtaText: { color: '#FFFFFF', fontWeight: '500', fontSize: 14 },

  section: { marginBottom: 16 },
  cardWhite: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  sectionAccent: { color: '#2563EB', fontWeight: '600', fontSize: 14 },
  sectionAccentSmall: { color: '#2563EB', fontSize: 13 },

  progressBg: {
    width: '100%',
    height: 10,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#2563EB',
  },
  sectionHint: {
    marginTop: 8,
    fontSize: 12,
    color: '#6B7280',
  },

  uploadCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  uploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  uploadRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  uploadIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  badgeOrange: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#FFF7ED',
  },
  badgeOrangeText: { fontSize: 11, color: '#C2410C' },
  badgeBlue: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#EFF6FF',
  },
  badgeBlueText: { fontSize: 11, color: '#1D4ED8' },
  badgeGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#ECFDF5',
  },
  badgeGreenText: { fontSize: 11, color: '#047857' },
  uploadButton: {
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadButtonText: { color: '#2563EB', fontSize: 12, fontWeight: '500' },

  secondaryButton: {
    marginTop: 12,
    borderRadius: 18,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: { color: '#2563EB', fontWeight: '500' },

  listCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  listIconOrange: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  listIconBlue: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  listTitle: { fontSize: 14, color: '#111827', marginBottom: 2 },
  listSubtitle: { fontSize: 12, color: '#6B7280' },
  dotOrange: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EA580C',
  },
  dotBlue: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
  },

  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activityRow: {
    flexDirection: 'row',
    padding: 14,
    alignItems: 'flex-start',
  },
  activityIconGreen: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  activityIconBlue: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  activityTime: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
  activityDivider: { height: 1, backgroundColor: '#E5E7EB' },

  // dashboard overlay
  dashboardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    zIndex: 50,
  },
  dashboardBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  dashboardPanel: {
    width: '70%',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  dashboardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#111827',
  },
  dashboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 10,
  },
  dashboardItemActive: {
    backgroundColor: '#EFF6FF',
  },
  dashboardItemText: {
    fontSize: 14,
    marginLeft: 10,
    color: '#111827',
    fontWeight: '500',
  },
  dashboardDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },

  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 72,
    flexDirection: 'row',
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  navItem: { alignItems: 'center', justifyContent: 'center' },
  navLabel: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  navLabelActive: { color: '#2563EB', fontWeight: '500' },
});
