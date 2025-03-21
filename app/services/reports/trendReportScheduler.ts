/**
 * Trend Report Scheduler Service
 * 
 * Manages scheduled reports for the medical trend analysis system.
 * Generates and distributes regular reports for emerging clinical topics.
 */

import { 
  TrendAnalysisOptions, 
  TrendSummary, 
  EmergingTopic, 
  TopicCorrelation, 
  SeasonalPattern, 
  TrendForecast,
  trendAnalysisService
} from '../analytics/trends';
import { 
  TrendInsightSummary,
  trendInsightsService
} from '../insights/trendInsights';
import { QuestionContext } from '../../types/analytics';

// Types for scheduled reports
export interface ScheduledReport {
  id: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  dayOfWeek?: number; // 0-6 for weekly reports (0 = Sunday)
  dayOfMonth?: number; // 1-31 for monthly reports
  quarter?: number; // 1-4 for quarterly reports
  recipients: string[]; // Email addresses
  lastRun?: Date;
  nextRun: Date;
  enabled: boolean;
  format: 'pdf' | 'excel' | 'html' | 'json';
  configuration: {
    timeframe: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    includeSections: {
      emergingTopics: boolean;
      topicCorrelations: boolean;
      seasonalPatterns: boolean;
      forecasts: boolean;
      contentOpportunities: boolean;
      informationGaps: boolean;
    };
    filters?: {
      geographicRegions?: string[];
      specialties?: string[];
      conceptTypes?: string[];
      minimumFrequency?: number;
      minimumConfidence?: number;
    };
  };
}

export interface GeneratedReport {
  id: string;
  scheduledReportId: string;
  timestamp: Date;
  format: 'pdf' | 'excel' | 'html' | 'json';
  url: string;
  recipients: string[];
  status: 'generated' | 'sent' | 'failed';
  errorMessage?: string;
}

class TrendReportScheduler {
  private scheduledReports: ScheduledReport[] = [];
  private schedulerInterval: number | null = null;
  
  /**
   * Initialize the scheduler with existing scheduled reports
   */
  public async initialize(): Promise<void> {
    // In a real implementation, this would load scheduled reports from a database
    this.scheduledReports = await this.loadScheduledReports();
    
    // Start scheduler
    this.startScheduler();
  }
  
  /**
   * Start the scheduler
   */
  public startScheduler(): void {
    // Check for reports to generate every 15 minutes
    this.schedulerInterval = window.setInterval(() => {
      this.checkScheduledReports();
    }, 15 * 60 * 1000);
    
    // Run immediately 
    this.checkScheduledReports();
  }
  
