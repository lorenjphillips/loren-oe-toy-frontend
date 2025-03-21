import { QuestionContext, TreatmentJourneyStage } from '../../../types/analytics';

export class JourneyAggregator {
  private readonly journeyStages = [
    'initial_symptoms',
    'diagnosis',
    'treatment_planning',
    'active_treatment',
    'monitoring',
    'follow_up',
    'long_term_management'
  ] as const;

  private readonly stageKeywords = {
    initial_symptoms: [
      'first noticed', 'started experiencing', 'new symptoms',
      'onset', 'presenting symptoms'
    ],
    diagnosis: [
      'diagnose', 'test results', 'confirm diagnosis',
      'differential diagnosis', 'diagnostic criteria'
    ],
    treatment_planning: [
      'treatment options', 'plan', 'approach',
      'therapy choice', 'treatment strategy'
    ],
    active_treatment: [
      'current treatment', 'therapy', 'medication',
      'side effects', 'response to treatment'
    ],
    monitoring: [
      'monitoring', 'progress', 'tracking',
      'response assessment', 'evaluation'
    ],
    follow_up: [
      'follow-up', 'check-up', 'post-treatment',
      'recovery', 'rehabilitation'
    ],
    long_term_management: [
      'long-term', 'chronic', 'ongoing management',
      'maintenance', 'prevention'
    ]
  };

  public mapQuestionsToJourney(questions: QuestionContext[]): TreatmentJourneyStage[] {
    const stageQuestions = new Map<string, QuestionContext[]>();
    
    // Initialize stages
    this.journeyStages.forEach(stage => {
      stageQuestions.set(stage, []);
    });

    // Map questions to stages
    questions.forEach(question => {
      const stage = this.determineJourneyStage(question);
      stageQuestions.get(stage)?.push(question);
    });

    // Calculate average timing for each stage
    const diagnosisQuestions = stageQuestions.get('diagnosis') || [];
    const diagnosisDates = new Map<string, Date>();
    
    diagnosisQuestions.forEach(q => {
      const conceptKey = this.getConceptKey(q);
      if (conceptKey && !diagnosisDates.has(conceptKey)) {
        diagnosisDates.set(conceptKey, new Date(q.timestamp));
      }
    });

    return this.journeyStages.map(stage => {
      const stageQs = stageQuestions.get(stage) || [];
      const conceptCounts = new Map<string, number>();
      
      stageQs.forEach(q => {
        q.medicalConcepts.forEach(concept => {
          conceptCounts.set(concept.term, (conceptCounts.get(concept.term) || 0) + 1);
        });
      });

      const commonConcepts = Array.from(conceptCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([term]) => term);

      const averageTiming = this.calculateAverageTiming(stageQs, diagnosisDates);

      return {
        stage,
        questionCount: stageQs.length,
        commonConcepts,
        averageTiming
      };
    });
  }

  private determineJourneyStage(question: QuestionContext): string {
    const text = question.medicalConcepts
      .map(c => c.term)
      .join(' ')
      .toLowerCase();

    for (const [stage, keywords] of Object.entries(this.stageKeywords)) {
      if (keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
        return stage;
      }
    }

    // Default to treatment_planning if no clear stage is detected
    return 'treatment_planning';
  }

  private getConceptKey(question: QuestionContext): string | null {
    const diseaseConcepts = question.medicalConcepts
      .filter(c => c.category === 'disease')
      .sort((a, b) => b.confidence - a.confidence);
    
    return diseaseConcepts[0]?.term || null;
  }

  private calculateAverageTiming(
    questions: QuestionContext[],
    diagnosisDates: Map<string, Date>
  ): number {
    const timings: number[] = [];

    questions.forEach(question => {
      const conceptKey = this.getConceptKey(question);
      if (conceptKey && diagnosisDates.has(conceptKey)) {
        const diagnosisDate = diagnosisDates.get(conceptKey)!;
        const questionDate = new Date(question.timestamp);
        const daysDiff = (questionDate.getTime() - diagnosisDate.getTime()) / (1000 * 60 * 60 * 24);
        timings.push(daysDiff);
      }
    });

    return timings.length > 0
      ? timings.reduce((sum, val) => sum + val, 0) / timings.length
      : 0;
  }

  public getJourneyTrends(
    questions: QuestionContext[],
    timeframe: 'monthly' | 'quarterly' = 'monthly'
  ): { period: string; stages: TreatmentJourneyStage[] }[] {
    const groupedQuestions = this.groupQuestionsByTimeframe(questions, timeframe);
    
    return Array.from(groupedQuestions.entries()).map(([period, periodQuestions]) => ({
      period,
      stages: this.mapQuestionsToJourney(periodQuestions)
    }));
  }

  private groupQuestionsByTimeframe(
    questions: QuestionContext[],
    timeframe: 'monthly' | 'quarterly'
  ): Map<string, QuestionContext[]> {
    const grouped = new Map<string, QuestionContext[]>();
    
    questions.forEach(question => {
      const date = new Date(question.timestamp);
      let period: string;
      
      if (timeframe === 'monthly') {
        period = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      } else {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        period = `${date.getFullYear()}-Q${quarter}`;
      }
      
      if (!grouped.has(period)) {
        grouped.set(period, []);
      }
      grouped.get(period)!.push(question);
    });
    
    return grouped;
  }
}

export const journeyAggregator = new JourneyAggregator(); 