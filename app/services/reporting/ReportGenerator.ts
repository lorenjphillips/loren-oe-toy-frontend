import { ReportDefinition, ReportComponentType, DataFilter, ReportSection, ReportComponentConfig } from './ReportDefinition';

export interface DataSource {
  fetchData(filters?: DataFilter[]): Promise<any[]>;
}

export class DataSourceRegistry {
  private static dataSources: Map<string, DataSource> = new Map();

  public static registerDataSource(name: string, dataSource: DataSource): void {
    this.dataSources.set(name, dataSource);
  }

  public static getDataSource(name: string): DataSource | undefined {
    return this.dataSources.get(name);
  }
}

export interface ReportComponentRenderer {
  render(component: ReportComponentConfig, data: any[]): Promise<any>;
}

export class ComponentRendererRegistry {
  private static renderers: Map<ReportComponentType, ReportComponentRenderer> = new Map();

  public static registerRenderer(
    componentType: ReportComponentType,
    renderer: ReportComponentRenderer
  ): void {
    this.renderers.set(componentType, renderer);
  }

  public static getRenderer(
    componentType: ReportComponentType
  ): ReportComponentRenderer | undefined {
    return this.renderers.get(componentType);
  }
}

export interface GeneratedReport {
  id: string;
  definitionId: string;
  name: string;
  generatedAt: Date;
  sections: GeneratedReportSection[];
}

export interface GeneratedReportSection {
  id: string;
  title: string;
  description?: string;
  components: GeneratedReportComponent[];
}

export interface GeneratedReportComponent {
  id: string;
  title: string;
  description?: string;
  data: any[];
  renderedContent: any;
}

export class ReportGenerator {
  private async fetchDataForComponent(
    component: ReportComponentConfig,
    globalFilters?: DataFilter[]
  ): Promise<any[]> {
    const dataSource = DataSourceRegistry.getDataSource(component.dataSource);
    if (!dataSource) {
      throw new Error(`Data source not found: ${component.dataSource}`);
    }

    // Combine global filters with component-specific filters
    const combinedFilters = [
      ...(globalFilters || []),
      ...(component.filters || []),
    ];

    return dataSource.fetchData(combinedFilters);
  }

  private async renderComponent(
    component: ReportComponentConfig,
    data: any[]
  ): Promise<any> {
    const renderer = ComponentRendererRegistry.getRenderer(component.type);
    if (!renderer) {
      throw new Error(`Renderer not found for component type: ${component.type}`);
    }

    return renderer.render(component, data);
  }

  private async generateReportSection(
    section: ReportSection,
    globalFilters?: DataFilter[]
  ): Promise<GeneratedReportSection> {
    const generatedComponents: GeneratedReportComponent[] = [];

    for (const component of section.components) {
      const data = await this.fetchDataForComponent(component, globalFilters);
      const renderedContent = await this.renderComponent(component, data);

      generatedComponents.push({
        id: component.id,
        title: component.title,
        description: component.description,
        data,
        renderedContent,
      });
    }

    return {
      id: section.id,
      title: section.title,
      description: section.description,
      components: generatedComponents,
    };
  }

  public async generateReport(reportDefinition: ReportDefinition): Promise<GeneratedReport> {
    const generatedSections: GeneratedReportSection[] = [];

    for (const section of reportDefinition.sections) {
      const generatedSection = await this.generateReportSection(
        section,
        reportDefinition.filters
      );
      generatedSections.push(generatedSection);
    }

    return {
      id: `report-${Date.now()}`,
      definitionId: reportDefinition.id,
      name: reportDefinition.name,
      generatedAt: new Date(),
      sections: generatedSections,
    };
  }
}

// Default renderers for common component types
class ChartRenderer implements ReportComponentRenderer {
  async render(component: ReportComponentConfig, data: any[]): Promise<any> {
    // In a real implementation, this would format data for chart library
    return {
      type: 'chart',
      chartData: data,
      config: component.settings,
    };
  }
}

class TableRenderer implements ReportComponentRenderer {
  async render(component: ReportComponentConfig, data: any[]): Promise<any> {
    // Format data for table display
    return {
      type: 'table',
      tableData: data,
      config: component.settings,
    };
  }
}

class TextRenderer implements ReportComponentRenderer {
  async render(component: ReportComponentConfig, data: any[]): Promise<any> {
    // Process text content with data if needed
    const textComponent = component as any; // Type assertion for content property
    return {
      type: 'text',
      content: textComponent.content,
      markdown: textComponent.markdown,
    };
  }
}

class MetricCardRenderer implements ReportComponentRenderer {
  async render(component: ReportComponentConfig, data: any[]): Promise<any> {
    // Extract and format metric value
    const metricValue = data.length > 0 ? data[0] : null;
    return {
      type: 'metricCard',
      value: metricValue,
      config: component.settings,
    };
  }
}

// Register default renderers
ComponentRendererRegistry.registerRenderer(ReportComponentType.Chart, new ChartRenderer());
ComponentRendererRegistry.registerRenderer(ReportComponentType.Table, new TableRenderer());
ComponentRendererRegistry.registerRenderer(ReportComponentType.Text, new TextRenderer());
ComponentRendererRegistry.registerRenderer(
  ReportComponentType.MetricCard,
  new MetricCardRenderer()
); 