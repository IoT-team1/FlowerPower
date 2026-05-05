import { useParams, useNavigate } from 'react-router-dom';
import { usePlant } from '../hooks/usePlants';
import { useMeasurements } from '../hooks/useMeasurements';
import StatsGrid from '../components/measurements/StatsGrid';
import MetricChart from '../components/measurements/MetricChart';
import MeasurementTable from '../components/measurements/MeasurementTable';

export default function DeviceDetailPage() {
  const { id } = useParams();
  console.log('DeviceDetailPage id:', id);
  const navigate = useNavigate();
  const { plant, loading: plantLoading, error: plantError } = usePlant(id);
  const { measurements, loading: measLoading } = useMeasurements(id, { limit: 50 });

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

  // thresholds jsou přímo na plant, ne vnořené pod .thresholds
  const thresholds = {
    minTemp: plant.thresholds?.minTemp,
    maxTemp: plant.thresholds?.maxTemp,
    minHum:  plant.thresholds?.minHum,
    maxHum:  plant.thresholds?.maxHum,
  };

  return (
    <div>
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
        <p className="text-sm text-gray-400 mt-0.5">Gateway: {plant.gatewayId?.name}</p>
      </div>

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