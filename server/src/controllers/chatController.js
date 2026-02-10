import {
  buildUserContext,
  chat,
  buildCaseContext,
  caseChat,
  suggestArticle,
  getProactiveAlerts,
  generateGrievanceDraft,
} from '../services/aiChatService.js';

/**
 * Shared message sanitization helper.
 * Validates roles, enforces max length, skips invalid messages.
 */
export function sanitizeMessages(messages) {
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
  return sanitized;
}

/**
 * Phase 1: General chat message handler
 */
export const sendMessage = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: { message: 'Messages array is required' } });
    }

    if (messages.length > 30) {
      return res.status(400).json({ error: { message: 'Too many messages. Please start a new conversation.' } });
    }

    const sanitized = sanitizeMessages(messages);

    if (sanitized.length === 0) {
      return res.status(400).json({ error: { message: 'No valid messages provided' } });
    }

    const userContext = await buildUserContext(req.user.userId);
    const aiResponse = await chat(sanitized, userContext);

    res.json({ message: aiResponse });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: { message: 'Failed to process message' } });
  }
};

/**
 * Phase 3: Case-specific chat message handler
 */
export const sendCaseMessage = async (req, res) => {
  try {
    const { messages, grievanceId } = req.body;

    if (!grievanceId) {
      return res.status(400).json({ error: { message: 'grievanceId is required' } });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: { message: 'Messages array is required' } });
    }

    if (messages.length > 30) {
      return res.status(400).json({ error: { message: 'Too many messages. Please start a new conversation.' } });
    }

    const sanitized = sanitizeMessages(messages);

    if (sanitized.length === 0) {
      return res.status(400).json({ error: { message: 'No valid messages provided' } });
    }

    const userId = req.user.userId;
    const userRole = req.user.role;

    const caseContext = await buildCaseContext(grievanceId, userId, userRole);
    if (!caseContext) {
      return res.status(404).json({ error: { message: 'Case not found or access denied' } });
    }

    const userContext = await buildUserContext(userId);
    const aiResponse = await caseChat(sanitized, caseContext, userContext);

    res.json({ message: aiResponse });
  } catch (error) {
    console.error('Case chat error:', error);
    res.status(500).json({ error: { message: 'Failed to process case message' } });
  }
};

/**
 * Phase 3: Suggest relevant contract articles for a case
 */
export const suggestArticles = async (req, res) => {
  try {
    const { grievanceId } = req.params;

    if (!grievanceId) {
      return res.status(400).json({ error: { message: 'grievanceId is required' } });
    }

    const suggestion = await suggestArticle(
      grievanceId,
      req.user.userId,
      req.user.role
    );

    if (!suggestion) {
      return res.status(404).json({ error: { message: 'Case not found or access denied' } });
    }

    res.json({ suggestion });
  } catch (error) {
    console.error('Article suggestion error:', error);
    res.status(500).json({ error: { message: 'Failed to generate article suggestion' } });
  }
};

/**
 * Phase 3: Get proactive alerts for the user
 */
export const getAlerts = async (req, res) => {
  try {
    const alerts = await getProactiveAlerts(req.user.userId, req.user.role);
    res.json({ alerts });
  } catch (error) {
    console.error('Alerts error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch alerts' } });
  }
};

/**
 * Phase 2: Generate a grievance draft from conversation
 */
export const generateDraft = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: { message: 'Messages array is required' } });
    }

    if (messages.length > 30) {
      return res.status(400).json({ error: { message: 'Too many messages. Please start a new conversation.' } });
    }

    const sanitized = sanitizeMessages(messages);

    if (sanitized.length === 0) {
      return res.status(400).json({ error: { message: 'No valid messages provided' } });
    }

    // Need at least 2 user messages for a meaningful draft
    const userMessages = sanitized.filter(m => m.role === 'user');
    if (userMessages.length < 2) {
      return res.status(400).json({ error: { message: 'Please provide more details before generating a draft. At least 2 messages are needed.' } });
    }

    const userContext = await buildUserContext(req.user.userId);
    const draft = await generateGrievanceDraft(sanitized, userContext);

    res.json({ draft });
  } catch (error) {
    console.error('Draft generation error:', error);
    res.status(500).json({ error: { message: 'Failed to generate grievance draft' } });
  }
};
