import { useDevices } from '../hooks/useDevices';
import DeviceList from '../components/devices/DeviceList';

export default function DevicesPage() {
  const { devices, loading, error } = useDevices();

  if (loading) return <div>Načítání...</div>;
  if (error)   return <div>Chyba: {error.message}</div>;

  return (
    <div>
      <h1>Přehled zařízení</h1>
      <DeviceList devices={devices} />
    </div>
  );
}