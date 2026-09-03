package main

import (
	"database/sql"
	"log"
	"strconv"

	_ "modernc.org/sqlite"
)

var db *sql.DB

func initDB() {
	var err error
	db, err = sql.Open("sqlite", "chillalert.db")
	if err != nil {
		log.Fatalf("failed to open database: %v", err)
	}

	schema := `
	CREATE TABLE IF NOT EXISTS readings (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		station_id TEXT NOT NULL,
		recorded_at DATETIME NOT NULL,
		temp_f REAL NOT NULL,
		condition TEXT NOT NULL,
		precip REAL NOT NULL,
		wind REAL NOT NULL,
		risk_level TEXT NOT NULL
	);
	CREATE INDEX IF NOT EXISTS idx_readings_station_time
		ON readings(station_id, recorded_at);
	`

	if _, err := db.Exec(schema); err != nil {
		log.Fatalf("failed to create schema: %v", err)
	}

	log.Println("Database initialized: chillalert.db")
}

func insertReading(w *WeatherResponse) error {
	_, err := db.Exec(
		`INSERT INTO readings (station_id, recorded_at, temp_f, condition, precip, wind, risk_level)
		 VALUES (?, datetime('now'), ?, ?, ?, ?, ?)`,
		w.StationID, w.CurrentTemp, w.Condition, w.Precip, w.Wind, w.RiskLevel,
	)
	return err
}

type Reading struct {
	RecordedAt string  `json:"recordedAt"`
	TempF      float64 `json:"tempF"`
	Condition  string  `json:"condition"`
	Precip     float64 `json:"precip"`
	Wind       float64 `json:"wind"`
	RiskLevel  string  `json:"riskLevel"`
}

func getReadingHistory(stationID string, hours int) ([]Reading, error) {
	rows, err := db.Query(
		`SELECT recorded_at, temp_f, condition, precip, wind, risk_level
		 FROM readings
		 WHERE station_id = ?
		 AND recorded_at >= datetime('now', ?)
		 ORDER BY recorded_at ASC`,
		stationID, "-"+strconv.Itoa(hours)+" hours",
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var readings []Reading
	for rows.Next() {
		var r Reading
		if err := rows.Scan(&r.RecordedAt, &r.TempF, &r.Condition, &r.Precip, &r.Wind, &r.RiskLevel); err != nil {
			return nil, err
		}
		readings = append(readings, r)
	}
	return readings, nil
}