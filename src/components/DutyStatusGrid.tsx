import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface DutyBlock {
  id: string;
  status: "off-duty" | "sleeper-berth" | "driving" | "on-duty";
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  remarks?: string;
}

interface DutyStatusGridProps {
  date: Date;
  dutyBlocks: DutyBlock[];
  onBlockUpdate: (blocks: DutyBlock[]) => void;
}

const DUTY_STATUS_INFO = {
  "off-duty": {
    label: "Off Duty",
    color: "bg-off-duty",
    textColor: "text-white",
    line: 1,
  },
  "sleeper-berth": {
    label: "Sleeper Berth",
    color: "bg-sleeper-berth",
    textColor: "text-white",
    line: 2,
  },
  driving: {
    label: "Driving",
    color: "bg-driving",
    textColor: "text-white",
    line: 3,
  },
  "on-duty": {
    label: "On Duty (Not Driving)",
    color: "bg-on-duty",
    textColor: "text-white",
    line: 4,
  },
};

export const DutyStatusGrid: React.FC<DutyStatusGridProps> = ({
  date,
  dutyBlocks,
  onBlockUpdate,
}) => {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);

  // Generate 24 hours worth of time slots (15-minute increments)
  const timeSlots = Array.from({ length: 96 }, (_, i) => {
    const hour = Math.floor(i / 4);
    const minute = (i % 4) * 15;
    return `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getBlocksForTimeSlot = (timeSlot: string) => {
    return dutyBlocks.filter((block) => {
      const blockStart = block.start_time;
      const blockEnd = block.end_time;
      return timeSlot >= blockStart && timeSlot < blockEnd;
    });
  };

  const getHourMinute = (input) => {
    const date = input instanceof Date ? input : new Date(input);

    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${hours}:${minutes}`
  };

  const calculateTotals = () => {
    const totals = {
      "off-duty": 0,
      "sleeper-berth": 0,
      driving: 0,
      "on-duty": 0,
    };

    dutyBlocks.forEach((block) => {
      let start = new Date(block.start_time);
      let end = new Date(block.end_time);

      // Calculate duration in hours
      const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

      // Protect against bad/missing status keys
      if (totals.hasOwnProperty(block.status)) {
        totals[block.status] += duration;
      } else {
        console.warn(`Unknown status: ${block.status}`);
      }
    });

    return totals;
  };

  const totals = calculateTotals();

  return (
    <Card className="gradient-surface border-0 shadow-medium p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Daily Log Sheet
            </h2>
            <p className="text-muted-foreground">{formatDate(date)}</p>
          </div>
          <div className="flex gap-2">
            {Object.entries(DUTY_STATUS_INFO).map(([status, info]) => (
              <Badge
                key={status}
                className={`${info.color} ${info.textColor} px-3 py-1`}
              >
                {info.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Status totals */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {Object.entries(totals)
            .filter(
              ([status]) =>
                DUTY_STATUS_INFO[status as keyof typeof DUTY_STATUS_INFO]
            )
            .map(([status, hours]) => {
              const info =
                DUTY_STATUS_INFO[status as keyof typeof DUTY_STATUS_INFO];
              return (
                <div key={status} className="text-center">
                  <div
                    className={`${info.color} ${info.textColor} rounded-lg p-3`}
                  >
                    <div className="text-2xl font-bold">
                      {hours.toFixed(1)}h
                    </div>
                    <div className="text-sm opacity-90">{info.label}</div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* 24-Hour Grid */}
      <div className="bg-white rounded-lg border border-border p-4 overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Hour headers */}
          <div className="flex border-b border-border mb-2">
            <div className="w-24 text-xs font-medium text-muted-foreground py-2">
              Status
            </div>
            {Array.from({ length: 24 }, (_, hour) => (
              <div
                key={hour}
                className="flex-1 text-center text-xs font-medium text-muted-foreground py-2 border-l border-border"
              >
                {hour.toString().padStart(2, "0")}
              </div>
            ))}
          </div>

          {/* Status rows */}
          {Object.entries(DUTY_STATUS_INFO).map(([status, info]) => (
            <div key={status} className="flex border-b border-border">
              <div className="w-24 text-xs py-1 px-2 bg-muted font-medium flex items-center">
                {info.line}. {info.label}
              </div>
              <div className="flex-1 flex">
                {Array.from({ length: 24 }, (_, hour) => (
                  <div
                    key={hour}
                    className="flex-1 border-l border-border relative"
                  >
                    {/* 15-minute subdivisions */}
                    {Array.from({ length: 4 }, (_, quarter) => {
                      const timeSlot = `${hour.toString().padStart(2, "0")}:${(
                        quarter * 15
                      )
                        .toString()
                        .padStart(2, "0")}`;
                      const blocksForSlot = getBlocksForTimeSlot(timeSlot);
                      const hasBlock = blocksForSlot.some(
                        (block) => block.status === status
                      );

                      return (
                        <div
                          key={quarter}
                          className={`h-8 border-r border-dashed border-border/50 ${
                            hasBlock ? info.color : "hover:bg-muted/50"
                          } cursor-pointer transition-colors`}
                          style={{ width: "25%" }}
                          title={`${timeSlot} - ${info.label}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Remarks section */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Remarks</h3>
        <div className="space-y-2">
          {dutyBlocks.map(
            (block) =>
              block.remarks && (
                <div key={block.id} className="text-sm bg-muted p-3 rounded-lg">
                  <span className="font-medium">
                    {getHourMinute(block.start_time)} - {getHourMinute(block.end_time)}:
                  </span>{" "}
                  {block.remarks}
                </div>
              )
          )}
        </div>
      </div>
    </Card>
  );
};
