import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Clock, CheckCircle, XCircle } from "lucide-react";
import { HOSStatus, HOSViolation } from "@/utils/hosCalculations";

interface HOSAlertsProps {
  hosStatus: HOSStatus;
  className?: string;
}

export const HOSAlerts: React.FC<HOSAlertsProps> = ({
  hosStatus,
  className = "",
}) => {
  const getViolationIcon = (violation: HOSViolation) => {
    if (violation.severity === "violation") {
      return <XCircle className="h-4 w-4" />;
    }
    return <AlertTriangle className="h-4 w-4" />;
  };

  const getViolationVariant = (
    violation: HOSViolation
  ): "default" | "destructive" => {
    return violation.severity === "violation" ? "destructive" : "default";
  };

  return (
    <Card
      className={`gradient-surface border-0 shadow-medium p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Clock className="h-5 w-5 mr-2 text-primary" />
          HOS Compliance Status
        </h3>
        <Badge
          variant={hosStatus.canContinueDriving ? "default" : "destructive"}
          className={
            hosStatus.canContinueDriving
              ? "bg-success text-success-foreground"
              : ""
          }
        >
          {hosStatus.canContinueDriving ? (
            <>
              <CheckCircle className="h-4 w-4 mr-1" />
              Compliant
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 mr-1" />
              Violation
            </>
          )}
        </Badge>
      </div>

      {/* Current Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-driving">
            {hosStatus.drivingHoursUsed.toFixed(1)}
          </div>
          <div className="text-sm text-muted-foreground">Driving Hours</div>
          <div className="text-xs text-muted-foreground">of 11 max</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-on-duty">
            {(hosStatus.drivingHoursUsed + hosStatus.onDutyHoursUsed).toFixed(
              1
            )}
          </div>
          <div className="text-sm text-muted-foreground">On-Duty Hours</div>
          <div className="text-xs text-muted-foreground">of 14 max</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-warning">
            {hosStatus.cycleHoursUsed.toFixed(1)}
          </div>
          <div className="text-sm text-muted-foreground">Cycle Hours</div>
          <div className="text-xs text-muted-foreground">of 70 max</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {hosStatus.hoursUntilBreak.toFixed(1)}
          </div>
          <div className="text-sm text-muted-foreground">Until Break</div>
          <div className="text-xs text-muted-foreground">30 min req'd</div>
        </div>
      </div>

      {/* Violations and Warnings */}
      {hosStatus.violations.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground">Active Alerts</h4>
          {hosStatus.violations.map((violation, index) => (
            <Alert
              key={index}
              variant={getViolationVariant(violation)}
              className="transition-smooth"
            >
              {getViolationIcon(violation)}
              <AlertDescription className="ml-2">
                <div className="flex items-center justify-between">
                  <span>{violation.description}</span>
                  {violation.timeRemaining && (
                    <Badge variant="outline" className="ml-2">
                      {violation.timeRemaining.toFixed(1)}h remaining
                    </Badge>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {hosStatus.violations.length === 0 && (
        <Alert className="border-success/20 bg-success/5">
          <CheckCircle className="h-4 w-4 text-success" />
          <AlertDescription className="text-success ml-2">
            All HOS requirements are currently met. Safe to continue driving.
          </AlertDescription>
        </Alert>
      )}
    </Card>
  );
};
