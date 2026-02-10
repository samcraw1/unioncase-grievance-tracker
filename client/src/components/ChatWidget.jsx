import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import api from '../services/api';

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: "Hi! I'm your grievance assistant. I can help with contract questions, explain grievance steps, or check your upcoming deadlines. What can I help with?"
};

const STORAGE_KEY = 'chatMessages';

const ChatWidget = () => {
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

  // Persist messages to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch { /* ignore quota errors */ }
  }, [messages]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when widget opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage = { role: 'user', content: text.slice(0, 2000) };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Only send user/assistant messages (no error messages)
      const toSend = updatedMessages.filter(m => m.role === 'user' || m.role === 'assistant');
      const response = await api.post('/chat/message', { messages: toSend });
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.message }]);
    } catch (error) {
      const errorMsg = error.response?.status === 429
        ? 'You\'ve sent too many messages. Please wait a few minutes.'
        : 'Sorry, I couldn\'t process that. Please try again.';
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([WELCOME_MESSAGE]);
  };

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
      <div className="bg-primary text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <span className="font-semibold text-sm">Case Assistant</span>
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

      {/* Messages */}
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

      {/* Disclaimer */}
      <div className="px-4 py-1 bg-gray-50 border-t border-gray-100 flex-shrink-0">
        <p className="text-[10px] text-gray-400 text-center">Informational only — not legal advice</p>
      </div>

      {/* Input */}
      <div className="px-3 py-2 bg-white border-t border-gray-200 flex gap-2 items-end flex-shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about contracts, deadlines, steps..."
          maxLength={2000}
          disabled={isLoading}
          className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-50 disabled:bg-gray-50"
        />
        <button
          onClick={sendMessage}
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

export default ChatWidget;
