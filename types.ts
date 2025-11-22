
export interface AnalysisData {
  valid: boolean;
  title: string;       // Nombre de la obra detectado o generado
  format: string;      // Manga, Manhwa, Manhua, Anime Art
  demographic: string; // Shonen, Shojo, Seinen, Josei, Kodomomuke
  genres: string[];    // Action, Romance, Isekai, etc.
  description: string; // The full text description
  score?: number;      // Calificación del 1 al 10 (Opcional para compatibilidad)
  error_message?: string;
}

export interface MangaLog {
  id: number;
  created_at: string;
  image_url: string;
  title: string;
  format: string;
  demographic: string;
  genres: string[];
  description: string;
  score?: number;      // Opcional si el registro es antiguo
}

export interface ImageAnalysisState {
  imageUrl: string | null;
  data: AnalysisData | null;
  isLoading: boolean;
  error: string | null;
}

export interface FileData {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}
