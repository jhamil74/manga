
import React from 'react';
import { MangaLog } from '../types';
import { isSupabaseConfigured } from '../services/supabaseClient';

interface HistoryGridProps {
  logs: MangaLog[];
  onSelect: (log: MangaLog) => void;
}

const HistoryGrid: React.FC<HistoryGridProps> = ({ logs, onSelect }) => {
  
  const configured = isSupabaseConfigured();

  if (!configured) {
    return (
      <div className="w-full bg-zen-paper/50 border-y border-zen-accent/30 py-16 text-center backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-6">
           <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zen-accent/10 border border-zen-accent mb-6 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-zen-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
           </div>
           <h2 className="text-xl font-serif text-white mb-2 tracking-widest uppercase">Configuración Pendiente</h2>
           <p className="text-zinc-400 font-sans text-sm mb-6">
             Para activar el historial (Superbase), necesitas conectar tu proyecto.
           </p>
           <div className="bg-black/40 p-4 rounded border border-zinc-700 text-left font-mono text-xs text-zinc-300">
              <p className="mb-2 text-zen-accent">// Instrucciones:</p>
              <p className="mb-1">1. Ve al archivo <span className="text-white font-bold">services/supabaseClient.ts</span></p>
              <p>2. Pega tu <span className="text-yellow-500">Project URL</span> y <span className="text-yellow-500">API Key</span> en las variables marcadas.</p>
           </div>
        </div>
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="w-full text-center py-16 opacity-50 border-t border-zinc-800/50 bg-zinc-900/10">
        <div className="h-px w-20 bg-zinc-800 mx-auto mb-4"></div>
        <h3 className="text-zinc-500 font-serif tracking-widest text-sm">BASE DE DATOS CONECTADA Y VACÍA</h3>
        <p className="text-zinc-600 text-xs mt-2 font-sans">Sube tu primera imagen para verla aquí.</p>
      </div>
    );
  }

  return (
    <div className="w-full relative z-10 bg-gradient-to-b from-zinc-900/40 to-black border-t border-zinc-800/50 py-16 px-4 md:px-8 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        
        {/* Module Header */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 border-b border-zinc-800/60 pb-6">
          <div>
             <h2 className="text-3xl font-serif text-zinc-300 tracking-widest uppercase flex items-center gap-4">
               <span className="w-2 h-2 bg-zen-accent rounded-full animate-pulse shadow-[0_0_10px_#ef4444]"></span>
               Archivos
             </h2>
             <p className="text-xs text-zinc-500 mt-2 font-sans tracking-[0.2em] uppercase">
               Registro Histórico de Análisis
             </p>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <span className="text-5xl font-serif text-zinc-800 font-bold">{logs.length}</span>
            <span className="text-[10px] text-zinc-600 uppercase tracking-widest block -mt-2 mr-1">Items</span>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {logs.map((log) => (
            <div 
              key={log.id}
              onClick={() => onSelect(log)}
              className="group relative bg-zinc-900 border border-zinc-800 hover:border-zen-text/50 transition-all duration-500 hover:-translate-y-2 shadow-lg flex flex-col h-full overflow-hidden cursor-pointer"
            >
              {/* Image Container */}
              <div className="relative aspect-[3/2] overflow-hidden">
                <img 
                  src={log.image_url} 
                  alt={log.title}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                
                {/* Score Badge */}
                {log.score !== undefined && log.score !== null && (
                  <div className="absolute top-3 right-3 w-8 h-8 bg-black/80 backdrop-blur border border-zen-accent rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-xs font-bold text-zen-accent font-serif">{log.score}</span>
                  </div>
                )}
              </div>

              {/* Info Container */}
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-zinc-100 font-serif text-lg font-bold truncate tracking-wide mb-3 group-hover:text-white transition-colors">
                  {log.title}
                </h3>

                {/* Explicit Data: Format & Demographic */}
                <div className="grid grid-cols-2 gap-2 mb-4 border-b border-zinc-800 pb-3">
                    <div>
                        <span className="text-[9px] text-zinc-500 uppercase tracking-widest block mb-0.5">Format</span>
                        <span className="text-xs text-zinc-300 font-sans">{log.format}</span>
                    </div>
                    <div>
                        <span className="text-[9px] text-zinc-500 uppercase tracking-widest block mb-0.5">Demographic</span>
                        <span className="text-xs text-zinc-300 font-sans">{log.demographic}</span>
                    </div>
                </div>

                {/* Explicit Data: Genres */}
                <div className="mt-auto">
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest block mb-2">Detected Genres</span>
                    <div className="flex flex-wrap gap-1.5 h-14 overflow-hidden content-start">
                        {log.genres && log.genres.slice(0, 3).map((genre, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-zinc-800 text-[10px] text-zinc-400 border border-zinc-700/50 rounded-sm whitespace-nowrap">
                                {genre}
                            </span>
                        ))}
                        {log.genres && log.genres.length > 3 && (
                            <span className="px-2 py-0.5 text-[10px] text-zinc-600">+{log.genres.length - 3}</span>
                        )}
                    </div>
                </div>
              </div>

              {/* Hover decorative line */}
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-zen-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default HistoryGrid;
