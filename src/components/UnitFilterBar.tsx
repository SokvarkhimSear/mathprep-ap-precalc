import React from 'react';

interface UnitFilterBarProps {
  selectedUnit: string | number | null;
  onSelectUnit: (unit: string | number | null) => void;
}

export const UnitFilterBar: React.FC<UnitFilterBarProps> = ({ selectedUnit, onSelectUnit }) => {
  const units: Array<{ value: string | null; matchNum?: number; label: string }> = [
    { value: null, label: 'All Units (1–4B)' },
    { value: 'unit_1', matchNum: 1, label: 'Unit 1: Polynomial & Rational' },
    { value: 'unit_2a', label: 'Unit 2A: Exponential & Compositions' },
    { value: 'unit_2b', label: 'Unit 2B: Logarithmic Functions' },
    { value: 'unit_3', matchNum: 3, label: 'Unit 3: Trigonometric & Polar' },
    { value: 'unit_4a', label: 'Unit 4A: Parametric & Conics' },
    { value: 'unit_4b', label: 'Unit 4B: Vectors & Matrices' },
  ];

  return (
    <div className="w-full overflow-x-auto pb-1 scrollbar-none">
      <div className="inline-flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl border border-slate-200">
        {units.map((u) => {
          const isActive =
            selectedUnit === u.value ||
            (typeof selectedUnit === 'number' && u.matchNum === selectedUnit);
          return (
            <button
              key={u.label}
              onClick={() => onSelectUnit(u.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {u.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

