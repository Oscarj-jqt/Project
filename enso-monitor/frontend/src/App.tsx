import { useState, useEffect } from 'react';
import type { ONIObservation, FilterOptions } from './types';
import { oniAPI } from './services/api';
import Filters from './components/Filters';
import ONIChart from './components/ONIChart';
import EpisodeComparison from './components/EpisodeComparison';
import './App.css';

/** Composant principal : gère l'état global et les appels API */
export default function App() {
  const [observations, setObservations] = useState<ONIObservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({});

  // Charger les données au montage et quand les filtres changent
  useEffect(() => {
    fetchObservations();
  }, [filters]);

  async function fetchObservations() {
    try {
      setLoading(true);
      setError(null);
      const data = await oniAPI.getObservations(filters);
      setObservations(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement des données';
      setError(message);
      console.error('Erreur API:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>ENSO Monitor</h1>
        <p>Analyse historique des indices ONI (El Niño / La Niña)</p>
      </header>

      <main className="app-main">
        {error && <div className="error-banner">{error}</div>}

        <Filters onFilterChange={setFilters} disabled={loading} />

        {loading && <div className="loading">Chargement des données...</div>}

        {!loading && observations.length > 0 && (
          <>
            <ONIChart data={observations} />
            <EpisodeComparison observations={observations} />
          </>
        )}

        {!loading && observations.length === 0 && !error && (
          <div className="no-data">Aucune donnée pour cette période</div>
        )}
      </main>
    </div>
  );
}
