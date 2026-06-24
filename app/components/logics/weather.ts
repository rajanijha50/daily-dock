const OPEN_WEATHER_API = process.env.NEXT_PUBLIC_WEATHER;

export function getGeoLoactionWebAPI(): Promise<GeolocationPosition | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser.");
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (res) => {
        // console.log("geo api: ", res.coords.latitude, res.coords.longitude);
        resolve(res);
      },
      (err) => {
        console.warn(`ERROR(${err.code}): ${err.message}`);
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  });
}

export async function getCurrentOpenWeather() {
  const geoLocation = await getGeoLoactionWebAPI();
  if (geoLocation && geoLocation.coords) {
    const lat = geoLocation.coords.latitude;
    const lon = geoLocation.coords.longitude;
    // console.log("searching with coordinates: ", lat, lon);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPEN_WEATHER_API}`,
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.warn("OpenWeatherMap error:", error);
    }
  }
}

