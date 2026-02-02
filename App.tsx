import React, { useState, useEffect } from 'react';
import { SearchBar } from './components/SearchBar';
import { WeatherDisplay } from './components/WeatherDisplay';
import { getWeatherData } from './services/geminiService';
import { WeatherData } from './types';
import { CloudSun } from 'lucide-react';

const App: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Initial load with a default city
  useEffect(() => {
    handleSearch('서울');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (location: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWeatherData(location);
      setWeatherData(data);
      setInitialized(true);
    } catch (err: unknown) {
      console.error("Search failed:", err);
      let errorMessage = "날씨 정보를 가져오는데 실패했습니다. 잠시 후 다시 시도해주세요.";

      if (err instanceof Error) {
        // Categorize errors based on message content or type
        if (err.message.includes("No data returned") || err.message.includes("JSON")) {
          errorMessage = "해당 지역의 날씨 정보를 찾을 수 없습니다. 정확한 지역명을 입력해주세요.";
        } else if (err.message.includes("fetch failed") || err.message.includes("Network")) {
          errorMessage = "네트워크 연결 상태를 확인해주세요.";
        } else if (err.message.includes("429")) {
          errorMessage = "요청 횟수가 너무 많습니다. 잠시 후 다시 시도해주세요.";
        } else if (err.message.includes("400")) {
          errorMessage = "잘못된 요청입니다. 입력값을 확인해주세요.";
        } else if (err.message.includes("401") || err.message.includes("403")) {
          errorMessage = "API 인증 오류가 발생했습니다. 관리자에게 문의하세요.";
        } else if (err.message.includes("500") || err.message.includes("503")) {
          errorMessage = "서버에 일시적인 문제가 발생했습니다. 나중에 다시 시도해주세요.";
        } else if (err.message.includes("Safety")) {
          errorMessage = "안전 정책에 의해 요청이 차단되었습니다.";
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] min-h-[850px] bg-[#f0f4f8] sm:rounded-[3rem] sm:shadow-2xl overflow-hidden relative border-4 border-slate-200">
        
        {/* Status Bar Imitation */}
        <div className="h-8 w-full bg-[#f0f4f8] flex justify-between items-center px-6 pt-2">
            <div className="text-xs font-bold text-gray-400">9:41</div>
            <div className="flex gap-1.5">
                <div className="w-4 h-2.5 bg-gray-300 rounded-sm"></div>
                <div className="w-4 h-2.5 bg-gray-300 rounded-sm"></div>
                <div className="w-5 h-2.5 bg-gray-800 rounded-sm"></div>
            </div>
        </div>

        {/* Content Container */}
        <div className="h-[calc(100%-2rem)] overflow-y-auto no-scrollbar pb-8">
            <header className="px-6 pt-6 pb-2">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                        <CloudSun size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">WeatherAI</h1>
                </div>
                
                <SearchBar onSearch={handleSearch} isLoading={loading} />
            </header>

            <main className="px-6 py-4">
                {error && (
                    <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-medium mb-4 text-center border border-red-100 shadow-sm">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                        <p className="text-gray-500 font-medium animate-pulse">AI가 날씨를 분석중입니다...</p>
                    </div>
                ) : weatherData ? (
                    <WeatherDisplay data={weatherData} />
                ) : (
                    !initialized && !error && (
                        <div className="text-center py-20 text-gray-400">
                            지역을 검색하여 날씨를 확인하세요.
                        </div>
                    )
                )}
            </main>
        </div>
      </div>
    </div>
  );
};

export default App;