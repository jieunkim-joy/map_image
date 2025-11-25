import { HelpCircle, Navigation } from 'lucide-react';

interface MapControlsProps {
  onHowToUse: () => void;
  onGoToMyLocation: () => void;
}

export function MapControls({ onHowToUse, onGoToMyLocation }: MapControlsProps) {
  return (
    <div className="absolute bottom-6 left-6 z-30 flex flex-col gap-4">
      {/* 사용방법 버튼 */}
      <button
        onClick={onHowToUse}
        className="bg-white rounded-3xl shadow-xl flex items-center justify-center active:scale-95 transition-all border-3 border-gray-100"
        style={{ 
          width: '64px', 
          height: '64px',
          minWidth: '64px',
          minHeight: '64px'
        }}
        aria-label="사용방법"
      >
        <HelpCircle 
          className="text-gray-700" 
          style={{ width: '32px', height: '32px' }} 
          strokeWidth={2.5}
        />
      </button>

      {/* 현위치 버튼 */}
      <button
        onClick={onGoToMyLocation}
        className="bg-blue-600 rounded-3xl shadow-xl flex items-center justify-center active:scale-95 transition-all hover:bg-blue-700"
        style={{ 
          width: '64px', 
          height: '64px',
          minWidth: '64px',
          minHeight: '64px'
        }}
        aria-label="현위치"
      >
        <Navigation 
          className="text-white" 
          style={{ width: '32px', height: '32px' }} 
          strokeWidth={2.5}
        />
      </button>
    </div>
  );
}
