"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LuCloud,
  LuSun,
  LuCloudRain,
  LuSunrise,
  LuSunset,
  LuThermometer,
  LuDroplets,
  LuGauge,
  LuEye,
  LuWind,
  LuCloudDrizzle,
  LuCloudSnow,
  LuCloudFog,
  LuZap,
  LuMoon,
} from "react-icons/lu";
import { getCurrentOpenWeather } from "./logics/weather";

// Weather Component
const Weather = () => {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const weather = await getCurrentOpenWeather();
        if (weather && weather.cod === 200) {
          setWeatherData(weather);
        } else {
          setWeatherData(null);
        }
      } catch (error) {
        console.error("Failed to fetch weather data:", error);
        setWeatherData(null);
      } finally {
        setLoading(false);
      }
    }
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

  // Convert wind degree to direction symbol
  const getWindDirection = (deg: number) => {
    const directions = [
      "N",
      "NE",
      "E",
      "SE",
      "S",
      "SW",
      "W",
      "NW",
    ];
    return directions[Math.round(deg / 22.5) % 8];
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

  // Calculate moon position during night time (0 to 100)
  const getMoonPosition = () => {
    if (!weatherData?.dt || !weatherData?.sys) return 0;

    const currentTime = weatherData.dt;
    const sunrise = weatherData.sys.sunrise;
    const sunset = weatherData.sys.sunset;

    // If it is daytime, it shouldn't show progression
    if (currentTime >= sunrise && currentTime <= sunset) {
      return 0;
    }

    let nightDuration = 0;
    let elapsed = 0;

    if (currentTime > sunset) {
      // Night time after sunset
      const tomorrowSunrise = sunrise + 24 * 3600;
      nightDuration = tomorrowSunrise - sunset;
      elapsed = currentTime - sunset;
    } else {
      // Night time before sunrise (early morning)
      const yesterdaySunset = sunset - 24 * 3600;
      nightDuration = sunrise - yesterdaySunset;
      elapsed = currentTime - yesterdaySunset;
    }

    const percentage = (elapsed / nightDuration) * 100;
    return Math.min(Math.max(percentage, 0), 100);
  };

  const sunPosition = getSunPosition();
  const isNight = sunPosition === -1;
  const moonPosition = isNight ? getMoonPosition() : 0;

  // Get weather icon component
  const getWeatherIcon = (iconCode: string) => {
    const size = 80;

    if (iconCode?.includes("01"))
      return <LuSun className="text-yellow-400 animate-pulse" size={size} />;
    if (iconCode?.includes("02"))
      return <LuCloud className="text-gray-300 animate-float" size={size} />;
    if (iconCode?.includes("03") || iconCode?.includes("04"))
      return <LuCloud className="text-gray-400 animate-float" size={size} />;
    if (iconCode?.includes("09"))
      return (
        <LuCloudDrizzle
          className="text-blue-400 animate-bounce-slow"
          size={size}
        />
      );
    if (iconCode?.includes("10"))
      return (
        <LuCloudRain className="text-blue-500 animate-bounce-slow" size={size} />
      );
    if (iconCode?.includes("11"))
      return <LuZap className="text-yellow-500 animate-pulse" size={size} />;
    if (iconCode?.includes("13"))
      return <LuCloudSnow className="text-blue-200 animate-float" size={size} />;
    if (iconCode?.includes("50"))
      return <LuCloudFog className="text-gray-500 animate-pulse" size={size} />;

    return <LuSun className="text-yellow-400" size={size} />;
  };

  // 1. If loading, show a clean loading indicator skeleton
  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card className="text-primary dark:text-foreground w-full backdrop-blur-xl bg-linear-to-br from-muted-foreground via-muted to-muted-foreground dark:from-primary-foreground dark:via-primary-foreground dark:to-secondary-foreground border-white/30 shadow-2xl overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col justify-center items-center gap-4">
              <div className="w-10 h-10 border-4 border-t-yellow-400 border-white/20 rounded-full animate-spin" />
              <div className="text-lg font-medium tracking-tight opacity-85">
                Fetching Local Weather...
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 2. If not loading and no weather data is available, do not render the component
  if (!weatherData || !weatherData.main || !weatherData.sys) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        .animate-shimmer {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          background-size: 1000px 100%;
          animation: shimmer 3s infinite;
        }
        .fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>

      <Card className="text-primary dark:text-foreground w-full backdrop-blur-xl bg-linear-to-tr from-accent to-muted-foreground dark:from-muted dark:to-primary-foreground border-white/30 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" />

        <CardHeader className="relative z-10 pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold tracking-tight">
                {weatherData.name}
              </div>
            </div>
            <div className="text-sm font-normal">
              {weatherData.sys.country || ""}
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
                  <LuThermometer size={16} />
                  Feels like{" "}
                  {weatherData?.main?.feels_like
                    ? `${Math.round(weatherData.main.feels_like - 273.15)}°C`
                    : "..."}
                </div>
              </div>
            </div>

            {/* High/Low temperatures */}
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-sm mb-1">High</div>
                <div className="text-3xl font-semibold text-red-300">
                  {weatherData?.main?.temp_max
                    ? `${Math.round(weatherData.main.temp_max - 273.15)}°`
                    : "..."}
                </div>
              </div>
              <div className="text-center">
                <div className=" text-sm mb-1">Low</div>
                <div className="text-3xl font-semibold text-blue-300">
                  {weatherData?.main?.temp_min
                    ? `${Math.round(weatherData.main.temp_min - 273.15)}°`
                    : "..."}
                </div>
              </div>
            </div>
          </div>

          {/* Sunrise and Sunset Arc Container */}
          <div
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="relative">
              {/* Arc / Straight Line background */}
              <div className="h-24 relative group flex items-center">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 400 100"
                  preserveAspectRatio="none"
                >
                  {/* Background line - vertically centered at y=50 */}
                  <path
                    d="M 20 50 L 380 50"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="3"
                  />

                  {/* Active line (daytime portion) - vertically centered at y=50 */}
                  {!isNight && (
                    <path
                      d={`M 20 50 L ${20 + (360 * sunPosition) / 100} 50`}
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="3"
                      className="transition-all duration-1000"
                    />
                  )}

                  {/* Gradient definition */}
                  <defs>
                    <linearGradient
                      id="gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                    <linearGradient
                      id="nightGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>

                  {/* Night line - vertically centered at y=50 */}
                  {isNight && (
                    <path
                      d={`M 20 50 L ${20 + (360 * moonPosition) / 100} 50`}
                      fill="none"
                      stroke="url(#nightGradient)"
                      strokeWidth="3"
                      opacity="0.8"
                      className="transition-all duration-1000"
                    />
                  )}
                </svg>

                {/* Sun/Moon position indicator with hover tooltip - centered vertically at top: 50% */}
                <div
                  className="absolute transition-all duration-1000 ease-in-out cursor-pointer group/icon"
                  style={{
                    left: !isNight
                      ? `${((20 + (360 * sunPosition) / 100) / 400) * 100}%`
                      : `${((20 + (360 * moonPosition) / 100) / 400) * 100}%`,
                    top: "50%", // Vertically centered on the line
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {/* Sun/Moon Icon */}
                  <div className="relative">
                    {isNight ? (
                      <div className="bg-indigo-400/30 backdrop-blur-sm p-2 rounded-full border-2 border-indigo-300/50 shadow-lg shadow-indigo-500/50 hover:scale-110 transition-transform">
                        <LuMoon className="text-white" size={24} />
                      </div>
                    ) : (
                      <div className="bg-yellow-400/30 backdrop-blur-sm p-2 rounded-full border-2 border-yellow-300/50 shadow-lg shadow-yellow-500/50 hover:scale-110 transition-transform">
                        <LuSun className="text-yellow-300" size={24} />
                      </div>
                    )}

                    {/* Tooltip showing current time */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/80 backdrop-blur-md text-white text-xs rounded-lg opacity-0 group-hover/icon:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-xl">
                      <div className="font-semibold">
                        {formatTime(weatherData.dt, weatherData.timezone)}
                      </div>
                      <div className="text-white/70 text-[10px]">
                        Updated At
                      </div>
                      {/* Arrow */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                        <div className="border-4 border-transparent border-t-black/80" />
                      </div>
                    </div>

                    {/* Glow effect */}
                    <div
                      className={`absolute inset-0 rounded-full blur-md -z-10 ${
                        isNight ? "bg-indigo-400/40" : "bg-yellow-400/40"
                      } animate-pulse`}
                    />
                  </div>
                </div>
              </div>

              {/* Sunrise and Sunset times */}
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-2">
                  <div className="bg-orange-500/20 p-2 rounded-full">
                    <LuSunrise className="text-orange-400" size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-white/60">Sunrise</div>
                    <div className="text-sm font-semibold">
                      {formatTime(
                        weatherData.sys.sunrise,
                        weatherData.timezone,
                      )}
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
                    <div className="text-xs text-white/60 text-right">
                      Sunset
                    </div>
                    <div className="text-sm font-semibold">
                      {formatTime(weatherData.sys.sunset, weatherData.timezone)}
                    </div>
                  </div>
                  <div className="bg-orange-500/20 p-2 rounded-full">
                    <LuSunset className="text-orange-400" size={20} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Weather details grid */}
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            {/* Humidity */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <LuDroplets className="text-blue-400" size={20} />
                </div>
                <div>
                  <div className="text-xs text-white/60">Humidity</div>
                  <div className="text-lg font-semibold">
                    {weatherData.main.humidity}%
                  </div>
                </div>
              </div>
            </div>

            {/* Pressure */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500/20 p-2 rounded-lg">
                  <LuGauge className="text-purple-400" size={20} />
                </div>
                <div>
                  <div className="text-xs text-white/60">Pressure</div>
                  <div className="text-lg font-semibold">
                    {weatherData.main.pressure}
                  </div>
                  <div className="text-xs text-white/50">hPa</div>
                </div>
              </div>
            </div>

            {/* Visibility */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3">
                <div className="bg-cyan-500/20 p-2 rounded-lg">
                  <LuEye className="text-cyan-400" size={20} />
                </div>
                <div>
                  <div className="text-xs text-white/60">Visibility</div>
                  <div className="text-lg font-semibold">
                    {(weatherData.visibility / 1000).toFixed(1)}
                  </div>
                  <div className="text-xs text-white/50">km</div>
                </div>
              </div>
            </div>

            {/* Wind */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3">
                <div className="bg-teal-500/20 p-2 rounded-lg">
                  <LuWind
                    className="text-teal-400"
                    size={20}
                    style={{
                      transform: `rotate(${weatherData.wind?.deg || 0}deg)`,
                    }}
                  />
                </div>
                <div>
                  <div className="text-xs text-white/60">Wind Speed</div>
                  <div className="text-lg font-semibold">
                    {weatherData.wind?.speed
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
                  <LuCloud className="text-gray-400" size={20} />
                </div>
                <div>
                  <div className="text-xs text-white/60">Cloudiness</div>
                  <div className="text-lg font-semibold">
                    {weatherData.clouds?.all}%
                  </div>
                </div>
              </div>
            </div>

            {/* Sea Level Pressure */}
            {weatherData.main.sea_level && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-500/20 p-2 rounded-lg">
                    <LuGauge className="text-indigo-400" size={20} />
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
            {weatherData.main.grnd_level && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-500/20 p-2 rounded-lg">
                    <LuGauge className="text-amber-400" size={20} />
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
                  <LuWind className="text-emerald-400" size={20} />
                </div>
                <div>
                  <div className="text-xs text-white/60">Wind Direction</div>
                  <div className="text-lg font-semibold">
                    {weatherData.wind?.deg !== undefined
                      ? `${getWindDirection(weatherData.wind.deg)} (${weatherData.wind.deg}°)`
                      : "..."}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Last updated */}
          <div
            className="text-center text-xs text-white/50 pt-4 fade-in"
          >
            Last updated: {new Date(weatherData.dt * 1000).toLocaleDateString("en-IN", { dateStyle: "medium" })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Weather;
