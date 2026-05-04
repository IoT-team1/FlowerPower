import { useParams } from 'react-router-dom';
import { useDevice } from '../hooks/useDevices';
import { useMeasurements } from '../hooks/useMeasurements';
import MetricCard from '../components/measurements/MetricCard';
import MeasurementTable from '../components/measurements/MeasurementTable';

export default function DeviceDetailPage() {
  const { id } = useParams();
  const { device, loading: deviceLoading, error: deviceError } = useDevice(id);
  const { measurements, loading: measLoading } = useMeasurements(id, { limit: 10 });

  if (deviceLoading) return <div>Načítání...</div>;
  if (deviceError)   return <div>Zařízení nenalezeno.</div>;

  const last = measurements[0];

  return (
    <div>
      <h1>{device.name}</h1>
      <p>{device.location}</p>

      <div>
        <MetricCard label="Teplota"         value={last?.temperature} unit="°C" />
        <MetricCard label="Vlhkost půdy"    value={last?.humidity}    unit="%" />
      </div>

      {measLoading ? (
        <div>Načítání měření...</div>
      ) : (
        <MeasurementTable measurements={measurements} />
      )}
    </div>
  );
}