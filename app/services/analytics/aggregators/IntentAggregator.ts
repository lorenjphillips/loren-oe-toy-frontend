import { QuestionContext, IntentBreakdown, ClinicalIntent } from '../../../types/analytics';

export class IntentAggregator {
  public aggregateIntents(questions: QuestionContext[]): IntentBreakdown[] {
    const intentCounts = new Map<ClinicalIntent, number>();
    const intentConcepts = new Map<ClinicalIntent, Map<string, number>>();
    
    // Initialize maps
    questions.forEach(question => {
      const intent = question.clinicalIntent;
      intentCounts.set(intent, (intentCounts.get(intent) || 0) + 1);
      
      if (!intentConcepts.has(intent)) {
        intentConcepts.set(intent, new Map());
      }
      
      // Count concepts for each intent
      question.medicalConcepts.forEach(concept => {
        const conceptMap = intentConcepts.get(intent)!;
        conceptMap.set(concept.term, (conceptMap.get(concept.term) || 0) + 1);
      });
    });

    const totalQuestions = questions.length;
    
    return Array.from(intentCounts.entries()).map(([intent, count]) => {
      const conceptMap = intentConcepts.get(intent) || new Map();
      const sortedConcepts = Array.from(conceptMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([term]) => term);

      return {
        intent,
        count,
        percentage: (count / totalQuestions) * 100,
        commonConcepts: sortedConcepts
      };
    });
  }

  public getIntentTrends(
    questions: QuestionContext[],
    timeframe: 'daily' | 'weekly' | 'monthly' = 'weekly'
  ): { period: string; breakdown: IntentBreakdown[] }[] {
    const groupedQuestions = this.groupQuestionsByTimeframe(questions, timeframe);
    
    return Array.from(groupedQuestions.entries()).map(([period, periodQuestions]) => ({
      period,
      breakdown: this.aggregateIntents(periodQuestions)
    }));
  }

  private groupQuestionsByTimeframe(
    questions: QuestionContext[],
    timeframe: 'daily' | 'weekly' | 'monthly'
  ): Map<string, QuestionContext[]> {
    const grouped = new Map<string, QuestionContext[]>();
    
    questions.forEach(question => {
      const date = new Date(question.timestamp);
      let period: string;
      
      switch (timeframe) {
        case 'daily':
          period = date.toISOString().split('T')[0];
          break;
        case 'weekly':
          const week = this.getWeekNumber(date);
          period = `${date.getFullYear()}-W${week}`;
          break;
        case 'monthly':
          period = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          break;
      }
      
      if (!grouped.has(period)) {
        grouped.set(period, []);
      }
      grouped.get(period)!.push(question);
    });
    
    return grouped;
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
}

export const intentAggregator = new IntentAggregator(); 