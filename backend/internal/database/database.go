package database

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/parsaabbasian/unispot/backend/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	// Load .env file if it exists (local development)
	_ = godotenv.Load()

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

	// Set session timezone to Toronto
	DB.Exec("SET TIME ZONE 'America/Toronto';")

	// Automatically create tables
	err = DB.AutoMigrate(&models.Event{}, &models.RSVP{}, &models.Verification{})
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

	// Setup real-time update trigger — fires on ANY column change
	DB.Exec(`
		CREATE OR REPLACE FUNCTION notify_event_update() RETURNS trigger AS $$
		BEGIN
			PERFORM pg_notify('event_updated', row_to_json(NEW)::text);
			RETURN NEW;
		END;
		$$ LANGUAGE plpgsql;

		DROP TRIGGER IF EXISTS trg_event_update ON events;
		CREATE TRIGGER trg_event_update
		AFTER UPDATE ON events
		FOR EACH ROW EXECUTE FUNCTION notify_event_update();
	`)

	// Seed if empty
	var count int64
	DB.Model(&models.Event{}).Count(&count)
	if count <= 3 { // If only initial seed or empty, add the premium campus set
		fmt.Println("Seeding Premium York U campus data...")
		seedSQL := `
			INSERT INTO events (title, description, category, location, start_time, end_time, is_approved) 
			VALUES 
			('York U Hackathon', 'Main Student Centre - Hub', 'Tech', ST_GeogFromText('POINT(-79.5019 43.7735)'), now(), now() + INTERVAL '5 hours', true),
			('Free Pizza @ Lassonde', 'Bergeron Centre Lobby - First come first serve!', 'Food', ST_GeogFromText('POINT(-79.5048 43.7766)'), now(), now() + INTERVAL '2 hours', true),
			('Finals Prep: Discrete Math', 'Scott Library 2nd Floor - Bring coffee.', 'Study', ST_GeogFromText('POINT(-79.5025 43.7725)'), now(), now() + INTERVAL '4 hours', true),
			('Intramural Soccer', 'Alumni Field - Need 2 more players!', 'Sports', ST_GeogFromText('POINT(-79.5075 43.7755)'), now(), now() + INTERVAL '3 hours', true),
			('Winter Coat Sale', 'Central Square - Up to 70%% off!', 'Sale', ST_GeogFromText('POINT(-79.5030 43.7738)'), now(), now() + INTERVAL '6 hours', true),
			('Tait McKenzie Gym Blast', 'Full body workout - Open to all levels.', 'Sports', ST_GeogFromText('POINT(-79.5065 43.7715)'), now(), now() + INTERVAL '1 hour', true),
			('Evening Safety Patrol', 'Walking from Vari Hall to Quad.', 'Safety', ST_GeogFromText('POINT(-79.5035 43.7742)'), now(), now() + INTERVAL '2 hours', true),
			('Used Textbook Swap', 'Student Centre - Mostly CS/Eng books.', 'Sale', ST_GeogFromText('POINT(-79.5015 43.7732)'), now(), now() + INTERVAL '8 hours', true);
		`
		DB.Exec(seedSQL)
	}

	fmt.Println("Successfully connected to Supabase & Automated Migrations")
}
