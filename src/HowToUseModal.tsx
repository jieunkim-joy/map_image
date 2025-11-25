import { X } from 'lucide-react';

interface HowToUseModalProps {
  onClose: () => void;
}

export function HowToUseModal({ onClose }: HowToUseModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b px-6 py-5 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-2xl">사용 방법</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <X className="size-7" />
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6 space-y-6">
          {/* 1. 검색 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center text-xl shrink-0">
                1
              </div>
              <h3 className="text-xl">목적지 검색</h3>
            </div>
            <p className="text-lg text-gray-600 pl-13">
              상단 검색창에 가고 싶은 장소를 입력하세요. 검색 결과를 선택하면 가까운 충전소가 자동으로 표시됩니다.
            </p>
          </div>

          {/* 2. 필터 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center text-xl shrink-0">
                2
              </div>
              <h3 className="text-xl">조건으로 필터</h3>
            </div>
            <p className="text-lg text-gray-600 pl-13">
              주차무료, 지상, 초급속 버튼을 눌러 원하는 조건의 충전소만 볼 수 있습니다.
            </p>
          </div>

          {/* 3. 핀 확인 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center text-xl shrink-0">
                3
              </div>
              <h3 className="text-xl">핀 색상 확인</h3>
            </div>
            <div className="pl-13 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full border-4 border-green-600 shrink-0" />
                <p className="text-lg text-gray-600">초록색 = 충전 가능</p>
              </div>
              <p className="text-lg text-red-600 font-bold">빨간색 가격 = 최저가!</p>
            </div>
          </div>

          {/* 4. 상세 정보 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center text-xl shrink-0">
                4
              </div>
              <h3 className="text-xl">핀 클릭</h3>
            </div>
            <p className="text-lg text-gray-600 pl-13">
              지도의 핀을 클릭하면 충전소의 자세한 정보와 길안내 버튼이 나타납니다.
            </p>
          </div>

          {/* 5. 현위치 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center text-xl shrink-0">
                5
              </div>
              <h3 className="text-xl">현위치 버튼</h3>
            </div>
            <p className="text-lg text-gray-600 pl-13">
              왼쪽 하단의 나침반 버튼을 누르면 내 위치로 지도가 이동합니다.
            </p>
          </div>
        </div>

        {/* 확인 버튼 */}
        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className="w-full bg-green-600 text-white py-5 rounded-2xl text-xl hover:bg-green-700 active:bg-green-800 transition-colors shadow-lg"
            style={{ minHeight: '60px' }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

