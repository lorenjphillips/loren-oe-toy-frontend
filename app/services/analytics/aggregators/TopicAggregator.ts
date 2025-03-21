import { MedicalConcept, TopicDistribution } from '../../../types/analytics';

export class TopicAggregator {
  private readonly topicHierarchy = new Map<string, string[]>([
    ['cardiovascular', ['heart disease', 'hypertension', 'arrhythmia']],
    ['respiratory', ['asthma', 'copd', 'pneumonia']],
    ['endocrine', ['diabetes', 'thyroid', 'hormonal']],
    ['neurological', ['seizure', 'stroke', 'headache']],
    ['infectious', ['bacterial', 'viral', 'fungal']]
  ]);

  public aggregateTopics(concepts: MedicalConcept[]): TopicDistribution[] {
    const topicCounts = new Map<string, Set<string>>();
    
    // Initialize topic counts
    this.topicHierarchy.forEach((_, category) => {
      topicCounts.set(category, new Set());
    });

    // Categorize concepts
    concepts.forEach(concept => {
      this.topicHierarchy.forEach((subTopics, category) => {
        if (this.conceptMatchesCategory(concept, category, subTopics)) {
          const topicSet = topicCounts.get(category);
          if (topicSet) {
            topicSet.add(concept.term);
          }
        }
      });
    });

    // Convert to distribution
    const totalConcepts = concepts.length;
    return Array.from(topicCounts.entries()).map(([category, terms]) => ({
      category,
      count: terms.size,
      percentage: (terms.size / totalConcepts) * 100,
      subTopics: Array.from(terms).map(term => ({
        term,
        count: concepts.filter(c => c.term === term).length
      }))
    }));
  }

  private conceptMatchesCategory(
    concept: MedicalConcept,
    category: string,
    subTopics: string[]
  ): boolean {
    const normalizedTerm = concept.term.toLowerCase();
    return subTopics.some(topic => 
      normalizedTerm.includes(topic.toLowerCase()) ||
      this.areTermsRelated(normalizedTerm, topic.toLowerCase())
    );
  }

  private areTermsRelated(term1: string, term2: string): boolean {
    // TODO: Implement medical terminology relationship checking
    // This should use a medical ontology to determine if terms are related
    return false;
  }

  public getTopicTrends(
    conceptsOverTime: { timestamp: Date; concepts: MedicalConcept[] }[]
  ): { timestamp: Date; distributions: TopicDistribution[] }[] {
    return conceptsOverTime.map(({ timestamp, concepts }) => ({
      timestamp,
      distributions: this.aggregateTopics(concepts)
    }));
  }
}

export const topicAggregator = new TopicAggregator(); 