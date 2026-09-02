import { useState, useEffect, useRef } from 'react';
import client from '../api/client';

// Icons
const ChatIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
);

const OPTIONS = [
  { id: 'arrivals', label: '🛍️ Browse New Arrivals' },
  { id: 'track', label: '📦 Track My Order' },
  { id: 'size', label: '📏 Size & Fit Help' },
  { id: 'support', label: '💬 Talk to Support' },
  { id: 'returns', label: '🔄 Returns & Exchange' },
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewMsg, setHasNewMsg] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Check business hours on load (e.g. 9 AM to 6 PM)
  useEffect(() => {
    const hours = new Date().getHours();
    setIsOffline(hours < 9 || hours >= 18);
  }, []);

  // Set initial welcome message
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        type: 'bot',
        text: '👋 Hi there! Welcome to Anwar Clothing.\nHow can we help you today?',
        time: new Date(),
      },
    ]);
  }, []);

  // Auto-scroll chat to the bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessageToAI = async (newHistory) => {
    setIsTyping(true);
    try {
      const payloadMessages = newHistory.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      const res = await client.post('/chat', { messages: payloadMessages });
      
      const replyText = res.data.reply;
      const botMsg = {
        id: `bot-${Date.now()}`,
        type: 'bot',
        text: replyText,
        time: new Date(),
        actionButton: replyText.toLowerCase().includes('whatsapp') || replyText.includes('+923294359224'),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const botMsg = {
        id: `bot-${Date.now()}`,
        type: 'bot',
        text: "I'm having trouble connecting right now. Please try again or contact us via WhatsApp at +923294359224.",
        time: new Date(),
        actionButton: true,
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleOptionClick = (option) => {
    const userMsg = { id: `user-${Date.now()}`, type: 'user', text: option.label, time: new Date() };
    
    if (isOffline) {
      const botMsg = {
        id: `bot-${Date.now()}`,
        type: 'bot',
        text: "Thanks for reaching out! We're currently offline but will reply within 4 hours. You can also browse our latest collection here: /collections/fabrics 🛒",
        time: new Date(),
        actionButton: true,
      };
      setMessages((prev) => [...prev, userMsg, botMsg]);
      return;
    }

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    sendMessageToAI(newHistory);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = { id: `user-${Date.now()}`, type: 'user', text: inputValue, time: new Date() };
    
    if (isOffline) {
      const botMsg = {
        id: `bot-${Date.now()}`,
        type: 'bot',
        text: "Thanks for reaching out! We're currently offline but will reply within 4 hours. You can also browse our latest collection here: /collections/fabrics 🛒",
        time: new Date(),
        actionButton: true,
      };
      setMessages((prev) => [...prev, userMsg, botMsg]);
      setInputValue('');
      return;
    }

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputValue('');
    sendMessageToAI(newHistory);
  };

  return (
    <div className="fixed bottom-20 left-4 z-50 font-body md:bottom-6 md:right-6 md:left-auto">
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setHasNewMsg(false);
          }}
          className="relative w-[52px] h-[52px] bg-charcoal hover:bg-brass hover:shadow-brass text-ivory flex items-center justify-center rounded-full transition-all duration-300 ease-luxury shadow-luxury active:scale-95"
          aria-label="Open support chat"
        >
          <ChatIcon />
          {hasNewMsg && (
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-brass border-2 border-charcoal rounded-full animate-bounce" />
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[350px] sm:w-[380px] h-[500px] bg-ivory/95 backdrop-blur-md border border-stone/80 rounded-xl shadow-luxury-xl flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="bg-charcoal text-ivory px-5 py-4 flex items-center justify-between border-b border-stone/30">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-brass animate-pulse" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-brass font-semibold">Anwar Clothing Support</p>
                <p className="text-[10px] text-ivory/60 mt-0.5">
                  {isOffline ? 'Offline · Reply within 4h' : 'Online · Quick replies ready'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-ivory/60 hover:text-ivory p-1"
              aria-label="Close chat"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-cream/40">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line leading-relaxed ${
                    msg.type === 'user'
                      ? 'bg-brass text-ivory rounded-br-none'
                      : 'bg-white text-charcoal border border-stone/40 shadow-sm rounded-bl-none'
                  }`}
                >
                  {msg.text}
                  {msg.actionButton && (
                    <div className="mt-3">
                      <a
                        href="https://wa.me/923294359224"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-charcoal text-ivory hover:bg-brass transition-colors text-xs px-3 py-1.5 uppercase tracking-wider font-semibold"
                      >
                        <WhatsAppIcon />
                        WhatsApp Support
                      </a>
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-muted mt-1 px-1">
                  {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {isTyping && (
              <div className="flex flex-col items-start animate-pulse">
                <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm bg-white text-charcoal border border-stone/40 shadow-sm rounded-bl-none">
                  <span className="flex gap-1.5 items-center py-1">
                    <span className="w-1.5 h-1.5 bg-stone-dark rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-stone-dark rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-stone-dark rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies Options */}
          <div className="px-4 py-2 bg-white/70 border-t border-stone/30 flex flex-wrap gap-1.5 justify-center max-h-32 overflow-y-auto">
            {OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleOptionClick(opt)}
                className="text-[11px] bg-cream border border-stone/50 hover:border-brass hover:text-brass text-charcoal px-3 py-1.5 rounded-full transition-all duration-200"
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-stone/30 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 border border-stone/50 bg-cream/30 px-3.5 py-2 text-sm text-charcoal placeholder:text-muted rounded-full outline-none focus:border-brass transition-colors"
            />
            <button
              type="submit"
              className="w-9 h-9 bg-charcoal text-ivory hover:bg-brass rounded-full flex items-center justify-center transition-colors shrink-0"
              aria-label="Send message"
            >
              <SendIcon />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
