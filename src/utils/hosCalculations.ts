import { DutyBlock } from '@/components/DutyStatusGrid';

export interface HOSLimits {
  maxDrivingHours: number;        // 11 hours
  maxOnDutyHours: number;         // 14 hours  
  maxCycleHours: number;          // 70 hours in 8 days
  requiredRestBreak: number;      // 30 minutes after 8 hours
  requiredOffDuty: number;        // 10 consecutive hours
}

export const DEFAULT_HOS_LIMITS: HOSLimits = {
  maxDrivingHours: 11,
  maxOnDutyHours: 14,
  maxCycleHours: 70,
  requiredRestBreak: 0.5,
  requiredOffDuty: 10,
};

export interface HOSViolation {
  type: 'driving' | 'on-duty' | 'cycle' | 'rest-break' | 'off-duty';
  severity: 'warning' | 'violation';
  message: string;
  timeRemaining?: number;
}

export interface HOSStatus {
  drivingHoursUsed: number;
  onDutyHoursUsed: number;
  cycleHoursUsed: number;
  hoursUntilBreak: number;
  hoursUntilOffDuty: number;
  violations: HOSViolation[];
  canContinueDriving: boolean;
}

export const calculateHOSStatus = (
  dutyBlocks: DutyBlock[],
  currentCycleHours: number = 0,
  limits: HOSLimits = DEFAULT_HOS_LIMITS
): HOSStatus => {
  let drivingHoursUsed = 0;
  let onDutyHoursUsed = 0;
  let totalOnDutyTime = 0;
  let lastRestBreak = 0;
  let lastOffDutyPeriod = 0;
  
  const violations: HOSViolation[] = [];

  // Calculate hours from duty blocks
  dutyBlocks.forEach((block, index) => {
    const start = new Date(`2000-01-01T${block.startTime}:00`);
    const end = new Date(`2000-01-01T${block.endTime}:00`);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    if (block.status === 'driving') {
      drivingHoursUsed += duration;
      totalOnDutyTime += duration;
    } else if (block.status === 'on-duty') {
      onDutyHoursUsed += duration;
      totalOnDutyTime += duration;
    } else if (block.status === 'off-duty' || block.status === 'sleeper-berth') {
      if (duration >= 0.5) { // 30+ minute break
        lastRestBreak = totalOnDutyTime;
      }
      if (duration >= 10) { // 10+ hour off duty
        lastOffDutyPeriod = totalOnDutyTime;
      }
    }
  });

  const totalOnDutyUsed = drivingHoursUsed + onDutyHoursUsed;

  // Check for violations
  
  // 11-hour driving limit
  if (drivingHoursUsed > limits.maxDrivingHours) {
    violations.push({
      type: 'driving',
      severity: 'violation',
      message: `Exceeded 11-hour driving limit by ${(drivingHoursUsed - limits.maxDrivingHours).toFixed(1)} hours`,
    });
  } else if (drivingHoursUsed > limits.maxDrivingHours - 1) {
    violations.push({
      type: 'driving',
      severity: 'warning', 
      message: `Approaching 11-hour driving limit`,
      timeRemaining: limits.maxDrivingHours - drivingHoursUsed,
    });
  }

  // 14-hour on-duty limit
  if (totalOnDutyUsed > limits.maxOnDutyHours) {
    violations.push({
      type: 'on-duty',
      severity: 'violation',
      message: `Exceeded 14-hour on-duty limit by ${(totalOnDutyUsed - limits.maxOnDutyHours).toFixed(1)} hours`,
    });
  } else if (totalOnDutyUsed > limits.maxOnDutyHours - 2) {
    violations.push({
      type: 'on-duty', 
      severity: 'warning',
      message: `Approaching 14-hour on-duty limit`,
      timeRemaining: limits.maxOnDutyHours - totalOnDutyUsed,
    });
  }

  // 70-hour cycle limit
  const totalCycleHours = currentCycleHours + totalOnDutyUsed;
  if (totalCycleHours > limits.maxCycleHours) {
    violations.push({
      type: 'cycle',
      severity: 'violation', 
      message: `Exceeded 70-hour cycle limit by ${(totalCycleHours - limits.maxCycleHours).toFixed(1)} hours`,
    });
  } else if (totalCycleHours > limits.maxCycleHours - 5) {
    violations.push({
      type: 'cycle',
      severity: 'warning',
      message: `Approaching 70-hour cycle limit`,
      timeRemaining: limits.maxCycleHours - totalCycleHours,
    });
  }

  // 30-minute break requirement after 8 hours
  const hoursUntilBreak = Math.max(0, 8 - (totalOnDutyTime - lastRestBreak));
  if (totalOnDutyTime - lastRestBreak >= 8) {
    violations.push({
      type: 'rest-break',
      severity: 'violation',
      message: `Required 30-minute break after 8 hours of driving`,
    });
  }

  // 10-hour off-duty requirement
  const hoursUntilOffDuty = Math.max(0, limits.maxOnDutyHours - totalOnDutyUsed);

  return {
    drivingHoursUsed,
    onDutyHoursUsed,
    cycleHoursUsed: totalCycleHours,
    hoursUntilBreak,
    hoursUntilOffDuty,
    violations,
    canContinueDriving: violations.filter(v => v.severity === 'violation').length === 0,
  };
};

