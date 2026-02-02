import React from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudSun } from 'lucide-react';
import { WeatherCondition } from '../types';

interface WeatherIconProps {
  condition: string;
  className?: string;
  size?: number;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ condition, className = "", size = 24 }) => {
  // Normalize string to match enum
  const normalizedCondition = Object.values(WeatherCondition).find(
    c => c.toLowerCase() === condition.toLowerCase()
  ) || WeatherCondition.Sunny;

  switch (normalizedCondition) {
    case WeatherCondition.Sunny:
      return <Sun size={size} className={`text-yellow-500 ${className}`} />;
    case WeatherCondition.Cloudy:
      return <Cloud size={size} className={`text-gray-400 ${className}`} />;
    case WeatherCondition.Rainy:
      return <CloudRain size={size} className={`text-blue-400 ${className}`} />;
    case WeatherCondition.Snowy:
      return <CloudSnow size={size} className={`text-cyan-200 ${className}`} />;
    case WeatherCondition.Stormy:
      return <CloudLightning size={size} className={`text-purple-500 ${className}`} />;
    case WeatherCondition.PartlyCloudy:
      return <CloudSun size={size} className={`text-orange-300 ${className}`} />;
    default:
      return <Sun size={size} className={`text-yellow-500 ${className}`} />;
  }
};