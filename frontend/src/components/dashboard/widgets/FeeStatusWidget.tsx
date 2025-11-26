import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { AlertCircle, CheckCircle2, Receipt } from "lucide-react";
import { feeStatusConfig } from "@/components/dashboard/utils/dashboardConstants";
import type { DashboardMetrics } from "@/types/dashboard";

interface FeeStatusWidgetProps {
  fees: DashboardMetrics["fees"];
}

export function FeeStatusWidget({ fees }: FeeStatusWidgetProps) {
  const hostelConfig = feeStatusConfig[fees.hostelFee.status as keyof typeof feeStatusConfig] || feeStatusConfig.documentNotSubmitted;
  const messConfig = feeStatusConfig[fees.messFee.status as keyof typeof feeStatusConfig] || feeStatusConfig.documentNotSubmitted;

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-lg">Fee Submission Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hostel Fee */}
        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Hostel Fee</p>
              <Badge 
                variant={hostelConfig.variant} 
                className={`mt-1 ${
                  fees.hostelFee.status === "rejected" 
                    ? "bg-red-200 text-red-600 hover:bg-red-400 hover:text-red-800 border-transparent" 
                    : fees.hostelFee.status === "approved"
                    ? "bg-green-100 text-green-700 hover:bg-green-200 border-transparent"
                    : fees.hostelFee.status === "pending"
                    ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-300"
                    : fees.hostelFee.status === "documentNotSubmitted"
                    ? "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-300"
                    : ""
                }`}
              >
                {hostelConfig.label}
              </Badge>
            </div>
            {fees.hostelFee.status === "approved" ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : fees.hostelFee.status === "rejected" ? (
              <AlertCircle className="h-5 w-5 text-red-600" />
            ) : (
              <Receipt className="h-5 w-5 text-muted-foreground" />
            )}
          </div>

          {fees.hostelFee.rejectionReason && (
            <div className="rounded bg-destructive/10 p-3 text-sm text-destructive">
              <strong>Rejection Reason:</strong> {fees.hostelFee.rejectionReason}
            </div>
          )}

          {fees.hostelFee.status === "documentNotSubmitted" && (
            <Button size="sm" className="w-full" asChild>
              <Link to="/fees">Submit Document</Link>
            </Button>
          )}

          {fees.hostelFee.status === "rejected" && (
            <Button size="sm" variant="outline" className="w-full my-2" asChild>
              <Link to="/fees">Resubmit Document</Link>
            </Button>
          )}
        </div>

        {/* Mess Fee */}
        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Mess Fee</p>
              <Badge 
                variant={messConfig.variant} 
                className={`mt-1 ${
                  fees.messFee.status === "rejected" 
                    ? "bg-red-200 text-red-600 hover:bg-red-300 hover:text-red-800 border-transparent" 
                    : fees.messFee.status === "approved"
                    ? "bg-green-100 text-green-700 hover:bg-green-200 border-transparent"
                    : fees.messFee.status === "pending"
                    ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-300"
                    : fees.messFee.status === "documentNotSubmitted"
                    ? "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-300"
                    : ""
                }`}
              >
                {messConfig.label}
              </Badge>
            </div>
            {fees.messFee.status === "approved" ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : fees.messFee.status === "rejected" ? (
              <AlertCircle className="h-5 w-5 text-red-600" />
            ) : (
              <Receipt className="h-5 w-5 text-muted-foreground" />
            )}
          </div>

          {fees.messFee.rejectionReason && (
            <div className="rounded bg-destructive/10 p-3 text-sm text-destructive">
              <strong>Rejection Reason:</strong> {fees.messFee.rejectionReason}
            </div>
          )}

          {fees.messFee.status === "documentNotSubmitted" && (
            <Button size="sm" className="w-full" asChild>
              <Link to="/fees">Submit Document</Link>
            </Button>
          )}

          {fees.messFee.status === "rejected" && (
            <Button size="sm" variant="outline" className="w-full" asChild>
              <Link to="/fees">Resubmit Document</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
