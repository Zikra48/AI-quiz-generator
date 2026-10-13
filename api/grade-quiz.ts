import { GradeQuizRequest, GradeQuizResponse, QuestionResult, OptionLetter } from './types.ts';
import { decryptSessionToken } from './token-util.ts';

export default async function handler(req: any, res: any) {
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
    const body: GradeQuizRequest = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { sessionToken, answers = {}, timeTakenSeconds } = body;

    if (!sessionToken) {
      return res.status(400).json({
        success: false,
        error: 'Missing session token. Please re-generate the quiz.'
      });
    }

    const sessionPayload = decryptSessionToken(sessionToken);
    if (!sessionPayload || !sessionPayload.questions || !Array.isArray(sessionPayload.questions)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired quiz session. Please generate a new quiz.'
      });
    }

    const { quizId, topic, difficulty, questions } = sessionPayload;
    let score = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    const results: QuestionResult[] = questions.map((q) => {
      const selected = answers[q.id] as OptionLetter | undefined;
      const isSelected = !!selected && ['A', 'B', 'C', 'D'].includes(selected);
      const isCorrect = isSelected && selected === q.correct_answer;

      if (isCorrect) {
        score++;
      } else if (!isSelected) {
        unansweredCount++;
      } else {
        incorrectCount++;
      }

      return {
        id: q.id,
        question: q.question,
        options: q.options,
        selectedAnswer: isSelected ? selected : null,
        correctAnswer: q.correct_answer,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const totalQuestions = questions.length;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const passed = percentage >= 70;

    let gradeBadge = 'Needs Review';
    if (percentage >= 90) {
      gradeBadge = 'High Distinction';
    } else if (percentage >= 80) {
      gradeBadge = 'Distinction';
    } else if (percentage >= 70) {
      gradeBadge = 'Pass with Credit';
    } else if (percentage >= 50) {
      gradeBadge = 'Pass';
    }

    const responsePayload: GradeQuizResponse = {
      success: true,
      quizId,
      topic,
      difficulty,
      score,
      totalQuestions,
      percentage,
      correctCount: score,
      incorrectCount,
      unansweredCount,
      passed,
      gradeBadge,
      timeTakenSeconds,
      results,
    };

    return res.status(200).json(responsePayload);
  } catch (error: any) {
    console.error('Error grading quiz:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to grade quiz.'
    });
  }
}
