
import React, { useState, useEffect, useMemo } from 'react';
import ImageUploader from './components/ImageUploader';
import AnalysisResult from './components/AnalysisResult';
import HistoryGrid from './components/HistoryGrid';
import Modal from './components/Modal';
import { analyzeImageWithGemini } from './services/geminiService';
import { uploadImageToSupabase, saveAnalysisToDb, getRecentLogs, isSupabaseConfigured } from './services/supabaseClient';
import { ImageAnalysisState, MangaLog } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<ImageAnalysisState>({
    imageUrl: null,
    data: null,
    isLoading: false,
    error: null,
  });

  const [history, setHistory] = useState<MangaLog[]>([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<MangaLog | null>(null);
  const [savingStatus, setSavingStatus] = useState<string>("");
  const [dbConnected, setDbConnected] = useState<boolean>(false);

  // Load history on mount
  useEffect(() => {
    const connected = isSupabaseConfigured();
    setDbConnected(connected);
    if (connected) {
      loadHistory();
    }
  }, []);

  const loadHistory = async () => {
    const logs = await getRecentLogs();
    setHistory(logs);
  };

  const handleImageSelected = async (file: File) => {
    const previewUrl = URL.createObjectURL(file);

    setState({
      imageUrl: previewUrl,
      data: null,
      isLoading: true,
      error: null,
    });
    setSavingStatus("");

    try {
      // 1. Analyze with Gemini
      const data = await analyzeImageWithGemini(file);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        data: data,
      }));

      // 2. Upload & Save to Supabase
      if (isSupabaseConfigured()) {
        setSavingStatus("Subiendo imagen a la nube...");
        const publicUrl = await uploadImageToSupabase(file);
        
        if (publicUrl) {
          setSavingStatus("Guardando ficha en base de datos...");
          const newLog = await saveAnalysisToDb(data, publicUrl);
          
          if (newLog) {
            setHistory(prev => [newLog, ...prev]); 
          }
          
          setSavingStatus("✅ Guardado en Historial.");
        } else {
          setSavingStatus("⚠️ Error subiendo imagen (Revisa el SQL de Storage).");
        }
      } else {
        setSavingStatus("ℹ️ Solo análisis local (DB no conectada).");
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown Error';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      setSavingStatus("Error.");
    }
  };

  const handleReset = () => {
    if (state.imageUrl) {
      URL.revokeObjectURL(state.imageUrl);
    }
    setState({
      imageUrl: null,
      data: null,
      isLoading: false,
      error: null,
    });
    setSavingStatus("");
  };

  const openHistoryItem = (log: MangaLog) => {
    setSelectedHistoryItem(log);
  };

  const closeHistoryItem = () => {
    setSelectedHistoryItem(null);
  };

  // Fix: Memoize rain drops so they don't reset on every render/state change
  const rainDrops = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`, // More variance
      animationDuration: `${0.5 + Math.random() * 0.5}s`
    }));
  }, []);

  return (
    <div className="min-h-screen relative pb-20">
      
      {/* Rain Background Animation */}
      <div className="rain-container">
        {rainDrops.map((style, i) => (
          <div 
            key={i} 
            className="rain-drop animate-rain-drop" 
            style={{ 
              left: style.left, 
              animationDelay: style.animationDelay,
              animationDuration: style.animationDuration
            }} 
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 z-10">
        
        {/* Header */}
        <header className="text-center mb-16 relative">
          {/* DB Status Indicator */}
          <div className="absolute top-0 right-0 flex items-center gap-2 bg-zinc-900/50 px-3 py-1 rounded-full border border-zinc-800">
             <div className={`w-2 h-2 rounded-full ${dbConnected ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-zinc-600'}`}></div>
             <span className="text-[10px] font-sans uppercase tracking-wider text-zinc-400">
                {dbConnected ? 'Database Online' : 'Local Mode'}
             </span>
          </div>

          <div className="inline-block mb-4">
             <div className="h-12 w-1 bg-zen-accent mx-auto"></div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white tracking-widest uppercase mb-4">
            Manga<span className="text-zen-rain">Kantei</span>
          </h1>
          
          <p className="max-w-xl mx-auto text-sm font-sans text-zinc-500 tracking-widest uppercase">
            Análisis de Manga y Anime con IA
          </p>
          
          {savingStatus && (
             <div className="mt-4 text-xs font-mono text-zen-accent opacity-80 animate-pulse">
                [{savingStatus}]
             </div>
          )}
        </header>

        {/* SECTION 1: ANALYZER */}
        <main className="flex flex-col items-center justify-center w-full mb-24 min-h-[400px]">
          {state.error && (
            <div className="w-full max-w-xl mb-8 p-6 bg-zinc-900 border-l-2 border-red-800 text-zinc-400 font-serif text-sm tracking-wide shadow-xl">
                <span className="text-red-500 font-bold block mb-2">ERROR DEL SISTEMA</span>
                {state.error}
                <button onClick={handleReset} className="mt-4 text-xs underline hover:text-white">
                  Intentar de nuevo
                </button>
            </div>
          )}

          {!state.imageUrl ? (
            <ImageUploader onImageSelected={handleImageSelected} />
          ) : (
            <AnalysisResult 
              imageUrl={state.imageUrl}
              data={state.data}
              isLoading={state.isLoading}
              onReset={handleReset}
            />
          )}
        </main>

        {/* DIVIDER */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent mb-16 opacity-50"></div>

        {/* SECTION 2: DATABASE MODULE */}
        <div id="database-module">
           <HistoryGrid logs={history} onSelect={openHistoryItem} />
        </div>

        {/* Modal for History Item */}
        <Modal isOpen={!!selectedHistoryItem} onClose={closeHistoryItem}>
          {selectedHistoryItem && (
            <AnalysisResult 
              imageUrl={selectedHistoryItem.image_url}
              data={{
                valid: true,
                title: selectedHistoryItem.title,
                format: selectedHistoryItem.format,
                demographic: selectedHistoryItem.demographic,
                genres: selectedHistoryItem.genres,
                description: selectedHistoryItem.description,
                score: selectedHistoryItem.score || undefined
              }}
              isLoading={false}
              onReset={closeHistoryItem}
            />
          )}
        </Modal>

        {/* Footer */}
        <footer className="mt-20 border-t border-zinc-900 pt-8 text-center opacity-60">
          <p className="text-[10px] font-sans text-zinc-700 uppercase tracking-[0.3em]">
            Manga Kantei • Powered by Gemini
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
