package handlers

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/lib/pq"
	"github.com/parsaabbasian/unispot/backend/internal/database"
	"github.com/parsaabbasian/unispot/backend/internal/models"
)

func GetEvents(c *gin.Context) {
	lat := c.Query("lat")
	lng := c.Query("lng")
	radius := c.Query("radius") // in meters

	if lat == "" || lng == "" || radius == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "lat, lng, and radius are required"})
		return
	}

	var rawEvents []struct {
		models.Event
		Loc       string         `gorm:"column:location_text"`
		Verifiers pq.StringArray `gorm:"column:verifier_names"`
	}

	// Geospatial query using ST_DWithin and time filtering
	// We use ST_AsText to get the location in a readable format for manual parsing if necessary
	query := `
		SELECT 
			e.id, e.title, e.description, e.category, ST_AsText(e.location) as location_text, 
			e.start_time, e.end_time, e.verified_count, e.creator_name,
			COALESCE(array_agg(v.user_name) FILTER (WHERE v.user_name IS NOT NULL), '{}') as verifier_names
		FROM events e
		LEFT JOIN verifications v ON e.id = v.event_id
		WHERE ST_DWithin(e.location, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography, ?)
		  AND e.start_time <= now()
		  AND e.end_time >= now()
		GROUP BY e.id, location_text
	`

	if err := database.DB.Raw(query, lng, lat, radius).Scan(&rawEvents).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	events := make([]models.Event, len(rawEvents))
	for i, re := range rawEvents {
		events[i] = re.Event
		events[i].Location = re.Loc
		events[i].Verifiers = []string(re.Verifiers)

		// Parse POINT(lng lat)
		loc := strings.TrimPrefix(re.Loc, "POINT(")
		loc = strings.TrimSuffix(loc, ")")
		parts := strings.Split(loc, " ")
		if len(parts) == 2 {
			fmt.Sscanf(parts[0], "%f", &events[i].Longitude)
			fmt.Sscanf(parts[1], "%f", &events[i].Latitude)
		}
	}

	c.JSON(http.StatusOK, events)
}
