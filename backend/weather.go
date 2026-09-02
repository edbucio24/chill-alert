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

