import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ------------------------------
// 1. Local cache for common questions (no API call)
// ------------------------------
const localAnswers = {
  'how to report': 'Go to the Victim Dashboard, fill in the disaster type, description, your location (use the map picker), and needed resources (type & quantity). Then click Submit.',
  'what is sos': 'The SOS flag marks your report as critical. NGOs will be notified immediately and the urgency is set to "critical".',
  'how to register ngo': 'NGOs must provide their location on the map during registration. After registration, an admin will verify your account. Only verified NGOs can access the dashboard.',
  'resource deduction': 'When an NGO accepts a report, the requested quantities are automatically deducted from their inventory. You will see a low‑stock alert if resources fall below 20 units.',
  'match badge': 'The match badge shows which of the victim’s needed resources you have in stock and the match percentage. It helps NGOs prioritise reports that align with their inventory.',
  'geospatial matching': 'NGOs see only reports within a configurable radius (default 10 km). The backend uses MongoDB’s $near operator with a 2dsphere index to filter and sort by distance.',
};

function getLocalAnswer(message) {
  const lowerMsg = message.toLowerCase();
  for (const [key, answer] of Object.entries(localAnswers)) {
    if (lowerMsg.includes(key)) return answer;
  }
  return null;
}

// ------------------------------
// 2. Keyword filter (avoid irrelevant API calls)
// ------------------------------
const disasterKeywords = [
  'disaster', 'flood', 'earthquake', 'fire', 'cyclone', 'report', 'resource',
  'ngo', 'sos', 'emergency', 'evacuation', 'safety', 'help', 'victim',
  'inventory', 'match', 'accept', 'resolve', 'dashboard', 'location',
  'map', 'coordinates', 'radius', 'geospatial', 'chatbot', 'assistant',
  'helpora', 'platform', 'how to', 'what is', 'explain'
];

function isDisasterRelated(message) {
  const lower = message.toLowerCase();
  return disasterKeywords.some(keyword => lower.includes(keyword));
}

// ------------------------------
// 3. Main chat controller
// ------------------------------
const systemPrompt = `You are Helpora Assistant, an AI helper for a disaster response platform.  
You MUST answer ONLY questions related to:  
- Disaster preparedness, response, and recovery  
- How to use the Helpora platform (reporting, resource management, NGO coordination)  
- Safety tips for natural disasters (floods, earthquakes, fires, cyclones)  
- General information about disaster management  

If a user asks anything unrelated (e.g., sports, politics, entertainment, personal advice), politely say:  
"I'm sorry, I can only help with disaster‑related questions and Helpora platform support. Please ask me about disaster response or using the app."  

Answer concisely and helpfully (max 2–3 sentences).`;

export const chat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Step 1: Check local cache
    const localAnswer = getLocalAnswer(message);
    if (localAnswer) {
      return res.json({ reply: localAnswer });
    }

    // Step 2: Keyword filter – if not disaster‑related, return polite refusal (no API call)
    if (!isDisasterRelated(message)) {
      return res.json({
        reply: "I'm here to help with disaster response and Helpora platform questions. Please ask about those topics."
      });
    }

    // Step 3: Try Gemini with multiple model fallbacks
  const modelsToTry = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-3-pro'];
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const prompt = `${systemPrompt}\n\nUser question: ${message}`;
        const result = await model.generateContent(prompt);
        const reply = result.response.text();
        return res.json({ reply });
      } catch (err) {
        lastError = err;
        console.warn(`Model ${modelName} failed:`, err.message);
        // Continue to next model
      }
    }

    // If all models failed
    console.error('All Gemini models failed:', lastError);
    res.json({
      reply: "The AI assistant is temporarily unavailable due to high demand. Please try again later."
    });
  } catch (error) {
    console.error('Chat controller error:', error);
    res.status(500).json({ error: 'AI service unavailable' });
  }
};