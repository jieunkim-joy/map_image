import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import type { SearchResult } from './types';

interface SearchBarProps {
  onSearchResult: (result: SearchResult) => void;
}

// 카카오맵 REST API 키 (Geocoding용)
const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY || '';

export function SearchBar({ onSearchResult }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // 검색어 입력 시 자동완성 (디바운싱 500ms)
  useEffect(() => {
    if (query.length >= 2) {
      setLoading(true);
      
      // 디바운싱: 500ms 후에 API 호출
      const timeoutId = setTimeout(() => {
        searchPlaces(query)
          .then((results) => {
            setSuggestions(results);
            setShowSuggestions(results.length > 0);
          })
          .catch((error) => {
            console.error('검색 실패:', error);
            setSuggestions([]);
            setShowSuggestions(false);
          })
          .finally(() => {
            setLoading(false);
          });
      }, 500);

      // cleanup: 이전 타이머 취소
      return () => {
        clearTimeout(timeoutId);
      };
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setLoading(false);
    }
  }, [query]);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 카카오맵 키워드 검색 API
  async function searchPlaces(keyword: string): Promise<SearchResult[]> {
    try {
      const response = await fetch(
        `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(keyword)}&size=10`,
        {
          headers: {
            Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('검색 실패');
      }

      const data = await response.json();
      
      return data.documents?.map((doc: any) => ({
        name: doc.place_name || doc.address_name,
        lat: parseFloat(doc.y) || 0,
        lng: parseFloat(doc.x) || 0,
        address: doc.address_name || doc.road_address_name || '',
      })) || [];
    } catch (error) {
      console.error('API 호출 실패:', error);
      return [];
    }
  }

  const handleSelectSuggestion = (result: SearchResult) => {
    setQuery(result.name);
    setShowSuggestions(false);
    onSearchResult(result);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        {/* 검색 아이콘 */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center z-10 pointer-events-none"
          style={{ 
            left: '16px',
            transform: 'translateY(-50%)'
          }}
        >
          <Search 
            className="text-gray-500" 
            style={{ width: '24px', height: '24px' }} 
            strokeWidth={2.5} 
          />
        </div>

        {/* 검색 입력 필드 - 모바일 최적화 */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="목적지를 검색하세요"
          className="w-full bg-white border-3 rounded-3xl shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all"
          style={{ 
            fontSize: '18px',
            fontWeight: 500,
            height: '56px',
            minHeight: '56px',
            paddingLeft: '52px',
            paddingRight: query ? '36px' : '20px',
            color: '#1f2937',
            letterSpacing: '-0.01em',
            borderColor: '#828382'
          }}
        />

        {/* 삭제 버튼 */}
        {query && (
          <button
            onClick={handleClear}
            className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors z-10"
            style={{ 
              right: '12px',
              width: '22px', 
              height: '22px',
              minWidth: '22px',
              minHeight: '22px',
              transform: 'translateY(-50%)'
            }}
            aria-label="검색어 지우기"
          >
            <X 
              className="text-gray-600" 
              style={{ width: '11px', height: '11px' }} 
              strokeWidth={3}
            />
          </button>
        )}
      </div>

      {/* 검색 제안 목록 */}
      {showSuggestions && (
        <div 
          className="absolute top-full left-0 right-0 bg-white border-2 border-gray-200 rounded-3xl shadow-2xl overflow-hidden z-50"
          style={{ 
            marginTop: '12px',
            maxHeight: '280px', 
            overflowY: 'auto' 
          }}
        >
          {loading && (
            <div 
              className="px-6 py-3 text-center text-gray-600"
              style={{ fontSize: '18px' }}
            >
              검색 중...
            </div>
          )}
          {!loading && suggestions.length === 0 && (
            <div 
              className="px-6 py-3 text-center text-gray-500"
              style={{ fontSize: '18px' }}
            >
              검색 결과가 없습니다
            </div>
          )}
          {!loading && suggestions.map((result, index) => (
            <button
              key={index}
              onClick={() => handleSelectSuggestion(result)}
              className="w-full text-left bg-white hover:bg-blue-50 active:bg-blue-100 transition-colors"
              style={{ 
                padding: '6px 20px',
                borderBottom: index < suggestions.length - 1 ? '1px solid #e5e7eb' : 'none'
              }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="flex-shrink-0 bg-blue-100 rounded-full"
                  style={{ padding: '8px' }}
                >
                  <Search 
                    className="text-blue-600" 
                    style={{ width: '12px', height: '10px' }} 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p 
                    className="text-gray-900 truncate"
                    style={{ fontSize: '18px', fontWeight: 600, lineHeight: '1' }}
                  >
                    {result.name}
                  </p>
                  <p 
                    className="text-gray-500 truncate"
                    style={{ fontSize: '15px', lineHeight: '1', marginTop: '1px' }}
                  >
                    {result.address}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
