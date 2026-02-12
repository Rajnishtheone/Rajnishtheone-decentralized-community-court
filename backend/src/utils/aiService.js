import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY
let genAI = null

if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey)
}

const getModel = () => {
  if (!genAI) return null
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash'
  return genAI.getGenerativeModel({ model: modelName })
}

const extractText = (result) => {
  try {
    return result?.response?.text?.().trim() || ''
  } catch (error) {
    return ''
  }
}

const isQuotaError = (error) => {
  const message = `${error?.message || ''}`.toLowerCase()
  return (
    message.includes('quota') ||
    message.includes('resource') ||
    message.includes('rate') ||
    message.includes('limit')
  )
}

const generateText = async (prompt) => {
  const model = getModel()
  if (!model) {
    return 'AI assistance is not available. Please configure GEMINI_API_KEY.'
  }

  try {
    const result = await model.generateContent(prompt)
    const text = extractText(result)
    return text || 'Unable to generate a response at this time.'
  } catch (error) {
    if (isQuotaError(error)) {
      throw new Error('AI quota exceeded. Please check your Gemini plan and billing.')
    }
    throw new Error('Unable to respond at this time.')
  }
}

export const getVerdictSuggestion = async (description) => {
  const prompt = `As a legal AI assistant, analyze the following case and provide a fair, balanced verdict suggestion based on common legal principles. Consider both sides of the argument:

Case Description: "${description}"

Please provide:
1. A clear verdict (Yes/No)
2. Brief reasoning (2-3 sentences)
3. Key factors considered

Verdict Analysis:`

  return generateText(prompt)
}

export const generateSummary = async (text) => {
  const prompt = `Summarize the following case in 3-4 clear, concise lines focusing on the key facts and main issue:

"${text}"

Summary:`

  return generateText(prompt)
}

export const analyzeCaseComplexity = async (description) => {
  const prompt = `Analyze the complexity of this legal case and rate it from 1-10 (1=simple, 10=very complex):

"${description}"

Provide:
1. Complexity score (1-10)
2. Key factors making it complex/simple
3. Recommended priority level (Low/Medium/High/Urgent)

Analysis:`

  return generateText(prompt)
}

export const detectBias = async (description) => {
  const prompt = `Analyze this case description for potential bias, emotional language, or unfair presentation:

"${description}"

Identify:
1. Any biased language or unfair presentation
2. Emotional appeals that might cloud judgment
3. Missing information that could affect fairness
4. Recommendations for neutral presentation

Bias Analysis:`

  return generateText(prompt)
}

export const chatWithCase = async (caseItem, messages = []) => {
  const yesVotes = caseItem.votes?.filter((v) => v.vote === 'yes').length || 0
  const noVotes = caseItem.votes?.filter((v) => v.vote === 'no').length || 0
  const totalVotes = yesVotes + noVotes

  const recentComments = (caseItem.comments || [])
    .slice(-5)
    .map((c) => `- ${c.commentedBy?.username || 'Anonymous'} (${c.isJudgeComment ? 'Judge' : c.isAdminComment ? 'Admin' : 'Member'}): ${c.text}`)
    .join('\n')

  const context = `Case Title: ${caseItem.title}
Description: ${caseItem.description}
Category: ${caseItem.category || 'Other'}
Priority: ${caseItem.priority || 'Medium'}
Status: ${caseItem.status}
Evidence: ${caseItem.evidence || 'None'}
Filed By: ${caseItem.filedBy?.username || 'Unknown'}
Created At: ${new Date(caseItem.createdAt).toLocaleString()}
Votes: Yes ${yesVotes}, No ${noVotes}, Total ${totalVotes}
Recent Comments:
${recentComments || 'No comments'}`

  const systemPrompt = `You are an AI assistant helping a community court judge.
Use the provided case context to answer questions.
When asked for a verdict recommendation, provide:
1) Summary (3-5 bullets)
2) Key issues
3) Recommended verdict (Yes/No) with reasoning
4) Risks or missing info
Be impartial and cautious. Do not invent facts.`

  const transcript = Array.isArray(messages) && messages.length
    ? messages
        .map((msg) => `${msg.role === 'assistant' ? 'Assistant' : 'User'}: ${msg.content}`)
        .join('\n')
    : 'User: Provide a verdict recommendation and a concise case summary.'

  const prompt = `${systemPrompt}\n\nCASE CONTEXT:\n${context}\n\nConversation:\n${transcript}\nAssistant:`

  return generateText(prompt)
}
