import DeviceCard from './DeviceCard.jsx';

export default function DeviceList({ devices }) {
  if (!devices.length) return <div>Žádná zařízení nenalezena.</div>;

  return (
    <div>
      {devices.map((device) => (
        <DeviceCard key={device._id} device={device} />
      ))}
    </div>
  );
}