export const generateOptimizedSchedule = (
  startTime: string,
  totalDrivingHours: number,
  currentCycleHours: number = 0
): DutyBlock[] => {
  const blocks: DutyBlock[] = [];
  let currentTime = startTime;
  let remainingDriving = totalDrivingHours;
  let blockId = 1;

  const addMinutesToTime = (time: string, minutes: number): string => {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  };

  // Pre-trip inspection (30 minutes on-duty)
  blocks.push({
    id: `block-${blockId++}`,
    status: 'on-duty',
    startTime: currentTime,
    endTime: addMinutesToTime(currentTime, 30),
    location: 'Pre-trip inspection',
    remarks: 'Vehicle inspection and paperwork',
  });
  currentTime = addMinutesToTime(currentTime, 30);

  while (remainingDriving > 0) {
    // Drive for up to 8 hours before break, or remaining time
    const driveTime = Math.min(8, remainingDriving);
    const driveMinutes = driveTime * 60;
    
    blocks.push({
      id: `block-${blockId++}`,
      status: 'driving',
      startTime: currentTime,
      endTime: addMinutesToTime(currentTime, driveMinutes),
      remarks: `Driving segment: ${driveTime.toFixed(1)} hours`,
    });
    currentTime = addMinutesToTime(currentTime, driveMinutes);
    remainingDriving -= driveTime;

    // Add 30-minute break if more driving remains
    if (remainingDriving > 0) {
      blocks.push({
        id: `block-${blockId++}`,
        status: 'off-duty',
        startTime: currentTime,
        endTime: addMinutesToTime(currentTime, 30),
        remarks: 'Required 30-minute break',
      });
      currentTime = addMinutesToTime(currentTime, 30);
    }
  }

  // Post-trip activities (30 minutes on-duty)
  blocks.push({
    id: `block-${blockId++}`,
    status: 'on-duty',
    startTime: currentTime,
    endTime: addMinutesToTime(currentTime, 30),
    location: 'Post-trip inspection',
    remarks: 'Vehicle inspection and paperwork',
  });

  return blocks;
};

export const calculateTripDistance = (pickup: string, dropoff: string): number => {
  // Simplified distance calculation - in real app would use mapping API
  // Return estimated miles based on locations
  return Math.floor(Math.random() * 800) + 200; // 200-1000 miles
};

export const calculateDrivingTime = (distance: number, avgSpeed: number = 55): number => {
  return Math.ceil(distance / avgSpeed);
};