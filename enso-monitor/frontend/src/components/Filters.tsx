import { useState } from 'react';
import type { FilterOptions } from '../types';
import './Filters.css';

interface FiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  disabled?: boolean;
}

/** Composant de filtres réutilisable : permet de filtrer par date */
export default function Filters({ onFilterChange, disabled }: FiltersProps) {
  const [debut, setDebut] = useState<string>('');
  const [fin, setFin] = useState<string>('');

  const handleApply = () => {
    const filters: FilterOptions = {};
    if (debut) filters.debut = debut;
    if (fin) filters.fin = fin;
    onFilterChange(filters);
  };

  const handleReset = () => {
    setDebut('');
    setFin('');
    onFilterChange({});
  };

  return (
    <section className="filters">
      <h2>Filtres</h2>
      <div className="filters-grid">
        <div className="filter-group">
          <label htmlFor="debut">Date de début</label>
          <input
            id="debut"
            type="date"
            value={debut}
            onChange={(e) => setDebut(e.target.value)}
            disabled={disabled}
            aria-label="Date de début (YYYY-MM-DD)"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="fin">Date de fin</label>
          <input
            id="fin"
            type="date"
            value={fin}
            onChange={(e) => setFin(e.target.value)}
            disabled={disabled}
            aria-label="Date de fin (YYYY-MM-DD)"
          />
        </div>
      </div>

      <div className="filters-actions">
        <button onClick={handleApply} disabled={disabled} className="btn-primary">
          Appliquer
        </button>
        <button onClick={handleReset} disabled={disabled} className="btn-secondary">
          Réinitialiser
        </button>
      </div>
    </section>
  );
}
