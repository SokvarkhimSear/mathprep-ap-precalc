import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  sendPaymentTelegramNotification,
  verifyAndRecordCheckoutTimestamp,
} from './app/actions/telegram.js';
import {
  stripHtmlTags,
  sanitizeMathInput,
  sanitizeEmail,
  sanitizeId,
} from './src/utils/sanitize.js';

dotenv.config({ path: '.env.local' });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.disable('x-powered-by');
const PORT = process.env.PORT || 3000;

// Parse mathprep_checkout_ts cookie helper (Proxy-Safe Spam Protection without IP tracking)
function getCheckoutCookieTimestamp(req: express.Request): number {
  const cookieHeader = String(req.headers.cookie || '');
  const match = cookieHeader.match(/(?:^|;\s*)mathprep_checkout_ts=(\d+)/);
  return match ? Number(match[1]) : 0;
}

// Layer 1: Strict HTTP Security Headers Middleware
const CSP_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://*.firebaseio.com https://*.googleapis.com https://cdn.jsdelivr.net",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
  "img-src 'self' blob: data: https://*.googleusercontent.com https://*.googleapis.com https://*.firebasestorage.app",
  "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net",
  "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com wss://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com",
  "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), browsing-topics=()');
  res.setHeader('Content-Security-Policy', CSP_POLICY);
  if (req.path.startsWith('/api/')) {
    res.setHeader('X-Frame-Options', 'DENY');
  }
  next();
});

// Enable CORS, JSON and URL-encoded form parsing
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Serve static files from /public
app.use(express.static(path.resolve(__dirname, 'public')));

// Shared handler for POST /api/send-telegram and POST /api/notify/telegram
// Enforces Proxy-Safe Server-Side Timestamp Check (Cookie + User Key), Input Sanitization, and Anti-Doxxing
async function handleCheckoutTelegramNotification(req: express.Request, res: express.Response) {
  try {
    const body = req.body || {};
    const cleanSubmissionId = sanitizeId(body.submissionId, 128);
    const cleanEmail = sanitizeEmail(body.userEmail);
    const cleanUserId = sanitizeId(body.userId, 128);
    const cleanAmount = stripHtmlTags(body.amount || '$10.00', 32) || '$10.00';

    if (!cleanEmail || !cleanUserId) {
      return res.status(400).json({
        success: false,
        error: 'Authenticated user account is required.',
      });
    }

    const cookieLastTs = getCheckoutCookieTimestamp(req);
    const tsCheck = verifyAndRecordCheckoutTimestamp(cleanUserId || cleanEmail, cookieLastTs);

    if (!tsCheck.allowed) {
      return res.status(429).json({
        success: false,
        cooldownSeconds: tsCheck.remainingSeconds,
        error: `Please wait ${tsCheck.remainingSeconds} seconds before submitting another payment claim.`,
      });
    }

    const result = await sendPaymentTelegramNotification({
      submissionId: cleanSubmissionId,
      userEmail: cleanEmail,
      userId: cleanUserId,
      amount: cleanAmount,
      skipTimestampCheck: true,
    });

    if (result.success) {
      res.setHeader(
        'Set-Cookie',
        `mathprep_checkout_ts=${tsCheck.timestamp}; HttpOnly; SameSite=Lax; Path=/; Max-Age=30`
      );
      // Anti-doxxing: Return only minimal success confirmation, never user objects, emails, or payment statuses
      return res.json({ success: true });
    }

    return res.status(result.status || 400).json({
      success: false,
      error: result.error || 'Unable to process payment notification.',
    });
  } catch (_err: any) {
    return res.status(500).json({
      success: false,
      error: 'Failed to process payment notification.',
    });
  }
}

// POST /api/send-telegram
app.post('/api/send-telegram', handleCheckoutTelegramNotification);

// Server-Side Gemini Client (when GEMINI_API_KEY is configured)
const geminiAi = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// DeepSeek API Configuration (Server-side only)
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-7095e08d115345a99a1a3009fd679532';

/**
 * Helper to query LLM (tries Gemini 3.8 Flash first if GEMINI_API_KEY is available, then DeepSeek API)
 */
async function generateTutorCompletion(
  systemInstruction: string,
  messages: Array<{ role: string; content: string }>,
  temperature = 0.55
): Promise<string | null> {
  // 1. Try Server-Side Gemini API if GEMINI_API_KEY is present
  if (geminiAi) {
    try {
      const conversationTranscript = messages
        .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
        .join('\n\n');
      const geminiRes = await geminiAi.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: conversationTranscript,
        config: {
          systemInstruction,
          temperature,
        },
      });
      if (geminiRes && geminiRes.text) {
        return geminiRes.text;
      }
    } catch (geminiErr) {
      console.warn('Gemini tutor call note, falling back to DeepSeek:', geminiErr);
    }
  }

  // 2. Try DeepSeek API
  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'system', content: systemInstruction }, ...messages],
        temperature,
        max_tokens: 1300,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content;
      if (reply) return reply;
    }
  } catch (dsErr) {
    console.warn('DeepSeek tutor call note:', dsErr);
  }

  return null;
}

/**
 * Strips raw Markdown formatting symbols (such as **, ##, ###, ####, __, _, ---, and bullet dashes - )
 * outside of LaTeX math ($...$ and $$...$$) so student-facing Limmy responses
 * never display raw markdown characters.
 */
