import { ReportDefinition, ReportSchedule, ReportScheduleFrequency } from './ReportDefinition';
import { ReportGenerator } from './ReportGenerator';
import { ExportManager } from './ExportManager';

export interface ScheduledReportJob {
  id: string;
  reportDefinitionId: string;
  nextRunTime: Date;
  lastRunTime?: Date;
  status: 'scheduled' | 'running' | 'completed' | 'failed';
  error?: string;
}

export interface ReportDeliveryOptions {
  exportFormats: string[];
  recipients: string[];
  subject?: string;
  message?: string;
  attachReports: boolean;
}

export class ScheduleManager {
  private scheduler: any; // In a real implementation, this would be a scheduler library
  private reportGenerator: ReportGenerator;
  private exportManager: ExportManager;
  private scheduleJobs: Map<string, ScheduledReportJob> = new Map();
  
  constructor(reportGenerator: ReportGenerator, exportManager: ExportManager) {
    this.reportGenerator = reportGenerator;
    this.exportManager = exportManager;
    // Initialize scheduler (in a real implementation)
  }

  public scheduleReport(reportDefinition: ReportDefinition): ScheduledReportJob {
    if (!reportDefinition.schedule) {
      throw new Error('Report definition does not have a schedule');
    }

    const jobId = `job-${reportDefinition.id}-${Date.now()}`;
    const nextRunTime = this.calculateNextRunTime(reportDefinition.schedule);

    const job: ScheduledReportJob = {
      id: jobId,
      reportDefinitionId: reportDefinition.id,
      nextRunTime,
      status: 'scheduled',
    };

    this.scheduleJobs.set(jobId, job);
    this.scheduleJobExecution(job, reportDefinition);

    return job;
  }

  public cancelScheduledReport(jobId: string): boolean {
    const job = this.scheduleJobs.get(jobId);
    if (!job) {
      return false;
    }

    // In a real implementation, we would cancel the scheduled job
    this.scheduleJobs.delete(jobId);
    return true;
  }

  public updateSchedule(
    jobId: string,
    updatedSchedule: ReportSchedule
  ): ScheduledReportJob {
    const job = this.scheduleJobs.get(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    // Get the report definition (in a real implementation, this would be fetched from a data store)
    // Update the report definition with the new schedule
    // Reschedule the job

    const nextRunTime = this.calculateNextRunTime(updatedSchedule);
    const updatedJob: ScheduledReportJob = {
      ...job,
      nextRunTime,
    };

    this.scheduleJobs.set(jobId, updatedJob);
    // In a real implementation, we would reschedule the job

    return updatedJob;
  }

  public getScheduledReports(): ScheduledReportJob[] {
    return Array.from(this.scheduleJobs.values());
  }

  public getScheduledReport(jobId: string): ScheduledReportJob | undefined {
    return this.scheduleJobs.get(jobId);
  }

  private calculateNextRunTime(schedule: ReportSchedule): Date {
    const now = new Date();
    const nextRun = new Date(now);

    switch (schedule.frequency) {
      case ReportScheduleFrequency.Daily:
        // Set time components from schedule.time (HH:MM)
        if (schedule.time) {
          const [hours, minutes] = schedule.time.split(':').map(Number);
          nextRun.setHours(hours, minutes, 0, 0);
        }
        
        // If next run time is in the past, add a day
        if (nextRun < now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        break;

      case ReportScheduleFrequency.Weekly:
        // Set day of week and time
        if (schedule.dayOfWeek !== undefined && schedule.time) {
          const [hours, minutes] = schedule.time.split(':').map(Number);
          const currentDay = nextRun.getDay();
          const daysToAdd = (schedule.dayOfWeek - currentDay + 7) % 7;
          
          nextRun.setDate(nextRun.getDate() + daysToAdd);
          nextRun.setHours(hours, minutes, 0, 0);
        }
        
        // If next run time is in the past, add a week
        if (nextRun < now) {
          nextRun.setDate(nextRun.getDate() + 7);
        }
        break;

      case ReportScheduleFrequency.Monthly:
        // Set day of month and time
        if (schedule.dayOfMonth !== undefined && schedule.time) {
          const [hours, minutes] = schedule.time.split(':').map(Number);
          nextRun.setDate(schedule.dayOfMonth);
          nextRun.setHours(hours, minutes, 0, 0);
        }
        
        // If next run time is in the past, add a month
        if (nextRun < now) {
          nextRun.setMonth(nextRun.getMonth() + 1);
        }
        break;

      case ReportScheduleFrequency.Quarterly:
        // Set to first day of next quarter if current quarter is over
        const currentMonth = now.getMonth();
        const currentQuarter = Math.floor(currentMonth / 3);
        const firstMonthOfNextQuarter = (currentQuarter + 1) % 4 * 3;
        
        if (schedule.time) {
          const [hours, minutes] = schedule.time.split(':').map(Number);
          nextRun.setMonth(firstMonthOfNextQuarter, 1);
          nextRun.setHours(hours, minutes, 0, 0);
        }
        
        // If next run time is in the past, add a year
        if (nextRun < now) {
          nextRun.setFullYear(nextRun.getFullYear() + 1);
        }
        break;

      case ReportScheduleFrequency.Custom:
        // Custom scheduling logic would go here
        // This could involve more complex cron-like expressions
        break;
    }

    return nextRun;
  }

  private scheduleJobExecution(job: ScheduledReportJob, reportDefinition: ReportDefinition): void {
    // In a real implementation, this would use a real scheduler to execute the job at the specified time
    // For now, we'll just log that the job is scheduled
    console.log(`Scheduled report job ${job.id} to run at ${job.nextRunTime}`);

    // Simulated job execution (in a real implementation, this would be scheduled)
    // this.executeScheduledReport(job, reportDefinition);
  }

  private async executeScheduledReport(
    job: ScheduledReportJob,
    reportDefinition: ReportDefinition
  ): Promise<void> {
    try {
      // Update job status
      job.status = 'running';
      this.scheduleJobs.set(job.id, job);

      // Generate the report
      const generatedReport = await this.reportGenerator.generateReport(reportDefinition);

      // Export the report in all required formats
      const schedule = reportDefinition.schedule!;
      const exportPromises = schedule.exportFormats.map((format) =>
        this.exportManager.exportReport(generatedReport, format)
      );
      const exportedFiles = await Promise.all(exportPromises);

      // Deliver the report to recipients
      await this.deliverReport({
        exportFormats: schedule.exportFormats,
        recipients: schedule.recipients,
        subject: `${reportDefinition.name} - ${new Date().toLocaleDateString()}`,
        attachReports: true,
      }, exportedFiles);

      // Update job status
      job.status = 'completed';
      job.lastRunTime = new Date();
      
      // Calculate next run time
      job.nextRunTime = this.calculateNextRunTime(schedule);
      
      this.scheduleJobs.set(job.id, job);
      
      // Schedule the next execution
      this.scheduleJobExecution(job, reportDefinition);
    } catch (error) {
      // Update job status on error
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : String(error);
      job.lastRunTime = new Date();
      this.scheduleJobs.set(job.id, job);
    }
  }

  private async deliverReport(
    options: ReportDeliveryOptions,
    exportedFiles: string[]
  ): Promise<void> {
    // In a real implementation, this would send emails, notifications, etc.
    console.log(`Delivering report to ${options.recipients.join(', ')}`);
    console.log(`Exported files: ${exportedFiles.join(', ')}`);
  }
} 