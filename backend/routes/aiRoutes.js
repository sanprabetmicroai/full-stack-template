const express = require('express');
const router = express.Router();
const { handleGeminiChat, handleChatGPT } = require('../controllers/aiController');

// Route for Gemini chat
router.post('/gemini', handleGeminiChat);

// Route for ChatGPT
router.post('/chatgpt', handleChatGPT);

module.exports = router; 