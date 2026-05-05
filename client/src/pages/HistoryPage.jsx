import { useState, useMemo } from 'react';
//import { usePlants } from '../hooks/usePlants';
import { useHistoryMeasurements } from '../hooks/useHistoryMeasurements';
import { filterByRange } from '../utils/stats';
import RangeSelector from '../components/history/RangeSelector';
import HistoryStatsGrid from '../components/history/HistoryStatsGrid';
import HistoryChart from '../components/history/HistoryChart';
import MeasurementTable from '../components/measurements/MeasurementTable';

export default function HistoryPage() {
  const { plants, loading: plantsLoading } = usePlants();
  const [selectedPlantId, setSelectedPlantId] = useState('');
  const [range, setRange] = useState('24h');

  const { measurements, loading: measLoading } = useHistoryMeasurements(selectedPlantId);

  const selectedPlant = plants.find((p) => p._id === selectedPlantId) ?? null;

  const filtered = useMemo(
    () => filterByRange(measurements, range),
    [measurements, range]
  );

  const thresholds = selectedPlant
    ? {
      minTemp: selectedPlant.minTemp,
      maxTemp: selectedPlant.maxTemp,
      minHum:  selectedPlant.minHum,
      maxHum:  selectedPlant.maxHum,
    }
    : {};

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-medium text-gray-900">Historie</h1>
        <div className="flex items-center gap-3">
          <select
            value={selectedPlantId}
            onChange={(e) => setSelectedPlantId(e.target.value)}
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-900 cursor-pointer focus:outline-none"
          >
            <option value="">Vyberte zařízení</option>
            {plants.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
          <RangeSelector value={range} onChange={setRange} />
        </div>
      </div>

      {/* Prázdný stav – nevybráno zařízení */}
      {!selectedPlantId && (
        <div className="flex flex-col items-center justify-center h-64 gap-2 text-gray-400">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22V12M12 12C12 12 7 8.5 5 4c3.5 0 6.5 2.5 7 8zM12 12C12 12 17 8.5 19 4c-3.5 0-6.5 2.5-7 8z"/>
          </svg>
          <span className="text-sm">Vyberte zařízení pro zobrazení historie</span>
        </div>
      )}

      {/* Loading */}
      {selectedPlantId && measLoading && (
        <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
          Načítání měření...
        </div>
      )}

      {/* Data */}
      {selectedPlantId && !measLoading && (
        <>
          <HistoryStatsGrid measurements={filtered} />
          <HistoryChart measurements={filtered} thresholds={thresholds} />
          <h2 className="text-sm font-medium text-gray-900 mb-3">
            Měření ({filtered.length})
          </h2>
          <MeasurementTable
            measurements={filtered}
            thresholds={thresholds}
          />
        </>
      )}
    </div>
  );
}