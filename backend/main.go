package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()

	router.GET("/api/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "pong"})
	})

	router.GET("/api/stations", func(c *gin.Context) {
		c.JSON(http.StatusOK, stations)
	})

	router.GET("/api/stations/:id/weather", func(c *gin.Context) {
		id := c.Param("id")
		station := findStation(id)
		if station == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "station not found"})
			return
		}

		weather, err := fetchWeatherForStation(station)
		if err != nil {
			c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, weather)
	})

	router.Run(":8080")
}