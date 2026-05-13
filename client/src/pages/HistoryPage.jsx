import { useState, useMemo } from 'react';
import { usePlants } from '../hooks/usePlants';
import { useHistoryMeasurements } from '../hooks/useHistoryMeasurements';
import { filterByRange, aggregateMeasurements } from '../utils/stats';
import { useAlertHistory } from '../hooks/useAlertHistory';
import RangeSelector from '../components/history/RangeSelector';
import HistoryStatsGrid from '../components/history/HistoryStatsGrid';
import HistoryChart from '../components/history/HistoryChart';
import MeasurementTable from '../components/measurements/MeasurementTable';
import AlertsChart from '../components/history/AlertsChart';
import AlertsLog from '../components/history/AlertsLog';

export default function HistoryPage() {
  const { plants, loading: plantsLoading } = usePlants();
  const [selectedPlantId, setSelectedPlantId] = useState('');
  const [range, setRange] = useState('24h');

  const { measurements, loading: measLoading }  = useHistoryMeasurements(selectedPlantId);
  const { alerts, loading: alertsLoading }       = useAlertHistory(selectedPlantId);

  const selectedPlant = plants.find((p) => p._id === selectedPlantId) ?? null;
  console.log('Selected plant:', selectedPlant);

  const filteredMeasurements = useMemo(
    () => filterByRange(measurements, range),
    [measurements, range]
  );
  const aggregatedMeasurements = useMemo(
    () => aggregateMeasurements(filteredMeasurements, range),
    [filteredMeasurements, range]
  );
  console.log("aggregatedMeasurements:", aggregatedMeasurements)
  const filteredAlerts = useMemo(
    () => filterByRange(alerts, range),
    [alerts, range]
  );
  const thresholds = selectedPlant
    ? {
      minTemp: selectedPlant.thresholds?.minTemp,
      maxTemp: selectedPlant.thresholds?.maxTemp,
      minHum:  selectedPlant.thresholds?.minHum,
      maxHum:  selectedPlant.thresholds?.maxHum,
      minMoist: selectedPlant.thresholds?.minMoist,
      maxMoist: selectedPlant.thresholds?.maxMoist,
    }
    : {};
  console.log("filteredAlerts:", filteredAlerts)
  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-lg font-medium text-gray-900">Historie</h1>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:flex-none">
            <select
              value={selectedPlantId}
              onChange={(e) => setSelectedPlantId(e.target.value)}
              className="w-full text-sm pl-3 pr-8 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-900 cursor-pointer focus:outline-none appearance-none"
            >
              <option value="">Vyberte rostlinu</option>
              {plants.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
            <svg
              className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
              width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </div>
          <RangeSelector value={range} onChange={setRange} />
        </div>
      </div>

      {/* No plant selected */}
      {!selectedPlantId && (
        <div className="flex flex-col items-center justify-center h-64 gap-2 text-gray-400">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22V12M12 12C12 12 7 8.5 5 4c3.5 0 6.5 2.5 7 8zM12 12C12 12 17 8.5 19 4c-3.5 0-6.5 2.5-7 8z"/>
          </svg>
          <span className="text-sm">Vyberte rostlinu pro zobrazení historie</span>
        </div>
      )}

      {/* Loading */}
      {selectedPlantId && measLoading && (
        <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
          Načítání měření...
        </div>
      )}

      {selectedPlantId && (
        <>
        {/* Measurements */}
        {measLoading ? (
          <div className="text-sm text-gray-400 mb-6">Načítání měření...</div>
        ) : (
          <>
            <HistoryStatsGrid measurements={filteredMeasurements} />
            <HistoryChart measurements={aggregatedMeasurements} thresholds={thresholds} range={range}/>
            <h2 className="text-sm font-medium text-gray-900 mb-3">
              Měření ({aggregatedMeasurements.length})
            </h2>
            <MeasurementTable
              measurements={aggregatedMeasurements.toReversed()}
              thresholds={thresholds}
            />
          </>
        )}

      {/* Alerts */}
      <div className="mt-8">
        <h2 className="text-sm font-medium text-gray-900 mb-3">Historie alertů</h2>
        <AlertsChart alerts={filteredAlerts} />
        <AlertsLog alerts={filteredAlerts} loading={alertsLoading} />
      </div>
        </>
        )}
    </div>
  );
}