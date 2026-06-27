import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: "Hi! I'm the UnionCase assistant. Ask me anything about pricing, features, who it's for, or how to get started."
};

const SUGGESTED_QUESTIONS = [
  'What does UnionCase do?',
  'How much does it cost?',
  'Is my data private?'
];

const STORAGE_KEY = 'landingChatMessages';

const LandingChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [WELCOME_MESSAGE];
    } catch {
      return [WELCOME_MESSAGE];
    }
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch { /* ignore quota errors */ }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessageWithText = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMessage = { role: 'user', content: trimmed.slice(0, 2000) };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const toSend = updatedMessages.filter(m => m.role === 'user' || m.role === 'assistant');
      // Use raw fetch (not the shared api axios instance) so the auth interceptor
      // can't kick anonymous visitors to /login on a stray 401.
      const res = await fetch(`${API_URL}/chat/public-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: toSend }),
      });

      if (res.status === 429) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "You've sent too many messages. Please wait a few minutes."
        }]);
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch (error) {
      console.error('Landing chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I couldn't process that. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => sendMessageWithText(input);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([WELCOME_MESSAGE]);
  };

  const showSuggestions = messages.length === 1 && !isLoading;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-4 md:right-6 z-50 bg-primary hover:bg-primary-dark text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center transition-all hover:scale-105"
        aria-label="Open chat assistant"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-4 md:right-6 z-50 flex flex-col w-[calc(100vw-2rem)] md:w-[380px] h-[60vh] max-h-[520px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
      <div className="bg-primary text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <span className="font-semibold text-sm">UnionCase Assistant</span>
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

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((msg, i) => (
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

        <div ref={messagesEndRef} />
      </div>

      {showSuggestions && (
        <div className="px-3 py-2 bg-white border-t border-gray-100 flex flex-wrap gap-1.5 flex-shrink-0">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => sendMessageWithText(q)}
              className="text-xs px-3 py-1.5 rounded-full bg-primary/5 text-primary border border-primary/20 hover:bg-primary/10 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <div className="px-4 py-1 bg-gray-50 border-t border-gray-100 flex-shrink-0">
        <p className="text-[10px] text-gray-400 text-center">Informational only — not legal advice</p>
      </div>

      <div className="px-3 py-2 bg-white border-t border-gray-200 flex gap-2 items-end flex-shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about UnionCase..."
          maxLength={2000}
          disabled={isLoading}
          className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-50 disabled:bg-gray-50"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="bg-primary text-white p-2 rounded-lg hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default LandingChatWidget;
