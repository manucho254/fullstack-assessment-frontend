import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiService } from "@/services/apiService";
import { HOSLog } from "@/types/api";
import { useToast } from "@/hooks/use-toast";

const LogOutput = () => {
  const [logs, setLogs] = useState<HOSLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      const hosLogs = await apiService.getHOSLogs();
      setLogs(hosLogs);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      toast({
        title: "Error",
        description: "Could not load generated logs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    // Basic JSON export, can be replaced with CSV/PDF
    const blob = new Blob([JSON.stringify(logs, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hos-logs.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printContent = logs
      .map(
        (log) =>
          `Date: ${log.date}\nDriver: ${
            log.driver?.name || "N/A"
          }\nDrive Time: ${log.totalDriveTime || 0} mins\nOn Duty: ${
            log.totalOnDutyTime || 0
          } mins\nViolations: ${log.violations?.length || 0}\n\n`
      )
      .join("------------\n");

    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.write(
        `<pre style="font-family: monospace">${printContent}</pre>`
      );
      newWindow.document.close();
      newWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Log Output</h1>
          <p className="text-muted-foreground">
            View and export generated HOS logs
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={!logs.length}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            disabled={!logs.length}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Logs List */}
      <Card className="gradient-surface border-0 shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Generated Logs
          </CardTitle>
          <CardDescription>
            Your automatically generated HOS compliance logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-6">Loading...</p>
          ) : logs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">
                No Generated Logs
              </p>
              <p className="text-muted-foreground">
                Complete trips will appear here for review and export
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                >
                  <p className="font-medium text-foreground">
                    {new Date(log.date).toLocaleDateString()} —{" "}
                    {log.driver?.name || "Unknown Driver"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Drive: {Math.floor((log.totalDriveTime || 0) / 60)}h{" "}
                    {(log.totalDriveTime || 0) % 60}m • On Duty:{" "}
                    {Math.floor((log.totalOnDutyTime || 0) / 60)}h{" "}
                    {(log.totalOnDutyTime || 0) % 60}m
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Violations: {log.violations?.length || 0}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LogOutput;
