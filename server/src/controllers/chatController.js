import { buildUserContext, chat, chatPublic } from '../services/aiChatService.js';

/**
 * Handle chat message from user
 * Accepts conversation history, injects user context, returns AI response
 */
export const sendMessage = async (req, res) => {
  try {
    const { messages } = req.body;

    // Validate messages array
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: { message: 'Messages array is required' } });
    }

    if (messages.length > 30) {
      return res.status(400).json({ error: { message: 'Too many messages. Please start a new conversation.' } });
    }

    // Validate and sanitize each message
    const validRoles = ['user', 'assistant'];
    const sanitized = [];
    for (const msg of messages) {
      if (!msg || typeof msg.content !== 'string' || !validRoles.includes(msg.role)) {
        continue; // skip invalid messages
      }
      sanitized.push({
        role: msg.role,
        content: msg.content.slice(0, 2000), // enforce max length
      });
    }

    if (sanitized.length === 0) {
      return res.status(400).json({ error: { message: 'No valid messages provided' } });
    }

    // Build user context and call AI
    const userContext = await buildUserContext(req.user.userId);
    const aiResponse = await chat(sanitized, userContext);

    res.json({ message: aiResponse });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: { message: 'Failed to process message' } });
  }
};

/**
 * Handle public (unauthenticated) chat message from the marketing landing page.
 * Uses a scoped pre-sales system prompt and tighter input limits.
 */
export const sendPublicMessage = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: { message: 'Messages array is required' } });
    }

    // Tighter conversation cap than authed endpoint
    if (messages.length > 10) {
      return res.status(400).json({ error: { message: 'Too many messages. Please start a new conversation.' } });
    }

    const validRoles = ['user', 'assistant'];
    const sanitized = [];
    for (const msg of messages) {
      if (!msg || typeof msg.content !== 'string' || !validRoles.includes(msg.role)) {
        continue;
      }
      sanitized.push({
        role: msg.role,
        content: msg.content.slice(0, 2000),
      });
    }

    if (sanitized.length === 0) {
      return res.status(400).json({ error: { message: 'No valid messages provided' } });
    }

    const latestUser = [...sanitized].reverse().find(m => m.role === 'user');
    console.log(`[chat-public] ip=${req.ip} turns=${sanitized.length} latest_len=${latestUser?.content?.length ?? 0}`);

    const aiResponse = await chatPublic(sanitized);
    res.json({ message: aiResponse });
  } catch (error) {
    console.error('Public chat error:', error);
    res.status(500).json({ error: { message: 'Failed to process message' } });
  }
};
