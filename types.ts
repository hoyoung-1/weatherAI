export enum WeatherCondition {
  Sunny = "Sunny",
  Cloudy = "Cloudy",
  Rainy = "Rainy",
  Snowy = "Snowy",
  Stormy = "Stormy",
  PartlyCloudy = "PartlyCloudy"
}

export interface HourlyForecast {
  time: string; // "14:00"
  temp: number;
  condition: string;
}

export interface WeeklyForecast {
  day: string; // "월", "화"
  maxTemp: number;
  minTemp: number;
  condition: string;
}

export interface CurrentWeather {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  description: string;
}

export interface WeatherSource {
  title: string;
  uri: string;
}

export interface WeatherData {
  locationName: string;
  current: CurrentWeather;
  hourly: HourlyForecast[];
  weekly: WeeklyForecast[];
  sources?: WeatherSource[];
}

export enum ViewMode {
  Hourly = "HOURLY",
  Weekly = "WEEKLY"
}