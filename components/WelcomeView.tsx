import React from 'react';
import { View } from '../types';
import { MessageSquare, Eye, Zap, Code, Globe } from 'lucide-react';

interface WelcomeViewProps {
  onChangeView: (view: View) => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({ onChangeView }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 overflow-y-auto">
      <div className="max-w-3xl w-full space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 pb-2">
            Gemini Omni-Tool
          </h1>
          <p className="text-slate-400 text-lg md:text-xl">
            Привет! Я могу многое. Выберите режим, чтобы начать.
          </p>
          <p className="text-slate-500 text-sm">
            (Hello! I can do a lot. Select a mode to start.)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Chat Card */}
          <button
            onClick={() => onChangeView(View.CHAT)}
            className="group relative p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all duration-300 text-left"
          >
            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity" />
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                <MessageSquare size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-100">Чат и Текст</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Общайтесь на естественном языке, пишите код, переводите тексты и задавайте сложные вопросы.
            </p>
          </button>

          {/* Vision Card */}
          <button
            onClick={() => onChangeView(View.VISION)}
            className="group relative p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-purple-500/50 hover:bg-slate-800/50 transition-all duration-300 text-left"
          >
            <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity" />
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <Eye size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-100">Зрение (Vision)</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Загружайте изображения для анализа, распознавания объектов, текста и получения описаний.
            </p>
          </button>
        </div>

        {/* Capabilities Grid */}
        <div className="pt-8 border-t border-slate-800/50">
          <h4 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-6">
            Основные возможности (Core Capabilities)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-900/50 border border-slate-800/50">
              <Zap className="text-yellow-400 shrink-0" size={20} />
              <div>
                <span className="block font-medium text-slate-200 text-sm">Высокая скорость</span>
                <span className="text-xs text-slate-500">Gemini 2.5 Flash обеспечивает мгновенные ответы.</span>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-900/50 border border-slate-800/50">
              <Code className="text-emerald-400 shrink-0" size={20} />
              <div>
                <span className="block font-medium text-slate-200 text-sm">Кодинг</span>
                <span className="text-xs text-slate-500">Генерация и объяснение кода на TypeScript, Python и др.</span>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-900/50 border border-slate-800/50">
              <Globe className="text-sky-400 shrink-0" size={20} />
              <div>
                <span className="block font-medium text-slate-200 text-sm">Мультиязычность</span>
                <span className="text-xs text-slate-500">Свободное владение русским, английским и другими языками.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Credits */}
        <div className="pt-8 pb-2">
          <p className="text-slate-600 text-xs font-medium tracking-wide">
            Сделано <span className="text-indigo-400 hover:text-indigo-300 transition-colors cursor-default">The Angel Studio</span>
          </p>
        </div>
      </div>
    </div>
  );
};