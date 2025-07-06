import OpenAI from 'openai';

let openai = null;

// Initialize OpenAI only if API key is available
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export const getVerdictSuggestion = async (description) => {
  if (!openai) {
    return 'AI verdict suggestions are not available. Please configure OpenAI API key.';
  }

  const prompt = `As a legal AI assistant, analyze the following case and provide a fair, balanced verdict suggestion based on common legal principles. Consider both sides of the argument:

Case Description: "${description}"

Please provide:
1. A clear verdict (Yes/No)
2. Brief reasoning (2-3 sentences)
3. Key factors considered

Verdict Analysis:`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.3,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('❌ AI Verdict Error:', error.message);
    return 'Unable to generate AI verdict at this time.';
  }
};

export const generateSummary = async (text) => {
  if (!openai) {
    return 'AI summaries are not available. Please configure OpenAI API key.';
  }

  const prompt = `Summarize the following case in 3-4 clear, concise lines focusing on the key facts and main issue:

"${text}"

Summary:`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150,
      temperature: 0.4,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('❌ AI Summary Error:', error.message);
    return 'Unable to generate summary at this time.';
  }
};

// ✅ New function for case complexity analysis
export const analyzeCaseComplexity = async (description) => {
  if (!openai) {
    return 'AI complexity analysis is not available. Please configure OpenAI API key.';
  }

  const prompt = `Analyze the complexity of this legal case and rate it from 1-10 (1=simple, 10=very complex):

"${description}"

Provide:
1. Complexity score (1-10)
2. Key factors making it complex/simple
3. Recommended priority level (Low/Medium/High/Urgent)

Analysis:`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150,
      temperature: 0.3,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('❌ AI Complexity Analysis Error:', error.message);
    return 'Unable to analyze case complexity at this time.';
  }
};

// ✅ New function for bias detection
export const detectBias = async (description) => {
  if (!openai) {
    return 'AI bias detection is not available. Please configure OpenAI API key.';
  }

  const prompt = `Analyze this case description for potential bias, emotional language, or unfair presentation:

"${description}"

Identify:
1. Any biased language or unfair presentation
2. Emotional appeals that might cloud judgment
3. Missing information that could affect fairness
4. Recommendations for neutral presentation

Bias Analysis:`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.2,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('❌ AI Bias Detection Error:', error.message);
    return 'Unable to analyze for bias at this time.';
  }
};
