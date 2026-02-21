package database

import (
	"fmt"
	"log"
	"os"

	"github.com/parsaabbasian/unispot/backend/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	// Use DB_URL if provided (common on platforms like Render/Supabase)
	dsn := os.Getenv("DATABASE_URL")

	if dsn == "" {
		// Supabase Session Pooler (IPv4 compatible)
		dsn = "postgresql://postgres.krkhwckszzjjeycxapaq:APazrRPp6Re7r+Y@aws-0-us-west-2.pooler.supabase.com:5432/postgres"
	}

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Ensure PostGIS is enabled
	DB.Exec("CREATE EXTENSION IF NOT EXISTS postgis;")

	// Automatically create tables
	err = DB.AutoMigrate(&models.Event{}, &models.RSVP{})
	if err != nil {
		log.Printf("Migration warning: %v", err)
	}

	// Seed if empty
	var count int64
	DB.Model(&models.Event{}).Count(&count)
	if count == 0 {
		fmt.Println("Seeding initial York U data...")
		seedSQL := `
			INSERT INTO events (title, description, category, location, start_time, end_time) 
			VALUES 
			('York U Hackathon', 'Main Student Centre', 'Tech', ST_GeogFromText('POINT(-79.5019 43.7735)'), NOW(), NOW() + INTERVAL '5 hours'),
			('Coffee Chat @ Vari Hall', 'Free coffee for students', 'Food', ST_GeogFromText('POINT(-79.5035 43.7740)'), NOW(), NOW() + INTERVAL '3 hours'),
			('Library Jazz Session', 'Scott Library 2nd floor', 'Music', ST_GeogFromText('POINT(-79.5025 43.7725)'), NOW(), NOW() + INTERVAL '4 hours');
		`
		DB.Exec(seedSQL)
	}

	fmt.Println("Successfully connected to Supabase & Automated Migrations")
}
