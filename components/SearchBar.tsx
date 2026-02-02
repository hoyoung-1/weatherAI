import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, LocateFixed, Loader2 } from 'lucide-react';
import { getCitySuggestions } from '../services/geminiService';

interface SearchBarProps {
  onSearch: (location: string) => void;
  isLoading: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      // Don't fetch suggestions if it looks like coordinates or if query is too short
      if (query.length > 1 && !query.includes('latitude')) {
        const results = await getCitySuggestions(query);
        setSuggestions(results);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    // Debounce
    const timeoutId = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (location: string) => {
    setQuery(location);
    onSearch(location);
    setShowSuggestions(false);
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("이 브라우저에서는 위치 서비스를 지원하지 않습니다.");
      return;
    }

    setIsLocating(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationQuery = `latitude: ${latitude}, longitude: ${longitude}`;
        // We set the query to something friendly for the UI, but pass coords to onSearch
        setQuery("현위치 (확인 중...)");
        onSearch(locationQuery);
        setIsLocating(false);
        setShowSuggestions(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("위치 정보를 가져오는 데 실패했습니다. 권한을 확인해주세요.");
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  return (
    <div ref={wrapperRef} className="relative w-full z-50">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="지역을 입력하세요 (예: 서울, 강남구)"
          className="w-full pl-12 pr-12 py-3 rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm border border-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 placeholder-gray-400 transition-all"
          disabled={isLoading || isLocating}
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        
        <button
          type="button"
          onClick={handleCurrentLocation}
          disabled={isLoading || isLocating}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-xl hover:bg-blue-100 text-blue-500 transition-colors disabled:opacity-50"
          title="현위치 검색"
        >
          {isLocating ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <LocateFixed size={20} />
          )}
        </button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/50 overflow-hidden animate-fade-in">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center gap-2 text-gray-700"
            >
              <MapPin size={16} className="text-blue-400" />
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};