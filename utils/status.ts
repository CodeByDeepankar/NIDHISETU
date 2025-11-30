import type { AppTheme, ColorToken } from '@/constants/theme';
import type { SubmissionStatus } from '@/types/entities';

export const getStatusTone = (status: SubmissionStatus): ColorToken => {
  switch (status) {
    case 'approved':
      return 'success';
    case 'rejected':
      return 'error';
    case 'syncing':
      return 'warning';
    case 'failed':
      return 'error';
    case 'submitted':
      return 'secondary';
    default:
      return 'primary';
  }
};

export const getStatusLabel = (status: SubmissionStatus): string => {
  switch (status) {
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'syncing':
      return 'Syncing';
    case 'failed':
      return 'Retry Pending';
    case 'submitted':
      return 'Submitted';
    case 'pending':
      return 'Draft Pending';
    default:
      return 'Pending';
  }
};

export const getStatusBackground = (theme: AppTheme, status: SubmissionStatus): string => {
  const tone = getStatusTone(status);
  switch (tone) {
    case 'success':
      return theme.colors.successContainer;
    case 'error':
      return theme.colors.errorContainer;
    case 'warning':
      return theme.colors.warningContainer;
    case 'secondary':
      return theme.colors.secondaryContainer;
    default:
      return theme.colors.primaryContainer;
  }
};
