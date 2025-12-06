import { Plus, Minus } from 'lucide-react';

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function ZoomControls({ onZoomIn, onZoomOut }: ZoomControlsProps) {
  return (
    <div className="absolute bottom-6 right-6 z-30 flex flex-col gap-3">
      {/* 확대 버튼 */}
      <button
        onClick={onZoomIn}
        className="bg-white rounded-3xl shadow-xl flex items-center justify-center active:scale-95 transition-all border-3 border-gray-100"
        style={{ 
          width: '64px', 
          height: '64px',
          minWidth: '64px',
          minHeight: '64px'
        }}
        aria-label="지도 확대"
      >
        <Plus 
          className="text-gray-700" 
          style={{ width: '32px', height: '32px' }} 
          strokeWidth={3}
        />
      </button>

      {/* 축소 버튼 */}
      <button
        onClick={onZoomOut}
        className="bg-white rounded-3xl shadow-xl flex items-center justify-center active:scale-95 transition-all border-3 border-gray-100"
        style={{ 
          width: '64px', 
          height: '64px',
          minWidth: '64px',
          minHeight: '64px'
        }}
        aria-label="지도 축소"
      >
        <Minus 
          className="text-gray-700" 
          style={{ width: '32px', height: '32px' }} 
          strokeWidth={3}
        />
      </button>
    </div>
  );
}
