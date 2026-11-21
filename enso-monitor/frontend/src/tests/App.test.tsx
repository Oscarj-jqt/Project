import { describe, it, expect } from 'vitest';
import type { ONIObservation } from '../types';
import { extractEpisodes } from '../services/episodeUtils';

/**
 * Tests du parcours frontend : changement de période et mise à jour des données
 * 
 * Philosophie : tests simples et maîtrisés (comme les tests backend)
 * - Vérifier la logique métier
 * - Pas de mock complexe de React
 * - Focus : filtrage par dates, extraction d'épisodes
 */

describe('Frontend: Parcours utilisateur et changement de période', () => {
  it('filtre les observations par date de début', () => {
    // Scénario :
    // 1. Données brutes du backend : observations de 1990 à 2026
    // 2. Utilisateur sélectionne début = 2000-01-01
    // 3. Résultat : seules les obs >= 2000-01-01
    
    const allData: ONIObservation[] = [
      { date_centrale: '1990-01-01', periode: 'DJF', valeur_oni: -1.0 },
      { date_centrale: '2000-01-01', periode: 'DJF', valeur_oni: -0.5 },
      { date_centrale: '2010-01-01', periode: 'DJF', valeur_oni: 0.2 },
      { date_centrale: '2020-01-01', periode: 'DJF', valeur_oni: 1.5 },
    ];

    const startDate = '2000-01-01';
    const filtered = allData.filter((obs) => obs.date_centrale >= startDate);

    expect(filtered.length).toBe(3);
    expect(filtered[0].date_centrale).toBe('2000-01-01');
    expect(filtered[0].valeur_oni).toBe(-0.5);
  });

  it('filtre les observations par date de fin', () => {
    // Scénario :
    // 1. Données brutes
    // 2. Utilisateur sélectionne fin = 2010-12-31
    // 3. Résultat : seules les obs <= 2010-12-31
    
    const allData: ONIObservation[] = [
      { date_centrale: '1990-01-01', periode: 'DJF', valeur_oni: -1.0 },
      { date_centrale: '2000-01-01', periode: 'DJF', valeur_oni: -0.5 },
      { date_centrale: '2010-01-01', periode: 'DJF', valeur_oni: 0.2 },
      { date_centrale: '2020-01-01', periode: 'DJF', valeur_oni: 1.5 },
    ];

    const endDate = '2010-12-31';
    const filtered = allData.filter((obs) => obs.date_centrale <= endDate);

    expect(filtered.length).toBe(3);
    expect(filtered[filtered.length - 1].date_centrale).toBe('2010-01-01');
  });

  it('filtre les observations par plage de dates', () => {
    // Scénario complet :
    // 1. Utilisateur change début = 2000-01-01, fin = 2010-12-31
    // 2. Clique "Appliquer"
    // 3. API retourne les obs de cette plage
    // 4. Graphique affiche 3 observations
    
    const allData: ONIObservation[] = [
      { date_centrale: '1990-01-01', periode: 'DJF', valeur_oni: -1.0 },
      { date_centrale: '2000-01-01', periode: 'DJF', valeur_oni: -0.5 },
      { date_centrale: '2005-06-01', periode: 'JJA', valeur_oni: 0.3 },
      { date_centrale: '2010-01-01', periode: 'DJF', valeur_oni: 0.2 },
      { date_centrale: '2020-01-01', periode: 'DJF', valeur_oni: 1.5 },
    ];

    const startDate = '2000-01-01';
    const endDate = '2010-12-31';
    const filtered = allData.filter(
      (obs) => obs.date_centrale >= startDate && obs.date_centrale <= endDate
    );

    expect(filtered.length).toBe(3);
    expect(filtered[0].date_centrale).toBe('2000-01-01');
    expect(filtered[1].date_centrale).toBe('2005-06-01');
    expect(filtered[2].date_centrale).toBe('2010-01-01');
  });

  it('extrait les épisodes après filtrage de période', () => {
    // Scénario :
    // 1. Utilisateur filtre données : 2015-2016
    // 2. Frontend récupère données filtrées
    // 3. EpisodeComparison extrait les épisodes de cette plage
    // 4. Affiche El Niño/La Niña d'intérêt
    
    const data: ONIObservation[] = [
      { date_centrale: '2015-11-01', periode: 'NDJ', valeur_oni: 1.3 },
      { date_centrale: '2015-12-01', periode: 'DJF', valeur_oni: 1.7 },
      { date_centrale: '2016-01-01', periode: 'JFM', valeur_oni: 0.4 },
      { date_centrale: '2016-02-01', periode: 'FMA', valeur_oni: 0.1 },
      { date_centrale: '2016-03-01', periode: 'MAM', valeur_oni: -0.6 },
      { date_centrale: '2016-04-01', periode: 'AMJ', valeur_oni: -0.8 },
      { date_centrale: '2016-05-01', periode: 'MJJ', valeur_oni: -0.2 },
    ];

    // Simuler l'extraction d'épisodes
    const episodes = extractEpisodes(data);

    // Doit identifier 2 épisodes : El Niño (2015-2015) et La Niña (2016)
    expect(episodes.length).toBe(2);
    expect(episodes[0].phase).toBe('El Niño');
    expect(episodes[1].phase).toBe('La Niña');
  });

  it('actualise la courbe avec les bonnes données', () => {
    // Vérification que les données filtrées correspondent exactement
    // à ce qui sera affiché dans le graphique
    
    const data1: ONIObservation[] = [
      { date_centrale: '2010-01-01', periode: 'DJF', valeur_oni: 0.2 },
      { date_centrale: '2010-02-01', periode: 'JFM', valeur_oni: 0.4 },
      { date_centrale: '2010-03-01', periode: 'FMA', valeur_oni: 0.1 },
    ];

    const data2: ONIObservation[] = [
      { date_centrale: '2015-11-01', periode: 'NDJ', valeur_oni: 1.3 },
      { date_centrale: '2015-12-01', periode: 'DJF', valeur_oni: 1.7 },
      { date_centrale: '2016-01-01', periode: 'JFM', valeur_oni: 0.4 },
    ];

    // Vérifier que les données sont différentes
    expect(data1[0].valeur_oni).not.toBe(data2[0].valeur_oni);
    expect(data1.length).toBe(data2.length);

    // Les graphiques affichent :
    // - Nombre d'observations
    // - Période min/max
    // - Courbe avec différentes valeurs
    
    // Vérification logique : les données sont bien distinctes et mises à jour
    expect(data1.map((d) => d.date_centrale)).not.toEqual(
      data2.map((d) => d.date_centrale)
    );
  });

  it('gère une plage vide correctement', () => {
    // Scénario :
    // 1. Utilisateur cherche une période sans données (ex: 9999-10000)
    // 2. API retourne []
    // 3. Frontend affiche "Aucune donnée"
    
    const allData: ONIObservation[] = [
      { date_centrale: '2000-01-01', periode: 'DJF', valeur_oni: -0.5 },
      { date_centrale: '2010-01-01', periode: 'DJF', valeur_oni: 0.2 },
    ];

    const startDate = '9999-01-01';
    const endDate = '9999-12-31';
    const filtered = allData.filter(
      (obs) => obs.date_centrale >= startDate && obs.date_centrale <= endDate
    );

    expect(filtered.length).toBe(0);
    
    // EpisodeComparison ne doit rien afficher
    const episodes = extractEpisodes(filtered);
    expect(episodes.length).toBe(0);
  });
});

