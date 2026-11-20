import type { AxiosInstance } from 'axios';
import axios from 'axios';
import type { ONIObservation, FilterOptions, HealthResponse } from '../types';

/** Configuration API : pointe localhost:8000 en dev, ajusté par .env en prod */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** API client pour les opérations ONI */
export const oniAPI = {
  /**
   * Vérifie la connexion à la base de données
   * @returns {Promise<HealthResponse>} 
   */
  async health(): Promise<HealthResponse> {
    const response = await apiClient.get<HealthResponse>('/health');
    return response.data;
  },

  /**
   * Récupère les observations ONI, optionnellement filtrées par date
   * @param options Paramètres de filtrage
   * @returns {Promise<ONIObservation[]>} Liste des observations triées par date
   */
  async getObservations(options?: FilterOptions): Promise<ONIObservation[]> {
    const response = await apiClient.get<ONIObservation[]>('/api/v1/oni', {
      params: options,
    });
    return response.data;
  },
};

export default apiClient;

