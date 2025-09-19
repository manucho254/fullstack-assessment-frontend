import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Clock,
  Plus,
  Edit,
  TrendingUp,
} from "lucide-react";
import { DutyStatusGrid, DutyBlock } from "@/components/DutyStatusGrid";
import { apiService } from "@/services/apiService";
import { HOSLog } from "@/types/api";
import { useToast } from "@/hooks/use-toast";

const LogBook = () => {
  const [hosLogs, setHosLogs] = useState<HOSLog[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentLog, setCurrentLog] = useState<HOSLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadHOSLogs();
  }, [selectedDate]);

  const loadHOSLogs = async () => {
    try {
      setIsLoading(true);
      const logs = await apiService.getHOSLogs();
      setHosLogs(logs.results || []);

      // Find log for selected date
      const dateStr = selectedDate.toISOString().split("T")[0];
      const todayLog = logs?.results?.find((log) => log.date === dateStr);
      setCurrentLog(todayLog || null);
    } catch (error) {
      console.error("Failed to load HOS logs:", error);
      toast({
        title: "Error",
        description: "Failed to load HOS logs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockUpdate = async (blocks: DutyBlock[]) => {
    try {
      if (!currentLog) {
        // Create a new log for the date
        const newLog = await apiService.createHOSLog({
          date: selectedDate.toISOString().split("T")[0],
          driverId: 1, // TODO: replace with auth user
        });
        setCurrentLog(newLog);
        setHosLogs((prev) => [...prev, newLog]);
      }

      // Save each block as a duty period
      for (const block of blocks) {
        await apiService.addDutyPeriod(currentLog?.id.toString() || "", {
          status: block.status.replace("-", "_"),
          startTime: block.startTime,
          endTime: block.endTime,
          location: block.location,
          notes: block.remarks,
        });
      }

      // Reload log with updated duty periods
      if (currentLog) {
        const updatedLog = await apiService.getHOSLogById(
          currentLog.id.toString()
        );
        setCurrentLog(updatedLog);
      }

      toast({
        title: "Log Updated",
        description: "Your duty status log has been saved",
      });
    } catch (error) {
      console.error("Failed to update log:", error);
      toast({
        title: "Error",
        description: "Failed to save log changes",
        variant: "destructive",
      });
    }
  };

  const calculateDailyTotals = (log: HOSLog | null) => {
    if (!log) return { drive: 0, onDuty: 0, total: 0 };

    return {
      drive: log.totalDriveTime || 0,
      onDuty: log.totalOnDutyTime || 0,
      total: log.cycleHoursUsed || 0,
    };
  };

  const totals = calculateDailyTotals(currentLog);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Electronic Log Book
          </h1>
          <p className="text-muted-foreground">
            Manage your daily duty status and HOS compliance
          </p>
        </div>
        <Button onClick={() => setCurrentLog(null)}>
          <Plus className="mr-2 h-4 w-4" />
          New Entry
        </Button>
      </div>

      {/* Daily Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="gradient-surface border-0 shadow-medium">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drive Time</CardTitle>
            <Clock className="h-4 w-4 text-driving" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-driving">
              {Math.floor(totals.drive / 60)}h {totals.drive % 60}m
            </div>
            <p className="text-xs text-muted-foreground">11 hour limit</p>
          </CardContent>
        </Card>

        <Card className="gradient-surface border-0 shadow-medium">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Duty</CardTitle>
            <Clock className="h-4 w-4 text-on-duty" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-on-duty">
              {Math.floor(totals.onDuty / 60)}h {totals.onDuty % 60}m
            </div>
            <p className="text-xs text-muted-foreground">14 hour limit</p>
          </CardContent>
        </Card>

        <Card className="gradient-surface border-0 shadow-medium">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cycle Hours</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {totals.total}h / 70h
            </div>
            <p className="text-xs text-muted-foreground">8-day cycle</p>
          </CardContent>
        </Card>

        <Card className="gradient-surface border-0 shadow-medium">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <BookOpen className="h-4 w-4 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">Compliant</div>
            <p className="text-xs text-muted-foreground">
              No violations detected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Duty Status Grid */}
      <Card className="gradient-surface border-0 shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Edit className="mr-2 h-5 w-5" />
            Duty Status Grid
          </CardTitle>
          <CardDescription>
            Click and drag to modify your duty status periods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DutyStatusGrid
            date={selectedDate}
            dutyBlocks={
              currentLog?.dutyPeriods.map((period) => ({
                id: period.id,
                status: period.status.replace(
                  "_",
                  "-"
                ) as "driving" | "off-duty" | "sleeper-berth" | "on-duty",
                startTime: period.startTime,
                endTime: period.endTime,
                location: period.location,
                remarks: period.notes,
              })) || []
            }
            onBlockUpdate={handleBlockUpdate}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default LogBook;