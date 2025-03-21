import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { MedicalQuestionClassifier } from '../../services/classification';
import { ContextualRelevanceAnalyzer } from '../../services/contextualRelevance';
import { timeEstimator } from '../../services/timeEstimation';

const client = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
});

const classifier = new MedicalQuestionClassifier();
const contextAnalyzer = new ContextualRelevanceAnalyzer();

/**
 * Handles non-streaming answer generation
 */
export async function POST(request: Request) {
  const { question, history } = await request.json();

  console.log("process.env['OPENAI_API_KEY']:", process.env['OPENAI_API_KEY']);

  try {
    // Classify the question to estimate response time
    const classification = await classifier.classifyQuestion(question);
    
    // Get contextual relevance data which includes estimated response time
    const contextualRelevance = await contextAnalyzer.analyzeContextualRelevance(
      question,
      classification
    );
    
    // Generate time estimate
    const timeEstimate = timeEstimator.estimateTime(
      question,
      classification,
      contextualRelevance
    );
    
    // Start tracking progress
    timeEstimator.startProgressTracking(timeEstimate.initialEstimate);
    
    // Generate the answer
    const chatCompletion = await client.chat.completions.create({
      messages: [
        ...history,
        { role: 'user', content: question }],
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    });
    
    // Complete progress tracking
    timeEstimator.completeProgress();

    return NextResponse.json({ 
      answer: chatCompletion.choices[0].message.content,
      classification,
      timeEstimate
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Handles streaming answer generation with progress updates
 */
export async function GET(request: Request) {
  // Parse URL for question and other parameters
  const url = new URL(request.url);
  const question = url.searchParams.get('question');
  
  if (!question) {
    return NextResponse.json({ error: 'Question is required' }, { status: 400 });
  }
  
  try {
    // Create a stream response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Classify the question
          const classification = await classifier.classifyQuestion(question);
          
          // Send classification data
          controller.enqueue(encoder.encode(JSON.stringify({
            event: 'classification',
            data: classification
          }) + '\n\n'));
          
          // Get contextual relevance data
          const contextualRelevance = await contextAnalyzer.analyzeContextualRelevance(
            question,
            classification
          );
          
          // Generate time estimate
          const timeEstimate = timeEstimator.estimateTime(
            question,
            classification,
            contextualRelevance
          );
          
          // Send time estimate data
          controller.enqueue(encoder.encode(JSON.stringify({
            event: 'timeEstimate',
            data: timeEstimate
          }) + '\n\n'));
          
          // Setup progress tracking
          const progressHandler = (progress: any) => {
            controller.enqueue(encoder.encode(JSON.stringify({
              event: 'progress',
              data: progress
            }) + '\n\n'));
          };
          
          // Add progress listener
          timeEstimator.addProgressListener(progressHandler);
          
          // Start tracking progress
          timeEstimator.startProgressTracking(timeEstimate.initialEstimate);
          
          // Setup streaming from OpenAI
          const stream = await client.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: question }],
            stream: true,
          });
          
          let responseText = '';
          
          // Process each chunk
          for await (const chunk of stream) {
            // Extract content delta
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              responseText += content;
              
              // Send chunk
              controller.enqueue(encoder.encode(JSON.stringify({
                event: 'chunk',
                data: { content, responseText }
              }) + '\n\n'));
            }
          }
          
          // Complete progress tracking
          timeEstimator.completeProgress();
          
          // Remove progress listener
          timeEstimator.removeProgressListener(progressHandler);
          
          // Send completion event
          controller.enqueue(encoder.encode(JSON.stringify({
            event: 'complete',
            data: { responseText }
          }) + '\n\n'));
          
          // Close the stream
          controller.close();
        } catch (error: any) {
          // Send error event
          controller.enqueue(encoder.encode(JSON.stringify({
            event: 'error',
            data: { message: error.message }
          }) + '\n\n'));
          
          // Close the stream
          controller.close();
        }
      }
    });
    
    // Return the stream response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
