import { useParams, useNavigate } from 'react-router-dom';
import { useDevice } from '../hooks/useDevices';
import { useMeasurements } from '../hooks/useMeasurements';
import StatsGrid from '../components/measurements/StatsGrid';
import MetricChart from '../components/measurements/MetricChart';
import MeasurementTable from '../components/measurements/MeasurementTable';

export default function DeviceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { device, loading: deviceLoading, error: deviceError } = useDevice(id);

  // Posledních 10 pro tabulku
  const { measurements, loading: measLoading } = useMeasurements(
    device?.gatewayId ?? id,
    { limit: 50 }
  );

  if (deviceLoading) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
      Načítání...
    </div>
  );

  if (deviceError) return (
    <div className="bg-amber-50 border border-amber-300 text-amber-900 text-sm rounded-xl px-4 py-3">
      Zařízení nenalezeno.
    </div>
  );

  return (
    <div>
      <button
        onClick={() => navigate('/devices')}
        className="flex items-center gap-1.5 text-sm cursor-pointer text-gray-400 hover:text-gray-900 transition-colors mb-4"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Zpět na přehled
      </button>

      <div className="mb-6">
        <h1 className="text-lg font-medium text-gray-900 cursor-default">{device.name}</h1>
      </div>

      {measLoading ? (
        <div className="text-sm text-gray-400 mb-6">Načítání měření...</div>
      ) : (
        <>
          <StatsGrid measurements={measurements} thresholds={device.thresholds} />
          <MetricChart measurements={measurements} thresholds={device.thresholds} />
          <h2 className="text-sm font-medium text-gray-900 mb-3">Posledních 10 měření</h2>
          <MeasurementTable
            measurements={measurements.slice(0, 10)}
            thresholds={device.thresholds}
          />
        </>
      )}
    </div>
  );
}