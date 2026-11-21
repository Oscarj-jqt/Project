import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { ONIObservation } from '../types';
import './ONIChart.css';

interface ONIChartProps {
  data: ONIObservation[];
}

interface ChartData extends ONIObservation {
  fill?: string;
}

/**
 * Composant graphique : visualise la courbe ONI avec phases El Niño/La Niña
 * - Rouge : El Niño (ONI >= 0.5)
 * - Bleu clair : La Niña (ONI <= -0.5)
 * - Blanc : Neutre
 */
export default function ONIChart({ data }: ONIChartProps) {
  if (data.length === 0) return null;

  // Préparer les données avec couleurs de fond
  const chartData: ChartData[] = data.map((obs) => ({
    ...obs,
    fill: obs.valeur_oni >= 0.5 ? '#ffe6e6' : obs.valeur_oni <= -0.5 ? '#e6f2ff' : 'transparent',
  }));

  const minValue = Math.min(...data.map((o) => o.valeur_oni));
  const maxValue = Math.max(...data.map((o) => o.valeur_oni));

  return (
    <section className="oni-chart">
      <h2>Évolution de l'indice ONI</h2>

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 80 }}>
          {/* Zones colorées de fond */}
          <defs>
            <pattern id="el-nino-bg" x="0" y="0" width="100%" height="100%" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="100%" height="100%" fill="#fff5f5" />
            </pattern>
            <pattern id="la-nina-bg" x="0" y="0" width="100%" height="100%" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="100%" height="100%" fill="#f0f8ff" />
            </pattern>
          </defs>

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
            domain={[Math.floor(minValue * 2) / 2, Math.ceil(maxValue * 2) / 2]}
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

          {/* Lignes de référence avec labels */}
          <ReferenceLine y={0.5} stroke="#dc3545" strokeDasharray="5 5" label={{ value: 'El Niño', position: 'right', fill: '#dc3545' }} />
          <ReferenceLine y={-0.5} stroke="#0dcaf0" strokeDasharray="5 5" label={{ value: 'La Niña', position: 'right', fill: '#0dcaf0' }} />
          <ReferenceLine y={0} stroke="#999" strokeDasharray="3 3" />

          {/* Courbe principale */}
          <Line
            type="monotone"
            dataKey="valeur_oni"
            stroke="#0d6efd"
            dot={false}
            strokeWidth={2.5}
            isAnimationActive={false}
            name="Indice ONI"
          />
        </ComposedChart>
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
            {minValue.toFixed(2)} / {maxValue.toFixed(2)}°C
          </span>
        </div>
      </div>

      {/* Explication des données */}
      <div className="chart-explanation">
        <h3>ℹ️ À propos de ces données</h3>
        <p>
          L'indice ONI mesure l'anomalie de température océanique dans le Pacifique central (région Niño 3.4).
          Les seuils ±0.5°C classifient les phases El Niño (rouge) et La Niña (bleu).
          Les données sont fournies par la{' '}
          <a href="https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso/oni/v6/index.php" target="_blank" rel="noopener noreferrer">
            NOAA Climate Prediction Center
          </a>
          .
        </p>
      </div>
    </section>
  );
}
