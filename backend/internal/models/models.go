package models

import (
	"time"
)

type Event struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	Title         string    `gorm:"not null" json:"title"`
	Description   string    `json:"description"`
	Category      string    `gorm:"not null" json:"category"`
	Location      string    `gorm:"type:geography(POINT);not null" json:"location"` // ST_AsText format
	StartTime     time.Time `gorm:"not null" json:"start_time"`
	EndTime       time.Time `gorm:"not null" json:"end_time"`
	VerifiedCount int       `gorm:"default:0" json:"verified_count"`
	Latitude      float64   `gorm:"-" json:"lat"`
	Longitude     float64   `gorm:"-" json:"lng"`
}

type RSVP struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null" json:"user_id"`
	EventID   uint      `gorm:"not null" json:"event_id"`
	CreatedAt time.Time `json:"created_at"`
}
