import React from 'react';

interface UnitFilterBarProps {
  selectedUnit: number | null;
  onSelectUnit: (unitNumber: number | null) => void;
}

export const UnitFilterBar: React.FC<UnitFilterBarProps> = ({ selectedUnit, onSelectUnit }) => {
  const units = [
    { number: null, label: 'All 4 Units' },
    { number: 1, label: 'Unit 1: Polynomial & Rational' },
    { number: 2, label: 'Unit 2: Exponential & Log' },
    { number: 3, label: 'Unit 3: Trig & Polar' },
    { number: 4, label: 'Unit 4: Vectors & Matrices' },
  ];

  return (
    <div className="w-full overflow-x-auto pb-1 scrollbar-none">
      <div className="inline-flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl border border-slate-200">
        {units.map((u) => {
          const isActive = selectedUnit === u.number;
          return (
            <button
              key={u.label}
              onClick={() => onSelectUnit(u.number)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
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
