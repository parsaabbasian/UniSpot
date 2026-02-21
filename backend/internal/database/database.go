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
		log.Fatal("DATABASE_URL environment variable is not set")
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

	// Setup real-time deletion trigger
	DB.Exec(`
		CREATE OR REPLACE FUNCTION notify_event_delete() RETURNS trigger AS $$
		BEGIN
			PERFORM pg_notify('event_deleted', OLD.id::text);
			RETURN OLD;
		END;
		$$ LANGUAGE plpgsql;
		
		DROP TRIGGER IF EXISTS trg_event_delete ON events;
		CREATE TRIGGER trg_event_delete
		AFTER DELETE ON events
		FOR EACH ROW EXECUTE FUNCTION notify_event_delete();
	`)

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