  /**
   * Stop the scheduler
   */
  public stopScheduler(): void {
    if (this.schedulerInterval !== null) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }
  }
  
  /**
   * Add a new scheduled report
   */
  public async addScheduledReport(report: Omit<ScheduledReport, 'id'>): Promise<ScheduledReport> {
    const newReport: ScheduledReport = {
      ...report,
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      nextRun: this.calculateNextRunTime(report as ScheduledReport)
    };
    
    this.scheduledReports.push(newReport);
    await this.saveScheduledReports();
    
    return newReport;
  }
  
  /**
   * Update an existing scheduled report
   */
  public async updateScheduledReport(id: string, updates: Partial<ScheduledReport>): Promise<ScheduledReport | null> {
    const index = this.scheduledReports.findIndex(report => report.id === id);
    
    if (index === -1) {
      return null;
    }
    
    const updatedReport = {
      ...this.scheduledReports[index],
      ...updates
    };
    
    // Recalculate next run time if frequency changed
    if (
      updates.frequency ||
      updates.dayOfWeek !== undefined ||
      updates.dayOfMonth !== undefined ||
      updates.quarter !== undefined
    ) {
      updatedReport.nextRun = this.calculateNextRunTime(updatedReport);
    }
    
    this.scheduledReports[index] = updatedReport;
    await this.saveScheduledReports();
    
    return updatedReport;
  }
  
  /**
   * Delete a scheduled report
   */
  public async deleteScheduledReport(id: string): Promise<boolean> {
    const initialLength = this.scheduledReports.length;
    this.scheduledReports = this.scheduledReports.filter(report => report.id !== id);
    
    if (this.scheduledReports.length < initialLength) {
      await this.saveScheduledReports();
      return true;
    }
    
    return false;
  }
  
  /**
   * Get all scheduled reports
   */
  public getScheduledReports(): ScheduledReport[] {
    return [...this.scheduledReports];
  }
  
  /**
   * Get a specific scheduled report by ID
   */
  public getScheduledReportById(id: string): ScheduledReport | null {
    return this.scheduledReports.find(report => report.id === id) || null;
  }
  
  /**
   * Generate a report immediately
   */
  public async generateReportNow(
    reportId: string,
    questions: QuestionContext[]
  ): Promise<GeneratedReport | null> {
    const scheduledReport = this.getScheduledReportById(reportId);
    
    if (!scheduledReport) {
      return null;
    }
    
    try {
      return await this.generateReport(scheduledReport, questions);
    } catch (error) {
      console.error('Error generating report:', error);
      return null;
    }
  }
  
  // Private methods
  
  /**
   * Check for reports that need to be generated
   */
  private async checkScheduledReports(): Promise<void> {
    const now = new Date();
    const reportsToRun = this.scheduledReports.filter(
      report => report.enabled && report.nextRun <= now
    );
    
    for (const report of reportsToRun) {
      try {
        // In a real implementation, this would query the database for questions
        // based on the report's configuration
        const questions = await this.fetchQuestionsForReport(report);
        
        // Generate the report
        await this.generateReport(report, questions);
        
        // Update the report's last run and next run times
        await this.updateScheduledReport(report.id, {
          lastRun: now,
          nextRun: this.calculateNextRunTime(report, now)
        });
      } catch (error) {
        console.error(`Error running scheduled report ${report.id}:`, error);
      }
    }
  }
  
  /**
   * Generate a report
   */
  private async generateReport(
    report: ScheduledReport,
    questions: QuestionContext[]
  ): Promise<GeneratedReport> {
    // Analyze trends
    const trendSummary = await trendAnalysisService.analyzeTrends(
      questions,
      {
        timeframe: report.configuration.timeframe,
        geographicFilter: report.configuration.filters?.geographicRegions,
        specialtyFilter: report.configuration.filters?.specialties,
        conceptTypes: report.configuration.filters?.conceptTypes,
        minSampleSize: 5,
        confidenceLevel: report.configuration.filters?.minimumConfidence || 0.95
      }
    );
    
    // Generate insights
    const insights = trendInsightsService.generateInsights(trendSummary);
    
    // Combine data for report
    const reportData = {
      metadata: {
        reportName: report.name,
        generated: new Date(),
        timeframe: report.configuration.timeframe,
        filters: report.configuration.filters
      },
      trendSummary: trendSummary,
      insights: insights
    };
    
    // In a real implementation, this would actually generate the report file
    // in the specified format
    const reportUrl = await this.formatAndSaveReport(report.id, reportData, report.format);
    
    // Create the generated report record
    const generatedReport: GeneratedReport = {
      id: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      scheduledReportId: report.id,
      timestamp: new Date(),
      format: report.format,
      url: reportUrl,
      recipients: report.recipients,
      status: 'generated'
    };
    
    // In a real implementation, this would send the report to recipients
    await this.sendReportToRecipients(generatedReport);
    
    return generatedReport;
  }
  
  /**
   * Format and save a report
   */
  private async formatAndSaveReport(
    reportId: string,
    data: any,
    format: 'pdf' | 'excel' | 'html' | 'json'
  ): Promise<string> {
    // In a real implementation, this would generate a file in the specified format
    // and save it to a storage location (S3, file system, etc.)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    return `/reports/trends/${reportId}_${timestamp}.${format}`;
  }
  
  /**
   * Send a report to recipients
   */
  private async sendReportToRecipients(report: GeneratedReport): Promise<void> {
    // In a real implementation, this would send the report to recipients via email
    console.log(`Sending report ${report.id} to ${report.recipients.length} recipients`);
    
    // Update the report status
    report.status = 'sent';
  }
  
  /**
   * Calculate the next run time for a scheduled report
   */
  private calculateNextRunTime(report: ScheduledReport, fromDate = new Date()): Date {
    const nextRun = new Date(fromDate);
    
    switch (report.frequency) {
      case 'daily':
        // Next day
        nextRun.setDate(nextRun.getDate() + 1);
        nextRun.setHours(8, 0, 0, 0); // 8 AM
        break;
        
      case 'weekly':
        // Next occurrence of day of week
        const targetDay = report.dayOfWeek || 1; // Default to Monday
        const currentDay = nextRun.getDay();
        let daysToAdd = targetDay - currentDay;
        if (daysToAdd <= 0) daysToAdd += 7; // Move to next week if today or already passed
        
        nextRun.setDate(nextRun.getDate() + daysToAdd);
        nextRun.setHours(8, 0, 0, 0); // 8 AM
        break;
        
      case 'monthly':
        // Next occurrence of day of month
        const targetDate = report.dayOfMonth || 1; // Default to 1st of month
        
        nextRun.setMonth(nextRun.getMonth() + 1); // Move to next month
        nextRun.setDate(1); // Set to 1st of month
        
        // Set to target date, clamping to last day of month if needed
        const lastDayOfMonth = new Date(nextRun.getFullYear(), nextRun.getMonth() + 1, 0).getDate();
        nextRun.setDate(Math.min(targetDate, lastDayOfMonth));
        nextRun.setHours(8, 0, 0, 0); // 8 AM
        break;
        
      case 'quarterly':
        // Next occurrence of the specified quarter
        const currentQuarter = Math.floor(nextRun.getMonth() / 3) + 1;
        const targetQuarter = report.quarter || 1; // Default to Q1
        let monthsToAdd = (targetQuarter - currentQuarter) * 3;
        
        if (monthsToAdd <= 0) monthsToAdd += 12; // Move to next year if current quarter or passed
        
        nextRun.setMonth(nextRun.getMonth() + monthsToAdd);
        nextRun.setDate(1); // First day of the quarter
        nextRun.setHours(8, 0, 0, 0); // 8 AM
        break;
    }
    
    return nextRun;
  }
  
  /**
   * Load scheduled reports from storage
   */
  private async loadScheduledReports(): Promise<ScheduledReport[]> {
    // In a real implementation, this would load from a database
    // Here we'll return mock data
    return [{
      id: 'report_weekly_trends',
      name: 'Weekly Medical Trends Report',
      description: 'Weekly analysis of emerging medical topics and physician information needs',
      frequency: 'weekly',
      dayOfWeek: 1, // Monday
      recipients: ['medical-team@example.com'],
      nextRun: this.getNextDayOfWeek(1), // Next Monday
      enabled: true,
      format: 'pdf',
      configuration: {
        timeframe: 'weekly',
        includeSections: {
          emergingTopics: true,
          topicCorrelations: true,
          seasonalPatterns: true,
          forecasts: true,
          contentOpportunities: true,
          informationGaps: true
        }
      }
    }];
  }
  
  /**
   * Save scheduled reports to storage
   */
  private async saveScheduledReports(): Promise<void> {
    // In a real implementation, this would save to a database
    console.log('Saving scheduled reports:', this.scheduledReports);
  }
  
  /**
   * Fetch questions for report analysis
   */
  private async fetchQuestionsForReport(report: ScheduledReport): Promise<QuestionContext[]> {
    // In a real implementation, this would query the database for questions
    // based on the report's configuration
    return [];
  }
  
  /**
   * Helper to get the next occurrence of a day of week
   */
  private getNextDayOfWeek(dayOfWeek: number): Date {
    const result = new Date();
    result.setDate(result.getDate() + (dayOfWeek - result.getDay() + 7) % 7);
    result.setHours(8, 0, 0, 0); // 8 AM
    return result;
  }
}

export const trendReportScheduler = new TrendReportScheduler();
export default trendReportScheduler; 