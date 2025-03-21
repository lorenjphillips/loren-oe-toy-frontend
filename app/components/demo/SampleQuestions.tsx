// Sample questions component for demo mode
'use client';

import React, { useState, useEffect } from 'react';
import { useDemoConfig } from '../../services/demo/demoConfig';
import { getQuestionsForScenario, DemoQuestion } from '../../data/demo/questions';
import { getCategoriesForScenario } from '../../data/demo/categories';

interface SampleQuestionsProps {
  onSelectQuestion?: (question: string) => void;
  className?: string;
  maxQuestions?: number;
  showCategories?: boolean;
}

const SampleQuestions: React.FC<SampleQuestionsProps> = ({
  onSelectQuestion,
  className = '',
  maxQuestions = 6,
  showCategories = true
}) => {
  const { config } = useDemoConfig();
  const [questions, setQuestions] = useState<DemoQuestion[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Record<string, string>>({});
  
  useEffect(() => {
    if (config.enabled) {
      // Get questions for current scenario
      const scenarioQuestions = getQuestionsForScenario(config.scenario);
      
      // Get categories for this scenario
      const scenarioCategories = getCategoriesForScenario(config.scenario);
      const categoryMap: Record<string, string> = {};
      
      scenarioCategories.forEach(category => {
        categoryMap[category.id] = category.name;
      });
      
      setCategories(categoryMap);
      
      // If we have an active category, filter by it
      if (activeCategory) {
        const filteredQuestions = scenarioQuestions
          .filter(q => q.category === activeCategory)
          .slice(0, maxQuestions);
        setQuestions(filteredQuestions);
      } else {
        // Otherwise show a mix of all categories
        setQuestions(scenarioQuestions.slice(0, maxQuestions));
      }
    }
  }, [config.enabled, config.scenario, activeCategory, maxQuestions]);
  
  const handleQuestionClick = (question: DemoQuestion) => {
    if (onSelectQuestion) {
      onSelectQuestion(question.text);
    }
  };
  
  const handleCategoryChange = (categoryId: string | null) => {
    setActiveCategory(categoryId);
  };
  
  if (!config.enabled || questions.length === 0) return null;
  
  // Get unique category IDs from our questions
  const uniqueCategories = Array.from(
    new Set(questions.map(q => q.category))
  );
  
  return (
    <div className={`${className} sample-questions`}>
      <h3 className="text-lg font-semibold mb-3">Sample Questions</h3>
      
      {showCategories && uniqueCategories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => handleCategoryChange(null)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              activeCategory === null
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            All Categories
          </button>
          
          {uniqueCategories.map(categoryId => (
            <button
              key={categoryId}
              onClick={() => handleCategoryChange(categoryId)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                activeCategory === categoryId
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              {categories[categoryId] || categoryId}
            </button>
          ))}
        </div>
      )}
      
      <div className="space-y-2">
        {questions.map((question) => (
          <div
            key={question.id}
            onClick={() => handleQuestionClick(question)}
            className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <p className="text-gray-800">{question.text}</p>
            <div className="mt-1 flex gap-2 flex-wrap">
              {question.tags.slice(0, 3).map(tag => (
                <span
                  key={`${question.id}-${tag}`}
                  className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
              <span className="inline-block text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded ml-auto">
                {question.difficulty}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SampleQuestions; 