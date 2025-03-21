import { QuestionContext, DemographicSummary } from '../../../types/analytics';

export class DemographicAggregator {
  private readonly defaultAgeGroups = [
    'infant', 'child', 'adolescent', 'young adult',
    'adult', 'middle-aged', 'elderly'
  ];

  public aggregateDemographics(questions: QuestionContext[]): DemographicSummary {
    const questionsWithDemographics = questions.filter(q => q.demographics);
    
    const ageGroups: { [key: string]: number } = {};
    const genderDistribution: { [key: string]: number } = {};
    const comorbidityCount = new Map<string, number>();
    const riskFactorCount = new Map<string, number>();

    questionsWithDemographics.forEach(question => {
      const demographics = question.demographics!;

      // Age groups
      if (demographics.ageGroup) {
        ageGroups[demographics.ageGroup] = (ageGroups[demographics.ageGroup] || 0) + 1;
      }

      // Gender
      if (demographics.gender) {
        genderDistribution[demographics.gender] = 
          (genderDistribution[demographics.gender] || 0) + 1;
      }

      // Comorbidities
      demographics.comorbidities?.forEach(condition => {
        comorbidityCount.set(condition, (comorbidityCount.get(condition) || 0) + 1);
      });

      // Risk factors
      demographics.riskFactors?.forEach(factor => {
        riskFactorCount.set(factor, (riskFactorCount.get(factor) || 0) + 1);
      });
    });

    // Sort and format comorbidities
    const commonComorbidities = Array.from(comorbidityCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([condition, count]) => ({ condition, count }));

    // Sort and format risk factors
    const sortedRiskFactors = Array.from(riskFactorCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([factor, count]) => ({ factor, count }));

    return {
      ageGroups: this.normalizeAgeGroups(ageGroups),
      genderDistribution,
      commonComorbidities,
      riskFactors: sortedRiskFactors
    };
  }

  private normalizeAgeGroups(ageGroups: { [key: string]: number }): { [key: string]: number } {
    const normalized: { [key: string]: number } = {};
    
    this.defaultAgeGroups.forEach(group => {
      normalized[group] = 0;
    });

    Object.entries(ageGroups).forEach(([group, count]) => {
      const normalizedGroup = this.findMatchingAgeGroup(group);
      normalized[normalizedGroup] = (normalized[normalizedGroup] || 0) + count;
    });

    return normalized;
  }

  private findMatchingAgeGroup(inputGroup: string): string {
    const normalized = inputGroup.toLowerCase();
    
    // Map various age descriptions to standardized groups
    if (normalized.includes('infant') || normalized.includes('baby')) return 'infant';
    if (normalized.includes('child')) return 'child';
    if (normalized.includes('teen') || normalized.includes('adolescent')) return 'adolescent';
    if (normalized.includes('young') || (normalized.includes('20') && normalized.includes('30'))) return 'young adult';
    if (normalized.includes('middle') || (normalized.includes('40') && normalized.includes('50'))) return 'middle-aged';
    if (normalized.includes('elder') || normalized.includes('senior') || normalized.includes('geriatric')) return 'elderly';
    
    return 'adult'; // Default category
  }

  public getDemographicTrends(
    questions: QuestionContext[],
    timeframe: 'monthly' | 'quarterly' | 'yearly' = 'quarterly'
  ): { period: string; demographics: DemographicSummary }[] {
    const groupedQuestions = this.groupQuestionsByTimeframe(questions, timeframe);
    
    return Array.from(groupedQuestions.entries()).map(([period, periodQuestions]) => ({
      period,
      demographics: this.aggregateDemographics(periodQuestions)
    }));
  }

  private groupQuestionsByTimeframe(
    questions: QuestionContext[],
    timeframe: 'monthly' | 'quarterly' | 'yearly'
  ): Map<string, QuestionContext[]> {
    const grouped = new Map<string, QuestionContext[]>();
    
    questions.forEach(question => {
      const date = new Date(question.timestamp);
      let period: string;
      
      switch (timeframe) {
        case 'monthly':
          period = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          break;
        case 'quarterly':
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          period = `${date.getFullYear()}-Q${quarter}`;
          break;
        case 'yearly':
          period = date.getFullYear().toString();
          break;
      }
      
      if (!grouped.has(period)) {
        grouped.set(period, []);
      }
      grouped.get(period)!.push(question);
    });
    
    return grouped;
  }
}

export const demographicAggregator = new DemographicAggregator(); 