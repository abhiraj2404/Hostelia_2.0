import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/hooks';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';

import { StudentDetailHeader } from '@/components/student-detail/StudentDetailHeader';
import { StudentStatsCard } from '@/components/student-detail/StudentStatsCard';
import { StudentFeeStatus } from '@/components/student-detail/StudentFeeStatus';
import { StudentProblemsList } from '@/components/student-detail/StudentProblemsList';
import { StudentFeedbackList } from '@/components/student-detail/StudentFeedbackList';
import { StudentTransitHistory } from '@/components/student-detail/StudentTransitHistory';

interface StudentData {
  user: any;
  feeStatus: any;
  problems: any[];
  feedback: any[];
  transit: any[];
}

function StudentDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.user);
  
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Access control check
  useEffect(() => {
    if (!currentUser) return;

    // Students cannot access this page
    if (currentUser.role === 'student') {
      toast.error('You do not have permission to view this page');
      navigate('/dashboard');
      return;
    }
  }, [currentUser, navigate]);

  // Fetch student data
  const fetchStudentData = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      // Make 5 parallel API calls
      const [userRes, feesRes, problemsRes, feedbackRes, transitRes] = await Promise.all([
        apiClient.get(`/user/${userId}`),
        apiClient.get('/fee'),
        apiClient.get('/problem'),
        apiClient.get('/mess/feedback'),
        apiClient.get('/transit')
      ]);

      // Check warden access - can only see students from their hostel
      if (currentUser?.role === 'warden') {
        const studentHostel = userRes.data.user?.hostel;
        if (studentHostel !== currentUser.hostel) {
          toast.error('You can only view students from your hostel');
          navigate('/dashboard');
          return;
        }
      }

      // Filter data for specific student
      // API returns: { data: [...] } or { feeStatuses: [...] } or { feeStatus: {...} }
      const allFees = feesRes.data.data || feesRes.data.feeStatuses || [];
      const feeStatus = allFees.find((f: any) => {
        // Handle both populated and unpopulated studentId
        const feeStudentId = typeof f.studentId === 'object' ? f.studentId._id : f.studentId;
        return feeStudentId === userId;
      }) || feesRes.data.feeStatus || { 
        hostelFee: { status: 'documentNotSubmitted' },
        messFee: { status: 'documentNotSubmitted' }
      };

      const problems = problemsRes.data.problems?.filter(
        (p: any) => p.studentId?._id === userId || p.studentId === userId
      ) || [];

      const feedback = feedbackRes.data.feedbacks?.filter(
        (f: any) => f.user?._id === userId || f.user === userId
      ) || [];

      const transit = transitRes.data.transitEntries?.filter(
        (t: any) => t.studentId?._id === userId || t.studentId === userId
      ) || [];

      setStudentData({
        user: userRes.data.user,
        feeStatus,
        problems,
        feedback,
        transit
      });
    } catch (err: any) {
      console.error('Error fetching student data:', err);
      const errorMessage = err.response?.data?.message || 'Failed to load student data';
      setError(errorMessage);
      toast.error(errorMessage);
      
      // If student not found, redirect
      if (err.response?.status === 404) {
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [userId]);

  const handleRefresh = () => {
    fetchStudentData();
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              to="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to dashboard
            </Link>
            <h1 className="mt-3 text-3xl font-semibold text-foreground">
              Student Details
            </h1>
            <p className="text-sm text-muted-foreground">
              Complete student information and activity history
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw
              className={cn('mr-2 h-4 w-4', loading && 'animate-spin')}
            />
            Refresh
          </Button>
        </div>

        {/* Error State */}
        {error && !loading && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Loading Skeleton */}
        {loading ? (
          <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="h-[120px] animate-pulse rounded-2xl border border-border/60 bg-muted/20" />
            
            {/* Stats Skeleton */}
            <div className="grid gap-6 md:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-[100px] animate-pulse rounded-2xl border border-border/60 bg-muted/20"
                />
              ))}
            </div>
            
            {/* Fee Status Skeleton */}
            <div className="h-[200px] animate-pulse rounded-2xl border border-border/60 bg-muted/20" />
            
            {/* Problems Skeleton */}
            <div className="h-[300px] animate-pulse rounded-2xl border border-border/60 bg-muted/20" />
            
            {/* Feedback Skeleton */}
            <div className="h-[250px] animate-pulse rounded-2xl border border-border/60 bg-muted/20" />
            
            {/* Transit Skeleton */}
            <div className="h-[250px] animate-pulse rounded-2xl border border-border/60 bg-muted/20" />
          </div>
        ) : studentData ? (
          <>
            {/* Student Header */}
            <StudentDetailHeader student={studentData.user} />

            {/* Statistics Cards */}
            <StudentStatsCard
              problemsCount={studentData.problems.length}
              feedbackCount={studentData.feedback.length}
              transitCount={studentData.transit.length}
              feeStatus={studentData.feeStatus}
            />

            {/* Fee Status Management */}
            <StudentFeeStatus feeStatus={studentData.feeStatus} />

            {/* Problems/Complaints List */}
            <StudentProblemsList problems={studentData.problems} />

            {/* Mess Feedback and Transit History - 55/45 Split */}
            <div className="grid gap-6 lg:grid-cols-20">
              <div className="lg:col-span-11">
                <StudentFeedbackList feedback={studentData.feedback} />
              </div>
              <div className="lg:col-span-9">
                <StudentTransitHistory transit={studentData.transit} />
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default StudentDetailPage;
