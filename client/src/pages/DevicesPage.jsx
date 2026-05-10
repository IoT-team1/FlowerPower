import { usePlants } from '../hooks/usePlants';
import DeviceList from '../components/devices/DeviceList';
import DevicesSummary from '../components/devices/DevicesSummary';

export default function DevicesPage() {
  const { plants, loading, error } = usePlants();

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
      <h1 className="text-lg font-medium text-gray-900 cursor-default mb-4">Přehled zařízení</h1>
      <DevicesSummary devices={plants} />
      <DeviceList devices={plants} />
    </div>
  );
}