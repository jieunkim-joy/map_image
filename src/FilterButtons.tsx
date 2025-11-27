import type { FilterOptions } from './types';

interface FilterButtonsProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

export function FilterButtons({ filters, onFiltersChange }: FilterButtonsProps) {
  const toggleFilter = (key: keyof FilterOptions) => {
    onFiltersChange({
      ...filters,
      [key]: !filters[key],
    });
  };

  const filterItems = [
    { key: 'parkingFree' as const, label: '주차무료' },
    { key: 'firstFloor' as const, label: '지상' },
    { key: 'highSpeed' as const, label: '100kW 이상' },
  ];

  return (
    <div 
      className="flex"
      style={{ gap: '12px' }}
    >
      {filterItems.map((item) => {
        const isActive = filters[item.key];
        return (
          <button
            key={item.key}
            onClick={() => toggleFilter(item.key)}
            className="flex-1 rounded-2xl shadow-lg transition-all active:scale-95"
            style={{
              fontSize: '17px',
              fontWeight: 600,
              minHeight: '52px',
              height: '52px',
              backgroundColor: isActive ? '#2563eb' : '#ffffff',
              color: isActive ? '#ffffff' : '#374151',
              border: isActive ? 'none' : '3px solid #e5e7eb',
              boxShadow: isActive 
                ? '0 8px 12px -3px rgba(37, 99, 235, 0.3), 0 4px 6px -4px rgba(37, 99, 235, 0.3)' 
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
              whiteSpace: 'nowrap', // 텍스트 줄바꿈 방지
            }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
