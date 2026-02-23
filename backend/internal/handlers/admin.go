package handlers

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/lib/pq"
	"github.com/parsaabbasian/unispot/backend/internal/database"
	"github.com/parsaabbasian/unispot/backend/internal/models"
)

func AdminGetEvents(c *gin.Context) {
	var rawEvents []struct {
		ID            uint           `json:"id"`
		Title         string         `json:"title"`
		Description   string         `json:"description"`
		Category      string         `json:"category"`
		StartTime     time.Time      `json:"start_time"`
		EndTime       time.Time      `json:"end_time"`
		VerifiedCount int            `json:"verified_count"`
		IsApproved    bool           `json:"is_approved"`
		CreatorName   string         `json:"creator_name"`
		CreatorEmail  string         `json:"creator_email"`
		CreatedAt     time.Time      `json:"created_at"`
		Loc           string         `gorm:"column:location_text"`
		Verifiers     pq.StringArray `gorm:"column:verifier_names"`
	}

	query := `
		SELECT 
			e.id, e.title, e.description, e.category, e.start_time, e.end_time, 
			e.verified_count, e.creator_name, e.creator_email, e.is_approved, e.created_at,
			ST_AsText(e.location) as location_text, 
			COALESCE(array_agg(v.user_name) FILTER (WHERE v.user_name IS NOT NULL), '{}') as verifier_names
		FROM events e
		LEFT JOIN verifications v ON e.id = v.event_id
		GROUP BY e.id, location_text
		ORDER BY e.id DESC
	`

	if err := database.DB.Raw(query).Scan(&rawEvents).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	events := make([]models.Event, len(rawEvents))
	for i, re := range rawEvents {
		events[i] = models.Event{
			ID:            re.ID,
			Title:         re.Title,
			Description:   re.Description,
			Category:      re.Category,
			StartTime:     re.StartTime,
			EndTime:       re.EndTime,
			VerifiedCount: re.VerifiedCount,
			IsApproved:    re.IsApproved,
			CreatorName:   re.CreatorName,
			CreatorEmail:  re.CreatorEmail,
			CreatedAt:     re.CreatedAt,
			Verifiers:     []string(re.Verifiers),
		}

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

func AdminToggleApproval(c *gin.Context) {
	id := c.Param("id")
	var event models.Event
	if err := database.DB.First(&event, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	event.IsApproved = !event.IsApproved
	if err := database.DB.Save(&event).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, event)
}

func AdminDeleteEvent(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Delete(&models.Event{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Event deleted successfully"})
}