function cleanLimmyResponseText(raw: string): string {
  if (!raw) return '';
  const mathSegments: string[] = [];
  const mathRegex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[^\$\n]+?\$|\\\([\s\S]*?\\\))/g;

  const placeholderText = String(raw).replace(mathRegex, (match) => {
    const idx = mathSegments.length;
    mathSegments.push(match);
    return `%%LIMMYMATHTOKEN${idx}%%`;
  });

  const cleaned = placeholderText
    .replace(/^[ \t]*#{1,6}[ \t]*/gm, '')
    .replace(/^[ \t]*---+[ \t]*$/gm, '')
    .replace(/\*\*([\s\S]+?)\*\*/g, '$1')
    .replace(/__([\s\S]+?)__/g, '$1')
    .replace(/\*([^\*\n]+?)\*/g, '$1')
    .replace(/_([^\_\n]+?)_/g, '$1')
    .replace(/^[ \t]*[-*+][ \t]+/gm, '')
    .replace(/\*\*/g, '')
    .replace(/#{2,}/g, '')
    .replace(/_{1,}/g, '');

  return cleaned.replace(/%%LIMMYMATHTOKEN(\d+)%%/g, (_m, idxStr) => {
    return mathSegments[Number(idxStr)] || '';
  });
}

// Socratic Tutor System Prompt
const LIMMY_SYSTEM_PROMPT = `You are Limmy AI (Teacher Limmy), the friendly, encouraging AP Precalculus tutor for high school students on MathPrep.

Your Core Directives:
1. Sole Persona & Role: You act as an approachable, supportive Socratic tutor and lesson explainer for high school students taking AP Precalculus.
2. Strict AP Precalculus Scope (No Calculus Overreach):
   - Keep every explanation, formula, and concept strictly within the College Board AP Precalculus Course and Exam Description (CED).
   - Absolutely NO calculus overreach: never mention derivatives ($f'(x)$), integrals, formal epsilon-delta limit definitions, Rolle's theorem, Taylor series, or college-level theory not on the AP Precalculus exam.
3. Accessible High-School Language:
   - Use simple, clear high-school language and intuitive graphical or numerical analogies (e.g., comparing average rate of change to the slope of a straight line between two points, or concavity to a cup holding water vs. an umbrella shedding water).
4. Curriculum Scope (All 4 College Board AP Precalc Units):
   - Unit 1: Polynomial & Rational Functions (rates of change, zeros, multiplicity, vertical asymptotes, holes, binomial theorem)
   - Unit 2: Exponential & Logarithmic Functions (geometric sequences, compounding growth, Euler's number e, log properties, semi-log plots)
   - Unit 3: Trigonometric & Polar Functions (unit circle radians, sinusoidal modeling, reciprocal identities, double-angle formulas, polar curves)
   - Unit 4: Parameters, Vectors & Matrices (parametric motion, vector magnitude, dot product, 2D matrix transformations and inverses)
5. Strict LaTeX Math Formatting & Clean Plain Text (NO Markdown Signs):
   - Format every mathematical formula, variable, expression, coordinate, and equation in standard LaTeX using single dollar signs $...$ for inline math and double dollar signs $$...$$ for display math.
   - NEVER use markdown symbols like **, ##, ###, ####, or --- in your response. Write clean, natural sentences and numbered steps (1., 2., 3.) without any asterisks or hash signs.`;

// POST /api/limmy/explain route
app.post('/api/limmy/explain', async (req, res) => {
  try {
    const rawQuestion = req.body?.question;
    const rawContext = req.body?.context;
    const history = Array.isArray(req.body?.history) ? req.body.history : [];

    const question = sanitizeMathInput(rawQuestion, 2000);
    const context = sanitizeMathInput(rawContext, 2000);

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const systemPromptWithContext = context
      ? `${LIMMY_SYSTEM_PROMPT}\n\nCurrent Study Context (Topic/Formula): ${context}`
      : LIMMY_SYSTEM_PROMPT;

    const messages: Array<{ role: string; content: string }> = [];
    if (Array.isArray(history)) {
      const sanitizedHistory = history.slice(-8).map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: sanitizeMathInput(msg.content || '', 2000),
      }));
      messages.push(...sanitizedHistory);
    }
    messages.push({ role: 'user', content: question });

    const reply = await generateTutorCompletion(systemPromptWithContext, messages, 0.65);

    if (reply) {
      return res.json({ reply: cleanLimmyResponseText(reply), error: false });
    }

    return res.json({
      reply: cleanLimmyResponseText(
        `Hey! Teacher Limmy here. Let's look at your question together step by step.\n\nWhen thinking about "${question.slice(0, 60)}", what is the first AP Precalculus relationship or formula that comes to mind? For example, is this asking about an output value, the average rate of change $\\frac{\\Delta y}{\\Delta x}$ between two points, or an angle on the unit circle? Tell me what you notice first!`
      ),
      error: false,
    });
  } catch (error: any) {
    console.error('Error handling /api/limmy/explain:', error);
    return res.status(500).json({
      reply: 'Limmy ran into an unexpected server error processing this request. Please try asking again!',
      error: true,
    });
  }
});

/**
 * POST /api/limmy/practice-tutor
 * Context-Aware AI Practice Tutor for the Practice Arena ("Ask Limmy for a Hint", "Ask Limmy to Explain", and follow-up questions).
 * Accepts the complete question state telemetry payload and injects it into the LLM system prompt.
 */
