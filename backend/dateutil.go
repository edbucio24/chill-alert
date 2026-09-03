package main

import "time"

func parseISODate(s string) (time.Time, error) {
	return time.Parse("2006-01-02", s)
}