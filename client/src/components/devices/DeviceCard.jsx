import { useNavigate } from 'react-router-dom';

export default function DeviceCard({ device }) {
  const navigate = useNavigate();

  return (
    <div onClick={() => navigate(`/devices/${device._id}`)}>
      <div>
        <span>{device.name}</span>
        <span>{device.status}</span>
      </div>
      <div>
        <span>{device.lastMeasurement?.temperature ?? '—'}°C</span>
        <span>{device.lastMeasurement?.humidity ?? '—'}%</span>
      </div>
      <div>Poslední sync: {device.lastSync ?? '—'}</div>
    </div>
  );
}