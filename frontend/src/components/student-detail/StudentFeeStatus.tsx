import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, FileX, XCircle } from 'lucide-react';
import { DocumentViewer } from '@/components/fees/document-viewer';

interface StudentFeeStatusProps {
  feeStatus: any;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'approved':
      return {
        variant: 'default' as const,
        className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        icon: CheckCircle2,
        label: 'Approved',
      };
    case 'pending':
      return {
        variant: 'outline' as const,
        className: 'border-yellow-500 text-yellow-700 dark:border-yellow-600 dark:text-yellow-400',
        icon: Clock,
        label: 'Pending',
      };
    case 'rejected':
      return {
        variant: 'destructive' as const,
        className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-200 hover:text-red-800',
        icon: XCircle,
        label: 'Rejected',
      };
    default:
      return {
        variant: 'secondary' as const,
        className: 'text-muted-foreground hover:text-muted-foreground/80',
        icon: FileX,
        label: 'Not Submitted',
      };
  }
};

export function StudentFeeStatus({ feeStatus }: StudentFeeStatusProps) {
  const hostelFee = feeStatus?.hostelFee || { status: 'documentNotSubmitted' };
  const messFee = feeStatus?.messFee || { status: 'documentNotSubmitted' };

  const renderFeeCard = (feeType: 'hostel' | 'mess', feeData: any) => {
    const statusConfig = getStatusConfig(feeData.status);
    const Icon = statusConfig.icon;
    const feeTypeLabel = feeType === 'hostel' ? 'Hostel Fee' : 'Mess Fee';
    const hasDocument = !!feeData.documentUrl;

    return (
      <Card key={feeType}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{feeTypeLabel}</CardTitle>
              <CardDescription className="text-sm">
                {feeType === 'hostel' ? 'Hostel fee payment verification' : 'Mess fee payment verification'}
              </CardDescription>
            </div>
            <Badge variant={statusConfig.variant} className={`text-xs ${statusConfig.className}`}>
              <Icon className="mr-1 h-3 w-3" />
              {statusConfig.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Document Viewer */}
          {hasDocument && (
            <div>
              <h4 className="mb-2 text-sm font-medium">Submitted Document</h4>
              <DocumentViewer documentUrl={feeData.documentUrl} feeType={feeType} />
            </div>
          )}

          {/* Rejection Reason */}
          {feeData.status === 'rejected' && feeData.rejectionReason && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3">
              <p className="text-xs font-medium text-destructive mb-1">Rejection Reason:</p>
              <p className="text-sm text-destructive">{feeData.rejectionReason}</p>
            </div>
          )}

          {/* Submission Date */}
          {feeData.submittedAt && (
            <p className="text-sm text-muted-foreground">
              Submitted: {new Date(feeData.submittedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          )}

          {/* No Document Message */}
          {!hasDocument && feeData.status === 'documentNotSubmitted' && (
            <p className="text-sm text-muted-foreground">
              No document submitted yet
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Fee Status</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {renderFeeCard('hostel', hostelFee)}
        {renderFeeCard('mess', messFee)}
      </div>
    </div>
  );
}
