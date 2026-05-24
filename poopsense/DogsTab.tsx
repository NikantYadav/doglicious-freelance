import React from 'react';
import type { Dog } from '../../types';

interface DogTabsProps {
  dogs: Dog[];
  curDog: number;
  onSelect: (index: number) => void;
}

export const DogTabs: React.FC<DogTabsProps> = ({ dogs, curDog, onSelect }) => {
  if (dogs.length === 0) return null;

  return (
    <div className="dog-tabs" id="dogtabs">
      {dogs.map((dog, i) => (
        <button
          key={dog.id}
          className={`dtab${i === curDog ? ' on' : ''}`}
          onClick={() => onSelect(i)}
          type="button"
        >
          {dog.av} {dog.name}
        </button>
      ))}
    </div>
  );
};