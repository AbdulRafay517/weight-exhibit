import React from 'react';
import { PLANETS } from '../constants';

type Props = {
  selected: number;
  onSelect: (idx: number) => void;
};

const PlanetCarousel: React.FC<Props> = ({ selected, onSelect }) => (
  <div className="flex overflow-x-auto space-x-4 py-4 justify-center">
    {PLANETS.map((planet, idx) => (
      <button
        key={planet.name}
        className={`rounded-full px-6 py-2 text-lg font-bold transition-colors duration-200 ${selected === idx ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
        onClick={() => onSelect(idx)}
      >
        {planet.name}
      </button>
    ))}
  </div>
);

export default PlanetCarousel;
