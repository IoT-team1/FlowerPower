import { useNavigate } from 'react-router-dom';
import { useMeasurements } from '../../hooks/useMeasurements';
import { formatRelativeTime } from '../../utils/formatters';
import { getThresholdStyles } from '../../utils/thresholds';

const statusConfig = {
  online:  { dot: 'bg-green-700', badge: 'bg-green-50 text-green-900',  label: 'Online' },
  warning: { dot: 'bg-amber-700', badge: 'bg-amber-50 text-amber-900',  label: 'Varování' },
  offline: { dot: 'bg-gray-400',  badge: 'bg-gray-100 text-gray-400',   label: 'Offline' },
};

export default function DeviceCard({ device: plant }) {
  const navigate = useNavigate();

  const { measurements } = useMeasurements(plant._id, { limit: 1 });
  const last = measurements[0] ?? null;

  const tempStyles = getThresholdStyles(last?.temperature, plant.thresholds?.minTemp, plant.thresholds?.maxTemp);
  const humStyles  = getThresholdStyles(last?.humidity, plant.thresholds?.minHum, plant.thresholds?.maxHum);
  const moistStyles = getThresholdStyles(last?.moisture, plant.thresholds?.minMoist, plant.thresholds?.maxMoist);

  const status = statusConfig[plant.gatewayId?.status] ?? statusConfig.offline;

  return (
    <div
      onClick={() => navigate(`/devices/${plant._id}`)}
      className="flex items-center gap-4 px-5 py-4 my-2 border border-white rounded-lg cursor-pointer transition-colors hover:bg-gray-100 hover:border-gray-200"
    >
      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 22V12M12 12C12 12 7 8.5 5 4c3.5 0 6.5 2.5 7 8zM12 12C12 12 17 8.5 19 4c-3.5 0-6.5 2.5-7 8z"
                stroke="#3B6D11" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900">{plant.name}</div>
        <div className="text-xs text-gray-400 mt-0.5">
          {plant.gatewayId && formatRelativeTime(plant.gatewayId?.lastSync)
            ? formatRelativeTime(plant.gatewayId?.lastSync)
            : '—'}
        </div>
      </div>

      {/* Metriky – skryté na mobilu */}
      {status.label !== 'Offline' && (
      <div className="hidden sm:flex gap-6 flex-shrink-0">
        <div className="text-right">
          <div className={`text-sm font-medium ${tempStyles.text}`}>
            {last?.temperature != null ? `${last.temperature}°C` : '—'}
          </div>
          <div className="text-xs text-gray-400">teplota</div>
        </div>
        <div className="text-right">
          <div className={`text-sm font-medium ${moistStyles.text}`}>
            {last?.moisture != null ? `${last.moisture}%` : '—'}
          </div>
          <div className="text-xs text-gray-400">vlhkost půdy</div>
        </div>
        <div className="text-right">
          <div className={`text-sm font-medium ${humStyles.text}`}>
            {last?.humidity != null ? `${last.humidity}%` : '—'}
          </div>
          <div className="text-xs text-gray-400">vlhkost vzduchu</div>
        </div>
      </div>
      )}

      {/* Metrics when device is offline */}
      {status.label === 'Offline' && (
        <div className="hidden sm:flex gap-6 flex-shrink-0">
          <div className="text-right">
            <div className= "text-sm font-medium text-gray-400" >
              —
            </div>
            <div className="text-xs text-gray-400">teplota</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-400">
              —
            </div>
            <div className="text-xs text-gray-400">vlhkost půdy</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium  text-gray-400">
              —
            </div>
            <div className="text-xs text-gray-400">vlhkost vzduchu</div>
          </div>
        </div>
      )}


      {/* Status badge */}
      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${status.badge}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
        {status.label}
      </span>
    </div>
  );
}