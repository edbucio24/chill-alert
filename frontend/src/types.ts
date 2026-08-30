export interface Station{
    id: string;
    name: string;
    county: string
}

export type Measurement = 'Temperature' | 'Dew Point' | 'Wind Speed' | 'Precipitation'

export const measurementOptions: { value: Measurement; label: string }[] = [
  { value: 'Temperature', label: 'Temperature' },
  { value: 'Dew Point', label: 'Dew Point' },
  { value: 'Wind Speed', label: 'Wind Speed' },
  { value: 'Precipitation', label: 'Precipitation' },
]