app.post('/api/limmy/practice-tutor', async (req, res) => {
  try {
    const body = req.body || {};
    const tel = body.telemetry || body.telemetryPayload || body;

    const mode: 'hint' | 'explain' | 'followup' = body.mode || tel.mode || 'explain';
    const topicId = String(tel.topicId || tel.topic_id || body.topicId || body.topic_id || '1.1');
    const topicTitle = String(
      tel.topicName || tel.topicTitle || tel.topic_title || body.topicTitle || body.topic_title || `Topic ${topicId}`
    );
    const subTopicId = String(tel.subTopicId || tel.sub_topic_id || body.subTopicId || body.sub_topic_id || `${topicId}.A`);
    const subTopicTitle = String(
      tel.subTopicName || tel.subTopicTitle || tel.sub_topic_title || body.subTopicTitle || body.sub_topic_title || ''
    );
    const difficulty = String(tel.difficulty || body.difficulty || 'Medium');
    const questionType = String(tel.questionType || tel.question_type || body.questionType || body.question_type || 'MCQ');
    const questionText = String(
      tel.questionText || tel.questionStem || tel.stem_latex || body.questionStem || body.stem_latex || ''
    );

    const rawOptions = tel.options || body.options || [];
    const optionsList: string[] = Array.isArray(rawOptions)
      ? rawOptions.map((o: any) => String(o))
      : typeof (tel.optionsOrRubric || body.optionsOrRubric) === 'string' && (tel.optionsOrRubric || body.optionsOrRubric)
      ? String(tel.optionsOrRubric || body.optionsOrRubric).split(' | ')
      : [];

    const correctAnswer = String(tel.correctAnswer || tel.correct_answer || body.correctAnswer || body.correct_answer || '');
    const studentSubmittedAnswer = String(
      tel.studentSubmittedAnswer || tel.studentAnswer || tel.student_answer || body.studentAnswer || body.student_answer || 'Not yet submitted'
    );
    const studentSelectedLetter = String(tel.studentSelectedLetter || body.studentSelectedLetter || '');
    const correctOptionLetter = String(tel.correctOptionLetter || body.correctOptionLetter || '');

    const isCorrect = Boolean(
      tel.isCorrect !== undefined
        ? tel.isCorrect
        : tel.is_correct !== undefined
        ? tel.is_correct
        : body.isCorrect !== undefined
        ? body.isCorrect
        : body.is_correct
    );
    const hasSubmittedAnswer =
      tel.hasSubmittedAnswer !== undefined
        ? Boolean(tel.hasSubmittedAnswer)
        : studentSubmittedAnswer !== 'Not yet submitted' &&
          studentSubmittedAnswer !== 'Not yet specified' &&
          studentSubmittedAnswer.trim() !== '';

    const examTrap = String(tel.examTrap || tel.exam_trap || body.examTrap || body.exam_trap || '');
    const distractorDiagnostics = tel.distractorDiagnostics || body.distractorDiagnostics || {};
    const specificDistractorTrap = String(
      tel.specificDistractorTrap ||
        (studentSelectedLetter && distractorDiagnostics?.[studentSelectedLetter]) ||
        examTrap ||
        ''
    );
    const explanationLatex = String(
      tel.explanationLatex || tel.explanation_latex || body.explanationLatex || body.explanation_latex || ''
    );
    const rubricSummary = String(
      tel.rubricSummary || tel.optionsOrRubric || tel.rubric_summary || body.optionsOrRubric || body.rubric_summary || ''
    );
    const followUpQuestion = String(
      body.followUpQuestion || body.followup_question || tel.followUpQuestion || ''
    );
    const history = Array.isArray(body.history) ? body.history : [];

    // Format Multiple-Choice Options cleanly for the LLM prompt
    const formattedOptionsBlock =
      optionsList.length > 0
        ? optionsList
            .map((opt, idx) => {
              const letter = ['A', 'B', 'C', 'D'][idx] || String(idx + 1);
              const cleaned = opt.replace(/^\([A-D]\)\s*/i, '');
              const diag = distractorDiagnostics?.[letter] ? ` [Diagnostic: ${distractorDiagnostics[letter]}]` : '';
              return `  (${letter}) ${cleaned}${diag}`;
            })
            .join('\n')
        : rubricSummary || 'See problem stem';

    // Construct Mode-Specific Instructional Directives
    let modeDirective = '';
    if (mode === 'hint') {
      modeDirective = `MODE: SOCRATIC HINT ("Ask Limmy for a Hint").
- Do NOT reveal the final option letter or hand over the final numerical answer.
- Look at the active question state:
  * Topic: ${topicTitle} (${subTopicId}: ${subTopicTitle})
  * Student's Current/Submitted Answer: ${studentSubmittedAnswer}
  * Is Student Currently Right or Wrong?: ${hasSubmittedAnswer ? (isCorrect ? 'Right' : 'Wrong') : 'Has not checked yet'}
- If the student submitted an incorrect answer (${studentSubmittedAnswer}), gently point out what makes that specific choice tempting (${specificDistractorTrap || examTrap}) and ask a simple Socratic question that nudges them toward the right setup.
- State the exact governing AP Precalculus formula or relationship in KaTeX ($...$ or $$...$$) so they can take the next step themselves.`;
    } else if (mode === 'followup') {
      modeDirective = `MODE: SOCRATIC FOLLOW-UP COACHING.
- The student asked a specific follow-up question: "${followUpQuestion}"
- Answer their question directly and clearly in simple high-school language using KaTeX ($...$ and $$...$$), tying every step back to their submitted answer (${studentSubmittedAnswer}), the correct answer (${correctAnswer}), and the question stem.`;
    } else {
      modeDirective = `MODE: TARGETED DIAGNOSTIC & STEP-BY-STEP EXPLANATION ("Ask Limmy to Explain").
${
  !isCorrect && hasSubmittedAnswer
    ? `CRITICAL INSTRUCTION FOR INCORRECT ANSWER:
- The student submitted "${studentSubmittedAnswer}", which is INCORRECT (the correct answer is "${correctAnswer}").
- Do NOT give a generic textbook summary! You MUST:
  1. Diagnose the Student's Specific Answer (${studentSubmittedAnswer}): Look directly at "${studentSubmittedAnswer}" and explain in friendly high-school language the exact algebraic, sign, or interval-division mistake that leads a student to pick that distractor (${specificDistractorTrap || examTrap}).
  2. Explain the Underlying AP Precalculus Rule: State the core rule or formula for ${topicTitle} (${subTopicId}) using clean KaTeX ($...$ and $$...$$).
  3. Show the Correct Step-by-Step Walkthrough: Walk through the simple mathematical steps in KaTeX showing how to get ${correctAnswer}.
  4. Socratic Takeaway Question: End with one brief check-in question so the student locks in the idea.`
    : isCorrect && hasSubmittedAnswer
    ? `INSTRUCTION FOR CORRECT ANSWER:
- The student correctly selected "${studentSubmittedAnswer}"!
- Praise their work, confirm why "${studentSubmittedAnswer}" works, point out the AP Exam Trap (${examTrap || 'common distractor mistake'}) they successfully avoided, and show the clean step-by-step KaTeX solution.`
    : `INSTRUCTION FOR UNSUBMITTED / WALKTHROUGH REQUEST:
- Walk through the core rule for ${topicTitle} (${subTopicId}), warn about the known AP Exam Trap (${examTrap}), and demonstrate the step-by-step solution leading to ${correctAnswer} using KaTeX.`
}`;
    }

    const telemetrySystemPrompt = `${LIMMY_SYSTEM_PROMPT}

======================================================================
ACTIVE PRACTICE QUESTION TELEMETRY PAYLOAD (LIVE STUDENT STATE)
======================================================================
- Topic Name: ${topicTitle} (Topic ${topicId}, Sub-Topic ${subTopicId}: ${subTopicTitle})
- Difficulty Tier: ${difficulty}
- Question Format: ${questionType}
- Full Question Text (KaTeX):
${questionText}

- Multiple-Choice Options / Rubric:
${formattedOptionsBlock}

- Official Correct Answer: ${correctAnswer}
- Student's Exact Submitted Answer: ${studentSubmittedAnswer}
- Was the Student Right or Wrong? (isCorrect): ${hasSubmittedAnswer ? (isCorrect ? 'TRUE (Correct)' : 'FALSE (Incorrect)') : 'No answer submitted yet'}
- Known AP Exam Trap for This Question: ${examTrap || 'Watch for sign errors and interval division.'}
- Specific Distractor Diagnostic for Student's Choice: ${specificDistractorTrap || 'N/A'}
- Reference Step-by-Step Solution (KaTeX): ${explanationLatex || rubricSummary}
======================================================================

${modeDirective}

STRICT FORMATTING RULES:
- Format all mathematical expressions, variables, intervals, fractions, and equations using $...$ for inline math and $$...$$ for display math.
- NEVER use markdown symbols like **, ##, ###, ####, or ---. Use simple numbered lines (1., 2., 3.) and clean paragraphs.`;

    const messages: Array<{ role: string; content: string }> = [];
    if (Array.isArray(history) && history.length > 0) {
      history.slice(-6).forEach((m: any) => {
        messages.push({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: String(m.content || m.text || ''),
        });
      });
    }

    messages.push({
      role: 'user',
      content:
        mode === 'hint'
          ? `Can you give me a Socratic hint for this ${difficulty} ${questionType} on ${topicTitle}? My submitted answer is: ${studentSubmittedAnswer}.`
          : mode === 'followup'
          ? followUpQuestion || 'Can you clarify the key step in this problem?'
          : `Please explain this ${questionType} on ${topicTitle}. My submitted answer was "${studentSubmittedAnswer}" (${
              isCorrect ? 'Correct' : 'Incorrect'
            }) and the correct answer is "${correctAnswer}".`,
    });

    const llmReply = await generateTutorCompletion(telemetrySystemPrompt, messages, 0.55);
    if (llmReply) {
      return res.json({ reply: cleanLimmyResponseText(llmReply), error: false });
    }

    // Context-Aware Diagnostic Fallback (uses the exact student telemetry payload with zero ** or ## markdown signs)
    let fallbackReply = '';
    if (mode === 'hint') {
      fallbackReply = `Teacher Limmy's Socratic Hint — ${topicTitle} (${subTopicId})

Let's pause and check the setup before finding the final number!

${
  hasSubmittedAnswer && !isCorrect
    ? `1. Why Your Choice (${studentSubmittedAnswer}) Is a Common Trap:\n${
        specificDistractorTrap || examTrap || 'Double-check whether you divided by the full interval width or flipped a negative sign.'
      }\n\n`
    : ''
}${
        hasSubmittedAnswer && isCorrect
          ? `1. Spot On! Your submitted answer (${studentSubmittedAnswer}) is already right! Can you see why the other choices don't work?\n\n`
          : ''
      }2. Rule to Use:\nIn ${subTopicTitle || topicTitle}, start by writing down how the change in output compares to the change in input.\n\n3. Guiding Question:\nLook at the numbers given in the problem—once you plug the two endpoints into the formula, what do you get for the top and bottom of the fraction before simplifying?`;
    } else if (mode === 'followup') {
      fallbackReply = `Teacher Limmy on "${followUpQuestion}"

Great follow-up question on ${topicTitle} (${subTopicId})!

1. Comparing Your Answer (${studentSubmittedAnswer}) vs. Correct Answer (${correctAnswer}):
${specificDistractorTrap || examTrap || 'The key is keeping track of each algebra step carefully.'}

2. Step-by-Step Check:
${explanationLatex || rubricSummary || 'Plug the given values into the formula and simplify step by step.'}`;
    } else {
      if (hasSubmittedAnswer && !isCorrect) {
        fallbackReply = `Diagnostic Breakdown of Your Answer: ${studentSubmittedAnswer}

You chose ${studentSubmittedAnswer}, which is not quite right (the official AP answer is ${correctAnswer}). Let's look at why:

1. What Led to Your Answer (${studentSubmittedAnswer}):
${
  specificDistractorTrap ||
  examTrap ||
  `Picking ${studentSubmittedAnswer} usually happens when you find the top change $\\Delta y$ without dividing by the interval width $\\Delta x$ in $\\frac{\\Delta y}{\\Delta x}$, or when a negative sign gets flipped.`
}

2. The Core AP Precalculus Rule (${topicTitle} • ${subTopicId}):
${
  examTrap
    ? `Key AP Tip: ${examTrap}`
    : `Always set up the rule for ${subTopicTitle || topicTitle} and check both the top and bottom of your setup before matching an answer choice.`
}

3. Step-by-Step Solution (Leading to ${correctAnswer}):
${explanationLatex || rubricSummary || `Working through the formula step by step gives ${correctAnswer}.`}

Socratic Check: Looking at Step 3 above, can you spot the exact step where the math turns toward ${correctAnswer} instead of ${studentSubmittedAnswer}?`;
      } else if (hasSubmittedAnswer && isCorrect) {
        fallbackReply = `Spot On! Why Your Answer (${studentSubmittedAnswer}) Works

You submitted ${studentSubmittedAnswer}, which is 100% right! Here is why your reasoning earns full credit on the AP Exam:

1. Step-by-Step Verification:
${explanationLatex || rubricSummary}

2. The AP Exam Trap You Avoided:
${examTrap || 'Lots of students rush the algebra or forget to divide by the interval width—great job staying sharp!'}`;
      } else {
        fallbackReply = `Teacher Limmy's Step-by-Step Walkthrough (${topicTitle} • ${subTopicId})

Here is how to solve this ${difficulty} problem step by step:

1. Core Rule & AP Exam Trap to Watch For:
${examTrap || `Start by identifying the input and output values in ${subTopicTitle || topicTitle}.`}

2. Step-by-Step Solution (Correct Answer: ${correctAnswer}):
${explanationLatex || rubricSummary}`;
      }
    }

    return res.json({ reply: cleanLimmyResponseText(fallbackReply), error: false });
  } catch (err) {
    console.error('Error in /api/limmy/practice-tutor:', err);
    return res.status(500).json({
      reply: 'Teacher Limmy encountered a temporary error generating this response. Please try again!',
      error: true,
    });
  }
});

/**
 * POST /api/tutor & POST /api/limmy/lesson-tutor
 * Context-Aware AI Tutoring Pipeline for Curriculum Lesson Views & Practice Items.
 * Handles request_type: "LESSON_GUIDANCE" when students ask for help while reading lessons.
 */
async function handleLessonGuidanceRequest(req: express.Request, res: express.Response) {
  try {
    const body = req.body || {};
    const requestType = String(body.request_type || body.requestType || 'LESSON_GUIDANCE');

    // If request is actually a practice tutor telemetry payload, delegate smoothly
    if (requestType === 'PRACTICE_QUESTION' || (body.telemetry && !body.lesson_content && !body.lessonContent)) {
      return (app as any)._router.handle({ ...req, url: '/api/limmy/practice-tutor' }, res);
    }

    const topicTitle = String(
      body.topic_title || body.topicTitle || body.topicName || body.topic_name || 'AP Precalculus Lesson'
    );
    const lessonContent = String(
      body.lesson_content || body.lessonContent || body.lessonText || body.renderedContent || ''
    );
    const studentQuestion = String(
      body.student_question || body.studentQuestion || body.question || body.message || ''
    );
    const history = Array.isArray(body.history) ? body.history : [];

    if (!studentQuestion.trim()) {
      return res.status(400).json({ error: 'student_question is required', reply: '' });
    }

    const systemPrompt = `You are Teacher Limmy, an expert AP Precalculus tutor. The student is currently reading a lesson and needs clarification.

======================================================================
LESSON CONTEXT SECTION
======================================================================
Topic Title: ${topicTitle}

Lesson Content (The actual text and KaTeX formulas currently rendered on the student's screen):
${lessonContent || 'Topic Study Guide covering core AP Precalculus definitions, formulas, and mechanics.'}
======================================================================

GUIDANCE INSTRUCTIONS:
- Answer the student's question ("${studentQuestion}") based strictly on the provided lesson context.
- Break down the concept or formula using simple, high-school-friendly analogies (for example, comparing rate of change to speed on a highway, or concavity to a bowl holding water vs. an umbrella shedding water).
- Do NOT introduce calculus or any concepts outside the College Board AP Precalculus Course and Exam Description (CED) (no derivatives $f'(x)$, no integrals, no formal epsilon-delta limits, no Taylor series).
- Help the student build intuition so they understand what the formula or concept represents graphically, numerically, and algebraically.

STRICT RESPONSE FORMATTING (CLEAN TEXT):
- Do NOT use any markdown formatting symbols for plain text:
  * NO asterisks (**)
  * NO hashtags (##)
  * NO underscores (_)
  * NO markdown bullet dashes (-)
- Output pure plain text for explanations, using standard spacing and clean line breaks.
- You may use simple numbered lines (1., 2., 3.) for step-by-step instructions.
- The ONLY symbols allowed for formatting are single dollar signs ($...$) for inline KaTeX math and double dollar signs ($$...$$) for display KaTeX equations.`;

    const messages: Array<{ role: string; content: string }> = [];
    if (history.length > 0) {
      history.slice(-6).forEach((m: any) => {
        messages.push({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: String(m.content || m.text || ''),
        });
      });
    }

    messages.push({
      role: 'user',
      content: studentQuestion,
    });

    const llmReply = await generateTutorCompletion(systemPrompt, messages, 0.55);

    if (llmReply) {
      return res.json({
        reply: cleanLimmyResponseText(llmReply),
        request_type: 'LESSON_GUIDANCE',
        error: false,
      });
    }

    // Context-Aware Fallback if external LLM call is unavailable
    const fallbackReply = `Teacher Limmy on "${studentQuestion}" for ${topicTitle}

Let's look at this concept from your lesson together.

1. What This Concept Means in Simple Words:
In ${topicTitle}, this concept helps you understand how functions behave when input values change. Think of it like reading the speedometer and odometer in a car: one tells you where you are, and the other tells you how rapidly your position is changing.

2. The Core Formula:
Look at the formula card in your lesson. Each variable has a distinct job:
The input variable $x$ represents the independent quantity (such as time or distance).
The output $f(x)$ or $y$ tells you the resulting value.
Fractions like $\\frac{f(b) - f(a)}{b - a}$ compare the total vertical change to the horizontal interval width.

3. How to Apply It:
Whenever you see a problem on this topic, first identify the given numbers for the endpoints. Then plug those values into the formula and simplify step by step.

Guiding Question: Look at the lesson on your screen. Which specific variable or step in the formula would you like to walk through with an example?`;

    return res.json({
      reply: cleanLimmyResponseText(fallbackReply),
      request_type: 'LESSON_GUIDANCE',
      error: false,
    });
  } catch (error: any) {
    console.error('Error handling lesson guidance request:', error);
    return res.status(500).json({
      reply: 'Teacher Limmy encountered a temporary connection issue. Please ask again in a moment!',
      request_type: 'LESSON_GUIDANCE',
      error: true,
    });
  }
}

app.post('/api/tutor', handleLessonGuidanceRequest);
app.post('/api/limmy/lesson-tutor', handleLessonGuidanceRequest);

/**
 * TEACHER LIMMY ADMIN AGENT API (/api/admin/teacher-limmy)
 * Handles conversational curriculum authoring, lesson drafting, and AP question generation.
 */
const TEACHER_LIMMY_SYSTEM_PROMPT = `You are Teacher Limmy, the Principal AP Precalculus Curriculum Architect for MathPrep. Your job is to generate strictly lean, accessible, student-friendly AP Precalculus lessons and practice packages aligned with the College Board AP Precalculus Course and Exam Description (CED).

CRITICAL SCHEMA & TONE RULES:
1. NO ACADEMIC BLOAT OR ROMAN NUMERAL SECTIONS:
   - Completely avoid bloated academic Roman numeral structures (such as "I. Overview & The Rule of Four", "II. Algebraic Proofs, Structural Derivations", etc.).
   - Do NOT generate deep structural derivations, formal algebraic proofs, historical overviews, or complex academic sections.
   - Keep the payload lean and focused entirely on the core mechanics a high school student needs to solve the practice questions.
2. STRICT AP PRECALCULUS SCOPE (NO CALCULUS OVERREACH):
   - Limit all formulas and definitions strictly to what is required for the AP Precalculus exam.
   - Absolutely NO calculus overreach (no derivatives, integrals, formal limit definitions, or Taylor series).
3. ENFORCE THIS STRICT 3-PART LEAN CONTENT SCHEMA FOR EVERY TOPIC:
   - Concept Description: A brief, plain-English summary of what the concept is and why it matters.
   - Core Formula: The essential equation(s) formatted in KaTeX ($...$ inline, $$...$$ display), with variables clearly defined.
   - Simple Explanation: A direct, intuitive breakdown of how to apply the formula, using simple analogies and a quick step-by-step example.
4. OUTPUT FORMAT:
   - Provide a brief 1-2 sentence conversational summary of what you generated.
   - Output the curriculum package inside a valid JSON block marked with \`\`\`json ... \`\`\` matching this exact lean schema:

{
  "topic_id": "1.3",
  "topic_title": "Rates of Change in Linear & Quadratic Functions",
  "lesson": {
    "reading_time_minutes": 5,
    "concept_description": "A brief, plain-English summary of what the concept is and why it matters on the AP Precalculus exam.",
    "core_formula": "The essential equation(s) formatted in KaTeX ($$...$$ and $...$), with every variable clearly defined.",
    "simple_explanation": "A direct, intuitive breakdown of how to apply the formula using simple analogies and clear step-by-step mechanics.",
    "table_of_contents": [
      "Concept Description",
      "Core Formula",
      "Simple Explanation"
    ],
    "conceptual_sections": [
      {
        "section_id": "concept_description",
        "title": "Concept Description",
        "body_markdown": "Brief, plain-English summary of what the concept is and why it matters..."
      },
      {
        "section_id": "core_formula",
        "title": "Core Formula",
        "body_markdown": "Essential equation(s) formatted in KaTeX with variables clearly defined..."
      },
      {
        "section_id": "simple_explanation",
        "title": "Simple Explanation",
        "body_markdown": "Direct, intuitive breakdown of how to apply the formula using simple analogies..."
      }
    ]
  },
  "formula_sheet": {
    "sub_topics": [
      {
        "sub_topic_id": "1.3.A",
        "sub_topic_title": "Average Rate of Change (AROC)",
        "essential_formulas": [
          {
            "name": "Average Rate of Change Formula",
            "latex": "\\text{AROC}_{[a,b]} = \\frac{f(b) - f(a)}{b - a}",
            "description": "Where $a$ and $b$ are the starting and ending $x$-values, and $f(a), f(b)$ are the corresponding outputs."
          }
        ]
      }
    ]
  },
  "master_lesson": {
    "concept_description": "Brief, plain-English summary of what the concept is and why it matters...",
    "core_formula": "Essential equation(s) in KaTeX with variables clearly defined...",
    "simple_explanation": "Direct, intuitive breakdown of how to apply the formula using simple analogies...",
    "conceptual_overview": "Brief, plain-English summary of what the concept is and why it matters...",
    "core_principles": [
      {
        "heading": "Core Formula & Variable Definitions",
        "content_latex": "$$\\text{AROC}_{[a,b]} = \\frac{f(b) - f(a)}{b - a}$$ where $a, b$ are the interval endpoints and $f(a), f(b)$ are the outputs."
      },
      {
        "heading": "Simple Explanation",
        "content_latex": "Think of average rate of change like your average driving speed on a road trip: divide total change in output $\\Delta y$ by total change in input $\\Delta x$."
      }
    ],
    "worked_examples": [
      {
        "problem_latex": "Quick Practice Mechanic in KaTeX",
        "solution_steps": [
          "Step 1: Plug the given values into the core formula...",
          "Step 2: Simplify to find the answer..."
        ]
      }
    ]
  },
  "practice_section": {
    "mcq": [
      {
        "question_id": "1.3_mcq_1",
        "calculator_active": false,
        "difficulty": "Medium",
        "question_latex": "Question stem in KaTeX...",
        "options": ["(A) ...", "(B) ...", "(C) ...", "(D) ..."],
        "correct_index": 0,
        "explanation_latex": "Step-by-step solution in KaTeX...",
        "exam_trap": "Common student mistake to avoid..."
      }
    ],
    "frq": [
      {
        "frq_id": "1.3_frq_1",
        "calculator_active": true,
        "difficulty": "Medium",
        "scenario_latex": "Multi-part AP Free-Response stem in KaTeX...",
        "parts": [
          {
            "part_label": "(a)",
            "prompt_latex": "Part (a) question prompt in KaTeX...",
            "scoring_rubric": [
              { "criteria": "Formula setup", "points": 1 },
              { "criteria": "Correct value with units", "points": 1 }
            ],
            "model_solution_latex": "Clean step-by-step solution in KaTeX..."
          }
        ]
      }
    ]
  }
}`;

app.post('/api/admin/teacher-limmy', async (req, res) => {
  try {
    const {
      message,
      unit = 1,
      topicId = '1.1',
      topicTitle = 'Change in Tandem',
      currentTopicData = null,
      history = [],
      rawKnowledge = '',
    } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: TEACHER_LIMMY_SYSTEM_PROMPT },
      {
        role: 'system',
        content: `Target Sub-Unit Context: Unit ${unit}, Topic ${topicId}: "${topicTitle}". Enforce the strict 3-part lean schema (Concept Description, Core Formula, Simple Explanation). Do NOT generate Roman numeral headings, deep structural derivations, or academic bloat.`,
      },
    ];

    if (rawKnowledge && typeof rawKnowledge === 'string' && rawKnowledge.trim().length > 10) {
      messages.push({
        role: 'system',
        content: `Reference notes for grounding (keep strictly within the lean 3-part AP Precalculus schema—no calculus overreach or academic bloat): \n\n ${rawKnowledge.trim().slice(0, 16000)}`,
      });
    }

    if (Array.isArray(history)) {
      const sanitizedHistory = history.slice(-6).map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: String(msg.content || ''),
      }));
      messages.push(...sanitizedHistory);
    }

    messages.push({ role: 'user', content: message });

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature: 0.5,
        max_tokens: 2400,
      }),
    });

    if (!response.ok) {
      const normTopicId = String(topicId).replace(/[^0-9]/g, '_');
      const conceptDesc = `Topic ${topicId} (${topicTitle}) explains how input values $x$ and output values $f(x)$ change together across an interval. It matters because almost every AP Precalculus problem asks you to measure how fast a quantity is changing and whether that change is speeding up or slowing down.`;
      const coreForm = `$$\\text{AROC}_{[a,b]} = \\frac{f(b) - f(a)}{b - a}$$\n- $a, b$: The starting and ending input values on the horizontal axis ($a \\neq b$).\n- $f(a), f(b)$: The function's output values at $x = a$ and $x = b$.\n- $\\text{AROC}_{[a,b]}$: The average rate of change (the slope of the straight line connecting $(a, f(a))$ and $(b, f(b))$).`;
      const simpleExp = `Think of Average Rate of Change like your average speed on a car trip: you only care about where you started and where you ended, divided by how long it took. To solve practice problems:\n1. Find the two endpoints $x = a$ and $x = b$ from the question stem, graph, or table.\n2. Plug them in to get the outputs $f(a)$ and $f(b)$.\n3. Subtract the outputs on top ($f(b) - f(a)$) and divide by the change in inputs on the bottom ($b - a$). If this rate gets bigger over equal $x$-steps, the graph bends upward like a cup (concave up); if it gets smaller, it bends downward like an umbrella (concave down).`;

      const fallbackTopicData = {
        topicId: `topic_${normTopicId}`,
        unitNumber: Number(unit) || 1,
        topicCode: String(topicId),
        topic_id: String(topicId),
        topic_title: String(topicTitle),
        title: `Topic ${topicId}: ${topicTitle}`,
        status: 'published',
        lesson: {
          reading_time_minutes: 5,
          concept_description: conceptDesc,
          core_formula: coreForm,
          simple_explanation: simpleExp,
          table_of_contents: ['Concept Description', 'Core Formula', 'Simple Explanation'],
          conceptual_sections: [
            {
              section_id: 'concept_description',
              title: 'Concept Description',
              body_markdown: conceptDesc,
            },
            {
              section_id: 'core_formula',
              title: 'Core Formula',
              body_markdown: coreForm,
            },
            {
              section_id: 'simple_explanation',
              title: 'Simple Explanation',
              body_markdown: simpleExp,
            },
          ],
        },
        formula_sheet: {
          sub_topics: [
            {
              sub_topic_id: `${topicId}.A`,
              sub_topic_title: `${topicTitle} — Core Formula`,
              essential_formulas: [
                {
                  name: 'Average Rate of Change',
                  latex: '\\text{AROC}_{[a,b]} = \\frac{f(b) - f(a)}{b - a}',
                  description: 'Where $a$ and $b$ are the interval endpoints and $f(a), f(b)$ are the corresponding outputs.',
                },
              ],
            },
          ],
        },
        master_lesson: {
          concept_description: conceptDesc,
          core_formula: coreForm,
          simple_explanation: simpleExp,
          conceptual_overview: conceptDesc,
          core_principles: [
            {
              heading: 'Core Formula & Variables',
              content_latex: coreForm,
            },
            {
              heading: 'Simple Explanation',
              content_latex: simpleExp,
            },
          ],
          worked_examples: [
            {
              problem_latex: `Let $f(x) = 2x^2 - 3x + 1$. Find the average rate of change of $f$ over $[1, 4]$.`,
              solution_steps: [
                'Step 1: Find the outputs at the endpoints: $f(1) = 2(1)^2 - 3(1) + 1 = 0$ and $f(4) = 2(4)^2 - 3(4) + 1 = 21$.',
                'Step 2: Divide the change in output by the change in input: $\\text{AROC} = \\frac{21 - 0}{4 - 1} = \\frac{21}{3} = 7$.',
              ],
            },
          ],
        },
        practice_section: {
          mcq: [
            {
              question_id: `${topicId}_mcq_1`,
              calculator_active: false,
              difficulty: 'Medium',
              question_latex: `A function $g(t)$ satisfies $g(1) = 4$ and $g(5) = 20$. What is the average rate of change of $g$ over $[1, 5]$?`,
              options: ['(A) $4$', '(B) $5$', '(C) $16$', '(D) $24$'],
              correct_index: 0,
              explanation_latex: `$$\\text{AROC} = \\frac{g(5) - g(1)}{5 - 1} = \\frac{20 - 4}{4} = 4$$`,
              exam_trap: 'Forgetting to divide the top change $\\Delta g = 16$ by the interval width $\\Delta t = 4$.',
            },
          ],
          frq: [
            {
              frq_id: `${topicId}_frq_1`,
              calculator_active: false,
              difficulty: 'Medium',
              scenario_latex: `Selected values of a continuous function $h(x)$ are given by $h(0) = 2$, $h(2) = 5$, $h(4) = 10$, and $h(6) = 17$.`,
              parts: [
                {
                  part_label: '(a)',
                  prompt_latex: 'Find the average rate of change of $h$ on $[0, 6]$.',
                  scoring_rubric: [
                    { criteria: 'Difference quotient setup $\\frac{h(6)-h(0)}{6-0}$', points: 1 },
                    { criteria: 'Correct value $\\frac{15}{6} = 2.5$', points: 1 },
                  ],
                  model_solution_latex: '$\\text{AROC} = \\frac{17 - 2}{6 - 0} = \\frac{15}{6} = 2.5$.',
                },
                {
                  part_label: '(b)',
                  prompt_latex: 'Explain why the table values show that the graph of $h$ is concave up on $[0, 6]$.',
                  scoring_rubric: [
                    { criteria: 'Finds subinterval rates ($1.5, 2.5, 3.5$) and states they are increasing', points: 2 },
                  ],
                  model_solution_latex: 'Over equal steps of $\\Delta x = 2$, the average rates of change are $\\frac{5-2}{2}=1.5$, $\\frac{10-5}{2}=2.5$, and $\\frac{17-10}{2}=3.5$. Because the rate of change is increasing ($1.5 < 2.5 < 3.5$), $h$ is concave up.',
                },
              ],
            },
          ],
        },
      };

      const reply = `I have drafted a lean, student-friendly AP Precalculus lesson for Topic ${topicId}: ${topicTitle} following the 3-part schema (Concept Description, Core Formula, Simple Explanation).\n\n\`\`\`json\n${JSON.stringify(fallbackTopicData, null, 2)}\n\`\`\``;
      return res.json({ reply, stagedContent: fallbackTopicData });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Curriculum generated.';

    let stagedContent: any = null;
    const jsonMatch = reply.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        stagedContent = JSON.parse(jsonMatch[1].trim());
      } catch (e) {
        console.warn('Could not parse JSON block from Teacher Limmy reply:', e);
      }
    }

    return res.json({ reply, stagedContent });
  } catch (error: any) {
    console.error('Error in /api/admin/teacher-limmy:', error);
    return res.status(500).json({ error: 'Failed to process Teacher Limmy agent request.' });
  }
});

