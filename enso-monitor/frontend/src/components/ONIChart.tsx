import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { ONIObservation } from '../types';
import './ONIChart.css';

interface ONIChartProps {
  data: ONIObservation[];
}

/**
 * Composant graphique : visualise la courbe ONI avec phases El Niño/La Niña
 * - Rouge : El Niño (ONI >= 0.5)
 * - Bleu : La Niña (ONI <= -0.5)
 * - Gris : Neutre
 */
export default function ONIChart({ data }: ONIChartProps) {
  if (data.length === 0) return null;

  return (
    <section className="oni-chart">
      <h2>Évolution de l'indice ONI</h2>
      
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 80 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
          
          <XAxis
            dataKey="date_centrale"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={100}
          />
          
          <YAxis
            label={{ value: 'Anomalie (°C)', angle: -90, position: 'insideLeft' }}
            domain={[-3, 3]}
          />
          
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
            formatter={(value) => `${Number(value).toFixed(2)}°C`}
            labelFormatter={(label) => `${label}`}
          />
          
          <Legend />
          
          {/* Zones de référence */}
          <ReferenceLine y={0.5} stroke="#d9534f" strokeDasharray="5 5" label="El Niño" />
          <ReferenceLine y={-0.5} stroke="#5cb85c" strokeDasharray="5 5" label="La Niña" />
          <ReferenceLine y={0} stroke="#999" strokeDasharray="3 3" />
          
          {/* Courbe principale */}
          <Line
            type="monotone"
            dataKey="valeur_oni"
            stroke="#3498db"
            dot={false}
            strokeWidth={2}
            isAnimationActive={false}
            name="Indice ONI"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Statistiques */}
      <div className="chart-stats">
        <div className="stat">
          <span className="stat-label">Observations :</span>
          <span className="stat-value">{data.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Période :</span>
          <span className="stat-value">
            {data[0].date_centrale} → {data[data.length - 1].date_centrale}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Min/Max :</span>
          <span className="stat-value">
            {Math.min(...data.map((o) => o.valeur_oni)).toFixed(2)} /
            {Math.max(...data.map((o) => o.valeur_oni)).toFixed(2)}°C
          </span>
        </div>
      </div>
    </section>
  );
}
