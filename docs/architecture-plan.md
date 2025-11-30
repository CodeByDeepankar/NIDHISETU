# Loan Utilization Verification App — Architecture Plan

_Last updated: 2025-11-17_

This document maps the full-stack (client-side) architecture before coding the production-ready React Native UI. It ties each user requirement to concrete navigation flows, state management choices, offline behavior, and component composition.

## 1. Core Principles

- **Role-driven UX**: Auth flow leads into role-specific navigators (Beneficiary, State Agency Officer, Reviewer). Navigation state is derived from the authenticated profile.
- **Offline-first**: Every network mutation writes to an offline queue (AsyncStorage/MMKV) and exposes retry controls + banners. Background sync is orchestrated through React Query + a custom sync manager.
- **Atomic design**: UI building blocks are scoped to `components/atoms`, `molecules`, `organisms`, and are reused across screens. Styling follows Material 3 tokens defined in `constants/theme`.
- **Type-safe state**: TypeScript everywhere, with shared `types` describing Beneficiary, Submission, Roles, etc.
- **Testable modules**: Mock API service (`services/api/mockClient.ts`) abstracts network calls; swapping to real endpoints later requires minimal change.

## 2. Navigation Map

Implemented with React Navigation v6 (native stack + bottom tabs + nested stacks). Expo Router will forward to custom navigators via `_layout.tsx`.

```
RootStack
  ├─ AuthStack
  │   ├─ WelcomeScreen
  │   ├─ MobileInputScreen
  │   ├─ OtpScreen
  │   └─ OnboardingScreen
  └─ AppStack (protected)
      ├─ RoleResolverScreen (redirect based on role)
      ├─ BeneficiaryTabs
      │    ├─ BeneficiaryDashboardScreen
      │    ├─ UploadEvidenceScreen
      │    ├─ PreviousSubmissionsScreen
      │    └─ ProfileScreen
      ├─ OfficerStack
      │    ├─ OfficerDashboardScreen
      │    ├─ BeneficiaryFormScreen
      │    └─ BeneficiaryListScreen (with details/edit modal)
      └─ ReviewerStack
           ├─ ReviewerDashboardScreen
           ├─ SubmissionListScreen
           └─ ReviewDetailScreen
```

Shared modals: `SyncProgressModal`, `MapPreviewModal`, `CameraModal`.

## 3. Global Providers & Contexts

```
<AppProviders>
  <ThemeProvider /> // Material 3 tokens + RN Paper
    <QueryClientProvider>
      <PersistQueryClientProvider> // offline cache
        <Provider store={authStore}>
          <NetworkProvider />
            <NavigationContainer />
```

- **Zustand stores**: `useAuthStore`, `useOfflineQueueStore`, `useUiStore`.
- **React Query**: Handles server state (beneficiaries, submissions, analytics). Custom `offlineMutation` wrapper writes to queue when offline.
- **NetworkProvider**: wraps Expo Network + NetInfo to broadcast connectivity; drives `SyncBanner` + `OfflineIndicator`.

## 4. State & Data Flow

- **Auth**
  - `loginWithMobile` → `verifyOtp` → stores JWT/session + role in `authStore` + AsyncStorage rehydration.
  - Onboarding stores beneficiary metadata locally.
- **Beneficiary submissions**
  - Capture media (expo-camera) + location (expo-location). Draft stored via `useDraftSubmission` hook.
  - When online: `submitEvidence` mutation -> optimistic UI update -> server ack.
  - When offline: payload persisted to queue, flagged with `localDraft=true`. Background sync attempts `syncPending` when network returns.
- **State Agency data entry**
  - Form built with `react-hook-form`. Validates required fields, numbers, dates.
  - `addBeneficiary` mutation updates React Query cache + local list.
- **Reviewer workflow**
  - List + filters via React Query + `react-native-paper` DataTable.
  - Detail screen shows media viewer, GPS map via `react-native-maps`, approve/reject via `reviewSubmission` mutation.

## 5. Offline Strategy

- `utils/offlineQueue.ts`: enqueue/dequeue, status flags, storage.
- `hooks/useSyncManager.ts`: subscribes to network events, flushes queue in background with exponential backoff.
- UI elements:
  - `organisms/SyncBanner` indicates syncing / offline / failure.
  - `screens/beneficiary/SyncStatusScreen` lists pending uploads + retry.
  - Local draft badges on cards using `atoms/Chip`.

## 6. Component Breakdown

- **Atoms**: `Button`, `Text`, `InputField`, `Icon`, `Divider`, `StatusPill`, `Avatar`, `Chip`.
- **Molecules**:
  - `LoanDetailCard`: shows sanctioned amount, Scheme, bank, sanction date.
  - `SubmissionCard`: status, timestamps, GPS badge, actions.
  - `UploadCard`: camera preview, capture button, status indicator.
- **Organisms**:
  - `DashboardHeader`: greeting, role badge, sync state.
  - `SubmissionList`: virtualized list with filters.
  - `SyncBanner`: offline indicator w/ retry button.
  - `AnalyticsSummary`: counts of approved/pending/rejected.

## 7. Hooks & Utilities

| Hook | Purpose |
| --- | --- |
| `useAuthFlow` | wraps login + OTP + onboarding state machine |
| `useNetworkStatus` | net connectivity + offline reason |
| `useCameraCapture` | handles permissions, photo/video capture, metadata |
| `useGeoLocation` | permission prompts, fallback errors |
| `useDraftSubmission` | local storage + validation before upload |
| `useSyncManager` | background sync + progress percentage |

Utilities include `formatter.ts` (currency, date), `validation.ts` (Yup-like helpers), `logger.ts` (centralized console wrapper).

## 8. Services / Mock API

`services/api/mockClient.ts` exposes async functions returning mock JSON with latency simulation. `services/api/index.ts` wraps them with types + React Query helpers.

## 9. Folder Structure (target)

```
components/
  atoms/
  molecules/
  organisms/
context/
  AppProviders.tsx
hooks/
  useAuthFlow.ts
  useCameraCapture.ts
  ...
screens/
  auth/
  beneficiary/
  officer/
  reviewer/
services/
  api/
    mockClient.ts
    types.ts
state/
  authStore.ts
  offlineQueueStore.ts
utils/
  offlineQueue.ts
  formatter.ts
  validation.ts
```

## 10. Next Implementation Steps

1. Scaffold providers + navigation containers based on this plan.
2. Implement theme + tokens, then atoms/molecules.
3. Build screens iteratively per flow, wiring hooks + mock data.
4. Finish with documentation + walkthrough + Expo lint/test run.
