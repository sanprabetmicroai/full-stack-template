const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
require('dotenv').config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Gemini chat handler
const handleGeminiChat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    res.json({ response: text });
  } catch (error) {
    console.error('Gemini Error:', error);
    res.status(500).json({ error: 'Error processing Gemini request' });
  }
};

// ChatGPT handler
const handleChatGPT = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: message }],
      model: 'gpt-3.5-turbo',
    });

    res.json({ response: completion.choices[0].message.content });
  } catch (error) {
    console.error('ChatGPT Error:', error);
    res.status(500).json({ error: 'Error processing ChatGPT request' });
  }
};

module.exports = {
  handleGeminiChat,
  handleChatGPT,
}; 