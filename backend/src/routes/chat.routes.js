const express = require('express');
const router = express.Router();
const { Anthropic } = require('@anthropic-ai/sdk');

router.post('/', async (req, res, next) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn("ANTHROPIC_API_KEY is not defined in backend .env. Returning mockup response.");
      return res.json({
        reply: "Welcome to Anwar Clothing! I am running in demo mode. To enable real Claude responses, please add your ANTHROPIC_API_KEY to the backend .env. How can I help you today?"
      });
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    // Clean and validate role mappings
    const apiMessages = messages.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content || ''
    })).filter(m => m.content.trim() !== '');

    const systemPrompt = "You are a helpful shopping assistant for Anwar Clothing, a premium Pakistani clothing brand selling Egyptian Giza cotton, Boski silk, embroidered lawn, luxury chiffon, and kids' cotton. You help customers with: product questions, size & fit advice, order tracking (ask for order ID), returns policy (7 days, unworn, original packaging), and general support. Keep replies short, friendly, and helpful. For returns/complex issues, suggest WhatsApp at +923294359224.";

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 300,
      system: systemPrompt,
      messages: apiMessages
    });

    const reply = response.content[0].text;
    res.json({ reply });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
