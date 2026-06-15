"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Cloud,
  Sun,
  CloudRain,
  Menu,
  X,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Haze,
  Sunrise,
  Sunset,
  Thermometer,
  Droplets,
  Gauge,
  Eye,
  Wind,
  CloudDrizzle,
  CloudSnow,
  CloudFog,
  Zap,
  Moon,
} from "lucide-react";
import {
  getCurrentGoogleMap,
  getCurrentOpenWeather,
  getCurrentOpenWeather2,
  getLocationFromIPInfo,
} from "./logics/weather";

// Weather Component
const Weather = () => {
  const [weatherData, setWeatherData] = useState<any | object>({});
  const [coordinates, setCoordinates] = useState<object>({});
  const [city, setCity] = useState<string>("");
  const [state, setState] = useState<string>("");

  async function fetchData() {
    const IPdata = await getLocationFromIPInfo();
    const lat = IPdata.loc.split(",")[0];
    const lon = IPdata.loc.split(",")[1];
    setCity(IPdata.city);
    setState(IPdata.region);
    // console.log("from IPinfo: ", IPdata);

    const weather1 = await getCurrentOpenWeather(lat, lon);
    setWeatherData(weather1);
    // console.log(weather1)
  }

  const sample = {
    coord: {
      lon: 85.1356,
      lat: 25.5941,
    },
    weather: [
      {
        id: 721,
        main: "Haze",
        description: "haze",
        icon: "50n",
      },
    ],
    base: "stations",
    main: {
      temp: 291.13,
      feels_like: 290.86,
      temp_min: 291.13,
      temp_max: 291.13,
      pressure: 1017,
      humidity: 72,
      sea_level: 1017,
      grnd_level: 1010,
    },
    visibility: 3000,
    wind: {
      speed: 2.06,
      deg: 280,
    },
    clouds: {
      all: 20,
    },
    dt: 1738244993,
    sys: {
      type: 1,
      id: 9129,
      country: "IN",
      sunrise: 1738200637,
      sunset: 1738240074,
    },
    timezone: 19800,
    id: 1260086,
    name: "Patna",
    cod: 200,
  };

  useEffect(() => {
    // setWeatherData(sample);
    fetchData();
  }, []);

  // Format time from Unix timestamp
  const formatTime = (timestamp: number, timezone: number) => {
    const date = new Date((timestamp + timezone) * 1000);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  // Calculate sun position
  const getSunPosition = () => {
    if (!weatherData?.dt || !weatherData?.sys) return 0;
    
    const currentTime = weatherData.dt;
    const sunrise = weatherData.sys.sunrise;
    const sunset = weatherData.sys.sunset;
    
    if (currentTime < sunrise || currentTime > sunset) {
      return -1; // Night time
    }
    
    const dayDuration = sunset - sunrise;
    const elapsed = currentTime - sunrise;
    const percentage = (elapsed / dayDuration) * 100;
    
    return Math.min(Math.max(percentage, 0), 100);
  };

  const sunPosition = getSunPosition();
  const isNight = sunPosition === -1;

  // Get weather icon component
  const getWeatherIcon = (iconCode: string) => {
    const mainWeather = weatherData?.weather?.[0]?.main?.toLowerCase();
    const size = 80;
    
    if (iconCode?.includes('01')) return <Sun className="text-yellow-400 animate-pulse" size={size} />;
    if (iconCode?.includes('02')) return <Cloud className="text-gray-300 animate-float" size={size} />;
    if (iconCode?.includes('03') || iconCode?.includes('04')) return <Cloud className="text-gray-400 animate-float" size={size} />;
    if (iconCode?.includes('09')) return <CloudDrizzle className="text-blue-400 animate-bounce-slow" size={size} />;
    if (iconCode?.includes('10')) return <CloudRain className="text-blue-500 animate-bounce-slow" size={size} />;
    if (iconCode?.includes('11')) return <Zap className="text-yellow-500 animate-pulse" size={size} />;
    if (iconCode?.includes('13')) return <CloudSnow className="text-blue-200 animate-float" size={size} />;
    if (iconCode?.includes('50')) return <CloudFog className="text-gray-500 animate-pulse" size={size} />;
    
    return <Sun className="text-yellow-400" size={size} />;
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          background-size: 1000px 100%;
          animation: shimmer 3s infinite;
        }
        .fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>

      <Card className="text-primary dark:text-foreground w-full backdrop-blur-xl bg-linear-to-br from-muted-foreground via-muted to-muted-foreground dark:from-primary-foreground dark:via-primary-foreground dark:to-secondary-foreground border-white/30 shadow-2xl overflow-hidden">
        {/* Background gradient overlay */}
        <div className="absolute inset-0  pointer-events-none" />
        
        <CardHeader className="relative z-10 pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold tracking-tight">
                {(city && state) ? `${city}, ${state}` : 'Loading...'}
              </div>
            </div>
            <div className="text-sm text-white/70 font-normal">
              {weatherData?.sys?.country || ""}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="relative z-10 space-y-6">
          {/* Main temperature and condition */}
          <div className="flex items-center justify-between fade-in">
            <div className="flex items-center gap-6">
              <div className="relative">
                {weatherData.weather?.[0]?.icon ? (
                  getWeatherIcon(weatherData.weather[0].icon)
                ) : (
                  <div className="w-20 h-20 bg-white/20 rounded-full animate-pulse" />
                )}
              </div>
              
              <div>
                <div className="text-7xl font-bold tracking-tight">
                  {weatherData?.main?.temp
                    ? `${Math.round(weatherData.main.temp - 273.15)}°`
                    : "..."}
                </div>
                <div className="text-xl text-white/90 capitalize mt-1">
                  {weatherData?.weather?.[0]?.description || "..."}
                </div>
                <div className="text-sm text-white/70 mt-1 flex items-center gap-2">
                  <Thermometer size={16} />
                  Feels like {weatherData?.main?.feels_like
                    ? `${Math.round(weatherData.main.feels_like - 273.15)}°C`
                    : "..."}
                </div>
              </div>
            </div>

            {/* High/Low temperatures */}
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-white/60 text-sm mb-1">High</div>
                <div className="text-3xl font-semibold text-red-300">
                  {weatherData?.main?.temp_max
                    ? `${Math.round(weatherData.main.temp_max - 273.15)}°`
                    : "..."}
                </div>
              </div>
              <div className="text-center">
                <div className="text-white/60 text-sm mb-1">Low</div>
                <div className="text-3xl font-semibold text-blue-300">
                  {weatherData?.main?.temp_min
                    ? `${Math.round(weatherData.main.temp_min - 273.15)}°`
                    : "..."}
                </div>
              </div>
            </div>
          </div>

          {/* Sunrise and Sunset Arc */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="relative">
              {/* Arc background */}
              <div className="h-32 relative group">
  <svg className="w-full h-full" viewBox="0 0 400 100">
    {/* Background arc - CHANGED TO STRAIGHT LINE */}
    <path
      d="M 20 100 L 380 100"
      fill="none"
      stroke="rgba(255,255,255,0.2)"
      strokeWidth="3"
    />
    {/* Active arc (daytime portion) - CHANGED TO STRAIGHT LINE */}
    {!isNight && (
      <path
        d="M 20 100 L 380 100"
        fill="none"
        stroke="url(#gradient)"
        strokeWidth="3"
        strokeDasharray="560"
        strokeDashoffset={560 - (560 * sunPosition) / 100}
        className="transition-all duration-1000"
      />
    )}
    
    {/* Gradient definition */}
    <defs>
      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="50%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#ef4444" />
      </linearGradient>
      <linearGradient id="nightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="50%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
    </defs>
    
    {/* Night arc - CHANGED TO STRAIGHT LINE */}
    {isNight && (
      <path
        d="M 20 100 L 380 100"
        fill="none"
        stroke="url(#nightGradient)"
        strokeWidth="3"
        opacity="0.5"
      />
    )}
  </svg>

  {/* Sun/Moon position indicator with hover tooltip */}
  <div
    className="absolute transition-all duration-1000 ease-in-out cursor-pointer group/icon"
    style={{
  left: !isNight 
    ? `${(20 + (360 * sunPosition) / 100) / 400 * 100}%`
    : '50%', // Moon stays in the center horizontally
    bottom: !isNight
    ? `0%` // Sun height (optional, remove if you want sun flat too)
    : '0%', // Moon sits on the line (bottom of SVG)
  transform: 'translate(-50%, 50%)',
}}
  >
    {/* Sun/Moon Icon */}
    <div className="relative">
      {isNight ? (
        <div className="bg-indigo-400/30 backdrop-blur-sm p-2 rounded-full border-2 border-indigo-300/50 shadow-lg shadow-indigo-500/50 hover:scale-110 transition-transform">
          <Moon className="text-white" size={24} />
        </div>
      ) : (
        <div className="bg-yellow-400/30 backdrop-blur-sm p-2 rounded-full border-2 border-yellow-300/50 shadow-lg shadow-yellow-500/50 hover:scale-110 transition-transform">
          <Sun className="text-yellow-300" size={24} />
        </div>
      )}
      
      {/* Tooltip showing current time */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/80 backdrop-blur-md text-white text-xs rounded-lg opacity-0 group-hover/icon:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-xl">
        <div className="font-semibold">
          {weatherData?.dt
            ? formatTime(weatherData.dt, weatherData.timezone)
            : "..."}
        </div>
        <div className="text-white/70 text-[10px]">Updated At</div>
        {/* Arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
          <div className="border-4 border-transparent border-t-black/80" />
        </div>
      </div>

      {/* Glow effect */}
      <div className={`absolute inset-0 rounded-full blur-md -z-10 ${
        isNight ? 'bg-indigo-400/40' : 'bg-yellow-400/40'
      } animate-pulse`} />
    </div>
  </div>
</div>

              {/* Sunrise and Sunset times */}
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-2">
                  <div className="bg-orange-500/20 p-2 rounded-full">
                    <Sunrise className="text-orange-400" size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-white/60">Sunrise</div>
                    <div className="text-sm font-semibold">
                      {weatherData?.sys?.sunrise
                        ? formatTime(weatherData.sys.sunrise, weatherData.timezone)
                        : "..."}
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-xs text-white/60">
                    {isNight ? "Night Time" : "Daylight"}
                  </div>
                  <div className="text-sm font-semibold">
                    {!isNight && `${Math.round(sunPosition)}%`}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div>
                    <div className="text-xs text-white/60 text-right">Sunset</div>
                    <div className="text-sm font-semibold">
                      {weatherData?.sys?.sunset
                        ? formatTime(weatherData.sys.sunset, weatherData.timezone)
                        : "..."}
                    </div>
                  </div>
                  <div className="bg-purple-500/20 p-2 rounded-full">
                    <Sunset className="text-purple-400" size={20} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Weather details grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 fade-in" style={{ animationDelay: '0.2s' }}>
            {/* Humidity */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <Droplets className="text-blue-400" size={20} />
                </div>
                <div>
                  <div className="text-xs text-white/60">Humidity</div>
                  <div className="text-lg font-semibold">
                    {weatherData?.main?.humidity
                      ? `${weatherData.main.humidity}%`
                      : "..."}
                  </div>
                </div>
              </div>
            </div>

            {/* Pressure */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500/20 p-2 rounded-lg">
                  <Gauge className="text-purple-400" size={20} />
                </div>
                <div>
                  <div className="text-xs text-white/60">Pressure</div>
                  <div className="text-lg font-semibold">
                    {weatherData?.main?.pressure
                      ? `${weatherData.main.pressure}`
                      : "..."}
                  </div>
                  <div className="text-xs text-white/50">hPa</div>
                </div>
              </div>
            </div>

            {/* Visibility */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3">
                <div className="bg-cyan-500/20 p-2 rounded-lg">
                  <Eye className="text-cyan-400" size={20} />
                </div>
                <div>
                  <div className="text-xs text-white/60">Visibility</div>
                  <div className="text-lg font-semibold">
                    {weatherData?.visibility
                      ? `${(weatherData.visibility / 1000).toFixed(1)}`
                      : "..."}
                  </div>
                  <div className="text-xs text-white/50">km</div>
                </div>
              </div>
            </div>

            {/* Wind */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3">
                <div className="bg-teal-500/20 p-2 rounded-lg">
                  <Wind className="text-teal-400" size={20} style={{ transform: `rotate(${weatherData?.wind?.deg || 0}deg)` }} />
                </div>
                <div>
                  <div className="text-xs text-white/60">Wind Speed</div>
                  <div className="text-lg font-semibold">
                    {weatherData?.wind?.speed
                      ? `${(weatherData.wind.speed * 3.6).toFixed(1)}`
                      : "..."}
                  </div>
                  <div className="text-xs text-white/50">km/h</div>
                </div>
              </div>
            </div>

            {/* Cloud Coverage */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3">
                <div className="bg-gray-500/20 p-2 rounded-lg">
                  <Cloud className="text-gray-400" size={20} />
                </div>
                <div>
                  <div className="text-xs text-white/60">Cloudiness</div>
                  <div className="text-lg font-semibold">
                    {weatherData?.clouds?.all !== undefined
                      ? `${weatherData.clouds.all}%`
                      : "..."}
                  </div>
                </div>
              </div>
            </div>

            {/* Sea Level Pressure */}
            {weatherData?.main?.sea_level && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-500/20 p-2 rounded-lg">
                    <Gauge className="text-indigo-400" size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-white/60">Sea Level</div>
                    <div className="text-lg font-semibold">
                      {weatherData.main.sea_level}
                    </div>
                    <div className="text-xs text-white/50">hPa</div>
                  </div>
                </div>
              </div>
            )}

            {/* Ground Level Pressure */}
            {weatherData?.main?.grnd_level && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-500/20 p-2 rounded-lg">
                    <Gauge className="text-amber-400" size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-white/60">Ground Level</div>
                    <div className="text-lg font-semibold">
                      {weatherData.main.grnd_level}
                    </div>
                    <div className="text-xs text-white/50">hPa</div>
                  </div>
                </div>
              </div>
            )}

            {/* Wind Direction */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/20 p-2 rounded-lg">
                  <Wind className="text-emerald-400" size={20} />
                </div>
                <div>
                  <div className="text-xs text-white/60">Wind Direction</div>
                  <div className="text-lg font-semibold">
                    {weatherData?.wind?.deg !== undefined
                      ? `${weatherData.wind.deg}°`
                      : "..."}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Last updated */}
          <div className="text-center text-xs text-white/50 pt-4 fade-in" style={{ animationDelay: '0.3s' }}>
            Last updated: {weatherData?.dt ? new Date(weatherData.dt * 1000).toLocaleString() : "..."}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Weather;