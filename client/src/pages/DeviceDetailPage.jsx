import { useParams, useNavigate } from 'react-router-dom';
import { usePlant } from '../hooks/usePlants';
import { useMeasurements } from '../hooks/useMeasurements';
import { getThresholdStatus } from '../utils/thresholds';
import StatsGrid from '../components/measurements/StatsGrid';
import MetricChart from '../components/measurements/MetricChart';
import MeasurementTable from '../components/measurements/MeasurementTable';

export default function DeviceDetailPage() {
  const { id } = useParams();
  console.log('DeviceDetailPage id:', id);
  const navigate = useNavigate();
  const { plant, loading: plantLoading, error: plantError } = usePlant(id);
  const { measurements, loading: measLoading } = useMeasurements(id, { limit: 50 });

  const thresholds = plant ? {
    minTemp: plant.thresholds?.minTemp,
    maxTemp: plant.thresholds?.maxTemp,
    minHum:  plant.thresholds?.minHum,
    maxHum:  plant.thresholds?.maxHum,
    minMoist: plant.thresholds?.minMoist,
    maxMoist: plant.thresholds?.maxMoist,
  } : {};

  const last = measurements[0];
  const localAlerts = last ? [
    getThresholdStatus(last.temperature, thresholds.minTemp, thresholds.maxTemp) === 'low'  && `Teplota je příliš nízká (${last.temperature}°C, min. ${thresholds.minTemp}°C)`,
    getThresholdStatus(last.temperature, thresholds.minTemp, thresholds.maxTemp) === 'high' && `Teplota je příliš vysoká (${last.temperature}°C, max. ${thresholds.maxTemp}°C)`,
    getThresholdStatus(last.moisture, thresholds.minMoist, thresholds.maxMoist) === 'low'       && `Vlhkost půdy je příliš nízká (${last.moisture}%, min. ${thresholds.minMoist}%)`,
    getThresholdStatus(last.moisture, thresholds.minMoist, thresholds.maxMoist) === 'high'      && `Vlhkost půdy je příliš vysoká (${last.moisture}%, max. ${thresholds.maxMoist}%)`,
    getThresholdStatus(last.humidity, thresholds.minHum, thresholds.maxHum) === 'low'       && `Vlhkost vzduchu je příliš nízká (${last.humidity}%, min. ${thresholds.minHum}%)`,
    getThresholdStatus(last.humidity, thresholds.minHum, thresholds.maxHum) === 'high'      && `Vlhkost vzduchu je příliš vysoká (${last.humidity}%, max. ${thresholds.maxHum}%)`,
  ].filter(Boolean) : [];

  console.log('Plant:', plant);
  if (plantLoading) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
      Načítání...
    </div>
  );

  if (plantError) return (
    <div className="bg-amber-50 border border-amber-300 text-amber-900 text-sm rounded-xl px-4 py-3">
      Zařízení nenalezeno.
    </div>
  );


  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => navigate('/devices')}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-900 cursor-pointer transition-colors mb-4"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Zpět na přehled
      </button>

      <div className="mb-6">
        <h1 className="text-lg font-medium text-gray-900">{plant.name}</h1>
        <p className="text-sm text-gray-400 mt-0.5">Gateway: {plant.gatewayId?.name} · {plant.gatewayId?.status === 'online' ? 'online' : 'offline'}</p>
      </div>

      {/* Alerts */}
      {!measLoading && localAlerts.length > 0 && (
        <div className="mb-5 flex flex-col gap-2">
          {localAlerts.map((message, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3"
            >
              <div className="w-4 h-4 rounded-full bg-amber-600 flex items-center justify-center flex-shrink-0">
                <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                  <path d="M5 2v3M5 7v.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-sm text-gray-900">{message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Data */}
      {measLoading ? (
        <div className="text-sm text-gray-400 mb-6">Načítání měření...</div>
      ) : (
        <>
          <StatsGrid measurements={measurements} thresholds={thresholds} plant={plant}/>
          <MetricChart measurements={measurements} thresholds={thresholds} />
          <h2 className="text-sm font-medium text-gray-900 mb-3">Posledních 10 měření</h2>
          <MeasurementTable
            measurements={measurements.slice(0, 10)}
            thresholds={thresholds}
          />
        </>
      )}
    </div>
  );
}