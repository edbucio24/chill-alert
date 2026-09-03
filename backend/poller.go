package main

import (
	"log"
	"time"
)

const pollInterval = 5 * time.Minute

func startPoller() {
	go func() {
		pollAllStations()

		ticker := time.NewTicker(pollInterval)
		defer ticker.Stop()

		for range ticker.C {
			pollAllStations()
		}
	}()
}

func pollAllStations() {
	for _, station := range stations {
		s := station
		weather, err := fetchWeatherForStation(&s)
		if err != nil {
			log.Printf("poller: failed to fetch weather for %s: %v", s.ID, err)
			continue
		}

		if err := insertReading(weather); err != nil {
			log.Printf("poller: failed to insert reading for %s: %v", s.ID, err)
			continue
		}

		log.Printf("poller: logged reading for %s (%.1f°F, %s)", s.ID, weather.CurrentTemp, weather.RiskLevel)
	}
}