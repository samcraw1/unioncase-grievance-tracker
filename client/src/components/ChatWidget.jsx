import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, X, Send, Bot, FileText, RefreshCw } from 'lucide-react';
import api from '../services/api';

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: "Hi! I'm your grievance assistant. I can help with contract questions, explain grievance steps, or check your upcoming deadlines. What can I help with?"
};

const DRAFT_WELCOME_MESSAGE = {
  role: 'assistant',
  content: "I'll help you draft a grievance. Describe the incident in detail — what happened, when, where, who was involved, and what contract violation occurred. After we discuss it, click \"Generate Draft\" to create a structured grievance form."
};

const CASE_WELCOME_MESSAGE = {
  role: 'assistant',
  content: "I'm analyzing this case. Ask me about the relevant contract articles, next steps, deadline strategy, or how similar cases have been handled. What would you like to know?"
};

const STORAGE_KEY = 'chatMessages';
const DRAFT_STORAGE_KEY = 'draftMessages';

const ChatWidget = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Detect if we're on a grievance detail page
  const grievanceMatch = location.pathname.match(/^\/grievances\/(\d+)$/);
  const grievanceId = grievanceMatch ? grievanceMatch[1] : null;
  const isOnCasePage = !!grievanceId;

  // Mode: 'chat' (general), 'draft' (draft writer), or 'case' (case-specific)
  // Case mode is automatic when on a grievance detail page
  const effectiveMode = isOnCasePage ? 'case' : null;

  const [isOpen, setIsOpen] = useState(false);
  const [globalMode, setGlobalMode] = useState('chat'); // 'chat' or 'draft'

  // Chat messages (general mode)
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [WELCOME_MESSAGE];
    } catch {
      return [WELCOME_MESSAGE];
    }
  });

  // Draft messages (separate state)
  const [draftMessages, setDraftMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [DRAFT_WELCOME_MESSAGE];
    } catch {
      return [DRAFT_WELCOME_MESSAGE];
    }
  });

  // Case messages (per-case, keyed by grievanceId)
  const [caseMessages, setCaseMessages] = useState(() => {
    if (!grievanceId) return [CASE_WELCOME_MESSAGE];
    try {
      const saved = sessionStorage.getItem(`caseMessages_${grievanceId}`);
      return saved ? JSON.parse(saved) : [CASE_WELCOME_MESSAGE];
    } catch {
      return [CASE_WELCOME_MESSAGE];
    }
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [draftData, setDraftData] = useState(null);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Determine active mode and messages
  const activeMode = effectiveMode || globalMode;
  const activeMessages = activeMode === 'case' ? caseMessages
    : activeMode === 'draft' ? draftMessages
    : messages;

  const setActiveMessages = activeMode === 'case' ? setCaseMessages
    : activeMode === 'draft' ? setDraftMessages
    : setMessages;

  // Reload case messages when grievanceId changes
  useEffect(() => {
    if (grievanceId) {
      try {
        const saved = sessionStorage.getItem(`caseMessages_${grievanceId}`);
        setCaseMessages(saved ? JSON.parse(saved) : [CASE_WELCOME_MESSAGE]);
      } catch {
        setCaseMessages([CASE_WELCOME_MESSAGE]);
      }
    }
  }, [grievanceId]);

  // Persist messages to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch { /* ignore quota errors */ }
  }, [messages]);

  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftMessages));
    } catch { /* ignore quota errors */ }
  }, [draftMessages]);

  useEffect(() => {
    if (grievanceId) {
      try {
        sessionStorage.setItem(`caseMessages_${grievanceId}`, JSON.stringify(caseMessages));
      } catch { /* ignore quota errors */ }
    }
  }, [caseMessages, grievanceId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages, isLoading, draftData]);

  // Focus input when widget opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Clear draft data when switching modes
  useEffect(() => {
    if (activeMode !== 'draft') {
      setDraftData(null);
    }
  }, [activeMode]);

  // Listen for "Ask AI" button from GrievanceDetailPage
  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('openChatWidget', handleOpenChat);
    return () => window.removeEventListener('openChatWidget', handleOpenChat);
  }, []);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage = { role: 'user', content: text.slice(0, 2000) };
    const updatedMessages = [...activeMessages, userMessage];
    setActiveMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const toSend = updatedMessages.filter(m => m.role === 'user' || m.role === 'assistant');

      let response;
      if (activeMode === 'case' && grievanceId) {
        response = await api.post('/chat/case-message', {
          messages: toSend,
          grievanceId,
        });
      } else {
        response = await api.post('/chat/message', { messages: toSend });
      }

      setActiveMessages(prev => [...prev, { role: 'assistant', content: response.data.message }]);
    } catch (error) {
      const errorMsg = error.response?.status === 429
        ? 'You\'ve sent too many messages. Please wait a few minutes.'
        : 'Sorry, I couldn\'t process that. Please try again.';
      setActiveMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, activeMessages, activeMode, grievanceId, setActiveMessages]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const clearChat = useCallback(() => {
    if (activeMode === 'case') {
      setCaseMessages([CASE_WELCOME_MESSAGE]);
    } else if (activeMode === 'draft') {
      setDraftMessages([DRAFT_WELCOME_MESSAGE]);
      setDraftData(null);
    } else {
      setMessages([WELCOME_MESSAGE]);
    }
  }, [activeMode]);

  const handleGenerateDraft = useCallback(async () => {
    if (isGeneratingDraft) return;

    const toSend = draftMessages.filter(m => m.role === 'user' || m.role === 'assistant');
    const userMsgCount = toSend.filter(m => m.role === 'user').length;

    if (userMsgCount < 2) {
      setDraftMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Please describe the incident in more detail first. I need at least 2 messages from you to generate a meaningful draft.',
      }]);
      return;
    }

    setIsGeneratingDraft(true);

    try {
      const response = await api.post('/chat/draft', { messages: toSend });
      setDraftData(response.data.draft);
    } catch (error) {
      const errorMsg = error.response?.status === 429
        ? 'Too many requests. Please wait a few minutes.'
        : 'Failed to generate draft. Please try again.';
      setDraftMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
    } finally {
      setIsGeneratingDraft(false);
    }
  }, [isGeneratingDraft, draftMessages]);

  const handleCreateCase = useCallback(() => {
    if (!draftData) return;

    navigate('/grievances/new', { state: { draft: draftData } });

    // Clean up draft state
    setDraftData(null);
    setDraftMessages([DRAFT_WELCOME_MESSAGE]);
    sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    setIsOpen(false);
  }, [draftData, navigate]);

  const handleRevise = useCallback(() => {
    setDraftData(null);
    setDraftMessages(prev => [...prev, {
      role: 'assistant',
      content: `I've cleared the draft. Here's what was generated:\n\n- Article: ${draftData?.contractArticle}\n- Violation: ${draftData?.violationType}\n- Description: ${draftData?.briefDescription}\n\nWhat changes would you like? Describe the corrections and I'll generate a revised draft.`,
    }]);
  }, [draftData]);

  // Count user messages in draft mode for the Generate Draft button
  const draftUserMsgCount = draftMessages.filter(m => m.role === 'user').length;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50 bg-primary hover:bg-primary-dark text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center transition-all hover:scale-105"
        aria-label="Open chat assistant"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50 flex flex-col w-[calc(100vw-2rem)] md:w-[380px] h-[60vh] max-h-[520px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-primary text-white px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <span className="font-semibold text-sm">
              {activeMode === 'case' ? 'Case Assistant' : activeMode === 'draft' ? 'Draft Writer' : 'Case Assistant'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearChat}
              className="text-white/70 hover:text-white text-xs px-2 py-1 rounded hover:bg-white/10 transition-colors"
              aria-label="Clear chat"
            >
              Clear
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mode toggle - only show in global mode (not on case pages) */}
        {!isOnCasePage && (
          <div className="flex mt-2 bg-white/10 rounded-lg p-0.5">
            <button
              onClick={() => setGlobalMode('chat')}
              className={`flex-1 text-xs py-1.5 px-3 rounded-md transition-colors font-medium ${
                globalMode === 'chat'
                  ? 'bg-white text-primary'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setGlobalMode('draft')}
              className={`flex-1 text-xs py-1.5 px-3 rounded-md transition-colors font-medium ${
                globalMode === 'draft'
                  ? 'bg-white text-primary'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Draft Grievance
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {activeMessages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`px-4 py-2.5 rounded-xl max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-br-sm'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {/* Draft Preview Card */}
        {activeMode === 'draft' && draftData && (
          <div className="bg-white border-2 border-primary/20 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5 text-primary" />
              <span className="font-semibold text-sm text-gray-900">Generated Draft</span>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500 text-xs">Article:</span>
                <p className="text-gray-900 font-medium">{draftData.contractArticle}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Violation:</span>
                <p className="text-gray-900 font-medium">{draftData.violationType}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Summary:</span>
                <p className="text-gray-900">{draftData.briefDescription}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Description:</span>
                <p className="text-gray-700 text-xs leading-relaxed line-clamp-4">{draftData.detailedDescription}</p>
              </div>
              {draftData.reasoning && (
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-gray-500 text-xs">AI Reasoning:</span>
                  <p className="text-gray-600 text-xs italic">{draftData.reasoning}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleCreateCase}
                className="flex-1 bg-primary text-white text-sm py-2 px-3 rounded-lg hover:bg-primary-dark transition-colors font-medium"
              >
                Create Case
              </button>
              <button
                onClick={handleRevise}
                className="flex items-center gap-1 text-sm py-2 px-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Revise
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Disclaimer */}
      <div className="px-4 py-1 bg-gray-50 border-t border-gray-100 flex-shrink-0">
        <p className="text-[10px] text-gray-400 text-center">Informational only — not legal advice</p>
      </div>

      {/* Input + Generate Draft button */}
      <div className="px-3 py-2 bg-white border-t border-gray-200 flex-shrink-0">
        {/* Generate Draft button - show in draft mode after 2+ user messages, when no draft is shown */}
        {activeMode === 'draft' && draftUserMsgCount >= 2 && !draftData && (
          <button
            onClick={handleGenerateDraft}
            disabled={isGeneratingDraft || isLoading}
            className="w-full mb-2 bg-green-600 text-white text-sm py-2 px-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
          >
            {isGeneratingDraft ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Generating Draft...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Generate Draft
              </>
            )}
          </button>
        )}

        <div className="flex gap-2 items-end">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              activeMode === 'case'
                ? 'Ask about this case...'
                : activeMode === 'draft'
                ? 'Describe the incident...'
                : 'Ask about contracts, deadlines, steps...'
            }
            maxLength={2000}
            disabled={isLoading || isGeneratingDraft}
            className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-50 disabled:bg-gray-50"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading || isGeneratingDraft}
            className="bg-primary text-white p-2 rounded-lg hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;
