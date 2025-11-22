
import { createClient } from '@supabase/supabase-js';
import { AnalysisData, MangaLog } from '../types';

// ==============================================================================
// 🛑 ZONA DE EDICIÓN: TUS CLAVES DE SUPABASE 🛑
// ==============================================================================

// 1. URL del Proyecto
const MY_SUPABASE_URL = "https://lfntdgrdphooyjhkplwg.supabase.co"; 

// 2. API Key (La clave 'anon public' que encontraste)
const MY_SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmbnRkZ3JkcGhvb3lqaGtwbHdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NzEwNDcsImV4cCI6MjA3OTM0NzA0N30.ySppiE_0UTaAR_6JO5RHXSeJlL790ucDZ9W-x2BuHus"; 

// ==============================================================================
// 🏁 FIN DE LA ZONA DE EDICIÓN
// ==============================================================================

const getSupabaseConfig = () => {
  const rawUrl = (MY_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const rawKey = (MY_SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || '').trim();
  
  // URL y Key por defecto (Modo Offline/Demo)
  let finalUrl = 'https://placeholder.supabase.co';
  let finalKey = 'placeholder-key';
  let isConfigured = false;

  // Validar URL para evitar Crash de "Invalid URL"
  try {
    if (rawUrl && rawUrl.startsWith('http')) {
      new URL(rawUrl); // Test de validez
      finalUrl = rawUrl;
      
      // Solo consideramos configurado si hay URL válida y una Key no vacía y válida (JWT)
      if (rawKey && rawKey.length > 20) {
        finalKey = rawKey;
        isConfigured = true;
      }
    }
  } catch (e) {
    console.warn("⚠️ La URL de Supabase no es válida. Usando modo offline.");
  }

  return { url: finalUrl, key: finalKey, isConfigured };
};

const config = getSupabaseConfig();

export const supabase = createClient(config.url, config.key);

// Helper para saber si Supabase está realmente configurado (Exportado para usar en la UI)
export const isSupabaseConfigured = () => {
    return config.isConfigured;
};

/**
 * Sube la imagen al bucket 'manga-uploads' de Supabase Storage
 */
export const uploadImageToSupabase = async (file: File): Promise<string | null> => {
  try {
    if (!isSupabaseConfigured()) {
        console.warn("⚠️ Supabase no está configurado. Edita services/supabaseClient.ts y pega tus claves.");
        return null;
    }

    // Crear un nombre único para el archivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    // Subir al bucket 'manga-uploads'
    const { error: uploadError } = await supabase.storage
      .from('manga-uploads')
      .upload(filePath, file);

    if (uploadError) {
      console.error("Supabase Upload Error (Revisa que el Bucket sea Public):", uploadError);
      return null;
    }

    // Obtener la URL pública
    const { data } = supabase.storage
      .from('manga-uploads')
      .getPublicUrl(filePath);

    return data.publicUrl;

  } catch (error) {
    console.error("Error uploading to Supabase:", error);
    return null;
  }
};

/**
 * Guarda el resultado del análisis en la tabla 'manga_logs'
 */
export const saveAnalysisToDb = async (analysis: AnalysisData, imageUrl: string): Promise<MangaLog | null> => {
  try {
    if (!isSupabaseConfigured()) {
        return null;
    }

    const payload: any = {
        image_url: imageUrl,
        title: analysis.title,
        format: analysis.format,
        demographic: analysis.demographic,
        genres: analysis.genres,
        description: analysis.description,
    };

    // Manejo de score opcional para evitar errores si es undefined
    if (analysis.score !== undefined) {
        payload.score = analysis.score;
    }

    const { data, error } = await supabase
      .from('manga_logs')
      .insert([payload])
      .select()
      .single();

    if (error) {
        console.error("Supabase DB Insert Error:", error);
        // Intento de recuperación si la columna 'score' no existiera en la tabla antigua
        if (error.message && error.message.includes("score")) {
             delete payload.score;
             const { data: retryData } = await supabase
                .from('manga_logs')
                .insert([payload])
                .select()
                .single();
             return retryData as MangaLog;
        }
        return null;
    }
    return data as MangaLog;

  } catch (error) {
    console.error("Error saving analysis to DB:", error);
    return null;
  }
};

/**
 * Obtiene los últimos análisis guardados.
 */
export const getRecentLogs = async (): Promise<MangaLog[]> => {
  try {
    if (!isSupabaseConfigured()) {
        return [];
    }

    // Trae solo los registros que tengan imagen válida
    const { data, error } = await supabase
      .from('manga_logs')
      .select('*')
      .not('image_url', 'is', null)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      throw error;
    }
    return data as MangaLog[];
  } catch (error) {
    console.error("Error fetching logs:", error);
    return [];
  }
};
