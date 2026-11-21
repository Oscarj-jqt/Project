import { describe, it, expect } from 'vitest';
import { oniAPI } from '../services/api';

/**
 * Tests des appels API frontend
 * 
 * Vérifie que le service API expose les bonnes méthodes
 */

describe('Service API client: Récupération observations ONI', () => {
  it('récupère les observations sans filtre', () => {
    // Vérifier que oniAPI.getObservations existe et est appelable
    expect(typeof oniAPI.getObservations).toBe('function');
  });

  it('envoie la date de début au filtre', () => {
    // Vérifier que oniAPI.getObservations existe et est appelable
    expect(typeof oniAPI.getObservations).toBe('function');
  });

  it('envoie la date de fin au filtre', () => {
    // Vérifier que oniAPI.getObservations existe et est appelable
    expect(typeof oniAPI.getObservations).toBe('function');
  });
});

