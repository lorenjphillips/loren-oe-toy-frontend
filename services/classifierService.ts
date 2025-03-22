import OpenAI from 'openai';
import { QuestionClassification } from '../types/ads';

// Declare ChatCompletionMessage interface here since we can't import it directly
interface ChatCompletionMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-api-key-for-classifier',
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

    const messages: ChatCompletionMessage[] = [
      ...(history.filter(msg => 
        typeof msg.role === 'string' && 
        (msg.role === 'system' || msg.role === 'user' || msg.role === 'assistant')
      ) as ChatCompletionMessage[]),
      { role: 'system' as const, content: prompt },
      { role: 'user' as const, content: question }
    ];

    const chatCompletion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: messages,
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