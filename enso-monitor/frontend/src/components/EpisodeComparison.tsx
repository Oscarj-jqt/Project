import { useState, useMemo } from 'react';
import type { ONIObservation } from '../types';
import { extractEpisodes, compareEpisodes, getDurationMonths } from '../services/episodeUtils';
import './EpisodeComparison.css';

interface EpisodeComparisonProps {
  observations: ONIObservation[];
}

export default function EpisodeComparison({ observations }: EpisodeComparisonProps) {
  const episodes = useMemo(() => extractEpisodes(observations), [observations]);
  const [selectedEpisodes, setSelectedEpisodes] = useState<[string | null, string | null]>([null, null]);

  const selectEpisode = (episodeId: string, slot: 0 | 1) => {
    const newSelected: [string | null, string | null] = [...selectedEpisodes] as [string | null, string | null];
    newSelected[slot] = newSelected[slot] === episodeId ? null : episodeId;
    setSelectedEpisodes(newSelected);
  };

  const canCompare = selectedEpisodes[0] !== null && selectedEpisodes[1] !== null && selectedEpisodes[0] !== selectedEpisodes[1];
  const ep1 = episodes.find((ep) => ep.id === selectedEpisodes[0]);
  const ep2 = episodes.find((ep) => ep.id === selectedEpisodes[1]);
  const comparison = canCompare && ep1 && ep2 ? compareEpisodes(ep1, ep2) : null;

  if (episodes.length === 0) {
    return null;
  }

  return (
    <section className="episode-comparison">
      <h2>Comparer deux épisodes</h2>

      <div className="episodes-container">
        <div className="episodes-grid">
          {episodes.map((episode) => (
            <div
              key={episode.id}
              className={`episode-card episode-${episode.phase.toLowerCase().replace(' ', '-')} ${selectedEpisodes.includes(episode.id) ? 'selected' : ''}`}
              onClick={() => {
                const slot = selectedEpisodes[0] === episode.id ? 0 : selectedEpisodes[1] === episode.id ? 1 : selectedEpisodes[0] === null ? 0 : 1;
                selectEpisode(episode.id, slot as 0 | 1);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  const slot = selectedEpisodes[0] === episode.id ? 0 : selectedEpisodes[1] === episode.id ? 1 : selectedEpisodes[0] === null ? 0 : 1;
                  selectEpisode(episode.id, slot as 0 | 1);
                }
              }}
            >
              <div className="card-phase">{episode.phase}</div>
              <div className="card-intensity">{episode.intensite}</div>
              <div className="card-dates">
                {new Date(episode.debut).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' })} →{' '}
                {new Date(episode.fin).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' })}
              </div>
              <div className="card-duration">{getDurationMonths(episode)} mois</div>
              <div className="card-avg">Moy. ONI : {episode.valeurMoyenne.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>

      {canCompare && comparison && ep1 && ep2 && (
        <div className="comparison-result">
          <h3>Résultats de la comparaison</h3>

          <div className="comparison-columns">
            <div className={`episode-col episode-${ep1.phase.toLowerCase().replace(' ', '-')}`}>
              <h4>{ep1.phase}</h4>
              <p className="col-dates">{ep1.debut} → {ep1.fin}</p>
              <div className="metrics">
                <div className="metric">
                  <span className="metric-label">Durée</span>
                  <span className="metric-value">{comparison.duration1} mois</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Intensité</span>
                  <span className="metric-value">{ep1.intensite}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Moy. ONI</span>
                  <span className="metric-value">{comparison.avgONI1}°C</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Max ONI</span>
                  <span className="metric-value">{comparison.maxONI1}°C</span>
                </div>
              </div>
            </div>

            <div className="comparison-diff">
              <div className="diff-item">
                <span className="diff-label">Durée</span>
                <span className={`diff-value ${comparison.durationDiff > 0 ? 'positive' : comparison.durationDiff < 0 ? 'negative' : ''}`}>
                  {comparison.durationDiff > 0 ? '+' : ''}{comparison.durationDiff} mois
                </span>
              </div>
              <div className="diff-item">
                <span className="diff-label">Moy. ONI</span>
                <span className={`diff-value ${Number(comparison.avgONIDiff) > 0 ? 'positive' : Number(comparison.avgONIDiff) < 0 ? 'negative' : ''}`}>
                  {Number(comparison.avgONIDiff) > 0 ? '+' : ''}{comparison.avgONIDiff}°C
                </span>
              </div>
            </div>

            <div className={`episode-col episode-${ep2.phase.toLowerCase().replace(' ', '-')}`}>
              <h4>{ep2.phase}</h4>
              <p className="col-dates">{ep2.debut} → {ep2.fin}</p>
              <div className="metrics">
                <div className="metric">
                  <span className="metric-label">Durée</span>
                  <span className="metric-value">{comparison.duration2} mois</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Intensité</span>
                  <span className="metric-value">{ep2.intensite}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Moy. ONI</span>
                  <span className="metric-value">{comparison.avgONI2}°C</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Max ONI</span>
                  <span className="metric-value">{comparison.maxONI2}°C</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedEpisodes.some((s) => s !== null) && !canCompare && (
        <div className="comparison-hint">Sélectionnez deux épisodes différents pour comparer</div>
      )}
    </section>
  );
}
