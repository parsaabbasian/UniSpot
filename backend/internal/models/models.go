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
	IsApproved    bool      `gorm:"default:false" json:"is_approved"` // Admin approval via Supabase
	CreatorName   string    `json:"creator_name"`
	CreatorEmail  string    `json:"creator_email"`
	Verifiers     []string  `gorm:"-" json:"verifiers"`
	Latitude      float64   `gorm:"-" json:"lat"`
	Longitude     float64   `gorm:"-" json:"lng"`
}

type RSVP struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null" json:"user_id"`
	EventID   uint      `gorm:"not null" json:"event_id"`
	CreatedAt time.Time `json:"created_at"`
}

type Verification struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	EventID   uint      `gorm:"not null;index:idx_event_ip,unique" json:"event_id"`
	IPAddress string    `gorm:"not null;index:idx_event_ip,unique" json:"ip_address"`
	UserName  string    `json:"user_name"`
	UserEmail string    `json:"user_email"`
	CreatedAt time.Time `json:"created_at"`
}
