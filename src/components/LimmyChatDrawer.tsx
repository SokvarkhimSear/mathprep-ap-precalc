import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, MessageSquare, RotateCcw, ChevronRight, HelpCircle, Bot, Crown, Zap } from 'lucide-react';
import { FormattedMathText, LimmyMarkdownMath } from './MathRenderer';
import { useAuth } from '../context/AuthContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface LimmyChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeContext?: string | null;
  onClearContext?: () => void;
}

export const LimmyChatDrawer: React.FC<LimmyChatDrawerProps> = ({
  isOpen,
  onClose,
  activeContext,
  onClearContext,
}) => {
  const { isPremium, limmyAI_credits, deductLimmyCredit, openPremiumModal } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I'm **Limmy**, your Socratic AP Precalculus study mentor. 🦉\n\nI won't just dump the final answer on you—instead, I'll guide you step-by-step with progressive hints, intuitive analogies, and guiding questions so you truly master the mathematics for exam day.\n\nWhat concept or problem are you exploring right now?`,
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'How do I distinguish a hole from a vertical asymptote?',
    'Why is the period of $f(t) = \\cos(Bt)$ equal to $\\frac{2\\pi}{|B|}$?',
    'How do I eliminate parameter $t$ from $x = 3\\cos t, y = 5\\sin t$?',
    'How does semi-log linearization prove exponential growth?',
  ];

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    // Check credits for free tier
    if (!isPremium && limmyAI_credits <= 0) {
      openPremiumModal(
        'Out of Limmy AI Credits',
        'You have used all 5 free Limmy AI tutoring credits. Upgrade to Premium for unlimited 24/7 Socratic guidance across all 4 units!'
      );
      return;
    }

    const creditAllowed = await deductLimmyCredit();
    if (!creditAllowed && !isPremium) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation history for API
      const historyPayload = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await fetch('/api/limmy/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: text,
          context: activeContext || undefined,
          history: historyPayload,
        }),
      });

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        id: `limmy-${Date.now()}`,
        role: 'assistant',
        content: data.reply || "Let's break this down together. What is the first mathematical property we should examine?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Error contacting Limmy AI:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: "I'm having a slight difficulty connecting to my math engine right now. Let's try again in a moment, or try asking about the initial definition!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content: `Chat history cleared! Ready for your next AP Precalculus inquiry. What are we exploring?`,
        timestamp: 'Just now',
      },
    ]);
    if (onClearContext) onClearContext();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Sliding Drawer Container */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 border-l border-slate-200 animate-slide-left">
        {/* Drawer Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold text-slate-900 leading-none">Limmy AI</h3>
                <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/80 px-1.5 py-0.5 rounded">
                  Socratic Tutor
                </span>
                {isPremium ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                    <Crown className="w-3 h-3 text-amber-600" />
                    <span>Unlimited Premium</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      openPremiumModal(
                        'Unlimited Limmy AI Tutoring',
                        'Upgrade to Premium for unlimited 24/7 Socratic guidance, error diagnostics, and step-by-step mathematical derivations.'
                      )
                    }
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded-full cursor-pointer transition-colors"
                  >
                    <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>{limmyAI_credits} Free Credits • Upgrade</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Powered by DeepSeek · Progressive hints only
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClearChat}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Clear chat thread"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              aria-label="Close Limmy tutor drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Optional Active Lesson / Formula Context Banner */}
        {activeContext && (
          <div className="px-4 py-2 bg-blue-50/90 border-b border-blue-100 flex items-center justify-between text-xs text-blue-900">
            <div className="truncate flex items-center gap-1.5">
              <span className="font-semibold text-blue-700">Context:</span>
              <span className="truncate">{activeContext}</span>
            </div>
            {onClearContext && (
              <button
                onClick={onClearContext}
                className="text-[11px] font-semibold text-blue-600 hover:underline ml-2 shrink-0 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Message Thread Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`rounded-2xl px-4 py-3 max-w-[88%] text-sm leading-relaxed shadow-2xs ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-xs'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                }`}
              >
                {msg.role === 'user' ? (
                  <div className="limmy-user-message whitespace-pre-wrap">
                    <FormattedMathText text={msg.content} />
                  </div>
                ) : (
                  <LimmyMarkdownMath content={msg.content} />
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">
                {msg.timestamp}
              </span>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex flex-col items-start">
              <div className="bg-white border border-slate-200/80 rounded-2xl rounded-bl-xs px-4 py-3 text-xs text-slate-500 shadow-2xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <span>Limmy is crafting your Socratic hint...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompt Chips */}
        {messages.length <= 3 && !isLoading && (
          <div className="px-4 py-2.5 bg-slate-100/70 border-t border-slate-200/80 overflow-x-auto scrollbar-none flex gap-2">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                className="text-xs bg-white border border-slate-200/80 hover:border-blue-400 hover:text-blue-600 text-slate-700 px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-all cursor-pointer shadow-2xs"
              >
                <FormattedMathText text={prompt} />
              </button>
            ))}
          </div>
        )}

        {/* Out of Credits Alert Banner */}
        {!isPremium && limmyAI_credits <= 0 && (
          <div className="px-4 py-2.5 bg-gradient-to-r from-amber-50 to-indigo-50 border-t border-amber-200/90 flex items-center justify-between text-xs text-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600 fill-amber-500 shrink-0" />
              <span className="font-medium text-slate-900">You've reached your 5 free AI prompts.</span>
            </div>
            <button
              type="button"
              onClick={() =>
                openPremiumModal(
                  'Unlimited Limmy AI Tutoring',
                  'Upgrade to MathPrep Premium ($10) for unlimited 24/7 Socratic guidance across all 4 units!'
                )
              }
              className="font-bold text-indigo-700 hover:text-indigo-900 hover:underline cursor-pointer ml-2 shrink-0"
            >
              Upgrade →
            </button>
          </div>
        )}

        {/* Input Form */}
        <div className="p-3.5 border-t border-slate-200 bg-white shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Limmy to explain a concept or step..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`p-2.5 rounded-xl text-white transition-colors cursor-pointer shrink-0 ${
                input.trim() && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-xs'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
              aria-label="Send question to Limmy"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
            <span>Socratic guidance: hints & questions only</span>
            <span>Equations typeset via $\KaTeX$</span>
          </div>
        </div>
      </div>
    </div>
  );
};
