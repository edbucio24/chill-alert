package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type openMeteoResponse struct {
	Current struct {
		Temperature2m float64 `json:"temperature_2m"`
		Precipitation float64 `json:"precipitation"`
		WindSpeed10m  float64 `json:"wind_speed_10m"`
		WeatherCode   int     `json:"weather_code"`
	} `json:"current"`
	Daily struct {
		Time             []string  `json:"time"`
		Temperature2mMax []float64 `json:"temperature_2m_max"`
		Temperature2mMin []float64 `json:"temperature_2m_min"`
		WeatherCode      []int     `json:"weather_code"`
	} `json:"daily"`
}

type ForecastDay struct {
	Day       string  `json:"day"`
	Condition string  `json:"condition"`
	Low       float64 `json:"low"`
	High      float64 `json:"high"`
}

type WeatherResponse struct {
	StationID   string        `json:"stationId"`
	CurrentTemp float64       `json:"currentTemp"`
	Condition   string        `json:"condition"`
	Precip      float64       `json:"precip"`
	Wind        float64       `json:"wind"`
	TodayLow    float64       `json:"todayLow"`
	TodayHigh   float64       `json:"todayHigh"`
	RiskLevel   string        `json:"riskLevel"`
	Threshold   float64       `json:"threshold"`
	Forecast    []ForecastDay `json:"forecast"`
}

const frostThresholdF = 32.0

func codeToCondition(code int) string {
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
		"https://api.open-meteo.com/v1/forecast?latitude=%f&longitude=%f&current=temperature_2m,precipitation,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto&forecast_days=4",
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

	dayNames := map[string]string{}
	weekdayNames := []string{"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"}

	var forecast []ForecastDay
	for i := 1; i < len(raw.Daily.Time) && i <= 3; i++ {
		dateStr := raw.Daily.Time[i]
		label, ok := dayNames[dateStr]
		if !ok {
			t, parseErr := parseISODate(dateStr)
			if parseErr == nil {
				label = weekdayNames[int(t.Weekday())]
			} else {
				label = dateStr
			}
		}
		forecast = append(forecast, ForecastDay{
			Day:       label,
			Condition: codeToCondition(raw.Daily.WeatherCode[i]),
			Low:       raw.Daily.Temperature2mMin[i],
			High:      raw.Daily.Temperature2mMax[i],
		})
	}

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
		Forecast:    forecast,
	}, nil
}

type openMeteoHourlyResponse struct {
	Hourly struct {
		Time          []string  `json:"time"`
		Temperature2m []float64 `json:"temperature_2m"`
		DewPoint2m    []float64 `json:"dew_point_2m"`
		WindSpeed10m  []float64 `json:"wind_speed_10m"`
		Precipitation []float64 `json:"precipitation"`
	} `json:"hourly"`
}

type HourlyPoint struct {
	Time          string  `json:"time"`
	Temperature   float64 `json:"temperature"`
	DewPoint      float64 `json:"dewPoint"`
	WindSpeed     float64 `json:"windSpeed"`
	Precipitation float64 `json:"precipitation"`
}

func fetchHourlyForStation(station *Station) ([]HourlyPoint, error) {
	url := fmt.Sprintf(
		"https://api.open-meteo.com/v1/forecast?latitude=%f&longitude=%f&hourly=temperature_2m,dew_point_2m,wind_speed_10m,precipitation&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto&past_days=1&forecast_days=1",
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

	var raw openMeteoHourlyResponse
	if err := json.NewDecoder(resp.Body).Decode(&raw); err != nil {
		return nil, err
	}

	points := make([]HourlyPoint, len(raw.Hourly.Time))
	for i, t := range raw.Hourly.Time {
		points[i] = HourlyPoint{
			Time:          t,
			Temperature:   raw.Hourly.Temperature2m[i],
			DewPoint:      raw.Hourly.DewPoint2m[i],
			WindSpeed:     raw.Hourly.WindSpeed10m[i],
			Precipitation: raw.Hourly.Precipitation[i],
		}
	}

	return points, nil
}