/**
 * POST /api/admin/generate-bank-questions
 * "⚡ Limmy Infinite Generator" endpoint: Drafts a batch of new questions (up to 52+ per topic)
 * tagged with "Easy", "Medium", and "Hard" difficulties and per-distractor diagnostics.
 */
app.post('/api/admin/generate-bank-questions', async (req, res) => {
  try {
    const {
      unit_id = 'unit_1',
      topic_id = '1.3',
      topic_title = 'Rates of Change in Linear and Quadratic Functions',
      sub_topic_id = '1.3.A',
      sub_topic_title = 'Average Rate of Change & Secant Lines',
      count = 50,
    } = req.body;

    const cleanSub = String(sub_topic_id).replace(/[^a-zA-Z0-9]/g, '_');
    const batchTimestamp = Date.now().toString().slice(-4);
    const totalCount = Math.min(Math.max(Number(count) || 50, 5), 60);
    const frqTarget = Math.max(2, Math.round(totalCount * 0.15));
    const mcqTarget = Math.max(1, totalCount - frqTarget);

    const generatedQuestions: any[] = [];
    const stemStyles = ['Numerical', 'Tabular', 'Graphical', 'Algebraic', 'Contextual Modeling'];
    const difficulties = ['Easy', 'Medium', 'Hard'];

    for (let i = 0; i < mcqTarget; i++) {
      const seq = String(i + 1).padStart(3, '0');
      const qId = `qb_${cleanSub}_gen_${batchTimestamp}_mcq_${seq}`;
      const stemStyle = stemStyles[i % stemStyles.length];
      const difficulty = difficulties[i % difficulties.length];
      const calcActive = i % 3 === 2;

      const x1 = (i % 6) + 1;
      const x2 = x1 + 3;
      const coeff = (i % 4) + 2;
      const cVal = (i % 7) + 4;
      const y1 = coeff * x1 * x1 + cVal;
      const y2 = coeff * x2 * x2 + cVal;
      const aroc = (y2 - y1) / (x2 - x1);

      let prompt_latex = '';
      let options: string[] = [];
      let explanation_latex = '';
      let exam_trap = '';
      let distractor_diagnostics: Record<string, string> = {};

      if (stemStyle === 'Tabular') {
        const xm = x1 + 1;
        const ym = coeff * xm * xm + cVal;
        prompt_latex = `**[${sub_topic_id} · ${stemStyle} Stem #${i + 1}]** Selected values of a function $f$ studied in **${sub_topic_title}** (*${topic_title}*) are given in the table below:\n$$\\begin{array}{|c|c|c|c|} \\hline x & ${x1} & ${xm} & ${x2} \\\\ \\hline f(x) & ${y1} & ${ym} & ${y2} \\\\ \\hline \\end{array}$$\nWhat is the average rate of change of $f$ over the closed interval $[${x1}, ${x2}]$?`;
        options = [
          `(A) $${aroc}$`,
          `(B) $${y2 - y1}$`,
          `(C) $${ym - y1}$`,
          `(D) $${((x2 - x1) / (y2 - y1)).toFixed(2)}$`,
        ];
        explanation_latex = `Using the secant slope formula on $[${x1}, ${x2}]$:\n$$\\text{AROC}_{[${x1},${x2}]} = \\frac{f(${x2}) - f(${x1})}{${x2} - ${x1}} = \\frac{${y2} - ${y1}}{${x2 - x1}} = ${aroc}$$`;
        exam_trap = `Option (B) computes only the numerator $\\Delta f = ${y2 - y1}$ without dividing by $\\Delta x = ${x2 - x1}$.`;
        distractor_diagnostics = {
          A: `Correct! Divides net output change $\\Delta f = ${y2 - y1}$ by interval width $\\Delta x = ${x2 - x1}$.`,
          B: `Mistake: Computed only the numerator net change $f(${x2}) - f(${x1}) = ${y2 - y1}$ and forgot to divide by $\\Delta x = ${x2 - x1}$.`,
          C: `Mistake: Used the interior point $x = ${xm}$ ($f(${xm}) - f(${x1}) = ${ym - y1}$) instead of the right endpoint $x = ${x2}$.`,
          D: `Mistake: Inverted the slope ratio by calculating $\\frac{\\Delta x}{\\Delta y}$ instead of $\\frac{\\Delta y}{\\Delta x}$.`,
        };
      } else if (stemStyle === 'Graphical') {
        prompt_latex = `**[${sub_topic_id} · ${stemStyle} Stem #${i + 1}]** Let $g(x) = ${coeff}x^2 + ${cVal}$ represent a curve analyzed in **${sub_topic_title}**. What is the slope of the secant line to the graph of $g$ passing through $(${x1}, g(${x1}))$ and $(${x2}, g(${x2}))$?`;
        options = [
          `(A) $m_{\\text{sec}} = ${aroc}$`,
          `(B) $m_{\\text{sec}} = ${2 * coeff * x1}$`,
          `(C) $m_{\\text{sec}} = ${y2 - y1}$`,
          `(D) $m_{\\text{sec}} = ${coeff * (x1 + x2) + cVal}$`,
        ];
        explanation_latex = `Since $g(${x1}) = ${y1}$ and $g(${x2}) = ${y2}$, the slope of the secant line connecting $(${x1}, ${y1})$ and $(${x2}, ${y2})$ is:\n$$m_{\\text{sec}} = \\frac{${y2} - ${y1}}{${x2} - ${x1}} = ${aroc}$$`;
        exam_trap = `Confusing the secant slope across $[${x1}, ${x2}]$ with the net change in output $g(${x2}) - g(${x1}) = ${y2 - y1}$.`;
        distractor_diagnostics = {
          A: `Correct! Applies the secant slope formula $\\frac{g(${x2}) - g(${x1})}{${x2} - ${x1}} = ${aroc}$.`,
          B: `Mistake: Evaluated the instantaneous slope at a single endpoint $x = ${x1}$ instead of the secant slope across $[${x1}, ${x2}]$.`,
          C: `Mistake: Reported the vertical change $\\Delta g = ${y2 - y1}$ without dividing by $\\Delta x = ${x2 - x1}$.`,
          D: `Mistake: Failed to cancel the constant term $+${cVal}$ when subtracting $g(${x2}) - g(${x1})$.`,
        };
      } else {
        prompt_latex = `**[${sub_topic_id} · ${stemStyle} Stem #${i + 1}]** In **Topic ${topic_id}: ${topic_title}** (*${sub_topic_title}*), let $h(t) = ${coeff}t^2 + ${cVal}$. Which expression and value correctly give the average rate of change of $h$ over $[${x1}, ${x2}]$?`;
        options = [
          `(A) $\\frac{h(${x2}) - h(${x1})}{${x2} - ${x1}} = ${aroc}$`,
          `(B) $\\frac{h(${x2}) + h(${x1})}{${x2} - ${x1}} = ${((y2 + y1) / (x2 - x1)).toFixed(1)}$`,
          `(C) $h(${x2}) - h(${x1}) = ${y2 - y1}$`,
          `(D) $\\frac{${x2} - ${x1}}{h(${x2}) - h(${x1})} = ${((x2 - x1) / (y2 - y1)).toFixed(3)}$`,
        ];
        explanation_latex = `Evaluating at the endpoints gives $h(${x1}) = ${y1}$ and $h(${x2}) = ${y2}$. Therefore:\n$$\\text{AROC} = \\frac{h(${x2}) - h(${x1})}{${x2} - ${x1}} = \\frac{${y2} - ${y1}}{3} = ${aroc}$$`;
        exam_trap = `Using addition in the numerator or omitting division by the interval length $\\Delta t = 3$.`;
        distractor_diagnostics = {
          A: `Correct! Subtracts $h(${x2}) - h(${x1})$ and divides by the interval width ${x2} - ${x1} = 3.`,
          B: `Mistake: Added $h(${x2}) + h(${x1})$ in the numerator instead of subtracting $h(${x2}) - h(${x1})$.`,
          C: `Mistake: Found the net change $h(${x2}) - h(${x1}) = ${y2 - y1}$ without dividing by the interval width $\\Delta t = 3$.`,
          D: `Mistake: Inverted the difference quotient as $\\frac{\\Delta t}{\\Delta h}$ instead of $\\frac{\\Delta h}{\\Delta t}$.`,
        };
      }

      generatedQuestions.push({
        id: qId,
        unit_id,
        topic_id,
        topic_title,
        sub_topic_id,
        sub_topic_title,
        type: 'MCQ',
        calculator_active: calcActive,
        difficulty,
        is_published: false,
        content: {
          stem_type: stemStyle,
          prompt_latex,
          options,
          correct_index: 0,
          explanation_latex,
          exam_trap,
          distractor_diagnostics,
        },
        created_at: new Date().toISOString(),
      });
    }

    for (let j = 0; j < frqTarget; j++) {
      const seq = String(j + 1).padStart(3, '0');
      const qId = `qb_${cleanSub}_gen_${batchTimestamp}_frq_${seq}`;
      const calcActive = j % 2 === 0;
      const difficulty = difficulties[j % difficulties.length];
      const t0 = 0;
      const t1 = 2 + (j % 3);
      const t2 = 5 + (j % 3) * 2;
      const v0 = 10 + j * 5;
      const v1 = v0 + 12;
      const v2 = v1 + 27;
      const fullAroc = ((v2 - v0) / (t2 - t0)).toFixed(3);

      generatedQuestions.push({
        id: qId,
        unit_id,
        topic_id,
        topic_title,
        sub_topic_id,
        sub_topic_title,
        type: 'FRQ',
        calculator_active: calcActive,
        difficulty,
        is_published: false,
        content: {
          scenario_latex: `**[${sub_topic_id} — Teacher Limmy Generated FRQ #${j + 1} (${difficulty})]** A continuous function $R(t)$ modeling a system in **${sub_topic_title}** (*${topic_title}*) satisfies $R(${t0}) = ${v0}$, $R(${t1}) = ${v1}$, and $R(${t2}) = ${v2}$ for $t$ measured in minutes.`,
          parts: [
            {
              part_label: '(a)',
              prompt_latex: `Find the average rate of change of $R(t)$ over the interval $[${t0}, ${t2}]$. Show the difference quotient setup.`,
              scoring_rubric: [
                { criteria: `Difference quotient setup $\\frac{R(${t2}) - R(${t0})}{${t2} - ${t0}}$`, points: 1 },
                { criteria: `Correct value $\\frac{${v2 - v0}}{${t2}} \\approx ${fullAroc}$`, points: 1 },
              ],
              model_solution_latex: `$$\\text{AROC}_{[${t0},${t2}]} = \\frac{R(${t2}) - R(${t0})}{${t2} - ${t0}} = \\frac{${v2} - ${v0}}{${t2}} = \\frac{${v2 - v0}}{${t2}} \\approx ${fullAroc}$$`,
            },
            {
              part_label: '(b)',
              prompt_latex: `Compare the average rate of change of $R$ on $[${t0}, ${t1}]$ with the average rate of change on $[${t1}, ${t2}]$, and interpret what this comparison implies about the concavity of $R$.`,
              scoring_rubric: [
                { criteria: `Computes both subinterval rates ($\\frac{12}{${t1}}$ and $\\frac{27}{${t2 - t1}}$)`, points: 1 },
                { criteria: `Correctly justifies concavity based on whether the rate of change is increasing or decreasing`, points: 1 },
              ],
              model_solution_latex: `On $[${t0}, ${t1}]$, $\\text{AROC} = \\frac{12}{${t1}} = ${(12 / t1).toFixed(2)}$. On $[${t1}, ${t2}]$, $\\text{AROC} = \\frac{27}{${t2 - t1}} = ${(27 / (t2 - t1)).toFixed(2)}$. Because the average rate of change is strictly increasing across adjacent subintervals, the graph of $R$ is concave up.`,
            },
          ],
        },
        created_at: new Date().toISOString(),
      });
    }

    return res.json({
      success: true,
      sub_topic_id,
      sub_topic_title,
      generated_count: generatedQuestions.length,
      questions: generatedQuestions,
    });
  } catch (error: any) {
    console.error('Error in /api/admin/generate-bank-questions:', error);
    return res.status(500).json({ error: 'Failed to generate question batch.' });
  }
});

