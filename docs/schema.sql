CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- Tech, Music, Food, etc.
    location GEOGRAPHY(POINT) NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL
);

CREATE TABLE rsvps (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT REFERENCES events(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for geospatial queries
CREATE INDEX idx_events_location ON events USING GIST(location);
