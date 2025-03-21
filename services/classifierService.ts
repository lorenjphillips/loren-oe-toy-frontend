import OpenAI from 'openai';
import { QuestionClassification } from '../types/ads';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Classifies a medical question into relevant categories using OpenAI
 * @param question The medical question to classify
 * @param history Optional conversation history for context
 * @returns Classification result with categories and confidence scores
 */
export async function classifyQuestion(
  question: string,
  history: { role: string; content: string }[] = []
): Promise<QuestionClassification> {
  try {
    const prompt = `
      As a medical question classifier, analyze the following question and categorize it.
      Return a JSON object with:
      1. "categories": An array of objects, each with "categoryId" and "confidence" (0-1) 
      2. "keywords": An array of relevant medical keywords extracted from the question

      Available medical categories:
      - cardiology: Heart and cardiovascular system
      - dermatology: Skin conditions
      - endocrinology: Hormonal and metabolic disorders
      - gastroenterology: Digestive system
      - neurology: Brain and nervous system
      - oncology: Cancer and tumors
      - pediatrics: Children's health
      - psychiatry: Mental health
      - pulmonology: Respiratory system
      - rheumatology: Joint and autoimmune disorders
      
      Question: ${question}
    `;

    const chatCompletion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: [
        ...history,
        { role: 'system', content: prompt },
      ],
      response_format: { type: 'json_object' },
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    const classification = JSON.parse(content) as QuestionClassification;
    return classification;
  } catch (error) {
    console.error('Error classifying question:', error);
    // Return empty classification on error
    return { categories: [], keywords: [] };
  }
} 