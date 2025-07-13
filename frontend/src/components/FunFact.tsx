import React from 'react';
import { PLANETS } from '../constants';

type Props = {
  planetIdx: number;
};

const FunFact: React.FC<Props> = ({ planetIdx }) => (
  <div className="mt-6 text-center text-xl italic text-yellow-600">
    {PLANETS[planetIdx]?.funFact}
  </div>
);

export default FunFact;
