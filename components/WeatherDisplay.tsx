import React, { useState } from 'react';
import { WeatherData, ViewMode } from '../types';
import { WeatherIcon } from './WeatherIcon';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell } from 'recharts';
import { Wind, Droplets, Calendar, Clock, Link as LinkIcon, ExternalLink } from 'lucide-react';

interface WeatherDisplayProps {
  data: WeatherData;
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-xl border border-blue-100 text-xs z-50">
        <p className="font-bold text-gray-600 mb-1.5 border-b border-gray-100 pb-1">{label}</p>
        <div className="flex items-center gap-3">
            <WeatherIcon condition={data.condition} size={24} />
            <div className="flex flex-col">
                <span className="text-blue-600 font-bold text-lg leading-none">{data.temp}°</span>
                <span className="text-gray-500 font-medium">{data.condition}</span>
            </div>
        </div>
      </div>
    );
  }
  return null;
};

export const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ data }) => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Hourly);

  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-fade-in-up pb-6">
      {/* Current Weather Card */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <WeatherIcon condition={data.current.condition} size={120} className="text-white" />
        </div>
        
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-1">{data.locationName}</h2>
          <p className="text-blue-100 text-sm mb-6">{new Date().toLocaleDateString('ko-KR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-6xl font-bold tracking-tighter">{Math.round(data.current.temp)}°</span>
              <span className="text-lg font-medium opacity-90">{data.current.description}</span>
            </div>
            <div className="flex flex-col gap-2">
              <WeatherIcon condition={data.current.condition} size={64} className="text-white" />
            </div>
          </div>

          <div className="mt-6 flex justify-between bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Wind size={18} className="text-blue-200" />
              <span className="text-sm font-semibold">{data.current.windSpeed} m/s</span>
            </div>
            <div className="w-px bg-white/20 h-full"></div>
            <div className="flex items-center gap-2">
              <Droplets size={18} className="text-blue-200" />
              <span className="text-sm font-semibold">{data.current.humidity}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Controls */}
      <div className="bg-white/60 p-1.5 rounded-xl flex shadow-sm backdrop-blur-sm">
        <button
          onClick={() => setViewMode(ViewMode.Hourly)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
            viewMode === ViewMode.Hourly
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Clock size={16} />
          시간별
        </button>
        <button
          onClick={() => setViewMode(ViewMode.Weekly)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
            viewMode === ViewMode.Weekly
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Calendar size={16} />
          주간별
        </button>
      </div>

      {/* Chart Section */}
      <div className="bg-white/80 rounded-3xl p-6 shadow-lg backdrop-blur-sm">
        <h3 className="text-gray-800 font-bold mb-4 flex items-center gap-2">
            {viewMode === ViewMode.Hourly ? '시간별 기온 변화' : '주간 예보'}
        </h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === ViewMode.Hourly ? (
              <AreaChart data={data.hourly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                    dataKey="time" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 11, fill: '#6b7280'}}
                    interval={3} 
                    padding={{ left: 10, right: 10 }}
                />
                <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                    type="monotone" 
                    dataKey="temp" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorTemp)" 
                />
              </AreaChart>
            ) : (
              <BarChart data={data.weekly} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 12, fill: '#6b7280'}}
                />
                 <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip 
                     cursor={{fill: 'transparent'}}
                     contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="maxTemp" radius={[4, 4, 0, 0]} name="최고">
                    {data.weekly.map((entry, index) => (
                        <Cell key={`cell-max-${index}`} fill="#f87171" />
                    ))}
                </Bar>
                <Bar dataKey="minTemp" radius={[4, 4, 0, 0]} name="최저">
                     {data.weekly.map((entry, index) => (
                        <Cell key={`cell-min-${index}`} fill="#60a5fa" />
                    ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed List */}
      <div className="bg-white/80 rounded-3xl p-6 shadow-lg backdrop-blur-sm">
         <h3 className="text-gray-800 font-bold mb-4">
            {viewMode === ViewMode.Hourly ? '상세 시간별 날씨' : '상세 주간 날씨'}
        </h3>
        <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {viewMode === ViewMode.Hourly ? (
                data.hourly.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors">
                        <span className="w-16 font-medium text-gray-600">{item.time}</span>
                        <div className="flex items-center gap-3 flex-1 justify-center">
                            <WeatherIcon condition={item.condition} size={20} />
                            <span className="text-sm text-gray-500 hidden sm:block w-20 text-center">{item.condition}</span>
                        </div>
                        <span className="w-12 text-right font-bold text-gray-800">{item.temp}°</span>
                    </div>
                ))
            ) : (
                data.weekly.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors">
                        <span className="w-16 font-medium text-gray-600">{item.day}</span>
                        <div className="flex items-center gap-3 flex-1 justify-center">
                            <WeatherIcon condition={item.condition} size={20} />
                        </div>
                        <div className="w-24 text-right flex justify-end gap-2">
                             <span className="font-bold text-red-400">{item.maxTemp}°</span>
                             <span className="font-bold text-blue-400">{item.minTemp}°</span>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>

      {/* Sources / Grounding */}
      {data.sources && data.sources.length > 0 && (
        <div className="bg-white/60 rounded-xl p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3 text-gray-500 border-b border-gray-200/50 pb-2">
            <LinkIcon size={14} className="text-blue-500" />
            <span className="text-xs font-bold text-gray-500">날씨 정보 출처</span>
          </div>
          <div className="flex flex-col gap-2">
            {data.sources.map((source, idx) => (
              <a 
                key={idx} 
                href={source.uri} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 text-xs text-gray-600 hover:text-blue-600 transition-colors bg-white/50 p-2 rounded-lg hover:bg-blue-50 border border-transparent hover:border-blue-100 group"
              >
                <div className="bg-blue-100 p-1 rounded-full text-blue-500 group-hover:bg-blue-200 transition-colors">
                    <ExternalLink size={10} />
                </div>
                <span className="truncate flex-1">{source.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};