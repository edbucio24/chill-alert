package main

import(
	"encoding/json"
	"fmt"
	"net/http"
)

type openMeteoResponse struct{
	Current struct {
		Temperature2m   float64 `json:"temperature_2m"`
		Precipitation   float64 `json:"precipitation"`
		WindSpeed10m    float64 `json:"wind_speed_10m"`
		WeatherCode     int     `json:"weather_code"`
	} `json:"current"`
	Daily struct {
		Time              []string  `json:"time"`
		Temperature2mMax  []float64 `json:"temperature_2m_max"`
		Temperature2mMin  []float64 `json:"temperature_2m_min"`
	} `json:"daily"`
}

type WeatherResponse struct {
	StationID   string  `json:"stationId"`
	CurrentTemp float64 `json:"currentTemp"`
	Condition   string  `json:"condition"`
	Precip      float64 `json:"precip"`
	Wind        float64 `json:"wind"`
	TodayLow    float64 `json:"todayLow"`
	TodayHigh   float64 `json:"todayHigh"`
	RiskLevel   string  `json:"riskLevel"`
	Threshold   float64 `json:"threshold"`
}

const FROST = 32.0

unc codeToCondition(code int) string {
	switch {
	case code == 0:
		return "Sunny"
	case code == 1 || code == 2:
		return "Partly Cloudy"
	case code == 3:
		return "Cloudy"
	case code == 45 || code == 48:
		return "Foggy"
	case code >= 51 && code <= 82:
		return "Rainy"
	case code >= 71 && code <= 86:
		return "Snowy"
	case code >= 95:
		return "Stormy"
	default:
		return "Cloudy"
	}
}

func riskLevel(currentTemp float64) string {
	switch {
	case currentTemp <= frostThresholdF-4:
		return "critical"
	case currentTemp <= frostThresholdF:
		return "warning"
	case currentTemp <= frostThresholdF+4:
		return "watch"
	default:
		return "none"
	}
}

func fetchWeatherForStation(station *Station) (*WeatherResponse, error) {
	url := fmt.Sprintf(
		"https://api.open-meteo.com/v1/forecast?latitude=%f&longitude=%f&current=temperature_2m,precipitation,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto&forecast_days=1",
		station.Latitude, station.Longitude,
	)

	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("open-meteo returned status %d", resp.StatusCode)
	}

	var raw openMeteoResponse
	if err := json.NewDecoder(resp.Body).Decode(&raw); err != nil {
		return nil, err
	}

	currentTemp := raw.Current.Temperature2m

	return &WeatherResponse{
		StationID:   station.ID,
		CurrentTemp: currentTemp,
		Condition:   codeToCondition(raw.Current.WeatherCode),
		Precip:      raw.Current.Precipitation,
		Wind:        raw.Current.WindSpeed10m,
		TodayLow:    raw.Daily.Temperature2mMin[0],
		TodayHigh:   raw.Daily.Temperature2mMax[0],
		RiskLevel:   riskLevel(currentTemp),
		Threshold:   frostThresholdF,
	}, nil
}