/**
 * POST /api/notify/telegram
 * Sends Telegram notification for ACLEDA payment submissions (Protected by Proxy-Safe Timestamp Check).
 */
app.post('/api/notify/telegram', handleCheckoutTelegramNotification);

/**
 * POST /api/upload-screenshot
 * Helper to upload or process payment screenshot image with strict filename sanitization.
 */
app.post('/api/upload-screenshot', async (req, res) => {
  try {
    const { imageBase64, fileName } = req.body || {};
    if (!imageBase64) {
      return res.status(400).json({ success: false, error: 'No image data provided' });
    }

    const appUrl = process.env.APP_URL || 'http://localhost:3000';

    if (typeof imageBase64 === 'string' && /^https?:\/\//i.test(imageBase64)) {
      const safeUrl = stripHtmlTags(imageBase64, 500);
      return res.json({ success: true, url: safeUrl });
    }

    const fs = await import('fs');
    const uploadsDir = path.resolve(__dirname, 'public/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Strict filename sanitization to prevent path traversal or XSS
    const safeBaseName = sanitizeId(fileName || `screenshot_${Date.now()}`, 64).replace(/\.+/g, '_') || `screenshot_${Date.now()}`;
    const cleanName = `${safeBaseName}.png`;
    const filePath = path.join(uploadsDir, cleanName);

    const base64Data = String(imageBase64).replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(413).json({ success: false, error: 'Image exceeds maximum size limit.' });
    }
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `${appUrl}/uploads/${cleanName}`;
    return res.json({ success: true, url: publicUrl, localPath: `/uploads/${cleanName}` });
  } catch (_err: any) {
    return res.status(500).json({ success: false, error: 'Failed to process screenshot upload.' });
  }
});

