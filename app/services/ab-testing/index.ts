import { TestManager as TestManagerClass } from './TestManager';
export { TestReporting } from './TestReporting';

// Create and export a singleton instance of TestManager
const TestManager = new TestManagerClass();

// Export the TestManager instance
export { TestManager };

// Export all A/B testing services
export { VariantAssigner } from './VariantAssigner';
export { ResultsCalculator } from './ResultsCalculator'; 