import { GoogleGenAI, Type } from '@google/genai';
import { GenerateQuizRequest, GenerateQuizResponse, Difficulty, OptionLetter } from './types.ts';
import { createSessionToken } from './token-util.ts';

// Simple in-memory rate limit tracker (sliding window per IP)
const ipRequestHistory = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 12; // 12 quizzes per minute max

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = ipRequestHistory.get(ip) || [];
  const recent = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  recent.push(now);
  ipRequestHistory.set(ip, recent);
  return false;
}

export default async function handler(req: any, res: any) {
  // Support CORS for flexibility
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Please use POST.'
    });
  }

  try {
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket?.remoteAddress || 'unknown';
    if (isRateLimited(clientIp)) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests. Please wait a minute before generating another quiz.'
      });
    }

    const body: GenerateQuizRequest = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const topic = (body.topic || '').trim();
    const focusArea = (body.focusArea || '').trim();
    let difficulty: Difficulty = (body.difficulty || 'intermediate').toLowerCase() as Difficulty;
    if (!['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
      difficulty = 'intermediate';
    }

    let numQuestions = Number(body.numQuestions) || 5;
    if (numQuestions < 3) numQuestions = 3;
    if (numQuestions > 10) numQuestions = 10;

    // Validate topic
    if (!topic || topic.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid academic topic (at least 2 characters).'
      });
    }

    if (topic.length > 250) {
      return res.status(400).json({
        success: false,
        error: 'Topic is too long. Please keep it under 250 characters.'
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not defined in environment variables.');
      return res.status(500).json({
        success: false,
        error: 'Quiz generation service is not configured. Missing GEMINI_API_KEY on the server.'
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const difficultyGuidelines: Record<Difficulty, string> = {
      beginner: 'Focus on fundamental definitions, core concepts, basic terminology, and introductory principles. Clear and accessible phrasing.',
      intermediate: 'Focus on conceptual application, mechanism analysis, comparing models, and real-world scenarios. Requires solid understanding.',
      advanced: 'Focus on deep synthesis, edge cases, rigorous analytical problem-solving, theoretical nuances, and advanced academic evaluation.'
    };

    const promptText = `Generate an academic multiple-choice quiz on the topic: "${topic}"${
      focusArea ? ` with specific focus on: "${focusArea}"` : ''
    }.
Difficulty level: ${difficulty.toUpperCase()} (${difficultyGuidelines[difficulty]}).
Generate exactly ${numQuestions} distinct, rigorous, well-crafted multiple-choice questions.

Requirements for each question:
1. "question": A precise, unambiguous, academically sound question prompt.
2. "options": An object containing exactly 4 options with keys "A", "B", "C", and "D". Each option text must be plausible, distinct, and informative.
3. "correct_answer": Exactly one uppercase letter: "A", "B", "C", or "D". Do not include extra text or periods.
4. "explanation": A thorough, educational paragraph explaining why the correct choice is true and clarifying key concepts or why common misconceptions in the other options are incorrect.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: `You are a distinguished university professor and master educator specializing in curriculum assessment and multiple-choice question design. 
Create highly accurate, balanced academic test items.
Ensure options are well distributed (A, B, C, D) and avoid obvious telltale patterns.
Never use lazy choices like "All of the above" or "None of the above".
Return strictly structured JSON adhering to the specified schema.`,
        temperature: 0.7,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          description: 'A collection of multiple-choice quiz questions',
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER, description: 'Question index starting from 1' },
              question: { type: Type.STRING, description: 'The question text' },
              options: {
                type: Type.OBJECT,
                properties: {
                  A: { type: Type.STRING, description: 'Option A text' },
                  B: { type: Type.STRING, description: 'Option B text' },
                  C: { type: Type.STRING, description: 'Option C text' },
                  D: { type: Type.STRING, description: 'Option D text' },
                },
                required: ['A', 'B', 'C', 'D'],
              },
              correct_answer: {
                type: Type.STRING,
                description: 'Single uppercase letter: A, B, C, or D',
              },
              explanation: {
                type: Type.STRING,
                description: 'Detailed academic explanation of the solution',
              },
            },
            required: ['id', 'question', 'options', 'correct_answer', 'explanation'],
          },
        },
      },
    });

    const responseText = response.text ? response.text.trim() : '';
    if (!responseText) {
      throw new Error('Gemini API returned an empty response.');
    }

    let parsedQuestions: any[];
    try {
      parsedQuestions = JSON.parse(responseText);
      if (!Array.isArray(parsedQuestions)) {
        if (typeof parsedQuestions === 'object' && Array.isArray((parsedQuestions as any).questions)) {
          parsedQuestions = (parsedQuestions as any).questions;
        } else {
          throw new Error('Expected JSON array of questions');
        }
      }
    } catch (parseErr) {
      console.error('Failed to parse Gemini output:', responseText);
      throw new Error('Invalid JSON format returned by AI model.');
    }

    // Validate and sanitize every question
    const validatedQuestions: Array<{
      id: number;
      question: string;
      options: { A: string; B: string; C: string; D: string };
      correct_answer: OptionLetter;
      explanation: string;
    }> = [];

    const validLetters: OptionLetter[] = ['A', 'B', 'C', 'D'];

    for (let i = 0; i < parsedQuestions.length; i++) {
      const q = parsedQuestions[i];
      if (!q || typeof q !== 'object') continue;

      const qText = typeof q.question === 'string' ? q.question.trim() : '';
      if (!qText) continue;

      const opts = q.options;
      if (!opts || typeof opts !== 'object') continue;

      const optA = typeof opts.A === 'string' ? opts.A.trim() : '';
      const optB = typeof opts.B === 'string' ? opts.B.trim() : '';
      const optC = typeof opts.C === 'string' ? opts.C.trim() : '';
      const optD = typeof opts.D === 'string' ? opts.D.trim() : '';

      if (!optA || !optB || !optC || !optD) continue;

      let correct = String(q.correct_answer || '').trim().toUpperCase();
      // Match first character if e.g. "A)" or "A. Option"
      const matchLetter = correct.match(/^[ABCD]/);
      const letter = (matchLetter ? matchLetter[0] : 'A') as OptionLetter;

      const expl = typeof q.explanation === 'string' && q.explanation.trim()
        ? q.explanation.trim()
        : `Option ${letter} is the correct answer based on academic principles of ${topic}.`;

      validatedQuestions.push({
        id: validatedQuestions.length + 1,
        question: qText,
        options: {
          A: optA,
          B: optB,
          C: optC,
          D: optD,
        },
        correct_answer: letter,
        explanation: expl,
      });

      if (validatedQuestions.length >= numQuestions) break;
    }

    if (validatedQuestions.length < 3) {
      throw new Error(`The AI generator was only able to produce ${validatedQuestions.length} valid questions. Please try a more specific topic.`);
    }

    const quizId = `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Create encrypted session token that securely encapsulates correct answers & explanations
    const sessionToken = createSessionToken({
      quizId,
      topic,
      difficulty,
      createdAt: Date.now(),
      questions: validatedQuestions,
    });

    // Strip answers and explanations for client transmission
    const clientQuestions = validatedQuestions.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
    }));

    const responsePayload: GenerateQuizResponse = {
      success: true,
      quizId,
      topic,
      difficulty,
      totalQuestions: clientQuestions.length,
      questions: clientQuestions,
      sessionToken,
      estimatedTimeMinutes: Math.max(2, Math.round(clientQuestions.length * 1.5)),
      generatedAt: new Date().toISOString(),
    };

    return res.status(200).json(responsePayload);
  } catch (error: any) {
    console.error('Error generating quiz:', error);
    const errorMessage = error?.message || 'Failed to generate quiz due to an unexpected server error.';
    return res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
}
