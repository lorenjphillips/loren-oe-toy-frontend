/**
 * Sample Decision Trees Index
 * 
 * Exports sample clinical decision trees for various treatment areas
 * These trees demonstrate realistic clinical scenarios with educational value
 */

import pfizerOncologyTree from './pfizerOncologyTree';
import genentechOphthalmologyTree from './genentechOphthalmologyTree';
import lillyDiabetesTree from './lillyDiabetesTree';
import { DecisionTreeService } from '../../services/decisionTreeService';

// Export all sample trees
export const sampleTrees = [
  pfizerOncologyTree,
  genentechOphthalmologyTree,
  lillyDiabetesTree
];

/**
 * Load all sample trees into the decision tree service
 * @param service The decision tree service instance
 */
export function loadSampleTrees(service: DecisionTreeService): void {
  sampleTrees.forEach(tree => {
    service.loadTree(tree);
  });
}

export default sampleTrees; 