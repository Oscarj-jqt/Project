/**
 * Utilitaires pour identifier et comparer les épisodes ENSO
 * prend le type des observations pour un type de comparaison des épisodes
 */

import type { ONIObservation } from '../types';

const EL_NINO_THRESHOLD = 0.5;
const LA_NINA_THRESHOLD = -0.5;

export interface ENSOEpisode {
  id: string;
  debut: string;
  fin: string;
  phase: 'El Niño' | 'La Niña' | 'Neutre';
  intensite: 'faible' | 'modérée' | 'forte';
  observations: ONIObservation[];
  dureeMs: number;
  valeurMoyenne: number;
  valeurMax: number;
  valeurMin: number;
}

function classifyONI(value: number): 'El Niño' | 'La Niña' | 'Neutre' {
  if (value >= EL_NINO_THRESHOLD) return 'El Niño';
  if (value <= LA_NINA_THRESHOLD) return 'La Niña';
  return 'Neutre';
}

function calculateIntensity(avgAbs: number): 'faible' | 'modérée' | 'forte' {
  if (avgAbs >= 1.5) return 'forte';
  if (avgAbs >= 1.0) return 'modérée';
  return 'faible';
}

/**
 * Extrait les épisodes ENSO à partir des observations
 * Un épisode = ensemble continu d'observations de même phase
 */
export function extractEpisodes(observations: ONIObservation[]): ENSOEpisode[] {
  if (observations.length === 0) return [];

  const sorted = [...observations].sort((a, b) => a.date_centrale.localeCompare(b.date_centrale));
  const episodes: ENSOEpisode[] = [];
  let currentEpisode: Partial<ENSOEpisode> | null = null;

  for (const obs of sorted) {
    const phase = classifyONI(obs.valeur_oni);

    if (!currentEpisode || currentEpisode.phase !== phase) {
      // Finaliser l'épisode précédent
      if (currentEpisode && currentEpisode.observations) {
        const avgAbs = currentEpisode.observations.reduce((sum, o) => sum + Math.abs(o.valeur_oni), 0) / currentEpisode.observations.length;
        episodes.push({
          id: `${currentEpisode.phase}-${episodes.length}`,
          debut: currentEpisode.debut!,
          fin: currentEpisode.fin!,
          phase: currentEpisode.phase!,
          intensite: calculateIntensity(avgAbs),
          observations: currentEpisode.observations,
          dureeMs: new Date(currentEpisode.fin!).getTime() - new Date(currentEpisode.debut!).getTime(),
          valeurMoyenne: avgAbs,
          valeurMax: Math.max(...currentEpisode.observations.map((o) => o.valeur_oni)),
          valeurMin: Math.min(...currentEpisode.observations.map((o) => o.valeur_oni)),
        });
      }

      // Commencer un nouvel épisode
      currentEpisode = {
        debut: obs.date_centrale,
        fin: obs.date_centrale,
        phase,
        observations: [obs],
      };
    } else {
      // Continuer l'épisode actuel
      currentEpisode.fin = obs.date_centrale;
      currentEpisode.observations!.push(obs);
    }
  }

  // Finaliser le dernier épisode
  if (currentEpisode && currentEpisode.observations) {
    const avgAbs = currentEpisode.observations.reduce((sum, o) => sum + Math.abs(o.valeur_oni), 0) / currentEpisode.observations.length;
    episodes.push({
      id: `${currentEpisode.phase}-${episodes.length}`,
      debut: currentEpisode.debut!,
      fin: currentEpisode.fin!,
      phase: currentEpisode.phase!,
      intensite: calculateIntensity(avgAbs),
      observations: currentEpisode.observations,
      dureeMs: new Date(currentEpisode.fin!).getTime() - new Date(currentEpisode.debut!).getTime(),
      valeurMoyenne: avgAbs,
      valeurMax: Math.max(...currentEpisode.observations.map((o) => o.valeur_oni)),
      valeurMin: Math.min(...currentEpisode.observations.map((o) => o.valeur_oni)),
    });
  }

  return episodes.filter((ep) => ep.phase !== 'Neutre');
}

/**
 * Calcule la durée en mois
 */
export function getDurationMonths(episode: ENSOEpisode): number {
  return Math.round(episode.dureeMs / (1000 * 60 * 60 * 24 * 30.44));
}

/**
 * Compare deux épisodes
 */
export function compareEpisodes(ep1: ENSOEpisode, ep2: ENSOEpisode) {
  const duration1 = getDurationMonths(ep1);
  const duration2 = getDurationMonths(ep2);

  return {
    duration1,
    duration2,
    durationDiff: duration2 - duration1,
    intensity1: ep1.intensite,
    intensity2: ep2.intensite,
    avgONI1: ep1.valeurMoyenne.toFixed(2),
    avgONI2: ep2.valeurMoyenne.toFixed(2),
    avgONIDiff: (ep2.valeurMoyenne - ep1.valeurMoyenne).toFixed(2),
    maxONI1: ep1.valeurMax.toFixed(2),
    maxONI2: ep2.valeurMax.toFixed(2),
  };
}
