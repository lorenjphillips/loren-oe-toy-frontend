import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const client = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
});

export async function POST(request: Request) {
  const { question, history } = await request.json();

  console.log("process.env['OPENAI_API_KEY']:", process.env['OPENAI_API_KEY']);

  try {
    const chatCompletion = await client.chat.completions.create({
      messages: [
        ...history,
        { role: 'user', content: question }],
      model: 'gpt-3.5-turbo',
    });

    return NextResponse.json({ answer: chatCompletion.choices[0].message.content });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
