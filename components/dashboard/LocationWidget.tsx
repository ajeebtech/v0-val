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
  defaultData?: Partial<LocationData>;
};

export function LocationWidget({ defaultData = {} }: LocationWidgetProps) {
  const [locationData] = useState<LocationData>(() => ({
    location: 'Chennai, India',
    timezone: 'Asia/Kolkata',
    temperature: '30°C',
    weather: 'Sunny',
    date: new Date().toISOString(),
    ...defaultData
  }));

  return <Widget widgetData={locationData} />;
}