import { useQuery } from '@tanstack/react-query';
import { submissionRepository } from '@/services/api/submissionRepository';
import type { SubmissionEvidence } from '@/types/entities';

export const useOfficerTasks = () => {
  const query = useQuery({
    queryKey: ['officer-tasks'],
    queryFn: async () => {
      const data = await submissionRepository.listAllPending();
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60 * 24, // 24 hours (persist cache for offline)
  });

  return {
    tasks: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  };
};
