
import React, { useEffect, useState } from 'react';
import PlanetCarousel from './components/PlanetCarousel';
import WeightMeter from './components/WeightMeter';
import FunFact from './components/FunFact';
import { PLANETS } from './constants';
import { connectWebSocket } from './api';

const App: React.FC = () => {
  const [selected, setSelected] = useState(2); // Default to Earth
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const ws = connectWebSocket(setData);
    return () => ws.close();
  }, []);

  const planet = PLANETS[selected];
  const weight = data?.weights?.[planet.name] ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black text-white flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">How Much Would You Weigh?</h1>
      <PlanetCarousel selected={selected} onSelect={setSelected} />
      <WeightMeter weight={weight} planet={planet.name} />
      <FunFact planetIdx={selected} />
      <div className="mt-8 text-gray-400 text-sm">Mass: {data?.mass?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? '--'} kg</div>
    </div>
  );
};

export default App;
