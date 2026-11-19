/**
 * Types TypeScript pour ENSO Monitor
 * Source: https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso/oni/
 */

/** Observation ONI de la NOAA */
export interface ONIObservation {
  date_centrale: string;  // Format YYYY-MM-DD
  periode: string;        // Format "YYYY-MM" (ex: "2024-10")
  valeur_oni: number;     // Anomalie de température (-2.0 à +2.5)
}

/** Options de filtrage pour les observations */
export interface FilterOptions {
  debut?: string;  // YYYY-MM-DD
  fin?: string;    // YYYY-MM-DD
}

/** Réponse API de santé */
export interface HealthResponse {
  status: 'ok' | 'error';
}

/** Phase ENSO classifiée */
export type ENSOPhase = 'El Niño' | 'La Niña' | 'Neutre';

/** Épisode ENSO avec métadonnées */
export interface ENSOEpisode {
  debut: string;
  fin: string;
  phase: ENSOPhase;
  intensite?: 'faible' | 'modérée' | 'forte';
  observations: ONIObservation[];
}
