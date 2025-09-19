import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { apiService } from "@/services/apiService";
import { HOSViolation, ComplianceWarning } from "@/types/api";
import { useToast } from "@/hooks/use-toast";

const Compliance = () => {
  const [violations, setViolations] = useState<HOSViolation[]>([]);
  const [warnings, setWarnings] = useState<ComplianceWarning[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = async () => {
    try {
      setIsLoading(true);
      // 🚀 Use fleet compliance report instead of raw violations
      const report = await apiService.getComplianceReport();
      setViolations(report.violations || []);
      setWarnings(report.warnings || []);
      setLastCheck(new Date());
    } catch (error) {
      console.error("Failed to load compliance data:", error);
      toast({
        title: "Error",
        description: "Failed to load compliance data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runComplianceCheck = async () => {
    try {
      setIsLoading(true);
      // 🚀 Trigger recalculation (example: log 1, could be dynamic)
      await apiService.checkHOSLog(1);
      await loadComplianceData();
      toast({
        title: "Compliance Check Complete",
        description: "Your compliance status has been updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to run compliance check",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getViolationIcon = (severity: string) => {
    switch (severity) {
      case "violation":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "warning":
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <Shield className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getViolationBadge = (severity: string) => {
    switch (severity) {
      case "violation":
        return <Badge variant="destructive">Violation</Badge>;
      case "warning":
        return (
          <Badge
            variant="secondary"
            className="bg-warning text-warning-foreground"
          >
            Warning
          </Badge>
        );
      default:
        return <Badge variant="outline">Info</Badge>;
    }
  };

  const activeViolations = violations.filter((v) => !v.resolved);
  const resolvedViolations = violations.filter((v) => v.resolved);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Compliance Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor HOS compliance and violations in real-time
          </p>
        </div>
        <Button onClick={runComplianceCheck} disabled={isLoading}>
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
          />
          Check Compliance
        </Button>
      </div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="gradient-surface border-0 shadow-medium">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Violations
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {activeViolations.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>

        <Card className="gradient-surface border-0 shadow-medium">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Resolved Issues
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {resolvedViolations.length}
            </div>
            <p className="text-xs text-muted-foreground">Fixed this month</p>
          </CardContent>
        </Card>

        <Card className="gradient-surface border-0 shadow-medium">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Compliance Score
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {activeViolations.length === 0 ? "100%" : "85%"}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on recent activity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Violations */}
      {activeViolations.length > 0 && (
        <Card className="gradient-surface border-0 shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
              Active Violations
            </CardTitle>
            <CardDescription>
              These violations require immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeViolations.map((violation) => (
                <div
                  key={violation.id}
                  className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5"
                >
                  <div className="flex items-center space-x-3">
                    {getViolationIcon(violation.severity)}
                    <div>
                      <p className="font-medium text-foreground">
                        {violation.description}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(violation.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getViolationBadge(violation.severity)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card className="gradient-surface border-0 shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5 text-primary" />
            Recent Compliance Activity
          </CardTitle>
          <CardDescription>
            {lastCheck
              ? `Last checked: ${lastCheck.toLocaleString()}`
              : "No recent checks"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {violations.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">
                All Clear!
              </p>
              <p className="text-muted-foreground">
                No compliance violations detected
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {violations.slice(0, 5).map((violation) => (
                <div
                  key={violation.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getViolationIcon(violation.severity)}
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {violation.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(violation.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getViolationBadge(violation.severity)}
                    {violation.resolved && (
                      <Badge
                        variant="outline"
                        className="bg-success/10 text-success border-success/20"
                      >
                        Resolved
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Compliance;
