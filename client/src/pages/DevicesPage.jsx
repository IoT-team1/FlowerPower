import { useDevices } from '../hooks/useDevices';
import DeviceList from '../components/devices/DeviceList';
import DevicesSummary from '../components/devices/DevicesSummary';

export default function DevicesPage() {
  const { devices, loading, error } = useDevices();

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
      Načítání zařízení...
    </div>
  );

  if (error) return (
    <div className="bg-amber-50 border border-amber-300 text-amber-900 text-sm rounded-xl px-4 py-3">
      Chyba: {error.message}
    </div>
  );

  return (
    <div>
      <h1 className="text-lg font-medium text-gray-900 mb-4 cursor-default" >Přehled zařízení</h1>
      <DevicesSummary devices={devices} />
      <DeviceList devices={devices} />
    </div>
  );
}