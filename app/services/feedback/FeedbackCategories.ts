/**
 * Feedback categories for reporting issues with ad targeting
 */

export enum FeedbackCategory {
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  MISLEADING_INFORMATION = 'misleading_information',
  SENSITIVE_HEALTH_DATA = 'sensitive_health_data',
  ACCURACY_ISSUE = 'accuracy_issue',
  ETHICAL_CONCERN = 'ethical_concern',
  IRRELEVANT_TARGETING = 'irrelevant_targeting',
  OTHER = 'other',
}

export interface FeedbackCategoryDefinition {
  id: FeedbackCategory;
  label: string;
  description: string;
  requiresDetails: boolean;
}

export const feedbackCategories: FeedbackCategoryDefinition[] = [
  {
    id: FeedbackCategory.INAPPROPRIATE_CONTENT,
    label: 'Inappropriate Content',
    description: 'Content that is offensive, disturbing, or not suitable for the context',
    requiresDetails: false,
  },
  {
    id: FeedbackCategory.MISLEADING_INFORMATION,
    label: 'Misleading Information',
    description: 'Ad contains inaccurate or deceptive information',
    requiresDetails: true,
  },
  {
    id: FeedbackCategory.SENSITIVE_HEALTH_DATA,
    label: 'Sensitive Health Data',
    description: 'Ad appears to use or reference sensitive health information',
    requiresDetails: false,
  },
  {
    id: FeedbackCategory.ACCURACY_ISSUE,
    label: 'Accuracy Issue',
    description: 'Information in the ad is factually incorrect',
    requiresDetails: true,
  },
  {
    id: FeedbackCategory.ETHICAL_CONCERN,
    label: 'Ethical Concern',
    description: 'Ad raises ethical issues or concerns',
    requiresDetails: true,
  },
  {
    id: FeedbackCategory.IRRELEVANT_TARGETING,
    label: 'Irrelevant Targeting',
    description: 'Ad is not relevant to current context or needs',
    requiresDetails: false,
  },
  {
    id: FeedbackCategory.OTHER,
    label: 'Other',
    description: 'Other issues not covered by the categories above',
    requiresDetails: true,
  },
];

export const getFeedbackCategoryById = (id: FeedbackCategory): FeedbackCategoryDefinition => {
  const category = feedbackCategories.find(cat => cat.id === id);
  if (!category) {
    throw new Error(`Feedback category with id ${id} not found`);
  }
  return category;
}; 