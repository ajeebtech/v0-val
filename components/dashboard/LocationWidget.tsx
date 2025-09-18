'use client';

import { useEffect, useState } from 'react';
import Widget from './widget';

type LocationData = {
  location: string;
  timezone: string;
  temperature: string;
  weather: string;
  date: string;
};

type LocationWidgetProps = {
  defaultData: LocationData;
};

export function LocationWidget({ defaultData }: LocationWidgetProps) {
  const [locationData, setLocationData] = useState<LocationData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocationData = async () => {
      if (!navigator.geolocation) {
        console.log('Geolocation is not supported by your browser');
        setIsLoading(false);
        return;
      }

      const success = async (position: GeolocationPosition) => {
        try {
          const { latitude, longitude } = position.coords;
          console.log('Got coordinates:', { latitude, longitude });
          
          let city = 'Unknown';
          let country = '';
          let timezone = 'Local Time';
          
          try {
            // Using OpenStreetMap Nominatim for reverse geocoding
            // Note: In production, you should use a proper geocoding service with an API key
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
              {
                headers: {
                  'User-Agent': 'YourAppName/1.0 (your@email.com)' // Required by Nominatim
                }
              }
            );
            
            if (response.ok) {
              const data = await response.json();
              city = data.address?.city || data.address?.town || data.address?.village || 'Unknown';
              country = data.address?.country || '';
              console.log('Location data:', { city, country });
            } else {
              console.warn('Failed to fetch location data, using coordinates instead');
              city = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
            }
            
            // Try to get timezone from browser
            try {
              timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local Time';
            } catch (e) {
              console.warn('Could not get timezone from browser');
            }
            
            setLocationData({
              location: `${city}${country ? `, ${country}` : ''}`,
              timezone: timezone,
              temperature: 'N/A',
              weather: 'Unknown',
              date: new Date().toISOString()
            });
            
          } catch (err) {
            console.error('Error in geocoding request:', err);
            // Fall back to coordinates if geocoding fails
            setLocationData({
              location: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
              timezone: 'Local Time',
              temperature: 'N/A',
              weather: 'Unknown',
              date: new Date().toISOString()
            });
          }
          
        } catch (err) {
          console.error('Error processing location data:', err);
          setError('Error processing location');
        } finally {
          setIsLoading(false);
        }
      };

      const error = (err: GeolocationPositionError) => {
        console.warn('Geolocation error:', err.message);
        setError('Location access was denied or not available');
        setIsLoading(false);
      };

      // Request location with a timeout
      navigator.geolocation.getCurrentPosition(
        success,
        error,
        {
          enableHighAccuracy: true,
          timeout: 5000, // 5 seconds timeout
          maximumAge: 0
        }
      );
    };

    fetchLocationData();
  }, []);

  if (isLoading) {
    return <Widget widgetData={defaultData} />;
  }

  if (error) {
    console.error('Location error:', error);
    return <Widget widgetData={defaultData} />;
  }

  return <Widget widgetData={locationData} />;
}
