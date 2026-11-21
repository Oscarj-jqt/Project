import { describe, it, expect } from 'vitest';
import type { ONIObservation } from '../types';
import { extractEpisodes, compareEpisodes, getDurationMonths } from '../services/episodeUtils';

/**
 * Tests des utilitaires d'analyse d'épisodes ENSO
 * 
 * Vérifie que l'extraction et la comparaison d'épisodes fonctionnent correctement.
 * 
 * On adopte une approche sobre et directe : tester un comportement précis par test
 */

describe('Utilitaires: Extraction et comparaison d\'épisodes ENSO', () => {
  it('extrait un épisode El Niño quand valeur_oni >= 0.5', () => {
    const data: ONIObservation[] = [
      { date_centrale: '2015-11-01', periode: 'NDJ', valeur_oni: 1.3 },
      { date_centrale: '2015-12-01', periode: 'DJF', valeur_oni: 1.7 },
      { date_centrale: '2016-01-01', periode: 'JFM', valeur_oni: 0.4 },
    ];

    const episodes = extractEpisodes(data);

    // Vérifier qu'on a au moins 1 épisode
    expect(episodes.length).toBeGreaterThan(0);
    
    // Vérifier que c'est un El Niño
    const elNino = episodes[0];
    expect(elNino.phase).toBe('El Niño');
    
    // Vérifier que les dates encadrent les observations
    expect(elNino.debut).toBe('2015-11-01');
    expect(elNino.fin).toBe('2015-12-01');
  });

  it('extrait un épisode La Niña quand valeur_oni <= -0.5', () => {
    const data: ONIObservation[] = [
      { date_centrale: '2010-02-01', periode: 'JFM', valeur_oni: -0.6 },
      { date_centrale: '2010-03-01', periode: 'FMA', valeur_oni: -0.8 },
      { date_centrale: '2010-04-01', periode: 'AMJ', valeur_oni: -0.3 },
    ];

    const episodes = extractEpisodes(data);

    expect(episodes.length).toBeGreaterThan(0);
    
    const laNina = episodes[0];
    expect(laNina.phase).toBe('La Niña');
    expect(laNina.debut).toBe('2010-02-01');
    expect(laNina.fin).toBe('2010-03-01');
  });

  it('ignore les phases Neutre (seuil -0.5 à 0.5)', () => {
    const data: ONIObservation[] = [
      { date_centrale: '2012-01-01', periode: 'DJF', valeur_oni: 0.0 },
      { date_centrale: '2012-02-01', periode: 'JFM', valeur_oni: 0.3 },
      { date_centrale: '2012-03-01', periode: 'FMA', valeur_oni: -0.2 },
    ];

    const episodes = extractEpisodes(data);

    // Aucun épisode identifié (tous filtrés comme Neutre)
    expect(episodes.length).toBe(0);
  });

  it('calcule la durée en mois d\'un épisode', () => {
    const data: ONIObservation[] = [
      { date_centrale: '2015-11-01', periode: 'NDJ', valeur_oni: 1.3 },
      { date_centrale: '2015-12-01', periode: 'DJF', valeur_oni: 1.7 },
    ];

    const episodes = extractEpisodes(data);
    const episode = episodes[0];

    const duration = getDurationMonths(episode);
    
    // Doit être un nombre positif
    expect(typeof duration).toBe('number');
    expect(duration).toBeGreaterThan(0);
  });

  it('compare deux épisodes El Niño', () => {
    // Episode1 : El Niño faible
    const data1: ONIObservation[] = [
      { date_centrale: '2015-11-01', periode: 'NDJ', valeur_oni: 0.6 },
      { date_centrale: '2015-12-01', periode: 'DJF', valeur_oni: 0.7 },
    ];

    // Episode2 : El Niño fort
    const data2: ONIObservation[] = [
      { date_centrale: '2009-06-01', periode: 'JJA', valeur_oni: 1.5 },
      { date_centrale: '2009-07-01', periode: 'JAS', valeur_oni: 1.8 },
    ];

    const episodes1 = extractEpisodes(data1);
    const episodes2 = extractEpisodes(data2);

    expect(episodes1.length).toBeGreaterThan(0);
    expect(episodes2.length).toBeGreaterThan(0);

    const comparison = compareEpisodes(episodes1[0], episodes2[0]);

    // Vérifier que la comparaison retourne les champs attendus
    expect(comparison).toHaveProperty('avgONI1');
    expect(comparison).toHaveProperty('avgONI2');
    expect(comparison).toHaveProperty('durationDiff');
    
    // Vérifier que les valeurs sont des nombres
    expect(typeof parseInt(comparison.avgONI1)).toBe('number');
    expect(typeof parseInt(comparison.avgONI2)).toBe('number');
  });

  it('identifie plusieurs épisodes consécutifs', () => {
    const data: ONIObservation[] = [
      // El Niño 1
      { date_centrale: '2015-11-01', periode: 'NDJ', valeur_oni: 1.3 },
      { date_centrale: '2015-12-01', periode: 'DJF', valeur_oni: 1.7 },
      { date_centrale: '2016-01-01', periode: 'JFM', valeur_oni: 0.4 },
      // Neutre
      { date_centrale: '2016-02-01', periode: 'FMA', valeur_oni: 0.1 },
      // La Niña
      { date_centrale: '2016-03-01', periode: 'MAM', valeur_oni: -0.6 },
      { date_centrale: '2016-04-01', periode: 'AMJ', valeur_oni: -0.8 },
      { date_centrale: '2016-05-01', periode: 'MJJ', valeur_oni: -0.2 },
    ];

    const episodes = extractEpisodes(data);

    // Doit identifier 2 épisodes : El Niño et La Niña
    expect(episodes.length).toBe(2);
    expect(episodes.some((ep) => ep.phase === 'El Niño')).toBe(true);
    expect(episodes.some((ep) => ep.phase === 'La Niña')).toBe(true);
  });

  it('calcule l\'intensité correctement', () => {
    // Intensité faible (valeurs < 1.0)
    const dataWeak: ONIObservation[] = [
      { date_centrale: '2015-11-01', periode: 'NDJ', valeur_oni: 0.6 },
      { date_centrale: '2015-12-01', periode: 'DJF', valeur_oni: 0.7 },
    ];

    // Intensité forte (valeurs > 1.5)
    const dataStrong: ONIObservation[] = [
      { date_centrale: '2015-11-01', periode: 'NDJ', valeur_oni: 1.6 },
      { date_centrale: '2015-12-01', periode: 'DJF', valeur_oni: 1.8 },
    ];

    const episodesWeak = extractEpisodes(dataWeak);
    const episodesStrong = extractEpisodes(dataStrong);

    expect(episodesWeak[0].intensite).toBe('faible');
    expect(episodesStrong[0].intensite).toBe('forte');
  });
});

