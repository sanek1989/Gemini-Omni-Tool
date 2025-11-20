
import React, { useState, useRef, useEffect } from 'react';
import { ChatState, Message, Settings, ModelProvider } from '../types';
import { generateChatResponse } from '../services/router';
import { Send, Loader2, User, Bot, AlertCircle, Cpu } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatViewProps {
  settings: Settings;
}

export const ChatView: React.FC<ChatViewProps> = ({ settings }) => {
  const [input, setInput] = useState('');
  const [state, setState] = useState<ChatState>({
    messages: [
      {
        id: 'init',
        role: 'model',
        text: 'Привет! Я готов ответить на ваши вопросы. (Hi! Ready to answer your questions.)',
        timestamp: Date.now()
      }
    ],
    isLoading: false,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.messages]);

  const handleSend = async () => {
    if (!input.trim() || state.isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMsg],
      isLoading: true
    }));
    setInput('');

    try {
      const responseText = await generateChatResponse(userMsg.text, state.messages, settings);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, botMsg],
        isLoading: false
      }));
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now(),
        isError: true
      };
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMsg],
        isLoading: false
      }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full bg-slate-950 rounded-lg shadow-2xl overflow-hidden border border-slate-800/50">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${settings.provider === ModelProvider.OLLAMA ? 'bg-orange-500' : 'bg-green-500'}`} />
          {settings.provider === ModelProvider.OLLAMA ? `Local: ${settings.ollamaModel}` : settings.geminiModel}
        </h2>
        <span className={`text-xs uppercase tracking-wider border px-2 py-1 rounded flex items-center gap-1 ${
          settings.provider === ModelProvider.OLLAMA ? 'border-orange-500/50 text-orange-400' : 'border-slate-700 text-slate-500'
        }`}>
          {settings.provider === ModelProvider.OLLAMA && <Cpu size={12} />}
          {settings.provider} Mode
        </span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {state.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white' 
                : settings.provider === ModelProvider.OLLAMA ? 'bg-orange-900/50 text-orange-200 border border-orange-700/50' : 'bg-slate-700 text-slate-300'
            }`}>
              {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
            </div>
            
            <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${
                msg.isError 
                  ? 'bg-red-500/10 border border-red-500/50 text-red-200' 
                  : msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-sm' 
                    : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm'
              }`}>
                {msg.isError && <AlertCircle size={16} className="inline mr-2 mb-1" />}
                {msg.role === 'model' ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                )}
              </div>
              <span className="text-[10px] text-slate-600 mt-1 px-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        {state.isLoading && (
          <div className="flex gap-4">
             <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
               settings.provider === ModelProvider.OLLAMA ? 'bg-orange-900/50 text-orange-200' : 'bg-slate-700 text-slate-300'
             }`}>
              <Bot size={18} />
            </div>
            <div className="bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-sm border border-slate-700 flex items-center gap-2">
              <Loader2 className={`animate-spin ${settings.provider === ModelProvider.OLLAMA ? 'text-orange-400' : 'text-indigo-400'}`} size={16} />
              <span className="text-sm text-slate-400">
                {settings.provider === ModelProvider.OLLAMA ? 'Ollama computing...' : 'Gemini thinks...'}
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="relative flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Спроси меня о чем угодно..."
            className="w-full bg-slate-950 text-slate-200 border border-slate-700 rounded-xl px-4 py-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-600 text-sm min-h-[52px] max-h-32"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || state.isLoading}
            className="absolute right-2 bottom-2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
        <div className="text-center mt-2">
           <span className="text-[10px] text-slate-600">AI may produce inaccurate information.</span>
        </div>
      </div>
    </div>
  );
};
