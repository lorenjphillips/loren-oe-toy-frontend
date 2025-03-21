// Types for report components and structure
export enum ReportComponentType {
  Chart = 'chart',
  Table = 'table',
  MetricCard = 'metricCard',
  Text = 'text',
  Image = 'image',
  ComparisonTable = 'comparisonTable',
  TimeseriesChart = 'timeseriesChart',
  HeatMap = 'heatMap',
  FunnelChart = 'funnelChart',
}

export enum ChartType {
  Bar = 'bar',
  Line = 'line',
  Pie = 'pie',
  Scatter = 'scatter',
  Area = 'area',
  Radar = 'radar',
}

export enum DataFilterType {
  DateRange = 'dateRange',
  Category = 'category',
  Threshold = 'threshold',
  ComparisonType = 'comparisonType',
  Region = 'region',
  Demographic = 'demographic',
}

export enum ReportScheduleFrequency {
  Daily = 'daily',
  Weekly = 'weekly',
  Monthly = 'monthly',
  Quarterly = 'quarterly',
  Custom = 'custom',
}

export enum ExportFormat {
  PDF = 'pdf',
  Excel = 'excel',
  CSV = 'csv',
  PowerPoint = 'powerpoint',
  JSON = 'json',
}

export interface DataFilter {
  type: DataFilterType;
  field: string;
  operator: string;
  value: any;
  label: string;
}

export interface ReportComponentConfig {
  id: string;
  type: ReportComponentType;
  title: string;
  description?: string;
  dataSource: string;
  filters?: DataFilter[];
  settings?: Record<string, any>;
  size?: { width: string; height: string };
  position?: { x: number; y: number };
}

export interface ChartComponentConfig extends ReportComponentConfig {
  chartType: ChartType;
  xAxis?: string;
  yAxis?: string;
  series?: string[];
  colors?: string[];
  showLegend?: boolean;
}

export interface TextComponentConfig extends ReportComponentConfig {
  content: string;
  markdown?: boolean;
}

export interface MetricCardConfig extends ReportComponentConfig {
  metric: string;
  format?: string;
  comparison?: {
    period: string;
    showChange: boolean;
  };
}

export interface ReportSection {
  id: string;
  title: string;
  description?: string;
  components: ReportComponentConfig[];
}

export interface ReportSchedule {
  frequency: ReportScheduleFrequency;
  time?: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  startDate: Date;
  endDate?: Date;
  recipients: string[];
  exportFormats: ExportFormat[];
}

export interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  schedule?: ReportSchedule;
  sections: ReportSection[];
  filters?: DataFilter[];
  permissions?: {
    viewerIds: string[];
    editorIds: string[];
  };
  branding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
  };
}

export class ReportTemplate {
  private definition: ReportDefinition;

  constructor(definition: ReportDefinition) {
    this.definition = definition;
  }

  public getDefinition(): ReportDefinition {
    return this.definition;
  }

  public addSection(section: ReportSection): void {
    this.definition.sections.push(section);
    this.definition.updatedAt = new Date();
  }

  public removeSection(sectionId: string): void {
    this.definition.sections = this.definition.sections.filter(
      (section) => section.id !== sectionId
    );
    this.definition.updatedAt = new Date();
  }

  public addComponent(sectionId: string, component: ReportComponentConfig): void {
    const section = this.definition.sections.find((s) => s.id === sectionId);
    if (section) {
      section.components.push(component);
      this.definition.updatedAt = new Date();
    }
  }

  public updateComponent(
    sectionId: string,
    componentId: string,
    updatedComponent: Partial<ReportComponentConfig>
  ): void {
    const section = this.definition.sections.find((s) => s.id === sectionId);
    if (section) {
      const componentIndex = section.components.findIndex((c) => c.id === componentId);
      if (componentIndex !== -1) {
        section.components[componentIndex] = {
          ...section.components[componentIndex],
          ...updatedComponent,
        };
        this.definition.updatedAt = new Date();
      }
    }
  }

  public removeComponent(sectionId: string, componentId: string): void {
    const section = this.definition.sections.find((s) => s.id === sectionId);
    if (section) {
      section.components = section.components.filter((c) => c.id !== componentId);
      this.definition.updatedAt = new Date();
    }
  }

  public setSchedule(schedule: ReportSchedule): void {
    this.definition.schedule = schedule;
    this.definition.updatedAt = new Date();
  }

  public addFilter(filter: DataFilter): void {
    if (!this.definition.filters) {
      this.definition.filters = [];
    }
    this.definition.filters.push(filter);
    this.definition.updatedAt = new Date();
  }
} 