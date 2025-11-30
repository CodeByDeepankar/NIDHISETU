import Constants from 'expo-constants';

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const extraEnv = (Constants.expoConfig?.extra as { env?: Record<string, string | undefined> } | undefined)?.env ?? {};
const API_KEY =
  process.env.AI_SERVICE_API_KEY ??
  process.env.EXPO_PUBLIC_AI_SERVICE_API_KEY ??
  extraEnv.AI_SERVICE_API_KEY ??
  extraEnv.EXPO_PUBLIC_AI_SERVICE_API_KEY;

if (!API_KEY) {
  console.warn('AI_SERVICE_API_KEY is not set. Loan assistant will be disabled.');
}

export type LoanAssistantMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export interface LoanContext {
  beneficiaryName?: string;
  loanAmount?: number;
  bankName?: string;
}

export const loanAssistantClient = {
  async sendMessage(messages: LoanAssistantMessage[], context: LoanContext) {
    if (!API_KEY) {
      throw new Error('Missing AI_SERVICE_API_KEY.');
    }

    const systemPrompt = buildSystemPrompt(context);
    const payload = {
      systemInstruction: {
        role: 'system',
        parts: [{ text: systemPrompt }],
      },
      contents: messages.map((message) => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.content }],
      })),
      safetySettings: [
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' },
      ],
      generationConfig: {
        temperature: 0.4,
        topP: 0.8,
        maxOutputTokens: 256,
      },
    };

    const response = await fetch(`${GEMINI_ENDPOINT}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Gemini API request failed');
    }

    const data = (await response.json()) as GeminiResponse;
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.map((part) => part.text).join('\n').trim();

    if (!text) {
      throw new Error('Gemini returned an empty response.');
    }

    return text;
  },
};

const buildSystemPrompt = (context: LoanContext) => {
  const beneficiaryName = context.beneficiaryName ?? 'the beneficiary';
  const loanAmount = context.loanAmount ? `with a sanctioned amount of ₹${context.loanAmount.toLocaleString('en-IN')}` : '';
  const bankName = context.bankName ? `through ${context.bankName}` : '';

  return `You are the NIDHI SETU Loan Copilot. Respond as a supportive expert focused only on loan-related queries such as documentation, disbursement milestones, and compliance.
Borrower profile: ${beneficiaryName} ${loanAmount} ${bankName}.
Always keep tone friendly, concise, and bilingual where helpful (English with occasional Hindi phrases).
If a question is unrelated to loans, politely steer the conversation back to MSME loan guidance.
Summaries should include actionable next steps or reminders sourced from government MSME schemes when relevant.`;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};
