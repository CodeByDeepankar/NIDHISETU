import { supabase } from '@/lib/supabaseClient';

export interface AnalyticsSummary {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

export interface ActivityLogEntry {
  title: string;
  subtitle: string;
  time: string;
  icon: string;
  color: string;
}

export interface PerformancePoint {
  label: string;
  value: number;
}

const getSummaryMetrics = async (): Promise<AnalyticsSummary> => {
    if (!supabase) return { total: 0, approved: 0, pending: 0, rejected: 0 };
    
    const [totalRes, approvedRes, rejectedRes, submittedRes, pendingRes] = await Promise.all([
        supabase.from('submissions').select('*', { count: 'exact', head: true }),
        supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
        supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'submitted'),
        supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    ]);

    const pendingCount = (submittedRes.count || 0) + (pendingRes.count || 0);

    return {
        total: totalRes.count || 0,
        approved: approvedRes.count || 0,
        pending: pendingCount,
        rejected: rejectedRes.count || 0
    };
};

const getRecentActivity = async (): Promise<ActivityLogEntry[]> => {
    if (!supabase) return [];

    // Using full_name as per schema
    const { data } = await supabase
        .from('submissions')
        .select(`
            *,
            beneficiary:beneficiaries(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

    if (!data) return [];

    return data.map((item: any) => {
        let title = 'Evidence Uploaded';
        let color = 'primary';
        let icon = 'file-plus';

        const status = (item.status || '').toLowerCase();

        if (status === 'approved') {
            title = 'Verification Completed';
            color = 'success';
            icon = 'check-circle';
        } else if (status === 'rejected') {
            title = 'Document Rejected';
            color = 'error';
            icon = 'alert-circle';
        } else if (status === 'submitted') {
            title = 'New Evidence Submitted';
            color = 'info';
            icon = 'cloud-upload';
        }

        const date = new Date(item.submittedAt || item.created_at);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHrs / 24);
        
        let time = '';
        if (diffHrs < 1) time = 'Just now';
        else if (diffHrs < 24) time = `${diffHrs} hours ago`;
        else time = `${diffDays} days ago`;

        const bName = item.beneficiary?.full_name || 'Unknown';
        const asset = item.assetName || 'Evidence';

        return {
            title,
            subtitle: `${bName} - ${asset}`,
            time,
            icon,
            color
        };
    });
};

const getPerformanceData = async (months = 6): Promise<PerformancePoint[]> => {
  if (!supabase) return [];

  // Get data for the last N months
  const now = new Date();
  const pastDate = new Date();
  pastDate.setMonth(now.getMonth() - months);

  const { data } = await supabase
    .from('submissions')
    .select('created_at')
    .gte('created_at', pastDate.toISOString())
    .order('created_at', { ascending: true });

  if (!data) return [];

  // Group by Month-Year
  const grouped: Record<string, number> = {};
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Initialize all months to 0 to ensure continuity
  for (let i = months - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(now.getMonth() - i);
      const key = `${monthLabels[d.getMonth()]}`; 
      grouped[key] = 0; // Pre-fill
  }

  data.forEach(item => {
    const d = new Date(item.created_at);
    const key = `${monthLabels[d.getMonth()]}`;
    if (grouped[key] !== undefined) {
        grouped[key]++;
    } else {
        // Fallback for edge cases or if pre-fill logic missed (shouldn't happen with correct loop)
        grouped[key] = (grouped[key] || 0) + 1;
    }
  });

  // Convert to array in chronological order (roughly, based on the pre-fill loop order matches the keys)
  // Actually, Object.keys order isn't guaranteed, so we should map based on our generated keys
  const result: PerformancePoint[] = [];
  for (let i = months - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(now.getMonth() - i);
      const key = `${monthLabels[d.getMonth()]}`;
      result.push({ label: key, value: grouped[key] });
  }

  return result;
}

export const analyticsService = {
    getSummaryMetrics,
    getRecentActivity,
    getPerformanceData
};
