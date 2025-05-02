import { NextRequest, NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';

export async function POST(request: NextRequest) {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  
  try {
    const { prompt } = await request.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "user", content: prompt }
      ]
    });
    
    return NextResponse.json({ 
      message: response.choices[0].message.content 
    });
  } catch (error) {
    console.error('Error with Groq API:', error);
    return NextResponse.json(
      { error: "Error processing your request" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "user", content: "Hello from JustCoinIt!" }
      ]
    });
    
    return NextResponse.json({ 
      message: response.choices[0].message.content 
    });
  } catch (error) {
    console.error('Error with Groq API:', error);
    return NextResponse.json(
      { error: "Error processing your request" },
      { status: 500 }
    );
  }
} 