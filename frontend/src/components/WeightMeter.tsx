import React from 'react';

type Props = {
  weight: number;
  planet: string;
};

const WeightMeter: React.FC<Props> = ({ weight, planet }) => (
  <div className="flex flex-col items-center my-8">
    <div className="text-4xl font-bold mb-2">{weight.toLocaleString(undefined, { maximumFractionDigits: 2 })} N</div>
    <div className="text-lg text-gray-500">Weight on {planet}</div>
    <div className="w-64 h-6 bg-gray-300 rounded-full mt-4">
      <div
        className="h-6 rounded-full transition-all duration-500"
        role="presentation"
        style={{ width: `${Math.min(100, weight / 10)}%`, background: weight > 1000 ? '#f59e42' : '#3b82f6' }}
      />
    </div>
  </div>
);

export default WeightMeter;
