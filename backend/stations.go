package main
type Station struct{
	ID			string `json:"id"`
	Name		string `json:"name"`
	County		string	`json:"county"`
	Latitude	float64 `json:"latitude"`
	Longitude	float64`json:"longitude"`
}

var stations = []Station{
	{ID: "pullman", Name: "Pullman", County: "Whitman", Latitude: 46.7319, Longitude: -117.1542},
	{ID: "prosser", Name: "Prosser", County: "Benton", Latitude: 46.2499, Longitude: -119.7481},
	{ID: "wenatchee", Name: "Wenatchee", County: "Chelan", Latitude: 47.4235, Longitude: -120.3103},
	{ID: "mtvernon", Name: "Mount Vernon", County: "Skagit", Latitude: 48.4212, Longitude: -122.3341},
	{ID: "wallawalla", Name: "Walla Walla", County: "Walla Walla", Latitude: 46.0646, Longitude: -118.3430},
}

func findStation(id string)*Station {
	for _, s := range stations{
		if s.ID == id{
			return &s
		}
	}
	return nil
}