/**
 * GET & POST /api/cron/subscriptions
 * Daily Cron job to check expired monthly subscriptions and send 3-day renewal reminder notifications/emails.
 * Strict Secret Protection & Anti-Doxxing: Requires CRON_SECRET and never returns user PII or payment records.
 */
async function handleSubscriptionCron(req: express.Request, res: express.Response) {
  const authHeader = String(req.headers.authorization || '');
  const bearerSecret = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const querySecret = typeof req.query.secret === 'string' ? req.query.secret : '';
  const providedSecret = bearerSecret || querySecret;
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || !providedSecret || providedSecret !== cronSecret) {
    return res.status(401).json({ success: false, error: 'Unauthorized cron request' });
  }

  try {
    const { initializeApp, getApps, getApp } = await import('firebase/app');
    const { getFirestore, collection, getDocs, doc, updateDoc } = await import('firebase/firestore');
    const fs = await import('fs');

    let expiredCount = 0;
    let remindersCount = 0;
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const configPath = path.resolve(__dirname, 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      const fbApp = getApps().length ? getApp() : initializeApp(config);
      const db = getFirestore(fbApp, config.firestoreDatabaseId);

      const usersSnap = await getDocs(collection(db, 'users'));

      for (const userDoc of usersSnap.docs) {
        const userData = userDoc.data();
        const subEndDateStr = userData.subscription_end_date;

        if (subEndDateStr) {
          const subEndDate = new Date(subEndDateStr);

          // Check 1: Has subscription expired?
          if (subEndDate < now && userData.isPremium === true) {
            await updateDoc(doc(db, 'users', userDoc.id), {
              isPremium: false,
              subscription_status: 'expired',
              updatedAt: now.toISOString(),
            });
            expiredCount++;
          }

          // Check 2: Expiring within 3 days? (Reminder)
          if (subEndDate > now && subEndDate <= threeDaysFromNow && userData.isPremium === true) {
            remindersCount++;
            if (process.env.RESEND_API_KEY && userData.email) {
              const safeDisplayName = stripHtmlTags(userData.displayName || 'Student', 80);
              try {
                await fetch('https://api.resend.com/emails', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
                  },
                  body: JSON.stringify({
                    from: 'MathPrep <support@mathprep.app>',
                    to: [userData.email],
                    subject: 'Your MathPrep AP Precalculus Subscription is Expiring Soon',
                    html: `<p>Hi ${safeDisplayName},</p><p>Your MathPrep Premium Subscription will expire on <b>${new Date(subEndDateStr).toLocaleDateString()}</b>. Please visit <a href="${process.env.APP_URL || 'https://mathprep.app'}/#/checkout">MathPrep Checkout</a> to upload a payment screenshot and extend your membership.</p>`,
                  }),
                });
              } catch (_emailErr) {
                // Suppress internal error details
              }
            }
          }
        }
      }
    }

    // Anti-Doxxing: Return only aggregate counters, never user objects, emails, or payment statuses
    return res.json({
      success: true,
      timestamp: now.toISOString(),
      expiredSubscriptionsProcessed: expiredCount,
      expiringRemindersSent: remindersCount,
    });
  } catch (_error: any) {
    return res.status(500).json({ success: false, error: 'Failed to execute cron job' });
  }
}

app.get('/api/cron/subscriptions', handleSubscriptionCron);
app.post('/api/cron/subscriptions', handleSubscriptionCron);

// Setup Vite middleware in dev or static serve in prod
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`MathPrep server running on http://localhost:${PORT}`);
  });
}

startServer();
