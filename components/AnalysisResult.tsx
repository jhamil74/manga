import React from 'react';
import { SparklesIcon, RefreshIcon } from './Icons';
import { AnalysisData } from '../types';

interface AnalysisResultProps {
  imageUrl: string;
  data: AnalysisData | null;
  isLoading: boolean;
  onReset: () => void;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ imageUrl, data, isLoading, onReset }) => {
  
  // Función para determinar el color de la nota
  const getScoreColor = (score?: number) => {
    if (score === undefined || score === null) return 'text-zinc-500 border-zinc-500';
    if (score >= 9) return 'text-zen-accent border-zen-accent'; // Rojo Obra Maestra
    if (score >= 7) return 'text-emerald-500 border-emerald-500'; // Verde Bueno
    return 'text-yellow-600 border-yellow-600'; // Amarillo Regular
  };

  const getRecommendationText = (score?: number) => {
    if (score === undefined || score === null) return "Análisis completado. Evaluación numérica no disponible.";
    if (score >= 9) return "Una obra maestra visual. Altamente recomendada para coleccionistas y fans.";
    if (score >= 7) return "Una obra sólida con buena técnica. Vale la pena leerla.";
    return "Interesante, aunque con aspectos técnicos mejorables.";
  };

  return (
    <div className="w-full max-w-6xl mx-auto glass-panel rounded-sm overflow-hidden shadow-2xl animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
        
        {/* Image Section */}
        <div className="relative bg-black/80 flex items-center justify-center p-8 lg:border-r border-zinc-800 min-h-[500px] overflow-hidden">
          <div className="relative max-w-full shadow-[0_20px_50px_rgba(0,0,0,0.7)] z-10">
            <img 
              src={imageUrl} 
              alt="Analysis Target" 
              className={`max-h-[600px] w-auto object-contain rounded-sm border-4 border-white/5 ${isLoading ? 'opacity-40 blur-[2px] transition-all duration-1000' : ''}`}
            />
          </div>

          {/* Loading Animation - WATER DROP & RIPPLES */}
          {isLoading && (
            <div className="absolute inset-0 z-30 flex items-center justify-center">
                
                {/* Center Container for Animations */}
                <div className="relative w-40 h-40 flex items-center justify-center">
                    
                    {/* The Drop (Falls from top) */}
                    <div className="absolute w-2 h-2 bg-white rounded-full animate-water-drop shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
                    
                    {/* The Ripples (Expand when drop hits) */}
                    <div className="absolute w-full h-full border border-white/30 rounded-full animate-water-ripple" style={{ animationDelay: '0s' }}></div>
                    <div className="absolute w-full h-full border border-white/20 rounded-full animate-water-ripple" style={{ animationDelay: '0.4s' }}></div>
                    <div className="absolute w-full h-full border border-white/10 rounded-full animate-water-ripple" style={{ animationDelay: '0.8s' }}></div>

                </div>

                {/* Text Overlay below the ripples */}
                <div className="absolute mt-32 text-center z-40">
                  <div className="text-zen-text font-serif tracking-[0.3em] text-lg font-bold animate-pulse">
                    ANALYZING
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-2 font-mono">AI VISION ACTIVE</div>
                </div>

                {/* Dark Overlay to make the water effect pop */}
                <div className="absolute inset-0 w-full h-full bg-black/30 pointer-events-none"></div>
            </div>
          )}
        </div>

        {/* Data Output Section */}
        <div className="p-8 flex flex-col bg-zen-paper/80 relative">
          
          {/* Header decorative line */}
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent"></div>

          <div className="flex items-center justify-between mb-8 mt-2">
            <h2 className="text-xl font-serif text-zinc-400 tracking-[0.2em] uppercase">
              Analysis Report
            </h2>
            {isLoading && (
               <span className="font-sans text-xs text-zinc-500 animate-pulse">Connecting to Archives...</span>
            )}
          </div>

          <div className="flex-grow overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
            {isLoading ? (
              <div className="space-y-6 px-4">
                  <div className="h-px w-full bg-zinc-800"></div>
                  <div className="space-y-3 opacity-50">
                      <p className="font-serif text-zinc-600 italic">Reading visual structure...</p>
                      <div className="h-2 bg-zinc-800 rounded w-3/4"></div>
                      <div className="h-2 bg-zinc-800 rounded w-1/2"></div>
                      <div className="h-2 bg-zinc-800 rounded w-5/6"></div>
                  </div>
              </div>
            ) : data ? (
              <div className="space-y-6">
                
                {/* HEADER: Title */}
                <div className="relative">
                    <h1 className="text-4xl md:text-5xl text-white font-serif leading-tight mb-4">
                        {data.title}
                    </h1>
                    <div className="w-12 h-1 bg-zen-accent mb-6"></div>
                </div>

                {/* SCORE / RATING SECTION (Stamp Style) */}
                <div className="flex items-start gap-6 pb-6 border-b border-zinc-800/50">
                    <div className={`flex flex-col items-center justify-center w-20 h-20 border-2 rounded-full rotate-[-6deg] shadow-lg bg-zinc-900/50 backdrop-blur ${getScoreColor(data.score)}`}>
                        <span className="text-2xl font-serif font-bold">{data.score ?? "-"}</span>
                        <span className="text-[8px] uppercase tracking-widest">Score</span>
                    </div>
                    <div className="flex-1 pt-1">
                        <h3 className="text-[10px] font-serif text-zinc-500 uppercase tracking-widest mb-1">Recommendation</h3>
                        <p className="text-sm text-zinc-400 italic leading-relaxed">
                            {getRecommendationText(data.score)}
                        </p>
                    </div>
                </div>
                
                {/* INFO GRID: Format & Demographic */}
                <div className="grid grid-cols-2 gap-4 py-2">
                    <div className="bg-zinc-900/30 p-4 border-l border-zinc-700">
                        <h4 className="text-[10px] text-zinc-500 font-serif uppercase tracking-widest mb-1">Format</h4>
                        <p className="text-zinc-200 font-sans text-lg">{data.format}</p>
                    </div>
                    <div className="bg-zinc-900/30 p-4 border-l border-zinc-700">
                        <h4 className="text-[10px] text-zinc-500 font-serif uppercase tracking-widest mb-1">Demographic</h4>
                        <p className="text-zinc-200 font-sans text-lg">{data.demographic}</p>
                    </div>
                </div>

                {/* GENRES */}
                <div>
                    <h4 className="text-[10px] text-zinc-500 font-serif uppercase tracking-widest mb-3">Detected Genres</h4>
                    <div className="flex flex-wrap gap-2">
                        {data.genres.map((genre, idx) => (
                            <span key={idx} className="px-3 py-1 bg-zinc-800/50 text-zinc-400 font-sans text-xs tracking-wider uppercase border border-zinc-700 hover:bg-zinc-700 transition-colors">
                                {genre}
                            </span>
                        ))}
                    </div>
                </div>

                {/* DESCRIPTION */}
                <div className="pt-4">
                  <h4 className="text-[10px] text-zinc-500 font-serif uppercase tracking-widest mb-3">Analysis</h4>
                  <p className="font-sans text-zinc-300 leading-loose text-sm text-justify border-l-2 border-zen-accent pl-4">
                    {data.description}
                  </p>
                </div>

              </div>
            ) : null}
          </div>

          {!isLoading && (
            <div className="mt-10 pt-6 border-t border-zinc-800">
              <button 
                onClick={onReset}
                className="w-full py-4 px-6 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-serif tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-3 border border-zinc-600 hover:border-zen-accent group"
              >
                <RefreshIcon className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
                Analyze Another
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;