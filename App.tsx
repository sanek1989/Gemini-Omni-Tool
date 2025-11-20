
import React, { useState, useEffect } from 'react';
import { View, Settings, ModelProvider } from './types';
import { WelcomeView } from './components/WelcomeView';
import { ChatView } from './components/ChatView';
import { VisionView } from './components/VisionView';
import { SettingsModal } from './components/SettingsModal';
import { MessageSquare, Eye, LayoutGrid, Settings as SettingsIcon } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.WELCOME);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Global settings state
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const storedSettings = localStorage.getItem('appSettings');
      if (storedSettings) {
        return JSON.parse(storedSettings);
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage", error);
    }
    return {
      provider: ModelProvider.GEMINI,
      ollamaUrl: 'http://localhost:11434',
      ollamaModel: 'llama3',
      geminiApiKey: '',
      geminiModel: 'gemini-2.5-flash'
    };
  });

  // Effect to save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('appSettings', JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings to localStorage", error);
    }
  }, [settings]);
  
  // Function to validate Gemini API key
  const validateGeminiApiKey = async (apiKey: string) => {
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Test' }] }],
        }),
      });

      if (response.status === 400 || response.status === 401) {
        return false; // Invalid key
      }
      return true; // Valid key
    } catch (error) {
      console.error('API Key Validation Error:', error);
      return false; // Network error or other issue
    }
  };

  const renderView = () => {
    switch (currentView) {
      case View.CHAT:
        return <ChatView settings={settings} />;
      case View.VISION:
        return <VisionView settings={settings} />;
      case View.WELCOME:
      default:
        return <WelcomeView onChangeView={setCurrentView} />;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className="w-20 lg:w-64 border-r border-slate-800 bg-slate-900/30 flex flex-col items-center lg:items-stretch py-6 transition-all z-20">
        <div className="mb-8 px-4 flex items-center justify-center lg:justify-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-colors ${
            settings.provider === ModelProvider.OLLAMA 
              ? 'bg-gradient-to-br from-orange-500 to-red-600 shadow-orange-500/20'
              : 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/20'
          }`}>
            <span className="font-bold text-white text-xl">
              {settings.provider === ModelProvider.OLLAMA ? 'O' : 'G'}
            </span>
          </div>
          <span className="hidden lg:block font-bold text-xl tracking-tight text-slate-100">
            {settings.provider === ModelProvider.OLLAMA ? 'Ollama' : 'Gemini'}
          </span>
        </div>

        <nav className="flex-1 w-full space-y-2 px-2 lg:px-4">
          <NavButton 
            active={currentView === View.WELCOME} 
            onClick={() => setCurrentView(View.WELCOME)}
            icon={<LayoutGrid size={22} />}
            label="Overview"
          />
          <NavButton 
            active={currentView === View.CHAT} 
            onClick={() => setCurrentView(View.CHAT)}
            icon={<MessageSquare size={22} />}
            label="Chat"
          />
          <NavButton 
            active={currentView === View.VISION} 
            onClick={() => setCurrentView(View.VISION)}
            icon={<Eye size={22} />}
            label="Vision"
          />
        </nav>

        <div className="mt-auto px-4 space-y-4">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all"
          >
            <SettingsIcon size={22} />
            <span className="hidden lg:block font-medium text-sm">Settings</span>
          </button>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 hidden lg:block">
            <h4 className="text-xs font-semibold text-slate-400 mb-2">CURRENT MODEL</h4>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${settings.provider === ModelProvider.OLLAMA ? 'bg-orange-500' : 'bg-green-500'}`}></div>
              <span className="text-sm font-medium truncate">
                {settings.provider === ModelProvider.OLLAMA ? settings.ollamaModel : settings.geminiModel}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col h-full overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950">
        {/* Top Mobile Bar */}
        <div className="lg:hidden h-14 border-b border-slate-800 flex items-center justify-between px-4 bg-slate-900/50 backdrop-blur-md z-10">
           <span className="font-bold">Omni-Tool</span>
           <button onClick={() => setIsSettingsOpen(true)} className="text-slate-400">
             <SettingsIcon size={20} />
           </button>
        </div>

        <div className="flex-1 overflow-hidden relative">
           {renderView()}
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={setSettings}
        validateApiKey={validateGeminiApiKey}
      />
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
        active 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
      }`}
    >
      <span className={`transition-colors ${active ? 'text-white' : 'group-hover:text-white'}`}>
        {icon}
      </span>
      <span className="hidden lg:block font-medium text-sm">{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white hidden lg:block" />}
    </button>
  );
};

export default App;
