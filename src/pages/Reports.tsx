import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Download,
  FileText,
  TrendingUp,
  Calendar,
  Filter,
  Printer,
} from "lucide-react";
import { apiService } from "@/services/apiService";
import { Report } from "@/types/api";
import { useToast } from "@/hooks/use-toast";

const Reports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setIsLoading(true);

      // Load compliance + trips reports
      const compliance = await apiService.getFleetComplianceReport();
      const trips = await apiService.getTripsReport();

      const formattedReports: Report[] = [
        {
          id: "compliance-" + Date.now(),
          title: "Fleet Compliance Summary",
          type: "compliance",
          createdAt: new Date().toISOString(),
          data: compliance,
        },
        {
          id: "trips-" + Date.now(),
          title: "Trips & Mileage Report",
          type: "mileage",
          createdAt: new Date().toISOString(),
          data: trips,
        },
      ];

      setReports(formattedReports);
    } catch (error) {
      console.error("Failed to load reports:", error);
      toast({
        title: "Error",
        description: "Failed to load reports",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async (reportType: string) => {
    try {
      setIsGenerating(true);

      let newReport: Report | null = null;

      if (reportType === "compliance") {
        const compliance = await apiService.getFleetComplianceReport();
        newReport = {
          id: "compliance-" + Date.now(),
          title: "Fleet Compliance Report",
          type: "compliance",
          createdAt: new Date().toISOString(),
          data: compliance,
        };
      } else if (reportType === "mileage") {
        const trips = await apiService.getTripsReport();
        newReport = {
          id: "trips-" + Date.now(),
          title: "Mileage & Trips Report",
          type: "mileage",
          createdAt: new Date().toISOString(),
          data: trips,
        };
      } else {
        toast({
          title: "Unsupported Report",
          description: `${reportType} is not yet implemented.`,
          variant: "destructive",
        });
      }

      if (newReport) {
        setReports((prev) => [newReport, ...prev]);
        toast({
          title: "Report Generated",
          description: `${newReport.title} generated successfully.`,
        });
      }
    } catch (error) {
      console.error("Failed to generate report:", error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const reportTypes = [
    {
      id: "compliance",
      title: "HOS Compliance Report",
      description: "Detailed compliance analysis with violations and warnings",
      icon: <BarChart3 className="h-6 w-6 text-primary" />,
    },
    {
      id: "mileage",
      title: "Mileage & Trips Report",
      description: "Trip distances, violations, and efficiency metrics",
      icon: <TrendingUp className="h-6 w-6 text-success" />,
    },
    {
      id: "duty_summary",
      title: "Daily Duty Summary",
      description: "Summary of daily duty status and time allocation",
      icon: <Calendar className="h-6 w-6 text-accent" />,
    },
    {
      id: "ifta",
      title: "IFTA Tax Report",
      description: "International Fuel Tax Agreement reporting data",
      icon: <FileText className="h-6 w-6 text-warning" />,
    },
  ];

  const getReportBadge = (type: string) => {
    const typeMap: Record<
      string,
      {
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline";
      }
    > = {
      compliance: { label: "Compliance", variant: "default" },
      mileage: { label: "Mileage", variant: "secondary" },
      duty_summary: { label: "Daily Summary", variant: "outline" },
      ifta: { label: "IFTA", variant: "secondary" },
    };

    const config = typeMap[type] || {
      label: type,
      variant: "outline" as const,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground">
            Generate and manage compliance and operational reports
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
        </div>
      </div>

      {/* Report Generation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportTypes.map((reportType) => (
          <Card
            key={reportType.id}
            className="gradient-surface border-0 shadow-medium hover:shadow-glow transition-smooth cursor-pointer"
          >
            <CardHeader className="text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  {reportType.icon}
                </div>
              </div>
              <CardTitle className="text-lg">{reportType.title}</CardTitle>
              <CardDescription className="text-sm">
                {reportType.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={() => generateReport(reportType.id)}
                disabled={isGenerating}
              >
                {isGenerating ? "Generating..." : "Generate Report"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Reports */}
      <Card className="gradient-surface border-0 shadow-medium">
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>
            Your recently generated reports and analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">
                No Reports Generated
              </p>
              <p className="text-muted-foreground">
                Generate your first report using the options above
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.slice(0, 10).map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">
                        {report.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Generated on{" "}
                        {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getReportBadge(report.type)}
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Printer className="h-4 w-4" />
                    </Button>
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

export default Reports;
